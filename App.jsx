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
      <div className="max-w-xl mx-auto p-4 bg-slate-50 min-h-screen">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-slate-800">교무부 안내 등록</h1>
          <button onClick={() => setMode('view')} className="text-sm text-slate-500 underline">미리보기</button>
        </header>

        <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">안내 날짜</label>
            <input
              type="text"
              placeholder="예: 3월 6일(금)"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.noticeDate}
              onChange={e => setFormData({ ...formData, noticeDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">업무 안내</label>
            <textarea
              className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.workNotice}
              onChange={e => setFormData({ ...formData, workNotice: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">안전 교육</label>
            <textarea
              className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.safetyNotice}
              onChange={e => setFormData({ ...formData, safetyNotice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-blue-600 border-b pb-1 text-center">오늘 복무</h3>
              <div>
                <span className="text-xs text-slate-500">교장</span>
                <select className="w-full p-1 text-sm border rounded mt-1" value={formData.prinToday} onChange={e => setFormData({ ...formData, prinToday: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-slate-500">교감</span>
                <select className="w-full p-1 text-sm border rounded mt-1" value={formData.vpToday} onChange={e => setFormData({ ...formData, vpToday: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-green-600 border-b pb-1 text-center">월요일 복무</h3>
              <div>
                <span className="text-xs text-slate-500">교장</span>
                <select className="w-full p-1 text-sm border rounded mt-1" value={formData.prinNext} onChange={e => setFormData({ ...formData, prinNext: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <span className="text-xs text-slate-500">교감</span>
                <select className="w-full p-1 text-sm border rounded mt-1" value={formData.vpNext} onChange={e => setFormData({ ...formData, vpNext: e.target.value })}>
                  {attendanceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-4 flex items-center justify-center gap-2"
          >
            {loading ? "처리 중..." : <><Save size={18} /> 안내 사항 등록하기</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white max-w-2xl mx-auto rounded-lg overflow-hidden">
      {loading && <div className="text-center py-10 text-slate-400 animate-pulse">데이터를 불러오는 중...</div>}

      {!loading && data && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-4 border-b pb-2">
            <Calendar size={20} className="text-blue-500" />
            교무부 안내 - {data.안내날짜}
          </h2>

          <section className="mb-4">
            <h3 className="flex items-center gap-1 text-sm font-bold text-blue-700 mb-1">
              <Briefcase size={16} /> [업무안내]
            </h3>
            <div className="text-sm text-slate-700 whitespace-pre-wrap pl-5 border-l-2 border-slate-100 ml-2">
              {data.업무안내}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="flex items-center gap-1 text-sm font-bold text-orange-600 mb-1">
              <ShieldAlert size={16} /> [안전교육]
            </h3>
            <div className="text-sm text-slate-700 whitespace-pre-wrap pl-5 border-l-2 border-slate-100 ml-2">
              {data.안전교육}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-800 mb-3 bg-slate-50 p-2 rounded">교장/교감선생님 복무상황</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 text-[11px] font-bold py-1 text-center">오늘</div>
                <div className="p-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">교장</span>
                    <div className="flex items-center gap-1">
                      <StatusIcon status={data.교장_오늘} />
                      <span className="font-medium">{data.교장_오늘}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">교감</span>
                    <div className="flex items-center gap-1">
                      <StatusIcon status={data.교감_오늘} />
                      <span className="font-medium">{data.교감_오늘}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 text-[11px] font-bold py-1 text-center">월요일/내일</div>
                <div className="p-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">교장</span>
                    <div className="flex items-center gap-1">
                      <StatusIcon status={data.교장_다음} />
                      <span className="font-medium">{data.교장_다음}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">교감</span>
                    <div className="flex items-center gap-1">
                      <StatusIcon status={data.교감_다음} />
                      <span className="font-medium">{data.교감_다음}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {!loading && !data && (
        <div className="text-center py-20 text-slate-300">
          최근 등록된 공지사항이 없습니다.
        </div>
      )}
    </div>
  );
};

export default App;