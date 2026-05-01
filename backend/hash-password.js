const bcrypt = require('bcryptjs');

const password = 'demo1234';
bcrypt.hash(password, 12, (err, hash) => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nRun this in phpMyAdmin SQL tab:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email LIKE '%@demo.com';`);
});
