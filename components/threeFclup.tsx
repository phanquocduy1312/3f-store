import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
	Calendar,
	Check,
	ChevronRight,
	CircleDollarSign,
	Clock,
	Gift,
	PawPrint,
	Percent,
	Star,
} from "lucide-react";

export type ThreeFClubAssets = Partial<{
	badgeSilver: string;
	badgeGold: string;
	badgePlatinum: string;
	petHero: string;
	pawBlue: string;
	pawLight: string;
	pointsIcon: string;
	giftIcon: string;
	discountIcon: string;
	petProfileIcon: string;
	ticketIcon: string;
	calendarIcon: string;
	couponIcon: string;
}>;

export type ThreeFClubProps = {
	className?: string;
	assets?: ThreeFClubAssets;
	onJoin?: () => void;
	onLearnMore?: () => void;
	onSilverClick?: () => void;
	onGoldClick?: () => void;
	onPlatinumClick?: () => void;
};

const DEFAULT_ASSETS: ThreeFClubAssets = {
	badgeSilver: "/assets/images/3f-club/badge_silver.png",
	badgeGold: "/assets/images/3f-club/badge_gold.png",
	badgePlatinum: "/assets/images/3f-club/badge_platinum.png",
	petHero: "/assets/images/3f-club/ref_pet_hero_transparent_attempt.png",
	pawBlue: "/assets/images/3f-club/icon_paw_blue.png",
	pawLight: "/assets/images/3f-club/icon_paw_light.png",
	pointsIcon: "/assets/images/3f-club/icon_points.png",
	giftIcon: "/assets/images/3f-club/icon_gift.png",
	discountIcon: "/assets/images/3f-club/icon_discount_tag.png",
	petProfileIcon: "/assets/images/3f-club/icon_pet_profile.png",
	ticketIcon: "/assets/images/3f-club/icon_ticket_star.png",
	calendarIcon: "/assets/images/3f-club/icon_calendar_clock.png",
	couponIcon: "/assets/images/3f-club/icon_coupon_percent.png",
};

function cn(...classes: Array<string | false | null | undefined>) {
	return classes.filter(Boolean).join(" ");
}

function useIosevkaCharonFont() {
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (document.getElementById("iosevka-charon-font")) return;

		const googlePreconnect = document.createElement("link");
		googlePreconnect.rel = "preconnect";
		googlePreconnect.href = "https://fonts.googleapis.com";

		const gstaticPreconnect = document.createElement("link");
		gstaticPreconnect.rel = "preconnect";
		gstaticPreconnect.href = "https://fonts.gstatic.com";
		gstaticPreconnect.crossOrigin = "anonymous";

		const fontLink = document.createElement("link");
		fontLink.id = "iosevka-charon-font";
		fontLink.rel = "stylesheet";
		fontLink.href =
			"https://fonts.googleapis.com/css2?family=Iosevka+Charon:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap";

		document.head.append(googlePreconnect, gstaticPreconnect, fontLink);
	}, []);
}

type AssetOrIconProps = {
	src?: string;
	alt: string;
	className?: string;
	fallback: ReactNode;
};

