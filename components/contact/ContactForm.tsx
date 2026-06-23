import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

type FormFields = {
  name: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
  company_website: string; // Honeypot
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

export function ContactForm() {
  const [fields, setFields] = useState<FormFields>({
    name: "",
    phone: "",
    email: "",
    topic: "",
    message: "",
    company_website: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fields.name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc.";
    } else if (fields.name.length > 100) {
      newErrors.name = "Họ và tên không được quá 100 ký tự.";
    }

    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9)[0-9]{8}$/;
    if (!fields.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc.";
    } else if (!phoneRegex.test(fields.phone.trim())) {
      newErrors.phone = "Số điện thoại Việt Nam chưa đúng định dạng (ví dụ: 0879997474).";
    }

    if (fields.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fields.email.trim())) {
        newErrors.email = "Địa chỉ email không hợp lệ.";
      }
    }

    if (!fields.topic) {
      newErrors.topic = "Vui lòng chọn chủ đề liên hệ.";
    }

    if (!fields.message.trim()) {
      newErrors.message = "Nội dung cần hỗ trợ là bắt buộc.";
    } else if (fields.message.trim().length < 10) {
      newErrors.message = "Nội dung cần hỗ trợ phải có ít nhất 10 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Find API host. The PHP backend runs on the same domain or relative path in production, or api URL config.
      // Let's resolve the backend URL.
      const API_HOST = import.meta.env.VITE_API_HOST || "";
      const response = await fetch(`${API_HOST}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fields),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSubmitSuccess(resData.message || "Gửi thành công.");
        setFields({
          name: "",
          phone: "",
          email: "",
          topic: "",
          message: "",
          company_website: "",
        });
        setErrors({});
      } else {
        if (resData.errors) {
          setErrors(resData.errors);
        }
        setSubmitError(resData.message || "Gửi thông tin liên hệ không thành công. Vui lòng kiểm tra lại.");
      }
    } catch (err) {
      setSubmitError("Không thể kết nối đến hệ thống. Vui lòng thử lại sau.");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-form-section" className="bg-white p-6 sm:p-10 rounded-3xl border border-forest/5 shadow-soft">
      <h3 className="font-extrabold text-2xl text-ink mb-2">Gửi yêu cầu hỗ trợ nhanh</h3>
      <p className="text-sm text-ink-soft mb-8 leading-relaxed">
        Dù bạn đang tìm loại hạt phù hợp, pate dễ ăn, cát vệ sinh ít bụi hay phụ kiện cho bé, 3F Store luôn sẵn sàng lắng nghe và hỗ trợ. Hãy để lại thông tin, tụi mình sẽ liên hệ lại trong thời gian sớm nhất.
      </p>

      {submitSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex gap-3 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>{submitSuccess}</div>
        </div>
      )}

      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800 flex gap-3 text-sm font-semibold">
          <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div>{submitError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot field (hidden for users, filled by bots) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company_website">Company Website</label>
          <input
            type="text"
            id="company_website"
            name="company_website"
            value={fields.company_website}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase mb-2">Họ và tên *</label>
            <input
              type="text"
              name="name"
              value={fields.name}
              onChange={handleInputChange}
              placeholder="Nguyễn Văn A"
              className={`w-full h-11 px-4 text-xs font-semibold rounded-xl border outline-none transition ${
                errors.name ? "border-red-500 bg-red-50/20" : "border-forest/12 focus:border-forest focus:ring-2 focus:ring-forest/5"
              }`}
            />
            {errors.name && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase mb-2">Số điện thoại *</label>
            <input
              type="text"
              name="phone"
              value={fields.phone}
              onChange={handleInputChange}
              placeholder="0909913889"
              className={`w-full h-11 px-4 text-xs font-semibold rounded-xl border outline-none transition ${
                errors.phone ? "border-red-500 bg-red-50/20" : "border-forest/12 focus:border-forest focus:ring-2 focus:ring-forest/5"
              }`}
            />
            {errors.phone && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase mb-2">Email (Tùy chọn)</label>
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={handleInputChange}
              placeholder="customer@example.com"
              className={`w-full h-11 px-4 text-xs font-semibold rounded-xl border outline-none transition ${
                errors.email ? "border-red-500 bg-red-50/20" : "border-forest/12 focus:border-forest focus:ring-2 focus:ring-forest/5"
              }`}
            />
            {errors.email && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-bold text-ink uppercase mb-2">Chủ đề liên hệ *</label>
            <select
              name="topic"
              value={fields.topic}
              onChange={handleInputChange}
              className={`w-full h-11 px-4 text-xs font-bold rounded-xl border outline-none bg-white transition ${
                errors.topic ? "border-red-500 bg-red-50/20" : "border-forest/12 focus:border-forest focus:ring-2 focus:ring-forest/5"
              }`}
            >
              <option value="">-- Chọn chủ đề --</option>
              <option value="product_consulting">Tư vấn sản phẩm cho chó/mèo</option>
              <option value="order_inquiry">Hỏi về đơn hàng</option>
              <option value="after_sales_support">Đổi trả / Bảo hành / Hỗ trợ sau bán</option>
              <option value="business_cooperation">Hợp tác / Nhà cung cấp</option>
              <option value="other">Khác</option>
            </select>
            {errors.topic && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.topic}</p>}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-ink uppercase mb-2">Nội dung cần hỗ trợ *</label>
          <textarea
            name="message"
            value={fields.message}
            onChange={handleInputChange}
            rows={5}
            placeholder="Mô tả cụ thể thắc mắc của bạn (tối thiểu 10 ký tự)..."
            className={`w-full p-4 text-xs font-semibold rounded-xl border outline-none transition resize-none ${
              errors.message ? "border-red-500 bg-red-50/20" : "border-forest/12 focus:border-forest focus:ring-2 focus:ring-forest/5"
            }`}
          />
          {errors.message && <p className="text-[11px] font-bold text-red-500 mt-1">{errors.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 text-xs font-black text-white shadow-soft transition hover:bg-forest-dark hover:shadow-lift active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send size={14} />
          {isSubmitting ? "Đang gửi thông tin..." : "Gửi thông tin liên hệ"}
        </button>
      </form>
    </div>
  );
}
