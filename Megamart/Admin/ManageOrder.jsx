import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageOrder.css";

function emailLabel(code) {
  if (code === "sent") return "Sent";
  if (code === "failed") return "Failed";
  return "Skipped";
}

function ManageOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState({});

  useEffect(() => {
    axios
      .get("/api/orders")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating((s) => ({ ...s, [orderId]: true }));
    try {
      const { data } = await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? data : order)));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Could not update status");
    } finally {
      setStatusUpdating((s) => ({ ...s, [orderId]: false }));
    }
  };

  const handleRemoveOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to remove this order?")) return;
    await axios.delete(`/api/orders/${orderId}`);
    setOrders((orders) => orders.filter((order) => order._id !== orderId));
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="manageorder-outer-center">
      <header className="manageorder-header">Manage Orders</header>
      <div className="cart-modern-container manageorder-container">
        {orders.length === 0 ? (
          <div>No orders found.</div>
        ) : (
          
          
          
          <table className="simple-table manageorder-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Email (checkout)</th>
                <th>Email (status)</th>
                <th>Actions</th>
              </tr>
           
           
            </thead>
            <tbody>
              {orders.map((order) => {
                const p = order.products[0] || {};
                const placed = order.emailOnOrder || "skipped";
                const statusMail = order.emailOnStatus || "skipped";
               
               
                return (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                  
                  
                    <td>
                      <div className="manageorder-product-cell">
                        <span>{p.name}</span>
                      </div>
                    </td>
                  
                  
                    <td>₹ {p.price}</td>
                    <td>x {p.quantity}</td>
                    <td>{new Date(order.date).toLocaleString()}</td>
                    <td>₹ {order.totalAmount}</td>
                    <td>
                      <select  className="manageorder-status-select"  value={order.status}  disabled={statusUpdating[order._id]}  onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                     
                        <option value="Pending">Pending</option>


                        <option value="Order Confirmed">Order Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>

                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <span>{order.paymentStatus || "-"}</span>
                        <span style={{ color: "#777", fontSize: 12 }}>{order.paymentId || ""}</span>
                      </div>
                    </td>
                    <td className="manageorder-email-cell" title={order.emailOnOrderErr || ""}>
                      <span className={`manageorder-email-tag manageorder-email--${placed}`}>
                        {emailLabel(placed)}
                      </span>
                    </td>
                    <td className="manageorder-email-cell" title={order.emailOnStatusErr || ""}>
                      <span className={`manageorder-email-tag manageorder-email--${statusMail}`}>
                        {emailLabel(statusMail)}
                      </span>
                    </td>
                    <td>
                      <button className="manageorder-remove-btn" onClick={() => handleRemoveOrder(order._id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageOrder;
