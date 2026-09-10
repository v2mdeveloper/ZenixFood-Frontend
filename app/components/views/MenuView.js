export default function MenuView({
  isStoreOpen, storeSettings, highlights, currentSlide, setCurrentSlide,
  handleOpenProductModal, menu, renderProductBadges, isTotemMode
}) {
  return (
    <div className="animate-fade-in">
      {!isStoreOpen && (
        <div className="bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-white/5 p-8 rounded-3xl mb-8 text-center flex flex-col items-center shadow-xl relative overflow-hidden transition-colors">
          <span className="text-6xl mb-4 grayscale">💤</span>
          <h3 className="font-black text-2xl tracking-tight text-slate-800 dark:text-white mb-1">Nossa grelha está descansando...</h3>
          <p className="text-sm mt-2 max-w-md text-slate-500 dark:text-zinc-400">Você pode dar uma olhada no nosso cardápio. Para itens sob encomenda (ex: Costela), o agendamento continua liberado!</p>
        </div>
      )}

      {storeSettings?.promoBannerUrl && (
        <div className="mb-10 w-full relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-amber-500/20 transition-all cursor-pointer border border-transparent dark:border-white/5">
          {storeSettings.promoBannerLink ? (
            <a href={storeSettings.promoBannerLink} target="_blank" rel="noopener noreferrer" className="block w-full">
              <img src={storeSettings.promoBannerUrl} alt="Promoção Especial" className="w-full h-auto object-cover max-h-[400px]" />
            </a>
          ) : (
            <img src={storeSettings.promoBannerUrl} alt="Promoção Especial" className="w-full h-auto object-cover max-h-[400px]" />
          )}
        </div>
      )}

      {highlights.length > 0 && (
        <section className="mb-12 relative overflow-hidden rounded-3xl shadow-2xl bg-slate-900 dark:bg-[#121212] border border-slate-800 dark:border-white/5">
          <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-widest z-20 shadow-md">Chef's Choice</div>
          <div className="relative h-72 md:h-96 w-full overflow-hidden">
            {highlights.map((prod, index) => {
              const isCostela = prod.name.toLowerCase().includes('costela');
              const canAdd = isStoreOpen || isCostela;
              return (
              <div key={prod.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                {prod.imageUrl ? (
                  <><img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover opacity-70 dark:opacity-60 transition-transform duration-1000 scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div></>
                ) : <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black"></div>}
                
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg tracking-tight">{prod.name}</h2>
                  <p className="text-zinc-200 text-sm md:text-base mb-6 line-clamp-2 drop-shadow-md font-medium">{prod.description}</p>
                  
                  <div className="flex items-center gap-5">
                    <button 
                       onClick={() => handleOpenProductModal(prod)}
                       className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-sm transition-all active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      {canAdd ? (isCostela ? '📅 Agendar Encomenda' : '🛒 Eu Quero!') : '🔒 Fechado'}
                    </button>
                    <span className="text-2xl md:text-3xl font-black text-amber-400 drop-shadow-md">R$ {Number(prod.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>
          {highlights.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex gap-2">
              {highlights.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-amber-500 w-8' : 'bg-white/40 w-2 cursor-pointer hover:bg-white/80'}`} />))}
            </div>
          )}
        </section>
      )}

      {menu.map((category) => (
        <section key={category.id} className="mb-14">
          <div className="flex items-center gap-4 mb-6">
             <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest">{category.name}</h2>
             <div className="h-px bg-gradient-to-r from-slate-300 dark:from-white/20 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((product) => {
              const isCostela = product.name.toLowerCase().includes('costela');
              const canAdd = isStoreOpen || isCostela;
              return (
              <div 
                key={product.id} 
                onClick={() => handleOpenProductModal(product)}
                className="group bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/5 rounded-3xl hover:border-amber-500 dark:hover:border-amber-500/50 transition-all duration-500 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden cursor-pointer active:scale-[0.98]"
              >
                {product.imageUrl && (
                  <div className="h-56 w-full overflow-hidden bg-slate-100 dark:bg-black/50 relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-slate-900 dark:text-white text-sm shadow-lg border border-white/20">
                       R$ {Number(product.price).toFixed(2)}
                    </div>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                     <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors pr-2 leading-tight">{product.name}</h3>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed font-medium line-clamp-2 mb-4">{product.description}</p>
                  
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex gap-1.5">{renderProductBadges(product.name)}</div>
                    {!product.imageUrl && (
                       <span className="font-black text-lg text-slate-800 dark:text-white">R$ {Number(product.price).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </section>
      ))}
    </div>
  );
}