import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  getAdminCategories,
  saveAdminCategory,
  toggleAdminCategoryActive,
  deleteAdminCategory,
  type AdminCategory,
  type AdminCategoryPayload
} from "@/src/api/productsApi";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  FolderTree,
  AlertTriangle,
  X,
  Save,
  Wand2,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  Copy,
  FolderOpen
} from "lucide-react";

type TreeCategory = AdminCategory & {
  children: TreeCategory[];
  level: number;
  totalProductCount: number;
  isSystem?: boolean;
};

export function AdminCategoriesPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Danh mục");

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [levelFilter, setLevelFilter] = useState<"all" | "root" | "child">("all");

  // Expanded State
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AdminCategory | null>(null);
  const [drawerParentId, setDrawerParentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

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
  const hasEditAccess = adminRole === "dev" || adminRole === "admin" || adminPermissions.includes("categories");

  // Form state
  const [formData, setFormData] = useState<AdminCategoryPayload>({
    name: "",
    slug: "",
    parentId: null,
    description: "",
    imageUrl: "",
    sortOrder: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAdminCategories();
      if (res.success) {
        setCategories(res.data || []);
      } else {
        toast.error("Không thể tải danh mục");
      }
    } catch (err) {
      toast.error("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Build Tree
  const treeData = useMemo(() => {
    const map = new Map<number, TreeCategory>();
    const roots: TreeCategory[] = [];

    // Initialize all items in map
    categories.forEach(item => {
      map.set(item.id, {
        ...item,
        children: [],
        level: 0,
        totalProductCount: item.productCount,
        isSystem: false // Assuming no system categories for now
      });
    });

    // Build hierarchy
    categories.forEach(item => {
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        const child = map.get(item.id)!;
        child.level = parent.level + 1; // Works recursively
        parent.children.push(child);
      } else {
        roots.push(map.get(item.id)!);
      }
    });

    // Calculate totalProductCount and sort
    const calculateTotalsAndSort = (nodes: TreeCategory[], level = 0) => {
      nodes.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      });

      let total = 0;
      nodes.forEach(node => {
        node.level = level;
        const childrenTotal = calculateTotalsAndSort(node.children, level + 1);
        node.totalProductCount = node.productCount + childrenTotal;
        total += node.totalProductCount;
      });
      return total;
    };

    calculateTotalsAndSort(roots);
    return roots;
  }, [categories]);

  // Handle Search and Auto-Expand
  useEffect(() => {
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      const newExpanded = new Set<number>();
      
      treeData.forEach(root => {
        let hasMatchChild = false;
        root.children.forEach(child => {
          if (child.name.toLowerCase().includes(lowerSearch) || child.slug.toLowerCase().includes(lowerSearch)) {
            hasMatchChild = true;
          }
        });
        if (hasMatchChild || root.name.toLowerCase().includes(lowerSearch) || root.slug.toLowerCase().includes(lowerSearch)) {
          newExpanded.add(root.id);
        }
      });
      setExpandedIds(newExpanded);
    }
  }, [search, treeData]);

  // Flatten tree for rendering based on filters and expanded state
  const visibleCategories = useMemo(() => {
    const flatten: TreeCategory[] = [];
    const lowerSearch = search.toLowerCase();

    const processNode = (node: TreeCategory) => {
      // Apply filters
      if (statusFilter === "active" && !node.isActive) return false;
      if (statusFilter === "inactive" && node.isActive) return false;

      if (levelFilter === "root" && node.level > 0) return false;
      if (levelFilter === "child" && node.level === 0) {
        // If we only want child, we still process children, but skip adding root if it doesn't match
      }

      // Check search match
      const matchesSearch = !search || 
        node.name.toLowerCase().includes(lowerSearch) || 
        node.slug.toLowerCase().includes(lowerSearch);

      // Does any child match search?
      const hasMatchingChild = node.children.some(c => 
        c.name.toLowerCase().includes(lowerSearch) || 
        c.slug.toLowerCase().includes(lowerSearch)
      );

      // If level is child-only, root should only be added if it has matching children or we want to show context
      const shouldInclude = (matchesSearch || hasMatchingChild) && (levelFilter !== "child" || node.level > 0);
      
      // If we are filtering by 'child' only, we might want to show root as a dimmed header, or just skip root and show children. 
      // Based on req: "Hiển thị child categories nhưng vẫn show parent context ở dạng mờ/heading nếu cần."
      // For simplicity, we just include root if it has children that match.
      if (levelFilter === "child" && node.level === 0 && !hasMatchingChild) {
        return false;
      }
      
      if (!search || matchesSearch || hasMatchingChild) {
        if (levelFilter !== "child" || node.level > 0 || hasMatchingChild) {
           flatten.push(node);
        }
      }

      // Process children if expanded or searching
      if (expandedIds.has(node.id) || search || levelFilter === "child") {
        const processChildren = (children: TreeCategory[]) => {
          children.forEach(child => {
            const childMatches = !search || 
              child.name.toLowerCase().includes(lowerSearch) || 
              child.slug.toLowerCase().includes(lowerSearch);
              
            // If child matches search OR any of its descendants match
            const hasMatchingDescendant = child.children.some(c => 
              c.name.toLowerCase().includes(lowerSearch) || 
              c.slug.toLowerCase().includes(lowerSearch)
            );

            if (childMatches || hasMatchingDescendant) {
               if (statusFilter === "active" && !child.isActive) return;
               if (statusFilter === "inactive" && child.isActive) return;
               flatten.push(child);
               
               // Recursively process if expanded
               if (expandedIds.has(child.id) || search) {
                 processChildren(child.children);
               }
            }
          });
        };
        processChildren(node.children);
      }
      
      return true;
    };

    treeData.forEach(processNode);
    return flatten;
  }, [treeData, expandedIds, search, statusFilter, levelFilter]);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const expandAll = () => {
    const next = new Set<number>();
    treeData.forEach(c => next.add(c.id));
    setExpandedIds(next);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    toast.success("Đã copy đường dẫn!");
  };

  const handleToggleActive = async (cat: TreeCategory) => {
    if (cat.isActive && cat.childrenCount > 0) {
      if (!window.confirm(`Danh mục này có ${cat.childrenCount} danh mục con. Tắt danh mục cha sẽ ẩn danh mục cha khỏi menu/filter, nhưng không tự tắt danh mục con. Bạn có muốn tiếp tục?`)) {
        return;
      }
    } else if (cat.isActive && cat.productCount > 0) {
      toast.info("Lưu ý: Sản phẩm trong danh mục vẫn giữ trạng thái hiển thị riêng.", { duration: 3000 });
    }

    try {
      const res = await toggleAdminCategoryActive(cat.id, !cat.isActive);
      if (res.success) {
        toast.success(cat.isActive ? "Đã ẩn danh mục" : "Đã hiện danh mục");
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: !cat.isActive } : c));
      } else {
        toast.error(res.message || "Không thể đổi trạng thái");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống");
    }
  };

  const handleDelete = async (cat: TreeCategory) => {
    if (cat.productCount > 0) {
      toast.error("Không thể xóa danh mục đang có sản phẩm.");
      return;
    }
    if (cat.children.length > 0) {
      toast.error("Không thể xóa danh mục đang có danh mục con.");
      return;
    }
    if (cat.isSystem) {
      toast.error("Danh mục hệ thống không thể xóa.");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"? Hành động này không thể hoàn tác.`)) return;

    try {
      const res = await deleteAdminCategory(cat.id);
      if (res.success) {
        toast.success("Xoá danh mục thành công");
        setCategories(prev => 
          prev.map(c => {
            if (c.id === cat.parentId) {
              return { ...c, childrenCount: Math.max(0, c.childrenCount - 1) };
            }
            return c;
          }).filter(c => c.id !== cat.id)
        );
      } else {
        toast.error(res.message || "Xoá thất bại");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi xoá");
    }
  };

  const openDrawer = (cat?: AdminCategory, parentIdForChild?: number) => {
    if (cat) {
      setEditingCat(cat);
      setDrawerParentId(cat.parentId);
      setFormData({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
        description: cat.description || "",
        imageUrl: cat.imageUrl || "",
        sortOrder: cat.sortOrder
      });
    } else {
      setEditingCat(null);
      setDrawerParentId(parentIdForChild || null);
      setFormData({
        name: "",
        slug: "",
        parentId: parentIdForChild || null,
        description: "",
        imageUrl: "",
        sortOrder: 0
      });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCat(null);
    setDrawerParentId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setSaving(true);
      const res = await saveAdminCategory(formData);
      if (res.success) {
        toast.success(editingCat ? "Cập nhật thành công" : "Tạo mới thành công");
        closeDrawer();
        loadData();
      } else {
        toast.error(res.message || "Lưu thất bại");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const drawerParentCategory = useMemo(() => {
    if (!drawerParentId) return null;
    return categories.find(c => c.id === drawerParentId);
  }, [drawerParentId, categories]);

  return (
    <div className="flex h-screen bg-[#F6FAFF] overflow-hidden font-inter text-[#0B1F3A]">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div
        className={`flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"
        }`}
      >
        <AdminHeader
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">Quản lý Danh mục</h1>
            <p className="text-sm text-slate-500 mt-1">Sắp xếp và phân cấp danh mục sản phẩm của 3F Store.</p>
          </div>

          {/* Top Actions & Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative max-w-sm w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, đường dẫn..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0057E7] focus:border-[#0057E7] transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select 
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0057E7] outline-none"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hiển thị</option>
                <option value="inactive">Đang ẩn</option>
              </select>

              <select 
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0057E7] outline-none"
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value as any)}
              >
                <option value="all">Tất cả cấp</option>
                <option value="root">Chỉ Danh mục gốc</option>
                <option value="child">Chỉ Danh mục con</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Mở tất cả
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Thu gọn
              </button>
              {hasEditAccess && (
                <button
                  onClick={() => openDrawer()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0057E7] text-white rounded-lg hover:bg-[#0047C4] transition-colors shadow-sm font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Danh Mục
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FBFF] text-slate-600 text-sm border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/3">Danh mục</th>
                    <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                    <th className="px-6 py-4 font-semibold">Thứ tự</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#0057E7] rounded-full animate-spin mb-3"></div>
                          <p>Đang tải danh mục...</p>
                        </div>
                      </td>
                    </tr>
                  ) : visibleCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="font-medium text-slate-600">
                          {search ? "Không tìm thấy danh mục phù hợp." : "Chưa có danh mục nào."}
                        </p>
                        {search && (
                          <button onClick={() => setSearch("")} className="mt-2 text-[#0057E7] hover:underline text-sm font-medium">
                            Xóa bộ lọc tìm kiếm
                          </button>
                        )}
                        {!search && (
                          <button onClick={() => openDrawer()} className="mt-3 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors">
                            Thêm danh mục đầu tiên
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    visibleCategories.map((cat) => {
                      const isRoot = cat.level === 0;
                      const hasChildren = cat.children.length > 0;
                      const isExpanded = expandedIds.has(cat.id);
                      
                      return (
                        <tr 
                          key={cat.id} 
                          className={`group transition-colors ${isRoot ? 'bg-white hover:bg-slate-50/50' : 'bg-slate-50/30 hover:bg-slate-50'} ${!cat.isActive ? 'opacity-75' : ''}`}
                        >
                          <td className="px-6 py-3">
                            <div 
                              className="flex items-center gap-3 relative" 
                              style={{ paddingLeft: `${cat.level * 36}px` }}
                            >
                              {/* Connector line for child */}
                              {!isRoot && (
                                <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 -z-10" style={{ left: `${(cat.level - 1) * 36 + 34}px` }}></div>
                              )}
                              {!isRoot && (
                                <div className="absolute w-4 h-px bg-gray-200 -z-10" style={{ left: `${(cat.level - 1) * 36 + 34}px`, top: '50%' }}></div>
                              )}

                              <div className="flex items-center gap-2">
                                {isRoot && hasChildren ? (
                                  <button 
                                    onClick={() => toggleExpand(cat.id)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                                  >
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                ) : (
                                  <div className="w-6" /> // Placeholder for alignment
                                )}

                                {cat.imageUrl ? (
                                  <img src={cat.imageUrl} alt={cat.name} className={`rounded-lg object-cover border border-gray-200 ${isRoot ? 'w-10 h-10' : 'w-8 h-8 opacity-90'}`} />
                                ) : (
                                  <div className={`rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-400 ${isRoot ? 'w-10 h-10' : 'w-8 h-8'}`}>
                                    <FolderTree className={isRoot ? "w-5 h-5" : "w-4 h-4"} />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <div className={`font-semibold ${isRoot ? 'text-[#0B1F3A]' : 'text-slate-700'}`}>{cat.name}</div>
                                  {isRoot && hasChildren ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E1EFFF] text-[#0057E7] border border-[#BDE0FF]">Gốc</span>
                                  ) : isRoot ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Gốc</span>
                                  ) : null}
                                  {cat.isSystem && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Hệ thống</span>
                                  )}
                                  {!cat.isActive && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Đang ẩn</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 group/slug cursor-pointer" onClick={() => handleCopySlug(cat.slug)} title="Click để copy">
                                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{cat.slug}</span>
                                  <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover/slug:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-3">
                            <div className="flex flex-col gap-0.5 text-sm">
                              {isRoot ? (
                                <>
                                  <span className="text-slate-500">Trực tiếp: <span className="font-medium text-slate-700">{cat.productCount} SP</span></span>
                                  <span className="text-[#0057E7] font-medium">Tổng: {cat.totalProductCount} SP</span>
                                  {cat.children.length > 0 && (
                                    <span className="text-[11px] text-slate-400 font-medium mt-0.5">{cat.children.length} danh mục con</span>
                                  )}
                                </>
                              ) : (
                                <span className="font-medium text-slate-700">{cat.productCount} SP</span>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-3 text-sm text-slate-500 font-medium">
                            {cat.sortOrder}
                          </td>
                          
                          <td className="px-6 py-3">
                            <button
                              onClick={() => handleToggleActive(cat)}
                              disabled={!hasEditAccess}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057E7] focus:ring-offset-2 ${
                                cat.isActive ? 'bg-[#10B981]' : 'bg-slate-300'
                              } ${!hasEditAccess ? "cursor-not-allowed opacity-60" : ""}`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  cat.isActive ? 'translate-x-5' : 'translate-x-1'
                                } shadow-sm`}
                              />
                            </button>
                          </td>
                          
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {hasEditAccess && isRoot && (
                                <button
                                  onClick={() => openDrawer(undefined, cat.id)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Thêm danh mục con"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                              {hasEditAccess ? (
                                <>
                                  <button
                                    onClick={() => openDrawer(cat)}
                                    className="p-1.5 text-[#0057E7] hover:bg-[#EEF6FF] rounded-md transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(cat)}
                                    disabled={cat.productCount > 0 || cat.children.length > 0 || cat.isSystem}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      cat.productCount > 0 || cat.children.length > 0 || cat.isSystem
                                        ? "text-slate-300 cursor-not-allowed"
                                        : "text-red-600 hover:bg-red-50"
                                    }`}
                                    title={
                                      cat.isSystem ? "Danh mục hệ thống không thể xóa." :
                                      cat.productCount > 0 ? "Không thể xóa danh mục đang có sản phẩm." :
                                      cat.children.length > 0 ? "Không thể xóa danh mục đang có danh mục con." :
                                      "Xóa danh mục"
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openDrawer(cat)}
                                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-650 bg-white hover:bg-slate-50 transition-colors"
                                >
                                  Xem chi tiết
                                </button>
                              )}
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

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-[#0B1F3A]">
              {editingCat ? "Cập nhật danh mục" : (drawerParentId ? "Thêm danh mục con" : "Thêm danh mục gốc")}
            </h2>
            {drawerParentCategory && !editingCat && (
              <p className="text-sm text-slate-500 mt-0.5">
                Danh mục con sẽ nằm trong: <span className="font-semibold text-slate-700">{drawerParentCategory.name}</span>
              </p>
            )}
          </div>
          <button onClick={closeDrawer} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <fieldset disabled={!hasEditAccess} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none transition-all shadow-sm"
              placeholder="VD: Thức ăn cho mèo"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Đường dẫn (Slug)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none transition-all shadow-sm text-sm font-mono"
                placeholder={editingCat ? formData.slug : "Tự động tạo từ tên nếu để trống"}
                value={formData.slug || ""}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
              {editingCat && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, slug: "" })}
                  className="px-3 py-2 border border-slate-200 text-slate-600 bg-white rounded-xl hover:bg-slate-50 hover:text-[#0057E7] hover:border-blue-200 flex items-center gap-1.5 text-sm font-medium transition-all shadow-sm shrink-0"
                  title="Xoá để backend tự tạo lại từ tên"
                >
                  <Wand2 className="w-4 h-4" />
                  Tạo lại
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Chỉ dùng chữ cái không dấu, số và dấu gạch ngang (-). Hệ thống sẽ đảm bảo tính duy nhất.
            </p>
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Danh mục cha
            </label>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none transition-all shadow-sm appearance-none bg-white"
                value={formData.parentId || ""}
                onChange={e => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">-- Thuộc cấp Gốc (Root) --</option>
                {categories
                  // Prevent selecting itself or its own children (simple 1-level check)
                  .filter(c => c.id !== editingCat?.id && c.parentId !== editingCat?.id)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.parentName ? `${c.parentName} > ` : ""}{c.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Thứ tự ưu tiên
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none transition-all shadow-sm"
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              />
              <p className="text-[11px] text-slate-500 mt-1">Số nhỏ xếp trước.</p>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Ảnh đại diện (URL)
            </label>
            <div className="flex gap-3">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm bg-white" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none transition-all shadow-sm text-sm"
                placeholder="https://..."
                value={formData.imageUrl || ""}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mô tả ngắn
            </label>
            <textarea
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#0057E7] outline-none transition-all shadow-sm resize-none text-sm"
              rows={4}
              placeholder="Nhập mô tả danh mục (nếu có)..."
              value={formData.description || ""}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

        </fieldset>

        <div className="p-6 border-t border-slate-100 bg-white flex gap-3 justify-end shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
          <button
            onClick={closeDrawer}
            className="px-6 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            Hủy
          </button>
          {hasEditAccess && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0057E7] text-white rounded-xl font-semibold hover:bg-[#0047C4] transition-colors shadow-[0_4px_12px_rgba(0,87,231,0.25)] hover:shadow-[0_6px_16px_rgba(0,87,231,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
              {editingCat ? "Lưu thay đổi" : "Lưu danh mục"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
