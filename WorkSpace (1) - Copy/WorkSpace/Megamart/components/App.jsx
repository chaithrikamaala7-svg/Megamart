import React from "react";
import { CartProvider } from "./CartContext";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";


import Header from "./Header";
import Footer from "./Footer";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import AdminLogin from "../Admin/AdminLogin";
import Dashboard from "../Admin/Dashboard";
import AddProduct from "../Admin/AddProduct";
import ViewProduct from "../Admin/ViewProduct";
import ManageUser from "../Admin/ManageUser";   
import CategoryProducts from "./CategoryProducts";
import SingleProduct from "./SingleProduct";
import Cart from "./Cart";
import ManageOrder from "./ManageOrder";


function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/" || pathname.toLowerCase() === "/home";
  return (
    <>
      {isHome && <Header />}
      <Outlet />
      {isHome && <Footer />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="admin" element={<AdminLogin />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="AddProduct" element={<AddProduct />} />
            <Route path="ViewProduct" element={<ViewProduct />} />
            <Route path="ManageUser" element={<ManageUser />} />
            <Route path="ManageOrder" element={<ManageOrder />} />
            <Route path="category/:categoryId" element={<CategoryProducts />} />
            <Route path="product/:productId" element={<SingleProduct />} />
            <Route path="cart" element={<Cart />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;