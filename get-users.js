const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const password = process.argv[2];
const conn = new Client();

conn.on('ready', () => {
  console.log('Connected\n');
  const dbUser = 'school_admin';
  const dbPass = 'school_admin123';
  const dbName = 'school_db';
  const query = `mysql -u ${dbUser} -p${dbPass} ${dbName} -e "SELECT u.id, u.username, u.full_name, u.entity_type, u.active, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id ORDER BY r.name;" 2>/dev/null`;
  conn.exec(query, (err, stream) => {
    if (err) { console.error(err); return conn.end(); }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', () => conn.end());
  });
});
conn.on('error', e => { console.error('SSH error:', e.message); process.exit(1); });
conn.connect({ host: '194.164.149.8', port: 22, username: 'root', password: process.argv[2], readyTimeout: 30000 });
