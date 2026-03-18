import React, { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, Briefcase, ChevronRight, CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react';

// 구글 앱스 스크립트 배포 후 받은 웹 앱 URL을 여기에 넣으세요.
const API_URL = "https://script.google.com/macros/s/AKfycbytucGRbKU4rU_TzC9wCcF3YkUEYrpUp2Uh-dBB-SVonv4lQF7zmQuiB1erHl_EvYIU7w/exec";

const getTodayKST = () => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().split('T')[0];
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
    // URL 파라미터에 admin이 있으면 관리자 모드
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
        // 관리자 모드에서 날짜 검색 시 폼 데이터 업데이트
        if (targetDate && mode === 'admin') {
          setFormData({
            noticeDate: json.data.안내날짜,
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
          // 해당 날짜 데이터가 없으면 '안내날짜'만 남기고 나머지 초기화
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
    if (status === 'O') return <CheckCircle2 className="text-green-500 w-5 h-5" />;
    if (status === 'X') return <XCircle className="text-red-500 w-5 h-5" />;
    return <AlertCircle className="text-orange-500 w-5 h-5" />;
  };

  if (mode === 'admin') {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-slate-50 min-h-screen animate-in fade-in duration-500">
        <header className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-200 sticky top-4 z-10 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">교무부 안내 등록</h1>
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

        <div className="space-y-4 bg-white p-7 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
                <Calendar size={12} className="text-blue-500" /> 안내 날짜 (기존 데이터 자동 로드)
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
                  className="px-4 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  오늘
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
              <Briefcase size={12} className="text-blue-500" /> 업무 안내
            </label>
            <textarea
              placeholder="전달하실 업무 내용을 입력하세요."
              className="w-full p-4 border-0 bg-slate-50 rounded-3xl h-36 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-[15px] leading-relaxed shadow-inner"
              value={formData.workNotice}
              onChange={e => setFormData({ ...formData, workNotice: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 ml-1 flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-orange-500" /> 안전 교육
            </label>
            <textarea
              placeholder="안전 교육 관련 내용을 입력하세요."
              className="w-full p-4 border-0 bg-slate-50 rounded-3xl h-28 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-[15px] leading-relaxed shadow-inner"
              value={formData.safetyNotice}
              onChange={e => setFormData({ ...formData, safetyNotice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-4 bg-blue-50/50 p-5 rounded-[32px] border border-blue-100/50 shadow-sm transition-all hover:bg-blue-50">
              <h3 className="font-black text-xs text-blue-600 flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> 오늘 복무
              </h3>
              <div className="space-y-3">
                <div className="bg-white/60 p-1 rounded-2xl border border-white flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 pl-3 pt-1 tracking-widest uppercase">Principal</span>
                  <select className="w-full p-2 bg-transparent text-sm outline-none font-bold text-slate-700" value={formData.prinToday} onChange={e => setFormData({ ...formData, prinToday: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="bg-white/60 p-1 rounded-2xl border border-white flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 pl-3 pt-1 tracking-widest uppercase">Vice Principal</span>
                  <select className="w-full p-2 bg-transparent text-sm outline-none font-bold text-slate-700" value={formData.vpToday} onChange={e => setFormData({ ...formData, vpToday: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-emerald-50/50 p-5 rounded-[32px] border border-emerald-100/50 shadow-sm transition-all hover:bg-emerald-50">
              <h3 className="font-black text-xs text-emerald-600 flex items-center justify-center gap-2">
                <Calendar size={14} /> 다음 날
              </h3>
              <div className="space-y-3">
                <div className="bg-white/60 p-1 rounded-2xl border border-white flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 pl-3 pt-1 tracking-widest uppercase">Principal</span>
                  <select className="w-full p-2 bg-transparent text-sm outline-none font-bold text-slate-700" value={formData.prinNext} onChange={e => setFormData({ ...formData, prinNext: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="bg-white/60 p-1 rounded-2xl border border-white flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-400 pl-3 pt-1 tracking-widest uppercase">Vice Principal</span>
                  <select className="w-full p-2 bg-transparent text-sm outline-none font-bold text-slate-700" value={formData.vpNext} onChange={e => setFormData({ ...formData, vpNext: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-[32px] font-black mt-6 flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> 안내 사항 등록하기</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen flex items-center justify-center">
      <div className="bg-white max-w-2xl w-full rounded-[48px] shadow-2xl shadow-blue-900/10 overflow-hidden border border-white relative transition-all duration-700 hover:shadow-blue-900/20">
        <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-8 -mb-8 blur-2xl"></div>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black flex items-center gap-3 tracking-tighter">
                <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                  <Calendar size={24} />
                </div>
                하주초 교무부 공지
              </h1>
              <p className="text-blue-100 text-xs font-bold pl-12 opacity-80 uppercase tracking-widest">Notice & Schedule</p>
            </div>
            <button
              onClick={() => setMode('admin')}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-[24px] transition-all text-white backdrop-blur-md border border-white/10 active:scale-90"
              title="관리자 모드"
            >
              <ShieldAlert size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 relative">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-5 bg-white/50 backdrop-blur-sm relative z-20">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-blue-100/50 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-14 h-14 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
              </div>
              <p className="font-bold text-sm tracking-tight text-slate-500 animate-pulse">정보를 안전하게 불러오고 있습니다...</p>
            </div>
          )}

          {!loading && data && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
                    <span className="text-blue-600 drop-shadow-sm">{data.안내날짜}</span>
                    <span className="text-slate-400 ml-2">소식</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Update System</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 bg-slate-50 p-3 rounded-[24px] border border-slate-100 shadow-inner w-full md:w-auto">
                   <div className="flex items-center gap-2 pr-1">
                     <Calendar size={12} className="text-blue-500" />
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">날짜 이동</label>
                   </div>
                   <div className="flex gap-2 w-full">
                     <input 
                      type="date" 
                      className="text-xs p-2.5 px-4 border-0 rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-600 w-full md:w-40 transition-all"
                      onChange={(e) => fetchLatest(e.target.value)}
                      value={data.안내날짜}
                     />
                     <button 
                      onClick={() => fetchLatest(getTodayKST())}
                      className="bg-blue-600 text-white p-2.5 px-4 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
                     >
                       TODAY
                     </button>
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-[36px] border border-blue-100/30 group transition-all hover:bg-white hover:shadow-xl hover:shadow-blue-500/5">
                    <h3 className="flex items-center gap-2 text-xs font-black text-blue-600 mb-4 uppercase tracking-widest">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-2xl group-hover:scale-110 transition-transform"><Briefcase size={16} /></div> 
                      업무안내
                    </h3>
                    <div className="text-[16px] text-slate-700 font-medium whitespace-pre-wrap leading-relaxed min-h-[100px] bg-white/40 p-1 rounded-2xl">
                      {data.업무안내 || '등록된 업무 안내가 없습니다.'}
                    </div>
                  </section>

                  <section className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-6 rounded-[36px] border border-orange-100/30 group transition-all hover:bg-white hover:shadow-xl hover:shadow-orange-500/5">
                    <h3 className="flex items-center gap-2 text-xs font-black text-orange-600 mb-4 uppercase tracking-widest">
                      <div className="bg-orange-100 text-orange-600 p-2 rounded-2xl group-hover:scale-110 transition-transform"><ShieldAlert size={16} /></div>
                      안전교육
                    </h3>
                    <div className="text-[16px] text-slate-700 font-medium whitespace-pre-wrap leading-relaxed min-h-[100px] bg-white/40 p-1 rounded-2xl">
                      {data.안전교육 || '등록된 안전 교육 내용이 없습니다.'}
                    </div>
                  </section>
                </div>

                <section className="pt-2">
                  <h3 className="text-[10px] font-black text-slate-400 mb-4 flex items-center gap-3 uppercase tracking-[0.2em] before:content-[''] before:flex-1 before:h-px before:bg-slate-100 after:content-[''] after:flex-1 after:h-px after:bg-slate-100">
                    복무현황
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-4 group transition-all hover:bg-white hover:shadow-lg">
                      <div className="text-[9px] font-black text-blue-600 mb-3 uppercase tracking-wider opacity-60 text-center">Today</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-2xl border border-white shadow-sm transition-all group-hover:shadow-md">
                          <span className="text-[10px] font-bold text-slate-500">교장</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{data.교장_오늘}</span>
                            <StatusIcon status={data.교장_오늘} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-2xl border border-white shadow-sm transition-all group-hover:shadow-md">
                          <span className="text-[10px] font-bold text-slate-500">교감</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{data.교감_오늘}</span>
                            <StatusIcon status={data.교감_오늘} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-4 group transition-all hover:bg-white hover:shadow-lg">
                      <div className="text-[9px] font-black text-emerald-600 mb-3 uppercase tracking-wider opacity-60 text-center">Next Day</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-2xl border border-white shadow-sm transition-all group-hover:shadow-md">
                          <span className="text-[10px] font-bold text-slate-500">교장</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{data.교장_다음}</span>
                            <StatusIcon status={data.교장_다음} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-white/80 p-2.5 rounded-2xl border border-white shadow-sm transition-all group-hover:shadow-md">
                          <span className="text-[10px] font-bold text-slate-500">교감</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{data.교감_다음}</span>
                            <StatusIcon status={data.교감_다음} />
                          </div>
                        </div>
                      </div>
                    </div>
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
              </div>
            </div>
          )}
        </div>

        <footer className="bg-slate-50/50 p-6 border-t border-slate-100 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-[98%] transition-transform duration-500 opacity-5"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] relative z-10 transition-colors group-hover:text-blue-500">Haju Elementary School Notice System</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
