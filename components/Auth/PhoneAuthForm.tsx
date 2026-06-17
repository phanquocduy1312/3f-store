import { useState, FormEvent } from "react";
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { SocialLogins } from "./SocialLogins";
import { toast } from "sonner";

interface PhoneAuthFormProps {
  onSwitchToEmail?: () => void;
  onSuccess?: () => void;
}

type PhoneStep = "PHONE_INPUT" | "VERIFY_CODE" | "SET_PASSWORD";

export function PhoneAuthForm({ onSwitchToEmail, onSuccess }: PhoneAuthFormProps) {
  const [step, setStep] = useState<PhoneStep>("PHONE_INPUT");
  const [authMethod, setAuthMethod] = useState<"OTP" | "PASSWORD">("OTP");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = (e: FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (!/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(phone.replace(/\s+/g, '')) && !/^[0-9]{9,10}$/.test(phone.replace(/\s+/g, ''))) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    
    setError("");
    setIsLoading(true);
    // Mock sending code
    setTimeout(() => {
      setIsLoading(false);
      setStep("VERIFY_CODE");
    }, 1000);
  };

  const handlePasswordLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }
    
    setError("");
    setIsLoading(true);
    // Mock login
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Đăng nhập thành công!");
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const handleVerifyCode = (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError("Mã xác nhận không hợp lệ");
      return;
    }
    
    setError("");
    setIsLoading(true);
    // Mock verifying code
    setTimeout(() => {
      setIsLoading(false);
      setStep("SET_PASSWORD");
    }, 1000);
  };

  const handleSetPassword = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự trở lên");
      return;
    }
    
    setError("");
    setIsLoading(true);
    // Mock registration completion
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Đăng nhập/Đăng ký thành công!");
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-black text-ink tracking-tight">
          Đăng nhập / Đăng ký
        </h2>
        <p className="text-sm font-semibold text-ink/60">
          {step === "PHONE_INPUT" && "Nhập số điện thoại để nhận mã xác nhận"}
          {step === "VERIFY_CODE" && `Nhập mã xác nhận đã được gửi đến ${phone}`}
          {step === "SET_PASSWORD" && "Thiết lập mật khẩu cho tài khoản của bạn"}
        </p>
      </div>

      {step === "PHONE_INPUT" && (
        <form onSubmit={authMethod === "OTP" ? handleSendCode : handlePasswordLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ink/80 mb-2">Số điện thoại</label>
            <div className="flex border border-forest/20 rounded-xl overflow-hidden bg-white/50 focus-within:border-forest focus-within:ring-4 focus-within:ring-forest/10 transition duration-200">
              <div className="flex-shrink-0 flex items-center justify-center px-4 bg-forest/5 border-r border-forest/10 text-ink/70 font-bold text-[0.95rem] whitespace-nowrap select-none">
                VN +84
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-[0.95rem] outline-none"
                placeholder="912 345 678"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
          </div>

          {authMethod === "PASSWORD" && (
            <div>
              <label className="block text-sm font-bold text-ink/80 mb-2">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-forest/20 bg-white/50 text-[0.95rem] outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition duration-200"
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-soft hover:shadow-lift disabled:opacity-75 disabled:cursor-not-allowed text-[0.95rem]"
          >
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {authMethod === "OTP" ? "Gửi mã xác nhận" : "Đăng nhập"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}

      {step === "VERIFY_CODE" && (
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ink/80 mb-2">Mã xác nhận</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-forest/20 bg-white/50 text-[0.95rem] outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition duration-200 text-center tracking-[0.5em] font-bold"
              placeholder="XXXXXX"
              maxLength={6}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-soft hover:shadow-lift disabled:opacity-75 disabled:cursor-not-allowed text-[0.95rem]"
          >
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Xác nhận
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setStep("PHONE_INPUT")}
              className="text-sm font-bold text-ink/60 hover:text-ink transition"
            >
              Đổi số điện thoại khác
            </button>
          </div>
        </form>
      )}

      {step === "SET_PASSWORD" && (
        <form onSubmit={handleSetPassword} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ink/80 mb-2">Mật khẩu mới</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-forest/20 bg-white/50 text-[0.95rem] outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition duration-200"
                placeholder="Tối thiểu 6 ký tự"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-soft hover:shadow-lift disabled:opacity-75 disabled:cursor-not-allowed text-[0.95rem]"
          >
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Hoàn tất & Đăng nhập
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer options visible only during initial phone input step */}
      {step === "PHONE_INPUT" && (
        <>
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => {
                setAuthMethod(authMethod === "OTP" ? "PASSWORD" : "OTP");
                setError("");
              }}
              className="text-sm font-bold text-forest hover:text-forest-dark transition"
            >
              {authMethod === "OTP" ? "Đăng nhập bằng mật khẩu" : "Đăng nhập bằng mã OTP"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-ink/10 flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/40">HOẶC</span>
            <div className="h-px bg-ink/10 flex-1" />
          </div>

          <button
            type="button"
            onClick={onSwitchToEmail}
            className="w-full py-3 bg-white hover:bg-gray-50 border border-ink/10 text-ink rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-sm"
          >
            <Mail size={18} />
            Đăng nhập bằng Email
          </button>

          <div className="mt-6">
            <SocialLogins hideLabel={true} />
          </div>
        </>
      )}
    </div>
  );
}
