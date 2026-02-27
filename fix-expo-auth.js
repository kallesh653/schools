const fs = require('fs');
const os = require('os');
const path = require('path');

const statePath = path.join(os.homedir(), '.expo', 'state.json');
console.log('Reading:', statePath);

const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

// EAS CLI reads state.json under "auth" key (not "currentUser")
state.auth = {
  sessionSecret: '{"id":"3b3f329c-f7c0-4e76-b674-967cce32c375","version":2}',
  id: '3f2bef53-e185-4345-8050-c0cd87a287f5',
  username: 'kallesh_1'
};

// Remove old format if present
delete state.currentUser;

fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log('Done! Auth written to', statePath);
console.log('Auth:', JSON.stringify(state.auth, null, 2));
