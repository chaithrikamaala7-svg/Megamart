import "./Header.css";
import { useState, useEffect } from "react";
import { subcategories } from "./subcategories";
import "./subcategory.css";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "./apiBase";

function Header() {
  const navigate = useNavigate();
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search: Trouser");
  const searchTerms = ["Trouser", "Men", "Women", "Winterwear", "Sneaker"];
  const [searchIndex, setSearchIndex] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchIndex((prevIndex) => (prevIndex + 1) % searchTerms.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSearchPlaceholder(`Search: ${searchTerms[searchIndex]}`);
  }, [searchIndex]);

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlistCount(Array.isArray(stored) ? stored.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlistCount();
    window.addEventListener("storage", updateWishlistCount);
    window.addEventListener("wishlist-updated", updateWishlistCount);
    return () => {
      window.removeEventListener("storage", updateWishlistCount);
      window.removeEventListener("wishlist-updated", updateWishlistCount);
    };
  }, []);

  let user = null;
  if (typeof window !== "undefined") {
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {}
  }
  const [showDropdown, setShowDropdown] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleShopNow = async (e) => {
    e.preventDefault();
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
    navigate("/home");
  };

  
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const handleCategoryMouseEnter = (cat) => setHoveredCategory(cat);
  const handleCategoryMouseLeave = () => setHoveredCategory(null);

  return (
    <header>
      <div className="firstheader">
        <p>***15% off for New Users***</p>
      </div>
      <div className="header-top">
        <div className="logo">
          <Link to="/">megamart</Link>
        </div>
        <div className="search-container">
          <input type="text" placeholder={searchPlaceholder} className="search-box" />
          <button className="search-btn">
            <img src="/images/search.svg" alt="search" />
          </button>
        </div>
        <div className="nav-icons">
          <div
            className="nav-account"
            onMouseEnter={() => {
              if (user) setShowDropdown(true);
            }}
            onMouseLeave={() => setShowDropdown(false)}
          >
            {user ? (
              <button type="button" className="icon-btn" title="Account" aria-expanded={showDropdown} aria-haspopup="true">
                <img src="/images/log.svg" alt="account" />
              </button>
            ) : (
              <Link className="icon-btn" to="/login" title="login">
                <img src="/images/log.svg" alt="login" />
              </Link>
            )}
            {user && showDropdown && (
              <div className="user-dropdown">
                <div className="user-dropdown-name">{user.name}</div>
                <button type="button" className="user-dropdown-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
          <button className="icon-btn" title="location">
            <img src="/images/loc.svg" alt="location" />
          </button>
          <Link className="icon-btn wishlist-icon-btn" to="/wishlist" title="wishlist">
            <img src="/images/fav.svg" alt="wishlist" />
            {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
          </Link>
          <button className="icon-btn" title="cart">
            <Link className="icon-btn" to="/cart" title="cart">
              <img src="/images/cart.svg" alt="cart" />
            </Link>
          </button>
        </div>
      </div>
      <nav className="navbar">
        <ul className="nav-menu">
          <li onMouseEnter={() => handleCategoryMouseEnter("men")} onMouseLeave={handleCategoryMouseLeave} style={{position:'relative'}}>
            <Link to="/category/men">Men</Link>
            {hoveredCategory === "men" && (
              <div className="subcategory-dropdown">
                {subcategories.men.map((sub) => (
                  <Link key={sub.name} to={`/category/men/${sub.name.toLowerCase().replace(/\s+/g, "-")}`} className="subcategory-link">
                    <img src={sub.img} alt={sub.name} className="subcategory-img" style={{width:32,height:32,objectFit:'cover',marginRight:8}} />
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
          <li onMouseEnter={() => handleCategoryMouseEnter("women")} onMouseLeave={handleCategoryMouseLeave} style={{position:'relative'}}>
            <Link to="/category/women">Women</Link>
            {hoveredCategory === "women" && (
              <div className="subcategory-dropdown">
                {subcategories.women.map((sub) => (
                  <Link key={sub.name} to={`/category/women/${sub.name.toLowerCase().replace(/\s+/g, "-")}`} className="subcategory-link">
                    <img src={sub.img} alt={sub.name} className="subcategory-img" style={{width:32,height:32,objectFit:'cover',marginRight:8}} />
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
          <li onMouseEnter={() => handleCategoryMouseEnter("kids")} onMouseLeave={handleCategoryMouseLeave} style={{position:'relative'}}>
            <Link to="/category/kids">Kids</Link>
            {hoveredCategory === "kids" && (
              <div className="subcategory-dropdown">
                {subcategories.kids.map((sub) => (
                  <Link key={sub.name} to={`/category/kids/${sub.name.toLowerCase().replace(/\s+/g, "-")}`} className="subcategory-link">
                    <img src={sub.img} alt={sub.name} className="subcategory-img" style={{width:32,height:32,objectFit:'cover',marginRight:8}} />
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
          <li>
            <Link to="/category/footwear">Footwear</Link>
          </li>
          <li>
            <Link to="/category/accessories">Accessories</Link>
          </li>
          <li>
            <Link to="/category/winterwear">Winterwear</Link>
          </li>
          <li>
            <Link to="/category/brands">Brands</Link>
          </li>
        </ul>
      </nav>
      <div className="promo-badges-section">
        <div className="promo-badges">
          <span className="badge">B2G2</span>
          <span className="badge">DEAL ZONE</span>
          <span className="badge">MEGAPASS AT 149</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
