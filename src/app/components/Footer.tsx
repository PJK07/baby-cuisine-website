import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
const logoImage = "/images/baby-john.webp";
const FALLBACK_IMAGE = "/images/placeholder.webp";

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
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              loading="lazy"
              decoding="async"
              width={192}
              height={192}
            />
            <p className="text-white/70 leading-relaxed mb-6">
              Nourishing little ones with love, care, and the finest
              ingredients since.
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
            <h2 className="text-xl font-bold mb-6">Shop</h2>
            <ul className="space-y-3">
              <li>
                <a
                  href="#shop"
                  className="text-white/70 hover:text-brand-primary transition-colors inline-block"
                >
                  All Products
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h2 className="text-xl font-bold mb-6">About</h2>
            <ul className="space-y-3">
              <li>
                <a href="#our-story" className="text-white/70 hover:text-brand-primary transition-colors inline-block">Our Story</a>
              </li>
              <li>
                <a href="#brand-values" className="text-white/70 hover:text-brand-primary transition-colors inline-block">Our Values</a>
              </li>
              <li>
                <a href="#shop" className="text-white/70 hover:text-brand-primary transition-colors inline-block">Ingredients</a>
              </li>
              <li>
                <a href="#why-us" className="text-white/70 hover:text-brand-primary transition-colors inline-block">Sustainability</a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-brand-primary transition-colors inline-block">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-bold mb-6">Contact</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <a
                  href="https://google.com/maps/place/The+Baby+Cuisine/data=!4m2!3m1!1s0x0:0x1c082d8fb7eabbf0?sa=X&ved=1t:2428&hl=en&ictx=111"
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
                  href="https://wa.me/96170465465"
                  className="hover:text-brand-primary transition-colors"
                >
                  +961 70 465 465
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="https://mail.google.com/mail/?view=cm&to=thebabycuisine.1@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
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