function AssetOrIcon({ src, alt, className, fallback }: AssetOrIconProps) {
	const [failed, setFailed] = useState(false);

	if (!src || failed) {
		return (
			<span
				className={cn("inline-grid place-items-center", className)}
				aria-hidden="true"
			>
				{fallback}
			</span>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className={className}
			loading="lazy"
			draggable={false}
			onError={() => setFailed(true)}
		/>
	);
}

type TierTone = "silver" | "gold" | "platinum";

type Tier = {
	tone: TierTone;
	name: string;
	range: string;
	badge?: string;
	recommended?: boolean;
	action: string;
	benefits: string[];
};

type TierVisual = {
	card: string;
	name: string;
	range: string;
	check: string;
	button: string;
	badgeFallback: string;
	waveOne: string;
	waveTwo: string;
};

const TIER_VISUAL: Record<TierTone, TierVisual> = {
	silver: {
		card: "border-slate-300/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.98),#eff3f8)] shadow-[0_18px_34px_rgba(36,75,132,0.13)]",
		name: "text-[#526d88]",
		range: "bg-[#e4e9f1] text-[#293b5b]",
		check:
			"bg-[image:linear-gradient(to_bottom,rgb(var(--color-primary)),rgb(var(--color-primary-dark)))]",
		button:
			"border-2 border-[rgb(var(--color-primary))] bg-white text-[rgb(var(--color-primary-dark))] shadow-[inset_0_-6px_10px_rgba(var(--color-primary),0.04)]",
		badgeFallback: "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
		waveOne: "fill-slate-200/55",
		waveTwo: "fill-slate-300/25",
	},
	gold: {
		card: "-translate-y-0.5 border-[#ffbb21]/95 bg-[linear-gradient(150deg,rgba(255,255,255,0.98),#fff8dc)] shadow-[0_18px_35px_rgba(255,182,24,0.24)] ring-4 ring-[#ffc73d]/15",
		name: "text-[#d99500]",
		range: "bg-[#fff0b8] text-[#6d4b06]",
		check: "bg-gradient-to-b from-[#f7b724] to-[#de9700]",
		button:
			"bg-[image:linear-gradient(to_bottom,rgb(var(--color-primary)),rgb(var(--color-primary-dark)))] text-white shadow-[0_10px_16px_rgba(var(--color-primary),0.24)]",
		badgeFallback: "bg-gradient-to-br from-[#f8b928] to-[#df9300] text-white",
		waveOne: "fill-amber-200/55",
		waveTwo: "fill-amber-300/25",
	},
	platinum: {
		card: "border-indigo-300/80 bg-[linear-gradient(150deg,rgba(255,255,255,0.98),#f0f5ff)] shadow-[0_18px_34px_rgba(49,91,233,0.16)]",
		name: "text-[rgb(var(--color-primary))]",
		range: "bg-[rgb(var(--color-primary-muted))] text-[#293b5b]",
		check:
			"bg-[image:linear-gradient(to_bottom,rgb(var(--color-primary)),rgb(var(--color-primary-dark)))]",
		button:
			"bg-[image:linear-gradient(to_bottom,rgb(var(--color-primary)),rgb(var(--color-primary-darker)))] text-white shadow-[0_10px_16px_rgba(var(--color-primary),0.22)]",
		badgeFallback:
			"bg-[image:linear-gradient(to_bottom_right,rgb(var(--color-primary)),rgb(var(--color-primary-darker)))] text-white",
		waveOne: "fill-blue-200/55",
		waveTwo: "fill-indigo-300/25",
	},
};

function BackgroundWaves() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
		>
			<svg
				className="absolute -left-24 -top-24 h-[300px] w-[470px] text-blue-100/80"
				viewBox="0 0 470 300"
				fill="none"
			>
				<path
					d="M-13 141C24 72 94 20 177 8C260 -4 352 22 399 84C447 147 451 246 392 283C333 321 210 297 127 274C43 251 -50 209 -13 141Z"
					fill="currentColor"
				/>
			</svg>

			<svg
				className="absolute -bottom-16 -left-10 h-[210px] w-[390px] text-blue-100/80"
				viewBox="0 0 390 210"
				fill="none"
			>
				<path
					d="M-13 155C43 91 107 88 169 120C231 152 291 212 356 193C421 174 490 76 516 89V231H-13V155Z"
					fill="currentColor"
				/>
			</svg>

			<svg
				className="absolute -bottom-8 -right-28 h-[320px] w-[700px] text-blue-200/80"
				viewBox="0 0 700 320"
				fill="none"
			>
				<path
					d="M54 225C121 122 198 77 287 106C376 135 441 236 524 213C607 190 666 44 746 41V343H54V225Z"
					fill="currentColor"
				/>
				<path
					d="M141 267C206 206 292 190 357 219C422 248 467 322 540 294C613 266 713 137 768 137V343H141V267Z"
					className="fill-blue-300/35"
				/>
			</svg>
		</div>
	);
}

function CardWave({ tone }: { tone: TierTone }) {
	const visual = TIER_VISUAL[tone];

	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full"
			viewBox="0 0 360 96"
			preserveAspectRatio="none"
		>
			<path
				className={visual.waveTwo}
				d="M0 58C36 35 70 28 104 39C138 50 171 78 208 65C245 52 286 -3 360 13V96H0V58Z"
			/>
			<path
				className={visual.waveOne}
				d="M0 74C44 43 84 45 121 59C158 73 194 99 234 83C274 67 312 16 360 24V96H0V74Z"
			/>
		</svg>
	);
}

function CtaWaves() {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 1120 120"
			preserveAspectRatio="none"
		>
			<path
				className="fill-white/10"
				d="M0 80C80 44 157 40 232 61C307 82 379 128 456 101C533 74 612 -23 704 7C796 37 901 193 1120 51V120H0V80Z"
			/>
			<path
				className="fill-white/10"
				d="M0 40C98 72 178 72 241 49C304 26 349 -20 430 10C511 40 628 146 757 78C886 10 1028 -34 1120 30V120H0V40Z"
			/>
		</svg>
	);
}

