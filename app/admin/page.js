'use client';
import { useState, useEffect } from 'react';

import AdminLogin from './components/AdminLogin';
import ExpeditionTab from './components/tabs/ExpeditionTab';
import OrderHistoryTab from './components/tabs/OrderHistoryTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import CategoriesTab from './components/tabs/CategoriesTab';
import CrmTab from './components/tabs/CrmTab';
import PromotionsTab from './components/tabs/PromotionsTab'; 
import ProductsTab from './components/tabs/ProductsTab';
import StockTab from './components/tabs/StockTab';
import FiscalTab from './components/tabs/FiscalTab';
import ConfigTab from './components/tabs/ConfigTab';
import SuppliersTab from './components/tabs/SuppliersTab';
import RhTab from './components/tabs/RhTab'; 
import PdvTab from './components/tabs/PdvTab'; 
import TurnosTab from './components/tabs/TurnosTab'; 
import SalaoTab from './components/tabs/SalaoTab';
import OrderDetailsModal from './components/modals/OrderDetailsModal';

function ImpressorasTab({ printers, setPrinters, productGroups, setProductGroups, fiscalData, API_URL, fetchWithStore }) {
  const [printerForm, setPrinterForm] = useState({ name: '', type: 'USB', address: '' });
  const [groupForm, setGroupForm] = useState({ name: '', printerId: '', regraFiscalId: '' });

  const fetchPrintersAndGroups = async () => {
    try {
      const pRes = await fetchWithStore(`${API_URL}/api/printers`);
      if (pRes.ok) setPrinters(await pRes.json());
      const gRes = await fetchWithStore(`${API_URL}/api/product-groups`);
      if (gRes.ok) setProductGroups(await gRes.json());
    } catch (e) { console.error(e); }
  };

  const handleAddPrinter = async (e) => {
    e.preventDefault();
    if (!printerForm.name || !printerForm.address) return alert("Preencha o Nome e o IP/Compartilhamento.");
    try {
      const res = await fetchWithStore(`${API_URL}/api/printers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(printerForm) });
      if ((await res.json()).success) { setPrinterForm({ name: '', type: 'USB', address: '' }); fetchPrintersAndGroups(); }
    } catch (e) { alert("Erro ao salvar impressora."); }
  };

  const handleDeletePrinter = async (id) => {
    if(!confirm("Excluir impressora? Grupos vinculados ficarão sem destino.")) return;
    try { await fetchWithStore(`${API_URL}/api/printers/${id}`, { method: 'DELETE' }); fetchPrintersAndGroups(); } catch (e) { alert("Erro"); }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name) return alert("Dê um nome ao grupo (ex: Bebidas Frias).");
    try {
      const res = await fetchWithStore(`${API_URL}/api/product-groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: groupForm.name, printerId: groupForm.printerId || null, regraFiscalId: groupForm.regraFiscalId || null }) });
      if ((await res.json()).success) { setGroupForm({ name: '', printerId: '', regraFiscalId: '' }); fetchPrintersAndGroups(); }
    } catch (e) { alert("Erro ao criar grupo."); }
  };

  const handleDeleteGroup = async (id) => {
    if(!confirm("Excluir grupo? Produtos associados a ele ficarão sem grupo.")) return;
    try { await fetchWithStore(`${API_URL}/api/product-groups/${id}`, { method: 'DELETE' }); fetchPrintersAndGroups(); } catch (e) { alert("Erro"); }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">🖨️ Cadastro de Impressoras</h3>
        <p className="text-sm text-slate-500 mb-6">Cadastre as impressoras físicas da sua loja (Cozinha, Bar, Expedição).</p>
        <form onSubmit={handleAddPrinter} className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <input type="text" name="printerName" placeholder="Nome (Ex: Grelha / Bar)" value={printerForm.name} onChange={e => setPrinterForm({...printerForm, name: e.target.value})} className="border border-slate-300 p-3 rounded-xl flex-1 focus:outline-amber-500 font-bold text-slate-700" />
          <select name="printerType" value={printerForm.type} onChange={e => setPrinterForm({...printerForm, type: e.target.value})} className="border border-slate-300 p-3 rounded-xl focus:outline-amber-500 text-slate-700 font-bold">
            <option value="USB">USB (Compartilhada)</option>
            <option value="IP">Rede (IP Local)</option>
          </select>
          <input type="text" name="printerAddress" placeholder={printerForm.type === 'IP' ? "Ex: 192.168.0.100" : "Ex: IMPCOZINHA"} value={printerForm.address} onChange={e => setPrinterForm({...printerForm, address: e.target.value})} className="border border-slate-300 p-3 rounded-xl flex-1 focus:outline-amber-500 font-bold text-slate-700" />
          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">Salvar</button>
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {printers.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div><p className="font-black text-slate-800 text-lg">{p.name}</p><p className="text-slate-500 text-sm font-medium">{p.type === 'IP' ? '🌐 IP:' : '🔌 USB:'} {p.address}</p></div>
              <button onClick={() => handleDeletePrinter(p.id)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-2 rounded-xl transition-all">Excluir</button>
            </div>
          ))}
          {printers.length === 0 && <p className="text-slate-400 italic">Nenhuma impressora cadastrada.</p>}
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">⚙️ Grupos de Produção (Praças)</h3>
        <p className="text-sm text-slate-500 mb-6">Crie grupos (Ex: Bebidas Frias) e direcione-os para a impressora correta.</p>
        <form onSubmit={handleAddGroup} className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <input type="text" name="groupName" placeholder="Nome do Grupo (Ex: Bebidas)" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} className="border border-slate-300 p-3 rounded-xl flex-1 focus:outline-amber-500 font-bold text-slate-700" />
          <select name="groupPrinterId" value={groupForm.printerId} onChange={e => setGroupForm({...groupForm, printerId: e.target.value})} className="border border-slate-300 p-3 rounded-xl flex-1 focus:outline-amber-500 text-slate-700 font-bold">
            <option value="">Sem Impressora (Não imprime ticket)</option>
            {printers.map(p => <option key={p.id} value={p.id}>Imprime em: {p.name}</option>)}
          </select>
          <select name="groupRegraFiscalId" value={groupForm.regraFiscalId} onChange={e => setGroupForm({...groupForm, regraFiscalId: e.target.value})} className="border border-slate-300 p-3 rounded-xl flex-1 focus:outline-amber-500 text-slate-700 font-bold">
            <option value="">Regra Fiscal Padrão (Nenhuma)</option>
            {fiscalData.regras && fiscalData.regras.map(r => <option key={r.id} value={r.id}>{r.descricao}</option>)}
          </select>
          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-black transition-all shadow-md">Criar Grupo</button>
        </form>
        <div className="grid grid-cols-1 gap-3">
          {productGroups.map(g => (
            <div key={g.id} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
              <div className="flex gap-6 items-center">
                <p className="font-black text-slate-800 text-lg">{g.name}</p>
                <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold">🖨️ {g.printer?.name || 'Nenhuma (Apenas Caixa)'}</span>
                {g.regraFiscalId && <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg text-xs font-bold">🧾 Tem Regra Fiscal</span>}
              </div>
              <button onClick={() => handleDeleteGroup(g.id)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-2 rounded-xl transition-all">Excluir</button>
            </div>
          ))}
          {productGroups.length === 0 && <p className="text-slate-400 italic">Nenhum grupo criado.</p>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loggedEmployee, setLoggedEmployee] = useState(null);
  const [adminLoginForm, setAdminLoginForm] = useState({ storeId: '', email: '', password: '' });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('pdv'); 
  const [isKdsMenuOpen, setIsKdsMenuOpen] = useState(false); 

  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIsDrink, setNewCategoryIsDrink] = useState(false);
  
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', price700g: '', price1kg: '', costPrice: '', categoryId: '', imageUrl: '', regraFiscalId: '', ncm: '', ean: '', groupId: '' });
  
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [visitsData, setVisitsData] = useState({ visits: [], totalVisits: 0 });
  const [adminConfig, setAdminConfig] = useState({ name: '', email: '', password: '' });
  
  const [settingsForm, setSettingsForm] = useState({
    isManualFechado: false, deliveryFee: 5.00, cashbackPercent: 5,
    promoBannerUrl: '', promoBannerLink: '',
    youtubeLiveId: '', printerName: '', 
    aboutUsText: '', 
    schedule: {
      "0": { isOpen: true, open: "18:00", close: "23:30" }, 
      "1": { isOpen: false, open: "18:00", close: "23:30" }, 
      "2": { isOpen: true, open: "18:00", close: "23:30" }, 
      "3": { isOpen: true, open: "18:00", close: "23:30" }, 
      "4": { isOpen: true, open: "18:00", close: "23:30" }, 
      "5": { isOpen: true, open: "18:00", close: "23:30" }, 
      "6": { isOpen: true, open: "18:00", close: "23:30" }
    }
  });

  const [fiscalData, setFiscalData] = useState({ icms: [], pisCofins: [], ibsCbs: [], regras: [], cnpjLoja: '' });
  const [formIcms, setFormIcms] = useState({ id: '', descricao: '', regime: 'Simples Nacional', cfop: '', cst: '', aliquota: '' });
  const [formPis, setFormPis] = useState({ id: '', descricao: '', cstPis: '', aliqPis: '', cstCofins: '', aliqCofins: '' });
  const [formIbsCbs, setFormIbsCbs] = useState({ id: '', descricao: '', cst: '000', classificacao: '000001', aliqIbsUf: '0.1', aliqCbs: '0.9' });
  const [formRegra, setFormRegra] = useState({ id: '', ordenar: '', descricao: '', icmsId: '', pisCofinsId: '', ibsCbsId: '', ipi: '' });
  
  const [fiscalSubTab, setFiscalSubTab] = useState('fila');
  const [loadingNfceId, setLoadingNfceId] = useState(null);
  const [isAutoPrintEnabled, setIsAutoPrintEnabled] = useState(true);
  const [printedOrderIds, setPrintedOrderIds] = useState([]);
  const [printingOrder, setPrintingOrder] = useState(null);
  
  const [printers, setPrinters] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

  const [insumos, setInsumos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [fichasVisiveis, setFichasVisiveis] = useState({});
  const [novoInsumo, setNovoInsumo] = useState({ name: '', unit: 'UN', cost: '', stock: '' });
  const [xmlFile, setXmlFile] = useState(null);
  const [estoqueSubTab, setEstoqueSubTab] = useState('insumos');
  const [novaMovimentacao, setNovaMovimentacao] = useState({ insumoId: '', type: 'IN', quantity: '', reason: '' });
  const [editingInsumo, setEditingInsumo] = useState(null);
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [xmlPreviewData, setXmlPreviewData] = useState({ chaveNfe: '', items: [] });
  const [xmlMappings, setXmlMappings] = useState({});
  const [promoSubTab, setPromoSubTab] = useState('destaques');
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: '', type: 'FIXED', value: '', minOrderValue: '0', maxUses: '0' });
  const [nfcesEmitidas, setNfcesEmitidas] = useState({}); 

  const API_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))) 
    ? 'http://localhost:3333' 
    : 'https://zenixfood-backend.onrender.com';

  // 🛡️ Helper para injetar o x-store-id e o Token JWT automaticamente em todas as requisições
  const fetchWithStore = async (url, options = {}) => {
    const token = localStorage.getItem('zenix_token');
    const storeId = localStorage.getItem('zenix_store_id');

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(storeId && { 'x-store-id': storeId }),
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('zenix_token');
    const savedEmployee = localStorage.getItem('zenix_loggedEmployee');
    
    if (savedToken) {
      setIsAdminAuthenticated(true);
      if (savedEmployee) {
        setLoggedEmployee(JSON.parse(savedEmployee));
      } else {
        const fallbackAdmin = { id: 'ADMIN_MASTER', name: 'Administrador', role: 'ADMIN' };
        setLoggedEmployee(fallbackAdmin);
        localStorage.setItem('zenix_loggedEmployee', JSON.stringify(fallbackAdmin));
      }
    }
    
    const cachedPrints = sessionStorage.getItem('zenix_printedIds');
    if (cachedPrints) setPrintedOrderIds(JSON.parse(cachedPrints));

    const autoPrintSetting = localStorage.getItem('zenix_autoPrint');
    if (autoPrintSetting !== null) setIsAutoPrintEnabled(autoPrintSetting === 'true');

    const savedNfces = localStorage.getItem('zenix_nfcesEmitidas');
    if (savedNfces) setNfcesEmitidas(JSON.parse(savedNfces));
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      if (!loggedEmployee || !loggedEmployee.role?.toLowerCase().includes('entregador')) {
        fetchAllData();
        const interval = setInterval(fetchOrders, 7000);
        return () => clearInterval(interval);
      }
    } else {
      setLoading(false);
    }
  }, [isAdminAuthenticated, loggedEmployee]);

  useEffect(() => {
    if (newProduct.groupId) {
      const grp = productGroups.find(g => g.id === newProduct.groupId);
      if (grp && grp.regraFiscalId) setNewProduct(p => ({ ...p, regraFiscalId: grp.regraFiscalId }));
    }
  }, [newProduct.groupId, productGroups]);

  useEffect(() => {
    if (editingProduct?.groupId) {
      const grp = productGroups.find(g => g.id === editingProduct.groupId);
      if (grp && grp.regraFiscalId) setEditingProduct(p => ({ ...p, regraFiscalId: grp.regraFiscalId }));
    }
  }, [editingProduct?.groupId, productGroups]);

  useEffect(() => {
    if (printingOrder) {
      const mandarParaImpressorasLocais = async () => {
        try {
          const jobs = {}; 
          for (const item of printingOrder.items) {
             const product = allProducts.find(p => p.id === item.productId);
             let pId = 'DEFAULT'; 
             if (product && product.groupId) {
                const grp = productGroups.find(g => g.id === product.groupId);
                if (grp && grp.printerId) pId = grp.printerId;
             }
             if (!jobs[pId]) jobs[pId] = [];
             jobs[pId].push(item);
          }

          for (const [pId, items] of Object.entries(jobs)) {
             const printerObj = printers.find(p => p.id === pId);
             const printerConfig = printerObj ? { type: printerObj.type, address: printerObj.address } : null;
             const isPartial = pId !== 'DEFAULT'; 
             const partialOrder = { ...printingOrder, items };

             await fetch('http://localhost:8080/imprimir', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ pedido: partialOrder, printerName: settingsForm.printerName, printerConfig, isPartial })
             });
          }
        } catch (error) {
          console.error("Erro no spooler", error);
        } finally {
          setPrintingOrder(null);
        }
      };
      mandarParaImpressorasLocais();
    }
  }, [printingOrder, settingsForm.printerName, allProducts, printers, productGroups]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminLoginForm.storeId) return alert("Informe o ID ou Slug da Loja!");
    try {
      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": adminLoginForm.storeId
        },
        body: JSON.stringify({ email: adminLoginForm.email, password: adminLoginForm.password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem("zenix_token", data.token);
        localStorage.setItem("zenix_store_id", adminLoginForm.storeId);
        setIsAdminAuthenticated(true);
      } else {
        alert(data.error || "Erro ao logar");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro de conexão ao efetuar login.");
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('zenix_token');
    localStorage.removeItem('zenix_store_id');
    localStorage.removeItem('zenix_loggedEmployee');
    setIsAdminAuthenticated(false);
    setLoggedEmployee(null);
    window.location.href = "/admin"; 
  };

  const fetchVisits = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/analytics?_=${Date.now()}`);
      if (res.ok) setVisitsData(await res.json());
    } catch (e) { console.error('Erro ao buscar visitas', e); }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchOrders(), fetchMenu(), fetchProducts(), fetchCustomers(), fetchInsumos(), 
      fetchCoupons(), fetchSystemSettings(), fetchFiscalData(), fetchVisits(),
      fetchPrintersAndGroups(), fetchDeliveryPersons()
    ]);
    setLoading(false);
  };

  const fetchDeliveryPersons = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/rh/delivery-persons`);
      if (res.ok) setDeliveryPersons(await res.json());
    } catch (e) { console.error(e); }
  };

  const assignDelivery = async (orderIds, deliveryPersonId) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders/dispatch`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, deliveryPersonId })
      });
      if ((await res.json()).success) {
        alert('📦 Pedidos despachados com sucesso!');
        fetchOrders();
      } else alert('Erro ao despachar.');
    } catch (e) { alert('Erro de conexão ao despachar.'); }
  };

  const fetchPrintersAndGroups = async () => {
    try {
      const pRes = await fetchWithStore(`${API_URL}/api/printers?_=${Date.now()}`);
      if (pRes.ok) setPrinters(await pRes.json());
      const gRes = await fetchWithStore(`${API_URL}/api/product-groups?_=${Date.now()}`);
      if (gRes.ok) setProductGroups(await gRes.json());
    } catch (e) { console.error('Erro ao buscar impressoras'); }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/coupons?_=${Date.now()}`);
      if (res.ok) setCoupons(await res.json());
    } catch (e) { console.error('Erro ao buscar cupons', e); }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...couponForm, active: true }) });
      const data = await res.json();
      if (data.success) { setCouponForm({ code: '', type: 'FIXED', value: '', minOrderValue: '0', maxUses: '0' }); fetchCoupons(); } else { alert(data.error || "Erro ao criar cupom."); }
    } catch (e) { alert("Erro de conexão ao criar cupom."); }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...coupon, active: !coupon.active }) });
      if ((await res.json()).success) fetchCoupons();
    } catch (e) { alert("Erro ao alterar status do cupom."); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        const autoPrintSetting = localStorage.getItem('zenix_autoPrint') !== 'false';
        if (autoPrintSetting) {
          const activePreparing = data.filter(o => o.status === 'PREPARING');
          if (activePreparing.length > 0) {
            const latestOrder = activePreparing[0];
            const currentPrintedIds = JSON.parse(sessionStorage.getItem('zenix_printedIds') || '[]');
            if (!currentPrintedIds.includes(latestOrder.id)) {
              const updatedIds = [...currentPrintedIds, latestOrder.id];
              setPrintedOrderIds(updatedIds);
              sessionStorage.setItem('zenix_printedIds', JSON.stringify(updatedIds));
              setPrintingOrder(latestOrder);
            }
          }
        }
      }
    } catch (error) { console.error('Erro ao buscar pedidos:', error); }
  };

  const triggerManualPrint = async (order) => { 
    try {
      const res = await fetch('http://localhost:8080/imprimir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido: order, isPartial: false })
      });
      if (!res.ok) throw new Error('Falha na impressora');
      alert('🖨️ Pedido enviado para a impressora!');
    } catch (error) {
      alert("⚠️ Erro de Impressão: Verifique se o Servidor de Impressão Local está aberto!");
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/menu?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
        if (data.length > 0 && !newProduct.categoryId) setNewProduct(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (error) { console.error('Erro ao buscar categorias'); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/products?_=${Date.now()}`);
      if (res.ok) setAllProducts(await res.json());
    } catch (error) { console.error('Erro ao buscar produtos'); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/customers?_=${Date.now()}`);
      if (res.ok) setCustomers(await res.json());
    } catch (error) { console.error('Erro ao buscar clientes'); }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setSettingsForm({
          isManualFechado: data.isManualFechado, deliveryFee: Number(data.deliveryFee), cashbackPercent: Number(data.cashbackPercent),
          promoBannerUrl: data.promoBannerUrl || '', promoBannerLink: data.promoBannerLink || '',
          youtubeLiveId: data.youtubeLiveId || '', printerName: data.printerName || '',
          aboutUsText: data.aboutUsText || '', 
          schedule: data.schedule || settingsForm.schedule,
          storeCnpj: data.storeCnpj || ''
        });
      }
    } catch (error) { console.error('Erro ao carregar configurações.'); }
  };

  const fetchFiscalData = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/fiscal?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setFiscalData({ icms: data.icms || [], pisCofins: data.pisCofins || [], ibsCbs: data.ibsCbs || [], regras: data.regras || [], cnpjLoja: data.cnpjLoja || '' });
      }
    } catch (error) { console.error('Erro ao carregar dados fiscais.'); }
  };

  const fetchInsumos = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/insumos?_=${Date.now()}`);
      if (res.ok) setInsumos(await res.json());
    } catch (e) { console.error('Erro Insumos'); }
  };

  const fetchMovimentacoes = async () => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/estoque/movimentacoes?_=${Date.now()}`);
      if (res.ok) setMovimentacoes(await res.json());
    } catch (e) { console.error('Erro Movs'); }
  };

  const saveFiscalData = async (newData) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/fiscal`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) });
      if ((await res.json()).success) { setFiscalData(newData); }
    } catch (error) { alert('Erro ao salvar dados fiscais.'); }
  };

  const handleSaveCnpj = async (cnpj) => {
    if(!cnpj) return alert("Digite o CNPJ!");
    try {
      const newData = { ...fiscalData, cnpjLoja: cnpj };
      const res = await fetchWithStore(`${API_URL}/api/fiscal`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) });
      const data = await res.json();
      if (data.success) { setFiscalData(newData); alert('CNPJ Salvo com sucesso!'); } else { alert('Erro ao salvar CNPJ.'); }
    } catch (error) { alert('Erro de conexão ao salvar CNPJ.'); }
  };

  const emitirEImprimirNfceLocal = async (orderId) => {
    const pedidoAtual = orders.find(o => o.id === orderId);
    setLoadingNfceId(orderId);
    try {
      const resBackend = await fetchWithStore(`${API_URL}/api/admin/orders/${orderId}/fiscal`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const dataBackend = await resBackend.json();
      
      if (dataBackend.success) {
        setNfcesEmitidas(prev => {
            const newState = { ...prev, [orderId]: dataBackend.fiscalData };
            localStorage.setItem('zenix_nfcesEmitidas', JSON.stringify(newState));
            return newState;
        });
        fetchOrders(); 

        const resImpressora = await fetch('http://localhost:8080/imprimir-nfce', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ pedido: pedidoAtual, dadosNota: dataBackend.fiscalData, printerName: settingsForm.printerName }) 
        });
        if (resImpressora.ok) alert("NFC-e emitida na SEFAZ e impressa NATIVAMENTE com sucesso!");
        else alert("A nota foi emitida na SEFAZ, mas ocorreu um erro ao se comunicar com a impressora térmica local.");
      } else {
        const erroBruto = dataBackend.details ? JSON.stringify(dataBackend.details, null, 2) : 'Sem detalhes adicionais.';
        alert(`🚫 NF-e Recusada:\n${dataBackend.error}\n\nDetalhes Técnicos:\n${erroBruto}`);
      }
    } catch (error) {
      alert('Erro de comunicação.');
    } finally {
      setLoadingNfceId(null);
    }
  };

  const carregarFicha = async (productId) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/products/${productId}/fichas`);
      if (res.ok) { const data = await res.json(); setFichasVisiveis(prev => ({ ...prev, [productId]: data })); }
    } catch (e) { console.error('Erro Ficha'); }
  };

  const handleUploadXMLPreview = async (e) => {
    e.preventDefault();
    if (!xmlFile) return alert('Selecione um arquivo XML.');
    const formData = new FormData();
    formData.append('xml', xmlFile);
    setLoading(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/estoque/xml/preview`, { method: 'POST', body: formData });
      let data = await res.json();
      if (res.ok && data.success) {
        setXmlPreviewData({ chaveNfe: data.chaveNfe, items: data.items });
        const initialMappings = {};
        data.items.forEach(item => {
          const autoMatch = insumos.find(i => i.name.toLowerCase() === item.name.toLowerCase());
          if (autoMatch) initialMappings[item.id] = { action: 'LINK', mappedInsumoId: autoMatch.id };
          else initialMappings[item.id] = { action: 'NEW', mappedInsumoId: '' };
        });
        setXmlMappings(initialMappings);
        setShowXmlModal(true);
        setXmlFile(null);
      } else { alert(data.error || 'Erro desconhecido ao processar o XML.'); }
    } catch (e) { alert('Erro de conexão ao enviar o XML.'); }
    setLoading(false);
  };

  const updateMapping = (itemId, value) => {
    if (value === 'IGNORE') setXmlMappings(prev => ({...prev, [itemId]: { action: 'IGNORE', mappedInsumoId: '' }}));
    else if (value === 'NEW') setXmlMappings(prev => ({...prev, [itemId]: { action: 'NEW', mappedInsumoId: '' }}));
    else setXmlMappings(prev => ({...prev, [itemId]: { action: 'LINK', mappedInsumoId: value }}));
  };

  const handleConfirmXmlImport = async () => {
    const payloadItems = xmlPreviewData.items.map(item => {
      const mapping = xmlMappings[item.id];
      return { ...item, action: mapping.action, mappedInsumoId: mapping.mappedInsumoId };
    });
    setLoading(true);
    try {
      const res = await fetchWithStore(`${API_URL}/api/estoque/xml/import`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chaveNfe: xmlPreviewData.chaveNfe, items: payloadItems }) });
      const data = await res.json();
      if (data.success) { alert(data.message); setShowXmlModal(false); fetchInsumos(); fetchMovimentacoes(); fetchProducts(); } 
      else alert(data.error);
    } catch(e) { alert('Erro na importação.'); }
    setLoading(false);
  };

  const handleSalvarInsumo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/insumos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoInsumo) });
      if ((await res.json()).success) { setNovoInsumo({ name: '', unit: 'UN', cost: '', stock: '' }); fetchInsumos(); }
    } catch (e) { alert('Erro ao salvar insumo.'); }
  };

  const handleEditInsumoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/insumos/${editingInsumo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingInsumo) });
      if ((await res.json()).success) { setEditingInsumo(null); fetchInsumos(); fetchProducts(); }
    } catch (e) { alert('Erro ao salvar edição do insumo.'); }
  };

  const toggleInsumoStatus = async (insumo) => {
    try {
      const novoStatus = insumo.isActive === false ? true : false;
      const res = await fetchWithStore(`${API_URL}/api/insumos/${insumo.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...insumo, isActive: novoStatus }) });
      if ((await res.json()).success) fetchInsumos();
    } catch (e) { alert('Erro ao alterar status do insumo'); }
  };

  const handleAddFicha = async (e, productId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const insumoId = formData.get('insumoId');
    const quantity = formData.get('quantity');
    try {
      const res = await fetchWithStore(`${API_URL}/api/products/${productId}/fichas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ insumoId, quantity }) });
      const data = await res.json();
      if (data.success) { carregarFicha(productId); fetchProducts(); } else alert(data.error);
    } catch (e) { alert('Erro ao salvar ficha'); }
  };

  const handleRemoveFicha = async (fichaId, productId) => {
    if(!confirm('Remover este item da ficha?')) return;
    try { await fetchWithStore(`${API_URL}/api/fichas/${fichaId}`, { method: 'DELETE' }); carregarFicha(productId); fetchProducts(); } catch(e) { alert('Erro'); }
  };

  const handleMovimentacaoManual = async (e) => {
    e.preventDefault();
    if (!novaMovimentacao.insumoId) return alert('Selecione o insumo');
    try {
      const res = await fetchWithStore(`${API_URL}/api/estoque/manual`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novaMovimentacao) });
      if ((await res.json()).success) { alert('Movimentação registrada com sucesso!'); setNovaMovimentacao({ insumoId: '', type: 'IN', quantity: '', reason: '' }); fetchInsumos(); if (estoqueSubTab === 'movimentacoes') fetchMovimentacoes(); } 
      else alert('Erro ao registrar movimentação manual.');
    } catch (error) { alert('Erro de comunicação.'); }
  };

  const handleAddIcms = (e) => { e.preventDefault(); const updatedIcms = [...(fiscalData.icms || []), { ...formIcms, id: formIcms.id || Date.now().toString() }]; saveFiscalData({ ...fiscalData, icms: updatedIcms }); setFormIcms({ id: '', descricao: '', regime: 'Simples Nacional', cfop: '', cst: '', aliquota: '' }); };
  const handleDeleteIcms = (id) => { if(!confirm("Excluir Categoria ICMS?")) return; saveFiscalData({ ...fiscalData, icms: (fiscalData.icms || []).filter(x => x.id !== id) }); };
  const handleAddPis = (e) => { e.preventDefault(); const updatedPis = [...(fiscalData.pisCofins || []), { ...formPis, id: formPis.id || Date.now().toString() }]; saveFiscalData({ ...fiscalData, pisCofins: updatedPis }); setFormPis({ id: '', descricao: '', cstPis: '', aliqPis: '', cstCofins: '', aliqCofins: '' }); };
  const handleDeletePis = (id) => { if(!confirm("Excluir Categoria PIS/Cofins?")) return; saveFiscalData({ ...fiscalData, pisCofins: (fiscalData.pisCofins || []).filter(x => x.id !== id) }); };
  const handleAddIbsCbs = (e) => { e.preventDefault(); const updated = [...(fiscalData.ibsCbs || []), { ...formIbsCbs, id: formIbsCbs.id || Date.now().toString() }]; saveFiscalData({ ...fiscalData, ibsCbs: updated }); setFormIbsCbs({ id: '', descricao: '', cst: '000', classificacao: '000001', aliqIbsUf: '0.1', aliqCbs: '0.9' }); };
  const handleDeleteIbsCbs = (id) => { if(!confirm("Excluir Categoria IBS/CBS?")) return; saveFiscalData({ ...fiscalData, ibsCbs: (fiscalData.ibsCbs || []).filter(x => x.id !== id) }); };
  const handleAddRegra = (e) => { e.preventDefault(); const updatedRegras = [...(fiscalData.regras || []), { ...formRegra, id: formRegra.id || Date.now().toString() }]; saveFiscalData({ ...fiscalData, regras: updatedRegras }); setFormRegra({ id: '', ordenar: '', descricao: '', icmsId: '', pisCofinsId: '', ibsCbsId: '', ipi: '' }); };
  const handleDeleteRegra = (id) => { if(!confirm("Excluir Regra Fiscal?")) return; saveFiscalData({ ...fiscalData, regras: (fiscalData.regras || []).filter(x => x.id !== id) }); };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/orders/${orderId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if ((await res.json()).success) fetchOrders();
    } catch (error) { alert('Erro ao atualizar status do pedido.'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/categories`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name: newCategoryName, isDrink: newCategoryIsDrink }) 
      });
      if ((await res.json()).success) { 
        setNewCategoryName(''); 
        setNewCategoryIsDrink(false);
        fetchMenu(); 
      }
    } catch (error) { alert('Erro ao criar categoria.'); }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/categories/${editingCategory.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name: editingCategory.name, isDrink: editingCategory.isDrink }) 
      });
      if ((await res.json()).success) { 
        setEditingCategory(null); 
        fetchMenu(); 
      }
    } catch (error) { alert('Erro ao editar categoria.'); }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      const res = await fetchWithStore(`${API_URL}/api/categories/${categoryId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchMenu(); else alert(data.error);
    } catch (error) { alert('Erro ao excluir categoria.'); }
  };

  const moveCategory = async (index, direction) => {
    const newMenu = [...menu];
    if (direction === 'up' && index > 0) { const temp = newMenu[index]; newMenu[index] = newMenu[index - 1]; newMenu[index - 1] = temp; } 
    else if (direction === 'down' && index < newMenu.length - 1) { const temp = newMenu[index]; newMenu[index] = newMenu[index + 1]; newMenu[index + 1] = temp; } 
    else return;
    setMenu(newMenu);
    try {
      const reordered = newMenu.map((cat, i) => ({ id: cat.id, order: i }));
      await fetchWithStore(`${API_URL}/api/categories/reorder`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categories: reordered }) });
    } catch (error) { alert('Erro de comunicação ao reordenar.'); }
  };

  const moveProduct = async (categoryId, productIndex, direction) => {
    const newMenu = [...menu];
    const catIndex = newMenu.findIndex(c => c.id === categoryId);
    if (catIndex === -1) return;

    const catProducts = [...newMenu[catIndex].products];
    if (direction === 'up' && productIndex > 0) {
      const temp = catProducts[productIndex];
      catProducts[productIndex] = catProducts[productIndex - 1];
      catProducts[productIndex - 1] = temp;
    } else if (direction === 'down' && productIndex < catProducts.length - 1) {
      const temp = catProducts[productIndex];
      catProducts[productIndex] = catProducts[productIndex + 1];
      catProducts[productIndex + 1] = temp;
    } else return;

    newMenu[catIndex].products = catProducts;
    setMenu(newMenu); 

    try {
      const reordered = catProducts.map((prod, i) => ({ id: prod.id, order: i }));
      await fetchWithStore(`${API_URL}/api/products/reorder`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ products: reordered }) 
      });
    } catch (error) { 
      alert('Erro ao reordenar produtos no servidor.'); 
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.categoryId) return alert("Crie uma categoria primeiro!");
    try {
      const payload = { ...newProduct, costPrice: newProduct.costPrice ? Number(newProduct.costPrice) : 0, groupId: newProduct.groupId || null };
      const res = await fetchWithStore(`${API_URL}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if ((await res.json()).success) {
        setNewProduct({ name: '', description: '', price: '', price700g: '', price1kg: '', costPrice: '', categoryId: menu[0]?.id || '', imageUrl: '', regraFiscalId: '', ncm: '', ean: '', groupId: '' });
        setIsCreatingProduct(false); fetchProducts(); fetchMenu(); 
      }
    } catch (error) { alert('Erro ao salvar produto.'); }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editingProduct, costPrice: editingProduct.costPrice ? Number(editingProduct.costPrice) : 0, groupId: editingProduct.groupId || null };
      const res = await fetchWithStore(`${API_URL}/api/products/${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if ((await res.json()).success) { setEditingProduct(null); fetchProducts(); fetchMenu(); }
    } catch (error) { alert('Erro ao editar produto.'); }
  };

  const toggleProductStatus = async (product) => {
    try {
      const res = await fetchWithStore(`${API_URL}/api/products/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...product, isActive: !product.isActive }) });
      if ((await res.json()).success) { fetchProducts(); fetchMenu(); }
    } catch (error) {}
  };

  const toggleFeatureProduct = async (product) => {
    const isCurrentlyFeatured = product.isFeatured;
    const currentHighlightsCount = allProducts.filter(p => p.isFeatured).length;
    if (!isCurrentlyFeatured && currentHighlightsCount >= 5) { alert("Você já tem 5 produtos em destaque."); return; }
    try {
      const res = await fetchWithStore(`${API_URL}/api/products/${product.id}/feature`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFeatured: !isCurrentlyFeatured }) });
      if ((await res.json()).success) { fetchProducts(); }
    } catch (error) { alert('Erro ao alterar destaque.'); }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/admin/customers/${editingCustomer.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingCustomer) });
      const data = await res.json();
      if (data.success) { alert('Dados do cliente atualizados com sucesso!'); setEditingCustomer(null); fetchCustomers(); } else { alert('Erro ao editar cliente.'); }
    } catch (error) { alert('Erro de conexão com o servidor.'); }
  };

  const handleUpdateAdminConfig = async (e) => { 
    e.preventDefault(); 
    try {
      const res = await fetchWithStore(`${API_URL}/api/auth/admin/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(adminConfig) });
      if ((await res.json()).success) alert("Perfil atualizado e salvo!"); else alert("Erro ao atualizar.");
    } catch(e) { alert("Erro de comunicação."); }
  };

  const handleSaveSystemSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithStore(`${API_URL}/api/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm) });
      if ((await res.json()).success) alert('Configurações salvas!'); else alert('Erro ao salvar as configurações.');
    } catch (error) { alert('Erro de conexão.'); }
  };

  const toggleAutoPrintState = (checked) => { setIsAutoPrintEnabled(checked); localStorage.setItem('zenix_autoPrint', checked ? 'true' : 'false'); };

  const calculateCmv = (cost, price) => { if (!price || price <= 0) return 0; return ((Number(cost) / Number(price)) * 100).toFixed(1); };
  const getCmvColor = (cmv) => { if (cmv <= 0) return 'text-slate-500'; if (cmv <= 30) return 'text-emerald-700 bg-emerald-100'; if (cmv <= 40) return 'text-amber-700 bg-amber-100'; return 'text-red-700 bg-red-100'; };

  const getProductSizeLabel = (item) => {
    if (!item.product) return "";
    if (item.product.price1kg && Number(item.price) === Number(item.product.price1kg)) return " (1kg)";
    if (item.product.price700g && Number(item.price) === Number(item.product.price700g)) return " (700g)";
    if (item.product.name.toLowerCase().includes('costela') && item.product.price700g) return " (500g)";
    return "";
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase()) || c.email.toLowerCase().includes(searchCustomer.toLowerCase()) || (c.phone && c.phone.includes(searchCustomer)) || (c.cpf && c.cpf.includes(searchCustomer)));
  const filteredProducts = allProducts.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()));

  const getMetodoPagamentoLabel = (method) => ({'PIX_ONLINE':'Pix (Pago no Site) 📱','CREDIT_CARD_ONLINE':'Cartão de Crédito (Pago no Site) 💳','CREDIT_CARD_DELIVERY':'Cartão na Entrega (Maquininha) 💳','CASH':'Dinheiro na Entrega 💵'}[method] || method);

  const menuItems = [
    { id: 'pdv', label: 'PDV / Frente de Caixa', icon: '💻' },
    { id: 'salao', label: 'Salão & Mesas', icon: '🪑' },
    { id: 'kds', label: 'Telas KDS (Produção)', icon: '🖥️', isDropdown: true },
    { id: 'expedicao', label: 'Expedição & Rotas', icon: '🛵' },
    { id: 'historico', label: 'Relatórios Analíticos', icon: '📊' },
    { id: 'turnos', label: 'Turnos & Faturamento', icon: '💰' },
    { id: 'analytics', label: 'Acessos', icon: '📈' },
    { id: 'produtos', label: 'Produtos', icon: '🍟' },
    { id: 'categorias', label: 'Categorias', icon: '📑' },
    { id: 'promocoes', label: 'Promoções & Cupons', icon: '🎟️' },
    { id: 'crm', label: 'Clientes', icon: '👥' },
    { id: 'fornecedores', label: 'Parceiros/Fornecedores', icon: '🤝' },
    { id: 'rh', label: 'RH & Funcionários', icon: '👔' }, 
    { id: 'estoque', label: 'Estoque & Fichas', icon: '📦' },
    { id: 'impressoes', label: 'Impressoras & Praças', icon: '🖨️' }, 
    { id: 'fiscal', label: 'Fiscal (NFC-e)', icon: '🧾' },
    { id: 'config', label: 'Configurações', icon: '⚙️' }
  ];

  if (!isAdminAuthenticated) {
    return <AdminLogin adminLoginForm={adminLoginForm} setAdminLoginForm={setAdminLoginForm} handleAdminLogin={handleAdminLogin} />;
  }

  if (loggedEmployee?.role?.toLowerCase().includes('entregador')) {
    if (typeof window !== 'undefined') window.location.href = '/entregador';
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-amber-500 font-bold">
          Redirecionando para a Rota de Entregas...
      </div>
    );
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-amber-600 font-bold"><div className="animate-pulse flex flex-col items-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div><p>Carregando painel administrativo...</p></div></div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      <aside className={`relative flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-30 shadow-sm ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap animate-fade-in-up px-2">
              <span className="font-black text-slate-900 text-xl tracking-tight">Zenix<span className="text-amber-500">Food</span></span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors mx-auto" title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}>
            {isSidebarOpen ? '◀' : '☰'}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => {
            if (item.isDropdown) {
              return (
                <div key={item.id} className="flex flex-col">
                  <button 
                    onClick={() => {
                      if (!isSidebarOpen) setIsSidebarOpen(true);
                      setIsKdsMenuOpen(!isKdsMenuOpen);
                    }} 
                    className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all cursor-pointer ${isKdsMenuOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <span className="text-xl shrink-0 flex items-center justify-center w-8">{item.icon}</span>
                    {isSidebarOpen && <span className="font-bold whitespace-nowrap text-sm flex-1 text-left">{item.label}</span>}
                    {isSidebarOpen && <span className="text-[10px] font-black">{isKdsMenuOpen ? '▼' : '▶'}</span>}
                  </button>
                  
                  {isKdsMenuOpen && isSidebarOpen && (
                    <div className="ml-4 mt-2 space-y-1 pl-4 border-l border-slate-200 animate-fade-in-up">
                      <a href="/kds-cozinha" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors cursor-pointer">
                        <span className="text-sm">👨‍🍳</span> Cozinha Principal
                      </a>
                      <a href="/kds-delivery" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors cursor-pointer">
                        <span className="text-sm">🛵</span> Expedição Delivery
                      </a>
                      <a href="/kds-bebidas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors cursor-pointer">
                        <span className="text-sm">🍹</span> Bar & Bebidas
                      </a>
                      <a href="/kds-cliente" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-600 hover:bg-slate-50 py-2.5 px-3 rounded-lg transition-colors cursor-pointer">
                        <span className="text-sm">📺</span> Painel de Senhas (TV)
                      </a>
                    </div>
                  )}
                </div>
              );
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-xl shrink-0 flex items-center justify-center w-8">{item.icon}</span>
                {isSidebarOpen && <span className="font-bold whitespace-nowrap text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleAdminLogout} className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all cursor-pointer ${!isSidebarOpen && 'justify-center'}`}>
            <span className="text-xl shrink-0 flex items-center justify-center w-8">🚪</span>
            {isSidebarOpen && <span className="font-bold whitespace-nowrap text-sm">Sair do Sistema</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen relative overflow-hidden bg-slate-50">
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm z-20">
           <h1 className="text-2xl font-black text-slate-800">
             {menuItems.find(m => m.id === activeTab)?.label}
           </h1>
           <div className="flex items-center gap-4">
              <label htmlFor="autoPrintEnabled" className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer text-slate-600 hover:text-slate-900 transition-colors">
                <input id="autoPrintEnabled" name="autoPrintEnabled" type="checkbox" checked={isAutoPrintEnabled} onChange={(e) => toggleAutoPrintState(e.target.checked)} className="rounded text-amber-500 focus:ring-0 border-slate-300 w-4 h-4 cursor-pointer" />
                Spooler de Impressão (Porta 8080)
              </label>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
           {activeTab === 'pdv' && <PdvTab employeeUser={{ id: 'ADMIN_MASTER', name: 'Administrador Master', role: 'Gerente Geral' }} allProducts={allProducts} menu={menu} />}
           {activeTab === 'salao' && <SalaoTab employeeUser={{ id: 'ADMIN_MASTER', name: 'Administrador Master', role: 'Gerente Geral' }} />}
           {activeTab === 'expedicao' && <ExpeditionTab orders={orders} updateOrderStatus={updateOrderStatus} deliveryPersons={deliveryPersons} assignDelivery={assignDelivery} />}
           {activeTab === 'historico' && <OrderHistoryTab orders={orders} setSelectedOrderDetails={setSelectedOrderDetails} getMetodoPagamentoLabel={getMetodoPagamentoLabel} getProductSizeLabel={getProductSizeLabel} />}
           {activeTab === 'turnos' && <TurnosTab />}
           {activeTab === 'analytics' && <AnalyticsTab visitsData={visitsData} />}
           {activeTab === 'produtos' && <ProductsTab allProducts={allProducts} searchProduct={searchProduct} setSearchProduct={setSearchProduct} filteredProducts={filteredProducts} setIsCreatingProduct={setIsCreatingProduct} isCreatingProduct={isCreatingProduct} newProduct={newProduct} setNewProduct={setNewProduct} handleAddProduct={handleAddProduct} menu={menu} fiscalData={fiscalData} editingProduct={editingProduct} setEditingProduct={setEditingProduct} handleEditProduct={handleEditProduct} toggleProductStatus={toggleProductStatus} toggleFeatureProduct={toggleFeatureProduct} calculateCmv={calculateCmv} getCmvColor={getCmvColor} productGroups={productGroups} />}
           {activeTab === 'categorias' && <CategoriesTab menu={menu} newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName} newCategoryIsDrink={newCategoryIsDrink} setNewCategoryIsDrink={setNewCategoryIsDrink} handleAddCategory={handleAddCategory} moveCategory={moveCategory} moveProduct={moveProduct} setEditingCategory={setEditingCategory} handleEditCategory={handleEditCategory} handleDeleteCategory={handleDeleteCategory} />}
           {activeTab === 'promocoes' && <PromotionsTab promoSubTab={promoSubTab} setPromoSubTab={setPromoSubTab} allProducts={allProducts} toggleFeatureProduct={toggleFeatureProduct} coupons={coupons} couponForm={couponForm} setCouponForm={setCouponForm} handleAddCoupon={handleAddCoupon} toggleCouponStatus={toggleCouponStatus} />}
           {activeTab === 'crm' && <CrmTab customers={customers} searchCustomer={searchCustomer} setSearchCustomer={setSearchCustomer} filteredCustomers={filteredCustomers} setEditingCustomer={setEditingCustomer} />}
           {activeTab === 'fornecedores' && <SuppliersTab />}
           {activeTab === 'rh' && <RhTab />} 
           {activeTab === 'estoque' && <StockTab estoqueSubTab={estoqueSubTab} setEstoqueSubTab={setEstoqueSubTab} fetchMovimentacoes={fetchMovimentacoes} handleUploadXMLPreview={handleUploadXMLPreview} setXmlFile={setXmlFile} novaMovimentacao={novaMovimentacao} setNovaMovimentacao={setNovaMovimentacao} insumos={insumos} handleMovimentacaoManual={handleMovimentacaoManual} novoInsumo={novoInsumo} setNovoInsumo={setNovoInsumo} handleSalvarInsumo={handleSalvarInsumo} toggleInsumoStatus={toggleInsumoStatus} setEditingInsumo={setEditingInsumo} editingInsumo={editingInsumo} handleEditInsumoSubmit={handleEditInsumoSubmit} allProducts={allProducts} fichasVisiveis={fichasVisiveis} carregarFicha={carregarFicha} setFichasVisiveis={setFichasVisiveis} calculateCmv={calculateCmv} getCmvColor={getCmvColor} handleRemoveFicha={handleRemoveFicha} handleAddFicha={handleAddFicha} movimentacoes={movimentacoes} showXmlModal={showXmlModal} setShowXmlModal={setShowXmlModal} xmlPreviewData={xmlPreviewData} xmlMappings={xmlMappings} updateMapping={updateMapping} handleConfirmXmlImport={handleConfirmXmlImport} />}
           {activeTab === 'impressoes' && <ImpressorasTab printers={printers} setPrinters={setPrinters} productGroups={productGroups} setProductGroups={setProductGroups} fiscalData={fiscalData} API_URL={API_URL} fetchWithStore={fetchWithStore} />}
           {activeTab === 'fiscal' && <FiscalTab fiscalSubTab={fiscalSubTab} setFiscalSubTab={setFiscalSubTab} orders={orders} emitirEImprimirNfceProp={emitirEImprimirNfceLocal} loadingNfceId={loadingNfceId} formIcms={formIcms} setFormIcms={setFormIcms} handleAddIcms={handleAddIcms} fiscalData={fiscalData} handleDeleteIcms={handleDeleteIcms} formPis={formPis} setFormPis={setFormPis} handleAddPis={handleAddPis} handleDeletePis={handleDeletePis} formIbsCbs={formIbsCbs} setFormIbsCbs={setFormIbsCbs} handleAddIbsCbs={handleAddIbsCbs} handleDeleteIbsCbs={handleDeleteIbsCbs} formRegra={formRegra} setFormRegra={setFormRegra} handleAddRegra={handleAddRegra} handleDeleteRegra={handleDeleteRegra} handleSaveCnpj={handleSaveCnpj} nfcesEmitidas={nfcesEmitidas} />}
           {activeTab === 'config' && <ConfigTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSystemSettings={handleSaveSystemSettings} daysOfWeek={["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]} adminConfig={adminConfig} setAdminConfig={setAdminConfig} handleUpdateAdminConfig={handleUpdateAdminConfig} />}
        </div>
      </main>

      {editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-black text-amber-600 mb-4">Editar Categoria</h3>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label htmlFor="editCatNameFunc" className="text-xs text-slate-500 block mb-1">Nome da Categoria</label>
                <input id="editCatNameFunc" name="editCatNameFunc" type="text" required value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 mb-4" />
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <input 
                  type="checkbox" 
                  checked={editingCategory.isDrink || false} 
                  onChange={e => setEditingCategory({...editingCategory, isDrink: e.target.checked})} 
                  className="w-5 h-5 accent-blue-600 cursor-pointer shrink-0"
                />
                <div className="flex flex-col">
                   <span className="text-xs font-black text-slate-800">🍹 KDS Bar (Bebidas)</span>
                   <span className="text-[10px] text-slate-500 leading-tight mt-0.5">Enviar itens desta categoria para o KDS do Bar.</span>
                </div>
              </label>

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl transition-all shadow-md cursor-pointer">Salvar Edição</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-black text-slate-900 mb-4">Editar Dados do Cliente</h3>
            <form onSubmit={handleEditCustomer} className="space-y-4">
              <div><label htmlFor="custNameFunc" className="text-xs text-slate-500 block mb-1">Nome Completo</label><input id="custNameFunc" name="custNameFunc" type="text" required value={editingCustomer.name || ''} onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" /></div>
              <div><label htmlFor="custEmailFunc" className="text-xs text-slate-500 block mb-1">E-mail</label><input id="custEmailFunc" name="custEmailFunc" type="email" required value={editingCustomer.email || ''} onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" /></div>
              <div>
                <label htmlFor="custAddrFunc" className="text-xs text-slate-500 block mb-1">Endereço Completo</label>
                <input id="custAddrFunc" name="custAddrFunc" type="text" value={editingCustomer.address || ''} onChange={(e) => setEditingCustomer({...editingCustomer, address: e.target.value})} placeholder="Rua, Número, Bairro, CEP..." className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label htmlFor="custPhoneFunc" className="text-xs text-slate-500 block mb-1">WhatsApp</label><input id="custPhoneFunc" name="custPhoneFunc" type="tel" value={editingCustomer.phone || ''} onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" /></div>
                <div><label htmlFor="custCpfFunc" className="text-xs text-slate-500 block mb-1">CPF</label><input id="custCpfFunc" name="custCpfFunc" type="text" value={editingCustomer.cpf || ''} onChange={(e) => setEditingCustomer({...editingCustomer, cpf: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" /></div>
              </div>
              <div><label htmlFor="custDateFunc" className="text-xs text-slate-500 block mb-1">Data de Nascimento</label><input id="custDateFunc" name="custDateFunc" type="date" value={editingCustomer.birthDate || ''} onChange={(e) => setEditingCustomer({...editingCustomer, birthDate: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500" /></div>
              <div className="pt-3 border-t border-slate-200">
                 <label htmlFor="custPassFunc" className="text-xs font-bold text-amber-600 block mb-1">Alterar Senha do Cliente</label>
                 <p className="text-[10px] text-slate-500 mb-2">Deixe em branco para não alterar.</p>
                 <input id="custPassFunc" name="custPassFunc" type="password" value={editingCustomer.password || ''} onChange={(e) => setEditingCustomer({...editingCustomer, password: e.target.value})} placeholder="••••••••" className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingCustomer(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-3 rounded-xl transition-all shadow-md cursor-pointer">Salvar Edição</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OrderDetailsModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} triggerManualPrint={triggerManualPrint} getMetodoPagamentoLabel={getMetodoPagamentoLabel} getProductSizeLabel={getProductSizeLabel} />
    </div>
  );
}