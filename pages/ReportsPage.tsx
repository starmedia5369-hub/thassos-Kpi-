
import React, { useState, useMemo } from 'react';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, ALL_STAFF_LIST, COLORS, DEPT_KPI_CONFIG, MAINTENANCE_KPI_CONFIG } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

type ReportType = 'employee' | 'department' | 'period' | 'company';
type TimeFrame = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

const ReportsPage: React.FC<{ state: AppState }> = ({ state }) => {
  const [reportType, setReportType] = useState<ReportType>('company');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');
  const [selectedId, setSelectedId] = useState<string>(''); // Can be employee name or deptId
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const month = state.currentMonth;
  const year = month.split('-')[0];

  // Logic to get relevant months for aggregate reports
  const getPeriodMonths = (frame: TimeFrame, currentMonth: string): string[] => {
    const [y, m] = currentMonth.split('-').map(Number);
    if (frame === 'monthly') return [currentMonth];
    if (frame === 'quarterly') {
      const q = Math.ceil(m / 3);
      return Array.from({length: 3}, (_, i) => `${y}-${String((q-1)*3 + i + 1).padStart(2, '0')}`);
    }
    if (frame === 'semi-annual') {
      const h = m <= 6 ? 1 : 2;
      return Array.from({length: 6}, (_, i) => `${y}-${String((h-1)*6 + i + 1).padStart(2, '0')}`);
    }
    if (frame === 'annual') {
      return Array.from({length: 12}, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);
    }
    return [currentMonth];
  };

  const activePeriodMonths = useMemo(() => getPeriodMonths(timeFrame, month), [timeFrame, month]);

  const reportableDepts = useMemo(() => 
    DEPARTMENTS.filter(d => !['executive', 'reports', 'settings', 'governance', 'complaints', 'leads', 'circulars', 'bonus'].includes(d.id)), 
  []);

  // AI Insights Engine
  const generateAiInsights = async (data: any) => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `أنت المحلل الاستراتيجي لشركة ثاسس. حلل هذه البيانات التشغيلية وقدم ملخصاً تنفيذياً مختصراً (رؤى استراتيجية) باللغة العربية. البيانات: ${JSON.stringify(data)}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });
      setAiInsight(response.text);
    } catch (e) {
      setAiInsight("تعذر الاتصال بمحرك الذكاء الاصطناعي حالياً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Printing Layout Engine
  const handlePrint = (type: ReportType) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    let content = '';
    const branding = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #0F172A; padding-bottom: 20px; margin-bottom: 30px;">
        <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="height: 60px; filter: brightness(0);" />
        <div style="text-align: left;">
          <h1 style="margin:0; font-size: 24px;">نظام ثاسس لإدارة المؤسسات - تقرير إيليت</h1>
          <p style="margin:0; color: #C9A24D; font-weight: 900; letter-spacing: 2px;">THASSOS ELITE AUDIT SUITE</p>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 30px; font-weight: 900; border: 1px solid #e2e8f0;">
        <span>رئيس مجلس الإدارة: ${state.executiveNames.chairman}</span>
        <span>المدير العام: ${state.executiveNames.gm}</span>
        <span>الفترة: ${timeFrame.toUpperCase()} (${month})</span>
      </div>
    `;

    if (type === 'company') {
      let total = 0; let count = 0;
      const scores = reportableDepts.map(d => {
        let sum = 0; let mCount = 0;
        activePeriodMonths.forEach(m => {
          const score = state.departmentData[d.id]?.[m]?.score;
          if (score !== undefined) { sum += score; mCount++; }
        });
        const avg = mCount > 0 ? Math.round(sum / mCount) : 0;
        if (avg > 0) { total += avg; count++; }
        return { name: d.name, score: avg };
      }).sort((a,b) => b.score - a.score);

      const finalAvg = count > 0 ? Math.round(total / count) : 0;

      content = `
        ${branding}
        <div style="text-align: center; margin: 40px 0;">
          <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 10px;">المعدل المؤسسي العام (Enterprise Score)</p>
          <div style="font-size: 6rem; font-weight: 900; color: #0F172A;">${finalAvg}%</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
          <thead><tr style="background: #0F172A; color: white;">
            <th style="padding: 15px; border: 1px solid #0F172A;">القسم</th><th style="padding: 15px; border: 1px solid #0F172A;">الكفاءة</th><th style="padding: 15px; border: 1px solid #0F172A;">الحالة</th>
          </tr></thead>
          <tbody>
            ${scores.map(s => `<tr><td style="padding: 15px; border: 1px solid #e2e8f0; font-weight: 900;">${s.name}</td><td style="padding: 15px; border: 1px solid #e2e8f0; font-size: 1.5rem;">${s.score}%</td><td style="padding: 15px; border: 1px solid #e2e8f0;">${s.score >= 75 ? 'مستقر' : 'تنبيه'}</td></tr>`).join('')}
          </tbody>
        </table>
        ${aiInsight ? `<div style="margin-top: 40px; padding: 25px; background: #fffbeb; border: 2px solid #fde68a; border-radius: 20px;">
          <h4 style="margin:0 0 10px 0; color: #b45309;">💡 رؤية المحلل الاستراتيجي (AI Insight):</h4>
          <p style="margin:0; line-height: 1.6;">${aiInsight}</p>
        </div>` : ''}
      `;
    } else if (type === 'department' && selectedId) {
      const dept = DEPARTMENTS.find(d => d.id === selectedId);
      let sum = 0; let mCount = 0;
      activePeriodMonths.forEach(m => {
        const score = state.departmentData[selectedId]?.[m]?.score;
        if (score !== undefined) { sum += score; mCount++; }
      });
      const avg = mCount > 0 ? Math.round(sum / mCount) : 0;

      content = `
        ${branding}
        <div style="text-align: center; margin: 30px 0;">
          <h2 style="margin:0; color: #0F172A;">تقرير أداء وحدة: ${dept?.name}</h2>
          <div style="font-size: 5rem; font-weight: 900; color: #C9A24D; margin-top: 10px;">${avg}%</div>
        </div>
        <h3>تفصيل الأداء التشغيلي:</h3>
        <p>يتم احتساب هذه النتيجة بناءً على ${mCount} دورة معتمدة في المنظومة لفترة ${timeFrame}.</p>
      `;
    } else if (type === 'employee' && selectedId) {
      const staff = ALL_STAFF_LIST.find(s => s.name === selectedId);
      let sum = 0; let mCount = 0;
      activePeriodMonths.forEach(m => {
        const score = state.employeeKPIs[staff?.deptId as string]?.[selectedId]?.[m]?.score;
        if (score !== undefined) { sum += score; mCount++; }
      });
      const avg = mCount > 0 ? Math.round(sum / mCount) : 0;

      content = `
        ${branding}
        <div style="display: flex; gap: 40px; align-items: center; margin: 40px 0;">
          <div style="flex: 1;">
            <p style="margin:0; color: #64748b;">الموظف:</p>
            <h2 style="margin:0; font-size: 2rem;">${selectedId}</h2>
            <p style="margin:5px 0 0 0; color: #C9A24D; font-weight: 900; text-transform: uppercase;">${staff?.role}</p>
          </div>
          <div style="text-align: center; background: #0F172A; color: white; padding: 20px 40px; border-radius: 25px;">
             <p style="margin:0; font-size: 0.8rem; opacity: 0.6;">معدل الكفاءة</p>
             <div style="font-size: 3.5rem; font-weight: 900; color: #C9A24D;">${avg}%</div>
          </div>
        </div>
      `;
    }

    printWin.document.write(`
      <html dir="rtl">
        <head>
          <title>Thassos Elite Report - ${type}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #0F172A; line-height: 1.5; }</style>
        </head>
        <body onload="window.print()">${content}</body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-12 pb-48 animate-fade-in text-right">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-3xl font-black dark:text-white uppercase italic tracking-tighter">جناح التقارير إيليت</h2>
           <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Multi-Level Strategic Auditing System</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-brand-secondary p-1.5 rounded-2xl border dark:border-white/5 shadow-inner">
           {(['company', 'department', 'employee', 'period'] as ReportType[]).map(t => (
             <button 
                key={t} onClick={() => { setReportType(t); setSelectedId(''); setAiInsight(null); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${reportType === t ? 'bg-brand-primary text-brand-accent shadow-lg border border-brand-accent/20' : 'text-gray-400 hover:text-gray-600'}`}
             >
                {t === 'company' ? 'المؤسسة' : t === 'department' ? 'القسم' : t === 'employee' ? 'الموظف' : 'الدورة'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-8 no-print">
           <div className="bg-white dark:bg-brand-secondary p-8 rounded-[3rem] shadow-xl border dark:border-white/5">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-4">إعدادات النطاق</h4>
              <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase block mb-3 pr-2">الفترة الزمنية</label>
                   <select 
                    value={timeFrame} onChange={e => setTimeFrame(e.target.value as TimeFrame)}
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl font-black outline-none dark:text-white"
                   >
                      <option value="monthly">شهري (Monthly)</option>
                      <option value="quarterly">ربع سنوي (Quarterly)</option>
                      <option value="semi-annual">نصفي (Semi-Annual)</option>
                      <option value="annual">سنوي (Annual)</option>
                   </select>
                </div>

                {reportType === 'department' && (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-3 pr-2">اختيار القسم</label>
                    <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl font-black outline-none dark:text-white">
                        <option value="">اختر القسم...</option>
                        {reportableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                )}

                {reportType === 'employee' && (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-3 pr-2">اختيار الموظف</label>
                    <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-white/5 border dark:border-white/10 rounded-2xl font-black outline-none dark:text-white">
                        <option value="">اختر الموظف...</option>
                        {ALL_STAFF_LIST.map(s => <option key={s.name} value={s.name}>{s.name} ({s.role})</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-6 space-y-3">
                   <button 
                    onClick={() => generateAiInsights({ type: reportType, frame: timeFrame, id: selectedId })}
                    disabled={isAiLoading || (reportType !== 'company' && !selectedId)}
                    className="w-full py-4 bg-brand-accent/20 text-brand-accent border border-brand-accent/30 rounded-2xl font-black text-xs hover:bg-brand-accent hover:text-brand-primary transition-all disabled:opacity-20"
                   >
                     {isAiLoading ? 'جاري التحليل...' : '🔮 تحليل بالذكاء الاصطناعي'}
                   </button>
                   <button 
                    onClick={() => handlePrint(reportType)}
                    disabled={reportType !== 'company' && !selectedId}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-xs shadow-xl hover:scale-105 transition-all disabled:opacity-20"
                   >
                     🖨️ طباعة التقرير المعتمد
                   </button>
                </div>
              </div>
           </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-3">
           <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-2xl border border-brand-accent/30 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(201,162,77,0.1),transparent)] opacity-40"></div>
              
              <div className="relative z-10 text-center space-y-6 max-w-2xl">
                 <div className="inline-flex items-center gap-3 px-4 py-1 bg-brand-accent/20 border border-brand-accent/30 rounded-full mb-4">
                    <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Elite Report Preview</span>
                 </div>
                 <h3 className="text-4xl font-black italic">
                   {reportType === 'company' ? 'التقرير المؤسسي الشامل' : 
                    reportType === 'department' ? `تحليل أداء القسم: ${selectedId ? DEPARTMENTS.find(d => d.id === selectedId)?.name : '---'}` :
                    reportType === 'employee' ? `سجل كفاءة الموظف: ${selectedId || '---'}` : 'ترتيب الوحدات التشغيلية'}
                 </h3>
                 <p className="opacity-50 text-lg">بناءً على دورة نظام {month} لفترة {timeFrame}.</p>
                 
                 {aiInsight && (
                   <div className="mt-10 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-right animate-fade-in backdrop-blur-xl">
                      <p className="text-[10px] font-black text-brand-accent uppercase mb-4">رؤية المحلل الاستراتيجي (AI):</p>
                      <p className="text-white/80 leading-relaxed font-medium">{aiInsight}</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
