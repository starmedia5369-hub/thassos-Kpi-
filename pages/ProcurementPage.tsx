
import React from 'react';
import { DepartmentId, KPIData, AppState } from '../types';
import { PROCUREMENT_KPI_FIELDS } from '../constants';
import KPIPageTemplate from './KPIPageTemplate';

interface ProcurementPageProps {
  state: AppState;
  onSave: (month: string, data: KPIData) => void;
}

const ProcurementPage: React.FC<ProcurementPageProps> = ({ state, onSave }) => {
  const fields = PROCUREMENT_KPI_FIELDS;

  /**
   * خوارزمية حساب أداء المشتريات - Locked Model v1.4
   * 1. الالتزام بطلبات الشراء المعتمدة (30%)
   * 2. الالتزام بمواعيد التوريد (25%)
   * 3. فرق السعر عن متوسط الموردين (20%) - عكسي (كل 1% زيادة في السعر تخصم 1% من الوزن)
   * 4. عدد حالات الشراء العاجل (15%) - عكسي (كل حالة تخصم 10% من الوزن)
   * 5. مطابقة الفواتير لطلبات الشراء (10%)
   */
  const calculateScore = (vals: Record<string, number>) => {
    // 1. PO Compliance (30%)
    const sPO = Math.min(100, vals.poCompliance || 0) * 0.30;
    
    // 2. Supply Timeline (25%)
    const sTimeline = Math.min(100, vals.supplyTimeline || 0) * 0.25;
    
    // 3. Price Variance (20%) - Reverse Scale
    const varianceRatio = vals.priceVariance || 0;
    const sPrice = Math.max(0, 100 - (varianceRatio > 100 ? varianceRatio - 100 : 0)) * 0.20;
    
    // 4. Emergency Purchases (15%) - Reverse Scale
    const emergencyCount = vals.emergencyPurchases || 0;
    const sEmergency = Math.max(0, 100 - (emergencyCount * 10)) * 0.15;
    
    // 5. Invoice Matching (10%)
    const sInvoice = Math.min(100, vals.invoiceMatching || 0) * 0.10;

    const total = Math.round(sPO + sTimeline + sPrice + sEmergency + sInvoice);
    return Math.max(0, Math.min(100, total));
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white border border-brand-accent/20 mb-8">
        <h3 className="text-2xl font-black mb-2 text-brand-accent">نموذج تدقيق المشتريات والتموين</h3>
        <p className="text-sm opacity-60 italic">"Procurement KPIs use fixed weights as defined above. All KPIs are calculated monthly using Phenix data only. No weights or logic were modified."</p>
      </div>

      <KPIPageTemplate
        deptId={DepartmentId.PROCUREMENT}
        state={state}
        fields={fields}
        onSave={onSave}
        title="مؤشرات إدارة المشتريات وسلسلة الإمداد"
        calculateScore={calculateScore}
      />
    </div>
  );
};

export default ProcurementPage;
