import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  EyeOff, 
  Package, 
  Layers, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { 
  getAdminProducts, 
  toggleAdminProductActive, 
  getProductCategories,
  reclassifyAdminProducts
} from "@/src/api/productsApi";
import type { ApiProduct } from "@/src/api/productsApi";
import { toast } from "sonner";

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [adminRole, setAdminRole] = useState("admin");
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminRole(user.role || "admin");
        setAdminPermissions(user.permissions || []);
      }
    } catch (e) {}
  }, []);
  const hasProductWriteAccess = adminRole === "dev" || adminRole === "admin" || adminPermissions.includes("products") || adminRole === "super_admin" || adminRole === "manager";

  const [activeMenu, setActiveMenu] = useState("Sản phẩm");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Filters & State
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reclassifying, setReclassifying] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    outOfStockProducts: 0,
    lowStockProducts: 0
  });

  const [filters, setFilters] = useState({
    q: "",
    category: "",
    petType: "",
    productType: "",
    isActive: "",
    stockStatus: "",
    page: 1,
    limit: 20
  });

  const petTypeOptions = [
    { value: "cat", label: "Mèo" },
    { value: "dog", label: "Chó" },
    { value: "both", label: "Cả chó & mèo" },
    { value: "other", label: "Khác" }
  ];

  const productTypeOptions = [
    { value: "dry_food", label: "Thức ăn hạt" },
    { value: "wet_food", label: "Pate / thức ăn ướt" },
    { value: "treat", label: "Snack / thưởng" },
    { value: "litter", label: "Cát vệ sinh" },
    { value: "supplement", label: "Sữa & dinh dưỡng" },
    { value: "accessory", label: "Phụ kiện" },
    { value: "hygiene", label: "Chăm sóc / vệ sinh" },
    { value: "other", label: "Khác" }
  ];

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Categories
  useEffect(() => {
    getProductCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  // Fetch Products
  const fetchProducts = () => {
    setLoading(true);
    getAdminProducts({
      q: filters.q,
      category: filters.category,
      petType: filters.petType,
      productType: filters.productType,
      isActive: filters.isActive,
      stockStatus: filters.stockStatus as any,
      page: filters.page,
      limit: filters.limit
    })
      .then((res: any) => {
        if (res.success && res.data) {
          setProducts(res.data.items);
          setTotalCount(res.data.pagination.total);
          setTotalPages(res.data.pagination.totalPages);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        }
      })
      .catch((err) => {
        toast.error("Không tải được danh sách sản phẩm: " + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [filters.category, filters.petType, filters.productType, filters.isActive, filters.stockStatus, filters.page]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchProducts();
  };

  // Toggle Active Handler
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const nextStatus = currentStatus ? 0 : 1;
    const toastId = toast.loading("Đang cập nhật trạng thái...");
    try {
      const res = await toggleAdminProductActive(id, nextStatus);
      if (res.success) {
        toast.success(nextStatus === 1 ? "Đã hiển thị sản phẩm" : "Đã ẩn sản phẩm", { id: toastId });
        // Update local state
        setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: nextStatus === 1 } : p));
      } else {
        toast.error(res.message || "Không thể cập nhật trạng thái", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi hệ thống", { id: toastId });
    }
  };

  // Reclassify handler
  const handleReclassify = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn chạy thuật toán phân loại tự động cho tất cả sản phẩm?")) {
      return;
    }
    setReclassifying(true);
    const toastId = toast.loading("Đang tự động phân loại lại sản phẩm...");
    try {
      const res = await reclassifyAdminProducts();
      if (res.success) {
        toast.success(`Đã phân loại xong! Tổng số sản phẩm xử lý: ${res.data.total}`, { id: toastId });
        fetchProducts();
      } else {
        toast.error(res.message || "Lỗi phân loại", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi hệ thống", { id: toastId });
    } finally {
      setReclassifying(false);
    }
  };

  const getPetTypeLabel = (val: string | null | undefined) => {
    if (!val) return "Chưa đặt";
    const found = petTypeOptions.find(o => o.value === val);
    return found ? found.label : val;
  };

  const getProductTypeLabel = (val: string | null | undefined) => {
    if (!val) return "Chưa đặt";
    const found = productTypeOptions.find(o => o.value === val);
    return found ? found.label : val;
  };

  const formatVnd = (value: number | string | null | undefined) =>
    `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  const formatPriceRange = (min: number | string | null | undefined, max: number | string | null | undefined) => {
    const minVal = Number(min || 0);
    const maxVal = Number(max || minVal);
    return minVal === maxVal ? formatVnd(minVal) : `${formatVnd(minVal)} - ${formatVnd(maxVal)}`;
  };

  const getPriceDisplay = (product: ApiProduct) => {
    const saleMin = Number(product.minPrice || 0);
    const saleMax = Number(product.maxPrice || saleMin);
    const originalMin = product.minOriginalPrice != null ? Number(product.minOriginalPrice) : null;
    const originalMax = product.maxOriginalPrice != null ? Number(product.maxOriginalPrice) : null;
    const hasDiscount =
      originalMax != null &&
      originalMax > 0 &&
      (originalMax > saleMax || (originalMin != null && originalMin > saleMin));

    const discountBase = originalMin && originalMin > saleMin ? originalMin : originalMax;
    const discountPrice = originalMin && originalMin > saleMin ? saleMin : saleMax;
    const discountPercent =
      hasDiscount && discountBase ? Math.max(1, Math.round(((discountBase - discountPrice) / discountBase) * 100)) : 0;

    return {
      saleRange: formatPriceRange(saleMin, saleMax),
      originalRange: hasDiscount ? formatPriceRange(originalMin ?? originalMax, originalMax) : "",
      hasDiscount,
      discountPercent,
    };
  };

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        collapsed={sidebarCollapsed} 
      />

      {/* Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Content wrapper */}
      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${
        sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
      }`}>
        <AdminHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          searchValue={filters.q}
          onSearchChange={(val) => setFilters(prev => ({ ...prev, q: val }))}
          showDateFilter={false}
        />

        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#0B1F3A]">Quản lý sản phẩm</h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                Quản lý kho hàng, biến thể, hình ảnh và trạng thái hiển thị
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {hasProductWriteAccess && (
                <button
                  onClick={handleReclassify}
                  disabled={reclassifying}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#082B5F] bg-[#EEF6FF] hover:bg-[#DCEBFF] rounded-xl transition-all duration-200"
                >
                  <RefreshCw className={`h-4 w-4 ${reclassifying ? "animate-spin" : ""}`} />
                  Tự động phân loại lại
                </button>
              )}
              
              {hasProductWriteAccess && (
                <button
                  onClick={() => navigate("/admin/products/create")}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white bg-[#0057E7] hover:bg-[#0047C4] shadow-[0_6px_20px_rgba(0,87,231,0.25)] hover:shadow-none rounded-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Thêm sản phẩm
                </button>
              )}
            </div>
          </div>

          {/* KPI Mini-Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DCEBFF] p-4 rounded-2xl shadow-[0_8px_30px_rgb(220,235,255,0.3)] flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Tổng sản phẩm</div>
                <div className="text-xl font-black text-[#0B1F3A]">{stats.totalProducts}</div>
              </div>
            </div>

            <div className="bg-white border border-[#DCEBFF] p-4 rounded-2xl shadow-[0_8px_30px_rgb(220,235,255,0.3)] flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Đang hiển thị</div>
                <div className="text-xl font-black text-[#0B1F3A]">{stats.activeProducts}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Sản phẩm đang bán trên website</div>
              </div>
            </div>

            <div className="bg-white border border-[#DCEBFF] p-4 rounded-2xl shadow-[0_8px_30px_rgb(220,235,255,0.3)] flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase">Hết hàng / sắp hết</div>
                <div className="text-xl font-black text-[#0B1F3A]">
                  {stats.outOfStockProducts + stats.lowStockProducts}
                </div>
                <div className="text-[10px] text-red-600 font-bold mt-0.5">Cần kiểm tra tồn kho</div>
              </div>
            </div>
          </div>

          {/* Filters & Actions Panel */}
          <div className="bg-white border border-[#DCEBFF] p-5 rounded-2xl shadow-[0_10px_35px_rgba(6,43,95,0.04)]">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tên, thương hiệu, hoặc SKU..."
                  value={filters.q}
                  onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                  className="pl-9 pr-4 py-2 w-full text-sm font-semibold text-[#0B1F3A] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              {/* Category selector */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 text-sm font-semibold text-[#0B1F3A] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:bg-white transition-all"
                >
                  <option value="">Tất cả Danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pet Type selector */}
              <div>
                <select
                  value={filters.petType}
                  onChange={(e) => setFilters(prev => ({ ...prev, petType: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 text-sm font-semibold text-[#0B1F3A] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:bg-white transition-all"
                >
                  <option value="">Phù hợp thú cưng (Tất cả)</option>
                  {petTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Type selector */}
              <div>
                <select
                  value={filters.productType}
                  onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 text-sm font-semibold text-[#0B1F3A] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:bg-white transition-all"
                >
                  <option value="">Loại sản phẩm (Tất cả)</option>
                  {productTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status selector */}
              <div>
                <select
                  value={filters.stockStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 text-sm font-semibold text-[#0B1F3A] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:bg-white transition-all"
                >
                  <option value="">Tình trạng kho (Tất cả)</option>
                  <option value="in_stock">Còn hàng</option>
                  <option value="low_stock">Sắp hết hàng (&le; 10)</option>
                  <option value="out_of_stock">Hết hàng (0)</option>
                </select>
              </div>

              {/* Active Status selector */}
              <div>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 text-sm font-semibold text-[#0B1F3A] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:bg-white transition-all"
                >
                  <option value="">Trạng thái hiển thị (Tất cả)</option>
                  <option value="1">Đang hoạt động (Hiển thị)</option>
                  <option value="0">Tạm ẩn (Ẩn)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 sm:col-span-2 md:col-span-1 lg:col-span-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#082B5F] hover:bg-[#062047] text-white font-bold text-sm px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      q: "",
                      category: "",
                      petType: "",
                      productType: "",
                      isActive: "",
                      stockStatus: "",
                      page: 1,
                      limit: 20
                    });
                  }}
                  className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-[#DCEBFF] rounded-2xl shadow-[0_10px_35px_rgba(6,43,95,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-[#DCEBFF] text-xs font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Hình ảnh</th>
                    <th className="px-6 py-4 min-w-[200px]">Tên sản phẩm</th>
                    <th className="px-6 py-4">Phân loại</th>
                    <th className="px-6 py-4 text-left min-w-[180px]">Giá bán / Giá gốc</th>
                    <th className="px-6 py-4 text-center">Tồn kho</th>
                    <th className="px-6 py-4 text-center">Đã bán</th>
                    <th className="px-6 py-4 text-center">Trạng thái</th>
                    <th className="px-6 py-4">Cập nhật lúc</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-semibold text-[#0B1F3A]">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0057E7] border-t-transparent"></div>
                          <span>Đang tải sản phẩm...</span>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FolderOpen className="h-8 w-8 text-slate-300" />
                          <span>Không tìm thấy sản phẩm nào phù hợp.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isOutOfStock = p.totalStock <= 0;
                      const isLowStock = p.totalStock > 0 && p.totalStock <= 10;
                      const priceDisplay = getPriceDisplay(p);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Image */}
                          <td className="px-4 py-2.5">
                            <img
                              src={p.mainImageUrl || "/assets/images/dog-food.webp"}
                              alt={p.name}
                              className="h-11 w-11 rounded-xl object-contain bg-slate-50 border border-slate-100 p-0.5 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/images/dog-food.webp";
                              }}
                            />
                          </td>

                          {/* Name */}
                          <td className="px-4 py-2.5">
                            <div className="font-black text-[#0B1F3A] text-sm line-clamp-2 leading-snug max-w-[220px]" title={p.name}>
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {p.brand && (
                                <span className="text-[10px] text-slate-400 font-semibold">{p.brand}</span>
                              )}
                              <span
                                onClick={() => { navigator.clipboard.writeText(p.slug); toast.success("Đã copy slug!"); }}
                                className="cursor-pointer inline-flex items-center gap-1 bg-slate-100 hover:bg-[#EEF6FF] text-[#0057E7] px-1.5 py-0.5 rounded font-mono text-[9px] transition-all max-w-[150px] truncate"
                                title={p.slug}
                              >
                                {p.slug.length > 22 ? p.slug.substring(0, 22) + "…" : p.slug}
                                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              </span>
                            </div>
                          </td>

                          {/* Classification — compact badges */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {p.categoryName && (
                                <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-100 w-fit max-w-[160px] truncate" title={p.categoryName}>
                                  {p.categoryName}
                                </span>
                              )}
                              <div className="flex gap-1 flex-wrap">
                                {p.petType && (
                                  <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-black border w-fit ${
                                    p.petType === 'cat' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                    p.petType === 'dog' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-50 text-slate-500 border-slate-200'
                                  }`}>
                                    {getPetTypeLabel(p.petType)}
                                  </span>
                                )}
                                {p.productType && (
                                  <span className="inline-flex px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 text-[9px] font-bold w-fit">
                                    {getProductTypeLabel(p.productType)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Price range */}
                          <td
                            className="px-4 py-3 text-left"
                            title="Giá bán = giá khách đang mua. Giá gốc = giá niêm yết trước giảm giá."
                          >
                            <div className="space-y-1.5">
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Giá bán</div>
                                <div className="font-black text-[#0057E7] text-[15px] leading-tight">{priceDisplay.saleRange}</div>
                              </div>
                              {priceDisplay.hasDiscount && (
                                <div className="pt-1 border-t border-slate-100">
                                  <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">Giá gốc</div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 line-through">{priceDisplay.originalRange}</span>
                                    <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-black text-rose-600 border border-rose-100">
                                      -{priceDisplay.discountPercent}%
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Stock quantity */}
                          <td className="px-4 py-2.5 text-center">
                            <div className="text-xs font-black text-[#0B1F3A]">
                              {p.totalStock} tồn
                            </div>
                            <div className="text-[10px] text-slate-400 font-semibold">{p.variantCount} biến thể</div>
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-md mt-1 border ${
                              isOutOfStock 
                                ? "bg-red-50 text-red-600 border-red-200/50" 
                                : isLowStock 
                                ? "bg-orange-50 text-orange-600 border-orange-200/50" 
                                : "bg-green-50 text-green-600 border-green-200/50"
                            }`}>
                              {isOutOfStock ? "Hết hàng" : isLowStock ? "Sắp hết" : "Còn hàng"}
                            </span>
                          </td>

                          {/* Sold Count */}
                          <td className="px-4 py-2.5 text-center font-bold text-[#0B1F3A] text-sm">
                            {p.soldCount || 0}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-2.5 text-center">
                            {!hasProductWriteAccess ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                                  p.isActive 
                                    ? "bg-[#E8F8F5] text-[#117A65] border-[#A3E4D7]/50" 
                                    : "bg-slate-100 text-slate-400 border-slate-200/50"
                                }`}
                              >
                                {p.isActive ? (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    Hiển thị
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Đang ẩn
                                  </>
                                )}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(p.id, !!p.isActive)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all duration-200 ${
                                  p.isActive 
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/50" 
                                    : "bg-slate-100 text-slate-400 border border-slate-200/50"
                                }`}
                              >
                                {p.isActive ? (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    Hiển thị
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3 w-3" />
                                    Đang ẩn
                                  </>
                                )}
                              </button>
                            )}
                          </td>

                          {/* Updated At */}
                          <td className="px-4 py-2.5 text-[10px] font-semibold text-slate-400">
                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("vi-VN") : "N/A"}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => navigate(`/admin/products/${p.id}`)}
                              title={hasProductWriteAccess ? "Chỉnh sửa sản phẩm" : "Xem chi tiết sản phẩm"}
                              className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-[#EEF6FF] text-slate-500 hover:text-[#0057E7] border border-slate-200 flex items-center justify-center transition-all duration-200"
                            >
                              {hasProductWriteAccess ? (
                                <Edit2 className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            {!loading && (
              <div className="px-6 py-4 bg-slate-50 border-t border-[#DCEBFF] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">
                  {totalCount > 0
                    ? `${((filters.page - 1) * filters.limit) + 1}–${Math.min(totalCount, filters.page * filters.limit)} / ${totalCount} sản phẩm`
                    : "Không có sản phẩm"}
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={filters.page === 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      className="px-3 py-1 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ‹ Trước
                    </button>

                    {(() => {
                      const pages: (number | '...')[] = [];
                      const cur = filters.page;
                      const total = totalPages;
                      if (total <= 7) {
                        for (let i = 1; i <= total; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        if (cur > 3) pages.push('...');
                        for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
                        if (cur < total - 2) pages.push('...');
                        pages.push(total);
                      }
                      return pages.map((p, i) =>
                        p === '...' ? (
                          <span key={`e${i}`} className="px-1 text-slate-400 text-xs">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setFilters(prev => ({ ...prev, page: p as number }))}
                            className={`h-7 w-7 text-xs font-black rounded-lg transition-all ${
                              filters.page === p
                                ? "bg-[#0057E7] text-white"
                                : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}

                    <button
                      disabled={filters.page === totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      className="px-3 py-1 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Sau ›
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="h-14 bg-white border-t border-[#DCEBFF] px-4 sm:px-6 flex items-center justify-between text-[11px] sm:text-[12px] text-slate-400 font-semibold shrink-0">
          <span>© 2026 3F Store Admin. Tất cả quyền được bảo lưu.</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>
    </div>
  );
}
