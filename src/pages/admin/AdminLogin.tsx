import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/src/api/productsApi";
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to admin orders
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/admin/orders");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070F2B] font-sans text-white">
      {/* Decorative Glow Elements */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse duration-[6s]" />
      <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse duration-[8s]" />

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Card wrapper */}
        <div className="group relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30">
          
          {/* Inner ambient glow on hover */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-500 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 group-hover:opacity-100" />

          {/* Logo Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0057E7] to-[#00C9FF] p-0.5 shadow-lg shadow-blue-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#070F2B]">
                <img
                  src="/assets/logo/logo.webp"
                  alt="3F Store Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              3F Store Admin
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-slate-400">
              Cổng bảo mật quản trị viên hệ thống
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold text-rose-300 animate-[shake_0.4s_ease-in-out]">
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Tài khoản Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-[#0057E7] focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-12 text-sm font-semibold text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-[#0057E7] focus:bg-white/[0.08] focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-white/10 bg-white/[0.05] text-[#0057E7] focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                />
                <span className="text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors">
                  Duy trì đăng nhập
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0057E7] to-[#0082E7] py-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footnote */}
        <p className="mt-8 text-center text-[11px] font-semibold text-slate-500">
          Hệ thống bảo mật bởi 3F Store Security Layer. © 2026
        </p>
      </div>
    </div>
  );
}
