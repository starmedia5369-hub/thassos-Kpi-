
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, DepartmentId, BonusEvaluation } from '../types';
import { FINAL_STAFF } from '../constants';

interface BonusReportingPageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const ELIGIBLE_STAFF = [
  ...FINAL_STAFF.MANAGEMENT,
  ...FINAL_STAFF.MAINTENANCE
];

const MAX_BONUS = 250;
const ELIGIBILITY_THRESHOLD = 90;

const BonusReportingPage: React.FC<BonusReportingPageProps> = ({ state, onUpdateState }) => {
  const month = state.currentMonth;
  const isLocked = state.lockedMonths.includes(month);

  const [selectedStaffIndex, setSelectedStaffIndex] = useState(0);
  const [consistency, setConsistency] = useState(0); 
  const [quality, setQuality] = useState(0);         
  const [note, setNote] = useState('');

  const currentPerson = ELIGIBLE_STAFF[selectedStaffIndex];

  useEffect(() => {
    const existingEval = (state.bonusEvaluations || []).find(
      b => b.month === month && b.employeeName === currentPerson.name && b.role === currentPerson.role
    );

    if (existingEval) {
      setConsistency(existingEval.consistencyScore || 0);
      setQuality(existingEval.qualityScore || 0);
      setNote(existingEval.notes || '');
    } else {
      setConsistency(0);
      setQuality(0);
      setNote('');
    }
  }, [selectedStaffIndex, month, state.bonusEvaluations, currentPerson.name, currentPerson.role]);

  const { score, bonus, isEligible } = useMemo(() => {
    const currentScore = (consistency * 0.6) + (quality * 0.4);
    const eligible = currentScore >= ELIGIBILITY_THRESHOLD;
    return {
      score: Math.round(currentScore),
      bonus: eligible ? MAX_BONUS : 0,
      isEligible: eligible
    };
  }, [consistency, quality]);

  const handlePrintBonusAudit = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const evals = (state.bonusEvaluations || []).filter(b => b.month === month);

    const reportHTML = `
      <div style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 30px;">
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #0F172A; padding-bottom: 20px; margin-bottom: 30px;">
          <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="width: 140px; filter: brightness(0);" />
          <div style="text-align: left;">
            <h1 style="margin: 0; font-size: 26px;">كشف استحقاق المكافآت - ${month}</h1>
            <p style="margin: 5px 0; color: #64748b; font-size: 11px;">REPORTING BONUS AUDIT & DISBURSEMENT</p>
          </div>
        </header>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #0F172A; color: white;">
              <th style="padding: 12px; border: 1px solid #0F172A;">الموظف</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">الدور</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">النتيجة</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">المبلغ</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">المبررات</th>
            </tr>
          </thead>
          <tbody>
            ${evals.map(e => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">${e.employeeName}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-size: 12px;">${e.role}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${Math.round((e.consistencyScore * 0.6) + (e.qualityScore * 0.4))}%</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 900;">${e.totalAmount} د.ل</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 11px; color: #666;">${e.notes || '---'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 50px; text-align: center; border-top: 1px dashed #ccc; pt: 10px; font-size: 12px;">إجمالي المبالغ المستحقة: ${evals.reduce((s, b) => s + b.totalAmount, 0)} دينار ليبي</div>
      </div>
    `;

    printWin.document.write(`
      <html>
        <head>
          <title>Bonus Audit - ${month}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
          <style>body { margin: 0; font-family: 'Tajawal', sans-serif; }</style>
        </head>
        <body onload="window.print(); window.close();">${reportHTML}</body>
      </html>
    `);
    printWin.document.close();
  };

  const handleSaveBonus = () => {
    if (isEligible && !note.trim()) {
      alert('⚠️ تنبيه حوكمة: يرجى كتابة ملاحظة تبرير (توصية الصرف) قبل حفظ بيانات الاستحقاق للموظف ' + currentPerson.name);
      return;
    }

    const newEval: BonusEvaluation = {
      id: `BON-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      month,
      role: currentPerson.role,
      employeeName: currentPerson.name,
      consistencyScore: consistency,
      qualityScore: quality,
      recommendationScore: 0,
      transparencyScore: 0,
      totalAmount: bonus, 
      notes: note,
      isApproved: true
    };

    onUpdateState(prev => {
      const filteredEvals = (prev.bonusEvaluations || []).filter(
        b => !(b.month === month && b.employeeName === currentPerson.name && b.role === currentPerson.role)
      );
      
      const logEntry = {
        id: `GOV-${Date.now()}`,
        timestamp: new Date().toLocaleString('ar-LY'),
        action: `تحديث حالة مكافأة: ${currentPerson.name}`,
        reason: `نتيجة التقييم: ${score}% - الاستحقاق: ${isEligible ? 'مستحق (250 د.ل)' : 'غير مستحق'}`,
        impact: isEligible ? `اعتماد صرف مالي بقيمة ${MAX_BONUS} د.ل` : `عدم صرف للمكافأة`,
        deptId: currentPerson.deptId,
        employee: currentPerson.name
      };

      return {
        ...prev,
        bonusEvaluations: [...filteredEvals, newEval],
        governanceLog: [logEntry, ...(prev.governanceLog || [])]
      };
    });

    alert(isEligible 
      ? `✅ تم بنجاح اعتماد صرف المكافأة (250 د.ل) للموظف: ${currentPerson.name}` 
      : `✅ تم حفظ التقييم. الموظف غير مستحق للمكافأة لهذه الدورة بنسبة ${score}%`
    );

    if (selectedStaffIndex < ELIGIBLE_STAFF.length - 1) {
      setSelectedStaffIndex(prev => prev + 1);
    }
  };

  const monthlyEvaluations = (state.bonusEvaluations || []).filter(b => b.month === month);

  return (
    <div className="space-y-10 animate-fade-in text-right pb-32">
      <div className="flex justify-between items-center no-print">
         <h2 className="text-3xl font-black dark:text-white uppercase">إدارة المكافآت المالية</h2>
         <button 
           onClick={handlePrintBonusAudit}
           className="bg-brand-accent text-brand-primary px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all"
         >
           🖨️ طباعة كشف استحقاق الـ 250
         </button>
      </div>

      <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center border border-brand-accent/20">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-brand-accent/10 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl border border-brand-accent/20">💰</div>
          <div>
            <h3 className="text-4xl font-black text-brand-accent mb-2">منظومة مكافأة التقارير (250 د.ل)</h3>
            <p className="opacity-60 text-sm">إدارة مركزية لاعتماد استحقاق المكافأة بناءً على الأداء الإداري والتقني.</p>
          </div>
        </div>
        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center min-w-[200px]">
           <p className="text-[10px] font-black uppercase text-brand-accent mb-2 tracking-[0.3em]">إجمالي المبالغ المعتمدة {month}</p>
           <p className="text-4xl font-black">{monthlyEvaluations.reduce((sum, b) => sum + b.totalAmount, 0)} <span className="text-sm opacity-40">د.ل</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-4">
           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mr-4 mb-4">اختيار الكادر للتقييم</h4>
           {ELIGIBLE_STAFF.map((person, idx) => {
             const isSelected = selectedStaffIndex === idx;
             const evalRecord = (state.bonusEvaluations || []).find(b => b.month === month && b.employeeName === person.name && b.role === person.role);
             
             return (
               <button 
                key={`${person.name}-${idx}`}
                onClick={() => setSelectedStaffIndex(idx)}
                className={`w-full p-8 rounded-[2.5rem] border transition-all text-right flex justify-between items-center group ${
                  isSelected 
                  ? 'bg-brand-primary text-white border-brand-accent shadow-2xl scale-[1.02]' 
                  : 'bg-white dark:bg-brand-secondary border-gray-100 dark:border-white/5 hover:border-brand-accent/30 shadow-sm'
                }`}
               >
                 <div>
                    <p className={`font-black text-xl ${isSelected ? 'text-brand-accent' : 'dark:text-white'}`}>{person.name}</p>
                    <p className={`text-[10px] uppercase font-bold mt-1 ${isSelected ? 'text-white/40' : 'text-gray-400'}`}>{person.role}</p>
                 </div>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${evalRecord?.totalAmount > 0 ? 'bg-green-500 text-white shadow-lg' : evalRecord ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-300'}`}>
                    {evalRecord?.totalAmount > 0 ? '✓' : evalRecord ? '✕' : '?'}
                 </div>
               </button>
             );
           })}
        </div>

        <div className="lg:col-span-2 space-y-10">
           <div className="bg-white dark:bg-brand-secondary p-12 rounded-[4rem] shadow-2xl border dark:border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-12">
                 <h4 className="text-2xl font-black dark:text-white">تقييم الموظف: <span className="text-brand-accent">{currentPerson.name}</span></h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-12 py-4">
                    <div className="group">
                      <div className="flex justify-between mb-4 px-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-brand-accent transition-colors">1. الانضباط والاستمرارية (60%)</label>
                        <span className="text-brand-accent font-black text-2xl">{consistency}%</span>
                      </div>
                      <input type="range" value={consistency} onChange={e => setConsistency(parseInt(e.target.value))} className="w-full h-4 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-accent" />
                    </div>

                    <div className="group">
                      <div className="flex justify-between mb-4 px-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-brand-accent transition-colors">2. جودة البيانات والتحليل (40%)</label>
                        <span className="text-brand-accent font-black text-2xl">{quality}%</span>
                      </div>
                      <input type="range" value={quality} onChange={e => setQuality(parseInt(e.target.value))} className="w-full h-4 bg-gray-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-accent" />
                    </div>
                 </div>

                 <div className={`rounded-[3.5rem] p-10 flex flex-col justify-center items-center text-center border-4 relative overflow-hidden transition-all duration-500 ${isEligible ? 'bg-brand-primary text-white border-brand-accent shadow-2xl scale-[1.05]' : 'bg-red-500/5 border-red-500/20'}`}>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">الاستحقاق المالي النهائي</p>
                    <div className={`text-9xl font-black mb-2 leading-none transition-all ${isEligible ? 'text-brand-accent' : 'text-red-500 opacity-20'}`}>
                       {bonus}
                    </div>
                    <p className={`font-black text-xl mb-8 ${isEligible ? 'text-white' : 'text-red-500'}`}>دينار ليبي</p>
                    <div className="bg-white/5 p-6 rounded-[2rem] w-full border border-white/10 backdrop-blur-md">
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">الدرجة المرجحة الكلية</p>
                       <p className={`text-4xl font-black ${isEligible ? 'text-white font-black' : 'text-red-500 opacity-40'}`}>{score}%</p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-10 border-t dark:border-white/5">
                 <label className={`block text-xs font-black uppercase mb-4 pr-6 tracking-widest text-right transition-colors ${isEligible && !note.trim() ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                    ملاحظات التدقيق الإداري {isEligible ? '(مطلوب للاعتماد ⚠️)' : '(اختياري)'}
                 </label>
                 <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={isEligible ? "يرجى كتابة سبب الاستحقاق (مثلاً: دقة البيانات بنسبة 100% والالتزام اليومي)..." : "اكتب سبب عدم الاستحقاق أو ملاحظات للتحسين..."}
                  className={`w-full p-8 bg-gray-50 dark:bg-slate-700/50 border-2 rounded-[3rem] outline-none dark:text-white font-bold h-40 transition-all resize-none text-right ${isEligible && !note.trim() ? 'border-red-500/30 bg-red-500/5' : 'border-transparent focus:border-brand-accent/20'}`}
                 />
              </div>

              <button 
                onClick={handleSaveBonus}
                disabled={isLocked}
                className={`w-full mt-10 py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all disabled:opacity-20 flex items-center justify-center gap-6 ${isEligible ? 'bg-brand-accent text-brand-primary hover:scale-[1.02] active:scale-95 shadow-brand-accent/30' : 'bg-brand-primary text-white'}`}
              >
                {isLocked ? '🔒 الدورة مغلقة' : '💾 حفظ واعتماد تقرير الاستحقاق'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BonusReportingPage;
