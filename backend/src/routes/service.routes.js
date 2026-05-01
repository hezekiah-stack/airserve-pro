const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getAllServices, getServiceById, createService, updateService, deleteService,
} = require('../controllers/service.controller');

router.get('/',       getAllServices);
router.get('/:id',    getServiceById);
router.post('/',      authenticate, authorize('admin'), createService);
router.put('/:id',    authenticate, authorize('admin'), updateService);
router.delete('/:id', authenticate, authorize('admin'), deleteService);

module.exports = router;
