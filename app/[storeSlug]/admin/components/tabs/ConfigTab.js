'use client';
import { useState } from 'react';

export default function ConfigTab({ 
  settingsForm, 
  setSettingsForm, 
  handleSaveSystemSettings, 
  daysOfWeek, 
  adminConfig, 
  setAdminConfig, 
  handleUpdateAdminConfig 
}) {
  const [isSaving, setIsSaving] = useState(false);

  const onSaveConfig = async (e) => {
    setIsSaving(true);
    await handleSaveSystemSettings(e);
    setIsSaving(false);
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    setSettingsForm({
      ...settingsForm,
      schedule: {
        ...settingsForm.schedule,
        [dayIndex]: {
          ...settingsForm.schedule[dayIndex],
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10 max-w-5xl mx-auto">
      
      <div className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800">
        <div>
           <h2 className="text-2xl font-black text-white">Configurações Gerais</h2>
           <p className="text-slate-400 text-sm mt-1">Ajuste os horários, taxas, integrações e imagens do seu sistema.</p>
        </div>
        <button 
          onClick={onSaveConfig} 
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black px-8 py-4 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          {isSaving ? 'Salvando...' : '💾 Salvar Alterações'}
        </button>
      </div>

      {/* 🎨 IDENTIDADE VISUAL E IMAGENS */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>🎨</span> Identidade Visual (Logos e Capas)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Capa do Cardápio Digital (Head)</label>
            {settingsForm.coverImageUrl ? (
               <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-300 shadow-inner mb-3">
                  <img src={settingsForm.coverImageUrl} className="w-full h-full object-cover" alt="Capa Cardápio" />
                  <button type="button" onClick={() => setSettingsForm({...settingsForm, coverImageUrl: ''})} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 rounded-full font-black text-xs transition-colors shadow-md">✕</button>
               </div>
            ) : (
               <div className="w-full h-32 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 font-bold text-xs mb-3">
                  <span className="text-2xl mb-1">🖼️</span> Sem imagem de capa
               </div>
            )}
            <input 
              type="text" 
              value={settingsForm.coverImageUrl || ''} 
              onChange={e => setSettingsForm({...settingsForm, coverImageUrl: e.target.value})} 
              placeholder="Cole a URL da Imagem (Ex: https://...)" 
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Logotipo (Perfil)</label>
            {settingsForm.logoUrl ? (
               <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-md mb-3">
                  <img src={settingsForm.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                  <button type="button" onClick={() => setSettingsForm({...settingsForm, logoUrl: ''})} className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white w-6 h-6 rounded-full font-black text-[10px] flex items-center justify-center transition-colors">✕</button>
               </div>
            ) : (
               <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-2xl mb-3">
                  🏢
               </div>
            )}
            <input 
              type="text" 
              value={settingsForm.logoUrl || ''} 
              onChange={e => setSettingsForm({...settingsForm, logoUrl: e.target.value})} 
              placeholder="Cole a URL do Logotipo..." 
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Capa de Descanso do Totem (Vertical)</label>
            {settingsForm.totemCoverImageUrl ? (
               <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-300 shadow-inner mb-3">
                  <img src={settingsForm.totemCoverImageUrl} className="w-full h-full object-cover object-top" alt="Capa Totem" />
                  <button type="button" onClick={() => setSettingsForm({...settingsForm, totemCoverImageUrl: ''})} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white w-8 h-8 rounded-full font-black text-xs transition-colors shadow-md">✕</button>
               </div>
            ) : (
               <div className="w-full h-16 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-bold text-xs mb-3">
                  Totem usará fundo laranja padrão
               </div>
            )}
            <input 
              type="text" 
              value={settingsForm.totemCoverImageUrl || ''} 
              onChange={e => setSettingsForm({...settingsForm, totemCoverImageUrl: e.target.value})} 
              placeholder="Cole a URL da Imagem Vertical para o Totem..." 
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 📹 YOUTUBE & BANNERS */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>📺</span> Transmissão e Banners</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
            <label className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-3">YouTube Live ID (Cozinha ao Vivo)</label>
            <input 
              type="text" 
              value={settingsForm.youtubeLiveId || ''} 
              onChange={e => setSettingsForm({...settingsForm, youtubeLiveId: e.target.value})} 
              placeholder="Ex: dQw4w9WgXcQ" 
              className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm font-black text-slate-800 focus:outline-none focus:border-red-500" 
            />
            <p className="text-[9px] text-red-500 font-bold mt-2">Cole apenas o ID do vídeo (o código depois de v= no YouTube).</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-3">Link dos Aplicativos Delivery</label>
            <div className="space-y-2">
              <input 
                type="text" 
                value={settingsForm.ifoodLink || ''} 
                onChange={e => setSettingsForm({...settingsForm, ifoodLink: e.target.value})} 
                placeholder="URL da sua loja no iFood" 
                className="w-full bg-white border border-blue-200 rounded-lg p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="text" 
                value={settingsForm.ninetyNineFoodLink || ''} 
                onChange={e => setSettingsForm({...settingsForm, ninetyNineFoodLink: e.target.value})} 
                placeholder="URL da sua loja no 99Food / Rappi" 
                className="w-full bg-white border border-blue-200 rounded-lg p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500" 
              />
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Banner Promocional (Aparece no Cardápio)</label>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={settingsForm.promoBannerUrl || ''} 
                onChange={e => setSettingsForm({...settingsForm, promoBannerUrl: e.target.value})} 
                placeholder="URL da Imagem do Banner..." 
                className="flex-1 bg-white border border-slate-300 rounded-lg p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500" 
              />
              <input 
                type="text" 
                value={settingsForm.promoBannerLink || ''} 
                onChange={e => setSettingsForm({...settingsForm, promoBannerLink: e.target.value})} 
                placeholder="Link para onde o banner direciona (Opcional)..." 
                className="flex-1 bg-white border border-slate-300 rounded-lg p-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📱 RODAPÉ E PROMOÇÕES (FOOTER) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>📱</span> Contato e Textos Promocionais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 md:col-span-2">
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-2">WhatsApp de Suporte</label>
            <input type="text" value={settingsForm.supportPhone || ''} onChange={e => setSettingsForm({...settingsForm, supportPhone: e.target.value})} placeholder="Ex: (11) 98484-0258" className="w-full bg-white border border-emerald-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-emerald-500" />
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Este número receberá as mensagens do botão "Chamar no WhatsApp" no final do Cardápio.</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Título do Bloco 1</label>
            <input type="text" value={settingsForm.promoTitle1 || ''} onChange={e => setSettingsForm({...settingsForm, promoTitle1: e.target.value})} placeholder="Ex: 💰 Cashback Automático" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-bold mb-3 focus:outline-none focus:border-amber-500" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Texto do Bloco 1</label>
            <textarea value={settingsForm.promoText1 || ''} onChange={e => setSettingsForm({...settingsForm, promoText1: e.target.value})} rows="3" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"></textarea>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Título do Bloco 2</label>
            <input type="text" value={settingsForm.promoTitle2 || ''} onChange={e => setSettingsForm({...settingsForm, promoTitle2: e.target.value})} placeholder="Ex: 🎟️ Cupons Raspadinha" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-bold mb-3 focus:outline-none focus:border-amber-500" />
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Texto do Bloco 2</label>
            <textarea value={settingsForm.promoText2 || ''} onChange={e => setSettingsForm({...settingsForm, promoText2: e.target.value})} rows="3" className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"></textarea>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 md:col-span-2">
            <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-2">Texto de Regras / Avisos (Bloco Amarelo)</label>
            <textarea value={settingsForm.promoWarningText || ''} onChange={e => setSettingsForm({...settingsForm, promoWarningText: e.target.value})} rows="2" placeholder="Ex: As promoções não são cumulativas..." className="w-full bg-white border border-amber-200 rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500"></textarea>
            <p className="text-[10px] text-amber-600 font-bold mt-1">Apague todos os textos se quiser esconder esta secção de promoções do cliente.</p>
          </div>
        </div>
      </div>

      {/* ⚙️ OPERACIONAL */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>🛵</span> Operacional e Delivery</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Status da Loja (Delivery)</label>
              <label className={`flex items-center justify-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors shadow-sm ${settingsForm.isManualFechado ? 'bg-red-100 border-red-300' : 'bg-emerald-50 border-emerald-300'}`}>
                 <input type="checkbox" checked={!settingsForm.isManualFechado} onChange={e => setSettingsForm({...settingsForm, isManualFechado: !e.target.checked})} className="w-5 h-5 accent-emerald-600 cursor-pointer" />
                 <span className={`font-black text-sm ${settingsForm.isManualFechado ? 'text-red-700' : 'text-emerald-700'}`}>{settingsForm.isManualFechado ? 'Fechada (Pausada)' : 'Aberta (Online)'}</span>
              </label>
           </div>
           
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Taxa de Entrega Padrão (R$)</label>
              <input type="number" step="0.01" value={settingsForm.deliveryFee} onChange={e => setSettingsForm({...settingsForm, deliveryFee: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xl font-black text-slate-800 focus:outline-none focus:border-blue-500 text-center shadow-inner" />
           </div>
           
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Cashback de Retenção (%)</label>
              <input type="number" step="0.1" value={settingsForm.cashbackPercent} onChange={e => setSettingsForm({...settingsForm, cashbackPercent: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xl font-black text-slate-800 focus:outline-none focus:border-blue-500 text-center shadow-inner" />
           </div>
        </div>

        <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Sobre Nós (Aparece no Cardápio Digital)</label>
          <textarea 
             value={settingsForm.aboutUsText || ''} 
             onChange={e => setSettingsForm({...settingsForm, aboutUsText: e.target.value})} 
             rows="3" 
             className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-700 font-medium focus:outline-none focus:border-amber-500 shadow-inner" 
             placeholder="Conte um pouco sobre a história e qualidade do seu restaurante..."
          ></textarea>
        </div>
      </div>

      {/* 🕒 HORÁRIOS */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><span>🕒</span> Horários de Funcionamento (Automático)</h3>
        <p className="text-xs text-slate-500 font-bold mb-4 bg-slate-100 p-3 rounded-lg border border-slate-200">O seu cardápio digital abrirá e fechará sozinho de acordo com estes horários. Se você pausar a loja manualmente lá em cima, estes horários serão ignorados.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {daysOfWeek.map((day, idx) => {
              const scheduleData = settingsForm.schedule[idx] || { isOpen: false, open: '18:00', close: '23:30' };
              return (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${scheduleData.isOpen ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                   <div className="w-28 shrink-0">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={scheduleData.isOpen} onChange={e => handleScheduleChange(idx, 'isOpen', e.target.checked)} className="w-5 h-5 accent-blue-600 cursor-pointer" />
                        <span className={`font-black text-sm ${scheduleData.isOpen ? 'text-blue-800' : 'text-slate-400'}`}>{day}</span>
                     </label>
                   </div>
                   
                   {scheduleData.isOpen ? (
                     <div className="flex gap-2 items-center flex-1 justify-end">
                        <input type="time" value={scheduleData.open} onChange={e => handleScheduleChange(idx, 'open', e.target.value)} className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-700 focus:border-blue-500 focus:outline-none w-24 text-center shadow-sm" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">até</span>
                        <input type="time" value={scheduleData.close} onChange={e => handleScheduleChange(idx, 'close', e.target.value)} className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-black text-slate-700 focus:border-blue-500 focus:outline-none w-24 text-center shadow-sm" />
                     </div>
                   ) : (
                     <div className="flex-1 text-right"><span className="text-[10px] font-black text-red-500 bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg uppercase tracking-widest">FECHADO</span></div>
                   )}
                </div>
              );
           })}
        </div>
      </div>

      {/* 🔐 SEGURANÇA E ACESSO DO ADMIN */}
      {adminConfig && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-red-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 ml-4"><span>🔐</span> Dados de Acesso do Administrador</h3>
          
          <form onSubmit={handleUpdateAdminConfig} className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-4">
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nome do Dono</label>
                <input type="text" required value={adminConfig.name} onChange={e => setAdminConfig({...adminConfig, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-red-500" />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">E-mail de Login Mestre</label>
                <input type="email" required value={adminConfig.email} onChange={e => setAdminConfig({...adminConfig, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:outline-none focus:border-red-500" />
             </div>
             <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nova Senha</label>
                <input type="password" value={adminConfig.password} onChange={e => setAdminConfig({...adminConfig, password: e.target.value})} placeholder="Deixe em branco para não alterar" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500" />
             </div>
             <div className="md:col-span-3 text-right pt-2 border-t border-slate-100">
                <button type="submit" className="bg-red-500 hover:bg-red-600 text-white font-black px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer">Atualizar Meu Acesso</button>
             </div>
          </form>
        </div>
      )}

      {/* BOTÃO SALVAR FIXO EM BAIXO */}
      <div className="sticky bottom-4 z-50 mt-8">
         <button 
           onClick={onSaveConfig} 
           disabled={isSaving}
           className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-700 disabled:text-slate-400 text-white font-black text-lg py-5 rounded-2xl shadow-2xl transition-transform active:scale-95 cursor-pointer border-t-4 border-amber-500 flex justify-center items-center gap-2"
         >
           {isSaving ? 'A Guardar as suas configurações...' : '💾 Confirmar e Salvar Todas as Configurações'}
         </button>
      </div>

    </div>
  );
}