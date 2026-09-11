'use client';
import { useParams } from 'next/navigation';

export default function BloqueadoPage() {
  const params = useParams();
  const storeSlug = params?.storeSlug || '';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in-up">
        
        {/* Barra superior colorida */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600"></div>

        {/* Ícone de Cadeado */}
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-700">
          <span className="text-5xl">🔒</span>
        </div>

        <h1 className="text-2xl font-black text-white mb-3">Acesso Suspenso</h1>
        
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Identificamos uma pendência relacionada à assinatura do sistema desta unidade. 
          Para que a operação volte ao normal e você não perca nenhuma venda, o acesso foi temporariamente paralisado.
        </p>

        {/* Box de Instrução */}
        <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl mb-8">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <span>💡</span> Como regularizar?
          </h3>
          <p className="text-xs text-slate-400">
            Entre em contato com o suporte ou realize o pagamento da fatura em aberto através do painel administrativo (<strong className="text-slate-300">Minha Empresa</strong>).
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = `/${storeSlug}/admin`}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 text-sm cursor-pointer"
          >
            Acessar Faturas
          </button>
          <button
            onClick={() => window.location.href = `/${storeSlug}`}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl border border-slate-700 transition-all active:scale-95 text-sm cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>

      </div>
    </div>
  );
}