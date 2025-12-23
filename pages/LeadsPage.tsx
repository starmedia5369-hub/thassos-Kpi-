
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { AppState, DepartmentId, Lead, LeadStatus } from '../types';
import { LEAD_STATUSES, ALL_STAFF_LIST, FINAL_STAFF } from '../constants';

interface LeadsPageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const LeadsPage: React.FC<LeadsPageProps> = ({ state, onUpdateState }) => {
  const loc = useLocation();
  const isTV = new URLSearchParams(loc.search).get('mode') === 'tv';

  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<string>('سوشيال ميديا');
  const [interest, setInterest] = useState('');

  const isLocked = state.lockedMonths.includes(state.currentMonth);
  const month = state.currentMonth;
  const currentLeads = (state.leads || []).filter(l => l.month === month);
  
  const displayLeads = isTV ? currentLeads.slice(0, 5) : currentLeads;
  
  const salesReps = useMemo(() => FINAL_STAFF.SALES_REPS.map(s => s.name), []);

  const handlePrintLeads = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const reportHTML = `
      <div style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 30px;">
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #0F172A; padding-bottom: 20px; margin-bottom: 30px;">
          <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="width: 140px; filter: brightness(0);" />
          <div style="text-align: left;">
            <h1 style="margin: 0; font-size: 26px;">سجل استقطاب العملاء والمبيعات - ${month}</h1>
            <p style="margin: 5px 0; color: #64748b; font-size: 11px;">SALES & LEAD CONVERSION AUDIT</p>
          </div>
        </header>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #0F172A; color: white;">
              <th style="padding: 12px; border: 1px solid #0F172A;">العميل</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">المصدر</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">المندوب</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">الحالة</th>
              <th style="padding: 12px; border: 1px solid #0F172A;">أمر العمل</th>
            </tr>
          </thead>
          <tbody>
            ${currentLeads.map(l => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>${l.customer}</b><br/>${l.phone}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${l.source}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${l.assignedRep}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${l.status}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${l.workOrderNumber || '--'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    printWin.document.write(`
      <html><head><title>Leads - ${month}</title></head><body onload="window.print(); window.close();">${reportHTML}</body></html>
    `);
    printWin.document.close();
  };

  const stats = useMemo(() => {
    const total = currentLeads.length;
    const converted = currentLeads.filter(l => l.status === 'تم البيع').length;
    const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;
    return { total, converted, conversionRate };
  }, [currentLeads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !phone) return alert('يرجى إدخال اسم العميل ورقم الهاتف');
    const assignedRep = salesReps[currentLeads.length % salesReps.length] || 'غير محدد';
    const newLead: Lead = { 
      id: Date.now().toString(), 
      date: new Date().toISOString().slice(0, 10), 
      month, 
      customer, 
      phone, 
      source, 
      interest, 
      assignedRep, 
      status: 'جديد' 
    };
    onUpdateState(prev => ({ ...prev, leads: [newLead, ...(prev.leads || [])] }));
    setCustomer(''); setPhone(''); setInterest(''); 
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    let workOrder: string | undefined = undefined;
    if (newStatus === 'تم البيع') {
      const input = window.prompt("يرجى إدخال رقم أمر العمل (Work Order) لإتمام عملية البيع:");
      if (!input) return alert("إجراء ملغى: يجب إدخال رقم أمر العمل لحالة 'تم البيع'");
      workOrder = input;
    }

    onUpdateState(prev => ({
      ...prev,
      leads: (prev.leads || []).map(l => l.id === leadId ? { ...l, status: newStatus, workOrderNumber: workOrder } : l)
    }));
  };

  return (
    <div className={`space-y-16 pb-48 text-right ${isTV ? 'max-w-[98%] mx-auto' : ''}`}>
      <div className="flex justify-between items-center no-print">
         <h2 className="text-2xl font-black dark:text-white">إدارة العملاء المحتملين والمبيعات</h2>
         {!isTV && (
            <button onClick={handlePrintLeads} className="bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-black text-xs shadow-lg">
              🖨️ طباعة كشف المبيعات
            </button>
         )}
      </div>

      {isTV && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 animate-fade-in">
          <div className="bg-brand-primary p-20 rounded-[5rem] border-8 border-brand-accent text-center">
             <p className="text-4xl font-black text-brand-accent uppercase mb-10">إجمالي الاستقطاب</p>
             <p className="text-[25rem] font-black text-white leading-none">{stats.total}</p>
          </div>
          <div className="bg-brand-primary p-20 rounded-[5rem] border-8 border-green-500 text-center">
             <p className="text-4xl font-black text-green-500 uppercase mb-10">تم البيع (مكتمل)</p>
             <p className="text-[25rem] font-black text-white leading-none">{stats.converted}</p>
          </div>
          <div className="bg-brand-primary p-20 rounded-[5rem] border-8 border-blue-500 text-center">
             <p className="text-4xl font-black text-blue-500 uppercase mb-10">معدل التحويل</p>
             <p className="text-[25rem] font-black text-white leading-none">{stats.conversionRate}%</p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isTV ? 'lg:grid-cols-1 gap-20' : 'lg:grid-cols-3 gap-10'}`}>
        {!isTV && (
          <div className="lg:col-span-1 no-print">
            <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3.5rem] shadow-2xl border border-brand-accent/20">
              <h3 className="text-2xl font-black mb-8 dark:text-white">إيداع عميل محتمل</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" value={customer} onChange={e => setCustomer(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none dark:text-white font-bold" placeholder="الاسم الثلاثي" required />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none dark:text-white font-bold" placeholder="رقم الهاتف" required />
                <select value={source} onChange={e => setSource(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none dark:text-white font-black">
                    {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="سوشيال ميديا">سوشيال ميديا</option>
                    <option value="معرض">المعرض</option>
                </select>
                <textarea value={interest} onChange={e => setInterest(e.target.value)} placeholder="وصف الطلب..." className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none dark:text-white font-bold h-24 resize-none" />
                <button type="submit" disabled={isLocked} className="w-full py-6 bg-brand-primary text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.03] transition-all disabled:opacity-30">إيداع وتوجيه العميل</button>
              </form>
            </div>
          </div>
        )}

        <div className={`${isTV ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-12`}>
           <div className={`bg-white dark:bg-brand-secondary shadow-4xl border-4 dark:border-white/10 ${isTV ? 'p-24 rounded-[6rem]' : 'p-10 rounded-[4rem]'}`}>
              <h3 className={`${isTV ? 'text-7xl mb-24' : 'text-2xl mb-8'} font-black dark:text-white`}>تتبع المبيعات (Live Tracker)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr className="text-gray-400 font-black uppercase">
                      <th className={`${isTV ? 'p-16 text-4xl' : 'p-6 text-xs'}`}>العميل</th>
                      <th className={`${isTV ? 'p-16 text-4xl' : 'p-6 text-xs'} text-center`}>المندوب</th>
                      <th className={`${isTV ? 'p-16 text-4xl' : 'p-6 text-xs'} text-center`}>الحالة / الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLeads.map(l => (
                      <tr key={l.id} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-brand-primary/20">
                        <td className={`${isTV ? 'p-16' : 'p-6'}`}>
                          <p className={`${isTV ? 'text-6xl mb-6' : 'text-lg font-black'} dark:text-white`}>{l.customer}</p>
                          <p className={`${isTV ? 'text-3xl' : 'text-xs'} text-gray-400 font-bold`}>📞 {l.phone} {l.workOrderNumber && `| WO: ${l.workOrderNumber}`}</p>
                        </td>
                        <td className={`${isTV ? 'p-16' : 'p-6'} text-center`}>
                           <span className={`${isTV ? 'text-5xl bg-white/5 p-8 rounded-3xl' : 'font-black'} dark:text-white`}>{l.assignedRep}</span>
                        </td>
                        <td className={`${isTV ? 'p-16' : 'p-6'} text-center`}>
                           {!isTV ? (
                             <select 
                              value={l.status} 
                              disabled={isLocked}
                              onChange={(e) => updateLeadStatus(l.id, e.target.value as LeadStatus)}
                              className={`p-3 rounded-xl font-black text-xs outline-none border transition-all ${l.status === 'تم البيع' ? 'bg-green-500 text-white border-green-600' : 'bg-gray-100 dark:bg-white/5 dark:text-white'}`}
                             >
                               {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                           ) : (
                             <span className={`${isTV ? 'text-5xl px-12 py-6' : 'text-xs px-4 py-2'} rounded-full font-black ${l.status === 'تم البيع' ? 'bg-green-500 text-white' : 'bg-brand-accent/20 text-brand-accent'}`}>{l.status}</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;
