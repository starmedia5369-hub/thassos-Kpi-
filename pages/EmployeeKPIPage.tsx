
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, DepartmentId, KPIData } from '../types';
import { DEPARTMENTS, DEPT_KPI_CONFIG, MAINTENANCE_KPI_CONFIG } from '../constants';

interface EmployeeKPIPageProps {
  state: AppState;
  onSaveEmployee: (deptId: DepartmentId, name: string, month: string, data: KPIData) => void;
}

const EmployeeKPIPage: React.FC<EmployeeKPIPageProps> = ({ state, onSaveEmployee }) => {
  const [selectedDept, setSelectedDept] = useState<DepartmentId | ''>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const month = state.currentMonth;
  const isLocked = state.lockedMonths.includes(month);

  // تصفية الأقسام القابلة للتقييم فقط
  const reportableDepts = useMemo(() => {
    return DEPARTMENTS.filter(d => 
      !['executive', 'reports', 'settings', 'governance', 'complaints', 'leads', 'circulars', 'bonus'].includes(d.id)
    );
  }, []);

  const staffList = selectedDept ? (state.staff[selectedDept] || []) : [];
  
  /**
   * وظيفة معالجة الأوزان: تحول "25%" أو 0.25 أو "0.25" إلى رقم عشري (0.25)
   */
  const parseWeight = (w: any): number => {
    if (w === null || w === undefined) return 0;
    if (typeof w === 'number') return w;
    if (typeof w === 'string') {
      const isPercent = w.includes('%');
      const clean = w.replace(/[^0-9.]/g, '');
      const val = parseFloat(clean);
      if (isNaN(val)) return 0;
      return isPercent ? val / 100 : (val > 1 ? val / 100 : val);
    }
    return 0;
  };

  const fields = useMemo(() => {
    if (!selectedDept || !selectedEmployee) return [];
    
    // حالات خاصة للنماذج المخصصة
    if (selectedDept === DepartmentId.MAINTENANCE) {
      if (selectedEmployee === 'عبدالسلام محمد') return MAINTENANCE_KPI_CONFIG.SUPERVISOR;
      if (selectedEmployee === 'حسين الجديد') return MAINTENANCE_KPI_CONFIG.TECHNICIAN;
    }

    if (selectedDept === DepartmentId.SALES && selectedEmployee === 'عبدالرحمن تركي') {
      return [
        { key: 'planAdherence', label: 'الالتزام بخطة المبيعات (30%)', weight: 0.3, type: 'percentage' },
        { key: 'collectionFollowup', label: 'متابعة التحصيل (25%)', weight: 0.25, type: 'percentage' },
        { key: 'reportingCompliance', label: 'دقة التقارير (20%)', weight: 0.2, type: 'percentage' },
        { key: 'teamDiscipline', label: 'انضباط الفريق (15%)', weight: 0.15, type: 'percentage' },
        { key: 'opsCoordination', label: 'التنسيق الإداري (10%)', weight: 0.1, type: 'percentage' }
      ];
    }

    if (selectedDept === DepartmentId.OPERATIONS) {
      return [
        { key: 'workflowAdherence', label: 'الالتزام بخط سير العمل (30%)', weight: 0.3, type: 'percentage' },
        { key: 'onTimeOrders', label: 'أوامر العمل في موعدها (25%)', weight: 0.25, type: 'percentage' },
        { key: 'replanningReduction', label: 'تقليل إعادة التخطيط (20%)', weight: 0.2, type: 'percentage' },
        { key: 'taskSpeed', label: 'سرعة تنفيذ مهام الإدارة (15%)', weight: 0.15, type: 'percentage' },
        { key: 'deptCoordination', label: 'التنسيق ومنع التعارض (10%)', weight: 0.1, type: 'percentage' }
      ];
    }

    return DEPT_KPI_CONFIG[selectedDept] || [];
  }, [selectedDept, selectedEmployee]);

  const currentCalculations = useMemo(() => {
    if (!selectedEmployee || !selectedDept || fields.length === 0) return null;
    
    const numericValues: Record<string, number> = {};
    fields.forEach(f => { 
        const raw = formValues[f.key];
        const val = parseFloat(raw);
        numericValues[f.key] = isNaN(val) ? 0 : val; 
    });
    
    let finalScore = 0;
    const hasWeights = fields.some(f => f.weight !== undefined);
    
    if (hasWeights) {
        const totalWeighted = fields.reduce((acc, f) => {
            const w = parseWeight(f.weight);
            const score = numericValues[f.key] || 0;
            return acc + (score * w);
        }, 0);
        finalScore = Math.round(totalWeighted);
    } else {
        const sum = fields.reduce((acc, f) => acc + (numericValues[f.key] || 0), 0);
        finalScore = Math.round(sum / fields.length);
    }
    
    return { 
        finalScore: isNaN(finalScore) ? 0 : Math.max(0, Math.min(100, finalScore)), 
        numericValues 
    };
  }, [formValues, fields, selectedEmployee, selectedDept]);

  useEffect(() => {
    const existing = state.employeeKPIs[selectedDept]?.[selectedEmployee]?.[month];
    if (existing) {
      const vals: Record<string, string> = {};
      Object.keys(existing.values).forEach(k => vals[k] = existing.values[k].toString());
      setFormValues(vals);
    } else {
      setFormValues({});
    }
  }, [selectedEmployee, month, selectedDept, state.employeeKPIs]);

  const handleSave = () => {
    if (!selectedDept || !selectedEmployee || !currentCalculations) {
        return alert('⚠️ لا توجد بيانات كافية للحفظ.');
    }
    
    const finalScoreValue = currentCalculations.finalScore;
    if (isNaN(finalScoreValue)) {
      return alert('⚠️ خطأ في الحساب: النتيجة غير صالحة.');
    }

    const kpiData: KPIData = { 
      score: finalScoreValue, 
      status: finalScoreValue >= 90 ? 'ممتاز' : finalScoreValue >= 75 ? 'جيد' : 'تنبيه', 
      values: currentCalculations.numericValues 
    };

    onSaveEmployee(selectedDept as DepartmentId, selectedEmployee, month, kpiData);
    alert(`✅ تم اعتماد كفاءة الأداء (${finalScoreValue}%) للموظف: ${selectedEmployee}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32 text-right animate-fade-in">
      <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-2xl border border-brand-accent/20 relative">
         <h3 className="text-3xl font-black mb-2 text-brand-accent italic">مركز التقييم والاعتماد إيليت</h3>
         <p className="opacity-60 text-sm font-bold uppercase tracking-widest">تحديث مؤشرات الأداء الفردية والتشغيلية لدورة: {month}</p>
      </div>

      <div className="bg-white dark:bg-brand-secondary p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 pr-2">1. اختيار وحدة العمل</label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {reportableDepts.map(d => (
            <button key={d.id} onClick={() => { setSelectedDept(d.id as DepartmentId); setSelectedEmployee(''); }} className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${selectedDept === d.id ? 'bg-brand-accent border-brand-accent text-brand-primary shadow-lg' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-500 hover:border-brand-accent/30'}`}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {selectedDept && (
        <div className="space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              {staffList.map(name => (
                <button key={name} onClick={() => setSelectedEmployee(name)} className={`p-6 rounded-[2rem] border text-right transition-all group ${selectedEmployee === name ? 'border-brand-accent bg-white dark:bg-brand-secondary shadow-xl ring-4 ring-brand-accent/10' : 'bg-white dark:bg-brand-secondary border-gray-100 dark:border-white/5 hover:bg-brand-accent/5'}`}>
                    <p className={`font-bold text-sm ${selectedEmployee === name ? 'text-brand-primary dark:text-brand-accent' : 'dark:text-white'}`}>{name}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-tighter">
                      {state.managers[selectedDept] === name ? '🏆 مسؤول الوحدة' : '⚙️ كادر تشغيلي'}
                    </p>
                </button>
              ))}
           </div>

           {selectedEmployee && (
             <div className="bg-white dark:bg-brand-secondary p-12 rounded-[4rem] shadow-2xl border-2 border-brand-accent/5 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-brand-accent/10 px-8 py-2 rounded-br-3xl text-[10px] font-black text-brand-accent uppercase tracking-widest">Master Audit Control</div>
                <h4 className="text-2xl font-black dark:text-white mb-10 border-r-4 border-brand-accent pr-6">تحديث بيانات: <span className="text-brand-accent">{selectedEmployee}</span></h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                   {fields.map(f => (
                     <div key={f.key} className="space-y-3">
                       <label className="block text-[11px] font-black text-gray-400 uppercase px-2">{f.label}</label>
                       <div className="relative">
                          <input 
                            type="number" step="0.01" disabled={isLocked} 
                            value={formValues[f.key] || ''} 
                            onChange={e => setFormValues({ ...formValues, [f.key]: e.target.value })} 
                            className="w-full p-5 bg-gray-50 dark:bg-slate-700/50 border-2 border-transparent focus:border-brand-accent rounded-2xl outline-none dark:text-white font-black text-2xl text-center shadow-inner transition-all" 
                            placeholder="0"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 font-black text-xs">{f.type === 'percentage' ? '%' : 'N'}</div>
                       </div>
                     </div>
                   ))}
                </div>

                {currentCalculations && (
                  <div className="bg-brand-primary p-12 rounded-[3rem] text-white text-center border-b-8 border-brand-accent relative shadow-inner">
                     <p className="text-[10px] font-black text-brand-accent uppercase tracking-[0.4em] mb-4">كفاءة الأداء المعتمدة</p>
                     <div className="text-9xl font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-2xl">
                        {currentCalculations.finalScore}<span className="text-3xl opacity-30 ml-2">%</span>
                     </div>
                  </div>
                )}

                <button 
                    onClick={handleSave} 
                    disabled={isLocked || isNaN(currentCalculations?.finalScore || 0)} 
                    className="w-full mt-10 py-8 bg-brand-primary text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-20 active:scale-95"
                >
                  {isLocked ? '🔒 الدورة مقفلة' : '💾 حفظ واعتماد النتيجة في المنظومة'}
                </button>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default EmployeeKPIPage;
