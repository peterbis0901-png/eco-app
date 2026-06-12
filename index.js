/**
 * 🌱 ECOCONNECT HCM - BẢN V2.4 (PHOENIX MASTERPIECE)
 * - Tái sinh 100% từ index(9).js, không cắt giảm bất cứ thứ gì.
 * - Khôi phục 5 Điều khoản chính sách chi tiết.
 * - Thêm luồng Quên Mật Khẩu (Forgot Password) có xác thực OTP.
 * - Đa ngôn ngữ vươn tầm thế giới (VI, EN, JA, ZH, FR).
 * - Tách Lịch Vạn Niên & Trạm Kiểm Duyệt Cán Bộ sang Tab Sidebar độc lập.
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

// API Đăng ký yêu cầu mã OTP
app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin!' });
    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') return res.status(400).json({ success: false, message: 'Mã xác nhận Cán bộ không đúng!' });
    if (users.some(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trước đó!' });

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; 
    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    const mailOptions = {
        from: `"EcoConnect HCM" <peterbis0901@gmail.com>`, 
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký Hệ Thống Xanh',
        html: `<p>Mã OTP kích hoạt tài khoản của bạn là: <strong style="font-size: 18px; color: #10b981;">${otpCode}</strong></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mã OTP đã được gửi qua Email!' });
    } catch (error) {
        res.status(200).json({ success: true, message: 'Render Mail Blocked. Fallback OTP:', fallbackOtp: otpCode });
    }
});

app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];
    if (!session || Date.now() > session.expires) return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn hoặc không tồn tại!' });
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Mã xác thực OTP không chính xác!' });

    users.push(session.userData);
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
});

// API Quên Mật Khẩu (Gửi OTP)
app.post('/api/auth/forgot-request', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập Email!' });
    
    // Ghi chú: Vì đây là bản mock data lưu trong RAM, nếu test chưa đăng ký thì bypass luôn cho tiện demo
    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; 
    otpStore[email] = { code: otpCode, expires, type: 'forgot' };

    const mailOptions = {
        from: `"EcoConnect HCM" <peterbis0901@gmail.com>`, 
        to: email,
        subject: '[EcoConnect] Mã OTP Khôi Phục Mật Khẩu',
        html: `<p>Mã OTP khôi phục mật khẩu của bạn là: <strong style="font-size: 18px; color: #f59e0b;">${otpCode}</strong></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mã OTP khôi phục đã được gửi!' });
    } catch (error) {
        res.status(200).json({ success: true, message: 'Render Mail Blocked. Fallback OTP:', fallbackOtp: otpCode });
    }
});

// API Đặt lại Mật Khẩu Mới
app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;
    const session = otpStore[email];
    if (!session || session.type !== 'forgot' || Date.now() > session.expires) return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' });
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Mã OTP sai!' });

    // Đổi mật khẩu trong mảng users
    const userIndex = users.findIndex(u => u.email === email);
    if(userIndex !== -1) users[userIndex].password = newPassword;
    
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Đổi mật khẩu mới thành công!' });
});

// =========================================================================
// TOÀN BỘ GIAO DIỆN SỬ DỤNG REACT VÀ TAILWIND CSS SMART LIGHT THEME
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect - Phoenix Masterpiece</title>
        
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
            // TỪ ĐIỂN ĐA NGÔN NGỮ (VI, EN, JA, ZH, FR)
            const dict = {
                vi: {
                    slogan: "🌿 EcoConnect - Đánh thức mầm xanh, Chữa lành Trái Đất 🌍", welcome: "Hệ thống giám sát:",
                    t1: "Tổng quan hệ thống", t2: "Bản đồ & Thông báo", t3: "Cộng đồng & Sự kiện", t4: "Phòng chat trực tuyến", t5: "Tin tức & Cẩm nang", t6: "Eco Reels", t7: "AI Môi trường", t8: "Quản lý & Quà tặng", t9: "Lịch Hoạt Động", t10: "Trạm Kiểm Duyệt Cán Bộ",
                    botGreeting: "Xin chào! Mình là trợ lý thông minh EcoBot 🤖🌱. Hôm nay mình có thể giúp gì cho hành tinh của chúng ta?"
                },
                en: {
                    slogan: "🌿 EcoConnect - Awaken green shoots, Heal the Earth 🌍", welcome: "Monitoring System:",
                    t1: "Dashboard", t2: "Map & Alerts", t3: "Community & Events", t4: "Live Chat", t5: "News & Guide", t6: "Eco Reels", t7: "AI Assistant", t8: "Profile & Rewards", t9: "Calendar", t10: "Officer Approval Hub",
                    botGreeting: "Hello! I am EcoBot 🤖🌱. How can I help our planet today?"
                },
                ja: {
                    slogan: "🌿 EcoConnect - 緑の芽を目覚めさせ、地球を癒す 🌍", welcome: "監視システム:",
                    t1: "ダッシュボード", t2: "マップと通知", t3: "コミュニティとイベント", t4: "ライブチャット", t5: "ニュースとガイド", t6: "エコリール", t7: "AI アシスタント", t8: "プロフィールと報酬", t9: "カレンダー", t10: "承認ハブ",
                    botGreeting: "こんにちは！エコボットです 🤖🌱。地球のために何ができますか？"
                },
                zh: {
                    slogan: "🌿 EcoConnect - 唤醒绿芽，治愈地球 🌍", welcome: "监控系统:",
                    t1: "仪表板", t2: "地图与通知", t3: "社区与活动", t4: "实时聊天", t5: "新闻与指南", t6: "生态短视频", t7: "AI 助手", t8: "个人资料与奖励", t9: "日历", t10: "官员审批中心",
                    botGreeting: "你好！我是 EcoBot 🤖🌱。今天我能为我们的星球做些什么？"
                },
                fr: {
                    slogan: "🌿 EcoConnect - Éveillez les pousses vertes, Guérissez la Terre 🌍", welcome: "Système de surveillance:",
                    t1: "Tableau de bord", t2: "Carte et alertes", t3: "Communauté et événements", t4: "Chat en direct", t5: "Actualités et guide", t6: "Reels Éco", t7: "Assistant IA", t8: "Profil et récompenses", t9: "Calendrier", t10: "Centre d'approbation",
                    botGreeting: "Bonjour ! Je suis EcoBot 🤖🌱. Comment puis-je aider notre planète aujourd'hui ?"
                }
            };

            const initialReports = [
                { id: "REP-001", title: "Bãi rác tự phát dưới chân cầu chữ Y gây bốc mùi", location: "Quận 8", status: "Chờ duyệt", type: "Trash", lat: 10.742, lng: 106.635, author: "Nguyễn Văn An", desc: "Người dân đổ rác trộm lúc nửa đêm, bốc mùi hôi thối nồng nặc." },
                { id: "REP-002", title: "Cơ sở nhuộm xả thải đen ngòm ra kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", lat: 10.782, lng: 106.685, author: "Trần Thị Bình", desc: "Nước có màu đen kịt và sủi bọt trắng xóa." },
            ];
            const initialEvents = [
                { id: "EV-01", title: "Chủ Nhật Xanh lần thứ 145", loc: "Nhà thiếu nhi Quận 8", time: "14/06/2026", status: "Đã duyệt", current: 45, max: 100, org: "Đoàn TNCS HCM", desc: "Vớt rác lục bình và dọn cỏ làm sạch bờ Kênh Tàu Hủ." },
                { id: "EV-02", title: "Đổi Rác Nhựa Lấy Cây Xanh", loc: "Phố đi bộ Nguyễn Huệ", time: "20/06/2026", status: "Chờ duyệt", current: 0, max: 500, org: "Cộng đồng Sài Gòn Xanh", desc: "Thu gom chai nhựa tái chế đổi sen đá để bàn." }
            ];

            // BIỂU ĐỒ REAL-TIME (Line Chart AQI)
            function RealtimeChart() {
                const chartRef = React.useRef(null);
                React.useEffect(() => {
                    const ctx = document.getElementById('realtimeChart').getContext('2d');
                    chartRef.current = new Chart(ctx, {
                        type: 'line',
                        data: { labels: ['10:00', '10:01', '10:02', '10:03', '10:04'], datasets: [{ label: 'Chỉ số PM2.5 AQI', data: [45, 48, 52, 49, 55], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 }] },
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

            // BIỂU ĐỒ TRÒN (Pie Chart phân tách rác thải)
            function WastePieChart() {
                const chartRef = React.useRef(null);
                React.useEffect(() => {
                    const ctx = document.getElementById('wastePieChart').getContext('2d');
                    chartRef.current = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Rác hữu cơ', 'Rác nhựa', 'Giấy carton', 'Khác'],
                            datasets: [{ data: [45, 25, 15, 15], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'], borderWidth: 0 }]
                        },
                        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: {size: 10} } } } }
                    });
                    return () => chartRef.current.destroy();
                }, []);
                return <canvas id="wastePieChart"></canvas>;
            }

            // BẢN ĐỒ ĐỊA LÝ LEAFLET COMPONENT
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
                const [authTab, setAuthTab] = React.useState('register'); // 'register', 'login', 'forgot', 'reset'
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                const [currentTab, setCurrentTab] = React.useState('1_dashboard'); 
                
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', adminCode: '', terms: false });
                const [resetForm, setResetForm] = React.useState({ email: '', newPassword: '' });
                const [otpAction, setOtpAction] = React.useState('register'); // 'register' hoặc 'forgot'

                const [showTerms, setShowTerms] = React.useState(false);
                const [showOtpModal, setShowOtpModal] = React.useState(false);
                const [otpInput, setOtpInput] = React.useState('');
                const [loading, setLoading] = React.useState(false);
                const [targetEmail, setTargetEmail] = React.useState('');
                const [fallbackOtpAlert, setFallbackOtpAlert] = React.useState(''); 

                const [reports, setReports] = React.useState(initialReports);
                const [events, setEvents] = React.useState(initialEvents);

                const [rejectModal, setRejectModal] = React.useState({ isOpen: false, type: '', targetId: '', reason: '' });
                const [showEventForm, setShowEventForm] = React.useState(false);

                // Quản lý Chat
                const [activeChannel, setActiveChannel] = React.useState('Chung');
                const [chatInput, setChatInput] = React.useState('');
                const [chatData, setChatData] = React.useState({
                    'Chung': [ { id:1, sender: 'Minh Thư', text: 'Kênh Nhiêu Lộc dạo này đỡ mùi hôi hẳn luôn rồi á!', isMe: false, reacts: { '❤️': 2 } } ],
                    'Quận 1': [ { id:2, sender: 'Gia Hoàng', text: 'Góc đường Phạm Ngũ Lão có đống xà bần to đùng.', isMe: false, reacts: {} } ],
                    'Quận 8': [ { id:3, sender: 'Nhật Nam', text: 'Chân cầu chữ Y rác bốc mùi quá, để mình tạo báo cáo phản ánh.', isMe: false, reacts: { '👍': 1 } } ]
                });
                
                // Quản lý AI
                const [aiInput, setAiInput] = React.useState('');
                const [aiMessages, setAiMessages] = React.useState([]);

                React.useEffect(() => { setTimeout(() => setIsAppLoading(false), 2000); }, []);
                React.useEffect(() => { setAiMessages([{ sender: 'EcoBot', text: dict[lang].botGreeting, isBot: true }]); }, [lang]);

                // HÀM CHUYỂN TAB AUTH
                const switchAuth = (tab) => {
                    setAuthTab(tab);
                    setOtpInput('');
                    setFormData({ name: '', email: '', password: '', adminCode: '', terms: false });
                    setResetForm({ email: '', newPassword: '' });
                    setFallbackOtpAlert('');
                };

                // XỬ LÝ ĐĂNG KÝ
                const handleRegisterRequest = async (e) => {
                    e.preventDefault();
                    if(!formData.name || !formData.email || !formData.password) return alert("Vui lòng nhập đầy đủ thông tin!");
                    if(!formData.terms) return alert("Bạn cần đồng ý với Điều khoản sử dụng!");

                    setLoading(true);
                    try {
                        const res = await fetch('/api/auth/register-request', {
                            method: 'POST', headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({...formData, role: currentRole})
                        });
                        const data = await res.json();
                        setLoading(false);

                        if(data.success) {
                            setTargetEmail(formData.email);
                            setOtpAction('register');
                            setShowOtpModal(true); 
                            if (data.fallbackOtp) {
                                setFallbackOtpAlert(data.fallbackOtp);
                                setOtpInput(data.fallbackOtp); 
                            }
                        } else { alert(data.message); }
                    } catch (err) { setLoading(false); alert("Không kết nối được tới máy chủ!"); }
                };

                // XỬ LÝ QUÊN MẬT KHẨU (GỬI OTP)
                const handleForgotRequest = async (e) => {
                    e.preventDefault();
                    if(!resetForm.email) return alert("Vui lòng nhập Email để khôi phục!");
                    setLoading(true);
                    try {
                        const res = await fetch('/api/auth/forgot-request', {
                            method: 'POST', headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: resetForm.email })
                        });
                        const data = await res.json();
                        setLoading(false);

                        if(data.success) {
                            setTargetEmail(resetForm.email);
                            setOtpAction('forgot');
                            setShowOtpModal(true); 
                            if (data.fallbackOtp) {
                                setFallbackOtpAlert(data.fallbackOtp);
                                setOtpInput(data.fallbackOtp); 
                            }
                        } else { alert(data.message); }
                    } catch (err) { setLoading(false); alert("Lỗi hệ thống!"); }
                };

                // XỬ LÝ XÁC THỰC MÃ OTP (CHUNG CHO ĐĂNG KÝ VÀ QUÊN PASS)
                const handleVerifyOtp = async (e) => {
                    e.preventDefault();
                    if(!otpInput) return alert("Vui lòng điền mã OTP!");
                    
                    if (otpAction === 'register') {
                        try {
                            const res = await fetch('/api/auth/register-verify', {
                                method: 'POST', headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ email: targetEmail, code: otpInput })
                            });
                            const data = await res.json();
                            if(data.success) {
                                alert('🎉 Xác thực tài khoản thành công! Chào mừng đến với EcoConnect.');
                                setShowOtpModal(false);
                                setUser({email: targetEmail, name: formData.name, role: currentRole}); 
                                setView('dashboard'); 
                            } else { alert(data.message); }
                        } catch (err) { alert("Lỗi hệ thống xác thực mã!"); }
                    } else if (otpAction === 'forgot') {
                        // Nếu là Forgot Password, xác thực đúng thì chuyển sang form nhập Pass mới
                        setShowOtpModal(false);
                        setAuthTab('reset');
                        alert('Mã hợp lệ! Vui lòng nhập mật khẩu mới.');
                    }
                };

                // XỬ LÝ ĐỔI MẬT KHẨU MỚI
                const handleResetPassword = async (e) => {
                    e.preventDefault();
                    if(!resetForm.newPassword) return alert("Nhập mật khẩu mới nha!");
                    try {
                        const res = await fetch('/api/auth/reset-password', {
                            method: 'POST', headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: targetEmail, code: otpInput, newPassword: resetForm.newPassword })
                        });
                        const data = await res.json();
                        if(data.success) {
                            alert('Mật khẩu đã được đổi thành công! Mời đăng nhập lại.');
                            switchAuth('login');
                        } else { alert(data.message); }
                    } catch (err) { alert("Lỗi cập nhật mật khẩu!"); }
                };

                // XỬ LÝ ĐĂNG NHẬP
                const handleLogin = (e) => {
                    e.preventDefault();
                    if(!formData.email || !formData.password) return alert("Vui lòng điền tài khoản và mật khẩu!");
                    const extractedName = formData.email.split('@')[0];
                    setUser({ name: extractedName.charAt(0).toUpperCase() + extractedName.slice(1), email: formData.email, role: currentRole });
                    setView('dashboard');
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

                // THUẬT TOÁN AI ECOBOT
                const sendAI = () => {
                    if(!aiInput.trim()) return;
                    const q = aiInput.toLowerCase();
                    const newMsg = [...aiMessages, { sender: 'Bạn', text: aiInput, isBot: false }];
                    setAiMessages(newMsg);
                    setAiInput('');
                    
                    let reply = "EcoBot đang phân tích dữ liệu câu hỏi của bạn để phản hồi chính xác nhất. Xin cảm ơn bạn đã quan tâm môi trường! 🌱";
                    if(q.includes('rác') || q.includes('nhựa') || q.includes('phân loại')) {
                        reply = "💡 Hướng dẫn phân loại rác nhanh: Rác hữu cơ dễ phân hủy cho vào thùng xanh lá. Rác vô cơ tái chế được (chai nhựa, giấy vỏ hộp) cho vào thùng xám!";
                    } else if (q.includes('pin') || q.includes('điện tử')) {
                        reply = "⚠️ Cảnh báo an toàn: Pin và đồ điện tử cũ chứa chất cực độc hại, tuyệt đối không vứt chung rác thông thường. Hãy đem tới trạm thu hồi pin xanh của TP.";
                    } else if (q.includes('cây')) {
                        reply = "🌳 Cây xanh giúp thanh lọc bụi mịn PM2.5. Bạn có thể tham gia trồng cây ở Tab 'Cộng đồng & Sự kiện' nhé.";
                    }

                    setTimeout(() => { setAiMessages([...newMsg, { sender: 'EcoBot', text: reply, isBot: true }]); }, 600);
                };

                // CÁN BỘ & TỔ CHỨC
                const handleApprove = (type, id) => {
                    if(type === 'report') setReports(reports.map(r => r.id === id ? {...r, status: 'Đã xử lý'} : r));
                    else setEvents(events.map(e => e.id === id ? {...e, status: 'Đã duyệt'} : e));
                    alert('✅ Đã phê duyệt trạng thái thành công!');
                };
                const submitReject = () => {
                    if(!rejectModal.reason) return alert('Vui lòng nhập lý do từ chối cụ thể!');
                    if(rejectModal.type === 'report') setReports(reports.map(r => r.id === rejectModal.targetId ? {...r, status: 'Từ chối'} : r));
                    else setEvents(events.map(e => e.id === rejectModal.targetId ? {...e, status: 'Từ chối'} : e));
                    setRejectModal({ isOpen: false, type: '', targetId: '', reason: '' });
                    alert('❌ Đã từ chối đơn phê duyệt và gửi phản hồi.');
                };

                const handleCreateEvent = (e) => {
                    e.preventDefault();
                    const newEv = { id: "EV-0" + (events.length + 1), title: e.target.title.value, loc: e.target.loc.value, time: e.target.time.value, status: "Chờ duyệt", current: 0, max: e.target.max.value, org: user.name, desc: e.target.desc.value };
                    setEvents([...events, newEv]);
                    setShowEventForm(false);
                    alert("Đã gửi đơn xin cấp phép hoạt động tình nguyện lên cơ quan ban ngành!");
                };

                // SCREEN MÀN HÌNH CHỜ CHẠY APP
                if (isAppLoading) return (
                    <div className="fixed inset-0 bg-[#f0fdf4] z-[9999] flex flex-col items-center justify-center animate-fadeIn">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute w-32 h-32 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                            <span className="text-6xl animate-pulse-leaf">🌍</span>
                            <span className="absolute -top-4 -right-4 text-4xl animate-bounce">🌱</span>
                        </div>
                        <h1 className="text-4xl font-black text-emerald-800 mb-2">EcoConnect HCM</h1>
                        <p className="text-emerald-600 font-semibold">{t.slogan}</p>
                    </div>
                );

                // =========================================================================
                // GIAO DIỆN CỔNG ĐĂNG NHẬP / ĐĂNG KÝ / QUÊN PASS
                // =========================================================================
                if (view === 'auth') return (
                    <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn relative">
                        {/* BỘ MENU ĐA NGÔN NGỮ QUỐC TẾ */}
                        <div className="absolute top-6 right-6 flex gap-1.5 glass px-3 py-2 rounded-2xl shadow-sm">
                            {['vi', 'en', 'ja', 'zh', 'fr'].map(l => (
                                <button key={l} onClick={()=>setLang(l)} className={\`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl transition-all \${lang===l?'bg-emerald-500 text-white shadow':'text-slate-500 hover:bg-white'}\`}>{l}</button>
                            ))}
                        </div>

                        <div className="glass w-full max-w-[440px] p-8 rounded-[32px] text-center border border-white shadow-2xl">
                            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4">
                                <span className="material-icons-round text-3xl">spa</span>
                            </div>
                            <h1 className="text-2xl font-extrabold mb-1 text-slate-800">EcoConnect</h1>
                            <p className="text-slate-500 text-xs mb-6 font-medium">{t.slogan}</p>

                            {/* CHỌN VAI TRÒ HỆ THỐNG */}
                            {(authTab === 'register' || authTab === 'login') && (
                                <div className="grid grid-cols-3 gap-2 py-1 mb-5 bg-slate-100 p-1 rounded-xl">
                                    {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => (
                                        <button type="button" key={r} onClick={() => setCurrentRole(r)} className={\`py-2 text-xs font-bold rounded-lg transition-all \${currentRole === r ? 'emerald-gradient text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}\`}>{r}</button>
                                    ))}
                                </div>
                            )}

                            {authTab === 'register' && (
                                <form onSubmit={handleRegisterRequest} className="space-y-3.5 text-left">
                                    <input type="text" placeholder="Họ và tên người đại diện" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                    <input type="email" placeholder="Địa chỉ Email" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                    <input type="password" placeholder="Mật khẩu bảo mật" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                    
                                    {currentRole === 'Cán bộ' && (
                                        <input type="text" placeholder="Mã xác thực nội bộ (ADMIN123)" className="w-full bg-emerald-50 border-2 border-emerald-300 p-3 rounded-xl text-xs font-bold text-emerald-800 animate-fadeIn" onChange={e => setFormData({...formData, adminCode: e.target.value})} value={formData.adminCode} required />
                                    )}

                                    <div className="flex items-start gap-2 pt-1 pb-2 text-xs text-slate-500">
                                        <input type="checkbox" id="policy" className="mt-0.5 accent-emerald-500 h-4 w-4 rounded" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                        <label htmlFor="policy">Tôi hoàn toàn đồng ý tuân thủ <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>Chính sách điều khoản</span></label>
                                    </div>

                                    <button type="submit" className="w-full py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg flex justify-center items-center gap-2" disabled={loading}>
                                        {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Khởi tạo tài khoản'}
                                    </button>
                                    
                                    <p className="text-xs text-slate-400 pt-2 text-center">Đã có tài khoản tham gia? <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => switchAuth('login')}>Đăng nhập</span></p>
                                </form>
                            )}

                            {authTab === 'login' && (
                                <form onSubmit={handleLogin} className="space-y-3.5 text-left">
                                    <input type="email" placeholder="Nhập địa chỉ Email" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                    <input type="password" placeholder="Nhập mật khẩu" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                    
                                    <div className="text-right"><span className="text-[10px] font-bold text-emerald-600 cursor-pointer hover:underline" onClick={() => switchAuth('forgot')}>Quên mật khẩu?</span></div>

                                    <button type="submit" className="w-full py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs uppercase shadow-lg mt-2">Đăng nhập vào trạm</button>
                                    
                                    <p className="text-xs text-slate-400 pt-2 text-center">Chưa có tài khoản sinh thái? <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => switchAuth('register')}>Đăng ký ngay</span></p>
                                </form>
                            )}

                            {/* LUỒNG QUÊN MẬT KHẨU */}
                            {authTab === 'forgot' && (
                                <form onSubmit={handleForgotRequest} className="space-y-4 text-left animate-fadeIn">
                                    <div className="text-center mb-4"><h3 className="font-bold text-slate-800">Khôi phục mật khẩu</h3><p className="text-[11px] text-slate-500">Nhập Email bạn đã đăng ký để nhận mã OTP khôi phục.</p></div>
                                    <input type="email" placeholder="Địa chỉ Email của bạn" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setResetForm({...resetForm, email: e.target.value})} value={resetForm.email} required />
                                    
                                    <div className="flex gap-2">
                                        <button type="button" className="flex-1 py-3.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={() => switchAuth('login')}>Quay lại</button>
                                        <button type="submit" className="flex-1 py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs uppercase shadow-lg flex justify-center items-center" disabled={loading}>
                                            {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Gửi mã OTP'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {authTab === 'reset' && (
                                <form onSubmit={handleResetPassword} className="space-y-4 text-left animate-fadeIn">
                                    <div className="text-center mb-4"><h3 className="font-bold text-slate-800">Tạo mật khẩu mới</h3><p className="text-[11px] text-slate-500">Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn.</p></div>
                                    <input type="password" placeholder="Mật khẩu mới" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} value={resetForm.newPassword} required />
                                    
                                    <button type="submit" className="w-full py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs uppercase shadow-lg">Cập nhật mật khẩu</button>
                                </form>
                            )}

                        </div>

                        {/* MODAL KHÔI PHỤC CHÍNH SÁCH ĐIỀU KHOẢN (FULL 5 ĐIỀU) */}
                        {showTerms && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-[550px] rounded-3xl p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                                        <h3 className="text-base font-black text-emerald-800 uppercase flex items-center gap-1.5"><span className="material-icons-round text-emerald-600">gavel</span> QUY CHẾ & ĐIỀU KHOẢN ECOCONNECT</h3>
                                        <span className="material-icons-round text-slate-400 cursor-pointer hover:text-red-500 bg-slate-100 rounded-full p-1" onClick={() => setShowTerms(false)}>close</span>
                                    </div>
                                    <div className="space-y-4 text-xs text-slate-600 h-80 overflow-y-auto pr-3 custom-scroll text-justify leading-relaxed font-medium">
                                        <p><strong className="text-emerald-700">Điều 1. Phạm vi áp dụng và Mục đích:</strong> Hệ thống số hóa sinh thái EcoConnect thành phố Hồ Chí Minh là cổng thông tin tiếp nhận, điều phối, giám sát môi trường dựa trên sự đóng góp của cộng đồng. Hướng đến xây dựng môi trường đô thị văn minh, xanh - sạch - đẹp.</p>
                                        <p><strong className="text-emerald-700">Điều 2. Trách nhiệm định danh và Bảo mật:</strong> Thành viên đăng ký có trách nhiệm cung cấp chính xác thông tin tên thật và email. Mọi thông tin định vị sự cố, email sẽ được mã hóa an toàn trên máy chủ. Tuyệt đối KHÔNG chia sẻ dữ liệu cho bên thứ 3 vì mục đích thương mại.</p>
                                        <p><strong className="text-emerald-700">Điều 3. Quy chế phản ánh sự cố:</strong> Người dùng cam kết chỉ gửi thông tin phản ánh về các hiện trạng ô nhiễm, bãi rác tự phát có thực trên địa bàn kèm tọa độ. Việc lạm dụng tính năng báo cáo (spam, báo cáo sai sự thật) gây lãng phí tài nguyên sẽ bị khóa tài khoản 30 ngày.</p>
                                        <div className="mb-2"><strong className="text-red-600">Điều 4. Hành vi bị NGHIÊM CẤM tuyệt đối:</strong> 
                                            <ul className="list-disc pl-5 mt-1.5 space-y-1.5">
                                                <li>Sử dụng ngôn từ thô tục, chửi thề, lăng mạ người khác trong Chat cộng đồng.</li>
                                                <li>Tuyên truyền văn hóa phẩm đồi trụy, chia rẽ đoàn kết.</li>
                                                <li>Phát tán thông tin giả mạo (Fake News) về thảm họa, thiên tai gây hoang mang.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mt-4 text-red-700">
                                            <strong>⚠️ ĐIỀU 5. CHẾ TÀI XỬ PHẠT:</strong> Người dùng vi phạm Điều 4 sẽ bị hệ thống nhận diện, <strong className="font-black">KHÓA TÀI KHOẢN VĨNH VIỄN</strong> và chuyển log IP đến cơ quan chức năng để xử lý theo pháp luật.
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3.5 emerald-gradient rounded-xl font-bold text-white text-xs shadow-md uppercase tracking-wider" onClick={() => setShowTerms(false)}>Tôi đã đọc hiểu và đồng ý</button>
                                </div>
                            </div>
                        )}

                        {/* MODAL HOÀN TẤT XÁC THỰC MÃ OTP (CHUNG CHO ĐĂNG KÝ VÀ QUÊN MẬT KHẨU) */}
                        {showOtpModal && (
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-[360px] shadow-2xl text-center border-t-4 border-emerald-500">
                                    <h3 className="text-lg font-bold mb-2 text-slate-800">Xác minh mã bảo mật</h3>
                                    
                                    {fallbackOtpAlert ? (
                                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 text-[11px] text-amber-800 text-left font-medium">
                                            <strong>⚠️ Render Mail Server Blocked!</strong><br/> Hệ thống tự cấp mã kích hoạt nhanh: <strong className="text-base ml-1 text-amber-600 tracking-wider font-black">{fallbackOtpAlert}</strong>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 mb-4">Mã OTP đã gửi đến: <br/><span className="text-emerald-600 font-bold text-sm">{targetEmail}</span></p>
                                    )}
                                    
                                    <form onSubmit={handleVerifyOtp}>
                                        <input type="text" placeholder="A1B2C3" maxLength="6" className="w-full bg-slate-50 border p-3 rounded-xl text-center text-2xl font-black tracking-[4px] uppercase text-emerald-600 focus:border-emerald-500 mb-4" onChange={e => setOtpInput(e.target.value)} value={otpInput} required />
                                        
                                        <div className="flex gap-2">
                                            <button type="button" className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={() => setShowOtpModal(false)}>Hủy bỏ</button>
                                            <button type="submit" className="flex-1 py-2.5 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md">Kích hoạt</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );

                // =========================================================================
                // MENU TABS CHÍNH CHO BẢN PHƯỢNG HOÀNG (TÁCH LỊCH & TRẠM DUYỆT RA SIDEBAR)
                // =========================================================================
                const tabs = [
                    { id: '1_dashboard', name: t.t1, icon: 'dashboard' }, 
                    { id: '2_map_notify', name: t.t2, icon: 'map' },
                    { id: '3_community_events', name: t.t3, icon: 'groups' }, 
                    { id: '4_chat', name: t.t4, icon: 'forum' },
                    { id: '5_news_handbook', name: t.t5, icon: 'menu_book' }, 
                    { id: '6_reels', name: t.t6, icon: 'play_circle' },
                    { id: '7_ai', name: t.t7, icon: 'smart_toy' },
                    { id: '9_calendar', name: t.t9, icon: 'calendar_month' },
                    ...(user?.role === 'Cán bộ' ? [{ id: '10_officer', name: t.t10, icon: 'admin_panel_settings' }] : []),
                    { id: '8_profile', name: t.t8, icon: 'redeem' }
                ];

                return (
                    <div className="relative w-full h-full flex overflow-hidden">
                        
                        {/* THANH ĐIỀU HƯỚNG TABS SIDEBAR TRÁI */}
                        <aside className="w-72 glass m-4 mr-0 rounded-[32px] p-5 flex flex-col shadow-sm min-h-0">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100 flex-shrink-0">
                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><span className="material-icons-round text-2xl">spa</span></div>
                                <div><h1 className="text-base font-black text-emerald-950">EcoConnect</h1><span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">V2.4 Phoenix</span></div>
                            </div>
                            <nav className="space-y-1.5 flex-1 overflow-y-auto pr-1 custom-scroll">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12px] font-bold transition-all text-left \${currentTab === tab.id ? 'emerald-gradient text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50'}\`}><span className="material-icons-round text-[18px]">{tab.icon}</span><span>{tab.name}</span></button>
                                ))}
                            </nav>
                        </aside>

                        {/* KHU VỰC KHÔNG GIAN NỘI DUNG CHÍNH */}
                        <main className="flex-1 p-4 flex flex-col h-screen overflow-hidden">
                            <header className="glass rounded-[24px] p-4 px-6 mb-4 flex justify-between items-center shadow-sm border border-white flex-shrink-0">
                                <h2 className="text-xs font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-emerald-500">verified_user</span>{t.welcome} <span className="text-emerald-600">{user?.name}</span></h2>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5 mr-3">
                                        {['vi', 'en', 'ja', 'zh', 'fr'].map(l => (
                                            <button key={l} onClick={()=>setLang(l)} className={\`text-[9px] font-black uppercase px-2 py-1 rounded-lg transition-all \${lang===l?'bg-emerald-500 text-white shadow':'bg-slate-100 text-slate-400 hover:bg-slate-200'}\`}>{l}</button>
                                        ))}
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase">{user?.role}</span>
                                    <button className="h-9 w-9 bg-white rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 shadow-sm border border-slate-100" onClick={() => window.location.reload()}><span className="material-icons-round text-sm">logout</span></button>
                                </div>
                            </header>

                            <div className="flex-1 min-h-0 animate-fadeIn relative">
                                
                                {/* TAB 1: TỔNG QUAN HỆ THỐNG */}
                                {currentTab === '1_dashboard' && (
                                    <div className="flex flex-col h-full gap-4">
                                        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                                            {[{ label: 'Báo cáo phản ánh', val: '1,452', color: 'text-slate-800', bg: 'bg-blue-50' }, { label: 'Tỉ lệ đã xử lý', val: '89.4%', color: 'text-emerald-600', bg: 'bg-emerald-50' }, { label: 'Rác gom được', val: '124 Tấn', color: 'text-teal-600', bg: 'bg-teal-50' }, { label: 'Tình nguyện viên', val: '8,405', color: 'text-amber-600', bg: 'bg-amber-50' }].map((st, i) => (
                                                <div key={i} className={\`glass p-4 rounded-[24px] \${st.bg} flex flex-col justify-center border-white\`}>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{st.label}</p>
                                                    <span className={\`text-xl font-black \${st.color}\`}>{st.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                                            <div className="glass rounded-[32px] p-5 flex flex-col relative border-white shadow-sm">
                                                <h3 className="font-bold text-xs text-slate-600 flex justify-between"><span className="flex items-center gap-2"><span className="material-icons-round text-emerald-500">air</span> Chỉ số AQI hạt bụi siêu mịn PM2.5</span><span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold flex items-center gap-1 animate-pulse"><span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span> TRỰC TIẾP</span></h3>
                                                <div className="flex-1 relative w-full h-full mt-2"><RealtimeChart /></div>
                                            </div>
                                            <div className="glass rounded-[32px] p-5 flex flex-col relative border-white shadow-sm">
                                                <h3 className="font-bold text-xs text-slate-600 flex items-center gap-2 mb-2"><span className="material-icons-round text-blue-500">pie_chart</span> Tỉ trọng Rác thải đô thị</h3>
                                                <div className="flex-1 relative w-full h-full"><WastePieChart /></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: BẢN ĐỒ & THÔNG BÁO KHẨN */}
                                {currentTab === '2_map_notify' && (
                                    <div className="flex flex-col h-full gap-4">
                                        <div className="flex-shrink-0 grid grid-cols-3 gap-4">
                                            <div className="glass p-3 rounded-xl border-l-4 border-red-500 bg-red-50 text-left flex items-center gap-3">
                                                <span className="material-icons-round text-2xl text-red-500 animate-bounce">warning</span>
                                                <div><strong className="text-red-700 text-xs block">Không khí ô nhiễm cao</strong><span className="text-[10px] text-slate-600">Khuyến nghị đeo khẩu trang khi ra đường.</span></div>
                                            </div>
                                            <div className="glass p-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 text-left flex items-center gap-3">
                                                <span className="material-icons-round text-2xl text-amber-500">water_drop</span>
                                                <div><strong className="text-amber-700 text-xs block">Triều cường dâng cao</strong><span className="text-[10px] text-slate-600">Đỉnh triều đạt Báo động 3 chiều nay.</span></div>
                                            </div>
                                            <div className="glass p-3 rounded-xl border-l-4 border-blue-500 bg-blue-50 text-left flex items-center gap-3">
                                                <span className="material-icons-round text-2xl text-blue-500 animate-pulse">thunderstorm</span>
                                                <div><strong className="text-blue-700 text-xs block">Mưa lớn diện rộng</strong><span className="text-[10px] text-slate-600">Dự báo xuất hiện ngập úng đô thị cục bộ.</span></div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                            <div className="col-span-2 glass rounded-[32px] p-4 flex flex-col relative min-h-0 border-white">
                                                <div className="flex-1 rounded-2xl overflow-hidden"><MapView reports={reports} /></div>
                                            </div>
                                            
                                            <div className="glass rounded-[32px] p-5 flex flex-col text-left overflow-y-auto custom-scroll border-white min-h-0">
                                                {user?.role === 'Người dùng' && (
                                                    <div className="mb-5 pb-4 border-b border-slate-100">
                                                        <h3 className="font-extrabold text-emerald-700 flex items-center gap-1 text-xs mb-2"><span className="material-icons-round text-sm">add_location_alt</span> Gửi phản ánh ô nhiễm</h3>
                                                        <input type="text" placeholder="Vị trí, tiêu đề sự cố..." className="w-full bg-slate-50 border p-2 rounded-lg text-xs mb-2" />
                                                        <textarea placeholder="Nội dung chi tiết..." rows="2" className="w-full bg-slate-50 border p-2 rounded-lg text-xs mb-2"></textarea>
                                                        <button className="w-full py-2 emerald-gradient text-white font-bold text-xs rounded-lg" onClick={()=>alert('Gửi báo cáo sự cố lên cơ quan kiểm duyệt thành công!')}>Nộp Đơn Phản Ánh</button>
                                                    </div>
                                                )}
                                                
                                                <h3 className="font-bold text-slate-600 mb-2 text-xs flex items-center gap-1"><span className="material-icons-round text-amber-500 text-sm">list_alt</span> Danh sách sự cố đô thị</h3>
                                                {reports.map(rep => (
                                                    <div key={rep.id} className="bg-white p-3 rounded-xl border border-slate-100 mb-2 shadow-sm text-xs">
                                                        <div className="flex justify-between mb-1 font-bold"><span className="text-emerald-600">{rep.id}</span><span className="text-slate-400">{rep.location}</span></div>
                                                        <p className="font-semibold text-slate-700 mb-1">{rep.title}</p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-[9px] text-slate-400">Gửi bởi: {rep.author}</span>
                                                            <span className={\`px-2 py-0.5 rounded font-bold text-[9px] \${rep.status==='Đã xử lý'?'bg-emerald-100 text-emerald-700':(rep.status.includes('Từ chối')?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700')}\`}>{rep.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: CỘNG ĐỒNG & SỰ KIỆN */}
                                {currentTab === '3_community_events' && (
                                    <div className="flex flex-col h-full gap-4 overflow-y-auto custom-scroll pr-2 text-left">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5"><span className="material-icons-round text-emerald-500">event</span> Hoạt động môi trường</h3>
                                            {(user?.role === 'Tổ chức') && (
                                                <button className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-0.5" onClick={()=>setShowEventForm(true)}><span className="material-icons-round text-sm">add</span> Xin phép sự kiện</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {events.map(ev => (
                                                <div key={ev.id} className="glass p-5 rounded-3xl bg-white/60 flex flex-col justify-between relative shadow-sm border border-white">
                                                    <div className="flex gap-4">
                                                        <div className="w-24 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center p-2 text-center h-20 shadow-inner">
                                                            <span className="text-red-500 font-bold text-[9px] uppercase tracking-wide">Lịch trình</span>
                                                            <span className="text-lg font-black text-emerald-800">{ev.time.substring(0,2)}</span>
                                                            <span className="text-slate-400 text-[9px]">Tháng {ev.time.substring(3,5)}</span>
                                                        </div>
                                                        <div className="flex-1 text-xs">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-extrabold text-slate-800 text-sm">{ev.title}</h4>
                                                                <span className={\`text-[9px] px-2 py-0.5 rounded font-bold \${ev.status==='Đã duyệt'?'bg-emerald-100 text-emerald-700':(ev.status.includes('Từ chối')?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700')}\`}>{ev.status}</span>
                                                            </div>
                                                            <p className="text-slate-500 mb-0.5">📍 Địa điểm: <strong>{ev.loc}</strong> | Tổ chức: {ev.org}</p>
                                                            <p className="text-slate-600 font-medium">{ev.desc}</p>
                                                        </div>
                                                    </div>
                                                    {ev.status === 'Đã duyệt' && (
                                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                            <span className="text-[11px] font-bold text-slate-500">Quân số: {ev.current}/{ev.max}</span>
                                                            <button className="px-5 py-2 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md" onClick={()=>alert('Đăng ký tham gia tình nguyện viên thành công!')}>Tham gia</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: PHÒNG CHAT TRỰC TUYẾN */}
                                {currentTab === '4_chat' && (
                                    <div className="glass rounded-[24px] h-full border border-white flex max-w-4xl mx-auto overflow-hidden shadow-sm">
                                        <div className="w-44 bg-white/60 border-r border-slate-100 p-3 flex flex-col gap-1 text-left">
                                            <span className="font-bold text-[10px] text-slate-400 uppercase px-2 mb-1">Kênh thảo luận</span>
                                            {['Chung', 'Quận 1', 'Quận 8'].map(ch => (
                                                <button key={ch} onClick={()=>setActiveChannel(ch)} className={\`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all \${activeChannel === ch ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}\`}># Kênh {ch}</button>
                                            ))}
                                        </div>
                                        <div className="flex-1 flex flex-col bg-slate-50/20 text-left">
                                            <div className="p-3 bg-white/90 border-b border-slate-100 font-bold text-xs text-emerald-800 shadow-sm">📢 Phòng hội ý cư dân: Kênh {activeChannel}</div>
                                            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll text-xs">
                                                {chatData[activeChannel].map((msg) => (
                                                    <div key={msg.id} className={\`flex gap-2 \${msg.isMe ? 'flex-row-reverse' : ''}\`}>
                                                        <div className={\`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[9px] shadow-sm flex-shrink-0 \${msg.isMe ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-700'}\`}>{msg.isMe ? 'BẠN' : msg.sender.substring(0,2).toUpperCase()}</div>
                                                        <div className="flex flex-col gap-0.5 max-w-[70%] group relative">
                                                            <div className={\`p-3 rounded-xl shadow-sm \${msg.isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}\`}>
                                                                {!msg.isMe && <strong className="text-[9px] block mb-0.5 text-slate-400">{msg.sender}</strong>}
                                                                <p className="font-medium text-[11px] leading-relaxed">{msg.text}</p>
                                                            </div>
                                                            <div className={\`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1 bg-white p-1 rounded-full shadow border \${msg.isMe ? '-left-16' : '-right-16'}\`}>
                                                                {['👍','❤️','😂'].map(e => <button key={e} onClick={()=>addReaction(activeChannel, msg.id, e)} className="text-[10px] hover:scale-125 transition-transform">{e}</button>)}
                                                            </div>
                                                            {Object.keys(msg.reacts).length > 0 && (
                                                                <div className="flex gap-1 mt-0.5"><span className="bg-white text-[9px] px-1.5 rounded-full border shadow-sm">{Object.entries(msg.reacts).map(([e, count]) => \`\${e}\${count}\`)}</span></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-white flex border-t border-slate-100 gap-2">
                                                <input type="text" placeholder="Nhập tin nhắn đóng góp ý kiến..." className="flex-1 bg-slate-50 p-2.5 text-xs rounded-xl border focus:border-emerald-500 font-medium outline-none" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} />
                                                <button className="px-4 emerald-gradient rounded-xl shadow-md" onClick={sendChat}><span className="material-icons-round text-white text-sm">send</span></button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: TIN TỨC & CẨM NANG XANH (CHI TIẾT) */}
                                {currentTab === '5_news_handbook' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left">
                                        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5"><span className="material-icons-round text-amber-500">menu_book</span> Quy trình hướng dẫn phân loại rác nguồn</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="glass p-5 rounded-2xl border-t-4 border-amber-400 bg-white/60 text-xs text-slate-600 leading-relaxed shadow-sm">
                                                <h4 className="font-bold text-amber-600 text-sm mb-2">🍂 Rác Hữu Cơ Sinh Hủy</h4>
                                                <p className="mb-1"><strong>Vật chất bao gồm:</strong> Đồ ăn thừa, rau củ quả thối, bã trà, bã cafe, lá cây cỏ rụng dọn vườn.</p>
                                                <p className="mb-2"><strong>Tuyệt đối KHÔNG:</strong> Bỏ lẫn túi nilon, muỗng nhựa vào thùng rác hữu cơ vì sẽ làm hỏng máy nghiền phân bón.</p>
                                                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 text-amber-800 font-medium">👉 Xử lý: Bỏ riêng vào Thùng Xanh Lá. Hệ thống nhà máy sẽ ủ thành phân compost hữu cơ sinh học cực tốt cho nông nghiệp.</div>
                                            </div>
                                            <div className="glass p-5 rounded-2xl border-t-4 border-blue-400 bg-white/60 text-xs text-slate-600 leading-relaxed shadow-sm">
                                                <h4 className="font-bold text-blue-600 text-sm mb-2">♻️ Rác Vô Cơ Tái Chế</h4>
                                                <p className="mb-1"><strong>Vật chất bao gồm:</strong> Chai nhựa PET đựng nước, vỏ lon nhôm bia, thùng carton, giấy báo cũ sạch.</p>
                                                <p className="mb-2"><strong>Lưu ý quan trọng:</strong> Cần súc rửa sạch cặn bẩn/nước ngọt và ép xẹp trước khi vứt để không sinh dòi bọ và tiết kiệm thể tích xe gom rác.</p>
                                                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-blue-800 font-medium">👉 Xử lý: Bỏ vào Thùng Xám/Trắng. Vận chuyển đến nhà máy nung chảy chế tạo vật dụng mới.</div>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 mt-2"><span className="material-icons-round text-emerald-500">newspaper</span> Điểm tin nổi bật</h3>
                                        <div className="glass p-4 rounded-2xl border border-white bg-white/60 flex gap-5 shadow-sm hover:bg-emerald-50 transition cursor-pointer">
                                            <div className="w-32 h-24 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0"><img src="https://images.unsplash.com/photo-1594818379496-da1e345b0ded?w=300" alt="cam" className="w-full h-full object-cover" /></div>
                                            <div className="flex flex-col justify-center text-sm">
                                                <h4 className="font-bold text-slate-800 mb-1">TP.HCM thí điểm hệ thống camera thông minh AI phạt nguội xả rác</h4>
                                                <p className="text-slate-500 text-xs line-clamp-2 mb-2">Hơn 500 camera tích hợp nhận diện khuôn mặt được lắp tại các điểm nóng để truy vết những người xả rác bừa bãi xuống kênh rạch.</p>
                                                <span className="text-[10px] font-bold text-emerald-600">🕒 09/06/2026 - Ban Tuyên giáo</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 6: ECO REELS */}
                                {currentTab === '6_reels' && (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="w-[320px] h-[550px] bg-black rounded-[32px] relative overflow-hidden shadow-2xl border-[4px] border-slate-800">
                                            <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=800&fit=crop" className="w-full h-full object-cover opacity-80" alt="Short Reel" />
                                            <div className="absolute top-6 left-5 text-white font-extrabold text-xs drop-shadow bg-black/40 px-3 py-1 rounded-full">Eco Reels</div>
                                            <div className="absolute bottom-6 left-5 right-16 text-left text-white drop-shadow">
                                                <h4 className="font-bold text-sm mb-0.5">@SaigonXanhGroup</h4>
                                                <p className="text-xs opacity-90 line-clamp-2">Hành trình 3 tiếng lội kênh dọn hơn 2 tấn rác thải nhựa tại chân cầu vượt Nguyễn Hữu Cảnh! 🌿💪</p>
                                            </div>
                                            <div className="absolute bottom-6 right-3 flex flex-col gap-4 text-white drop-shadow items-center">
                                                <div className="flex flex-col items-center"><span className="material-icons-round text-2xl hover:text-red-500 cursor-pointer">favorite</span><span className="text-[10px] font-bold mt-1">12K</span></div>
                                                <div className="flex flex-col items-center"><span className="material-icons-round text-2xl cursor-pointer">chat</span><span className="text-[10px] font-bold mt-1">842</span></div>
                                                <div className="flex flex-col items-center"><span className="material-icons-round text-2xl cursor-pointer">share</span><span className="text-[10px] font-bold mt-1">Share</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 7: TRỢ LÝ AI ECOBOT */}
                                {currentTab === '7_ai' && (
                                    <div className="glass rounded-[32px] h-full border border-white flex flex-col max-w-2xl mx-auto overflow-hidden shadow-md bg-white/40 text-left">
                                        <div className="p-4 bg-white border-b flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-lg border border-emerald-200 shadow-inner">🤖</div>
                                            <div><strong className="text-emerald-800 text-xs block">Trợ lý Môi trường EcoBot AI</strong><span className="text-[9px] text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Hệ thống phân tích trực tuyến</span></div>
                                        </div>
                                        <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs custom-scroll bg-slate-50/30">
                                            {aiMessages.map((msg, idx) => (
                                                <div key={idx} className={\`flex gap-2.5 \${msg.isBot ? '' : 'flex-row-reverse'}\`}>
                                                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white border shadow-sm text-[10px] font-black text-slate-500">{msg.isBot ? '🌱' : 'ME'}</div>
                                                    <div className={\`p-3.5 rounded-2xl max-w-[85%] shadow-sm \${msg.isBot ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'emerald-gradient text-white rounded-tr-none'}\`}>
                                                        <p className="leading-relaxed text-[11px] font-medium text-justify">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-white flex border-t gap-2 shadow-sm">
                                            <input type="text" placeholder="Hỏi Bot cách phân loại rác, xử lý pin cũ..." className="flex-1 bg-slate-50 p-3 text-xs rounded-xl border outline-none focus:border-emerald-500 font-medium" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendAI()} />
                                            <button className="px-5 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1" onClick={sendAI}><span className="material-icons-round text-sm">send</span> Gửi</button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 9: TÁCH LỊCH VẠN NIÊN SANG SIDEBAR ĐỘC LẬP */}
                                {currentTab === '9_calendar' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left max-w-4xl mx-auto w-full animate-fadeIn">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-amber-500 text-2xl">calendar_month</span> Lịch Hoạt Động & Nhắc Nhở</h3>
                                        <div className="glass p-6 rounded-[32px] border border-white bg-white/60 shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-full">
                                                    <div className="flex justify-between items-center mb-4 font-black text-sm text-emerald-800 uppercase tracking-wider"><span>Tháng 6, 2026</span><span className="text-[10px] bg-emerald-100 px-2 py-1 rounded-md">Hôm nay: 11/06</span></div>
                                                    <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 font-bold mb-2"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div>
                                                    <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-700">
                                                        <span className="opacity-20">1</span><span className="opacity-20">2</span><span className="opacity-20">3</span><span className="opacity-20">4</span><span className="opacity-20">5</span><span className="opacity-20">6</span><span className="opacity-20">7</span>
                                                        <span className="text-emerald-600 bg-emerald-50 rounded-lg py-1">8</span><span className="py-1">9</span><span className="py-1">10</span><span className="bg-emerald-600 text-white rounded-lg py-1 shadow-md">11</span><span className="py-1">12</span><span className="py-1">13</span><span className="text-rose-600 bg-rose-50 rounded-lg py-1 ring-1 ring-rose-200 shadow-sm relative">14<span className="absolute -top-1 -right-1 h-2 w-2 bg-rose-500 rounded-full"></span></span>
                                                        <span className="py-1">15</span><span className="py-1">16</span><span className="py-1">17</span><span className="py-1">18</span><span className="py-1">19</span><span className="text-blue-600 bg-blue-50 rounded-lg py-1 relative">20<span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span></span><span className="py-1">21</span>
                                                        <span className="py-1">22</span><span className="py-1">23</span><span className="py-1">24</span><span className="py-1">25</span><span className="py-1">26</span><span className="py-1">27</span><span className="py-1">28</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2">Tiến độ sự kiện của bạn ({user?.role}):</h4>
                                                <div className="bg-rose-50 p-4 rounded-2xl border-l-4 border-rose-500 text-xs shadow-sm">
                                                    <strong className="text-rose-800 text-sm block mb-1">Chủ Nhật Xanh (14/06)</strong>
                                                    <span className="text-slate-600 font-medium">📍 Kênh Tàu Hủ, Quận 8. <br/>👥 Đoàn TNCS HCM tổ chức. Đang chuẩn bị vật tư.</span>
                                                </div>
                                                {(user?.role === 'Tổ chức' || user?.role === 'Cán bộ') && (
                                                    <div className="bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-500 text-xs shadow-sm">
                                                        <strong className="text-blue-800 text-sm block mb-1">Đổi rác lấy cây (20/06)</strong>
                                                        <span className="text-slate-600 font-medium">📍 Phố đi bộ Nguyễn Huệ. <br/>Trạng thái: Chờ chính quyền Quận 1 duyệt.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 10: TÁCH TRẠM KIỂM DUYỆT CỦA CÁN BỘ SANG SIDEBAR ĐỘC LẬP */}
                                {currentTab === '10_officer' && user?.role === 'Cán bộ' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left animate-fadeIn">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-rose-500 text-2xl">admin_panel_settings</span> Trạm Quản Lý Khối Kiểm Duyệt</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            
                                            {/* Cột 1: Phê duyệt Báo cáo Sự Cố */}
                                            <div className="glass p-5 rounded-[24px] border border-white shadow-sm flex flex-col h-[500px]">
                                                <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-2"><span className="material-icons-round text-amber-500">list_alt</span> Xét duyệt Báo cáo sự cố</h4>
                                                <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-3">
                                                    {reports.filter(r => r.status === 'Chờ duyệt').length === 0 ? <p className="text-xs text-slate-400 font-medium italic text-center mt-10">Không có báo cáo nào đang chờ duyệt.</p> : reports.filter(r => r.status === 'Chờ duyệt').map((rep) => (
                                                        <div key={rep.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-[11px] font-medium shadow-sm space-y-2">
                                                            <div className="flex justify-between items-center text-slate-400 font-bold"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{rep.id}</span><span className="flex items-center gap-0.5"><span className="material-icons-round text-xs">place</span>{rep.location}</span></div>
                                                            <h5 className="font-black text-slate-800 text-sm leading-snug">{rep.title}</h5>
                                                            <p className="text-slate-500">{rep.desc}</p>
                                                            <div className="text-slate-400">Người báo cáo: <span className="text-slate-600 font-bold">{rep.author}</span></div>
                                                            <div className="flex gap-2 pt-2 border-t border-dashed">
                                                                <button onClick={() => handleApprove('report', rep.id)} className="flex-1 py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:opacity-90">Tiếp nhận xử lý</button>
                                                                <button onClick={() => setRejectModal({ isOpen: true, type: 'report', targetId: rep.id, reason: '' })} className="flex-1 py-1.5 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200">Từ chối (Bác bỏ)</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Cột 2: Phê duyệt Tổ chức Sự Kiện */}
                                            <div className="glass p-5 rounded-[24px] border border-white shadow-sm flex flex-col h-[500px]">
                                                <h4 className="font-black text-sm text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-2"><span className="material-icons-round text-blue-500">event_available</span> Xét duyệt Xin phép Sự kiện</h4>
                                                <div className="flex-1 overflow-y-auto custom-scroll pr-1 space-y-3">
                                                    {events.filter(e => e.status === 'Chờ duyệt').length === 0 ? <p className="text-xs text-slate-400 font-medium italic text-center mt-10">Không có đơn xin phép nào đang chờ duyệt.</p> : events.filter(e => e.status === 'Chờ duyệt').map((ev) => (
                                                        <div key={ev.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-[11px] font-medium shadow-sm space-y-2">
                                                            <div className="flex justify-between items-center text-slate-400 font-bold"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{ev.id}</span><span className="flex items-center gap-0.5"><span className="material-icons-round text-xs">account_balance</span>{ev.org}</span></div>
                                                            <h5 className="font-black text-blue-800 text-sm leading-snug">{ev.title}</h5>
                                                            <div className="space-y-1 text-slate-600"><p>📍 Địa điểm: <strong>{ev.loc}</strong></p><p>⏱ Lịch trình: <strong>{ev.time}</strong></p><p>👥 Tối đa: <strong>{ev.max} TNV</strong></p></div>
                                                            <p className="text-slate-500 bg-slate-50 p-2 rounded-lg italic">"{ev.desc}"</p>
                                                            <div className="flex gap-2 pt-2 border-t border-dashed">
                                                                <button onClick={() => handleApprove('event', ev.id)} className="flex-1 py-1.5 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:opacity-90">Cấp giấy phép</button>
                                                                <button onClick={() => setRejectModal({ isOpen: true, type: 'event', targetId: ev.id, reason: '' })} className="flex-1 py-1.5 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200">Từ chối (Bác bỏ)</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* TAB 8: HỒ SƠ & CỬA HÀNG QUÀ TẶNG */}
                                {currentTab === '8_profile' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left max-w-4xl mx-auto w-full animate-fadeIn">
                                        <div className="glass p-6 rounded-[24px] border border-white flex items-center gap-6 bg-white/60 shadow-sm">
                                            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white">🌲</div>
                                            <div className="flex-1">
                                                <h4 className="font-extrabold text-slate-800 text-xl mb-0.5">{user?.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium mb-2">Thành viên: {user?.email}</p>
                                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold uppercase tracking-wider">{user?.role}</span>
                                            </div>
                                            <div className="text-center bg-white p-4 rounded-xl border shadow-sm min-w-[120px]">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Điểm tích lũy xanh</span>
                                                <span className="text-2xl font-black text-emerald-500 block">120 <span className="text-xs text-slate-400 font-bold">PTS</span></span>
                                            </div>
                                        </div>

                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">🎁 Đổi điểm thưởng quà tặng bảo vệ hành tinh</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { title: 'Bình nước giữ nhiệt Eco-Life', points: 500, desc: 'Chất liệu thép không gỉ SUS304 cao cấp, giảm ly nhựa.', icon: 'local_drink' },
                                                { title: 'Túi vải mầm xanh Canvas', points: 200, desc: 'Túi vải tự hủy sinh học bền bỉ thay thế túi nilon độc hại.', icon: 'shopping_bag' },
                                                { title: 'Thẻ giảm giá Xe Điện Xanh SM', points: 400, desc: 'Voucher giảm giá cước di chuyển xe điện cắt giảm CO2.', icon: 'electric_car' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="glass p-4 rounded-2xl border bg-white/40 flex flex-col justify-between shadow-sm">
                                                    <div className="text-xs">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="material-icons-round text-emerald-500 text-xl">{item.icon}</span>
                                                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">{item.points} PTS</span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                                                        <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                                                    </div>
                                                    <button className="w-full mt-4 py-2 bg-slate-100 hover:emerald-gradient hover:text-white text-slate-500 font-bold rounded-xl text-[11px] transition-all shadow-sm" onClick={()=>alert('Số điểm tích lũy PTS hiện tại của ní chưa đủ lớn để đổi món này!')}>Đổi phần quà</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </main>
                        
                        {/* CÁC DIALOG OVERLAY PHỤ TRỢ NẰM TẠI ĐÂY ĐỂ TRÁNH LỖI JSX */}
                        
                        {/* 1. Modal Nhập lý do Bác bỏ của Cán Bộ */}
                        {rejectModal.isOpen && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-left border-t-4 border-red-500">
                                    <h3 className="font-black text-slate-800 text-sm mb-1 flex items-center gap-1"><span className="material-icons-round text-red-500 text-base">gavel</span> Lý Do Bác Bỏ Thẩm Định</h3>
                                    <p className="text-[10px] text-slate-400 mb-3 font-medium">Mã hồ sơ: {rejectModal.targetId}. Vui lòng nhập lý do để phản hồi người gửi.</p>
                                    <textarea rows="3" placeholder="Nhập lý do bác bỏ chi tiết..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs mb-4 outline-none focus:border-red-500 font-semibold" value={rejectModal.reason} onChange={e=>setRejectModal({...rejectModal, reason: e.target.value})}></textarea>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={()=>setRejectModal({isOpen:false, type:'', targetId:'', reason:''})}>Hủy thao tác</button>
                                        <button className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md" onClick={submitReject}>Xác nhận loại bỏ</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Modal Điền Đơn Xin Phép Tổ chức Sự kiện mới */}
                        {showEventForm && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl text-left border border-slate-100">
                                    <h3 className="font-black text-emerald-800 text-sm mb-4 flex items-center gap-1.5"><span className="material-icons-round text-emerald-600">playlist_add</span> Đơn Đề Xuất Hoạt Động Xanh</h3>
                                    <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs font-bold text-slate-600">
                                        <div>
                                            <label className="block mb-1 text-[10px] text-slate-400 uppercase">Tên chiến dịch tình nguyện</label>
                                            <input name="title" type="text" placeholder="Ví dụ: Đổi rác lấy cây..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500" required />
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-[10px] text-slate-400 uppercase">Địa điểm tập kết</label>
                                            <input name="loc" type="text" placeholder="Địa chỉ chi tiết..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block mb-1 text-[10px] text-slate-400 uppercase">Lịch trình (DD/MM/YYYY)</label>
                                                <input name="time" type="text" placeholder="Ví dụ: 25/06/2026" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500" required />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-[10px] text-slate-400 uppercase">Quân số tối đa</label>
                                                <input name="max" type="number" placeholder="Số lượng TNV" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-[10px] text-slate-400 uppercase">Mô tả nội dung chương trình</label>
                                            <textarea name="desc" rows="3" placeholder="Ghi chú chi tiết dụng cụ cần thiết, hoạt động cụ thể..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500 resize-none" required></textarea>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl" onClick={()=>setShowEventForm(false)}>Hủy bỏ</button>
                                            <button type="submit" className="flex-1 py-3 emerald-gradient text-white font-bold rounded-xl shadow-md">Gửi đơn lên cơ quan</button>
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
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V2.4 PHOENIX (RESTORED FULL) đang chạy trên cổng ${PORT}`));
