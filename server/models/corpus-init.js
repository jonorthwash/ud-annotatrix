module.exports = `

CREATE TABLE corpus (
  column_visibilities,
  format,
  is_table_view,
  nx_initialized,
  nx
);
CREATE TABLE meta (
  current_index,
  owner,
  github_url,
  gui,
  labeler,
  permissions,
  editors
);
INSERT INTO meta (current_index, permissions, editors) VALUES (
  -1,
  '{
    "allow": null,
    "disallow": [],
    "require_login": false
  }',
  '[]'
);

`;
