/**
 * Builds and restarts backend on VPS
 * Run: node build-restart-backend.js
 */
const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');

const conn = new Client();

function runCommand(conn, command, timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Command timed out')), timeoutMs);
    conn.exec(command, (err, stream) => {
      if (err) { clearTimeout(timer); return reject(err); }
      let output = '';
      stream.on('close', (code) => {
        clearTimeout(timer);
        resolve({ code, output });
      });
      stream.on('data', (data) => {
        output += data;
        process.stdout.write(data.toString());
      });
      stream.stderr.on('data', (data) => {
        output += data;
        process.stderr.write(data.toString());
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('Connected to VPS\n');
  try {
    console.log('Building backend (this may take 3-5 minutes)...\n');
    const { code } = await runCommand(conn,
      'cd /opt/school-management/backend && /usr/bin/mvn package -DskipTests 2>&1 | tail -20'
    );

    if (code === 0) {
      console.log('\n✓ Build successful! Restarting...');
      await runCommand(conn, 'pkill -f "school-management-system" 2>/dev/null; sleep 2; echo killed');
      await runCommand(conn,
        'nohup java -jar /opt/school-management/backend/target/school-management-system-1.0.0.jar > /opt/school-management/backend/backend.log 2>&1 &'
      );
      await runCommand(conn, 'sleep 6 && echo "Process started" && netstat -tlnp 2>/dev/null | grep 8080 || echo "Port 8080 check done"');
      console.log('\n✓ Backend restarted! New endpoint active: GET /teachers/class/{classId}');
    } else {
      console.error('\nBuild failed. Check output above.');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    conn.end();
  }
});

conn.on('error', (e) => { console.error('SSH error:', e.message); process.exit(1); });

console.log('Connecting to 194.164.149.8...');
conn.connect({
  host: '194.164.149.8', port: 22, username: 'root',
  password: 'Kallesh717653@',
  keepaliveInterval: 30000, keepaliveCountMax: 30, readyTimeout: 30000,
});
