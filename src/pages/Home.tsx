import { BlogNewsletter } from "@/components/BlogNewsletter";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";
import { HeroSection } from "@/components/HeroSection";
import { PetFoodSection } from "@/components/PetFoodSection";
import { ProductSlider } from "@/components/ProductSlider";



import { VoucherSection } from "@/components/VoucherSection";

export function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white "  >
 
      <HeroSection />
      <VoucherSection />
      <WhyChooseUsSection />
      <PetFoodSection />
      <div className="relative overflow-hidden bg-cream/20">
        <div className="pointer-events-none absolute left-0 top-6 h-72 w-72 rounded-full bg-forest/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-honey/10 blur-3xl" />
        <ProductSlider />
        <BlogNewsletter />
      </div>
    </div>
  );
}
