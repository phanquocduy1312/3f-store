import { BlogNewsletter } from "@/components/BlogNewsletter";
import { WhyChooseUsSection } from "@/components/WhyChooseUsSection";
import { HeroSection } from "@/components/HeroSection";
import { PetFoodSection } from "@/components/PetFoodSection";
import { ProductSlider } from "@/components/ProductSlider";
import { ThreeFClub } from "@/components/threeFclup";
import { VoucherSection } from "@/components/VoucherSection";
import { PetAdvisorPopup } from "@/components/pet-advisor/PetAdvisorPopup";

export function Home() {
	return (
		<div className="flex flex-col min-h-screen bg-white ">
			<HeroSection />
			<VoucherSection />
			<WhyChooseUsSection />
			<PetFoodSection />
			<div className="relative overflow-hidden bg-cream/20">
				<div className="pointer-events-none absolute left-0 top-24 h-72 w-72 rounded-full bg-forest/5 blur-3xl" />
				<div className="pointer-events-none absolute bottom-10 right-0 h-72 w-72 rounded-full bg-honey/10 blur-3xl" />
				<ProductSlider />
				<ThreeFClub
					assets={{
						badgeSilver: "/assets/images/badge_silver.png",
						badgeGold: "/assets/images/badge_gold.png",
						badgePlatinum: "/assets/images/badge_platinum.png",
						petHero: "/assets/images/dog_cat_heart_rbg.png",
						pawBlue: "/assets/images/icon_paw_blue.png",
						pawLight: "/assets/images/icon_paw_light.png",
						pointsIcon: "/assets/images/icon_points.png",
						giftIcon: "/assets/images/icon_gift.png",
						discountIcon: "/assets/images/icon_discount_tag.png",
						petProfileIcon: "/assets/images/icon_pet_profile.png",
						ticketIcon: "/assets/images/icon_ticket_star.png",
						calendarIcon: "/assets/images/icon_calendar_clock.png",
						couponIcon: "/assets/images/icon_coupon_percent.png",
					}}
					onJoin={() => console.log("Join 3F Club")}
					onLearnMore={() => console.log("Learn more")}
				/>
				<BlogNewsletter />
			</div>
			<PetAdvisorPopup />
		</div>
	);
}
