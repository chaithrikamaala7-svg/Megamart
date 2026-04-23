const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: 
    { type: String, 
      required: true
     },
    price:
     { type: Number, 
      required: true 
    },
    category: 
    { type: String, 
      required: true 

    },
    description: 
    { type: String },
    imageUrl: 
    { type: String },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;

