import { useState, FormEvent, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { registerEmail } from "@/src/api/customerAuthApi";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";

interface RegisterFormProps {
  onSuccess?: (registeredEmail: string, devVerifyUrl?: string) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength
  const [strength, setStrength] = useState({ score: 0, text: "Yếu", color: "bg-red-500" });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, text: "Yếu", color: "bg-red-500" });
      return;
    }
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = "Yếu";
    let color = "bg-red-500";
    if (score >= 4) { text = "Mạnh"; color = "bg-forest"; }
    else if (score >= 2) { text = "Trung bình"; color = "bg-honey"; }
    setStrength({ score, text, color });
  }, [password]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên.";
    if (!email) newErrors.email = "Vui lòng nhập Email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email không đúng định dạng";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (password.length < 6) newErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
    if (password !== passwordConfirmation) newErrors.passwordConfirmation = "Mật khẩu nhập lại không khớp.";
    if (!agreeTerms) newErrors.agreeTerms = "Bạn cần đồng ý với Điều khoản dịch vụ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await registerEmail({ fullName: fullName.trim(), email, password, passwordConfirmation, acceptTerms: agreeTerms });
      if (res.success) {
        toast.success(res.message || "Yêu cầu đăng ký thành công. Vui lòng xác thực email.");
        if (onSuccess) onSuccess(email, res.devVerifyUrl);
      } else {
        toast.error(res.message || "Đăng ký thất bại.");
        if (res.message?.includes("Email")) setErrors({ email: res.message });
      }
    } catch {
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 text-[0.9rem] outline-none transition duration-200 ${
      errors[field] ? "border-red-500 ring-2 ring-red-100" : "border-forest/20 focus:border-forest"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-ink/80 mb-1.5">Họ và tên</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><User size={16} /></span>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
            className={inputClass("fullName")} placeholder="Nguyễn Văn A" />
        </div>
        {errors.fullName && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-ink/80 mb-1.5">Email</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Mail size={16} /></span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className={inputClass("email")} placeholder="example@gmail.com" />
        </div>
        {errors.email && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-bold text-ink/80 mb-1.5">Mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Lock size={16} /></span>
          <input type={showPassword ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass("password")} pr-10`} placeholder="Tối thiểu 6 ký tự" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-ink/60">
              <span>Độ bảo mật: {strength.text}</span>
            </div>
            <div className="h-1 w-full bg-forest/10 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${Math.min(100, (strength.score / 5) * 100)}%` }} />
            </div>
          </div>
        )}
        {errors.password && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.password}</p>}
      </div>

      {/* Password Confirmation */}
      <div>
        <label className="block text-xs font-bold text-ink/80 mb-1.5">Nhập lại mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40"><Lock size={16} /></span>
          <input type={showConfirm ? "text" : "password"} value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className={`${inputClass("passwordConfirmation")} pr-10`} placeholder="Nhập lại mật khẩu" />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.passwordConfirmation && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.passwordConfirmation}</p>}
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
            className="accent-forest mt-0.5 w-4 h-4 rounded border-forest/30" />
          <span className="text-xs font-medium text-ink/70 leading-normal">
            Tôi đồng ý với các{" "}
            <a href="#" className="font-bold text-forest hover:underline">Điều khoản dịch vụ</a>{" "}
            và{" "}
            <a href="#" className="font-bold text-forest hover:underline">Chính sách bảo mật</a>{" "}
            của 3F Store.
          </span>
        </label>
        {errors.agreeTerms && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.agreeTerms}</p>}
      </div>

      <button type="submit" disabled={isLoading}
        className="w-full py-3 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-soft hover:shadow-lift disabled:opacity-75 disabled:cursor-not-allowed text-[0.9rem]">
        {isLoading ? (
          <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>Đăng ký tài khoản <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}
