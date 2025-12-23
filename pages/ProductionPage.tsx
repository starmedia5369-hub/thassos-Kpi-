
import React from 'react';
import { DepartmentId, KPIData, AppState } from '../types';
import { DEPT_KPI_CONFIG } from '../constants';
import KPIPageTemplate from './KPIPageTemplate';

interface ProductionPageProps {
  state: AppState;
  onSave: (month: string, data: KPIData) => void;
}

const ProductionPage: React.FC<ProductionPageProps> = ({ state, onSave }) => {
  const fields = DEPT_KPI_CONFIG[DepartmentId.PRODUCTION];

  /**
   * خوارزمية حساب الإنتاج - نموذج ثاسس المعتمد
   * 1. أوامر العمل المنفذة (25%)
   * 2. الالتزام بمواعيد التنفيذ (25%)
   * 3. إعادة الشغل Rework (20%) - مؤشر عكسي
   * 4. نسبة الهالك Waste (15%) - مؤشر عكسي
   * 5. أولوية الأوامر (15%)
   */
  const calculateScore = (vals: Record<string, number>) => {
    const wExecuted = Math.min(100, vals.executedWorkOrders || 0) * 0.25;
    const wDeadline = Math.min(100, vals.deadlineAdherence || 0) * 0.25;
    
    const wRework = Math.min(100, vals.reworkCount || 0) * 0.20;
    const wWaste = Math.min(100, vals.wasteRate || 0) * 0.15;
    const wPriority = Math.min(100, vals.priorityAdherence || 0) * 0.15;

    const total = Math.round(wExecuted + wDeadline + wRework + wWaste + wPriority);
    return Math.max(0, Math.min(100, total));
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white border border-brand-accent/20 mb-8">
        <h3 className="text-2xl font-black mb-2 text-brand-accent">نموذج تدقيق الإنتاج</h3>
        <p className="text-sm opacity-60">"Production KPIs use fixed weights as defined above. All KPIs are calculated monthly using system data only. No weights or logic were modified."</p>
      </div>
      
      <KPIPageTemplate
        deptId={DepartmentId.PRODUCTION}
        state={state}
        fields={fields}
        onSave={onSave}
        title="مؤشرات الإنتاج والعمليات الفنية"
        calculateScore={calculateScore}
      />
    </div>
  );
};

export default ProductionPage;
