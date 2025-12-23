
import React, { useMemo } from 'react';
import { AppState, DepartmentId } from '../types';
import { DEPARTMENTS, COLORS } from '../constants';

const NewsTicker: React.FC<{ state: AppState }> = ({ state }) => {
  const month = state.currentMonth;

  const tickerItems = useMemo(() => {
    const items: string[] = [];
    
    // 1. Filter Operational Departments for dynamic monitoring
    const operationalDepts = DEPARTMENTS.filter(d => 
      ![
        DepartmentId.EXECUTIVE, 
        DepartmentId.REPORTS, 
        DepartmentId.SETTINGS, 
        DepartmentId.GOVERNANCE, 
        DepartmentId.COMPLAINTS, 
        DepartmentId.LEADS, 
        DepartmentId.CIRCULARS, 
        DepartmentId.BONUS
      ].includes(d.id as DepartmentId)
    );

    // 2. Aggregate and sort rankings for the current operational cycle
    const rankings = operationalDepts.map(d => {
      const data = state.departmentData[d.id]?.[month];
      return {
        id: d.id,
        name: d.name,
        score: data?.score || 0,
        hasData: !!data
      };
    }).filter(r => r.hasData).sort((a, b) => b.score - a.score);

    // 3. Dynamic Alerts Configuration
    const CRITICAL_ALERT_LEVEL = 75; // Below this is a warning
    const ELITE_LEVEL = 92;         // Above this is excellence

    // Priority Sector Monitoring: Quality, Production, Maintenance
    const prioritySectors = [
      { id: DepartmentId.QUALITY, label: "💎 رادار الجودة إيليت", alertMsg: "تنبيه: انخفاض في معايير الفحص" },
      { id: DepartmentId.PRODUCTION, label: "🏭 مراقبة الإنتاج", alertMsg: "تحذير: تباطؤ في وتيرة التنفيذ" },
      { id: DepartmentId.MAINTENANCE, label: "🛠️ استدامة الأصول", alertMsg: "تنبيه: تراجع في الجاهزية الفنية" }
    ];

    prioritySectors.forEach(sector => {
      const dept = rankings.find(r => r.id === sector.id);
      if (dept && dept.score < CRITICAL_ALERT_LEVEL) {
        items.push(`${sector.label}: ${sector.alertMsg} (${dept.score}%)`);
      } else if (dept && dept.score >= ELITE_LEVEL) {
        items.push(`${sector.label}: أداء استثنائي يتجاوز المستهدف (${dept.score}%) ✨`);
      }
    });

    // Top 3 Performing Departments
    if (rankings.length >= 3) {
      const top3 = rankings.slice(0, 3).map((r, i) => `${i + 1}. ${r.name} (${r.score}%)`);
      items.push(`🏆 كفاءة الصدارة (أعلى 3): ${top3.join(' | ')}`);
    } else if (rankings.length > 0) {
      items.push(`🏆 وحدة الصدارة الحالية: ${rankings[0].name} بنسبة ${rankings[0].score}%`);
    }

    // Bottom 1 Performing Department (if data exists and it's under review)
    if (rankings.length > 1) {
      const bottom = rankings[rankings.length - 1];
      if (bottom.score < 80) {
        items.push(`📉 رصد الرقابة: وحدة ${bottom.name} تسجل أدنى معدل تشغيلي (${bottom.score}%)`);
      }
    }

    // Complaints/Governance Friction
    const activeProvenComplaints = (state.complaints || []).filter(c => c.month === month && c.status === 'مثبتة');
    if (activeProvenComplaints.length > 0) {
      items.push(`⚖️ سجل الحوكمة: تم رصد ${activeProvenComplaints.length} مخالفات سلوكية مثبتة هذا الشهر`);
    }

    // Market Pulse (Leads)
    const monthLeads = (state.leads || []).filter(l => l.month === month);
    const convertedLeads = monthLeads.filter(l => l.status === 'تم البيع').length;
    if (monthLeads.length > 0) {
      const conversionRate = Math.round((convertedLeads / monthLeads.length) * 100);
      items.push(`🎯 نبض السوق: معدل تحويل العملاء ${conversionRate}% (إتمام ${convertedLeads} عملية بيع)`);
    }

    // Default message if the ticker is empty
    return items.length > 0 
      ? items.join(' • ') 
      : `نظام ثاسس إيليت (دورة ${month}): جاري تحليل المؤشرات... استقرار كامل في كافة العمليات ✅`;
  }, [state, month]);

  return (
    <>
      <div className="ticker-container no-print select-none border-t border-brand-accent/20">
        <div className="ticker-content flex items-center">
          <span className="mx-12 py-1 text-lg font-black whitespace-nowrap">
            {tickerItems} • {tickerItems}
          </span>
        </div>
      </div>
      <div className="fixed-signature-bar no-print flex items-center justify-center bg-black/90 backdrop-blur-md">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          Designed for <span className="text-brand-accent">Thassos Company</span> by <span className="text-white">Moataz Othman 2026</span>
        </span>
      </div>
    </>
  );
};

export default NewsTicker;
