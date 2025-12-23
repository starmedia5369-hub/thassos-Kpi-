
export enum DepartmentId {
  EXECUTIVE = 'executive',
  OPERATIONS = 'operations',
  SALES = 'sales',
  PRODUCTION = 'production',
  QUALITY = 'quality',
  WAREHOUSE = 'warehouse',
  MAINTENANCE = 'maintenance',
  PROCUREMENT = 'procurement',
  HR = 'hr',
  COMPLAINTS = 'complaints',
  GOVERNANCE = 'governance',
  LEADS = 'leads',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  BONUS = 'bonus',
  CIRCULARS = 'circulars'
}

export type KPIStatus = 'ممتاز' | 'جيد' | 'تنبيه' | 'حرج';

export interface KPIData {
  score: number;
  status: KPIStatus;
  values: Record<string, number>;
}

export type ComplaintStatus = 'مفتوحة' | 'تحت التحقيق' | 'مثبتة' | 'مرفوضة';

export interface ComplaintHistoryEntry {
  id: string;
  timestamp: string;
  fromStatus: ComplaintStatus | 'إنشاء';
  toStatus: ComplaintStatus;
  changedBy: string;
  note: string;
}

export interface Complaint {
  id: string;
  date: string;
  month: string;
  type: 'عميل' | 'داخلي';
  departmentId: DepartmentId;
  employee: string;
  description: string;
  status: ComplaintStatus;
  leadInvestigator?: string;
  assignedInvestigator?: string;
  history?: ComplaintHistoryEntry[];
}

export type LeadSource = string;
export type LeadStatus = 'جديد' | 'زيارة تمت' | 'عرض سعر' | 'تم البيع' | 'مفقود';

export interface Lead {
  id: string;
  date: string;
  month: string;
  customer: string;
  phone: string;
  source: LeadSource;
  interest: string;
  assignedRep: string;
  socialResponder?: string;
  status: LeadStatus;
  workOrderNumber?: string;
}

export interface GovernanceLog {
  id: string;
  timestamp: string;
  action: string;
  reason?: string;
  impact?: string;
  deptId?: DepartmentId;
  employee?: string;
}

export interface MaintenanceIncident {
  id: string;
  month: string;
  assetId: string;
  type: 'breakdown' | 'preventive';
  description: string;
  downtimeHours: number;
}

export type TicketStatus = 'قيد الانتظار' | 'جاري العمل' | 'تم الإصلاح';
export type TicketPriority = 'عاجل' | 'متوسط' | 'عادي';

export interface MaintenanceTicket {
  id: string;
  assetId: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  month: string;
  createdAt: string;
}

export interface OrgRole {
  id: string;
  nameArabic: string;
  managerRoleId: string | null;
}

export interface OrgAssignment {
  roleId: string;
  employeeName: string;
  deptId: DepartmentId;
  active: boolean;
}

export interface ReportDef {
  id: string;
  name: string;
  minCountPerMonth: number;
}

export interface ReportBonusPolicy {
  amountLYD: number;
  eligibleRoleIds: string[];
  requiredReports: ReportDef[];
}

export interface BonusEvaluation {
  id: string;
  month: string;
  role: string;
  employeeName: string;
  consistencyScore: number;
  qualityScore: number;
  recommendationScore: number;
  transparencyScore: number;
  totalAmount: number;
  notes: string;
  isApproved: boolean;
}

export interface ReportSubmission {
  id: string;
  month: string;
  roleId: string;
  reportDefId: string;
  status: 'معلق' | 'معتمد' | 'مرفوض';
  submittedAt: string;
}

export interface BonusPayout {
  id: string;
  month: string;
  roleId: string;
  employeeName: string;
  amount: number;
  status: 'مستحق' | 'غير مستحق' | 'تم الصرف';
  reason?: string;
}

export interface Circular {
  id: string;
  title: string;
  body: string;
  source: 'الادارة العليا' | 'ادارة المبيعات' | 'الادارة الماليه' | 'ادارة العمليات' | 'الموارد البشرية';
  createdAt: string;
  type: string;
  requireAcknowledgement: boolean;
  acknowledgeDeadline?: string;
  violationRule?: {
    enabled: boolean;
    penaltyScore: number;
  };
}

export interface Acknowledgement {
  circularId: string;
  employeeName: string;
  acknowledgedAt: string;
}

export interface Reminder {
  id: string;
  circularId: string;
  employeeName: string;
  scheduledAt: string;
  status: 'مجدول' | 'تم الإرسال';
}

export interface EmployeeAttendanceMonthly {
  month: string;
  employeeName: string;
  workingDays: number;
  presentDays: number;
  lateCount: number;
  earlyExitCount: number;
  unpaidAbsenceDays: number;
}

export interface HRIndicatorInput {
  month: string;
  employeeName: string;
  deptId: DepartmentId;
  attendanceScore: number;
  disciplineScore: number;
  leaveComplianceScore: number;
}

export interface AppState {
  currentMonth: string;
  lockedMonths: string[];
  departmentData: Record<string, Record<string, KPIData>>;
  employeeKPIs: Record<string, Record<string, Record<string, KPIData>>>;
  complaints: Complaint[];
  leads: Lead[];
  governanceLog: GovernanceLog[];
  managers: Record<string, string>;
  staff: Record<string, string[]>;
  executiveNames: { chairman: string; gm: string; };
  attendanceRecords: EmployeeAttendanceMonthly[];
  hrIndicatorInputs: HRIndicatorInput[];
  maintenanceIncidents: MaintenanceIncident[];
  maintenanceTickets: MaintenanceTicket[];
  circulars: Circular[];
  acknowledgements: Acknowledgement[];
  reminders: Reminder[];
  bonusEvaluations: BonusEvaluation[];
  orgRoles: OrgRole[];
  orgAssignments: OrgAssignment[];
  reportBonusPolicy: ReportBonusPolicy;
  reportSubmissions: ReportSubmission[];
  bonusPayouts: BonusPayout[];
}
