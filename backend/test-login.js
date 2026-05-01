const bcrypt = require('bcryptjs');

const password = 'demo1234';
const hash = '$2a$12$LQv3c1yqBwWFcZquqBIune6ZhqPQTz0Ck5L5e3Uh4qg5L.qKE.6J2';

bcrypt.compare(password, hash, (err, result) => {
  console.log('Password:', password);
  console.log('Match:', result);
});