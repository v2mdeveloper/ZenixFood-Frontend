export default function ProfileView({ profileForm, setProfileForm, handleUpdateProfile }) {

  // Máscara de CPF automática (via Regex)
  const handleCpfChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove tudo o que não for número
    if (val.length > 11) val = val.slice(0, 11); // Limita a 11 dígitos
    
    // Aplica a máscara 000.000.000-00
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    setProfileForm({ ...profileForm, cpf: val });
  };

  const formattedBirthDate = profileForm.birthDate ? profileForm.birthDate.split('T')[0] : '';

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto">
      <section className="bg-white dark:bg-[#121212] p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl transition-colors duration-300">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 transition-colors">👤 Meu Cadastro</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          
          <div>
            <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">Nome Completo</label>
            <input type="text" required value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          
          <div>
            <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">E-mail</label>
            <input type="email" required value={profileForm.email || ''} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
               <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">CEP</label>
               <input type="text" required value={profileForm.cep || ''} onChange={e => setProfileForm({ ...profileForm, cep: e.target.value })} placeholder="00000-000" className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div className="md:col-span-2">
               <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">Endereço (Rua, Nº, Bairro)</label>
               <input type="text" required placeholder="Insira o seu endereço..." value={profileForm.address || ''} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">WhatsApp</label>
              <input type="tel" required value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">CPF</label>
              <input type="text" required maxLength="14" value={profileForm.cpf || ''} onChange={handleCpfChange} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">Data de Nascimento</label>
            <input type="date" required value={formattedBirthDate} onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4 transition-colors">
            <label className="text-xs text-slate-500 dark:text-zinc-400 block mb-1">Nova Senha (deixe em branco para não alterar)</label>
            <input type="password" placeholder="••••••••" value={profileForm.password || ''} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors" />
          </div>
          
          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg py-4 rounded-xl mt-6 transition-all shadow-md active:scale-95 cursor-pointer">Salvar Alterações</button>
        </form>
      </section>
    </div>
  );
}