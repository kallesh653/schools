const https = require('https');
const fs = require('fs');
const path = require('path');

function post(hostname, path_, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname, path: path_, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } }, res => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve(JSON.parse(out)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getRedirect(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers: headers || {} }, res => {
      resolve({ status: res.statusCode, location: res.headers.location });
    });
    req.on('error', reject);
    req.end();
  });
}

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const file = fs.createWriteStream(destPath);
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'GET' }, res => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        file.close();
        fs.unlinkSync(destPath);
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Logging in to Expo...');
  const loginRes = await post('api.expo.dev', '/v2/auth/loginAsync', { 'Content-Type': 'application/json' }, {
    username: 'skkallesh6@gmail.com',
    password: 'Kallesh717653@',
    otp: ''
  });
  const session = loginRes.data.sessionSecret;
  console.log('Logged in!');

  // Get signed download URL via GraphQL
  console.log('Getting download URL...');
  const gqlRes = await post('api.expo.dev', '/graphql', {
    'Content-Type': 'application/json',
    'expo-session': session
  }, {
    query: `query { app { byFullName(fullName: "@kallesh_1/school-parent-app") { buildByIdQuery(buildId: "61a1881d-5ed8-48c4-ae36-fc8046675573") { artifacts { buildUrl } } } } }`
  });
  console.log('GraphQL response:', JSON.stringify(gqlRes).substring(0, 300));
  const buildUrl = gqlRes?.data?.app?.byFullName?.buildByIdQuery?.artifacts?.buildUrl;
  if (!buildUrl) {
    // fallback: try artifacts endpoint
    console.log('Trying artifacts endpoint...');
    const redirect2 = await getRedirect('https://api.expo.dev/v2/artifacts/eas/61a1881d-5ed8-48c4-ae36-fc8046675573', { 'expo-session': session });
    if (redirect2.location) { var fallbackUrl = redirect2.location; }
  }
  const apkUrl = buildUrl || fallbackUrl;
  if (!apkUrl) { console.error('Could not get APK URL'); return; }
  const redirect = { location: apkUrl };

  if (!redirect.location) {
    console.error('No redirect URL found. Status:', redirect.status);
    return;
  }

  const cdnUrl = redirect.location;
  console.log('CDN URL obtained!');

  const destPath = path.join('C:\\', 'Users', 'LEN0VO', 'Desktop', 'SchoolParent.apk');
  console.log('Downloading APK to:', destPath);

  await download(cdnUrl, destPath);
  const stats = fs.statSync(destPath);
  console.log('');
  console.log('SUCCESS! APK downloaded to:');
  console.log(destPath);
  console.log('File size:', (stats.size / 1024 / 1024).toFixed(1), 'MB');
}

main().catch(console.error);
