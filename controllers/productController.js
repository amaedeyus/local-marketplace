// controllers/productController.js
const path = require('path');

const Product = require('../model/productModel');
// Middleware to check request body for create/update

const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopProducts = (req, res, next) => {
	req.query.limit = '3';
	req.query.sort = '-price';
	req.query.fields = 'name,price,category,description,seller';
	next();
};

// GET /api/v1/products
exports.getAllProducts = catchAsync(async (req, res,
next) => {
        const features = new APIFeatures(Product.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
            
        const products = await features.query;
        
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            results: products.length,
            data: { products },
        });
});

// GET /api/v1/products/:id
exports.getProduct = catchAsync( async (req, res,
next) => {
		const product = await Product.findById(req.params.id);

		res.status(200).json({
			status: 'success',
			data: { product },
		});
		
		if (!product) {
			return next(new AppError('No product found with that ID', 404));
		}
});

// POST /api/v1/products
exports.createProduct = catchAsync( async (req, res,
next) => {
		const newProduct = await Product.create(req.body);
		res.status(201).json({
			status: 'success',
			data: { product: newProduct },
		});
});

// PATCH /api/v1/products/:id
exports.updateProduct = catchAsync( async (req, res,
next) => {
		const product = await Product.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			},
		);
		res.status(200).json({
			status: 'success',
			data: { product },
		});

		if (!product) {
			return next(new AppError('No product found with that ID', 404));
		}
});

// DELETE /api/v1/products/:id
exports.deleteProduct = catchAsync( async (req, res,
next) => {
		await Product.findByIdAndDelete(req.params.id);
		res.status(200).json({
			status: 'success',
			message: `Product with ID ${req.params.id} deleted successfully`,
			data: null,
		});

		if (!product) {
			return next(new AppError('No product found with that ID', 404));
		}
});

exports.getProductCategory = catchAsync(async (req, res,
next) => {
		const stats = await Product.aggregate([
			{
				$match: { price: { $lt: 1000 } },
			},
			{
				$group: {
					_id: { $toUpper: '$category' },
					numProducts: { $sum: 1 },
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' },
				},
			},
			{
				$sort: { avgPrice: 1 },
			},
			// {
			// $match: { _id: { $ne: 'EASY'}}
			// }
		]);
		res.status(200).json({
			status: 'success',
			data: {
				stats,
			},
		});
});
