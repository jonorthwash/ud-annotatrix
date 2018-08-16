module.exports = `

CREATE TABLE corpus (
  column_visibilities,
  format,
  is_table_view,
  input,
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
INSERT INTO meta (current_index, gui, labeler, permissions, editors) VALUES (
  -1,
  '{
    "menu": {
      "is_visible": true,
      "pinned": {
        "login": false,
        "manage-permissions": false,
        "collab": true,
				"save-corpus": false,
				"upload-file": false,
				"download-corpus": false,
				"discard-corpus": false,
				"export-as-latex": false,
				"export-as-png": false,
				"export-as-svg": false,
				"show-help": true,
				"show-settings": false,
				"show-table": false
      }
    },
    "is_textarea_visible": true,
		"are_labels_visible": true,
		"is_vertical": false,
		"is_ltr": true,
		"is_enhanced": false,
		"readonly": false,
		"pan": {
      "x": 0,
      "y": 0
    },
    "zoom": 1
  }',
  '{
    "labels": [],
    "filter": []
  }',
  '{
    "sharing": true,
    "allow": null,
    "disallow": [],
    "require_login": false
  }',
  '[]'
);

`;
