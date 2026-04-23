import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "./CartContext";
import "./SingleProduct.css";

function SingleProduct() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/products`);
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        const found = Array.isArray(data) ? data.find((p) => (p._id || p.id) === productId) : null;
        setProduct(found || null);
      } catch (err) {
        setError("Unable to fetch product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <div className="single-product-loading">Loading product...</div>;
  if (error) return <div className="single-product-error">{error}</div>;
  if (!product) return <div className="single-product-notfound">Product not found.</div>;

  const imageSrc =
    product.imageUrl && product.imageUrl.startsWith("/uploads")
      ? `http://localhost:3001${product.imageUrl}`
      : product.imageUrl || "";

  return (
    <div className="single-product-modern-container">
      <div className="single-product-modern-left">
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} className="single-product-modern-image" />
        ) : (
          <span className="single-product-noimage">No Image</span>
        )}
      </div>
      <div className="single-product-modern-right">
        <h2 className="single-product-modern-title">{product.name}</h2>
        <div className="single-product-modern-price">₹ {product.price}</div>
        <div className="single-product-modern-category">{product.category}</div>
        <div className="single-product-modern-description">{product.description}</div>
        <div className="single-product-modern-actions">
          <button
            className="single-product-modern-cart"
            onClick={() => {
              addToCart(product);
              navigate("/cart");
            }}
          >
            Add to Cart
          </button>
          <button
            className="single-product-modern-buy"
            onClick={() => {
              addToCart(product);
              navigate("/checkout");
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
