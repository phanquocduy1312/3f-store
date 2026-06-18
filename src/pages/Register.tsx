import { useState, useEffect } from "react";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { SocialLogins } from "@/components/Auth/SocialLogins";
import { PhoneAuthForm } from "@/components/Auth/PhoneAuthForm";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";

export function Register() {
  const [authMode, setAuthMode] = useState<"email" | "phone">("email");
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useCustomerAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "phone") setAuthMode("phone");
  }, [location]);

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSuccess = () => navigate("/", { replace: true });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white flex flex-col lg:grid lg:grid-cols-12">
      {/* Left Column - Form Area */}
      <div className="flex-1 lg:col-span-7 xl:col-span-6 flex flex-col justify-center px-4 sm:px-12 lg:px-20 xl:px-24 py-10">
        <div className="w-full max-w-[440px] mx-auto space-y-6">
          
          {authMode === "email" ? (
            <>
              {/* Header */}
              <div className="space-y-3">
                <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition">
                  <ArrowLeft size={14} /> Quay lại trang chủ
                </Link>
                <h1 className="text-3xl font-black text-ink tracking-tight">Đăng ký thành viên</h1>
                <p className="text-sm font-semibold text-ink/50">
                  Nhận ngay ưu đãi 15% cho đơn hàng đầu tiên của bạn!
                </p>
                <button onClick={() => setAuthMode("phone")}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:text-forest-dark transition pt-1">
                  <Phone size={14} /> Đăng ký bằng số điện thoại
                </button>
              </div>

              <RegisterForm onSuccess={handleSuccess} />
              <SocialLogins label="Hoặc đăng ký bằng" />

              <div className="text-center pt-2">
                <p className="text-sm font-semibold text-ink/60">
                  Bạn đã có tài khoản?{" "}
                  <Link to="/login" className="font-bold text-forest hover:underline transition">Đăng nhập ngay</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-0">
                <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition">
                  <ArrowLeft size={14} /> Quay lại trang chủ
                </Link>
              </div>
              <PhoneAuthForm
                context="register"
                onSwitchToEmail={() => setAuthMode("email")}
                onSuccess={handleSuccess}
              />
            </>
          )}

        </div>
      </div>

      {/* Right Column - Banner */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative bg-forest-darker overflow-hidden flex-col justify-end p-12 xl:p-16 text-white">
        <div className="absolute inset-0 opacity-45 z-0">
          <img src="/assets/images/auth-banner.webp" alt="3F Store Brand Banner" className="w-full h-full object-cover scale-105" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-forest-darker/95 via-forest-darker/40 to-transparent z-10" />
        <div className="relative z-20 space-y-4">
          <span className="inline-block px-3 py-1 bg-forest/35 backdrop-blur-md border border-white/10 rounded-full text-xs font-black uppercase tracking-wider text-honey">
            Premium Pet Shop
          </span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Chăm sóc boss yêu <br /> bằng cả tình yêu thương
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm font-medium">
            Tạo tài khoản thành viên để tận hưởng dịch vụ giao hàng nhanh, tích lũy điểm thưởng và nhận các cẩm nang chăm sóc thú cưng hữu ích.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
