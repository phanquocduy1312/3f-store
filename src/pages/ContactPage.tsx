import { useEffect } from "react";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactQuickCards } from "@/components/contact/ContactQuickCards";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactLocation } from "@/components/contact/ContactLocation";
import { ContactSupportTopics } from "@/components/contact/ContactSupportTopics";
import { ContactFaq } from "@/components/contact/ContactFaq";
import { ContactCTA } from "@/components/contact/ContactCTA";
import { aboutConfig } from "@/components/about/AboutStoreInfo";
import { MapPin, Phone, Mail, ShieldAlert } from "lucide-react";

export function ContactPage() {
  useEffect(() => {
    // Set browser SEO metadata
    document.title = "Liên hệ 3F Store – Tư vấn sản phẩm cho chó mèo";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Liên hệ 3F Store để được tư vấn thức ăn, phụ kiện và sản phẩm chăm sóc thú cưng chính hãng cho chó mèo. Hotline 0879997474, cửa hàng tại TP. Thủ Đức, TP.HCM."
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ContactHero />
      <ContactQuickCards />

      {/* Main Form and Info Section */}
      <section className="bg-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Form Left */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Contact Details Card Right */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="p-8 rounded-3xl border border-forest/5 bg-cream-soft/30 shadow-soft h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-xl text-ink mb-6">Thông tin pháp lý & Liên hệ</h3>
                  
                  <div className="space-y-5 text-sm text-ink-soft">
                    <div className="flex gap-3">
                      <span className="text-xl">🏢</span>
                      <div>
                        <span className="font-extrabold text-ink block text-xs">Pháp nhân đăng ký:</span>
                        <span className="text-xs mt-0.5 block">{aboutConfig.legalName}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <ShieldAlert size={18} className="text-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-ink block text-xs">Mã số thuế:</span>
                        <span className="text-xs mt-0.5 block">{aboutConfig.taxCode}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MapPin size={18} className="text-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-ink block text-xs">Địa chỉ cửa hàng:</span>
                        <span className="text-xs mt-0.5 block">{aboutConfig.address}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Phone size={18} className="text-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-ink block text-xs">Hotline hỗ trợ:</span>
                        <a href={`tel:${aboutConfig.phone}`} className="text-forest font-bold hover:underline text-xs block mt-0.5">
                          {aboutConfig.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Mail size={18} className="text-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-ink block text-xs">Email hỗ trợ:</span>
                        <a href={`mailto:${aboutConfig.email}`} className="text-forest font-bold hover:underline text-xs block mt-0.5">
                          {aboutConfig.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-forest/10 pt-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-forest-soft flex items-center justify-center text-forest font-bold text-lg shrink-0">
                      🐾
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed font-semibold">
                      Tụi mình luôn nỗ lực phản hồi mọi thắc mắc trong vòng 2-4 giờ làm việc. Cảm ơn ba mẹ đã luôn tin tưởng và chọn 3F Store đồng hành!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContactLocation />
      <ContactSupportTopics />
      <ContactFaq />
      <ContactCTA />
    </div>
  );
}
