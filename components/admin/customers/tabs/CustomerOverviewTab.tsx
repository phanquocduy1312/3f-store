import { User, Phone, Mail, CheckCircle2, XCircle } from "lucide-react";

export function CustomerOverviewTab({ customer }: { customer: any }) {
  if (!customer) return null;
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-[#0B1F3A] border-b border-slate-100 pb-4">Thông tin tổng quan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Họ và tên</p>
              <p className="font-bold text-[#0B1F3A]">{customer.full_name || customer.name || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Số điện thoại</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#0B1F3A]">{customer.phone || "-"}</p>
                {customer.phone_verified_at && <span title="Đã xác minh"><CheckCircle2 size={14} className="text-green-500" /></span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#0B1F3A]">{customer.email || "-"}</p>
                {customer.email_verified_at && <span title="Đã xác minh"><CheckCircle2 size={14} className="text-green-500" /></span>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Đăng nhập lần cuối</p>
            <p className="font-bold text-[#0B1F3A]">{customer.last_login_at ? new Date(customer.last_login_at).toLocaleString("vi-VN") : "Chưa từng đăng nhập"}</p>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Cảnh báo hệ thống</p>
            {customer.status === "blocked" ? (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <XCircle size={16} className="mt-0.5 shrink-0" />
                <p>Tài khoản đã bị khóa bởi quản trị viên. Khách hàng không thể đăng nhập hoặc mua sắm.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Không có cảnh báo nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
