import { useState } from 'react';
import { Calendar, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const EventCard = ({ event }: { event: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">No Poster</div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-600">
          Upcoming
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">{event.title}</h3>
        
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <Calendar size={14} className="text-amber-500" /> {event.event_date}
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <MapPin size={14} className="text-amber-500" /> {event.location}
          </div>
        </div>

        {/* بخش توضیحات که با کلیک ظاهر می‌شود */}
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-4 border-t border-slate-100 mt-4 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic">
            {event.description || "No additional details provided for this event."}
          </div>
        </div>

        <div className="mt-4 flex justify-center text-slate-300">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
    </div>
  );
};