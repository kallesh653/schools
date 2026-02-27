/**
 * Backend Deployment Script - Uploads source files and builds on VPS
 * Run: node deploy-backend-ssh.js <password>
 */
const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const fs = require('fs');
const path = require('path');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node deploy-backend-ssh.js <vps-password>');
  process.exit(1);
}

const VPS_HOST = '194.164.149.8';
const VPS_USER = 'root';

const FILES_TO_UPLOAD = [
  // Fixed: TEACHER role name bug
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/controller/TeacherController.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/controller/TeacherController.java'
  },
  // New: Transport/Van Route entity
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/entity/TransportRoute.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/entity/TransportRoute.java'
  },
  // New: Transport Route repository
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/repository/TransportRouteRepository.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/repository/TransportRouteRepository.java'
  },
  // New: Transport controller (routes CRUD + student assignment)
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/controller/TransportController.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/controller/TransportController.java'
  },
  // Modified: Student entity (added transportRoute field)
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/entity/Student.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/entity/Student.java'
  },
  // Modified: StudentRepository (added findByTransportRoute)
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/repository/StudentRepository.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/repository/StudentRepository.java'
  },
  // DTO classes used by TeacherController
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/dto/CreateTeacherRequest.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/dto/CreateTeacherRequest.java'
  },
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/dto/MessageResponse.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/dto/MessageResponse.java'
  },
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/dto/CreateStudentRequest.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/dto/CreateStudentRequest.java'
  },
  // Fixed: ExaminationController - add PARENT role to GET /examinations
  {
    local: path.join(__dirname, 'backend/src/main/java/com/school/controller/ExaminationController.java'),
    remote: '/root/school-management/backend/src/main/java/com/school/controller/ExaminationController.java'
  },
];

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => {
        console.log('  Uploaded: ' + path.basename(localPath));
        resolve();
      });
      writeStream.on('error', reject);
      readStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });
}

function runCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', (code) => resolve({ code, output }));
      stream.on('data', (data) => { output += data; process.stdout.write(data.toString()); });
      stream.stderr.on('data', (data) => { output += data; process.stderr.write(data.toString()); });
    });
  });
}

const conn = new Client();

conn.on('ready', async () => {
  console.log('Connected to VPS\n');

  try {
    // Find where backend source lives on VPS
    console.log('Finding backend location...');
    const { output: findOut } = await runCommand(conn, 'find /root /opt -name "StudentRepository.java" 2>/dev/null | head -1');
    const found = findOut.trim();
    let basePath = '/root/school-management';
    if (found) {
      basePath = found.split('/backend/')[0];
      console.log('Backend found at: ' + basePath);
    }

    // Ensure directories exist for new files
    await runCommand(conn, `mkdir -p ${basePath}/backend/src/main/java/com/school/entity`);
    await runCommand(conn, `mkdir -p ${basePath}/backend/src/main/java/com/school/repository`);
    await runCommand(conn, `mkdir -p ${basePath}/backend/src/main/java/com/school/controller`);
    await runCommand(conn, `mkdir -p ${basePath}/backend/src/main/java/com/school/dto`);

    // Upload source files
    console.log('\nUploading changed files...');
    for (const file of FILES_TO_UPLOAD) {
      const remotePath = file.remote.replace('/root/school-management', basePath);
      await uploadFile(conn, file.local, remotePath);
    }

    // Check for Maven
    console.log('\nChecking for Maven...');
    const { output: mvnOut } = await runCommand(conn, 'which mvn 2>/dev/null || echo NOMVN');
    const hasMvn = !mvnOut.includes('NOMVN') && mvnOut.trim() !== '';

    if (!hasMvn) {
      console.log('Maven not found. Installing...');
      await runCommand(conn, 'apt-get install -y maven 2>&1 | tail -3');
    }

    // Build
    console.log('\nBuilding backend (may take 2-5 minutes)...');
    const { code } = await runCommand(conn,
      `cd ${basePath}/backend && mvn package -DskipTests -q 2>&1 | tail -10`
    );

    if (code === 0) {
      console.log('\nBuild successful! Restarting backend Java process...');
      // Kill existing Java process for school-management, then restart
      await runCommand(conn,
        `pkill -f "school-management-system" 2>/dev/null || true`
      );
      await runCommand(conn, 'sleep 3');
      const jarPath = `${basePath}/backend/target/school-management-system-1.0.0.jar`;
      const logPath = `${basePath}/backend/backend.log`;
      await runCommand(conn,
        `nohup java -jar ${jarPath} > ${logPath} 2>&1 &`
      );
      await runCommand(conn, 'sleep 5 && echo "Process started"');
      console.log('\n✓ Backend deployed and restarted!');
      console.log('Changes live:');
      console.log('  - Teacher role bug fixed (ROLE_TEACHER)');
      console.log('  - Transport/Van routes API: GET/POST /transport/routes');
      console.log('  - Student transport assignment: PUT /transport/students/{id}/route');
    } else {
      console.error('\nBuild failed on VPS.');
    }

  } catch (err) {
    console.error('\nError:', err.message);
  } finally {
    conn.end();
  }
});

conn.on('error', (err) => {
  console.error('SSH error:', err.message);
  process.exit(1);
});

console.log('Connecting to ' + VPS_HOST + '...');
conn.connect({
  host: VPS_HOST,
  port: 22,
  username: VPS_USER,
  password: password,
  keepaliveInterval: 15000,
  keepaliveCountMax: 60,
  readyTimeout: 30000,
});
