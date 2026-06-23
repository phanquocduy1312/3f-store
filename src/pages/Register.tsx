import { useState, useEffect } from "react";
import { RegisterForm } from "@/components/Auth/RegisterForm";
import { SocialLogins } from "@/components/Auth/SocialLogins";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ExternalLink, ArrowRight, LogIn } from "lucide-react";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";
import { toast } from "sonner";
import { resendRegistrationVerificationApi } from "@/src/api/customerAuthApi";

export function Register() {
  const navigate = useNavigate();
  const { isLoggedIn } = useCustomerAuth();

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [devVerifyUrl, setDevVerifyUrl] = useState("");
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate("/", { replace: true });
    return null;
  }

  // Handle success callback from RegisterForm
  const handleSuccess = (email: string, verifyUrl?: string) => {
    setRegisteredEmail(email);
    if (verifyUrl) {
      setDevVerifyUrl(verifyUrl);
    }
    setShowSuccessCard(true);
    setCooldown(60);
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const res = await resendRegistrationVerificationApi({ email: registeredEmail });
      if (res.success) {
        toast.success(res.message || "Đã gửi lại email xác thực thành công!");
        setCooldown(60);
        if (res.devVerifyUrl) {
          setDevVerifyUrl(res.devVerifyUrl);
        }
      } else {
        toast.error(res.message || "Gửi lại email xác thực thất bại.");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối khi gửi lại email.");
    } finally {
      setResending(false);
    }
  };

  const isGmail = registeredEmail.toLowerCase().endsWith("@gmail.com");

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white flex flex-col lg:grid lg:grid-cols-12">
      {/* Left Column - Form / Success Area */}
      <div className="flex-1 lg:col-span-7 xl:col-span-6 flex flex-col justify-center px-4 sm:px-12 lg:px-20 xl:px-24 py-10">
        <div className="w-full max-w-[440px] mx-auto space-y-6">
          
          {!showSuccessCard ? (
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
            /* Success Verification Guidance Screen */
            <div className="space-y-6 text-center lg:text-left transition-all">
              <div className="relative mx-auto lg:mx-0 w-16 h-16 flex items-center justify-center bg-blue-50 text-[#0057E7] rounded-2xl">
                <Mail className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-black text-ink tracking-tight">Kiểm tra email của bạn</h1>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed">
                  3F Store đã gửi một link xác thực đến <strong className="text-[#0B1F3A] break-all">{registeredEmail}</strong>. Vui lòng mở email và bấm vào link xác thực để hoàn tất đăng ký.
                </p>
                <p className="text-xs font-bold text-forest-dark bg-forest/5 border border-forest/10 rounded-xl p-3 inline-block w-full text-center">
                  Bạn kiểm tra hộp thư email giúp 3F nhé.
                </p>
              </div>

              {/* Dev verify link helper */}
              {devVerifyUrl && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                  <span className="text-xs font-bold text-amber-800 block mb-1">Dev verify link (chỉ hiển thị ở Development):</span>
                  <a href={devVerifyUrl} className="text-xs text-blue-600 font-semibold break-all hover:underline">
                    {devVerifyUrl}
                  </a>
                </div>
              )}

              <div className="pt-4 space-y-3">
                {isGmail && (
                  <a 
                    href="https://mail.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057E7] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition active:scale-95"
                  >
                    <span>Mở Gmail</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-sm transition disabled:bg-slate-200 disabled:text-slate-400 active:scale-95"
                >
                  {cooldown > 0 ? `Gửi lại email (${cooldown}s)` : "Gửi lại email xác thực"}
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCEBFF] hover:bg-slate-50 text-[#0B1F3A] font-bold text-sm transition active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  Về trang đăng nhập
                </button>
              </div>
            </div>
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
