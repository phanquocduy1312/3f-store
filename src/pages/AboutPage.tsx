import { useEffect } from "react";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutCategories } from "@/components/about/AboutCategories";
import { AboutWhyChooseUs } from "@/components/about/AboutWhyChooseUs";
import { AboutConsulting } from "@/components/about/AboutConsulting";
import { AboutChannels } from "@/components/about/AboutChannels";
import { AboutStoreInfo } from "@/components/about/AboutStoreInfo";
import { AboutCTA } from "@/components/about/AboutCTA";

export function AboutPage() {
  useEffect(() => {
    // Set document metadata for SEO
    document.title = "Giới thiệu 3F Store – Cửa hàng thú cưng cho chó mèo";
    
    // Find or create meta description tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "3F Store cung cấp thức ăn, phụ kiện và sản phẩm chăm sóc thú cưng chính hãng cho chó mèo, tư vấn phù hợp theo từng bé, giao hàng nhanh và hỗ trợ sau bán."
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* About Page Sections */}
      <AboutHero />
      <AboutIntro />
      <AboutCategories />
      <AboutWhyChooseUs />
      <AboutConsulting />
      <AboutChannels />
      <AboutStoreInfo />
      <AboutCTA />
    </div>
  );
}
