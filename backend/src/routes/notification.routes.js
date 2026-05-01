const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getNotifications, markAsRead, markAllRead, deleteNotification,
} = require('../controllers/notification.controller');

router.get('/',                  authenticate, getNotifications);
router.patch('/read-all',        authenticate, markAllRead);
router.patch('/:id/read',        authenticate, markAsRead);
router.delete('/:id',            authenticate, deleteNotification);

module.exports = router;
