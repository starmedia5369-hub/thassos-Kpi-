
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { DepartmentId, AppState, KPIData } from './types';
import { DEPARTMENTS, DEFAULT_ROLES, BONUS_POLICY_DEFAULT, FINAL_STAFF, SALES_REPS } from './constants';
import { syncService } from './syncService';

// Components
import NewsTicker from './components/NewsTicker';
import AiAssistantChat from './components/AiAssistantChat';

// Pages
import MainDashboardPage from './pages/MainDashboardPage';
import SalesPage from './pages/SalesPage';
import OperationsPage from './pages/OperationsPage';
import ProductionPage from './pages/ProductionPage';
import QualityPage from './pages/QualityPage';
import WarehousePage from './pages/WarehousePage';
import MaintenancePage from './pages/MaintenancePage';
import MaintenanceTicketsPage from './pages/MaintenanceTicketsPage';
import ProcurementPage from './pages/ProcurementPage';
import HRPage from './pages/HRPage';
import ComplaintsPage from './pages/ComplaintsPage';
import EmployeeKPIPage from './pages/EmployeeKPIPage';
import BonusReportingPage from './pages/BonusReportingPage';
import GovernanceLogPage from './pages/GovernanceLogPage';
import LeadsPage from './pages/LeadsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ExecutivePage from './pages/ExecutivePage';
import CircularsPage from './pages/CircularsPage';

const DEFAULT_STATE: AppState = {
  currentMonth: new Date().toISOString().slice(0, 7),
  lockedMonths: [],
  executiveNames: { chairman: 'ميسره يحي', gm: 'حسن عويدان' },
  managers: {
    [DepartmentId.SALES]: 'عبدالرحمن تركي',
    [DepartmentId.OPERATIONS]: 'معتز حلمي عثمان',
    [DepartmentId.HR]: 'محمد ذكي',
    [DepartmentId.PROCUREMENT]: 'علي عويدان',
    [DepartmentId.MAINTENANCE]: 'عبدالسلام محمد',
    [DepartmentId.WAREHOUSE]: 'محمد زهران',
    [DepartmentId.PRODUCTION]: 'محمد زهران',
    [DepartmentId.QUALITY]: 'عبدالرحمن علي'
  },
  staff: {
    [DepartmentId.SALES]: ['عبدالرحمن تركي', ...SALES_REPS],
    [DepartmentId.OPERATIONS]: ['معتز حلمي عثمان'],
    [DepartmentId.HR]: ['محمد ذكي'],
    [DepartmentId.PRODUCTION]: ['محمد زهران'],
    [DepartmentId.MAINTENANCE]: ['عبدالسلام محمد', 'حسين الجديد'],
    [DepartmentId.QUALITY]: ['عبدالرحمن علي'],
    [DepartmentId.WAREHOUSE]: ['محمد زهران'],
    [DepartmentId.PROCUREMENT]: ['علي عويدان']
  },
  departmentData: {},
  employeeKPIs: {},
  hrIndicatorInputs: [],
  attendanceRecords: [],
  complaints: [],
  leads: [],
  governanceLog: [],
  maintenanceIncidents: [],
  maintenanceTickets: [],
  circulars: [],
  acknowledgements: [],
  reminders: [],
  bonusEvaluations: [],
  orgRoles: DEFAULT_ROLES,
  orgAssignments: [],
  reportBonusPolicy: BONUS_POLICY_DEFAULT,
  reportSubmissions: [],
  bonusPayouts: []
};

