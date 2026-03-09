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

/* ============================= */
/* 1️⃣ GET ALL PRODUCTS */
/* ============================= */
router.get("/", async (req, res) => {
  try {

    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
});

/* ============================= */
/* 2️⃣ GET SINGLE PRODUCT */
/* ============================= */
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

/* ============================= */
/* 3️⃣ ADD PRODUCT */
/* ============================= */
router.post("/", upload.array("images", 5), async (req, res) => {
  try {

    const imageUrls = req.files.map(file => file.path);

    const newProduct = new Product({

      brand: req.body.brand,

      name: req.body.name,

      price: req.body.price,

      description: req.body.description,

      deliveryDuration: req.body.deliveryDuration,

      packingMethod: req.body.packingMethod,

      shippingFee: req.body.shippingFee,

      category: req.body.category,   // ✅ ADD THIS

      stock: Number(req.body.stock), 

      images: imageUrls

    });

    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);

  } catch (error) {

    res.status(400).json({ message: error.message });

  }
});

/* ============================= */
/* 4️⃣ DELETE PRODUCT */
/* ============================= */
router.delete("/:id", async (req, res) => {
  try {

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
});

module.exports = router;