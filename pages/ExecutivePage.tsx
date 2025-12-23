
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, COLORS } from '../constants';
import ApprovedCycleRecord from '../components/ApprovedCycleRecord';

const ExecutivePage: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';
  
  const operationalDeptIds = useMemo(() => 
    DEPARTMENTS.filter(d => !['executive', 'reports', 'settings', 'operations', 'governance', 'leads', 'complaints', 'circulars', 'bonus'].includes(d.id)).map(d => d.id),
  []);

  const rankings = useMemo(() => {
    const currentScores = operationalDeptIds.map(id => {
      const data = state.departmentData[id]?.[month];
      return {
        id,
        name: DEPARTMENTS.find(d => d.id === id)?.name || id,
        score: data?.score || 0
      };
    }).sort((a, b) => b.score - a.score);

    return {
      current: {
        best: currentScores[0] || { name: 'N/A', score: 0 },
        top3: currentScores.slice(0, 3),
        worst: currentScores[currentScores.length - 1] || { name: 'N/A', score: 0 },
        all: currentScores
      }
    };
  }, [state.departmentData, month, operationalDeptIds]);

  const activeDepts = operationalDeptIds.map(id => ({
    id,
    name: DEPARTMENTS.find(d => d.id === id)?.name || id,
    data: state.departmentData[id]?.[month]
  }));

  const avgScore = activeDepts.filter(d => d.data).length > 0 
    ? Math.round(activeDepts.reduce((acc, curr) => acc + (curr.data?.score || 0), 0) / activeDepts.filter(d => d.data).length) 
    : 0;

  const getStatusColor = (score: number) => {
    if (score >= 90) return COLORS.excellent;
    if (score >= 75) return COLORS.good;
    if (score >= 50) return COLORS.warning;
    return COLORS.critical;
  };

  const handlePrintExecutiveReport = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const reportHTML = `
      <div style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 40px; background: #fff;">
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 8px solid #0F172A; padding-bottom: 30px; margin-bottom: 40px;">
          <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="width: 180px; filter: brightness(0);" />
          <div style="text-align: left;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0F172A;">التقرير الاستراتيجي إيليت</h1>
            <p style="margin: 5px 0; color: #C9A24D; font-weight: bold; letter-spacing: 3px;">EXECUTIVE ELITE AUDIT • ${month}</p>
          </div>
        </header>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
          <div style="padding: 30px; background: #f8fafc; border-right: 10px solid #C9A24D; border-radius: 0 20px 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase;">رئيس مجلس الإدارة</p>
            <h2 style="margin: 10px 0; font-size: 28px; font-weight: 900;">${state.executiveNames.chairman}</h2>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-right: 10px solid #1E293B; border-radius: 0 20px 20px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase;">المدير العام</p>
            <h2 style="margin: 10px 0; font-size: 28px; font-weight: 900;">${state.executiveNames.gm}</h2>
          </div>
        </div>

        <div style="text-align: center; background: #0F172A; color: white; padding: 60px; border-radius: 40px; margin-bottom: 50px;">
          <p style="margin: 0; font-size: 14px; color: #C9A24D; font-weight: 900; letter-spacing: 5px;">ENTERPRISE PERFORMANCE INDEX</p>
          <h1 style="margin: 20px 0; font-size: 120px; font-weight: 900; line-height: 1;">${avgScore}%</h1>
          <p style="margin: 0; opacity: 0.5;">المعدل التراكمي لكافة الوحدات التشغيلية المعتمدة</p>
        </div>

        <h3 style="font-size: 24px; font-weight: 900; border-right: 8px solid #C9A24D; padding-right: 20px; margin-bottom: 30px; color: #0F172A;">ترتيب الوحدات التشغيلية (Elite Ranking)</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
          <thead>
            <tr style="background: #f1f5f9; color: #64748b;">
              <th style="padding: 20px; border: 1px solid #e2e8f0; text-align: right;">المرتبة</th>
              <th style="padding: 20px; border: 1px solid #e2e8f0; text-align: right;">وحدة العمل</th>
              <th style="padding: 20px; border: 1px solid #e2e8f0; text-align: center;">كفاءة الأداء</th>
              <th style="padding: 20px; border: 1px solid #e2e8f0; text-align: center;">التصنيف</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.current.all.map((dept, idx) => `
              <tr style="background: ${idx === 0 ? '#fffbeb' : idx === rankings.current.all.length - 1 ? '#fef2f2' : 'transparent'};">
                <td style="padding: 20px; border: 1px solid #e2e8f0; font-weight: bold;">#${idx + 1}</td>
                <td style="padding: 20px; border: 1px solid #e2e8f0;"><b>${dept.name}</b></td>
                <td style="padding: 20px; border: 1px solid #e2e8f0; text-align: center; font-size: 22px; font-weight: 900;">${dept.score}%</td>
                <td style="padding: 20px; border: 1px solid #e2e8f0; text-align: center;">
                  <span style="padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 900; background: ${getStatusColor(dept.score)}22; color: ${getStatusColor(dept.score)};">
                    ${dept.score >= 90 ? 'ممتاز' : dept.score >= 75 ? 'جيد جداً' : dept.score >= 50 ? 'تنبيه' : 'حرج'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <footer style="margin-top: 60px; padding-top: 30px; border-top: 2px solid #eee; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8;">
          <span>صدر عن: منظومة ثاسس إيليت للإدارة - THASSOS ENTERPRISE</span>
          <span>توقيع الاعتماد: __________________________</span>
          <span>التاريخ: ${new Date().toLocaleDateString('ar-LY')}</span>
        </footer>
      </div>
    `;

    printWin.document.write(`
      <html><head><title>Executive Elite Report - ${month}</title></head><body onload="window.print(); window.close();">${reportHTML}</body></html>
    `);
    printWin.document.close();
  };

  return (
    <div className={`space-y-16 animate-fade-in ${isTV ? 'max-w-[98%] mx-auto' : ''}`}>
      
      {/* Sovereignty Actions Header */}
      <div className="flex justify-between items-center no-print">
         <div>
            <h2 className="text-3xl font-black dark:text-white flex items-center gap-4">
              <span className="w-2.5 h-10 bg-brand-gold rounded-full"></span>
              المكتب الرئاسي الاستراتيجي
            </h2>
         </div>
         <button onClick={handlePrintExecutiveReport} className="bg-brand-gold text-brand-primary px-10 py-4 rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
           👑 طباعة تقرير إيليت
         </button>
      </div>

      {/* Executive Leadership Banner */}
      <div className={`flex flex-col md:flex-row justify-between items-stretch gap-8 no-print`}>
         <div className={`flex-1 bg-gradient-to-l from-brand-primary to-brand-secondary text-white ${isTV ? 'p-20 rounded-[5rem]' : 'p-8 rounded-[3rem]'} shadow-2xl border-r-8 border-brand-accent`}>
            <p className={`${isTV ? 'text-4xl mb-4' : 'text-[10px]'} font-black text-brand-accent uppercase tracking-[0.4em]`}>Chairman of the Board</p>
            <h2 className={`${isTV ? 'text-9xl' : 'text-4xl'} font-black italic`}>{state.executiveNames.chairman}</h2>
         </div>
         <div className={`flex-1 bg-white dark:bg-brand-secondary ${isTV ? 'p-20 rounded-[5rem]' : 'p-8 rounded-[3rem]'} shadow-xl border-r-8 border-gray-100 dark:border-white/10`}>
            <p className={`${isTV ? 'text-4xl mb-4' : 'text-[10px]'} font-black text-gray-400 uppercase tracking-[0.4em]`}>General Manager</p>
            <h2 className={`${isTV ? 'text-9xl' : 'text-4xl'} font-black dark:text-white italic`}>{state.executiveNames.gm}</h2>
         </div>
      </div>

      {/* Hero Header */}
      <div className={`grid grid-cols-1 ${isTV ? 'lg:grid-cols-4 gap-16' : 'lg:grid-cols-3 gap-8'}`}>
        <div className={`${isTV ? 'lg:col-span-3 p-24 rounded-[6rem]' : 'lg:col-span-2 p-12 rounded-[3rem]'} bg-brand-primary text-white shadow-4xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12`}>
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(201,162,77,0.15),transparent)] opacity-40"></div>
           <div className="relative z-10 space-y-6">
              <h3 className={`${isTV ? 'text-5xl' : 'text-xs'} font-black text-brand-accent uppercase tracking-[0.4em]`}>Governance Index</h3>
              <h2 className={`${isTV ? 'text-[10rem]' : 'text-5xl'} font-black leading-tight italic`}>أداء المجموعة <br/> <span className="text-brand-accent">إيليت</span></h2>
           </div>
           <div className="relative z-10">
              <div className={`${isTV ? 'p-24 rounded-[7rem]' : 'p-10 rounded-[3rem]'} bg-white/5 border-4 border-brand-accent/30 shadow-5xl backdrop-blur-3xl text-center min-w-[320px]`}>
                 <div className={`${isTV ? 'text-[25rem]' : 'text-9xl'} font-black text-brand-accent leading-none tracking-tighter tabular-nums`}>
                    {avgScore}<span className={`${isTV ? 'text-8xl' : 'text-3xl'} opacity-30 ml-2`}>%</span>
                 </div>
                 <p className={`${isTV ? 'text-4xl mt-16' : 'text-[10px] mt-6'} font-black uppercase tracking-[0.4em] text-white/40`}>Total Enterprise Score</p>
              </div>
           </div>
        </div>

        <div className="space-y-8 flex flex-col justify-center">
           <div className={`${isTV ? 'p-16 rounded-[5rem] border-8' : 'p-8 rounded-[2.5rem] border-2'} bg-white dark:bg-brand-secondary shadow-xl border-green-500/20 group hover:border-green-500 transition-all`}>
              <p className={`${isTV ? 'text-3xl mb-8' : 'text-[10px] mb-2'} font-black text-green-500 uppercase tracking-widest`}>🏆 الأفضل أداءً</p>
              <h4 className={`${isTV ? 'text-7xl' : 'text-2xl'} font-black dark:text-white truncate`}>{rankings.current.best.name}</h4>
              <p className={`${isTV ? 'text-9xl' : 'text-4xl'} font-black text-green-500 mt-4`}>{rankings.current.best.score}%</p>
           </div>
           <div className={`${isTV ? 'p-16 rounded-[5rem] border-8' : 'p-8 rounded-[2.5rem] border-2'} bg-white dark:bg-brand-secondary shadow-xl border-red-500/20 group hover:border-red-500 transition-all`}>
              <p className={`${isTV ? 'text-3xl mb-8' : 'text-[10px] mb-2'} font-black text-red-500 uppercase tracking-widest`}>⚠️ الأقل أداءً</p>
              <h4 className={`${isTV ? 'text-7xl' : 'text-2xl'} font-black dark:text-white truncate`}>{rankings.current.worst.name}</h4>
              <p className={`${isTV ? 'text-9xl' : 'text-4xl'} font-black text-red-500 mt-4`}>{rankings.current.worst.score}%</p>
           </div>
        </div>
      </div>

      {/* Main Ranking Grid */}
      <div className={`${isTV ? 'p-24 rounded-[6rem] border-8' : 'p-12 rounded-[4rem] shadow-2xl border'} bg-white dark:bg-brand-secondary dark:border-white/5`}>
         <h3 className={`${isTV ? 'text-7xl mb-24' : 'text-2xl mb-12'} font-black dark:text-white flex items-center gap-8`}>
            <span className={`${isTV ? 'w-4 h-24' : 'w-2 h-8'} bg-brand-accent rounded-full`}></span>
            تحليل التميز التشغيلي للوحدات
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {activeDepts.map(dept => (
               <div key={dept.id} className={`${isTV ? 'p-20 rounded-[6rem]' : 'p-10 rounded-[3rem]'} bg-gray-50 dark:bg-brand-primary/20 border-4 dark:border-white/10 relative overflow-hidden group hover:scale-105 transition-all duration-700`}>
                  <p className={`${isTV ? 'text-4xl mb-12' : 'text-[11px] mb-4'} font-black text-gray-400 uppercase tracking-widest`}>{dept.name}</p>
                  {dept.data ? (
                     <div className="flex items-end gap-3">
                        <span className={`${isTV ? 'text-[18rem]' : 'text-6xl'} font-black tabular-nums leading-none`} style={{ color: getStatusColor(dept.data.score) }}>
                           {dept.data.score}<span className={`${isTV ? 'text-7xl' : 'text-xl'} opacity-20 ml-2`}>%</span>
                        </span>
                     </div>
                  ) : (
                     <div className={`${isTV ? 'text-6xl py-32' : 'text-xs py-10'} italic opacity-30 dark:text-white`}>بانتظار البيانات...</div>
                  )}
                  <div className={`absolute bottom-0 left-0 h-6 bg-brand-accent transition-all duration-1000 ${isTV ? 'w-32' : 'w-12'} group-hover:w-full`} style={{ backgroundColor: getStatusColor(dept.data?.score || 0) }}></div>
               </div>
            ))}
         </div>
      </div>

      {!isTV && <ApprovedCycleRecord state={state} />}
    </div>
  );
};

export default ExecutivePage;
