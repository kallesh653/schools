const { execSync } = require('child_process');
const path = require('path');

const base = 'C:\\Users\\LEN0VO\\Desktop\\schoolmk1.0';

console.log('[1/2] Installing parent-app (expo ~54.0.33, RN 0.81.5)...');
try {
  execSync('npm install --legacy-peer-deps --prefer-offline', {
    cwd: path.join(base, 'parent-app'),
    stdio: 'inherit',
    timeout: 480000
  });
  console.log('parent-app install DONE');
} catch(e) {
  console.error('parent-app install error:', e.message);
}

console.log('\n[2/2] Installing teacher-app (expo ~54.0.33, RN 0.81.5)...');
try {
  execSync('npm install --legacy-peer-deps --prefer-offline', {
    cwd: path.join(base, 'teacher-app'),
    stdio: 'inherit',
    timeout: 480000
  });
  console.log('teacher-app install DONE');
} catch(e) {
  console.error('teacher-app install error:', e.message);
}

console.log('\nAll installs complete!');
