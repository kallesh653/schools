const QRCode = require('qrcode');
const parentUrl = 'exp://192.168.29.202:8081';
const teacherUrl = 'exp://192.168.29.202:8082';
QRCode.toFile('C:\\Users\\LEN0VO\\Desktop\\parent-app-qr.png', parentUrl, {width:400, margin:2}, (e) => {
  if(e) console.error('parent error:', e.message);
  else console.log('parent QR saved to Desktop');
});
QRCode.toFile('C:\\Users\\LEN0VO\\Desktop\\teacher-app-qr.png', teacherUrl, {width:400, margin:2}, (e) => {
  if(e) console.error('teacher error:', e.message);
  else console.log('teacher QR saved to Desktop');
});
