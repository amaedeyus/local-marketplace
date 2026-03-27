const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // Custom Validator: discount must be below price
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },
  category: String,
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    maxlength: [50, 'Description must not exceed 50 characters'] // Built-in Validator
  },
  postedDate: {
    type: Date,
    default: Date.now()
  },
  productSlug: String,
  premiumProducts: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 2. Virtual Property: Days Posted
productSchema.virtual('daysPosted').get(function() {
  const diffInMs = Date.now() - this.postedDate;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
});

// 3. Document Middleware: Slugify name
productSchema.pre('save', function(next) {
  this.productSlug = slugify(this.name, { upper: true });
  next();
});

// 4. Query Middleware: Filter out premium products
productSchema.pre(/^find/, function(next) {
  this.find({ premiumProducts: { $ne: true } });
  next();
});

// 5. Aggregate Middleware: Filter out premium products
productSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;