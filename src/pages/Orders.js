import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Package, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  ShoppingBag,
  Truck,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import API, { BASE_URL } from '../services/api';

const Orders = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await API.get('/orders/my-orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a', icon: CheckCircle };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', icon: AlertCircle };
      case 'preparing':
      case 'pending':
      case 'awaiting_payment':
        return { bg: 'rgba(249, 115, 22, 0.1)', text: '#ea580c', icon: Clock };
      default:
        return { bg: theme.surface, text: theme.text, icon: Package };
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      const res = await API.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        // Update local state
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: theme.primary }} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 py-4 md:py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>My Orders</h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-40">Your coffee journey history</p>
        </div>
        <div className="flex items-center justify-center space-x-4 p-3 md:p-4 rounded-2xl md:rounded-3xl border self-center md:self-auto" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
           <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
              <Package size={16} md={20} style={{ color: theme.background }} />
           </div>
           <div>
              <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40">Total Orders</p>
              <p className="text-base md:text-lg font-black">{orders.length}</p>
           </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div 
          className="text-center py-20 md:py-32 space-y-6 md:space-y-8 rounded-[40px] md:rounded-[60px] border border-dashed"
          style={{ backgroundColor: `${theme.surface}80`, borderColor: theme.border }}
        >
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: theme.surface }}>
            <ClipboardList size={32} md={48} className="opacity-10" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest">No orders yet</h2>
            <p className="text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest">Start your first order today</p>
          </div>
          <Link 
            to="/products"
            className="inline-block px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-transform active:scale-95 text-[10px] md:text-xs"
            style={{ backgroundColor: theme.primary, color: theme.background }}
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            const StatusIcon = statusStyle.icon;

            return (
              <div 
                key={order._id}
                className="group p-6 md:p-10 rounded-[32px] md:rounded-[48px] border-2 transition-all hover:shadow-2xl"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <div className="flex flex-col lg:flex-row gap-8 md:gap-10">
                  {/* Order Info */}
                  <div className="flex-grow space-y-6 md:space-y-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 md:gap-6">
                      <div className="space-y-1">
                        <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 tracking-widest">Order ID</p>
                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight" style={{ color: theme.text }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 md:gap-4">
                        <div 
                          className="px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-sm"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          <StatusIcon size={12} md={14} />
                          <span>{order.status.replace('_', ' ')}</span>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl border flex items-center space-x-2" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                           {order.orderType === 'delivery' ? <Truck size={12} md={14} /> : <ShoppingBag size={12} md={14} />}
                           <span className="text-[8px] md:text-[10px] font-black uppercase">{order.orderType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
                      <div className="space-y-1">
                        <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 tracking-widest">Date</p>
                        <p className="text-xs md:text-sm font-bold">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 tracking-widest">Total Amount</p>
                        <p className="text-xs md:text-sm font-black" style={{ color: theme.primary }}>${order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 tracking-widest">Payment</p>
                        <p className="text-xs md:text-sm font-bold uppercase">{order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-4 pt-6 md:pt-8 border-t" style={{ borderColor: theme.border }}>
                       <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 tracking-widest">Order Items</p>
                       <div className="flex flex-wrap gap-3 md:gap-4">
                          {order.orderItems.map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 md:space-x-4 p-2 md:p-3 rounded-2xl md:rounded-3xl border" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden border flex-shrink-0" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
                                  <img 
                                    src={item.image ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`) : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=100&auto=format&fit=crop'} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover" 
                                  />
                               </div>
                               <div className="pr-2 md:pr-4 min-w-0">
                                  <p className="text-[8px] md:text-[10px] font-black uppercase leading-none truncate max-w-[80px] md:max-w-none">{item.name}</p>
                                  <p className="text-[6px] md:text-[8px] font-bold opacity-40 uppercase mt-1">{item.variant?.name} x {item.quantity}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  {/* Actions / Address */}
                  <div className="lg:w-72 space-y-6 pt-6 md:pt-10 lg:pt-0 lg:border-l lg:pl-10 flex flex-col justify-between" style={{ borderColor: theme.border }}>
                    <div className="space-y-4">
                       <div className="flex items-start space-x-3">
                          <MapPin size={14} md={16} className="mt-1 opacity-40 flex-shrink-0" />
                          <div className="min-w-0">
                             <p className="text-[8px] md:text-[10px] font-black uppercase opacity-40 mb-1">Destination</p>
                             <p className="text-[10px] md:text-xs font-bold leading-relaxed">
                                {typeof order.shippingAddress === 'object' 
                                  ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}`.replace(/^, |, $/g, '') || 'Store Pickup'
                                  : order.shippingAddress || 'Store Pickup'}
                             </p>
                          </div>
                       </div>
                    </div>

                    <button 
                      className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
                      style={{ backgroundColor: theme.primary, color: theme.background }}
                    >
                      <span>Track Order</span>
                      <ChevronRight size={12} md={14} />
                    </button>

                    {['pending', 'awaiting_payment'].includes(order.status.toLowerCase()) && (
                      <button 
                        onClick={() => handleCancelOrder(order._id)}
                        className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] border-2 transition-all active:scale-95 hover:bg-red-500 hover:bg-opacity-10"
                        style={{ color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
