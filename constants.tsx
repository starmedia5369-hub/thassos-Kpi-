
import { DepartmentId, LeadSource, LeadStatus, OrgRole, ReportBonusPolicy } from './types';

// Role definitions for the organizational structure
export const DEFAULT_ROLES: OrgRole[] = [
  { id: 'chairman', nameArabic: 'رئيس مجلس الإدارة', managerRoleId: null },
  { id: 'gm', nameArabic: 'المدير العام', managerRoleId: 'chairman' },
  { id: 'ops_mgr', nameArabic: 'مدير العمليات', managerRoleId: 'gm' },
  { id: 'sales_mgr', nameArabic: 'مدير المبيعات', managerRoleId: 'gm' },
  { id: 'hr_mgr', nameArabic: 'مدير الموارد البشرية', managerRoleId: 'gm' },
  { id: 'proc_mgr', nameArabic: 'مدير المشتريات', managerRoleId: 'gm' },
  { id: 'wh_mgr', nameArabic: 'مشرف عام المخازن', managerRoleId: 'gm' },
  { id: 'quality_mgr', nameArabic: 'مسؤول الجودة', managerRoleId: 'gm' },
  { id: 'maint_sup', nameArabic: 'مشرف الصيانة', managerRoleId: 'ops_mgr' },
  { id: 'maint_tech', nameArabic: 'فني صيانة', managerRoleId: 'maint_sup' },
  { id: 'sales_rep', nameArabic: 'مندوب مبيعات', managerRoleId: 'sales_mgr' }
];

// Default policy for report bonuses
export const BONUS_POLICY_DEFAULT: ReportBonusPolicy = {
  amountLYD: 250,
  eligibleRoleIds: ['wh_mgr', 'ops_mgr', 'sales_mgr', 'hr_mgr', 'proc_mgr', 'quality_mgr', 'maint_sup'],
  requiredReports: [
    { id: 'rep1', name: 'التقرير التشغيلي الأسبوعي', minCountPerMonth: 4 },
    { id: 'rep2', name: 'تقرير جرد المخزون', minCountPerMonth: 1 }
  ]
};

// KPI fields for the warehouse department
export const WAREHOUSE_KPI_FIELDS = [
  { key: 'stockAccuracy', label: 'دقة الجرد (30%)', type: 'percentage', weight: 0.30 },
  { key: 'deliveryErrors', label: 'أخطاء التسليم (25%)', type: 'count', invert: true, weight: 0.25 },
  { key: 'orderPrepTime', label: 'زمن تجهيز الطلب (20%)', type: 'percentage', weight: 0.20 },
  { key: 'slowMovingRatio', label: 'نسبة الراكد (15%)', type: 'percentage', invert: true, weight: 0.15 },
  { key: 'systemCompliance', label: 'الالتزام بالنظام (10%)', type: 'percentage', weight: 0.10 }
];

// KPI fields for the procurement department
export const PROCUREMENT_KPI_FIELDS = [
  { key: 'poCompliance', label: 'الالتزام بطلبات الشراء (30%)', type: 'percentage', weight: 0.30 },
  { key: 'supplyTimeline', label: 'مواعيد التوريد (25%)', type: 'percentage', weight: 0.25 },
  { key: 'priceVariance', label: 'فرق السعر (20%)', type: 'percentage', invert: true, weight: 0.20 },
  { key: 'emergencyPurchases', label: 'الشراء العاجل (15%)', type: 'count', invert: true, weight: 0.15 },
  { key: 'invoiceMatching', label: 'مطابقة الفواتير (10%)', type: 'percentage', weight: 0.10 }
];

export const ASSETS = [
  { id: "m1", name: "ماكينة قص 1 (الرئيسية)" },
  { id: "m2", name: "ماكينة قص 2" },
  { id: "m3", name: "ماكينة قص 3" },
  { id: "m4", name: "ماكينة قص 4" },
  { id: "m5", name: "ماكينة قص 5" },
  { id: "gen", name: "مولد كهرباء 1" },
  { id: "comp", name: "كمبرسور هواء" },
  { id: "t1", name: "خزان وقود 1" },
  { id: "t2", name: "خزان وقود 2" }
];

export const LEAD_SOURCES: LeadSource[] = ['سوشيال ميديا', 'معرض', 'توصية', 'أخرى'];
export const LEAD_STATUSES: LeadStatus[] = ['جديد', 'زيارة تمت', 'عرض سعر', 'تم البيع', 'مفقود'];

