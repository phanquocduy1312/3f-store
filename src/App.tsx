import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { CartCheckout } from "./pages/CartCheckout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export function App() {
  const location = useLocation();
  const showFooter = !["/login", "/register"].includes(location.pathname);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartCheckout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      
      {showFooter && <Footer />}
    </main>
  );
}
