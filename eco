/**
 * 🌍 MASTER ECO-COMMAND CENTER (V3.8 - DEPLOY READY)
 * - Architecture: Monolithic (Express Backend + Embedded React Frontend)
 * - Core Features: Interactive Radar Map, EcoPoints System, Dynamic AI Chat, Live Reporting
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware cấu hình chuẩn Production
app.use(cors({ origin: '*' }));
app.use(express.json());

// =========================================================================
// 💾 CƠ SỞ DỮ LIỆU TẠM THỜI (Bảo tồn 100% data cũ + bổ sung tọa độ Radar)
// =========================================================================
let reports = [
    { id: 1, title: "Rác thải nhựa kênh Tàu Hủ", location: "Quận 8", x: 35, y: 65, status: "Chờ duyệt", points: 50, time: "10 phút trước" },
    { id: 2, title: "Điểm tập kết rác tự phát", location: "Thủ Đức", x: 70, y: 30, status: "Đã xử lý", points: 100, time: "2 giờ trước" },
    { id: 3, title: "Khói bụi nhà máy khu công nghiệp", location: "Bình Tân", x: 20, y: 45, status: "Đang xác minh", points: 70, time: "Vừa xong" }
];

let leaderboard = [
    { name: "Hoàng Minh Đức", points: 1450, rank: 1 },
    { name: "Lê Thị Mai", points: 1210, rank: 2 },
    { name: "Bro Quốc Bảo (Bạn)", points: 950, rank: 3 }
];

const aiResponses = [
    "Chào bro! Báo cáo của bạn giúp ích rất nhiều cho chiến dịch phủ xanh đô thị.",
    "Hệ thống Radar vừa ghi nhận thêm một điểm nóng môi trường. Anh em đội phản ứng nhanh đang xuất phát!",
    "EcoPoints của bạn có thể dùng để đổi các phần quà sống xanh tại trạm trung tâm nha ní.",
    "Giữ vững tinh thần thám tử môi trường nhé bro! Trái Đất cảm ơn bạn!"
];

// =========================================================================
// 🔌 TẦNG API ENDPOINTS (Phục vụ truyền nhận dữ liệu Full-Stack)
// =========================================================================
app.get('/api/reports', (req, res) => res.json(reports));

app.post('/api/reports', (req, res) => {
    const { title, location } = req.body;
    // Tự động tính toán tọa độ ngẫu nhiên trên bản đồ Radar cho hợp lý
    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 60) + 20;
    
    const newReport = {
        id: Date.now(),
        title,
        location,
        x,
        y,
        status: "Chờ duyệt",
        points: 50,
        time: "Vừa xong"
    };
    reports.unshift(newReport); // Đưa lên đầu danh sách
    res.json({ success: true, report: newReport });
});

app.get('/api/leaderboard', (req, res) => res.json(leaderboard));

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const randomReply = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    res.json({ reply: randomReply });
});

// =========================================================================
// 🎨 TẦNG GIAO DIỆN (Embedded React + Tailwind CSS Biến Hình Cyberpunk)
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Eco-App Command Center</title>
            <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @keyframes radar-pulse {
                    0% { transform: scale(0.2); opacity: 0.8; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                @keyframes scan {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .radar-glow { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
                .radar-sweep {
                    background: conic-gradient(from 0deg, rgba(16, 185, 129, 0.15) 0deg, rgba(16, 185, 129, 0) 90deg);
                    animation: scan 4s linear infinite;
                }
            </style>
        </head>
        <body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-900">
            <div id="root"></div>

            <script type="text/babel">
                const CommandCenter = () => {
                    const [reports, setReports] = React.useState([]);
                    const [leaderboard, setLeaderboard] = React.useState([]);
                    const [chatInput, setChatInput] = React.useState('');
                    const [chatLogs, setChatLogs] = React.useState([
                        { sender: 'AI', text: 'Chào bro! Hệ thống Radar Sinh Thái đã sẵn sàng trực chiến!' }
                    ]);
                    const [form, setForm] = React.useState({ title: '', location: '' });
                    const [loading, setLoading] = React.useState(false);

                    // Đồng bộ dữ liệu ban đầu
                    const fetchData = () => {
                        fetch('/api/reports').then(res => res.json()).then(setReports);
                        fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
                    };

                    React.useEffect(() => {
                        fetchData();
                        const interval = setInterval(fetchData, 10000); // Auto-refresh mỗi 10s
                        return () => clearInterval(interval);
                    }, []);

                    // Gửi báo cáo mới
                    const handleReportSubmit = (e) => {
                        e.preventDefault();
                        if (!form.title || !form.location) return;
                        setLoading(true);

                        fetch('/api/reports', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(form)
                        })
                        .then(res => res.json())
                        .then(res => {
                            if (res.success) {
                                setReports(prev => [res.report, ...prev]);
                                setForm({ title: '', location: '' });
                                // Tự động cộng điểm cho bro trong session
                                setLeaderboard(prev => prev.map(u => u.name.includes('(Bạn)') ? {...u, points: u.points + 50} : u));
                                // AI thông báo chúc mừng
                                setChatLogs(c => [...c, { sender: 'AI', text: '🎉 Báo cáo thành công! +50 EcoPoints đã được nạp vào tài khoản của bạn!' }]);
                            }
                            setLoading(false);
                        });
                    };

                    // Chat với Eco-Bro AI
                    const handleSendMessage = (e) => {
                        e.preventDefault();
                        if (!chatInput.trim()) return;

                        const userMsg = chatInput;
                        setChatLogs(prev => [...prev, { sender: 'User', text: userMsg }]);
                        setChatInput('');

                        fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: userMsg })
                        })
                        .then(res => res.json())
                        .then(data => {
                            setChatLogs(prev => [...prev, { sender: 'AI', text: data.reply }]);
                        });
                    };

                    return (
                        <div className="min-h-screen p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
                            {/* Header */}
                            <header className="flex justify-between items-center border-b border-emerald-500/30 pb-4">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        ECO-COMMAND PROTOCOL
                                    </h1>
                                    <p className="text-xs text-slate-400 mt-1">Hệ thống giám sát và tích lũy điểm thưởng môi trường toàn cầu</p>
                                </div>
                                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-mono">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    ONLINE MÔI TRƯỜNG LIVE
                                </div>
                            </header>

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* CỘT 1 + 2: RADAR MAP & LIVE REPORTS */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* 🛰️ RADAR MAP TÍCH HỢP BIẾN HÌNH CHUẨN REAL-TIME */}
                                    <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4 radar-glow relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-3 z-10 relative">
                                            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                                🛰️ Bản đồ quét tín hiệu vệ tinh
                                            </h2>
                                            <span className="text-[10px] font-mono text-slate-500">Bán kính: 5km</span>
                                        </div>

                                        {/* Khung bản đồ Radar tròn */}
                                        <div className="relative w-full aspect-square md:max-h-[400px] bg-slate-950/80 rounded-full border border-emerald-500/30 mx-auto overflow-hidden flex items-center justify-center">
                                            {/* Đường tròn đồng tâm quét mục tiêu */}
                                            <div className="absolute inset-4 rounded-full border border-emerald-500/10"></div>
                                            <div className="absolute inset-16 rounded-full border border-emerald-500/10"></div>
                                            <div className="absolute inset-32 rounded-full border border-emerald-500/10"></div>
                                            <div className="absolute inset-0 radar-sweep rounded-full pointer-events-none"></div>

                                            {/* Trục tâm bản đồ */}
                                            <div className="absolute h-full w-[1px] bg-emerald-500/10"></div>
                                            <div className="absolute w-full h-[1px] bg-emerald-500/10"></div>

                                            {/* Hiển thị các chấm sự cố trên bản đồ */}
                                            {reports.map(report => (
                                                <div 
                                                    key={report.id}
                                                    className="absolute group cursor-pointer"
                                                    style={{ left: \`\${report.x}%\`, top: \`\${report.y}%\` }}
                                                >
                                                    {/* Vòng tròn xung kích nhấp nháy đỏ/vàng tùy trạng thái */}
                                                    <span className={\`absolute -inset-2 rounded-full opacity-75 animate-ping \${report.status === 'Đã xử lý' ? 'bg-cyan-400' : 'bg-rose-500'}\`}></span>
                                                    {/* Chấm tâm */}
                                                    <span className={\`relative block w-3 h-3 rounded-full border border-white shadow \${report.status === 'Đã xử lý' ? 'bg-cyan-400' : 'bg-rose-500'}\`}></span>
                                                    
                                                    {/* Tooltip khi di chuột qua điểm trên bản đồ */}
                                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs hidden group-hover:block z-30 shadow-2xl">
                                                        <p className="font-bold text-white mb-0.5">{report.title}</p>
                                                        <p className="text-slate-400">Khu vực: {report.location}</p>
                                                        <p className="text-emerald-400 mt-1 font-mono">Trạng thái: {report.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 📋 DANH SÁCH BÁO CÁO VÀ FORM GỬI */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Form gửi sự cố */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">✍️ Phát hiện sự cố mới?</h3>
                                            <form onSubmit={handleReportSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Mô tả ngắn gọn sự cố</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ví dụ: Đổ trộm vật liệu xây dựng..." 
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                                                        value={form.title}
                                                        onChange={e => setForm({...form, title: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-slate-400 mb-1">Địa điểm / Quận Huyện</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ví dụ: Quận 5, TP.HCM..." 
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                                                        value={form.location}
                                                        onChange={e => setForm({...form, location: e.target.value})}
                                                    />
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    disabled={loading}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm py-2.5 rounded-xl transition flex justify-center items-center gap-2"
                                                >
                                                    {loading ? 'Đang mã hóa dữ liệu...' : '🚀 Phát tín hiệu cấp cứu'}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Feed dữ liệu trực tuyến */}
                                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col max-h-[260px]">
                                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">📡 Luồng tin sự cố live</h3>
                                            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                                                {reports.map(r => (
                                                    <div key={r.id} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex justify-between items-center text-xs">
                                                        <div>
                                                            <p className="font-bold text-slate-200">{r.title}</p>
                                                            <p className="text-slate-500 text-[10px] mt-0.5">📍 {r.location} • {r.time}</p>
                                                        </div>
                                                        <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                                                            r.status === 'Đã xử lý' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'
                                                        }\`}>
                                                            {r.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT 3: LEADERBOARD & AI ECO-BRO CHATBOX */}
                                <div className="space-y-6">
                                    {/* 🏆 BẢNG XẾP HẠNG ECOPOINTS */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">🏆 Bảng vinh danh EcoPoints</h3>
                                        <div className="space-y-2.5">
                                            {leaderboard.map((user, idx) => (
                                                <div key={idx} className={\`flex justify-between items-center p-3 rounded-xl border \${
                                                    user.name.includes('(Bạn)') ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800'
                                                }\`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-xs text-slate-500 w-4">#{idx+1}</span>
                                                        <span className="text-sm text-slate-200 font-medium">{user.name}</span>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-emerald-400">{user.points} XP</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 💬 ECO-BRO AI CHATBOX INTERACTIVE */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[340px]">
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            🤖 Trợ lý ảo Eco-Bro AI
                                        </h3>
                                        {/* Khung log chat */}
                                        <div className="flex-1 bg-slate-950 rounded-xl p-3 text-xs space-y-2.5 overflow-y-auto mb-3 border border-slate-800">
                                            {chatLogs.map((log, i) => (
                                                <div key={i} className={\`flex flex-col \${log.sender === 'User' ? 'items-end' : 'items-start'}\`}>
                                                    <span className="text-[9px] text-slate-500 mb-0.5">{log.sender}</span>
                                                    <p className={\`p-2 rounded-xl max-w-[85%] leading-relaxed \${
                                                        log.sender === 'User' ? 'bg-emerald-600 text-slate-950 font-medium' : 'bg-slate-800 text-slate-200'
                                                    }\`}>
                                                        {log.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Ô nhập chat */}
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Hỏi AI về môi trường..." 
                                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition"
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                            />
                                            <button type="submit" className="bg-slate-800 hover:bg-slate-700 px-3 rounded-xl text-xs transition">
                                                Gửi
                                            </button>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                };

                ReactDOM.createRoot(document.getElementById('root')).render(<CommandCenter />);
            </script>
        </body>
        </html>
    `);
});

// =========================================================================
// 🚀 KÍCH HOẠT HỆ THỐNG
// =========================================================================
app.listen(PORT, () => {
    console.log(`====================================================================`);
    console.log(` 👑 ARCHITECT NODE MONOLITH CORE CORE V3.8 ONLINE`);
    console.log(` 🔌 TRẠM CHỦ LOCALHOST PORT: http://localhost:${PORT}`);
    console.log(`====================================================================`);
});
