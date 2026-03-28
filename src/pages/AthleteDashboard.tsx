import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Trophy, Calendar, ShieldCheck, Clock, Edit2, Save, X, 
  User, CreditCard, CheckCircle, Upload, Wallet, ChevronUp, 
  FileText, ExternalLink, AlertCircle, History, Mail, Phone, Hash
} from 'lucide-react';
import AvatarUpload from '../components/AvatarUpload';

const AthleteDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showMembership, setShowMembership] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [plans, setPlans] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  const [modalConfig, setModalConfig] = useState<{show: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    show: false, type: 'info', title: '', message: ''
  });

  const [editForm, setEditForm] = useState({
    first_name: '', last_name: '', gender: '',
    weight_class: '', phone_number: '', height: '', wrestling_style: '', birth_date: '',
    guardian_name: '', guardian_phone: '', guardian_email: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchMembershipPlans();
    fetchPaymentHistory();
  }, []);

  const showMsg = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setModalConfig({ show: true, type, title, message });
  };

  const fetchMembershipPlans = async () => {
    const { data } = await supabase.from('site_settings').select('membership_plans').eq('id', 'membership_config').single();
    if (data) setPlans(data.membership_plans);
  };

  const fetchPaymentHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setPaymentHistory(data);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (!error && data) {
          setProfile(data);
          setEditForm({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            gender: data.gender || '',
            weight_class: data.weight_class || '', 
            phone_number: data.phone_number || '',
            height: data.height || '', 
            wrestling_style: data.wrestling_style || 'Freestyle',
            birth_date: data.birth_date || '', 
            guardian_name: data.guardian_name || '',
            guardian_phone: data.guardian_phone || '', 
            guardian_email: data.guardian_email || ''
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('profiles').update(editForm).eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      showMsg('success', 'Profile Updated', 'Your information has been saved successfully.');
    } else {
      showMsg('error', 'Update Failed', error.message);
    }
    setIsSaving(false);
  };

  const handlePayment = async () => {
    if (!plans || !profile) return;
    setIsSaving(true);
    try {
      let receiptUrl = null;
      let finalMethod = paymentMethod === 'online' ? 'stripe' : 'cash';

      if (paymentMethod === 'cash' && receiptFile) {
        finalMethod = 'bank_transfer';
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('payments-receipts').upload(fileName, receiptFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('payments-receipts').getPublicUrl(fileName);
        receiptUrl = publicUrl;
      }

      const txId = `NZD-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
      
      const { error: dbError } = await supabase.from('payments').insert([{
        user_id: profile.id, 
        amount: plans[selectedPlan],
        payment_method: finalMethod,
        status: 'pending', 
        transaction_id: txId, 
        receipt_url: receiptUrl,
        created_at: new Date().toISOString()
      }]);

      if (dbError) throw dbError;

      showMsg('success', 'Payment Submitted', `Your request (ID: ${txId}) is pending review.`);
      setShowMembership(false);
      setReceiptFile(null);
      fetchPaymentHistory();
    } catch (error: any) {
      showMsg('error', 'Payment Error', error.message || 'An error occurred during payment.');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const currentAge = calculateAge(profile?.birth_date || editForm.birth_date);
  const isMinor = currentAge !== null && currentAge < 18;
  const isVerified = profile?.is_verified === true;

  const planLabels = [
    { key: 'weekly', label: 'Weekly' }, { key: 'fortnightly', label: 'Fortnightly' },
    { key: 'monthly', label: 'Monthly' }, { key: 'quarterly', label: 'Quarterly' },
    { key: 'semi_annual', label: '6 Months' }, { key: 'annual', label: 'Annual' }
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      
      {/* MODAL SYSTEM */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-white">
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-3xl mb-6 ${modalConfig.type === 'success' ? 'bg-emerald-100 text-emerald-600' : modalConfig.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                {modalConfig.type === 'success' ? <CheckCircle size={40} /> : modalConfig.type === 'error' ? <AlertCircle size={40} /> : <ShieldCheck size={40} />}
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">{modalConfig.title}</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">{modalConfig.message}</p>
              <button onClick={() => setModalConfig({...modalConfig, show: false})} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="h-48 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        
        {/* PENDING VERIFICATION ALERT */}
        {!isVerified && (
          <div className="mb-6 flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 leading-none mb-1">Account Pending Verification</p>
              <p className="text-xs font-bold text-amber-700">Your profile is waiting for admin approval. Membership plans will be available once verified.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: ATHLETE CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 p-8 border border-white relative">
              
              <div className="absolute top-8 right-8">
                {isVerified ? (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                    <CheckCircle size={10} />
                    <span className="text-[8px] font-black uppercase">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-100 text-slate-400 px-3 py-1 rounded-full border border-slate-200">
                    <Clock size={10} />
                    <span className="text-[8px] font-black uppercase">Pending</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center">
                <AvatarUpload userId={profile?.id} currentUrl={profile?.photo_url} onUploadSuccess={(url) => setProfile({...profile, photo_url: url})} />
                <div className="text-center mt-6">
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">
                    {profile?.first_name} <br />
                    <span className="text-amber-500">{profile?.last_name}</span>
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 lowercase tracking-wider flex items-center justify-center gap-1">
                    <Mail size={10} /> {userEmail}
                  </p>
                </div>
              </div>

              {/* ALL ATHLETE DETAILS DISPLAYED HERE */}
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest block mb-1">Weight</span>
                    <p className="text-sm font-black italic">{profile?.weight_class || '--'} <small className="text-[8px]">KG</small></p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest block mb-1">Height</span>
                    <p className="text-sm font-black italic">{profile?.height || '--'} <small className="text-[8px]">CM</small></p>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1"><Trophy size={10}/> Style</span>
                      <span className="text-[10px] font-bold text-slate-700">{profile?.wrestling_style || 'Freestyle'}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1"><User size={10}/> Gender</span>
                      <span className="text-[10px] font-bold text-slate-700">{profile?.gender || '--'}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1"><Calendar size={10}/> Birth</span>
                      <span className="text-[10px] font-bold text-slate-700">{profile?.birth_date || '--'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1"><Phone size={10}/> Phone</span>
                      <span className="text-[10px] font-bold text-slate-700">{profile?.phone_number || '--'}</span>
                   </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button onClick={() => {setIsEditing(!isEditing); setShowMembership(false); setShowHistory(false);}} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg">
                    {isEditing ? <><X size={14}/> Cancel</> : <><Edit2 size={14}/> Edit Profile</>}
                  </button>
                  
                  {!isEditing && (
                    <>
                      <button 
                        disabled={!isVerified}
                        onClick={() => {setShowMembership(!showMembership); setShowHistory(false);}} 
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 shadow-lg ${!isVerified ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : (showMembership ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-100 hover:bg-amber-50')}`}
                      >
                        {showMembership ? <><ChevronUp size={14}/> Close Plans</> : <><CreditCard size={14}/> Membership Plans</>}
                      </button>

                      <button onClick={() => {setShowHistory(!showHistory); setShowMembership(false);}} className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${showHistory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'} shadow-lg`}>
                        {showHistory ? <><ChevronUp size={14}/> Close History</> : <><History size={14}/> Payment History</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* EDITING FORM SECTION */}
            {isEditing && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-white animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg"><User size={20} /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Edit Your Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">First Name</label>
                    <input value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Last Name</label>
                    <input value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Phone Number</label>
                    <input value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Birth Date</label>
                    <input type="date" value={editForm.birth_date} onChange={e => setEditForm({...editForm, birth_date: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  
                  {/* Physical Info */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Weight (KG)</label>
                    <input type="number" value={editForm.weight_class} onChange={e => setEditForm({...editForm, weight_class: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Height (CM)</label>
                    <input type="number" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Gender</label>
                    <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all appearance-none">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Wrestling Style</label>
                    <select value={editForm.wrestling_style} onChange={e => setEditForm({...editForm, wrestling_style: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all appearance-none">
                      <option value="Freestyle">Freestyle</option>
                      <option value="Greco-Roman">Greco-Roman</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8 mb-8">
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
                    <ShieldCheck size={16} /> Guardian Information {isMinor && <span className="text-red-500">(Required)</span>}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Guardian Name</label>
                      <input value={editForm.guardian_name} onChange={e => setEditForm({...editForm, guardian_name: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Guardian Phone</label>
                      <input value={editForm.guardian_phone} onChange={e => setEditForm({...editForm, guardian_phone: e.target.value})} className="w-full rounded-2xl py-4 px-6 font-bold bg-slate-50 border-2 border-amber-100 focus:border-amber-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <button onClick={handleUpdateProfile} disabled={isSaving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] py-6 rounded-[2rem] transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-100">
                  {isSaving ? 'Saving...' : <><Save size={20} /> Save All Changes</>}
                </button>
              </div>
            )}

            {/* MEMBERSHIP SECTION */}
            {showMembership && !isEditing && isVerified && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-white animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200"><Trophy size={20} /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Choose Your Plan</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {planLabels.map((plan) => (
                    <button key={plan.key} onClick={() => setSelectedPlan(plan.key)} className={`relative p-5 rounded-[1.5rem] border-2 transition-all text-left ${selectedPlan === plan.key ? 'border-amber-500 bg-amber-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                      {selectedPlan === plan.key && <CheckCircle size={16} className="absolute top-3 right-3 text-amber-500" />}
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{plan.label}</p>
                      <p className="text-lg font-black italic text-slate-900">${plans ? plans[plan.key] : '...'}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Payment Method</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex gap-4">
                      <button onClick={() => {setPaymentMethod('online'); setReceiptFile(null);}} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${paymentMethod === 'online' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>Online</button>
                      <button onClick={() => {setPaymentMethod('cash'); setReceiptFile(null);}} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${paymentMethod === 'cash' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>Cash/Transfer</button>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                        <label className="flex items-center gap-3 cursor-pointer bg-white border-2 border-dashed border-slate-200 p-3 rounded-xl hover:border-amber-500 transition-all group">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-colors">
                            {receiptFile ? <FileText size={16} className="text-amber-600" /> : <Upload size={16} className="text-slate-400" />}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Receipt (Optional for Cash)</p>
                            <p className="text-[10px] font-bold text-slate-600 truncate">{receiptFile ? receiptFile.name : 'Upload Screenshot'}</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={handlePayment} disabled={isSaving} className={`w-full font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-xl group ${isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-100'}`}>
                  {isSaving ? <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <><Wallet size={20} /> Submit Payment (${plans?.[selectedPlan]} NZD)</>}
                </button>
              </div>
            )}

            {/* PAYMENT HISTORY SECTION */}
            {showHistory && !isEditing && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 border border-white animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-slate-900 rounded-xl text-white"><Clock size={20} /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Transaction Records</h3>
                </div>
                <div className="space-y-3">
                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions found</p>
                    </div>
                  ) : (
                    paymentHistory.map((pay) => (
                      <div key={pay.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-slate-100 gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${pay.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : pay.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black italic text-slate-900">${pay.amount}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${pay.status === 'verified' ? 'bg-emerald-500 text-white' : pay.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                                {pay.status}
                              </span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                              {new Date(pay.created_at).toLocaleDateString()} • {pay.transaction_id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto md:ml-0">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mr-2">
                            {pay.payment_method?.replace('_', ' ')}
                          </span>
                          
                          {pay.payment_method === 'bank_transfer' && pay.receipt_url && (
                            <div className="flex items-center gap-2">
                              <a 
                                href={pay.receipt_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
                                title="View Receipt"
                              >
                                <ExternalLink size={14} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* GUARDIAN DISPLAY */}
            {isMinor && !isEditing && !showMembership && !showHistory && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg"><User size={20} className="text-amber-600" /></div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Guardian Info</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Name</p>
                    <p className="font-bold text-slate-700">{profile?.guardian_name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Phone</p>
                    <p className="font-bold text-slate-700">{profile?.guardian_phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* DEFAULT VIEW: TRAINING PLAN */}
            {!isEditing && !showMembership && !showHistory && (
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden animate-in fade-in duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]"><Calendar size={140} /></div>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2"><Calendar size={16} /> Training Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col p-5 rounded-2xl bg-slate-50 border border-slate-100 border-l-4 border-l-amber-500">
                    <span className="text-xs font-black uppercase italic text-slate-800 tracking-wider">Saturday</span>
                    <span className="text-sm font-black text-slate-900 mt-2">11:00 - 13:00</span>
                  </div>
                  <div className="flex flex-col p-5 rounded-2xl bg-slate-50 border border-slate-100 border-l-4 border-l-amber-500">
                    <span className="text-xs font-black uppercase italic text-slate-800 tracking-wider">Sunday</span>
                    <span className="text-sm font-black text-slate-900 mt-2">10:00 - 13:00</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;