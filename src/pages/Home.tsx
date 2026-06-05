import { BlogNewsletter } from "@/components/BlogNewsletter";
import { CategorySection } from "@/components/CategorySection";
import { HeroSection } from "@/components/HeroSection";
import { PetFoodSection } from "@/components/PetFoodSection";
import { ProductSlider } from "@/components/ProductSlider";
import { SaleSection } from "@/components/SaleSection";
import { ReasonsSection } from "@/components/ReasonsSection";

export function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <PetFoodSection />
      <SaleSection />
      <ProductSlider />
      <ReasonsSection />
      <BlogNewsletter />
    </>
  );
}
