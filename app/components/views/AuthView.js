export default function AuthView({
  authMode, setAuthMode, authForm, setAuthForm, handleAuth,
  showPassword, setShowPassword, recoveryEmail, setRecoveryEmail, 
  handleForgotPassword, isSendingCode, recoveryCode, setRecoveryCode, 
  newPassword, setNewPassword, handleResetPassword
}) {

  // Máscara de CPF automática (via Regex)
  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove tudo o que não for número
    if (val.length > 11) val = val.slice(0, 11); // Limita a 11 dígitos
    
    // Aplica a máscara 000.000.000-00
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setAuthForm({ ...authForm, cpf: val });
  };

  return (
    <div className="flex justify-center items-center py-10 animate-fade-in-up">
      <div className="bg-white dark:bg-[#121212] p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-white/5 w-full max-w-md shadow-2xl relative overflow-hidden transition-colors duration-300">
        
        {/* === MODO LOGIN === */}
        {authMode === 'login' && (
          <>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Bem-vindo!</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8 transition-colors">Faça login para continuar seu pedido.</p>
            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              <input type="email" required placeholder="Seu E-mail" value={authForm.email || ''} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
              <div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="Sua Senha" value={authForm.password || ''} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 pr-12 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[18px] text-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer">{showPassword ? '🙈' : '👁️'}</button>
                </div>
                <div className="text-right mt-2">
                  <button type="button" onClick={() => { setRecoveryEmail(authForm.email); setAuthMode('forgot'); }} className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 text-xs font-bold transition-colors cursor-pointer">Esqueceu a senha?</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">Entrar</button>
            </form>
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 text-center relative z-10 transition-colors">
              <p className="text-slate-500 dark:text-zinc-400 text-sm">Ainda não faz parte?<button onClick={() => setAuthMode('register')} className="text-amber-600 dark:text-amber-500 font-bold ml-2 hover:underline cursor-pointer">Criar Conta</button></p>
            </div>
          </>
        )}
        
        {/* === MODO CADASTRO === */}
        {authMode === 'register' && (
          <>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Crie sua Conta</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6 transition-colors">Cadastre-se e ganhe cashback em todas as compras.</p>
            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              <input type="text" required placeholder="Seu Nome Completo" value={authForm.name || ''} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <input type="text" required placeholder="CEP" value={authForm.cep || ''} onChange={e => setAuthForm({ ...authForm, cep: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <input type="text" required placeholder="Endereço (Rua, Nº, Bairro)" value={authForm.address || ''} onChange={e => setAuthForm({ ...authForm, address: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>

              <input type="email" required placeholder="Seu E-mail" value={authForm.email || ''} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
              <input type="tel" required placeholder="Seu WhatsApp" value={authForm.phone || ''} onChange={e => setAuthForm({ ...authForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase pl-1 block mb-1">CPF (Obrigatório)</label>
                  <input type="text" required placeholder="000.000.000-00" maxLength="14" value={authForm.cpf || ''} onChange={handleCpfChange} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase pl-1 block mb-1">Data Nasc.</label>
                  <input type="date" required value={authForm.birthDate ? authForm.birthDate.split('T')[0] : ''} onChange={e => setAuthForm({ ...authForm, birthDate: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>

              <div className="relative mt-2">
                <input type={showPassword ? "text" : "password"} required placeholder="Crie uma Senha" value={authForm.password || ''} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 pr-12 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[18px] text-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-xl mt-4 transition-all shadow-md active:scale-95 cursor-pointer">Cadastrar e Continuar</button>
            </form>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 text-center relative z-10 transition-colors">
              <p className="text-slate-500 dark:text-zinc-400 text-sm">Já tem conta?<button type="button" onClick={() => setAuthMode('login')} className="text-amber-600 dark:text-amber-500 font-bold ml-2 hover:underline cursor-pointer">Fazer Login</button></p>
            </div>
          </>
        )}

        {/* === MODO ESQUECI A SENHA === */}
        {authMode === 'forgot' && (
          <>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Recuperar Senha</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8 transition-colors">Digite o e-mail cadastrado. Enviaremos um código de 6 dígitos para você redefinir sua senha.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4 relative z-10">
              <input type="email" required placeholder="E-mail cadastrado" value={recoveryEmail || ''} onChange={e => setRecoveryEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
              <button type="submit" disabled={isSendingCode} className={`w-full font-black text-lg py-4 rounded-xl transition-all shadow-md cursor-pointer ${isSendingCode ? 'bg-amber-500/50 text-slate-900/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'}`}>
                {isSendingCode ? 'Enviando E-mail (aguarde)...' : 'Enviar Código de Segurança'}
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold py-3 rounded-xl transition-all border border-slate-200 dark:border-white/10 cursor-pointer">Voltar</button>
            </form>
          </>
        )}

        {/* === MODO RESET DE SENHA === */}
        {authMode === 'reset' && (
          <>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Verifique o E-mail</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8 transition-colors">Enviamos um PIN para <b>{recoveryEmail}</b>. Digite-o abaixo junto com a sua nova senha.</p>
            <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
              <input type="text" maxLength="6" required placeholder="Código PIN de 6 dígitos" value={recoveryCode || ''} onChange={e => setRecoveryCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-[1em] text-xl font-mono bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-amber-600 dark:text-amber-500 focus:outline-none focus:border-amber-500 transition-colors" />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required placeholder="Nova Senha" value={newPassword || ''} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 pr-12 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[18px] text-xl opacity-60 hover:opacity-100 transition-opacity cursor-pointer">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer">Redefinir Senha e Entrar</button>
              <button type="button" onClick={() => setAuthMode('forgot')} className="w-full text-slate-500 dark:text-zinc-500 font-bold hover:text-slate-900 dark:hover:text-white transition-colors text-sm py-2 cursor-pointer">Não recebi o código</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}