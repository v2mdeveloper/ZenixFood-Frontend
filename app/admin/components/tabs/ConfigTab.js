import { useState, useEffect } from 'react';

export default function ConfigTab({
  settingsForm, setSettingsForm, handleSaveSystemSettings, daysOfWeek,
  adminConfig, setAdminConfig, handleUpdateAdminConfig
}) {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-fade-in-up">
      <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-amber-600 mb-6 uppercase tracking-wider">⚙️ Configurações Operacionais</h2>
        
        <form onSubmit={handleSaveSystemSettings} className="space-y-5">
          
          {/* 💳 INTEGRAÇÕES DE PAGAMENTO (MERCADO PAGO) */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
            <h3 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">💳 Integração Mercado Pago</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="mercadoPagoPublicKey" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Public Key (Frontend - Checkout)</label>
                <input 
                  id="mercadoPagoPublicKey" 
                  name="mercadoPagoPublicKey" 
                  type="text" 
                  placeholder="Ex: APP_USR-1edaaff0-..." 
                  value={settingsForm.mercadoPagoPublicKey || ''} 
                  onChange={(e) => setSettingsForm({...settingsForm, mercadoPagoPublicKey: e.target.value})} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono" 
                />
              </div>
              <div>
                <label htmlFor="mercadoPagoAccessToken" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Access Token (Backend - PIX/Cartão)</label>
                <input 
                  id="mercadoPagoAccessToken" 
                  name="mercadoPagoAccessToken" 
                  type="password" 
                  placeholder="Ex: APP_USR-987654321..." 
                  value={settingsForm.mercadoPagoAccessToken || ''} 
                  onChange={(e) => setSettingsForm({...settingsForm, mercadoPagoAccessToken: e.target.value})} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-mono" 
                />
                <p className="text-[9px] text-slate-500 mt-1 font-medium">Estas chaves definem para qual conta bancária o dinheiro das vendas desta loja será direcionado.</p>
              </div>
            </div>
          </div>

          {/* 🧾 INTEGRAÇÃO FISCAL (FOCUS NFE) */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-6">
            <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">🧾 Emissão de NFC-e (Focus NFe)</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="focusEnv" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Ambiente de Emissão</label>
                <select 
                  id="focusEnv" 
                  name="focusEnv" 
                  value={settingsForm.focusEnv || 'homologacao'} 
                  onChange={(e) => setSettingsForm({...settingsForm, focusEnv: e.target.value})} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                >
                  <option value="homologacao">Homologação (Ambiente de Testes)</option>
                  <option value="producao">Produção (Validade Fiscal Real)</option>
                </select>
              </div>
              <div>
                <label htmlFor="focusToken" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Token de Integração Focus</label>
                <input 
                  id="focusToken" 
                  name="focusToken" 
                  type="password" 
                  placeholder="Cole o token da Focus NFe aqui..." 
                  value={settingsForm.focusToken || ''} 
                  onChange={(e) => setSettingsForm({...settingsForm, focusToken: e.target.value})} 
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono" 
                />
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
            <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">🔴 Transmissão ao Vivo (YouTube)</h3>
            <div>
              <label htmlFor="youtubeLiveId" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Link da Live (Não Listada)</label>
              <input id="youtubeLiveId" name="youtubeLiveId" type="text" placeholder="Ex: https://youtube.com/live/xyz123" value={settingsForm.youtubeLiveId || ''} onChange={(e) => { let val = e.target.value; let extractedId = val; const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/); if (match && match[1]) extractedId = match[1]; setSettingsForm({...settingsForm, youtubeLiveId: extractedId}); }} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-500" />
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
            <h3 className="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">🎟️ Banner Promocional do Cardápio</h3>
            <div className="space-y-3">
              <div><label htmlFor="promoBannerUrl" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">URL da Imagem do Banner</label><input id="promoBannerUrl" name="promoBannerUrl" type="url" placeholder="Ex: https://i.imgur.com/sua-imagem.png" value={settingsForm.promoBannerUrl || ''} onChange={(e) => setSettingsForm({...settingsForm, promoBannerUrl: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500" /></div>
              <div><label htmlFor="promoBannerLink" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Link ao Clicar (Opcional)</label><input id="promoBannerLink" name="promoBannerLink" type="url" placeholder="Para onde o cliente vai se clicar no banner?" value={settingsForm.promoBannerLink || ''} onChange={(e) => setSettingsForm({...settingsForm, promoBannerLink: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500" /></div>
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">📖 Sobre a Loja</h3>
            <div>
              <label htmlFor="aboutUsText" className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Texto que aparece no cardápio do cliente</label>
              <textarea 
                id="aboutUsText"
                name="aboutUsText"
                rows="4"
                value={settingsForm.aboutUsText || ''} 
                onChange={(e) => setSettingsForm({...settingsForm, aboutUsText: e.target.value})} 
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 resize-none leading-relaxed" 
                placeholder="Escreva a história ou a essência do estabelecimento..." 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label htmlFor="storeCnpj" className="text-xs text-slate-500 block mb-1">CNPJ (Para NFC-e)</label><input id="storeCnpj" name="storeCnpj" type="text" value={settingsForm.storeCnpj || ''} onChange={(e) => setSettingsForm({...settingsForm, storeCnpj: e.target.value})} placeholder="Apenas números" className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-amber-500 font-bold" /></div>
            <div><label htmlFor="deliveryFee" className="text-xs text-slate-500 block mb-1">Taxa Entrega (R$)</label><input id="deliveryFee" name="deliveryFee" type="number" step="0.01" required value={settingsForm.deliveryFee || ''} onChange={(e) => setSettingsForm({...settingsForm, deliveryFee: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-amber-500 font-bold" /></div>
            <div><label htmlFor="cashbackPercent" className="text-xs text-slate-500 block mb-1">Cashback (%)</label><input id="cashbackPercent" name="cashbackPercent" type="number" step="1" required value={settingsForm.cashbackPercent || ''} onChange={(e) => setSettingsForm({...settingsForm, cashbackPercent: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-amber-500 font-bold" /></div>
          </div>

          <div className="pt-2">
            <label htmlFor="isManualFechado" className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <input id="isManualFechado" name="isManualFechado" type="checkbox" checked={settingsForm.isManualFechado || false} onChange={(e) => setSettingsForm({...settingsForm, isManualFechado: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
              <div className="flex flex-col"><span className="text-sm font-bold text-red-600">Forçar Loja Fechada Manualmente</span><span className="text-[11px] text-slate-500">Ignora a agenda abaixo e fecha o delivery.</span></div>
            </label>
          </div>

          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">📅 Agenda de Funcionamento</h3>
            {daysOfWeek.map((day, idx) => {
              const s = settingsForm.schedule ? settingsForm.schedule[idx] : { isOpen: false, open: "18:00", close: "23:30" };
              return (
                <div key={idx} className="flex flex-col lg:flex-row lg:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="w-36">
                    <label htmlFor={`dayOpen_${idx}`} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
                      <input id={`dayOpen_${idx}`} name={`dayOpen_${idx}`} type="checkbox" checked={s?.isOpen || false} onChange={(e) => { const newSchedule = {...settingsForm.schedule, [idx]: {...s, isOpen: e.target.checked}}; setSettingsForm({...settingsForm, schedule: newSchedule}); }} className="rounded text-amber-500 focus:ring-0 border-slate-300" />
                      {day}
                    </label>
                  </div>
                  {s?.isOpen ? (
                    <div className="flex gap-2 flex-1 items-center">
                      <input type="time" name={`openTime_${idx}`} required value={s.open} onChange={(e) => { const newSchedule = {...settingsForm.schedule, [idx]: {...s, open: e.target.value}}; setSettingsForm({...settingsForm, schedule: newSchedule}); }} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500" />
                      <span className="text-slate-500 text-xs font-bold">às</span>
                      <input type="time" name={`closeTime_${idx}`} required value={s.close} onChange={(e) => { const newSchedule = {...settingsForm.schedule, [idx]: {...s, close: e.target.value}}; setSettingsForm({...settingsForm, schedule: newSchedule}); }} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500" />
                    </div>
                  ) : (<div className="flex-1 text-xs text-red-700 font-bold py-2 px-2 bg-red-100 rounded-lg text-center">FECHADO</div>)}
                </div>
              );
            })}
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black text-md py-4 rounded-xl mt-4 transition-all shadow-md">💾 Salvar Configurações</button>
        </form>
      </section>

      <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-wider">👤 Perfil do Administrador</h2>
        <form onSubmit={handleUpdateAdminConfig} className="space-y-4">
          <div><label htmlFor="adminName" className="text-xs text-slate-500 block mb-1">Nome</label><input id="adminName" name="adminName" type="text" required value={adminConfig.name} onChange={(e) => setAdminConfig({...adminConfig, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-amber-500" /></div>
          <div><label htmlFor="adminEmail" className="text-xs text-slate-500 block mb-1">E-mail</label><input id="adminEmail" name="adminEmail" type="email" required value={adminConfig.email} onChange={(e) => setAdminConfig({...adminConfig, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-amber-500" /></div>
          <div className="pt-4 border-t border-slate-200 mt-4"><label htmlFor="adminPassword" className="text-xs text-slate-500 block mb-1">Nova Senha (deixe em branco para manter a atual)</label><input id="adminPassword" name="adminPassword" type="password" placeholder="••••••••" value={adminConfig.password} onChange={(e) => setAdminConfig({...adminConfig, password: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-amber-500" /></div>
          <button type="submit" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-md py-4 rounded-xl mt-6 transition-all border border-slate-200">Atualizar Dados</button>
        </form>
      </section>
    </main>
  );
}