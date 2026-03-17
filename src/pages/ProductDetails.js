import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowLeft, 
  Check,
  Coffee
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import API, { BASE_URL } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // States for variants and add-ons
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        const item = res.data.data;
        setProduct(item);
        
        // Initialize variants (Regular + others)
        const allVariants = [
          { _id: 'regular', name: 'Regular', price: item.basePrice },
          ...(item.variants || [])
        ];
        setSelectedVariant(allVariants[0]);
        setTotalPrice(allVariants[0].price);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (selectedVariant) {
      let unitPrice = selectedVariant.price;
      selectedAddOns.forEach(addOn => {
        unitPrice += addOn.price;
      });
      setTotalPrice(unitPrice * quantity);
    }
  }, [selectedVariant, selectedAddOns, quantity]);

  const toggleAddOn = (addOn) => {
    const index = selectedAddOns.findIndex(a => a._id === addOn._id);
    if (index > -1) {
      const newAddOns = [...selectedAddOns];
      newAddOns.splice(index, 1);
      setSelectedAddOns(newAddOns);
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }

    let unitPrice = selectedVariant.price;
    selectedAddOns.forEach(addOn => {
      unitPrice += addOn.price;
    });

    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.image,
      quantity,
      variant: selectedVariant,
      selectedAddOns,
      pricePerUnit: unitPrice
    }));

    navigate('/cart');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: theme.primary }} />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-black uppercase">Product not found</h2>
      <Link to="/products" className="text-sm font-bold underline mt-4 block">Back to Menu</Link>
    </div>
  );

  const allVariants = [
    { _id: 'regular', name: 'Regular', price: product.basePrice },
    ...(product.variants || [])
  ];

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-1 md:px-0">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-[10px] md:text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity ml-2"
      >
        <ArrowLeft size={14} md={16} />
        <span>Back to Menu</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
        {/* Image Section */}
        <div className="aspect-square rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl border mx-1 md:mx-0" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
          <img 
            src={product.image ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`) : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop'} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Section */}
        <div className="space-y-6 md:space-y-8 px-4 md:px-0">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.text }}>
              {product.name}
            </h1>
            <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-40" style={{ color: theme.primary }}>
              {product.menuSection}
            </p>
          </div>

          <p className="text-sm md:text-sm font-semibold opacity-60 leading-relaxed text-center md:text-left" style={{ color: theme.text }}>
            {product.description}
          </p>

          {/* Variants (Sizes) */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center md:text-left">Select Size</h3>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              {allVariants.map((variant) => (
                <button
                  key={variant._id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-2.5 md:p-4 rounded-xl md:rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-0.5 md:space-y-1 ${selectedVariant?._id === variant._id ? 'shadow-xl scale-105' : 'opacity-60 hover:opacity-100'}`}
                  style={{ 
                    backgroundColor: selectedVariant?._id === variant._id ? theme.primary : theme.surface,
                    borderColor: selectedVariant?._id === variant._id ? theme.primary : 'transparent',
                    color: selectedVariant?._id === variant._id ? theme.background : theme.text
                  }}
                >
                  <span className="text-[8px] md:text-[10px] font-black uppercase">{variant.name}</span>
                  <span className="text-[9px] md:text-xs font-bold opacity-60">${variant.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {product.addOns && product.addOns.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center md:text-left">Extra Add-ons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
                {product.addOns.map((addOn) => {
                  const isSelected = selectedAddOns.some(a => a._id === addOn._id);
                  return (
                    <button
                      key={addOn._id}
                      onClick={() => toggleAddOn(addOn)}
                      className={`flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-[24px] border-2 transition-all ${isSelected ? 'shadow-lg' : 'hover:bg-black/5'}`}
                      style={{ 
                        backgroundColor: theme.surface, 
                        borderColor: isSelected ? theme.primary : 'transparent' 
                      }}
                    >
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div 
                          className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? '' : 'opacity-20'}`}
                          style={{ backgroundColor: isSelected ? theme.primary : 'transparent', borderColor: isSelected ? theme.primary : theme.text }}
                        >
                          {isSelected && <Check size={12} color={theme.background} />}
                        </div>
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-tight">{addOn.name}</span>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold" style={{ color: theme.primary }}>+${addOn.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer / Add to Cart */}
          <div className="pt-6 md:pt-8 border-t flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 sticky bottom-4 md:static" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-center p-1.5 md:p-2 rounded-2xl shadow-xl md:shadow-none" style={{ backgroundColor: theme.surface }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 md:p-3 rounded-xl transition-colors hover:bg-black/5"
              >
                <Minus size={18} />
              </button>
              <span className="w-10 md:w-12 text-center font-black text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 md:p-3 rounded-xl transition-colors hover:bg-black/5"
              >
                <Plus size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-grow py-4 md:py-5 rounded-2xl md:rounded-[24px] font-black uppercase tracking-widest shadow-2xl transition-transform active:scale-95 flex items-center justify-between px-6 md:px-8"
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              <div className="flex items-center space-x-3">
                <ShoppingBag size={20} />
                <span className="text-xs md:text-base">Add to Cart</span>
              </div>
              <span className="text-lg md:text-xl font-black">${totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
