import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PetAdvisorPopup } from "@/components/pet-advisor/PetAdvisorPopup";

const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Products = lazy(() => import("./pages/Products").then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then(m => ({ default: m.ProductDetail })));
const CartCheckout = lazy(() => import("./pages/CartCheckout").then(m => ({ default: m.CartCheckout })));
const Login = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const AdminDashboard = lazy(() => import("./pages/admin/admin-dashboard").then(m => ({ default: m.AdminDashboard })));
const ShopeeRequestsPage = lazy(() => import("./pages/admin/ShopeeRequestsPage"));
const LoyaltySettingsPage = lazy(() => import("./pages/admin/LoyaltySettingsPage"));
const ThreeFClubPage = lazy(() => import("./pages/admin/ThreeFClubPage"));
const CustomerLoyaltyPage = lazy(() => import("./pages/admin/CustomerLoyaltyPage"));
const CustomerRewardsPage = lazy(() => import("./pages/client/CustomerRewardsPage"));

export function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showHeader = !isAdminRoute;
  const showFooter = !["/login", "/register"].includes(location.pathname) && !isAdminRoute;

  useEffect(() => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, location.search]);

  // Prevent browser from restoring scroll position
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {showHeader && <Header />}

      <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent"></div></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartCheckout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/shopee-requests" element={<ShopeeRequestsPage />} />
          <Route path="/admin/loyalty-settings" element={<LoyaltySettingsPage />} />
          <Route path="/admin/3f-club" element={<ThreeFClubPage />} />
          <Route path="/admin/customers/:id/loyalty" element={<CustomerLoyaltyPage />} />
          <Route path="/3f-club/rewards" element={<CustomerRewardsPage />} />
        </Routes>
      </Suspense>
      
      {showFooter && <Footer />}
      {!isAdminRoute && <PetAdvisorPopup />}
    </main>
  );
}
