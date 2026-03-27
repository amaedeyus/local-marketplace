const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router
	.route('/top-3-cheap')
	.get(productController.aliasTopProducts, productController.getAllProducts);

router.param('id', productController.checkID);

// Product routes
router
	.route('/')
	.get(productController.getAllProducts)
	.post(productController.checkBody, productController.createProduct);

router
	.route('/:id')
	.get(productController.getProduct)
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);

module.exports = router;
