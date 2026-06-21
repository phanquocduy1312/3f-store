import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PetAdvisorPopup } from "@/components/pet-advisor/PetAdvisorPopup";
import { QuickAddToCartModal } from "@/components/QuickAddToCartModal";
import { Toaster } from "sonner";

const lazyPage = <T extends Record<string, any>>(loader: () => Promise<T>, exportName: string) =>
  lazy(() => loader().then(m => ({ default: m[exportName] ?? m.default })));

const Home = lazyPage(() => import("./pages/Home"), "Home");
const Products = lazyPage(() => import("./pages/Products"), "Products");
const ProductDetail = lazyPage(() => import("./pages/ProductDetail"), "ProductDetail");
const CartCheckout = lazyPage(() => import("./pages/CartCheckout"), "CartCheckout");
const Login = lazyPage(() => import("./pages/Login"), "Login");
const Register = lazyPage(() => import("./pages/Register"), "Register");
const AdminDashboard = lazyPage(() => import("./pages/admin/admin-dashboard"), "AdminDashboard");
const ShopeeRequestsPage = lazy(() => import("./pages/admin/ShopeeRequestsPage"));
const LoyaltySettingsPage = lazy(() => import("./pages/admin/LoyaltySettingsPage"));
const ThreeFClubPage = lazy(() => import("./pages/admin/ThreeFClubPage"));
const AdminWorkflowSettingsPage = lazyPage(() => import("./pages/admin/AdminWorkflowSettingsPage"), "AdminWorkflowSettingsPage");
const CustomerLoyaltyPage = lazy(() => import("./pages/admin/CustomerLoyaltyPage"));
const CustomerRewardsPage = lazy(() => import("./pages/client/CustomerRewardsPage"));
const WishlistPage = lazyPage(() => import("./pages/client/WishlistPage"), "WishlistPage");
const OrderSuccess = lazyPage(() => import("./pages/OrderSuccess"), "OrderSuccess");
const OrderTracking = lazyPage(() => import("./pages/OrderTracking"), "OrderTracking");
const AdminOrdersPage = lazyPage(() => import("./pages/admin/AdminOrdersPage"), "AdminOrdersPage");
const AdminLogin = lazyPage(() => import("./pages/admin/AdminLogin"), "AdminLogin");
const AdminCustomersPage = lazyPage(() => import("./pages/admin/AdminCustomersPage"), "AdminCustomersPage");
const AdminCustomerDetailPage = lazyPage(() => import("./pages/admin/AdminCustomer360Page"), "AdminCustomerDetailPage");

// Admin Product Pages
const AdminProductsPage = lazyPage(() => import("./pages/admin/AdminProductsPage"), "AdminProductsPage");
const AdminProductForm = lazyPage(() => import("./pages/admin/AdminProductForm"), "AdminProductForm");
const AdminCategoriesPage = lazyPage(() => import("./pages/admin/AdminCategoriesPage"), "AdminCategoriesPage");
const AdminBannersPage = lazyPage(() => import("./pages/admin/AdminBannersPage"), "AdminBannersPage");
const AdminNewsPage = lazyPage(() => import("./pages/admin/AdminNewsPage"), "AdminNewsPage");
const BlogList = lazyPage(() => import("./pages/BlogList"), "BlogList");
const BlogDetail = lazyPage(() => import("./pages/BlogDetail"), "BlogDetail");

// Client Account Pages
import { AccountLayout } from "./pages/client/account/AccountShell";
const ProfilePage = lazyPage(() => import("./pages/client/account/ProfilePage"), "ProfilePage");
const OrdersPage = lazyPage(() => import("./pages/client/account/OrdersPage"), "OrdersPage");
const AddressesPage = lazyPage(() => import("./pages/client/account/AddressBookPage"), "AddressesPage");
const PetsPage = lazyPage(() => import("./pages/client/account/PetsPage"), "PetsPage");
const SecurityPage = lazyPage(() => import("./pages/client/account/SecurityPage"), "SecurityPage");

function AdminRouteGuard() {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

function CustomerRouteGuard() {
  const location = useLocation();
  const token = localStorage.getItem("customer_token");
  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  return <Outlet />;
}

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
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tin-tuc" element={<BlogList />} />
          <Route path="/tin-tuc/:slug" element={<BlogDetail />} />
          
          {/* Protected Client Routes */}
          <Route element={<CustomerRouteGuard />}>
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="pets" element={<PetsPage />} />
              <Route path="security" element={<SecurityPage />} />
            </Route>
          </Route>
          
          {/* Public Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminRouteGuard />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/settings/workflows" element={<AdminWorkflowSettingsPage />} />
            <Route path="/admin/shopee-requests" element={<ShopeeRequestsPage />} />
            <Route path="/admin/loyalty-settings" element={<LoyaltySettingsPage />} />
            <Route path="/admin/3f-club" element={<ThreeFClubPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="/admin/customers/:id/loyalty" element={<CustomerLoyaltyPage />} />
            
            {/* Products Management Routes */}
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/products/create" element={<AdminProductForm />} />
            <Route path="/admin/products/:id" element={<AdminProductForm />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/banners" element={<AdminBannersPage />} />
            <Route path="/admin/news" element={<AdminNewsPage />} />
          </Route>

          <Route path="/3f-club/rewards" element={<CustomerRewardsPage />} />
          <Route path="/order-success/:orderCode" element={<OrderSuccess />} />
          <Route path="/orders/:orderCode" element={<OrderTracking />} />
          <Route path="/order-check" element={<OrderTracking />} />
        </Routes>
      </Suspense>
      
      {showFooter && <Footer />}
      {!isAdminRoute && <PetAdvisorPopup />}
      {!isAdminRoute && <QuickAddToCartModal />}

      <Toaster richColors position="top-right" closeButton />
    </main>
  );
}
