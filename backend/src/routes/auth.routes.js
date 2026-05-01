const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerRules, loginRules, validate } = require('../middleware/validation.middleware');

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        authenticate,  getMe);

module.exports = router;
