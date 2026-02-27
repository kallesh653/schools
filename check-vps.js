const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const conn = new Client();

conn.on('ready', () => {
  console.log('Connected\n');
  conn.exec('pm2 list 2>&1 && echo "---LOGS---" && pm2 logs school-backend --lines 30 --nostream 2>&1 | tail -40', (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', () => conn.end());
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
  });
});

conn.on('error', e => { console.error('Error:', e.message); process.exit(1); });

conn.connect({
  host: '194.164.149.8',
  port: 22,
  username: 'root',
  password: 'Kallesh717653@',
  keepaliveInterval: 10000,
  readyTimeout: 30000
});
