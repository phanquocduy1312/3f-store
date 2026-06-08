import productsJson from "./products.json";
import type { Product, Category, Feature, BlogPost } from "../types/store";
import { PawPrint, CheckCircle, Truck, Heart, ShieldCheck, Clock, Stethoscope, RotateCcw } from "lucide-react";

const ALL_PRODUCTS: Product[] = (productsJson as unknown) as Product[];
// Limit number of products rendered to avoid heavy DOM / visual artifacts
const MAX_PRODUCTS = 20;
export const products: Product[] = ALL_PRODUCTS.slice(0, MAX_PRODUCTS);
export const allProducts = ALL_PRODUCTS;

const normalizeText = (value?: string) => String(value ?? "").trim().toLowerCase();

const normalizeSearchText = (value?: string) =>
  normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const hasAnyTerm = (value: string, terms: string[]) => terms.some((term) => value.includes(term));

const foodTerms = ["thuc an", "do an", "pate", "snack", "hat", "sup", "dinh duong", "banh thuong"];
const nonFoodTerms = ["ve sinh", "cat dau nanh", "khay", "bon ve sinh", "do choi", "phu kien"];

const getPetFoodProducts = (petTerms: string[], limit = MAX_PRODUCTS): Product[] =>
  allProducts
    .filter((product) => {
      const searchText = normalizeSearchText(`${product.category ?? ""} ${product.name}`);
      return hasAnyTerm(searchText, petTerms) && hasAnyTerm(searchText, foodTerms) && !hasAnyTerm(searchText, nonFoodTerms);
    })
    .slice(0, limit);

export const getProductsByCategory = (category: string, limit = MAX_PRODUCTS): Product[] => {
  const normalizedCategory = normalizeText(category);
  if (!normalizedCategory || normalizedCategory === "all") {
    return allProducts.slice(0, limit);
  }

  return allProducts
    .filter((product) => {
      const productCategory = normalizeText(product.category);
      const productName = normalizeText(product.name);
      return productCategory.includes(normalizedCategory) || productName.includes(normalizedCategory);
    })
    .slice(0, limit);
};

export const getProductById = (id: string | number): Product | undefined => {
  return allProducts.find(p => String(p.id) === String(id)) || allProducts[0];
};

export const getSaleProducts = (limit = 12): Product[] =>
  allProducts.filter((product) => !!product.oldPrice).slice(0, limit);

export const getCatFoodProducts = (limit = 12): Product[] =>
  getPetFoodProducts(["cho meo", "meo", "cat"], limit);

export const getDogFoodProducts = (limit = 12): Product[] =>
  getPetFoodProducts(["cho cho", "cun", "dog"], limit);

export const getFeaturedProducts = (limit = 12): Product[] =>
  [...allProducts]
    .sort((a, b) => {
      const ratingDiff = b.rating - a.rating;
      return ratingDiff !== 0 ? ratingDiff : b.sold - a.sold;
    })
    .slice(0, limit);

export const getBestSellerProducts = (limit = 12): Product[] =>
  [...allProducts].sort((a, b) => b.sold - a.sold).slice(0, limit);

const uniqueTopCategories = Array.from(
  new Set(
    allProducts
      .map((p) => String((p as any).category ?? "").split(">")[0].trim() || "Khác")
      .filter(Boolean),
  ),
).slice(0, 6);

export const categories: Category[] = uniqueTopCategories.map((title, idx) => ({
  title,
  image: [
    "/assets/images/cat.png",
    "/assets/images/dog.png",
    "/assets/images/dogandcat.png",
    "/assets/images/cat-food.png",
    "/assets/images/dog-food.png",
    "/assets/images/accessories.png",
  ][idx % 6],
  tone: "green",
}));

export const heroFeatures: Feature[] = [
  { title: "Giao hàng nhanh", description: "Giao hàng toàn quốc trong 48h", icon: Truck },
  { title: "Sản phẩm chính hãng", description: "Sản phẩm có nguồn gốc rõ ràng", icon: CheckCircle },
  { title: "Hỗ trợ 24/7", description: "Tư vấn chăm sóc thú cưng mọi lúc", icon: PawPrint },
];

export const reasons = [
  {
    title: "100% Chính hãng",
    description: "Nhập khẩu trực tiếp từ nhà sản xuất. Mỗi sản phẩm đều có tem xác thực và chứng nhận kiểm định an toàn.",
    icon: ShieldCheck,
    image: "/assets/images/reason-quality.png",
    stats: "500+",
    statsLabel: "thương hiệu uy tín",
    accentColor: "emerald",
  },
  {
    title: "Giao siêu tốc 2h",
    description: "Đặt hàng trước 14h — nhận hàng trong ngày tại TP.HCM & Hà Nội. Giao toàn quốc chỉ 24-48h.",
    icon: Clock,
    image: "/assets/images/reason-delivery.png",
    stats: "2h",
    statsLabel: "giao nội thành",
    accentColor: "amber",
  },
  {
    title: "Tư vấn từ chuyên gia",
    description: "Đội ngũ bác sĩ thú y hỗ trợ 24/7. Tư vấn miễn phí về dinh dưỡng, sức khỏe và hành vi thú cưng.",
    icon: Stethoscope,
    image: "/assets/images/reason-expert.png",
    stats: "24/7",
    statsLabel: "luôn sẵn sàng",
    accentColor: "sky",
  },
  {
    title: "Đổi trả 30 ngày",
    description: "Không hài lòng? Hoàn tiền 100% trong 30 ngày — không điều kiện, không rắc rối.",
    icon: RotateCcw,
    image: "/assets/images/reason-refund.png",
    stats: "30",
    statsLabel: "ngày đổi trả",
    accentColor: "violet",
  },
];

export const reasonStats = [
  { number: 15000, label: "thú cưng hạnh phúc", suffix: "+", icon: PawPrint },
  { number: 4.9, label: "đánh giá trung bình", suffix: "/5", icon: CheckCircle },
  { number: 50000, label: "đơn hàng thành công", suffix: "+", icon: Truck },
];

export const navItems: string[] = ["Trang chủ", "Sản phẩm", "Ưu đãi", "Blog", "Liên hệ"];

export const footerColumns = [
  { title: "Về chúng tôi", links: ["Giới thiệu", "Tuyển dụng", "Liên hệ"] },
  { title: "Hỗ trợ", links: ["Hướng dẫn mua hàng", "Chính sách đổi trả", "FAQ"] },
  { title: "Chính sách", links: ["Bảo mật", "Thanh toán", "Giao hàng"] },
  { title: "Kênh", links: ["Facebook", "Instagram", "YouTube"] },
];

export const socialLinks: string[] = ["Facebook", "Instagram", "YouTube"];

export const blogPosts: BlogPost[] = products.slice(0, 6).map((p) => ({
  title: p.name.slice(0, 80),
  image: p.image,
  date: "2026-06-04",
  category: String((p as any).category ?? "Tin tức").split(">")[0].trim(),
}));

export default products;
