import "./Footer.css";

function Footer() {
  return (
    <footer>
      <div className="col1">
        <p>MORE ABOUT ONLINE SHOPPING AT MEGAMART</p>
        <span className="arrow">⬇</span>
      </div>
      <div className="col2">
        <img src="/images/us_polo.png" alt="us polo" />
        <img src="/images/arrow.jpg" alt="arrow" />
        <img src="/images/tommy.jpg" alt="tommy" />
        <img src="/images/cavlin.png" alt="cavlin" />
        <img src="/images/fly.png" alt="fly" />
        <img src="/images/download.png" alt="ad" />
      </div>
      <div className="col3">
        <p>
          <strong>CONNECT WITH US</strong>
          <br />
          Be the first to know about new products, exclusive collections, latest trends and more
        </p>
        <br />
        <input type="text" placeholder="Enter your email address" className="email-input" />
        <button className="subscribe-btn">Subscribe</button>
        <br />
        <br />
        <input type="checkbox" id="terms" name="terms" value="terms" />
        <label htmlFor="terms">
          I agree to recieve marketing emails/SMS/texts and have read and accepted the{" "}
          <b>
            <u>Terms & Conditions</u>
          </b>{" "}
          and{" "}
          <b>
            <u>Privacy Policy</u>
          </b>
        </label>
        <br />
      </div>
      <div className="col4">
        <img src="/images/dress.svg" alt="dress" />
        <img src="/images/return.svg" alt="return" />
        <img src="/images/shipping.svg" alt="shipping" />
      </div>
      <div className="col5">
        <div className="categories">
          <h3>Top Categories</h3>
          <p>Men</p>
          <p>Women</p>
          <p>Kids</p>
          <p>Footwear</p>
          <p>Accessories</p>
        </div>
        <div className="brands">
          <h3>Top Brands</h3>
          <p>US Polo Assn</p>
          <p>Arrow</p>
          <p>Flying Machine</p>
          <p>Tommy Hilfiger</p>
          <p>Calvin Klein</p>
          <p>AD by Aravind</p>
        </div>
        <div className="links">
          <h3>Useful Links</h3>
          <p>About Us</p>
          <p>Privacy Policy</p>
          <p>Terms & Conditions</p>
          <p>returns and cancellation policy</p>
          <p>help and FAQ'S</p>
          <p>Delivery and Shipping Policy</p>
          <p>Site Map</p>
        </div>
        <div className="contact">
          <h3>Contact Us</h3>
          <p>+91-9740542174</p>
          <a href="mailto:care@megamartfashions.com">care@megamartfashions.com</a>
          <p>Message Us</p>
        </div>
        <div className="app">
          <h3>Download App</h3>
          <div className="app-buttons">
            <img src="/images/apps.png" alt="App Store" className="app-badge" />
          </div>
          <h3 style={{ marginTop: "18px" }}>Follow Us</h3>
          <div className="social-icons">
            <a href="#" className="social-icon">
              <img src="/images/icons8-instagram-logo-50.png" alt="instagram" />
            </a>
            <a href="#" className="social-icon">
              <img src="/images/icons8-youtube-50.png" alt="youtube" />
            </a>
            <a href="#" className="social-icon">
              <img src="/images/icons8-x-30.png" alt="x" />
            </a>
            <a href="#" className="social-icon">
              <img src="/images/icons8-facebook-50.png" alt="facebook" />
            </a>
          </div>
        </div>
      </div>
      <div className="col6">
        <p>&copy; 2025 Megamart. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
