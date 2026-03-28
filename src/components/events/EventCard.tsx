import { 
  Calendar, MapPin, Info, ChevronDown, 
  ChevronUp, Trophy, CheckCircle2, Lock, Loader2 
} from 'lucide-react';

interface EventCardProps {
  event: any;
  isRegistered: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRegister: (id: string) => void;
  currentUser: any;
  loading: boolean;
}

const EventCard = ({ 
  event, 
  isRegistered, 
  isExpanded, 
  onToggleExpand, 
  onRegister, 
  currentUser,
  loading 
}: EventCardProps) => {
  
  const isVerified = currentUser?.is_verified;

  return (
    <div 
      className={`group relative bg-slate-50 rounded-[3rem] border-2 transition-all duration-500 overflow-hidden ${
        isExpanded ? 'border-amber-500 shadow-2xl scale-[1.02]' : 'border-transparent hover:border-slate-200 shadow-sm'
      }`}
    >
      {/* بخش تصویر پوستر */}
      <div 
        className="relative h-60 overflow-hidden cursor-pointer"
        onClick={onToggleExpand}
      >
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            <Trophy size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-8 text-white">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-1">Official Event</p>
           <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{event.title}</h3>
        </div>
      </div>

      {/* محتوای متنی */}
      <div className="p-10">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-widest">
            <Calendar size={16} className="text-amber-500" /> {event.event_date}
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-widest">
            <MapPin size={16} className="text-amber-500" /> {event.location}
          </div>
        </div>

        {/* منطق دکمه‌های اکشن */}
        <div className="space-y-4">
          {isRegistered ? (
            <div className="w-full bg-emerald-500 text-white font-black py-5 rounded-[2rem] uppercase italic text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
              <CheckCircle2 size={18} /> You are in the list
            </div>
          ) : currentUser ? (
            isVerified ? (
              <button 
                onClick={() => onRegister(event.id)}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-900 font-black py-5 rounded-[2rem] uppercase italic tracking-[0.2em] text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Register for Battle"}
              </button>
            ) : (
              <div className="w-full bg-slate-200 text-slate-400 font-black py-5 rounded-[2rem] uppercase italic text-[11px] flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300">
                <Lock size={16} /> Verification Required
              </div>
            )
          ) : (
            <div className="w-full bg-slate-100 text-slate-400 font-black py-5 rounded-[2rem] uppercase italic text-[11px] flex items-center justify-center gap-2 border border-dashed border-slate-300">
               Login to Register
            </div>
          )}

          {/* دکمه نمایش جزئیات */}
          <button 
            onClick={onToggleExpand}
            className="w-full text-center text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors flex items-center justify-center gap-1"
          >
            {isExpanded ? "Show Less" : "Details & Description"}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* بخش توضیحات بازشونده */}
        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96 mt-8 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-amber-500">
              <Info size={16} />
              <span className="text-[10px] font-black uppercase">About this Match</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed italic whitespace-pre-wrap">
              {event.description || "No additional information provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;