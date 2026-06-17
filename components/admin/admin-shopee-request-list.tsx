import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { AdminCard } from "./admin-card";
import { getShopeePointRequests } from "@/src/services/shopeePointApi";
import { formatCurrency } from "@/lib/shopee-requests";
import type { ShopeePointRequest } from "@/types/shopee";
interface ShopeeRequest {
  orderCode: string;
  amount: string;
  points: string;
  status: string;
  time: string;
}

interface AdminShopeeRequestListProps {
  searchValue: string;
}

export function AdminShopeeRequestList({ searchValue }: AdminShopeeRequestListProps) {
  const [requests, setRequests] = useState<ShopeeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const result = await getShopeePointRequests({ limit: 5 });
        const mapped = (result.data || []).map((row: any) => ({
          orderCode: row.shopeeOrderCode || "",
          amount: formatCurrency(Number(row.orderAmount || 0)),
          points: `${Number(row.expectedPoints || 0)} điểm`,
          status: row.processingStatus || "pending",
          time: new Date(row.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        }));
        setRequests(mapped);
      } catch (err) {
        console.error("Failed to load shopee requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter requests based on global search value
  const filteredRequests = requests.filter(req => {
    if (!searchValue) return true;
    const s = searchValue.toLowerCase();
    return req.orderCode.toLowerCase().includes(s);
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "need_info":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "approved":
        return "bg-green-50 text-green-600 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Chờ duyệt";
      case "need_info": return "Cần TT";
      case "approved": return "Đã duyệt";
      case "rejected": return "Từ chối";
      default: return status;
    }
  };

  const headerAction = (
    <Link to="/admin/shopee-requests" className="text-[#0057E7] hover:text-[#003B7A] text-[12px] font-bold flex items-center gap-1 transition-colors">
      <span>Xem tất cả</span>
      <ArrowRight size={14} />
    </Link>
  );

  return (
    <AdminCard 
      title="Yêu cầu Shopee mới nhất" 
      subtitle="Đăng ký tích điểm Shopee"
      action={headerAction}
      className="h-[360px] flex flex-col"
    >
      <div className="flex-1 mt-2 overflow-y-auto admin-scrollbar pr-1">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0057E7]" />
          </div>
        ) : filteredRequests.length === 0 ? (
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
                      {getStatusLabel(req.status)}
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
