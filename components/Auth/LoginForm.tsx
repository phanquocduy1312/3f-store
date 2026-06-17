import { useState, FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { loginPassword } from "@/src/api/customerAuthApi";
import { useCustomerAuth } from "@/src/context/CustomerAuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useCustomerAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: { identifier?: string; password?: string } = {};
    if (!identifier) {
      newErrors.identifier = "Vui lòng nhập Email hoặc Số điện thoại";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) &&
      !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(identifier)
    ) {
      newErrors.identifier = "Email hoặc Số điện thoại không đúng định dạng";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await loginPassword({ identifier, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.customer);
        toast.success("Đăng nhập thành công!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || "Đăng nhập thất bại.");
        if (res.message) {
          setErrors({ identifier: res.message });
        }
      }
    } catch {
      toast.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-ink/80 mb-2">Email hoặc Số điện thoại</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
            <Mail size={18} />
          </span>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white/50 text-[0.95rem] outline-none transition duration-200 ${
              errors.identifier
                ? "border-red-500 focus:border-red-500 ring-2 ring-red-100"
                : "border-forest/20 focus:border-forest focus:bg-white focus:ring-4 focus:ring-forest/10"
            }`}
            placeholder="example@gmail.com hoặc 09xxxx"
          />
        </div>
        {errors.identifier && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.identifier}</p>}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-bold text-ink/80">Mật khẩu</label>
          <a href="#" className="text-xs font-bold text-forest hover:text-forest-dark transition">
            Quên mật khẩu?
          </a>
        </div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ink/40">
            <Lock size={18} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white/50 text-[0.95rem] outline-none transition duration-200 ${
              errors.password
                ? "border-red-500 focus:border-red-500 ring-2 ring-red-100"
                : "border-forest/20 focus:border-forest focus:bg-white focus:ring-4 focus:ring-forest/10"
            }`}
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
        {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-forest w-4.5 h-4.5 rounded border-forest/30"
          />
          <span className="text-xs font-semibold text-ink/70">Ghi nhớ đăng nhập</span>
        </label>
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
            Đăng nhập
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
