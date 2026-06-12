import React from "react";
import { ArrowRight } from "lucide-react";
import { AdminCard } from "./admin-card";

interface ShopeeRequest {
  orderCode: string;
  amount: string;
  points: string;
  status: "Pending" | "Need info" | "Approved" | "Rejected";
  time: string;
}

interface AdminShopeeRequestListProps {
  searchValue: string;
}

export function AdminShopeeRequestList({ searchValue }: AdminShopeeRequestListProps) {
  const requests: ShopeeRequest[] = [
    {
      orderCode: "#240612A1B2C3",
      amount: "320.000đ",
      points: "32 điểm",
      status: "Pending",
      time: "5 phút trước"
    },
    {
      orderCode: "#240612D4E5F6",
      amount: "450.000đ",
      points: "45 điểm",
      status: "Pending",
      time: "15 phút trước"
    },
    {
      orderCode: "#240612G7H8I9",
      amount: "180.000đ",
      points: "18 điểm",
      status: "Pending",
      time: "22 phút trước"
    },
    {
      orderCode: "#240612J1K2L3",
      amount: "890.000đ",
      points: "89 điểm",
      status: "Pending",
      time: "35 phút trước"
    },
    {
      orderCode: "#240612M4N5O6",
      amount: "250.000đ",
      points: "25 điểm",
      status: "Need info",
      time: "1 giờ trước"
    }
  ];

  // Filter requests based on global search value
  const filteredRequests = requests.filter(req => {
    if (!searchValue) return true;
    const s = searchValue.toLowerCase();
    return req.orderCode.toLowerCase().includes(s);
  });

  const getStatusStyle = (status: ShopeeRequest["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "Need info":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "Approved":
        return "bg-green-50 text-green-600 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-600 border-red-200";
    }
  };

  const headerAction = (
    <button className="text-[#0057E7] hover:text-[#003B7A] text-[12px] font-bold flex items-center gap-1 transition-colors">
      <span>Xem tất cả</span>
      <ArrowRight size={14} />
    </button>
  );

  return (
    <AdminCard 
      title="Yêu cầu Shopee mới nhất" 
      subtitle="Đăng ký tích điểm Shopee"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="flex-1 mt-2 overflow-y-auto admin-scrollbar pr-1">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-[13px] font-medium">
            Không tìm thấy mã đơn nào phù hợp.
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {/* List items */}
            <div className="flex flex-col gap-2">
              {filteredRequests.map((req, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col p-3 text-[13px] font-bold text-[#0B1F3A] bg-white border border-[#DCEBFF] hover:border-[#0057E7]/30 hover:shadow-[0_4px_12px_rgba(0,87,231,0.05)] transition-all duration-200 rounded-xl group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-[#0B1F3A] group-hover:text-[#0057E7] transition-colors block leading-tight">
                        {req.orderCode}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold block mt-1">
                        {req.time}
                      </span>
                    </div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold leading-tight ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-[#DCEBFF]">
                    <div className="text-left text-slate-600 font-semibold flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Giá trị:</span>
                      {req.amount}
                    </div>
                    <div className="text-right text-[#0B1F3A] font-extrabold flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">Điểm:</span>
                      <span className="text-[#0057E7]">{req.points}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminCard>
  );
}
