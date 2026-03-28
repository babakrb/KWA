import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';

interface Props {
  currentUser: any; 
}

const EventsSection = ({ currentUser }: Props) => {
  const [events, setEvents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (!error && data) setEvents(data);
  };

  return (
    <section id="events-section" className="py-24 bg-white min-h-[400px]">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Title Header */}
        <div className="mb-16">
          <h2 className="text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Upcoming <span className="text-amber-500">Events</span>
          </h2>
          <div className="h-2 w-32 bg-slate-900 mt-4 rounded-full"></div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.length > 0 ? (
            events.map((event) => (
              <div 
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="group cursor-pointer relative bg-slate-50 rounded-[2.5rem] p-8 border-2 border-transparent hover:border-amber-500 hover:bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Decorative Icon */}
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                    <Trophy size={28} />
                  </div>
                  <div className="p-2 rounded-full bg-slate-100 text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </div>
                </div>

                {/* Event Title */}
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800 mb-4 group-hover:text-amber-500 transition-colors">
                  {event.title}
                </h3>
                
                {/* Minimal Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Calendar size={16} className="text-amber-500" /> 
                    {event.event_date}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <MapPin size={16} className="text-amber-500" /> 
                    {event.location}
                  </div>
                </div>

                {/* Subtle "Click for Details" text */}
                <div className="mt-8 pt-6 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-amber-600 text-[9px] font-black uppercase tracking-widest italic">View Details & Register</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-black uppercase italic tracking-widest">No scheduled events at this moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;