import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../components/apiBase";
import { useLocation, useNavigate } from "react-router-dom";
import "./AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingProduct = location.state && location.state.product ? location.state.product : null;

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!editingProduct;

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        price: editingProduct.price || "",
        category: editingProduct.category || "",
        description: editingProduct.description || "",
      });
      if (editingProduct.imageUrl) {
        // Use API_BASE_URL for image URLs
        const fullUrl = editingProduct.imageUrl.startsWith("/uploads")
          ? `${API_BASE_URL}${editingProduct.imageUrl}`
          : editingProduct.imageUrl;
        setPreviewUrl(fullUrl);
      }
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("price", formData.price);
      payload.append("category", formData.category);
      payload.append("description", formData.description);
      if (imageFile) {
        payload.append("image", imageFile);
      }
      const apiUrl = isEditMode
        ? `/api/products/${editingProduct._id || editingProduct.id}`
        : "/api/products";
      const response = await fetch(apiUrl, {
        method: isEditMode ? "PUT" : "POST",
        body: payload,
      });
      if (!response.ok) {
        let message = isEditMode ? "Failed to update product" : "Failed to add product";
        try {
          const data = await response.json();
          message = data.error || message;
        } catch {}
        throw new Error(message);
      }
      alert(isEditMode ? "Product updated successfully" : "Add product successfully");
      if (isEditMode) {
        navigate("/ViewProduct");
      } else {
        setFormData({ name: "", price: "", category: "", description: "" });
        setImageFile(null);
        setPreviewUrl("");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong while adding the product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <h2>{isEditMode ? "Edit Product" : "Add Product"}</h2>
        <form className="add-product-form" onSubmit={handleSubmit}>
          <div className="form-group">
           
            <label htmlFor="name">Product Name</label>
            <input id="name"  type="text"  name="name" value={formData.name} onChange={handleChange}placeholder="Enter product name" required  />
        
          </div>
        
        
          <div className="form-group">
            <label htmlFor="price">Price</label>
            
            <input id="price" type="number"  name="price" value={formData.price} onChange={handleChange} placeholder="Enter price" required min="0" step="0.01"/>
          </div>



          <div className="form-group">
            <label htmlFor="category">Category</label>
           
           
            <select id="category" name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Footwear">Footwear</option>
              <option value="Innerwear">Innerwear</option>
              <option value="Accessories">Accessories</option>
              <option value="Winterwear">Winterwear</option>
              <option value="Brands">Brands</option>
          
          
            </select>
          </div>
          
          
          <div className="form-group">
            <label htmlFor="image">Image {isEditMode ? "(optional to change)" : ""}</label>
            <input id="image" type="file" accept="image/*" onChange={handleImageChange} required={!isEditMode} />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
        
          </div>
        
        
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description"   name="description"  value={formData.description} onChange={handleChange} placeholder="Enter product description"  rows="3"  />
          </div>
          
          
          
          <button type="submit" className="btn-submit" disabled={submitting}>{submitting ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update" : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
