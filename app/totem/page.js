'use client';
import { useRouter } from 'next/navigation';

export default function TotemSetupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center selection:bg-amber-500 selection:text-black font-sans">
      <div className="bg-[#121212] border border-amber-500/30 p-10 rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 to-amber-400"></div>
        
        <span className="text-6xl mb-6 inline-block animate-bounce">🍔</span>
        
        <h1 className="text-3xl font-black text-white mb-2">Instalador do Totem</h1>
        <p className="text-zinc-400 font-bold mb-8">Cânone Burger Autoatendimento</p>

        <div className="bg-black/50 border border-white/10 p-6 rounded-2xl mb-8 text-left">
           <h3 className="text-amber-500 font-black text-sm uppercase tracking-widest mb-3">Como instalar nesta máquina:</h3>
           <ol className="text-zinc-300 text-sm space-y-3 font-medium">
              <li><strong className="text-white">1.</strong> Toque nos <strong className="text-white">3 pontinhos</strong> do navegador (canto superior direito).</li>
              <li><strong className="text-white">2.</strong> Selecione <strong className="text-emerald-400">"Adicionar à Tela Inicial"</strong> ou <strong className="text-emerald-400">"Instalar Aplicativo"</strong>.</li>
              <li><strong className="text-white">3.</strong> Confirme a instalação.</li>
              <li><strong className="text-white">4.</strong> Vá para a tela inicial do tablet/máquina, procure o ícone "Totem Cânone" e abra-o!</li>
           </ol>
        </div>

        <button 
          onClick={() => router.push('/?totem=true')} 
          className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          Testar Totem no Navegador
        </button>
      </div>
    </div>
  );
}