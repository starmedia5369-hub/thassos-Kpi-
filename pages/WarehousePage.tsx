
import React from 'react';
import { DepartmentId, KPIData, AppState } from '../types';
import { WAREHOUSE_KPI_FIELDS } from '../constants';
import KPIPageTemplate from './KPIPageTemplate';

interface WarehousePageProps {
  state: AppState;
  onSave: (month: string, data: KPIData) => void;
}

const WarehousePage: React.FC<WarehousePageProps> = ({ state, onSave }) => {
  const fields = WAREHOUSE_KPI_FIELDS;

  /**
   * خوارزمية حساب أداء المخازن - Locked Model v1.4
   * 1. دقة الجرد (30%)
   * 2. أخطاء التسليم (25%) - عكسي (كل خطأ يخصم 10% من رصيد المؤشر)
   * 3. زمن التجهيز (20%) - نسبة الكفاءة ضد التارجت
   * 4. نسبة الخامات الراكدة (15%) - عكسي (كل 1% ركود يخصم 1% من الرصيد)
   * 5. الالتزام بالنظام (10%)
   */
  const calculateScore = (vals: Record<string, number>) => {
    // 1. Stock Accuracy (30%)
    const sAccuracy = Math.min(100, vals.stockAccuracy || 0) * 0.30;
    
    // 2. Delivery Errors (25%) - Reverse Scale
    const errorsCount = vals.deliveryErrors || 0;
    const sErrors = Math.max(0, 100 - (errorsCount * 10)) * 0.25;
    
    // 3. Prep Time (20%)
    const sTime = Math.min(100, vals.orderPrepTime || 0) * 0.20;
    
    // 4. Slow Moving (15%) - Reverse Scale
    const slowRatio = vals.slowMovingRatio || 0;
    const sSlow = Math.max(0, 100 - slowRatio) * 0.15;
    
    // 5. System Compliance (10%)
    const sCompliance = Math.min(100, vals.systemCompliance || 0) * 0.10;

    const total = Math.round(sAccuracy + sErrors + sTime + sSlow + sCompliance);
    return Math.max(0, Math.min(100, total));
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white border border-brand-accent/20 mb-8">
        <h3 className="text-2xl font-black mb-2 text-brand-accent">نموذج تدقيق المستودعات والمخازن</h3>
        <p className="text-sm opacity-60">"Warehouse KPIs use fixed weights as defined above. All KPIs are calculated monthly using Phenix data only. No weights or logic were modified."</p>
      </div>

      <KPIPageTemplate
        deptId={DepartmentId.WAREHOUSE}
        state={state}
        fields={fields}
        onSave={onSave}
        title="مؤشرات إدارة المخزون والدعم اللوجستي"
        calculateScore={calculateScore}
      />
    </div>
  );
};

export default WarehousePage;
