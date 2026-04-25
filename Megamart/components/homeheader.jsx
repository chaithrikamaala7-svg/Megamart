import React from "react";
import { Search, MapPin, User, Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "./apiBase";

const navItems = ["Men", "Women", "Kids", "Footwear", "Accessories", "Brands", "Shop Now"];

const Sheader = () => {
  const navigate = useNavigate();
  const handleShopNow = async () => {
    try {
      const res = await fetch(apiUrl("/api/products"));
     
      const data = await res.json();
     
      const firstProduct = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (firstProduct?._id || firstProduct?.id) {
        navigate(`/product/${firstProduct._id || firstProduct.id}`);
        return;
      }
    } catch {
     
    }
    navigate("/Home");
  };
  return (
    <header className="sheader" style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px 0 40px" }}>
        <div
          style={{
            fontSize: "2.5rem",
            color: "#e53935",
            fontWeight: "bold",
            fontFamily: "sans-serif",
            letterSpacing: "1px",
          }}
        >
          megamart
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search: Trousers"
              style={{
                padding: "8px 40px 8px 16px",
                borderRadius: "24px",
                border: "1px solid #ccc",
                width: "260px",
                fontSize: "1rem",
              }}
            />
            <Search
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }}
              size={20}
            />
          </div>
          <MapPin size={24} style={{ color: "#888", cursor: "pointer" }} />
          <User size={24} style={{ color: "#888", cursor: "pointer" }} onClick={() => navigate("/Login")} />
          <Heart size={24} style={{ color: "#888", cursor: "pointer" }} />
          <ShoppingBag size={24} style={{ color: "#888", cursor: "pointer" }} onClick={() => navigate("/Cart")} />
        </div>
      </div>
      <nav
        style={{
          background: "#f7f7f7",
          padding: "12px 40px",
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          fontSize: "1.1rem",
          fontWeight: "500",
          color: "#333",
        }}
      >
        {navItems.map((item) => (
          <span
            key={item}
            style={{
              cursor: "pointer",
              ...(item === "Shop Now"
                ? {
                    background: "#2f55d4",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: "16px",
                  }
                : {}),
            }}
            onClick={() => {
              if (item === "Shop Now") handleShopNow();
            }}
          >
            {item}
          </span>
        ))}
      </nav>
    </header>
  );
};

export default Sheader;
