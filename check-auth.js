try {
  var j = require('C:/Users/LEN0VO/.expo/state.json');
  var a = j.auth || j.currentUser;
  console.log('auth exists:', !!a);
  if (a) console.log('user:', a.username || a.name);
} catch(e) {
  console.log('error:', e.message);
}
