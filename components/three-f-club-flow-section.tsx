import { ChevronRight } from "lucide-react";

export type FlowStep = {
	number: number;
	title: string;
	desc: string;
	icon: string;
};

const FLOW_STEPS: FlowStep[] = [
	{
		number: 1,
		title: "1. Nhập thông tin",
		desc: "Nhập SĐT, mã đơn và ảnh đơn hàng",
		icon: "/assets/images/note.png",
	},
	{
		number: 2,
		title: "2. 3F đối chiếu",
		desc: "3F xác minh và đối chiếu thông tin đơn hàng",
		icon: "/assets/images/search.png",
	},
	{
		number: 3,
		title: "3. Cộng điểm",
		desc: "Cộng điểm vào tài khoản 3F Club của bạn",
		icon: "/assets/images/coin.png",
	},
	{
		number: 4,
		title: "4. Thông báo qua SĐT/Email",
		desc: "Kết quả được gửi đến bạn trong 24-48h",
		icon: "/assets/images/mail.png",
	},
];

export function ThreeFClubFlowSection() {
	return (
		<div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-2">
			{FLOW_STEPS.map((step, idx) => (
				<div key={step.number} className="flex flex-col lg:flex-row items-center w-full lg:w-auto">
					<div className="flex items-center gap-3.5 w-full lg:w-auto">
						<div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full border border-blue-100/90 bg-gradient-to-b from-white to-[#eff6ff] flex items-center justify-center shrink-0 shadow-[0_6px_12px_rgba(4,92,217,0.06)]">
							<img
								src={step.icon}
								alt={step.title}
								className={`w-9 h-9 sm:w-10 sm:h-10 object-contain ${step.number === 4 ? "scale-[1.35]" : ""}`}
								loading="lazy"
							/>
						</div>
						<div className="flex flex-col min-w-0">
							<h4 className="text-[#092B5A] text-[14px] sm:text-[15px] font-extrabold tracking-tight mb-0.5">
								{step.title}
							</h4>
							<p className="text-[#526d88] text-[12.5px] sm:text-[13px] font-medium leading-tight max-w-[200px] lg:max-w-[160px] xl:max-w-[190px]">
								{step.desc}
							</p>
						</div>
					</div>
					{idx < FLOW_STEPS.length - 1 && (
						<div className="flex items-center justify-center py-2 lg:py-0 lg:px-2 xl:px-4 shrink-0">
							<ChevronRight className="text-[#092B5A]/85 w-5 h-5 shrink-0 rotate-90 lg:rotate-0" />
						</div>
					)}
				</div>
			))}
		</div>
	);
}
