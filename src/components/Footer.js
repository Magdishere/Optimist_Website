import React from 'react';
import { Coffee, Facebook, Instagram, Twitter } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t py-12" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <Coffee size={18} style={{ color: theme.background }} />
              </div>
              <span className="text-lg font-black uppercase tracking-widest" style={{ color: theme.text }}>
                Optimist
              </span>
            </div>
            <p className="text-sm opacity-60" style={{ color: theme.text }}>
              Bringing you the finest coffee beans from around the world, roasted with passion and served with a smile.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: theme.primary }}>Quick Links</h4>
            <ul className="space-y-2">
              {['Menu', 'Locations', 'About Us', 'Contact'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity" style={{ color: theme.text }}>{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: theme.primary }}>Support</h4>
            <ul className="space-y-2">
              {['FAQ', 'Shipping', 'Returns', 'Privacy Policy'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity" style={{ color: theme.text }}>{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: theme.primary }}>Follow Us</h4>
            <div className="flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="p-2 rounded-xl transition-colors hover:bg-opacity-10" 
                  style={{ backgroundColor: theme.surface, color: theme.text }}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-xs opacity-40" style={{ borderColor: theme.border }}>
          © {new Date().getFullYear()} Optimist Coffee Co. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
