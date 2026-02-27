const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS\n');

  // Run all diagnostic and fix commands
  const commands = [
    ['Finding school management JAR files...', 'find /opt /root /home -name "school-management*.jar" 2>/dev/null | grep -v original | head -5'],
    ['Checking /opt/school-management/backend...', 'ls /opt/school-management/backend/target/ 2>/dev/null || echo "No target dir"'],
    ['Checking nginx config...', 'cat /etc/nginx/sites-enabled/* 2>/dev/null | grep -A5 "location /api" | head -20'],
  ];

  let idx = 0;
  function next() {
    if (idx >= commands.length) { conn.end(); return; }
    const [label, cmd] = commands[idx++];
    console.log('\n' + label);
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error(err); next(); return; }
      stream.on('close', next);
      stream.on('data', d => process.stdout.write(d.toString()));
      stream.stderr.on('data', d => process.stderr.write(d.toString()));
    });
  }
  next();
});

conn.on('error', e => { console.error('Error:', e.message); process.exit(1); });
conn.connect({ host:'194.164.149.8', port:22, username:'root', password:'Kallesh717653@', keepaliveInterval:10000, readyTimeout:30000 });
