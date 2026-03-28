import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Loader2, Package, ArrowRight, Zap } from 'lucide-react';

const ShopSection = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      
      if (!error) setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col mb-16">
          <span className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px] italic mb-2">KWA Official Gear</span>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">Academy Shop</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <div key={product.id} className="group relative flex flex-col">
              {/* Image Box */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100 mb-6 border border-slate-50">
                {product.image_url ? (
                  <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={40} /></div>
                )}
                
                {/* Badge برای موجودی کم */}
                {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded shadow-lg animate-pulse">
                    Low Stock
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-400 font-black uppercase italic text-[9px] tracking-widest">{product.category}</span>
                  <span className="text-slate-900 font-black italic text-sm">${product.price}</span>
                </div>
                <h3 className="text-xl font-black uppercase italic text-slate-800 mb-2 leading-none">{product.name}</h3>
                <p className="text-slate-500 text-xs italic mb-6 line-clamp-2">{product.description}</p>
                
                {/* Button */}
                <button 
                  disabled={product.stock_quantity === 0}
                  className={`mt-auto w-full py-4 rounded-xl font-black uppercase italic text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 
                    ${product.stock_quantity === 0 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 shadow-xl active:scale-95'}`}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : <><ShoppingBag size={14} /> Add to Bag</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;