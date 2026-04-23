import React, { useEffect, useState } from "react";
import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Unable to fetch products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-card">
          <center>
            <a href="#">
              <img src="/images/head.png" alt="Header" />
            </a>
          </center>
        </div>
      </div>
      <main className="home-main">
        <div className="explore-section">
          <h2>EXPLORE MORE</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : products.length === 0 ? (
            <p>No products found. Try adding one first.</p>
          ) : (
            <div className="product-grid">
              {products.slice(0, 6).map((product) => {
                const id = product._id || product.id;
                const imageSrc =
                  product.imageUrl && product.imageUrl.startsWith("/uploads")
                    ? `http://localhost:3001${product.imageUrl}`
                    : product.imageUrl || "";
                return (
                  <div key={id} className="product-card">
                    <div className="product-image-wrapper">
                      {imageSrc ? (
                        <img src={imageSrc} alt={product.name} className="product-image" />
                      ) : (
                        <span className="no-image">No Image</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="product-price">₹ {product.price}</div>
                      <div className="product-category">{product.category}</div>
                      <Link to={`/product/${id}`}>
                        <button className="cta-button" style={{ marginTop: 12 }}>
                          SHOP NOW
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
