import React, { useState, useEffect, useMemo } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminUploadBannerImage,
  type Banner,
  type BannerPlacement,
  type AdminBannerPayload
} from "@/src/api/bannersApi";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Save,
  Image as ImageIcon,
  Calendar,
  Eye,
  MousePointerClick,
  Percent,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export function AdminBannersPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Quản lý Banner");

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [formData, setFormData] = useState<AdminBannerPayload>({
    placement: "home_hero_slider",
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    button_text: "",
    is_active: 1,
    sort_order: 0,
    start_at: "",
    end_at: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch up to 100 banners to compute metrics and manage them easily
      const res = await adminGetBanners({ placement: "home_hero_slider", limit: 100 });
      if (res.success) {
        setBanners(res.data || []);
      } else {
        toast.error("Không thể tải danh sách banner");
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // KPI calculations
  const kpiStats = useMemo(() => {
    let total = banners.length;
    let active = 0;
    let totalClicks = 0;

    banners.forEach(b => {
      totalClicks += b.click_count || 0;
      if (b.is_active === 1) {
        active++;
      }
    });

    return { total, active, totalClicks };
  }, [banners]);

  // Local filter list
  const filteredBanners = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    
    return banners.filter(b => {
      // Search
      const matchSearch = !search || 
        (b.title && b.title.toLowerCase().includes(lowerSearch)) || 
        (b.subtitle && b.subtitle.toLowerCase().includes(lowerSearch));

      // Status
      let matchStatus = true;
      if (activeFilter !== "all") {
        const isActiveState = b.is_active === 1;
        if (activeFilter === "active") {
          matchStatus = isActiveState;
        } else if (activeFilter === "inactive") {
          matchStatus = !isActiveState;
        }
      }

      return matchSearch && matchStatus;
    });
  }, [banners, search, activeFilter]);

  const handleToggleActive = async (banner: Banner) => {
    try {
      const payload: AdminBannerPayload = {
        placement: banner.placement,
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image_url,
        link_url: banner.link_url,
        button_text: null,
        is_active: banner.is_active === 1 ? 0 : 1,
        sort_order: banner.sort_order,
        start_at: null,
        end_at: null
      };
      
      const res = await adminUpdateBanner(banner.id, payload);
      if (res.success) {
        toast.success(banner.is_active === 1 ? "Đã tắt kích hoạt banner" : "Đã kích hoạt banner");
        setBanners(prev =>
          prev.map(b => (b.id === banner.id ? { ...b, is_active: banner.is_active === 1 ? 0 : 1 } : b))
        );
      } else {
        toast.error(res.message || "Lỗi thay đổi trạng thái");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa banner "${banner.title || 'không tên'}"?`)) return;

    try {
      const res = await adminDeleteBanner(banner.id);
      if (res.success) {
        toast.success("Xóa banner thành công");
        setBanners(prev => prev.filter(b => b.id !== banner.id));
      } else {
        toast.error(res.message || "Xóa banner thất bại");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi xóa");
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await adminUploadBannerImage(file);
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, image_url: res.data!.image_url }));
        toast.success("Tải lên hình ảnh thành công");
      } else {
        toast.error(res.message || "Tải lên thất bại");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải ảnh lên");
    } finally {
      setUploading(false);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        placement: banner.placement,
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        image_url: banner.image_url,
        link_url: banner.link_url || "",
        button_text: banner.button_text || "",
        is_active: banner.is_active,
        sort_order: banner.sort_order,
        start_at: banner.start_at ? banner.start_at.replace(" ", "T").substring(0, 16) : "",
        end_at: banner.end_at ? banner.end_at.replace(" ", "T").substring(0, 16) : ""
      });
    } else {
      setEditingBanner(null);
      setFormData({
        placement: "home_hero_slider",
        title: "",
        subtitle: "",
        image_url: "",
        link_url: "",
        button_text: "",
        is_active: 1,
        sort_order: 0,
        start_at: "",
        end_at: ""
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBanner(null);
  };

  const handleSave = async () => {
    if (!formData.image_url.trim()) {
      toast.error("Vui lòng tải lên hoặc nhập URL hình ảnh.");
      return;
    }
    
    const payload: AdminBannerPayload = {
      placement: formData.placement,
      title: formData.title?.trim() || null,
      subtitle: formData.subtitle?.trim() || null,
      image_url: formData.image_url,
      link_url: formData.link_url?.trim() || null,
      button_text: null,
      is_active: formData.is_active,
      sort_order: formData.sort_order,
      start_at: null,
      end_at: null
    };

    try {
      setSaving(true);
      if (editingBanner) {
        const res = await adminUpdateBanner(editingBanner.id, payload);
        if (res.success) {
          toast.success("Cập nhật banner thành công");
          closeModal();
          loadData();
        } else {
          toast.error(res.message || "Cập nhật thất bại");
        }
      } else {
        const res = await adminCreateBanner(payload);
        if (res.success) {
          toast.success("Tạo banner mới thành công");
          closeModal();
          loadData();
        } else {
          toast.error(res.message || "Tạo banner thất bại");
        }
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi lưu banner");
    } finally {
      setSaving(false);
    }
  };


  const getStatusBadge = (banner: Banner) => {
    if (banner.is_active === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
          <AlertCircle size={12} /> Tắt hoạt động
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle size={12} /> Đang hiển thị
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF] overflow-hidden font-inter text-[#0B1F3A]">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        collapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader onToggleSidebar={() => setCollapsed(!collapsed)} />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">Quản lý Banner</h1>
              <p className="text-sm text-slate-500 mt-1">Cấu hình các chiến dịch banner chính (hero slider) trang chủ 3F Store.</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0057E7] text-white rounded-xl hover:bg-[#0047C4] transition-colors shadow-sm font-semibold text-sm"
            >
              <Plus className="w-4.5 h-4.5" />
              Thêm Banner mới
            </button>
          </div>

          {/* KPI Cards section */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminKpiCard
              title="Tổng số banner"
              value={String(kpiStats.total)}
              change=""
              trend="up"
              iconName="file-text"
              comparisonLabel="Bao gồm cả banner ẩn"
            />
            <AdminKpiCard
              title="Đang hoạt động"
              value={String(kpiStats.active)}
              change=""
              trend="up"
              iconName="check-circle"
              comparisonLabel="Hiện đang hiển thị cho khách hàng"
            />
            <AdminKpiCard
              title="Tổng số click"
              value={String(kpiStats.totalClicks)}
              change=""
              trend="up"
              iconName="wallet"
              comparisonLabel="Tất cả lượt nhấp vào các banner"
            />
          </section>

          {/* Filter Bar */}
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#DCEBFF]/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative max-w-sm w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề banner..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0057E7] focus:border-[#0057E7] outline-none transition-all"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#0057E7] outline-none font-medium"
                value={activeFilter}
                onChange={e => setActiveFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái hiển thị</option>
                <option value="active">Đang hiển thị</option>
                <option value="inactive">Đang ẩn / Hết hạn</option>
              </select>
            </div>
          </div>

          {/* List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FBFF] text-slate-600 text-sm border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold w-1/3">Banner</th>
                    <th className="px-6 py-4 font-bold">Trạng thái</th>
                    <th className="px-6 py-4 font-bold">Hiệu suất</th>
                    <th className="px-6 py-4 font-bold">Sắp xếp</th>
                    <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0057E7] rounded-full animate-spin mb-3"></div>
                          <p className="font-semibold">Đang tải danh sách banner...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBanners.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="font-bold text-slate-600 text-base">
                          {search || activeFilter !== "all" ? "Không tìm thấy banner phù hợp." : "Chưa có banner nào được tạo."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredBanners.map(banner => {
                      const ctr = banner.impression_count > 0 ? ((banner.click_count / banner.impression_count) * 100).toFixed(1) + "%" : "0%";
                      return (
                        <tr key={banner.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={banner.image_url}
                                alt={banner.title || "Banner"}
                                className="w-20 h-10 object-cover rounded-lg border border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/assets/images/banner-1.webp";
                                }}
                              />
                              <div>
                                <div className="font-bold text-[#0B1F3A]">{banner.title || "Không có tiêu đề"}</div>
                                <div className="text-xs text-slate-400 line-clamp-1">{banner.subtitle || "Không có phụ đề"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {getStatusBadge(banner)}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 space-y-1">
                            <div className="flex items-center gap-1"><Eye size={12} /> {banner.impression_count || 0} lượt xem</div>
                            <div className="flex items-center gap-1"><MousePointerClick size={12} /> {banner.click_count || 0} lượt nhấp</div>
                            <div className="flex items-center gap-1 font-bold text-[#0057E7]"><Percent size={12} /> CTR: {ctr}</div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-500">
                            {banner.sort_order}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleActive(banner)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                                  banner.is_active === 1
                                    ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                                }`}
                              >
                                {banner.is_active === 1 ? "Ẩn đi" : "Hiện lại"}
                              </button>
                              <button
                                onClick={() => openModal(banner)}
                                className="p-2 text-[#0057E7] hover:bg-[#EEF6FF] rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(banner)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Overlay & Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-[#F8FBFF] flex items-center justify-between">
              <h2 className="text-lg font-black text-[#0B1F3A]">
                {editingBanner ? "Cập nhật Banner" : "Thêm mới Banner"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Tiêu đề (Title)</label>
                <input
                  type="text"
                  placeholder="Tiêu đề chính trên banner"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none text-sm font-medium"
                  value={formData.title || ""}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Phụ đề (Subtitle)</label>
                <input
                  type="text"
                  placeholder="Mô tả phụ hoặc tóm tắt khuyến mãi"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none text-sm font-medium"
                  value={formData.subtitle || ""}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              {/* Image Upload/URL */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Hình ảnh Banner (Image URL) *</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập link ảnh hoặc upload file..."
                      className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none text-sm font-medium"
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all cursor-pointer flex items-center justify-center shrink-0">
                      {uploading ? "Đang tải..." : "Tải ảnh lên"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleUploadImage}
                        disabled={uploading}
                      />
                    </label>
                  </div>

                  {formData.image_url && (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[21/9] bg-slate-50 flex items-center justify-center">
                      <img src={formData.image_url} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        title="Xóa hình ảnh"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Redirect link */}
              <div className="w-full">
                <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Link điều hướng (Link URL)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: /products hoặc URL ngoài"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none text-sm font-medium"
                  value={formData.link_url || ""}
                  onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              {/* Sort Order & Active Switch */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1.5">Thứ tự hiển thị (Sort Order)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none text-sm font-bold"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#0057E7] border-gray-300 rounded focus:ring-[#0057E7]"
                      checked={formData.is_active === 1}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    />
                    <span className="text-sm font-bold text-slate-700">Kích hoạt hiển thị</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-[#F8FBFF] flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 text-sm font-bold transition-all shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0057E7] text-white rounded-xl hover:bg-[#0047C4] transition-colors shadow-sm font-bold text-sm"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
