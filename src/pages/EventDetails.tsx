import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Info, ArrowLeft, Download, Loader2, CheckCircle2, Lock, Trophy } from 'lucide-react';
import defaultPoster from '../assets/poster.png';

const EventDetails = ({ currentUser }: { currentUser: any }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      try {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        if (currentUser) {
          const { data: registration } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('event_id', id)
            .eq('user_id', currentUser.id);
          
          if (registration && registration.length > 0) {
            setIsRegistered(true);
          }
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, currentUser]);

  const handleDownloadPoster = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Poster_${title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("خطا در دانلود پوستر اختصاصی.");
    }
  };

  const handleRegister = async () => {
    if (!currentUser) return;
    setRegistering(true);
    const { error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: id, user_id: currentUser.id }]);
    
    if (!error) setIsRegistered(true);
    setRegistering(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (!event) return <div className="text-center py-20 font-black uppercase italic text-slate-400">Event not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase italic text-xs mb-8 transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Academy
        </button>

        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
          
          {/* Hero Section - Fixed Default Background with Half Height */}
          <div className="h-[280px] relative overflow-hidden bg-slate-900">
            <img 
              src={defaultPoster} 
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" 
              alt="KWA Academy" 
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 pointer-events-none"></div>
            
            {/* Event Title on Hero */}
            <div className="absolute bottom-10 left-12 right-12">
              <span className="text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Academy Event</span>
              <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-xl">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-10">
              <section>
                <h4 className="text-amber-500 font-black uppercase italic text-xs mb-6 flex items-center gap-2 tracking-widest underline decoration-2 underline-offset-8">
                  <Info size={18} /> Detailed Information
                </h4>
                <p className="text-slate-600 text-lg leading-relaxed italic whitespace-pre-wrap text-justify">
                  {event.description || "No specific details provided for this event. Please contact coaching staff for more info."}
                </p>
              </section>
            </div>

            {/* Sidebar with Controls */}
            <aside className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-8">
                
                {/* Event Metadata */}
                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4 text-slate-700 font-black uppercase italic text-xs tracking-widest">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500"><Calendar size={20} /></div>
                    {event.event_date}
                  </div>
                  <div className="flex items-center gap-4 text-slate-700 font-black uppercase italic text-xs tracking-widest">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-amber-500"><MapPin size={20} /></div>
                    {event.location}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* دکمه دانلود پوستر اختصاصی (فقط در صورت وجود نمایش داده می‌شود) */}
                  {event.image_url && (
                    <button 
                      onClick={() => handleDownloadPoster(event.image_url, event.title)}
                      className="w-full bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white font-black py-4 rounded-2xl uppercase italic text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download size={18} /> Download Official Poster
                    </button>
                  )}

                  {/* دکمه‌های ثبت‌نام */}
                  {isRegistered ? (
                    <div className="w-full bg-emerald-500 text-white font-black py-5 rounded-2xl uppercase italic text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                      <CheckCircle2 size={18} /> Registered Successfully
                    </div>
                  ) : currentUser ? (
                    currentUser.is_verified ? (
                      <button 
                        onClick={handleRegister}
                        disabled={registering}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-5 rounded-2xl uppercase italic tracking-[0.1em] text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
                      >
                        {registering ? <Loader2 className="animate-spin" size={18} /> : "Secure My Spot"}
                      </button>
                    ) : (
                      <div className="w-full bg-slate-200 text-slate-400 font-black py-5 rounded-2xl uppercase italic text-[10px] flex items-center justify-center gap-2 cursor-not-allowed">
                        <Lock size={16} /> Identity Not Verified
                      </div>
                    )
                  ) : (
                    <button 
                      onClick={() => navigate('/login')} 
                      className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase italic text-xs shadow-lg"
                    >
                      Login to Join Event
                    </button>
                  )}
                </div>

              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;