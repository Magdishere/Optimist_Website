import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Banknote,
  Coffee,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import API, { BASE_URL } from '../services/api';
import { clearCart } from '../redux/slices/cartSlice';

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();
  
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // App-like states
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'online' or 'cod'
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Detailed Calculation
  const subtotal = totalAmount;
  const tax = subtotal * 0.10;
  const deliveryFee = orderType === 'delivery' ? 1.00 : 0;
  const total = subtotal + tax + deliveryFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=/checkout`);
      return;
    }

    if (orderType === 'delivery' && !address) {
      alert('Please enter a delivery address.');
      return;
    }
    if (!phone) {
      alert('Please enter a contact phone number.');
      return;
    }

    if (paymentMethod === 'online' && (!stripe || !elements)) {
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      const orderData = {
        orderItems: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          priceAtPurchase: item.pricePerUnit,
          variant: item.variant,
          selectedAddOns: item.selectedAddOns
        })),
        orderType,
        paymentMethod,
        shippingAddress: {
          street: address,
          city: 'Local',
          phone: phone
        },
        deliveryFee: deliveryFee,
        totalPrice: total,
        status: 'pending'
      };

      // 1. Create the order first
      const orderRes = await API.post('/orders', orderData);
      
      if (orderRes.data.success) {
        const orderId = orderRes.data.data._id;

        if (paymentMethod === 'online') {
          // 2. Create Payment Intent
          const intentRes = await API.post(`/payments/create-intent/${orderId}`);
          const { clientSecret } = intentRes.data;

          // 3. Confirm Payment with Stripe
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: user.name,
                email: user.email,
                phone: phone,
              },
            },
          });

          if (result.error) {
            setPaymentError(result.error.message);
            // Optionally: Handle order cancellation or mark as "failed payment"
            setLoading(false);
            return;
          } else {
            if (result.paymentIntent.status === 'succeeded') {
              // Manually confirm payment with backend for local dev
              try {
                await API.post(`/payments/confirm/${orderId}`, {
                  transactionId: result.paymentIntent.id
                });
              } catch (err) {
                console.error('Confirmation Error:', err);
              }

              dispatch(clearCart());
              setStep(3);
            }
          }
        } else {
          // Cash on delivery flow
          dispatch(clearCart());
          setStep(3);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="text-center py-32 space-y-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: theme.surface }}>
          <ShoppingBag size={32} className="opacity-20" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest">Nothing to checkout</h2>
        <Link to="/products" className="text-sm font-bold underline block">Back to Menu</Link>
      </div>
    );
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme.text,
        '::placeholder': {
          color: theme.textSecondary || '#aab7c4',
        },
        fontFamily: 'inherit',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 py-4 md:py-8 px-1 md:px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6 md:pb-8 px-2 md:px-0" style={{ borderColor: theme.border }}>
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>Checkout</h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-40">Review and complete your order</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 p-1.5 rounded-2xl md:rounded-3xl" style={{ backgroundColor: theme.surface }}>
          <button 
            onClick={() => setOrderType('delivery')}
            className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] flex items-center space-x-2 transition-all ${orderType === 'delivery' ? 'shadow-xl' : 'opacity-40'}`}
            style={{ 
              backgroundColor: orderType === 'delivery' ? theme.primary : 'transparent',
              color: orderType === 'delivery' ? theme.background : theme.text
            }}
          >
            <Truck size={14} md={16} />
            <span>Delivery</span>
          </button>
          <button 
            onClick={() => setOrderType('pickup')}
            className={`px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] flex items-center space-x-2 transition-all ${orderType === 'pickup' ? 'shadow-xl' : 'opacity-40'}`}
            style={{ 
              backgroundColor: orderType === 'pickup' ? theme.primary : 'transparent',
              color: orderType === 'pickup' ? theme.background : theme.text
            }}
          >
            <ShoppingBag size={14} md={16} />
            <span>Pickup</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8 md:space-y-12 px-2 md:px-0">
          {step !== 3 ? (
            <form onSubmit={handlePlaceOrder} className="space-y-10 md:space-y-12">
              {/* Address & Contact Section */}
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                    <MapPin size={16} md={20} style={{ color: theme.background }} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest" style={{ color: theme.text }}>
                    {orderType === 'delivery' ? 'Delivery' : 'Contact'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {orderType === 'delivery' && (
                    <div className="space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Street Address</label>
                      <textarea 
                        required
                        className="w-full px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-[24px] border bg-transparent font-bold text-xs md:text-sm outline-none transition-all focus:shadow-lg"
                        style={{ borderColor: theme.border, minHeight: '80px', color: theme.text }}
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Contact Phone</label>
                    <input 
                      type="tel"
                      required
                      className="w-full px-4 md:px-6 py-4 md:py-5 rounded-2xl md:rounded-[24px] border bg-transparent font-bold text-xs md:text-sm outline-none transition-all focus:shadow-lg"
                      style={{ borderColor: theme.border, color: theme.text }}
                      placeholder="e.g. +1 234 567 890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                    <CreditCard size={16} md={20} style={{ color: theme.background }} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest" style={{ color: theme.text }}>Payment</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-5 md:p-8 rounded-[24px] md:rounded-[32px] border-2 text-left transition-all group ${paymentMethod === 'online' ? 'shadow-2xl' : 'opacity-40 hover:opacity-100'}`}
                    style={{ 
                      borderColor: paymentMethod === 'online' ? theme.primary : theme.border,
                      backgroundColor: theme.card 
                    }}
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors" style={{ backgroundColor: theme.surface }}>
                        <CreditCard size={20} md={24} style={{ color: paymentMethod === 'online' ? theme.primary : theme.text }} />
                      </div>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'online' ? '' : 'opacity-20'}`} style={{ borderColor: paymentMethod === 'online' ? theme.primary : theme.text }}>
                        {paymentMethod === 'online' && <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: theme.primary }} />}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-black uppercase tracking-tight">Online Payment</p>
                    <p className="text-[8px] md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Credit / Debit Card</p>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 md:p-8 rounded-[24px] md:rounded-[32px] border-2 text-left transition-all group ${paymentMethod === 'cod' ? 'shadow-2xl' : 'opacity-40 hover:opacity-100'}`}
                    style={{ 
                      borderColor: paymentMethod === 'cod' ? theme.primary : theme.border,
                      backgroundColor: theme.card 
                    }}
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors" style={{ backgroundColor: theme.surface }}>
                        <Banknote size={20} md={24} style={{ color: paymentMethod === 'cod' ? theme.primary : theme.text }} />
                      </div>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === 'cod' ? '' : 'opacity-20'}`} style={{ borderColor: paymentMethod === 'cod' ? theme.primary : theme.text }}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: theme.primary }} />}
                      </div>
                    </div>
                    <p className="text-xs md:text-sm font-black uppercase tracking-tight">Cash on Delivery</p>
                    <p className="text-[8px] md:text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Pay when you receive</p>
                  </button>
                </div>

                {/* Stripe Elements */}
                {paymentMethod === 'online' && (
                  <div className="animate-in slide-in-from-top-4 duration-500 space-y-4">
                    <div 
                      className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] border-2 transition-all shadow-inner"
                      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
                    >
                      <div className="flex items-center space-x-3 mb-6 opacity-60">
                         <ShieldCheck size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Secure encrypted payment</span>
                      </div>
                      <div className="p-4 rounded-xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <CardElement options={cardElementOptions} />
                      </div>
                    </div>
                    {paymentError && (
                      <div className="flex items-center space-x-2 text-red-500 px-4">
                        <AlertCircle size={16} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">{paymentError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div 
              className="text-center space-y-6 md:space-y-10 py-12 md:py-20 animate-in zoom-in-95 duration-700 rounded-[32px] md:rounded-[60px] border border-dashed mx-2 md:mx-0"
              style={{ backgroundColor: `${theme.surface}80`, borderColor: theme.border }}
            >
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full flex items-center justify-center mx-auto shadow-inner" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
                <CheckCircle size={40} md={64} />
              </div>
              <div className="space-y-2 md:space-y-4">
                <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.primary }}>Great News!</h2>
                <p className="text-sm md:text-lg font-bold uppercase tracking-widest opacity-40">Your order is being prepared</p>
              </div>
              <p className="max-w-md mx-auto text-[10px] md:text-sm font-semibold opacity-60 leading-relaxed px-6 md:px-12">
                We've started brewing your order. You can track its real-time progress in your orders dashboard.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 px-6 md:px-12 pt-4">
                <Link 
                  to="/orders"
                  className="px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[24px] font-black uppercase tracking-widest shadow-2xl text-[10px] md:text-xs transition-transform active:scale-95"
                  style={{ backgroundColor: theme.primary, color: theme.background }}
                >
                  View My Orders
                </Link>
                <Link 
                  to="/"
                  className="px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[24px] font-black uppercase tracking-widest border text-[10px] md:text-xs transition-colors"
                  style={{ borderColor: theme.border, color: theme.text }}
                >
                  Return Home
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        {step !== 3 && (
          <div className="space-y-6 md:space-y-8 px-2 md:px-0">
            <div className="p-6 md:p-10 rounded-[32px] md:rounded-[48px] border shadow-2xl lg:sticky lg:top-28" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
               <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-6 md:mb-10 opacity-40">Order Summary</h3>
               
               <div className="space-y-4 md:space-y-6 mb-6 md:mb-10 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                 {items.map(item => (
                   <div key={item.uniqueId} className="flex items-center space-x-3 md:space-x-4">
                     <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                       <img 
                        src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                       />
                     </div>
                     <div className="flex-grow min-w-0">
                       <p className="text-[8px] md:text-[10px] font-black uppercase truncate">{item.name}</p>
                       <p className="text-[6px] md:text-[8px] font-bold opacity-40 uppercase">{item.variant?.name} • x{item.quantity}</p>
                     </div>
                     <p className="text-[8px] md:text-[10px] font-black">${item.totalItemPrice.toFixed(2)}</p>
                   </div>
                 ))}
               </div>

               <div className="space-y-3 md:space-y-4 pt-6 md:pt-8 border-t" style={{ borderColor: theme.border }}>
                 <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40">
                   <span>Subtotal</span>
                   <span style={{ color: theme.text }}>${subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40">
                   <span>Tax (10%)</span>
                   <span style={{ color: theme.text }}>${tax.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40">
                   <span>{orderType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
                   <span style={{ color: theme.text }}>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
                 </div>
                 
                 <div className="pt-4 md:pt-6 border-t" style={{ borderColor: theme.border }}>
                   <div className="flex justify-between items-end">
                     <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1">Grand Total</span>
                     <span className="text-2xl md:text-4xl font-black" style={{ color: theme.primary }}>${total.toFixed(2)}</span>
                   </div>
                 </div>
               </div>

               <button 
                onClick={handlePlaceOrder}
                disabled={loading || (paymentMethod === 'online' && !stripe)}
                className="w-full mt-6 md:mt-10 py-4 md:py-6 rounded-xl md:rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-2 md:space-x-3 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.primary, color: theme.background }}
              >
                {loading ? (
                  <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: theme.background }} />
                ) : (
                  <>
                    <span>Place Order</span>
                    <ChevronRight size={18} md={20} />
                  </>
                )}
              </button>

              <div className="mt-6 md:mt-8 flex items-center justify-center space-x-3 md:space-x-4 opacity-20">
                <Clock size={14} md={16} />
                <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest">Est. Time: 15-20 mins</p>
              </div>
            </div>

            {!user && (
              <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 border-dashed flex flex-col items-center text-center space-y-3 md:space-y-4 mx-2 md:mx-0" style={{ borderColor: theme.border }}>
                <AlertCircle size={20} md={24} className="text-amber-500" />
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed">
                  You are checking out as a guest. <br /> Sign in to earn rewards.
                </p>
                <Link to="/login?redirect=/checkout" className="text-[8px] md:text-[10px] font-black uppercase tracking-widest underline" style={{ color: theme.primary }}>Login Now</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
