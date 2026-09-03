function ConfigTab({ settingsForm, setSettingsForm, handleSaveSystemSettings, daysOfWeek, adminConfig, setAdminConfig, handleUpdateAdminConfig }) {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-fade-in-up">
      <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-amber-600 mb-6 uppercase tracking-wider">⚙️ Configurações da Loja</h2>
        <form onSubmit={handleSaveSystemSettings} className="space-y-5">
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-6 space-y-4">
            <h3 className="text-sm font-bold text-purple-700 mb-2 flex items-center gap-2">🎨 Personalização Visual & Apps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Logotipo (URL)</label>
                <input type="url" value={settingsForm.logoUrl || ''} onChange={e => setSettingsForm({...settingsForm, logoUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Capa Delivery (URL)</label>
                <input type="url" value={settingsForm.coverImageUrl || ''} onChange={e => setSettingsForm({...settingsForm, coverImageUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Capa Totem (Descanso)</label>
                <input type="url" value={settingsForm.totemCoverImageUrl || ''} onChange={e => setSettingsForm({...settingsForm, totemCoverImageUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-purple-500" placeholder="https://..." />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-purple-200/50 pt-4">
              <div>
                <label className="text-[10px] text-red-600 font-bold uppercase block mb-1">Link do iFood</label>
                <input type="url" value={settingsForm.ifoodLink || ''} onChange={e => setSettingsForm({...settingsForm, ifoodLink: e.target.value})} className="w-full bg-white border border-red-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="text-[10px] text-amber-600 font-bold uppercase block mb-1">Link do 99Food</label>
                <input type="url" value={settingsForm.ninetyNineFoodLink || ''} onChange={e => setSettingsForm({...settingsForm, ninetyNineFoodLink: e.target.value})} className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
            <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">💳 Integração Mercado Pago</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Public Key (Frontend)</label>
                <input type="text" value={settingsForm.mercadoPagoPublicKey || ''} onChange={e => setSettingsForm({...settingsForm, mercadoPagoPublicKey: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Access Token (Backend)</label>
                <input type="password" value={settingsForm.mercadoPagoAccessToken || ''} onChange={e => setSettingsForm({...settingsForm, mercadoPagoAccessToken: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" />
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-6">
            <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">🧾 Emissão de NFC-e (Focus)</h3>
            <div className="space-y-3">
              <select value={settingsForm.focusEnv || 'homologacao'} onChange={e => setSettingsForm({...settingsForm, focusEnv: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-bold focus:outline-none focus:border-emerald-500">
                <option value="homologacao">Homologação (Testes)</option>
                <option value="producao">Produção (Validade Fiscal)</option>
              </select>
              <input type="password" placeholder="Token de Integração Focus" value={settingsForm.focusToken || ''} onChange={e => setSettingsForm({...settingsForm, focusToken: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">CNPJ</label>
              <input type="text" value={settingsForm.storeCnpj || ''} onChange={e => setSettingsForm({...settingsForm, storeCnpj: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 font-bold focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Taxa Entrega (R$)</label>
              <input type="number" step="0.01" value={settingsForm.deliveryFee || ''} onChange={e => setSettingsForm({...settingsForm, deliveryFee: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 font-bold focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Cashback (%)</label>
              <input type="number" value={settingsForm.cashbackPercent || ''} onChange={e => setSettingsForm({...settingsForm, cashbackPercent: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 font-bold focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100">
              <input type="checkbox" checked={settingsForm.isManualFechado || false} onChange={e => setSettingsForm({...settingsForm, isManualFechado: e.target.checked})} className="w-5 h-5 accent-amber-500" />
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-red-600">Forçar Loja Fechada</span>
                 <span className="text-[11px] text-slate-500">Ignora a agenda abaixo e fecha o delivery online.</span>
              </div>
            </label>
          </div>

          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">📅 Agenda de Funcionamento</h3>
            {daysOfWeek.map((day, idx) => {
              const s = settingsForm.schedule ? settingsForm.schedule[idx] : { isOpen: false, open: "18:00", close: "23:30" };
              return (
                <div key={idx} className="flex flex-col lg:flex-row lg:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-36">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input type="checkbox" checked={s?.isOpen || false} onChange={e => {
                        const newSchedule = { ...settingsForm.schedule, [idx]: { ...s, isOpen: e.target.checked } };
                        setSettingsForm({ ...settingsForm, schedule: newSchedule });
                      }} className="accent-amber-500 w-4 h-4" />
                      {day}
                    </label>
                  </div>
                  {s?.isOpen ? (
                    <div className="flex gap-2 flex-1 items-center">
                      <input type="time" required value={s.open} onChange={e => {
                        const newSchedule = { ...settingsForm.schedule, [idx]: { ...s, open: e.target.value } };
                        setSettingsForm({ ...settingsForm, schedule: newSchedule });
                      }} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500" />
                      <span className="text-slate-500 text-xs font-bold">às</span>
                      <input type="time" required value={s.close} onChange={e => {
                        const newSchedule = { ...settingsForm.schedule, [idx]: { ...s, close: e.target.value } };
                        setSettingsForm({ ...settingsForm, schedule: newSchedule });
                      }} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500" />
                    </div>
                  ) : (
                    <div className="flex-1 text-xs text-red-700 font-bold py-2 px-2 bg-red-100 rounded-lg text-center">FECHADO</div>
                  )}
                </div>
              );
            })}
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black text-md py-4 rounded-xl mt-4 shadow-md transition-all">
            💾 Salvar Configurações
          </button>
        </form>
      </section>

      <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider">👤 Perfil Administrativo</h2>
        <form onSubmit={handleUpdateAdminConfig} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Nome</label>
            <input type="text" required value={adminConfig.name} onChange={e => setAdminConfig({...adminConfig, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">E-mail</label>
            <input type="email" required value={adminConfig.email} onChange={e => setAdminConfig({...adminConfig, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 focus:outline-none focus:border-amber-500" />
          </div>
          <div className="pt-4 border-t border-slate-200 mt-4">
            <label className="text-xs text-slate-500 block mb-1">Nova Senha (deixe em branco para manter a atual)</label>
            <input type="password" placeholder="••••••••" value={adminConfig.password} onChange={e => setAdminConfig({...adminConfig, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 focus:outline-none focus:border-amber-500" />
          </div>
          <button type="submit" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl mt-6 border border-slate-200 transition-all">
            Atualizar Dados
          </button>
        </form>
      </section>
    </main>
  );
}