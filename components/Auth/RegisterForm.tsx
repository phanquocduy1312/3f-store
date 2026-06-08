import { useState, FormEvent, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Password strength logic
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
    if (score >= 4) {
      text = "Mạnh";
      color = "bg-forest";
    } else if (score >= 2) {
      text = "Trung bình";
      color = "bg-honey";
    }
    setStrength({ score, text, color });
  }, [password]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = "Vui lòng nhập Email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = "Bạn cần đồng ý với Điều khoản dịch vụ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Đăng ký thành công! (Dữ liệu mô phỏng)");
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-ink/80 mb-1.5">Email</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
            <Mail size={16} />
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 text-[0.9rem] outline-none transition duration-200 ${
              errors.email ? "border-red-500 ring-2 ring-red-100" : "border-forest/20 focus:border-forest"
            }`}
            placeholder="example@gmail.com"
          />
        </div>
        {errors.email && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-ink/80 mb-1.5">Mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
            <Lock size={16} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white/50 text-[0.9rem] outline-none transition duration-200 ${
              errors.password ? "border-red-500 ring-2 ring-red-100" : "border-forest/20 focus:border-forest"
            }`}
            placeholder="Tối thiểu 6 ký tự"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink/40 hover:text-forest"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {password && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-ink/60">
              <span>Độ bảo mật: {strength.text}</span>
            </div>
            <div className="h-1 w-full bg-forest/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${Math.min(100, (strength.score / 5) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {errors.password && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.password}</p>}
      </div>


      <div>
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="accent-forest mt-0.5 w-4 h-4 rounded border-forest/30"
          />
          <span className="text-xs font-medium text-ink/70 leading-normal">
            Tôi đồng ý với các{" "}
            <a href="#" className="font-bold text-forest hover:underline">
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a href="#" className="font-bold text-forest hover:underline">
              Chính sách bảo mật
            </a>{" "}
            của 3F Store.
          </span>
        </label>
        {errors.agreeTerms && <p className="text-red-500 text-[11px] font-semibold mt-1">{errors.agreeTerms}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition duration-300 shadow-soft hover:shadow-lift disabled:opacity-75 disabled:cursor-not-allowed text-[0.9rem]"
      >
        {isLoading ? (
          <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Đăng ký tài khoản
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}
