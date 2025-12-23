
import React, { useState } from 'react';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, COLORS } from '../constants';

interface ApprovedCycleRecordProps {
  state: AppState;
  deptId?: DepartmentId;
}

const ApprovedCycleRecord: React.FC<ApprovedCycleRecordProps> = ({ state, deptId }) => {
  const [selectedMonth, setSelectedMonth] = useState(state.currentMonth);

  // إذا لم يتم تحديد قسم، نعرض النسخة الشاملة
  if (!deptId) {
    const departmentsToDisplay = DEPARTMENTS.filter(d => 
      !['executive', 'reports', 'settings', 'governance', 'complaints', 'leads', 'circulars'].includes(d.id)
    );

    return (
      <div className="mt-20 no-print animate-fade-in">
        <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3.5rem] shadow-2xl border border-brand-accent/20 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 border-b dark:border-white/5 pb-8">
            <div>
              <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
                <span className="text-2xl">📜</span>
                سجل الأداء المعتمد (متصفح الأرشيف الشامل)
              </h3>
            </div>
            <div className="flex items-center gap-4 bg-brand-primary p-3 rounded-2xl border border-brand-accent/30 shadow-xl">
               <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest px-2">اختر الدورة المرجعية:</span>
               <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white font-black outline-none cursor-pointer"
               />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {departmentsToDisplay.map(dept => {
              const data = state.departmentData[dept.id]?.[selectedMonth];
              const score = data?.score || 0;
              return (
                <div key={dept.id} className={`p-6 rounded-[2rem] border transition-all ${data ? 'bg-brand-accent/5 border-brand-accent/20' : 'bg-gray-50 dark:bg-white/5 border-transparent opacity-40'}`}>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-2 truncate">{dept.name}</p>
                  <div className="text-3xl font-black dark:text-white">{data ? `${score}%` : '--'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // نسخة القسم المحدد
  const deptName = DEPARTMENTS.find(d => d.id === deptId)?.name || 'القسم';
  const historicalData = state.departmentData[deptId]?.[selectedMonth];
  const score = historicalData?.score || 0;

  return (
    <div className="mt-20 no-print animate-fade-in">
      <div className="bg-gradient-to-l from-brand-primary to-slate-900 p-1 rounded-[3rem] shadow-2xl">
        <div className="bg-white dark:bg-brand-secondary rounded-[2.8rem] p-10 relative overflow-hidden border border-white/5">
          <div className="absolute -left-10 -bottom-10 opacity-[0.03] rotate-12 pointer-events-none">
            <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" alt="watermark" className="w-80" />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-brand-accent/10 border border-brand-accent/30 rounded-[1.8rem] flex items-center justify-center text-4xl shadow-inner">
                📑
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-brand-accent uppercase tracking-[0.3em]">Historical Archive Mode</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                </div>
                <h3 className="text-3xl font-black dark:text-white">سجل أداء {deptName} التاريخي</h3>
                <div className="flex items-center gap-3 mt-2">
                   <p className="text-gray-400 font-bold text-sm">تصفح بيانات دورة:</p>
                   <input 
                    type="month" 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-brand-primary text-brand-accent px-4 py-1 rounded-xl text-xs font-black outline-none border border-brand-accent/20 cursor-pointer"
                   />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12 bg-gray-50 dark:bg-white/5 px-10 py-6 rounded-[2.5rem] border dark:border-white/5 shadow-inner">
               <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">النتيجة النهائية</p>
                  <p className="text-5xl font-black text-brand-accent">{historicalData ? `${score}%` : '---'}</p>
               </div>
               <div className="w-px h-12 bg-gray-200 dark:bg-white/10"></div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">حالة الاعتماد</p>
                  <p className={`text-xl font-black ${score >= 90 ? 'text-green-500' : score >= 75 ? 'text-blue-500' : 'text-orange-500'}`}>
                    {historicalData ? historicalData.status : 'No Data'}
                  </p>
               </div>
               <div className="hidden lg:block ml-4">
                  <div className="w-16 h-16 border-4 border-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent opacity-40">
                    <span className="text-[8px] font-black uppercase text-center leading-none">THASSOS<br/>SEAL</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedCycleRecord;
