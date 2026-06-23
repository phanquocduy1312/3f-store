import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/src/api/productsApi";
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight, PawPrint, Bone } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();

  // If already logged in, redirect to admin orders
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/admin/orders");
    }

    // Set a warm, personalized greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 11) {
      setGreeting("Chào buổi sáng thảnh thơi! ☀️");
    } else if (hour < 14) {
      setGreeting("Ngày mới ngập tràn năng lượng! 🍃");
    } else if (hour < 18) {
      setGreeting("Buổi chiều ấm áp và an yên! ☕");
    } else {
      setGreeting("Buổi tối bình yên bên thú cưng! 🌙");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await adminLogin({ email, password });
      if (response.success && response.data) {
        localStorage.setItem("admin_token", response.data.token);
        localStorage.setItem("admin_user", JSON.stringify(response.data.admin));
        navigate("/admin/orders");
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#FDFBF7] via-[#FCF8F2] to-[#F7F2E8] font-sans text-slate-800">
      {/* Dynamic Keyframes injected locally */}
      <style>{`
        @keyframes float-paw-1 {
          0%, 100% { transform: translateY(0) rotate(-12deg) scale(1); }
          50% { transform: translateY(-12px) rotate(-18deg) scale(1.08); }
        }
        @keyframes float-paw-2 {
          0%, 100% { transform: translateY(0) rotate(45deg) scale(1); }
          50% { transform: translateY(12px) rotate(38deg) scale(0.92); }
        }
        @keyframes float-paw-3 {
          0%, 100% { transform: translateY(0) rotate(15deg) scale(1); }
          50% { transform: translateY(-10px) rotate(8deg) scale(1.04); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          75% { transform: rotate(4deg); }
        }
        .animate-float-1 { animation: float-paw-1 7s ease-in-out infinite; }
        .animate-float-2 { animation: float-paw-2 8s ease-in-out infinite; }
        .animate-float-3 { animation: float-paw-3 6.5s ease-in-out infinite; }
        .hover-wiggle:hover .wiggle-target { animation: wiggle 0.4s ease-in-out infinite; }
      `}</style>

      {/* Warm organic ambient glow blobs */}
      <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[#F59E0B]/5 blur-[90px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-[450px] w-[450px] rounded-full bg-[#ED4546]/5 blur-[110px] pointer-events-none" />
      <div className="absolute left-1/3 top-1/4 h-[350px] w-[350px] rounded-full bg-[#13486F]/5 blur-[100px] pointer-events-none" />

      {/* Scattered cute pet background elements */}
      <div className="absolute top-12 left-12 text-[#EAE2D5] animate-float-1 pointer-events-none">
        <PawPrint className="h-14 w-14" />
      </div>
      <div className="absolute bottom-12 right-12 text-[#EAE2D5]/80 animate-float-2 pointer-events-none">
        <PawPrint className="h-16 w-16" />
      </div>
      <div className="absolute top-1/4 right-24 text-[#EAE2D5]/60 animate-float-3 pointer-events-none">
        <Bone className="h-12 w-12" />
      </div>
      <div className="absolute bottom-1/4 left-20 text-[#EAE2D5]/70 animate-float-1 pointer-events-none" style={{ animationDelay: '-2s' }}>
        <Bone className="h-10 w-10" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Main Card */}
        <div className="hover-wiggle relative overflow-hidden rounded-[32px] border border-[#F2EAE0] bg-white p-8 sm:p-10 shadow-[0_20px_50px_rgba(139,92,26,0.04)] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(139,92,26,0.08)]">
          
          {/* Logo & Greeting Header */}
          <div className="mb-8 flex flex-col items-center">
            <div className="wiggle-target relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#FAF7F2] p-2.5 shadow-sm border border-[#EAE2D5] transition-all duration-500">
              <img
                src="/assets/logo/logo.webp"
                alt="3F Store Logo"
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#13486F] text-[#FAF7F2] shadow-sm border-2 border-white">
                <PawPrint className="h-4 w-4" />
              </div>
            </div>

            <span className="mt-5 text-xs font-bold uppercase tracking-wider text-[#B45309]">
              {greeting}
            </span>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-800">
              Cổng Quản Trị <span className="text-[#13486F]">3F Store</span>
            </h1>
            <p className="mt-2 text-xs font-semibold text-slate-500 text-center max-w-[280px]">
              Dành cho những người yêu thương thú cưng 🐾
            </p>
          </div>

          {/* System error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-xs font-semibold text-rose-700 animate-[shake_0.4s_ease-in-out]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 pl-1">
                Tài khoản Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="quản_trị_viên@3fstore.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-[#EAE2D5] bg-[#FAF7F2]/40 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:border-[#13486F] focus:bg-white focus:ring-4 focus:ring-[#13486F]/5 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 pl-1">
                Mật khẩu hệ thống
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-[#EAE2D5] bg-[#FAF7F2]/40 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:border-[#13486F] focus:bg-white focus:ring-4 focus:ring-[#13486F]/5 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4.5 w-4.5 rounded-lg border-[#EAE2D5] bg-[#FAF7F2]/50 text-[#13486F] focus:ring-[#13486F] focus:ring-offset-0 disabled:opacity-50"
                />
                <span className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                  Duy trì phiên đăng nhập
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#13486F] hover:bg-[#1a5782] py-4 text-sm font-bold text-white shadow-md shadow-[#13486F]/10 transition-all duration-300 hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Đăng nhập quản trị</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footnote */}
        <p className="mt-8 text-center text-[11px] font-bold text-slate-400 tracking-wider">
          3F Store Security Layer · Chăm sóc bằng cả trái tim 🐾
        </p>
      </div>
    </div>
  );
}