export const FINAL_STAFF = {
  EXECUTIVE: [
    { name: 'ميسره يحي', role: 'رئيس مجلس الإدارة', deptId: DepartmentId.EXECUTIVE },
    { name: 'حسن عويدان', role: 'المدير العام', deptId: DepartmentId.EXECUTIVE }
  ],
  MANAGEMENT: [
    { name: 'معتز حلمي عثمان', role: 'مدير العمليات', deptId: DepartmentId.OPERATIONS },
    { name: 'عبدالرحمن تركي', role: 'مدير المبيعات', deptId: DepartmentId.SALES },
    { name: 'محمد ذكي', role: 'مدير الموارد البشرية', deptId: DepartmentId.HR },
    { name: 'علي عويدان', role: 'مدير المشتريات', deptId: DepartmentId.PROCUREMENT },
    { name: 'محمد زهران', role: 'مشرف عام المخازن + مدير إنتاج مكلف', deptId: DepartmentId.WAREHOUSE },
    { name: 'عبدالرحمن علي', role: 'مسؤول الجودة والتسليمات', deptId: DepartmentId.QUALITY }
  ],
  MAINTENANCE: [
    { name: 'عبدالسلام محمد', role: 'مشرف الصيانة', deptId: DepartmentId.MAINTENANCE },
    { name: 'حسين الجديد', role: 'فني صيانة', deptId: DepartmentId.MAINTENANCE }
  ],
  SALES_REPS: [
    { name: 'محمد صالح', role: 'مندوب مبيعات', deptId: DepartmentId.SALES },
    { name: 'محمد المسلاتي', role: 'مندوب مبيعات', deptId: DepartmentId.SALES },
    { name: 'محمد عمران', role: 'مندوب مبيعات', deptId: DepartmentId.SALES },
    { name: 'حسن سعد', role: 'مندوب مبيعات', deptId: DepartmentId.SALES },
    { name: 'ناذير الشعاب', role: 'مندوب مبيعات', deptId: DepartmentId.SALES }
  ]
};

export const ALL_STAFF_LIST = [
  ...FINAL_STAFF.EXECUTIVE,
  ...FINAL_STAFF.MANAGEMENT,
  ...FINAL_STAFF.MAINTENANCE,
  ...FINAL_STAFF.SALES_REPS
];

export const SALES_REPS = FINAL_STAFF.SALES_REPS.map(s => s.name);

export const DEPARTMENTS = [
  { id: DepartmentId.EXECUTIVE, name: 'الإدارة العليا' },
  { id: DepartmentId.OPERATIONS, name: 'العمليات' },
  { id: DepartmentId.SALES, name: 'المبيعات' },
  { id: DepartmentId.PRODUCTION, name: 'الإنتاج' },
  { id: DepartmentId.QUALITY, name: 'الجودة' },
  { id: DepartmentId.WAREHOUSE, name: 'المخازن' },
  { id: DepartmentId.MAINTENANCE, name: 'الصيانة' },
  { id: DepartmentId.PROCUREMENT, name: 'المشتريات' },
  { id: DepartmentId.HR, name: 'الموارد البشرية' },
  { id: DepartmentId.COMPLAINTS, name: 'الشكاوي والتحقيق' },
  { id: DepartmentId.LEADS, name: 'Sales Leads' },
  { id: DepartmentId.GOVERNANCE, name: 'سجل الحوكمة' },
  { id: DepartmentId.REPORTS, name: 'التقارير' },
  { id: DepartmentId.SETTINGS, name: 'الإعدادات' }
];

export const MAINTENANCE_KPI_CONFIG = {
  // LEVEL 1: Result Only / Read-Only (System Technical Metrics)
  DEPARTMENT: [
    { key: 'availability', label: 'نسبة جاهزية الماكينات (35%)', type: 'percentage', weight: 0.35 },
    { key: 'unplannedDowntime', label: 'ساعات التوقف غير المخطط (25%)', type: 'count', invert: true, weight: 0.25 },
    { key: 'preventiveCompliance', label: 'تنفيذ الصيانة الوقائية (25%)', type: 'percentage', weight: 0.25 },
    { key: 'repeatFailures', label: 'عدد الأعطال المتكررة (15%)', type: 'count', invert: true, weight: 0.15 }
  ],
  // LEVEL 2: Supervisor Human KPI Input
  SUPERVISOR: [
    { key: 'planAdherence', label: 'الالتزام بخطة الصيانة الوقائية (30%)', type: 'percentage', weight: 0.30 },
    { key: 'workOrganization', label: 'تنظيم العمل وتوزيع المهام (25%)', type: 'percentage', weight: 0.25 },
    { key: 'reportQuality', label: 'جودة المتابعة والتقارير (20%)', type: 'percentage', weight: 0.20 },
    { key: 'criticalResponse', label: 'سرعة التعامل مع الأعطال الحرجة (15%)', type: 'percentage', weight: 0.15 },
    { key: 'policySafety', label: 'الالتزام بسياسات التشغيل والسلامة (10%)', type: 'percentage', weight: 0.10 }
  ],
  // LEVEL 3: Technician Human KPI Input
  TECHNICIAN: [
    { key: 'taskExecution', label: 'الالتزام بتنفيذ أوامر الصيانة (35%)', type: 'percentage', weight: 0.35 },
    { key: 'executionQuality', label: 'جودة التنفيذ والالتزام بالتعليمات (25%)', type: 'percentage', weight: 0.25 },
    { key: 'timeAdherence', label: 'الالتزام بزمن الإصلاح المتفق عليه (20%)', type: 'percentage', weight: 0.20 },
    { key: 'safetyProcedures', label: 'الالتزام بإجراءات السلامة (10%)', type: 'percentage', weight: 0.10 },
    { key: 'ticketAccuracy', label: 'دقة تسجيل تذاكر الصيانة (10%)', type: 'percentage', weight: 0.10 }
  ]
};

