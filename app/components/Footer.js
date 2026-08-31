export default function Footer({ view, getTodayScheduleText, storeSettings }) {
  if (view === 'payment_card' || view === 'payment_pix' || view === 'live_cam') return null;

  const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return (
    <footer className="pt-8 pb-32 mt-10 text-center border-t border-slate-200 dark:border-white/5 text-slate-500 dark:text-zinc-500 text-xs w-full max-w-4xl mx-auto px-4 transition-colors duration-300">
      
      <div className="mb-6">
        <h4 className="text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-widest mb-2 transition-colors duration-300">⏰ Horário de Funcionamento</h4>
        <p className="text-amber-600 dark:text-amber-500 font-bold text-sm mb-2 transition-colors duration-300">{getTodayScheduleText()}</p>
        
        {storeSettings && storeSettings.schedule && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-left max-w-md mx-auto">
            {daysOfWeek.map((day, i) => {
              const s = storeSettings.schedule[i.toString()];
              return (
                <div key={day} className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl text-[10px] transition-colors duration-300">
                  <span className="text-slate-700 dark:text-zinc-300 font-bold block transition-colors duration-300">{day}</span>
                  {s && s.isOpen ? <span className="text-emerald-600 dark:text-emerald-500 font-medium">{s.open} - {s.close}</span> : <span className="text-red-500 dark:text-red-400 font-medium">Fechado</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <p className="text-slate-600 dark:text-zinc-400 transition-colors duration-300 mb-4">Precisa de ajuda com o seu pedido? Entre em contato conosco:</p>
        
        <a 
          href="https://wa.me/5511984840258?text=Olá! Preciso de ajuda com o meu pedido." 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all hover:-translate-y-1 shadow-[0_10px_20px_rgba(37,211,102,0.2)] mb-3"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.124.551 4.195 1.597 6.015L.013 24l6.108-1.589a11.96 11.96 0 0 0 5.91 1.564h.005c6.648 0 12.031-5.383 12.031-12.031C24 5.4 18.625 0 12.031 0zm.005 22.016c-1.802 0-3.565-.483-5.112-1.396l-.367-.217-3.8.995.996-3.729-.239-.379A10.02 10.02 0 0 1 1.965 12.03c0-5.556 4.52-10.076 10.078-10.076 5.558 0 10.078 4.52 10.078 10.076 0 5.557-4.52 10.077-10.078 10.076zm5.525-7.551c-.303-.152-1.794-.887-2.073-.988-.278-.101-.482-.152-.684.152-.203.303-.783.988-.961 1.19-.178.202-.355.228-.658.076-.303-.152-1.281-.472-2.439-1.332-.903-.671-1.512-1.5-1.69-1.803-.178-.303-.019-.467.133-.618.137-.137.303-.354.455-.532.152-.178.203-.303.303-.505.101-.202.051-.379-.025-.531-.076-.152-.684-1.648-.937-2.254-.247-.591-.497-.512-.684-.52-.178-.008-.382-.01-.585-.01-.202 0-.531.076-.809.379-.278.303-1.062 1.037-1.062 2.529 0 1.492 1.088 2.934 1.239 3.136.152.203 2.138 3.266 5.176 4.502.721.294 1.283.47 1.725.602.724.23 1.383.197 1.868.12.544-.087 1.794-.733 2.047-1.442.253-.709.253-1.315.178-1.442-.075-.127-.279-.203-.582-.355z"/></svg>
          Chamar no WhatsApp
        </a>

        <p className="text-amber-600 dark:text-amber-500 font-black text-base transition-colors duration-300">📱 (11) 98484-0258</p>
      </div>

      <div className="mt-10 bg-white dark:bg-[#121212] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-lg text-left max-w-md mx-auto relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-emerald-400"></div>
        
        <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-wider mb-5 text-center flex items-center justify-center gap-2 transition-colors duration-300">
            Nossas Promoções
        </h4>
        
        <div className="space-y-5 text-sm">
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-1 transition-colors duration-300">💰 Cashback Automático</span>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed transition-colors duration-300">A cada pedido finalizado no site, você ganha um percentual de volta na sua carteira digital. Esse saldo pode ser acumulado e usado para abater o valor das suas próximas compras.</p>
          </div>
          
          <div>
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-1 transition-colors duration-300">🎟️ Cupons Raspadinha</span>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed transition-colors duration-300">Fique de olho na sua entrega! Nós enviamos raspadinhas com códigos premiados junto com o lanche. Para usar, basta digitar o código no campo <b>"🏷️ Cupom de Desconto"</b> dentro da sua sacola, logo antes de escolher a forma de pagamento. O desconto é abatido na hora!</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 p-3.5 rounded-xl border border-amber-200 dark:border-amber-500/20 mt-2 transition-colors duration-300">
            <span className="font-black text-amber-600 dark:text-amber-500 text-xs block mb-1 uppercase tracking-wider transition-colors duration-300">⚠️ Regra de Uso</span>
            <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed transition-colors duration-300">As promoções <b>não são cumulativas</b>. Em um mesmo pedido, você deve escolher entre usar o seu Saldo de Cashback <strong className="text-slate-900 dark:text-white underline transition-colors duration-300">OU</strong> aplicar um Cupom de Desconto.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-white/5">
        <p className="mb-5 text-zinc-400 font-bold uppercase tracking-widest">Também estamos no aplicativo:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="https://www.ifood.com.br/delivery/sao-paulo-sp/canone-burger--co-vila-prel/d49e4472-d67e-4eb5-941d-d4f16cbc8764" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#EA1D2C] hover:bg-[#EA1D2C]/80 text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:-translate-y-1 shadow-[0_10px_20px_rgba(234,29,44,0.2)]">
            <img src="/ifood.png" alt="iFood" className="w-6 h-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
            Pedir no iFood
          </a>
         {<a href="https://oia.99app.com/dlp9/IzRRYi?area=BR" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#FFCC00] hover:bg-[#FFCC00]/80 text-black px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:-translate-y-1 shadow-[0_10px_20px_rgba(255,204,0,0.2)]">
            <img src="/99food.png" alt="99Food" className="w-6 h-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
            Pedir no 99Food
          </a>}
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center transition-colors duration-300">
        <p className="text-slate-500 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors duration-300">
          Desenvolvido e Licenciado por
        </p>
        <p className="text-slate-700 dark:text-zinc-400 text-xs font-black tracking-tight transition-colors duration-300">
          V2M Commercial Automation & Software Developer
        </p>
        <p className="text-slate-500 dark:text-zinc-600 text-[10px] mt-2 transition-colors duration-300">
          &copy; {new Date().getFullYear()} - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}