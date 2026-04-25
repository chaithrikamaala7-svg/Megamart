import React, { useState } from "react";
import Payment from "./Payment";

const Address = () => {
  const [address, setAddress] = useState({ line1: "", city: "", pincode: "", state: "" });
  const handleAddressChange = (key, value) => {
    const next = { ...address, [key]: value };
    setAddress(next);
    localStorage.setItem("checkout_address", JSON.stringify(next));
  };

  return (
    <div className="address-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 12px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 12 }}>Shipping Address</h2>
      <form
        style={{ width: "100%", maxWidth: 420, margin: "0 auto 24px auto" }}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          placeholder="Address Line 1"
          value={address.line1}
          onChange={(e) => handleAddressChange("line1", e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          placeholder="City"
          value={address.city}
          onChange={(e) => handleAddressChange("city", e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          placeholder="Pincode"
          value={address.pincode}
          onChange={(e) => handleAddressChange("pincode", e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="text"
          placeholder="State"
          value={address.state}
          onChange={(e) => handleAddressChange("state", e.target.value)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
      </form>
      <div style={{ width: "100%", maxWidth: 980, margin: "0 auto" }}>
        <Payment addressOverride={address} hideAddressCard={true} showCheckoutTitle={false} />
      </div>
    </div>
  );
};

export default Address;
