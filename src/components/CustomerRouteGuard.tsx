import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";

export function CustomerRouteGuard() {
  const { isLoggedIn, isLoading } = useCustomerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent"></div>
          <p className="text-xs font-bold text-gray-500">Đang tải tài khoản...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Redirect to login with redirect path
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return <Outlet />;
}
export default CustomerRouteGuard;
