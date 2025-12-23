
import React, { useState, useMemo } from 'react';
import { AppState, MaintenanceTicket, TicketPriority, TicketStatus } from '../types';
import { ASSETS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface MaintenanceTicketsPageProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

const MaintenanceTicketsPage: React.FC<MaintenanceTicketsPageProps> = ({ state, onUpdateState }) => {
  const [assetId, setAssetId] = useState(ASSETS[0].id);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('متوسط');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const month = state.currentMonth;
  const isLocked = state.lockedMonths.includes(month);
  
  const currentTickets = useMemo(() => 
    (state.maintenanceTickets || []).filter(t => t.month === month).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  , [state.maintenanceTickets, month]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTicket: MaintenanceTicket = {
      id: `TKT-${Date.now()}`,
      assetId,
      description,
      priority,
      status: 'قيد الانتظار',
      month,
      createdAt: new Date().toISOString()
    };

    onUpdateState(prev => ({
      ...prev,
      maintenanceTickets: [newTicket, ...(prev.maintenanceTickets || [])]
    }));

    setDescription('');
  };

  const updateStatus = (id: string, status: TicketStatus) => {
    onUpdateState(prev => ({
      ...prev,
      maintenanceTickets: (prev.maintenanceTickets || []).map(t => t.id === id ? { ...t, status } : t)
    }));
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptData = {
        month,
        tickets: currentTickets.map(t => ({
          asset: ASSETS.find(a => a.id === t.assetId)?.name,
          desc: t.description,
          priority: t.priority,
          status: t.status
        }))
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `أنت خبير صيانة وموثوقية أصول. حلل تذاكر الصيانة لشهر ${month} وقدم رؤية استباقية. البيانات: ${JSON.stringify(promptData)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              risks: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              reliabilityIndex: { type: Type.INTEGER, description: 'Score from 0 to 100' }
            },
            required: ['summary', 'risks', 'recommendations', 'reliabilityIndex']
          }
        }
      });
      setAiAnalysis(JSON.parse(response.text));
    } catch (e) {
      console.error(e);
      alert('فشل الاتصال بمحرك الذكاء الاصطناعي');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-32 animate-fade-in text-right">
      <div className="bg-brand-primary p-12 rounded-[4rem] text-white shadow-2xl border border-brand-accent/20 relative overflow-hidden group">
         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="flex-1">
               <h2 className="text-4xl font-black italic text-brand-accent mb-4">مركز إدارة تذاكر الصيانة والأعطال</h2>
               <p className="opacity-60 text-lg leading-relaxed max-w-2xl font-medium italic">النظام المركزي لتسجيل طلبات الإصلاح، تتبع الموثوقية، وتحليل الأداء الفني للأصول.</p>
            </div>
            <button 
              onClick={runAiAnalysis} 
              disabled={isAiLoading || currentTickets.length === 0}
              className="bg-brand-accent text-brand-primary px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-20"
            >
              {isAiLoading ? 'جاري التحليل...' : '🔮 تحليل AI للموثوقية'}
            </button>
         </div>
      </div>

      {aiAnalysis && (
        <div className="bg-white dark:bg-brand-secondary p-12 rounded-[4rem] border-2 border-brand-accent/20 shadow-3xl animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-4 flex flex-col justify-center items-center text-center p-8 bg-gray-50 dark:bg-white/5 rounded-[3rem]">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">مؤشر موثوقية الأصول</p>
              <div className="text-9xl font-black text-brand-accent">{aiAnalysis.reliabilityIndex}%</div>
              <p className="text-sm font-bold opacity-40 mt-4 italic">Reliability Index by Thassos AI</p>
           </div>
           <div className="lg:col-span-8 space-y-6">
              <div>
                 <h4 className="text-brand-accent font-black text-sm uppercase mb-2">الملخص التنفيذي</h4>
                 <p className="text-lg dark:text-white leading-relaxed">{aiAnalysis.summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-red-500 font-black text-[10px] uppercase mb-3 tracking-widest">تنبيه المخاطر</h4>
                    <ul className="space-y-2">
                       {aiAnalysis.risks.map((r: string, i: number) => <li key={i} className="text-sm dark:text-gray-400 flex items-start gap-2"><span>⚠️</span> {r}</li>)}
                    </ul>
                 </div>
                 <div>
                    <h4 className="text-green-500 font-black text-[10px] uppercase mb-3 tracking-widest">التوصيات الوقائية</h4>
                    <ul className="space-y-2">
                       {aiAnalysis.recommendations.map((r: string, i: number) => <li key={i} className="text-sm dark:text-gray-400 flex items-start gap-2"><span>✨</span> {r}</li>)}
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-brand-secondary p-10 rounded-[3.5rem] shadow-xl border dark:border-white/5 sticky top-10">
             <h3 className="text-2xl font-black mb-10 dark:text-white border-r-8 border-brand-accent pr-4">إيداع طلب صيانة</h3>
             <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 pr-2">اختيار الأصل / الماكينة</label>
                  <select 
                    value={assetId} onChange={e => setAssetId(e.target.value)}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl font-black dark:text-white outline-none border-2 border-transparent focus:border-brand-accent"
                  >
                    {ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 pr-2">أولوية التدخل</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['عادي', 'متوسط', 'عاجل'] as TicketPriority[]).map(p => (
                      <button key={p} type="button" onClick={() => setPriority(p)} className={`py-3 rounded-xl text-[10px] font-black transition-all ${priority === p ? 'bg-brand-primary text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 pr-2">وصف العطل / المهام</label>
                  <textarea 
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl font-bold dark:text-white outline-none border-2 border-transparent focus:border-brand-accent h-32 resize-none"
                    placeholder="اكتب تفاصيل العطل هنا..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLocked}
                  className="w-full py-6 bg-brand-primary text-white rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all disabled:opacity-20"
                >
                  🚀 إرسال طلب الصيانة
                </button>
             </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-brand-secondary p-10 rounded-[4rem] shadow-xl border dark:border-white/5 min-h-[600px]">
              <h3 className="text-2xl font-black dark:text-white mb-10">تتبع الطلبات ({currentTickets.length})</h3>
              <div className="space-y-6">
                {currentTickets.length === 0 ? (
                  <div className="py-20 text-center opacity-20 italic dark:text-white">لا توجد تذاكر مسجلة لهذه الدورة...</div>
                ) : (
                  currentTickets.map(t => (
                    <div key={t.id} className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-brand-accent/30 transition-all">
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                             <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               t.priority === 'عاجل' ? 'bg-red-500 text-white' : t.priority === 'متوسط' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                             }`}>{t.priority}</span>
                             <span className="text-[10px] font-bold text-gray-400">{ASSETS.find(a => a.id === t.assetId)?.name}</span>
                          </div>
                          <h4 className="text-xl font-black dark:text-white mb-2">{t.description}</h4>
                          <p className="text-[10px] font-bold text-gray-400">التاريخ: {new Date(t.createdAt).toLocaleDateString('ar-LY')} | ID: {t.id}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <select 
                            value={t.status} 
                            disabled={isLocked}
                            onChange={(e) => updateStatus(t.id, e.target.value as TicketStatus)}
                            className={`p-3 rounded-xl font-black text-xs outline-none border transition-all ${
                              t.status === 'تم الإصلاح' ? 'bg-green-500 text-white border-green-600' : 'bg-white dark:bg-slate-700 dark:text-white border-gray-200 dark:border-white/10'
                            }`}
                          >
                            <option value="قيد الانتظار">قيد الانتظار</option>
                            <option value="جاري العمل">جاري العمل</option>
                            <option value="تم الإصلاح">تم الإصلاح</option>
                          </select>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTicketsPage;
