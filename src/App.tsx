import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; // مسیر دقیق فایل در src/lib/supabase.ts
import ShopSection from './components/shop/ShopSection';
import CartDrawer from './components/shop/CartDrawer';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import EventsSection from './components/events/EventsSection';
import AdminDashboard from './pages/AdminDashboard';
import AthleteDashboard from './pages/AthleteDashboard'; 
import EventDetails from './pages/EventDetails'; 
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';


// Icons & Assets
import { Trophy, Users, Star, Facebook, Instagram, Youtube } from 'lucide-react';
import bgHome from './assets/BG_Home.jpg';

// --- کامپوننت کمکی برای اسکرول به بالا در هر تغییر صفحه ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- بخش صفحه اصلی (HomePage) ---
const HomePage = ({ currentUser, memberCount }: { currentUser: any, memberCount: any }) => {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-16 items-stretch mb-24">
        
        {/* Left: Branding & Stats */}
        <div className="relative p-8 md:p-10 rounded-[3rem] overflow-hidden flex flex-col shadow-sm border border-slate-100 bg-white/30">
          <div 
            className="absolute inset-0 z-0 opacity-[0.2] bg-cover bg-center pointer-events-none"
            style={{ 
              backgroundImage: `url(${bgHome})`,
              filter: 'grayscale(100%)'
            }}
          ></div>

          <div className="relative z-10 flex flex-col h-full space-y-8">
            <div className="inline-block self-start bg-amber-500/10 border border-amber-200 text-amber-700 px-4 py-1 rounded-lg text-sm font-bold uppercase tracking-widest">
              Auckland, New Zealand
            </div>
            
            <div className="flex-grow space-y-8">
              <h1 className="text-6xl md:text-7xl font-black leading-[1.1] tracking-tighter uppercase italic text-slate-800">
                Build Your <br />
                <span className="text-amber-500 underline decoration-amber-200">Legacy</span> On The Mat
              </h1>
              
              <p className="text-slate-600 text-lg max-w-xl leading-relaxed text-justify">
                Join Karim Wrestling Academy. We provide a professional environment for athlete development. 
              Register now to secure your spot and receive your digital member card. 
              Train with experienced coaches who are dedicated to helping you reach your full potential. 
              Build strength, discipline, and confidence both on and off the mat. 
              Start your journey today and become part of a community that champions excellence and resilience. 
              Push beyond your limits and discover the champion within you.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { icon: <Trophy />, label: "Medals", value: "15+" },
                { icon: <Users />, label: "Members", value: `${memberCount}+` },
                { icon: <Star />, label: "Coaching", value: "Elite" }
              ].map((stat, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-amber-500 flex justify-center mb-2">{stat.icon}</div>
                  <div className="text-2xl font-black italic text-slate-800">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Registration Form */}
        <div className="relative flex flex-col h-full">
          <div className="absolute -inset-10 bg-amber-200/40 blur-3xl rounded-full opacity-30"></div>
          <div className="relative z-10 h-full">
            <RegistrationForm />
          </div>
        </div>
      </div>
      
      
      <ShopSection />
      
      {/* Events Section */}
      <EventsSection currentUser={currentUser} />

    </main>
  );
};

// --- کامپوننت اصلی برنامه (App) ---
function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [memberCount, setMemberCount] = useState<number | string>('...');

  useEffect(() => {
    fetchStats();
    
    // مدیریت وضعیت لاگین کاربر
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile || user);
      }
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setCurrentUser(profile || session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'wrestler');
      if (!error && count !== null) setMemberCount(count);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <Router>
      {/* تضمین شروع هر صفحه از نقطه صفر (بالا) */}
      <ScrollToTop />
      <CartProvider>
      <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans tracking-tight flex flex-col">
        <Navbar />
        <CartDrawer />

        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage currentUser={currentUser} memberCount={memberCount} />} />
            
            <Route path="/event/:id" element={<EventDetails currentUser={currentUser} />} />

            <Route path="/login" element={
              <div className="min-h-[80vh] flex items-center justify-center p-6">
                <LoginForm />
              </div>
            } />

            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/athlete" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <footer className="bg-slate-950 border-t border-slate-800 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="flex justify-center items-center gap-2 mb-6">
              <div className="h-px w-8 bg-slate-800"></div>
              <span className="text-amber-500 font-black text-xs uppercase tracking-[0.4em] italic">Karim Wrestling</span>
              <div className="h-px w-8 bg-slate-800"></div>
            </div>

            <div className="flex gap-6 mb-8">
              <a href="https://www.facebook.com/groups/554711855214839" target="_blank" className="text-slate-500 hover:text-amber-500 transition-all transform hover:scale-110"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/karim.wrestling.academy/" target="_blank" className="text-slate-500 hover:text-amber-500 transition-all transform hover:scale-110"><Instagram size={20} /></a>
              <a href="#" className="text-slate-500 hover:text-red-500 transition-all transform hover:scale-110"><Youtube size={20} /></a>
            </div>
            
            <div className="text-center">
              <p className="text-slate-400 text-[9px] uppercase tracking-[0.3em] font-black leading-relaxed">
                © {new Date().getFullYear()} Karim Wrestling Academy - Auckland. <br />
                <span className="text-slate-600 mt-1 block uppercase tracking-[0.2em]">Designed for Elite Performance.</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
      </CartProvider>
    </Router>
  );
}

export default App;