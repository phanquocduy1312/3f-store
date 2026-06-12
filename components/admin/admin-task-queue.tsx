import React from "react";
import { 
  ShoppingBag, AlertTriangle, Sparkles, Package 
} from "lucide-react";
import { AdminCard } from "./admin-card";

interface TaskItem {
  title: string;
  subtitle: string;
  type: string;
  color: string;
  action: string;
}

export function AdminTaskQueue() {
  const tasks: TaskItem[] = [
    {
      title: "Yêu cầu Shopee đang chờ duyệt",
      subtitle: "18 yêu cầu mới",
      type: "shopee",
      color: "orange",
      action: "Xử lý"
    },
    {
      title: "Yêu cầu Shopee quá 48h",
      subtitle: "5 yêu cầu quá hạn",
      type: "warning",
      color: "yellow",
      action: "Xử lý"
    },
    {
      title: "Lead AI chưa gọi lại",
      subtitle: "23 lead mới",
      type: "ai",
      color: "purple",
      action: "Xử lý"
    },
    {
      title: "Đơn hàng cần xác nhận",
      subtitle: "12 đơn mới",
      type: "orders",
      color: "blue",
      action: "Xử lý"
    },
    {
      title: "Sản phẩm sắp hết hàng",
      subtitle: "7 sản phẩm",
      type: "stock",
      color: "red",
      action: "Xử lý"
    }
  ];

  // Helper to map color to classes
  const getColorClasses = (color: string) => {
    switch (color) {
      case "orange": return { bg: "bg-orange-50", text: "text-orange-600" };
      case "yellow": return { bg: "bg-amber-50", text: "text-amber-600" };
      case "purple": return { bg: "bg-purple-50", text: "text-purple-600" };
      case "blue": return { bg: "bg-blue-50", text: "text-blue-600" };
      case "red": return { bg: "bg-red-50", text: "text-red-600" };
      default: return { bg: "bg-slate-50", text: "text-slate-600" };
    }
  };

  // Helper to map type to icons
  const getIcon = (type: string) => {
    switch (type) {
      case "shopee": return ShoppingBag;
      case "warning": return AlertTriangle;
      case "ai": return Sparkles;
      case "orders": return ShoppingBag;
      case "stock": return Package;
      default: return AlertTriangle;
    }
  };

  return (
    <AdminCard 
      title="Cần xử lý hôm nay" 
      subtitle="Các việc ảnh hưởng trực tiếp đến vận hành"
      action={<span className="w-2.5 h-2.5 bg-[#EF3340] rounded-full animate-ping shrink-0" />}
      className="h-[430px] flex flex-col"
    >
      <div className="flex-1 min-h-0 overflow-y-auto admin-scrollbar space-y-2.5 pr-1">
        {tasks.map((task, idx) => {
          const TaskIcon = getIcon(task.type);
          const colorStyles = getColorClasses(task.color);
          return (
            <div 
              key={idx}
              className="flex items-center justify-between gap-3 p-3 px-4 rounded-2xl border border-[#DCEBFF] bg-[#FBFDFF] hover:bg-[#F6FAFF] transition duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${colorStyles.bg} ${colorStyles.text}`}>
                  <TaskIcon size={18} />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[13px] font-bold text-[#0B1F3A] line-clamp-2 leading-tight">
                    {task.title}
                  </h5>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {task.subtitle}
                  </p>
                </div>
              </div>

              <button className="h-8 px-3 rounded-xl bg-white border border-[#DCEBFF] text-[#0057E7] font-bold text-xs hover:bg-[#0057E7] hover:text-white transition duration-150 flex items-center gap-1 shrink-0">
                <span>{task.action}</span>
              </button>
            </div>
          );
        })}
      </div>
    </AdminCard>
  );
}
