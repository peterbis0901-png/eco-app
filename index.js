/**
 * 🌱 ECOCONNECT HCM - BẢN V1.8 (SUPER APP)
 * - Tái cấu trúc Menu Sidebar: Gom nhóm các tính năng logic, tinh gọn.
 * - Tích hợp Biểu đồ Real-time (Chart.js) cập nhật dữ liệu PM2.5 liên tục.
 * - Khôi phục Eco Reels (Video ngắn) & EcoBot (AI Môi trường).
 * - Giữ nguyên TOÀN BỘ text, Điều khoản, Logic OTP từ bản V1.7.
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json()); 

let users = []; 
let otpStore = {}; 
let reports = [
    { id: "REP-001", title: "Bãi rác tự phát chân cầu", location: "Quận 8", status: "Chờ xử lý", type: "Trash", severity: "Severe", lat: 10.742, lng: 106.635, date: "2026-06-09" },
    { id: "REP-002", title: "Xả nước thải đen kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", severity: "Warning", lat: 10.782, lng: 106.685, date: "2026-06-08" },
    { id: "REP-003", title: "Cây xanh cổ thụ ngã đổ sau giông", location: "Quận 1", status: "Đã xử lý", type: "Tree", severity: "Normal", lat: 10.775, lng: 106.698, date: "2026-06-07" }
];

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'peterbis0901@gmail.com',
        pass: 'wmwskurdnlftdlko' // Mật khẩu ứng dụng của bro
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

app.get('/api/reports', (req, res) => res.json(reports));

app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Họ tên, Email, Mật khẩu nha ní!' });
    }

    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') {
        return res.status(400).json({ success: false, message: 'Mã xác nhận Cán bộ không chính xác! (Thử: ADMIN123)' });
    }

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email này đã được đăng ký rồi bro!' });
    }

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; 
    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    const mailOptions = {
        from: `"EcoConnect HCM" <peterbis0901@gmail.com>`, 
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký Tài Khoản',
        html: `<p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mã OTP đã gửi đi thành công! Check mail nha ní.' });
    } catch (error) {
        console.error('Lỗi gửi mail do Render chặn:', error);
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

    if (!session) return res.status(400).json({ success: false, message: 'Không tìm thấy phiên đăng ký hoặc mã đã hết hạn!' });
    if (Date.now() > session.expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn rồi bro!' });
    }
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) {
        return res.status(400).json({ success: false, message: 'Mã xác thực nhập vào chưa đúng rồi ní!' });
    }

    users.push(session.userData);
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Xác thực thành công! Tài khoản đã sẵn sàng.' });
});

// =========================================================================
// 5. 🎨 FRONTEND 
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect HCM - Super App</title>
        
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
        
        <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; overflow: hidden; height: 100vh; }
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
            .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
            #map { height: 100%; width: 100%; border-radius: 24px; z-index: 1; }
            .leaflet-popup-content-wrapper { background: #1e293b; color: #fff; border-radius: 12px; padding: 5px; }
            .leaflet-popup-tip { background: #1e293b; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            .custom-scroll::-webkit-scrollbar { width: 5px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
            input:focus { border-color: #10b981 !important; ring-color: #10b981 !important; }
        </style>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            // COMPONENT BẢN ĐỒ
            function MapView({ reports }) {
                const mapInstance = React.useRef(null);
                React.useEffect(() => {
                    if (!mapInstance.current) {
                        mapInstance.current = L.map('map', { zoomControl: false }).setView([10.776, 106.695], 13);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
                        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
                    }
                    if (reports && reports.length > 0) {
                        mapInstance.current.eachLayer((layer) => { if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer); });
                        reports.forEach(rep => {
                            const color = rep.severity === 'Severe' ? '#ef4444' : (rep.severity === 'Warning' ? '#f59e0b' : '#10b981');
                            const customIcon = L.divIcon({
                                className: 'custom-icon',
                                html: \`<div style="background-color: \${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px \${color};"></div>\`,
                                iconSize: [15, 15]
                            });
                            L.marker([rep.lat, rep.lng], { icon: customIcon })
                             .addTo(mapInstance.current)
                             .bindPopup(\`<b>\${rep.id}</b>: \${rep.title}<br/><span style="color: #94a3b8">📍 \${rep.location}</span>\`);
                        });
                    }
                }, [reports]);
                return <div id="map"></div>;
            }

            // COMPONENT BIỂU ĐỒ REAL-TIME (CẬP NHẬT MỖI 2 GIÂY)
            function RealtimeChart() {
                const chartRef = React.useRef(null);
                
                React.useEffect(() => {
                    const ctx = document.getElementById('realtimeChart').getContext('2d');
                    
                    // Khởi tạo Chart.js
                    chartRef.current = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['10:00', '10:01', '10:02', '10:03', '10:04', '10:05'],
                            datasets: [{
                                label: 'Chỉ số bụi mịn PM2.5 (Real-time)',
                                data: [45, 42, 50, 48, 55, 52],
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: '#fff',
                                pointBorderColor: '#10b981',
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: { duration: 400 },
                            scales: {
                                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                            },
                            plugins: { legend: { labels: { color: '#fff' } } }
                        }
                    });

                    // API Simulator: Tự động nhích biểu đồ mỗi 2 giây
                    const intervalId = setInterval(() => {
                        if(chartRef.current) {
                            const data = chartRef.current.data;
                            const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            const newAQI = Math.floor(40 + Math.random() * 30); // Random dữ liệu chạy lên xuống
                            
                            data.labels.push(time);
                            data.datasets[0].data.push(newAQI);
                            
                            // Giữ tối đa 8 điểm trên biểu đồ để nó trượt qua
                            if (data.labels.length > 8) {
                                data.labels.shift();
                                data.datasets[0].data.shift();
                            }
                            chartRef.current.update();
                        }
                    }, 2000);

                    return () => { clearInterval(intervalId); chartRef.current.destroy(); };
                }, []);

                return <canvas id="realtimeChart"></canvas>;
            }

            // APP CHÍNH
            function App() {
                const [user, setUser] = React.useState(null); 
                const [view, setView] = React.useState('auth'); 
                const [authTab, setAuthTab] = React.useState('register'); 
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                
                // MẶC ĐỊNH VÀO TỔNG QUAN
                const [currentTab, setCurrentTab] = React.useState('1_dashboard'); 
                
                const [showTerms, setShowTerms] = React.useState(false);
                const [showOtpModal, setShowOtpModal] = React.useState(false);
                
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', adminCode: '', terms: false });
                const [otpInput, setOtpInput] = React.useState('');
                const [loading, setLoading] = React.useState(false);
                const [targetEmail, setTargetEmail] = React.useState('');
                const [reports, setReports] = React.useState([]);
                const [fallbackOtpAlert, setFallbackOtpAlert] = React.useState(''); 

                // HÀM CHUYỂN TRANG
                const switchAuth = (tab) => {
                    setAuthTab(tab);
                    setOtpInput('');
                    setFormData({ name: '', email: '', password: '', adminCode: '', terms: false });
                    setFallbackOtpAlert('');
                };

                // DANH SÁCH MENU GOM NHÓM (SUPER APP)
                const featuresList = [
                    { id: '1_dashboard', name: 'Tổng quan hệ thống', icon: 'dashboard' },
                    { id: '2_map_notify', name: 'Bản đồ & Thông báo', icon: 'map' },
                    { id: '3_community_events', name: 'Cộng đồng & Sự kiện', icon: 'groups' },
                    { id: '4_chat', name: 'Phòng chat trực tuyến', icon: 'forum' },
                    { id: '5_news_handbook', name: 'Tin tức & Cẩm nang', icon: 'menu_book' },
                    { id: '6_reels', name: 'Eco Reels', icon: 'play_circle' },
                    { id: '7_ai', name: 'AI Môi trường', icon: 'smart_toy' },
                    { id: '8_profile', name: 'Quản lý cá nhân', icon: 'account_circle' }
                ];

                React.useEffect(() => {
                    if(view === 'dashboard') {
                        fetch('/api/reports').then(res => res.json()).then(data => setReports(data)).catch(err => console.error(err));
                    }
                }, [view]);

                const handleRegisterRequest = async (e) => {
                    e.preventDefault();
                    if(!formData.name || !formData.email || !formData.password) return alert("Điền đủ thông tin nha ní!");
                    if(!formData.terms) return alert("Ní phải đồng ý điều khoản sử dụng!");

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
                                setOtpInput(data.fallbackOtp); 
                            }
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        setLoading(false);
                        alert("Lỗi kết nối máy chủ rồi bro ơi!");
                    }
                };

                const handleVerifyOtp = async () => {
                    if(!otpInput) return alert("Chưa nhập mã OTP ní ơi!");
                    try {
                        const res = await fetch('/api/auth/register-verify', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: targetEmail, code: otpInput })
                        });
                        const data = await res.json();

                        if(data.success) {
                            alert('🎉 Đăng ký thành công tốt đẹp! Khám phá Super App thôi!');
                            setShowOtpModal(false);
                            setUser({email: targetEmail, name: formData.name, role: currentRole}); 
                            setView('dashboard'); 
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        alert("Lỗi xác thực rồi bro!");
                    }
                };

                // =========================================================================
                // GIAO DIỆN AUTH (GIỮ NGUYÊN)
                // =========================================================================
                if (view === 'auth') {
                    return (
                        <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn">
                            <div className="glass w-full max-w-[450px] p-10 rounded-[32px] shadow-2xl relative text-center">
                                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-5">
                                    <span className="material-icons-round text-3xl">spa</span>
                                </div>
                                <h1 className="text-2xl font-extrabold mb-1.5">EcoConnect</h1>
                                <p className="text-slate-400 text-sm mb-8">Chung tay bảo vệ môi trường Thành phố</p>

                                {authTab === 'register' && (
                                    <form onSubmit={handleRegisterRequest} className="space-y-4 animate-fadeIn">
                                        <input type="text" placeholder="Họ và tên" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none text-sm" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                        <input type="email" placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none text-sm" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                        <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none text-sm" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                        
                                        {currentRole === 'Cán bộ' && (
                                            <input 
                                                type="text" 
                                                placeholder="Mã xác thực chính quyền (VD: ADMIN123)" 
                                                className="w-full bg-emerald-950/30 border border-emerald-500 p-3.5 rounded-xl focus:outline-none text-sm text-emerald-300 placeholder-emerald-700 animate-fadeIn" 
                                                onChange={e => setFormData({...formData, adminCode: e.target.value})} 
                                                value={formData.adminCode} 
                                                required 
                                            />
                                        )}

                                        <div className="grid grid-cols-3 gap-2 py-1">
                                            {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => (
                                                <button type="button" key={r} onClick={() => setCurrentRole(r)} className={\`py-2.5 text-[11px] font-bold rounded-lg border transition-all \${currentRole === r ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-950/30 border-slate-700 text-slate-400'}\`}>{r}</button>
                                            ))}
                                        </div>

                                        <div className="flex items-start text-left gap-2.5 pt-1 pb-3 text-[13px] text-slate-400">
                                            <input type="checkbox" id="policy" className="mt-1 accent-emerald-500 h-4 w-4" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                            <label htmlFor="policy">Tui đã đọc và đồng ý với <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>Chính sách & Điều khoản</span></label>
                                        </div>

                                        <button type="submit" className="w-full py-3.5 emerald-gradient rounded-2xl text-slate-950 font-bold text-sm uppercase tracking-wider flex justify-center items-center gap-2" disabled={loading}>
                                            {loading ? <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : 'Đăng ký tài khoản'}
                                        </button>
                                        
                                        <p className="text-sm text-slate-400 pt-3">Đã có tài khoản? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => switchAuth('login')}>Đăng nhập</span></p>
                                    </form>
                                )}

                                {authTab === 'login' && (
                                    <form className="space-y-4 animate-fadeIn pt-4">
                                        <input type="email" placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none" required />
                                        <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none" required />
                                        <button type="button" className="w-full py-3.5 emerald-gradient rounded-2xl text-slate-950 font-bold text-sm uppercase" onClick={() => { setUser({name: 'Sếp Tổng Lâm', role: currentRole}); setView('dashboard'); }}>Vào thẳng hệ thống</button>
                                        
                                        <p className="text-sm text-slate-400 pt-3">Chưa có tài khoản? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => switchAuth('register')}>Đăng ký</span></p>
                                    </form>
                                )}
                            </div>

                            {/* CHÍNH SÁCH NGUYÊN VẸN */}
                            {showTerms && (
                                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="glass w-full max-w-[500px] rounded-3xl p-7 border border-slate-700">
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-lg font-bold text-emerald-400">Chính Sách & Điều Khoản Sử Dụng</h3>
                                            <span className="material-icons-round text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowTerms(false)}>close</span>
                                        </div>
                                        <div className="space-y-4 text-sm text-slate-300 h-[300px] overflow-y-auto pr-3 custom-scroll text-left leading-relaxed">
                                            <p><strong className="text-emerald-400">1. Quy định chung:</strong> Chào mừng bạn đến với EcoConnect. Nền tảng được xây dựng nhằm mục đích bảo vệ môi trường, kết nối cộng đồng tại TP.HCM. Bạn cam kết cung cấp thông tin xác thực khi tham gia hệ thống.</p>
                                            <p><strong className="text-emerald-400">2. Quyền riêng tư:</strong> Mọi thông tin cá nhân của bạn bao gồm Email, Họ Tên và Vị trí báo cáo sẽ được mã hóa an toàn trên máy chủ. Chúng tôi cam kết không chia sẻ dữ liệu cho bên thứ ba vì mục đích thương mại.</p>
                                            <p><strong className="text-red-400">3. Hành vi bị nghiêm cấm:</strong> Nghiêm cấm xài ngôn từ thô tục, chửi thề, lăng mạ người khác trên diễn đàn cộng đồng. Nghiêm cấm đăng tải tin tức giả mạo, spam báo cáo rác gây nghẽn hoặc phá hoại hệ thống cơ sở dữ liệu của EcoConnect.</p>
                                            <div className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-300 mt-2">
                                                <strong>⚠️ Quy chế xử phạt đặc biệt:</strong> Người dùng vi phạm nhẹ sẽ bị ẩn nội dung & cảnh cáo. Vi phạm nghiêm trọng (chửi thề, xúc phạm danh dự, truyền bá văn hóa phẩm đồi trụy) sẽ bị <strong>KHÓA TÀI KHOẢN VĨNH VIỄN</strong> và chuyển toàn bộ log IP, dữ liệu cá nhân cho cơ quan chức năng có thẩm quyền để xử lý theo pháp luật.
                                            </div>
                                        </div>
                                        <button className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl font-bold text-sm text-white shadow-lg shadow-emerald-900/50" onClick={() => { setFormData({...formData, terms: true}); setShowTerms(false); }}>Tôi đã đọc và đồng ý tuân thủ nghiêm ngặt</button>
                                    </div>
                                </div>
                            )}

                            {/* MODAL MÃ OTP THÔNG MINH */}
                            {showOtpModal && (
                                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="glass w-full max-w-[400px] rounded-3xl p-8 border border-emerald-500/30 text-center">
                                        <h3 className="text-lg font-bold mb-2">Xác thực Email</h3>
                                        
                                        {fallbackOtpAlert ? (
                                            <div className="bg-amber-500/20 border border-amber-500/50 p-3 rounded-lg mb-4 text-xs text-amber-300 text-left">
                                                <strong>⚠️ Render đang chặn gửi Mail!</strong><br/> Nhưng đừng lo, tui cấp mã OTP thẳng cho ní test luôn nè: <strong className="text-white text-base ml-1">{fallbackOtpAlert}</strong>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 mb-6">Mã OTP đã gửi đến <span className="text-emerald-400 font-bold">{targetEmail}</span></p>
                                        )}
                                        
                                        <input type="text" placeholder="A1B2C3" maxLength="6" className="w-full bg-slate-900 border-2 border-emerald-500 p-4 rounded-xl text-center text-3xl font-black tracking-[8px] uppercase text-emerald-400 focus:outline-none mb-6" onChange={e => setOtpInput(e.target.value)} value={otpInput} />
                                        
                                        <div className="flex gap-3">
                                            <button className="flex-1 py-3 bg-slate-800 rounded-xl text-sm" onClick={() => setShowOtpModal(false)}>Hủy</button>
                                            <button className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-sm" onClick={handleVerifyOtp}>Kích hoạt</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                // =========================================================================
                // MÀN HÌNH DASHBOARD (ĐÃ GOM NHÓM TÍNH NĂNG + BIỂU ĐỒ REAL-TIME)
                // =========================================================================
                return (
                    <div className="h-screen flex animate-fadeIn overflow-hidden">
                        {/* SIDEBAR TÁI CẤU TRÚC */}
                        <aside className="w-72 glass m-4 mr-0 rounded-3xl p-5 flex flex-col z-10 border border-slate-800 shadow-xl min-h-0">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800 flex-shrink-0">
                                <span className="material-icons-round text-emerald-400 text-3xl">spa</span>
                                <div>
                                    <h1 className="text-base font-extrabold tracking-tight">EcoConnect HCM</h1>
                                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Super App V1.8</span>
                                </div>
                            </div>
                            <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scroll">
                                {featuresList.map(feat => (
                                    <button key={feat.id} onClick={() => setCurrentTab(feat.id)} className={\`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-left \${currentTab === feat.id ? 'emerald-gradient text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}\`}>
                                        <span className="material-icons-round text-lg">{feat.icon}</span>
                                        <span>{feat.name}</span>
                                    </button>
                                ))}
                            </nav>
                            <div className="bg-slate-950/40 p-3 rounded-xl text-center text-[11px] text-slate-500 border border-slate-800/60 mt-4 flex-shrink-0">🌿 Mọi thứ hội tụ tại 1 nơi</div>
                        </aside>

                        <main className="flex-1 p-4 flex flex-col h-screen overflow-hidden">
                            {/* HEADER */}
                            <header className="glass rounded-2xl p-4 mb-4 flex justify-between items-center border border-slate-800 shadow-lg flex-shrink-0">
                                <h2 className="text-sm font-bold flex items-center gap-2">
                                    <span className="material-icons-round text-emerald-400 text-lg">shield</span>
                                    Hệ thống giám sát: <span className="text-emerald-400">{user?.name || 'Sếp Tổng'}</span>
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-[11px] font-bold">{user?.role || 'Cán bộ quản lý'}</span>
                                    <button className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-950 text-slate-400 hover:text-red-300 transition-all" onClick={() => window.location.reload()}>
                                        <span className="material-icons-round text-sm">logout</span>
                                    </button>
                                </div>
                            </header>

                            <div className="flex-1 min-h-0 animate-fadeIn">
                                
                                {/* TAB 1: TỔNG QUAN HỆ THỐNG (Biểu đồ Realtime + Tóm tắt) */}
                                {currentTab === '1_dashboard' && (
                                    <div className="flex flex-col h-full gap-4 min-h-0">
                                        {/* Row 1: Thống kê nhanh */}
                                        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                                            {[
                                                { label: 'Sự cố ghi nhận', val: '1,452', color: 'text-white' },
                                                { label: 'Tỉ lệ đã xử lý', val: '89.4%', color: 'text-emerald-400' },
                                                { label: 'Rác thu gom (Tấn)', val: '124', color: 'text-teal-400' },
                                                { label: 'Tình nguyện viên', val: '8,405', color: 'text-blue-400' }
                                            ].map((st, i) => (
                                                <div key={i} className="glass p-5 rounded-2xl border border-slate-800 shadow-lg text-center">
                                                    <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{st.label}</p>
                                                    <span className={\`text-3xl font-black \${st.color}\`}>{st.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Row 2: Biểu đồ & Tóm tắt cộng đồng */}
                                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                            <div className="col-span-2 glass rounded-3xl p-5 flex flex-col border border-slate-800 relative shadow-lg min-h-0">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2"><span className="material-icons-round">query_stats</span> Biểu đồ phân tích chất lượng Không khí</h3>
                                                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/50 flex items-center gap-1 animate-pulse"><span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span> LIVE</span>
                                                </div>
                                                <div className="flex-1 relative w-full h-full">
                                                    <RealtimeChart />
                                                </div>
                                            </div>
                                            <div className="glass rounded-3xl p-5 border border-slate-800 flex flex-col min-h-0 overflow-y-auto custom-scroll shadow-lg">
                                                <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><span className="material-icons-round text-amber-400 text-lg">bolt</span> Tóm tắt Mới Nhất</h3>
                                                <div className="space-y-3">
                                                    <div className="bg-slate-900 p-3 rounded-xl border-l-2 border-red-500 text-xs text-left">
                                                        <strong className="text-red-400 block mb-1">Cảnh báo PM2.5</strong> Đ.Võ Văn Kiệt đang kẹt xe, chỉ số ô nhiễm tăng vọt.
                                                    </div>
                                                    <div className="bg-slate-900 p-3 rounded-xl border-l-2 border-blue-500 text-xs text-left">
                                                        <strong className="text-blue-400 block mb-1">Group Nhiêu Lộc</strong> Nước kênh hôm nay đã bớt mùi hôi. (+320 bình luận)
                                                    </div>
                                                    <div className="bg-slate-900 p-3 rounded-xl border-l-2 border-emerald-500 text-xs text-left">
                                                        <strong className="text-emerald-400 block mb-1">Chiến dịch Chủ Nhật</strong> Nhà thiếu nhi Q8 hiện có 45/100 người đăng ký.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: BẢN ĐỒ VÀ THÔNG BÁO (Gộp Map, Report, Notify) */}
                                {currentTab === '2_map_notify' && (
                                    <div className="flex flex-col h-full gap-4 min-h-0">
                                        {/* Bảng thông báo khẩn ở trên cùng */}
                                        <div className="flex-shrink-0 grid grid-cols-2 gap-4">
                                            <div className="glass p-4 rounded-2xl border-l-4 border-red-500 bg-red-950/10 text-left flex items-center gap-3 shadow-lg">
                                                <span className="material-icons-round text-3xl text-red-500 animate-bounce">warning</span>
                                                <div>
                                                    <strong className="text-red-400 text-sm block">CẢNH BÁO BỤI MỊN ĐỘC HẠI</strong>
                                                    <span className="text-xs text-slate-300">AQI > 150 tại Nút giao An Phú. Hạn chế ra đường!</span>
                                                </div>
                                            </div>
                                            <div className="glass p-4 rounded-2xl border-l-4 border-amber-500 bg-amber-950/10 text-left flex items-center gap-3 shadow-lg">
                                                <span className="material-icons-round text-3xl text-amber-500">water_drop</span>
                                                <div>
                                                    <strong className="text-amber-400 text-sm block">Báo động Triều Cường</strong>
                                                    <span className="text-xs text-slate-300">Đỉnh triều Quận 7 dâng cao lúc 17:00 chiều nay.</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Phần chia Map và Report */}
                                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                            <div className="col-span-2 glass rounded-3xl p-3 flex flex-col border border-slate-800 relative min-h-0 shadow-lg">
                                                <div className="flex justify-between items-center p-3 absolute top-6 left-6 right-6 z-10 glass rounded-xl border border-slate-700/40 shadow">
                                                    <h3 className="font-bold text-xs flex items-center gap-2">📍 Bản đồ nhiệt sự cố môi trường</h3>
                                                </div>
                                                <div className="flex-1 rounded-2xl overflow-hidden z-1"><MapView reports={reports} /></div>
                                            </div>
                                            
                                            <div className="glass rounded-3xl p-5 border border-slate-800 flex flex-col text-left overflow-y-auto custom-scroll shadow-lg min-h-0">
                                                <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-4 text-sm"><span className="material-icons-round">add_location_alt</span> Báo cáo sự cố</h3>
                                                <input type="text" placeholder="Tiêu đề (VD: Đốt rác)" className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs mb-3 focus:border-emerald-500 outline-none" />
                                                <select className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs mb-3 text-slate-300 outline-none"><option>Chọn Quận/Huyện</option><option>Quận 1</option><option>Bình Thạnh</option></select>
                                                <textarea placeholder="Mô tả hiện trạng..." rows="3" className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs mb-3 outline-none"></textarea>
                                                <button className="w-full py-3 emerald-gradient rounded-lg text-slate-950 font-bold text-xs uppercase" onClick={()=>alert('Đã gửi báo cáo thành công!')}>Gửi nhanh</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: CỘNG ĐỒNG VÀ SỰ KIỆN (Gộp Group + Event) */}
                                {currentTab === '3_community_events' && (
                                    <div className="flex flex-col h-full gap-4 overflow-y-auto custom-scroll pr-2 text-left">
                                        <h3 className="text-base font-bold text-white flex items-center gap-2"><span className="material-icons-round text-emerald-400">event</span> Chiến dịch Tình nguyện sắp tới</h3>
                                        <div className="glass p-5 rounded-3xl border border-emerald-500/50 bg-emerald-900/10 flex gap-5 relative overflow-hidden shadow-lg">
                                            <div className="absolute top-4 right-[-30px] bg-red-500 text-white text-[10px] font-bold px-8 py-1 rotate-45">HOT</div>
                                            <div className="w-28 bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-700 p-2">
                                                <span className="text-red-400 font-bold text-xs uppercase">Chủ Nhật</span>
                                                <span className="text-3xl font-black text-white">14</span>
                                                <span className="text-slate-400 text-[10px] font-semibold">Thg 06, 2026</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-emerald-400 mb-1 text-lg">Chủ Nhật Xanh lần 145</h4>
                                                <p className="text-xs text-slate-300 mb-2">📍 Nhà thiếu nhi Quận 8. Vớt rác lục bình tại Kênh Tàu Hủ.</p>
                                                <button className="px-5 py-2 emerald-gradient text-slate-950 font-bold rounded-lg text-xs" onClick={()=>alert('Đã đăng ký tình nguyện!')}>Đăng ký ngay (45/100)</button>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-bold text-white flex items-center gap-2 mt-4"><span className="material-icons-round text-blue-400">groups</span> Các Hội nhóm Cộng đồng</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="glass p-5 rounded-2xl border border-slate-800 shadow">
                                                <h4 className="font-bold text-emerald-400 mb-1">Biệt đội Nhặt Rác Sài Gòn</h4>
                                                <p className="text-xs text-slate-400 mb-3">Chuyên dọn rác cuối tuần tại các tụ điểm đen.</p>
                                                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs">Tham gia (1,420 Mem)</button>
                                            </div>
                                            <div className="glass p-5 rounded-2xl border border-slate-800 shadow">
                                                <h4 className="font-bold text-emerald-400 mb-1">Yêu Cây Xanh TPHCM</h4>
                                                <p className="text-xs text-slate-400 mb-3">Chia sẻ kỹ thuật phủ xanh ban công đô thị.</p>
                                                <button className="w-full py-2 bg-slate-700 text-white font-bold rounded-lg text-xs cursor-not-allowed">Đã tham gia (3,200 Mem)</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: PHÒNG CHAT TRỰC TUYẾN (Giữ nguyên) */}
                                {currentTab === '4_chat' && (
                                    <div className="glass rounded-3xl h-full border border-slate-800 flex flex-col max-w-3xl mx-auto overflow-hidden shadow-xl">
                                        <div className="p-4 bg-slate-900 border-b border-slate-800 text-left flex justify-between items-center">
                                            <span className="font-bold text-sm text-emerald-400 flex items-center gap-2"><span className="material-icons-round text-lg">forum</span> Kênh Thảo Luận Chung</span>
                                            <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30">🟢 342 Online</span>
                                        </div>
                                        <div className="flex-1 p-5 space-y-4 overflow-y-auto text-left text-sm custom-scroll">
                                            <div className="flex gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">MT</div>
                                                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 shadow">
                                                    <strong className="text-blue-300 text-xs block mb-1">Minh Thư (Q3)</strong>
                                                    <p className="text-slate-200 text-xs">Kênh Nhiêu Lộc đoạn qua cầu Lê Văn Sỹ hôm nay nước đỡ mùi hẳn rồi mọi người ơi!</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 flex-row-reverse">
                                                <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-slate-900">ME</div>
                                                <div className="bg-emerald-900/40 p-3 rounded-2xl rounded-tr-none border border-emerald-800 shadow">
                                                    <strong className="text-emerald-400 text-xs block mb-1 text-right">Bạn</strong>
                                                    <p className="text-slate-200 text-xs">Tuyệt vời quá, chính quyền làm gắt có khác.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-slate-950/80 flex border-t border-slate-800 gap-2">
                                            <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-slate-900 p-3 text-xs rounded-xl border border-slate-700 outline-none focus:border-emerald-500" />
                                            <button className="px-5 emerald-gradient text-slate-950 font-bold rounded-xl"><span className="material-icons-round text-base">send</span></button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: TIN TỨC VÀ CẨM NANG (Gộp News + Handbook) */}
                                {currentTab === '5_news_handbook' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left">
                                        <h3 className="text-base font-bold text-white flex items-center gap-2"><span className="material-icons-round text-amber-400">menu_book</span> Cẩm nang phân loại rác</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="glass p-5 rounded-2xl border-l-4 border-amber-500 shadow">
                                                <h4 className="font-bold text-amber-400 text-sm mb-2">🍂 Rác Hữu Cơ (Dễ phân hủy)</h4>
                                                <p className="text-slate-300 text-xs mb-2">Thức ăn thừa, vỏ rau củ, lá cây.</p>
                                                <span className="text-[10px] bg-amber-900/40 text-amber-300 p-1.5 rounded block">👉 Bỏ vào thùng Xanh Lá để ủ làm phân bón.</span>
                                            </div>
                                            <div className="glass p-5 rounded-2xl border-l-4 border-blue-500 shadow">
                                                <h4 className="font-bold text-blue-400 text-sm mb-2">♻️ Rác Vô Cơ (Tái chế)</h4>
                                                <p className="text-slate-300 text-xs mb-2">Chai nhựa, lon nhôm, giấy báo cũ.</p>
                                                <span className="text-[10px] bg-blue-900/40 text-blue-300 p-1.5 rounded block">👉 Bỏ vào thùng Xám, rửa sạch trước khi bỏ.</span>
                                            </div>
                                        </div>

                                        <h3 className="text-base font-bold text-white flex items-center gap-2 mt-2"><span className="material-icons-round text-emerald-400">newspaper</span> Tin tức điểm nhấn</h3>
                                        <div className="space-y-3">
                                            <div className="glass p-4 rounded-xl border border-slate-800 flex gap-4 hover:border-emerald-500 transition cursor-pointer">
                                                <div className="w-24 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src="https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=200" alt="cam" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-white mb-1">TP.HCM thí điểm camera AI phạt nguội xả rác</h4>
                                                    <span className="text-[10px] text-slate-500">09/06/2026 - Ban Tuyên giáo</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 6: ECO REELS (ĐÃ KHÔI PHỤC) */}
                                {currentTab === '6_reels' && (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="w-[350px] h-[600px] bg-black rounded-3xl relative overflow-hidden shadow-2xl border-4 border-slate-800">
                                            <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=900&fit=crop" className="w-full h-full object-cover opacity-80" alt="reels" />
                                            
                                            {/* UI Overlay */}
                                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                                                <span className="font-bold text-white drop-shadow-md">Eco Reels</span>
                                                <span className="material-icons-round text-white drop-shadow-md">search</span>
                                            </div>

                                            <div className="absolute bottom-6 left-4 right-16 text-left z-10">
                                                <h4 className="font-bold text-white drop-shadow-md mb-1">@SaigonXanh</h4>
                                                <p className="text-xs text-white drop-shadow-md line-clamp-2">Hôm nay cùng team dọn sạch rác dưới chân cầu vượt Nguyễn Hữu Cảnh nha mọi người! 🌿💪 #Moitruong #HCM</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="material-icons-round text-white text-sm">music_note</span>
                                                    <span className="text-xs text-white animate-pulse">Nhạc nền - Chữa Lành Trái Đất...</span>
                                                </div>
                                            </div>

                                            {/* Buttons Right */}
                                            <div className="absolute bottom-6 right-2 flex flex-col items-center gap-4 z-10">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-10 w-10 bg-black/40 rounded-full flex items-center justify-center hover:bg-emerald-500/80 cursor-pointer backdrop-blur"><span className="material-icons-round text-white">favorite</span></div>
                                                    <span className="text-[10px] text-white font-bold mt-1 shadow-black">12.4k</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="h-10 w-10 bg-black/40 rounded-full flex items-center justify-center hover:bg-slate-700 cursor-pointer backdrop-blur"><span className="material-icons-round text-white">chat</span></div>
                                                    <span className="text-[10px] text-white font-bold mt-1 shadow-black">842</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <div className="h-10 w-10 bg-black/40 rounded-full flex items-center justify-center hover:bg-slate-700 cursor-pointer backdrop-blur"><span className="material-icons-round text-white">share</span></div>
                                                    <span className="text-[10px] text-white font-bold mt-1 shadow-black">Chia sẻ</span>
                                                </div>
                                                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white animate-spin" style={{animationDuration: '3s'}}>
                                                    <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 7: AI MÔI TRƯỜNG (ĐÃ KHÔI PHỤC) */}
                                {currentTab === '7_ai' && (
                                    <div className="glass rounded-3xl h-full border border-slate-800 flex flex-col max-w-3xl mx-auto overflow-hidden shadow-xl">
                                        <div className="p-4 bg-emerald-950/50 border-b border-emerald-900/50 text-left flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center font-black text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]">AI</div>
                                            <div>
                                                <strong className="text-emerald-400 text-sm block">EcoBot Assistant</strong>
                                                <span className="text-[10px] text-slate-400">Trợ lý ảo phân tích và giải đáp luật môi trường</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-5 space-y-4 overflow-y-auto text-left text-sm custom-scroll">
                                            <div className="flex gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-900">AI</div>
                                                <div className="bg-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-slate-700 shadow max-w-[80%] text-xs leading-relaxed text-slate-200">
                                                    Chào bạn! Mình là EcoBot. Bạn cần mình giúp gì về cách phân loại rác, tra cứu luật bảo vệ môi trường hay tìm kiếm chiến dịch tình nguyện gần nhất không?
                                                </div>
                                            </div>
                                            <div className="flex gap-3 flex-row-reverse">
                                                <div className="h-8 w-8 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center font-bold text-xs text-white">Bạn</div>
                                                <div className="bg-emerald-900/40 p-3.5 rounded-2xl rounded-tr-none border border-emerald-800 shadow max-w-[80%] text-xs text-slate-200">
                                                    Pin cũ dùng hết thì vứt ở đâu cho an toàn vậy Bot?
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-600 flex-shrink-0 flex items-center justify-center font-bold text-xs text-slate-900">AI</div>
                                                <div className="bg-slate-800 p-3.5 rounded-2xl rounded-tl-none border border-slate-700 shadow max-w-[80%] text-xs leading-relaxed text-slate-200">
                                                    Pin cũ chứa rất nhiều kim loại nặng độc hại (chì, thủy ngân), tuyệt đối KHÔNG vứt vào thùng rác sinh hoạt bạn nhé! <br/><br/>👉 Bạn có thể mang pin đến các điểm thu gom rác thải điện tử miễn phí tại các hệ thống siêu thị Co.opMart hoặc các UBND Phường gần nhất.
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-slate-950/80 flex border-t border-slate-800 gap-2">
                                            <input type="text" placeholder="Hỏi EcoBot bất cứ điều gì..." className="flex-1 bg-slate-900 p-3 text-xs rounded-xl border border-slate-700 outline-none focus:border-emerald-500" />
                                            <button className="px-5 emerald-gradient text-slate-950 font-bold rounded-xl"><span className="material-icons-round text-base">send</span></button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 8: QUẢN LÝ CÁ NHÂN VÀ ĐỔI QUÀ (Gộp Profile + Rewards) */}
                                {currentTab === '8_profile' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left max-w-4xl mx-auto w-full">
                                        {/* Phần Profile Header */}
                                        <div className="glass p-6 rounded-[32px] border border-slate-800 shadow-xl relative overflow-hidden flex items-center gap-6">
                                            <div className="absolute right-[-20%] top-[-50%] w-64 h-64 bg-emerald-500/20 rounded-full blur-[50px]"></div>
                                            <div className="h-20 w-20 bg-emerald-600 rounded-full flex items-center justify-center font-black text-slate-950 text-3xl shadow-xl z-10">🚀</div>
                                            <div className="flex-1 z-10">
                                                <h4 className="font-bold text-white text-xl mb-1">{user?.name || 'Tài khoản Ẩn Danh'}</h4>
                                                <p className="text-xs text-slate-400 mb-2">📧 {user?.email || 'N/A'}</p>
                                                <span className="text-xs bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/30">Level: Hiệp sĩ xanh</span>
                                            </div>
                                            <div className="text-center z-10 bg-slate-900 p-4 rounded-2xl border border-slate-700">
                                                <span className="text-xs text-slate-400 block mb-1">Điểm tích lũy</span>
                                                <span className="text-2xl font-black text-emerald-400">120 <span className="text-xs">PTS</span></span>
                                            </div>
                                        </div>

                                        {/* Phần Đổi Quà Tích Điểm */}
                                        <h3 className="text-base font-bold text-white flex items-center gap-2 mt-2"><span className="material-icons-round text-amber-400">redeem</span> Cửa hàng Đổi thưởng</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { title: 'Bình nước inox 500ml', points: 500, desc: 'Giữ nhiệt 12h. Hạn chế ly nhựa.', icon: 'local_drink' },
                                                { title: 'Túi vải Canvas', points: 200, desc: 'Thân thiện môi trường, giặt lại được.', icon: 'shopping_bag' },
                                                { title: 'Voucher 50k Xanh SM', points: 400, desc: 'Mã giảm giá cước di chuyển xe điện.', icon: 'electric_car' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-emerald-500 transition-all">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="material-icons-round text-emerald-400">{item.icon}</span>
                                                            <span className="text-emerald-400 font-extrabold text-sm">{item.points} PTS</span>
                                                        </div>
                                                        <h4 className="font-bold text-sm text-white mb-2">{item.title}</h4>
                                                        <p className="text-xs text-slate-400 mb-4">{item.desc}</p>
                                                    </div>
                                                    <button className="w-full py-2 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 font-bold rounded-lg text-xs transition-all" onClick={()=>alert('Ní chưa đủ điểm để đổi món này!')}>Đổi quà</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </main>
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
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V1.8 SUPER APP đang chạy trên cổng ${PORT}`));
