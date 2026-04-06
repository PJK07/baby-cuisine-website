import { motion, useScroll, useTransform } from "motion/react";
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import logoImage from "../../assets/56793963f4406674327e30a2587aa6beac1f4afa.png";
import { useCart } from "../context/CartContext";
import { CartSidebar } from "./CartSidebar";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.98)"]
  );
  
  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(10px)"]
  );

  const navLinks = ["Shop", "Our Story", "Why Us", "Contact"];

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-shadow"
      aria-label="Main navigation"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <img
              src={logoImage}
              alt="The Baby Cuisine"
              className="h-12 w-auto"
            />
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="text-[#3E2723] font-medium hover:text-[#7CB342] transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping cart${getTotalItems() > 0 ? `, ${getTotalItems()} item${getTotalItems() === 1 ? "" : "s"}` : ""}`}
              className="relative bg-[#3E2723] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#3E2723]/90 transition-colors shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {getTotalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-[#FF9800] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="lg:hidden bg-[#3E2723] text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#3E2723]/90 transition-colors shadow-lg"
            >
              {isOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          id="mobile-menu"
          initial={false}
          animate={{
            height: isOpen ? "auto" : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="pt-6 pb-4 space-y-4">
            {navLinks.map((link) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                whileHover={{ x: 10 }}
                className="block text-[#3E2723] font-medium hover:text-[#7CB342] transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </motion.nav>
  );
}