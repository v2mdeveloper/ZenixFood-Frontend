'use client';
import { useState, useEffect } from 'react';

export default function AjudaTab({ isAdmin }) {
  // Dados base do manual. No mundo real, os links de vídeo vêm da API (settings da loja).
  const modulosIniciais = [
    {
      id: 'pdv',
      icone: '💻',
      titulo: 'PDV Fixo (Caixa Principal)',
      descricao: 'O coração financeiro do restaurante. Onde se finalizam contas, se recebem valores, e se emitem os cupons fiscais.',
      topicos: [
        'Abertura e Fecho de Caixa com contagem cega.',
        'Registo de Sangrias (Retiradas) e Suprimentos (Entrada de Troco).',
        'Recebimento de Comandas e Mesas vindas do salão.',
        'Emissão de NFC-e nativa e impressão automática.'
      ],
      videoUrl: ''
    },
    {
      id: 'lancamentos',
      icone: '📱',
      titulo: 'App Lançamentos (Garçom / Smart POS)',
      descricao: 'O aplicativo móvel usado pela equipa de salão para registar pedidos diretamente na mesa e fazer cobranças nas maquininhas.',
      topicos: [
        'Abertura de Mesas e Comandas Individuais.',
        'Lançamento rápido e uso do Construtor de Pizzas (Meio a Meio).',
        'Transferência de itens e união de mesas.',
        'Cobrança direta na mesa via Deep Link (Stone, PagSeguro).'
      ],
      videoUrl: ''
    },
    {
      id: 'totem',
      icone: '🤖',
      titulo: 'Totem de Autoatendimento',
      descricao: 'Sistema independente para o cliente fazer o próprio pedido, evitando filas e aumentando o ticket médio.',
      topicos: [
        'Tela de descanso multilíngue (PT, EN, ES).',
        'Navegação intuitiva por categorias e sugestão de combos (Upsell).',
        'Pagamento via PIX, Cartão na Máquina ou Pagamento no Caixa.',
        'Emissão de senha para retirada.'
      ],
      videoUrl: ''
    },
    {
      id: 'kds',
      icone: '👨‍🍳',
      titulo: 'Monitor da Cozinha (KDS)',
      descricao: 'Chega de papel! Tela que organiza os pedidos por ordem de chegada e tempo de preparo.',
      topicos: [
        'Visualização de pedidos com cronômetro de atraso.',
        'Destaque para observações (ex: Sem Cebola).',
        'Avisos sonoros para novos pedidos.',
        'Integração com painel de chamadas de senha.'
      ],
      videoUrl: ''
    },
    {
      id: 'cardapio',
      icone: '🍔',
      titulo: 'Gestão de Cardápio e Produtos',
      descricao: 'Painel para criar, editar e organizar tudo o que o seu restaurante vende.',
      topicos: [
        'Criação de Produtos Simples, Pizzas e Combos.',
        'Configuração de Adicionais e Insumos.',
        'Gestão de estoque e ocultar produtos esgotados.',
        'Vinculação de Regras Fiscais (NCM, ICMS) aos produtos.'
      ],
      videoUrl: ''
    },
    {
      id: 'fiscal',
      icone: '🧾',
      titulo: 'Inteligência Fiscal (NFC-e)',
      descricao: 'Onde se configura a burocracia para que o sistema emita notas fiscais automaticamente sem custos de terceiros.',
      topicos: [
        'Upload de Certificado Digital A1 (.pfx).',
        'Configuração de Credenciais SEFAZ e Ambiente (Homologação/Produção).',
        'Criação de regras dinâmicas de ICMS, PIS/COFINS e IBS/CBS.',
        'Painel de contingência para re-emitir ou cancelar notas rejeitadas.'
      ],
      videoUrl: ''
    },
    {
      id: 'integracoes',
      icone: '🔌',
      titulo: 'Hub de Integrações',
      descricao: 'Conexão do ZenixFood com o mundo exterior (Delivery e Bancos).',
      topicos: [
        'Credenciais iFood, 99Food e Keeta (Recebimento automático).',
        'Ativação do Mercado Pago (Pix Online).',
        'Configuração da marca da Smart POS (Stone, PagSeguro) para o App Lançamentos.'
      ],
      videoUrl: ''
    }
  ];

  const [modulos, setModulos] = useState(modulosIniciais);
  const [editingId, setEditingId] = useState(null);
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // No mundo real, você carregaria os vídeos guardados no backend num useEffect aqui.

  const handleSaveVideo = (id) => {
    // Atualiza o estado local (no mundo real, faria um fetch(PUT) para a API)
    setModulos(modulos.map(m => m.id === id ? { ...m, videoUrl: tempVideoUrl } : m));
    setEditingId(null);
    alert('Link do vídeo salvo com sucesso! Os seus funcionários já podem assistir.');
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url; // Retorna normal se for um link direto (Vimeo, Drive, etc)
  };

  return (
    <div className="animate-fade-in-up space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* CABEÇALHO */}
      <div className="bg-white p-8 rounded-[2rem] border border-blue-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <span className="text-4xl">🎓</span> Universidade Zenix
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium max-w-2xl">
            Bem-vindo à Central de Ajuda! Selecione o módulo abaixo para entender como ele funciona no dia a dia da operação e assista aos vídeos de treinamento oficiais da sua gerência.
          </p>
        </div>
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shrink-0 max-w-xs text-center">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Modo Administrador</p>
            <p className="text-xs text-amber-800 font-medium">Você tem permissão para editar os links de vídeo de cada módulo. Os seus funcionários verão apenas o player.</p>
          </div>
        )}
      </div>

      {/* LISTA DE MÓDULOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modulos.map((modulo) => (
          <div key={modulo.id} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col h-full hover:border-blue-300 transition-colors group">
            
            <div className="flex items-start gap-4 mb-4 border-b border-slate-100 pb-4">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform">
                {modulo.icone}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{modulo.titulo}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">{modulo.descricao}</p>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">O que você vai aprender:</h4>
              <ul className="space-y-2">
                {modulo.topicos.map((topico, index) => (
                  <li key={index} className="text-sm font-bold text-slate-700 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span> {topico}
                  </li>
                ))}
              </ul>
            </div>

            {/* ÁREA DO VÍDEO (PLAYER OU EDIÇÃO) */}
            <div className="mt-auto bg-slate-900 rounded-2xl p-4 border border-slate-800">
              {editingId === modulo.id ? (
                <div className="animate-fade-in-up">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Colar Link do YouTube</label>
                  <input 
                    type="text" 
                    value={tempVideoUrl} 
                    onChange={(e) => setTempVideoUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 mb-3"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                    <button onClick={() => handleSaveVideo(modulo.id)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black py-3 rounded-xl transition-colors cursor-pointer">Salvar Vídeo</button>
                  </div>
                </div>
              ) : (
                <>
                  {modulo.videoUrl ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black mb-3">
                      <iframe 
                        src={getEmbedUrl(modulo.videoUrl)} 
                        className="absolute top-0 left-0 w-full h-full" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-slate-800 flex flex-col items-center justify-center border border-dashed border-slate-700 mb-3 text-center p-4">
                      <span className="text-3xl mb-2">🎥</span>
                      <p className="text-xs font-bold text-slate-400">Nenhum vídeo de treino disponível ainda.</p>
                    </div>
                  )}

                  {isAdmin && (
                    <button 
                      onClick={() => { setEditingId(modulo.id); setTempVideoUrl(modulo.videoUrl); }} 
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors cursor-pointer border border-slate-700 flex items-center justify-center gap-2"
                    >
                      ✏️ Editar Link do Vídeo
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}