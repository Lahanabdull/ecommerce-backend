const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  brand: {
    type: String,
    default: "Premium Brand"
  },

  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  description: {
    type: String
  },

  deliveryDuration: {
    type: String,
    default: "5-7 Days"
  },

  packingMethod: {
    type: String,
    default: "Secure Packaging"
  },

  shippingFee: {
    type: String,
    default: "Free Shipping"
  },

  images: {
    type: [String],
    default: []
  },

  category: {
    type: String
  },

  stock: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);