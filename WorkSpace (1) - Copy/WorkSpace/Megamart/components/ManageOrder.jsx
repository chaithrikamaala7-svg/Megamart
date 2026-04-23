import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Cart.css";

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3001/api/orders")
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="cart-modern-outer">
      <h2>Manage Orders</h2>
      <div className="cart-modern-container">
        {orders.length === 0 && <div>No orders found.</div>}
        {orders.map(order => (
          <div className="cart-modern-box" key={order._id}>
            <div className="cart-modern-info">
              <div><b>User:</b> {order.userId?.name} ({order.userId?.username})</div>
              <div><b>Mobile:</b> {order.userId?.mobilenumber}</div>
              <div><b>Date:</b> {new Date(order.date).toLocaleString()}</div>
              <div><b>Status:</b> {order.status}</div>
              <div><b>Total:</b> ₹ {order.totalAmount}</div>
              <div><b>Products:</b>
                <ul>
                  {order.products.map((p, idx) => (
                    <li key={idx}>{p.name} x {p.quantity} (₹{p.price})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageOrder;
