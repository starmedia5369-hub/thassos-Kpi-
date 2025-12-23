
import React from 'react';
import { AppState } from '../types';
import { DEPARTMENTS } from '../constants';

const GovernanceLogPage: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const reportHTML = `
      <div class="print-governance">
        <header class="flex justify-between items-center border-b-4 border-slate-900 pb-8 mb-10">
          <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" alt="Logo" class="w-48 brightness-0" />
          <div class="text-left">
            <h1 class="text-3xl font-black text-slate-900 mb-1">سجل قرارات الحوكمة إيليت</h1>
            <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Thassos Elite Corporate Compliance Record</p>
            <div class="flex gap-4 mt-4 justify-end">
              <span class="bg-slate-100 px-4 py-1.5 rounded-lg border text-[10px] font-black">الدورة: ${month}</span>
              <span class="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase">Elite Audit Log</span>
            </div>
          </div>
        </header>

        <section class="mb-12">
          <table class="w-full text-right border-collapse">
              <thead>
                <tr class="bg-slate-900 text-white">
                  <th class="p-3 border border-slate-900 font-black text-[10px]">الوقت</th>
                  <th class="p-3 border border-slate-900 font-black text-[10px]">المعني</th>
                  <th class="p-3 border border-slate-900 font-black text-[10px]">الإجراء</th>
                  <th class="p-3 border border-slate-900 font-black text-[10px]">التفاصيل</th>
                  <th class="p-3 border border-slate-900 font-black text-[10px]">الأثر الإداري</th>
                </tr>
              </thead>
              <tbody>
                ${state.governanceLog?.map(log => `
                  <tr>
                    <td class="p-3 border text-[9px]">${log.timestamp}</td>
                    <td class="p-3 border text-[9px]">
                      <span class="font-bold">${log.employee || 'إدارة عامة'}</span><br/>
                      <span class="text-amber-600 uppercase font-black">${DEPARTMENTS.find(d => d.id === log.deptId)?.name || ''}</span>
                    </td>
                    <td class="p-3 border font-bold text-[10px]">${log.action}</td>
                    <td class="p-3 border text-[9px]">${log.reason}</td>
                    <td class="p-3 border font-black text-[9px] text-red-700">${log.impact}</td>
                  </tr>
                `).join('')}
              </tbody>
          </table>
        </section>

        <footer class="footer-fixed flex justify-between items-center border-t pt-8 mt-20 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
           <span>Elite Governance Audit Trail</span>
           <span class="page-count"></span>
           <span>${new Date().toLocaleDateString('ar-LY')}</span>
        </footer>
      </div>
    `;

    printWin.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>Elite Governance Log - ${month}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 20mm; }
            @page { size: A4; margin: 0; }
            .page-count:after { content: "صفحة " counter(page); }
            @media print {
              .footer-fixed { position: fixed; bottom: 20mm; left: 20mm; right: 20mm; }
            }
          </style>
        </head>
        <body>
          ${reportHTML}
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end no-print">
         <button onClick={handlePrint} className="bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
            🖨️ طباعة سجل إيليت
         </button>
      </div>

      <div className="bg-white dark:bg-brand-secondary p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 no-print">
        <h3 className="text-xl font-bold mb-6 dark:text-white">سجل حوكمة إيليت والقرارات الإدارية</h3>
        <p className="text-sm text-gray-500 mb-6 italic">هذا السجل للقراءة فقط لضمان الشفافية ومنع التلاعب بالبيانات.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-100 dark:bg-white/5">
              <tr>
                <th className="p-4 border dark:border-white/5 dark:text-white">الوقت</th>
                <th className="p-4 border dark:border-white/5 dark:text-white">المعني (الموظف/القسم)</th>
                <th className="p-4 border dark:border-white/5 dark:text-white">الإجراء المتخذ</th>
                <th className="p-4 border dark:border-white/5 dark:text-white">التفاصيل / السبب</th>
                <th className="p-4 border dark:border-white/5 dark:text-white text-center">الأثر</th>
              </tr>
            </thead>
            <tbody>
              {!state.governanceLog || state.governanceLog.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center opacity-50 italic dark:text-white">لا توجد سجلات حاليا</td></tr>
              ) : (
                state.governanceLog.map(log => (
                  <tr key={log.id} className="border-b dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 opacity-70 whitespace-nowrap dark:text-white/60 text-[10px] font-bold">{log.timestamp}</td>
                    <td className="p-4">
                      {log.employee && <p className="font-bold dark:text-white">{log.employee}</p>}
                      {log.deptId && <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest">{DEPARTMENTS.find(d => d.id === log.deptId)?.name}</p>}
                      {!log.employee && !log.deptId && <span className="opacity-20 italic">عام</span>}
                    </td>
                    <td className="p-4 font-bold dark:text-white">{log.action}</td>
                    <td className="p-4 dark:text-white/80 leading-relaxed">{log.reason}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.impact !== 'لا شيء' && !log.impact?.includes('تبرئة') ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'}`}>
                        {log.impact}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GovernanceLogPage;
