
import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { DepartmentId, AppState } from '../types';
import { COLORS, ASSETS, MAINTENANCE_KPI_CONFIG } from '../constants';
import ApprovedCycleRecord from '../components/ApprovedCycleRecord';

const MaintenancePage: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  const supervisorName = 'عبدالسلام محمد';
  const technicianName = 'حسين الجديد';

  // 1. المؤشرات التقنية التلقائية (70% من وزن القسم)
  const technicalMetrics = useMemo(() => {
    const currentTickets = (state.maintenanceTickets || []).filter(t => t.month === month);
    
    const totalDowntime = currentTickets.reduce((sum, t) => sum + (t.status === 'تم الإصلاح' ? 2 : 4), 0); 
    const availability = Math.round(Math.max(0, (480 - totalDowntime) / 480) * 100);
    
    const prevTickets = currentTickets.filter(t => t.priority === 'عادي');
    const prevCompliance = prevTickets.length > 0 
      ? Math.round((prevTickets.filter(t => t.status === 'تم الإصلاح').length / prevTickets.length) * 100) 
      : 100;

    const technicalScore = Math.round((availability * 0.6) + (prevCompliance * 0.4));

    return { availability, totalDowntime, prevCompliance, technicalScore };
  }, [state.maintenanceTickets, month]);

  // 2. تحليل الأداء البشري المنفصل (30% من وزن القسم)
  const supervisorData = useMemo(() => state.employeeKPIs[DepartmentId.MAINTENANCE]?.[supervisorName]?.[month], [state.employeeKPIs, month]);
  const technicianData = useMemo(() => state.employeeKPIs[DepartmentId.MAINTENANCE]?.[technicianName]?.[month], [state.employeeKPIs, month]);

  const humanAvg = Math.round(((supervisorData?.score || 0) + (technicianData?.score || 0)) / 2);

  // 3. النتيجة السيادية النهائية
  const finalDeptScore = Math.round((technicalMetrics.technicalScore * 0.7) + (humanAvg * 0.3));

  return (
    <div className={`space-y-12 animate-fade-in text-right pb-48 ${isTV ? 'max-w-[98%] mx-auto' : ''}`}>
      
      {/* 🏛️ Strategic Maintenance Banner */}
      <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-3xl border border-brand-accent/30 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
             <span className="px-5 py-1.5 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-[10px] font-black text-brand-accent uppercase tracking-widest">Maintenance Sovereignty Hub</span>
             <span className="w-3 h-3 bg-brand-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(201,162,77,0.5)]"></span>
          </div>
          <h2 className={`${isTV ? 'text-8xl' : 'text-5xl'} font-black italic`}>كفاءة الصيانة <span className="text-brand-accent">70/30</span></h2>
          <p className="opacity-60 text-lg mt-4 font-medium max-w-2xl leading-relaxed">دمج الأداء الفني للأصول (70%) مع الكفاءة التشغيلية للطاقم البشري (30%) لضمان استمرارية سلاسل الإنتاج.</p>
          {!isTV && (
            <Link to="/maintenance_tickets" className="mt-8 inline-block bg-brand-accent text-brand-primary px-8 py-3 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">
               🛠️ التوجه إلى مركز إدارة التذاكر
            </Link>
          )}
        </div>
        
        <div className="text-center bg-white/5 p-12 rounded-[3.5rem] border border-white/10 backdrop-blur-md min-w-[320px] relative z-10">
           <p className="text-[10px] font-black uppercase text-brand-accent mb-3 tracking-[0.3em]">Combined Efficiency Score</p>
           <div className={`${isTV ? 'text-[15rem]' : 'text-9xl'} font-black text-brand-accent leading-none tracking-tighter tabular-nums`}>
              {finalDeptScore}<span className="text-3xl opacity-30 ml-2">%</span>
           </div>
        </div>
      </div>

      {/* 📊 Technical Cockpit (70%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <h4 className="text-2xl font-black dark:text-white flex items-center gap-4 px-4">
               <span className="w-2 h-10 bg-brand-accent rounded-full"></span>
               مؤشرات الجاهزية الفنية (70%)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3.5rem] shadow-xl border-t-8 border-brand-accent">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Availability (Machine Uptime)</p>
                  <div className="flex items-end gap-3">
                     <span className="text-8xl font-black dark:text-white tabular-nums">{technicalMetrics.availability}</span>
                     <span className="text-2xl font-bold opacity-20 mb-4">%</span>
                  </div>
                  <div className="mt-6 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-brand-accent transition-all duration-1000" style={{ width: `${technicalMetrics.availability}%` }}></div>
                  </div>
               </div>
               <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3.5rem] shadow-xl border-t-8 border-green-500">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Preventive Maintenance Compliance</p>
                  <div className="flex items-end gap-3">
                     <span className="text-8xl font-black dark:text-white tabular-nums">{technicalMetrics.prevCompliance}</span>
                     <span className="text-2xl font-bold opacity-20 mb-4">%</span>
                  </div>
                  <div className="mt-6 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${technicalMetrics.prevCompliance}%` }}></div>
                  </div>
               </div>
            </div>
         </div>

         {/* 🛠️ Live Asset Radar */}
         <div className="bg-white dark:bg-brand-secondary p-10 rounded-[4rem] shadow-xl border dark:border-white/5">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 border-b pb-4">رادار جاهزية الماكينات (Live)</h4>
            <div className="grid grid-cols-3 gap-4">
               {ASSETS.slice(0, 9).map(asset => {
                  const isDown = (state.maintenanceTickets || []).some(t => t.assetId === asset.id && t.status !== 'تم الإصلاح' && t.month === month);
                  return (
                    <div key={asset.id} className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl group hover:bg-brand-accent/10 transition-colors">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-2 truncate">{asset.name}</p>
                        <div className={`w-3 h-3 rounded-full mx-auto shadow-lg transition-all ${isDown ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    </div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* 👨‍ني Human Performance Hub (30%) - Split View */}
      <div className="space-y-8">
         <h4 className="text-2xl font-black dark:text-white flex items-center gap-4 px-4">
            <span className="w-2 h-10 bg-blue-500 rounded-full"></span>
            تحليل كفاءة الطاقم البشري (30%)
         </h4>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Supervisor Card */}
            <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-3xl border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 left-0 bg-blue-500/20 px-6 py-2 rounded-br-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest">Master Supervisor</div>
               <div className="relative z-10 flex justify-between items-center mb-10">
                  <div>
                     <h5 className="text-3xl font-black mb-1">{supervisorName}</h5>
                     <p className="text-xs font-bold text-blue-400 uppercase tracking-widest italic">مشرف الصيانة العام</p>
                  </div>
                  <div className="text-7xl font-black text-blue-400 tabular-nums">{supervisorData?.score || 0}%</div>
               </div>
               <div className="space-y-4">
                  {MAINTENANCE_KPI_CONFIG.SUPERVISOR.map(f => (
                    <div key={f.key} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                       <span className="text-xs font-bold opacity-50">{f.label}</span>
                       <span className="font-black text-blue-400">{supervisorData?.values[f.key] || 0}%</span>
                    </div>
                  ))}
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            </div>

            {/* Technician Card */}
            <div className="bg-white dark:bg-brand-secondary p-12 rounded-[4rem] shadow-2xl border dark:border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 left-0 bg-orange-500/10 px-6 py-2 rounded-br-2xl text-[10px] font-black text-orange-500 uppercase tracking-widest">Senior Technician</div>
               <div className="relative z-10 flex justify-between items-center mb-10">
                  <div>
                     <h5 className="text-3xl font-black dark:text-white mb-1 text-brand-primary">{technicianName}</h5>
                     <p className="text-xs font-bold text-orange-500 uppercase tracking-widest italic">فني الصيانة الأول</p>
                  </div>
                  <div className="text-7xl font-black text-orange-500 tabular-nums">{technicianData?.score || 0}%</div>
               </div>
               <div className="space-y-4">
                  {MAINTENANCE_KPI_CONFIG.TECHNICIAN.map(f => (
                    <div key={f.key} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5">
                       <span className="text-xs font-bold text-gray-400">{f.label}</span>
                       <span className="font-black text-orange-500">{technicianData?.values[f.key] || 0}%</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <ApprovedCycleRecord state={state} deptId={DepartmentId.MAINTENANCE} />
    </div>
  );
};

export default MaintenancePage;
