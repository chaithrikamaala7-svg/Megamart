import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewProduct.css";


function ViewProduct() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);


  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () =>
       {

      try 
      {
        setLoading(true);
        setError("");

        const res = await fetch("/api/products");

        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } 
      
      catch (err) 
      
      {
        console.error(err);


        setError("Unable to fetch products.");
      } 
      
      finally 
      {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) 
    {
    return (
      <div className="view-product-container">
       
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) 
    {
    return (
      <div className="view-product-container">
       
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (products.length === 0) 
    {
    return (
      <div className="view-product-container">
       
        <p>No products found. Try adding one first.</p>
      </div>
    );
  }

  const handleEdit = (product) => {
    navigate("/AddProduct", { state: { product } });
  };

  const handleDelete = async (id) =>
    
    {
    if (!window.confirm("Delete this product?")) return;
    try 
    {
      setDeletingId(id);
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let message = "Failed to delete";


        try 
        {
          const data = await res.json();
          message = data.error || message;
        } 
        
        catch {}
        throw new Error(message);
      }



      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err) 
    
    {
      console.error(err);
      alert(err.message || "Could not delete product");
    } 
    


    finally 
    {
      setDeletingId(null);
    }
  };

  return (
    <div className="view-product-container">

      <h2>View Products</h2>

      <div className="manage-table">

        <div className="manage-header">


          <span>Image</span>
          <span>Name</span>
          <span>Price</span>
          <span>Category</span>
          <span>Description</span>
          <span>Actions</span>
        </div>


        {
        
        products.map((product) => {
          const id = product._id || product.id;
          const busy = deletingId === id;
          const imageSrc =
            product.imageUrl && product.imageUrl.startsWith("/uploads")
              ? `http://localhost:3001${product.imageUrl}`
              : product.imageUrl || "";

          
          
              return (
            <div key={id} className="manage-row">
              <div className="manage-cell">
                {imageSrc ? (
                  <img src={imageSrc} alt={product.name} className="manage-thumb" />
                ) : (
                  <span className="no-image">No Image</span>
                )}
              </div>


              <div className="manage-cell">{product.name}</div>
              <div className="manage-cell">₹ {product.price}</div>
              <div className="manage-cell">{product.category}</div>
              <div className="manage-cell manage-description">{product.description}</div>
              <div className="manage-cell manage-actions">
                
                
                <button className="btn-submit"
                  style={{ padding: "6px 12px" }} onClick={() => handleEdit(product)} disabled={busy}>Edit
                </button>


                <button className="btn-submit"style={{ padding: "6px 12px", backgroundColor: "#dc3545", marginLeft: "8px" }} onClick={() => handleDelete(id)} disabled={busy}>
                 
                 
                  {busy ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ViewProduct;

