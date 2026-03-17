import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingBag, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeContext';
import API, { BASE_URL } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';

const Products = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const { user } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || 'all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          API.get('/products'),
          API.get('/categories')
        ]);
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (categoryId) setSelectedCategory(categoryId);
  }, [categoryId]);

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prod.category?._id === selectedCategory || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login?redirect=/products');
      return;
    }
    
    // Use the same default logic as ProductDetails
    const defaultVariant = { _id: 'regular', name: 'Regular', price: product.basePrice };
    
    dispatch(addToCart({
      _id: product._id,
      name: product.name,
      image: product.image,
      quantity: 1,
      variant: defaultVariant,
      selectedAddOns: [],
      pricePerUnit: product.basePrice
    }));
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-0">
        <div className="space-y-1 md:space-y-2 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.primary }}>Our Menu</h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-60">Freshly brewed just for you</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:max-w-2xl">
          <div 
            className="flex-grow flex items-center px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Search size={16} md={18} className="opacity-40 mr-3" />
            <input 
              type="text" 
              placeholder="Search coffee..." 
              className="bg-transparent border-none outline-none w-full font-bold text-xs md:text-sm"
              style={{ color: theme.text }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div 
            className="flex items-center px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Filter size={14} md={16} className="opacity-40 mr-3" />
            <select 
              className="bg-transparent border-none outline-none font-bold text-xs md:text-sm cursor-pointer min-w-[100px] w-full"
              style={{ color: theme.text }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchParams(e.target.value === 'all' ? {} : { category: e.target.value });
              }}
            >
              <option value="all" style={{ backgroundColor: theme.card, color: theme.text }}>All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id} style={{ backgroundColor: theme.card, color: theme.text }}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center space-x-3 md:space-x-4 overflow-x-auto pb-4 no-scrollbar px-1 md:px-0">
        <button 
          onClick={() => {
            setSelectedCategory('all');
            setSearchParams({});
          }}
          className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'shadow-lg' : 'opacity-40 hover:opacity-100'}`}
          style={{ 
            backgroundColor: selectedCategory === 'all' ? theme.primary : theme.surface,
            color: selectedCategory === 'all' ? theme.background : theme.text
          }}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat._id}
            onClick={() => {
              setSelectedCategory(cat._id);
              setSearchParams({ category: cat._id });
            }}
            className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] whitespace-nowrap transition-all ${selectedCategory === cat._id ? 'shadow-lg' : 'opacity-40 hover:opacity-100'}`}
            style={{ 
              backgroundColor: selectedCategory === cat._id ? theme.primary : theme.surface,
              color: selectedCategory === cat._id ? theme.background : theme.text
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-1 md:px-0">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="h-64 md:h-96 rounded-2xl md:rounded-[32px] animate-pulse" style={{ backgroundColor: theme.surface }} />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <ShoppingBag size={48} md={64} className="mx-auto opacity-10 mb-4" />
            <p className="font-black uppercase tracking-widest opacity-40 text-xs md:text-base">No items found</p>
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div 
              key={prod._id}
              className="group p-3 md:p-6 rounded-2xl md:rounded-[32px] shadow-xl transition-all duration-500 hover:-translate-y-2 border relative flex flex-col"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 relative">
                <img 
                  src={prod.image ? (prod.image.startsWith('http') ? prod.image : `${BASE_URL}${prod.image}`) : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop'} 
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button 
                  onClick={(e) => handleAddToCart(e, prod)}
                  className="absolute bottom-2 right-2 md:bottom-4 md:right-4 p-3 md:p-4 rounded-lg md:rounded-2xl shadow-2xl transition-all active:scale-90 md:translate-y-4 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ backgroundColor: theme.primary, color: theme.background }}
                >
                  <Plus size={16} md={20} />
                </button>
              </div>
              
              <div className="space-y-1 md:space-y-2 flex-grow flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                  <h3 className="text-xs md:text-lg font-black uppercase tracking-tight truncate" style={{ color: theme.text }}>{prod.name}</h3>
                  <span className="font-black text-[10px] md:text-base" style={{ color: theme.accent }}>${prod.basePrice.toFixed(2)}</span>
                </div>
                <p className="text-[8px] md:text-xs font-bold opacity-50 line-clamp-2 md:line-clamp-2" style={{ color: theme.text }}>{prod.description}</p>
                <div className="pt-3 md:pt-4 mt-auto flex items-center justify-between">
                  <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-40 truncate max-w-[60px] md:max-w-none">
                    {typeof prod.category === 'object' ? prod.category.name : categories.find(c => c._id === prod.category)?.name}
                  </span>
                  <Link 
                    to={`/product/${prod._id}`}
                    className="text-[7px] md:text-[10px] font-black uppercase tracking-widest transition-colors hover:underline"
                    style={{ color: theme.primary }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;
