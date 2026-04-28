import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "./CartContext";
import "./SingleProduct.css";
import { apiUrl, assetUrl } from "./apiBase";
import { subcategories } from "./subcategories";

function SingleProduct() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const getSizeOptions = (item) => {
    if (!item) return [];
    if (Array.isArray(item.sizes) && item.sizes.length > 0) {
      return item.sizes;
    }
    const cat = normalize(item.category);
    const subcat = normalize(item.subcategory);
    if (cat && subcategories[cat]) {
      const sub = subcategories[cat].find((s) => normalize(s.name) === subcat);
      if (sub?.sizes?.length) return sub.sizes;
    }
    return [];
  };

  const getWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(apiUrl("/api/products"));
        if (!res.ok) throw new Error("Failed to load product");
        const data = await res.json();
        const found = Array.isArray(data) ? data.find((p) => (p._id || p.id) === productId) : null;
        setProduct(found || null);
        setSelectedSize("");
        setQuantity(1);
      } catch (err) {
        setError("Unable to fetch product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product) {
      setIsWishlisted(false);
      return;
    }
    const id = product._id || product.id;
    const wished = getWishlist().some((item) => (item._id || item.id) === id);
    setIsWishlisted(wished);
  }, [product]);

  if (loading) return <div className="single-product-loading">Loading product...</div>;
  if (error) return <div className="single-product-error">{error}</div>;
  if (!product) return <div className="single-product-notfound">Product not found.</div>;

  const imageSrc = product.imageUrl ? assetUrl(product.imageUrl) : "/images/head.png";
  const sizeOptions = getSizeOptions(product);

  const handleToggleWishlist = () => {
    const id = product._id || product.id;
    const current = getWishlist();
    const exists = current.some((item) => (item._id || item.id) === id);
    const updated = exists
      ? current.filter((item) => (item._id || item.id) !== id)
      : [...current, { ...product, _id: id, id }];

    localStorage.setItem("wishlist", JSON.stringify(updated));
    setIsWishlisted(!exists);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleAddToCart = () => {
    if (sizeOptions.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    for (let i = 0; i < quantity; i += 1) {
      addToCart({ ...product, size: selectedSize });
    }
    navigate("/cart");
  };

  return (
    <div className="single-product-page">
      <div className="single-product-modern-container">
        <div className="single-product-modern-left">
          <img src={imageSrc} alt={product.name} className="single-product-modern-image" />
        </div>
        <div className="single-product-modern-right">
          <h2 className="single-product-modern-title">{product.name}</h2>
          <div className="single-product-modern-price">₹ {product.price}</div>
          <div className="single-product-modern-description">
            {product.description || "No description available."}
          </div>
          <div className="single-product-divider" />

          {sizeOptions.length > 0 && (
            <div className="single-product-size-block">
              <p className="single-product-block-title">Available Sizes</p>
              <div className="single-product-size-list">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`single-product-size-btn ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="single-product-modern-actions">
            <div className="single-product-qty-control">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((prev) => prev + 1)}>
                +
              </button>
            </div>

            <button className="single-product-modern-cart" onClick={handleAddToCart}>
              Add To Cart
            </button>

            <button
              type="button"
              className={`single-product-wishlist-btn ${isWishlisted ? "active" : ""}`}
              onClick={handleToggleWishlist}
              title="Wishlist"
            >
              ❤
            </button>
          </div>

          <div className="single-product-modern-category">
            Category: {product.category}
            {product.subcategory ? ` / ${product.subcategory}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
