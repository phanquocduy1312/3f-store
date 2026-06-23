import { MapPin, Navigation } from "lucide-react";

export function ContactLocation() {
  const mapSearchUrl =
    "https://www.google.com/maps/search/?api=1&query=16%20%C4%90%C6%B0%E1%BB%9Dng%20s%E1%BB%91%2012%2C%20P.%20An%20Kh%C3%A1nh%2C%20TP%20Th%E1%BB%A7%20%C4%90%E1%BB%A9c%2C%20TP%20HCM";

  return (
    <section id="store-map-section" className="bg-cream-soft py-16 sm:py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Text Left */}
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-soft px-4 py-1.5 text-xs font-semibold text-forest">
              📍 Vị trí cửa hàng
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Ghé thăm 3F Store trực tiếp
            </h2>
            <p className="text-base text-ink-soft leading-relaxed">
              Cửa hàng của tụi mình nằm ở khu vực yên tĩnh, thoáng mát tại TP. Thủ Đức, thuận tiện cho việc đỗ xe máy và ô tô. Ba mẹ có thể dẫn theo bé cưng đi cùng để mua sắm và nhận tư vấn trực tiếp từ nhân viên.
            </p>

            <div className="p-5 rounded-2xl bg-white border border-forest/5 shadow-soft space-y-4">
              <div className="flex gap-3">
                <MapPin size={20} className="text-forest shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-ink block text-sm">Địa chỉ cửa hàng:</span>
                  <span className="text-xs text-ink-soft leading-relaxed block mt-0.5">
                    16 Đường số 12, P. An Khánh, TP Thủ Đức, TP HCM
                  </span>
                </div>
              </div>
            </div>

            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-6 py-3.5 text-xs font-black text-white shadow-soft transition hover:bg-forest-dark hover:shadow-lift active:scale-95 duration-200"
            >
              <Navigation size={14} />
              Chỉ đường trên Google Maps
            </a>
          </div>

          {/* Map Frame Right */}
          <div className="lg:col-span-7 overflow-hidden rounded-3xl border-4 border-white shadow-soft aspect-[4/3] bg-cream relative">
            <iframe
              title="Địa chỉ cửa hàng 3F Store"
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