export const DEPT_KPI_CONFIG: Record<string, any[]> = {
  [DepartmentId.OPERATIONS]: [
    { key: 'workflowAdherence', label: 'خط سير العمل (8%)', icon: '🛣️' },
    { key: 'onTimeOrders', label: 'أوامر العمل في موعدها (7%)', icon: '⏱️' },
    { key: 'replanningReduction', label: 'تقليل إعادة التخطيط (5%)', icon: '📉' },
    { key: 'taskSpeed', label: 'سرعة تنفيذ مهام الإدارة (5%)', icon: '⚡' },
    { key: 'deptCoordination', label: 'التنسيق ومنع التعارض (5%)', icon: '🔄' }
  ],
  [DepartmentId.PRODUCTION]: [
    { key: 'executedWorkOrders', label: 'أوامر العمل المنفذة (25%)', type: 'percentage', weight: '25%' },
    { key: 'deadlineAdherence', label: 'الالتزام بمواعيد التنفيذ (25%)', type: 'percentage', weight: '25%' },
    { key: 'reworkCount', label: 'إعادة الشغل (20%)', type: 'percentage', invert: true, weight: '20%' },
    { key: 'wasteRate', label: 'نسبة الهالك (15%)', type: 'percentage', invert: true, weight: '15%' },
    { key: 'priorityAdherence', label: 'أولوية الأوامر (15%)', type: 'percentage', weight: '15%' }
  ],
  [DepartmentId.SALES]: [
    { key: 'salesValue', label: 'المبيعات (30%)', type: 'percentage', weight: '30%' },
    { key: 'collectionRate', label: 'التحصيل (20%)', type: 'percentage', weight: '20%' },
    { key: 'conversionRate', label: 'التحويل لأوامر عمل (20%)', type: 'percentage', weight: '20%' },
    { key: 'workOrders', label: 'الأوامر المسجلة (15%)', type: 'percentage', weight: '15%' },
    { key: 'policyCompliance', label: 'الالتزام بالسياسات (10%)', type: 'percentage', weight: '10%' },
    { key: 'leadsConverted', label: 'Leads → Sales (5%)', type: 'percentage', weight: '5%' }
  ],
  [DepartmentId.QUALITY]: [
    { key: 'firstPassRate', label: 'الاعتماد من أول مرة (30%)', type: 'percentage', weight: '30%' },
    { key: 'confirmedComplaints', label: 'الشكاوى المثبتة (25%)', type: 'count', invert: true, weight: '25%' },
    { key: 'postDeliveryErrors', label: 'أخطاء ما بعد التسليم (20%)', type: 'count', invert: true, weight: '20%' },
    { key: 'inspectionTiming', label: 'زمن الفحص والجودة (15%)', type: 'percentage', weight: '15%' },
    { key: 'specAccuracy', label: 'مطابقة المواصفات (10%)', type: 'percentage', weight: '10%' }
  ],
  [DepartmentId.WAREHOUSE]: WAREHOUSE_KPI_FIELDS,
  [DepartmentId.PROCUREMENT]: PROCUREMENT_KPI_FIELDS,
  [DepartmentId.MAINTENANCE]: MAINTENANCE_KPI_CONFIG.DEPARTMENT,
  [DepartmentId.HR]: [
    { key: 'attendanceRate', label: 'نسبة الحضور والإنصراف (20%)', type: 'percentage' },
    { key: 'employeeSatisfaction', label: 'رضا الموظفين (20%)', type: 'percentage' },
    { key: 'fileCompliance', label: 'اكتمال ملفات الموظفين (15%)', type: 'percentage' },
    { key: 'trainingExecution', label: 'تنفيذ خطة التدريب (15%)', type: 'percentage' },
    { key: 'voluntaryTurnover', label: 'معدل الدوران (15%)', type: 'percentage', invert: true },
    { key: 'averageTenure', label: 'مدة الخدمة (15%)', type: 'number' }
  ]
};

export const COLORS = {
  primary: '#0F172A',
  secondary: '#1E293B',
  accent: '#C9A24D',
  gold: '#E2B859',
  excellent: '#10B981',
  good: '#3B82F6',
  warning: '#F59E0B',
  critical: '#EF4444'
};
