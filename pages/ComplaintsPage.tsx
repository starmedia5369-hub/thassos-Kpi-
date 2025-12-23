
import React, { useState, useMemo } from 'react';
import { AppState, Complaint, ComplaintStatus, DepartmentId, ComplaintHistoryEntry, GovernanceLog } from '../types';
import { DEPARTMENTS, ALL_STAFF_LIST } from '../constants';

interface ComplaintsPageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const ComplaintsPage: React.FC<ComplaintsPageProps> = ({ state, onUpdateState }) => {
  const [complaintType, setComplaintType] = useState<'داخلي' | 'عميل'>('داخلي');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [deptId, setDeptId] = useState<DepartmentId>(DepartmentId.SALES);
  const [description, setDescription] = useState('');
  const [leadInvestigator, setLeadInvestigator] = useState('');
  const [assignedInvestigator, setAssignedInvestigator] = useState('');
  
  const [pendingDecisions, setPendingDecisions] = useState<Record<string, ComplaintStatus>>({});

  const isLocked = state.lockedMonths.includes(state.currentMonth);
  const month = state.currentMonth;

  const allSystemEmployees = useMemo(() => ALL_STAFF_LIST.map(s => s.name).sort(), []);

  const handlePrintInvestigations = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const reportHTML = `
      <div style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 30px;">
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #0F172A; padding-bottom: 20px; margin-bottom: 30px;">
          <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="width: 140px; filter: brightness(0);" />
          <div style="text-align: left;">
            <h1 style="margin: 0; font-size: 26px;">سجل التحقيقات الإدارية والقرارات القانونية</h1>
            <p style="margin: 5px 0; color: #64748b; font-size: 11px;">CORPORATE INTEGRITY & AUDIT REPORT</p>
          </div>
        </header>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #0F172A; color: white;">
              <th style="padding: 12px; border: 1px solid #0F172A;">الموظف/القسم</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">الوصف</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">طاقم التحقيق</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${(state.complaints || []).filter(c => c.month === month).map(c => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>${c.employee}</b><br/>${DEPARTMENTS.find(d => d.id === c.departmentId)?.name}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 12px;">${c.description}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 11px;">إشراف: ${c.leadInvestigator}<br/>محقق: ${c.assignedInvestigator}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${c.status}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    printWin.document.write(`<html><head><title>Investigations Report</title></head><body onload="window.print(); window.close();">${reportHTML}</body></html>`);
    printWin.document.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeName || !description) return alert('يرجى تعبئة جميع الحقول');
    const newComplaint: Complaint = {
      id: `COMP-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      month,
      type: complaintType,
      departmentId: deptId,
      employee: selectedEmployeeName,
      description,
      status: 'مفتوحة',
      leadInvestigator,
      assignedInvestigator
    };
    onUpdateState(prev => ({ ...prev, complaints: [newComplaint, ...(prev.complaints || [])] }));
    setDescription(''); setSelectedEmployeeName('');
  };

  const handleDecisionSubmit = (complaintId: string) => {
    const newStatus = pendingDecisions[complaintId];
    if (!newStatus) return;
    onUpdateState(prev => ({
      ...prev,
      complaints: (prev.complaints || []).map(c => c.id === complaintId ? { ...c, status: newStatus } : c)
    }));
    setPendingDecisions(prev => { const next = { ...prev }; delete next[complaintId]; return next; });
    alert('✅ تم اعتماد القرار النهائي.');
  };

  return (
    <div className="space-y-10 pb-32 animate-fade-in text-right">
      <div className="bg-brand-primary p-12 rounded-[4rem] text-white border border-brand-accent/30 shadow-2xl relative overflow-hidden flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black italic">نظام الرقابة والتحقيقات الإدارية</h2>
          <p className="text-sm opacity-60 mt-2 font-bold tracking-widest uppercase">Integrity & Investigation Suite</p>
        </div>
        <button onClick={handlePrintInvestigations} className="bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-black text-xs shadow-lg hover:scale-105 transition-all">🖨️ طباعة سجل التحقيقات</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-brand-secondary p-8 rounded-[3rem] border-2 border-brand-accent/10 shadow-xl no-print">
          <h3 className="text-xl font-black mb-8 dark:text-white">إيداع بلاغ جديد</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
               <button type="button" onClick={() => setComplaintType('داخلي')} className={`py-4 rounded-2xl font-black text-[10px] border transition-all ${complaintType === 'داخلي' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>🏢 شكوى داخلية</button>
               <button type="button" onClick={() => setComplaintType('عميل')} className={`py-4 rounded-2xl font-black text-[10px] border transition-all ${complaintType === 'عميل' ? 'bg-brand-accent text-brand-primary border-brand-accent' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>👤 شكوى عميل</button>
            </div>
            <select value={selectedEmployeeName} onChange={e => setSelectedEmployeeName(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-700 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none font-black dark:text-white">
                <option value="">اختيار الموظف...</option>
                {allSystemEmployees.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <select value={deptId} onChange={e => setDeptId(e.target.value as any)} className="w-full p-5 bg-gray-50 dark:bg-slate-700 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none font-black dark:text-white">
                {DEPARTMENTS.filter(d => !['executive', 'governance', 'complaints'].includes(d.id)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="grid grid-cols-1 gap-3">
               <select value={leadInvestigator} onChange={e => setLeadInvestigator(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold dark:text-white text-xs border border-transparent focus:border-brand-accent">
                   <option value="">رئيس التحقيق...</option>
                   {allSystemEmployees.map(name => <option key={name} value={name}>{name}</option>)}
               </select>
               <select value={assignedInvestigator} onChange={e => setAssignedInvestigator(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl font-bold dark:text-white text-xs border border-transparent focus:border-brand-accent">
                   <option value="">المحقق المكلف...</option>
                   {allSystemEmployees.map(name => <option key={name} value={name}>{name}</option>)}
               </select>
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-700 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none font-bold h-32 resize-none dark:text-white" placeholder="وصف الواقعة..." />
            <button type="submit" disabled={isLocked} className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black shadow-2xl hover:scale-105 transition-all">فتح ملف تحقيق سيادي</button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-brand-secondary p-1 rounded-[3.5rem] border dark:border-white/5 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-8 border-b dark:border-white/5 bg-gray-50/50 dark:bg-white/5 font-black text-xl dark:text-white">سجل التحقيقات النشطة</div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-100 dark:bg-white/5">
                <tr className="text-gray-400 text-[10px] font-black uppercase">
                  <th className="p-6">المعني / القسم</th>
                  <th className="p-6 text-center">طاقم التحقيق</th>
                  <th className="p-6 text-center">الحالة</th>
                  <th className="p-6 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {(state.complaints || []).filter(c => c.month === month).map(c => (
                  <tr key={c.id} className="border-b dark:border-white/5 hover:bg-gray-50 dark:hover:bg-brand-primary/10">
                    <td className="p-6">
                      <p className="font-black dark:text-white text-lg leading-none mb-1">{c.employee}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{DEPARTMENTS.find(d => d.id === c.departmentId)?.name}</p>
                    </td>
                    <td className="p-6 text-center text-[10px] font-bold dark:text-gray-300">
                      إشراف: {c.leadInvestigator}<br/>تكليف: {c.assignedInvestigator}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black border ${c.status === 'مثبتة' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-white/5 dark:text-gray-300'}`}>{c.status}</span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <select value={pendingDecisions[c.id] || c.status} onChange={(e) => setPendingDecisions(prev => ({...prev, [c.id]: e.target.value as ComplaintStatus}))} className="p-3 bg-white dark:bg-slate-800 border dark:border-white/10 rounded-xl font-black text-xs outline-none focus:border-brand-accent">
                          <option value="مفتوحة">مفتوحة</option>
                          <option value="تحت التحقيق">تحت التحقيق</option>
                          <option value="مثبتة">إثبات المخالفة</option>
                          <option value="مرفوضة">حفظ البلاغ</option>
                        </select>
                        {pendingDecisions[c.id] && pendingDecisions[c.id] !== c.status && (
                          <button onClick={() => handleDecisionSubmit(c.id)} className="p-3 bg-brand-accent text-brand-primary rounded-xl font-black text-[10px] shadow-lg">اعتماد</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintsPage;
