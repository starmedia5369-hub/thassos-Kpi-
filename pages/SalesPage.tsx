
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DepartmentId, AppState } from '../types';
import { SALES_REPS, COLORS } from '../constants';

const SalesPage: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;
  const managerName = 'عبدالرحمن تركي';
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  // 1. حساب أداء الفريق الميداني (70%) - متوسط المناديب الخمسة
  const teamMetrics = useMemo(() => {
    let totalScore = 0;
    let count = 0;
    const details = SALES_REPS.map(name => {
      const data = state.employeeKPIs[DepartmentId.SALES]?.[name]?.[month];
      const score = data?.score || 0;
      if (data) { totalScore += score; count++; }
      return { name, score, values: data?.values || {}, hasData: !!data };
    });
    const avg = count > 0 ? totalScore / count : 0;
    const weighted = Math.round(avg * 0.7);
    return { details, avg: Math.round(avg), weighted };
  }, [state.employeeKPIs, month]);

  // 2. سحب وتحليل أداء المدير الشخصي (30%)
  const managerData = useMemo(() => {
    return state.employeeKPIs[DepartmentId.SALES]?.[managerName]?.[month];
  }, [state.employeeKPIs, month, managerName]);

  const personalScore = managerData?.score || 0;
  const personalWeighted = Math.round(personalScore * 0.3);

  // 3. النتيجة النهائية المركبة
  const finalScore = teamMetrics.weighted + personalWeighted;

  // الحقول القيادية للمدير (30%)
  const managerFields = [
    { key: 'planAdherence', label: 'الالتزام بالخطة (30%)' },
    { key: 'collectionFollowup', label: 'متابعة التحصيل (25%)' },
    { key: 'reportingCompliance', label: 'دقة التقارير (20%)' },
    { key: 'teamDiscipline', label: 'الانضباط (15%)' },
    { key: 'opsCoordination', label: 'التنسيق (10%)' }
  ];

  return (
    <div className={`space-y-12 animate-fade-in text-right pb-48 ${isTV ? 'max-w-[98%] mx-auto' : ''}`}>
      {/* Strategic Sales Banner */}
      <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-3xl border border-brand-accent/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 bg-brand-accent/10 px-8 py-2 rounded-br-3xl text-[10px] font-black text-brand-accent uppercase tracking-widest">Sales Hub: 70% Team / 30% Management</div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex-1">
             <h3 className={`${isTV ? 'text-8xl' : 'text-5xl'} font-black italic text-white mb-6`}>كفاءة المبيعات <span className="text-brand-accent">70/30</span></h3>
             <p className="text-white/60 text-lg leading-relaxed max-w-2xl font-medium">النتيجة السيادية الموحدة لقطاع المبيعات: تدمج بين الجهد الميداني للفريق (70%) والرقابة الاستراتيجية للمدير (30%).</p>
          </div>
          <div className="text-center bg-white/5 p-12 rounded-[3.5rem] border border-white/10 min-w-[320px] backdrop-blur-md">
             <p className="text-[10px] font-black uppercase text-brand-accent mb-3 tracking-widest">Combined Efficiency Score</p>
             <div className={`${isTV ? 'text-[15rem]' : 'text-9xl'} font-black text-brand-accent tracking-tighter tabular-nums leading-none`}>
                {finalScore}<span className="text-3xl opacity-30 ml-2">%</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Field Force Analysis (70%) */}
        <div className="lg:col-span-8 space-y-10">
           <div className="flex justify-between items-end px-4">
              <h4 className="text-2xl font-black dark:text-white flex items-center gap-4">
                 <span className="w-2 h-10 bg-brand-accent rounded-full"></span>
                 أداء الفريق الميداني (70%)
              </h4>
              <p className="text-lg font-black text-brand-accent">المساهمة المرجحة: {teamMetrics.weighted}%</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMetrics.details.map(rep => (
                <div key={rep.name} className={`bg-white dark:bg-brand-secondary p-8 rounded-[3.5rem] shadow-xl border-t-8 transition-all group ${rep.hasData ? 'border-brand-accent' : 'border-red-500/20 opacity-40'}`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-xl shadow-lg">👤</div>
                         <div>
                            <h5 className="font-black dark:text-white text-lg">{rep.name}</h5>
                            <p className="text-[9px] text-brand-accent font-black uppercase tracking-widest">Field Representative</p>
                         </div>
                      </div>
                      <div className="text-4xl font-black dark:text-white">{rep.score}<span className="text-sm opacity-20">%</span></div>
                   </div>
                   <div className="mt-4 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-accent transition-all duration-1000" style={{ width: `${rep.score}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Managerial Leadership (30%) */}
        <div className="lg:col-span-4 space-y-10">
           <div className="flex justify-between items-end px-4">
              <h4 className="text-2xl font-black dark:text-white flex items-center gap-4">
                 <span className="w-2 h-10 bg-brand-accent rounded-full"></span>
                 القيادة والرقابة (30%)
              </h4>
              <p className="text-lg font-black text-brand-accent">المساهمة: {personalWeighted}%</p>
           </div>
           
           <div className="bg-brand-primary p-12 rounded-[4rem] shadow-3xl border border-brand-accent/10 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-4">Leadership Mastery</p>
                 <div className="text-[9rem] font-black leading-none text-white tabular-nums mb-8">{personalScore}%</div>
                 <p className="text-xl font-bold italic opacity-60 mb-10">{managerName}</p>
                 
                 <div className="space-y-4">
                    {managerFields.map(f => (
                      <div key={f.key} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-xs font-bold opacity-60">{f.label}</span>
                         <span className="font-black text-brand-accent">{managerData?.values[f.key] || 0}%</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px]"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
