import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  getWorkflowStatuses,
  saveWorkflowStatus,
  deleteWorkflowStatus,
  getWorkflowTransitions,
  saveWorkflowTransition,
  deleteWorkflowTransition,
  getAutomationRules,
  saveAutomationRule,
  deleteAutomationRule,
  getShippingProviders,
  saveShippingProvider,
  deleteShippingProvider,
  getNotificationChannels,
  saveNotificationChannel,
  deleteNotificationChannel,
  WorkflowStatusSetting,
  WorkflowTransitionSetting,
  AutomationRuleSetting,
  ShippingProviderSetting,
  NotificationChannelSetting
} from "@/src/api/workflowApi";
import {
  Layers,
  GitBranch,
  Cpu,
  Truck,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Lock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Settings
} from "lucide-react";

type TabKey = "statuses" | "transitions" | "automation" | "shipping" | "notifications";

const GROUP_LABEL_MAP: Record<string, string> = {
  order: "Trạng thái đơn hàng",
  payment: "Trạng thái thanh toán",
  shipping: "Trạng thái vận chuyển",
  loyalty: "Trạng thái tích điểm",
};

const CRITICAL_KEYS = ["completed", "cancelled", "paid", "refunded", "credited"];

export function AdminWorkflowSettingsPage() {
  const [activeMenu, setActiveMenu] = useState("Cấu hình Workflow");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState<TabKey>("statuses");
  const [isLoading, setIsLoading] = useState(false);

  // Lists state
  const [statuses, setStatuses] = useState<WorkflowStatusSetting[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransitionSetting[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRuleSetting[]>([]);
  const [shippingProviders, setShippingProviders] = useState<ShippingProviderSetting[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannelSetting[]>([]);

  // Modals state
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; data?: WorkflowStatusSetting }>({ isOpen: false });
  const [transitionModal, setTransitionModal] = useState<{ isOpen: boolean; data?: WorkflowTransitionSetting }>({ isOpen: false });
  const [ruleModal, setRuleModal] = useState<{ isOpen: boolean; data?: AutomationRuleSetting }>({ isOpen: false });
  const [shippingModal, setShippingModal] = useState<{ isOpen: boolean; data?: ShippingProviderSetting }>({ isOpen: false });
  const [notificationModal, setNotificationModal] = useState<{ isOpen: boolean; data?: NotificationChannelSetting }>({ isOpen: false });

  // Form states helper
  const [statusForm, setStatusForm] = useState<Partial<WorkflowStatusSetting>>({});
  const [transitionForm, setTransitionForm] = useState<Partial<WorkflowTransitionSetting>>({});
  const [ruleForm, setRuleForm] = useState<Partial<AutomationRuleSetting>>({});
  const [shippingForm, setShippingForm] = useState<Partial<ShippingProviderSetting>>({});
  const [notificationForm, setNotificationForm] = useState<Partial<NotificationChannelSetting>>({});

  const [adminRole, setAdminRole] = useState("admin");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminRole(user.role || "admin");
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const fetchData = async () => {
    // Only fetch if role is allowed
    const userStr = localStorage.getItem("admin_user");
    let role = "admin";
    try {
      if (userStr) {
        const u = JSON.parse(userStr);
        role = u.role || "admin";
      }
    } catch (e) {}
    if (role !== "super_admin" && role !== "dev") {
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "statuses") {
        const res = await getWorkflowStatuses();
        if (res.success) setStatuses(res.data);
      } else if (activeTab === "transitions") {
        // We also need statuses for select options
        const [transRes, statRes] = await Promise.all([getWorkflowTransitions(), getWorkflowStatuses()]);
        if (transRes.success) setTransitions(transRes.data);
        if (statRes.success) setStatuses(statRes.data);
      } else if (activeTab === "automation") {
        const [rulesRes, statRes] = await Promise.all([getAutomationRules(), getWorkflowStatuses()]);
        if (rulesRes.success) setAutomationRules(rulesRes.data);
        if (statRes.success) setStatuses(statRes.data);
      } else if (activeTab === "shipping") {
        const res = await getShippingProviders();
        if (res.success) setShippingProviders(res.data);
      } else if (activeTab === "notifications") {
        const res = await getNotificationChannels();
        if (res.success) setNotificationChannels(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải cấu hình.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, adminRole]);

  // STATUS CRUD actions
  const handleOpenStatusModal = (item?: WorkflowStatusSetting) => {
    if (item) {
      setStatusForm(item);
      setStatusModal({ isOpen: true, data: item });
    } else {
      setStatusForm({
        group_key: "order",
        status_key: "",
        label: "",
        description: "",
        color: "#3b82f6",
        sort_order: 0,
        is_active: 1,
        is_default: 0,
        is_terminal: 0
      });
      setStatusModal({ isOpen: true });
    }
  };

  const handleSaveStatus = async () => {
    try {
      if (!statusForm.group_key || !statusForm.status_key || !statusForm.label) {
        toast.error("Vui lòng nhập đầy đủ Group, Key và Nhãn hiển thị.");
        return;
      }
      const payload: WorkflowStatusSetting = {
        id: statusForm.id,
        group_key: statusForm.group_key,
        status_key: statusForm.status_key,
        label: statusForm.label,
        description: statusForm.description || "",
        color: statusForm.color || "#3b82f6",
        sort_order: statusForm.sort_order ?? 0,
        is_active: statusForm.is_active ?? 1,
        is_default: statusForm.is_default ?? 0,
        is_terminal: statusForm.is_terminal ?? 0
      };
      const res = await saveWorkflowStatus(payload);
      if (res.success) {
        toast.success("Lưu trạng thái thành công!");
        setStatusModal({ isOpen: false });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu trạng thái.");
    }
  };

  const handleDeleteStatus = async (id: number, key: string) => {
    if (CRITICAL_KEYS.includes(key)) {
      toast.error(`Không thể xóa trạng thái hệ thống: ${key}`);
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa trạng thái này? Các quy trình chuyển đổi liên quan cũng sẽ bị ảnh hưởng.")) {
      return;
    }
    try {
      const res = await deleteWorkflowStatus(id);
      if (res.success) {
        toast.success("Xóa trạng thái thành công!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa trạng thái.");
    }
  };

  // TRANSITION CRUD actions
  const handleOpenTransitionModal = (item?: WorkflowTransitionSetting) => {
    if (item) {
      setTransitionForm(item);
      setTransitionModal({ isOpen: true, data: item });
    } else {
      setTransitionForm({
        group_key: "order",
        from_status: "",
        to_status: "",
        label: "",
        requires_reason: 0,
        requires_permission: null,
        is_active: 1,
        sort_order: 0
      });
      setTransitionModal({ isOpen: true });
    }
  };

  const handleSaveTransition = async () => {
    try {
      if (!transitionForm.group_key || !transitionForm.from_status || !transitionForm.to_status || !transitionForm.label) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
        return;
      }
      const payload: WorkflowTransitionSetting = {
        id: transitionForm.id,
        group_key: transitionForm.group_key,
        from_status: transitionForm.from_status,
        to_status: transitionForm.to_status,
        label: transitionForm.label,
        requires_reason: transitionForm.requires_reason ?? 0,
        requires_permission: transitionForm.requires_permission || null,
        is_active: transitionForm.is_active ?? 1,
        sort_order: transitionForm.sort_order ?? 0
      };
      const res = await saveWorkflowTransition(payload);
      if (res.success) {
        toast.success("Lưu quy trình chuyển đổi thành công!");
        setTransitionModal({ isOpen: false });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu quy trình.");
    }
  };

  const handleDeleteTransition = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quy trình chuyển đổi này?")) return;
    try {
      const res = await deleteWorkflowTransition(id);
      if (res.success) {
        toast.success("Xóa quy trình thành công!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa quy trình.");
    }
  };

  // AUTOMATION CRUD actions
  const handleOpenRuleModal = (item?: AutomationRuleSetting) => {
    if (item) {
      setRuleForm({
        ...item,
        conditions: item.conditions ? JSON.stringify(item.conditions, null, 2) : "{}",
        actions: item.actions ? JSON.stringify(item.actions, null, 2) : "[]"
      });
      setRuleModal({ isOpen: true, data: item });
    } else {
      setRuleForm({
        name: "",
        trigger_type: "order_status_changed",
        trigger_group: "order",
        from_status: "",
        to_status: "",
        conditions: "{}",
        actions: "[]",
        is_active: 1
      });
      setRuleModal({ isOpen: true });
    }
  };

  const handleSaveRule = async () => {
    try {
      if (!ruleForm.name || !ruleForm.trigger_type || !ruleForm.actions) {
        toast.error("Vui lòng điền Tên, Trigger và Hành động.");
        return;
      }
      
      let parsedConditions = null;
      let parsedActions = [];
      try {
        if (ruleForm.conditions) {
          parsedConditions = JSON.parse(ruleForm.conditions as unknown as string);
        }
        parsedActions = JSON.parse(ruleForm.actions as unknown as string);
      } catch (e) {
        toast.error("Conditions hoặc Actions JSON không hợp lệ.");
        return;
      }

      const payload: AutomationRuleSetting = {
        id: ruleForm.id,
        name: ruleForm.name,
        trigger_type: ruleForm.trigger_type,
        trigger_group: ruleForm.trigger_group || null,
        from_status: ruleForm.from_status || null,
        to_status: ruleForm.to_status || null,
        conditions: parsedConditions,
        actions: parsedActions,
        is_active: ruleForm.is_active ?? 1
      };

      const res = await saveAutomationRule(payload);
      if (res.success) {
        toast.success("Lưu luật tự động thành công!");
        setRuleModal({ isOpen: false });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu luật tự động.");
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa luật tự động này?")) return;
    try {
      const res = await deleteAutomationRule(id);
      if (res.success) {
        toast.success("Xóa luật tự động thành công!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa luật tự động.");
    }
  };

  // SHIPPING CRUD actions
  const handleOpenShippingModal = (item?: ShippingProviderSetting) => {
    if (item) {
      setShippingForm({
        ...item,
        config: item.config ? JSON.stringify(item.config, null, 2) : "{}"
      });
      setShippingModal({ isOpen: true, data: item });
    } else {
      setShippingForm({
        provider_key: "",
        label: "",
        type: "manual",
        config: "{}",
        is_active: 1,
        sort_order: 0
      });
      setShippingModal({ isOpen: true });
    }
  };

  const handleSaveShipping = async () => {
    try {
      if (!shippingForm.provider_key || !shippingForm.label) {
        toast.error("Vui lòng nhập Key và Tên nhà vận chuyển.");
        return;
      }

      let parsedConfig = {};
      try {
        if (shippingForm.config) {
          parsedConfig = JSON.parse(shippingForm.config as unknown as string);
        }
      } catch (e) {
        toast.error("Cấu hình config JSON không hợp lệ.");
        return;
      }

      const payload: ShippingProviderSetting = {
        id: shippingForm.id,
        provider_key: shippingForm.provider_key,
        label: shippingForm.label,
        type: shippingForm.type || "manual",
        config: parsedConfig,
        is_active: shippingForm.is_active ?? 1,
        sort_order: shippingForm.sort_order ?? 0
      };

      const res = await saveShippingProvider(payload);
      if (res.success) {
        toast.success("Lưu nhà vận chuyển thành công!");
        setShippingModal({ isOpen: false });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu nhà vận chuyển.");
    }
  };

  const handleDeleteShipping = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhà vận chuyển này?")) return;
    try {
      const res = await deleteShippingProvider(id);
      if (res.success) {
        toast.success("Xóa nhà vận chuyển thành công!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa nhà vận chuyển.");
    }
  };

  // NOTIFICATION CRUD actions
  const handleOpenNotificationModal = (item: NotificationChannelSetting) => {
    setNotificationForm({
      ...item,
      config: item.config ? JSON.stringify(item.config, null, 2) : "{}"
    });
    setNotificationModal({ isOpen: true, data: item });
  };

  const handleSaveNotification = async () => {
    try {
      if (!notificationForm.channel_key || !notificationForm.label) {
        toast.error("Vui lòng điền đủ trường Key và Nhãn.");
        return;
      }

      let parsedConfig = {};
      try {
        if (notificationForm.config) {
          parsedConfig = JSON.parse(notificationForm.config as unknown as string);
        }
      } catch (e) {
        toast.error("Cấu hình JSON không hợp lệ.");
        return;
      }

      const payload: NotificationChannelSetting = {
        id: notificationForm.id,
        channel_key: notificationForm.channel_key,
        label: notificationForm.label,
        provider: notificationForm.provider || null,
        config: parsedConfig,
        is_active: notificationForm.is_active ?? 1
      };

      const res = await saveNotificationChannel(payload);
      if (res.success) {
        toast.success("Lưu kênh thông báo thành công!");
        setNotificationModal({ isOpen: false });
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu kênh thông báo.");
    }
  };

  if (adminRole !== "super_admin" && adminRole !== "dev") {
    return (
      <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
        <AdminSidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
          collapsed={sidebarCollapsed} 
        />

        <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
          sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
        }`}>
          <AdminHeader 
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            searchValue=""
            onSearchChange={() => {}}
            selectedDate="today"
            onDateChange={() => {}}
          />

          <main className="flex-1 px-4 sm:px-6 py-6 flex items-center justify-center">
            <div className="text-center p-8 bg-white border border-[#DCEBFF] rounded-3xl max-w-md shadow-sm">
              <h1 className="text-lg font-black text-[#0B1F3A] mb-2">Truy cập bị hạn chế</h1>
              <p className="text-xs text-amber-600 font-bold bg-amber-50 p-3 rounded-2xl border border-amber-100 mb-4">
                Khu vực cấu hình nâng cao, chỉ dành cho quản trị hệ thống.
              </p>
              <button 
                onClick={() => window.location.href = "/admin/orders"}
                className="px-4 py-2 bg-[#0057E7] hover:bg-[#003B7A] text-white text-xs font-bold rounded-xl transition"
              >
                Quay lại Quản lý đơn hàng
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        collapsed={sidebarCollapsed}
      />

      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          selectedDate="today"
          onDateChange={() => {}}
        />

        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">
          <div>
            <h1 className="text-[24px] font-black text-[#0B1F3A]">Cấu hình Quy trình & Tự động hóa</h1>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
              Thiết lập trạng thái, quy trình nghiệp vụ, automation rules, các nhà vận chuyển và kênh thông báo của 3F Store.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#DCEBFF] gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => setActiveTab("statuses")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === "statuses"
                  ? "bg-[#0057E7] text-white shadow-md shadow-blue-500/10"
                  : "bg-white border border-[#DCEBFF] text-[#082B5F] hover:bg-[#EEF6FF]"
              }`}
            >
              <Layers size={14} /> Trạng thái
            </button>
            <button
              onClick={() => setActiveTab("transitions")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === "transitions"
                  ? "bg-[#0057E7] text-white shadow-md shadow-blue-500/10"
                  : "bg-white border border-[#DCEBFF] text-[#082B5F] hover:bg-[#EEF6FF]"
              }`}
            >
              <GitBranch size={14} /> Quy trình chuyển đổi
            </button>
            <button
              onClick={() => setActiveTab("automation")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === "automation"
                  ? "bg-[#0057E7] text-white shadow-md shadow-blue-500/10"
                  : "bg-white border border-[#DCEBFF] text-[#082B5F] hover:bg-[#EEF6FF]"
              }`}
            >
              <Cpu size={14} /> Tự động hóa
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === "shipping"
                  ? "bg-[#0057E7] text-white shadow-md shadow-blue-500/10"
                  : "bg-white border border-[#DCEBFF] text-[#082B5F] hover:bg-[#EEF6FF]"
              }`}
            >
              <Truck size={14} /> Nhà vận chuyển
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                activeTab === "notifications"
                  ? "bg-[#0057E7] text-white shadow-md shadow-blue-500/10"
                  : "bg-white border border-[#DCEBFF] text-[#082B5F] hover:bg-[#EEF6FF]"
              }`}
            >
              <Bell size={14} /> Kênh thông báo
            </button>
          </div>

          {/* Dynamic Content Panel */}
          <div className="rounded-[24px] border border-[#DCEBFF] bg-white p-5 shadow-[0_8px_24px_rgba(6,43,95,0.04)] min-h-[400px]">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-xs font-bold text-gray-400">
                Đang tải cấu hình...
              </div>
            ) : (
              <>
                {/* 1. Tab Statuses */}
                {activeTab === "statuses" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-black text-[#0B1F3A]">Quản lý Trạng thái</h3>
                      <button
                        onClick={() => handleOpenStatusModal()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0057E7] text-white text-xs font-bold hover:bg-[#003B7A] transition"
                      >
                        <Plus size={14} /> Thêm trạng thái
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B] font-bold">
                            <th className="px-4 py-3">Nhóm</th>
                            <th className="px-4 py-3">Key trạng thái</th>
                            <th className="px-4 py-3">Tên nhãn</th>
                            <th className="px-4 py-3">Mô tả</th>
                            <th className="px-4 py-3">Màu sắc</th>
                            <th className="px-4 py-3 text-center">Thứ tự</th>
                            <th className="px-4 py-3 text-center">Mặc định</th>
                            <th className="px-4 py-3 text-center">Terminal</th>
                            <th className="px-4 py-3 text-center">Kích hoạt</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statuses.map((item) => (
                            <tr key={item.id} className="border-b border-[#EEF6FF] hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-bold text-gray-600">
                                {GROUP_LABEL_MAP[item.group_key] || item.group_key}
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-gray-500">
                                {item.status_key}
                                {CRITICAL_KEYS.includes(item.status_key) && (
                                  <span title="Trạng thái hệ thống khóa">
                                    <Lock size={12} className="inline ml-1 text-slate-400" />
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-black text-[#0b1f3a]">{item.label}</td>
                              <td className="px-4 py-3 text-gray-400 font-semibold">{item.description}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="h-3 w-3 rounded-full shrink-0 border" style={{ backgroundColor: item.color }} />
                                  <span className="font-mono text-gray-400">{item.color}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-[#0b1f3a]">{item.sort_order}</td>
                              <td className="px-4 py-3 text-center">
                                {item.is_default === 1 ? (
                                  <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">Default</span>
                                ) : "-"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.is_terminal === 1 ? (
                                  <span className="text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded border">Terminal</span>
                                ) : "-"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.is_active === 1 ? (
                                  <CheckCircle size={15} className="inline text-green-500" />
                                ) : (
                                  <XCircle size={15} className="inline text-red-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenStatusModal(item)}
                                    className="p-1 rounded bg-slate-50 text-slate-650 hover:bg-slate-100"
                                    title="Sửa"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  {!CRITICAL_KEYS.includes(item.status_key) ? (
                                    <button
                                      onClick={() => handleDeleteStatus(item.id!, item.status_key)}
                                      className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                      title="Xóa"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="p-1 rounded bg-gray-50 text-gray-300 cursor-not-allowed"
                                      title="Không được xóa trạng thái hệ thống"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Tab Transitions */}
                {activeTab === "transitions" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-black text-[#0B1F3A]">Quản lý Chuyển đổi trạng thái</h3>
                      <button
                        onClick={() => handleOpenTransitionModal()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0057E7] text-white text-xs font-bold hover:bg-[#003B7A] transition"
                      >
                        <Plus size={14} /> Thêm quy trình
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B] font-bold">
                            <th className="px-4 py-3">Nhóm</th>
                            <th className="px-4 py-3">Trạng thái gốc</th>
                            <th className="px-4 py-3">Trạng thái đích</th>
                            <th className="px-4 py-3">Nhãn nút hành động</th>
                            <th className="px-4 py-3 text-center">Yêu cầu lý do</th>
                            <th className="px-4 py-3">Quyền tối thiểu</th>
                            <th className="px-4 py-3 text-center">Thứ tự</th>
                            <th className="px-4 py-3 text-center">Kích hoạt</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transitions.map((item) => (
                            <tr key={item.id} className="border-b border-[#EEF6FF] hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-bold text-gray-600">
                                {GROUP_LABEL_MAP[item.group_key] || item.group_key}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-gray-500 font-bold bg-slate-100 px-2 py-0.5 rounded border">
                                  {item.from_status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-[#0057E7] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {item.to_status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-black text-[#0b1f3a]">{item.label}</td>
                              <td className="px-4 py-3 text-center">
                                {item.requires_reason === 1 ? (
                                  <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Có</span>
                                ) : "Không"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-400">
                                {item.requires_permission || "Mọi admin"}
                              </td>
                              <td className="px-4 py-3 text-center font-bold">{item.sort_order}</td>
                              <td className="px-4 py-3 text-center">
                                {item.is_active === 1 ? (
                                  <CheckCircle size={15} className="inline text-green-500" />
                                ) : (
                                  <XCircle size={15} className="inline text-red-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenTransitionModal(item)}
                                    className="p-1 rounded bg-slate-50 text-slate-650 hover:bg-slate-100"
                                    title="Sửa"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransition(item.id!)}
                                    className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                    title="Xóa"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Tab Automation */}
                {activeTab === "automation" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-black text-[#0B1F3A]">Quản lý Luật tự động hóa</h3>
                      <button
                        onClick={() => handleOpenRuleModal()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0057E7] text-white text-xs font-bold hover:bg-[#003B7A] transition"
                      >
                        <Plus size={14} /> Thêm luật
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B] font-bold">
                            <th className="px-4 py-3">Tên luật</th>
                            <th className="px-4 py-3">Sự kiện kích hoạt</th>
                            <th className="px-4 py-3">Trạng thái cũ</th>
                            <th className="px-4 py-3">Trạng thái mới</th>
                            <th className="px-4 py-3">Hành động tự động</th>
                            <th className="px-4 py-3 text-center">Kích hoạt</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {automationRules.map((item) => (
                            <tr key={item.id} className="border-b border-[#EEF6FF] hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-bold text-[#0b1f3a]">{item.name}</td>
                              <td className="px-4 py-3">
                                <span className="text-[11px] font-extrabold uppercase bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-100">
                                  {item.trigger_type}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-500">
                                {item.from_status || "Bất kỳ"}
                              </td>
                              <td className="px-4 py-3 font-mono text-gray-500">
                                {item.to_status || "Bất kỳ"}
                              </td>
                              <td className="px-4 py-3 text-xs">
                                <pre className="font-mono bg-slate-50 border p-2 rounded text-[10px] text-gray-600 max-w-sm overflow-x-auto max-h-24">
                                  {JSON.stringify(item.actions, null, 2)}
                                </pre>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.is_active === 1 ? (
                                  <CheckCircle size={15} className="inline text-green-500" />
                                ) : (
                                  <XCircle size={15} className="inline text-red-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenRuleModal(item)}
                                    className="p-1 rounded bg-slate-50 text-slate-650 hover:bg-slate-100"
                                    title="Sửa"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRule(item.id!)}
                                    className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                    title="Xóa"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Tab Shipping */}
                {activeTab === "shipping" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-black text-[#0B1F3A]">Quản lý Hãng giao vận</h3>
                      <button
                        onClick={() => handleOpenShippingModal()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0057E7] text-white text-xs font-bold hover:bg-[#003B7A] transition"
                      >
                        <Plus size={14} /> Thêm hãng ship
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B] font-bold">
                            <th className="px-4 py-3">Mã hãng</th>
                            <th className="px-4 py-3">Tên nhà vận chuyển</th>
                            <th className="px-4 py-3">Loại kết nối</th>
                            <th className="px-4 py-3">Cài đặt kết nối</th>
                            <th className="px-4 py-3 text-center">Thứ tự</th>
                            <th className="px-4 py-3 text-center">Kích hoạt</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shippingProviders.map((item) => (
                            <tr key={item.id} className="border-b border-[#EEF6FF] hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono font-bold text-gray-500">{item.provider_key}</td>
                              <td className="px-4 py-3 font-bold text-[#0b1f3a]">{item.label}</td>
                              <td className="px-4 py-3 font-bold">
                                {item.type === "internal" ? (
                                  <span className="text-blue-750 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Nội bộ</span>
                                ) : item.type === "third_party" ? (
                                  <span className="text-purple-750 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">API đối tác</span>
                                ) : (
                                  <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded border">Thủ công</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs">
                                {item.config ? (
                                  <pre className="font-mono bg-slate-50 border p-2 rounded text-[10px] text-gray-600 max-h-20 overflow-y-auto">
                                    {JSON.stringify(item.config, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-gray-400 italic">Thủ công (Chưa cấu hình API credentials)</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-bold">{item.sort_order}</td>
                              <td className="px-4 py-3 text-center">
                                {item.is_active === 1 ? (
                                  <CheckCircle size={15} className="inline text-green-500" />
                                ) : (
                                  <XCircle size={15} className="inline text-red-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenShippingModal(item)}
                                    className="p-1 rounded bg-slate-50 text-slate-650 hover:bg-slate-100"
                                    title="Sửa"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShipping(item.id!)}
                                    className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                                    title="Xóa"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Tab Notifications */}
                {activeTab === "notifications" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <h3 className="text-sm font-black text-[#0B1F3A]">Quản lý Kênh thông báo gửi đi</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[12.5px]">
                        <thead>
                          <tr className="border-b border-[#EEF6FF] bg-slate-50 text-[#64748B] font-bold">
                            <th className="px-4 py-3">Kênh gửi</th>
                            <th className="px-4 py-3">Nhãn</th>
                            <th className="px-4 py-3">Cổng kết nối (Provider)</th>
                            <th className="px-4 py-3">Cấu hình</th>
                            <th className="px-4 py-3 text-center">Trạng thái gửi</th>
                            <th className="px-4 py-3 text-center">Kích hoạt</th>
                            <th className="px-4 py-3 text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notificationChannels.map((item) => (
                            <tr key={item.id} className="border-b border-[#EEF6FF] hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono font-bold text-gray-500">{item.channel_key}</td>
                              <td className="px-4 py-3 font-bold text-[#0b1f3a]">{item.label}</td>
                              <td className="px-4 py-3 font-bold text-gray-600">{item.provider || "-"}</td>
                              <td className="px-4 py-3 text-xs">
                                {item.config ? (
                                  <pre className="font-mono bg-slate-50 border p-2 rounded text-[10px] text-gray-600 max-h-20 overflow-y-auto">
                                    {JSON.stringify(item.config, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Chưa cấu hình</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-semibold">
                                {item.config ? (
                                  <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Sẵn sàng</span>
                                ) : (
                                  <span className="text-gray-400 italic">Chưa kết nối</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.is_active === 1 ? (
                                  <CheckCircle size={15} className="inline text-green-500" />
                                ) : (
                                  <XCircle size={15} className="inline text-red-400" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleOpenNotificationModal(item)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm"
                                  title="Sửa cấu hình kết nối"
                                >
                                  Cấu hình cổng
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODALS DIALOGS */}
      {/* ============================================================== */}

      {/* A. Status Edit/Create Modal */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStatusModal({ isOpen: false })} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4 z-10">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">
              {statusForm.id ? "Cập nhật trạng thái" : "Thêm trạng thái mới"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nhóm trạng thái</label>
                <select
                  disabled={!!statusForm.id && CRITICAL_KEYS.includes(statusForm.status_key || "")}
                  value={statusForm.group_key}
                  onChange={(e) => setStatusForm({ ...statusForm, group_key: e.target.value })}
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                >
                  <option value="order">Trạng thái đơn hàng</option>
                  <option value="payment">Trạng thái thanh toán</option>
                  <option value="shipping">Trạng thái vận chuyển</option>
                  <option value="loyalty">Trạng thái tích điểm</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mã Key trạng thái</label>
                <input
                  type="text"
                  disabled={!!statusForm.id}
                  value={statusForm.status_key}
                  onChange={(e) => setStatusForm({ ...statusForm, status_key: e.target.value })}
                  placeholder="e.g. pending_confirmation, paid, shipping"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none placeholder:text-gray-300"
                />
                {statusForm.id && CRITICAL_KEYS.includes(statusForm.status_key || "") && (
                  <span className="text-[10px] text-red-500 font-semibold mt-1 block">Trạng thái hệ thống: Không thể đổi mã Key.</span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tên nhãn hiển thị</label>
                <input
                  type="text"
                  value={statusForm.label}
                  onChange={(e) => setStatusForm({ ...statusForm, label: e.target.value })}
                  placeholder="e.g. Chờ xác nhận"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mô tả ngắn</label>
                <textarea
                  value={statusForm.description || ""}
                  onChange={(e) => setStatusForm({ ...statusForm, description: e.target.value })}
                  placeholder="Mô tả ý nghĩa trạng thái..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-semibold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Màu sắc đại diện</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={statusForm.color || "#3b82f6"}
                      onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="h-9 w-9 p-0.5 rounded border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={statusForm.color || "#3b82f6"}
                      onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-2 py-2 font-mono text-center font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={statusForm.sort_order ?? 0}
                    onChange={(e) => setStatusForm({ ...statusForm, sort_order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center pt-2">
                <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusForm.is_active === 1}
                    onChange={(e) => setStatusForm({ ...statusForm, is_active: e.target.checked ? 1 : 0 })}
                    className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                  />
                  Kích hoạt hoạt động
                </label>

                <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusForm.is_default === 1}
                    onChange={(e) => setStatusForm({ ...statusForm, is_default: e.target.checked ? 1 : 0 })}
                    className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                  />
                  Mặc định khởi tạo
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statusForm.is_terminal === 1}
                    onChange={(e) => setStatusForm({ ...statusForm, is_terminal: e.target.checked ? 1 : 0 })}
                    className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                  />
                  Là trạng thái kết thúc (Terminal)
                </label>
                <p className="text-[10px] text-gray-400 font-semibold ml-6.5 mt-0.5">Không thể chuyển sang trạng thái khác từ trạng thái Terminal trừ khi có đặc quyền đặc biệt.</p>
              </div>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false })}
                className="flex-1 py-2.5 border border-[#dcebff] rounded-xl text-xs font-bold text-[#64748b] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="flex-1 py-2.5 bg-[#0057E7] hover:bg-[#003B7A] rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. Transition Edit/Create Modal */}
      {transitionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTransitionModal({ isOpen: false })} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4 z-10">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">
              {transitionForm.id ? "Cập nhật quy trình chuyển trạng thái" : "Thêm quy trình chuyển trạng thái mới"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nhóm trạng thái</label>
                <select
                  value={transitionForm.group_key}
                  onChange={(e) => setTransitionForm({ ...transitionForm, group_key: e.target.value, from_status: "", to_status: "" })}
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                >
                  <option value="order">Trạng thái đơn hàng</option>
                  <option value="payment">Trạng thái thanh toán</option>
                  <option value="shipping">Trạng thái vận chuyển</option>
                  <option value="loyalty">Trạng thái tích điểm</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Trạng thái gốc (From)</label>
                  <select
                    value={transitionForm.from_status}
                    onChange={(e) => setTransitionForm({ ...transitionForm, from_status: e.target.value })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Chọn --</option>
                    {statuses
                      .filter((s) => s.group_key === transitionForm.group_key)
                      .map((s) => (
                        <option key={s.id} value={s.status_key}>
                          {s.label} ({s.status_key})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Trạng thái đích (To)</label>
                  <select
                    value={transitionForm.to_status}
                    onChange={(e) => setTransitionForm({ ...transitionForm, to_status: e.target.value })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Chọn --</option>
                    {statuses
                      .filter((s) => s.group_key === transitionForm.group_key)
                      .map((s) => (
                        <option key={s.id} value={s.status_key}>
                          {s.label} ({s.status_key})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nhãn nút hành động</label>
                <input
                  type="text"
                  value={transitionForm.label}
                  onChange={(e) => setTransitionForm({ ...transitionForm, label: e.target.value })}
                  placeholder="e.g. Xác nhận giao hàng, Hủy giao"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Yêu cầu nhập lý do</label>
                  <select
                    value={transitionForm.requires_reason}
                    onChange={(e) => setTransitionForm({ ...transitionForm, requires_reason: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  >
                    <option value={0}>Không yêu cầu</option>
                    <option value={1}>Bắt buộc nhập</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Thứ tự ưu tiên</label>
                  <input
                    type="number"
                    value={transitionForm.sort_order ?? 0}
                    onChange={(e) => setTransitionForm({ ...transitionForm, sort_order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Quyền hạn tối thiểu (Optional)</label>
                <input
                  type="text"
                  value={transitionForm.requires_permission || ""}
                  onChange={(e) => setTransitionForm({ ...transitionForm, requires_permission: e.target.value || null })}
                  placeholder="e.g. superadmin, manager (để trống nếu cho phép tất cả)"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-semibold text-[#0b1f3a] focus:bg-white focus:outline-none placeholder:text-gray-300"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={transitionForm.is_active === 1}
                  onChange={(e) => setTransitionForm({ ...transitionForm, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                />
                Quy trình đang hoạt động
              </label>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setTransitionModal({ isOpen: false })}
                className="flex-1 py-2.5 border border-[#dcebff] rounded-xl text-xs font-bold text-[#64748b] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveTransition}
                className="flex-1 py-2.5 bg-[#0057E7] hover:bg-[#003B7A] rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. Automation Rule Edit/Create Modal */}
      {ruleModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRuleModal({ isOpen: false })} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4 z-10">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">
              {ruleForm.id ? "Cập nhật luật tự động hóa" : "Thêm luật tự động hóa mới"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tên luật tự động</label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Tự động gửi Email chúc mừng sinh nhật"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Loại sự kiện (Trigger)</label>
                  <select
                    value={ruleForm.trigger_type}
                    onChange={(e) => setRuleForm({ ...ruleForm, trigger_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  >
                    <option value="order_status_changed">Trạng thái đơn thay đổi</option>
                    <option value="payment_status_changed">Trạng thái thanh toán thay đổi</option>
                    <option value="shipping_status_changed">Trạng thái ship thay đổi</option>
                    <option value="loyalty_status_changed">Trạng thái tích điểm thay đổi</option>
                    <option value="customer_tier_changed">Hạng thành viên thay đổi</option>
                    <option value="birthday">Sinh nhật khách hàng</option>
                    <option value="abandoned_cart">Giỏ hàng bỏ quên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nhóm sự kiện</label>
                  <select
                    value={ruleForm.trigger_group || ""}
                    onChange={(e) => setRuleForm({ ...ruleForm, trigger_group: e.target.value })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  >
                    <option value="order">Đơn hàng (order)</option>
                    <option value="payment">Thanh toán (payment)</option>
                    <option value="shipping">Vận chuyển (shipping)</option>
                    <option value="loyalty">Tích điểm (loyalty)</option>
                    <option value="customer">Khách hàng (customer)</option>
                  </select>
                </div>
              </div>

              {ruleForm.trigger_type?.includes("_status_changed") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Trạng thái cũ (From Status)</label>
                    <select
                      value={ruleForm.from_status || ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, from_status: e.target.value || null })}
                      className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                    >
                      <option value="">Bất kỳ (Any)</option>
                      {statuses
                        .filter((s) => s.group_key === ruleForm.trigger_group)
                        .map((s) => (
                          <option key={s.id} value={s.status_key}>
                            {s.label} ({s.status_key})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Trạng thái mới (To Status)</label>
                    <select
                      value={ruleForm.to_status || ""}
                      onChange={(e) => setRuleForm({ ...ruleForm, to_status: e.target.value || null })}
                      className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                    >
                      <option value="">Bất kỳ (Any)</option>
                      {statuses
                        .filter((s) => s.group_key === ruleForm.trigger_group)
                        .map((s) => (
                          <option key={s.id} value={s.status_key}>
                            {s.label} ({s.status_key})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Điều kiện kích hoạt (Conditions JSON)</label>
                <textarea
                  value={ruleForm.conditions as unknown as string}
                  onChange={(e) => setRuleForm({ ...ruleForm, conditions: e.target.value })}
                  placeholder='e.g. { "total_greater": 500000 }'
                  rows={2}
                  className="w-full font-mono rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Hành động tự động (Actions JSON)</label>
                <textarea
                  value={ruleForm.actions as unknown as string}
                  onChange={(e) => setRuleForm({ ...ruleForm, actions: e.target.value })}
                  placeholder='e.g. [ { "type": "send_email", "template": "order_confirmed" } ]'
                  rows={3}
                  className="w-full font-mono rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={ruleForm.is_active === 1}
                  onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                />
                Quy tắc tự động hóa đang hoạt động
              </label>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setRuleModal({ isOpen: false })}
                className="flex-1 py-2.5 border border-[#dcebff] rounded-xl text-xs font-bold text-[#64748b] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="flex-1 py-2.5 bg-[#0057E7] hover:bg-[#003B7A] rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. Shipping Provider Modal */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShippingModal({ isOpen: false })} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4 z-10">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">
              {shippingForm.id ? "Cập nhật đối tác vận chuyển" : "Thêm đối tác vận chuyển mới"}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mã đối tác (Key)</label>
                <input
                  type="text"
                  disabled={!!shippingForm.id}
                  value={shippingForm.provider_key}
                  onChange={(e) => setShippingForm({ ...shippingForm, provider_key: e.target.value })}
                  placeholder="e.g. ghn, ghtk, shipper_noi_bo"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tên nhà vận chuyển</label>
                <input
                  type="text"
                  value={shippingForm.label}
                  onChange={(e) => setShippingForm({ ...shippingForm, label: e.target.value })}
                  placeholder="e.g. Giao Hàng Nhanh"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Loại hình giao hàng</label>
                  <select
                    value={shippingForm.type}
                    onChange={(e) => setShippingForm({ ...shippingForm, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  >
                    <option value="internal">Shipper nội bộ</option>
                    <option value="third_party">API đối tác tích hợp</option>
                    <option value="manual">Thủ công / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={shippingForm.sort_order ?? 0}
                    onChange={(e) => setShippingForm({ ...shippingForm, sort_order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cấu hình kết nối API (Config JSON)</label>
                <textarea
                  value={shippingForm.config as unknown as string}
                  onChange={(e) => setShippingForm({ ...shippingForm, config: e.target.value })}
                  placeholder='e.g. { "api_token": "xxx", "shop_id": 123 }'
                  rows={4}
                  className="w-full font-mono rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={shippingForm.is_active === 1}
                  onChange={(e) => setShippingForm({ ...shippingForm, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                />
                Hãng ship đang kích hoạt hoạt động
              </label>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShippingModal({ isOpen: false })}
                className="flex-1 py-2.5 border border-[#dcebff] rounded-xl text-xs font-bold text-[#64748b] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveShipping}
                className="flex-1 py-2.5 bg-[#0057E7] hover:bg-[#003B7A] rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E. Notification Channel Modal */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNotificationModal({ isOpen: false })} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] space-y-4 z-10">
            <h3 className="text-base font-black text-[#0b1f3a] border-b pb-2">
              Cấu hình cổng thông báo ({notificationForm.label})
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mã kênh (Key)</label>
                <input
                  type="text"
                  disabled
                  value={notificationForm.channel_key}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 font-bold text-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nhãn hiển thị</label>
                <input
                  type="text"
                  value={notificationForm.label}
                  onChange={(e) => setNotificationForm({ ...notificationForm, label: e.target.value })}
                  placeholder="e.g. Zalo ZNS"
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tên cổng gửi (Provider)</label>
                <input
                  type="text"
                  value={notificationForm.provider || ""}
                  onChange={(e) => setNotificationForm({ ...notificationForm, provider: e.target.value || null })}
                  placeholder="e.g. Twilio, Viettel SMS, Sendgrid..."
                  className="w-full rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 font-bold text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cấu hình bảo mật/kết nối (Config JSON)</label>
                <textarea
                  value={notificationForm.config as unknown as string}
                  onChange={(e) => setNotificationForm({ ...notificationForm, config: e.target.value })}
                  placeholder='e.g. { "api_key": "xxx", "sender_id": "3FSTORE" }'
                  rows={4}
                  className="w-full font-mono rounded-xl border border-slate-100 bg-[#f6faff] px-4 py-2.5 text-[#0b1f3a] focus:bg-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={notificationForm.is_active === 1}
                  onChange={(e) => setNotificationForm({ ...notificationForm, is_active: e.target.checked ? 1 : 0 })}
                  className="h-4.5 w-4.5 rounded border-slate-150 text-[#0057E7] focus:ring-[#0057E7]"
                />
                Kích hoạt hoạt động
              </label>

            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setNotificationModal({ isOpen: false })}
                className="flex-1 py-2.5 border border-[#dcebff] rounded-xl text-xs font-bold text-[#64748b] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveNotification}
                className="flex-1 py-2.5 bg-[#0057E7] hover:bg-[#003B7A] rounded-xl text-xs font-bold text-white shadow-sm"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
