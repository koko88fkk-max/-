
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-[#0d1117] border border-[#1e3a5f]/20 rounded-xl p-5 hover:border-[#1e3a5f]/60 transition-all group shadow-lg shadow-black/40">
      <div className="flex gap-4 mb-4">
        {product.image && (
          <div className="w-12 h-12 shrink-0 rounded-lg bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 flex items-center justify-center p-2 group-hover:bg-[#1e3a5f]/10 transition-colors">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain filter invert opacity-80 group-hover:opacity-100" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-[15px] font-bold text-white group-hover:text-[#1e3a5f] transition-colors leading-tight">
              {product.name}
            </h3>
          </div>
          <span className="inline-block mt-1 text-[#1e3a5f] text-[11px] font-bold uppercase tracking-wider">
            {product.price}
          </span>
        </div>
      </div>
      
      <ul className="space-y-1.5 mb-4">
        {product.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-[13px] text-zinc-400">
            <span className="w-1 h-1 mt-1.5 bg-[#1e3a5f] rounded-full ml-2 shrink-0"></span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-[#1e3a5f]/10 space-y-1.5">
        <p className="text-[11px] text-zinc-500">
          <span className="text-zinc-300 font-medium">الدعم: </span>
          {product.support}
        </p>
        <p className="text-[11px] text-zinc-500">
          <span className="text-zinc-300 font-medium">التسليم: </span>
          {product.delivery}
        </p>
      </div>
      
      <a 
        href={product.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-4 block w-full bg-[#1e3a5f]/10 hover:bg-[#1e3a5f] border border-[#1e3a5f]/30 text-white text-[13px] text-center py-2 rounded-lg font-bold transition-all shadow-lg shadow-[#1e3a5f]/5"
      >
        اطلب الآن
      </a>
    </div>
  );
};

export default ProductCard;
