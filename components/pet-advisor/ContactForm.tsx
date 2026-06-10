import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Gift } from "lucide-react";

interface ContactFormProps {
  onBack: () => void;
  onSubmit: (customer: { name: string; phone: string; email: string }) => void;
}

export function ContactForm({ onBack, onSubmit }: ContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Anh/chị vui lòng nhập Tên của mình nhé.");
      return;
    }

    if (!phone.trim()) {
      setErrorMsg("Anh/chị vui lòng nhập SĐT/Zalo để 3F gửi kết quả và voucher nhé.");
      return;
    }

    // Simple phone validator (e.g. at least 9-10 digits)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 9 || cleanPhone.length > 11) {
      setErrorMsg("Số điện thoại không hợp lệ. Anh/chị vui lòng kiểm tra lại nhé.");
      return;
    }

    if (!agree) {
      setErrorMsg("Anh/chị cần đồng ý nhận tư vấn và ưu đãi để tiếp tục.");
      return;
    }

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full justify-between"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <h4 className="text-[18px] md:text-[20px] font-black text-ink flex items-center justify-center md:justify-start gap-2 w-full">
            <Gift className="text-[#ED4546] shrink-0" size={24} />
            <span>Gần xong rồi!</span>
          </h4>
          <p className="text-ink-soft text-[14px] leading-relaxed mt-1">
            Để 3F gửi kết quả tư vấn + voucher 30.000đ cho anh/chị.
          </p>
        </div>

        {/* Error alert banner */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100"
          >
            {errorMsg}
          </motion.div>
        )}

        <div className="space-y-3">
          {/* Name input */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-1.5">
              Tên của anh/chị *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full border-2 border-gray-200 focus:border-forest outline-none rounded-xl px-4 py-2.5 text-sm transition-all"
            />
          </div>

          {/* Phone input */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-1.5">
              Số điện thoại / Zalo *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại nhận quà..."
              className="w-full border-2 border-gray-200 focus:border-forest outline-none rounded-xl px-4 py-2.5 text-sm transition-all"
            />
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-1.5">
              Email nhận checklist (Không bắt buộc)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vidu@gmail.com"
              className="w-full border-2 border-gray-200 focus:border-forest outline-none rounded-xl px-4 py-2.5 text-sm transition-all"
            />
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-forest focus:ring-forest border-gray-300 transition-colors"
            />
            <span className="text-[13px] text-ink-soft leading-normal">
              Tôi đồng ý nhận tư vấn và ưu đãi từ 3F.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-forest hover:bg-forest-dark text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-forest/10 transition-all duration-300 mt-4 text-[15px]"
        >
          Nhận kết quả & voucher
        </button>
      </form>

      {/* Back button */}
      <div className="pt-4 border-t border-gray-100 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-ink-soft hover:text-ink font-bold text-[14px] transition-colors py-1"
        >
          <ChevronLeft size={16} />
          <span>Quay lại</span>
        </button>
      </div>
    </motion.div>
  );
}
