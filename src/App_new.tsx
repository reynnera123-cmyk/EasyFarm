import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Switch } from "./components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./components/ui/sheet";
import { Calendar, Warehouse, Egg, DollarSign, Bell, Settings, Sun, Moon, Home, BarChart3, Heart, Plus, Search, Filter, Trash2, Edit, AlertTriangle, TrendingUp, Download, LogOut, Clock, Syringe, Info, Menu, Phone, Mail, ArrowLeft, CheckCircle2, Building2, Ruler, Users as UsersIcon, ChevronDown, ChevronUp, FileText, PieChart, TrendingDown, ShoppingCart, Receipt } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

// Mock data para demonstração
const mockData = {
  farms: [
    { id: 'FARM001', name: 'Granja São João', admin: 'admin@fazenda.com', createdAt: '2024-01-15' }
  ],
  barns: [
    { id: 1, name: 'Galpão 01', area: 250, maxCapacity: 500, currentOccupancy: 480, createdAt: '2024-01-15', status: 'Ativo' },
    { id: 2, name: 'Galpão 02', area: 180, maxCapacity: 350, currentOccupancy: 320, createdAt: '2024-02-10', status: 'Ativo' },
    { id: 3, name: 'Galpão 03', area: 300, maxCapacity: 600, currentOccupancy: 150, createdAt: '2024-03-20', status: 'Ativo' }
  ],
  eggCollection: [
    { id: 1, date: '2024-08-28', barn: 'Galpão 01', quantity: 300, broken: 10, collector: 'joao@fazenda.com', time: '07:00' },
    { id: 2, date: '2024-08-27', barn: 'Galpão 02', quantity: 250, broken: 5, collector: 'maria@fazenda.com', time: '07:30' }
  ],
  birds: [
    { id: 'AZUL001', batch: 'Azul', birthDate: '2024-08-01', breed: 'Leghorn', price: 15.50, age: '27 dias', status: 'Ativo', barn: 'Galpão 01' },
    { id: 'AZUL002', batch: 'Azul', birthDate: '2024-08-01', breed: 'Leghorn', price: 15.50, age: '27 dias', status: 'Ativo', barn: 'Galpão 01' },
    { id: 'VERDE001', batch: 'Verde', birthDate: '2024-07-15', breed: 'Rhode Island', price: 18.00, age: '44 dias', status: 'Ativo', barn: 'Galpão 02' },
    { id: 'VERDE002', batch: 'Verde', birthDate: '2024-07-15', breed: 'Rhode Island', price: 18.00, age: '44 dias', status: 'Ativo', barn: 'Galpão 02' }
  ],
  healthRecords: [
    { id: 1, batch: 'Azul', action: 'Vacinação Newcastle', date: '2024-08-25', appliedBy: 'vet@fazenda.com' },
    { id: 2, batch: 'Verde', action: 'Medicamento - Antibiótico', date: '2024-08-23', appliedBy: 'vet@fazenda.com' }
  ],
  sales: [
    { id: 1, quantity: 500, price: 0.50, customer: 'Mercado XYZ', phone: '(11) 99999-9999', total: 250, date: '2024-08-28', seller: 'vendas@fazenda.com' },
    { id: 2, quantity: 300, price: 0.48, customer: 'Padaria Central', phone: '(11) 88888-8888', total: 144, date: '2024-08-27', seller: 'vendas@fazenda.com' }
  ],
  expenses: [
    { id: 1, category: 'Ração', brand: 'Purina', amount: 50, price: 850, barn: 'Galpão 01', date: '2024-08-28' },
    { id: 2, category: 'Medicamento', description: 'Antibiótico', amount: 1, price: 245, barn: 'Galpão 02', date: '2024-08-26' },
    { id: 3, category: 'Manutenção', description: 'Reparo de bebedouros', amount: 1, price: 420, barn: 'Galpão 01', date: '2024-08-20' }
  ],
  activityLogs: [
    { id: 1, user: 'joao@fazenda.com', action: 'Registrou coleta de 300 ovos', timestamp: '2024-08-28 07:00', category: 'Coleta' },
    { id: 2, user: 'ana@fazenda.com', action: 'Classificou 290 ovos como grandes para venda', timestamp: '2024-08-28 19:00', category: 'Classificação' },
    { id: 3, user: 'vet@fazenda.com', action: 'Registrou vacinação Newcastle para lote Azul', timestamp: '2024-08-25 16:00', category: 'Saúde' }
  ],
  vaccinationSchedule: [
    { id: 1, vaccine: 'Newcastle (1ª dose)', date: '2024-09-01', batch: 'Azul', status: 'Agendado', age: '7 dias' },
    { id: 2, vaccine: 'Gumboro', date: '2024-09-05', batch: 'Verde', status: 'Agendado', age: '14 dias' }
  ]
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentFarm, setCurrentFarm] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAffiliateMode, setIsAffiliateMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados para autenticação
  const [authMethod, setAuthMethod] = useState('email');
  const [authStep, setAuthStep] = useState('login');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [pendingUser, setPendingUser] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  
  // Estados para afiliados
  const [affiliateForm, setAffiliateForm] = useState({
    email: '',
    phone: '',
    password: '',
    name: '',
    farmId: ''
  });
  const [affiliateAuthMethod, setAffiliateAuthMethod] = useState('email');
  const [affiliateAuthStep, setAffiliateAuthStep] = useState('form');
  const [affiliateVerificationCode, setAffiliateVerificationCode] = useState('');
  const [affiliateSentCode, setAffiliateSentCode] = useState('');
  const [affiliateCountdown, setAffiliateCountdown] = useState(0);

  // Login form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farmName: ''
  });

  // Estados para formulários
  const [eggCollectionForm, setEggCollectionForm] = useState({
    barn: '',
    quantity: '',
    broken: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  const [barnForm, setBarnForm] = useState({
    name: '',
    area: '',
    maxCapacity: '',
    currentOccupancy: ''
  });

  const [birdRegistrationForm, setBirdRegistrationForm] = useState({
    registrationType: 'batch',
    batchName: '',
    quantity: '',
    breed: '',
    price: '',
    birthDate: new Date().toISOString().split('T')[0],
    barn: ''
  });

  const [saleForm, setSaleForm] = useState({
    quantity: '',
    price: '',
    customer: '',
    phone: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    price: '',
    barn: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [vaccinationForm, setVaccinationForm] = useState({
    vaccine: '',
    batch: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [filterDate, setFilterDate] = useState({
    start: '',
    end: ''
  });

  const [financialTab, setFinancialTab] = useState('dashboard');
  const [eggProductionTab, setEggProductionTab] = useState('collection');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Countdown para reenvio de SMS (principal)
  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Countdown para reenvio de SMS (afiliado)
  useEffect(() => {
    let interval = null;
    if (affiliateCountdown > 0) {
      interval = setInterval(() => {
        setAffiliateCountdown(countdown => countdown - 1);
      }, 1000);
    } else if (affiliateCountdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [affiliateCountdown]);

  const handleLogin = () => {
    setUser({ email: 'admin@fazenda.com', role: 'admin' });
    setCurrentFarm(mockData.farms[0]);
    toast.success('Login realizado com sucesso!');
  };

  const handleGoogleLogin = () => {
    const mockGoogleUser = {
      email: 'usuario@gmail.com',
      name: 'Usuário Google',
      picture: 'https://via.placeholder.com/40'
    };
    
    setGoogleUser(mockGoogleUser);
    setAuthStep('google-farm');
    toast.success('Autenticação Google realizada! Complete seu cadastro.');
  };

  const handleGoogleFarmRegistration = () => {
    if (!loginForm.farmName.trim()) {
      toast.error('Digite o nome da sua fazenda');
      return;
    }

    if (isLoginMode) {
      setUser({ 
        email: googleUser.email, 
        name: googleUser.name,
        role: 'admin' 
      });
      setCurrentFarm({ 
        name: loginForm.farmName, 
        id: 'FARM_' + Date.now(),
        admin: googleUser.email,
        createdAt: new Date().toISOString().split('T')[0]
      });
      toast.success('Cadastro concluído! Bem-vindo ao Easy Farm!');
    } else {
      setPendingUser({
        email: googleUser.email,
        name: googleUser.name,
        farmName: loginForm.farmName,
        requestDate: new Date().toLocaleDateString('pt-BR'),
        type: 'google'
      });
      setAuthStep('pending');
      toast.success('Cadastro enviado para aprovação!');
    }
  };

  const handleSendSMS = () => {
    if (!loginForm.phone) {
      toast.error('Digite seu número de telefone');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setCountdown(60);
    setAuthStep('verify');
    
    toast.success(`Código enviado para ${loginForm.phone}`);
    console.log('Código de verificação:', code);
  };

  const handleVerifyCode = () => {
    if (!verificationCode) {
      toast.error('Digite o código de verificação');
      return;
    }

    if (verificationCode !== sentCode) {
      toast.error('Código inválido. Tente novamente.');
      return;
    }

    if (isLoginMode) {
      setUser({ email: loginForm.phone, role: 'user' });
      setCurrentFarm(mockData.farms[0]);
      toast.success('Login realizado com sucesso!');
    } else {
      setPendingUser({
        phone: loginForm.phone,
        farmName: loginForm.farmName,
        requestDate: new Date().toLocaleDateString('pt-BR')
      });
      setAuthStep('pending');
      toast.success('Cadastro enviado para aprovação!');
    }
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    handleSendSMS();
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleAffiliateRequest = () => {
    if (affiliateAuthMethod === 'phone') {
      if (!affiliateForm.phone || !affiliateForm.name || !affiliateForm.farmId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
    } else if (affiliateAuthMethod === 'email') {
      if (!affiliateForm.email || !affiliateForm.password || !affiliateForm.name || !affiliateForm.farmId) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
    }
    
    const farmExists = mockData.farms.find(farm => farm.id === affiliateForm.farmId);
    if (!farmExists) {
      toast.error('ID da granja não encontrado. Verifique com o administrador.');
      return;
    }

    if (affiliateAuthMethod === 'phone') {
      handleAffiliateSendSMS();
    } else if (affiliateAuthMethod === 'google') {
      setPendingUser({
        contact: 'Conta Google',
        name: affiliateForm.name,
        farmName: farmExists.name,
        farmId: affiliateForm.farmId,
        requestDate: new Date().toLocaleDateString('pt-BR'),
        type: 'affiliate'
      });
      setAffiliateAuthStep('pending');
      toast.success(`Solicitação enviada para ${farmExists.name}! Aguarde aprovação do administrador.`);
    } else {
      setPendingUser({
        contact: affiliateForm.email,
        name: affiliateForm.name,
        farmName: farmExists.name,
        farmId: affiliateForm.farmId,
        requestDate: new Date().toLocaleDateString('pt-BR'),
        type: 'affiliate'
      });
      setAffiliateAuthStep('pending');
      toast.success(`Solicitação enviada para ${farmExists.name}! Aguarde aprovação do administrador.`);
    }
  };

  const handleAffiliateSendSMS = () => {
    if (!affiliateForm.phone) {
      toast.error('Digite seu número de telefone');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setAffiliateSentCode(code);
    setAffiliateCountdown(60);
    setAffiliateAuthStep('verify');
    
    toast.success(`Código enviado para ${affiliateForm.phone}`);
    console.log('Código de verificação (afiliado):', code);
  };

  const handleAffiliateVerifyCode = () => {
    if (!affiliateVerificationCode) {
      toast.error('Digite o código de verificação');
      return;
    }

    if (affiliateVerificationCode !== affiliateSentCode) {
      toast.error('Código inválido. Tente novamente.');
      return;
    }

    const farmExists = mockData.farms.find(farm => farm.id === affiliateForm.farmId);
    
    setPendingUser({
      contact: affiliateForm.phone,
      name: affiliateForm.name,
      farmName: farmExists.name,
      farmId: affiliateForm.farmId,
      requestDate: new Date().toLocaleDateString('pt-BR'),
      type: 'affiliate'
    });
    setAffiliateAuthStep('pending');
    toast.success(`Solicitação enviada para ${farmExists.name}! Aguarde aprovação do administrador.`);
  };

  const handleAffiliateResendCode = () => {
    if (affiliateCountdown > 0) return;
    handleAffiliateSendSMS();
  };

  const resetAffiliateForm = () => {
    setAffiliateForm({
      email: '',
      phone: '',
      password: '',
      name: '',
      farmId: ''
    });
    setAffiliateAuthMethod('email');
    setAffiliateAuthStep('form');
    setAffiliateVerificationCode('');
    setAffiliateSentCode('');
    setAffiliateCountdown(0);
  };

  const resetLoginForm = () => {
    setLoginForm({
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      farmName: ''
    });
    setAuthStep('login');
    setVerificationCode('');
    setSentCode('');
    setCountdown(0);
    setPendingUser(null);
    setGoogleUser(null);
    resetAffiliateForm();
  };

  const handleEggCollection = () => {
    if (!eggCollectionForm.barn || !eggCollectionForm.quantity) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    toast.success(`Coleta registrada: ${eggCollectionForm.quantity} ovos do ${eggCollectionForm.barn}`);
    setEggCollectionForm({
      barn: '',
      quantity: '',
      broken: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    });
  };

  const handleBarnRegistration = () => {
    if (!barnForm.name || !barnForm.area || !barnForm.maxCapacity || !barnForm.currentOccupancy) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    toast.success(`Galpão ${barnForm.name} registrado com sucesso!`);
    setBarnForm({
      name: '',
      area: '',
      maxCapacity: '',
      currentOccupancy: ''
    });
  };

  const handleBirdRegistration = () => {
    if (!birdRegistrationForm.batchName || !birdRegistrationForm.quantity || !birdRegistrationForm.barn) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    toast.success(`Lote ${birdRegistrationForm.batchName} registrado com ${birdRegistrationForm.quantity} aves`);
    setBirdRegistrationForm({
      registrationType: 'batch',
      batchName: '',
      quantity: '',
      breed: '',
      price: '',
      birthDate: new Date().toISOString().split('T')[0],
      barn: ''
    });
  };

  const handleSale = () => {
    if (!saleForm.quantity || !saleForm.price || !saleForm.customer) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    const total = parseFloat(saleForm.quantity) * parseFloat(saleForm.price);
    toast.success(`Venda registrada: R$ ${total.toFixed(2)}`);
    setSaleForm({
      quantity: '',
      price: '',
      customer: '',
      phone: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleExpense = () => {
    if (!expenseForm.category || !expenseForm.price) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    toast.success(`Despesa de R$ ${expenseForm.price} registrada`);
    setExpenseForm({
      category: '',
      description: '',
      amount: '',
      price: '',
      barn: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleVaccination = () => {
    if (!vaccinationForm.vaccine || !vaccinationForm.batch || !vaccinationForm.date) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    toast.success(`Vacinação ${vaccinationForm.vaccine} agendada para o lote ${vaccinationForm.batch}`);
    setVaccinationForm({
      vaccine: '',
      batch: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'eggs', label: 'Produção de Ovos', icon: Egg },
    { id: 'birds', label: 'Aves', icon: Heart },
    { id: 'financial', label: 'Financeiro & Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  // Calcular métricas financeiras
  const calculateFinancialMetrics = () => {
    const totalRevenue = mockData.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = mockData.expenses.reduce((sum, expense) => sum + expense.price, 0);
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, profit, profitMargin };
  };

  const metrics = calculateFinancialMetrics();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Toaster />
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <Egg className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Easy Farm</CardTitle>
            <CardDescription>Sistema de Gerenciamento de Granja</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tela de cadastro Google - Nome da Fazenda */}
            {authStep === 'google-farm' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Quase pronto!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Autenticação Google realizada com sucesso.<br />
                    Agora informe o nome da sua fazenda.
                  </p>
                </div>

                {googleUser && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-400 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          Conta Google conectada
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {googleUser.name} • {googleUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="googleFarmName">Nome da Fazenda</Label>
                    <Input
                      id="googleFarmName"
                      placeholder="Ex: Granja São João"
                      value={loginForm.farmName}
                      onChange={(e) => setLoginForm({...loginForm, farmName: e.target.value})}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este será o nome identificador da sua fazenda no sistema
                    </p>
                  </div>

                  <Button 
                    onClick={handleGoogleFarmRegistration} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!loginForm.farmName.trim()}
                  >
                    {isLoginMode ? 'Concluir Cadastro' : 'Enviar para Aprovação'}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAuthStep('login');
                      setGoogleUser(null);
                      setLoginForm({...loginForm, farmName: ''});
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              </div>
            )}

            {/* Tela de aguardar aprovação */}
            {(authStep === 'pending' || affiliateAuthStep === 'pending') && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Aguardando Aprovação</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Sua solicitação de cadastro foi enviada com sucesso!
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-400">
                  <div className="text-left">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Informações da solicitação:
                    </p>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      {pendingUser?.type === 'affiliate' ? (
                        <>
                          <p><strong>Nome:</strong> {pendingUser?.name}</p>
                          <p><strong>Contato:</strong> {pendingUser?.contact}</p>
                          <p><strong>Granja:</strong> {pendingUser?.farmName}</p>
                          <p><strong>ID Granja:</strong> {pendingUser?.farmId}</p>
                          <p><strong>Data:</strong> {pendingUser?.requestDate}</p>
                        </>
                      ) : pendingUser?.type === 'google' ? (
                        <>
                          <p><strong>Nome:</strong> {pendingUser?.name}</p>
                          <p><strong>Email:</strong> {pendingUser?.email}</p>
                          <p><strong>Granja:</strong> {pendingUser?.farmName}</p>
                          <p><strong>Data:</strong> {pendingUser?.requestDate}</p>
                          <p><strong>Método:</strong> Google</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Telefone:</strong> {pendingUser?.phone}</p>
                          <p><strong>Granja:</strong> {pendingUser?.farmName}</p>
                          <p><strong>Data:</strong> {pendingUser?.requestDate}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (pendingUser?.type === 'affiliate') {
                      setAffiliateAuthStep('form');
                      setIsAffiliateMode(true);
                    } else {
                      setAuthStep('login');
                    }
                    setPendingUser(null);
                    resetLoginForm();
                    resetAffiliateForm();
                  }}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Login
                </Button>
              </div>
            )}

            {/* Tela de verificação SMS - Principal */}
            {authStep === 'verify' && !isAffiliateMode && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Verificação por SMS</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Digite o código de 6 dígitos enviado para<br />
                    <strong>{loginForm.phone}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verificationCode">Código de Verificação</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <Button 
                    onClick={handleVerifyCode} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={verificationCode.length !== 6}
                  >
                    Verificar Código
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Não recebeu o código?
                    </p>
                    <Button 
                      variant="link" 
                      onClick={handleResendCode}
                      disabled={countdown > 0}
                      className="text-sm"
                    >
                      {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAuthStep('login');
                      setVerificationCode('');
                      setSentCode('');
                      setCountdown(0);
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>

                {sentCode && (
                  <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-center">
                    <strong>Debug:</strong> Código = {sentCode}
                  </div>
                )}
              </div>
            )}

            {/* Tela de verificação SMS - Afiliado */}
            {affiliateAuthStep === 'verify' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Verificação por SMS</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Digite o código de 6 dígitos enviado para<br />
                    <strong>{affiliateForm.phone}</strong>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="affiliateVerificationCode">Código de Verificação</Label>
                    <Input
                      id="affiliateVerificationCode"
                      type="text"
                      placeholder="000000"
                      value={affiliateVerificationCode}
                      onChange={(e) => setAffiliateVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <Button 
                    onClick={handleAffiliateVerifyCode} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={affiliateVerificationCode.length !== 6}
                  >
                    Verificar e Solicitar Acesso
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Não recebeu o código?
                    </p>
                    <Button 
                      variant="link" 
                      onClick={handleAffiliateResendCode}
                      disabled={affiliateCountdown > 0}
                      className="text-sm"
                    >
                      {affiliateCountdown > 0 ? `Reenviar em ${affiliateCountdown}s` : 'Reenviar código'}
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setAffiliateAuthStep('form');
                      setAffiliateVerificationCode('');
                      setAffiliateSentCode('');
                      setAffiliateCountdown(0);
                    }}
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>

                {affiliateSentCode && (
                  <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-center">
                    <strong>Debug:</strong> Código = {affiliateSentCode}
                  </div>
                )}
              </div>
            )}

            {/* Tela principal de login/cadastro */}
            {authStep === 'login' && !isAffiliateMode && (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <Tabs value={isLoginMode ? "login" : "register"} onValueChange={(value) => setIsLoginMode(value === "login")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Entrar</TabsTrigger>
                      <TabsTrigger value="register">Cadastrar</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                      variant={authMethod === 'email' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setAuthMethod('email')}
                      className="flex items-center space-x-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </Button>
                    <Button
                      variant={authMethod === 'phone' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setAuthMethod('phone')}
                      className="flex items-center space-x-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Telefone</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {authMethod === 'email' ? (
                    <>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="seu@email.com" 
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor="phone">Número de Telefone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="(11) 99999-9999" 
                        value={loginForm.phone}
                        onChange={(e) => setLoginForm({...loginForm, phone: formatPhone(e.target.value)})}
                        maxLength={15}
                      />
                    </div>
                  )}
                  
                  {!isLoginMode && (
                    <>
                      {authMethod === 'email' && (
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            value={loginForm.confirmPassword}
                            onChange={(e) => setLoginForm({...loginForm, confirmPassword: e.target.value})}
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="farmName">Nome da Granja</Label>
                        <Input 
                          id="farmName" 
                          placeholder="Nome da sua granja" 
                          value={loginForm.farmName}
                          onChange={(e) => setLoginForm({...loginForm, farmName: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <Button 
                  onClick={authMethod === 'phone' ? handleSendSMS : handleLogin} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {authMethod === 'phone' 
                    ? (isLoginMode ? 'Enviar Código SMS' : 'Cadastrar com SMS')
                    : (isLoginMode ? 'Entrar' : 'Cadastrar')
                  }
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoginMode ? 'Entrar com Google' : 'Cadastrar com Google'}
                </Button>
                
                {isLoginMode && (
                  <div className="text-center">
                    <Button 
                      variant="link" 
                      className="text-sm"
                      onClick={() => setIsAffiliateMode(true)}
                    >
                      Entrar como afiliado
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Tela de afiliado */}
            {affiliateAuthStep === 'form' && isAffiliateMode && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Entrar como Afiliado</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conecte-se a uma granja existente
                  </p>
                </div>

                <div className="flex justify-center mb-4">
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                      variant={affiliateAuthMethod === 'email' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setAffiliateAuthMethod('email')}
                      className="flex items-center space-x-1 text-xs"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </Button>
                    <Button
                      variant={affiliateAuthMethod === 'phone' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setAffiliateAuthMethod('phone')}
                      className="flex items-center space-x-1 text-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>SMS</span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="affiliateName">Nome Completo</Label>
                    <Input 
                      id="affiliateName" 
                      value={affiliateForm.name}
                      onChange={(e) => setAffiliateForm({...affiliateForm, name: e.target.value})}
                      placeholder="Seu nome completo" 
                    />
                  </div>
                  
                  {affiliateAuthMethod === 'email' ? (
                    <>
                      <div>
                        <Label htmlFor="affiliateEmail">Email</Label>
                        <Input 
                          id="affiliateEmail" 
                          type="email" 
                          value={affiliateForm.email}
                          onChange={(e) => setAffiliateForm({...affiliateForm, email: e.target.value})}
                          placeholder="seu@email.com" 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="affiliatePassword">Senha</Label>
                        <Input 
                          id="affiliatePassword" 
                          type="password" 
                          value={affiliateForm.password}
                          onChange={(e) => setAffiliateForm({...affiliateForm, password: e.target.value})}
                          placeholder="••••••••" 
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <Label htmlFor="affiliatePhone">Número de Telefone</Label>
                      <Input 
                        id="affiliatePhone" 
                        type="tel" 
                        placeholder="(11) 99999-9999" 
                        value={affiliateForm.phone}
                        onChange={(e) => setAffiliateForm({...affiliateForm, phone: formatPhone(e.target.value)})}
                        maxLength={15}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="farmId">ID da Granja</Label>
                    <Input 
                      id="farmId" 
                      value={affiliateForm.farmId}
                      onChange={(e) => setAffiliateForm({...affiliateForm, farmId: e.target.value.toUpperCase()})}
                      placeholder="Ex: FARM001" 
                      className="uppercase"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solicite o ID único da granja ao administrador
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Como funciona?
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Após enviar a solicitação, o administrador da granja receberá uma notificação 
                        e poderá aprovar seu acesso e definir suas permissões.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleAffiliateRequest} className="w-full bg-green-600 hover:bg-green-700">
                  {affiliateAuthMethod === 'phone' ? 'Enviar Código SMS' : 'Solicitar Acesso'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setAffiliateAuthMethod('google');
                    handleAffiliateRequest();
                  }}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Solicitar com Google
                </Button>
                
                <div className="text-center">
                  <Button 
                    variant="link" 
                    className="text-sm"
                    onClick={() => {
                      setIsAffiliateMode(false);
                      resetAffiliateForm();
                      resetLoginForm();
                    }}
                  >
                    ← Voltar ao login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <Toaster />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden mr-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-6 pb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                        <Egg className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <SheetTitle>Easy Farm</SheetTitle>
                        <SheetDescription>
                          {currentFarm?.name}
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div className="px-6">
                    <nav className="space-y-1">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              activeTab === item.id
                                ? 'bg-green-100 text-green-900 dark:bg-green-900/20 dark:text-green-100'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                            }`}
                          >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <Egg className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Easy Farm</h1>
                {currentFarm && (
                  <Badge variant="secondary" className="ml-3 hidden sm:inline-flex">
                    {currentFarm.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              
              <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => setUser(null)}>
                <span className="hidden sm:inline mr-2">Sair</span>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Desktop */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === item.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ovos Hoje</CardTitle>
                  <Egg className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">550</div>
                  <p className="text-xs text-muted-foreground">+20% em relação a ontem</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Galpões Ativos</CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockData.barns.length}</div>
                  <p className="text-xs text-muted-foreground">950 aves no total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucro Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {metrics.profit.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">{metrics.profitMargin.toFixed(1)}% margem</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aves Ativas</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockData.barns.reduce((sum, barn) => sum + barn.currentOccupancy, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">em {mockData.barns.length} galpões</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.activityLogs.map((log) => (
                      <div key={log.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1 text-sm">
                          <p>{log.action}</p>
                          <p className="text-gray-500">{log.user} - {log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ocupação dos Galpões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.barns.map((barn) => {
                      const occupancyPercent = (barn.currentOccupancy / barn.maxCapacity) * 100;
                      return (
                        <div key={barn.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{barn.name}</span>
                            <span className="text-gray-500">
                              {barn.currentOccupancy}/{barn.maxCapacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                occupancyPercent > 90 ? 'bg-red-500' : 
                                occupancyPercent > 75 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'eggs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Produção de Ovos & Galpões</h2>
            </div>

            <Tabs value={eggProductionTab} onValueChange={setEggProductionTab}>
              <TabsList>
                <TabsTrigger value="collection">Coleta de Ovos</TabsTrigger>
                <TabsTrigger value="barns">
                  <Warehouse className="w-4 h-4 mr-2" />
                  Gestão de Galpões
                </TabsTrigger>
              </TabsList>

              <TabsContent value="collection" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Coleta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Coleta de Ovos</DialogTitle>
                        <DialogDescription>
                          Registre a coleta diária de ovos por galpão
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="barn">Galpão</Label>
                          <Select value={eggCollectionForm.barn} onValueChange={(value) => setEggCollectionForm({...eggCollectionForm, barn: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o galpão" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockData.barns.map((barn) => (
                                <SelectItem key={barn.id} value={barn.name}>{barn.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantidade de Ovos</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="Ex: 300"
                            value={eggCollectionForm.quantity}
                            onChange={(e) => setEggCollectionForm({...eggCollectionForm, quantity: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="broken">Ovos Quebrados</Label>
                          <Input
                            id="broken"
                            type="number"
                            placeholder="Ex: 10"
                            value={eggCollectionForm.broken}
                            onChange={(e) => setEggCollectionForm({...eggCollectionForm, broken: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date">Data</Label>
                            <Input
                              id="date"
                              type="date"
                              value={eggCollectionForm.date}
                              onChange={(e) => setEggCollectionForm({...eggCollectionForm, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="time">Hora</Label>
                            <Input
                              id="time"
                              type="time"
                              value={eggCollectionForm.time}
                              onChange={(e) => setEggCollectionForm({...eggCollectionForm, time: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button onClick={handleEggCollection} className="w-full bg-green-600 hover:bg-green-700">
                          Registrar Coleta
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Coletas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Galpão</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Quebrados</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Coletor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockData.eggCollection.map((collection) => (
                          <TableRow key={collection.id}>
                            <TableCell>{new Date(collection.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{collection.barn}</TableCell>
                            <TableCell>{collection.quantity}</TableCell>
                            <TableCell className="text-red-600">{collection.broken}</TableCell>
                            <TableCell>{collection.time}</TableCell>
                            <TableCell className="text-sm text-gray-500">{collection.collector}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="barns" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Galpão
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Galpão</DialogTitle>
                        <DialogDescription>
                          Cadastre um novo galpão para a granja
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="barnName">Nome do Galpão</Label>
                          <Input
                            id="barnName"
                            placeholder="Ex: Galpão 04"
                            value={barnForm.name}
                            onChange={(e) => setBarnForm({...barnForm, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="area">Metragem (m²)</Label>
                          <Input
                            id="area"
                            type="number"
                            placeholder="Ex: 250"
                            value={barnForm.area}
                            onChange={(e) => setBarnForm({...barnForm, area: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxCapacity">Capacidade Máxima</Label>
                          <Input
                            id="maxCapacity"
                            type="number"
                            placeholder="Ex: 500"
                            value={barnForm.maxCapacity}
                            onChange={(e) => setBarnForm({...barnForm, maxCapacity: e.target.value})}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Número máximo de aves que o galpão suporta
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="currentOccupancy">Quantidade Atual de Aves</Label>
                          <Input
                            id="currentOccupancy"
                            type="number"
                            placeholder="Ex: 480"
                            value={barnForm.currentOccupancy}
                            onChange={(e) => setBarnForm({...barnForm, currentOccupancy: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleBarnRegistration} className="w-full bg-green-600 hover:bg-green-700">
                          Cadastrar Galpão
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockData.barns.map((barn) => {
                    const occupancyPercent = (barn.currentOccupancy / barn.maxCapacity) * 100;
                    const available = barn.maxCapacity - barn.currentOccupancy;
                    
                    return (
                      <Card key={barn.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center">
                                <Warehouse className="w-5 h-5 mr-2" />
                                {barn.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                <Badge variant={barn.status === 'Ativo' ? 'default' : 'secondary'}>
                                  {barn.status}
                                </Badge>
                              </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Ruler className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Área</p>
                                <p className="font-semibold">{barn.area}m²</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <UsersIcon className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="text-xs text-gray-500">Capacidade</p>
                                <p className="font-semibold">{barn.maxCapacity}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Ocupação Atual</span>
                              <span className="font-semibold">
                                {barn.currentOccupancy} / {barn.maxCapacity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all ${
                                  occupancyPercent > 90 ? 'bg-red-500' : 
                                  occupancyPercent > 75 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${occupancyPercent}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {occupancyPercent.toFixed(1)}% ocupado • {available} vagas disponíveis
                            </p>
                          </div>

                          <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500">
                              Cadastrado em {new Date(barn.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo dos Galpões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Galpão</TableHead>
                          <TableHead>Área (m²)</TableHead>
                          <TableHead>Capacidade Máxima</TableHead>
                          <TableHead>Aves Atuais</TableHead>
                          <TableHead>Disponível</TableHead>
                          <TableHead>Ocupação</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockData.barns.map((barn) => {
                          const occupancyPercent = (barn.currentOccupancy / barn.maxCapacity) * 100;
                          const available = barn.maxCapacity - barn.currentOccupancy;
                          
                          return (
                            <TableRow key={barn.id}>
                              <TableCell className="font-medium">{barn.name}</TableCell>
                              <TableCell>{barn.area}</TableCell>
                              <TableCell>{barn.maxCapacity}</TableCell>
                              <TableCell>{barn.currentOccupancy}</TableCell>
                              <TableCell>{available}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        occupancyPercent > 90 ? 'bg-red-500' : 
                                        occupancyPercent > 75 ? 'bg-yellow-500' : 
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${occupancyPercent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm">{occupancyPercent.toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={barn.status === 'Ativo' ? 'default' : 'secondary'}>
                                  {barn.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'birds' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gestão de Aves & Saúde</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Lote
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Novo Lote</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo lote de aves
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="batchName">Nome do Lote</Label>
                      <Input
                        id="batchName"
                        placeholder="Ex: Lote Vermelho"
                        value={birdRegistrationForm.batchName}
                        onChange={(e) => setBirdRegistrationForm({...birdRegistrationForm, batchName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="barnSelect">Galpão</Label>
                      <Select value={birdRegistrationForm.barn} onValueChange={(value) => setBirdRegistrationForm({...birdRegistrationForm, barn: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o galpão" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockData.barns.map((barn) => (
                            <SelectItem key={barn.id} value={barn.name}>{barn.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantidade de Aves</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Ex: 200"
                        value={birdRegistrationForm.quantity}
                        onChange={(e) => setBirdRegistrationForm({...birdRegistrationForm, quantity: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="breed">Raça</Label>
                      <Input
                        id="breed"
                        placeholder="Ex: Leghorn"
                        value={birdRegistrationForm.breed}
                        onChange={(e) => setBirdRegistrationForm({...birdRegistrationForm, breed: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birdRegistrationForm.birthDate}
                        onChange={(e) => setBirdRegistrationForm({...birdRegistrationForm, birthDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço por Ave (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 15.50"
                        value={birdRegistrationForm.price}
                        onChange={(e) => setBirdRegistrationForm({...birdRegistrationForm, price: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleBirdRegistration} className="w-full bg-green-600 hover:bg-green-700">
                      Registrar Lote
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Aves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Aves Ativas</p>
                        <p className="text-2xl font-bold">{mockData.birds.filter(b => b.status === 'Ativo').length}</p>
                      </div>
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Lote Azul</p>
                        <p className="text-xl font-bold">{mockData.birds.filter(b => b.batch === 'Azul' && b.status === 'Ativo').length}</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Lote Verde</p>
                        <p className="text-xl font-bold">{mockData.birds.filter(b => b.batch === 'Verde' && b.status === 'Ativo').length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Vacinações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockData.vaccinationSchedule.filter(v => v.status !== 'Concluído').map((vaccination) => (
                      <div key={vaccination.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{vaccination.vaccine}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Lote {vaccination.batch} • {new Date(vaccination.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge variant={vaccination.status === 'Agendado' ? 'default' : 'secondary'}>
                            {vaccination.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Aves</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Raça</TableHead>
                      <TableHead>Nascimento</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Galpão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockData.birds.map((bird) => (
                      <TableRow key={bird.id}>
                        <TableCell className="font-medium">{bird.id}</TableCell>
                        <TableCell>{bird.batch}</TableCell>
                        <TableCell>{bird.breed}</TableCell>
                        <TableCell>{new Date(bird.birthDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{bird.age}</TableCell>
                        <TableCell>{bird.barn}</TableCell>
                        <TableCell>
                          <Badge variant={bird.status === 'Ativo' ? 'default' : 'secondary'}>
                            {bird.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Financeiro & Relatórios</h2>
            </div>

            <Tabs value={financialTab} onValueChange={setFinancialTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard">
                  <PieChart className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="sales">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Vendas
                </TabsTrigger>
                <TabsTrigger value="expenses">
                  <Receipt className="w-4 h-4 mr-2" />
                  Despesas
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <FileText className="w-4 h-4 mr-2" />
                  Relatórios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">R$ {metrics.totalRevenue.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Este mês</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">R$ {metrics.totalExpenses.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Este mês</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${metrics.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {metrics.profit.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">Receita - Despesas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">{metrics.profitMargin.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Percentual sobre receita</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Receitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Vendas de Ovos</span>
                            <span className="font-semibold">R$ {metrics.totalRevenue.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="h-3 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Despesas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(
                          mockData.expenses.reduce((acc, expense) => {
                            acc[expense.category] = (acc[expense.category] || 0) + expense.price;
                            return acc;
                          }, {})
                        ).map(([category, total]) => {
                          const percent = (total / metrics.totalExpenses) * 100;
                          return (
                            <div key={category}>
                              <div className="flex justify-between text-sm mb-2">
                                <span>{category}</span>
                                <span className="font-semibold">R$ {total.toFixed(2)}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div className="h-3 rounded-full bg-red-500" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Venda
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Nova Venda</DialogTitle>
                        <DialogDescription>
                          Registre uma venda de ovos
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="saleQuantity">Quantidade de Ovos</Label>
                          <Input
                            id="saleQuantity"
                            type="number"
                            placeholder="Ex: 500"
                            value={saleForm.quantity}
                            onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="salePrice">Preço por Unidade (R$)</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 0.50"
                            value={saleForm.price}
                            onChange={(e) => setSaleForm({...saleForm, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customer">Cliente</Label>
                          <Input
                            id="customer"
                            placeholder="Ex: Mercado XYZ"
                            value={saleForm.customer}
                            onChange={(e) => setSaleForm({...saleForm, customer: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerPhone">Telefone do Cliente</Label>
                          <Input
                            id="customerPhone"
                            placeholder="(11) 99999-9999"
                            value={saleForm.phone}
                            onChange={(e) => setSaleForm({...saleForm, phone: formatPhone(e.target.value)})}
                            maxLength={15}
                          />
                        </div>
                        <div>
                          <Label htmlFor="saleDate">Data</Label>
                          <Input
                            id="saleDate"
                            type="date"
                            value={saleForm.date}
                            onChange={(e) => setSaleForm({...saleForm, date: e.target.value})}
                          />
                        </div>
                        {saleForm.quantity && saleForm.price && (
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                            <p className="text-2xl font-bold text-green-600">
                              R$ {(parseFloat(saleForm.quantity) * parseFloat(saleForm.price)).toFixed(2)}
                            </p>
                          </div>
                        )}
                        <Button onClick={handleSale} className="w-full bg-green-600 hover:bg-green-700">
                          Registrar Venda
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockData.sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{sale.customer}</TableCell>
                            <TableCell>{sale.phone}</TableCell>
                            <TableCell>{sale.quantity}</TableCell>
                            <TableCell>R$ {sale.price.toFixed(2)}</TableCell>
                            <TableCell className="font-bold text-green-600">R$ {sale.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4">
                <div className="flex justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Despesa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Nova Despesa</DialogTitle>
                        <DialogDescription>
                          Registre uma despesa da granja
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="category">Categoria</Label>
                          <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ração">Ração</SelectItem>
                              <SelectItem value="Medicamento">Medicamento</SelectItem>
                              <SelectItem value="Manutenção">Manutenção</SelectItem>
                              <SelectItem value="Energia">Energia Elétrica</SelectItem>
                              <SelectItem value="Água">Água</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Input
                            id="description"
                            placeholder="Ex: Purina, Antibiótico, etc."
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expensePrice">Valor (R$)</Label>
                          <Input
                            id="expensePrice"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 850.00"
                            value={expenseForm.price}
                            onChange={(e) => setExpenseForm({...expenseForm, price: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expenseBarn">Galpão (Opcional)</Label>
                          <Select value={expenseForm.barn} onValueChange={(value) => setExpenseForm({...expenseForm, barn: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o galpão" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockData.barns.map((barn) => (
                                <SelectItem key={barn.id} value={barn.name}>{barn.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="expenseDate">Data</Label>
                          <Input
                            id="expenseDate"
                            type="date"
                            value={expenseForm.date}
                            onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleExpense} className="w-full bg-red-600 hover:bg-red-700">
                          Registrar Despesa
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Galpão</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockData.expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>{expense.description || expense.brand}</TableCell>
                            <TableCell>{expense.barn || '-'}</TableCell>
                            <TableCell className="font-bold text-red-600">R$ {expense.price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerar Relatório</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Período</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="startDate" className="text-xs">Data Inicial</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={filterDate.start}
                              onChange={(e) => setFilterDate({...filterDate, start: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="endDate" className="text-xs">Data Final</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={filterDate.end}
                              onChange={(e) => setFilterDate({...filterDate, end: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Relatório Financeiro Completo
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Relatório de Vendas
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Relatório de Despesas
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Relatório de Produção de Ovos
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Relatório de Ocupação de Galpões
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Análise Rápida</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Melhor dia de vendas</p>
                        <p className="text-xl font-bold">28/08/2024</p>
                        <p className="text-sm text-blue-600">R$ 250,00</p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ticket médio por venda</p>
                        <p className="text-xl font-bold">R$ {(metrics.totalRevenue / mockData.sales.length).toFixed(2)}</p>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Maior despesa</p>
                        <p className="text-xl font-bold">Ração</p>
                        <p className="text-sm text-yellow-600">
                          R$ {Math.max(...mockData.expenses.map(e => e.price)).toFixed(2)}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Economia potencial</p>
                        <p className="text-xl font-bold">R$ 120,00</p>
                        <p className="text-xs text-gray-500">Otimizando consumo de ração</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Vendas</p>
                        <p className="text-2xl font-bold">{mockData.sales.length}</p>
                        <p className="text-sm text-green-600">+15% vs mês anterior</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total de Despesas</p>
                        <p className="text-2xl font-bold">{mockData.expenses.length}</p>
                        <p className="text-sm text-red-600">+8% vs mês anterior</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">ROI</p>
                        <p className="text-2xl font-bold">{((metrics.profit / metrics.totalExpenses) * 100).toFixed(1)}%</p>
                        <p className="text-sm text-blue-600">Retorno sobre investimento</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Configurações</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Informações da Granja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome da Granja</Label>
                  <Input value={currentFarm?.name} readOnly />
                </div>
                <div>
                  <Label>ID da Granja</Label>
                  <Input value={currentFarm?.id} readOnly />
                  <p className="text-xs text-gray-500 mt-1">
                    Compartilhe este ID com membros da equipe para que possam solicitar acesso
                  </p>
                </div>
                <div>
                  <Label>Administrador</Label>
                  <Input value={currentFarm?.admin} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo Escuro</p>
                    <p className="text-sm text-gray-500">Ativar tema escuro</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações</p>
                    <p className="text-sm text-gray-500">Receber notificações push</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
