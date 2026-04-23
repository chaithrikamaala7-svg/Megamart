const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add to cart
router.post('/', async (req, res) => {
  try {
    const { userId, product } = req.body;
    if (!userId || !product || !product.productId) {
      return res.status(400).json({ error: 'userId and product required' });
    }
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }
    const existing = cart.products.find(
      (item) => item.productId.toString() === product.productId
    );
    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      // Optionally fetch product details for name/image/price
      const prod = await Product.findById(product.productId);
      if (!prod) return res.status(404).json({ error: 'Product not found' });
      cart.products.push({
        productId: prod._id,
        name: prod.name,
        image: prod.imageUrl,
        price: prod.price,
        quantity: product.quantity || 1,
      });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart items
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId: mongoose.Types.ObjectId(userId) });
    res.json(cart ? cart.products : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId: mongoose.Types.ObjectId(userId) });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    res.json(cart.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
