const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmds = [
    'cat /etc/nginx/sites-enabled/*',
    'cat /etc/nginx/nginx.conf | head -30',
    'nginx -t 2>&1',
    'curl -s -o /dev/null -w "%{http_code}" http://194.164.149.8/api/auth/login -X POST -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\' 2>&1',
  ];

  let idx = 0;
  function next() {
    if (idx >= cmds.length) { conn.end(); return; }
    const cmd = cmds[idx++];
    console.log('\n=== ' + cmd.substring(0, 60) + ' ===');
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
