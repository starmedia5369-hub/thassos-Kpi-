
import React from 'react';
import { useLocation } from 'react-router-dom';
import { DepartmentId, KPIData, AppState } from '../types';
import KPIPageTemplate from './KPIPageTemplate';

interface HRPageProps {
  state: AppState;
  onSave: (month: string, data: KPIData) => void;
  onUpdateState?: (updater: (prev: AppState) => AppState) => void;
}

const HRPage: React.FC<HRPageProps> = ({ state, onSave }) => {
  const month = state.currentMonth;
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  const fields = [
    { key: 'attendanceRate', label: 'نسبة الحضور والإنصراف (20%)', type: 'percentage' as const },
    { key: 'employeeSatisfaction', label: 'رضا الموظفين (20%)', type: 'percentage' as const },
    { key: 'fileCompliance', label: 'اكتمال ملفات الموظفين (15%)', type: 'percentage' as const },
    { key: 'trainingExecution', label: 'تنفيذ خطة التدريب (15%)', type: 'percentage' as const },
    { key: 'voluntaryTurnover', label: 'معدل الدوران (15%)', type: 'percentage' as const, invert: true },
    { key: 'averageTenure', label: 'مدة الخدمة (سنوات) (15%)', type: 'number' as const }
  ];

  const calculateScore = (vals: Record<string, number>) => {
    const total = (vals.attendanceRate * 0.20) + (vals.employeeSatisfaction * 0.20) + (vals.fileCompliance * 0.15) + (vals.trainingExecution * 0.15) + (Math.max(0, 100 - vals.voluntaryTurnover) * 0.15) + (Math.min(100, vals.averageTenure * 10) * 0.15);
    return Math.round(total);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html dir="rtl">
        <head>
          <title>HR Audit Report</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #0F172A; }
            .header { display: flex; justify-content: space-between; border-bottom: 5px solid #C9A24D; padding-bottom: 20px; }
            .leadership { display: flex; justify-content: space-between; margin: 20px 0; font-weight: 900; background: #f8fafc; padding: 15px; border-radius: 10px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
             <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="height: 60px; filter: brightness(0);" />
             <div style="text-align: left">
              <h1 style="margin:0">تقرير الموارد البشرية والامتثال</h1>
              <p style="margin:0; color: #64748b">دورة النظام: ${month}</p>
            </div>
          </div>
          <div class="leadership">
            <span>رئيس مجلس الإدارة: ${state.executiveNames.chairman}</span>
            <span>المدير العام: ${state.executiveNames.gm}</span>
          </div>
          <div style="text-align: center; margin-top: 50px;">
             <p style="font-size: 1.5rem; color: #64748b;">مؤشر رأس المال البشري</p>
             <h1 style="font-size: 5rem; color: #C9A24D; margin:0;">${state.departmentData[DepartmentId.HR]?.[month]?.score || '--'}%</h1>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  if (isTV) {
    const hrData = state.departmentData[DepartmentId.HR]?.[month];
    return (
      <div className="space-y-20 animate-fade-in text-center pb-32 max-w-[95%] mx-auto">
        <div className="bg-brand-primary p-24 rounded-[6rem] text-white shadow-5xl border-8 border-brand-accent/30 relative overflow-hidden">
           <p className="text-5xl font-black text-brand-accent uppercase tracking-[0.5em] mb-12">مؤشر رأس المال البشري</p>
           <div className="text-[35rem] font-black text-white leading-none tracking-tighter drop-shadow-4xl">
              {hrData?.score || '--'}<span className="text-8xl opacity-30 ml-4">%</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-48 text-right animate-fade-in">
      <div className="flex justify-between items-center no-print">
         <h2 className="text-3xl font-black dark:text-white uppercase">إدارة الموارد البشرية</h2>
         <button onClick={handlePrint} className="bg-brand-accent text-brand-primary px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">🖨️ طباعة التقرير</button>
      </div>
      <KPIPageTemplate deptId={DepartmentId.HR} state={state} fields={fields} onSave={onSave} title="مؤشرات استدامة رأس المال البشري" calculateScore={calculateScore} />
    </div>
  );
};

export default HRPage;
