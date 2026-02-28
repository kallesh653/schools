const https = require('https');

function post(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } }, res => {
      let out = '';
      res.on('data', d => out += d);
      res.on('end', () => resolve(JSON.parse(out)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  // Login
  const loginRes = await post('api.expo.dev', '/v2/auth/loginAsync', { 'Content-Type': 'application/json' }, {
    username: 'skkallesh6@gmail.com',
    password: 'Kallesh717653@',
    otp: ''
  });
  const session = loginRes.data.sessionSecret;
  console.log('Session:', session);

  // Query builds
  const gql = await post('api.expo.dev', '/graphql', {
    'Content-Type': 'application/json',
    'expo-session': session
  }, {
    query: `{ app { byFullName(fullName: "@kallesh_1/school-parent-app") { builds(offset: 0, limit: 3, filter: { platform: ANDROID }) { id status artifacts { buildUrl } createdAt } } } }`
  });

  console.log(JSON.stringify(gql.data?.app?.byFullName?.builds, null, 2));
}

main().catch(console.error);
