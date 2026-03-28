import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Calendar, Phone, Weight, Mail, Lock, Users } from 'lucide-react';
import Modal from './Modal'; // ایمپورت مودال

const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  
  // وضعیت مدیریت مودال
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    weight_class: '',
    phone_number: '',
    gender: 'male'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. ثبت نام در بخش Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      setModal({
        isOpen: true,
        title: "Registration Failed",
        message: authError.message,
        type: 'error'
      });
      setLoading(false);
      return;
    }

    const user = authData.user;

    if (user) {
      // 2. درج اطلاعات در جدول profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            birth_date: formData.birth_date || null,
            weight_class: formData.weight_class ? parseFloat(formData.weight_class) : null,
            phone_number: formData.phone_number,
            gender: formData.gender,
            role: 'wrestler'
          }
        ]);

      if (profileError) {
        setModal({
          isOpen: true,
          title: "Profile Error",
          message: "Account created, but we couldn't save your details: " + profileError.message,
          type: 'error'
        });
      } else {
        // موفقیت آمیز
        setModal({
          isOpen: true,
          title: "Registration Success!",
          message: `Welcome to the academy, ${formData.first_name}! Your profile is now pending coach approval. We will notify you once you are verified to access your Digital ID.`,
          type: 'success'
        });
        
        // ریست کردن فرم
        setFormData({ 
          email: '', password: '', first_name: '', last_name: '', 
          birth_date: '', weight_class: '', phone_number: '', gender: 'male' 
        });
      }
    }
    setLoading(false);
  };

  const inputStyle = "w-full bg-slate-50 border border-slate-200 text-slate-800 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner";

  return (
    <div className="relative">
      <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-[0_25px_60px_rgba(0,0,0,0.1)] relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-amber-500 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-amber-200 transform -rotate-3">
            <UserPlus size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">
            Join Academy
          </h2>
          <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">
            Auckland Elite Division
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email & Password */}
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="email"
                required
                placeholder="Email Address"
                className={inputStyle}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                value={formData.email}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="password"
                required
                placeholder="Create Password"
                className={inputStyle}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                value={formData.password}
              />
            </div>
          </div>

          {/* بقیه فیلدها دقیقاً مشابه کد قبلی شما... */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 uppercase font-black ml-2 tracking-widest flex items-center gap-2">
              <Users size={14} /> Select Gender
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['male', 'female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({...formData, gender: g})}
                  className={`py-3.5 rounded-2xl text-xs font-black uppercase italic transition-all border-2 ${
                    formData.gender === g 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="First Name"
              className="w-full bg-slate-50 border border-slate-100 text-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              value={formData.first_name}
            />
            <input
              required
              placeholder="Last Name"
              className="w-full bg-slate-50 border border-slate-100 text-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              value={formData.last_name}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 uppercase font-black ml-2 tracking-widest">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="date"
                required
                className={inputStyle}
                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                value={formData.birth_date}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="number"
                placeholder="Weight (kg)"
                className={inputStyle}
                onChange={(e) => setFormData({...formData, weight_class: e.target.value})}
                value={formData.weight_class}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="tel"
                placeholder="Mobile"
                className={inputStyle}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                value={formData.phone_number}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-amber-200 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase italic tracking-wider mt-6"
          >
            {loading ? "Creating Profile..." : "Complete Registration"}
          </button>
        </form>
      </div>

      {/* نمایش مودال خوش‌آمدگویی یا خطا */}
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

export default RegistrationForm;