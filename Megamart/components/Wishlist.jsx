import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assetUrl } from "./apiBase";
import { useCart } from "./CartContext";
import "./Wishlist.css";

function Wishlist() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setItems(Array.isArray(stored) ? stored : []);
    } catch {
      setItems([]);
    }
  }, []);

  const removeItem = (id) => {
    const updated = items.filter((item) => (item._id || item.id) !== id);
    setItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-box">
        <h2>My Wishlist</h2>
        {items.length === 0 && <p>Your wishlist is empty.</p>}
        <div className="wishlist-grid">
          {items.map((item) => {
            const id = item._id || item.id;
            return (
              <div key={id} className="wishlist-card">
                <img src={item.imageUrl ? assetUrl(item.imageUrl) : "/images/head.png"} alt={item.name} />
                <p className="wishlist-name">{item.name}</p>
                <p className="wishlist-price">₹ {item.price}</p>
                <div className="wishlist-actions">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(item);
                      navigate("/cart");
                    }}
                  >
                    Add to Cart
                  </button>
                  <button type="button" className="wishlist-remove" onClick={() => removeItem(id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