function DecorativePaw({
	src,
	className,
	fallbackSize = 48,
}: {
	src?: string;
	className?: string;
	fallbackSize?: number;
}) {
	return (
		<span
			className={cn(
				"pointer-events-none absolute z-0 grid place-items-center",
				className,
			)}
			aria-hidden="true"
		>
			<AssetOrIcon
				src={src}
				alt=""
				className="h-full w-full object-contain"
				fallback={<PawPrint size={fallbackSize} strokeWidth={2.1} />}
			/>
		</span>
	);
}

function TierCard({
	tier,
	fallbackIcon,
	onClick,
}: {
	tier: Tier;
	fallbackIcon: ReactNode;
	onClick?: () => void;
}) {
	const visual = TIER_VISUAL[tier.tone];

	return (
		<article
			className={cn(
				"relative flex min-h-[363px] flex-col gap-5 overflow-hidden rounded-[26px] border-2 px-5 pb-5 pt-6 sm:px-6",
				visual.card,
			)}
		>
			<CardWave tone={tier.tone} />

			<div className="relative z-10 grid min-h-[92px] grid-cols-[74px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[80px_minmax(0,1fr)]">
				<div className="grid h-[84px] w-[74px] place-items-center drop-shadow-xl sm:h-[90px] sm:w-20">
					<AssetOrIcon
						src={tier.badge}
						alt={`Huy hiệu ${tier.name}`}
						className="h-full w-full object-contain"
						fallback={
							<span
								className={cn(
									"grid h-[70px] w-[70px] place-items-center rounded-2xl",
									visual.badgeFallback,
								)}
							>
								{fallbackIcon}
							</span>
						}
					/>
				</div>

				<div className="min-w-0">
					<h3
						className={cn(
							"m-0 text-[28px] font-black leading-none tracking-[-0.035em] sm:text-[32px]",
							visual.name,
						)}
					>
						{tier.name}
					</h3>
					<p
						className={cn(
							"mt-2 inline-flex min-h-8 items-center justify-center rounded-xl px-3.5 py-1 text-[14px] font-medium leading-none sm:text-[15px]",
							visual.range,
						)}
					>
						{tier.range}
					</p>
				</div>
			</div>

			<div className="relative z-10 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />

			<ul className="relative z-10 grid list-none gap-2.5 p-0">
				{tier.benefits.map((benefit) => (
					<li
						key={benefit}
						className="flex items-start gap-3 text-[14.5px] font-normal leading-snug text-[rgb(var(--color-ink))] sm:text-[15px]"
					>
						<span
							className={cn(
								"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white shadow-sm",
								visual.check,
							)}
						>
							<Check size={14} strokeWidth={4} />
						</span>
						<span>{benefit}</span>
					</li>
				))}
			</ul>

			<button
				className={cn(
					"relative z-10 mt-10 mt-auto min-h-[50px] rounded-2xl px-5 text-base font-bold transition duration-200 hover:-translate-y-0.5 hover:brightness-105",
					visual.button,
				)}
				type="button"
				onClick={onClick}
			>
				{tier.action}
			</button>
		</article>
	);
}

