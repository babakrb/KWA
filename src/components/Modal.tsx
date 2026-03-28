import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const Modal = ({ isOpen, onClose, title, message, type = 'info' }: ModalProps) => {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle className="text-emerald-500" size={40} />,
    error: <AlertTriangle className="text-red-500" size={40} />,
    info: <Info className="text-amber-500" size={40} />
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 p-4 bg-slate-50 rounded-3xl">
            {iconMap[type]}
          </div>
          
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">
            {title}
          </h3>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all active:scale-95 uppercase italic tracking-widest text-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;