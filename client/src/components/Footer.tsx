import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "./Logo";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-deep-900 text-gray-800 dark:text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo size="lg" className="text-gray-800 dark:text-white" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {t.footerDescription}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t.services}</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-mystical-600 dark:hover:text-mystical-400 transition-colors">{t.services}</a></li>
              <li><a href="#" className="hover:text-mystical-600 dark:hover:text-mystical-400 transition-colors">{t.about}</a></li>
              <li><a href="#" className="hover:text-mystical-600 dark:hover:text-mystical-400 transition-colors">{t.contact}</a></li>
              <li><a href="#" className="hover:text-mystical-600 dark:hover:text-mystical-400 transition-colors">{t.portfolio}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t.contactInfo}</h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-mystical-600 dark:text-mystical-400" />
                +48 22 123 45 67
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-mystical-600 dark:text-mystical-400" />
                info@lasertouch.ru
              </p>
              <p className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-mystical-600 dark:text-mystical-400" />
                {t.workingHours}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t.followUs}</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-mystical-600 dark:hover:text-mystical-400 transition-colors" aria-label="Instagram">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-mystical-600 dark:hover:text-mystical-400 transition-colors" aria-label="WhatsApp">
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-300 dark:border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2025 LaserTouch. {t.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
