import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Settings,
  Layers,
  FileText,
  Tag,
  Copy,
  Wand2,
  RefreshCw,
  UploadCloud,
  Link2,
  Loader2,
  GripVertical,
  X,
} from "lucide-react";
import {
  getAdminProductDetail,
  saveAdminProduct,
  getProductCategories,
  uploadAdminProductImage,
  deleteAdminProduct,
} from "@/src/api/productsApi";
import { RichTextEditor } from "@/src/components/admin/RichTextEditor";
import type {
  AdminProductVariantPayload,
  AdminProductImagePayload,
  AdminProductSavePayload,
} from "@/src/api/productsApi";
import { toast } from "sonner";
import DOMPurify from "dompurify";

// ─── Types ───────────────────────────────────────────────────────────────────
type TabType = "basic" | "taxonomy" | "variants" | "images" | "display";

interface ValidationIssue {
  tab: TabType;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

// ─── Constants ───────────────────────────────────────────────────────────────
const OPTION_PRESETS = ["Quy cách", "Khối lượng", "Hương vị", "Combo", "Size", "Màu sắc"];

const OPTION_VALUE_PLACEHOLDERS: Record<string, string> = {
  "Quy cách": "VD: 1 gói lẻ, Combo 3 gói",
  "Khối lượng": "VD: 1.3kg, 400g",
  "Hương vị": "VD: Cá ngừ, Gà, Bò",
  "Combo": "VD: Combo 2 gói",
  "Size": "VD: S, M, L",
  "Màu sắc": "VD: Xanh, Đỏ",
  "Khác": "VD: Giá trị tuỳ chỉnh",
};

const PET_TYPE_OPTIONS = [
  { value: "cat", label: "🐱 Mèo" },
  { value: "dog", label: "🐶 Chó" },
  { value: "both", label: "🐾 Cả chó & mèo" },
  { value: "other", label: "Khác" },
];

const PRODUCT_TYPE_OPTIONS = [
  { value: "dry_food", label: "Thức ăn hạt" },
  { value: "wet_food", label: "Pate / thức ăn ướt" },
  { value: "treat", label: "Snack / thưởng" },
  { value: "litter", label: "Cát vệ sinh" },
  { value: "supplement", label: "Sữa & dinh dưỡng" },
  { value: "accessory", label: "Phụ kiện" },
  { value: "hygiene", label: "Chăm sóc / vệ sinh" },
  { value: "other", label: "Khác" },
];

const TAB_LABELS: Record<TabType, string> = {
  basic: "Thông tin cơ bản",
  taxonomy: "Phân loại & SEO",
  variants: "Biến thể & Tồn kho",
  images: "Hình ảnh",
  display: "Hiển thị",
};

// ─── Utilities ───────────────────────────────────────────────────────────────
function generateSlug(str: string): string {
  let slug = str;
  // Vietnamese diacritics removal
  const maps: [RegExp, string][] = [
    [/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ|À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/g, "a"],
    [/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ|È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/g, "e"],
    [/(ì|í|ị|ỉ|ĩ|Ì|Í|Ị|Ỉ|Ĩ)/g, "i"],
    [/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ|Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/g, "o"],
    [/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ|Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/g, "u"],
    [/(ỳ|ý|ỵ|ỷ|ỹ|Ý|Ỳ|Ỵ|Ỷ|Ỹ)/g, "y"],
    [/(đ|Đ)/g, "d"],
  ];
  maps.forEach(([re, rep]) => { slug = slug.replace(re, rep); });
  slug = slug.toLowerCase().replace(/[^a-z0-9\s_-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  if (slug.length > 130) slug = slug.substring(0, 130).replace(/-+$/, "");
  return slug;
}

function generateSkuForVariant(productName: string, brand: string, index: number, uniqueHash?: string): string {
  const prefix = brand
    ? brand.replace(/[^a-zA-Z]/g, "").substring(0, 6).toUpperCase()
    : productName
    ? generateSlug(productName).replace(/-/g, "").substring(0, 6).toUpperCase()
    : "PROD";
  const hashStr = uniqueHash ? `-${uniqueHash}` : `-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const num = String(index + 1).padStart(3, "0");
  return `3F-${prefix}${hashStr}-${num}`;
}

function buildVariantName(v: AdminProductVariantPayload): string {
  const parts = [v.option1Value, v.option2Value, v.option3Value].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Mặc định";
}

function formatVnd(num: number) {
  return num.toLocaleString("vi-VN") + "đ";
}

// ─── Blank variant factory ───────────────────────────────────────────────────
function createBlankVariant(index = 0, productName = "", brand = ""): AdminProductVariantPayload {
  return {
    id: null,
    sku: "",
    variantName: "Mặc định",
    option1Name: "",
    option1Value: "",
    option2Name: "",
    option2Value: "",
    option3Name: "",
    option3Value: "",
    price: 0,
    originalPrice: null,
    stockQuantity: 0,
    isActive: true,
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────
function getValidationIssues(formData: AdminProductSavePayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Basic
  if (!formData.name.trim()) {
    issues.push({ tab: "basic", field: "name", message: "Tên sản phẩm không được trống", severity: "error" });
  }

  // Taxonomy
  if (!formData.categoryId) {
    issues.push({ tab: "taxonomy", field: "categoryId", message: "Chưa chọn danh mục sản phẩm", severity: "error" });
  }

  // Variants
  const activeVariants = formData.variants.filter((v) => v.isActive !== false);
  if (formData.variants.length === 0) {
    issues.push({ tab: "variants", message: "Cần ít nhất 1 biến thể để bán sản phẩm", severity: "error" });
  } else {
    formData.variants.forEach((v, i) => {
      if (!v.sku.trim()) {
        issues.push({ tab: "variants", field: `variants.${i}.sku`, message: `Biến thể #${i + 1}: SKU không được trống`, severity: "error" });
      } else {
        // Check duplicate SKU
        const isDuplicate = formData.variants.some((otherV, otherIdx) => otherIdx !== i && otherV.sku.trim().toLowerCase() === v.sku.trim().toLowerCase());
        if (isDuplicate) {
          issues.push({
            tab: "variants",
            field: `variants.${i}.sku`,
            message: `Biến thể #${i + 1}: SKU bị trùng`,
            severity: "error"
          });
        }
      }
      if (v.price <= 0) {
        issues.push({ tab: "variants", field: `variants.${i}.price`, message: `Biến thể #${i + 1}: Giá bán phải lớn hơn 0`, severity: "error" });
      }
      if (v.originalPrice !== null && v.originalPrice !== undefined && v.originalPrice < v.price) {
        issues.push({ tab: "variants", field: `variants.${i}.originalPrice`, message: `Biến thể #${i + 1}: Giá niêm yết phải lớn hơn hoặc bằng giá bán.`, severity: "error" });
      }
      if (v.stockQuantity < 0) {
        issues.push({ tab: "variants", field: `variants.${i}.stockQuantity`, message: `Biến thể #${i + 1}: Tồn kho không được âm`, severity: "error" });
      }
    });
    if (activeVariants.length === 0) {
      issues.push({ tab: "variants", message: "Cần ít nhất 1 biến thể đang hoạt động (bật)", severity: "error" });
    }
  }

  // Images — warning only
  if (formData.galleryImages.length === 0) {
    issues.push({ tab: "images", field: "product-image-upload", message: "Chưa có ảnh. Khách hàng sẽ thấy ảnh mặc định nếu bạn không thêm ảnh.", severity: "warning" });
  }

  return issues;
}

function hasBlockingErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.severity === "error");
}

// ─── OptionSelect component ───────────────────────────────────────────────────
interface OptionSelectProps {
  optionName: string;
  optionValue: string;
  onNameChange: (val: string) => void;
  onValueChange: (val: string) => void;
  label: string;
}

function OptionSelect({ optionName, optionValue, onNameChange, onValueChange, label }: OptionSelectProps) {
  const isPreset = OPTION_PRESETS.includes(optionName);
  const selectVal = isPreset ? optionName : optionName ? "Khác" : "";
  const placeholder = OPTION_VALUE_PLACEHOLDERS[optionName] || OPTION_VALUE_PLACEHOLDERS["Khác"] || "Giá trị";

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</div>
      <select
        value={selectVal}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "Khác") {
            onNameChange("");
          } else {
            onNameChange(val);
          }
        }}
        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] bg-white focus:outline-none focus:ring-1 focus:ring-[#0057E7]"
      >
        <option value="">-- Bỏ trống --</option>
        {OPTION_PRESETS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value="Khác">Khác (tuỳ chỉnh)</option>
      </select>
      {selectVal === "Khác" && (
        <input
          type="text"
          placeholder="Nhập tên option"
          value={optionName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0057E7]"
        />
      )}
      {selectVal && (
        <input
          type="text"
          placeholder={placeholder}
          value={optionValue}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0057E7]"
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

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

  // Layout state
  const [activeMenu] = useState("Sản phẩm");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : true
  );
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  // Data state
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({});

  // Image URL input
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageAddMode, setImageAddMode] = useState<"upload" | "url">("upload");
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrlError, setImageUrlError] = useState("");

  // Form state — create mode starts with empty variants (Option A)
  const [formData, setFormData] = useState<AdminProductSavePayload>({
    id: null,
    name: "",
    slug: "",
    brand: "",
    shortDescription: "",
    description: "",
    ingredients: "",
    guide: "",
    categoryId: "",
    petType: "both",
    productType: "other",
    isActive: true,
    isFeatured: false,
    variants: [], // Option A: empty by default
    galleryImages: [],
  });

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => setSidebarCollapsed(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await getProductCategories();
        if (catRes.success && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }

        if (isEditMode && id) {
          const prodRes = await getAdminProductDetail(id);
          if (prodRes.success && prodRes.data) {
            const prod = prodRes.data;

            const mappedVariants = (prod.variants || []).map((v: any) => ({
              id: v.id,
              sku: v.sku || "",
              variantName: v.variantName || v.variant_name || "",
              option1Name: v.option1Name || v.option1_name || "",
              option1Value: v.option1Value || v.option1_value || "",
              option2Name: v.option2Name || v.option2_name || "",
              option2Value: v.option2Value || v.option2_value || "",
              option3Name: v.option3Name || v.option3_name || "",
              option3Value: v.option3Value || v.option3_value || "",
              price: Number(v.price) || 0,
              originalPrice: v.originalPrice !== null ? Number(v.originalPrice) : null,
              stockQuantity: Number(v.stockQuantity) || 0,
              isActive: v.isActive !== false,
              hasOrderHistory: !!v.hasOrderHistory,
            }));

            const mappedImages = (prod.images || []).map((img: any) => ({
              id: img.id,
              url: img.imageUrl || img.image_url || "",
              altText: img.altText || "",
              sortOrder: Number(img.sortOrder) || 0,
              isPrimary: !!img.isMain,
            }));

            let shortDesc = prod.shortDescription || "";
            shortDesc = shortDesc.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");

            setFormData({
              id: prod.id,
              name: prod.name || "",
              slug: prod.slug || "",
              brand: prod.brand || "",
              shortDescription: shortDesc,
              description: prod.description || "",
              ingredients: prod.ingredients || "",
              guide: prod.guide || (prod as any).feeding_guide || "",
              categoryId: prod.categoryId || "",
              petType: (prod.petType || "both") as any,
              productType: prod.productType || "other",
              isActive: prod.isActive !== false,
              isFeatured: !!prod.isFeatured,
              variants: mappedVariants,
              galleryImages: mappedImages,
            });
            setIsDirty(false);
          }
        }
      } catch (err: any) {
        toast.error("Không tải được thông tin sản phẩm: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode]);

  // Auto-generate slug from name in create mode
  useEffect(() => {
    if (!isEditMode && !isSlugManuallyEdited && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [formData.name, isEditMode, isSlugManuallyEdited]);

  // Auto-initialize default variant if empty
  useEffect(() => {
    if (!loading && formData.variants.length === 0) {
      setFormData((prev) => {
        if (prev.variants.length === 0) {
          return {
            ...prev,
            variants: [createBlankVariant(0, prev.name, prev.brand || "")],
          };
        }
        return prev;
      });
    }
  }, [loading, formData.variants.length]);

  // Prevent accidental navigation when dirty
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Bạn có thay đổi chưa lưu.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    markDirty();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    markDirty();
  };

  // ── Variant handlers ──────────────────────────────────────────────────────
  const handleVariantChange = (index: number, field: keyof AdminProductVariantPayload, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };

      // Auto-build variant name when options change (only if not manually set)
      if (["option1Value", "option2Value", "option3Value"].includes(field as string)) {
        const v = updated[index];
        const autoName = buildVariantName({ ...v, [field]: value });
        updated[index].variantName = autoName;
      }

      return { ...prev, variants: updated };
    });
    markDirty();
  };

  const addVariant = () => {
    const index = formData.variants.length;
    const newVariant = createBlankVariant(index, formData.name, formData.brand || "");
    // Inherit option names from first variant for consistency
    if (formData.variants.length > 0) {
      newVariant.option1Name = formData.variants[0].option1Name;
      newVariant.option2Name = formData.variants[0].option2Name;
    }
    setFormData((prev) => ({ ...prev, variants: [...prev.variants, newVariant] }));
    markDirty();
  };

  const removeVariant = (index: number) => {
    const variant = formData.variants[index];
    if (variant.id) {
      if (!window.confirm("Biến thể đã có trong hệ thống. Nếu đã có đơn hàng, hệ thống sẽ chỉ ẩn biến thể. Bạn có chắc?")) return;
    }
    setFormData((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    markDirty();
  };

  const generateSkuForAll = () => {
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => ({
        ...v,
        sku: v.sku ? v.sku : generateSkuForVariant(prev.name, prev.brand || "", i, randomId),
      })),
    }));
    toast.success("Đã tạo SKU tự động cho các biến thể chưa có SKU.");
    markDirty();
  };

  const generateSkuForOne = (index: number) => {
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index],
        sku: generateSkuForVariant(prev.name, prev.brand || "", index, randomId),
      };
      return { ...prev, variants: updated };
    });
    markDirty();
  };

  const handleIssueClick = (issue: ValidationIssue) => {
    setActiveTab(issue.tab);
    if (issue.field) {
      setTimeout(() => {
        const element = document.getElementById(issue.field!);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.focus?.();
        }
      }, 100);
    }
  };

  const handleAddClassification = () => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      if (updated.length === 0) {
        updated.push(createBlankVariant(0, prev.name, prev.brand || ""));
      }
      updated[0] = {
        ...updated[0],
        option1Name: "Quy cách",
      };
      return { ...prev, variants: updated };
    });
    markDirty();
    toast.success("Đã kích hoạt phân loại sản phẩm. Hãy chọn hoặc nhập thuộc tính phân loại.");
  };

  const handleRemoveClassification = () => {
    if (!window.confirm("Hệ thống sẽ xóa tất cả phân loại của các biến thể. Bạn có chắc chắn?")) return;
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({
        ...v,
        option1Name: "",
        option1Value: "",
        option2Name: "",
        option2Value: "",
        variantName: "Mặc định",
      })),
    }));
    markDirty();
    toast.success("Đã xóa tất cả phân loại.");
  };

  // ── Image handlers ────────────────────────────────────────────────────────
  const addImagesToGallery = (images: Array<Pick<AdminProductImagePayload, "url" | "altText">>) => {
    setFormData((prev) => {
      const existingUrls = new Set(prev.galleryImages.map((img) => img.url));
      const newImages = images
        .filter((img) => img.url && !existingUrls.has(img.url))
        .map((img, index) => ({
          id: null,
          url: img.url,
          sortOrder: prev.galleryImages.length + index + 1,
          isPrimary: prev.galleryImages.length === 0 && index === 0,
          altText: img.altText || "",
        }));

      if (newImages.length === 0) {
        return prev;
      }

      const galleryImages = [...prev.galleryImages, ...newImages];
      const hasPrimary = galleryImages.some((img) => img.isPrimary);
      if (!hasPrimary && galleryImages.length > 0) {
        galleryImages[0] = { ...galleryImages[0], isPrimary: true };
      }

      const primaryUrl = galleryImages.find((img) => img.isPrimary)?.url || "";
      return {
        ...prev,
        galleryImages,
        mainImageUrl: primaryUrl,
      };
    });
    markDirty();
  };

  const isValidRemoteImageUrl = (url: string) => /^https?:\/\/\S+$/i.test(url);

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    setImageUrlError("");
    if (!url) {
      setImageUrlError("Vui lòng dán link ảnh.");
      return;
    }
    if (!isValidRemoteImageUrl(url)) {
      setImageUrlError("URL ảnh phải bắt đầu bằng http:// hoặc https://.");
      return;
    }
    if (formData.galleryImages.some((img) => img.url === url)) {
      setImageUrlError("Ảnh này đã được thêm.");
      return;
    }
    addImagesToGallery([{ url, altText: "" }]);
    setNewImageUrl("");
  };

  const handleUploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const validType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      const validSize = file.size <= 5 * 1024 * 1024;
      if (!validType) {
        toast.error(`${file.name}: chỉ hỗ trợ JPG, PNG, WEBP.`);
      } else if (!validSize) {
        toast.error(`${file.name}: ảnh phải nhỏ hơn 5MB.`);
      }
      return validType && validSize;
    });

    if (validFiles.length === 0) return;

    setUploadingImages(true);
    const toastId = toast.loading(`Đang tải ${validFiles.length} ảnh lên...`);
    try {
      const uploaded = await Promise.all(validFiles.map((file) => uploadAdminProductImage(file)));
      addImagesToGallery(uploaded.map((res) => ({ url: res.data.url, altText: "" })));
      toast.success(`Đã tải lên ${uploaded.length} ảnh.`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Không upload được ảnh sản phẩm.", { id: toastId });
    } finally {
      setUploadingImages(false);
      setIsDraggingImages(false);
    }
  };

  const handleSetPrimaryImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img) => ({ ...img, isPrimary: img.url === url })),
      mainImageUrl: url,
    }));
    markDirty();
  };

  const handleRemoveImage = (url: string) => {
    setFormData((prev) => {
      const filtered = prev.galleryImages.filter((img) => img.url !== url);
      const wasMain = prev.galleryImages.find((img) => img.url === url)?.isPrimary;
      if (wasMain && filtered.length > 0) filtered[0].isPrimary = true;
      return {
        ...prev,
        galleryImages: filtered,
        mainImageUrl: filtered.find((img) => img.isPrimary)?.url || "",
      };
    });
    markDirty();
  };

  const handleImageAltChange = (url: string, altText: string) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img) => img.url === url ? { ...img, altText } : img),
    }));
    markDirty();
  };

  const handleImageSortOrderChange = (url: string, sortOrder: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.map((img) => img.url === url ? { ...img, sortOrder } : img),
    }));
    markDirty();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const issues = getValidationIssues(formData);
    if (hasBlockingErrors(issues)) {
      const firstError = issues.find((i) => i.severity === "error");
      if (firstError) {
        handleIssueClick(firstError);
        toast.error(firstError.message);
      }
      return;
    }

    setSaving(true);
    setBackendErrors({});
    const toastId = toast.loading(isEditMode ? "Đang lưu sản phẩm..." : "Đang tạo sản phẩm mới...");

    try {
      const res = await saveAdminProduct(formData);
      if (res.success) {
        setIsDirty(false);
        toast.success(isEditMode ? "Đã lưu thay đổi!" : "Tạo sản phẩm thành công!", { id: toastId });
        // Redirect to edit page on create
        if (!isEditMode && res.data?.id) {
          navigate(`/admin/products/${res.data.id}`);
        } else {
          navigate("/admin/products");
        }
      } else {
        toast.error(res.message || "Không thể lưu sản phẩm", { id: toastId });
        // Map backend errors
        if ((res as any).errors) {
          setBackendErrors((res as any).errors);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || "Lỗi hệ thống";
      toast.error(errMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?")) return;
    }
    navigate("/admin/products");
  };

  const handleDeleteProduct = async () => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này cùng với tất cả biến thể và hình ảnh? Hành động này không thể hoàn tác.")) return;
    
    setSaving(true);
    const toastId = toast.loading("Đang xóa sản phẩm...");
    try {
      const res = await deleteAdminProduct(id);
      if (res.success) {
        toast.success("Xóa sản phẩm thành công!", { id: toastId });
        navigate("/admin/products");
      } else {
        toast.error(res.message || "Lỗi khi xóa sản phẩm", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi hệ thống khi xóa sản phẩm", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // ─── Derived data ────────────────────────────────────────────────────────
  const validationIssues = getValidationIssues(formData);
  const hasErrors = hasBlockingErrors(validationIssues);
  const tabsWithErrors = new Set(validationIssues.filter((i) => i.severity === "error").map((i) => i.tab));
  const tabsWithWarnings = new Set(validationIssues.filter((i) => i.severity === "warning").map((i) => i.tab));
  const hasOrderHistory = formData.variants.some(v => v.hasOrderHistory);

  // ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F6FAFF]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0057E7] border-t-transparent" />
          <span className="text-sm font-semibold text-[#0B1F3A]">Đang tải dữ liệu sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFF] font-sans relative">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={() => {}} collapsed={sidebarCollapsed} />

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={`min-h-screen flex flex-col overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? "w-full lg:pl-20" : "w-full lg:pl-[220px]"}`}>
        <AdminHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} showDateFilter={false} />

        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6">
          {/* Page header */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="h-10 w-10 rounded-xl bg-white border border-[#DCEBFF] hover:bg-slate-50 text-[#082B5F] flex items-center justify-center transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-[#0B1F3A]">
                {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">
                {isEditMode ? `ID: ${formData.id}` : "Điền đầy đủ thông tin để tạo sản phẩm mới"}
              </p>
            </div>
          </div>

          {/* Form layout */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left col */}
            <div className="lg:col-span-9 space-y-6">
              {/* Tab bar */}
              <div className="bg-white border border-[#DCEBFF] p-2 rounded-2xl shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(["basic", "taxonomy", "variants", "images", "display"] as TabType[]).map((tab) => {
                  const hasErr = tabsWithErrors.has(tab);
                  const hasWarn = tabsWithWarnings.has(tab);
                  const icons: Record<TabType, React.ReactNode> = {
                    basic: <FileText className="h-4 w-4" />,
                    taxonomy: <Layers className="h-4 w-4" />,
                    variants: <Tag className="h-4 w-4" />,
                    images: <ImageIcon className="h-4 w-4" />,
                    display: <Settings className="h-4 w-4" />,
                  };
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
                        activeTab === tab ? "bg-[#EEF6FF] text-[#0057E7]" : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {icons[tab]}
                      {TAB_LABELS[tab]}
                      {tab === "images" && formData.galleryImages.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">({formData.galleryImages.length})</span>
                      )}
                      {tab === "variants" && formData.variants.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">({formData.variants.length})</span>
                      )}
                      {/* Error/warning dot */}
                      {hasErr && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                      )}
                      {!hasErr && hasWarn && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-yellow-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab panel */}
              <fieldset disabled={!hasProductWriteAccess} className="bg-white border border-[#DCEBFF] p-6 rounded-3xl shadow-sm min-h-[400px]">

                {/* ── Tab: Thông tin cơ bản ─────────────────────────────── */}
                {activeTab === "basic" && (
                  <div className="space-y-5">
                    <FormField label="Tên sản phẩm" required error={backendErrors["name"]}>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Hạt Royal Canin cho Mèo Kitten 2kg"
                        className={inputCls(!!backendErrors["name"] || (!formData.name.trim() && isDirty))}
                      />
                    </FormField>

                    <FormField label="Thương hiệu">
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand || ""}
                        onChange={handleInputChange}
                        placeholder="Royal Canin, Nekko, Smartheart..."
                        className={inputCls()}
                      />
                    </FormField>

                    <FormField label="Mô tả ngắn" hint="Hiển thị ở danh sách sản phẩm. Không dùng HTML.">
                      <textarea
                        name="shortDescription"
                        rows={3}
                        value={formData.shortDescription || ""}
                        onChange={handleInputChange}
                        placeholder="Tóm tắt tính năng nổi bật của sản phẩm..."
                        className={inputCls()}
                      />
                    </FormField>

                    <FormField
                      label="Mô tả chi tiết sản phẩm"
                      hint="Dùng công cụ định dạng để trình bày thành phần, công dụng, cách dùng, bảo quản... Nội dung này hiển thị ở trang chi tiết sản phẩm."
                    >
                      <RichTextEditor
                        value={formData.description || ""}
                        onChange={(html) => {
                          setFormData((prev) => ({ ...prev, description: html }));
                          markDirty();
                        }}
                        placeholder="Chi tiết công dụng, thành phần dinh dưỡng, cách dùng, bảo quản..."
                        minHeight={280}
                        disabled={!hasProductWriteAccess}
                      />
                    </FormField>

                    <FormField
                      label="Thành phần & Nguyên liệu"
                      hint="Dùng để trình bày chi tiết các thành phần dinh dưỡng của sản phẩm."
                    >
                      <RichTextEditor
                        value={formData.ingredients || ""}
                        onChange={(html) => {
                          setFormData((prev) => ({ ...prev, ingredients: html }));
                          markDirty();
                        }}
                        placeholder="Ví dụ: Thịt cá hồi, bột gạo, mỡ gà..."
                        minHeight={200}
                        disabled={!hasProductWriteAccess}
                      />
                    </FormField>

                    <FormField
                      label="Hướng dẫn cho ăn"
                      hint="Liều lượng sử dụng, cách cho ăn, cách bảo quản."
                    >
                      <RichTextEditor
                        value={formData.guide || ""}
                        onChange={(html) => {
                          setFormData((prev) => ({ ...prev, guide: html }));
                          markDirty();
                        }}
                        placeholder="Ví dụ: Mèo 1-2kg ăn 50g mỗi ngày..."
                        minHeight={200}
                        disabled={!hasProductWriteAccess}
                      />
                    </FormField>

                    <div className="p-4 border border-[#DCEBFF] bg-slate-50/50 rounded-2xl">
                      <div className="text-xs font-black text-[#0B1F3A] uppercase tracking-wider mb-2">Xem trước mô tả chi tiết</div>
                      {formData.description?.trim() ? (
                        <div
                          className="prose prose-sm max-w-none text-slate-700 text-sm font-medium border-t border-slate-100 pt-3 max-h-[300px] overflow-y-auto [&_a]:font-bold [&_a]:text-[#0057E7] [&_blockquote]:border-l-4 [&_blockquote]:border-[#0057E7] [&_blockquote]:bg-white [&_blockquote]:px-4 [&_h2]:text-xl [&_h2]:font-black [&_h3]:text-lg [&_h3]:font-extrabold [&_img]:max-h-[260px] [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.description) }}
                        />
                      ) : (
                        <p className="border-t border-slate-100 pt-3 text-sm font-semibold text-slate-400">Chưa có mô tả chi tiết.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Tab: Phân loại & SEO ──────────────────────────────── */}
                {activeTab === "taxonomy" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField label="Danh mục" required error={backendErrors["category"] || (!formData.categoryId && isDirty ? "Chưa chọn danh mục" : "")}>
                        <select
                          id="categoryId"
                          name="categoryId"
                          value={formData.categoryId || ""}
                          onChange={handleInputChange}
                          className={inputCls(!formData.categoryId && isDirty)}
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Phù hợp thú cưng">
                        <select name="petType" value={formData.petType} onChange={handleInputChange} className={inputCls()}>
                          {PET_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label="Loại sản phẩm">
                        <select name="productType" value={formData.productType} onChange={handleInputChange} className={inputCls()}>
                          {PRODUCT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Đường dẫn SEO (Slug)" hint="Tự động sinh từ tên. Nên ngắn, không dấu, dùng dấu gạch ngang.">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug || ""}
                          onChange={(e) => {
                            handleInputChange(e);
                            setIsSlugManuallyEdited(true);
                          }}
                          placeholder="vd: hat-royal-canin-meo-kitten-2kg"
                          className={`flex-1 ${inputCls()}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
                            setIsSlugManuallyEdited(true);
                            markDirty();
                            toast.success("Đã tạo lại slug từ tên sản phẩm!");
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#0057E7] bg-[#EEF6FF] hover:bg-[#DCEBFF] rounded-xl transition-all whitespace-nowrap"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Tạo lại
                        </button>
                      </div>
                    </FormField>
                  </div>
                )}

                {/* ── Tab: Biến thể & Tồn kho ──────────────────────────── */}
                {activeTab === "variants" && (
                  <div className="space-y-6">
                    {/* Header actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-sm font-black text-[#0B1F3A] uppercase tracking-wider">Biến thể sản phẩm</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          Quản lý SKU, giá bán và tồn kho cho từng biến thể.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {formData.variants.some((v) => v.option1Name || v.option1Value || v.option2Name || v.option2Value) ? (
                          <button
                            type="button"
                            onClick={handleRemoveClassification}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100"
                          >
                            Bỏ phân loại
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleAddClassification}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#0057E7] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
                          >
                            Thêm phân loại
                          </button>
                        )}
                        {formData.variants.length > 0 && (
                          <button
                            type="button"
                            onClick={generateSkuForAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            Tự tạo SKU
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={addVariant}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-[#0057E7] hover:bg-[#0047C4] rounded-xl transition-all shadow-[0_4px_10px_rgba(0,87,231,0.15)]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Thêm biến thể
                        </button>
                      </div>
                    </div>

                    {formData.variants.some((v) => v.option1Name || v.option1Value || v.option2Name || v.option2Value) && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold py-1">
                        <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
                        <span>Tên biến thể được ghép từ giá trị phân loại.</span>
                      </div>
                    )}

                    {/* Variant Cards */}
                    <div className="space-y-4">
                      {formData.variants.map((v, idx) => {
                        const hasErr = validationIssues.some(
                          (issue) =>
                            issue.tab === "variants" &&
                            issue.severity === "error" &&
                            issue.field?.startsWith(`variants.${idx}.`)
                        );
                        
                        const hasClassification = formData.variants.some(
                          (v) => v.option1Name || v.option1Value || v.option2Name || v.option2Value
                        );

                        const displayName = buildVariantName(v);
                        
                        const skuErr = validationIssues.find(issue => issue.field === `variants.${idx}.sku`);
                        const priceErr = validationIssues.find(issue => issue.field === `variants.${idx}.price`);
                        const origPriceErr = validationIssues.find(issue => issue.field === `variants.${idx}.originalPrice`);
                        const stockErr = validationIssues.find(issue => issue.field === `variants.${idx}.stockQuantity`);

                        const hasDiscount = !origPriceErr && !!v.originalPrice && v.originalPrice > v.price && v.price > 0;
                        const discountPercent = hasDiscount ? Math.round(((Number(v.originalPrice) - v.price) / Number(v.originalPrice)) * 100) : 0;
                        const savingAmount = hasDiscount ? Number(v.originalPrice) - v.price : 0;

                        return (
                          <div
                            key={idx}
                            className={`bg-white border rounded-2xl p-5 transition-all space-y-4 ${
                              hasErr ? "border-red-400 ring-2 ring-red-100 shadow-red-100/50" : "border-slate-200 shadow-sm"
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                  Biến thể #{idx + 1}
                                </span>
                                <span className="text-sm font-extrabold text-[#0B1F3A]">
                                  {displayName || "Mặc định"}
                                </span>
                                {v.sku && (
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                                    {v.sku}
                                  </span>
                                )}
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                    v.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                  }`}
                                >
                                  {v.isActive ? "Đang bật" : "Đang tắt"}
                                </span>
                                {hasErr && (
                                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[10px] font-black border border-red-100 animate-pulse">
                                    Cần sửa
                                  </span>
                                )}
                              </div>
                              
                              {/* Toggle + Delete */}
                              <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={!!v.isActive}
                                    onChange={(e) => handleVariantChange(idx, "isActive", e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                                </label>
                                
                                {v.hasOrderHistory ? (
                                  <span
                                    className="h-8 w-8 rounded-lg hover:bg-orange-50 text-orange-400 flex items-center justify-center transition-colors cursor-help"
                                    title="Biến thể đã có đơn hàng. Hệ thống sẽ chỉ ẩn biến thể."
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(idx)}
                                    className="h-8 w-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                                    title="Xóa biến thể"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Grid Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* SKU */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <label htmlFor={`variants.${idx}.sku`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    SKU <span className="text-red-500">*</span>
                                  </label>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => generateSkuForOne(idx)}
                                      className="text-[10px] font-black text-[#0057E7] hover:underline"
                                    >
                                      Tạo SKU
                                    </button>
                                    {v.sku && (
                                      <>
                                        <span className="text-slate-300">|</span>
                                        <button
                                          type="button"
                                          onClick={() => { navigator.clipboard.writeText(v.sku); toast.success("Đã copy SKU!"); }}
                                          className="text-[10px] font-black text-slate-400 hover:text-[#0057E7]"
                                        >
                                          Copy
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  id={`variants.${idx}.sku`}
                                  placeholder="3F-ABC-001"
                                  value={v.sku}
                                  onChange={(e) => handleVariantChange(idx, "sku", e.target.value.toUpperCase())}
                                  className={`w-full px-3 py-2 text-sm font-semibold border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0057E7] uppercase ${
                                    skuErr ? "border-red-400 bg-red-50" : "border-slate-200"
                                  }`}
                                />
                                {skuErr && <p className="text-[10px] text-red-500 font-semibold mt-1">{skuErr.message}</p>}
                              </div>

                              {/* Variant name */}
                              <div className="space-y-1">
                                <label htmlFor={`variants.${idx}.variantName`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  Tên biến thể
                                </label>
                                <input
                                  type="text"
                                  id={`variants.${idx}.variantName`}
                                  placeholder="Tên biến thể"
                                  value={v.variantName || ""}
                                  onChange={(e) => handleVariantChange(idx, "variantName", e.target.value)}
                                  className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0057E7]"
                                />
                              </div>

                              {/* Phân loại 1 & 2 (Conditional) */}
                              {hasClassification && (
                                <>
                                  <div className="space-y-1">
                                    <OptionSelect
                                      label="Phân loại 1"
                                      optionName={v.option1Name || ""}
                                      optionValue={v.option1Value || ""}
                                      onNameChange={(val) => handleVariantChange(idx, "option1Name", val)}
                                      onValueChange={(val) => handleVariantChange(idx, "option1Value", val)}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <OptionSelect
                                      label="Phân loại 2"
                                      optionName={v.option2Name || ""}
                                      optionValue={v.option2Value || ""}
                                      onNameChange={(val) => handleVariantChange(idx, "option2Name", val)}
                                      onValueChange={(val) => handleVariantChange(idx, "option2Value", val)}
                                    />
                                  </div>
                                </>
                              )}

                              {/* Giá bán thực tế */}
                              <div className="space-y-1">
                                <label htmlFor={`variants.${idx}.price`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  Giá bán thực tế <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  id={`variants.${idx}.price`}
                                  min={0}
                                  step="any"
                                  placeholder="0"
                                  value={v.price || ""}
                                  onChange={(e) => handleVariantChange(idx, "price", parseFloat(e.target.value) || 0)}
                                  className={`w-full px-3 py-2 text-sm font-black text-[#0057E7] border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0057E7] ${
                                    priceErr ? "border-red-400 bg-red-50" : "border-slate-200"
                                  }`}
                                />
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Giá khách thanh toán. {v.price > 0 && `(Xem trước: ${formatVnd(v.price)})`}</p>
                                {priceErr && <p className="text-[10px] text-red-500 font-semibold mt-1">{priceErr.message}</p>}
                              </div>

                              {/* Giá niêm yết */}
                              <div className="space-y-1">
                                <label htmlFor={`variants.${idx}.originalPrice`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  Giá niêm yết / Giá trước khuyến mãi
                                </label>
                                <input
                                  type="number"
                                  id={`variants.${idx}.originalPrice`}
                                  min={0}
                                  step="any"
                                  placeholder="Không giảm"
                                  value={v.originalPrice === null || v.originalPrice === undefined ? "" : v.originalPrice}
                                  onChange={(e) =>
                                    handleVariantChange(idx, "originalPrice", e.target.value === "" ? null : parseFloat(e.target.value) || null)
                                  }
                                  className={`w-full px-3 py-2 text-sm font-semibold border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0057E7] ${
                                    origPriceErr ? "border-red-400 bg-red-50" : "border-slate-200"
                                  }`}
                                />
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  Có thể bỏ trống nếu không giảm giá. {v.originalPrice ? `(Xem trước: ${formatVnd(v.originalPrice)})` : ""}
                                </p>
                                {origPriceErr && <p className="text-[10px] text-red-500 font-semibold mt-1">{origPriceErr.message}</p>}
                                {hasDiscount && (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black text-emerald-600 border border-emerald-100">
                                      Đang giảm {discountPercent}%
                                    </span>
                                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black text-blue-600 border border-blue-100">
                                      Tiết kiệm {formatVnd(savingAmount)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Tồn kho */}
                              <div className="space-y-1 md:col-span-2">
                                <label htmlFor={`variants.${idx}.stockQuantity`} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  Tồn kho <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  id={`variants.${idx}.stockQuantity`}
                                  min={0}
                                  placeholder="0"
                                  value={v.stockQuantity}
                                  onChange={(e) => handleVariantChange(idx, "stockQuantity", parseInt(e.target.value) || 0)}
                                  className={`w-full md:w-1/2 px-3 py-2 text-sm font-semibold border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0057E7] ${
                                    stockErr ? "border-red-400 bg-red-50" : "border-slate-200"
                                  }`}
                                />
                                {stockErr && <p className="text-[10px] text-red-500 font-semibold mt-1">{stockErr.message}</p>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Tab: Hình ảnh ────────────────────────────────────── */}
                {activeTab === "images" && (
                  <div className="space-y-6">
                    {hasProductWriteAccess && (
                      <>
                        <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-2 text-xs font-semibold text-slate-500">
                            <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0057E7]" />
                            <span>Hỗ trợ JPG, PNG, WEBP. Khuyến nghị ảnh vuông 800x800 hoặc 1000x1000.</span>
                          </div>
                          <div className="inline-flex w-full rounded-xl border border-blue-100 bg-white p-1 sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setImageAddMode("upload")}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all sm:flex-none ${
                                imageAddMode === "upload" ? "bg-[#0057E7] text-white" : "text-slate-500 hover:bg-slate-50"
                              }`}
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              Tải ảnh lên
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageAddMode("url")}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all sm:flex-none ${
                                imageAddMode === "url" ? "bg-[#0057E7] text-white" : "text-slate-500 hover:bg-slate-50"
                              }`}
                            >
                              <Link2 className="h-3.5 w-3.5" />
                              Thêm bằng URL
                            </button>
                          </div>
                        </div>

                        {imageAddMode === "upload" ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingImages(true);
                            }}
                            onDragLeave={() => setIsDraggingImages(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingImages(false);
                              handleUploadFiles(e.dataTransfer.files);
                            }}
                            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                              isDraggingImages ? "border-[#0057E7] bg-[#EEF6FF]" : "border-slate-200 bg-white"
                            }`}
                          >
                            <input
                              id="product-image-upload"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              disabled={uploadingImages || !hasProductWriteAccess}
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleUploadFiles(e.target.files);
                                  e.target.value = "";
                                }
                              }}
                              className="sr-only"
                            />
                            <label
                              htmlFor="product-image-upload"
                              className="mx-auto flex max-w-md cursor-pointer flex-col items-center gap-3"
                            >
                              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF6FF] text-[#0057E7]">
                                {uploadingImages ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
                              </span>
                              <span className="text-sm font-black text-[#0B1F3A]">
                                {uploadingImages ? "Đang tải ảnh lên..." : "Kéo thả ảnh vào đây"}
                              </span>
                              <span className="text-xs font-semibold text-slate-400">hoặc bấm để chọn ảnh từ máy</span>
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Link2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                  type="url"
                                  placeholder="Dán link ảnh https://..."
                                  value={newImageUrl}
                                  onChange={(e) => {
                                    setNewImageUrl(e.target.value);
                                    setImageUrlError("");
                                  }}
                                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImageUrl())}
                                  className={`pl-9 pr-4 py-2.5 w-full text-sm font-semibold text-[#0B1F3A] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] ${
                                    imageUrlError ? "border-red-300 bg-red-50" : "border-slate-200"
                                  }`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-5 py-2.5 bg-[#082B5F] hover:bg-[#062047] text-white font-bold text-sm rounded-xl transition-all shrink-0"
                              >
                                Thêm ảnh
                              </button>
                            </div>
                            {imageUrlError && <p className="text-[11px] font-bold text-red-500">{imageUrlError}</p>}
                          </div>
                        )}
                      </>
                    )}

                    {/* Gallery */}
                    {formData.galleryImages.length === 0 ? (
                      <div className="border border-dashed border-slate-200 bg-slate-50/60 p-12 rounded-2xl text-center flex flex-col items-center gap-3">
                        <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                          <ImageIcon className="h-7 w-7 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-500">Chưa có hình ảnh nào</p>
                          <p className="text-xs text-slate-400 mt-1">Hãy tải ảnh lên hoặc thêm bằng URL để bắt đầu gallery sản phẩm.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {formData.galleryImages.map((img) => (
                          <ImageCard
                            key={img.url}
                            img={img}
                            onSetPrimary={handleSetPrimaryImage}
                            onRemove={handleRemoveImage}
                            onAltChange={handleImageAltChange}
                            onSortOrderChange={handleImageSortOrderChange}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab: Hiển thị ────────────────────────────────────── */}
                {activeTab === "display" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ToggleCard
                        name="isActive"
                        checked={!!formData.isActive}
                        onChange={handleCheckboxChange}
                        title="Hiển thị bán hàng"
                        description="Cho phép khách hàng tìm kiếm và đặt hàng sản phẩm."
                        activeColor="peer-checked:bg-green-500"
                      />
                      <ToggleCard
                        name="isFeatured"
                        checked={!!formData.isFeatured}
                        onChange={handleCheckboxChange}
                        title="Sản phẩm nổi bật"
                        description="Đưa vào khu vực nổi bật trên trang chủ và gợi ý."
                        activeColor="peer-checked:bg-yellow-500"
                      />
                    </div>
                  </div>
                )}
              </fieldset>
            </div>

            {/* ── Right col: Save panel ──────────────────────────────── */}
            <div className="lg:col-span-3 space-y-4 sticky top-24 z-20">
              <div className="bg-white border border-[#DCEBFF] p-5 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-black text-xs text-[#0B1F3A] uppercase tracking-wider border-b border-slate-100 pb-3">
                  Thao tác
                </h3>

                {/* Status info */}
                <div className="space-y-2 text-xs">
                  <InfoRow label="Chế độ" value={isEditMode ? "Cập nhật" : "Tạo mới"} />
                  <InfoRow label="Biến thể" value={String(formData.variants.length)} />
                  <InfoRow label="Hình ảnh" value={String(formData.galleryImages.length)} />
                  <InfoRow
                    label="Thay đổi"
                    value={isDirty ? "Chưa lưu" : "Chưa có"}
                    valueClass={isDirty ? "text-orange-500 font-extrabold" : "text-slate-400"}
                  />
                </div>

                {/* Validation summary */}
                {validationIssues.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 space-y-1.5">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Kiểm tra</div>
                    {validationIssues.map((issue, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleIssueClick(issue)}
                        className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:bg-slate-50 ${
                          issue.severity === "error" ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {issue.severity === "error" ? "✕" : "⚠"}
                        </span>
                        <span className="leading-tight">{issue.message}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-1 space-y-2">
                  {hasProductWriteAccess && (
                    <button
                      type="submit"
                      disabled={saving || hasErrors}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-black text-white bg-[#0057E7] hover:bg-[#0047C4] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(0,87,231,0.2)] hover:shadow-none rounded-xl transition-all"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Lưu sản phẩm
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full py-2.5 text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                  >
                    {hasProductWriteAccess ? "Hủy bỏ" : "Quay lại"}
                  </button>

                  {isEditMode && hasProductWriteAccess && (
                    <button
                      type="button"
                      onClick={handleDeleteProduct}
                      disabled={saving || hasOrderHistory}
                      title={hasOrderHistory ? "Sản phẩm đã có đơn hàng, không thể xóa" : "Xóa sản phẩm này"}
                      className="w-full py-2.5 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 rounded-xl transition-all mt-4"
                    >
                      Xóa sản phẩm
                    </button>
                  )}
                </div>

                {/* Validation status indicator */}
                <div className="text-center">
                  {!hasErrors && validationIssues.length === 0 ? (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-green-500">
                      <Check className="h-3 w-3" /> Hợp lệ — sẵn sàng lưu
                    </div>
                  ) : hasErrors ? (
                    <div className="text-[10px] font-black text-red-500">
                      {validationIssues.filter((i) => i.severity === "error").length} lỗi cần sửa trước khi lưu
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-yellow-500">
                      <AlertTriangle className="h-3 w-3" /> Có cảnh báo — vẫn có thể lưu
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </main>

        <footer className="h-14 bg-white border-t border-[#DCEBFF] px-4 sm:px-6 flex items-center justify-between text-[11px] text-slate-400 font-semibold shrink-0">
          <span>© 2026 3F Store Admin</span>
          <span>v1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function inputCls(hasError?: boolean) {
  return `w-full px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0057E7] transition-all ${
    hasError ? "border-red-400 bg-red-50" : "border-slate-200"
  }`;
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-black text-[#0B1F3A] uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[10px] text-slate-400 font-bold">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>}
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400 font-bold">{label}:</span>
      <span className={`font-extrabold text-[#082B5F] ${valueClass || ""}`}>{value}</span>
    </div>
  );
}

interface ToggleCardProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description: string;
  activeColor: string;
}

function ToggleCard({ name, checked, onChange, title, description, activeColor }: ToggleCardProps) {
  return (
    <div className="flex items-start justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm gap-3">
      <div>
        <div className="text-xs font-black text-[#0B1F3A] uppercase tracking-wider">{title}</div>
        <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{description}</div>
      </div>
      {/* Toggle switch */}
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
        <div className={`w-10 h-5 bg-slate-200 rounded-full peer ${activeColor} transition-colors`} />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}

// VariantRow has been replaced by the variant cards structure above

// ─── ImageCard ────────────────────────────────────────────────────────────────
interface ImageCardProps {
  img: AdminProductImagePayload;
  onSetPrimary: (url: string) => void;
  onRemove: (url: string) => void;
  onAltChange: (url: string, alt: string) => void;
  onSortOrderChange: (url: string, sortOrder: number) => void;
}

function ImageCard({ img, onSetPrimary, onRemove, onAltChange, onSortOrderChange }: ImageCardProps) {
  return (
    <div className={`bg-white border rounded-2xl overflow-hidden relative group p-3 shadow-sm transition-all ${
      img.isPrimary ? "border-[#0057E7] ring-2 ring-blue-100 shadow-blue-100/70" : "border-slate-200"
    }`}>
      <div className="aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 relative">
        <img
          src={img.url}
          alt={img.altText || "Product image"}
          className="h-full w-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).src = "/assets/images/dog-food.webp"; }}
        />
        {img.isPrimary && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-[#0057E7] text-white text-[9px] font-black flex items-center gap-1">
            <Check className="h-2.5 w-2.5" /> Ảnh chính
          </div>
        )}
        <button
          type="button"
          onClick={() => { if (window.confirm("Xóa ảnh này?")) onRemove(img.url); }}
          title="Xóa ảnh"
          className="absolute top-2 right-2 h-7 w-7 rounded-lg bg-white/95 border border-slate-200 text-slate-400 hover:text-red-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-[1fr_80px] gap-2">
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Alt text / Mô tả ảnh</span>
            <input
              type="text"
              placeholder="Mô tả ảnh cho SEO..."
              value={img.altText || ""}
              onChange={(e) => onAltChange(img.url, e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0057E7]"
            />
          </label>
          <label className="space-y-1">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
              <GripVertical className="h-3 w-3" />
              Thứ tự
            </span>
            <input
              type="number"
              min={1}
              value={img.sortOrder}
              onChange={(e) => onSortOrderChange(img.url, Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-[11px] font-black text-center focus:outline-none focus:ring-1 focus:ring-[#0057E7]"
            />
          </label>
        </div>
        {!img.isPrimary ? (
          <button
            type="button"
            onClick={() => onSetPrimary(img.url)}
            className="w-full py-2 bg-[#EEF6FF] hover:bg-[#DCEBFF] text-[#0057E7] border border-blue-100 text-[11px] font-black rounded-lg transition-all"
          >
            Đặt làm ảnh chính
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-400 text-[11px] font-black rounded-lg text-center cursor-not-allowed"
          >
            Đã là ảnh chính
          </button>
        )}
      </div>
    </div>
  );
}
