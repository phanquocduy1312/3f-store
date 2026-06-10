import { useEffect, useState } from "react";
import { Check, ChevronRight, X, Copy, CheckCircle2, PawPrint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function ConsultationPopup() {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<"intro" | "form" | "success">("intro");
	const [copied, setCopied] = useState(false);

	// Form State
	const [petType, setPetType] = useState<"dog" | "cat">("dog");
	const [petAge, setPetAge] = useState("adult");
	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");

	useEffect(() => {
		// Removed sessionStorage check so it shows up for testing
		const timer = setTimeout(() => {
			setIsOpen(true);
		}, 5000); // Trigger after 5 seconds

		return () => clearTimeout(timer);
	}, []);

	const handleClose = () => {
		setIsOpen(false);
	};

	const handleStart = () => {
		setStep("form");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!phone.trim()) return;
		
		// Capture lead data - in production this would be sent to an API
		console.log("Captured Lead:", { petType, petAge, name, phone });
		
		setStep("success");
	};

	const handleCopyVoucher = () => {
		navigator.clipboard.writeText("3FNEW30");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleExplore = () => {
		handleClose();
		navigate(`/products?category=${petType === "dog" ? "Thức ăn cho chó" : "Thức ăn cho mèo"}`);
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
					{/* Overlay close click handler */}
					<div className="absolute inset-0" onClick={handleClose} />

					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ duration: 0.3 }}
						className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-w-[760px] w-full relative z-10"
					>
						{/* Close Button */}
						<button
							onClick={handleClose}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-30"
							aria-label="Đóng"
						>
							<X size={24} strokeWidth={2} />
						</button>

						{/* Left Side Visual Banner */}
						<div className="w-full md:w-[45%] bg-white flex items-end justify-center pt-8 pb-0 px-4 min-h-[240px] md:min-h-[400px] relative overflow-hidden select-none">
							<img
								src="/assets/images/dog_cat_heart_rbg.png"
								alt="Dog and Cat mascot"
								className="max-h-[260px] md:max-h-[360px] w-auto object-contain z-10"
							/>
						</div>

						{/* Right Side Content Panel */}
						<div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col justify-center bg-white min-h-[400px]">
							<AnimatePresence mode="wait">
								{step === "intro" && (
									<motion.div
										key="intro"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										className="flex flex-col h-full justify-center"
									>
										<div className="mb-8">
											<h3 className="text-[#0b5ed7] font-black text-[26px] md:text-[32px] leading-[1.3] mb-4">
												<span className="inline-flex items-center gap-2">
													<PawPrint size={32} className="fill-[#0b5ed7] text-[#0b5ed7] shrink-0" />
													<span>TÌM THỨC ĂN</span>
												</span>
												<br />
												PHÙ HỢP CHO BÉ
											</h3>
											<p className="text-gray-800 font-medium text-[18px] md:text-[20px]">
												Chỉ mất <span className="text-[#0b5ed7] font-bold border-b-[2.5px] border-[#0b5ed7] pb-0.5">30 giây</span>
											</p>
										</div>

										{/* Checklist */}
										<ul className="space-y-4 md:space-y-5 mb-10">
											{[
												{ text: "Gợi ý sản phẩm phù hợp", id: "suggest" },
												{ text: <>Voucher <span className="font-bold">30.000đ</span></>, id: "voucher" },
												{ text: "Checklist chăm sóc miễn phí", id: "checklist" }
											].map((item) => (
												<li key={item.id} className="flex items-center text-gray-800 font-medium text-[16px] md:text-[18px]">
													<div className="flex items-center justify-center w-[24px] h-[24px] rounded bg-[#4CAF50] text-white mr-3 shrink-0">
														<Check size={16} className="stroke-[3]" />
													</div>
													<span>{item.text}</span>
												</li>
											))}
										</ul>

										<button
											onClick={handleStart}
											className="w-[240px] bg-[#0b5ed7] hover:bg-[#024ebd] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between shadow-sm transition-all duration-300"
										>
											<span className="ml-4 text-[18px] md:text-[20px]">Bắt đầu</span>
											<div className="w-8 h-8 rounded-full bg-white text-[#0b5ed7] flex items-center justify-center shrink-0">
												<ChevronRight size={20} strokeWidth={3} />
											</div>
										</button>
									</motion.div>
								)}

								{step === "form" && (
									<motion.div
										key="form"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
									>
										<h4 className="text-xl font-bold text-gray-800 mb-1">
											Thông tin của bé cưng
										</h4>
										<p className="text-gray-500 text-sm mb-5">
											Giúp 3F gợi ý chế độ dinh dưỡng tối ưu nhất
										</p>

										<form onSubmit={handleSubmit} className="space-y-4">
											{/* Pet Type Select */}
											<div>
												<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Thú cưng của bạn là</label>
												<div className="grid grid-cols-2 gap-3">
													<button
														type="button"
														onClick={() => setPetType("dog")}
														className={`py-2.5 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
															petType === "dog"
																? "border-[#0b5ed7] bg-blue-50/50 text-[#0b5ed7]"
																: "border-gray-200 text-gray-600 hover:bg-gray-50"
														}`}
													>
														🐶 Bé Cún
													</button>
													<button
														type="button"
														onClick={() => setPetType("cat")}
														className={`py-2.5 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
															petType === "cat"
																? "border-[#0b5ed7] bg-blue-50/50 text-[#0b5ed7]"
																: "border-gray-200 text-gray-600 hover:bg-gray-50"
														}`}
													>
														🐱 Bé Mèo
													</button>
												</div>
											</div>

											{/* Name Input */}
											<div>
												<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tên của bé (nếu có)</label>
												<input
													type="text"
													value={name}
													onChange={(e) => setName(e.target.value)}
													placeholder="Ví dụ: LuLu, MiuMiu..."
													className="w-full border-2 border-gray-200 focus:border-[#0b5ed7] outline-none rounded-xl px-4 py-2.5 text-sm transition-all"
												/>
											</div>

											{/* Phone/Email Lead Info */}
											<div>
												<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại nhận quà *</label>
												<input
													required
													type="tel"
													value={phone}
													onChange={(e) => setPhone(e.target.value)}
													placeholder="Nhập SĐT để nhận mã giảm giá 30k"
													className="w-full border-2 border-gray-200 focus:border-[#0b5ed7] outline-none rounded-xl px-4 py-2.5 text-sm transition-all"
												/>
											</div>

											<button
												type="submit"
												className="w-full bg-[#0b5ed7] hover:bg-[#024ebd] text-white font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300 mt-2"
											>
												Nhận Voucher & Tư Vấn <ChevronRight size={18} />
											</button>
										</form>
									</motion.div>
								)}

								{step === "success" && (
									<motion.div
										key="success"
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										className="text-center py-2"
									>
										<div className="flex justify-center text-green-500 mb-3">
											<CheckCircle2 size={56} className="animate-bounce" />
										</div>
										<h4 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h4>
										<p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
											Mã voucher 30.000đ dành riêng cho {name || "bé"} đã được kích hoạt. Bạn có thể sử dụng ngay khi thanh toán.
										</p>

										{/* Voucher Code Copy Card */}
										<div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 mb-6 max-w-[280px] mx-auto flex items-center justify-between gap-3 relative group">
											<div className="text-left">
												<span className="text-xs text-gray-400 font-bold block uppercase">Mã của bạn</span>
												<span className="text-xl font-black text-gray-800 tracking-wider">3FNEW30</span>
											</div>
											<button
												onClick={handleCopyVoucher}
												className="bg-[#0b5ed7] text-white p-2.5 rounded-xl hover:bg-[#024ebd] active:scale-95 transition-all flex items-center gap-1.5"
												title="Copy mã voucher"
											>
												{copied ? <Check size={16} /> : <Copy size={16} />}
												<span className="text-xs font-bold">{copied ? "Đã copy" : "Copy"}</span>
											</button>
										</div>

										<button
											onClick={handleExplore}
											className="w-full bg-[#0b5ed7] hover:bg-[#024ebd] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md"
										>
											Xem sản phẩm phù hợp ngay
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
