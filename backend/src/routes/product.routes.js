const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, updateStock,
} = require('../controllers/product.controller');

router.get('/',                 getAllProducts);
router.get('/:id',              getProductById);
router.post('/',                authenticate, authorize('admin'), createProduct);
router.put('/:id',              authenticate, authorize('admin'), updateProduct);
router.delete('/:id',           authenticate, authorize('admin'), deleteProduct);
router.patch('/:id/stock',      authenticate, authorize('admin'), updateStock);

module.exports = router;
