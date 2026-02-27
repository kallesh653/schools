const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS\n');

  const cmds = [
    // Stop any existing school-backend PM2 entry
    'pm2 delete school-backend 2>/dev/null || true',
    // Start the backend JAR with PM2
    'pm2 start "java -jar /opt/school-management/backend/target/school-management-system-1.0.0.jar" --name school-backend --no-autorestart',
    // Wait for it to start
    'sleep 15',
    // Check status
    'pm2 list',
    // Save PM2 config so it restarts on reboot
    'pm2 save',
    // Test the API
    'curl -s -o /dev/null -w "API HTTP Status: %{http_code}\\n" http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\' 2>&1',
    // Check logs for errors
    'pm2 logs school-backend --lines 20 --nostream 2>&1 | tail -25',
  ];

  let idx = 0;
  function next() {
    if (idx >= cmds.length) { conn.end(); return; }
    const cmd = cmds[idx++];
    console.log('\n> ' + cmd.substring(0, 60) + (cmd.length > 60 ? '...' : ''));
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error(err.message); next(); return; }
      stream.on('close', next);
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
    });
  }
  next();
});

conn.on('error', e => { console.error('Error:', e.message); process.exit(1); });
conn.connect({ host:'194.164.149.8', port:22, username:'root', password:'Kallesh717653@', keepaliveInterval:15000, readyTimeout:30000 });
