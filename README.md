<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1miNZqBHJVYSc13_oxjgNyAyHF49uxPmB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Secure Image Upload Server (Cloudinary + Supabase)

- Configure environment by copying `.env.example` to `.env.local` and setting values:
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Start both frontend and server:
  - `npm run dev:full`
  - Frontend runs at `http://localhost:3000`, API server at `http://localhost:4000` (proxied at `/api`).

#### Endpoint
- `POST /api/upload-verification`
  - Auth: `Authorization: Bearer <Supabase JWT>`
  - Body: `multipart/form-data`
    - `image`: file (jpeg/png)
    - `projectId`: string
  - Validates type, size (≤ 5MB input, compressed to ≤ 500KB), and dimensions (max width 1600).
  - Uploads to Cloudinary folder `verification-images/<projectId>` with secure URL.
  - Updates Supabase: `projects.proof_photo_url` and inserts into `verification_audits`.
  - Response: `{ url, width, height, bytes, quality, public_id }`.

#### Security & Best Practices
- Secrets are only read from environment; never exposed client-side.
- Endpoint uses rate limiting (5 req/min/IP) and Supabase JWT auth.
- Robust error handling and logging via `morgan` and structured responses.

#### Testing Guidance
- Verify Cloudinary uploads manually with various image types/sizes.
- Confirm Supabase records are updated (projects and verification_audits).
- Validate error cases (invalid type/oversized image/missing auth/network errors).

#### Limitations
- Delivery URLs are public secure (`https`). For private/authenticated delivery, configure Cloudinary `access_mode` and signed URLs.
- Server is for local/dev. Deploy behind HTTPS with proper secrets management for production.

## Recent Updates

### Enhanced User Experience Features

#### 1. **Clickable Project Entries**
- **What's New**: Entire project cards in the Projects page are now clickable
- **How to Use**: Simply click anywhere on a project card to view its details
- **Accessibility**: Full keyboard navigation support (Tab to focus, Enter/Space to select)
- **Visual Feedback**: Hover effects and cursor changes provide clear interaction cues
- **Backward Compatibility**: "View Live" links are preserved and remain clickable

#### 2. **Dynamic Custom Fields**
- **What's New**: Project profile pages now display context-aware field labels based on template category
- **Landing Pages**: Fields are labeled as "Hero Title", "Hero Subtitle", "Call to Action Text", etc.
- **Feedback Forms**: Fields are labeled as "Feedback Form Title", "Welcome Message", "Question 1", etc.
- **Fallback Support**: Projects without field mappings display generic "Data 1-8" labels
- **Error Handling**: Clear warnings when template category information is missing

#### 3. **Improved Chatbot Integration**
- **What's New**: Fixed scroll space issues caused by the floating chatbot button
- **Scroll Behavior**: Main dashboard container now properly handles overflow
- **Positioning**: Chatbot maintains fixed position without affecting page layout
- **Performance**: Eliminated unnecessary scroll space while preserving full functionality

## Testing

Run the test suite to verify all functionality:

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage report
npm test:coverage
```

### Test Coverage Includes:
- **Dynamic Field Rendering**: Unit tests for template category field mapping
- **Clickable Project Entries**: Tests for click behavior, keyboard navigation, and accessibility
- **Responsive Behavior**: Cross-device compatibility testing
- **Chatbot Scroll Fix**: Verification of proper CSS classes and layout behavior

## Responsive Design

All features are fully responsive and tested across:
- **Mobile Devices**: 375px width (iPhone SE, iPhone 12)
- **Tablets**: 768px width (iPad)
- **Desktop**: 1920px width (Full HD)

Features maintain functionality and visual consistency across all screen sizes.
