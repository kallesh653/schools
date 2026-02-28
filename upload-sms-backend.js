const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const fs = require('fs');

const conn = new Client();
const VPS_BASE = '/opt/school-management/backend/src/main/java/com/school';

const filesToUpload = [
  {
    local: 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\java\\com\\school\\entity\\SmsLog.java',
    remote: `${VPS_BASE}/entity/SmsLog.java`
  },
  {
    local: 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\java\\com\\school\\repository\\SmsLogRepository.java',
    remote: `${VPS_BASE}/repository/SmsLogRepository.java`
  },
  {
    local: 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\java\\com\\school\\service\\SmsService.java',
    remote: `${VPS_BASE}/service/SmsService.java`
  },
  {
    local: 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\java\\com\\school\\controller\\SmsController.java',
    remote: `${VPS_BASE}/controller/SmsController.java`
  },
  {
    local: 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\java\\com\\school\\controller\\FeeController.java',
    remote: `${VPS_BASE}/controller/FeeController.java`
  },
  {
    local: 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0\\backend\\src\\main\\resources\\application.properties',
    remote: '/opt/school-management/backend/src/main/resources/application.properties'
  }
];

function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function runCommand(conn, cmd, timeout = 300000) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      const t = setTimeout(() => reject(new Error('Command timeout')), timeout);
      stream.on('close', (code) => { clearTimeout(t); resolve({ code, out }); });
      stream.on('data', (d) => { process.stdout.write(d.toString()); out += d.toString(); });
      stream.stderr.on('data', (d) => { process.stderr.write(d.toString()); out += d.toString(); });
    });
  });
}

conn.on('ready', async () => {
  console.log('Connected to VPS\n');

  try {
    // Step 1: Upload source files
    console.log('Step 1: Uploading SMS backend files...');
    await new Promise((resolve, reject) => {
      conn.sftp(async (err, sftp) => {
        if (err) return reject(err);
        for (const f of filesToUpload) {
          const fname = f.local.split('\\').pop();
          console.log(`  Uploading ${fname}...`);
          await uploadFile(sftp, f.local, f.remote);
          console.log(`    OK`);
        }
        console.log('  All files uploaded.\n');
        resolve();
      });
    });

    // Step 2: Maven build
    console.log('Step 2: Building with Maven (takes 2-3 minutes)...');
    const buildResult = await runCommand(
      conn,
      'cd /opt/school-management/backend && /usr/bin/mvn clean package -DskipTests 2>&1 | tail -30 && echo "BUILD_DONE"',
      360000
    );

    if (!buildResult.out.includes('BUILD SUCCESS')) {
      console.error('\nBuild may have failed - check output above');
    } else {
      console.log('\nBuild SUCCESS!');
    }

    // Step 3: Restart backend
    console.log('\nStep 3: Restarting backend...');
    await runCommand(
      conn,
      'pkill -f "school-management-system" 2>/dev/null || true; sleep 3; nohup java -jar /opt/school-management/backend/target/school-management-system-1.0.0.jar > /var/log/school-backend.log 2>&1 & sleep 6 && echo "BACKEND_STARTED"',
      40000
    );

    console.log('\nVerifying backend is running...');
    await runCommand(conn, 'sleep 3 && netstat -tlnp | grep 8080 && echo "PORT_OK"', 20000);

    console.log('\nSMS Backend deployed successfully!');
    console.log('  API: https://schoolm.aksoftware.tech/api/sms/status');
    conn.end();

  } catch (e) {
    console.error('Error:', e.message);
    conn.end();
  }
});

conn.on('error', (e) => console.error('SSH Error:', e.message));
conn.on('close', () => console.log('\nDone!'));

console.log('Connecting to VPS...');
conn.connect({
  host: '194.164.149.8',
  port: 22,
  username: 'root',
  password: 'Kallesh717653@',
  keepaliveInterval: 15000,
  readyTimeout: 30000
});
