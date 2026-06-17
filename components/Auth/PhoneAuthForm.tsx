import { useState, FormEvent } from "react";
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { requestOtp, verifyOtp, completePhoneRegister, loginPassword } from "@/src/api/customerAuthApi";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";

interface PhoneAuthFormProps {
  onSwitchToEmail?: () => void;
  onSuccess?: () => void;
  /** Context: 'login' or 'register' - affects OTP purpose */
  context?: "login" | "register";
}

type PhoneStep = "PHONE_INPUT" | "VERIFY_CODE" | "COMPLETE_PROFILE";

export function PhoneAuthForm({ onSwitchToEmail, onSuccess, context = "login" }: PhoneAuthFormProps) {
  const { login } = useCustomerAuth();
  const [step, setStep] = useState<PhoneStep>("PHONE_INPUT");
  const [authMethod, setAuthMethod] = useState<"OTP" | "PASSWORD">("OTP");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Complete profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const purpose = context === "register" ? "register" : "login";

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s+/g, "");
    if (!cleaned || !/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(cleaned)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const res = await requestOtp({ phone: cleaned, purpose });
      if (res.success) {
        toast.success(res.message || "Mã xác nhận đã được gửi!");
        if (res.devOtp) toast.info(`[Dev] OTP: ${res.devOtp}`, { duration: 10000 });
        setStep("VERIFY_CODE");
      } else {
        setError(res.message || "Gửi OTP thất bại.");
        if (res.code === "PHONE_EXISTS") {
          toast.info("Số điện thoại này đã có tài khoản. Vui lòng đăng nhập.");
        }
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone) { setError("Vui lòng nhập số điện thoại"); return; }
    if (!password) { setError("Vui lòng nhập mật khẩu"); return; }

    setError("");
    setIsLoading(true);
    try {
      const res = await loginPassword({ identifier: phone.replace(/\s+/g, ""), password });
      if (res.success && res.data) {
        login(res.data.token, res.data.customer);
        toast.success("Đăng nhập thành công!");
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || "Đăng nhập thất bại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 4) { setError("Mã xác nhận không hợp lệ"); return; }

    setError("");
    setIsLoading(true);
    try {
      const res = await verifyOtp({ phone: phone.replace(/\s+/g, ""), otp: code, purpose });
      if (res.success) {
        if (res.action === "logged_in" && res.data) {
          login(res.data.token, res.data.customer);
          toast.success("Đăng nhập thành công!");
          if (onSuccess) onSuccess();
        } else if (res.action === "need_register" || res.action === "verified") {
          setVerificationToken(res.verificationToken || "");
          setStep("COMPLETE_PROFILE");
        }
      } else {
        setError(res.message || "Xác nhận thất bại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Vui lòng nhập họ tên."); return; }
    if (!acceptTerms) { setError("Bạn cần đồng ý với điều khoản để tiếp tục."); return; }
    if (password && password.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự."); return; }
    if (password && password !== passwordConfirmation) { setError("Mật khẩu nhập lại không khớp."); return; }

    setError("");
    setIsLoading(true);
    try {
      const res = await completePhoneRegister({
        phone: phone.replace(/\s+/g, ""),
        verificationToken,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        password: password || undefined,
        passwordConfirmation: passwordConfirmation || undefined,
        acceptTerms,
      });
      if (res.success && res.data) {
        login(res.data.token, res.data.customer);
        toast.success("Đăng ký thành công!");
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || "Đăng ký thất bại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const btnClass = "w-full py-3.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-soft hover:shadow-lift disabled:opacity-75 disabled:cursor-not-allowed text-[0.95rem]";

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="space-y-2 mb-6">
        <h2 className="text-2xl font-black text-ink tracking-tight">
          {context === "register" ? "Đăng ký bằng SĐT" : "Đăng nhập / Đăng ký"}
        </h2>
        <p className="text-sm font-semibold text-ink/60">
          {step === "PHONE_INPUT" && "Nhập số điện thoại để nhận mã xác nhận"}
          {step === "VERIFY_CODE" && `Nhập mã xác nhận đã được gửi đến ${phone}`}
          {step === "COMPLETE_PROFILE" && "Hoàn tất thông tin để tạo tài khoản"}
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
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-[0.95rem] outline-none" placeholder="912 345 678" autoFocus />
            </div>
            {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
          </div>

          {authMethod === "PASSWORD" && (
            <div>
              <label className="block text-sm font-bold text-ink/80 mb-2">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Lock size={18} /></span>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-forest/20 bg-white/50 text-[0.95rem] outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition duration-200"
                  placeholder="Nhập mật khẩu của bạn" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className={btnClass}>
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>{authMethod === "OTP" ? "Gửi mã xác nhận" : "Đăng nhập"} <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      )}

      {step === "VERIFY_CODE" && (
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-ink/80 mb-2">Mã xác nhận</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-forest/20 bg-white/50 text-[0.95rem] outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition duration-200 text-center tracking-[0.5em] font-bold"
              placeholder="XXXXXX" maxLength={6} autoFocus />
            {error && <p className="text-red-500 text-xs font-semibold mt-1.5">{error}</p>}
          </div>
          <button type="submit" disabled={isLoading} className={btnClass}>
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (<>Xác nhận <ArrowRight size={18} /></>)}
          </button>
          <div className="text-center mt-3">
            <button type="button" onClick={() => { setStep("PHONE_INPUT"); setCode(""); setError(""); }}
              className="text-sm font-bold text-ink/60 hover:text-ink transition">Đổi số điện thoại khác</button>
          </div>
        </form>
      )}

      {step === "COMPLETE_PROFILE" && (
        <form onSubmit={handleCompleteProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink/80 mb-1.5">Họ và tên *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><User size={16} /></span>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest/20 bg-white/50 text-[0.9rem] outline-none focus:border-forest transition"
                placeholder="Nguyễn Văn A" autoFocus />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink/80 mb-1.5">Email (tuỳ chọn)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Mail size={16} /></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest/20 bg-white/50 text-[0.9rem] outline-none focus:border-forest transition"
                placeholder="example@gmail.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink/80 mb-1.5">Mật khẩu (tuỳ chọn)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Lock size={16} /></span>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-forest/20 bg-white/50 text-[0.9rem] outline-none focus:border-forest transition"
                placeholder="Tối thiểu 6 ký tự" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {password && (
            <div>
              <label className="block text-xs font-bold text-ink/80 mb-1.5">Nhập lại mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Lock size={16} /></span>
                <input type="password" value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-forest/20 bg-white/50 text-[0.9rem] outline-none focus:border-forest transition"
                  placeholder="Nhập lại mật khẩu" />
              </div>
            </div>
          )}
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
              className="accent-forest mt-0.5 w-4 h-4 rounded border-forest/30" />
            <span className="text-xs font-medium text-ink/70 leading-normal">
              Tôi đồng ý với các{" "}
              <a href="#" className="font-bold text-forest hover:underline">Điều khoản dịch vụ</a>{" "}
              và <a href="#" className="font-bold text-forest hover:underline">Chính sách bảo mật</a>.
            </span>
          </label>
          {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
          <button type="submit" disabled={isLoading} className={btnClass}>
            {isLoading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (<>Hoàn tất & Đăng nhập <ArrowRight size={18} /></>)}
          </button>
        </form>
      )}

      {/* Footer options */}
      {step === "PHONE_INPUT" && (
        <>
          {context === "login" && (
            <div className="text-center mt-3">
              <button type="button"
                onClick={() => { setAuthMethod(authMethod === "OTP" ? "PASSWORD" : "OTP"); setError(""); }}
                className="text-sm font-bold text-forest hover:text-forest-dark transition">
                {authMethod === "OTP" ? "Đăng nhập bằng mật khẩu" : "Đăng nhập bằng mã OTP"}
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-ink/10 flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest text-ink/40">HOẶC</span>
            <div className="h-px bg-ink/10 flex-1" />
          </div>

          <button type="button" onClick={onSwitchToEmail}
            className="w-full py-3 bg-white hover:bg-gray-50 border border-ink/10 text-ink rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-sm">
            <Mail size={18} />
            {context === "register" ? "Đăng ký bằng Email" : "Đăng nhập bằng Email"}
          </button>
        </>
      )}
    </div>
  );
}
