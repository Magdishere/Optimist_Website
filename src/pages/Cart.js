import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { BASE_URL } from '../services/api';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';

const Cart = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);

  const shipping = totalAmount > 50 ? 0 : 5;
  const total = totalAmount + shipping;

  const handleQuantityChange = (uniqueId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ uniqueId, quantity }));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in">
        <div className="w-24 h-24 rounded-[32px] bg-opacity-5 flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
          <ShoppingBag size={48} className="opacity-20" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-widest">Your cart is empty</h2>
        <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Add some coffee to get started</p>
        <Link 
          to="/products"
          className="px-10 py-5 rounded-[24px] font-black uppercase tracking-widest bg-black text-white shadow-xl transition-transform active:scale-95"
          style={{ backgroundColor: theme.primary, color: theme.background }}
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-1 md:px-4">
      <div className="flex items-end justify-between px-2 md:px-0">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.primary }}>My Cart</h1>
          <p className="text-[8px] md:text-sm font-bold uppercase tracking-widest opacity-40">{items.length} unique items</p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="hidden md:flex items-center space-x-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {items.map((item) => (
            <div 
              key={item.uniqueId}
              className="flex flex-col sm:flex-row items-center p-5 md:p-8 rounded-[24px] md:rounded-[40px] border transition-all hover:shadow-2xl"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="w-full sm:w-32 h-48 sm:h-32 rounded-xl md:rounded-3xl overflow-hidden mb-4 sm:mb-0 sm:mr-8 flex-shrink-0" style={{ backgroundColor: theme.surface }}>
                <img 
                  src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop'} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-grow space-y-2 text-center sm:text-left min-w-0 w-full">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight truncate" style={{ color: theme.text }}>{item.name}</h3>
                
                {/* Variant & Add-ons Display */}
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest bg-opacity-10" style={{ backgroundColor: theme.primary, color: theme.primary }}>
                    {item.variant?.name}
                  </span>
                  {item.selectedAddOns?.map(addOn => (
                    <span key={addOn._id} className="px-2 py-0.5 rounded-lg text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-40" style={{ backgroundColor: theme.surface }}>
                      + {addOn.name}
                    </span>
                  ))}
                </div>

                <p className="text-base md:text-lg font-black mt-2" style={{ color: theme.accent }}>
                  ${item.pricePerUnit.toFixed(2)} <span className="text-[8px] md:text-[10px] opacity-40 font-bold uppercase tracking-widest ml-1">unit</span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-4 md:space-x-6 mt-6 sm:mt-0 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0" style={{ borderColor: theme.border }}>
                <div className="flex items-center p-1 md:p-2 rounded-xl md:rounded-2xl" style={{ backgroundColor: theme.surface }}>
                  <button 
                    onClick={() => handleQuantityChange(item.uniqueId, item.quantity - 1)}
                    className="p-2 rounded-lg md:rounded-xl transition-colors hover:bg-black/5"
                  >
                    <Minus size={14} md={16} />
                  </button>
                  <span className="w-8 md:w-10 text-center font-black text-sm md:text-base">{item.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(item.uniqueId, item.quantity + 1)}
                    className="p-2 rounded-lg md:rounded-xl transition-colors hover:bg-black/5"
                  >
                    <Plus size={14} md={16} />
                  </button>
                </div>
                
                <button 
                  onClick={() => dispatch(removeFromCart(item.uniqueId))}
                  className="p-3 md:p-4 rounded-xl md:rounded-2xl text-red-500 transition-all hover:bg-red-500 hover:bg-opacity-10 hover:scale-110 shadow-sm"
                  style={{ backgroundColor: theme.surface }}
                >
                  <Trash2 size={16} md={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div 
            className="p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-2xl border lg:sticky lg:top-28"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-6 md:mb-10" style={{ color: theme.primary }}>Order Summary</h2>
            
            <div className="space-y-4 md:space-y-5">
              <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40">
                <span>Subtotal</span>
                <span style={{ color: theme.text }}>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40">
                <span>Shipping</span>
                <span style={{ color: theme.text }}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              
              <div className="pt-4 md:pt-6 border-t" style={{ borderColor: theme.border }}>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Total Amount</span>
                  <span className="text-2xl md:text-4xl font-black" style={{ color: theme.primary }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 md:mt-10 py-4 md:py-6 rounded-2xl md:rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-transform active:scale-95 flex items-center justify-center space-x-3"
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              <span className="text-xs md:text-base">Go to Checkout</span>
              <ArrowRight size={18} md={20} />
            </button>

            {shipping > 0 && (
              <p className="mt-4 md:mt-6 text-center text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-amber-600">
                Add ${(50 - totalAmount).toFixed(2)} more for free shipping!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
