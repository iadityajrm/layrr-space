/* Secure image upload server for verification photos */
const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const sharp = require('sharp');
const morgan = require('morgan');
const { v2: cloudinary } = require('cloudinary');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
// Load .env.local first if present, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = process.env.PORT || 4000;

// Validate required env vars
const requiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing required env: ${key}`);
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app = express();
app.use(morgan('tiny'));
// Enable JSON body parsing for non-multipart routes
app.use(express.json());

// Basic rate limit: 5 uploads/min per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// Multer setup in memory
const storage = multer.memoryStorage();
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB hard cap
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Allowed: JPG, JPEG, PNG'));
    }
    cb(null, true);
  },
});

// Auth middleware using Supabase JWT
async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization token' });

  const supabaseAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = data.user;
  req.supabaseUserToken = token;
  next();
}

app.post('/api/upload-verification', uploadLimiter, authenticate, upload.single('image'), async (req, res) => {
  try {
    // Ensure server is properly configured
    const missingEnv = requiredEnv.filter(k => !process.env[k]);
    if (missingEnv.length) {
      return res.status(500).json({
        error: 'Server not configured: missing environment variables',
        missing: missingEnv,
      });
    }

    const projectId = req.body.projectId;
    if (!projectId) return res.status(400).json({ error: 'Missing projectId' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const buffer = req.file.buffer;
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) {
      return res.status(400).json({ error: 'Unable to read image dimensions' });
    }

    // Downscale to max width 1600 while maintaining aspect ratio
    const needsResize = meta.width > 1600;
    let pipeline = sharp(buffer).rotate();
    if (needsResize) {
      pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
    }

    // Progressive quality reduction from 80 to 40 to target ~500KB
    let quality = 80;
    let encoded = await pipeline.jpeg({ quality, progressive: true, force: true }).toBuffer();
    while (encoded.length > 500 * 1024 && quality > 45) {
      quality -= 5;
      encoded = await pipeline.jpeg({ quality, progressive: true, force: true }).toBuffer();
    }
    if (encoded.length > 500 * 1024) {
      return res.status(400).json({ error: 'Unable to compress image below 500KB without excessive quality loss' });
    }

    // Prepare Cloudinary upload
    const publicId = `${projectId}-${Date.now()}`;
    const folder = `verification-images/${projectId}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(encoded);
    });

    const secureUrl = uploadResult.secure_url;
    const width = uploadResult.width;
    const height = uploadResult.height;
    const bytes = uploadResult.bytes;

    // Use Supabase with the user's token for RLS compliance
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${req.supabaseUserToken}` } },
    });

    // NOTE: Per current workflow, we store the uploaded image URL in `submissions` only.
    // We skip updating `projects.proof_photo_url` to avoid duplication.

    const { error: auditError } = await supabase
      .from('verification_audits')
      .insert({
        project_id: projectId,
        image_url: secureUrl,
        uploaded_by: req.user.id,
        created_at: new Date().toISOString(),
      });
    if (auditError) {
      console.warn('Supabase audit insert failed:', auditError);
    }

    // Fetch project context to populate submissions entry
    const { data: projectRow, error: projectErr } = await supabase
      .from('projects')
      .select('id, user_id, template_id, project_name, status, price, commission_rate')
      .eq('id', projectId)
      .maybeSingle();
    if (projectErr) {
      console.error('Supabase project fetch failed:', projectErr);
      return res.status(500).json({ error: 'Failed to fetch project for submission', details: projectErr.message });
    }
    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found or not accessible' });
    }

    // Insert into submissions table with pending status and timestamp
    const { error: submissionErr } = await supabase
      .from('submissions')
      .insert({
        user_id: projectRow.user_id,
        template_id: projectRow.template_id,
        project_id: projectRow.id,
        project_name: projectRow.project_name,
        image_url: secureUrl,
        price: projectRow.price,
        commission_rate: projectRow.commission_rate,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });
    if (submissionErr) {
      console.error('Supabase submission insert failed:', submissionErr);
      return res.status(500).json({ error: 'Failed to record submission', details: submissionErr.message });
    }

    return res.status(200).json({
      url: secureUrl,
      width,
      height,
      bytes,
      quality,
      public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error('Upload error:', err);
    const message = typeof err === 'object' && err?.message ? err.message : String(err);
    return res.status(500).json({ error: 'Server error during upload', details: message });
  }
});

// Review submission: approve or reject
app.post('/api/review-submission', authenticate, async (req, res) => {
  try {
    const { submissionId, status } = req.body || {};
    if (!submissionId) return res.status(400).json({ error: 'Missing submissionId' });
    const allowed = ['approved', 'rejected'];
    if (!allowed.includes(String(status).toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status. Use approved or rejected.' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${req.supabaseUserToken}` } },
    });

    // Ensure submission exists and is visible to reviewer (RLS policies should govern visibility)
    const { data: submissionRow, error: fetchErr } = await supabase
      .from('submissions')
      .select('id, project_name')
      .eq('id', submissionId)
      .maybeSingle();
    if (fetchErr) {
      return res.status(500).json({ error: 'Failed to fetch submission', details: fetchErr.message });
    }
    if (!submissionRow) {
      return res.status(404).json({ error: 'Submission not found or not accessible' });
    }

    const nowIso = new Date().toISOString();
    const { error: updateSubmissionErr } = await supabase
      .from('submissions')
      .update({ status: status.toLowerCase(), reviewed_by: req.user.id, reviewed_at: nowIso })
      .eq('id', submissionId);
    if (updateSubmissionErr) {
      return res.status(500).json({ error: 'Failed to update submission review', details: updateSubmissionErr.message });
    }

    // Optionally, reflect status on project. If approved => set status 'approved'; if rejected => 'rejected'
    // This assumes a separate relation or a way to determine the project ID from the submission.
    // If the submissions table includes project_id, this should update that specific project.
    // As project_id is not specified here, we skip project update unless schema provides it.

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Review submission error:', err);
    const message = typeof err === 'object' && err?.message ? err.message : String(err);
    return res.status(500).json({ error: 'Server error during review', details: message });
  }
});

app.listen(PORT, () => {
  console.log(`Secure upload server running at http://localhost:${PORT}`);
});