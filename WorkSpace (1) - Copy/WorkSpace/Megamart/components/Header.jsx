import "./Header.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Header() {
    const [searchPlaceholder, setSearchPlaceholder] = useState("Search: Trouser");


    const searchTerms = ["Trouser", "Men", "Women", "Winterwear", "Sneaker"];


    const [searchIndex, setSearchIndex] = useState(0);


    useEffect(() => {
        const interval = setInterval(() => {
            setSearchIndex((prevIndex) => (prevIndex + 1) % searchTerms.length);
        }, 3000); 

        return () => clearInterval(interval);
    }, []);


    useEffect(() => 
        
        {
        setSearchPlaceholder(`Search: ${searchTerms[searchIndex]}`);
    }, [searchIndex]);


    // Get user from localStorage
    let user = null;
    let firstLetter = "";
    if (typeof window !== "undefined") {
        try {
            user = JSON.parse(localStorage.getItem("user"));
            if (user && user.name) {
                firstLetter = user.name.charAt(0).toUpperCase();
            }
        } catch {}
    }
    const [showDropdown, setShowDropdown] = useState(false);
    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

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
                    <input 
                        type="text" 
                        placeholder={searchPlaceholder} 
                        className="search-box"
                    />
                    <button className="search-btn">
                        <img src="/images/search.svg" alt="search" />
                    </button>
                </div>
                <div className="nav-icons">
                    <div style={{position: 'relative'}}>
                        <Link className="icon-btn" to="/login" title="login">
                            <img src="/images/log.svg" alt="login" />
                        </Link>
                        {user && showDropdown && (
                            <div className="user-dropdown" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)} style={{left: 0}}>
                                <div className="user-dropdown-name">{user.name}</div>
                                <button className="user-dropdown-logout" onClick={e => { e.stopPropagation(); handleLogout(); }}>Logout</button>
                            </div>
                        )}
                        {user && (
                            <div
                                className="login-dropdown-trigger"
                                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 2, background: 'transparent'}}
                                onMouseEnter={() => setShowDropdown(true)}
                                onMouseLeave={() => setShowDropdown(false)}
                                onClick={e => e.stopPropagation()}
                            />
                        )}
                    </div>
                    <button className="icon-btn" title="location">
                        <img src="/images/loc.svg" alt="location" />
                    </button>
                    <button className="icon-btn" title="wishlist">
                        <img src="/images/fav.svg" alt="wishlist" />
                    </button>
                    <button className="icon-btn" title="cart">
                        <Link className="icon-btn" to="/cart" title="cart">
                            <img src="/images/cart.svg" alt="cart" />
                        </Link>
                    </button>
                </div>
            </div>

            <nav className="navbar">
                <ul className="nav-menu">


                    <li><Link to="/category/men">Men</Link></li>
                    <li><Link to="/category/women">Women</Link></li>
                    <li><Link to="/category/kids">Kids</Link></li>
                    <li><Link to="/category/footwear">Footwear</Link></li>
                    <li><Link to="/category/innerwear">Innerwear</Link></li>
                    <li><Link to="/category/accessories">Accessories</Link></li>
                    <li><Link to="/category/winterwear">Winterwear</Link></li>
                    <li><Link to="/category/brands">Brands</Link></li>
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