const App: React.FC = () => {
  const [user] = useState({ id: 'u1', name: 'المدير العام', role: 'admin', dept: 'executive' });
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('thassos_elite_state');
    return saved ? JSON.parse(saved) : DEFAULT_STATE;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(localStorage.getItem('last_sync') || '1970-01-01');

  // حفظ الحالة محلياً عند كل تغيير
  useEffect(() => {
    localStorage.setItem('thassos_elite_state', JSON.stringify(state));
  }, [state]);

  // تهيئة إعدادات المزامنة الافتراضية
  useEffect(() => {
    if (!localStorage.getItem('current_user')) {
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    if (!localStorage.getItem('server_ip')) {
      syncService.setServerIp('localhost');
    }
  }, [user]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleSaveEmployeeKPI = (deptId: DepartmentId, name: string, month: string, data: KPIData) => {
    setState(prev => {
        const newState = { ...prev };
        
        // 1. تحديث تقييم الموظف
        if (!newState.employeeKPIs[deptId]) newState.employeeKPIs[deptId] = {};
        if (!newState.employeeKPIs[deptId][name]) newState.employeeKPIs[deptId][name] = {};
        newState.employeeKPIs[deptId][name][month] = data;

        // 2. تحديث القسم إذا كان الموظف هو المسؤول
        if (prev.managers[deptId] === name) {
            if (!newState.departmentData[deptId]) newState.departmentData[deptId] = {};
            newState.departmentData[deptId][month] = data;
        }

        return newState;
    });
  };

  const handleSaveDeptKPI = (deptId: DepartmentId, month: string, data: KPIData) => {
    setState(prev => {
        const newState = { ...prev };
        if (!newState.departmentData[deptId]) newState.departmentData[deptId] = {};
        newState.departmentData[deptId][month] = data;
        return newState;
    });
  };

  const fetchFullSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const bootstrap = await syncService.bootstrap();
      if (bootstrap) {
        setState(prev => ({
          ...prev,
          lockedMonths: bootstrap.months?.filter((m: any) => m.is_locked).map((m: any) => m.id) || []
        }));
      }
      
      const changes = await syncService.syncChanges(lastSync);
      if (changes && changes.timestamp) {
        setLastSync(changes.timestamp);
        localStorage.setItem('last_sync', changes.timestamp);
      }
    } catch (e) {
      console.warn('Sync offline mode');
    } finally {
      setIsSyncing(false);
    }
  }, [lastSync]);

  useEffect(() => {
    fetchFullSync();
    const interval = setInterval(fetchFullSync, 30000); 
    return () => clearInterval(interval);
  }, [fetchFullSync]);

  return (
    <HashRouter>
      <LayoutWrapper state={state} setState={setState} isDark={isDark} setIsDark={setIsDark} user={user} isSyncing={isSyncing}>
        <Routes>
          <Route path="/" element={<MainDashboardPage state={state} onUpdateMonth={(m) => setState(p => ({...p, currentMonth: m}))} />} />
          <Route path="/executive" element={<ExecutivePage state={state} />} />
          <Route path="/sales" element={<SalesPage state={state} />} />
          <Route path="/operations" element={<OperationsPage state={state} />} />
          <Route path="/production" element={<ProductionPage state={state} onSave={(m, d) => handleSaveDeptKPI(DepartmentId.PRODUCTION, m, d)} />} />
          <Route path="/quality" element={<QualityPage state={state} onSave={(m, d) => handleSaveDeptKPI(DepartmentId.QUALITY, m, d)} />} />
          <Route path="/warehouse" element={<WarehousePage state={state} onSave={(m, d) => handleSaveDeptKPI(DepartmentId.WAREHOUSE, m, d)} />} />
          <Route path="/maintenance" element={<MaintenancePage state={state} />} />
          <Route path="/maintenance_tickets" element={<MaintenanceTicketsPage state={state} onUpdateState={(u) => setState(u)} />} />
          <Route path="/procurement" element={<ProcurementPage state={state} onSave={(m, d) => handleSaveDeptKPI(DepartmentId.PROCUREMENT, m, d)} />} />
          <Route path="/hr" element={<HRPage state={state} onSave={(m, d) => handleSaveDeptKPI(DepartmentId.HR, m, d)} />} />
          <Route path="/complaints" element={<ComplaintsPage state={state} onUpdateState={(u) => setState(u)} />} />
          <Route path="/employee_kpi" element={<EmployeeKPIPage state={state} onSaveEmployee={handleSaveEmployeeKPI} />} />
          <Route path="/bonus" element={<BonusReportingPage state={state} onUpdateState={(u) => setState(u)} />} />
          <Route path="/governance" element={<GovernanceLogPage state={state} />} />
          <Route path="/leads" element={<LeadsPage state={state} onUpdateState={(u) => setState(u)} />} />
          <Route path="/reports" element={<ReportsPage state={state} />} />
          <Route path="/circulars" element={<CircularsPage state={state} onUpdateState={(u) => setState(u)} />} />
          <Route path="/settings" element={<SettingsPage state={state} setMonth={(m) => setState(p => ({...p, currentMonth: m}))} toggleLock={() => {}} onUpdateState={setState} />} />
        </Routes>
      </LayoutWrapper>
    </HashRouter>
  );
};

