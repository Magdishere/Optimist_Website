import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  LogOut,
  Camera,
  Bell,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { logout } from '../redux/slices/authSlice';

const Profile = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('account');

  if (!user) return null;

  const menuItems = [
    { id: 'account', icon: User, label: 'Account Info' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'billing', icon: CreditCard, label: 'Billing' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar */}
        <div className="md:w-1/3 space-y-6 md:space-y-8">
          <div className="p-6 md:p-8 rounded-[32px] md:rounded-[40px] border relative overflow-hidden" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-5 translate-x-6 md:translate-x-8 translate-y-[-6px] md:translate-y-[-8px]">
              <Coffee size={128} style={{ color: theme.primary }} />
            </div>
            
            <div className="relative space-y-6">
              <div className="relative inline-block">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[20px] md:rounded-3xl bg-opacity-10 flex items-center justify-center overflow-hidden" style={{ backgroundColor: theme.primary }}>
                   <img src={`https://i.pravatar.cc/150?u=${user.email}`} alt="avatar" />
                </div>
                <button className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg border" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                  <Camera size={12} md={14} style={{ color: theme.text }} />
                </button>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ color: theme.text }}>{user.firstName} {user.lastName}</h2>
                <p className="text-[8px] md:text-[10px] font-bold uppercase opacity-40 tracking-widest">{user.email}</p>
              </div>

              <div className="pt-4 md:pt-6 space-y-1.5 md:space-y-2 overflow-x-auto no-scrollbar flex md:flex-col gap-2">
                {menuItems.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all font-black uppercase tracking-widest text-[8px] md:text-[10px] whitespace-nowrap md:w-full ${activeTab === item.id ? 'shadow-lg' : 'opacity-40 hover:opacity-100 hover:bg-black/5'}`}
                    style={{ 
                      backgroundColor: activeTab === item.id ? theme.primary : 'transparent',
                      color: activeTab === item.id ? theme.background : theme.text
                    }}
                  >
                    <item.icon size={14} md={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => dispatch(logout())}
                className="w-full mt-4 md:mt-8 flex items-center space-x-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-red-500 font-black uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-red-500 hover:bg-opacity-10 transition-colors"
              >
                <LogOut size={14} md={16} />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:w-2/3">
          <div className="p-6 md:p-10 rounded-[32px] md:rounded-[40px] border h-full" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
             {activeTab === 'account' && (
               <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
                 <div className="space-y-1 md:space-y-2">
                   <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter" style={{ color: theme.primary }}>Account Info</h2>
                   <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40">Manage your personal details</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">First Name</label>
                      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl border font-bold text-xs md:text-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>{user.firstName}</div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Last Name</label>
                      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl border font-bold text-xs md:text-sm" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>{user.lastName}</div>
                    </div>
                    <div className="space-y-1 md:space-y-2 sm:col-span-2">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Email Address</label>
                      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl border font-bold text-xs md:text-sm flex items-center justify-between" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                        <span className="truncate mr-4">{user.email}</span>
                        <CheckCircle size={12} md={14} className="text-green-500 flex-shrink-0" />
                      </div>
                    </div>
                 </div>

                 <div className="pt-6 md:pt-8 border-t" style={{ borderColor: theme.border }}>
                    <button 
                      className="px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-xs shadow-lg transition-all active:scale-95"
                      style={{ backgroundColor: theme.primary, color: theme.background }}
                    >
                      Update Profile
                    </button>
                 </div>
               </div>
             )}

             {activeTab !== 'account' && (
               <div className="flex flex-col items-center justify-center h-full min-h-[200px] space-y-4 opacity-20">
                 <Settings size={32} md={48} />
                 <p className="font-black uppercase tracking-widest text-[10px] md:text-sm">Under Construction</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder Coffee icon used in Profile
const Coffee = ({ size, style, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
    className={className}
  >
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

export default Profile;
