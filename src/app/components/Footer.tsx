import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import logoImage from "../../assets/Baby John.webp";

export function Footer() {
  return (
    <footer id="contact" className="bg-brand-dark text-white py-16 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <img
              src={logoImage}
              alt="Baby John — Baby Cuisine brand mascot"
              className="w-48 mb-6 rounded-2xl"
              loading="lazy"
              decoding="async"
              width={192}
              height={192}
            />
            <p className="text-white/70 leading-relaxed mb-6">
              Nourishing little ones with love, care, and the finest organic
              ingredients since 2020.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Baby Cuisine on Facebook"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-primary transition-colors"
              >
                <Facebook className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/thebabycuisine.1/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Baby Cuisine on Instagram (opens in new tab)"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-primary transition-colors"
              >
                <Instagram className="w-5 h-5" aria-hidden="true" />
              </a>
              <a
                href="#"
                aria-label="Baby Cuisine on Twitter"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-primary transition-colors"
              >
                <Twitter className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xl font-bold mb-6">Shop</h3>
            <ul className="space-y-3">
              {[
                "All Products",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/70 hover:text-brand-primary transition-colors inline-block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-6">About</h3>
            <ul className="space-y-3">
              {[
                "Our Story",
                "Our Values",
                "Ingredients",
                "Sustainability",
                "Contact Us",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/70 hover:text-brand-primary transition-colors inline-block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/YOUR_LINK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-primary transition-colors"
                >
                  Horch Tabet, St. Maroun Street
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a
                  href="tel:+96170465465"
                  className="hover:text-brand-primary transition-colors"
                >
                  +961 70 465 465
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="mailto:thebabycuisine.1@gmail.com"
                  className="hover:text-brand-primary transition-colors"
                >
                  thebabycuisine.1@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/60 text-sm">
          <p>© 2026 Baby Cuisine. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
