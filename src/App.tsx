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
import { Warehouse, Egg, DollarSign, Settings, Sun, Moon, Home, BarChart3, Plus, Edit, AlertTriangle, TrendingUp, Download, LogOut, Clock, Info, Menu, Mail, ArrowLeft, CheckCircle2, Ruler, Users as UsersIcon, FileText, PieChart, TrendingDown, ShoppingCart, Receipt, Bird, Sprout, Phone } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Helper function for phone formatting
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

// Mock data para demonstração
const mockData = {
  farms: [
    { id: 'FARM001', name: 'Minha Granja', admin: 'admin@fazenda.com', createdAt: '2024-01-15' }
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login form states
  const [loginForm, setLoginForm] = useState({
    email: '',
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

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Preencha email e senha');
      return;
    }

    if (!isLoginMode) {
      // Cadastro
      setUser({ email: loginForm.email, role: 'admin' });
      setCurrentFarm({
        name: 'Minha Granja',
        id: 'FARM_' + Date.now(),
        admin: loginForm.email,
        createdAt: new Date().toISOString().split('T')[0]
      });
      toast.success('Cadastro realizado com sucesso!');
    } else {
      // Login
      setUser({ email: loginForm.email, role: 'admin' });
      setCurrentFarm(mockData.farms[0]);
      toast.success('Login realizado com sucesso!');
    }
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
    { id: 'dashboard', label: 'Início', icon: Sprout },
    { id: 'eggs', label: 'Produção de Ovos', icon: Egg },
    { id: 'birds', label: 'Aves e Saúde', icon: Bird },
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
            {/* Tela principal de login/cadastro */}
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Tabs value={isLoginMode ? "login" : "register"} onValueChange={(value) => setIsLoginMode(value === "login")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="register">Cadastrar</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="space-y-3">
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
                    placeholder="Digite sua senha"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleLogin} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoginMode ? 'Entrar' : 'Cadastrar'}
              </Button>
            </div>
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden mr-1 sm:mr-2 p-2">
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

              <div className="flex items-center min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <Egg className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">Easy Farm</h1>
                {currentFarm && (
                  <Badge variant="secondary" className="ml-2 sm:ml-3 hidden md:inline-flex">
                    {currentFarm.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setUser(null)} className="p-2">
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
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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
                  <div className="text-2xl font-bold">R$ {metrics.profit > 0 ? metrics.profit.toFixed(2) : '0.00'}</div>
                  <p className="text-xs text-muted-foreground">{metrics.profitMargin.toFixed(1)}% margem</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aves Ativas</CardTitle>
                  <Bird className="h-4 w-4 text-muted-foreground" />
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
                  <CardTitle>Desempenho Financeiro Anual</CardTitle>
                  <CardDescription>Receitas e despesas por mês (2025)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { mes: 'Jan', receitas: 4200, despesas: 2800 },
                      { mes: 'Fev', receitas: 3800, despesas: 2600 },
                      { mes: 'Mar', receitas: 4500, despesas: 3000 },
                      { mes: 'Abr', receitas: 4100, despesas: 2900 },
                      { mes: 'Mai', receitas: 4800, despesas: 3200 },
                      { mes: 'Jun', receitas: 4600, despesas: 3100 },
                      { mes: 'Jul', receitas: 5000, despesas: 3400 },
                      { mes: 'Ago', receitas: 4900, despesas: 3300 },
                      { mes: 'Set', receitas: 5200, despesas: 3500 },
                      { mes: 'Out', receitas: 5400, despesas: 3600 },
                      { mes: 'Nov', receitas: 5100, despesas: 3400 },
                      { mes: 'Dez', receitas: 394, despesas: 1515 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
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
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                      <Plus className="w-4 h-4 mr-2" />
                      Registro de Vacinação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registro de Vacinação</DialogTitle>
                      <DialogDescription>
                        Agende ou registre vacinas já realizadas
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="vaccineName">Nome da Vacina</Label>
                        <Input
                          id="vaccineName"
                          placeholder="Ex: Newcastle, Gumboro, Marek"
                          value={vaccinationForm.vaccine}
                          onChange={(e) => setVaccinationForm({...vaccinationForm, vaccine: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vaccineBatch">Lote</Label>
                        <Select value={vaccinationForm.batch} onValueChange={(value) => setVaccinationForm({...vaccinationForm, batch: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o lote" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(new Set(mockData.birds.map(b => b.batch))).map((batch) => (
                              <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="vaccineDate">Data da Vacinação</Label>
                        <Input
                          id="vaccineDate"
                          type="date"
                          value={vaccinationForm.date}
                          onChange={(e) => setVaccinationForm({...vaccinationForm, date: e.target.value})}
                        />
                      </div>
                      <Button onClick={handleVaccination} className="w-full bg-blue-600 hover:bg-blue-700">
                        Registrar Vacinação
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                          <SelectValue placeholder="Selecione o galp��o" />
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
                      <Bird className="w-8 h-8 text-green-600" />
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
                        R$ {metrics.profit > 0 ? metrics.profit.toFixed(2) : '0.00'}
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
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Gerar Relatório</CardTitle>
                    <CardDescription>Selecione o período e o tipo de relatório para exportar em PDF</CardDescription>
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
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.success('Relatório de Vendas gerado! (PDF de exemplo)')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Relatório de Vendas
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.success('Relatório de Despesas gerado! (PDF de exemplo)')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Relatório de Despesas
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.success('Relatório de Produção de Ovos gerado! (PDF de exemplo)')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Relatório de Produção de Ovos
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => toast.success('Relatório de Ocupação de Galpões gerado! (PDF de exemplo)')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Relatório de Ocupação de Galpões
                      </Button>
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
                <CardTitle>Sobre o App</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome do Aplicativo</Label>
                  <Input value="Easy Farm" readOnly />
                </div>
                <div>
                  <Label>Versão</Label>
                  <Input value="1.0.0" readOnly />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Sistema de Gerenciamento de Granja - Projeto social de custo zero para iOS e Android, 
                    utilizando Firebase para armazenamento, autenticação e notificações.
                  </p>
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
