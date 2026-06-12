import React from "react";
import { User, Phone, ArrowRight } from "lucide-react";
import { AdminCard } from "./admin-card";

interface AiLead {
  name: string;
  phone: string;
  petInfo: string;
  time: string;
  status: "Mới" | "Đã liên hệ";
}

interface AdminAiLeadListProps {
  searchValue: string;
}

export function AdminAiLeadList({ searchValue }: AdminAiLeadListProps) {
  const leads: AiLead[] = [
    {
      name: "Chị Mai",
      phone: "0901 234 667",
      petInfo: "Mèo, kén ăn, 8 tháng tuổi",
      time: "5 phút trước",
      status: "Mới"
    },
    {
      name: "Anh Duy",
      phone: "0938 765 432",
      petInfo: "Chó, tiêu hóa yếu, 2 tuổi",
      time: "15 phút trước",
      status: "Mới"
    },
    {
      name: "Chị Linh",
      phone: "0799 888 999",
      petInfo: "Mèo, da lông xỉn màu",
      time: "28 phút trước",
      status: "Mới"
    },
    {
      name: "Anh Tuấn",
      phone: "0903 111 222",
      petInfo: "Chó, tăng cân, 1 tuổi",
      time: "45 phút trước",
      status: "Mới"
    },
    {
      name: "Chị Hương",
      phone: "0866 333 444",
      petInfo: "Mèo, hairball, 3 tuổi",
      time: "1 giờ trước",
      status: "Đã liên hệ"
    }
  ];

  // Filter leads based on global search value
  const filteredLeads = leads.filter(lead => {
    if (!searchValue) return true;
    const s = searchValue.toLowerCase();
    return (
      lead.name.toLowerCase().includes(s) ||
      lead.phone.includes(s) ||
      lead.petInfo.toLowerCase().includes(s)
    );
  });

  const getStatusBadgeClass = (status: "Mới" | "Đã liên hệ") => {
    if (status === "Mới") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-green-50 text-green-600 border-green-200";
  };

  const headerAction = (
    <button className="text-[#0057E7] hover:text-[#003B7A] text-[12px] font-bold flex items-center gap-1 transition-colors">
      <span>Xem tất cả</span>
      <ArrowRight size={14} />
    </button>
  );

  return (
    <AdminCard 
      title="Lead tư vấn mới nhất" 
      subtitle="Khách để lại thông tin cần chăm sóc"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      {/* List content with scrollbar */}
      <div className="flex-1 space-y-3 mt-2 overflow-y-auto admin-scrollbar pr-1">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-[#64748B] text-[13px] font-medium">
            Không tìm thấy lead nào phù hợp.
          </div>
        ) : (
          filteredLeads.map((lead, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-[#DCEBFF] hover:bg-[#F6FAFF] transition-all duration-150 bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Icon */}
                <div className="w-10 h-10 rounded-full bg-[#EEF6FF] border border-[#DCEBFF] flex items-center justify-center text-[#062B5F] shrink-0 font-extrabold text-sm shadow-sm">
                  {lead.name.split(" ").pop()?.charAt(0) || <User size={16} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-[#0B1F3A]">{lead.name}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone size={11} className="text-slate-400 shrink-0" /> {lead.phone}
                  </p>
                  <p className="text-[11.5px] font-medium text-slate-400 line-clamp-2 mt-0.5">
                    {lead.petInfo}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">{lead.time}</span>
                <button className="text-[12px] font-black text-[#0057E7] hover:underline px-2 py-0.5 rounded-lg hover:bg-blue-50 transition">
                  Gọi
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminCard>
  );
}
