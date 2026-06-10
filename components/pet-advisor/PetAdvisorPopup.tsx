import { useState, useEffect } from "react";
import { X, PawPrint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { QuizWelcome } from "./QuizWelcome";
import { QuizStep } from "./QuizStep";
import { ContactForm } from "./ContactForm";
import { AiLoading } from "./AiLoading";
import { AiResult } from "./AiResult";
import { ProgressBar } from "./ProgressBar";
import { Mascot } from "./Mascot";
import { dogQuizSteps, catQuizSteps } from "./quizConfig";
import { AiResultData } from "./mockAiResult";
import { getPetAdviceFromGroq } from "./groqApi";

const CLOSED_KEY = "pet_popup_closed_at";
const SUBMITTED_KEY = "pet_quiz_submitted_at";

function trackEvent(eventName: string, payload = {}) {
  console.log("[TRACK]", eventName, payload);
}

export function PetAdvisorPopup() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showFloat, setShowFloat] = useState(false);
  
  // Quiz states
  const [status, setStatus] = useState<"welcome" | "pet_type" | "both_which" | "quiz" | "contact" | "loading" | "result">("welcome");
  const [overallPetType, setOverallPetType] = useState<"dog" | "cat" | "both" | null>(null);
  const [activeFlow, setActiveFlow] = useState<"dog" | "cat" | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; customText?: string }>>({});
  const [customer, setCustomer] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [aiResult, setAiResult] = useState<AiResultData | null>(null);

  const steps = activeFlow === "dog" ? dogQuizSteps : catQuizSteps;

  // Initial trigger
  useEffect(() => {
    const handleOpenEvent = () => {
      setStatus("welcome");
      setOverallPetType(null);
      setActiveFlow(null);
      setCurrentStep(0);
      setAnswers({});
      setAiResult(null);
      setIsOpen(true);
      setShowFloat(false);
      trackEvent("popup_view", { trigger: "header_button" });
    };
    window.addEventListener("open-pet-advisor", handleOpenEvent);

    const timer = setTimeout(() => {
      setIsOpen(true);
      trackEvent("popup_view");
    }, 7000); // 7 seconds delay
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("open-pet-advisor", handleOpenEvent);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setShowFloat(true);
    sessionStorage.setItem(CLOSED_KEY, String(Date.now()));
    trackEvent("popup_close", { status });
  };

  const handleManualTrigger = () => {
    // Reset state and open
    setStatus("welcome");
    setOverallPetType(null);
    setActiveFlow(null);
    setCurrentStep(0);
    setAnswers({});
    setAiResult(null);
    setIsOpen(true);
    setShowFloat(false);
    trackEvent("popup_view", { trigger: "floating_button" });
  };

  const handleStartQuiz = () => {
    setStatus("pet_type");
    trackEvent("quiz_start");
  };

  const handleSelectPetType = (type: "dog" | "cat" | "both") => {
    setOverallPetType(type);
    if (type === "both") {
      setStatus("both_which");
    } else {
      setActiveFlow(type);
      setStatus("quiz");
      setCurrentStep(0);
    }
  };

  const handleStepSubmit = (value: string, customText?: string) => {
    const currentStepConfig = steps[currentStep];
    const newAnswers = { ...answers, [currentStepConfig.id]: { value, customText } };
    setAnswers(newAnswers);
    trackEvent("quiz_step_completed", { stepId: currentStepConfig.id, value, customText });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setStatus("contact");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setStatus(overallPetType === "both" ? "both_which" : "pet_type");
    }
  };

  const handleContactSubmit = async (info: { name: string; phone: string; email: string }) => {
    setCustomer(info);
    setStatus("loading");
    trackEvent("quiz_submit", { ...info });

    // Format payload for AI adviser mapping
    const answersPayload: Record<string, string> = {};
    Object.entries(answers).forEach(([key, val]) => {
      answersPayload[key] = val.customText || val.value;
    });

    try {
      const result = await getPetAdviceFromGroq(
        answers,
        overallPetType || "dog",
        activeFlow,
        info
      );
      setAiResult(result);
      setStatus("result");
      localStorage.setItem(SUBMITTED_KEY, String(Date.now()));
      trackEvent("ai_success");
      trackEvent("voucher_view", { code: result.voucher_code });
    } catch (e) {
      console.error(e);
      setStatus("contact");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={handleClose} />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="bg-white shadow-2xl relative z-10 w-full overflow-hidden flex flex-col md:flex-row
                max-h-[90vh] md:max-h-[620px] 
                fixed bottom-0 left-0 right-0 rounded-t-3xl md:relative md:rounded-3xl md:max-w-[720px]"
            >
              {/* Close Button */}
              <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-30" aria-label="Close">
                <X size={24} />
              </button>

              {/* Side Visual panel - hidden on quiz/results on mobile */}
              <div className={`w-full md:w-[45%] md:flex items-center justify-center p-6 relative overflow-hidden select-none border-b md:border-b-0 md:border-r border-gray-100
                ${status === "welcome" ? "flex min-h-[200px]" : "hidden md:flex"}`}
              >
                {/* Light blue background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-blue-50/50 to-blue-200/30"></div>
                
                {/* Decorative paw prints */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden text-blue-300/40">
                  <PawPrint className="absolute top-6 left-6 rotate-[-25deg]" size={36} fill="currentColor" />
                  <PawPrint className="absolute top-32 left-12 rotate-[15deg]" size={24} fill="currentColor" />
                  <PawPrint className="absolute bottom-20 left-8 rotate-[35deg]" size={48} fill="currentColor" />
                  <PawPrint className="absolute bottom-8 right-12 rotate-[-15deg]" size={32} fill="currentColor" />
                  <PawPrint className="absolute top-12 right-10 rotate-[20deg]" size={40} fill="currentColor" />
                  <PawPrint className="absolute top-1/2 right-4 rotate-[-40deg]" size={24} fill="currentColor" />
                </div>

                <Mascot thinking={status === "loading"} className="max-h-[160px] md:max-h-[280px] drop-shadow-2xl relative z-10" />
              </div>

              {/* Form Content panel */}
              <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-center min-h-[360px] overflow-y-auto bg-white">
                {status === "quiz" && <ProgressBar current={currentStep + 1} total={steps.length} />}
                
                <AnimatePresence mode="wait">
                  {status === "welcome" && <QuizWelcome onStart={handleStartQuiz} />}
                  
                  {status === "pet_type" && (
                    <motion.div key="pet_type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                      <h4 className="text-[18px] md:text-[20px] font-black text-ink">Anh/chị đang nuôi bé nào?</h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        <button onClick={() => handleSelectPetType("dog")} className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-forest text-left transition-all font-bold flex items-center justify-between text-ink hover:bg-cream-soft/20">
                          <span>🐶 Bé Cún (Chó)</span>
                          <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center shrink-0">→</span>
                        </button>
                        <button onClick={() => handleSelectPetType("cat")} className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-forest text-left transition-all font-bold flex items-center justify-between text-ink hover:bg-cream-soft/20">
                          <span>🐱 Bé Mèo</span>
                          <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center shrink-0">→</span>
                        </button>
                        <button onClick={() => handleSelectPetType("both")} className="w-full p-4 rounded-2xl border-2 border-gray-200 hover:border-forest text-left transition-all font-bold flex items-center justify-between text-ink hover:bg-cream-soft/20">
                          <span>🐶🐱 Cả Hai bé</span>
                          <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center shrink-0">→</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {status === "both_which" && (
                    <motion.div key="both_which" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 text-left">
                      <h4 className="text-[18px] md:text-[20px] font-black text-ink">Anh/chị muốn tư vấn bé nào trước?</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => { setActiveFlow("dog"); setStatus("quiz"); setCurrentStep(0); }} className="p-4 rounded-2xl border-2 border-gray-200 hover:border-forest font-bold text-center text-ink flex flex-col items-center gap-2">
                          <span className="text-3xl">🐶</span>
                          <span>Bé Cún</span>
                        </button>
                        <button onClick={() => { setActiveFlow("cat"); setStatus("quiz"); setCurrentStep(0); }} className="p-4 rounded-2xl border-2 border-gray-200 hover:border-forest font-bold text-center text-ink flex flex-col items-center gap-2">
                          <span className="text-3xl">🐱</span>
                          <span>Bé Mèo</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {status === "quiz" && (
                    <QuizStep key={`step-${currentStep}`} stepConfig={steps[currentStep]} savedAnswer={answers[steps[currentStep].id]} onBack={handleBack} onNext={handleStepSubmit} />
                  )}

                  {status === "contact" && (
                    <ContactForm key="contact" onBack={() => { setStatus("quiz"); setCurrentStep(steps.length - 1); }} onSubmit={handleContactSubmit} />
                  )}

                  {status === "loading" && <AiLoading key="loading" />}

                  {status === "result" && aiResult && (
                    <AiResult key="result" result={aiResult}
                      onExploreProducts={() => { handleClose(); trackEvent("product_click"); navigate(`/products?category=${activeFlow === "dog" ? "Thức ăn cho chó" : "Thức ăn cho mèo"}`); }}
                      onConsultAgent={() => { handleClose(); window.open("https://zalo.me/your_number", "_blank"); }}
                      onShareZalo={() => { window.open(`https://zalo.me/your_number?text=${encodeURIComponent("Tôi vừa nhận được tư vấn cho thú cưng từ 3F: " + aiResult.summary)}`, "_blank"); }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
