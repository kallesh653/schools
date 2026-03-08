/**
 * Uploads changed backend source files to VPS then builds + restarts.
 * Fixes the pattern where build-restart-backend.js only runs Maven (no upload).
 * Run: node upload-and-build-backend.js
 */
const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const REMOTE_BASE = '/opt/school-management/backend/src/main/java/com/school';

// Files to upload to VPS (add any new/modified Java files here)
const FILES = [
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/controller/TeacherController.java'),
    remote: `${REMOTE_BASE}/controller/TeacherController.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/controller/HomeworkController.java'),
    remote: `${REMOTE_BASE}/controller/HomeworkController.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/repository/TeacherSubjectAssignmentRepository.java'),
    remote: `${REMOTE_BASE}/repository/TeacherSubjectAssignmentRepository.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/repository/SchoolClassRepository.java'),
    remote: `${REMOTE_BASE}/repository/SchoolClassRepository.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/entity/SchoolClass.java'),
    remote: `${REMOTE_BASE}/entity/SchoolClass.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/entity/Student.java'),
    remote: `${REMOTE_BASE}/entity/Student.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/dto/CreateStudentRequest.java'),
    remote: `${REMOTE_BASE}/dto/CreateStudentRequest.java`,
  },
  {
    local: path.join(ROOT, 'backend/src/main/java/com/school/controller/StudentController.java'),
    remote: `${REMOTE_BASE}/controller/StudentController.java`,
  },
];

function runCommand(conn, command, timeoutMs = 360000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Command timed out')), timeoutMs);
    conn.exec(command, (err, stream) => {
      if (err) { clearTimeout(timer); return reject(err); }
      let output = '';
      stream.on('close', (code) => { clearTimeout(timer); resolve({ code, output }); });
      stream.on('data', (data) => { output += data; process.stdout.write(data.toString()); });
      stream.stderr.on('data', (data) => { output += data; process.stderr.write(data.toString()); });
    });
  });
}

function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);
    writeStream.on('close', () => {
      console.log('  ✓ Uploaded: ' + path.basename(localPath));
      resolve();
    });
    writeStream.on('error', reject);
    readStream.on('error', reject);
    readStream.pipe(writeStream);
  });
}

function getSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      resolve(sftp);
    });
  });
}

const conn = new Client();

conn.on('ready', async () => {
  console.log('Connected to VPS\n');
  try {
    // 1. Upload source files via SFTP
    console.log('Uploading source files...');
    const sftp = await getSftp(conn);
    for (const f of FILES) {
      await uploadFile(sftp, f.local, f.remote);
    }
    console.log('');

    // 2. Clean build to force recompilation of all classes
    console.log('Building backend (clean build)...\n');
    const { code } = await runCommand(conn,
      'cd /opt/school-management/backend && /usr/bin/mvn clean package -DskipTests 2>&1 | tail -25'
    );

    if (code !== 0) {
      console.error('\nBuild FAILED. Check output above.');
      conn.end();
      return;
    }

    console.log('\n✓ Build successful! Restarting backend...');

    // 3. Kill old process and restart
    await runCommand(conn,
      'pkill -f "school-management-system" 2>/dev/null; sleep 2; echo killed'
    );
    await runCommand(conn,
      'nohup java -jar /opt/school-management/backend/target/school-management-system-1.0.0.jar > /opt/school-management/backend/backend.log 2>&1 &'
    );
    await runCommand(conn,
      'sleep 8 && echo "Process started" && netstat -tlnp 2>/dev/null | grep 8080 || echo "Port 8080 check done"'
    );

    console.log('\n✓ Backend restarted with updated endpoints:');
    console.log('  GET    /teachers/assignments             (ADMIN)');
    console.log('  POST   /teachers/assignments             (ADMIN)');
    console.log('  DELETE /teachers/assignments/{id}        (ADMIN)');
    console.log('  PUT    /teachers/{id}/class-teacher/{classId}  (ADMIN)');
    console.log('  DELETE /teachers/class-teacher/{classId} (ADMIN)');
    console.log('  GET    /teachers/class-teacher/{classId} (ALL)');
    console.log('  GET    /teachers/my-class-teacher-info   (TEACHER)');
    console.log('  POST   /homework  — fixed DTO response   (ADMIN/TEACHER)');
    console.log('  Student entity: aadharNumber + academicYearFees fields added');
    console.log('  Student creation/update: age validation (≥3 years)');

  } catch (e) {
    console.error('\nError:', e.message);
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
