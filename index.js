/**
 * 🌱 ECOCONNECT HCM - BẢN V2.1 MASTERPIECE (RESTORED AUTH & OTP)
 * - Khôi phục TOÀN BỘ Form Đăng ký, Đăng nhập chi tiết chuẩn thiết kế Light Theme.
 * - Tích hợp đầy đủ logic gửi yêu cầu OTP và xử lý mã Fallback OTP phòng lỗi Render chặn mail.
 * - Giữ nguyên: Hệ thống biểu đồ Real-time, Pie Chart, Phòng chat, Trợ lý AI EcoBot, Phê duyệt sự cố...
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
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin nha ní!' });
    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') return res.status(400).json({ success: false, message: 'Mã xác nhận Cán bộ không đúng! (Thử mã: ADMIN123)' });
    if (users.some(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email này đã được đăng ký rồi bro!' });

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; 
    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    const mailOptions = {
        from: `"EcoConnect HCM" <peterbis0901@gmail.com>`, 
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký Tài Khoản',
        html: `<p>Mã OTP đăng ký tài khoản EcoConnect của bạn là: <strong>${otpCode}</strong></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mã OTP đã gửi đi thành công! Check mail nha ní.' });
    } catch (error) {
        // Vượt rào tường lửa Render chặn gửi Mail - Cung cấp mã OTP trực tiếp để test luôn
        res.status(200).json({ 
            success: true, 
            message: 'Tường lửa Render đang chặn gửi Mail thật. Tui đưa luôn mã OTP cho ní test nè!', 
            fallbackOtp: otpCode 
        });
    }
});

app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];
    if (!session || Date.now() > session.expires) return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn rồi bro!' });
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Mã OTP nhập vào chưa đúng rồi ní!' });

    users.push(session.userData);
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Đăng ký tài khoản thành công tốt đẹp!' });
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
                const [authTab, setAuthTab] = React.useState('register'); // 'register' hoặc 'login'
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                const [currentTab, setCurrentTab] = React.useState('1_dashboard'); 
                
                // State xác thực & quản lý form đăng ký nâng cao
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', adminCode: '', terms: false });
                const [showTerms, setShowTerms] = React.useState(false);
                const [showOtpModal, setShowOtpModal] = React.useState(false);
                const [otpInput, setOtpInput] = React.useState('');
                const [loading, setLoading] = React.useState(false);
                const [targetEmail, setTargetEmail] = React.useState('');
                const [fallbackOtpAlert, setFallbackOtpAlert] = React.useState('');

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

                // Xử lý chuyển tab chế độ Auth
                const switchAuth = (tab) => {
                    setAuthTab(tab);
                    setOtpInput('');
                    setFormData({ name: '', email: '', password: '', adminCode: '', terms: false });
                    setFallbackOtpAlert('');
                };

                // Gửi yêu cầu đăng ký
                const handleRegisterRequest = async (e) => {
                    e.preventDefault();
                    if(!formData.name || !formData.email || !formData.password) return alert("Điền đủ thông tin nha ní!");
                    if(!formData.terms) return alert("Ní phải đồng ý với Điều khoản sử dụng!");

                    setLoading(true);
                    try {
                        const res = await fetch('/api/auth/register-request', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({...formData, role: currentRole})
                        });
                        const data = await res.json();
                        setLoading(false);

                        if(data.success) {
                            setTargetEmail(formData.email);
                            setShowOtpModal(true); 
                            if (data.fallbackOtp) {
                                setFallbackOtpAlert(data.fallbackOtp);
                                setOtpInput(data.fallbackOtp); // Tự điền hộ người dùng mã thử nghiệm
                            }
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        setLoading(false);
                        alert("Lỗi kết nối đến máy chủ tổng rồi ní ơi!");
                    }
                };

                // Xác thực mã OTP để đăng ký tài khoản hoàn tất
                const handleVerifyOtp = async (e) => {
                    e.preventDefault();
                    if(!otpInput) return alert("Chưa điền mã OTP ní ơi!");
                    try {
                        const res = await fetch('/api/auth/register-verify', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: targetEmail, code: otpInput })
                        });
                        const data = await res.json();

                        if(data.success) {
                            alert('🎉 Đăng ký thành công tốt đẹp! Tiến thẳng vào hệ thống thôi bro.');
                            setShowOtpModal(false);
                            setUser({ name: formData.name, email: targetEmail, role: currentRole }); 
                            setView('dashboard'); 
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        alert("Lỗi kết nối xác thực mã OTP rồi!");
                    }
                };

                // Xử lý đăng nhập trực tiếp
                const handleLogin = (e) => {
                    e.preventDefault();
                    if(!formData.email || !formData.password) return alert("Nhập đủ Email và Mật khẩu nha ní!");
                    setUser({ name: formData.email.split('@')[0], email: formData.email, role: currentRole });
                    setView('dashboard');
                    alert('👋 Chào mừng ní quay trở lại Trạm Tổng Số!');
                };

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

                // CÁN BỘ & TỔ CHỨC ĐIỀU PHỐI
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
                    alert("Đã nộp đơn xin phép hoạt động tình nguyện!");
                };

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

                // =========================================================================
                // KHÔI PHỤC FULL GIAO DIỆN ĐĂNG KÝ / ĐĂNG NHẬP / XÁC THỰC OTP NGUYÊN BẢN
                // =========================================================================
                if (view === 'auth') return (
                    <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn relative">
                        <div className="glass w-full max-w-[460px] p-8 md:p-10 rounded-[32px] text-center border border-white/80 shadow-2xl">
                            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl mb-4">
                                <span className="material-icons-round text-4xl animate-pulse-leaf">spa</span>
                            </div>
                            <h1 className="text-3xl font-black mb-1 text-emerald-900 tracking-tight">EcoConnect</h1>
                            <p className="text-emerald-700/80 text-xs mb-6 font-medium px-4">{t.slogan}</p>
                            
                            {/* Thanh chọn phân hệ vai trò */}
                            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl mb-5">
                                {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => (
                                    <button key={r} type="button" onClick={() => setCurrentRole(r)} className={\`py-2 text-[11px] font-bold rounded-lg transition-all \${currentRole === r ? 'emerald-gradient shadow-md' : 'text-slate-500 hover:text-slate-800 bg-transparent'}\`}>{r}</button>
                                ))}
                            </div>

                            {/* CHẾ ĐỘ ĐĂNG KÝ TÀI KHOẢN */}
                            {authTab === 'register' && (
                                <form onSubmit={handleRegisterRequest} className="space-y-3.5 text-left animate-fadeIn">
                                    <div>
                                        <input type="text" placeholder="Họ và tên của bạn" className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm transition-all focus:border-emerald-500" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                    </div>
                                    <div>
                                        <input type="email" placeholder="Địa chỉ Email" className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm transition-all focus:border-emerald-500" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                    </div>
                                    <div>
                                        <input type="password" placeholder="Mật khẩu bảo mật" className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm transition-all focus:border-emerald-500" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                    </div>
                                    
                                    {currentRole === 'Cán bộ' && (
                                        <div className="animate-fadeIn">
                                            <input type="text" placeholder="Mã xác nhận thẩm quyền (VD: ADMIN123)" className="w-full bg-emerald-50/50 border border-emerald-300 p-3.5 rounded-xl text-sm font-bold text-emerald-800 placeholder-emerald-400" onChange={e => setFormData({...formData, adminCode: e.target.value})} value={formData.adminCode} required />
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2 pt-1 text-[12px] text-slate-500 leading-tight">
                                        <input type="checkbox" id="policy" className="mt-0.5 accent-emerald-600 h-4 w-4 rounded" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                        <label htmlFor="policy">Tôi đã đọc kỹ và hoàn toàn đồng ý tuân thủ các điều khoản trong <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>Chính sách & Quy chế Sử dụng</span> của cộng đồng.</label>
                                    </div>

                                    <button type="submit" className="w-full py-4 mt-2 emerald-gradient rounded-2xl font-bold uppercase text-sm tracking-wider shadow-lg flex justify-center items-center gap-2 transition-all hover:opacity-90" disabled={loading}>
                                        {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Đăng Ký Tài Khoản'}
                                    </button>
                                    
                                    <p className="text-xs text-slate-400 text-center pt-2">Đã là thành viên của hành tinh xanh? <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => switchAuth('login')}>Đăng nhập ngay</span></p>
                                </form>
                            )}

                            {/* CHẾ ĐỘ ĐĂNG NHẬP HỆ THỐNG */}
                            {authTab === 'login' && (
                                <form onSubmit={handleLogin} className="space-y-4 text-left animate-fadeIn pt-2">
                                    <div>
                                        <input type="email" placeholder="Địa chỉ Email của bạn" className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm transition-all focus:border-emerald-500" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                    </div>
                                    <div>
                                        <input type="password" placeholder="Mật khẩu tài khoản" className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm transition-all focus:border-emerald-500" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                    </div>

                                    <button type="submit" className="w-full py-4 mt-2 emerald-gradient rounded-2xl font-bold uppercase text-sm tracking-wider shadow-lg transition-all hover:opacity-90">Tiến Vào Hệ Thống</button>
                                    
                                    <p className="text-xs text-slate-400 text-center pt-2">Lần đầu tiên đến với EcoConnect? <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => switchAuth('register')}>Đăng ký tài khoản mới</span></p>
                                </form>
                            )}

                            <div className="mt-4 text-[11px] font-bold text-emerald-600/70 cursor-pointer hover:underline" onClick={()=>setShowTerms(true)}>📜 Quy chế bảo mật & Điều khoản sử dụng hành tinh xanh</div>
                        </div>

                        {/* MODAL HỘP THOẠI XÁC THỰC MÃ OTP ĐA NĂNG */}
                        {showOtpModal && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-[400px] border border-emerald-100 shadow-2xl text-center">
                                    <span className="material-icons-round text-4xl text-emerald-500 mb-2">mark_email_read</span>
                                    <h3 className="text-lg font-black text-slate-800">Xác Thực Mã Kích Hoạt OTP</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-4">Một mã xác thực bảo mật đã được gửi đến hộp thư <strong className="text-slate-800">{targetEmail}</strong></p>
                                    
                                    {fallbackOtpAlert && (
                                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded-xl p-3 mb-4 text-left leading-normal animate-fadeIn">
                                            <p className="text-amber-600 font-bold flex items-center gap-1 mb-1"><span className="material-icons-round text-sm">security_update_warning</span> TƯỜNG LỬA RENDER ĐANG CHẶN MAIL THẬT:</p>
                                            Hệ thống đã tự động cấp mã OTP dùng thử siêu tốc bên dưới để ní test tính năng không lo bị gián đoạn: <br/>
                                            <span className="text-base font-black text-center block tracking-widest mt-1 text-emerald-700 bg-emerald-50 p-1 rounded-lg border border-emerald-200 select-all">{fallbackOtpAlert}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                                        <input type="text" placeholder="Nhập 6 ký tự mã OTP" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center text-lg font-extrabold tracking-widest uppercase focus:border-emerald-500" maxLength="6" onChange={e => setOtpInput(e.target.value)} value={otpInput} required />
                                        <div className="flex gap-2">
                                            <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs transition-all hover:bg-slate-200" onClick={() => setShowOtpModal(false)}>Hủy bỏ</button>
                                            <button type="submit" className="flex-1 py-3 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md transition-all hover:opacity-90">Xác thực OTP</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* MODAL CHÍNH SÁCH VÀ ĐIỀU KHOẢN ĐẦY ĐỦ KHÔNG MẤT 1 CHỮ */}
                        {showTerms && (
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white w-full max-w-[480px] rounded-3xl p-6 shadow-2xl border border-slate-100 text-left flex flex-col max-h-[85vh]">
                                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                        <h3 className="text-base font-black text-emerald-800 flex items-center gap-2"><span className="material-icons-round">gavel</span> Điều Khoản Quy Chế Cộng Đồng</h3>
                                        <span className="material-icons-round text-slate-400 cursor-pointer hover:text-slate-800" onClick={() => setShowTerms(false)}>close</span>
                                    </div>
                                    <div className="space-y-3.5 text-xs text-slate-600 overflow-y-auto pr-2 custom-scroll leading-relaxed flex-1">
                                        <p><strong className="text-emerald-700">1. Mục đích hoạt động:</strong> EcoConnect HCM hoạt động phi lợi nhuận nhằm số hóa công tác phản ánh môi trường, điều phối tình nguyện xanh bảo vệ thành phố xanh - sạch - đẹp.</p>
                                        <p><strong className="text-emerald-700">2. Bảo mật thông tin:</strong> Toàn bộ định vị sự cố, danh tính của ní và email đăng ký sẽ được mã hóa an toàn tuyệt đối trên máy chủ, cam kết không bán dữ liệu cho bất kỳ bên thứ ba.</p>
                                        <p><strong className="text-red-600">3. Quy định hành vi & Chế tài:</strong> Nghiêm cấm dùng từ ngữ xúc phạm, tục tĩu hoặc spam báo cáo rác gây nghẽn đường truyền. Tài khoản cố tình phá hoại sẽ bị <strong className="text-red-700">KHÓA TÀI KHOẢN VĨNH VIỄN</strong> và chuyển log IP đến cơ quan chức năng.</p>
                                    </div>
                                    <button className="w-full mt-4 py-3 emerald-gradient font-bold rounded-xl text-xs shadow-md flex-shrink-0 transition-all hover:opacity-90" onClick={() => setShowTerms(false)}>Tôi Đã Hiểu Và Đồng Ý</button>
                                </div>
                            </div>
                        )}
                    </div>
                );

                // =========================================================================
                // GIAO DIỆN TRANG CHỦ DASHBOARD FULL CHỨC NĂNG CỦA BẢN V2.1 FIXED
                // =========================================================================
                const menuItems = [
                    { id: '1_dashboard', name: t.t1, icon: 'dashboard' },
                    { id: '2_map_alerts', name: t.t2, icon: 'map' },
                    { id: '3_community_events', name: t.t3, icon: 'groups' },
                    { id: '4_chat_live', name: t.t4, icon: 'forum' },
                    { id: '5_news_handbook', name: t.t5, icon: 'menu_book' },
                    { id: '6_reels', name: t.t6, icon: 'play_circle' },
                    { id: '7_ai', name: t.t7, icon: 'smart_toy' },
                    { id: '8_profile', name: t.t8, icon: 'redeem' }
                ];

                return (
                    <div className="h-screen flex bg-[#f0fdf4] overflow-hidden">
                        {/* SIDEBAR TẢI TRẠM TỔNG SỐ */}
                        <aside className="w-72 glass m-4 mr-0 rounded-[32px] p-5 flex flex-col shadow-sm min-h-0">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100 flex-shrink-0">
                                <span className="material-icons-round text-emerald-600 text-3xl animate-pulse-leaf">spa</span>
                                <div>
                                    <h1 className="text-base font-black text-slate-800 tracking-tight">EcoConnect HCM</h1>
                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">V2.1 Masterpiece</span>
                                </div>
                            </div>

                            <nav className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scroll">
                                {menuItems.map(item => (
                                    <button key={item.id} onClick={() => setCurrentTab(item.id)} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left \${currentTab === item.id ? 'emerald-gradient shadow-md' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}\`}>
                                        <span className="material-icons-round text-lg">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="bg-white/60 p-3 rounded-2xl text-center text-[10px] text-slate-400 border border-white mt-4 flex-shrink-0 font-medium">🌍 Đánh thức mầm xanh - Chữa lành Trái Đất</div>
                        </aside>

                        {/* MAIN CONTAINER */}
                        <main className="flex-1 p-4 flex flex-col h-screen overflow-hidden">
                            <header className="glass rounded-2xl p-4 mb-4 flex justify-between items-center border border-white shadow-sm flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="material-icons-round text-emerald-600 text-xl">shield</span>
                                    <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">{t.welcome} <span className="text-emerald-600 font-black">{user?.name} ({user?.role})</span></h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50 transition-all">🌐 {lang.toUpperCase()}</button>
                                    <button onClick={() => { setUser(null); setView('auth'); }} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all shadow-sm flex items-center justify-center"><span className="material-icons-round text-sm">logout</span></button>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto pr-1 custom-scroll min-h-0">
                                
                                {/* TAB 1: TỔNG QUAN HỆ THỐNG */}
                                {currentTab === '1_dashboard' && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="glass p-5 rounded-2xl border border-white flex items-center gap-4 shadow-sm"><span className="material-icons-round text-3xl text-emerald-600">nature_people</span><div><h3 className="text-xs text-slate-400 font-bold">Điểm xanh tích lũy</h3><p className="text-2xl font-black text-slate-800">1,240 <span className="text-xs text-emerald-600">PTS</span></p></div></div>
                                            <div className="glass p-5 rounded-2xl border border-white flex items-center gap-4 shadow-sm"><span className="material-icons-round text-3xl text-blue-500">campaign</span><div><h3 className="text-xs text-slate-400 font-bold">Sự cố môi trường</h3><p className="text-2xl font-black text-slate-800">{reports.length} vụ</p></div></div>
                                            <div className="glass p-5 rounded-2xl border border-white flex items-center gap-4 shadow-sm"><span className="material-icons-round text-3xl text-amber-500">event_available</span><div><h3 className="text-xs text-slate-400 font-bold">Chiến dịch xanh</h3><p className="text-2xl font-black text-slate-800">{events.filter(e=>e.status==='Đã duyệt').length} trận</p></div></div>
                                            <div className="glass p-5 rounded-2xl border border-white flex items-center gap-4 shadow-sm"><span className="material-icons-round text-3xl text-teal-500">air</span><div><h3 className="text-xs text-slate-400 font-bold">Chỉ số bụi PM2.5</h3><p className="text-2xl font-black text-teal-600">38 μg/m³</p></div></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="glass p-5 rounded-2xl border border-white md:col-span-2 h-64 flex flex-col shadow-sm"><h4 className="text-xs font-black text-slate-700 uppercase mb-4 tracking-wider">Đồ thị AQI Thành Phố (Real-time)</h4><div className="flex-1 min-h-0"><RealtimeChart /></div></div>
                                            <div className="glass p-5 rounded-2xl border border-white h-64 flex flex-col shadow-sm"><h4 className="text-xs font-black text-slate-700 uppercase mb-4 tracking-wider">Cơ cấu rác thu gom</h4><div className="flex-1 min-h-0"><WastePieChart /></div></div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: BẢN ĐỒ SỰ CỐ & PHÊ DUYỆT */}
                                {currentTab === '2_map_alerts' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-140px)] animate-fadeIn">
                                        <div className="md:col-span-2 glass rounded-3xl p-2 border border-white relative shadow-sm h-full"><MapView reports={reports} /></div>
                                        <div className="glass rounded-3xl p-4 border border-white flex flex-col h-full shadow-sm">
                                            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-1.5"><span className="material-icons-round text-emerald-600">list_alt</span> Danh sách Sự cố môi trường</h3>
                                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
                                                {reports.map((rep) => (
                                                    <div key={rep.id} className="p-3 bg-white/90 rounded-2xl border border-slate-100 shadow-sm text-xs">
                                                        <div className="flex justify-between mb-1"><span className="font-bold text-emerald-600">{rep.id}</span><span className="text-slate-400 font-semibold">{rep.location}</span></div>
                                                        <p className="font-semibold text-slate-700 mb-1">{rep.title}</p>
                                                        <p className="text-[10px] text-slate-400 mb-2">Người gửi: {rep.author}</p>
                                                        {user?.role === 'Cán bộ' && rep.status === 'Chờ duyệt' ? (
                                                            <div className="flex gap-2 mt-2">
                                                                <button className="flex-1 py-1.5 bg-emerald-100 text-emerald-700 font-bold rounded" onClick={()=>handleApprove('report', rep.id)}>Duyệt</button>
                                                                <button className="flex-1 py-1.5 bg-red-100 text-red-700 font-bold rounded" onClick={()=>setRejectModal({isOpen: true, type: 'report', targetId: rep.id, reason: ''})}>Từ chối</button>
                                                            </div>
                                                        ) : (
                                                            <span className={\`px-2 py-1 rounded font-bold text-[10px] \` + (rep.status === 'Đã xử lý' ? 'bg-emerald-100 text-emerald-700' : rep.status === 'Từ chối' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>{rep.status}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: CỘNG ĐỒNG & CHIẾN DỊCH TÌNH NGUYỆN */}
                                {currentTab === '3_community_events' && (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Chiến dịch tình nguyện vì Hành Tinh</h3>
                                            {user?.role === 'Tổ chức' && <button className="px-4 py-2.5 emerald-gradient font-bold text-xs rounded-xl shadow-md flex items-center gap-1" onClick={()=>setShowEventForm(true)}><span className="material-icons-round text-sm">add</span>Đăng ký chiến dịch</button>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {events.map((ev) => (
                                                <div key={ev.id} className="glass p-5 rounded-3xl border border-white shadow-sm flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2"><h4 className="font-extrabold text-slate-800 text-sm">{ev.title}</h4><span className={\`px-2 py-0.5 rounded text-[10px] font-black \` + (ev.status === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{ev.status}</span></div>
                                                        <p className="text-xs text-slate-500 mb-3 font-medium">{ev.desc}</p>
                                                        <div className="space-y-1 text-slate-400 text-[11px] font-semibold"><div>📍 Địa điểm: {ev.loc}</div><div>⏰ Thời gian: {ev.time}</div><div>👥 Tổ chức: {ev.org}</div></div>
                                                    </div>
                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"><span className="text-[11px] font-bold text-slate-500">Lực lượng: {ev.current}/{ev.max} người</span>{ev.status === 'Đã duyệt' && <button className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all" onClick={()=>alert('🎉 Đăng ký tham gia thành công!')}>Tham gia</button>}{user?.role === 'Cán bộ' && ev.status === 'Chờ duyệt' && <div className="flex gap-2"><button className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded text-xs" onClick={()=>handleApprove('event', ev.id)}>Duyệt</button><button className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded text-xs" onClick={()=>setRejectModal({isOpen: true, type: 'event', targetId: ev.id, reason: ''})}>Từ chối</button></div>}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: PHÒNG CHAT TRỰC TUYẾN */}
                                {currentTab === '4_chat_live' && (
                                    <div className="glass rounded-3xl h-[calc(100vh-140px)] border border-white flex shadow-sm overflow-hidden animate-fadeIn">
                                        <div className="w-48 border-r border-slate-100 bg-white/40 p-3 flex flex-col gap-1 flex-shrink-0">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 px-2">Kênh Khu Vực</span>
                                            {Object.keys(chatData).map(ch => (
                                                <button key={ch} onClick={() => setActiveChannel(ch)} className={\`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all \` + (activeChannel === ch ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-50')\`}># {ch}</button>
                                            ))}
                                        </div>
                                        <div className="flex-1 flex flex-col bg-slate-50/30 relative">
                                            <div className="p-4 bg-white/90 border-b border-slate-100 flex justify-between items-center shadow-sm"><span className="font-extrabold text-sm text-emerald-800">Kênh {activeChannel}</span></div>
                                            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll text-sm">
                                                {chatData[activeChannel].map((msg) => (
                                                    <div key={msg.id} className={\`flex gap-2 \${msg.isMe ? 'flex-row-reverse' : ''}\`}>
                                                        <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">{msg.isMe ? 'ME' : msg.sender.substring(0,2).toUpperCase()}</div>
                                                        <div className="max-w-xs">
                                                            <div className="text-[10px] text-slate-400 font-bold mb-0.5">{msg.sender}</div>
                                                            <div className={\`p-3 rounded-2xl text-xs font-medium shadow-sm \` + (msg.isMe ? 'emerald-gradient rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none')}>{msg.text}</div>
                                                            <div className="flex gap-1.5 mt-1">{['❤️', '👍', '🌱'].map(emo => <button key={emo} onClick={()=>addReaction(activeChannel, msg.id, emo)} className="text-[11px] bg-white border border-slate-100 px-1.5 py-0.5 rounded-full hover:scale-110 transition-all">{emo} {msg.reacts[emo] || 0}</button>)}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0"><input type="text" placeholder="Gõ tin nhắn xanh..." className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-xs" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} /><button onClick={sendChat} className="px-4 py-2.5 emerald-gradient font-bold rounded-xl text-xs shadow-md">Gửi</button></div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: TIN TỨC & CẨM NANG PHÂN LOẠI RÁC */}
                                {currentTab === '5_news_handbook' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                        <div className="glass p-5 rounded-3xl border border-white shadow-sm space-y-4">
                                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider text-emerald-700 flex items-center gap-1"><span className="material-icons-round">menu_book</span> Cẩm nang xanh phân loại rác nguồn</h3>
                                            <div className="space-y-2 text-xs text-slate-600 font-medium">
                                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">🍏 <strong>Rác hữu cơ sinh hủy:</strong> Thức ăn thừa, rau củ quả hư, lá cây. Xử lý thành phân bón compost hữu cơ. Thùng chứa: <strong>Thùng Xanh Lá</strong>.</div>
                                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">🧴 <strong>Rác vô cơ tái chế:</strong> Chai nhựa, lon nhôm, giấy carton, túi nilon sạch. Gom gửi các trạm thu đổi quà. Thùng chứa: <strong>Thùng Trắng/Xám</strong>.</div>
                                            </div>
                                        </div>
                                        <div className="glass p-5 rounded-3xl border border-white shadow-sm space-y-3">
                                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider text-emerald-700 flex items-center gap-1"><span className="material-icons-round">newspaper</span> Tin tức môi trường mới nhất</h3>
                                            <div className="p-3 bg-white/80 rounded-2xl border border-slate-100 shadow-sm text-xs"><h4 className="font-bold text-slate-800 mb-1">TP.HCM nhân rộng mô hình đổi rác tái chế nhận cây xanh</h4><p className="text-[11px] text-slate-400 font-medium">Chiến dịch thu hút hơn 10.000 lượt người tham gia chỉ trong tuần đầu tiên ra quân.</p></div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 6: ECO REELS (VIDEO NGẮN) */}
                                {currentTab === '6_reels' && (
                                    <div className="flex justify-center items-center h-[calc(100vh-140px)] animate-fadeIn">
                                        <div className="w-[280px] h-[480px] bg-black rounded-[32px] relative overflow-hidden shadow-2xl border-[6px] border-slate-800 flex flex-col justify-between p-4">
                                            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                                            <div className="relative z-10 flex justify-between items-center text-white"><span className="text-[10px] font-black uppercase tracking-widest bg-emerald-600 px-2 py-0.5 rounded-full">Eco Reels</span><span className="material-icons-round text-sm">volume_up</span></div>
                                            <div className="relative z-10 text-white space-y-1"><p className="text-xs font-black">@GreenLife_HCM</p><p className="text-[11px] font-medium opacity-90">Hướng dẫn làm chậu cây từ vỏ chai nhựa cũ siêu dễ thương 🪴🌱</p></div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 7: AI ECOBOT TRỢ LÝ MÔI TRƯỜNG */}
                                {currentTab === '7_ai' && (
                                    <div className="glass rounded-3xl h-[calc(100vh-140px)] border border-white flex flex-col overflow-hidden shadow-sm animate-fadeIn max-w-2xl mx-auto">
                                        <div className="p-4 bg-white/90 border-b border-slate-100 flex items-center gap-2 shadow-sm"><span className="material-icons-round text-emerald-600">smart_toy</span><div><h3 className="font-black text-sm text-slate-800">Trợ Lý Ảo Quốc Tế EcoBot AI</h3><span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">Trực Tuyến</span></div></div>
                                        <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll">
                                            {aiMessages.map((m, i) => (
                                                <div key={i} className={\`flex gap-2 \${m.isBot ? '' : 'flex-row-reverse'}\`}>
                                                    <div className={\`h-7 w-7 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm flex-shrink-0 \` + (m.isBot ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white')}>{m.isBot ? 'BOT' : 'ME'}</div>
                                                    <div className={\`p-3 rounded-2xl text-xs font-medium max-w-md shadow-sm \` + (m.isBot ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'emerald-gradient rounded-tr-none')}>{m.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 flex-shrink-0"><input type="text" placeholder="Hỏi EcoBot về phân loại rác, pin cũ..." className="flex-1 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-medium" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendAI()} /><button onClick={sendAI} className="px-4 py-2.5 emerald-gradient font-bold rounded-xl text-xs shadow-md">Hỏi AI</button></div>
                                    </div>
                                )}

                                {/* TAB 8: QUẢN LÝ CÁ NHÂN & ĐỔI QUÀ TÍCH ĐIỂM */}
                                {currentTab === '8_profile' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                                        <div className="glass p-5 rounded-3xl border border-white text-center shadow-sm">
                                            <div className="h-16 w-16 bg-emerald-500 text-white font-black text-2xl rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">{user?.name?.substring(0,2).toUpperCase()}</div>
                                            <h4 className="font-extrabold text-slate-800 text-base">{user?.name}</h4>
                                            <p className="text-xs text-slate-400 font-semibold mb-3">📧 {user?.email}</p>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">{user?.role}</span>
                                        </div>
                                        <div className="md:col-span-2 glass p-5 rounded-3xl border border-white shadow-sm">
                                            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-1"><span className="material-icons-round">military_tech</span> Cửa hàng Đổi Quà Tích Điểm Xanh</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="p-3 bg-white/90 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm"><div className="text-xs"><p className="font-bold text-slate-800">Chậu Sen Đá Mini</p><p className="text-[10px] text-slate-400 font-semibold">Đổi đời sống xanh</p></div><button className="px-3 py-1.5 emerald-gradient text-[10px] font-black rounded-xl shadow" onClick={()=>alert('Ní chưa đủ điểm tích lũy đổi quà nha!')}>150 PTS</button></div>
                                                <div className="p-3 bg-white/90 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm"><div className="text-xs"><p className="font-bold text-slate-800">Bình Nước Thủy Tinh</p><p className="text-[10px] text-slate-400 font-semibold">Hạn chế rác nhựa</p></div><button className="px-3 py-1.5 emerald-gradient text-[10px] font-black rounded-xl shadow" onClick={()=>alert('Ní chưa đủ điểm tích lũy đổi quà nha!')}>300 PTS</button></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </main>

                        {/* MODAL TỪ CHỐI DUYỆT SỰ CỐ / SỰ KIỆN CỦA CÁN BỘ */}
                        {rejectModal.isOpen && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white rounded-3xl p-5 w-full max-w-[400px] border border-slate-100 shadow-2xl">
                                    <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-1"><span className="material-icons-round text-red-500">gavel</span> Lý do từ chối phê duyệt</h3>
                                    <textarea rows="3" placeholder="Ghi nhận lý do từ chối cụ thể để phản hồi cho người gửi..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:border-red-500" value={rejectModal.reason} onChange={e=>setRejectModal({...rejectModal, reason: e.target.value})} required></textarea>
                                    <div className="flex gap-2 mt-4">
                                        <button className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={()=>setRejectModal({isOpen: false, type: '', targetId: '', reason: ''})}>Hủy</button>
                                        <button className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md" onClick={submitReject}>Xác nhận từ chối</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODAL FORM TẠO SỰ KIỆN CỦA TỔ CHỨC */}
                        {showEventForm && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-[440px] border border-slate-100 shadow-2xl">
                                    <h3 className="text-sm font-black text-emerald-800 mb-4 flex items-center gap-1"><span className="material-icons-round">playlist_add</span> Xin phép hoạt động tình nguyện mới</h3>
                                    <form onSubmit={handleCreateEvent} className="space-y-3">
                                        <input name="title" type="text" placeholder="Tên chiến dịch tình nguyện..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" required />
                                        <input name="loc" type="text" placeholder="Địa điểm tập trung tổ chức..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" required />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input name="time" type="text" placeholder="Thời gian (VD: 25/06/2026)" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" required />
                                            <input name="max" type="number" placeholder="Số lượng tối đa" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" required />
                                        </div>
                                        <textarea name="desc" rows="3" placeholder="Mô tả chi tiết nội dung hoạt động xanh..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs" required></textarea>
                                        <div className="flex gap-2 pt-2">
                                            <button type="button" className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={()=>setShowEventForm(false)}>Hủy bỏ</button>
                                            <button type="submit" className="flex-1 py-2.5 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md">Nộp đơn đơn lên Cán bộ</button>
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
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V2.1 FIXED MASTERPIECE đang chạy trên cổng ${PORT}`));
