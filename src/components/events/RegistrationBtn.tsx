import { CheckCircle2, Lock, Loader2, UserPlus } from 'lucide-react';

interface RegistrationBtnProps {
  isRegistered: boolean;
  currentUser: any;
  loading: boolean;
  onRegister: () => void;
}

const RegistrationBtn = ({ 
  isRegistered, 
  currentUser, 
  loading, 
  onRegister 
}: RegistrationBtnProps) => {
  
  // ۱. اگر کاربر قبلاً در این رویداد ثبت‌نام کرده باشد
  if (isRegistered) {
    return (
      <div className="w-full bg-emerald-500 text-white font-black py-5 rounded-[2rem] uppercase italic text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 animate-in fade-in zoom-in duration-300">
        <CheckCircle2 size={18} /> 
        Registered & Confirmed
      </div>
    );
  }

  // ۲. اگر کاربر وارد حساب کاربری خود نشده باشد
  if (!currentUser) {
    return (
      <div className="w-full bg-slate-100 text-slate-400 font-black py-5 rounded-[2rem] uppercase italic text-[10px] flex items-center justify-center gap-2 border border-dashed border-slate-300 tracking-widest">
        Login to Register {/* اصلاح شد: حذف کلمه Battle */}
      </div>
    );
  }

  // ۳. اگر کاربر لاگین کرده ولی هنوز توسط ادمین تایید (Verified) نشده است
  if (!currentUser.is_verified) {
    return (
      <div className="group relative w-full">
        <div className="w-full bg-slate-200 text-slate-400 font-black py-5 rounded-[2rem] uppercase italic text-[11px] flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300 transition-all">
          <Lock size={16} /> 
          Verification Required
        </div>
        {/* Tooltip راهنما */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-tighter shadow-xl">
          Complete membership to unlock events {/* اصلاح شد */}
        </div>
      </div>
    );
  }

  // ۴. حالت نهایی: کاربر تایید شده و می‌تواند در رویداد ثبت‌نام کند
  return (
    <button 
      onClick={onRegister}
      disabled={loading}
      className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-900 font-black py-5 rounded-[2rem] uppercase italic tracking-[0.2em] text-xs transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl hover:shadow-amber-500/20"
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" /> 
          Register for Event {/* اصلاح شد: تغییر از Match/Battle به Event */}
        </>
      )}
    </button>
  );
};

export default RegistrationBtn;