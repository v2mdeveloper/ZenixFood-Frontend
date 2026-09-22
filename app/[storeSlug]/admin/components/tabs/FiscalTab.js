'use client';
import { useState, useEffect } from 'react';

export default function FiscalTab({
  fiscalSubTab, setFiscalSubTab, orders, emitirEImprimirNfceProp, loadingNfceId,
  formIcms, setFormIcms, handleAddIcms, fiscalData, handleDeleteIcms,
  formPis, setFormPis, handleAddPis, handleDeletePis,
  formIbsCbs, setFormIbsCbs, handleAddIbsCbs, handleDeleteIbsCbs,
  formRegra, setFormRegra, handleAddRegra, handleDeleteRegra,
  handleSaveCnpj,
  nfcesEmitidas
}) {

  const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3333' : 'https://zenixfood-backend.onrender.com';

  const [certFile, setCertFile] = useState(null);
  const [certPassword, setCertPassword] = useState('');
  const [certStatus, setCertStatus] = useState(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [cnpjInput, setCnpjInput] = useState('');

  // Estados do CSC e Ambiente
  const [cscForm, setCscForm] = useState({ ambienteSefaz: '2', cscId: '', cscSecret: '' });

  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token') || localStorage.getItem('zenix_employeeToken') || localStorage.getItem('@Zenix:token');
    const storeId = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : '');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-loja-slug': storeId }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 402) {
      if (typeof window !== 'undefined') {
        window.location.href = '/bloqueado'; 
      }
    }

    return response;
  };

  useEffect(() => {
    if (fiscalData) {
       if (fiscalData.cnpjLoja) setCnpjInput(fiscalData.cnpjLoja);
       setCscForm({
         ambienteSefaz: fiscalData.ambienteSefaz || '2',
         cscId: fiscalData.cscId || '',
         cscSecret: fiscalData.cscSecret || ''
       });
    }
  }, [fiscalData]);

  useEffect(() => {
    if (fiscalSubTab === 'certificado') {
       fetchWithStore(`${API_URL}/api/fiscal/certificado/status`)
         .then(res => res.json())
         .then(data => setCertStatus(data))
         .catch(err => console.error("Erro ao checar certificado", err));
    }
  }, [fiscalSubTab, API_URL]);

  const handleUploadCertificado = async (e) => {
    e.preventDefault();
    if (!certFile || !certPassword) return alert("Selecione o arquivo .pfx e digite a senha do certificado.");
    
    setIsUploadingCert(true);
    const formData = new FormData();
    formData.append('certificado', certFile);
    formData.append('senha', certPassword);

    try {
        const res = await fetchWithStore(`${API_URL}/api/fiscal/certificado`, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            alert("Certificado A1 salvo com segurança no banco de dados e pronto para uso!");
            setCertStatus({ cadastrado: true, nomeArquivo: certFile.name, dataUpload: new Date().toISOString() });
            setCertFile(null); setCertPassword('');
        } else { alert(data.error); }
    } catch (err) { alert("Erro de comunicação ao enviar certificado."); }
    setIsUploadingCert(false);
  };

  const handleDeleteCertificado = async () => {
    if (!confirm("Tem certeza que deseja excluir o certificado digital ativo? Você não poderá emitir notas até cadastrar um novo.")) return;
    
    try {
      const res = await fetchWithStore(`${API_URL}/api/fiscal/certificado`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
         setCertStatus({ cadastrado: false });
         alert("Certificado removido com sucesso.");
      } else {
         alert(data.error || "Erro ao remover certificado.");
      }
    } catch (err) {
      alert("Erro de conexão ao tentar excluir.");
    }
  };

  // NOVA FUNÇÃO: SALVAR CSC
  const handleSaveCsc = async (e) => {
    e.preventDefault();
    try {
        const res = await fetchWithStore(`${API_URL}/api/fiscal/csc`, { 
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cscForm) 
        });
        const data = await res.json();
        if (data.success) alert("Credenciais SEFAZ salvas com sucesso!");
        else alert(data.error || "Erro ao salvar.");
    } catch (err) { alert("Erro de comunicação ao salvar CSC."); }
  };

  return (
    <main className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-emerald-600">🧾 Inteligência Fiscal (NFC-e)</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie certificados, emissão de notas e configure as tributações e impostos (ICMS, IBS/CBS).</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 border-b border-slate-200 pb-4">
        <button onClick={() => setFiscalSubTab('fila')} className={`font-bold pb-2 transition-all cursor-pointer ${fiscalSubTab === 'fila' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-emerald-500'}`}>Fila de Emissão</button>
        <button onClick={() => setFiscalSubTab('config')} className={`font-bold pb-2 transition-all cursor-pointer ${fiscalSubTab === 'config' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-emerald-500'}`}>Regras Tributárias</button>
        <button onClick={() => setFiscalSubTab('certificado')} className={`font-bold pb-2 transition-all cursor-pointer ${fiscalSubTab === 'certificado' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-emerald-500'}`}>🔐 Certificado A1 & Sefaz</button>
      </div>

      {/* ABA: CERTIFICADO & SEFAZ */}
      {fiscalSubTab === 'certificado' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in-up">
           <div className="space-y-6">
              
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-black text-slate-900 mb-2">Dados do Emitente</h3>
                 <p className="text-sm text-slate-500 mb-4">Insira o CNPJ exato vinculado ao certificado digital.</p>
                 <div className="flex gap-2">
                    <input type="text" value={cnpjInput} onChange={(e) => setCnpjInput(e.target.value)} placeholder="Apenas números do CNPJ..." className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-bold tracking-widest focus:outline-none focus:border-emerald-500" />
                    <button onClick={() => handleSaveCnpj(cnpjInput)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-6 rounded-xl shadow-md transition-all cursor-pointer">Salvar</button>
                 </div>
              </div>
              
              <div className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${certStatus?.cadastrado ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                 <div className="flex items-center gap-4">
                    <span className="text-4xl">{certStatus?.cadastrado ? '✅' : '❌'}</span>
                    <div>
                       <h3 className={`text-lg font-black ${certStatus?.cadastrado ? 'text-emerald-700' : 'text-slate-700'}`}>{certStatus?.cadastrado ? 'Certificado Ativo' : 'Nenhum Certificado Encontrado'}</h3>
                       <p className="text-xs text-slate-500 mt-1">Status da integração fiscal no servidor.</p>
                    </div>
                 </div>
                 {certStatus?.cadastrado && (
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                       <button onClick={() => document.getElementById('certInput').click()} className="flex-1 sm:flex-none text-blue-600 font-bold text-xs bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Substituir</button>
                       <button onClick={handleDeleteCertificado} className="flex-1 sm:flex-none text-red-500 font-bold text-xs bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Excluir</button>
                    </div>
                 )}
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-black text-slate-900 mb-2">Upload de Certificado Digital (A1)</h3>
                 <form onSubmit={handleUploadCertificado} className="space-y-4">
                    <div>
                       <label className="text-xs text-slate-500 block mb-1 font-bold uppercase">Arquivo (.pfx / .p12)</label>
                       <input type="file" id="certInput" accept=".pfx,.p12" required onChange={(e) => setCertFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 border border-slate-200 rounded-xl cursor-pointer" />
                    </div>
                    <div>
                       <label className="text-xs text-slate-500 block mb-1 font-bold uppercase">Senha do Certificado</label>
                       <input type="password" required value={certPassword} onChange={(e) => setCertPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500" />
                    </div>
                    <button type="submit" disabled={isUploadingCert} className={`w-full font-black py-4 rounded-xl transition-all shadow-md mt-4 cursor-pointer ${isUploadingCert ? 'bg-emerald-300 text-white cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>{isUploadingCert ? 'Salvando no Cofre...' : '💾 Salvar Certificado A1'}</button>
                 </form>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-sm">
                 <h3 className="text-lg font-black text-amber-500 mb-2">Credenciais SEFAZ (CSC)</h3>
                 <p className="text-sm text-slate-400 mb-6">O Código de Segurança do Contribuinte (CSC) é obrigatório para gerar o QR Code da NFC-e. Obtenha no portal da SEFAZ do seu estado.</p>
                 
                 <form onSubmit={handleSaveCsc} className="space-y-4">
                    <div>
                       <label className="text-xs text-slate-400 block mb-1 font-bold uppercase">Ambiente de Emissão</label>
                       <select value={cscForm.ambienteSefaz} onChange={(e) => setCscForm({...cscForm, ambienteSefaz: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500">
                          <option value="2">Homologação (Testes / Sem validade fiscal)</option>
                          <option value="1">Produção (Validade Fiscal Oficial)</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="md:col-span-1">
                          <label className="text-xs text-slate-400 block mb-1 font-bold uppercase">ID do CSC</label>
                          <input type="text" value={cscForm.cscId} onChange={(e) => setCscForm({...cscForm, cscId: e.target.value})} placeholder="Ex: 000001" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" />
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-xs text-slate-400 block mb-1 font-bold uppercase">Código CSC (Token/Secret)</label>
                          <input type="text" value={cscForm.cscSecret} onChange={(e) => setCscForm({...cscForm, cscSecret: e.target.value})} placeholder="Token Alfanumérico" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono" />
                       </div>
                    </div>
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-4 rounded-xl shadow-md transition-all mt-4 cursor-pointer">
                      Salvar Credenciais CSC
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* ABA: FILA DE EMISSÃO */}
      {fiscalSubTab === 'fila' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-fade-in-up">
           <h3 className="text-lg font-black text-slate-900 mb-4">Pedidos Recentes Prontos para Emissão</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200">
                   <tr><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Data/Hora</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Valor</th><th className="px-4 py-3 text-right">Ação Fiscal</th></tr>
                </thead>
                <tbody>
                   {orders.filter(o => o.status === 'READY' || o.status === 'DELIVERED').map(pedido => {
                      let notaSalva = null;
                      if (pedido.nfceData) { try { notaSalva = typeof pedido.nfceData === 'string' ? JSON.parse(pedido.nfceData) : pedido.nfceData; } catch(e) {} }
                      
                      let memoryNfces = {};
                      try { memoryNfces = JSON.parse(localStorage.getItem('zenix_nfcesEmitidas') || '{}'); } catch(e){}
                      const notaData = memoryNfces[pedido.id] || nfcesEmitidas[pedido.id] || notaSalva;

                      return (
                       <tr key={pedido.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-900">#{pedido.shortId}</td>
                          <td className="px-4 py-3">{new Date(pedido.createdAt).toLocaleString('pt-BR')}</td>
                          <td className="px-4 py-3">
                             <span className="font-bold">{pedido.client?.name || 'Avulso'}</span>
                             {pedido.client?.cpf && pedido.client.cpf.replace(/\D/g, '').length >= 11 && (
                                <span className="block mt-1 w-max bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-200 shadow-sm">🏷️ CPF na Nota: {pedido.client.cpf}</span>
                             )}
                          </td>
                          <td className="px-4 py-3 text-emerald-600 font-bold">R$ {Number(pedido.total).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right flex justify-end gap-2">
                             {notaData ? (
                                <>
                                   <button onClick={() => emitirEImprimirNfceProp(pedido.id)} disabled={loadingNfceId === pedido.id} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg transition-colors text-xs shadow-sm cursor-pointer">🖨️ Re-Imprimir</button>
                                   {notaData.urlDanfe && ( <a href={notaData.urlDanfe} target="_blank" rel="noopener noreferrer" className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-xs shadow-sm">📄 Web</a> )}
                                </>
                             ) : (
                                <button onClick={() => emitirEImprimirNfceProp(pedido.id)} disabled={loadingNfceId === pedido.id} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 text-xs shadow-sm cursor-pointer">{loadingNfceId === pedido.id ? 'Emitindo...' : '🧾 Emitir NFC-e'}</button>
                             )}
                          </td>
                       </tr>
                      )
                   })}
                   {orders.filter(o => o.status === 'READY' || o.status === 'DELIVERED').length === 0 && (
                      <tr><td colSpan="5" className="text-center py-6 text-slate-400">Nenhum pedido finalizado ainda.</td></tr>
                   )}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* ABA: REGRAS TRIBUTÁRIAS */}
      {fiscalSubTab === 'config' && (
        <div className="space-y-6 animate-fade-in-up">
           
          {/* 1. ICMS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-2">1. Configurar ICMS</h3>
            <form onSubmit={handleAddIcms} className="flex flex-col gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input required placeholder="Descrição (Ex: Tributado Normal)" value={formIcms.descricao || ''} onChange={e=>setFormIcms({...formIcms, descricao: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full focus:outline-emerald-500 font-bold" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required placeholder="CFOP (Ex: 5102)" value={formIcms.cfop || ''} onChange={e=>setFormIcms({...formIcms, cfop: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full focus:outline-emerald-500" />
                <input required placeholder="CST/CSOSN (Ex: 102)" value={formIcms.cst || ''} onChange={e=>setFormIcms({...formIcms, cst: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full focus:outline-emerald-500" />
                <input required placeholder="Alíquota ICMS (%)" value={formIcms.aliquota || ''} onChange={e=>setFormIcms({...formIcms, aliquota: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full focus:outline-emerald-500" />
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                {formIcms.id && (
                  <button type="button" onClick={() => setFormIcms({ id: '', descricao: '', regime: 'Simples Nacional', cfop: '', cst: '', aliquota: '' })} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm">Cancelar</button>
                )}
                <button type="submit" className={`${formIcms.id ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm`}>
                  {formIcms.id ? '💾 Salvar Edição' : 'Add ICMS'}
                </button>
              </div>
            </form>
            <div className="space-y-2">
              {fiscalData.icms?.map(i => (
                <div key={i.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">{i.descricao}</span>
                    <span className="text-xs text-slate-500">CFOP: {i.cfop} | CST/CSOSN: {i.cst} | Alíq: {i.aliquota || '0'}%</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFormIcms(i)} className="text-blue-600 font-bold text-xs bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Editar</button>
                    <button onClick={() => handleDeleteIcms(i.id)} className="text-red-500 font-bold text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">Excluir</button>
                  </div>
                </div>
              ))}
              {(!fiscalData.icms || fiscalData.icms.length === 0) && <p className="text-xs text-slate-400 italic">Nenhuma regra de ICMS configurada.</p>}
            </div>
          </div>

          {/* 2. PIS/COFINS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-2">2. Configurar PIS/COFINS</h3>
            <form onSubmit={handleAddPis} className="flex flex-col gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input required placeholder="Descrição (Ex: Tributado Normal)" value={formPis.descricao || ''} onChange={e=>setFormPis({...formPis, descricao: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full focus:outline-emerald-500 font-bold" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                   <input required placeholder="CST PIS (Ex: 49)" value={formPis.cstPis || ''} onChange={e=>setFormPis({...formPis, cstPis: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm flex-1 focus:outline-emerald-500" />
                   <input required placeholder="Alíq. PIS (%)" value={formPis.aliqPis || ''} onChange={e=>setFormPis({...formPis, aliqPis: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm flex-1 focus:outline-emerald-500" />
                </div>
                <div className="flex gap-2">
                   <input required placeholder="CST COFINS (Ex: 49)" value={formPis.cstCofins || ''} onChange={e=>setFormPis({...formPis, cstCofins: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm flex-1 focus:outline-emerald-500" />
                   <input required placeholder="Alíq. COFINS (%)" value={formPis.aliqCofins || ''} onChange={e=>setFormPis({...formPis, aliqCofins: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm flex-1 focus:outline-emerald-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                {formPis.id && (
                  <button type="button" onClick={() => setFormPis({ id: '', descricao: '', cstPis: '', aliqPis: '', cstCofins: '', aliqCofins: '' })} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm">Cancelar</button>
                )}
                <button type="submit" className={`${formPis.id ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm`}>
                  {formPis.id ? '💾 Salvar Edição' : 'Add PIS/COFINS'}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {fiscalData.pisCofins?.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">{p.descricao}</span>
                    <span className="text-xs text-slate-500">PIS: {p.cstPis} ({p.aliqPis}%) | COFINS: {p.cstCofins} ({p.aliqCofins}%)</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFormPis(p)} className="text-blue-600 font-bold text-xs bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Editar</button>
                    <button onClick={() => handleDeletePis(p.id)} className="text-red-500 font-bold text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">Excluir</button>
                  </div>
                </div>
              ))}
              {(!fiscalData.pisCofins || fiscalData.pisCofins.length === 0) && <p className="text-xs text-slate-400 italic">Nenhuma regra de PIS/COFINS configurada.</p>}
            </div>
          </div>

          {/* 3. IBS/CBS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-2">3. Configurar IBS/CBS (Reforma)</h3>
            <form onSubmit={handleAddIbsCbs} className="flex flex-col md:flex-row gap-3 mb-6">
              <input required placeholder="Descrição (Ex: Alíquota Padrão)" value={formIbsCbs.descricao} onChange={e=>setFormIbsCbs({...formIbsCbs, descricao: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm flex-1 focus:outline-emerald-500" />
              <input required placeholder="Alíq IBS (%)" value={formIbsCbs.aliqIbsUf} onChange={e=>setFormIbsCbs({...formIbsCbs, aliqIbsUf: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full md:w-32 focus:outline-emerald-500" />
              <input required placeholder="Alíq CBS (%)" value={formIbsCbs.aliqCbs} onChange={e=>setFormIbsCbs({...formIbsCbs, aliqCbs: e.target.value})} className="border border-slate-300 p-3 rounded-xl text-sm w-full md:w-32 focus:outline-emerald-500" />
              {formIbsCbs.id && (
                <button type="button" onClick={() => setFormIbsCbs({ id: '', descricao: '', cst: '000', classificacao: '000001', aliqIbsUf: '0.1', aliqCbs: '0.9' })} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm">Cancelar</button>
              )}
              <button type="submit" className={`${formIbsCbs.id ? 'bg-amber-500 hover:bg-amber-600 text-black' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} px-6 py-3 rounded-xl font-bold cursor-pointer transition-colors shadow-sm`}>
                {formIbsCbs.id ? 'Salvar Edição' : 'Add IBS/CBS'}
              </button>
            </form>
            <div className="space-y-2">
              {fiscalData.ibsCbs?.map(i => (
                <div key={i.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-700">{i.descricao} | IBS: {i.aliqIbsUf}% | CBS: {i.aliqCbs}%</span>
                  <div className="flex gap-2">
                    <button onClick={() => setFormIbsCbs(i)} className="text-blue-600 font-bold text-xs bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm">Editar</button>
                    <button onClick={() => handleDeleteIbsCbs(i.id)} className="text-red-500 font-bold text-xs bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">Excluir</button>
                  </div>
                </div>
              ))}
              {(!fiscalData.ibsCbs || fiscalData.ibsCbs.length === 0) && <p className="text-xs text-slate-400 italic">Nenhuma regra de IBS/CBS configurada.</p>}
            </div>
          </div>

          {/* 4. MONTAGEM DA REGRA FINAL */}
          <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md">
            <h3 className="text-xl font-black text-amber-500 mb-2">4. Montar Regra Fiscal Completa</h3>
            <p className="text-sm text-slate-400 mb-6">Combine os impostos para criar a regra final que será vinculada aos seus produtos ou grupos.</p>
            <form onSubmit={handleAddRegra} className="flex flex-col gap-4 mb-6 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
              <input required placeholder="Nome da Regra Pronta (Ex: Produto Isento NFe)" value={formRegra.descricao} onChange={e=>setFormRegra({...formRegra, descricao: e.target.value})} className="bg-slate-950 text-white border-none p-4 rounded-xl text-sm w-full focus:ring-1 focus:ring-amber-500" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select required value={formRegra.icmsId} onChange={e=>setFormRegra({...formRegra, icmsId: e.target.value})} className="bg-slate-950 text-white border-none p-4 rounded-xl text-sm cursor-pointer">
                  <option value="">1. Selecione o ICMS...</option>
                  {fiscalData.icms?.map(i => <option key={i.id} value={i.id}>{i.descricao}</option>)}
                </select>
                <select required value={formRegra.pisCofinsId} onChange={e=>setFormRegra({...formRegra, pisCofinsId: e.target.value})} className="bg-slate-950 text-white border-none p-4 rounded-xl text-sm cursor-pointer">
                  <option value="">2. Selecione PIS/COFINS...</option>
                  {fiscalData.pisCofins?.map(p => <option key={p.id} value={p.id}>{p.descricao}</option>)}
                </select>
                <select required value={formRegra.ibsCbsId} onChange={e=>setFormRegra({...formRegra, ibsCbsId: e.target.value})} className="bg-slate-950 text-white border-none p-4 rounded-xl text-sm cursor-pointer">
                  <option value="">3. Selecione IBS/CBS...</option>
                  {fiscalData.ibsCbs?.map(i => <option key={i.id} value={i.id}>{i.descricao}</option>)}
                </select>
              </div>
              
              <div className="flex gap-4 mt-2">
                {formRegra.id && (
                  <button type="button" onClick={() => setFormRegra({ id: '', ordenar: '', descricao: '', icmsId: '', pisCofinsId: '', ibsCbsId: '', ipi: '' })} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-4 rounded-xl font-black transition-colors shadow-lg cursor-pointer">Cancelar Edição</button>
                )}
                <button type="submit" className={`flex-2 ${formRegra.id ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-amber-500 hover:bg-amber-400'} text-black px-4 py-4 rounded-xl font-black transition-colors shadow-lg cursor-pointer`}>
                  {formRegra.id ? '💾 Salvar Edição da Regra' : '💾 Salvar Regra Fiscal Pronta'}
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm mb-3">Suas Regras Prontas:</h4>
              {fiscalData.regras?.map(r => {
                const icms = fiscalData.icms?.find(x => x.id === r.icmsId);
                const pis = fiscalData.pisCofins?.find(x => x.id === r.pisCofinsId);
                const ibs = fiscalData.ibsCbs?.find(x => x.id === r.ibsCbsId);
                return (
                  <div key={r.id} className="flex justify-between items-center bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <div>
                       <span className="text-base font-black text-amber-500 block mb-1">{r.descricao}</span>
                       <span className="text-[11px] text-slate-300 font-bold bg-slate-950 px-2 py-1 rounded inline-block">ICMS: {icms?.descricao || 'Não Encontrado'} | PIS/COF: {pis?.descricao || 'Não Encontrado'} | IBS/CBS: {ibs?.descricao || 'Não Encontrado'}</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setFormRegra(r)} className="text-blue-400 hover:text-white font-black text-xs px-4 py-2 bg-blue-500/20 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer">Editar</button>
                       <button onClick={() => handleDeleteRegra(r.id)} className="text-red-400 hover:text-white font-black text-xs px-4 py-2 bg-red-500/20 hover:bg-red-500 rounded-xl transition-colors cursor-pointer">Excluir</button>
                    </div>
                  </div>
                )
              })}
              {(!fiscalData.regras || fiscalData.regras.length === 0) && <p className="text-center text-slate-500 text-xs py-4">Nenhuma regra fiscal montada.</p>}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}