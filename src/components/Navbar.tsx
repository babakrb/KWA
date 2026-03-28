import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext'; // ۱. اضافه کردن هوک سبد خرید

import { Shield, ShoppingBag, User, LogOut, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { cartItems, setIsCartOpen } = useCart(); // ۲. استخراج توابع مورد نیاز
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ photo_url: string | null; role: string | null }>({
    photo_url: null,
    role: null
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // محاسبه کل تعداد آیتم‌های سبد خرید
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchProfile(user.id);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile({ photo_url: null, role: null });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('photo_url, role')
      .eq('id', userId)
      .single();
    
    if (data) {
      setProfile({ photo_url: data.photo_url, role: data.role });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleEventsClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      closeMenu();
    } else {
      navigate('/');
    }
  };

  const isAdmin = profile.role === 'admin';

  return (
    <>
      <nav className="bg-slate-950 text-white border-b border-slate-800 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="text-amber-500 group-hover:scale-110 transition-transform" size={32} />
            <span className="font-black text-xl tracking-tighter uppercase italic">
              Karim <span className="text-amber-500">Wrestling</span> Academy
            </span>
          </Link>

          {/* Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <a href="#" className="hover:text-white transition-colors">Training</a>
            <a href="#events-section" onClick={handleEventsClick} className="hover:text-white transition-colors">Events</a>
            <a href="#" className="hover:text-white transition-colors">Shop</a>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* Shopping Bag Button - Updated */}
            <div 
              onClick={() => setIsCartOpen(true)} // ۳. باز کردن سبد خرید با کلیک
              className="relative cursor-pointer hover:text-amber-500 transition-all p-2 group"
            >
              <ShoppingBag size={22} className="group-active:scale-90 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-in zoom-in border-2 border-slate-950">
                  {totalItems}
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={isAdmin ? "/admin" : "/athlete"} className="flex items-center gap-3 group">
                  <div className="hidden md:flex flex-col items-end mr-1">
                    <span className={`text-[9px] font-black uppercase leading-none ${isAdmin ? 'text-cyan-400' : 'text-amber-500'}`}>
                      {isAdmin ? 'System Admin' : 'Athlete'}
                    </span>
                    <span className="text-[10px] font-bold text-white tracking-tight leading-normal uppercase italic">
                      {isAdmin ? 'Management' : 'Dashboard'}
                    </span>
                  </div>
                  
                  <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all p-0.5 bg-slate-900 shadow-lg ${isAdmin ? 'border-cyan-500/50 group-hover:border-cyan-400' : 'border-amber-500/30 group-hover:border-amber-500'}`}>
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-slate-800 ${isAdmin ? 'text-cyan-400' : 'text-amber-500'}`}>
                        {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
                      </div>
                    )}
                  </div>
                </Link>

                <button onClick={handleLogout} className="hidden md:flex p-2.5 rounded-full border border-slate-700 hover:bg-red-500/10 hover:border-red-500 text-slate-400 hover:text-red-500 transition-all active:scale-95">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block">
                <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-black font-black py-2.5 px-5 rounded-full transition-all text-[10px] uppercase italic tracking-widest">
                  <User size={16} /> Login
                </button>
              </Link>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-amber-500 hover:bg-slate-800 rounded-lg transition-all">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU - Updated Cart access inside mobile too */}
      <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={closeMenu}></div>
        <div className={`absolute right-0 top-0 h-full w-72 bg-slate-900 p-8 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* ... بقیه بخش‌های منوی موبایل که قبلاً داشتید ... */}
            
            <nav className="flex flex-col gap-6">
               <button 
                 onClick={() => { closeMenu(); setIsCartOpen(true); }}
                 className="text-2xl font-black uppercase italic tracking-tighter text-white hover:text-amber-500 flex items-center gap-3"
               >
                 Bag <span className="bg-amber-500 text-black text-xs px-2 py-1 rounded-lg">{totalItems}</span>
               </button>
               {/* سایر لینک‌های موبایل */}
            </nav>
            {/* ... بقیه کدها ... */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;