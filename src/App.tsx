import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Products = lazy(() => import("./pages/Products").then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then(m => ({ default: m.ProductDetail })));
const CartCheckout = lazy(() => import("./pages/CartCheckout").then(m => ({ default: m.CartCheckout })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));

export function App() {
  const location = useLocation();
  const showFooter = !["/login", "/register"].includes(location.pathname);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10854F] border-t-transparent"></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartCheckout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Suspense>
      
      {showFooter && <Footer />}
    </main>
  );
}
