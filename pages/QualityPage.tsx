
import React from 'react';
import { DepartmentId, KPIData, AppState } from '../types';
import { DEPT_KPI_CONFIG } from '../constants';
import KPIPageTemplate from './KPIPageTemplate';

interface QualityPageProps {
  state: AppState;
  onSave: (month: string, data: KPIData) => void;
}

const QualityPage: React.FC<QualityPageProps> = ({ state, onSave }) => {
  const fields = DEPT_KPI_CONFIG[DepartmentId.QUALITY];

  /**
   * خوارزمية حساب الجودة - ثاسس Locked Model
   * 1) اعتماد الشغل من أول مرة (30%)
   * 2) الشكاوى المثبتة (25%) - عكسي (كل شكوى تخصم 20% من وزن المؤشر)
   * 3) أخطاء ما بعد التسليم (20%) - عكسي (كل خطأ يخصم 25% من وزن المؤشر)
   * 4) التزام زمن الفحص (15%)
   * 5) دقة المواصفات (10%)
   */
  const calculateScore = (vals: Record<string, number>) => {
    // 1. اعتماد الشغل
    const sFirstPass = Math.min(100, vals.firstPassRate || 0) * 0.30;
    
    // 2. الشكاوى المثبتة (عكسي) - إذا كان المدخل عدد شكاوى
    const complaintsCount = vals.confirmedComplaints || 0;
    const sComplaints = Math.max(0, 100 - (complaintsCount * 20)) * 0.25;
    
    // 3. أخطاء ما بعد التسليم (عكسي)
    const errorsCount = vals.postDeliveryErrors || 0;
    const sErrors = Math.max(0, 100 - (errorsCount * 25)) * 0.20;
    
    // 4. التزام الزمن
    const sTiming = Math.min(100, vals.inspectionTiming || 0) * 0.15;
    
    // 5. دقة المواصفات
    const sAccuracy = Math.min(100, vals.specAccuracy || 0) * 0.10;

    const total = Math.round(sFirstPass + sComplaints + sErrors + sTiming + sAccuracy);
    return Math.max(0, Math.min(100, total));
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white border border-brand-accent/20 mb-8">
        <h3 className="text-2xl font-black mb-2 text-brand-accent">نموذج تدقيق الجودة والتسليمات</h3>
        <p className="text-sm opacity-60">"Quality KPIs use fixed weights as defined above. Only confirmed complaints affect the score. All KPIs are calculated monthly using approved data only. No weights or logic were modified."</p>
      </div>

      <KPIPageTemplate
        deptId={DepartmentId.QUALITY}
        state={state}
        fields={fields}
        onSave={onSave}
        title="مؤشرات الجودة والرقابة الفنية"
        calculateScore={calculateScore}
      />
    </div>
  );
};

export default QualityPage;
