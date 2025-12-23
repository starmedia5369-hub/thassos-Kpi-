
import React, { useState, useMemo } from 'react';
import { AppState, BonusPayout, ReportSubmission, DepartmentId } from '../types';

interface ReportsBonusPageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const ReportsBonusPage: React.FC<ReportsBonusPageProps> = ({ state, onUpdateState }) => {
  const month = state.currentMonth;
  const policy = state.reportBonusPolicy;

  const eligibleAssignments = useMemo(() => {
    return state.orgAssignments.filter(a => policy.eligibleRoleIds.includes(a.roleId));
  }, [state.orgAssignments, policy.eligibleRoleIds]);

  const stats = useMemo(() => {
    return eligibleAssignments.map(a => {
      const roleSubmissions = state.reportSubmissions.filter(s => s.roleId === a.roleId && s.month === month && s.status === 'معتمد');
      
      const requirements = policy.requiredReports.map(def => {
        const approvedCount = roleSubmissions.filter(s => s.reportDefId === def.id).length;
        return {
          ...def,
          approvedCount,
          isMet: approvedCount >= def.minCountPerMonth
        };
      });

      const allMet = requirements.every(r => r.isMet);
      const payout = state.bonusPayouts.find(p => p.month === month && p.roleId === a.roleId);

      return {
        roleId: a.roleId,
        roleName: state.orgRoles.find(r => r.id === a.roleId)?.nameArabic || a.roleId,
        employeeName: a.employeeName,
        requirements,
        allMet,
        payoutStatus: payout?.status || (allMet ? 'مستحق' : 'غير مستحق')
      };
    });
  }, [eligibleAssignments, state.reportSubmissions, state.bonusPayouts, month, policy]);

  const confirmPayout = (roleId: string, employeeName: string) => {
    onUpdateState(prev => {
      const existing = prev.bonusPayouts.find(p => p.month === month && p.roleId === roleId);
      const newPayout: BonusPayout = {
        id: existing?.id || Date.now().toString(),
        month,
        roleId,
        employeeName,
        amount: policy.amountLYD,
        status: 'تم الصرف',
        reason: 'استيفاء كافة التقارير المطلوبة'
      };
      
      const log = {
        id: Date.now().toString() + '-bonus',
        timestamp: new Date().toLocaleString('ar-LY'),
        action: `صرف مكافأة التقارير: ${employeeName}`,
        reason: `الدور: ${roleId} - المبلغ: ${policy.amountLYD}`,
        impact: 'خصم من ميزانية المكافآت',
        deptId: DepartmentId.HR
      };

      return {
        ...prev,
        bonusPayouts: [...prev.bonusPayouts.filter(p => !(p.month === month && p.roleId === roleId)), newPayout],
        governanceLog: [log, ...(prev.governanceLog || [])]
      };
    });
  };

  return (
    <div className="space-y-8 pb-20 text-right">
      <div className="bg-gradient-to-br from-brand-primary to-slate-900 p-10 rounded-[3rem] text-white shadow-2xl border border-brand-accent/20">
        <h3 className="text-3xl font-black text-brand-accent mb-2">برنامج مكافأة التقارير (250 د.ل)</h3>
        <p className="opacity-60 text-sm">نظام تتبع الاستحقاق المالي بناءً على دقة واستمرارية التقارير المعتمدة.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {stats.map(s => (
          <div key={s.roleId} className="bg-white dark:bg-brand-secondary p-8 rounded-[2.5rem] border dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                 <span className={`w-3 h-3 rounded-full ${s.allMet ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                 <h4 className="text-xl font-black dark:text-white">{s.roleName} : {s.employeeName}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {s.requirements.map(req => (
                  <div key={req.id} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border dark:border-white/10">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{req.name}</p>
                    <div className="flex justify-between items-center">
                       <span className="font-black dark:text-white">{req.approvedCount} / {req.minCountPerMonth}</span>
                       <span className={req.isMet ? 'text-green-500' : 'text-red-500'}>{req.isMet ? '✓' : '✕'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-64 flex flex-col justify-center items-center border-r dark:border-white/10 pr-6">
               <div className={`text-center mb-4 p-4 rounded-2xl w-full ${s.payoutStatus === 'تم الصرف' ? 'bg-green-500/20 text-green-500' : s.allMet ? 'bg-brand-accent/20 text-brand-accent' : 'bg-gray-100 text-gray-400'}`}>
                  <p className="text-[10px] font-black uppercase mb-1">حالة الاستحقاق</p>
                  <p className="text-xl font-black">{s.payoutStatus}</p>
               </div>
               {s.allMet && s.payoutStatus !== 'تم الصرف' && (
                 <button 
                  onClick={() => confirmPayout(s.roleId, s.employeeName)}
                  className="w-full py-3 bg-brand-primary text-white rounded-xl font-black shadow-lg hover:scale-105 transition-all"
                 >
                   تأكيد صرف الـ 250
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsBonusPage;
