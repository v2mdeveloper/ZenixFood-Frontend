export default function AdminLogin({ adminLoginForm, setAdminLoginForm, handleAdminLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 w-full max-w-sm shadow-xl">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-2 uppercase tracking-tighter">Cânone Admin</h2>
        <p className="text-slate-500 text-xs text-center mb-6">Acesso restrito à gerência</p>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 block mb-1">E-mail Administrativo</label>
            <input 
              type="email" 
              required 
              onChange={e => setAdminLoginForm({...adminLoginForm, email: e.target.value})} 
              placeholder="admin@canone.com" 
              className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500" 
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 block mb-1">Senha de Acesso</label>
            <input 
              type="password" 
              required 
              onChange={e => setAdminLoginForm({...adminLoginForm, password: e.target.value})} 
              placeholder="••••••••" 
              className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500" 
            />
          </div>
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3.5 rounded-xl text-sm transition-all mt-2 shadow-md">
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
}