import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Navigation, Search, Coffee } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import API from '../services/api';

const Locations = () => {
  const { theme } = useTheme();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await API.get('/locations');
        const data = res.data.data;
        setLocations(data);
        if (data.length > 0) {
          setSelectedLocation(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const getStatus = (operatingHours) => {
    if (!operatingHours) return { isOpen: false, text: 'Closed' };
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[now.getDay()];
    const hours = operatingHours[dayName];

    if (!hours || hours.isClosed) return { isOpen: false, text: 'Closed' };

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    
    const openTime = new Date();
    openTime.setHours(openH, openM, 0);
    
    const closeTime = new Date();
    closeTime.setHours(closeH, closeM, 0);

    if (now >= openTime && now <= closeTime) {
      return { isOpen: true, text: 'Open Now' };
    }
    return { isOpen: false, text: 'Closed' };
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGoogleMapsUrl = (loc) => {
    if (loc.coordinates?.lat && loc.coordinates?.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${loc.coordinates.lat},${loc.coordinates.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`;
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter" style={{ color: theme.primary }}>Our Locations</h1>
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-60">Find an Optimist near you</p>
        </div>

        <div 
          className="flex items-center px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all w-full md:max-w-md shadow-sm"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Search size={18} md={20} className="opacity-40 mr-3 md:mr-4" />
          <input 
            type="text" 
            placeholder="Search city or street..." 
            className="bg-transparent border-none outline-none w-full font-bold text-xs md:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Locations List */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-40 md:h-48 rounded-[24px] md:rounded-[32px] animate-pulse" style={{ backgroundColor: theme.surface }} />
            ))
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-16 md:py-20 opacity-40">
              <MapPin size={40} md={48} className="mx-auto mb-4" />
              <p className="text-xs md:text-sm font-black uppercase tracking-widest">No locations found</p>
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const status = getStatus(loc.operatingHours);
              const isSelected = selectedLocation?._id === loc._id;
              
              return (
                <div 
                  key={loc._id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`group p-6 md:p-8 rounded-[32px] md:rounded-[40px] border transition-all hover:shadow-2xl cursor-pointer ${isSelected ? 'ring-2' : 'hover:-translate-y-1'}`}
                  style={{ 
                    backgroundColor: theme.card, 
                    borderColor: isSelected ? theme.primary : theme.border,
                    ringColor: theme.primary
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-6 md:gap-8">
                    <div className="w-full sm:w-32 md:w-48 h-32 md:h-48 rounded-2xl md:rounded-3xl overflow-hidden flex-shrink-0 bg-amber-100/10 flex items-center justify-center border" style={{ borderColor: theme.border }}>
                      <Coffee size={40} md={64} className="text-amber-600 opacity-40" />
                    </div>
                    
                    <div className="flex-grow space-y-4 md:space-y-6">
                      <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ color: theme.text }}>{loc.name}</h3>
                          <span className="px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: status.isOpen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: status.isOpen ? '#22c55e' : '#ef4444' }}>
                            {status.text}
                          </span>
                        </div>
                        <div className="flex items-start space-x-2" style={{ color: theme.text, opacity: 0.7 }}>
                          <MapPin size={14} md={16} className="mt-1 flex-shrink-0" />
                          <p className="text-xs md:text-sm font-semibold leading-relaxed">{loc.address}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl" style={{ backgroundColor: theme.surface }}>
                            <Phone size={12} md={14} style={{ color: theme.primary }} />
                          </div>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest" style={{ color: theme.text, opacity: 0.7 }}>{loc.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl" style={{ backgroundColor: theme.surface }}>
                            <Clock size={12} md={14} style={{ color: theme.primary }} />
                          </div>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest" style={{ color: theme.text, opacity: 0.7 }}>
                            {loc.operatingHours?.monday?.open} - {loc.operatingHours?.monday?.close}
                          </span>
                        </div>
                      </div>

                      {isSelected && loc.operatingHours && (
                        <div className="pt-4 border-t space-y-2" style={{ borderColor: theme.border }}>
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: theme.text }}>Weekly Hours</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.entries(loc.operatingHours).map(([day, hours]) => (
                              <div key={day} className="p-2 rounded-lg" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
                                <p className="text-[8px] font-black uppercase opacity-60" style={{ color: theme.text }}>{day.slice(0, 3)}</p>
                                <p className="text-[9px] font-bold" style={{ color: theme.text }}>
                                  {hours.isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 md:pt-4 flex space-x-3 md:space-x-4">
                         <a 
                           href={getGoogleMapsUrl(loc)}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex-grow py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
                           style={{ backgroundColor: theme.primary, color: theme.background }}
                         >
                           <Navigation size={12} md={14} />
                           <span>Get Directions</span>
                         </a>
                         <button 
                           className="px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] border transition-colors hover:bg-opacity-5"
                           style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }}
                         >
                           Details
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Map View */}
        <div className="hidden lg:block space-y-6">
          <div 
            className="h-[600px] rounded-[40px] border relative overflow-hidden sticky top-28"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
             {selectedLocation ? (
               <div className="absolute inset-0 w-full h-full">
                 <iframe
                   title="Location Map"
                   width="100%"
                   height="100%"
                   frameBorder="0"
                   style={{ border: 0 }}
                   src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`}
                   allowFullScreen
                 ></iframe>
                 {/* Since I don't have an API key, I'll use a more robust fallback using an embed URL that doesn't strictly require one for basic preview or a simple redirect UI */}
                 <div className="absolute inset-0 bg-[#e5e7eb] flex flex-col items-center justify-center" style={{ backgroundColor: theme.background }}>
                    <div className="relative">
                       <div className="w-64 h-64 rounded-full border-8 animate-pulse" style={{ borderColor: `${theme.primary}20` }} />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-4 rounded-3xl shadow-2xl flex items-center space-x-3" style={{ backgroundColor: theme.card }}>
                             <div className="p-2 rounded-xl" style={{ backgroundColor: theme.primary }}>
                                <Coffee size={20} style={{ color: theme.background }} />
                             </div>
                             <div className="pr-4">
                                <p className="text-[10px] font-black uppercase leading-none" style={{ color: theme.text }}>{selectedLocation.name}</p>
                                <p className="text-[8px] font-bold opacity-40 uppercase mt-1">{selectedLocation.address}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 text-center space-y-4 px-12">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Map View for {selectedLocation.name}</p>
                       <a 
                         href={getGoogleMapsUrl(selectedLocation)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-block px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                         style={{ backgroundColor: theme.primary, color: theme.background }}
                       >
                         Open in Google Maps
                       </a>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                 <MapPin size={48} />
                 <p className="mt-4 font-black uppercase tracking-widest text-xs">Select a location</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
