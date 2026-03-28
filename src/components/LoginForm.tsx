import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import Modal from './Modal'; // مطمئن شوید مسیر فایل درست است

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // وضعیت مدیریت مودال
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. ورود به سرویس Auth سوپابیس
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setModal({
        isOpen: true,
        title: "Login Failed",
        message: authError.message,
        type: 'error'
      });
      setLoading(false);
      return;
    }

    if (authData?.user) {
      // 2. دریافت نقش و وضعیت تایید از جدول profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_verified')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        setModal({
          isOpen: true,
          title: "Profile Error",
          message: "Could not retrieve your athlete profile. Please contact support.",
          type: 'error'
        });
      } else if (profile) {
        // 3. بررسی وضعیت تاییدیه برای کشتی‌گیران
        if (profile.role === 'wrestler' && !profile.is_verified) {
          await supabase.auth.signOut();
          setModal({
            isOpen: true,
            title: "Pending Approval",
            message: "HOLD ON! Your account is currently under review by the coaching staff. You will be able to access the hub once verified.",
            type: 'info'
          });
        } else {
          redirectUser(profile.role);
        }
      }
    }
    setLoading(false);
  };

  const redirectUser = (role: string) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'wrestler':
        navigate('/athlete'); 
        break;
      default:
        navigate('/'); 
    }
  };

  return (
    <div className="relative">
      <div className="max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-[0_35px_70px_rgba(0,0,0,0.1)] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-900 p-4 rounded-3xl text-white mb-4 shadow-2xl shadow-slate-200 transform hover:scale-110 transition-transform">
            <LogIn size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Member Access</h2>
          <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">Enter your credentials to enter</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner font-medium text-slate-800"
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-slate-50 border border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-inner font-medium text-slate-800"
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-amber-600 text-white font-black py-5 rounded-3xl shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 uppercase italic tracking-widest active:scale-95 disabled:opacity-50 mt-4 shadow-slate-200"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Authenticating...</span>
              </>
            ) : "Sign In to Academy"}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            New athlete? <span className="text-amber-600 cursor-pointer hover:underline font-black" onClick={() => navigate('/')}>Register here</span>
          </p>
        </div>
      </div>

      {/* نمایش مودال به جای باکس پیام */}
      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default LoginForm;