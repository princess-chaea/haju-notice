import React, { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, Briefcase, ChevronRight, CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react';

// 구글 앱스 스크립트 배포 후 받은 웹 앱 URL을 여기에 넣으세요.
const API_URL = "https://script.google.com/macros/s/AKfycbytucGRbKU4rU_TzC9wCcF3YkUEYrpUp2Uh-dBB-SVonv4lQF7zmQuiB1erHl_EvYIU7w/exec";

const App = () => {
  const [mode, setMode] = useState('view'); // 'view' or 'admin'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    noticeDate: '',
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

  const fetchLatest = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=read`);
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-xl mx-auto p-4 bg-slate-50 min-h-screen animate-in fade-in duration-300">
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">교무부 안내 등록</h1>
          </div>
          <button
            onClick={() => setMode('view')}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
          >
            <XCircle size={16} /> 나가기
          </button>
        </header>

        <div className="space-y-4 bg-white p-6 rounded-3xl shadow-md border border-slate-100">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-1">
              <Calendar size={14} className="text-slate-400" /> 안내 날짜
            </label>
            <input
              type="text"
              placeholder="예: 3월 6일(금)"
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.noticeDate}
              onChange={e => setFormData({ ...formData, noticeDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-1">
              <Briefcase size={14} className="text-slate-400" /> 업무 안내
            </label>
            <textarea
              placeholder="전달하실 업무 내용을 입력하세요."
              className="w-full p-3 border border-slate-200 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              value={formData.workNotice}
              onChange={e => setFormData({ ...formData, workNotice: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-slate-700 flex items-center gap-1">
              <ShieldAlert size={14} className="text-slate-400" /> 안전 교육
            </label>
            <textarea
              placeholder="안전 교육 관련 내용을 입력하세요."
              className="w-full p-3 border border-slate-200 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              value={formData.safetyNotice}
              onChange={e => setFormData({ ...formData, safetyNotice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div className="space-y-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
              <h3 className="font-bold text-sm text-blue-600 flex items-center justify-center gap-1 mb-2">
                <CheckCircle2 size={14} /> 오늘 복무
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Principal</span>
                  <select className="w-full p-2 text-sm border-0 bg-white shadow-sm rounded-lg outline-none font-medium text-slate-700" value={formData.prinToday} onChange={e => setFormData({ ...formData, prinToday: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Vice Principal</span>
                  <select className="w-full p-2 text-sm border-0 bg-white shadow-sm rounded-lg outline-none font-medium text-slate-700" value={formData.vpToday} onChange={e => setFormData({ ...formData, vpToday: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-green-50/50 p-4 rounded-2xl border border-green-100/50">
              <h3 className="font-bold text-sm text-green-600 flex items-center justify-center gap-1 mb-2">
                <Calendar size={14} /> 다음 날
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Principal</span>
                  <select className="w-full p-2 text-sm border-0 bg-white shadow-sm rounded-lg outline-none font-medium text-slate-700" value={formData.prinNext} onChange={e => setFormData({ ...formData, prinNext: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Vice Principal</span>
                  <select className="w-full p-2 text-sm border-0 bg-white shadow-sm rounded-lg outline-none font-medium text-slate-700" value={formData.vpNext} onChange={e => setFormData({ ...formData, vpNext: e.target.value })}>
                    {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl font-bold mt-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {loading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 처리 중...</span> : <><Save size={20} /> 안내 사항 등록하기</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="bg-white max-w-2xl mx-auto rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Calendar size={24} /> 하주초 교무부 공지
          </h1>
          <button
            onClick={() => setMode('admin')}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors text-white"
            title="관리자 모드"
          >
            <ShieldAlert size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="font-medium animate-pulse">데이터를 불러오는 중...</p>
            </div>
          )}

          {!loading && data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  <span className="text-blue-600">{data.안내날짜}</span> 공지사항
                </h2>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Latest Update</div>
              </div>

              <div className="space-y-6">
                <section className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-3">
                    <div className="bg-blue-100 p-1.5 rounded-lg"><Briefcase size={16} /></div> [업무안내]
                  </h3>
                  <div className="text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {data.업무안내 || '등록된 업무 안내가 없습니다.'}
                  </div>
                </section>

                <section className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100/50">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-3">
                    <div className="bg-orange-100 p-1.5 rounded-lg"><ShieldAlert size={16} /></div> [안전교육]
                  </h3>
                  <div className="text-[15px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {data.안전교육 || '등록된 안전 교육 내용이 없습니다.'}
                  </div>
                </section>

                <section className="pt-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    교장/교감선생님 복무상황
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] font-black text-blue-500 mb-3 uppercase tracking-tighter">Today (오늘)</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100/50 shadow-sm">
                          <span className="text-xs font-bold text-slate-500">교장</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-700">{data.교장_오늘}</span>
                            <StatusIcon status={data.교장_오늘} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100/50 shadow-sm">
                          <span className="text-xs font-bold text-slate-500">교감</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-700">{data.교감_오늘}</span>
                            <StatusIcon status={data.교감_오늘} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] font-black text-green-500 mb-3 uppercase tracking-tighter">Next Day (다음 날)</div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100/50 shadow-sm">
                          <span className="text-xs font-bold text-slate-500">교장</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-700">{data.교장_다음}</span>
                            <StatusIcon status={data.교장_다음} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100/50 shadow-sm">
                          <span className="text-xs font-bold text-slate-500">교감</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-700">{data.교감_다음}</span>
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
            <div className="flex flex-col items-center justify-center py-24 text-slate-300 gap-4">
              <AlertCircle size={48} className="text-slate-200" />
              <p className="font-bold text-lg">최근 등록된 공지사항이 없습니다.</p>
              <button
                onClick={() => setMode('admin')}
                className="mt-2 text-blue-500 font-bold hover:underline"
              >
                첫 번째 공지사항 등록하기
              </button>
            </div>
          )}
        </div>

        <footer className="bg-slate-50 p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Haju Notice Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
