import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Users, CheckCircle, XCircle, Search, Activity, 
  UserCheck, Clock, CreditCard, Save, Eye, Layers, 
  Calendar, Plus, Trash2, MapPin, Image as ImageIcon, UploadCloud, AlignLeft,
  FileDown // اضافه شدن آیکون خروجی گرفتن
} from 'lucide-react';
import Modal from '../components/Modal';

const AdminDashboard = () => {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'payments' | 'events'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // State for new event form
  const [newEvent, setNewEvent] = useState({ title: '', event_date: '', location: '', description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const planOrder = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'fortnightly', label: 'Fortnightly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'quarterly', label: 'Quarterly' },
    { key: 'semi_annual', label: 'Semi-Annual' },
    { key: 'annual', label: 'Annual' }
  ];

  const [plans, setPlans] = useState<any>({
    weekly: 0, fortnightly: 0, monthly: 0, quarterly: 0, semi_annual: 0, annual: 0
  });

  const [modal, setModal] = useState({
    isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // دریافت پلن‌های عضویت
      const { data: settings } = await supabase.from('site_settings').select('membership_plans').eq('id', 'membership_config').single();
      if (settings?.membership_plans) setPlans(settings.membership_plans);

      if (activeTab === 'payments') {
        const { data, error } = await supabase.from('payments').select('*, profiles:user_id (id, first_name, last_name)').order('created_at', { ascending: false });
        if (error) throw error;
        setPayments(data || []);
      } else if (activeTab === 'events') {
        const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
        if (error) throw error;
        setEvents(data || []);
      } else {
        const isVerifiedStatus = activeTab === 'verified';
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'wrestler').eq('is_verified', isVerifiedStatus).order('created_at', { ascending: false });
        if (error) throw error;
        setAthletes(data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let image_url = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('event-posters').getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      const { error } = await supabase.from('events').insert([{ ...newEvent, image_url }]);
      
      if (!error) {
        setModal({ isOpen: true, title: "Success", message: "Event deployed to the matrix.", type: 'success' });
        setNewEvent({ title: '', event_date: '', location: '', description: '' });
        setImageFile(null);
        fetchData();
      } else throw error;
    } catch (err: any) {
      setModal({ isOpen: true, title: "Error", message: err.message || "Failed to add event.", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // تابع جدید برای خروجی گرفتن از لیست ثبت‌نام کنندگان
  const downloadAttendees = async (eventId: string, eventTitle: string) => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('profiles(first_name, last_name, phone_number, weight_class)')
      .eq('event_id', eventId);

    if (error || !data) {
      alert("No registrations found.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Phone,Weight Class\n"
      + data.map((r: any) => `${r.profiles.first_name} ${r.profiles.last_name},${r.profiles.phone_number},${r.profiles.weight_class}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendees_${eventTitle}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const deleteEvent = async (id: string) => {
    if(!confirm("Are you sure you want to remove this event?")) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      setModal({ isOpen: true, title: "Deleted", message: "Event removed from schedule.", type: 'info' });
      fetchData();
    }
  };

  const updateMembershipPlans = async () => {
    const { error } = await supabase.from('site_settings').upsert({ id: 'membership_config', membership_plans: plans });
    if (!error) {
      setModal({ isOpen: true, title: "Matrix Synchronized", message: "Membership rates updated.", type: 'success' });
    }
  };

  const handlePaymentAction = async (paymentId: string, userId: string, status: 'completed' | 'failed') => {
    try {
      const { error: payError } = await supabase.from('payments').update({ status }).eq('id', paymentId);
      if (payError) throw payError;

      if (status === 'completed' && userId) {
        await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
      }

      setModal({ isOpen: true, title: "Matrix Updated", message: `Transaction ${status}.`, type: status === 'completed' ? 'success' : 'error' });
      fetchData();
    } catch (err: any) {
      setModal({ isOpen: true, title: "System Error", message: err.message, type: 'error' });
    }
  };

  const verifyAthlete = async (id: string, name: string) => {
    const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', id);
    if (!error) {
      setModal({ isOpen: true, title: "Verified", message: `${name} has been approved.`, type: 'success' });
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              Admin <span className="text-amber-500">Control</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              Membership Matrix & Finance
            </p>
          </div>

          <div className="bg-slate-200/50 p-1.5 rounded-[1.5rem] flex flex-wrap gap-2 w-fit border border-slate-200 shadow-sm">
            {[
              { id: 'pending', icon: <Clock size={14} />, label: 'Pending' },
              { id: 'verified', icon: <UserCheck size={14} />, label: 'Verified' },
              { id: 'payments', icon: <CreditCard size={14} />, label: 'Payments' },
              { id: 'events', icon: <Calendar size={14} />, label: 'Events' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Membership Matrix */}
        {activeTab !== 'events' && (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 mb-10 text-white shadow-2xl shadow-slate-400/20 border border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-amber-500 rounded-2xl text-slate-900 shadow-lg">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase italic tracking-tighter text-2xl leading-none">Membership Matrix</h3>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">Define flexible pricing for athletes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {planOrder.map((plan) => (
                <div key={plan.key} className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-amber-500 tracking-widest block ml-1">
                    {plan.label}
                  </label>
                  <input 
                    type="number" 
                    value={plans[plan.key] || 0}
                    onChange={(e) => setPlans({...plans, [plan.key]: Number(e.target.value)})}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-4 py-3 font-mono font-bold text-white outline-none focus:border-amber-500 transition-all text-sm"
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={updateMembershipPlans}
              className="w-full mt-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-black py-4 rounded-2xl uppercase italic tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
            >
              <Save size={18} /> Update Pricing Matrix
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden">
          {activeTab === 'events' ? (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <Calendar className="text-amber-500" size={24} />
                <h3 className="font-black uppercase italic text-slate-700 text-2xl tracking-tighter">Event Scheduler</h3>
              </div>

              {/* Event Form */}
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Event Title</label>
                  <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500" placeholder="e.g. Grand Slam 2026" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Date</label>
                  <input type="date" required value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Location</label>
                  <input type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500" placeholder="City or Arena" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Poster</label>
                  <label className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-amber-500 transition-colors">
                    <UploadCloud size={14} />
                    {imageFile ? <span className="truncate max-w-[100px]">{imageFile.name}</span> : "Select Image"}
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                  </label>
                </div>
                
                <div className="md:col-span-2 lg:col-span-4 space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2 flex items-center gap-1">
                    <AlignLeft size={12} /> Event Description & Details
                  </label>
                  <textarea 
                    rows={3}
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-amber-500 resize-none"
                    placeholder="Wrestling rules, weight categories, prizes..."
                  ></textarea>
                </div>

                <button type="submit" disabled={uploading} className="md:col-span-2 lg:col-span-4 bg-slate-900 text-white font-black py-4 rounded-xl uppercase italic tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {uploading ? "Deploying..." : <><Plus size={16} /> Deploy to Schedule</>}
                </button>
              </form>

              {/* Event Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <div key={event.id} className="flex flex-col p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-amber-200 transition-all group shadow-sm">
                    <div className="flex gap-4 items-start mb-4">
                      {event.image_url ? (
                          <img src={event.image_url} alt="poster" className="w-24 h-24 object-cover rounded-2xl shadow-md bg-slate-100" />
                      ) : (
                          <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-dashed border-slate-200"><ImageIcon size={28}/></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-slate-900 uppercase italic text-lg leading-tight">{event.title}</h4>
                          <div className="flex gap-1">
                            <button onClick={() => downloadAttendees(event.id, event.title)} className="p-2 text-slate-300 hover:text-amber-500 transition-colors" title="Download Attendees">
                              <FileDown size={18} />
                            </button>
                            <button onClick={() => deleteEvent(event.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5 uppercase"><Clock size={12}/> {event.event_date}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase"><MapPin size={12}/> {event.location || 'Location TBA'}</span>
                        </div>
                      </div>
                    </div>
                    {event.description && (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-slate-500 text-[11px] leading-relaxed whitespace-pre-wrap italic line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* بخش جدول برای سایر تب‌ها (Pending, Verified, Payments) */}
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-black uppercase italic text-slate-700 flex items-center gap-2 tracking-tighter">
                  <Activity className="text-amber-500" size={20} /> 
                  {activeTab === 'payments' ? 'Financial Ledger' : 'Member Directory'}
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-amber-500 w-48 md:w-64 transition-all"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {activeTab === 'payments' ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Athlete</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Amount</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Slip</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {payments.filter(p => `${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6">
                            <p className="font-black text-slate-900 uppercase italic leading-none">{pay.profiles ? `${pay.profiles.first_name} ${pay.profiles.last_name}` : 'Unknown'}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{new Date(pay.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="p-6 text-center">
                            <p className="font-black text-slate-900 text-sm">${pay.amount}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{pay.payment_method?.replace('_', ' ')}</p>
                          </td>
                          <td className="p-6 text-center">
                            {pay.receipt_url ? (
                              <a href={pay.receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-600 font-black text-[10px] uppercase transition-colors"><Eye size={14} /> View Slip</a>
                            ) : <span className="text-[9px] text-slate-300 font-bold uppercase italic">No Slip</span>}
                          </td>
                          <td className="p-6 text-center">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${pay.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : pay.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{pay.status}</span>
                          </td>
                          <td className="p-6 text-center">
                            <div className="flex justify-center gap-2">
                              {pay.status === 'pending' && (
                                <>
                                  <button onClick={() => handlePaymentAction(pay.id, pay.user_id, 'completed')} className="p-2 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-emerald-100"><CheckCircle size={16} /></button>
                                  <button onClick={() => handlePaymentAction(pay.id, pay.user_id, 'failed')} className="p-2 bg-red-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-red-100"><XCircle size={16} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Athlete Profile</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Weight Class</th>
                        <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {athletes.filter(a => `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((athlete) => (
                        <tr key={athlete.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-6">
                            <p className="font-black text-slate-900 uppercase italic leading-none">{athlete.first_name} {athlete.last_name}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">{athlete.phone_number}</p>
                          </td>
                          <td className="p-6 font-black text-slate-700 italic uppercase">{athlete.weight_class} <small className="text-[9px] not-italic">KG</small></td>
                          <td className="p-6 text-center">
                            {!athlete.is_verified && (
                              <button onClick={() => verifyAthlete(athlete.id, athlete.first_name)} className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-xl active:scale-95">
                                <UserCheck size={14} className="inline mr-2" /> Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Modal isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false })} title={modal.title} message={modal.message} type={modal.type} />
    </div>
  );
};

export default AdminDashboard;