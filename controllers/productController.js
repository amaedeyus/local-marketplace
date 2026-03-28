// controllers/productController.js
const path = require('path');
const APIFeatures = require('./../utils/apiFeatures');

const Product = require('../model/productModel');
// Middleware to check request body for create/update
exports.checkBody = (req, res, next) => {
	if (
		!req.body.name ||
		!req.body.price ||
		!req.body.category ||
		!req.body.description ||
		!req.body.seller
	) {
		return res.status(400).json({
			status: 'fail',
			message:
				'Missing required fields: name, price, category, description, seller',
		});
	}
	if (typeof req.body.price !== 'number') {
		return res.status(400).json({
			status: 'fail',
			message: 'Price must be a number',
		});
	}

	next();
};

// Middleware to check ID (async for MongoDB)
exports.checkID = async (req, res, next, val) => {
	console.log(`Product id is: ${val}`);

	try {
		const product = await Product.findById(val);
		if (!product) {
			return res.status(404).json({
				status: 'fail',
				message: 'Invalid ID',
			});
		}
		next();
	} catch (err) {
		return res.status(400).json({
			status: 'fail',
			message: 'Invalid ID format',
		});
	}
};

exports.aliasTopProducts = (req, res, next) => {
	req.query.limit = '3';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,category,description,seller';
	next();
};
// GET /api/v1/products
exports.getAllProducts = async (req, res) => {
	try {
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
	} catch (err) {
		res.status(404).json({
			status: 'fail',
			message: err,
		});
	}
};

// GET /api/v1/products/:id
exports.getProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		res.status(200).json({
			status: 'success',
			data: { product },
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: 'Invalid data sent!',
		});
	}
};

// POST /api/v1/products
exports.createProduct = async (req, res) => {
	try {
		const newProduct = await Product.create(req.body);
		res.status(201).json({
			status: 'success',
			data: { product: newProduct },
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err,
		});
	}
};

// PATCH /api/v1/products/:id
exports.updateProduct = async (req, res) => {
	try {
		const product = await Product.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true, // Added this based on documentation
			},
		);
		res.status(200).json({
			status: 'success',
			data: { product },
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err,
		});
	}
};

// DELETE /api/v1/products/:id
exports.deleteProduct = async (req, res) => {
	try {
		await Product.findByIdAndDelete(req.params.id);
		res.status(200).json({
			status: 'success',
			message: `Product with ID ${req.params.id} deleted successfully`,
			data: null,
		});
	} catch (err) {
		res.status(400).json({
			status: 'fail',
			message: err,
		});
	}
};

exports.getProductCategory = async (req, res) => {
		try {
			const stats = await Product.aggregate([
				{
					$match: { price: { $lt: 1000 } }, // Price less than 1000
				},
				{
					$group: {
						_id: '$category',
						avgPrice: { $avg: '$price' },
						minPrice: { $min: '$price' },
						maxPrice: { $max: '$price' },
						products: { $push: '$name' },
					},
				},
				{
					$sort: { avgPrice: 1 }, // Sort by average price
				},
			]);

			res.status(200).json({
				status: 'success',
				data: { stats },
			});
		} catch (err) {
			res.status(404).json({ status: 'fail', message: err });
		}
	};
