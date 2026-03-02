const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/* ===== Cloudinary Storage Setup ===== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage });

/* 1️⃣ Get All Products */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* 2️⃣ Get Single Product */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Invalid product ID" });
  }
});

/* 3️⃣ Add Product With Cloudinary Images */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {

    const imageUrls = req.files.map(file => file.path);

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      images: imageUrls
    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;