'use client';
import { useState } from 'react';

export default function AjudaTab({ isAdmin }) {
  // Estado para controlar a aba selecionada na Central de Ajuda
  const [activeHelpTab, setActiveHelpTab] = useState('geral');

  const modulosGeral = [
    {
      id: 'visao_geral',
      icone: '🚀',
      titulo: 'Visão Geral do ZenixFood',
      descricao: 'Bem-vindo ao ZenixFood! Este módulo apresenta o poder do sistema.',
      topicos: [
        'Como o ZenixFood centraliza todos os setores do seu restaurante num único lugar.',
        'A jornada do pedido: Desde o Garçom/Totem/Delivery até à Cozinha e ao Caixa.',
        'Como a gestão em tempo real ajuda a evitar perdas e aumentar lucros.',
        'O poder do ecossistema: PDV, KDS, Fiscal, Integrações e Gestão integrados.'
      ],
      videoUrl: ''
    }
  ];

  const modulosOperacional = [
    {
      id: 'pdv',
      icone: '💻',
      titulo: 'PDV Fixo (Caixa Principal)',
      descricao: 'O coração financeiro do restaurante, desenhado para ser rápido e à prova de falhas[cite: 1].',
      topicos: [
        'Abertura e Fecho de Caixa com contagem cega para segurança total.',
        'Registo de Sangrias (Retiradas de dinheiro em excesso) e Suprimentos (Entrada de moedas para troco).',
        'Recebimento ágil de Comandas e Mesas vindas do salão e aplicação de descontos.',
        'Emissão de NFC-e nativa e impressão automática de recibos térmicos no balcão.'
      ],
      videoUrl: ''
    },
    {
      id: 'salao',
      icone: '🪑',
      titulo: 'Salão & Mesas / Lançamentos',
      descricao: 'O módulo para os garçons e operadores de salão controlarem o fluxo de clientes[cite: 1].',
      topicos: [
        'Abertura de Mesas e Comandas Individuais associando o nome do cliente.',
        'Lançamento rápido de pedidos, incluindo o Construtor de Pizzas (Meio a Meio) e combos.',
        'Transferência de itens entre comandas e união de mesas.',
        'Cobrança direta na mesa via Deep Link (nas Smart POS da Stone, PagSeguro, Mercado Pago).'
      ],
      videoUrl: ''
    },
    {
      id: 'kds',
      icone: '🖥️',
      titulo: 'Telas KDS (Monitor de Produção)',
      descricao: 'O fim dos papéis na cozinha! Organiza a produção de forma digital e inteligente[cite: 1].',
      topicos: [
        'Telas separadas para Cozinha Principal, Expedição (Delivery) e Bar de Bebidas.',
        'Visualização de pedidos com cronômetro de atraso (verde, amarelo e vermelho).',
        'Destaque visual para observações (ex: "Sem Cebola") para evitar devoluções.',
        'Painel do Cliente (TV) para chamar a senha quando o pedido está pronto.'
      ],
      videoUrl: ''
    },
    {
      id: 'expedicao',
      icone: '🛵',
      titulo: 'Expedição & Rotas (Delivery)',
      descricao: 'Controlo total sobre as entregas e os motoboys[cite: 1].',
      topicos: [
        'Recepção de pedidos de Delivery (telefone, iFood, etc).',
        'Atribuição de pedidos específicos para cada motoboy.',
        'Acompanhamento do status de saída e retorno.',
        'Fecho do motoboy no fim do turno (acerto de contas).'
      ],
      videoUrl: ''
    },
    {
      id: 'totem',
      icone: '🤖',
      titulo: 'Totem de Autoatendimento',
      descricao: 'A experiência de auto-pedido para os clientes, reduzindo filas no caixa.',
      topicos: [
        'Tela de descanso com atração visual e suporte a múltiplos idiomas.',
        'Navegação intuitiva pelo catálogo com ofertas de combos automáticos (Upsell).',
        'Pagamento direto no totem via PIX ou Cartão (Smart POS embutida).',
        'Impressão ou exibição de senha para retirar o pedido no balcão.'
      ],
      videoUrl: ''
    }
  ];

  const modulosProdutosEstoque = [
    {
      id: 'produtos',
      icone: '🍟',
      titulo: 'Gestão de Produtos e Categorias',
      descricao: 'A base do sistema: Onde você cria o que vende[cite: 1].',
      topicos: [
        'Criação de Produtos Simples, configuração de Preços por tamanho (700g, 1kg).',
        'Criação de Pizzas (configurando limites de sabores) e Combos.',
        'Criação de Categorias organizando se o item vai para o "Bar" ou "Cozinha".',
        'Organização da ordem de exibição no Totem, App Lançamentos e Cardápio Digital.'
      ],
      videoUrl: ''
    },
    {
      id: 'estoque',
      icone: '📦',
      titulo: 'Estoque, Insumos e Fichas Técnicas',
      descricao: 'Controle de custos e ingredientes[cite: 1].',
      topicos: [
        'Cadastro de Insumos (ingredientes) e gestão manual de estoque.',
        'Importação de XML de Notas Fiscais de Compra para atualizar o estoque automaticamente.',
        'Criação da Ficha Técnica: ligando os insumos aos produtos finais para baixar o estoque na venda.',
        'Análise de CMV (Custo da Mercadoria Vendida) para saber se a sua margem de lucro é saudável.'
      ],
      videoUrl: ''
    },
    {
      id: 'impressoes',
      icone: '🖨️',
      titulo: 'Grupos de Produção e Impressoras',
      descricao: 'Roteamento inteligente de impressão[cite: 1].',
      topicos: [
        'Cadastro de Impressoras Físicas (IP ou USB) na rede local.',
        'Criação de Grupos de Produção (ex: "Grelha", "Copa").',
        'Associação de produtos aos grupos para que cada item saia na impressora certa.',
        'Amarração de Regras Fiscais padrão por grupo de produtos.'
      ],
      videoUrl: ''
    }
  ];

  const modulosGestaoRelatorios = [
    {
      id: 'financeiro',
      icone: '💸',
      titulo: 'Contas, Turnos e Financeiro',
      descricao: 'A saúde financeira do seu negócio ao seu alcance[cite: 1].',
      topicos: [
        'Controle de Contas a Pagar e a Receber.',
        'Resumo de Turnos e Faturamento (fechamento cego dos caixas).',
        'Relatório DRE (Demonstrativo de Resultado do Exercício) detalhado.',
        'Acesso ao histórico completo de vendas realizadas.'
      ],
      videoUrl: ''
    },
    {
      id: 'historico_analytics',
      icone: '📊',
      titulo: 'Relatórios Analíticos e Histórico',
      descricao: 'Entenda os números para tomar decisões[cite: 1].',
      topicos: [
        'Histórico completo de pedidos, permitindo re-impressão e cancelamentos.',
        'Análise de Top Produtos vendidos.',
        'Gráficos de acessos e visualizações do Cardápio Digital (Analytics).',
        'Métricas de desempenho da loja.'
      ],
      videoUrl: ''
    },
    {
      id: 'rh_crm',
      icone: '👔',
      titulo: 'Equipe (RH) e Clientes (CRM)',
      descricao: 'Gerencie quem trabalha para si e quem compra de si[cite: 1].',
      topicos: [
        'Criação de Perfis de Acesso (definindo o que cada cargo pode ver).',
        'Cadastro de Funcionários, definição de senhas e limites de "Fiado".',
        'Gestão de Comissões e taxas de serviço da equipe de salão.',
        'Cadastro de Clientes, histórico de consumos e clientes bloqueados.'
      ],
      videoUrl: ''
    },
    {
      id: 'promocoes',
      icone: '🎟️',
      titulo: 'Promoções e Cupons',
      descricao: 'Estratégias para impulsionar as vendas[cite: 1].',
      topicos: [
        'Criação de Cupons de Desconto (Valor fixo ou Percentual).',
        'Definição de regras de uso (Valor mínimo de compra, limite de utilizações).',
        'Gestão de produtos em destaque nas plataformas digitais.'
      ],
      videoUrl: ''
    }
  ];

  const modulosConfiguracoes = [
    {
      id: 'fiscal',
      icone: '🧾',
      titulo: 'Emissão Fiscal (NFC-e)',
      descricao: 'Sistema próprio para emissão de notas sem dependência de terceiros[cite: 1].',
      topicos: [
        'Upload seguro do Certificado Digital A1 (.pfx).',
        'Configuração de Credenciais SEFAZ (CSC) e ambiente (Produção/Homologação).',
        'Criação dinâmica de Regras de ICMS, PIS/COFINS e IBS/CBS.',
        'Painel da Fila de Emissão para re-tentar ou cancelar cupons rejeitados.'
      ],
      videoUrl: ''
    },
    {
      id: 'integracoes',
      icone: '🔌',
      titulo: 'Hub de Integrações',
      descricao: 'Conexões essenciais do seu negócio[cite: 2].',
      topicos: [
        'Conexão com plataformas de Delivery (iFood, 99Food, Keeta).',
        'Configuração do Mercado Pago para recebimentos online.',
        'Seleção da Adquirente da Smart POS (Stone, PagSeguro) para ativação do App-to-App.'
      ],
      videoUrl: ''
    },
    {
      id: 'config',
      icone: '⚙️',
      titulo: 'Configurações e Minha Empresa',
      descricao: 'Ajustes globais do sistema[cite: 2].',
      topicos: [
        'Ajuste do Horário de Funcionamento e abertura manual da loja.',
        'Configuração de logotipos, banners e taxas de entrega.',
        'Gerenciamento dos dados da empresa (CNPJ, Razão Social) e status da assinatura ZenixFood.'
      ],
      videoUrl: ''
    }
  ];

  const [modulos, setModulos] = useState([...modulosGeral, ...modulosOperacional, ...modulosProdutosEstoque, ...modulosGestaoRelatorios, ...modulosConfiguracoes]);
  const [editingId, setEditingId] = useState(null);
  const [tempVideoUrl, setTempVideoUrl] = useState('');

  // Lógica para determinar quais módulos mostrar com base na aba selecionada
  let modulosExibidos = [];
  if (activeHelpTab === 'geral') modulosExibidos = modulos.filter(m => modulosGeral.find(mg => mg.id === m.id));
  if (activeHelpTab === 'operacional') modulosExibidos = modulos.filter(m => modulosOperacional.find(mo => mo.id === m.id));
  if (activeHelpTab === 'produtos') modulosExibidos = modulos.filter(m => modulosProdutosEstoque.find(mp => mp.id === m.id));
  if (activeHelpTab === 'gestao') modulosExibidos = modulos.filter(m => modulosGestaoRelatorios.find(mg => mg.id === m.id));
  if (activeHelpTab === 'config') modulosExibidos = modulos.filter(m => modulosConfiguracoes.find(mc => mc.id === m.id));


  const handleSaveVideo = (id) => {
    setModulos(modulos.map(m => m.id === id ? { ...m, videoUrl: tempVideoUrl } : m));
    setEditingId(null);
    alert('Link do vídeo salvo com sucesso! Os seus funcionários já podem assistir.');
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url; 
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
            Bem-vindo à Central de Ajuda! Selecione a área desejada abaixo para entender os módulos em detalhes e assistir aos vídeos oficiais de treinamento da sua loja.
          </p>
        </div>
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shrink-0 max-w-xs text-center">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Modo Administrador</p>
            <p className="text-xs text-amber-800 font-medium">Você tem permissão para editar os links de vídeo. Seus funcionários verão apenas o player.</p>
          </div>
        )}
      </div>

      {/* ABAS DE NAVEGAÇÃO */}
      <div className="flex flex-wrap gap-4 border-b border-slate-200 pb-4">
        <button 
          onClick={() => setActiveHelpTab('geral')} 
          className={`font-bold pb-2 transition-all cursor-pointer ${activeHelpTab === 'geral' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
        >
          🚀 Visão Geral
        </button>
        <button 
          onClick={() => setActiveHelpTab('operacional')} 
          className={`font-bold pb-2 transition-all cursor-pointer ${activeHelpTab === 'operacional' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
        >
          💻 Operacional & Vendas
        </button>
        <button 
          onClick={() => setActiveHelpTab('produtos')} 
          className={`font-bold pb-2 transition-all cursor-pointer ${activeHelpTab === 'produtos' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
        >
          🍟 Produtos & Estoque
        </button>
        <button 
          onClick={() => setActiveHelpTab('gestao')} 
          className={`font-bold pb-2 transition-all cursor-pointer ${activeHelpTab === 'gestao' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
        >
          📊 Gestão & Relatórios
        </button>
        <button 
          onClick={() => setActiveHelpTab('config')} 
          className={`font-bold pb-2 transition-all cursor-pointer ${activeHelpTab === 'config' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-500'}`}
        >
          ⚙️ Config. & Integrações
        </button>
      </div>

      {/* LISTA DE MÓDULOS DA ABA SELECIONADA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
        {modulosExibidos.map((modulo) => (
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
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Colar Link do Vídeo (YouTube, Vimeo...)</label>
                  <input 
                    type="text" 
                    value={tempVideoUrl} 
                    onChange={(e) => setTempVideoUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500 mb-3"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                    <button onClick={() => handleSaveVideo(modulo.id)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black py-3 rounded-xl transition-colors cursor-pointer">Salvar Link</button>
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
                      <p className="text-xs font-bold text-slate-400">Nenhum vídeo de treinamento vinculado a este módulo.</p>
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