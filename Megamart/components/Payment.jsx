import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_BASE_URL = String(
  import.meta.env.VITE_API_BASE_URL || "https://megamart-backend-yj46.onrender.com"
).replace(/\/$/, "");

const apiUrl = (path) => `${BACKEND_BASE_URL}${path}`;

// Razorpay script loader
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [address] = useState(() => {
    const saved = localStorage.getItem("checkout_address");
    return saved ? JSON.parse(saved) : { line1: "", city: "", pincode: "", state: "" };
  });
  const [addressError, setAddressError] = useState("");
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const customerName = user?.name || "";
  const customerEmail = user?.username || "";
  const customerMobile = user?.mobilenumber || "";
  const userId = user?._id || user?.id || "";

  const addressFilled = address.line1 && address.city && address.pincode && address.state;

  const handlePay = async (method) => {
    setSelectedPayment(method);
    setError("");
    if (!addressFilled) {
      setAddressError("Please fill all address fields.");
      return;
    }
    if (!cart.length) {
      setError("Cart is empty");
      return;
    }
    if (method === "cod") {
      try {
        setIsPaying(true);
        const res = await fetch(apiUrl("/api/orders"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId || undefined,
            customerName,
            customerEmail,
            customerMobile,
            items: cart,
            total,
            paymentMethod: "cod",
            payment: { method: "COD", status: "Pending", reference: "COD" },
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to place COD order");
        }
      } catch (err) {
        setError(err.message || "Failed to place COD order");
        setIsPaying(false);
        return;
      }
      localStorage.removeItem("cart");
      navigate("/home");
      setIsPaying(false);
      return;
    }

    // ✅ ONLINE PAYMENT FLOW (Razorpay for card, upi, netbanking)
    setIsPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const keyRes = await fetch(apiUrl("/api/payments/public-key"));
      const keyData = await keyRes.json().catch(() => ({}));
      if (!keyRes.ok || !keyData.success || !keyData.key) {
        throw new Error(keyData.error || "Razorpay key not available");
      }

      const orderRes = await fetch(apiUrl("/api/payments/create-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      let rpOrder;
      try {
        rpOrder = await orderRes.json();
      } catch (err) {
        const text = await orderRes.text();
        console.error("Server returned non-JSON:", text);
        throw new Error("Invalid server response");
      }

      if (!orderRes.ok || !rpOrder.id) {
        throw new Error(rpOrder.error || "Order creation failed");
      }

      const options = {
        key: keyData.key,
        amount: rpOrder.amount,
        currency: "INR",
        name: "Megamart",
        description: "Order Payment (Test UPI: success@razorpay)",
        order_id: rpOrder.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(apiUrl("/api/payments/verify"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            const placeRes = await fetch(apiUrl("/api/orders"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userId || undefined,
                customerName,
                customerEmail,
                customerMobile,
                items: cart,
                total,
                paymentMethod: method,
                payment: {
                  method: method.toUpperCase(),
                  status: "Paid",
                  reference: response.razorpay_payment_id,
                },
              }),
            });
            if (!placeRes.ok) {
              const data = await placeRes.json().catch(() => ({}));
              throw new Error(data.error || "Failed to save order after payment");
            }

            localStorage.removeItem("cart");
            navigate("/home");
          } catch (handlerErr) {
            setError(handlerErr.message || "Payment completed, but order save failed");
          } finally {
            setIsPaying(false);
          }
        },
        prefill: {
          name: customerName || "Customer",
          email: customerEmail || "",
          contact: customerMobile || "",
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [
                  { method: "upi" }
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        notes: {
          dummy_upi_id: "success@razorpay",
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="payment-page">
      <h2>Checkout</h2>
      <div style={{width:'100%',maxWidth:400,margin:'16px auto',padding:16,border:'1px solid #eee',borderRadius:8}}>
        <div style={{marginBottom:8}}><b>Address:</b></div>
        <div style={{marginBottom:4}}>{address.line1}</div>
        <div style={{marginBottom:4}}>{address.city}, {address.state} - {address.pincode}</div>
        {addressError && <div style={{ color: 'red', marginTop: 8 }}>{addressError}</div>}
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <button
            className={`cart-modern-checkout${selectedPayment === "upi" ? " launching" : ""}`}
            style={{ background: selectedPayment === "upi" ? "#2962ff" : "#eee", color: selectedPayment === "upi" ? "#fff" : "#222" }}
            onClick={() => handlePay("upi")}
            disabled={isPaying}
          >
            Pay with UPI
          </button>
          <button
            className={`cart-modern-checkout${selectedPayment === "card" ? " launching" : ""}`}
            style={{ background: selectedPayment === "card" ? "#2962ff" : "#eee", color: selectedPayment === "card" ? "#fff" : "#222" }}
            onClick={() => handlePay("card")}
            disabled={isPaying}
          >
            Pay with Card
          </button>
          <button
            className={`cart-modern-checkout${selectedPayment === "netbanking" ? " launching" : ""}`}
            style={{ background: selectedPayment === "netbanking" ? "#2962ff" : "#eee", color: selectedPayment === "netbanking" ? "#fff" : "#222" }}
            onClick={() => handlePay("netbanking")}
            disabled={isPaying}
          >
            Net Banking
          </button>
          <button
            className={`cart-modern-checkout${selectedPayment === "cod" ? " launching" : ""}`}
            style={{ background: selectedPayment === "cod" ? "#2962ff" : "#eee", color: selectedPayment === "cod" ? "#fff" : "#222" }}
            onClick={() => handlePay("cod")}
            disabled={isPaying}
          >
            Cash on Delivery
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
};

export default Payment;
