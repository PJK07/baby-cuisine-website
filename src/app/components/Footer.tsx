import { motion } from "motion/react";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import logoImage from "../../assets/56793963f4406674327e30a2587aa6beac1f4afa.png";

export function Footer() {
  return (
    <footer className="bg-[#3E2723] text-white py-16 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={logoImage}
              alt="The Baby Cuisine"
              className="w-48 mb-6 brightness-0 invert"
            />
            <p className="text-white/70 leading-relaxed mb-6">
              Nourishing little ones with love, care, and the finest organic
              ingredients since 2020.
            </p>
            <div className="flex gap-4">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F5C542] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="https://www.instagram.com/thebabycuisine.1/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F5C542] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#F5C542] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xl font-bold mb-6">Shop</h3>
            <ul className="space-y-3">
              {[
                "All Products",
                "New Arrivals",
                "Best Sellers",
                "Bundles & Packs",
                "Subscription",
              ].map((item) => (
                <li key={item}>
                  <motion.a
                    whileHover={{ x: 5 }}
                    href="#"
                    className="text-white/70 hover:text-[#F5C542] transition-colors inline-block"
                  >
                    {item}
                  </motion.a>
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
                  <motion.a
                    whileHover={{ x: 5 }}
                    href="#"
                    className="text-white/70 hover:text-[#F5C542] transition-colors inline-block"
                  >
                    {item}
                  </motion.a>
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
                  className="hover:text-[#F5C542] transition-colors"
                >
                  Horch Tabet, St. Maroun Street
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a
                  href="tel:+96170465465"
                  className="hover:text-[#F5C542] transition-colors"
                >
                  +961 70 465 465
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a
                  href="mailto:thebabycuisine.1@gmail.com"
                  className="hover:text-[#F5C542] transition-colors"
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
          <div className="flex gap-6">
            <motion.a
              whileHover={{ color: "#F5C542" }}
              href="#"
              className="hover:text-[#F5C542] transition-colors"
            >
              Privacy Policy
            </motion.a>
            <motion.a
              whileHover={{ color: "#F5C542" }}
              href="#"
              className="hover:text-[#F5C542] transition-colors"
            >
              Terms of Service
            </motion.a>
            <motion.a
              whileHover={{ color: "#F5C542" }}
              href="#"
              className="hover:text-[#F5C542] transition-colors"
            >
              Accessibility
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
