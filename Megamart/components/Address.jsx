import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Address = () => {
  const [address, setAddress] = useState({ line1: "", city: "", pincode: "", state: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!address.line1 || !address.city || !address.pincode || !address.state) {
      setError("Please fill all address fields.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    setError("");
    if (!validateForm()) return;
    localStorage.setItem("checkout_address", JSON.stringify(address));
    navigate("/payment");
  };

  return (
    <div className="address-page">
      <h2>Shipping Address</h2>
      <form style={{width:'100%',maxWidth:400,margin:'16px auto'}} onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Address Line 1"
          value={address.line1}
          onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
          style={{width:'100%',marginBottom:8,padding:8}}
        />
        <input
          type="text"
          placeholder="City"
          value={address.city}
          onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
          style={{width:'100%',marginBottom:8,padding:8}}
        />
        <input
          type="text"
          placeholder="Pincode"
          value={address.pincode}
          onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))}
          style={{width:'100%',marginBottom:8,padding:8}}
        />
        <input
          type="text"
          placeholder="State"
          value={address.state}
          onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
          style={{width:'100%',marginBottom:8,padding:8}}
        />
        {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
        <div style={{display:'flex',gap:12,marginTop:16,justifyContent:'center'}}>
          <button type="button" className="cart-modern-checkout" onClick={handleContinue}>
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default Address;
