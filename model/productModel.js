const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product must have a name'],
    },
    price: {
        type: Number,
        required: [true, 'A product must have a price'],
    },
    category: {
        type: String,
        required: [true, 'A product must have a category'],
    },
    description: {
        type: String,
	    required: [true, 'A product must have a description'],
	    trim: true
    },
    seller: {
        type: String,
        required: [true, 'A product must have a seller'],
    },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;