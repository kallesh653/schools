const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.exec(
    'cd /opt/school-management/backend && /usr/bin/mvn clean package -DskipTests -q 2>&1 | tail -5 && echo "BUILD_OK"',
    (err, stream) => {
      if (err) { console.error('Exec error:', err); conn.end(); return; }
      let output = '';
      stream.on('data', d => { process.stdout.write(d); output += d; });
      stream.stderr.on('data', d => { process.stderr.write(d); });
      stream.on('close', () => {
        if (output.includes('BUILD_OK') || output.includes('BUILD SUCCESS')) {
          console.log('\nBuild succeeded! Restarting backend...');
          conn.exec(
            'pkill -f "school-management-system" 2>/dev/null; sleep 2; nohup java -jar /opt/school-management/backend/target/school-management-system-1.0.0.jar > /var/log/school-backend.log 2>&1 & sleep 3 && echo "STARTED"',
            (err2, stream2) => {
              if (err2) { console.error(err2); conn.end(); return; }
              stream2.on('data', d => process.stdout.write(d));
              stream2.stderr.on('data', d => process.stderr.write(d));
              stream2.on('close', () => { console.log('\nBackend restarted!'); conn.end(); });
            }
          );
        } else {
          console.log('\nBuild may have failed. Check output above.');
          conn.end();
        }
      });
    }
  );
}).connect({ host: '194.164.149.8', port: 22, username: 'root', password: 'Kallesh717653@' });
