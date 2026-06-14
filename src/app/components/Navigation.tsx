import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { FALLBACK_IMAGE } from "../constants";
const logoImage560 = "/images/logo-560w.webp";
const logoImage280 = "/images/logo-280w.webp";
import { useCart } from "../context/CartContext";
import { CartSidebar } from "./CartSidebar";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Shop", "Our Story", "Why Us", "Contact"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : ""
      }`}
      aria-label="Main navigation"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src={logoImage560}
              srcSet={`${logoImage280} 280w, ${logoImage560} 560w`}
              sizes="(max-width: 768px) 280px, 560px"
              alt="The Baby Cuisine"
              className="h-12 w-auto"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              width={560}
              height={560}
              // @ts-expect-error lowercase fetchpriority is needed for Lighthouse, not supported in React 18 types
              fetchpriority="high"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                className="text-brand-dark font-medium hover:text-brand-primary transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping cart${totalItems > 0 ? `, ${totalItems} item${totalItems === 1 ? "" : "s"}` : ""}`}
              className="relative bg-brand-dark text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-brand-dark/90 transition-colors shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="lg:hidden bg-brand-dark text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-brand-dark/90 transition-colors shadow-lg"
            >
              {isOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-6 pb-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(" ", "-")}`}
                className="block text-brand-dark font-medium hover:text-brand-primary transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
