import React, { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, Briefcase, CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react';

// 구글 앱스 스크립트 배포 후 받은 웹 앱 URL을 여기에 넣으세요.
const API_URL = "https://script.google.com/macros/s/AKfycbytucGRbKU4rU_TzC9wCcF3YkUEYrpUp2Uh-dBB-SVonv4lQF7zmQuiB1erHl_EvYIU7w/exec";

const getTodayKST = () => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().split('T')[0];
};

const formatDateString = (dateStr) => {
  if (!dateStr) return '';
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
};

const App = () => {
  const [mode, setMode] = useState('view'); // 'view' or 'admin'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    noticeDate: getTodayKST(),
    workNotice: '',
    safetyNotice: '',
    prinToday: 'O',
    vpToday: 'O',
    prinNext: 'O',
    vpNext: 'O'
  });

  const attendanceOptions = [
    { label: 'O (정상)', value: 'O' },
    { label: 'X (부재)', value: 'X' },
    { label: '△ (오전출장)', value: '△(오전출장)' },
    { label: '△ (오후출장)', value: '△(오후출장)' },
    { label: '△ (연가)', value: '△(연가)' },
  ];

  useEffect(() => {
    fetchLatest();
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') setMode('admin');
  }, []);

  const fetchLatest = async (targetDate = null) => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const url = targetDate 
        ? `${API_URL}?action=read&date=${targetDate}`
        : `${API_URL}?action=read`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.data) {
        setData(json.data);
        if (targetDate && mode === 'admin') {
          setFormData({
            noticeDate: formatDateString(json.data.안내날짜),
            workNotice: json.data.업무안내,
            safetyNotice: json.data.안전교육,
            prinToday: json.data.교장_오늘,
            vpToday: json.data.교감_오늘,
            prinNext: json.data.교장_다음,
            vpNext: json.data.교감_다음
          });
        }
      } else {
        setData(null);
        if (targetDate && mode === 'admin') {
          setFormData(prev => ({
            ...prev,
            noticeDate: targetDate,
            workNotice: '',
            safetyNotice: '',
            prinToday: 'O',
            vpToday: 'O',
            prinNext: 'O',
            vpNext: 'O'
          }));
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, noticeDate: date }));
    fetchLatest(date);
  };

  const handleSave = async () => {
    if (!API_URL) return alert("API URL을 설정해주세요.");
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert("공지사항이 등록되었습니다.");
      setMode('view');
      fetchLatest();
    } catch (err) {
      alert("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === 'O') return <CheckCircle2 className="text-green-500 w-4 h-4" />;
    if (status === 'X') return <XCircle className="text-red-500 w-4 h-4" />;
    return <AlertCircle className="text-orange-500 w-4 h-4" />;
  };

  if (mode === 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-slate-50 min-h-screen animate-in fade-in duration-500">
        <header className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-200 sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">안내 등록</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Admin Dashboard</span>
            </div>
          </div>
          <button
            onClick={() => setMode('view')}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-all flex items-center gap-2 active:scale-95 border border-slate-100"
          >
            <XCircle size={18} /> 나가기
          </button>
        </header>

        <div className="space-y-4 bg-white p-6 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" /> 안내 날짜
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full p-4 border-0 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-slate-700 shadow-inner"
                value={formData.noticeDate}
                onChange={e => handleDateChange(e.target.value)}
              />
              <button 
                onClick={() => handleDateChange(getTodayKST())}
                className="px-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors"
              >
                오늘
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
              <Briefcase size={12} className="text-blue-500" /> 업무 안내
            </label>
            <textarea
              className="w-full p-4 border-0 bg-slate-50 rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-[15px] leading-relaxed shadow-inner"
              value={formData.workNotice}
              onChange={e => setFormData({ ...formData, workNotice: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-orange-500" /> 안전 교육
            </label>
            <textarea
              className="w-full p-4 border-0 bg-slate-50 rounded-2xl h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-[15px] leading-relaxed shadow-inner"
              value={formData.safetyNotice}
              onChange={e => setFormData({ ...formData, safetyNotice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-3 bg-blue-50/50 p-4 rounded-[28px] border border-blue-100/50">
              <h3 className="font-black text-[10px] text-blue-600 text-center uppercase tracking-widest">오늘 복무</h3>
              <div className="space-y-2">
                <select className="w-full p-2 bg-white rounded-xl text-xs font-bold text-slate-700 border border-white" value={formData.prinToday} onChange={e => setFormData({ ...formData, prinToday: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>교장: {opt.label}</option>)}
                </select>
                <select className="w-full p-2 bg-white rounded-xl text-xs font-bold text-slate-700 border border-white" value={formData.vpToday} onChange={e => setFormData({ ...formData, vpToday: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>교감: {opt.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3 bg-emerald-50/50 p-4 rounded-[28px] border border-emerald-100/50">
              <h3 className="font-black text-[10px] text-emerald-600 text-center uppercase tracking-widest">다음 날</h3>
              <div className="space-y-2">
                <select className="w-full p-2 bg-white rounded-xl text-xs font-bold text-slate-700 border border-white" value={formData.prinNext} onChange={e => setFormData({ ...formData, prinNext: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>교장: {opt.label}</option>)}
                </select>
                <select className="w-full p-2 bg-white rounded-xl text-xs font-bold text-slate-700 border border-white" value={formData.vpNext} onChange={e => setFormData({ ...formData, vpNext: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>교감: {opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black mt-4 flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={18} /> 저장하기</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 bg-slate-50 min-h-screen flex items-center justify-center font-sans lg:p-10">
      <div className="bg-white max-w-2xl w-full rounded-[32px] sm:rounded-[48px] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 relative transition-all duration-700">
        
        <div className="p-5 sm:p-8 relative">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-5 bg-white/50 backdrop-blur-sm relative z-20">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="font-bold text-sm tracking-tight text-slate-500 animate-pulse">불러오는 중...</p>
            </div>
          )}

          {!loading && data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-[28px] border border-slate-100 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 font-black text-blue-600">
                      <input 
                        type="date" 
                        className="bg-transparent border-0 p-0 text-lg font-black text-blue-600 outline-none focus:ring-0 w-[130px] shrink-0"
                        onChange={(e) => fetchLatest(e.target.value)}
                        value={formatDateString(data.안내날짜)}
                      />
                      <span className="text-slate-400 opacity-50 font-normal hidden xs:inline">소식</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => fetchLatest(getTodayKST())}
                      className="bg-slate-800 text-white px-3 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-slate-900 transition-all active:scale-95"
                    >
                      TODAY
                    </button>
                    <button
                      onClick={() => setMode('admin')}
                      className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-300 hover:text-blue-600 transition-all active:scale-90 shadow-sm"
                      title="관리자 설정"
                    >
                      <ShieldAlert size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/30 p-3 rounded-[24px] border border-blue-100/30 flex flex-col items-center gap-2">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-70">Today</span>
                    <div className="flex gap-3 w-full justify-center">
                      <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-white">
                        <span className="text-[9px] font-bold text-slate-400">교장</span>
                        <StatusIcon status={data.교장_오늘} />
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-white">
                        <span className="text-[9px] font-bold text-slate-400">교감</span>
                        <StatusIcon status={data.교감_오늘} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/30 p-3 rounded-[24px] border border-emerald-100/30 flex flex-col items-center gap-2">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-70">Next Day</span>
                    <div className="flex gap-3 w-full justify-center">
                      <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-white">
                        <span className="text-[9px] font-bold text-slate-400">교장</span>
                        <StatusIcon status={data.교장_다음} />
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-white">
                        <span className="text-[9px] font-bold text-slate-400">교감</span>
                        <StatusIcon status={data.교감_다음} />
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              <div className="space-y-4">
                <section className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-5 rounded-[28px] border border-blue-100/30">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-blue-600 mb-2.5 uppercase tracking-widest">
                    <Briefcase size={14} /> 업무안내
                  </h3>
                  <div className="text-[15px] sm:text-[16px] text-slate-700 font-medium whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {data.업무안내 || '등록된 업무 안내가 없습니다.'}
                  </div>
                </section>

                <section className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-5 rounded-[28px] border border-orange-100/30">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-orange-600 mb-2.5 uppercase tracking-widest">
                    <ShieldAlert size={14} /> 안전교육
                  </h3>
                  <div className="text-[15px] sm:text-[16px] text-slate-700 font-medium whitespace-pre-wrap leading-relaxed min-h-[60px]">
                    {data.안전교육 || '등록된 안전 교육 내용이 없습니다.'}
                  </div>
                </section>
              </div>
            </div>
          )}

          {!loading && !data && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="bg-slate-50 p-6 rounded-full border border-slate-100 shadow-inner">
                <AlertCircle size={48} className="text-slate-200" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-lg text-slate-800 tracking-tight">공지사항이 없습니다.</p>
                <p className="text-xs font-medium text-slate-400">선택하신 날짜({formData.noticeDate})의 내용을 찾을 수 없어요.</p>
              </div>
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <div className="w-full flex gap-2 justify-center">
                  <input 
                    type="date" 
                    className="p-3 bg-slate-50 border-0 rounded-2xl shadow-inner text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    onChange={(e) => fetchLatest(e.target.value)}
                    value={formData.noticeDate}
                  />
                  <button 
                    onClick={() => fetchLatest(getTodayKST())}
                    className="px-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] tracking-widest shadow-lg shadow-blue-100"
                  >
                    오늘
                  </button>
                </div>
                <button
                  onClick={() => setMode('admin')}
                  className="w-full py-4 text-blue-600 font-black text-sm hover:underline tracking-tight bg-blue-50 rounded-2xl border border-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} /> 환경 설정 (관리자)
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="p-5 border-t border-slate-50 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Haju elementary school</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
