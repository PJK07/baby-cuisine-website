import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { ShieldCheck, Eye, Database, Share2, UserCheck, MessageSquare } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({ isOpen, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border border-brand-dark/10 rounded-[2rem] shadow-2xl p-0 overflow-hidden gap-0">
        <div className="bg-brand-bg/40 p-6 md:p-8 border-b border-brand-dark/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-bold text-brand-dark font-poppins">
              Privacy Policy
            </DialogTitle>
            <p className="text-sm text-brand-dark/60 mt-1">
              Effective Date: July 7, 2026
            </p>
          </div>
        </div>

        <ScrollArea className="h-[60vh] max-h-[500px] p-6 md:p-8">
          <div className="space-y-8 pr-4">
            {/* Intro */}
            <p className="text-brand-dark/80 leading-relaxed text-sm">
              At <strong>Baby Cuisine</strong>, we care deeply about the privacy of our customers and their little ones. This Privacy Policy describes how we handle information when you visit our website (thebabycuisine.com) and how orders are processed.
            </p>

            {/* Section 1 */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark text-lg">
                <Eye className="w-5 h-5 text-brand-primary" />
                1. Information We Collect
              </h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                Unlike traditional e-commerce stores, <strong>we do not collect, store, or process personal identification or financial information</strong> directly on our website.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-brand-dark/80 text-sm">
                <li>
                  <strong className="text-brand-dark">Browsing Information:</strong> We collect anonymous visitor usage data (like pages viewed and duration) through Vercel Analytics to understand site performance.
                </li>
                <li>
                  <strong className="text-brand-dark">Cart items:</strong> Your shopping cart data is saved locally on your browser (using local storage) so you don't lose your selection if you refresh the page. This data remains on your device.
                </li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark text-lg">
                <MessageSquare className="w-5 h-5 text-brand-primary" />
                2. Ordering via WhatsApp
              </h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                When you click "Order on WhatsApp", your cart contents are converted into a text template and sent to our official WhatsApp number (+961 70 465 465). 
              </p>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                Any delivery details (such as your address and phone number) are provided by you directly during the chat on WhatsApp. This interaction is protected under WhatsApp's privacy policies and terms of service.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark text-lg">
                <Database className="w-5 h-5 text-brand-primary" />
                3. How We Use Your Information
              </h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                Any information shared with us during our WhatsApp communication is used solely to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-brand-dark/80 text-sm">
                <li>Process, prepare, and deliver your freshly handmade meals.</li>
                <li>Reach out to you regarding your order status or delivery details.</li>
                <li>Answer your questions and provide support.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark text-lg">
                <Share2 className="w-5 h-5 text-brand-primary" />
                4. Data Sharing & Third Parties
              </h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                We respect your data and do not sell or rent it. We only share information with third parties necessary to perform operations:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-brand-dark/80 text-sm">
                <li>
                  <strong className="text-brand-dark">Delivery Partners:</strong> We share your name, phone number, and address with our local delivery courier so they can bring your baby's meals to you.
                </li>
                <li>
                  <strong className="text-brand-dark">Analytics:</strong> We use Vercel Analytics to capture general usage patterns. This service does not track or store personally identifiable information.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark text-lg">
                <UserCheck className="w-5 h-5 text-brand-primary" />
                5. Your Rights & Control
              </h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                You can ask us to delete or modify your contact and address info from our record logs at any time. Simply send us a message on WhatsApp or email us.
              </p>
            </div>

            {/* Section 6 */}
            <div className="space-y-3 border-t border-brand-dark/5 pt-6">
              <h3 className="font-bold text-brand-dark text-lg">Contact Us</h3>
              <p className="text-brand-dark/80 leading-relaxed text-sm">
                If you have any questions about this Privacy Policy, feel free to reach out:
              </p>
              <div className="bg-brand-bg/20 rounded-2xl p-4 text-sm text-brand-dark/80 space-y-1.5">
                <p><strong>Email:</strong> <a href="mailto:thebabycuisine.1@gmail.com" className="text-brand-primary hover:underline">thebabycuisine.1@gmail.com</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/96170465465" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">+961 70 465 465</a></p>
                <p><strong>Address:</strong> Horch Tabet, St. Maroun Street, Lebanon</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="bg-gray-50/50 p-6 md:px-8 border-t border-brand-dark/5 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-full transition-colors cursor-pointer text-sm"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
