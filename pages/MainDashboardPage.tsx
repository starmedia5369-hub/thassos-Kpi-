
import React, { useMemo, useState } from 'react';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, COLORS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";
import { useLocation } from 'react-router-dom';

interface MainDashboardPageProps {
  state: AppState;
  onUpdateMonth?: (month: string) => void;
}

const MainDashboardPage: React.FC<MainDashboardPageProps> = ({ state, onUpdateMonth }) => {
  const [aiData, setAiData] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const month = state.currentMonth;
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  const previousMonth = useMemo(() => {
    const [year, m] = month.split('-').map(Number);
    const prevDate = new Date(year, m - 2);
    return prevDate.toISOString().slice(0, 7);
  }, [month]);

  const coreDepts = [
    { id: DepartmentId.SALES, name: 'المبيعات', icon: '💰', color: COLORS.excellent, gradient: 'from-emerald-500/20 to-emerald-600/5' },
    { id: DepartmentId.PRODUCTION, name: 'الإنتاج', icon: '🏭', color: COLORS.good, gradient: 'from-blue-500/20 to-blue-600/5' },
    { id: DepartmentId.QUALITY, name: 'الجودة', icon: '💎', color: COLORS.accent, gradient: 'from-amber-500/20 to-amber-600/5' },
    { id: DepartmentId.WAREHOUSE, name: 'المخازن', icon: '📦', color: '#6366f1', gradient: 'from-indigo-500/20 to-indigo-600/5' },
    { id: DepartmentId.PROCUREMENT, name: 'المشتريات', icon: '🛒', color: '#ec4899', gradient: 'from-pink-500/20 to-pink-600/5' },
    { id: DepartmentId.MAINTENANCE, name: 'الصيانة', icon: '🛠️', color: COLORS.warning, gradient: 'from-orange-500/20 to-orange-600/5' }
  ];

  const deptMetrics = useMemo(() => {
    return coreDepts.map(d => {
      const current = state.departmentData[d.id]?.[month]?.score || 0;
      const previous = state.departmentData[d.id]?.[previousMonth]?.score || 0;
      const deviation = previous > 0 ? current - previous : 0;
      return { ...d, current, previous, deviation };
    });
  }, [state.departmentData, month, previousMonth]);

  const avgScore = Math.round(deptMetrics.reduce((s, m) => s + m.current, 0) / deptMetrics.length) || 0;

  const leadStats = useMemo(() => {
    const monthLeads = state.leads.filter(l => l.month === month);
    const converted = monthLeads.filter(l => l.status === 'تم البيع').length;
    return {
      total: monthLeads.length,
      converted,
      rate: monthLeads.length > 0 ? Math.round((converted / monthLeads.length) * 100) : 0
    };
  }, [state.leads, month]);

  const handleAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiData(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptData = {
        month,
        departmentScores: deptMetrics.map(m => ({ name: m.name, score: m.current })),
        leads: leadStats
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `حلل بيانات شركة ثاسس لشهر ${month} وقدم تقريراً استراتيجياً باللغة العربية. دورك هو التحليل الفني وتقديم الرؤى فقط دون إصدار أحكام إدارية نهائية. البيانات: ${JSON.stringify(promptData)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING },
              outlook: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['منخفض', 'متوسط', 'مرتفع'] },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['analysis', 'outlook', 'riskLevel', 'opportunities']
          }
        }
      });
      setAiData(JSON.parse(response.text));
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={`animate-fade-in text-right ${isTV ? 'space-y-16 p-6' : 'space-y-10 pb-48'}`}>
      
      {/* 1. Header & Cycle Control */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-brand-accent/20 pb-8">
        <div>
          <h2 className={`${isTV ? 'text-7xl' : 'text-4xl'} font-black dark:text-white flex items-center gap-4`}>
            <span className="w-2.5 h-12 bg-brand-accent rounded-full"></span>
            لوحة الأداء <span className="text-brand-accent">السيادي</span>
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Thassos Strategic Command Center</p>
        </div>
        
        <div className="flex items-center gap-4 bg-brand-primary p-4 rounded-3xl border border-brand-accent/30 shadow-2xl">
           <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest px-2">اختيار دورة التقرير:</span>
           <input 
            type="month" 
            value={month} 
            onChange={(e) => onUpdateMonth?.(e.target.value)}
            className="bg-transparent text-white font-black outline-none cursor-pointer text-lg focus:text-brand-accent transition-colors"
           />
        </div>
      </div>

      {/* 2. Sovereign Leadership Cards (Chairman & GM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="relative overflow-hidden bg-brand-primary p-10 rounded-[3rem] text-white shadow-4xl border-r-[12px] border-brand-accent group">
            <div className="absolute top-0 left-0 bg-brand-accent/10 px-6 py-2 rounded-br-2xl text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">Governance Head</div>
            <div className="relative z-10">
               <p className="text-[10px] font-bold text-brand-accent opacity-50 uppercase mb-2">رئيس مجلس الإدارة</p>
               <h3 className={`${isTV ? 'text-7xl' : 'text-4xl'} font-black italic`}>{state.executiveNames.chairman}</h3>
               <div className="mt-6 flex items-center gap-2">
                 <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase opacity-40">Certified Board Authority</span>
               </div>
            </div>
            <div className="absolute -bottom-10 -left-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" className="w-64" alt="watermark" />
            </div>
         </div>

         <div className="relative overflow-hidden bg-white dark:bg-brand-secondary p-10 rounded-[3rem] shadow-3xl border-r-[12px] border-slate-200 dark:border-white/10">
            <div className="absolute top-0 left-0 bg-slate-100 dark:bg-white/5 px-6 py-2 rounded-br-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Executive Oversight</div>
            <div className="relative z-10">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">المدير العام</p>
               <h3 className={`${isTV ? 'text-7xl' : 'text-4xl'} font-black dark:text-white italic`}>{state.executiveNames.gm}</h3>
               <div className="mt-6 flex items-center gap-2">
                 <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                 <span className="text-[9px] font-black uppercase opacity-40">Operations Master Control</span>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Master Efficiency Index */}
      <div className={`relative overflow-hidden bg-brand-primary ${isTV ? 'p-20 rounded-[5rem]' : 'p-12 rounded-[4rem]'} text-white shadow-5xl border border-white/5`}>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-accent/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-right">
           <div className="space-y-4">
              <h3 className={`${isTV ? 'text-5xl' : 'text-xs'} font-black text-brand-accent uppercase tracking-[0.5em]`}>Enterprise Efficiency Index</h3>
              <h2 className={`${isTV ? 'text-[12rem]' : 'text-7xl'} font-black leading-none italic tracking-tighter`}>معدل الأداء <br/> <span className="text-brand-accent">العام</span></h2>
           </div>
           
           <div className={`${isTV ? 'p-24 rounded-[7rem]' : 'p-12 rounded-[4rem]'} bg-white/5 border-2 border-brand-accent/20 backdrop-blur-3xl min-w-[350px] group`}>
              <div className={`${isTV ? 'text-[28rem]' : 'text-[11rem]'} font-black text-brand-accent leading-none tracking-tighter tabular-nums drop-shadow-2xl`}>
                 {avgScore}<span className="text-4xl opacity-20 ml-2">%</span>
              </div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mt-8">Combined Institutional Score</p>
           </div>
        </div>
      </div>

      {/* 4. KPI Pulse Grid */}
      <div className={`grid grid-cols-2 md:grid-cols-3 ${isTV ? 'lg:grid-cols-6 gap-8' : 'lg:grid-cols-3 gap-6'}`}>
        {deptMetrics.map(m => (
          <div key={m.id} className={`relative overflow-hidden ${isTV ? 'p-12 rounded-[5rem]' : 'p-8 rounded-[3rem]'} bg-white dark:bg-brand-secondary shadow-2xl border border-slate-100 dark:border-white/5 transition-all group hover:-translate-y-1`}>
             <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${m.gradient} opacity-40`}></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                   <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-3xl shadow-xl">{m.icon}</div>
                   <div className={`flex flex-col items-end ${m.deviation >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest">{m.deviation >= 0 ? 'Improvement' : 'Decline'}</span>
                      <span className="text-2xl font-black">{m.deviation >= 0 ? '+' : ''}{m.deviation.toFixed(0)}%</span>
                   </div>
                </div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{m.name}</h4>
                <div className="flex items-end gap-3">
                   <span className={`${isTV ? 'text-[12rem]' : 'text-7xl'} font-black dark:text-white leading-none tabular-nums`}>{m.current}</span>
                   <span className="text-2xl font-bold opacity-10 mb-3">%</span>
                </div>
                <div className="mt-8 h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full transition-all duration-1000 shadow-lg" style={{ width: `${m.current}%`, backgroundColor: m.color }}></div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* 5. Strategic Operations (70/30) & Sales Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         <div className="lg:col-span-7 bg-brand-primary p-12 rounded-[4rem] text-white shadow-4xl border border-brand-accent/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 left-0 bg-brand-accent/10 px-8 py-2 rounded-br-3xl text-[10px] font-black text-brand-accent uppercase tracking-widest">Operation Dynamics</div>
            <div className="space-y-3">
               <h3 className="text-5xl font-black italic">العمليات السيادية <span className="text-brand-accent">70/30</span></h3>
               <p className="opacity-50 text-lg font-medium">مؤشر الكفاءة التشغيلية الموحد</p>
            </div>
            <div className="flex-1 w-full bg-white/5 p-8 rounded-[3rem] border border-white/10">
               <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-black text-brand-accent uppercase tracking-widest">Network Distribution</span>
                  <span className="text-2xl font-black">{avgScore}%</span>
               </div>
               <div className="flex gap-4 h-5 rounded-full overflow-hidden p-1 bg-black/20">
                  <div className="bg-brand-accent rounded-full shadow-lg" style={{ width: '70%' }}></div>
                  <div className="bg-white/20 rounded-full" style={{ width: '30%' }}></div>
               </div>
               <div className="flex justify-between mt-4">
                  <div className="text-[9px] font-black text-brand-accent uppercase tracking-widest">Network Force (70%)</div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">Leadership (30%)</div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-5 bg-white dark:bg-brand-secondary p-12 rounded-[4rem] shadow-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden flex flex-col justify-between">
            <h3 className="text-3xl font-black italic mb-8 dark:text-white">تحويل المبيعات <span className="text-emerald-500">Sales Radar</span></h3>
            <div className="grid grid-cols-3 gap-6 text-center">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">استقطاب</p>
                  <p className="text-5xl font-black dark:text-white tabular-nums">{leadStats.total}</p>
               </div>
               <div className="border-x dark:border-white/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">إغلاق</p>
                  <p className="text-5xl font-black text-emerald-500 tabular-nums">{leadStats.converted}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">معدل</p>
                  <p className="text-5xl font-black text-brand-accent tabular-nums">{leadStats.rate}%</p>
               </div>
            </div>
            <div className="mt-8 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${leadStats.rate}%` }}></div>
            </div>
         </div>
      </div>

      {/* 6. AI Strategic Hub (Renamed) */}
      {!isTV && (
        <div className="relative overflow-hidden bg-brand-primary p-12 rounded-[4rem] text-white shadow-5xl border-2 border-brand-accent/20 group">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(201,162,77,0.1),transparent)]"></div>
           
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-accent/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🔮</div>
                  <h3 className="text-4xl font-black italic text-brand-accent">مركز التحليل الذكي</h3>
                </div>
                <p className="opacity-60 text-xl leading-relaxed max-w-3xl font-medium">
                  نظام ذكاء اصطناعي سيادي يحلل البيانات التشغيلية لتقديم رؤى تقنية تساعد في فهم مسار المؤسسة (يحلل ولا يحكم).
                </p>
              </div>
              
              <div className="flex gap-4">
                 {!aiData ? (
                   <button 
                    onClick={handleAiAnalysis} 
                    disabled={isAiLoading}
                    className="bg-brand-accent text-brand-primary px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 active:scale-95"
                   >
                     {isAiLoading ? 'جاري التحليل السيادي...' : 'بدء التحليل الذكي 🔮'}
                   </button>
                 ) : (
                   <button onClick={() => setAiData(null)} className="px-8 py-6 rounded-3xl bg-white/5 border border-white/10 font-black text-lg hover:bg-white/10 transition-all">تحليل جديد</button>
                 )}
              </div>
           </div>

           {aiData && (
             <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in relative z-10">
                <div className="lg:col-span-2 p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
                   <h4 className="text-brand-accent font-black text-xs uppercase tracking-widest mb-6 border-b border-brand-accent/20 pb-4">Analytical Insights</h4>
                   <p className="text-lg leading-relaxed text-white/80 font-medium italic">{aiData.analysis}</p>
                   <div className="mt-10 pt-10 border-t border-white/10">
                      <h4 className="text-brand-accent font-black text-xs uppercase tracking-widest mb-6">Identified Opportunities</h4>
                      <div className="flex flex-wrap gap-4">
                         {aiData.opportunities.map((o: string, i: number) => (
                           <div key={i} className="px-6 py-3 bg-brand-accent/10 border border-brand-accent/20 rounded-2xl text-xs font-black text-brand-accent">✨ {o}</div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl flex flex-col justify-between">
                   <div>
                      <h4 className="text-brand-accent font-black text-xs uppercase tracking-widest mb-6">Technical Outlook</h4>
                      <p className="text-white/60 text-sm italic leading-relaxed">{aiData.outlook}</p>
                   </div>
                   <div className="mt-10 p-8 bg-black/30 rounded-[2rem] border border-white/5 text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">Current Status Intensity</p>
                      <div className={`text-4xl font-black uppercase tracking-tighter ${
                        aiData.riskLevel === 'منخفض' ? 'text-emerald-500' : aiData.riskLevel === 'متوسط' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                         {aiData.riskLevel} Indicator
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default MainDashboardPage;
