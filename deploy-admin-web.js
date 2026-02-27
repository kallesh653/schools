/**
 * Deploy admin-web build to VPS via SFTP
 * Run: node deploy-admin-web.js
 */
const { Client } = require('C:\\Users\\LEN0VO\\AppData\\Roaming\\npm\\node_modules\\ssh2');
const fs = require('fs');
const path = require('path');

const VPS_HOST = '194.164.149.8';
const VPS_USER = 'root';
const VPS_PASS = 'Kallesh717653@';
const LOCAL_BUILD = path.join(__dirname, 'admin-web', 'build');
const REMOTE_PATH = '/var/www/school-admin';

const conn = new Client();

function getAllFiles(dir, base) {
  const results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relPath = path.join(base, item);
    if (fs.statSync(fullPath).isDirectory()) {
      results.push(...getAllFiles(fullPath, relPath));
    } else {
      results.push({ local: fullPath, remote: relPath.replace(/\\/g, '/') });
    }
  }
  return results;
}

function runCommand(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('close', (code) => resolve({ code, out }));
      stream.on('data', (d) => { out += d; process.stdout.write(d.toString()); });
      stream.stderr.on('data', (d) => { out += d; });
    });
  });
}

function uploadFile(sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function mkdirpRemote(sftp, dirPath) {
  return new Promise((resolve) => {
    sftp.mkdir(dirPath, (err) => {
      resolve(); // ignore errors (dir may exist)
    });
  });
}

conn.on('ready', async () => {
  console.log('Connected to VPS\n');

  try {
    // Clear existing files and ensure dir exists
    await runCommand(conn, `rm -rf ${REMOTE_PATH}/* && mkdir -p ${REMOTE_PATH}`);
    console.log('Cleared remote directory\n');

    conn.sftp(async (err, sftp) => {
      if (err) { console.error('SFTP error:', err); conn.end(); return; }

      const files = getAllFiles(LOCAL_BUILD, '');
      console.log(`Uploading ${files.length} files...`);

      // Create all needed directories first
      const dirs = new Set();
      for (const f of files) {
        const d = path.dirname(f.remote);
        if (d && d !== '.') {
          const parts = d.split('/');
          for (let i = 1; i <= parts.length; i++) {
            dirs.add(parts.slice(0, i).join('/'));
          }
        }
      }

      for (const d of [...dirs].sort()) {
        await mkdirpRemote(sftp, `${REMOTE_PATH}/${d}`);
      }

      // Upload all files
      let count = 0;
      for (const f of files) {
        const remoteFull = `${REMOTE_PATH}/${f.remote}`;
        await uploadFile(sftp, f.local, remoteFull);
        count++;
        if (count % 10 === 0) process.stdout.write(`  ${count}/${files.length} uploaded...\n`);
      }

      console.log(`\n✓ All ${files.length} files uploaded!`);
      conn.end();
    });

  } catch (e) {
    console.error('Error:', e.message);
    conn.end();
  }
});

conn.on('error', (e) => { console.error('SSH Error:', e.message); process.exit(1); });
conn.on('close', () => {
  console.log('\n✓ Deployment complete!');
  console.log(`  Admin web is live at: https://schoolm.aksoftware.tech`);
});

console.log(`Connecting to ${VPS_HOST}...`);
conn.connect({
  host: VPS_HOST,
  port: 22,
  username: VPS_USER,
  password: VPS_PASS,
  keepaliveInterval: 15000,
  readyTimeout: 30000
});
