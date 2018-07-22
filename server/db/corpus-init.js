module.exports = `

CREATE TABLE corpus (
  sentence
);
CREATE TABLE meta (
  gui,
  labeler,
  current_index INTEGER,
  owner,
  github_url,
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
