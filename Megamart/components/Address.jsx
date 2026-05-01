import React, { useState } from "react";
import Payment from "./Payment";

const Address = () => {
  const [address, setAddress] = useState({
    name: "",
    mobile: "",
    email: "",
    house: "",
    street: "",
    city: "",
    pincode: "",
    state: ""
  });

  // Removed emailError, sending, successMsg state for PDF button

  const handleAddressChange = (key, value) => {
    const next = { ...address, [key]: value };
    setAddress(next);
    localStorage.setItem("checkout_address", JSON.stringify(next));
  };

  // Removed validateEmail and handleSendPdf (PDF is sent after payment)

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let subtotal = 0;
  let gstTotal = 0;
  cart.forEach(item => {
    const price = item.price * (item.quantity || 1);
    subtotal += price;
    let gstRate = 0.01; 
    gstTotal += price * gstRate;
  });
  const delivery = 0; // Free delivery
  const grandTotal = subtotal + gstTotal + delivery;

  return (
    <div className="address-page" style={{ minHeight: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", background: "#f9f9f9", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ textAlign: "center", marginBottom: 18 }}>Shipping Address</h2>
        <form
          style={{ width: "100%", margin: "0 auto 24px auto", display: "flex", flexDirection: "column", gap: 10 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <input type="text" placeholder="Full Name" value={address.name} onChange={e => handleAddressChange("name", e.target.value)} style={{ padding: 8 }} required />
          <input type="tel" placeholder="Mobile Number" value={address.mobile} onChange={e => handleAddressChange("mobile", e.target.value)} style={{ padding: 8 }} required />
          <input type="email" placeholder="Email Address" value={address.email || ""} onChange={e => handleAddressChange("email", e.target.value)} style={{ padding: 8 }} required />
          <input type="text" placeholder="House/Flat No." value={address.house} onChange={e => handleAddressChange("house", e.target.value)} style={{ padding: 8 }} required />
          <input type="text" placeholder="Street/Area" value={address.street} onChange={e => handleAddressChange("street", e.target.value)} style={{ padding: 8 }} required />
          <input type="text" placeholder="City" value={address.city} onChange={e => handleAddressChange("city", e.target.value)} style={{ padding: 8 }} required />
          <input type="text" placeholder="Pincode" value={address.pincode} onChange={e => handleAddressChange("pincode", e.target.value)} style={{ padding: 8 }} required />
          <input type="text" placeholder="State" value={address.state} onChange={e => handleAddressChange("state", e.target.value)} style={{ padding: 8 }} required />
        </form>

        {/* Bill summary */}
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px #0001", padding: 16, margin: "18px 0 18px 0", width: "100%" }}>
          <h3 style={{ margin: "0 0 10px 0", textAlign: "center" }}>Bill Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Tax</span>
            <span>₹{gstTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Delivery</span>
            <span style={{ color: "green" }}>Free</span>
          </div>
          <hr style={{ margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 18 }}>
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment buttons below bill */}
        <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
          <Payment addressOverride={address} hideAddressCard={true} showCheckoutTitle={false} />
        </div>
      </div>
    </div>
  );
};

export default Address;
