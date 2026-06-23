import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe, ShoppingBag, ShieldAlert } from "lucide-react";

export const aboutConfig = {
  brandName: "3F Store",
  legalName: "CÔNG TY TNHH 3F STORE",
  taxCode: "0319126776",
  phone: "0879997474",
  email: "3fstorevietnam@gmail.com",
  address: "16 Đường số 12, P. An Khánh, TP Thủ Đức, TP HCM",
  website: "https://3fstore.vn",
  shopee: "https://shopee.vn/3fstorevietnam",
};

export function AboutStoreInfo() {
  return (
    <section id="store-info" className="bg-cream-soft py-16 sm:py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Thông tin liên hệ & Pháp lý
          </h2>
          <p className="mt-4 text-base text-ink-soft leading-relaxed">
            3F Store cam kết công khai minh bạch mọi thông tin pháp lý của doanh nghiệp để mang lại trải nghiệm mua sắm an tâm tuyệt đối cho khách hàng.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Legal and Contact card */}
          <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-forest/5 shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🏢</span>
                <div>
                  <h3 className="font-extrabold text-xl text-ink">
                    {aboutConfig.legalName}
                  </h3>
                  <p className="text-xs text-ink-soft mt-0.5">Thành lập và hoạt động theo quy định pháp luật Việt Nam</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-ink-soft border-t border-forest/10 pt-6">
                <div className="flex gap-3">
                  <ShieldAlert size={18} className="text-forest shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-ink block">Mã số thuế:</span>
                    <span>{aboutConfig.taxCode}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin size={18} className="text-forest shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-ink block">Địa chỉ đăng ký:</span>
                    <span>{aboutConfig.address}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone size={18} className="text-forest shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-ink block">Hotline đặt hàng & tư vấn:</span>
                    <a href={`tel:${aboutConfig.phone}`} className="text-forest font-bold hover:underline">
                      {aboutConfig.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail size={18} className="text-forest shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-ink block">Email hỗ trợ:</span>
                    <a href={`mailto:${aboutConfig.email}`} className="text-forest font-bold hover:underline">
                      {aboutConfig.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-forest/10 pt-6">
              <a
                href={aboutConfig.website}
                className="flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-forest transition"
              >
                <Globe size={14} className="text-forest" />
                3fstore.vn
              </a>
              <a
                href={aboutConfig.shopee}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-[#EE4D2D] transition"
              >
                <ShoppingBag size={14} className="text-[#EE4D2D]" />
                Shopee 3F Store
              </a>
            </div>
          </div>

          {/* Map visualization / Embed container */}
          <div className="lg:col-span-6 overflow-hidden rounded-3xl border-4 border-white shadow-soft aspect-[4/3] lg:aspect-auto bg-cream relative">
            {/* Google Map iframe */}
            <iframe
              title="Vị trí cửa hàng 3F Store"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.467472091494!2d106.7262174!3d10.7758418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4007b8a7db%3A0xe54d31fe151c72ff!2s16%20%C4%90%C6%B0%E1%BB%9Dng%20s%E1%BB%91%2012%2C%20An%20Kh%C3%A1nh%2C%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1719126776000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
