const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected');
  conn.exec(
    'find /opt /root /home -name "pom.xml" 2>/dev/null | head -5; echo "---"; ls /opt/school-management/backend/ 2>/dev/null || echo "not found"; echo "---"; netstat -tlnp | grep 8080',
    (err, stream) => {
      if (err) { console.error(err); conn.end(); return; }
      stream.on('data', d => process.stdout.write(d));
      stream.stderr.on('data', d => process.stderr.write(d));
      stream.on('close', () => conn.end());
    }
  );
}).connect({ host: '194.164.149.8', port: 22, username: 'root', password: 'Kallesh717653@' });
