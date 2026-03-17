import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import API, { BASE_URL } from '../services/api';

const Home = () => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes, topRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products'),
          API.get('/products/top')
        ]);
        setCategories(catRes.data.data.slice(0, 4));
        // Use top 3 most ordered products for the Weekly Favorites section
        setFeaturedProducts(topRes.data.data.length > 0 ? topRes.data.data : prodRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-12 md:space-y-20 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] rounded-[30px] md:rounded-[40px] overflow-hidden flex items-center">
        <img 
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop" 
          alt="Coffee Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 md:px-12 text-white space-y-4 md:space-y-6">
          <h1 className="text-3xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-tight md:leading-none">
            Better Coffee <br className="hidden sm:block" /> <span style={{ color: theme.accent }}>Better Mood.</span>
          </h1>
          <p className="max-w-xl text-sm md:text-lg font-medium opacity-90 leading-relaxed">
            Experience the perfect blend of tradition and innovation. Roasted fresh, delivered to your door or enjoyed in our cozy locations.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 md:pt-0">
            <Link 
              to="/products"
              className="px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest bg-white text-black shadow-2xl transition-transform active:scale-95 flex items-center justify-center text-xs md:text-base"
            >
              Order Now
              <ArrowRight className="ml-2" size={18} md={20} />
            </Link>
            <Link 
              to="/locations"
              className="px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest border-2 border-white/30 backdrop-blur-md transition-all hover:bg-white/10 text-center text-xs md:text-base"
            >
              Find Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex items-end justify-between px-1 md:px-0">
          <div>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest" style={{ color: theme.primary }}>Our Menu</h2>
            <p className="text-[8px] md:text-sm opacity-60 font-bold uppercase tracking-widest mt-1">Explore our specialties</p>
          </div>
          <Link to="/products" className="text-[8px] md:text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
            View Full Menu
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-40 md:h-64 rounded-2xl md:rounded-3xl animate-pulse" style={{ backgroundColor: theme.surface }} />
            ))
          ) : (
            categories.map((cat) => (
              <Link 
                key={cat._id} 
                to={`/products?category=${cat._id}`}
                className="group relative h-40 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:-translate-y-2"
              >
                <img 
                  src={cat.image ? (cat.image.startsWith('http') ? cat.image : `${BASE_URL}${cat.image}`) : 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop'} 
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                  <h3 className="text-xs md:text-xl font-black text-white uppercase tracking-widest">{cat.name}</h3>
                  <p className="text-[6px] md:text-[10px] text-white/60 font-black uppercase tracking-widest">Explore</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="p-6 md:p-12 rounded-[32px] md:rounded-[40px]" style={{ backgroundColor: theme.surface }}>
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          <div className="lg:w-1/3 space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight" style={{ color: theme.primary }}>Weekly <br className="hidden lg:block" /> <span style={{ color: theme.accent }}>Favorites.</span></h2>
            <p className="text-xs md:text-sm opacity-60 font-semibold" style={{ color: theme.text }}>
              These are the items our community can't get enough of this week. Try them and see why!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {[
                { icon: Star, title: 'Top Rated', desc: 'Rated 4.9/5 by 10k+ users' },
                { icon: Clock, title: 'Fast Delivery', desc: 'Under 15 mins in city area' },
                { icon: MapPin, title: 'Freshly Roasted', desc: 'Local roastery in NYC' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 md:space-x-4">
                  <div className="p-2 md:p-3 rounded-lg md:rounded-xl" style={{ backgroundColor: theme.card }}>
                    <item.icon size={16} md={18} style={{ color: theme.accent }} />
                  </div>
                  <div>
                    <h4 className="text-[10px] md:text-sm font-black uppercase" style={{ color: theme.text }}>{item.title}</h4>
                    <p className="text-[8px] md:text-[10px] opacity-60 font-bold uppercase">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-64 md:h-80 rounded-2xl md:rounded-3xl animate-pulse" style={{ backgroundColor: theme.card }} />
              ))
            ) : (
              featuredProducts.map((prod) => (
                <div key={prod._id} className="group p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl border flex flex-col" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                  <div className="h-40 md:h-48 rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 relative">
                    <img 
                      src={prod.image ? (prod.image.startsWith('http') ? prod.image : `${BASE_URL}${prod.image}`) : 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop'} 
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 backdrop-blur-md text-[8px] md:text-[10px] font-black uppercase text-black">
                      ${prod.basePrice.toFixed(2)}
                    </div>
                  </div>
                  <h3 className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 md:mb-2 truncate" style={{ color: theme.text }}>{prod.name}</h3>
                  <p className="text-[8px] md:text-[10px] opacity-60 line-clamp-2 mb-3 md:mb-4 font-bold" style={{ color: theme.text }}>{prod.description}</p>
                  <Link 
                    to={`/product/${prod._id}`}
                    className="w-full mt-auto py-2.5 md:py-3 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] flex items-center justify-center transition-all group-hover:bg-opacity-90"
                    style={{ backgroundColor: theme.primary, color: theme.background }}
                  >
                    Details
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="relative overflow-hidden rounded-[32px] md:rounded-[40px] p-6 md:p-20" style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}>
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-20">
          <div className="lg:w-1/2 space-y-6 md:space-y-8">
            <div className="space-y-1 md:space-y-2">
              <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.primary }}>The Optimist <br /> <span style={{ color: theme.accent }}>Philosophy.</span></h2>
              <div className="w-16 md:w-20 h-1.5 md:h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
            </div>
            
            <p className="text-xs md:text-lg font-medium leading-relaxed opacity-80" style={{ color: theme.text }}>
              Since our first roast in 2012, we've believed that coffee is more than just a morning routine—it's a catalyst for positive change. We source our beans ethically, roast them with precision, and serve every cup with a genuine smile.
            </p>

            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div>
                <h4 className="text-xl md:text-3xl font-black" style={{ color: theme.primary }}>100%</h4>
                <p className="text-[8px] md:text-xs font-black uppercase tracking-widest opacity-40">Ethical Sourcing</p>
              </div>
              <div>
                <h4 className="text-xl md:text-3xl font-black" style={{ color: theme.primary }}>24h</h4>
                <p className="text-[8px] md:text-xs font-black uppercase tracking-widest opacity-40">Fresh Roasting</p>
              </div>
            </div>

            <Link 
              to="/locations"
              className="inline-flex items-center px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-transform active:scale-95 text-xs md:text-base"
              style={{ backgroundColor: theme.primary, color: theme.background }}
            >
              Our Journey
              <ArrowRight className="ml-2" size={18} md={20} />
            </Link>
          </div>

          <div className="lg:w-1/2 relative w-full">
            <div className="aspect-[4/5] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl md:rotate-3 transition-transform hover:rotate-0 duration-500">
              <img 
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=1000&auto=format&fit=crop" 
                alt="Our Roastery"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 p-4 md:p-8 rounded-2xl md:rounded-3xl backdrop-blur-xl border-2 shadow-2xl hidden sm:block" style={{ backgroundColor: `${theme.surface}cc`, borderColor: theme.border }}>
               <Coffee size={32} md={48} style={{ color: theme.accent }} />
               <p className="mt-2 md:mt-4 text-[8px] md:text-xs font-black uppercase tracking-widest" style={{ color: theme.text }}>Est. 2012</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
