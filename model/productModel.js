const mongoose = require('mongoose');
const slugify = require('slugify');
const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A product must have a name'],
		},
		productSlug: String,
		price: {
			type: Number,
			required: [true, 'A product must have a price'],
		},
        priceDiscount: { 
            type: Number,
            validate: {
                validator: function(val) {
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price'
            }
        },
		category: { 
			type: String,
			required: [true, 'A product must have a category'],
		},
		description: {
			type: String,
			required: [true, 'A product must have a description'],
            maxLength: [50, 'the description should not exceed 50 characters'],
			trim: true,
		},
		seller: {
			type: String,
			required: [true, 'A product must have a seller'],
		},
		postedDate: {
			type: Date,
			default: Date.now,
		},
		premiumProducts: {
			type: Boolean,
			default: false,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

productSchema.virtual('daysPosted').get(function () {
	const currentDate = new Date();
	const timeDiff = currentDate - this.postedDate;
	 
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
});

productSchema.pre('save', function () {
	this.productSlug = slugify(this.name, { upper: true });
});

productSchema.pre(/^find/, function () {
	this.find({ premiumProducts: { $ne: true } });
});

productSchema.post('save', function (doc) {
	console.log(doc);
});

productSchema.pre('aggregate', function () {
	this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;