
import React, { useState } from 'react';
import { AppState, DepartmentId, OrgRole, OrgAssignment } from '../types';
import { DEPARTMENTS, DEFAULT_ROLES } from '../constants';

interface SettingsPageProps {
  state: AppState;
  setMonth: (m: string) => void;
  toggleLock: (m: string) => void;
  onUpdateState: (newState: AppState) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ state, setMonth, toggleLock, onUpdateState }) => {
  const [selectedDeptForStaff, setSelectedDeptForStaff] = useState<DepartmentId>(DepartmentId.OPERATIONS);
  const [newEmployeeName, setNewEmployeeName] = useState('');

  const exportData = () => {
    const dataStr = JSON.stringify(state);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `thassos_system_data_${new Date().toISOString()}.json`);
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        onUpdateState(data);
        alert('✅ تم استيراد البيانات بنجاح');
      } catch (err) {
        alert('❌ حدث خطأ أثناء استيراد البيانات');
      }
    };
    reader.readAsText(file);
  };

  const addEmployee = () => {
    if (!newEmployeeName.trim()) return;
    onUpdateState({
      ...state,
      staff: {
        ...state.staff,
        [selectedDeptForStaff]: [...(state.staff[selectedDeptForStaff] || []), newEmployeeName.trim()]
      }
    });
    setNewEmployeeName('');
  };

  const removeEmployee = (deptId: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الموظف (${name}) من قسم (${DEPARTMENTS.find(d => d.id === deptId)?.name})؟`)) return;
    onUpdateState({
      ...state,
      staff: {
        ...state.staff,
        [deptId]: (state.staff[deptId] || []).filter(n => n !== name)
      }
    });
  };

  const updateOrgAssignment = (roleId: string, employeeName: string) => {
    onUpdateState({
      ...state,
      orgAssignments: [
        ...state.orgAssignments.filter(a => a.roleId !== roleId),
        { roleId, employeeName, deptId: state.orgAssignments.find(a => a.roleId === roleId)?.deptId || DepartmentId.EXECUTIVE, active: true }
      ]
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-fade-in text-right">
      <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5">
        <h3 className="text-3xl font-black mb-10 text-brand-primary dark:text-white border-r-8 border-brand-accent pr-6 italic">إعدادات النظام والتحكم السيادي</h3>

        <div className="space-y-16">
          {/* Section: Month Control */}
          <section>
            <h4 className="font-black text-brand-accent text-xs uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
               <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
               التحكم بالدورة الزمنية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gray-50 dark:bg-brand-deep rounded-3xl border dark:border-white/5 shadow-inner">
                <label className="block text-xs font-black mb-4 text-gray-500 uppercase">الدورة الحالية للمنظومة</label>
                <input 
                  type="month" 
                  value={state.currentMonth} 
                  onChange={e => setMonth(e.target.value)}
                  className="w-full p-5 bg-white dark:bg-slate-800 rounded-2xl font-black text-brand-primary dark:text-white border-2 border-transparent focus:border-brand-accent outline-none text-2xl"
                />
              </div>
              <div className="p-8 bg-gray-50 dark:bg-brand-deep rounded-3xl border dark:border-white/5 flex flex-col justify-between">
                <div>
                  <p className="font-black mb-1 dark:text-white text-lg">حماية البيانات (Lock Mode)</p>
                  <p className="text-xs opacity-50 dark:text-gray-400">قفل الدورة يمنع أي تعديلات في الـ KPIs أو سجلات المبيعات.</p>
                </div>
                <button 
                  onClick={() => toggleLock(state.currentMonth)}
                  className={`mt-6 py-5 rounded-2xl font-black text-white shadow-2xl transition-all ${
                    state.lockedMonths.includes(state.currentMonth) ? 'bg-red-500 hover:bg-red-600 scale-95' : 'bg-brand-accent text-brand-primary hover:bg-brand-gold'
                  }`}
                >
                  {state.lockedMonths.includes(state.currentMonth) ? '🔓 فتح التعديل للدورة الحالية' : '🔒 تفعيل قفل الحماية الآن'}
                </button>
              </div>
            </div>
          </section>

          {/* Section: Staff Management (NEW) */}
          <section className="pt-10 border-t dark:border-white/5">
             <h4 className="font-black text-brand-accent text-xs uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
               <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
               مركز إدارة الكوادر البشرية
            </h4>
            <div className="bg-gray-50 dark:bg-brand-deep p-8 rounded-[3rem] border dark:border-white/5">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase mb-4 pr-2">اختيار القسم للإدارة</label>
                     <select 
                      value={selectedDeptForStaff} 
                      onChange={e => setSelectedDeptForStaff(e.target.value as DepartmentId)}
                      className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl font-black dark:text-white outline-none border-2 border-transparent focus:border-brand-accent mb-6"
                     >
                        {DEPARTMENTS.filter(d => !['executive', 'reports', 'settings', 'governance', 'complaints', 'leads', 'circulars', 'bonus'].includes(d.id)).map(d => (
                           <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                     </select>
                     
                     <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={newEmployeeName}
                          onChange={e => setNewEmployeeName(e.target.value)}
                          placeholder="اسم الموظف الجديد..."
                          className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-2xl font-bold dark:text-white outline-none border-2 border-transparent focus:border-brand-accent"
                        />
                        <button onClick={addEmployee} className="px-8 bg-brand-primary text-brand-accent rounded-2xl font-black shadow-lg hover:bg-brand-accent hover:text-brand-primary transition-all">إضافة +</button>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border dark:border-white/5 max-h-[300px] overflow-y-auto">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-4 border-b pb-2">قائمة الموظفين في {DEPARTMENTS.find(d => d.id === selectedDeptForStaff)?.name}</p>
                     <div className="space-y-2">
                        {(state.staff[selectedDeptForStaff] || []).map(name => (
                           <div key={name} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl group">
                              <span className="font-bold dark:text-white text-sm">{name}</span>
                              <button 
                                onClick={() => removeEmployee(selectedDeptForStaff, name)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all p-2 bg-red-500/10 rounded-lg"
                              >
                                🗑️
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Section: Organization Hierarchy */}
          <section className="pt-10 border-t dark:border-white/5">
            <h4 className="font-black text-brand-accent text-xs uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
               <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
               المناصب والتبعية الإدارية
            </h4>
            <div className="overflow-x-auto bg-gray-50 dark:bg-brand-deep p-6 rounded-[2.5rem] border dark:border-white/5">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="text-gray-400 font-black text-[10px] uppercase">
                      <th className="p-4">المنصب الإداري</th>
                      <th className="p-4">الموظف المعين حالياً</th>
                      <th className="p-4 text-center">المدير المباشر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.orgRoles.map(role => {
                      const assignment = state.orgAssignments.find(a => a.roleId === role.id);
                      const managerRole = state.orgRoles.find(r => r.id === role.managerRoleId);
                      return (
                        <tr key={role.id} className="border-b dark:border-white/5 hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 font-black dark:text-white">{role.nameArabic}</td>
                          <td className="p-4">
                            <input 
                              type="text"
                              value={assignment?.employeeName || ''}
                              onChange={(e) => updateOrgAssignment(role.id, e.target.value)}
                              placeholder="أدخل الاسم..."
                              className="w-full p-2 bg-transparent outline-none dark:text-brand-accent font-bold border-b border-transparent focus:border-brand-accent"
                            />
                          </td>
                          <td className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {managerRole?.nameArabic || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
          </section>

          {/* Section: Backup */}
          <section className="pt-10 border-t dark:border-white/5">
            <h4 className="font-black text-brand-accent text-xs uppercase mb-8 tracking-[0.3em] flex items-center gap-3">
               <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
               قاعدة البيانات والسيادة الرقمية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={exportData} className="p-12 border-4 border-dashed border-brand-primary dark:border-white/10 rounded-[3rem] text-brand-primary dark:text-white font-black hover:bg-brand-primary hover:text-white transition-all flex flex-col items-center gap-4 group">
                <span className="text-5xl group-hover:scale-125 transition-transform">📥</span>
                تصدير نسخة احتياطية كاملة (.json)
              </button>
              <label className="p-12 border-4 border-dashed border-brand-accent rounded-[3rem] text-brand-accent font-black hover:bg-brand-accent hover:text-brand-primary transition-all flex flex-col items-center gap-4 cursor-pointer text-center group">
                <span className="text-5xl group-hover:scale-125 transition-transform">📤</span>
                استعادة بيانات النظام من ملف
                <input type="file" className="hidden" onChange={handleImport} />
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
