import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, Package, Loader2, RefreshCw, X, Check } from 'lucide-react';

const ProductManager = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '0',
    image_url: '',
    category: 'Gear'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity)
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', stock_quantity: '0', image_url: '', category: 'Gear' });
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Delete this product permanently?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase italic text-slate-900">Inventory</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Manage Academy Gear</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 font-black uppercase italic text-[10px] text-slate-400 tracking-widest">Product</th>
                  <th className="p-6 font-black uppercase italic text-[10px] text-slate-400 tracking-widest">Category</th>
                  <th className="p-6 font-black uppercase italic text-[10px] text-slate-400 tracking-widest">Stock</th>
                  <th className="p-6 font-black uppercase italic text-[10px] text-slate-400 tracking-widest">Price</th>
                  <th className="p-6 font-black uppercase italic text-[10px] text-slate-400 tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          {p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-bold text-slate-800 italic">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-6"><span className="text-[10px] font-black uppercase italic text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">{p.category}</span></td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.stock_quantity > 5 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className="font-black italic text-slate-700 text-sm">{p.stock_quantity}</span>
                      </div>
                    </td>
                    <td className="p-6 font-black italic text-slate-900">${p.price}</td>
                    <td className="p-6 text-right space-x-2">
                      <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-amber-500 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase italic">{editingProduct ? 'Edit Product' : 'New Gear'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase italic text-slate-400 ml-2">Name</label>
                <input required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase italic text-slate-400 ml-2">Price</label>
                <input required type="number" step="0.01" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase italic text-slate-400 ml-2">Stock</label>
                <input required type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase italic text-slate-400 ml-2">Image URL</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              </div>
              <button type="submit" className="col-span-2 bg-slate-900 text-white font-black py-5 rounded-2xl uppercase italic tracking-widest hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl">
                {editingProduct ? 'Save Changes' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;