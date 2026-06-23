import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Mail, RotateCcw, Home, LogIn } from "lucide-react";
import { toast } from "sonner";
import { verifyRegistrationApi, resendRegistrationVerificationApi } from "@/src/api/customerAuthApi";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";

export function VerifyRegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !email || !token ? "error" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState(
    !email || !token ? "Đường dẫn xác thực không hợp lệ hoặc thiếu thông tin." : ""
  );

  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devVerifyUrl, setDevVerifyUrl] = useState("");

  const handleVerify = async () => {
    if (!email || !token) return;
    setStatus("loading");
    try {
      const res = await verifyRegistrationApi({ email, token });
      if (res.success && res.data) {
        login(res.data.token, res.data.customer);
        setStatus("success");
        toast.success("Xác thực email thành công!");
        
        setTimeout(() => {
          navigate("/account/profile");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(res.message || "Xác thực thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Không thể kết nối đến máy chủ.");
    }
  };

  useEffect(() => {
    if (email && token) {
      handleVerify();
    }
  }, [email, token]);

  // Handle countdown cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      toast.error("Không tìm thấy địa chỉ email để gửi lại.");
      return;
    }
    setResending(true);
    try {
      const res = await resendRegistrationVerificationApi({ email });
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
      toast.error(err.message || "Đã xảy ra lỗi kết nối.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-cream-soft/20 px-4 py-16">
      <div className="w-full max-w-md bg-white border border-[#DCEBFF] rounded-3xl p-8 text-center shadow-glass transition-all">
        {status === "loading" && (
          <div className="space-y-6 py-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-blue-50 text-[#0057E7] rounded-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#0B1F3A]">Đang xác thực tài khoản</h2>
              <p className="text-sm font-medium text-slate-500">
                Vui lòng đợi giây lát, 3F Store đang tiến hành xác thực tài khoản cho bạn...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-full animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#0B1F3A]">Xác thực thành công!</h2>
              <p className="text-sm font-medium text-slate-500">
                Chào mừng bạn đến với 3F Store. Bạn đang được tự động chuyển hướng về trang tài khoản...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-red-50 text-red-600 rounded-full">
              <XCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#0B1F3A]">Xác thực không thành công</h2>
              <p className="text-sm font-medium text-red-500 bg-red-50/50 border border-red-100 rounded-2xl p-4 leading-relaxed font-semibold">
                {errorMessage}
              </p>
            </div>

            {/* Development Mode Helper Link */}
            {devVerifyUrl && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <span className="text-xs font-bold text-amber-800 block mb-1">Dev verify link (chỉ hiển thị ở Development):</span>
                <a href={devVerifyUrl} className="text-xs text-blue-600 font-semibold break-all hover:underline">
                  {devVerifyUrl}
                </a>
              </div>
            )}

            <div className="pt-4 flex flex-col gap-2.5">
              {email && (
                <button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0057E7] hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Mail className="w-4 h-4" />
                  {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : "Gửi lại email xác thực"}
                </button>
              )}
              
              <button
                onClick={() => navigate("/register")}
                className="w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCEBFF] hover:bg-slate-50 text-[#0B1F3A] font-bold text-sm transition"
              >
                <RotateCcw className="w-4 h-4" />
                Đăng ký lại
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="min-h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DCEBFF] hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
                >
                  <Home className="w-3.5 h-3.5" />
                  Trang chủ
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="min-h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DCEBFF] hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