function ThreeFClub({
	className,
	assets,
	onJoin,
	onLearnMore,
	onSilverClick,
	onGoldClick,
	onPlatinumClick,
}: ThreeFClubProps) {
	useIosevkaCharonFont();

	const a = { ...DEFAULT_ASSETS, ...assets };

	const tiers: Tier[] = [
		{
			tone: "silver",
			name: "SILVER",
			range: "0 - 1.999 điểm",
			badge: a.badgeSilver,
			action: "Đăng ký ngay",
			benefits: [
				"Tích điểm mỗi đơn hàng",
				"Voucher chào mừng",
				"Ưu đãi sinh nhật cho bé",
				"Nhận tư vấn AI",
			],
		},
		{
			tone: "gold",
			name: "GOLD",
			range: "2.000 - 5.999 điểm",
			badge: a.badgeGold,
			action: "Tham gia Gold",
			benefits: [
				"Giảm thêm 3%",
				"Freeship đơn đủ điều kiện",
				"Quà sinh nhật hấp dẫn",
				"Ưu tiên ưu đãi độc quyền",
			],
		},
		{
			tone: "platinum",
			name: "PLATINUM",
			range: "6.000+ điểm",
			badge: a.badgePlatinum,
			action: "Lên hạng Platinum",
			benefits: [
				"Giảm thêm 5%",
				"Freeship toàn quốc",
				"Quà VIP cho Boss",
				"Ưu tiên xử lý đơn hàng",
				"Ưu đãi riêng theo hồ sơ thú cưng",
			],
		},
	];

	const topBenefits = [
		{
			text: "100.000đ = 1 điểm",
			src: a.pointsIcon,
			fallback: <CircleDollarSign size={30} strokeWidth={2.4} />,
		},
		{
			text: "500 điểm = đổi quà hoặc voucher",
			src: a.giftIcon,
			fallback: <Gift size={32} strokeWidth={2.4} />,
		},
		{
			text: "Cashback đến 3%",
			src: a.discountIcon,
			fallback: <Percent size={31} strokeWidth={2.5} />,
		},
		{
			text: "Ưu đãi theo hồ sơ thú cưng",
			src: a.petProfileIcon,
			fallback: <PawPrint size={31} strokeWidth={2.5} />,
		},
	];

	const sideBenefits = [
		{
			text: "Tích điểm tự động",
			src: a.pointsIcon,
			fallback: <CircleDollarSign size={30} strokeWidth={2.4} />,
		},
		{
			text: "Đổi quà linh hoạt",
			src: a.giftIcon,
			fallback: <Gift size={31} strokeWidth={2.4} />,
		},
		{
			text: "Ưu đãi thành viên mỗi tháng",
			src: a.ticketIcon,
			fallback: <Star size={31} strokeWidth={2.3} />,
		},
		{
			text: "Nhắc lịch mua lại & giao định kỳ",
			src: a.calendarIcon,
			fallback: (
				<span className="relative grid place-items-center text-[rgb(var(--color-primary))]">
					<Calendar size={30} strokeWidth={2.25} />
					<Clock
						size={17}
						strokeWidth={2.6}
						className="absolute -bottom-2 -right-2 rounded-full bg-[rgb(var(--color-primary))] p-0.5 text-white"
					/>
				</span>
			),
		},
	];

	return (
		<section
			className="relative bg-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8"
			aria-labelledby="three-f-title"
		>
			<div className="relative isolate mx-auto min-h-0 max-w-[1510px] overflow-hidden rounded-[28px] border border-blue-200/70 bg-[linear-gradient(120deg,rgb(var(--color-primary-soft))_0%,#ffffff_42%,rgb(var(--color-primary-soft))_100%)] px-4 py-7 text-[rgb(var(--color-primary-darker))] shadow-[0_22px_65px_rgba(var(--color-primary),0.13)] sm:px-7 lg:rounded-[34px] lg:px-10 xl:min-h-[814px]">
				<BackgroundWaves />

				<span className="pointer-events-none absolute left-[16%] top-[7%] z-0 text-3xl font-black text-blue-300/55 drop-shadow-sm">
					✦
				</span>
				<span className="pointer-events-none absolute right-[9%] top-[6%] z-0 text-2xl font-black text-blue-300/55 drop-shadow-sm">
					✦
				</span>
				<span className="pointer-events-none absolute left-[66%] top-[7%] z-0 text-xl font-black text-blue-300/55 drop-shadow-sm">
					✦
				</span>

				<DecorativePaw
					src={a.pawLight}
					className="left-[6%] top-[10%] h-14 w-14 -rotate-12 text-blue-500/15 opacity-70"
				/>
				<DecorativePaw
					src={a.pawLight}
					className="left-[21%] top-[5%] h-16 w-16 rotate-12 text-blue-500/15 opacity-70"
				/>
				<DecorativePaw
					src={a.pawBlue}
					className="right-[15%] top-[10%] h-16 w-16 text-blue-500/15 opacity-70"
				/>
				<DecorativePaw
					src={a.pawLight}
					className="right-[6%] top-[12%] h-12 w-12 text-blue-500/15 opacity-70"
				/>

				<header className="relative z-10 mb-4 text-center">
					<h2
						id="three-f-title"
						className="m-0 inline-flex items-end justify-center gap-3 text-[clamp(60px,6.3vw,102px)] font-bold leading-[0.82] tracking-[-0.065em] text-[rgb(var(--color-primary))] drop-shadow-[0_15px_25px_rgba(var(--color-primary),0.13)] sm:gap-4"
						style={{ fontFamily: '"Iosevka Charon", monospace' }}
						aria-label="3F Club"
					>
						<span className="inline-block">3F</span>
						<span className="inline-flex items-end">
							<span className="relative inline-block">
								C
								<span className="hidden md:grid pointer-events-none absolute left-[78%] top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 place-items-center">
									<AssetOrIcon
										src={a.pawBlue}
										alt=""
										className="h-[0.36em] w-[0.36em] object-contain drop-shadow-[0_5px_8px_rgba(4,92,217,0.18)]"
										fallback={
											<PawPrint
												size={28}
												strokeWidth={2.4}
												className="text-[rgb(var(--color-primary))]"
											/>
										}
									/>
								</span>
							</span>
							<span>lub</span>
						</span>
					</h2>

					<p className="mt-2 text-[clamp(24px,2.25vw,33px)] font-black leading-tight tracking-[-0.02em] text-[rgb(var(--color-primary))]">
						Thành viên càng mua, càng lợi
					</p>
					<p className="mx-auto mt-2 max-w-[650px] text-[clamp(15px,1.35vw,18px)] font-medium leading-snug text-[rgb(var(--color-ink-soft))]">
						Tích điểm mỗi đơn hàng, nhận ưu đãi riêng cho Boss & Sen,
						<br className="hidden sm:block" /> đổi quà và tiết kiệm nhiều hơn
						cùng 3F Store.
					</p>
				</header>
				<div className="relative z-10 mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_310px] xl:gap-8">
					<div className="min-w-0 flex flex-col items-center gap-6 lg:gap-8 xl:items-start">
						<div className="w-[100%] grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-5 2xl:gap-6">
							<TierCard
								tier={tiers[0]}
								onClick={onSilverClick}
								fallbackIcon={<PawPrint size={44} strokeWidth={2.2} />}
							/>
							<TierCard
								tier={tiers[1]}
								onClick={onGoldClick}
								fallbackIcon={<PawPrint size={44} strokeWidth={2.2} />}
							/>
							<TierCard
								tier={tiers[2]}
								onClick={onPlatinumClick}
								fallbackIcon={<PawPrint size={44} strokeWidth={2.2} />}
							/>
						</div>

						<div
							className="relative z-10 mx-auto grid min-h-[78px] max-w-[1095px] grid-cols-1 overflow-hidden rounded-[22px] border border-blue-100/90 bg-white/85 shadow-[0_12px_28px_rgba(32,86,162,0.12)] backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4"
							aria-label="Quyền lợi tổng quan"
						>
							{topBenefits.map((benefit, index) => (
								<div
									className={cn(
										"flex min-w-0 items-center gap-3.5 px-5 py-3.5 text-[16px] font-semibold leading-tight text-[rgb(var(--color-primary-darker))] sm:px-6 lg:text-[17px] xl:text-[18px]",
										index !== topBenefits.length - 1 &&
											"border-b border-blue-100/80 lg:border-b-0",
										index % 2 === 0 && "sm:border-r sm:border-blue-100/80",
										index < topBenefits.length - 1 &&
											"lg:border-r lg:border-blue-100/80",
									)}
									key={benefit.text}
								>
									<span className="grid h-11 w-11 shrink-0 place-items-center text-[rgb(var(--color-primary))] sm:h-12 sm:w-12">
										<AssetOrIcon
											src={benefit.src}
											alt=""
											className="h-full w-full object-contain"
											fallback={benefit.fallback}
										/>
									</span>
									<span className="text-[1rem]">{benefit.text}</span>
								</div>
							))}
						</div>

						<div className="relative z-20 grid min-h-[96px] overflow-hidden rounded-[27px] bg-gradient-to-r from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary-dark))] to-[rgb(var(--color-primary-dark))] px-5 py-5 text-white shadow-[0_18px_28px_rgba(var(--color-primary),0.22)] sm:grid-cols-[92px_minmax(240px,1fr)] sm:items-center sm:gap-4 lg:grid-cols-[110px_minmax(260px,1fr)_auto] lg:px-7 xl:grid-cols-[130px_minmax(260px,1fr)_auto]">
							<CtaWaves />

							<div className="relative z-10 mx-auto grid h-16 w-24 -rotate-6 place-items-center text-white sm:mx-0 xl:w-[111px]">
								<svg
									className="absolute inset-0 h-full w-full"
									viewBox="0 0 112 66"
									fill="none"
									aria-hidden="true"
								>
									<path
										d="M9 9H103V24C95 26 95 40 103 42V57H9V42C17 40 17 26 9 24V9Z"
										stroke="currentColor"
										strokeWidth="4"
										strokeLinejoin="round"
									/>
								</svg>
								<AssetOrIcon
									src={a.couponIcon}
									alt=""
									className="relative z-10 h-12 w-20 object-contain brightness-0 invert"
									fallback={<Percent size={42} strokeWidth={2.6} />}
								/>
							</div>

							<p className="relative z-10 m-0 mt-3 text-center text-[21px] font-black leading-tight tracking-[-0.035em] sm:mt-0 sm:text-left lg:text-[24px] xl:text-[28px]">
								Đăng ký 3F Club hôm nay
								<br />
								để nhận ngay voucher thành viên mới
							</p>

							<div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-3 whitespace-nowrap sm:col-span-2 lg:col-span-1 lg:mt-0 lg:justify-end">
								<button
									className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-3 rounded-[18px] bg-white px-6 text-base font-bold text-[rgb(var(--color-primary))] shadow-[0_10px_18px_rgba(var(--color-primary-dark),0.22)] transition duration-200 hover:-translate-y-0.5 sm:flex-none lg:text-[18px]"
									type="button"
									onClick={onJoin}
								>
									<span>Tham gia 3F Club</span>
									<span className="grid h-9 w-9 place-items-center rounded-full bg-[image:linear-gradient(to_bottom,rgb(var(--color-primary)),rgb(var(--color-primary-dark)))] text-white">
										<ChevronRight size={23} strokeWidth={3} />
									</span>
								</button>

								<button
									className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[18px] border border-white/80 bg-white/10 px-6 text-base font-bold text-white transition duration-200 hover:-translate-y-0.5 sm:flex-none lg:text-[18px]"
									type="button"
									onClick={onLearnMore}
								>
									<span>Tìm hiểu thêm</span>
									<ChevronRight size={23} strokeWidth={2.8} />
								</button>
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-3 h-[100%]">
						<aside
							className="relative grid min-h-0 grid-cols-1 rounded-[28px] border border-blue-100/90 bg-white/65 p-4 shadow-[0_14px_34px_rgba(42,86,151,0.12)] backdrop-blur-md sm:grid-cols-2 xl:block xl:min-h-[372px]"
							aria-label="Tiện ích 3F Club"
						>
							{sideBenefits.map((benefit, index) => (
								<div
									className={cn(
										"grid min-h-[78px] grid-cols-[62px_minmax(0,1fr)] items-center gap-3 px-2 py-2.5 text-[16px] font-medium leading-snug text-[rgb(var(--color-ink))] xl:min-h-[82px] xl:text-[17px]",
										index !== sideBenefits.length - 1 &&
											"border-b border-blue-100/80",
										index % 2 === 0 &&
											"sm:border-r sm:border-blue-100/80 xl:border-r-0",
										index === 2 && "sm:border-b-0 xl:border-b",
									)}
									key={benefit.text}
								>
									<span className="grid h-[58px] w-[58px] place-items-center rounded-[20px] border border-blue-100/95 bg-gradient-to-b from-white to-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))] shadow-[0_8px_14px_rgba(var(--color-primary),0.10)]">
										<AssetOrIcon
											src={benefit.src}
											alt=""
											className="h-11 w-11 object-contain"
											fallback={benefit.fallback}
										/>
									</span>
									<span>{benefit.text}</span>
								</div>
							))}
						</aside>
						<div
							className="pointer-events-none relative z-20 mt-2 ml-auto w-[230px] sm:w-[280px] xl:mt-0 xl:w-[min(315px,23vw)]"
							aria-hidden="true"
						>
							<span className="absolute -right-1 top-12 text-[28px] text-blue-300/80">
								♥
							</span>
							<span className="absolute right-12 top-20 text-lg text-blue-300/80">
								♥
							</span>
							<span className="absolute right-16 top-[82px] text-base text-blue-300/55">
								♥
							</span>

							<AssetOrIcon
								src={a.petHero}
								alt=""
								className="block h-auto w-full object-contain drop-shadow-[0_20px_14px_rgba(16,58,118,0.16)]"
								fallback={
									<span className="ml-auto grid h-[210px] w-[210px] place-items-center rounded-full bg-white/70 text-[rgb(var(--color-primary))] shadow-[0_14px_34px_rgba(var(--color-primary),0.12)]">
										<PawPrint size={70} />
									</span>
								}
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export { ThreeFClub };
export const ThreeFClup = ThreeFClub;
export default ThreeFClub;
