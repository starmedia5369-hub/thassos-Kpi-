
import React, { useState, useMemo } from 'react';
import { AppState, Circular, DepartmentId, Reminder, GovernanceLog } from '../types';

interface CircularsPageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const CircularsPage: React.FC<CircularsPageProps> = ({ state, onUpdateState }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [source, setSource] = useState<Circular['source']>('الادارة العليا');
  const [deadline, setDeadline] = useState('');
  const [requireAck, setRequireAck] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'reminders'>('list');

  const month = state.currentMonth;
  const today = new Date().toISOString().slice(0, 10);

  const todaysRemindersQueue = useMemo(() => {
    return (state.reminders || []).filter(r => r.status === 'مجدول' && r.scheduledAt <= today);
  }, [state.reminders, today]);

  const handlePrintCirculars = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const reportHTML = `
      <div style="direction: rtl; font-family: 'Tajawal', sans-serif; padding: 30px;">
        <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #0F172A; padding-bottom: 20px; margin-bottom: 30px;">
          <img src="https://i.ibb.co/Lh21sLw3/BLUE-WHITYE.png" style="width: 140px; filter: brightness(0);" />
          <div style="text-align: left;">
            <h1 style="margin: 0; font-size: 26px;">سجل التعميمات والقرارات الإدارية</h1>
            <p style="margin: 5px 0; color: #64748b; font-size: 11px;">REGULATORY COMPLIANCE ARCHIVE</p>
          </div>
        </header>
        ${state.circulars.map(c => `
          <div style="margin-bottom: 30px; padding: 20px; border: 2px solid #eee; border-radius: 15px;">
             <h3 style="margin:0 0 10px 0; color: #0F172A;">${c.title}</h3>
             <p style="margin:0 0 15px 0; color: #C9A24D; font-weight: bold; font-size: 12px;">المصدر: ${c.source} | النوع: ${c.type} | التاريخ: ${new Date(c.createdAt).toLocaleDateString('ar-LY')}</p>
             <p style="white-space: pre-line; line-height: 1.6;">${c.body}</p>
             <div style="margin-top: 15px; font-size: 11px; color: #666;">يتطلب توقيع: ${c.requireAcknowledgement ? `نعم (الموعد: ${c.acknowledgeDeadline})` : 'لا'}</div>
          </div>
        `).join('')}
      </div>
    `;

    printWin.document.write(`<html><head><title>Circulars Archive</title></head><body onload="window.print(); window.close();">${reportHTML}</body></html>`);
    printWin.document.close();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    const newCircular: Circular = {
      id: `CIRC-${Date.now()}`,
      title,
      body,
      source,
      createdAt: new Date().toISOString(),
      type: 'تعميم سيادي',
      requireAcknowledgement: requireAck,
      acknowledgeDeadline: requireAck ? deadline : undefined,
      violationRule: requireAck ? { enabled: true, penaltyScore: 5 } : undefined
    };

    onUpdateState(prev => {
      const allStaff = (Object.values(prev.staff) as string[][]).flat() as string[];
      const newReminders: Reminder[] = [];
      
      if (requireAck && deadline) {
        const deadlineDate = new Date(deadline);
        [3, 1].forEach(days => {
          const reminderDate = new Date(deadlineDate);
          reminderDate.setDate(reminderDate.getDate() - days);
          const dateStr = reminderDate.toISOString().slice(0, 10);
          allStaff.forEach(emp => {
            newReminders.push({
              id: `REM-${newCircular.id}-${emp.replace(/\s+/g, '')}-${days}`,
              circularId: newCircular.id,
              employeeName: emp,
              scheduledAt: dateStr,
              status: 'مجدول'
            });
          });
        });
      }

      return {
        ...prev,
        circulars: [newCircular, ...(prev.circulars || [])],
        reminders: [...(prev.reminders || []), ...newReminders],
        governanceLog: [
          {
            id: `G-PUB-${Date.now()}`,
            timestamp: new Date().toLocaleString('ar-LY'),
            action: `نشر قرار إداري: ${title}`,
            reason: `مصدر: ${source} | يتطلب توقيع: ${requireAck ? 'نعم' : 'لا'}`,
            impact: requireAck ? `تفعيل رقابة الامتثال (الموعد: ${deadline})` : 'إحاطة عامة',
            deptId: DepartmentId.CIRCULARS
          },
          ...(prev.governanceLog || [])
        ]
      };
    });

    setTitle(''); setBody(''); setDeadline('');
    alert(`✅ تم النشر بنجاح.`);
  };

  const dispatchTodaysReminders = () => {
    if (todaysRemindersQueue.length === 0) return alert('لا توجد تذكيرات مجدولة لتاريخ اليوم.');
    onUpdateState(prev => {
      const updatedReminders = (prev.reminders || []).map(r => (r.status === 'مجدول' && r.scheduledAt <= today) ? { ...r, status: 'تم الإرسال' as const } : r);
      return { ...prev, reminders: updatedReminders };
    });
    alert(`🚀 تم إرسال ${todaysRemindersQueue.length} تذكير.`);
  };

  const handleAuditCompliance = () => {
    alert('✅ تم التحقق من الامتثال لجميع السجلات.');
  };

  const acknowledge = (circularId: string, empName: string) => {
    if (!empName) return;
    onUpdateState(prev => {
      // إلغاء التذكيرات المستقبلية المجدولة لهذا الموظف بخصوص هذا التعميم
      const updatedReminders = (prev.reminders || []).map(r => 
        (r.circularId === circularId && r.employeeName === empName && r.status === 'مجدول') 
        ? { ...r, status: 'تم الإلغاء (وقع)' as any } 
        : r
      );

      return {
        ...prev,
        acknowledgements: [...prev.acknowledgements, { circularId, employeeName: empName, acknowledgedAt: new Date().toISOString() }],
        reminders: updatedReminders
      };
    });
    alert(`✅ تم توثيق توقيع: ${empName} - تم إيقاف التذكيرات المجدولة لهذا الموظف.`);
  };

  const sendReminderCircular = (original: Circular) => {
    const reminderTitle = `تذكير هام: ${original.title}`;
    const reminderBody = `إشارة إلى التعميم الصادر بتاريخ ${new Date(original.createdAt).toLocaleDateString('ar-LY')}، يرجى من كافة الكوادر غير الموقعة سرعة الاطلاع والالتزام بالضوابط الواردة أدناه:\n\n${original.body}`;
    
    const newCircular: Circular = {
      id: `CIRC-REM-${Date.now()}`,
      title: reminderTitle,
      body: reminderBody,
      source: original.source,
      createdAt: new Date().toISOString(),
      type: 'تذكير إداري',
      requireAcknowledgement: false // التذكير نفسه لا يتطلب توقيعاً مستقلاً عادةً
    };

    onUpdateState(prev => ({
      ...prev,
      circulars: [newCircular, ...(prev.circulars || [])],
      governanceLog: [
        {
          id: `G-REM-${Date.now()}`,
          timestamp: new Date().toLocaleString('ar-LY'),
          action: `إرسال تذكير رسمي لتعميم: ${original.title}`,
          reason: `تأخر في الامتثال / متابعة دورية`,
          impact: 'تعزيز وعي الكادر بالقرارات السيادية',
          deptId: DepartmentId.CIRCULARS
        },
        ...(prev.governanceLog || [])
      ]
    }));
    alert('🚀 تم إرسال تعميم تذكيري جديد للمنظومة.');
  };

  const pendingAcks = useMemo(() => {
    const list: any[] = [];
    const allStaff = (Object.values(state.staff) as string[][]).flat() as string[];
    state.circulars.filter(c => c.requireAcknowledgement).forEach(c => {
      allStaff.forEach(emp => {
        const ack = state.acknowledgements.find(a => a.circularId === c.id && a.employeeName === emp);
        if (!ack) {
          list.push({ circular: c, employee: emp, deadline: c.acknowledgeDeadline || '', isOverdue: new Date(c.acknowledgeDeadline || '') < new Date() });
        }
      });
    });
    return list;
  }, [state.circulars, state.acknowledgements, state.staff]);

  return (
    <div className="space-y-10 pb-32 text-right animate-fade-in">
      <div className="flex justify-between items-center no-print">
         <div>
            <h2 className="text-3xl font-black dark:text-white flex items-center gap-3">
               <span className="w-2.5 h-10 bg-brand-accent rounded-full"></span>
               مركز السياسات والتعميمات
            </h2>
         </div>
         <div className="flex gap-4">
            <button onClick={handlePrintCirculars} className="bg-brand-accent text-brand-primary px-8 py-3 rounded-xl font-black text-xs shadow-lg">🖨️ طباعة السجل</button>
            <div className="bg-gray-100 dark:bg-white/5 p-1.5 rounded-2xl flex gap-2 border dark:border-white/10 shadow-inner">
               <button onClick={() => setActiveTab('list')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'list' ? 'bg-brand-primary text-brand-accent shadow-xl border border-brand-accent/20' : 'text-gray-400'}`}>📜 التعميمات</button>
               <button onClick={() => setActiveTab('reminders')} className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'reminders' ? 'bg-brand-primary text-brand-accent shadow-xl border border-brand-accent/20' : 'text-gray-400'}`}>🔔 الرقابة ({pendingAcks.length})</button>
            </div>
         </div>
      </div>

      <div className="bg-brand-primary p-12 rounded-[4rem] text-white border border-brand-accent/30 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="flex-1">
            <h3 className="text-4xl font-black mb-2 italic text-brand-accent leading-tight">نظام المتابعة الإدارية</h3>
            <p className="opacity-60 text-lg leading-relaxed max-w-2xl font-medium">أداة مركزية لنشر القرارات وتتبع توقيعات الاستلام إلكترونياً لضمان الامتثال.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={dispatchTodaysReminders} className="bg-brand-accent text-brand-primary px-10 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">📤 تذكيرات اليوم ({todaysRemindersQueue.length})</button>
             <button onClick={handleAuditCompliance} className="bg-white/5 border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all">🔍 تدقيق فوري</button>
          </div>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3.5rem] shadow-2xl border border-brand-accent/10 sticky top-10">
              <h3 className="text-2xl font-black mb-10 dark:text-white border-r-8 border-brand-accent pr-4">تحرير قرار جديد</h3>
              <form onSubmit={handleCreate} className="space-y-6">
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl font-bold dark:text-white outline-none" placeholder="عنوان التعميم" required />
                <select value={source} onChange={e => setSource(e.target.value as any)} className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl font-black dark:text-white outline-none">
                   <option value="الادارة العليا">الادارة العليا 🏛️</option>
                   <option value="ادارة العمليات">ادارة العمليات ⚙️</option>
                   <option value="الموارد البشرية">الموارد البشرية 👥</option>
                </select>
                <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full p-6 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-[2rem] font-bold h-48 dark:text-white outline-none resize-none" placeholder="محتوى القرار..." required />
                <div className="p-6 bg-brand-accent/5 rounded-3xl border border-brand-accent/20">
                   <div className="flex items-center gap-4 mb-4">
                      <input type="checkbox" checked={requireAck} onChange={e => setRequireAck(e.target.checked)} id="ack-toggle" className="w-5 h-5 accent-brand-accent" />
                      <label htmlFor="ack-toggle" className="text-sm font-black dark:text-brand-accent">يتطلب توقيع استلام</label>
                   </div>
                   {requireAck && (
                     <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-red-500/20 rounded-2xl font-black dark:text-white outline-none text-center" required />
                   )}
                </div>
                <button type="submit" className="w-full py-6 bg-brand-primary text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-brand-accent hover:text-brand-primary transition-all">📜 تعميم القرار</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-10">
            {state.circulars.map(c => {
              const acks = state.acknowledgements.filter(a => a.circularId === c.id);
              const progress = Math.round((acks.length / 10) * 100); // Mocking total staff as 10 for progress
              const isReminder = c.type === 'تذكير إداري';
              
              return (
                <div key={c.id} className={`bg-white dark:bg-brand-secondary p-10 rounded-[4rem] border shadow-xl transition-all relative overflow-hidden ${isReminder ? 'border-amber-500/30 ring-4 ring-amber-500/5' : 'border-gray-100 dark:border-white/5'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner">{isReminder ? '🔔' : '📄'}</div>
                       <div>
                          <div className="flex gap-2">
                            <span className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-accent/10 text-brand-accent">{c.source}</span>
                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isReminder ? 'bg-amber-500 text-white' : 'bg-brand-primary text-white'}`}>{c.type}</span>
                          </div>
                          <h5 className="text-3xl font-black dark:text-white mt-3 italic tracking-tight">{c.title}</h5>
                       </div>
                    </div>
                    {!isReminder && c.requireAcknowledgement && (
                      <button onClick={() => sendReminderCircular(c)} className="p-3 bg-amber-500/10 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all text-xs font-black">
                        إرسال تذكير رسمي 🔔
                      </button>
                    )}
                  </div>
                  <div className="p-8 bg-gray-50/50 dark:bg-white/5 rounded-[2.5rem] mb-10 border dark:border-white/5">
                     <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-medium">{c.body}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t dark:border-white/5 pt-10">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">نسبة الامتثال بالتوقيع</p>
                        <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden p-1">
                           <div className="h-full bg-brand-accent rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${progress}%` }}></div>
                        </div>
                     </div>
                     <div className="flex flex-col gap-4">
                        <select className="w-full p-4 bg-gray-100 dark:bg-slate-700 text-xs font-black rounded-2xl outline-none dark:text-white border-2 border-transparent focus:border-brand-accent" onChange={(e) => { acknowledge(c.id, e.target.value); e.target.value = ""; }}>
                          <option value="">توقيع استلام الموظف...</option>
                          {state.staff[DepartmentId.OPERATIONS]?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-secondary p-1 rounded-[4rem] border dark:border-white/5 shadow-3xl overflow-hidden animate-fade-in">
           <table className="w-full text-right">
              <thead className="bg-gray-100 dark:bg-white/5">
                <tr className="text-gray-400 text-[10px] font-black uppercase">
                  <th className="p-8">الموظف المعني</th>
                  <th className="p-8">عنوان التعميم</th>
                  <th className="p-8 text-center">الموعد النهائي</th>
                  <th className="p-8 text-center">الإجراء المتاح</th>
                </tr>
              </thead>
              <tbody>
                {pendingAcks.map((item, idx) => (
                  <tr key={idx} className="border-b dark:border-white/5 hover:bg-gray-50 dark:hover:bg-brand-primary/10">
                    <td className="p-8"><p className="font-black dark:text-white text-lg">{item.employee}</p></td>
                    <td className="p-8"><p className="font-bold dark:text-white">{item.circular.title}</p></td>
                    <td className="p-8 text-center">
                       <span className={`px-5 py-2 rounded-full text-[10px] font-black ${item.isOverdue ? 'bg-red-500 text-white' : 'bg-brand-accent/20 text-brand-accent'}`}>{item.deadline}</span>
                    </td>
                    <td className="p-8 text-center">
                       <button onClick={() => alert(`⚡ تم إرسال نكز للموظف ${item.employee}`)} className="px-6 py-3 bg-brand-primary text-brand-accent rounded-xl text-[11px] font-black hover:scale-110 active:scale-95 transition-all shadow-xl border border-brand-accent/30 flex items-center gap-2 mx-auto"><span>⚡</span> نكز فوري</button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default CircularsPage;
