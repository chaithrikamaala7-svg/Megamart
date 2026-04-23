
import React from "react";
import { useCart } from "./CartContext";
import "./Cart.css";

function Cart() {
    const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
    const [checkoutMsg, setCheckoutMsg] = React.useState("");

    const changeQuantity = (productId, delta) => {
        updateQuantity(productId, delta);
    };

    const removeItem = (productId) => {
        removeFromCart(productId);
    };

    const instantCheckout = () => {
        clearCart();
        setCheckoutMsg("Order placed! (Demo only, not saved)");
    };

    const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    if (cartItems.length === 0) {
        return <div className="cart-empty">Your cart is empty.</div>;
    }
    return (
        <div className="cart-modern-outer">
            <div className="cart-modern-container">
                {cartItems.map((item) => {
                    const imageSrc = item.imageUrl && item.imageUrl.startsWith("/uploads")
                        ? `http://localhost:3001${item.imageUrl}`
                        : item.imageUrl || item.image || "";
                    return (
                        <div className="cart-modern-box" key={item._id || item.id}>
                            <div className="cart-modern-imagebox">
                                {imageSrc ? (
                                    <img src={imageSrc} alt={item.name} className="cart-modern-image" />
                                ) : (
                                    <span className="cart-modern-noimage">No Image</span>
                                )}
                            </div>
                            <div className="cart-modern-title">{item.name}</div>
                            <div className="cart-modern-price">₹ {item.price}</div>
                            <div className="cart-modern-quantity">
                                <button onClick={() => changeQuantity(item._id || item.id, -1)}>-</button>
                                <span>{item.quantity || 1}</span>
                                <button onClick={() => changeQuantity(item._id || item.id, 1)}>+</button>
                            </div>
                            <button className="cart-modern-remove" onClick={() => removeItem(item._id || item.id)}>Remove</button>
                        </div>
                    );
                })}
                <div className="cart-modern-total-box">
                    <div className="cart-modern-total-label">Total:</div>
                    <div className="cart-modern-total-value">₹ <span style={{ color: 'green', fontSize: '2rem', fontWeight: 'bold' }}>{total}</span></div>
                    <button className="cart-modern-checkout" onClick={instantCheckout}>Instant Checkout</button>
                    {checkoutMsg && <div className="cart-modern-checkout-msg">{checkoutMsg}</div>}
                </div>
            </div>
        </div>
    );
}

export default Cart;