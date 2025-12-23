
import React from 'react';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, ASSETS, COLORS } from '../constants';

const ExecutiveQuickViewPage: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;
  const monthLeads = (state.leads || []).filter(l => l.month === month);
  const monthComplaints = (state.complaints || []).filter(c => c.month === month);
  const monthIncidents = (state.maintenanceIncidents || []).filter(i => i.month === month);

  const totalDowntime = monthIncidents.reduce((s, i) => s + i.downtimeHours, 0);
  // Corrected 'تم التحويل لطلب' to 'تم البيع' which is a valid LeadStatus
  const conversionRate = monthLeads.length > 0 
    ? (monthLeads.filter(l => l.status === 'تم البيع').length / monthLeads.length * 100).toFixed(1)
    : '0';

  // حساب الأداء لجميع الأقسام
  const deptsToRank = DEPARTMENTS.filter(d => 
    !['executive', 'reports', 'settings', 'governance', 'complaints', 'operations', 'leads'].includes(d.id)
  );

  const rankings = deptsToRank.map(d => {
    const data = state.departmentData[d.id]?.[month];
    return { 
      name: d.name, 
      id: d.id,
      score: data ? data.score : 0,
      values: data ? data.values : {}
    };
  }).sort((a, b) => b.score - a.score);

  const bestDept = rankings[0];
  const worstDept = rankings[rankings.length - 1];

  const activeDepts = rankings.filter(r => state.departmentData[r.id]?.[month]);
  const avgScore = activeDepts.length > 0 
    ? Math.round(activeDepts.reduce((s, r) => s + r.score, 0) / activeDepts.length) 
    : 0;

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-brand-primary dark:bg-brand-secondary p-12 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" alt="logo" className="w-96 transform rotate-12" />
          </div>
          
          <div className="relative z-10 text-center md:text-right">
            <p className="text-brand-accent font-bold text-xs uppercase tracking-[0.4em] mb-4">Real-time Performance Index</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">مؤشر أداء ثاسس</h2>
            <p className="text-white/40 text-sm max-w-sm">المعدل التشغيلي المجمع لكافة الأقسام بناءً على بيانات {month}</p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
             <div className="flex flex-col items-center">
                <div className="text-[140px] font-black leading-none text-brand-accent drop-shadow-[0_10px_30px_rgba(201,162,77,0.3)] select-none">
                  {avgScore}<span className="text-3xl opacity-50">%</span>
                </div>
                <div className={`mt-4 px-8 py-2 rounded-full font-black text-xs uppercase tracking-widest ${
                  avgScore >= 85 ? 'bg-green-500/20 text-green-400' : 'bg-brand-accent/20 text-brand-accent'
                }`}>
                  {avgScore >= 90 ? 'Stable Growth' : avgScore >= 75 ? 'Healthy Operations' : 'Performance Alert'}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-secondary p-8 rounded-[2.5rem] shadow-xl border border-brand-primary/5 dark:border-white/5 group hover:border-green-500/30 transition-all duration-500">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">🏆 Leader</span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            <p className="text-2xl font-black text-brand-primary dark:text-white truncate">{bestDept?.score > 0 ? bestDept.name : 'قيد القياس'}</p>
            <p className="text-3xl font-black text-green-500 mt-2">{bestDept?.score > 0 ? bestDept.score : '0'}%</p>
          </div>

          <div className="bg-white dark:bg-brand-secondary p-8 rounded-[2.5rem] shadow-xl border border-brand-primary/5 dark:border-white/5 group hover:border-red-500/30 transition-all duration-500">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">⚠️ Under Review</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <p className="text-2xl font-black text-brand-primary dark:text-white truncate">{worstDept?.score > 0 ? worstDept.name : 'قيد القياس'}</p>
            <p className="text-3xl font-black text-red-500 mt-2">{worstDept?.score > 0 ? worstDept.score : '0'}%</p>
          </div>
        </div>
      </div>

      {/* Critical KPIs - More Prominent Display */}
      <div className="bg-white dark:bg-brand-secondary rounded-[3rem] shadow-2xl p-1 no-print overflow-hidden border border-brand-primary/5 dark:border-white/5">
        <div className="bg-gray-50 dark:bg-white/5 p-8 border-b border-gray-100 dark:border-white/5">
          <h3 className="text-2xl font-black text-brand-primary dark:text-white flex items-center gap-4">
            <span className="w-3 h-10 bg-brand-accent rounded-full"></span>
            أهم المؤشرات الحيوية
            <span className="text-sm font-bold text-brand-accent opacity-50 uppercase tracking-widest mr-auto">Real-time Metrics</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-100 dark:divide-white/5">
          <div className="p-10 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-tighter">تحويل العملاء (Leads)</p>
            {/* Corrected comparison with 'تم البيع' instead of 'تم التحويل لطلب' */}
            <div className="text-5xl font-black text-brand-accent group-hover:scale-110 transition-transform origin-right">{conversionRate}%</div>
          </div>
          <div className="p-10 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-tighter">ساعات توقف الماكينات</p>
            <div className="text-5xl font-black text-red-500 group-hover:scale-110 transition-transform origin-right">{totalDowntime}</div>
          </div>
          <div className="p-10 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-tighter">شكاوى مثبتة</p>
            <div className="text-5xl font-black text-red-600 group-hover:scale-110 transition-transform origin-right">
              {monthComplaints.filter(c => c.status === 'مثبتة').length}
            </div>
          </div>
          <div className="p-10 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-tighter">أعطال طارئة</p>
            <div className="text-5xl font-black text-orange-500 group-hover:scale-110 transition-transform origin-right">
              {monthIncidents.filter(i => i.type === 'breakdown').length}
            </div>
          </div>
          <div className="p-10 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-tighter">طلبات محولة بنجاح</p>
            <div className="text-5xl font-black text-green-500 group-hover:scale-110 transition-transform origin-right">
              {/* Corrected status from 'تم التحويل لطلب' to 'تم البيع' */}
              {monthLeads.filter(l => l.status === 'تم البيع').length}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Status Grid - Interactive & Modern */}
      <div className="bg-white dark:bg-brand-secondary rounded-[3rem] shadow-2xl p-12 border border-brand-primary/5 dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="text-2xl font-black text-brand-primary dark:text-white uppercase mb-2">مراقبة الأصول والمعدات</h3>
            <p className="text-sm text-gray-400">نظرة فنية على جاهزية الماكينات والمرافق التشغيلية للشركة</p>
          </div>
          <div className="flex items-center gap-6 p-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-white">Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary dark:text-white">Breakdown</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {ASSETS.map(asset => {
            const isDown = monthIncidents.some(i => i.assetId === asset.id && i.type === 'breakdown');
            return (
              <div key={asset.id} className="relative group">
                <div className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center justify-center text-center ${
                  isDown 
                  ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 shadow-red-500/10 shadow-lg' 
                  : 'bg-white dark:bg-brand-primary/20 border-gray-100 dark:border-white/5 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-2xl font-black transition-all duration-500 ${
                    isDown 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 dark:bg-white/10 text-brand-primary dark:text-white group-hover:bg-brand-accent group-hover:text-brand-primary'
                  }`}>
                    {isDown ? '✕' : '⚙'}
                  </div>
                  <p className="text-[10px] font-bold text-brand-primary dark:text-white leading-tight uppercase tracking-tighter line-clamp-2 h-8">
                    {asset.name}
                  </p>
                  
                  {/* Status Indicator Bar */}
                  <div className="w-full h-1 bg-gray-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${isDown ? 'w-full bg-red-500' : 'w-full bg-green-500 opacity-30'}`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveQuickViewPage;
