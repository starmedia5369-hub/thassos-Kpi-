
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { KPIData, AppState, DepartmentId } from '../types';
import { DEPARTMENTS } from '../constants';
import ApprovedCycleRecord from '../components/ApprovedCycleRecord';

// Update Field interface to allow string types and number weights for compatibility with constants.tsx
interface Field {
  key: string;
  label: string;
  type: string; // Changed from 'number' | 'percentage' | 'count' to string for broader compatibility
  min?: number;
  max?: number;
  invert?: boolean;
  weight?: string | number; // Changed from string to string | number to support decimal weights in constants
}

interface KPIPageTemplateProps {
  deptId: DepartmentId;
  state: AppState;
  fields: Field[];
  onSave?: (month: string, data: KPIData) => void;
  title: string;
  calculateScore: (vals: Record<string, number>) => number;
}

const KPIPageTemplate: React.FC<KPIPageTemplateProps> = ({ deptId, state, fields, title }) => {
  const month = state.currentMonth;
  const existingData = state.departmentData[deptId]?.[month];
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  const scoreInfo = useMemo(() => {
    if (!existingData) return { finalScore: null, penalty: 0 };
    
    const deptComplaints = (state.complaints || []).filter(c => c.departmentId === deptId && c.month === month);
    const provenComplaints = deptComplaints.filter(c => c.status === 'مثبتة');
    const provenPenalty = provenComplaints.length * 10;
    const hasPending = deptComplaints.some(c => c.status === 'مفتوحة' || c.status === 'تحت التحقيق');
    const totalPenalty = provenPenalty + (hasPending ? 5 : 0);
    
    return { 
      finalScore: existingData.score, 
      penalty: totalPenalty 
    };
  }, [existingData, deptId, month, state.complaints]);

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    const deptName = DEPARTMENTS.find(d => d.id === deptId)?.name || '';
    const score = existingData?.score || 0;

    printWin.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير - ${deptName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #0F172A; }
            .header { display: flex; justify-content: space-between; border-bottom: 5px solid #C9A24D; padding-bottom: 20px; margin-bottom: 30px; }
            .main-score { text-align: center; margin: 40px 0; background: #0F172A; color: white; padding: 40px; border-radius: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; padding: 12px; border: 1px solid #e2e8f0; text-align: right; }
            td { padding: 12px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
             <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="height: 50px; filter: brightness(0);" />
             <div style="text-align: left"><h1>تقرير أداء: ${deptName}</h1><p>${month}</p></div>
          </div>
          <div class="main-score">
            <p>الكفاءة المعتمدة</p>
            <h2 style="font-size: 5rem; color: #C9A24D; margin:10px 0;">${score}%</h2>
          </div>
          <table>
            <thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead>
            <tbody>
              ${fields.map(f => `<tr><td>${f.label}</td><td>${existingData?.values[f.key] || '--'}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-12 pb-24 text-right animate-fade-in">
      <div className="flex justify-between items-center no-print">
         <h3 className="text-2xl font-black dark:text-white flex items-center gap-4">
            <span className="w-2.5 h-10 bg-brand-accent rounded-full"></span>
            {title}
         </h3>
         {!isTV && (
            <button onClick={handlePrint} className="bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-black text-xs shadow-lg">
              🖨️ طباعة لوحة الأداء
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-brand-secondary p-12 rounded-[4rem] shadow-2xl border dark:border-white/5">
           <h4 className="text-lg font-black text-gray-400 uppercase mb-10 tracking-widest">تفصيل المؤشرات التشغيلية</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {fields.map(f => (
                <div key={f.key} className="p-6 bg-gray-50 dark:bg-brand-primary/20 rounded-3xl border dark:border-white/5">
                   <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">{f.label}</p>
                   <p className="text-3xl font-black dark:text-white">
                      {existingData?.values[f.key] !== undefined ? existingData.values[f.key] : '--'}
                      <span className="text-sm opacity-20 ml-1">{f.type === 'percentage' ? '%' : ''}</span>
                   </p>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-brand-primary p-12 rounded-[4rem] text-center shadow-2xl border-2 border-brand-accent/20 relative overflow-hidden">
              <p className="text-[11px] font-black text-brand-accent uppercase tracking-[0.4em] mb-6">Computed Efficiency Score</p>
              <div className="text-8xl font-black text-white leading-none mb-4 tracking-tighter">
                {scoreInfo.finalScore ?? '--'}<span className="text-3xl opacity-30">%</span>
              </div>
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">حالة الامتثال</p>
                 <p className={`font-black ${scoreInfo.finalScore && scoreInfo.finalScore >= 75 ? 'text-green-500' : 'text-orange-500'}`}>
                    {scoreInfo.finalScore && scoreInfo.finalScore >= 75 ? 'Stable Operations' : scoreInfo.finalScore ? 'Needs Review' : 'Pending Data'}
                 </p>
              </div>
           </div>
           
           <div className="p-8 bg-white dark:bg-brand-secondary rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10 text-center">
              <p className="text-xs font-bold text-gray-400 leading-relaxed italic">
                "تُعرض البيانات هنا للمراجعة فقط. لتعديل القيم، يرجى مراجعة صفحة تقييم الكوادر المركزية."
              </p>
           </div>
        </div>
      </div>
      
      <ApprovedCycleRecord state={state} deptId={deptId} />
    </div>
  );
};

export default KPIPageTemplate;
