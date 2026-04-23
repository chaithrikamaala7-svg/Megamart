import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./CategoryProducts.css";

function CategoryProducts() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = useMemo(
    () => ({
      men: "Men",
      women: "Women",
      kids: "Kids",
      footwear: "Footwear",
      innerwear: "Innerwear",
      accessories: "Accessories",
      winterwear: "Winterwear",
      brands: "Brands",
    }),
    []
  );

  const categoryLabel = categories[categoryId] || "";

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/products");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch products");

        const allProducts = Array.isArray(data) ? data : [];
        const filtered = allProducts.filter(
          (p) => String(p.category || "").trim().toLowerCase() === categoryLabel.toLowerCase()
        );
        setProducts(filtered);
      } catch (err) {
        setError(err.message || "Could not load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (categoryLabel) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
      setError("Invalid category");
    }
  }, [categoryLabel]);

  function getImageUrl(imageUrl) {
    if (!imageUrl) return "/images/head.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/uploads")) return `http://localhost:3001${imageUrl}`;
    return imageUrl;
  }

  return (
    <div className="category-page">
      <div className="category-container">
        <h2>{categoryLabel || "Category"}</h2>

        {loading && <p className="category-state">Loading products...</p>}
        {error && <p className="category-state category-error">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="category-state">No products found in this category.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="category-products-grid">
            {products.map((product) => (
              <div className="category-product-card" key={product._id || product.id}>
                <img src={getImageUrl(product.imageUrl)} alt={product.name} />
                <p className="category-product-name">{product.name}</p>
                <p className="category-product-price">Rs. {product.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProducts;
