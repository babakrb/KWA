import { ShoppingBag, Zap } from 'lucide-react';

interface ProductCardProps {
  product: any;
  onAddToCart?: (product: any) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-slate-50 mb-6">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            alt={product.name} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase font-black italic text-xs tracking-widest">No Image</div>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-amber-500 px-4 py-2 rounded-2xl font-black italic text-sm shadow-xl">
          ${product.price}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black uppercase italic text-[10px] tracking-widest shadow-2xl">Sold Out</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-500 font-black uppercase italic text-[8px] tracking-[0.2em]">{product.category || 'General'}</span>
          {product.stock_quantity < 5 && !isOutOfStock && (
            <span className="flex items-center gap-1 text-red-500 font-black uppercase text-[8px] animate-pulse">
              <Zap size={10} fill="currentColor" /> Limited Stock
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-black uppercase italic text-slate-800 mb-2 leading-none group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-xs italic mb-6 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <button 
          onClick={() => onAddToCart?.(product)}
          disabled={isOutOfStock}
          className={`mt-auto w-full py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95
            ${isOutOfStock 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-900 shadow-slate-200'}`}
        >
          <ShoppingBag size={14} /> {isOutOfStock ? 'Waitlist' : 'Add to Bag'}
    
    
    
    
        </button>


        <button 
            onClick={() => addToCart(product)} // اینجا تابع را صدا بزنید
            className="mt-4 w-full py-3 rounded-xl font-black uppercase italic text-[10px] tracking-[0.2em] bg-amber-500 text-slate-900 hover:bg-slate-900 hover:text-amber-500 transition-colors shadow-lg"    
              >
              Add to Bag
        </button>


      </div>
    </div>

    

  );
};

export default ProductCard;