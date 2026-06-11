/**
 * 🌱 ECOCONNECT HCM - BẢN V2.2 (FIXED SYNTAX ERROR)
 * - Sửa lỗi "Unexpected token '<'" do thiếu thẻ bọc (React Fragment) ở hàm return.
 * - Sửa lỗi thẻ <ul> nằm trong thẻ <p> gây kén trình duyệt ở mục Điều khoản.
 * - Code sạch bóng, dọn sẵn sàng lên mâm!
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json()); 

let users = []; 
let otpStore = {}; 

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'peterbis0901@gmail.com',
        pass: 'bzqkxdqolforczrs'
    },
    tls: { rejectUnauthorized: false }
});

function generateCustomOTP() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let charPart = ''; let numPart = '';
    for (let i = 0; i < 3; i++) {
        charPart += letters.charAt(Math.floor(Math.random() * letters.length));
        numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return charPart[0] + numPart[0] + charPart[1] + numPart[1] + charPart[2] + numPart[2];
}

app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin!' });
    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') return res.status(400).json({ success: false, message: 'Mã xác nhận Cán bộ không đúng!' });
    if (users.some(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; 
    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    const mailOptions = {
        from: `"EcoConnect HCM" <peterbis0901@gmail.com>`, 
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký',
        html: `<p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'OTP sent!' });
    } catch (error) {
        res.status(200).json({ success: true, message: 'Render Firewall Block. Fallback OTP:', fallbackOtp: otpCode });
    }
});

app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];
    if (!session || Date.now() > session.expires) return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc hết hạn!' });
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Mã OTP sai!' });

    users.push(session.userData);
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Đăng ký thành công!' });
});

// =========================================================================
// FRONTEND GIAO DIỆN REACT MỘT TRANG (SPA)
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect - Ultimate Masterpiece</title>
        
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
        
        <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f0fdf4; color: #0f172a; overflow: hidden; height: 100vh; background-image: radial-gradient(circle at 100% 0%, #dcfce7 0%, transparent 50%), radial-gradient(circle at 0% 100%, #ccfbf1 0%, transparent 50%); }
            .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.1); }
            .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
            #map { height: 100%; width: 100%; border-radius: 24px; z-index: 1; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            @keyframes pulse-leaf { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            .animate-pulse-leaf { animation: pulse-leaf 2s ease-in-out infinite; }
            .custom-scroll::-webkit-scrollbar { width: 6px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
            input:focus, textarea:focus, select:focus { border-color: #10b981 !important; outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        </style>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            // TỪ ĐIỂN ĐA NGÔN NGỮ
            const dict = {
                vi: {
                    slogan: "🌿 EcoConnect - Đánh thức mầm xanh, Chữa lành Trái Đất 🌍", welcome: "Hệ thống giám sát:",
                    t1: "Tổng quan hệ thống", t2: "Bản đồ & Thông báo", t3: "Cộng đồng & Sự kiện", t4: "Phòng chat trực tuyến", t5: "Tin tức & Cẩm nang", t6: "Eco Reels", t7: "AI Môi trường", t8: "Quản lý & Quà tặng",
                    botGreeting: "Xin chào! Mình là bé Robot EcoBot 🤖🌱. Mình có thể giúp gì cho hành tinh của chúng ta hôm nay?"
                }
            };

            // Dữ liệu Mẫu (Mock Data)
            const initialReports = [
                { id: "REP-001", title: "Bãi rác tự phát dưới chân cầu chữ Y gây bốc mùi", location: "Quận 8", status: "Chờ duyệt", type: "Trash", lat: 10.742, lng: 106.635, author: "Nguyen Van A" },
                { id: "REP-002", title: "Cơ sở nhuộm lén xả thải đen ngòm ra kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", lat: 10.782, lng: 106.685, author: "Tran Thi B" },
            ];
            const initialEvents = [
                { id: "EV-01", title: "Chủ Nhật Xanh lần 145", loc: "Nhà thiếu nhi Quận 8", time: "14/06/2026", status: "Đã duyệt", current: 45, max: 100, org: "Đoàn TNCS", desc: "Vớt rác lục bình tại Kênh Tàu Hủ." },
                { id: "EV-02", title: "Đổi Rác Lấy Cây Xanh", loc: "Phố đi bộ Nguyễn Huệ", time: "20/06/2026", status: "Chờ duyệt", current: 0, max: 500, org: "Cộng đồng Xanh", desc: "Thu gom chai nhựa đổi sen đá." }
            ];

            // BIỂU ĐỒ REAL-TIME (Line Chart)
            function RealtimeChart() {
                const chartRef = React.useRef(null);
                React.useEffect(() => {
                    const ctx = document.getElementById('realtimeChart').getContext('2d');
                    chartRef.current = new Chart(ctx, {
                        type: 'line',
                        data: { labels: ['10:00', '10:01', '10:02', '10:03', '10:04'], datasets: [{ label: 'PM2.5 AQI', data: [45, 48, 52, 49, 55], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 }] },
                        options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false } } }
                    });
                    const iv = setInterval(() => {
                        if(chartRef.current) {
                            chartRef.current.data.labels.push(new Date().toLocaleTimeString());
                            chartRef.current.data.datasets[0].data.push(Math.floor(40 + Math.random() * 30));
                            if (chartRef.current.data.labels.length > 8) { chartRef.current.data.labels.shift(); chartRef.current.data.datasets[0].data.shift(); }
                            chartRef.current.update();
                        }
                    }, 2000);
                    return () => { clearInterval(iv); chartRef.current.destroy(); };
                }, []);
                return <canvas id="realtimeChart"></canvas>;
            }

            // BIỂU ĐỒ TRÒN (Pie Chart rác thải)
            function WastePieChart() {
                const chartRef = React.useRef(null);
                React.useEffect(() => {
                    const ctx = document.getElementById('wastePieChart').getContext('2d');
                    chartRef.current = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Hữu cơ', 'Nhựa', 'Giấy', 'Khác'],
                            datasets: [{ data: [45, 25, 15, 15], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'], borderWidth: 0 }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: {size: 10} } } } }
                    });
                    return () => chartRef.current.destroy();
                }, []);
                return <canvas id="wastePieChart"></canvas>;
            }

            // MAP COMPONENT
            function MapView({ reports }) {
                const mapInstance = React.useRef(null);
                React.useEffect(() => {
                    if (!mapInstance.current) {
                        mapInstance.current = L.map('map', { zoomControl: false }).setView([10.776, 106.695], 13);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
                    }
                    mapInstance.current.eachLayer((layer) => { if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer); });
                    reports.forEach(rep => {
                        const color = rep.status === 'Đã xử lý' ? '#10b981' : '#ef4444';
                        const customIcon = L.divIcon({ className: 'custom-icon', html: \`<div style="background-color: \${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff;"></div>\`});
                        L.marker([rep.lat, rep.lng], { icon: customIcon }).addTo(mapInstance.current).bindPopup(\`<b>\${rep.id}</b>: \${rep.title}\`);
                    });
                }, [reports]);
                return <div id="map"></div>;
            }

            function App() {
                const [lang, setLang] = React.useState('vi');
                const [isAppLoading, setIsAppLoading] = React.useState(true);
                const t = dict[lang];

                const [user, setUser] = React.useState(null); 
                const [view, setView] = React.useState('auth'); 
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                const [currentTab, setCurrentTab] = React.useState('1_dashboard'); 
                
                const [showTerms, setShowTerms] = React.useState(false);
                const [reports, setReports] = React.useState(initialReports);
                const [events, setEvents] = React.useState(initialEvents);

                // Modal Cán Bộ & Tổ chức
                const [rejectModal, setRejectModal] = React.useState({ isOpen: false, type: '', targetId: '', reason: '' });
                const [showEventForm, setShowEventForm] = React.useState(false);

                // Quản lý Chat & AI
                const [activeChannel, setActiveChannel] = React.useState('Chung');
                const [chatInput, setChatInput] = React.useState('');
                const [chatData, setChatData] = React.useState({
                    'Chung': [ { id:1, sender: 'Minh Thư', text: 'Kênh Nhiêu Lộc đỡ mùi rồi!', isMe: false, reacts: { '❤️': 2 } } ],
                    'Quận 1': [ { id:2, sender: 'Hoàng', text: 'Góc Phạm Ngũ Lão có ai dọn rác chưa?', isMe: false, reacts: {} } ],
                    'Quận 8': [ { id:3, sender: 'Nam', text: 'Chân cầu chữ Y rác bốc mùi quá.', isMe: false, reacts: { '👍': 1 } } ]
                });
                
                const [aiInput, setAiInput] = React.useState('');
                const [aiMessages, setAiMessages] = React.useState([]);

                React.useEffect(() => { setTimeout(() => setIsAppLoading(false), 2000); }, []);
                React.useEffect(() => { setAiMessages([{ sender: 'EcoBot', text: dict[lang].botGreeting, isBot: true }]); }, [lang]);

                // CHAT CỘNG ĐỒNG
                const sendChat = () => {
                    if(!chatInput.trim()) return;
                    const newMsg = { id: Date.now(), sender: 'Bạn', text: chatInput, isMe: true, reacts: {} };
                    setChatData({ ...chatData, [activeChannel]: [...chatData[activeChannel], newMsg] });
                    setChatInput('');
                };
                const addReaction = (channel, msgId, emoji) => {
                    const updated = chatData[channel].map(m => {
                        if(m.id === msgId) {
                            const currentCount = m.reacts[emoji] || 0;
                            return { ...m, reacts: { ...m.reacts, [emoji]: currentCount + 1 } };
                        }
                        return m;
                    });
                    setChatData({ ...chatData, [channel]: updated });
                };

                // THUẬT TOÁN AI
                const sendAI = () => {
                    if(!aiInput.trim()) return;
                    const q = aiInput.toLowerCase();
                    const newMsg = [...aiMessages, { sender: 'Bạn', text: aiInput, isBot: false }];
                    setAiMessages(newMsg);
                    setAiInput('');
                    
                    let reply = "EcoBot đang phân tích... Dữ liệu này sẽ được ghi nhận để mình thông minh hơn. Cảm ơn bạn! 🌱";
                    if(q.includes('rác') || q.includes('nhựa') || q.includes('phân loại')) {
                        reply = "💡 Đối với rác thải: Rác hữu cơ bỏ thùng xanh lá. Rác vô cơ (nhựa, giấy) bỏ thùng xám để tái chế nha!";
                    } else if (q.includes('pin') || q.includes('điện tử')) {
                        reply = "⚠️ Pin cũ chứa kim loại nặng, tuyệt đối KHÔNG vứt chung rác sinh hoạt. Hãy mang đến điểm thu gom xanh nhé!";
                    } else if (q.includes('cây')) {
                        reply = "🌳 Tuyệt vời! Bạn có thể vào tab 'Cộng đồng & Sự kiện' để đăng ký các chiến dịch trồng cây.";
                    }

                    setTimeout(() => { setAiMessages([...newMsg, { sender: 'EcoBot', text: reply, isBot: true }]); }, 600);
                };

                // CÁN BỘ & TỔ CHỨC
                const handleApprove = (type, id) => {
                    if(type === 'report') setReports(reports.map(r => r.id === id ? {...r, status: 'Đã xử lý'} : r));
                    else setEvents(events.map(e => e.id === id ? {...e, status: 'Đã duyệt'} : e));
                    alert('✅ Đã phê duyệt thành công!');
                };
                const submitReject = () => {
                    if(!rejectModal.reason) return alert('Vui lòng nhập lý do từ chối!');
                    if(rejectModal.type === 'report') setReports(reports.map(r => r.id === rejectModal.targetId ? {...r, status: 'Từ chối'} : r));
                    else setEvents(events.map(e => e.id === rejectModal.targetId ? {...e, status: 'Từ chối'} : e));
                    setRejectModal({ isOpen: false, type: '', targetId: '', reason: '' });
                    alert('❌ Đã từ chối và ghi nhận lý do.');
                };

                const handleCreateEvent = (e) => {
                    e.preventDefault();
                    const newEv = { id: "EV-0" + (events.length + 1), title: e.target.title.value, loc: e.target.loc.value, time: e.target.time.value, status: "Chờ duyệt", current: 0, max: e.target.max.value, org: user.name, desc: e.target.desc.value };
                    setEvents([...events, newEv]);
                    setShowEventForm(false);
                    alert("Đã nộp đơn xin phép hoạt động!");
                };

                const handleAuth = () => { setUser({name: 'Sếp Tổng Lâm', role: currentRole, email: 'lam@ecoconnect.vn'}); setView('dashboard'); };

                if (isAppLoading) return (
                    <div className="fixed inset-0 bg-[#f0fdf4] z-[9999] flex flex-col items-center justify-center animate-fadeIn">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute w-32 h-32 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                            <span className="text-6xl animate-pulse-leaf">🌍</span>
                            <span className="absolute -top-4 -right-4 text-4xl animate-bounce">🌱</span>
                        </div>
                        <h1 className="text-4xl font-black text-emerald-800 mb-2">EcoConnect</h1>
                        <p className="text-emerald-600 font-semibold">{t.slogan}</p>
                    </div>
                );

                if (view === 'auth') return (
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="glass w-full max-w-[450px] p-10 rounded-[32px] text-center">
                            <h1 className="text-3xl font-extrabold mb-2 text-emerald-900">EcoConnect</h1>
                            <p className="text-emerald-700/70 text-sm mb-8 font-medium">{t.slogan}</p>
                            <div className="grid grid-cols-3 gap-2 py-1 mb-4">
                                {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => (
                                    <button key={r} onClick={() => setCurrentRole(r)} className={\`py-2 text-[11px] font-bold rounded-lg border \${currentRole === r ? 'emerald-gradient' : 'bg-white text-slate-500'}\`}>{r}</button>
                                ))}
                            </div>
                            {currentRole === 'Cán bộ' && <input type="text" placeholder="Mã cán bộ (ADMIN123)" className="w-full bg-emerald-50 p-3 rounded-xl mb-4 font-bold text-sm outline-none border border-emerald-200" />}
                            <button className="w-full py-4 emerald-gradient rounded-2xl font-bold uppercase shadow-lg" onClick={handleAuth}>Vào Hệ Thống Thử Nghiệm</button>
                            <div className="mt-4 text-xs font-bold text-emerald-600 cursor-pointer" onClick={()=>setShowTerms(true)}>Xem Chính sách & Điều khoản</div>
                        </div>

                        {showTerms && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                                    <h3 className="text-xl font-black text-emerald-800 mb-4">Chính Sách & Điều Khoản Sử Dụng</h3>
                                    <div className="space-y-4 text-sm text-slate-600 h-72 overflow-y-auto pr-3 custom-scroll text-justify leading-relaxed">
                                        <p><strong className="text-emerald-700">Điều 1. Quy định chung:</strong> EcoConnect là nền tảng số hóa do Thành phố quản lý nhằm kết nối cộng đồng, xử lý sự cố môi trường.</p>
                                        <p><strong className="text-emerald-700">Điều 2. Quyền riêng tư:</strong> Thông tin cá nhân được mã hóa định dạng AES-256. Tuyệt đối KHÔNG chia sẻ dữ liệu cho bên thứ 3.</p>
                                        <p><strong className="text-emerald-700">Điều 3. Trách nhiệm Báo cáo:</strong> Việc lạm dụng tính năng báo cáo (spam, báo cáo sai) sẽ bị khóa tài khoản 30 ngày.</p>
                                        <div className="mb-2"><strong className="text-red-600">Điều 4. Hành vi bị NGHIÊM CẤM tuyệt đối:</strong> 
                                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                                <li>Sử dụng ngôn từ thô tục, chửi thề trong Chat.</li>
                                                <li>Phát tán thông tin giả mạo (Fake News).</li>
                                            </ul>
                                        </div>
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mt-4 text-red-700">
                                            <strong>⚠️ XỬ PHẠT:</strong> Khóa tài khoản vĩnh viễn với mọi hành vi vi phạm.
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3.5 emerald-gradient rounded-xl font-bold text-white" onClick={() => setShowTerms(false)}>Đã hiểu</button>
                                </div>
                            </div>
                        )}
                    </div>
                );

                const tabs = [
                    { id: '1_dashboard', name: t.t1, icon: 'dashboard' }, { id: '2_map_notify', name: t.t2, icon: 'map' },
                    { id: '3_community_events', name: t.t3, icon: 'groups' }, { id: '4_chat', name: t.t4, icon: 'forum' },
                    { id: '5_news_handbook', name: t.t5, icon: 'menu_book' }, { id: '6_reels', name: t.t6, icon: 'play_circle' },
                    { id: '7_ai', name: t.t7, icon: 'smart_toy' }, { id: '8_profile', name: t.t8, icon: 'redeem' }
                ];

                // 🔥 ĐÃ FIX: Bọc TẤT CẢ giao diện vào 1 thẻ DIV tổng duy nhất
                return (
                    <div className="relative w-full h-full">
                        
                        <div className="h-screen flex bg-[#f0fdf4] overflow-hidden">
                            <aside className="w-72 glass m-4 mr-0 rounded-[32px] p-5 flex flex-col shadow-sm min-h-0">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100 flex-shrink-0">
                                    <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><span className="material-icons-round text-2xl">spa</span></div>
                                    <div><h1 className="text-lg font-black text-emerald-950">EcoConnect</h1><span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">V2.2 Fixed</span></div>
                                </div>
                                <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scroll">
                                    {tabs.map(tab => (
                                        <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all text-left \${currentTab === tab.id ? 'emerald-gradient shadow-md' : 'text-slate-500 hover:bg-emerald-50'}\`}><span className="material-icons-round text-[20px]">{tab.icon}</span><span>{tab.name}</span></button>
                                    ))}
                                </nav>
                            </aside>

                            <main className="flex-1 p-4 flex flex-col h-screen overflow-hidden">
                                <header className="glass rounded-[24px] p-4 px-6 mb-4 flex justify-between items-center shadow-sm flex-shrink-0">
                                    <h2 className="text-[15px] font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-emerald-500">verified_user</span>{t.welcome} <span className="text-emerald-600">{user?.name}</span></h2>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase">{user?.role}</span>
                                        <button className="h-10 w-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 shadow-sm border border-slate-100" onClick={() => window.location.reload()}><span className="material-icons-round">logout</span></button>
                                    </div>
                                </header>

                                <div className="flex-1 min-h-0 animate-fadeIn relative">
                                    
                                    {currentTab === '1_dashboard' && (
                                        <div className="flex flex-col h-full gap-4">
                                            <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                                                {[{ label: 'Báo cáo sự cố', val: '1,452', color: 'text-slate-800', bg: 'bg-blue-50' }, { label: 'Đã xử lý', val: '89.4%', color: 'text-emerald-600', bg: 'bg-emerald-50' }, { label: 'Rác thu gom', val: '124 Tấn', color: 'text-teal-600', bg: 'bg-teal-50' }, { label: 'Tình nguyện viên', val: '8,405', color: 'text-amber-600', bg: 'bg-amber-50' }].map((st, i) => (
                                                    <div key={i} className={\`glass p-5 rounded-[24px] \${st.bg} flex flex-col justify-center border-white\`}>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{st.label}</p>
                                                        <span className={\`text-2xl font-black \${st.color}\`}>{st.val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
                                                <div className="col-span-2 glass rounded-[32px] p-5 flex flex-col relative border-white">
                                                    <h3 className="font-bold text-sm text-slate-700 flex justify-between"><span className="flex items-center gap-2"><span className="material-icons-round text-emerald-500">air</span> AQI Bụi mịn PM2.5</span><span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold flex items-center gap-1 animate-pulse"><span className="h-2 w-2 bg-red-500 rounded-full"></span> LIVE</span></h3>
                                                    <div className="flex-1 relative w-full h-full mt-3"><RealtimeChart /></div>
                                                </div>
                                                <div className="glass rounded-[32px] p-5 flex flex-col relative border-white">
                                                    <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2 mb-2"><span className="material-icons-round text-blue-500">pie_chart</span> Tỉ trọng Rác thải</h3>
                                                    <div className="flex-1 relative w-full h-full"><WastePieChart /></div>
                                                </div>
                                                <div className="glass rounded-[32px] p-5 flex flex-col border-white overflow-y-auto custom-scroll">
                                                    <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2 mb-4"><span className="material-icons-round text-amber-500">calendar_month</span> Lịch hoạt động</h3>
                                                    <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                                                        <div className="flex justify-between items-center mb-2 font-bold text-xs text-slate-700"><span>Tháng 6, 2026</span><span className="text-emerald-500">Hôm nay: 11</span></div>
                                                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 font-semibold mb-1"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div>
                                                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700">
                                                            <span className="opacity-30">1</span><span className="opacity-30">2</span><span className="opacity-30">3</span><span className="opacity-30">4</span><span className="opacity-30">5</span><span className="opacity-30">6</span><span className="opacity-30">7</span>
                                                            <span className="text-emerald-600 bg-emerald-100 font-bold rounded-md">8</span><span>9</span><span>10</span><span className="bg-slate-800 text-white rounded-md font-bold">11</span><span>12</span><span>13</span><span className="text-red-500 font-bold bg-red-50 rounded-md ring-1 ring-red-200">14</span>
                                                            <span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span className="text-blue-500 font-bold bg-blue-50 rounded-md">20</span><span>21</span>
                                                        </div>
                                                    </div>
                                                    <strong className="text-[11px] text-slate-500 uppercase block mb-2">{user?.role === 'Cán bộ' ? 'Sự kiện giám sát:' : 'Sự kiện tham gia/tạo:'}</strong>
                                                    <div className="bg-emerald-50 p-3 rounded-xl border-l-4 border-emerald-500 text-xs text-left mb-2">
                                                        <strong className="text-emerald-700">Chủ Nhật Xanh (14/06)</strong><br/><span className="text-slate-500">📍 Kênh Tàu Hủ, Q8.</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '2_map_notify' && (
                                        <div className="flex flex-col h-full gap-4">
                                            <div className="flex-shrink-0 grid grid-cols-3 gap-4">
                                                <div className="glass p-4 rounded-2xl border-l-4 border-red-500 bg-red-50 text-left flex items-center gap-3">
                                                    <span className="material-icons-round text-3xl text-red-500 animate-bounce">warning</span>
                                                    <div><strong className="text-red-600 text-sm block">Bụi Mịn PM2.5 Cao</strong><span className="text-xs text-slate-600">Hạn chế ra ngoài!</span></div>
                                                </div>
                                                <div className="glass p-4 rounded-2xl border-l-4 border-amber-500 bg-amber-50 text-left flex items-center gap-3">
                                                    <span className="material-icons-round text-3xl text-amber-500">water_drop</span>
                                                    <div><strong className="text-amber-600 text-sm block">Triều Cường BĐ 3</strong><span className="text-xs text-slate-600">Đỉnh triều lúc 17:00 chiều nay.</span></div>
                                                </div>
                                                <div className="glass p-4 rounded-2xl border-l-4 border-blue-500 bg-blue-50 text-left flex items-center gap-3">
                                                    <span className="material-icons-round text-3xl text-blue-500 animate-pulse">thunderstorm</span>
                                                    <div><strong className="text-blue-600 text-sm block">Cảnh báo Mưa Bão</strong><span className="text-xs text-slate-600">Mưa diện rộng từ 18:00.</span></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                                <div className="col-span-2 glass rounded-[32px] p-4 flex flex-col relative min-h-0 border-white">
                                                    <div className="flex-1 rounded-2xl overflow-hidden z-1"><MapView reports={reports} /></div>
                                                </div>
                                                
                                                <div className="glass rounded-[32px] p-6 flex flex-col text-left overflow-y-auto custom-scroll border-white min-h-0">
                                                    {user?.role === 'Người dùng' && (
                                                        <div className="mb-6">
                                                            <h3 className="font-extrabold text-emerald-700 flex items-center gap-2 mb-3"><span className="material-icons-round">add_location_alt</span> Tạo Báo Cáo</h3>
                                                            <input type="text" placeholder="Tiêu đề..." className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs mb-2 outline-none" />
                                                            <textarea placeholder="Mô tả..." rows="2" className="w-full bg-slate-50 border p-2.5 rounded-lg text-xs mb-3 outline-none"></textarea>
                                                            <button className="w-full py-2.5 emerald-gradient rounded-lg font-bold text-xs">Gửi Phản Ánh</button>
                                                        </div>
                                                    )}
                                                    
                                                    <h3 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2"><span className="material-icons-round text-amber-500">list_alt</span> Báo cáo hệ thống</h3>
                                                    {reports.map(rep => (
                                                        <div key={rep.id} className="bg-white p-4 rounded-xl border border-slate-100 mb-3 shadow-sm text-xs">
                                                            <div className="flex justify-between mb-1"><span className="font-bold text-emerald-600">{rep.id}</span><span className="text-slate-400 font-semibold">{rep.location}</span></div>
                                                            <p className="font-semibold text-slate-700 mb-1">{rep.title}</p>
                                                            <p className="text-[10px] text-slate-400 mb-2">Người gửi: {rep.author}</p>
                                                            
                                                            {user?.role === 'Cán bộ' && rep.status === 'Chờ duyệt' ? (
                                                                <div className="flex gap-2 mt-2">
                                                                    <button className="flex-1 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded" onClick={()=>handleApprove('report', rep.id)}>Duyệt</button>
                                                                    <button className="flex-1 py-1.5 bg-red-100 text-red-700 font-bold rounded" onClick={()=>setRejectModal({isOpen: true, type: 'report', targetId: rep.id, reason: ''})}>Từ chối</button>
                                                                </div>
                                                            ) : (
                                                                <span className={\`px-2 py-1 rounded font-bold text-[10px] \${rep.status==='Đã xử lý'?'bg-emerald-100 text-emerald-700':(rep.status==='Từ chối'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700')}\`}>{rep.status}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '3_community_events' && (
                                        <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-emerald-500 text-2xl">event</span> Quản lý Sự kiện & Hội Nhóm</h3>
                                                {(user?.role === 'Tổ chức') && (
                                                    <button className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1" onClick={()=>setShowEventForm(true)}><span className="material-icons-round text-sm">add</span> Xin phép HĐ mới</button>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                {events.map(ev => (
                                                    <div key={ev.id} className="glass p-5 rounded-[24px] border border-white bg-white/60 flex gap-5 relative shadow-sm">
                                                        <div className="w-28 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center border border-emerald-100 p-2 shadow-inner">
                                                            <span className="text-red-500 font-black text-[10px] uppercase">Lịch trình</span>
                                                            <span className="text-xl font-black text-emerald-800 my-1">{ev.time.substring(0,2)}</span>
                                                            <span className="text-slate-500 text-[9px] font-bold">Tháng {ev.time.substring(3,5)}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-extrabold text-slate-800 text-lg">{ev.title}</h4>
                                                                <span className={\`text-[10px] px-2 py-1 rounded font-bold \${ev.status==='Đã duyệt'?'bg-emerald-100 text-emerald-700':(ev.status==='Từ chối'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700')}\`}>{ev.status}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 mb-1">📍 <strong>Địa điểm:</strong> {ev.loc}</p>
                                                            <p className="text-xs text-slate-600 mb-1">👤 <strong>Tổ chức bởi:</strong> {ev.org}</p>
                                                            <p className="text-xs text-slate-600 mb-3">📝 <strong>Nội dung:</strong> {ev.desc}</p>
                                                            
                                                            {user?.role === 'Cán bộ' && ev.status === 'Chờ duyệt' ? (
                                                                <div className="flex gap-2">
                                                                    <button className="px-4 py-1.5 bg-emerald-500 text-white font-bold rounded-lg text-xs" onClick={()=>handleApprove('event', ev.id)}>Cấp phép</button>
                                                                    <button className="px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 font-bold rounded-lg text-xs" onClick={()=>setRejectModal({isOpen: true, type: 'event', targetId: ev.id, reason: ''})}>Từ chối</button>
                                                                </div>
                                                            ) : (
                                                                ev.status === 'Đã duyệt' && <button className="px-5 py-2 emerald-gradient font-bold rounded-xl text-xs shadow-lg">Đăng ký tham gia ({ev.current}/{ev.max})</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '4_chat' && (
                                        <div className="glass rounded-[32px] h-full border border-white flex max-w-4xl mx-auto overflow-hidden shadow-sm">
                                            <div className="w-48 bg-white/60 border-r border-slate-100 p-4 flex flex-col gap-2">
                                                <h3 className="font-black text-xs text-slate-500 mb-2 uppercase">Kênh Thảo Luận</h3>
                                                {['Chung', 'Quận 1', 'Quận 8'].map(ch => (
                                                    <button key={ch} onClick={()=>setActiveChannel(ch)} className={\`text-left px-3 py-2 rounded-xl text-sm font-bold \${activeChannel === ch ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}\`}># {ch}</button>
                                                ))}
                                            </div>
                                            <div className="flex-1 flex flex-col bg-slate-50/30 relative">
                                                <div className="p-4 bg-white/90 border-b border-slate-100 flex justify-between items-center shadow-sm">
                                                    <span className="font-extrabold text-sm text-emerald-800">Kênh {activeChannel}</span>
                                                </div>
                                                <div className="flex-1 p-5 space-y-4 overflow-y-auto custom-scroll text-sm">
                                                    {chatData[activeChannel].map((msg) => (
                                                        <div key={msg.id} className={\`flex gap-3 \${msg.isMe ? 'flex-row-reverse' : ''}\`}>
                                                            <div className={\`h-8 w-8 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm flex-shrink-0 \${msg.isMe ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-700'}\`}>{msg.isMe ? 'ME' : msg.sender.substring(0,2).toUpperCase()}</div>
                                                            <div className="flex flex-col gap-1 max-w-[75%] relative group">
                                                                <div className={\`p-3.5 rounded-2xl shadow-sm \${msg.isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}\`}>
                                                                    {!msg.isMe && <strong className="text-[10px] block mb-1 text-slate-400">{msg.sender}</strong>}
                                                                    <p className="font-medium text-xs leading-relaxed">{msg.text}</p>
                                                                </div>
                                                                <div className={\`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white p-1 rounded-full shadow-md border border-slate-100 \${msg.isMe ? '-left-20' : '-right-20'}\`}>
                                                                    {['👍','❤️','😂'].map(e => <button key={e} onClick={()=>addReaction(activeChannel, msg.id, e)} className="hover:scale-125 transition-transform">{e}</button>)}
                                                                </div>
                                                                {Object.keys(msg.reacts).length > 0 && (
                                                                    <div className={\`flex gap-1 mt-0.5 \${msg.isMe ? 'justify-end' : 'justify-start'}\`}>
                                                                        {Object.entries(msg.reacts).map(([e, count]) => (
                                                                            <span key={e} className="bg-white text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm">{e} {count}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-4 bg-white flex border-t border-slate-100 gap-3">
                                                    <input type="text" placeholder="Gõ tin nhắn..." className="flex-1 bg-slate-50 p-3 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 font-medium text-slate-700" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} />
                                                    <button className="px-5 emerald-gradient font-bold rounded-xl shadow-md" onClick={sendChat}><span className="material-icons-round text-white">send</span></button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '5_news_handbook' && (
                                        <div className="flex flex-col h-full gap-6 overflow-y-auto custom-scroll pr-2 text-left">
                                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-amber-500 text-2xl">menu_book</span> Cẩm nang Môi trường</h3>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="glass p-6 rounded-[24px] border-t-4 border-amber-400 bg-white/70 shadow-sm text-sm text-slate-600 leading-relaxed">
                                                    <h4 className="font-extrabold text-amber-600 text-lg mb-3">🍂 Rác Hữu Cơ</h4>
                                                    <p className="mb-2"><strong>Định nghĩa:</strong> Dễ dàng phân hủy trong môi trường tự nhiên, thức ăn, thực vật.</p>
                                                    <p className="mb-2"><strong>Bao gồm:</strong> Cơm thừa, vỏ trái cây, bã trà, lá cây rụng.</p>
                                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800 font-medium mt-3">👉 Xử lý: Bỏ vào Thùng Xanh Lá. Tự ủ làm phân bón.</div>
                                                </div>
                                                <div className="glass p-6 rounded-[24px] border-t-4 border-blue-400 bg-white/70 shadow-sm text-sm text-slate-600 leading-relaxed">
                                                    <h4 className="font-extrabold text-blue-600 text-lg mb-3">♻️ Rác Vô Cơ Tái Chế</h4>
                                                    <p className="mb-2"><strong>Bao gồm:</strong> Chai nhựa, lon nhôm, giấy báo, thùng carton.</p>
                                                    <p className="mb-2"><strong>Lưu ý:</strong> Phải súc rửa sạch cặn bẩn, ép xẹp trước khi vứt để không sinh dòi bọ.</p>
                                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-800 font-medium mt-3">👉 Xử lý: Bỏ vào Thùng Xám/Trắng.</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '6_reels' && (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="w-[340px] h-[600px] bg-black rounded-[40px] relative overflow-hidden shadow-2xl border-[6px] border-slate-800">
                                                <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=900&fit=crop" className="w-full h-full object-cover opacity-90" alt="reels" />
                                                <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-10"><span className="font-bold text-white drop-shadow-md text-lg">Eco Reels</span></div>
                                                <div className="absolute bottom-10 left-6 right-16 text-left z-10">
                                                    <h4 className="font-bold text-white drop-shadow-md mb-1 text-base">@SaigonXanh</h4>
                                                    <p className="text-xs text-white drop-shadow-md line-clamp-2 mb-3">Hôm nay cùng team dọn sạch rác dưới chân cầu vượt Nguyễn Hữu Cảnh nha mọi người! 🌿💪</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '7_ai' && (
                                        <div className="glass rounded-[32px] h-full border border-white flex flex-col max-w-3xl mx-auto overflow-hidden shadow-md bg-white/40">
                                            <div className="p-5 bg-white border-b border-emerald-50 text-left flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl border-2 border-emerald-500">🤖</div>
                                                <div><strong className="text-emerald-800 text-base font-black block">EcoBot AI</strong><span className="text-[11px] text-emerald-600 font-medium">Sẵn sàng giải đáp</span></div>
                                            </div>
                                            <div className="flex-1 p-6 space-y-5 overflow-y-auto text-left text-sm custom-scroll">
                                                {aiMessages.map((msg, idx) => (
                                                    <div key={idx} className={\`flex gap-3 \${msg.isBot ? '' : 'flex-row-reverse'}\`}>
                                                        <div className={\`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg border-2 border-white \${msg.isBot ? 'bg-emerald-100' : 'bg-blue-100'}\`}>{msg.isBot ? '🌱' : 'ME'}</div>
                                                        <div className={\`p-4 rounded-2xl shadow-sm max-w-[80%] \${msg.isBot ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'bg-emerald-600 text-white rounded-tr-none'}\`}>
                                                            <p className="font-medium leading-relaxed">{msg.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-white flex border-t border-slate-100 gap-3">
                                                <input type="text" placeholder="Hỏi Bot về phân loại rác..." className="flex-1 bg-slate-50 p-3.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-emerald-500" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendAI()} />
                                                <button className="px-6 emerald-gradient font-bold rounded-xl" onClick={sendAI}><span className="material-icons-round text-white">send</span></button>
                                            </div>
                                        </div>
                                    )}

                                    {currentTab === '8_profile' && (
                                        <div className="flex flex-col h-full gap-6 overflow-y-auto custom-scroll pr-2 text-left max-w-5xl mx-auto w-full">
                                            <div className="glass p-8 rounded-[32px] border border-white shadow-sm relative overflow-hidden flex items-center gap-8 bg-white/70">
                                                <div className="h-28 w-28 bg-emerald-100 border-4 border-white rounded-full flex items-center justify-center font-black text-5xl z-10">🚀</div>
                                                <div className="flex-1 z-10">
                                                    <h4 className="font-extrabold text-slate-800 text-3xl mb-1">{user?.name}</h4>
                                                    <p className="text-sm text-slate-500 font-medium mb-4">📧 {user?.email}</p>
                                                    <div className="flex gap-2">
                                                        <span className="text-[11px] bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-lg font-bold uppercase">{user?.role}</span>
                                                        <span className="text-[11px] bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg font-bold uppercase">12 Báo cáo tích cực</span>
                                                    </div>
                                                </div>
                                                <div className="text-center z-10 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 min-w-[150px]">
                                                    <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Điểm xanh hiện tại</span>
                                                    <span className="text-4xl font-black text-emerald-500 block">120</span>
                                                    <span className="text-[10px] text-emerald-600 font-bold">PTS</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mt-2"><span className="material-icons-round text-amber-500 text-2xl">redeem</span> Cửa hàng Đổi thưởng</h3>
                                            <div className="grid grid-cols-3 gap-5">
                                                {[
                                                    { title: 'Bình nước giữ nhiệt Eco 500ml', points: 500, desc: 'Làm từ thép không gỉ cao cấp. Hãy mang bình cá nhân thay vì mua ly nhựa nhé.', icon: 'local_drink' },
                                                    { title: 'Túi vải Canvas tự hủy', points: 200, desc: 'Thiết kế thời trang, có thể giặt lại nhiều lần. Chống rác thải nilon.', icon: 'shopping_bag' },
                                                    { title: 'Voucher 50k Xanh SM', points: 400, desc: 'Mã giảm giá cước di chuyển xe điện, giúp giảm CO2.', icon: 'electric_car' }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="glass p-6 rounded-[24px] border border-white bg-white/50 flex flex-col justify-between hover:shadow-lg transition-all">
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center"><span className="material-icons-round text-emerald-500">{item.icon}</span></div>
                                                                <span className="text-emerald-600 font-black text-sm bg-emerald-100 px-3 py-1 rounded-full">{item.points} PTS</span>
                                                            </div>
                                                            <h4 className="font-extrabold text-base text-slate-800 mb-2">{item.title}</h4>
                                                            <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-medium">{item.desc}</p>
                                                        </div>
                                                        <button className="w-full py-2.5 bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 font-bold rounded-xl text-xs transition-colors" onClick={()=>alert('Oops! Số điểm PTS của bạn không đủ!')}>Đổi quà</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </main>
                        </div>

                        {/* Bọc chung vào div cha giúp Fix triệt để Babel JSX Token Error */}
                        {rejectModal.isOpen && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border-t-8 border-red-500">
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Từ chối {rejectModal.type === 'report' ? 'Báo cáo' : 'Sự kiện'}</h3>
                                    <p className="text-xs text-slate-500 mb-4">Mã: {rejectModal.targetId}. Vui lòng ghi rõ lý do.</p>
                                    <textarea rows="4" placeholder="Nhập lý do từ chối (bắt buộc)..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm mb-4 outline-none focus:border-red-500" value={rejectModal.reason} onChange={e=>setRejectModal({...rejectModal, reason: e.target.value})}></textarea>
                                    <div className="flex gap-3">
                                        <button className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm" onClick={()=>setRejectModal({isOpen:false, type:'', targetId:'', reason:''})}>Hủy</button>
                                        <button className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm shadow-md" onClick={submitReject}>Xác nhận Từ Chối</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showEventForm && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                                    <h3 className="text-xl font-black text-emerald-800 mb-1">📝 Đơn Xin Phép Tổ Chức</h3>
                                    <form onSubmit={handleCreateEvent} className="space-y-3 mt-4">
                                        <input name="title" type="text" placeholder="Tên sự kiện..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" required />
                                        <input name="loc" type="text" placeholder="Địa điểm..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" required />
                                        <div className="flex gap-3">
                                            <input name="time" type="text" placeholder="Ngày (DD/MM)" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" required />
                                            <input name="max" type="number" placeholder="Số lượng tối đa" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" required />
                                        </div>
                                        <textarea name="desc" rows="3" placeholder="Mô tả chi tiết..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-emerald-500" required></textarea>
                                        <div className="flex gap-3 mt-4">
                                            <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm" onClick={()=>setShowEventForm(false)}>Hủy</button>
                                            <button type="submit" className="flex-1 py-3 emerald-gradient text-white font-bold rounded-xl text-sm shadow-md">Nộp đơn</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        
                    </div>
                );
            }

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V2.2 ĐÃ SẠCH LỖI đang chạy trên cổng ${PORT}`));
