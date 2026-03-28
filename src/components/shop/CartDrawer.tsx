import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartDrawer = () => {
  const { cartItems, removeFromCart, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
            <ShoppingBag className="text-amber-500" /> Your Bag
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 font-black uppercase italic text-sm tracking-widest">Bag is Empty</p>
            </div>
          ) : (
            cartItems.map((item: any) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-grow">
                  <h4 className="font-black uppercase italic text-sm text-slate-800 leading-tight">{item.name}</h4>
                  <p className="text-amber-600 font-black italic text-xs mt-1">${item.price} x {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 font-black uppercase italic text-[10px] tracking-widest">Total Amount</span>
              <span className="text-3xl font-black italic text-slate-900">${totalPrice.toFixed(2)}</span>
            </div>
            <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase italic tracking-widest hover:bg-amber-500 hover:text-slate-900 transition-all flex items-center justify-center gap-3 shadow-xl">
              Checkout Now <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;