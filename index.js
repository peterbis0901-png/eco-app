/**
 * 👑 TRẠM ĐIỀU PHỐI MÔI TRƯỜNG (RESTORED ORIGINAL V3.5)
 * - Khôi phục 100% giao diện, tên gọi, tông màu xanh lá/xanh dương lúc đầu.
 * - Tích hợp vòng quét Radar mượt mà, không crash mượt mà trên Render.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// =========================================================================
// 💾 DỮ LIỆU CỐT LÕI NGUYÊN BẢN (Dữ liệu lúc đầu của bro)
// =========================================================================
let reports = [
    { id: 1, title: "Rác thải nhựa kênh Tàu Hủ", location: "Quận 8", status: "Chờ duyệt", points: 50, x: 35, y: 65 },
    { id: 2, title: "Điểm tập kết rác tự phát", location: "Thủ Đức", status: "Đã xử lý", points: 100, x: 70, y: 30 }
];

let leaderboard = [
    { name: "Hoàng Minh Đức", points: 1450 },
    { name: "Lê Thị Mai", points: 1210 }
];

// =========================================================================
// 🔌 TẦNG API ENDPOINTS 
// =========================================================================
app.get('/api/reports', (req, res) => res.json(reports));

app.post('/api/reports', (req, res) => {
    const { title, location } = req.body;
    // Tự động ghim một vị trí ngẫu nhiên trên bản đồ Radar tròn cho đẹp
    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 60) + 20;
    
    const newReport = { id: Date.now(), title, location, status: "Chờ duyệt", points: 50, x, y };
    reports.unshift(newReport); // Đẩy lên đầu luồng sự cố
    res.json({ success: true, report: newReport });
});

app.get('/api/leaderboard', (req, res) => res.json(leaderboard));

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const replies = [
        "Chào bro! Báo cáo của bạn giúp ích rất nhiều cho chiến dịch phủ xanh đô thị.",
        "Hệ thống vừa ghi nhận thêm điểm nóng môi trường. Cảm ơn ní nhé!",
        "EcoPoints của bạn có thể dùng để đổi quà sống xanh tại trạm trung tâm nha.",
        "Giữ vững tinh thần thám tử môi trường nhé bro! Trái Đất cảm ơn bạn!"
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    res.json({ reply: randomReply });
});

// =========================================================================
// 🎨 TẦNG GIAO DIỆN CHUẨN (Khôi phục màu sắc và tên gọi lúc đầu)
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Trạm Điều Phối Môi Trường</title>
            <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @keyframes scan {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .radar-sweep {
                    background: conic-gradient(from 0deg, rgba(16, 185, 129, 0.15) 0deg, rgba(16, 185, 129, 0) 90deg);
                    animation: scan 4s linear infinite;
                }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
            </style>
        </head>
        <body class="bg-gray-900 text-white font-sans antialiased">
            <div id="app-viewport"></div>

            <script type="text/babel">
                const EcoApp = () => {
                    const [reports, setReports] = React.useState([]);
                    const [leaderboard, setLeaderboard] = React.useState([]);
                    const [title, setTitle] = React.useState('');
                    const [location, setLocation] = React.useState('');
                    const [chatInput, setChatInput] = React.useState('');
                    const [chatLogs, setChatLogs] = React.useState([
                        { sender: 'AI', text: 'Chào bro! Hệ thống Trạm Điều Phối đã sẵn sàng trực chiến!' }
                    ]);

                    const fetchData = () => {
                        fetch('/api/reports').then(res => res.json()).then(setReports);
                        fetch('/api/leaderboard').then(res => res.json()).then(setLeaderboard);
                    };

                    React.useEffect(() => {
                        fetchData();
                    }, []);

                    const handleReportSubmit = (e) => {
                        e.preventDefault();
                        if (!title || !location) return;

                        fetch('/api/reports', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title, location })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                setReports(prev => [data.report, ...prev]);
                                setTitle('');
                                setLocation('');
                                alert('🎉 Báo cáo thành công! +50 EcoPoints đã được nạp!');
                            }
                        });
                    };

                    const handleSendMessage = (e) => {
                        e.preventDefault();
                        if (!chatInput.trim()) return;

                        const msg = chatInput;
                        setChatLogs(prev => [...prev, { sender: 'User', text: msg }]);
                        setChatInput('');

                        fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: msg })
                        })
                        .then(res => res.json())
                        .then(data => {
                            setChatLogs(prev => [...prev, { sender: 'AI', text: data.reply }]);
                        });
                    };

                    return (
                        <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto space-y-6">
                            
                            {/* HEADER CHUẨN LÚC ĐẦU */}
                            <header className="border-b border-gray-800 pb-4 flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-green-400">Trạm Điều Phối Môi Trường</h1>
                                    <p className="text-sm text-gray-400 mt-1">Hệ thống giám sát và tích lũy điểm thưởng bảo vệ môi trường</p>
                                </div>
                                <div className="bg-gray-800 px-4 py-2 rounded-xl border border-green-500/30 text-xs font-mono text-green-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    HỆ THỐNG ONLINE
                                </div>
                            </header>

                            {/* BỐ CỤC 3 CỘT TRỰC QUAN */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* CỘT 1: RADAR MAP & GỬI BÁO CÁO */}
                                <div className="space-y-6">
                                    {/* 📍 Radar Báo Cáo */}
                                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-green-500">
                                        <h2 className="text-xl mb-4 text-green-300 font-bold flex items-center gap-2">📍 Radar Bản Đồ</h2>
                                        
                                        {/* Khung bản đồ Radar tròn tích hợp */}
                                        <div className="relative w-full aspect-square bg-gray-950 rounded-full border border-green-600/30 overflow-hidden flex items-center justify-center mx-auto max-w-[280px]">
                                            <div className="absolute inset-6 rounded-full border border-green-500/10"></div>
                                            <div className="absolute inset-14 rounded-full border border-green-500/10"></div>
                                            <div className="absolute inset-24 rounded-full border border-green-500/10"></div>
                                            <div className="absolute inset-0 radar-sweep rounded-full pointer-events-none"></div>
                                            
                                            <div className="absolute h-full w-[1px] bg-green-500/10"></div>
                                            <div className="absolute w-full h-[1px] bg-green-500/10"></div>

                                            {/* Chấm Đỏ Sự Cố Nhấp Nháy */}
                                            {reports.map(r => (
                                                <div 
                                                    key={r.id} 
                                                    className="absolute group cursor-pointer"
                                                    style={{ left: \`\${r.x || 50}%\`, top: \`\${r.y || 50}%\` }}
                                                >
                                                    <span className="absolute -inset-1.5 rounded-full bg-red-500 animate-ping opacity-75"></span>
                                                    <span className="relative block w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow"></span>
                                                    
                                                    {/* Tooltip khi rê chuột */}
                                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-40 bg-gray-900 text-[11px] p-2 rounded-lg border border-gray-700 hidden group-hover:block z-50 shadow-2xl">
                                                        <p className="font-bold text-white mb-0.5">{r.title}</p>
                                                        <p className="text-gray-400">Vị trí: {r.location}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-gray-400 text-center italic mt-3">Rê chuột vào các chấm đỏ để xem nhanh gói tin</p>
                                    </div>

                                    {/* Form Gửi Báo Cáo */}
                                    <div className="bg-gray-800 p-5 rounded-xl shadow-lg border border-green-500">
                                        <h2 className="text-base font-bold mb-3 text-green-300">🚨 Gửi Sự Cố Môi Trường</h2>
                                        <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
                                            <input 
                                                type="text" 
                                                placeholder="Tên sự cố (ví dụ: Đổ trộm rác thải)..." 
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-green-500"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Khu vực / Quận Huyện..." 
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-green-500"
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                            />
                                            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold p-2.5 rounded-lg transition uppercase tracking-wider font-mono">
                                                Phát tín hiệu báo cáo
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* CỘT 2: DANH SÁCH BÁO CÁO THỰC ĐỊA */}
                                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-green-500 flex flex-col h-[570px]">
                                    <h2 className="text-xl mb-4 text-green-300 font-bold">📋 Luồng Tin Sự Cố</h2>
                                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                                        {reports.map(r => (
                                            <div key={r.id} className="p-3 bg-gray-700/50 border border-gray-700 rounded-xl text-xs space-y-1.5 transition hover:bg-gray-700/80">
                                                <p className="font-bold text-slate-100 text-sm">{r.title}</p>
                                                <p className="text-gray-400">📍 Khu vực: {r.location}</p>
                                                <div className="flex justify-between items-center pt-1 border-t border-gray-700/50">
                                                    <span className="text-green-400 font-mono font-bold">Trạng thái: {r.status}</span>
                                                    <span className="bg-green-900/40 text-green-400 px-2 py-0.5 rounded font-mono font-bold">+{r.points} XP</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CỘT 3: BẢNG XẾP HẠNG XP & CHATBOX ECO-BRO */}
                                <div className="space-y-6">
                                    {/* 🏆 Bảng Xếp Hạng */}
                                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-500">
                                        <h2 className="text-xl mb-4 text-blue-300 font-bold">🏆 Bảng Vinh Danh EcoPoints</h2>
                                        <div className="space-y-2.5 text-xs">
                                            {leaderboard.map((user, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-xl border border-gray-700">
                                                    <span className="text-slate-200 font-medium">#{idx+1} {user.name}</span>
                                                    <span className="text-green-400 font-mono font-bold">{user.points} XP</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 💬 Eco-Bro AI Chat */}
                                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-blue-500 flex flex-col h-[270px]">
                                        <h2 className="text-xl mb-3 text-blue-300 font-bold">💬 Eco-Bro AI</h2>
                                        <div className="flex-1 bg-gray-950 rounded-xl p-3 text-[11px] space-y-2 overflow-y-auto mb-2 border border-gray-800">
                                            {chatLogs.map((log, i) => (
                                                <div key={i} className={\`p-2 rounded-xl max-w-[85%] \${log.sender === 'User' ? 'bg-blue-600/80 ml-auto text-right text-white' : 'bg-gray-800 text-slate-200'}\`}>
                                                    <p className="font-bold text-[9px] opacity-50 mb-0.5">{log.sender}</p>
                                                    <p className="leading-relaxed">{log.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Hỏi AI về môi trường..." 
                                                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                                value={chatInput}
                                                onChange={e => setChatInput(e.target.value)}
                                            />
                                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition">
                                                Gửi
                                            </button>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                };

                ReactDOM.createRoot(document.getElementById('app-viewport')).render(<EcoApp />);
            </script>
        </body>
        </html>
    `);
});

// =========================================================================
// 🚀 KHỞI ĐỘNG MÁY CHỦ
// =========================================================================
app.listen(PORT, () => {
    console.log(`====================================================================`);
    console.log(` 👑 TRẠM ĐIỀU PHỐI MÔI TRƯỜNG ĐÃ QUAY TRỞ LẠI AN TOÀN`);
    console.log(` 🔌 TRẠM CHỦ LOCALHOST PORT: http://localhost:${PORT}`);
    console.log(`====================================================================`);
});