const LayoutWrapper: React.FC<{ children: React.ReactNode; state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; isDark: boolean; setIsDark: (v: boolean) => void; user: any; isSyncing: boolean; }> = ({ children, state, setState, isDark, setIsDark, user, isSyncing }) => {
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-brand-deep transition-colors duration-500 text-right font-['Tajawal'] ${isTV ? 'tv-mode' : ''}`}>
      {isSyncing && (
        <div className="fixed top-0 left-0 w-full h-1 bg-brand-accent z-[999] animate-pulse"></div>
      )}
      {!isTV && (
        <nav className="w-full md:w-72 bg-brand-primary text-white h-screen fixed right-0 top-0 overflow-y-auto z-50 border-l border-white/5 shadow-2xl flex flex-col">
          <div className="p-10 text-center border-b border-white/10 mb-6">
            <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" alt="Thassos" className="w-24 mx-auto mb-4" />
            <h1 className="text-[10px] font-black tracking-[0.3em] text-brand-accent uppercase italic">Thassos Elite v1.5</h1>
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
               <p className="text-[8px] opacity-40 uppercase mb-1">المستخدم الحالي</p>
               <p className="text-xs font-black">{user.name}</p>
               <div className="flex justify-center gap-4 mt-2">
                 <button onClick={() => setIsDark(!isDark)} className="text-[10px] text-brand-accent">{isDark ? '☀️ فاتح' : '🌙 داكن'}</button>
                 <Link to="/settings" className="text-[10px] text-gray-400">⚙️ الإعدادات</Link>
               </div>
            </div>
          </div>
          
          <div className="flex-1 px-4 space-y-2 pb-10">
            <SidebarLink to="/" icon="📊" label="لوحة التحكم" active={loc.pathname === '/'} />
            <SidebarLink to="/executive" icon="👑" label="المكتب الرئاسي" active={loc.pathname === '/executive'} />
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">قطاع العمليات</div>
            <SidebarLink to="/operations" icon="⚙️" label="إدارة العمليات" active={loc.pathname === '/operations'} />
            <SidebarLink to="/sales" icon="💰" label="إدارة المبيعات" active={loc.pathname === '/sales'} />
            <SidebarLink to="/leads" icon="🎯" label="العملاء المحتملين" active={loc.pathname === '/leads'} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">الوحدات الفنية</div>
            <SidebarLink to="/production" icon="🏭" label="الإنتاج" active={loc.pathname === '/production'} />
            <SidebarLink to="/quality" icon="💎" label="الجودة" active={loc.pathname === '/quality'} />
            <SidebarLink to="/maintenance" icon="🛠️" label="الصيانة" active={loc.pathname === '/maintenance'} />
            <SidebarLink to="/warehouse" icon="📦" label="المخازن" active={loc.pathname === '/warehouse'} />
            <SidebarLink to="/procurement" icon="🛒" label="المشتريات" active={loc.pathname === '/procurement'} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">الرقابة والكوادر</div>
            <SidebarLink to="/hr" icon="👥" label="الموارد البشرية" active={loc.pathname === '/hr'} />
            <SidebarLink to="/complaints" icon="⚖️" label="التحقيقات" active={loc.pathname === '/complaints'} />
            <SidebarLink to="/employee_kpi" icon="📝" label="مركز التقييم" active={loc.pathname === '/employee_kpi'} />
            <SidebarLink to="/bonus" icon="💵" label="المكافآت" active={loc.pathname === '/bonus'} />
            <SidebarLink to="/circulars" icon="📜" label="التعميمات" active={loc.pathname === '/circulars'} />
            
            <div className="pt-4 pb-2 px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">النظام</div>
            <SidebarLink to="/governance" icon="🏛️" label="سجل الحوكمة" active={loc.pathname === '/governance'} />
            <SidebarLink to="/reports" icon="📈" label="التقارير" active={loc.pathname === '/reports'} />
          </div>
        </nav>
      )}
      <main className={`flex-1 ${isTV ? 'p-10' : 'md:mr-72 p-4 md:p-14'} overflow-y-auto h-screen relative`}>
        <div className={`animate-fade-in ${isTV ? 'pb-10' : 'pb-40'}`}>{children}</div>
        {!isTV && <NewsTicker state={state} />}
        {!isTV && <AiAssistantChat />}
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string; icon: string; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 group ${active ? 'bg-brand-accent text-brand-primary font-black shadow-lg translate-x-[-8px]' : 'hover:bg-white/5 text-gray-400'}`}>
    <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className="text-sm tracking-tight">{label}</span>
  </Link>
);

export default App;
