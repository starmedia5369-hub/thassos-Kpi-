
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, COLORS } from '../constants';
import ApprovedCycleRecord from '../components/ApprovedCycleRecord';

const OperationsPage: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';
  const managerName = 'معتز حلمي عثمان'; 

  // المكونات التشغيلية المعتمدة (70%) - استبعاد الموارد البشرية والوحدات الإدارية
  const contributorIds = [ 
    DepartmentId.SALES, 
    DepartmentId.PRODUCTION, 
    DepartmentId.QUALITY, 
    DepartmentId.PROCUREMENT, 
    DepartmentId.MAINTENANCE, 
    DepartmentId.WAREHOUSE 
  ];

  // 1. حساب أداء الشبكة التشغيلية (70%)
  const networkMetrics = useMemo(() => {
    let sum = 0; 
    let count = 0;
    const details = contributorIds.map(id => {
      const data = state.departmentData[id]?.[month];
      const score = data?.score || 0;
      if (data) { sum += score; count++; }
      return { 
        id, 
        name: DEPARTMENTS.find(d => d.id === id)?.name || id, 
        score, 
        hasData: !!data 
      };
    });
    
    // المتوسط الحسابي للأقسام النشطة
    const avg = count > 0 ? sum / count : 0;
    const weightedContribution = Math.round(avg * 0.7);
    
    return { avg: Math.round(avg), weighted: weightedContribution, details };
  }, [state.departmentData, month]);

  // 2. سحب وتحليل أداء المدير الشخصي (30%)
  const managerData = useMemo(() => {
    return state.employeeKPIs[DepartmentId.OPERATIONS]?.[managerName]?.[month];
  }, [state.employeeKPIs, month, managerName]);

  const personalScore = managerData?.score || 0;
  const personalWeighted = Math.round(personalScore * 0.3);

  // 3. النتيجة النهائية المركبة
  const finalScore = networkMetrics.weighted + personalWeighted;

  // تعريف الحقول المكونة لتقييم المدير (لعرضها في الداشبورد)
  const managerFields = [
    { key: 'workflowAdherence', label: 'سير العمل', weight: '30%' },
    { key: 'onTimeOrders', label: 'أوامر العمل', weight: '25%' },
    { key: 'replanningReduction', label: 'التخطيط', weight: '20%' },
    { key: 'taskSpeed', label: 'السرعة', weight: '15%' },
    { key: 'deptCoordination', label: 'التنسيق', weight: '10%' }
  ];

  return (
    <div className={`space-y-16 animate-fade-in text-right pb-48 ${isTV ? 'max-w-[98%] mx-auto' : ''}`}>
      {/* Header Banner */}
      <div className="bg-brand-primary p-12 rounded-[4rem] text-white border border-brand-accent/30 shadow-2xl relative overflow-hidden flex justify-between items-center">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-[10px] font-black text-brand-accent uppercase tracking-widest">Enterprise Core Hub</span>
            <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
          </div>
          <h2 className={`${isTV ? 'text-9xl' : 'text-5xl'} font-black italic`}>كفاءة العمليات <span className="text-brand-accent">70/30</span></h2>
          <p className="opacity-60 text-lg mt-4 font-bold max-w-2xl">المعدل السيادي المدمج: يجمع بين كفاءة الوحدات الست (70%) والقيادة الاستراتيجية (30%).</p>
        </div>
        <div className="text-center bg-white/5 p-10 rounded-[3.5rem] border border-white/10 min-w-[300px] backdrop-blur-md relative z-10">
           <p className="text-[10px] font-black uppercase text-brand-accent mb-3 tracking-widest">Final Combined Score</p>
           <div className="text-[10rem] font-black text-brand-accent leading-none tracking-tighter tabular-nums">
              {finalScore}<span className="text-3xl opacity-30 ml-2">%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Network Contribution Panel (70%) */}
         <div className="lg:col-span-8 space-y-10">
            <div className="flex justify-between items-end px-4">
               <h4 className="text-2xl font-black dark:text-white flex items-center gap-4">
                 <span className="w-2 h-10 bg-brand-accent rounded-full"></span>
                 كفاءة الشبكة التشغيلية (70%)
               </h4>
               <p className="text-lg font-black text-brand-accent">المساهمة المرجحة: {networkMetrics.weighted}%</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {networkMetrics.details.map(dept => (
                 <div key={dept.id} className={`p-8 rounded-[3rem] border-2 transition-all group hover:scale-105 ${dept.hasData ? 'bg-white dark:bg-brand-secondary border-gray-100 dark:border-white/5 shadow-xl' : 'bg-red-500/5 border-red-500/10 opacity-40'}`}>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 truncate tracking-widest">{dept.name}</p>
                    <div className="flex items-end gap-2">
                       <p className={`text-6xl font-black ${dept.hasData ? 'dark:text-white group-hover:text-brand-accent' : 'text-red-500 opacity-20'}`}>
                          {dept.hasData ? dept.score : '--'}
                       </p>
                       {dept.hasData && <span className="text-sm font-bold opacity-30 mb-2">%</span>}
                    </div>
                    <div className="mt-6 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-accent transition-all duration-1000" style={{ width: `${dept.score}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Leadership Mastery Panel (30%) */}
         <div className="lg:col-span-4 space-y-10">
            <div className="flex justify-between items-end px-4">
               <h4 className="text-2xl font-black dark:text-white flex items-center gap-4">
                 <span className="w-2 h-10 bg-brand-accent rounded-full"></span>
                 الأداء القيادي (30%)
               </h4>
               <p className="text-lg font-black text-brand-accent">المساهمة: {personalWeighted}%</p>
            </div>

            <div className="bg-brand-primary p-12 rounded-[4rem] border border-brand-accent/10 shadow-3xl text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em] mb-4">Mastery Rating</p>
                 <div className="text-[9rem] font-black leading-none text-white tabular-nums mb-6">{personalScore}%</div>
                 <p className="text-xl font-bold italic opacity-60 mb-10">{managerName}</p>
                 
                 <div className="space-y-4">
                    {managerFields.map(f => (
                      <div key={f.key} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                         <span className="text-xs font-bold opacity-60">{f.label} ({f.weight})</span>
                         <span className="font-black text-brand-accent">{managerData?.values[f.key] || 0}%</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-accent/5 rounded-full blur-3xl"></div>
            </div>
         </div>
      </div>

      {/* Logic Validation Footer */}
      <div className="bg-brand-primary/5 p-10 rounded-[3rem] border-2 border-dashed border-brand-accent/20 text-center">
        <p className="text-sm font-bold opacity-60 leading-relaxed">
          "تُحسب كفاءة العمليات كمتوسط مرجح لـ 6 أقسام أساسية (70%) مضافاً إليها تقييم المدير (30%). <br/>
          يتم استبعاد الموارد البشرية والشكاوي لضمان نزاهة التدفق التشغيلي الصرف."
        </p>
      </div>

      <ApprovedCycleRecord state={state} deptId={DepartmentId.OPERATIONS} />
    </div>
  );
};

export default OperationsPage;
