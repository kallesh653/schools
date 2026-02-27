const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmds = [
    'netstat -tlnp 2>/dev/null | grep 8080',
    'curl -s http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\'',
    'curl -s http://localhost:8080/api/notices 2>&1 | head -100',
  ];

  let idx = 0;
  function next() {
    if (idx >= cmds.length) { conn.end(); return; }
    const cmd = cmds[idx++];
    console.log('\n> ' + cmd.substring(0, 80));
    conn.exec(cmd, (err, stream) => {
      if (err) { next(); return; }
      stream.on('close', next);
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
    });
  }
  next();
});

conn.on('error', e => console.error(e.message));
conn.connect({ host:'194.164.149.8', port:22, username:'root', password:'Kallesh717653@', keepaliveInterval:15000, readyTimeout:30000 });
