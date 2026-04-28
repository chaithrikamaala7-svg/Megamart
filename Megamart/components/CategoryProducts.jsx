import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CategoryProducts.css";
import { apiUrl, assetUrl } from "./apiBase";
import { subcategories } from "./subcategories";

function CategoryProducts() {
  const { categoryId, subcategorySlug } = useParams();
  const navigate = useNavigate();
  const [allCategoryProducts, setAllCategoryProducts] = useState([]);
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

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function toSlug(value) {
    return normalizeText(value).replace(/\s+/g, "-");
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(apiUrl("/api/products"));
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch products");
        const allProducts = Array.isArray(data) ? data : [];
        const filteredByCategory = allProducts.filter(
          (p) => normalizeText(p.category) === normalizeText(categoryLabel)
        );
        const filtered = subcategorySlug
          ? filteredByCategory.filter(
              (p) => toSlug(p.subcategory) === normalizeText(subcategorySlug)
            )
          : filteredByCategory;
        setAllCategoryProducts(filteredByCategory);
        setProducts(filtered);
      } catch (err) {
        setError(err.message || "Could not load products");
        setAllCategoryProducts([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    if (categoryLabel) {
      fetchProducts();
    } else {
      setAllCategoryProducts([]);
      setProducts([]);
      setLoading(false);
      setError("Invalid category");
    }
  }, [categoryLabel, subcategorySlug]);

  function getImageUrl(imageUrl) {
    if (!imageUrl) return "/images/head.png";
    return assetUrl(imageUrl);
  }

  function handleShopNow(id) {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {}
    if (!user) {
      alert("Login first");
      return;
    }
    navigate(`/product/${id}`);
  }

  // Get subcategories for this category
  // Show subcategories in the order they are in the array (first added = first shown)
  const subcats = (subcategories[categoryId?.toLowerCase()] || []).slice();
  const subcatsWithImage = useMemo(
    () =>
      subcats.map((sub) => {
        const matchingProducts = allCategoryProducts.filter(
          (product) =>
            normalizeText(product.subcategory) === normalizeText(sub.name) &&
            Boolean(product.imageUrl)
        );

        const firstAddedProduct = matchingProducts.reduce((oldest, current) => {
          if (!oldest) return current;
          const oldestTime = Number(new Date(oldest.createdAt));
          const currentTime = Number(new Date(current.createdAt));
          if (!Number.isFinite(oldestTime)) return current;
          if (!Number.isFinite(currentTime)) return oldest;
          return currentTime < oldestTime ? current : oldest;
        }, null);

        return {
          ...sub,
          displayImage: firstAddedProduct?.imageUrl
            ? getImageUrl(firstAddedProduct.imageUrl)
            : sub.img,
        };
      }),
    [allCategoryProducts, subcats]
  );
  const selectedSubcategory = subcatsWithImage.find(
    (sub) => toSlug(sub.name) === normalizeText(subcategorySlug)
  );

  return (
    <div className="category-page">
      <div className="category-container">
        {/* Animated section heading */}
        <div className="category-animated-heading">
          <span className="category-animated-text">{categoryLabel || "Category"} Section</span>
        </div>
        {selectedSubcategory && (
          <div className="category-subcat-hero">
            <img
              src={selectedSubcategory.displayImage}
              alt={selectedSubcategory.name}
              className="category-subcat-hero-img"
            />
          </div>
        )}
        {/* Subcategory images row */}
        {!subcategorySlug && subcatsWithImage.length > 0 && (
          <div className="category-subcat-row">
            {subcatsWithImage.map((sub) => (
              <div
                key={sub.name}
                className="category-subcat-card"
                onClick={() => navigate(`/category/${categoryId}/${sub.name.toLowerCase().replace(/\s+/g, "-")}`)}
                style={{cursor:'pointer'}}
              >
                <img src={sub.displayImage} alt={sub.name} className="category-subcat-img" />
                <div className="category-subcat-label">{sub.name}</div>
              </div>
            ))}
          </div>
        )}
        {/* Products grid below subcategories */}
        {loading && <p className="category-state">Loading products...</p>}
        {error && <p className="category-state category-error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="category-state">No products found in this category.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="category-products-grid">
            {products.map((product) => {
              const id = product._id || product.id;
              return (
              <div className="category-product-card" key={id}>
                <img src={getImageUrl(product.imageUrl)} alt={product.name} />
                <p className="category-product-name">{product.name}</p>
                <p className="category-product-price">Rs. {product.price}</p>
                <button className="category-shop-btn" onClick={() => handleShopNow(id)}>
                  Shop Now
                </button>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryProducts;
