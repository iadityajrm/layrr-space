ALTER TABLE projects
ADD COLUMN template_category VARCHAR(255);

UPDATE projects p
SET template_category = (
  SELECT category
  FROM templates t
  WHERE t.id = p.template_id
);
