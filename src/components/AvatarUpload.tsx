import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Loader2, User } from 'lucide-react';
import Modal from './Modal';

interface Props {
  userId: string;
  onUploadSuccess: (url: string) => void;
  currentUrl?: string;
}

const AvatarUpload = ({ userId, onUploadSuccess, currentUrl }: Props) => {
  const [uploading, setUploading] = useState(false);
  
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error' as 'success' | 'error' | 'info'
  });

  const uploadPhoto = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // استفاده از Timestamp برای جلوگیری از خطای تداخل فایل و مشکلات کش مرورگر
      const fileName = `${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // ۱. آپلود به Storage (مطمئن شوید نام باکت دقیقاً 'avatars' است)
     const { error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(fileName, file, { 
    cacheControl: '3600',
    upsert: true 
  });

      if (uploadError) {
        // اگر خطا از RLS بود، پیام واضح‌تری بدهیم
        if (uploadError.message === "new row violates row-level security policy") {
          throw new Error("Permission denied. Ensure Storage Policies for 'INSERT' and 'UPDATE' are set to 'true' or 'public' in Supabase.");
        }
        throw uploadError;
      }

      // ۲. دریافت URL عمومی
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // ۳. بروزرسانی جدول profiles در ستون photo_url
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // ۴. موفقیت
      onUploadSuccess(publicUrl);
      setModal({
        isOpen: true,
        title: "Success",
        message: "Profile picture updated successfully!",
        type: 'success'
      });

    } catch (error: any) {
      console.error("Full Error details:", error);
      setModal({
        isOpen: true,
        title: "Upload Error",
        message: error.message,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="relative group">
          {/* نمایش تصویر با افکت مدرن */}
          <div className="w-36 h-36 rounded-[3rem] bg-slate-800 border-4 border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center transform group-hover:scale-105 transition-all duration-500">
            {currentUrl ? (
              <img 
                src={`${currentUrl}?t=${new Date().getTime()}`} // جلوگیری از کش شدن تصویر قدیمی توسط مرورگر
                alt="Athlete" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User size={40} className="text-slate-600" />
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            )}
          </div>
          
          <label className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-600 text-white p-3.5 rounded-2xl cursor-pointer shadow-xl transition-all active:scale-90 border-4 border-slate-900">
            <Camera size={18} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={uploadPhoto}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </>
  );
};

export default AvatarUpload;
