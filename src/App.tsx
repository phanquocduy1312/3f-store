import { BlogNewsletter } from "@/components/BlogNewsletter";
import { CategorySection } from "@/components/CategorySection";
import { DealsSection } from "@/components/DealsSection";
import { BigDealsSection } from "@/components/BigDealsSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PetFoodSection } from "@/components/PetFoodSection";
import { ProductSlider } from "@/components/ProductSlider";
import { SaleSection } from "@/components/SaleSection";
import { ReasonsSection } from "@/components/ReasonsSection";

export function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <Header />
      <HeroSection />
      <CategorySection />
      <PetFoodSection />
      <SaleSection />
      <ProductSlider />
      <ReasonsSection />
      <BlogNewsletter />
      <Footer />
    </main>
  );
}
