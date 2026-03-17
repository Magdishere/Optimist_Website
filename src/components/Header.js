import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Coffee, 
  Sun, 
  Moon,
  LogOut,
  MapPin,
  ClipboardList
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  const navLinks = [
    { name: 'Menu', path: '/products', icon: Coffee },
    { name: 'Locations', path: '/locations', icon: MapPin },
    { name: 'Orders', path: '/orders', icon: ClipboardList, protected: true },
  ];

  return (
    <header 
      className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
      style={{ 
        backgroundColor: `${theme.card}cc`, 
        borderColor: theme.border 
      }}
    >
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
            <Coffee size={18} md={24} style={{ color: theme.background }} />
          </div>
          <span className="text-base md:text-xl font-black uppercase tracking-widest hidden sm:block" style={{ color: theme.text }}>
            Optimist
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            (!link.protected || user) && (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-xs md:text-sm font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: theme.text }}
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors"
            style={{ backgroundColor: theme.surface }}
          >
            {isDarkMode ? <Sun size={16} md={20} /> : <Moon size={16} md={20} />}
          </button>

          <Link to="/cart" className="relative p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors" style={{ backgroundColor: theme.surface }}>
            <ShoppingCart size={16} md={20} />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black"
                style={{ backgroundColor: theme.primary, color: theme.background }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative group">
              <button 
                className="p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors flex items-center space-x-2"
                style={{ backgroundColor: theme.surface }}
              >
                <User size={16} md={20} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">
                  {user.firstName}
                </span>
              </button>
              <div 
                className="absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="p-4 space-y-2">
                  <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-xl hover:bg-opacity-5" style={{ backgroundColor: theme.surface }}>
                    <User size={16} />
                    <span className="text-xs font-bold">Profile</span>
                  </Link>
                  <Link to="/orders" className="flex items-center space-x-2 p-2 rounded-xl hover:bg-opacity-5" style={{ backgroundColor: theme.surface }}>
                    <ClipboardList size={16} />
                    <span className="text-xs font-bold">My Orders</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 p-2 rounded-xl hover:bg-opacity-5 text-red-500" 
                    style={{ backgroundColor: theme.surface }}
                  >
                    <LogOut size={16} />
                    <span className="text-xs font-bold">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg transition-transform active:scale-95 whitespace-nowrap"
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-1.5 md:p-2 rounded-lg md:rounded-xl"
            style={{ backgroundColor: theme.surface }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={16} md={20} /> : <Menu size={16} md={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t p-4 space-y-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          {navLinks.map((link) => (
            (!link.protected || user) && (
              <Link 
                key={link.name} 
                to={link.path}
                className="block text-[10px] md:text-sm font-black uppercase tracking-widest p-3 md:p-4 rounded-xl md:rounded-2xl"
                style={{ backgroundColor: theme.surface, color: theme.text }}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <link.icon size={16} md={18} />
                  <span>{link.name}</span>
                </div>
              </Link>
            )
          ))}
          {user && (
            <>
              <Link 
                to="/profile"
                className="block text-[10px] font-black uppercase tracking-widest p-3 rounded-xl"
                style={{ backgroundColor: theme.surface, color: theme.text }}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <User size={16} />
                  <span>Profile</span>
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-500 font-black uppercase tracking-widest text-[10px]"
                style={{ backgroundColor: theme.surface }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
