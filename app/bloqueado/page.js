'use client';
export default function BloqueadoPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <span className="text-6xl mb-6">⚠️</span>
      <h1 className="text-3xl font-black text-white mb-4">Acesso Suspenso</h1>
      <p className="text-slate-400 max-w-md mb-8">
        O sistema encontra-se temporariamente indisponível para esta unidade devido a pendências na assinatura. 
        Por favor, entre em contato com o suporte Zenix para regularizar a situação.
      </p>
      <a href="https://wa.me/5511984840258" target="_blank" rel="noopener noreferrer" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-xl transition-colors">
        Falar com o Suporte
      </a>
    </div>
  );
}