const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getAllUsers, getTechnicians, getUserById,
  updateUser, updateUserStatus, createUser,
} = require('../controllers/user.controller');

router.get('/',                   authenticate, authorize('admin'), getAllUsers);
router.post('/',                  authenticate, authorize('admin'), createUser);
router.get('/technicians',        authenticate, authorize('admin'), getTechnicians);
router.get('/:id',                authenticate, getUserById);
router.put('/:id',                authenticate, updateUser);
router.patch('/:id/status',       authenticate, authorize('admin'), updateUserStatus);

module.exports = router;
