import { useEffect, useState, useRef } from "react";
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
	Phone,
	ArrowRight,
	Info,
	Sparkles,
	Truck,
	Camera,
	Loader2,
	Lock,
	CheckCircle2,
} from "lucide-react";
import { ThreeFClubFlowSection } from "./three-f-club-flow-section";
import { loadShopeeRequests, persistShopeeRequests } from "@/lib/shopee-requests";
import type { ShopeePointRequest } from "@/types/shopee";
import { scanShopeeOrderImage, createShopeePointRequest } from "@/src/services/shopeePointApi";

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

	const [form, setForm] = useState({
		phone: "",
		email: "",
		customerName: "",
		zalo: "",
		shopeeOrderCode: "",
		orderAmount: "",
		imageId: null as number | null,
		scanId: null as number | null,
		orderImageUrl: "",
	});
	const [phoneError, setPhoneError] = useState("");
	const [emailError, setEmailError] = useState("");
	const [isScanning, setIsScanning] = useState(false);
	const [scanResult, setScanResult] = useState<any | null>(null);
	const [scanWarnings, setScanWarnings] = useState<string[]>([]);
	const [scanError, setScanError] = useState("");
	const [uploadedImagePreview, setUploadedImagePreview] = useState("");
	const [autoFilledFields, setAutoFilledFields] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [activeTab, setActiveTab] = useState<"shopee" | "phone">("shopee");
	const [submitError, setSubmitError] = useState("");

	const scanIdRef = useRef(0);

	// Revoke preview objectURL on change or unmount
	useEffect(() => {
		return () => {
			if (uploadedImagePreview && uploadedImagePreview.startsWith("blob:")) {
				URL.revokeObjectURL(uploadedImagePreview);
			}
		};
	}, [uploadedImagePreview]);

	useEffect(() => {
		if (Object.keys(autoFilledFields).length === 0) return;

		const timer = setTimeout(() => {
			setAutoFilledFields({});
		}, 2000);

		return () => clearTimeout(timer);
	}, [autoFilledFields]);

	const normalizeVietnamPhone = (input?: string) => {
		if (!input) return "";
		return input.replace(/[^\d]/g, "");
	};

	const isValidVietnamPhone = (phoneStr?: string) => {
		const normalized = normalizeVietnamPhone(phoneStr);
		return /^0\d{8,10}$/.test(normalized);
	};

	const normalizeAmount = (input: string | number) => {
		if (typeof input === "number") return input;
		const onlyNumber = String(input || "").replace(/[^\d]/g, "");
		return Number(onlyNumber || 0);
	};

	const calculateEstimatedPoints = (value?: string | number) => {
		const amountVal = normalizeAmount(value || 0);
		return Math.floor(amountVal / 10000);
	};

	const validatePhone = (value: string) => {
		if (!value.trim()) {
			setPhoneError("Số điện thoại là bắt buộc");
			return false;
		}
		if (!isValidVietnamPhone(value)) {
			setPhoneError("Số điện thoại phải từ 9 đến 11 số");
			return false;
		}
		setPhoneError("");
		return true;
	};

	const validateEmail = (value: string) => {
		if (!value.trim()) {
			setEmailError("");
			return true;
		}
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!regex.test(value.trim())) {
			setEmailError("Email không đúng định dạng");
			return false;
		}
		setEmailError("");
		return true;
	};

	const handleOrderImageChange = async (file: File) => {
		const currentScanId = Date.now();
		scanIdRef.current = currentScanId;

		setScanError("");
		setScanWarnings([]);
		setScanResult(null);
		setAutoFilledFields({});
		setIsScanning(true);

		if (uploadedImagePreview && uploadedImagePreview.startsWith("blob:")) {
			URL.revokeObjectURL(uploadedImagePreview);
		}
		const previewUrl = URL.createObjectURL(file);
		setUploadedImagePreview(previewUrl);

		try {
			const result = await scanShopeeOrderImage(file);

			if (scanIdRef.current !== currentScanId) {
				return;
			}

			setScanResult(result);
			setScanWarnings(result.warnings || []);

			const fields = result.fields || {};
			const normalizedPhone = normalizeVietnamPhone(fields.phone);

			setForm((prev) => ({
				...prev,
				phone: normalizedPhone || "",
				email: fields.email || "",
				customerName: fields.customerName || "",
				zalo: normalizedPhone || "",
				shopeeOrderCode: fields.shopeeOrderCode || "",
				orderAmount: fields.orderAmount ? String(fields.orderAmount) : "",
				imageId: result.imageId || null,
				scanId: result.scanId || null,
				orderImageUrl: result.imageUrl || "",
			}));

			setAutoFilledFields({
				phone: Boolean(normalizedPhone),
				email: Boolean(fields.email),
				customerName: Boolean(fields.customerName),
				shopeeOrderCode: Boolean(fields.shopeeOrderCode),
				orderAmount: Boolean(fields.orderAmount),
			});

		} catch (error: any) {
			if (scanIdRef.current !== currentScanId) {
				return;
			}
			setScanError(error?.message || "Không quét được ảnh. Vui lòng nhập thủ công.");
		} finally {
			if (scanIdRef.current === currentScanId) {
				setIsScanning(false);
			}
		}
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, "");
		setForm(prev => ({ ...prev, orderAmount: val }));
	};

	const formatCurrency = (value?: string | number) => {
		const amountVal = normalizeAmount(value || 0);
		return amountVal.toLocaleString("vi-VN") + "đ";
	};

	const clearUploadedImage = () => {
		if (uploadedImagePreview && uploadedImagePreview.startsWith("blob:")) {
			URL.revokeObjectURL(uploadedImagePreview);
		}
		setUploadedImagePreview("");
		setScanResult(null);
		setScanWarnings([]);
		setScanError("");
		setAutoFilledFields({});
		setForm((prev) => ({
			...prev,
			phone: "",
			shopeeOrderCode: "",
			orderAmount: "",
			imageId: null,
			scanId: null,
			orderImageUrl: "",
		}));
		setPhoneError("");
	};

	const handleResetForm = () => {
		setForm({
			phone: "",
			email: "",
			customerName: "",
			zalo: "",
			shopeeOrderCode: "",
			orderAmount: "",
			imageId: null,
			scanId: null,
			orderImageUrl: "",
		});
		setUploadedImagePreview("");
		setScanResult(null);
		setScanWarnings([]);
		setScanError("");
		setAutoFilledFields({});
		setPhoneError("");
		setEmailError("");
		setSubmitError("");
		setIsSubmitted(false);
	};

	const handleSubmit = async () => {
		const isPhoneValid = validatePhone(form.phone);
		const isEmailValid = validateEmail(form.email);

		if (!isPhoneValid || !isEmailValid || !form.shopeeOrderCode.trim() || normalizeAmount(form.orderAmount) <= 0 || isScanning) {
			return;
		}

		setIsSubmitting(true);
		setSubmitError("");

		try {
			const payload = {
				phone: normalizeVietnamPhone(form.phone),
				email: form.email || "",
				customerName: form.customerName || "",
				zalo: form.zalo || "",
				shopeeOrderCode: form.shopeeOrderCode.trim(),
				orderAmount: normalizeAmount(form.orderAmount),
				imageId: form.imageId || null,
				scanId: form.scanId || null,
			};

			await createShopeePointRequest(payload);
			setIsSubmitted(true);
		} catch (error: any) {
			setSubmitError(error?.message || "Không gửi được yêu cầu tích điểm.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const isFormValid =
		isValidVietnamPhone(form.phone) &&
		Boolean(form.shopeeOrderCode.trim()) &&
		normalizeAmount(form.orderAmount) > 0 &&
		!isScanning;

	const isSubmitDisabled = 
		!isFormValid || 
		isSubmitting;

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
		{
			text: "Tư vấn dinh dưỡng AI miễn phí",
			src: "",
			fallback: <Sparkles size={31} strokeWidth={2.3} />,
		},
		{
			text: "Miễn phí vận chuyển thành viên",
			src: "",
			fallback: <Truck size={31} strokeWidth={2.3} />,
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
						 Tích điểm từ mọi đơn hàng
					</p>
					<p className="mx-auto mt-2 max-w-[650px] text-[clamp(15px,1.35vw,18px)] font-medium leading-snug text-[rgb(var(--color-ink-soft))]">
						Mua tại website hoặc Shopee đều có thể tích điểm, đổi voucher và nhận ưu đãi riêng cho Boss & Sen.
					</p>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-4">
						<button 
							onClick={() => setActiveTab("shopee")}
							className={`flex items-center gap-2 transition-colors font-bold py-2.5 px-6 rounded-full shadow-md text-[15px] ${
								activeTab === "shopee" 
									? "bg-[#092B5A] hover:bg-[#071d3d] text-white border border-[#092B5A]" 
									: "bg-white hover:bg-gray-50 text-[#092B5A] border border-[#092B5A]"
							}`}
						>
							<div className="w-7 h-7 flex items-center justify-center shrink-0">
								<img src="/assets/images/shoppe.png" alt="Shopee" className="w-full h-full object-contain scale-[2] origin-center" />
							</div>
							<span>Tích điểm từ đơn Shopee</span>
						</button>
						
						<button 
							onClick={() => setActiveTab("phone")}
							className={`flex items-center gap-2.5 transition-colors font-bold py-2.5 px-6 rounded-full shadow-md text-[15px] ${
								activeTab === "phone" 
									? "bg-[#092B5A] hover:bg-[#071d3d] text-white border border-[#092B5A]" 
									: "bg-white hover:bg-gray-50 text-[#092B5A] border border-[#092B5A]"
							}`}
						>
							<Phone size={18} fill="currentColor" className={activeTab === "phone" ? "text-white" : "text-[#092B5A]"} />
							<span>Tra cứu điểm bằng SĐT</span>
						</button>
					</div>
				</header>
				{activeTab === "shopee" ? (
				<div className="relative z-10 mt-6 grid items-start xl:items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_310px] xl:gap-8">
					<div className="min-w-0 flex flex-col items-center gap-6 lg:gap-8 xl:items-start w-full">
						{/* Forms Section */}
						<div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 lg:p-8 flex flex-col xl:flex-row gap-8 overflow-hidden">
							{/* Left Part: Text & Image */}
							<div className="flex-[1.2] flex flex-col justify-center relative p-2 sm:p-4">
								{/* Decorative Paws */}
								<PawPrint className="absolute top-0 left-0 text-blue-50 rotate-[-20deg]" size={50} />
								<PawPrint className="absolute bottom-4 right-12 text-blue-50 rotate-[15deg]" size={80} />
								<PawPrint className="absolute top-1/2 left-1/3 text-blue-50 rotate-[45deg] opacity-60" size={35} />

								<div className="flex flex-col sm:flex-row gap-6 relative z-10 items-center sm:items-start">
									<div className="w-[150px] h-[150px] shrink-0 flex items-center justify-center bg-blue-50/40 rounded-2xl p-2 border border-blue-100/50">
										<img src="/assets/images/shoppe_voucher.png" alt="Shopee Voucher" className="w-full h-full object-contain drop-shadow-md scale-[1.15]" />
									</div>
									<div className="flex-1 mt-1">
										<h3 className="text-[22px] font-black text-[#092B5A] mb-3 leading-tight">
											Đã mua hàng 3F trên Shopee?
										</h3>
										<p className="text-[#092B5A] text-[14px] leading-relaxed mb-4">
											Đừng bỏ lỡ cơ hội tích điểm! Nhập mã đơn Shopee và SĐT để được cộng điểm vào 3F Club.
										</p>
										
										<ul className="flex flex-col gap-2.5 mb-5">
											<li className="flex items-center gap-2 text-[14px] text-gray-700 font-medium">
												<Check size={18} className="text-green-500" strokeWidth={3} />
												<span>Tích điểm <strong className="text-[#092B5A]">100%</strong> giá trị đơn hàng</span>
											</li>
											<li className="flex items-center gap-2 text-[14px] text-gray-700 font-medium">
												<Check size={18} className="text-green-500" strokeWidth={3} />
												<span>Đổi hàng ngàn <strong className="text-[#092B5A]">voucher giảm giá</strong></span>
											</li>
											<li className="flex items-center gap-2 text-[14px] text-gray-700 font-medium">
												<Check size={18} className="text-green-500" strokeWidth={3} />
												<span>Xác minh nhanh chóng trong 24-48h</span>
											</li>
										</ul>

										<div className="flex items-start sm:items-center gap-2 text-gray-500 text-[13px] bg-gray-50 p-2.5 rounded-lg border border-gray-200">
											<Info size={16} className="text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
											<span>Lưu ý: Mỗi mã đơn chỉ được duyệt tích điểm 1 lần duy nhất.</span>
										</div>
									</div>
								</div>
							</div>

							{/* Right Part: Form */}
							<div className="flex-1 xl:border-l xl:border-gray-100 xl:pl-8 flex flex-col justify-center min-h-[400px]">
								{isSubmitted ? (
									<div className="flex flex-col items-center text-center p-5 sm:p-6 bg-green-50/30 border border-green-100 rounded-3xl animate-fade-in">
										<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 shadow-md shadow-green-200/50">
											<CheckCircle2 size={32} className="text-green-600" />
										</div>
										<h3 className="text-[20px] font-black text-[#092B5A] mb-4">
											Gửi yêu cầu thành công!
										</h3>
										<div className="text-[14px] text-gray-700 font-medium leading-relaxed mb-6 space-y-3">
											<p>3F đã nhận yêu cầu tích điểm từ đơn Shopee của bạn.</p>
											<p>Đơn sẽ được xác minh trong 24–48h.</p>
											<p>Kết quả sẽ được thông báo qua SĐT. Nếu bạn có nhập email, 3F cũng sẽ gửi thông báo qua email.</p>
										</div>
										<button 
											onClick={handleResetForm}
											className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#092B5A] hover:bg-[#071d3d] transition-colors text-white font-bold py-3 px-8 rounded-xl shadow-md text-[14px]"
										>
											<span>Gửi đơn khác</span>
											<ArrowRight size={16} />
										</button>
									</div>
								) : (
									<div className="flex flex-col gap-4">
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4">
											<div className="w-full sm:w-[110px] shrink-0 flex items-center gap-1.5">
												<label className="text-[13px] font-bold text-[#092B5A]">SĐT</label>
												{autoFilledFields.phone && (
													<span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">
														Tự điền từ ảnh
													</span>
												)}
											</div>
											<div className="w-full sm:flex-1">
												<input 
													type="text" 
													value={form.phone}
													onChange={e => {
														const val = normalizeVietnamPhone(e.target.value);
														setForm(prev => ({ ...prev, phone: val, zalo: val }));
														if (phoneError) validatePhone(val);
													}}
													onBlur={e => validatePhone(e.target.value)}
													placeholder="Nhập số điện thoại" 
													className={`w-full bg-white border rounded-lg px-4 py-3 text-[13px] outline-none focus:ring-1 transition-all placeholder-gray-400 font-medium ${
														autoFilledFields.phone 
															? 'border-green-400 focus:border-green-500 focus:ring-green-500 bg-green-50/10' 
															: phoneError 
																? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
																: 'border-gray-200 focus:border-[#092B5A] focus:ring-[#092B5A]'
													}`} 
												/>
												{phoneError && (
													<p className="text-red-500 text-[11px] font-semibold mt-1">{phoneError}</p>
												)}
											</div>
										</div>

										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4">
											<div className="w-full sm:w-[110px] shrink-0 flex items-center gap-1.5">
												<label className="text-[13px] font-bold text-[#092B5A] shrink-0">Email (không bắt buộc)</label>
												{autoFilledFields.email && (
													<span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">
														Tự điền từ ảnh
													</span>
												)}
											</div>
											<div className="w-full sm:flex-1">
												<input 
													type="text" 
													value={form.email}
													onChange={e => {
														setForm(prev => ({ ...prev, email: e.target.value }));
														if (emailError) validateEmail(e.target.value);
													}}
													onBlur={e => validateEmail(e.target.value)}
													placeholder="Nhập email của bạn nếu muốn nhận thông báo" 
													className={`w-full bg-white border rounded-lg px-4 py-3 text-[13px] outline-none focus:ring-1 transition-all placeholder-gray-400 font-medium ${
														autoFilledFields.email
															? 'border-green-400 focus:border-green-500 focus:ring-green-500 bg-green-50/10'
															: emailError 
																? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
																: 'border-gray-200 focus:border-[#092B5A] focus:ring-[#092B5A]'
													}`} 
												/>
												{emailError && (
													<p className="text-red-500 text-[11px] font-semibold mt-1">{emailError}</p>
												)}
											</div>
										</div>

										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4">
											<div className="w-full sm:w-[110px] shrink-0 flex items-center gap-1.5">
												<label className="text-[13px] font-bold text-[#092B5A] shrink-0">Mã đơn Shopee</label>
												{autoFilledFields.shopeeOrderCode && (
													<span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">
														Tự điền từ ảnh
													</span>
												)}
											</div>
											<input 
												value={form.shopeeOrderCode} 
												onChange={e => setForm(prev => ({ ...prev, shopeeOrderCode: e.target.value }))} 
												type="text" 
												placeholder="Nhập mã đơn Shopee" 
												className={`w-full sm:flex-1 bg-white border rounded-lg px-4 py-3 text-[13px] outline-none focus:ring-1 transition-all placeholder-gray-400 font-medium ${
													autoFilledFields.shopeeOrderCode
														? 'border-green-400 focus:border-green-500 focus:ring-green-500 bg-green-50/10'
														: 'border-gray-200 focus:border-[#092B5A] focus:ring-[#092B5A]'
												}`} 
											/>
										</div>

										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-4">
											<div className="w-full sm:w-[110px] shrink-0 flex items-center gap-1.5">
												<label className="text-[13px] font-bold text-[#092B5A] shrink-0">Tổng tiền đơn</label>
												{autoFilledFields.orderAmount && (
													<span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded shadow-sm animate-pulse whitespace-nowrap">
														Tự điền từ ảnh
													</span>
												)}
											</div>
											<div className="w-full sm:flex-1 relative">
												<input 
													value={formatCurrency(form.orderAmount)} 
													onChange={handleAmountChange} 
													type="text" 
													placeholder="Nhập tổng tiền đơn (VNĐ)" 
													className={`w-full bg-white border rounded-lg px-4 py-3 pr-24 text-[13px] outline-none focus:ring-1 transition-all placeholder-gray-400 font-medium ${
														autoFilledFields.orderAmount
															? 'border-green-400 focus:border-green-500 focus:ring-green-500 bg-green-50/10'
															: 'border-gray-200 focus:border-[#092B5A] focus:ring-[#092B5A]'
													}`} 
												/>
												{form.orderAmount && (
													<div className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-200 shadow-sm animate-fade-in">
														+{calculateEstimatedPoints(form.orderAmount)} điểm
													</div>
												)}
											</div>
										</div>
										
										<div className="flex items-center gap-2 mt-1">
											<div className="h-px bg-gray-200 flex-1"></div>
											<span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Hoặc điền tự động</span>
											<div className="h-px bg-gray-200 flex-1"></div>
										</div>
										
										<div className="flex flex-col gap-1.5 mt-1">
											<div className="relative w-full">
												<input 
													type="file" 
													id="upload-qr" 
													accept="image/*" 
													className="hidden" 
													onChange={e => {
														const file = e.target.files?.[0];
														if (!file) return;
														handleOrderImageChange(file);
														e.target.value = "";
													}} 
												/>
												<label htmlFor="upload-qr" className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-lg py-2.5 px-4 cursor-pointer transition-colors text-[13px] font-bold ${isScanning ? 'border-[#092B5A] bg-blue-50 text-[#092B5A]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-[#092B5A] hover:border-[#092B5A]'}`}>
													{isScanning ? (
														<>
															<Loader2 size={16} className="animate-spin" />
															<span>Đang quét ảnh đơn Shopee...</span>
														</>
													) : (
														<>
															<Camera size={16} />
															<span>Chụp / Tải ảnh đơn Shopee</span>
														</>
													)}
												</label>
											</div>
											<p className="text-[12px] text-gray-400 font-medium">Khuyến khích tải ảnh để 3F xác minh nhanh hơn.</p>

											{uploadedImagePreview ? (
												<div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2.5">
													<CheckCircle2 size={16} className="text-green-500 shrink-0" />
													<div className="flex-1 min-w-0">
														<span className="text-[12px] text-green-700 font-bold block truncate">Đã tải ảnh lên thành công</span>
													</div>
													<button type="button" onClick={clearUploadedImage} className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
														Xóa
													</button>
												</div>
											) : (
												<div className="text-[12px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-1.5">
													<Info size={14} className="shrink-0 mt-0.5" />
													<span>Bạn có thể gửi không kèm ảnh, tuy nhiên thời gian xác minh có thể lâu hơn.</span>
												</div>
											)}

											{scanError && (
												<div className="mt-2.5 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-start gap-1.5 font-semibold">
													<Info size={14} className="shrink-0 mt-0.5" />
													<span>{scanError}</span>
												</div>
											)}

											{scanResult && (
												<div className="mt-3 bg-blue-50/40 border border-blue-100/60 rounded-xl p-3.5 text-[13px] text-gray-700 font-medium">
													<h4 className="font-bold text-[#092B5A] mb-1.5 flex items-center gap-1.5">
														<Sparkles size={14} className="text-blue-600 animate-pulse" />
														Đã nhận diện thông tin đơn hàng
													</h4>
													<ul className="space-y-1 pl-4 list-disc text-gray-600">
														<li>SĐT: <strong className="text-gray-900">{scanResult.fields?.phone || "Chưa nhận diện"}</strong></li>
														<li>Mã đơn: <strong className="text-gray-900">#{scanResult.fields?.shopeeOrderCode || "Chưa nhận diện"}</strong></li>
														<li>Tổng tiền: <strong className="text-gray-900">{formatCurrency(scanResult.fields?.orderAmount || 0)}</strong></li>
														<li>Trạng thái: <strong className="text-green-600 font-bold">{scanResult.fields?.orderStatus || "Chưa nhận diện"}</strong></li>
														<li>Độ tin cậy: <strong className="text-blue-600">{scanResult.confidence || 0}%</strong></li>
													</ul>
													
													{scanWarnings.length > 0 && (
														<div className="mt-2.5 space-y-1 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[12px] text-amber-700 font-semibold font-bold">
															{scanWarnings.map((warn, i) => (
																<div key={i} className="flex items-start gap-1.5">
																	<Info size={14} className="shrink-0 mt-0.5" />
																	<span>{warn}</span>
																</div>
															))}
														</div>
													)}
													
													<p className="mt-2 text-[10.5px] text-gray-400 italic">
														OCR chỉ hỗ trợ điền nhanh thông tin. Điểm chỉ được cộng sau khi 3F xác minh và duyệt.
													</p>
												</div>
											)}
										</div>

										{submitError && (
											<div className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-1.5 font-semibold">
												<Info size={15} className="shrink-0 mt-0.5" />
												<span>{submitError}</span>
											</div>
										)}

										<button 
											onClick={handleSubmit}
											disabled={isSubmitDisabled || isSubmitting}
											className={`mt-1 w-full flex justify-center items-center gap-1.5 sm:gap-2 transition-colors text-white font-bold py-3.5 px-4 sm:px-8 rounded-xl shadow-md text-[13.5px] sm:text-[14px] ${
												isSubmitDisabled || isSubmitting
													? "bg-gray-300 cursor-not-allowed shadow-none" 
													: "bg-[#092B5A] hover:bg-[#071d3d]"
											}`}
										>
											{isSubmitting ? (
												<>
													<Loader2 size={16} className="animate-spin shrink-0" />
													<span className="truncate">Đang gửi...</span>
												</>
											) : (
												<>
													<span className="truncate">Gửi đơn Shopee để tích điểm</span>
													<ArrowRight size={18} className="shrink-0" />
												</>
											)}
										</button>
									</div>
								)}
							</div>
						</div>

						{/* Flow Step Section */}
						<ThreeFClubFlowSection />

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
										index === sideBenefits.length - 2 && "sm:border-b-0 xl:border-b",
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
							className="pointer-events-none relative z-20 mt-2 ml-auto w-[230px] sm:w-[280px] xl:mt-auto xl:w-[min(315px,23vw)]"
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
				) : (
					<div className="relative z-10 mt-6 flex justify-center w-full pb-10">
						<div className="w-full flex flex-col items-center">
							<div className="w-full max-w-[650px] mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
								<div className="w-20 h-20 rounded-full bg-blue-50/50 flex items-center justify-center mb-6">
									<img src="/assets/images/phone_search.png" alt="Phone Search" className="w-full h-full object-contain scale-[1.8] origin-center" />
								</div>
								<h3 className="text-[24px] font-black text-[#092B5A] mb-3 leading-tight">
									Tra cứu điểm 3F Club
								</h3>
								<p className="text-[#546073] text-[15px] leading-relaxed mb-8 max-w-[480px]">
									Nhập số điện thoại đã mua hàng hoặc đăng ký 3F Club để xem điểm, hạng thành viên và voucher có thể đổi.
								</p>
								<div className="w-full max-w-[420px] flex flex-col gap-4">
									<div className="relative">
										<Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#092B5A]" />
										<input type="text" placeholder="Nhập số điện thoại của bạn" className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-[15px] outline-none focus:border-[#092B5A] focus:ring-1 focus:ring-[#092B5A] transition-all placeholder-[#A3B2C7] font-medium text-[#092B5A] shadow-sm" />
									</div>
									<button className="w-full flex items-center justify-center gap-2 bg-[#092B5A] hover:bg-[#071d3d] transition-colors text-white font-bold py-4 px-6 rounded-xl shadow-md text-[15px]">
										<span>Tra cứu ngay</span>
										<ArrowRight size={18} />
									</button>
								</div>
								<div className="flex items-center justify-center gap-1.5 mt-6 text-[13px] text-[#546073] font-medium">
									<Lock size={14} className="text-[#092B5A]" />
									<span>Thông tin của bạn được bảo mật tuyệt đối.</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

export { ThreeFClub };
export const ThreeFClup = ThreeFClub;
export default ThreeFClub;
