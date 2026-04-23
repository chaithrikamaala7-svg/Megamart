import React from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      <div className="button-group">
        <button title="Add Product" onClick={() => navigate("/AddProduct")} className="btn" >Add Product</button>
        <button title="View Product" onClick={() => navigate("/ViewProduct")} className="btn">View Product </button>
        <button title="Manage User" onClick={()=> navigate("/ManageUser")} className="btn">Manage User</button>
        <button title="Manage Order" onClick={()=> navigate("/ManageOrder")} className="btn">Manage Order</button>
        <button title="Manage Service" onClick={()=> navigate("/ManageService")} className="btn">Manage Services</button>
      </div>

    </div>
  );
}

export default Dashboard;