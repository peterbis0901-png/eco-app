/**
 * 🌱 ECOCONNECT HCM - BẢN V2.5 (SUPREME PHOENIX MASTERPIECE)
 * - Tái sinh từ V2.4: Giữ nguyên 100% Cán bộ duyệt đơn, Bản đồ, Pie Chart, Lịch vạn niên.
 * - NEW: Đa ngôn ngữ (5 thứ tiếng) áp dụng cho TOÀN BỘ ứng dụng.
 * - NEW: Đánh giá sức mạnh mật khẩu, Xác nhận mật khẩu, Ẩn/Hiện mật khẩu.
 * - NEW: Khung đọc Báo/Tin tức Full-screen, AI EcoBot thông minh hơn.
 * - NEW: Thanh thả Emoji trong Chat, Kho Eco Reels mở rộng.
 * - NEW: Quà tặng đa dạng, Thông báo tri ân khi đổi quà.
 * - NEW: Tab Giao Thông Xanh (Tra cứu xe buýt TP.HCM, Đặt xe điện Xanh SM). Tích hợp tìm đường đi sự kiện.
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

// API Quên Mật Khẩu
app.post('/api/auth/forgot-request', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập Email!' });
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

app.post('/api/auth/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;
    const session = otpStore[email];
    if (!session || session.type !== 'forgot' || Date.now() > session.expires) return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' });
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Mã OTP sai!' });

    const userIndex = users.findIndex(u => u.email === email);
    if(userIndex !== -1) users[userIndex].password = newPassword;
    
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Đổi mật khẩu mới thành công!' });
});

// =========================================================================
// REACT SPA GIAO DIỆN
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect - Supreme Phoenix Masterpiece</title>
        
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
            .glass { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.1); }
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
            // BỘ TỪ ĐIỂN SIÊU TO KHỔNG LỒ (5 NGÔN NGỮ)
            const dict = {
                vi: {
                    slogan: "🌿 EcoConnect - Đánh thức mầm xanh, Chữa lành Trái Đất 🌍",
                    welcome: "Hệ thống giám sát:",
                    t1: "Tổng quan hệ thống", t2: "Bản đồ & Thông báo", t3: "Cộng đồng & Sự kiện", t4: "Phòng chat", t5: "Tin tức & Cẩm nang", t6: "Eco Reels", t7: "AI Môi trường", t8: "Quà tặng", t9: "Lịch Hoạt Động", t10: "Trạm Kiểm Duyệt Cán Bộ", t11: "Giao thông Xanh",
                    login: "Đăng nhập", register: "Đăng ký", forgot: "Quên mật khẩu", roleUser: "Người dùng", roleOff: "Cán bộ", roleOrg: "Tổ chức",
                    name: "Họ và tên", email: "Email", pass: "Mật khẩu", confirmPass: "Xác nhận mật khẩu",
                    weak: "Yếu", fair: "Trung bình", strong: "Mạnh", passMatchErr: "Mật khẩu xác nhận không khớp!",
                    agree: "Tôi đồng ý với", terms: "Chính sách Điều khoản",
                    botGreeting: "Xin chào! Mình là trợ lý thông minh EcoBot 🤖🌱. Mình có thể giúp gì cho bạn?",
                    thanksReward: "Cảm ơn bạn đã cống hiến vì cộng đồng và vì sự sống của Trái Đất! Phần quà nhỏ này thay cho lời tri ân sâu sắc nhất từ EcoConnect. 🌍❤️",
                    bookRide: "Đặt xe Xanh SM", findBus: "Tìm tuyến Xe Buýt",
                    news1Title: "Hội nghị Biến đổi khí hậu Toàn Cầu 2026", news1Desc: "Các quốc gia cam kết cắt giảm 50% lượng khí thải carbon vào năm 2030...",
                    news2Title: "TP.HCM ra mắt xe buýt điện 100%", news2Desc: "Tuyến xe buýt xanh không khói bụi chính thức đi vào hoạt động phục vụ người dân...",
                    news3Title: "Phát hiện loài rùa biển quý hiếm quay lại sinh sản", news3Desc: "Nhờ nỗ lực làm sạch đại dương, sinh vật biển đang dần hồi sinh mạnh mẽ..."
                },
                en: {
                    slogan: "🌿 EcoConnect - Awaken Green, Heal the Earth 🌍", welcome: "Monitoring System:",
                    t1: "Dashboard", t2: "Map & Alerts", t3: "Events", t4: "Live Chat", t5: "News & Guide", t6: "Eco Reels", t7: "AI Assistant", t8: "Rewards", t9: "Calendar", t10: "Officer Hub", t11: "Eco Transit",
                    login: "Login", register: "Register", forgot: "Forgot Password", roleUser: "User", roleOff: "Officer", roleOrg: "Organization",
                    name: "Full Name", email: "Email", pass: "Password", confirmPass: "Confirm Password",
                    weak: "Weak", fair: "Fair", strong: "Strong", passMatchErr: "Passwords do not match!",
                    agree: "I agree to the", terms: "Terms and Policies",
                    botGreeting: "Hello! I am EcoBot 🤖🌱. How can I help you today?",
                    thanksReward: "Thank you for contributing to the community and the Earth! This small gift is a token of our deepest gratitude. 🌍❤️",
                    bookRide: "Book Eco Ride", findBus: "Find Bus Route",
                    news1Title: "Global Climate Change Summit 2026", news1Desc: "Nations pledge to cut carbon emissions by 50% by 2030...",
                    news2Title: "HCMC launches 100% electric buses", news2Desc: "Zero-emission green bus routes are officially in service...",
                    news3Title: "Rare sea turtles return to nest", news3Desc: "Thanks to ocean cleanup efforts, marine life is strongly reviving..."
                },
                ja: {
                    slogan: "🌿 EcoConnect - 緑の芽を目覚めさせ、地球を癒す 🌍", welcome: "監視システム:",
                    t1: "ダッシュボード", t2: "マップと通知", t3: "イベント", t4: "チャット", t5: "ニュース", t6: "エコリール", t7: "AI アシスタント", t8: "報酬", t9: "カレンダー", t10: "承認ハブ", t11: "エコ交通",
                    login: "ログイン", register: "登録", forgot: "パスワードを忘れた", roleUser: "ユーザー", roleOff: "役員", roleOrg: "組織",
                    name: "氏名", email: "Eメール", pass: "パスワード", confirmPass: "パスワードの確認",
                    weak: "弱い", fair: "普通", strong: "強い", passMatchErr: "パスワードが一致しません！",
                    agree: "同意します", terms: "利用規約",
                    botGreeting: "こんにちは！エコボットです 🤖🌱。地球のために何ができますか？",
                    thanksReward: "コミュニティと地球への貢献に感謝します！この小さな贈り物は、私たちの深い感謝の印です。🌍❤️",
                    bookRide: "エコライドを予約", findBus: "バスルートを検索",
                    news1Title: "2026年気候変動サミット", news1Desc: "各国は2030年までに炭素排出量を50%削減することを約束...",
                    news2Title: "ホーチミン市、100%電気バスを導入", news2Desc: "ゼロエミッションの緑のバス路線が正式に運行開始...",
                    news3Title: "希少なウミガメが産卵に帰還", news3Desc: "海洋清掃の努力のおかげで、海洋生物が力強く復活しています..."
                },
                zh: {
                    slogan: "🌿 EcoConnect - 唤醒绿芽，治愈地球 🌍", welcome: "监控系统:",
                    t1: "仪表板", t2: "地图与通知", t3: "活动", t4: "聊天", t5: "新闻", t6: "短视频", t7: "AI 助手", t8: "奖励", t9: "日历", t10: "审批中心", t11: "生态交通",
                    login: "登录", register: "注册", forgot: "忘记密码", roleUser: "用户", roleOff: "官员", roleOrg: "组织",
                    name: "全名", email: "电子邮件", pass: "密码", confirmPass: "确认密码",
                    weak: "弱", fair: "中", strong: "强", passMatchErr: "密码不匹配！",
                    agree: "我同意", terms: "条款和政策",
                    botGreeting: "你好！我是 EcoBot 🤖🌱。今天我能为你做什么？",
                    thanksReward: "感谢您为社区和地球做出的贡献！这份小礼物代表了我们最深切的感激。🌍❤️",
                    bookRide: "预订环保车", findBus: "查找公交路线",
                    news1Title: "2026年全球气候变化峰会", news1Desc: "各国承诺到2030年将碳排放削减50%...",
                    news2Title: "胡志明市推出100%电动公交车", news2Desc: "零排放绿色公交路线正式投入服务...",
                    news3Title: "罕见海龟回归筑巢", news3Desc: "多亏了海洋清理工作，海洋生物正在强力复苏..."
                },
                fr: {
                    slogan: "🌿 EcoConnect - Éveillez les pousses, Guérissez la Terre 🌍", welcome: "Système:",
                    t1: "Tableau de bord", t2: "Carte & Alertes", t3: "Événements", t4: "Chat", t5: "Actualités", t6: "Reels", t7: "IA", t8: "Récompenses", t9: "Calendrier", t10: "Approbations", t11: "Transport Éco",
                    login: "Connexion", register: "S'inscrire", forgot: "Mot de passe oublié", roleUser: "Utilisateur", roleOff: "Officier", roleOrg: "Organisation",
                    name: "Nom complet", email: "Email", pass: "Mot de passe", confirmPass: "Confirmer le mot de passe",
                    weak: "Faible", fair: "Moyen", strong: "Fort", passMatchErr: "Les mots de passe ne correspondent pas!",
                    agree: "J'accepte les", terms: "Termes et Politiques",
                    botGreeting: "Bonjour ! Je suis EcoBot 🤖🌱. Comment puis-je vous aider ?",
                    thanksReward: "Merci de contribuer à la communauté et à la Terre ! Ce petit cadeau est un témoignage de notre profonde gratitude. 🌍❤️",
                    bookRide: "Réserver trajet Éco", findBus: "Trouver Bus",
                    news1Title: "Sommet mondial sur le climat 2026", news1Desc: "Les pays s'engagent à réduire de 50% d'ici 2030...",
                    news2Title: "Hô Chi Minh lance des bus 100% électriques", news2Desc: "Des lignes de bus vertes zéro émission sont en service...",
                    news3Title: "Les tortues de mer rares reviennent nicher", news3Desc: "Grâce au nettoyage, la vie marine renaît..."
                }
            };

            const initialReports = [
                { id: "REP-001", title: "Bãi rác tự phát dưới chân cầu chữ Y gây bốc mùi", location: "Quận 8", status: "Chờ duyệt", type: "Trash", lat: 10.742, lng: 106.635, author: "Nguyễn Văn An", desc: "Người dân đổ rác trộm lúc nửa đêm." },
                { id: "REP-002", title: "Cơ sở nhuộm xả thải đen ngòm ra kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", lat: 10.782, lng: 106.685, author: "Trần Thị Bình", desc: "Nước có màu đen kịt." },
            ];
            const initialEvents = [
                { id: "EV-01", title: "Chủ Nhật Xanh lần thứ 145", loc: "Nhà thiếu nhi Quận 8", time: "14/06/2026", status: "Đã duyệt", current: 45, max: 100, org: "Đoàn TNCS HCM", desc: "Vớt rác lục bình và dọn cỏ." },
                { id: "EV-02", title: "Đổi Rác Nhựa Lấy Cây Xanh", loc: "Phố đi bộ Nguyễn Huệ", time: "20/06/2026", status: "Chờ duyệt", current: 0, max: 500, org: "Cộng đồng Sài Gòn Xanh", desc: "Thu gom chai nhựa tái chế đổi sen đá." }
            ];

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

            function checkPasswordStrength(pw) {
                if(pw.length < 5) return 'weak';
                if(pw.length > 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong';
                return 'fair';
            }

            function App() {
                const [lang, setLang] = React.useState('vi');
                const [isAppLoading, setIsAppLoading] = React.useState(true);
                const t = dict[lang];

                const [user, setUser] = React.useState(null); 
                const [view, setView] = React.useState('auth'); 
                const [authTab, setAuthTab] = React.useState('register'); 
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                const [currentTab, setCurrentTab] = React.useState('1_dashboard'); 
                
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', confirmPassword: '', adminCode: '', terms: false });
                const [resetForm, setResetForm] = React.useState({ email: '', newPassword: '' });
                const [showPass, setShowPass] = React.useState(false);
                const [otpAction, setOtpAction] = React.useState('register'); 

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
                const [selectedNews, setSelectedNews] = React.useState(null);

                // Quản lý Chat & Emoji
                const [activeChannel, setActiveChannel] = React.useState('Chung');
                const [chatInput, setChatInput] = React.useState('');
                const [showEmoji, setShowEmoji] = React.useState(false);
                const [chatData, setChatData] = React.useState({
                    'Chung': [ { id:1, sender: 'Minh Thư', text: 'Kênh Nhiêu Lộc đỡ mùi rồi!', isMe: false, reacts: { '❤️': 2 } } ],
                    'Quận 1': [ { id:2, sender: 'Hoàng', text: 'Góc đường Phạm Ngũ Lão rác nhiều.', isMe: false, reacts: {} } ],
                    'Quận 8': [ { id:3, sender: 'Nam', text: 'Chân cầu chữ Y rác bốc mùi quá.', isMe: false, reacts: { '👍': 1 } } ]
                });
                
                // Quản lý AI
                const [aiInput, setAiInput] = React.useState('');
                const [aiMessages, setAiMessages] = React.useState([]);

                React.useEffect(() => { setTimeout(() => setIsAppLoading(false), 2000); }, []);
                React.useEffect(() => { setAiMessages([{ sender: 'EcoBot', text: dict[lang].botGreeting, isBot: true }]); }, [lang]);

                // XỬ LÝ ĐĂNG KÝ
                const handleRegisterRequest = async (e) => {
                    e.preventDefault();
                    if(!formData.name || !formData.email || !formData.password) return alert("Fill all info!");
                    if(formData.password !== formData.confirmPassword) return alert(t.passMatchErr);
                    if(!formData.terms) return alert("Agree to terms!");

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
                    } catch (err) { setLoading(false); alert("Error connecting server!"); }
                };

                // XỬ LÝ QUÊN MẬT KHẨU
                const handleForgotRequest = async (e) => {
                    e.preventDefault();
                    if(!resetForm.email) return alert("Email required!");
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
                    } catch (err) { setLoading(false); alert("Error!"); }
                };

                // XÁC THỰC OTP
                const handleVerifyOtp = async (e) => {
                    e.preventDefault();
                    if(!otpInput) return;
                    if (otpAction === 'register') {
                        try {
                            const res = await fetch('/api/auth/register-verify', {
                                method: 'POST', headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ email: targetEmail, code: otpInput })
                            });
                            const data = await res.json();
                            if(data.success) {
                                setShowOtpModal(false);
                                setUser({email: targetEmail, name: formData.name, role: currentRole, points: 100}); 
                                setView('dashboard'); 
                            } else { alert(data.message); }
                        } catch (err) { alert("Error OTP!"); }
                    } else {
                        setShowOtpModal(false);
                        setAuthTab('reset');
                    }
                };

                const handleResetPassword = async (e) => {
                    e.preventDefault();
                    try {
                        const res = await fetch('/api/auth/reset-password', {
                            method: 'POST', headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: targetEmail, code: otpInput, newPassword: resetForm.newPassword })
                        });
                        const data = await res.json();
                        if(data.success) {
                            alert('Password Changed!');
                            setAuthTab('login');
                        } else { alert(data.message); }
                    } catch (err) { alert("Error!"); }
                };

                const handleLogin = (e) => {
                    e.preventDefault();
                    if(!formData.email || !formData.password) return;
                    const extractedName = formData.email.split('@')[0];
                    setUser({ name: extractedName.charAt(0).toUpperCase() + extractedName.slice(1), email: formData.email, role: currentRole, points: 250 });
                    setView('dashboard');
                };

                // CHAT CỘNG ĐỒNG & EMOJI
                const sendChat = (textToAdd = chatInput) => {
                    if(!textToAdd.trim()) return;
                    const newMsg = { id: Date.now(), sender: 'ME', text: textToAdd, isMe: true, reacts: {} };
                    setChatData({ ...chatData, [activeChannel]: [...chatData[activeChannel], newMsg] });
                    setChatInput('');
                    setShowEmoji(false);
                };
                const addReaction = (channel, msgId, emoji) => {
                    const updated = chatData[channel].map(m => {
                        if(m.id === msgId) {
                            return { ...m, reacts: { ...m.reacts, [emoji]: (m.reacts[emoji] || 0) + 1 } };
                        }
                        return m;
                    });
                    setChatData({ ...chatData, [channel]: updated });
                };

                // THUẬT TOÁN AI
                const sendAI = () => {
                    if(!aiInput.trim()) return;
                    const q = aiInput.toLowerCase();
                    const newMsg = [...aiMessages, { sender: 'ME', text: aiInput, isBot: false }];
                    setAiMessages(newMsg);
                    setAiInput('');
                    
                    let reply = "EcoBot đang phân tích... Dữ liệu này sẽ được ghi nhận. 🌱";
                    if(q.includes('rác') || q.includes('phân loại')) reply = "💡 Rác hữu cơ bỏ thùng xanh lá. Rác vô cơ tái chế (nhựa, giấy) bỏ thùng xám nha!";
                    else if(q.includes('pin') || q.includes('điện tử')) reply = "⚠️ Pin cũ chứa chì, thủy ngân. Đem tới trạm thu hồi pin xanh của TP, tuyệt đối không vứt bừa!";
                    else if(q.includes('cây')) reply = "🌳 Cây xanh lọc bụi mịn PM2.5. Tham gia tab 'Sự kiện' để trồng cây nhé!";
                    else if(q.includes('khí hậu') || q.includes('năng lượng')) reply = "🌍 Biến đổi khí hậu đang nghiêm trọng. Hãy ưu tiên dùng xe buýt, xe điện Xanh SM và tắt điện khi không dùng nhé!";
                    else if(q.includes('động vật')) reply = "🐢 Nhiều loài động vật biển đang chết vì rác nhựa. Hãy hạn chế dùng đồ nhựa một lần để bảo vệ chúng!";

                    setTimeout(() => { setAiMessages([...newMsg, { sender: 'EcoBot', text: reply, isBot: true }]); }, 600);
                };

                const handleApprove = (type, id) => {
                    if(type === 'report') setReports(reports.map(r => r.id === id ? {...r, status: 'Đã xử lý'} : r));
                    else setEvents(events.map(e => e.id === id ? {...e, status: 'Đã duyệt'} : e));
                };
                const submitReject = () => {
                    if(rejectModal.type === 'report') setReports(reports.map(r => r.id === rejectModal.targetId ? {...r, status: 'Từ chối'} : r));
                    else setEvents(events.map(e => e.id === rejectModal.targetId ? {...e, status: 'Từ chối'} : e));
                    setRejectModal({ isOpen: false, type: '', targetId: '', reason: '' });
                };

                const handleCreateEvent = (e) => {
                    e.preventDefault();
                    const newEv = { id: "EV-0" + (events.length + 1), title: e.target.title.value, loc: e.target.loc.value, time: e.target.time.value, status: "Chờ duyệt", current: 0, max: e.target.max.value, org: user.name, desc: e.target.desc.value };
                    setEvents([...events, newEv]);
                    setShowEventForm(false);
                };

                const pwStrength = checkPasswordStrength(formData.password);

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
                    <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn relative">
                        <div className="absolute top-6 right-6 flex gap-1.5 glass px-3 py-2 rounded-2xl shadow-sm z-50">
                            {['vi', 'en', 'ja', 'zh', 'fr'].map(l => (
                                <button key={l} onClick={()=>setLang(l)} className={\`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl transition-all \${lang===l?'bg-emerald-500 text-white shadow':'text-slate-500 hover:bg-white'}\`}>{l}</button>
                            ))}
                        </div>

                        <div className="glass w-full max-w-[440px] p-8 rounded-[32px] text-center border border-white shadow-2xl">
                            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl mb-4"><span className="material-icons-round text-3xl">spa</span></div>
                            <h1 className="text-2xl font-extrabold mb-1 text-slate-800">EcoConnect</h1>
                            <p className="text-slate-500 text-xs mb-6 font-medium">{t.slogan}</p>

                            {(authTab === 'register' || authTab === 'login') && (
                                <div className="grid grid-cols-3 gap-2 py-1 mb-5 bg-slate-100 p-1 rounded-xl">
                                    {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => {
                                        const rLabel = r === 'Người dùng' ? t.roleUser : (r === 'Cán bộ' ? t.roleOff : t.roleOrg);
                                        return <button type="button" key={r} onClick={() => setCurrentRole(r)} className={\`py-2 text-xs font-bold rounded-lg transition-all \${currentRole === r ? 'emerald-gradient text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}\`}>{rLabel}</button>
                                    })}
                                </div>
                            )}

                            {authTab === 'register' && (
                                <form onSubmit={handleRegisterRequest} className="space-y-3 text-left">
                                    <input type="text" placeholder={t.name} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                    <input type="email" placeholder={t.email} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                    
                                    <div className="relative">
                                        <input type={showPass ? 'text' : 'password'} placeholder={t.pass} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                        <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"><span className="material-icons-round text-sm">{showPass ? 'visibility' : 'visibility_off'}</span></button>
                                    </div>
                                    {formData.password && (
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div className={\`h-full \${pwStrength==='weak'?'w-1/3 bg-red-500':(pwStrength==='fair'?'w-2/3 bg-amber-500':'w-full bg-emerald-500')}\`}></div>
                                            </div>
                                            <span className={\`text-[10px] font-bold \${pwStrength==='weak'?'text-red-500':(pwStrength==='fair'?'text-amber-500':'text-emerald-500')}\`}>{pwStrength==='weak'?t.weak:(pwStrength==='fair'?t.fair:t.strong)}</span>
                                        </div>
                                    )}

                                    <input type="password" placeholder={t.confirmPass} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} value={formData.confirmPassword} required />
                                    
                                    {currentRole === 'Cán bộ' && <input type="text" placeholder="ADMIN123" className="w-full bg-emerald-50 border-2 border-emerald-300 p-3 rounded-xl text-xs font-bold text-emerald-800" onChange={e => setFormData({...formData, adminCode: e.target.value})} value={formData.adminCode} required />}

                                    <div className="flex items-start gap-2 pt-1 text-xs text-slate-500">
                                        <input type="checkbox" className="mt-0.5 accent-emerald-500" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                        <label>{t.agree} <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>{t.terms}</span></label>
                                    </div>

                                    <button type="submit" className="w-full py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs uppercase shadow-lg flex justify-center items-center gap-2" disabled={loading}>
                                        {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t.register}
                                    </button>
                                    <p className="text-xs text-slate-400 text-center cursor-pointer hover:text-emerald-600" onClick={() => setAuthTab('login')}>{t.login}</p>
                                </form>
                            )}

                            {authTab === 'login' && (
                                <form onSubmit={handleLogin} className="space-y-4 text-left">
                                    <input type="email" placeholder={t.email} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                    <div className="relative">
                                        <input type={showPass ? 'text' : 'password'} placeholder={t.pass} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                        <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"><span className="material-icons-round text-sm">{showPass ? 'visibility' : 'visibility_off'}</span></button>
                                    </div>
                                    <div className="text-right"><span className="text-[10px] font-bold text-emerald-600 cursor-pointer hover:underline" onClick={() => switchAuth('forgot')}>{t.forgot}</span></div>
                                    <button type="submit" className="w-full py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs uppercase shadow-lg">{t.login}</button>
                                    <p className="text-xs text-slate-400 text-center cursor-pointer hover:text-emerald-600" onClick={() => switchAuth('register')}>{t.register}</p>
                                </form>
                            )}

                            {authTab === 'forgot' && (
                                <form onSubmit={handleForgotRequest} className="space-y-4 text-left">
                                    <div className="text-center mb-4"><h3 className="font-bold text-slate-800">{t.forgot}</h3></div>
                                    <input type="email" placeholder={t.email} className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setResetForm({...resetForm, email: e.target.value})} value={resetForm.email} required />
                                    <div className="flex gap-2">
                                        <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={() => switchAuth('login')}>Back</button>
                                        <button type="submit" className="flex-1 py-3 emerald-gradient rounded-xl text-white font-bold text-xs shadow-lg">Send OTP</button>
                                    </div>
                                </form>
                            )}

                            {authTab === 'reset' && (
                                <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                                    <div className="text-center mb-4"><h3 className="font-bold text-slate-800">New Password</h3></div>
                                    <div className="relative">
                                        <input type={showPass ? 'text' : 'password'} placeholder="New Password" className="w-full bg-white/80 border border-slate-200 p-3 rounded-xl text-xs" onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} value={resetForm.newPassword} required />
                                        <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"><span className="material-icons-round text-sm">{showPass ? 'visibility' : 'visibility_off'}</span></button>
                                    </div>
                                    <button type="submit" className="w-full py-3.5 emerald-gradient rounded-xl text-white font-bold text-xs shadow-lg">Update</button>
                                </form>
                            )}
                        </div>

                        {showTerms && (
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-[550px] rounded-3xl p-8 shadow-2xl">
                                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                                        <h3 className="text-base font-black text-emerald-800 uppercase">QUY CHẾ & ĐIỀU KHOẢN</h3>
                                        <span className="material-icons-round text-slate-400 cursor-pointer hover:text-red-500" onClick={() => setShowTerms(false)}>close</span>
                                    </div>
                                    <div className="space-y-4 text-xs text-slate-600 h-80 overflow-y-auto pr-3 custom-scroll text-justify leading-relaxed font-medium">
                                        <p><strong className="text-emerald-700">Điều 1. Phạm vi áp dụng:</strong> EcoConnect là cổng thông tin tiếp nhận, điều phối, giám sát môi trường. Hướng đến đô thị xanh - sạch - đẹp.</p>
                                        <p><strong className="text-emerald-700">Điều 2. Trách nhiệm định danh:</strong> Thành viên đăng ký phải cung cấp chính xác thông tin. Dữ liệu được mã hóa an toàn.</p>
                                        <p><strong className="text-emerald-700">Điều 3. Quy chế phản ánh sự cố:</strong> Người dùng cam kết chỉ gửi thông tin có thực kèm tọa độ. Lạm dụng tính năng báo cáo sẽ bị khóa tài khoản.</p>
                                        <div className="mb-2"><strong className="text-red-600">Điều 4. Hành vi bị NGHIÊM CẤM:</strong> 
                                            <ul className="list-disc pl-5 mt-1.5 space-y-1.5"><li>Văng tục, lăng mạ người khác.</li><li>Phát tán thông tin giả mạo (Fake News).</li></ul>
                                        </div>
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mt-4 text-red-700">
                                            <strong>⚠️ ĐIỀU 5. CHẾ TÀI XỬ PHẠT:</strong> Vi phạm sẽ bị <strong className="font-black">KHÓA VĨNH VIỄN</strong> và chuyển log IP đến cơ quan chức năng.
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3.5 emerald-gradient rounded-xl font-bold text-white text-xs shadow-md uppercase" onClick={() => setShowTerms(false)}>Tôi đã hiểu</button>
                                </div>
                            </div>
                        )}

                        {showOtpModal && (
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-[360px] shadow-2xl text-center border-t-4 border-emerald-500">
                                    <h3 className="text-lg font-bold mb-2 text-slate-800">OTP Verification</h3>
                                    {fallbackOtpAlert && (
                                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 text-[11px] text-amber-800 font-medium">
                                            <strong>⚠️ Render Blocked!</strong> Fallback OTP: <strong className="text-base ml-1 text-amber-600 font-black">{fallbackOtpAlert}</strong>
                                        </div>
                                    )}
                                    <form onSubmit={handleVerifyOtp}>
                                        <input type="text" placeholder="123456" maxLength="6" className="w-full bg-slate-50 border p-3 rounded-xl text-center text-2xl font-black tracking-[4px] text-emerald-600 focus:border-emerald-500 mb-4" onChange={e => setOtpInput(e.target.value)} value={otpInput} required />
                                        <div className="flex gap-2">
                                            <button type="button" className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={() => setShowOtpModal(false)}>Cancel</button>
                                            <button type="submit" className="flex-1 py-2.5 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md">Verify</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );

                // =========================================================================
                // MENU TABS
                // =========================================================================
                const tabs = [
                    { id: '1_dashboard', name: t.t1, icon: 'dashboard' }, 
                    { id: '2_map_notify', name: t.t2, icon: 'map' },
                    { id: '3_community_events', name: t.t3, icon: 'groups' }, 
                    { id: '4_chat', name: t.t4, icon: 'forum' },
                    { id: '5_news_handbook', name: t.t5, icon: 'menu_book' }, 
                    { id: '6_reels', name: t.t6, icon: 'play_circle' },
                    { id: '7_ai', name: t.t7, icon: 'smart_toy' },
                    { id: '11_transit', name: t.t11, icon: 'directions_bus' }, // NEW TAB: GIAO THÔNG XANH
                    { id: '9_calendar', name: t.t9, icon: 'calendar_month' },
                    ...(user?.role === 'Cán bộ' ? [{ id: '10_officer', name: t.t10, icon: 'admin_panel_settings' }] : []),
                    { id: '8_profile', name: t.t8, icon: 'redeem' }
                ];

                return (
                    <div className="relative w-full h-full flex overflow-hidden">
                        
                        <aside className="w-72 glass m-4 mr-0 rounded-[32px] p-5 flex flex-col shadow-sm min-h-0">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100 flex-shrink-0">
                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><span className="material-icons-round text-2xl">spa</span></div>
                                <div><h1 className="text-base font-black text-emerald-950">EcoConnect</h1><span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">V2.5 Supreme</span></div>
                            </div>
                            <nav className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scroll">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold transition-all text-left \${currentTab === tab.id ? 'emerald-gradient text-white shadow-md' : 'text-slate-500 hover:bg-emerald-50'}\`}><span className="material-icons-round text-[18px]">{tab.icon}</span><span>{tab.name}</span></button>
                                ))}
                            </nav>
                        </aside>

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
                                
                                {currentTab === '1_dashboard' && (
                                    <div className="flex flex-col h-full gap-4">
                                        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                                            {[{ label: 'Báo cáo', val: '1,452', color: 'text-slate-800', bg: 'bg-blue-50' }, { label: 'Đã xử lý', val: '89.4%', color: 'text-emerald-600', bg: 'bg-emerald-50' }, { label: 'Rác gom được', val: '124 Tấn', color: 'text-teal-600', bg: 'bg-teal-50' }, { label: 'Tình nguyện viên', val: '8,405', color: 'text-amber-600', bg: 'bg-amber-50' }].map((st, i) => (
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

                                {currentTab === '2_map_notify' && (
                                    <div className="flex flex-col h-full gap-4">
                                        <div className="flex-shrink-0 grid grid-cols-3 gap-4">
                                            <div className="glass p-3 rounded-xl border-l-4 border-red-500 bg-red-50 text-left flex items-center gap-3"><span className="material-icons-round text-2xl text-red-500 animate-bounce">warning</span><div><strong className="text-red-700 text-xs block">Không khí ô nhiễm cao</strong><span className="text-[10px] text-slate-600">Khuyến nghị đeo khẩu trang.</span></div></div>
                                            <div className="glass p-3 rounded-xl border-l-4 border-amber-500 bg-amber-50 text-left flex items-center gap-3"><span className="material-icons-round text-2xl text-amber-500">water_drop</span><div><strong className="text-amber-700 text-xs block">Triều cường dâng cao</strong><span className="text-[10px] text-slate-600">Đỉnh triều đạt Báo động 3.</span></div></div>
                                            <div className="glass p-3 rounded-xl border-l-4 border-blue-500 bg-blue-50 text-left flex items-center gap-3"><span className="material-icons-round text-2xl text-blue-500 animate-pulse">thunderstorm</span><div><strong className="text-blue-700 text-xs block">Mưa lớn diện rộng</strong><span className="text-[10px] text-slate-600">Dự báo ngập úng đô thị cục bộ.</span></div></div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                            <div className="col-span-2 glass rounded-[32px] p-4 flex flex-col relative min-h-0 border-white"><div className="flex-1 rounded-2xl overflow-hidden"><MapView reports={reports} /></div></div>
                                            <div className="glass rounded-[32px] p-5 flex flex-col text-left overflow-y-auto custom-scroll border-white min-h-0">
                                                {user?.role === 'Người dùng' && (
                                                    <div className="mb-5 pb-4 border-b border-slate-100">
                                                        <h3 className="font-extrabold text-emerald-700 flex items-center gap-1 text-xs mb-2"><span className="material-icons-round text-sm">add_location_alt</span> Gửi phản ánh ô nhiễm</h3>
                                                        <input type="text" placeholder="Tiêu đề sự cố..." className="w-full bg-slate-50 border p-2 rounded-lg text-xs mb-2" />
                                                        <textarea placeholder="Nội dung chi tiết..." rows="2" className="w-full bg-slate-50 border p-2 rounded-lg text-xs mb-2"></textarea>
                                                        <button className="w-full py-2 emerald-gradient text-white font-bold text-xs rounded-lg">Nộp Đơn Phản Ánh</button>
                                                    </div>
                                                )}
                                                <h3 className="font-bold text-slate-600 mb-2 text-xs flex items-center gap-1"><span className="material-icons-round text-amber-500 text-sm">list_alt</span> Danh sách sự cố đô thị</h3>
                                                {reports.map(rep => (
                                                    <div key={rep.id} className="bg-white p-3 rounded-xl border border-slate-100 mb-2 shadow-sm text-xs">
                                                        <div className="flex justify-between mb-1 font-bold"><span className="text-emerald-600">{rep.id}</span><span className="text-slate-400">{rep.location}</span></div>
                                                        <p className="font-semibold text-slate-700 mb-1">{rep.title}</p>
                                                        <span className={\`px-2 py-0.5 rounded font-bold text-[9px] \${rep.status==='Đã xử lý'?'bg-emerald-100 text-emerald-700':(rep.status.includes('Từ chối')?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700')}\`}>{rep.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentTab === '3_community_events' && (
                                    <div className="flex flex-col h-full gap-4 overflow-y-auto custom-scroll pr-2 text-left">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5"><span className="material-icons-round text-emerald-500">event</span> Hoạt động môi trường</h3>
                                            {(user?.role === 'Tổ chức') && (<button className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-0.5" onClick={()=>setShowEventForm(true)}><span className="material-icons-round text-sm">add</span> Xin phép sự kiện</button>)}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {events.map(ev => (
                                                <div key={ev.id} className="glass p-5 rounded-3xl bg-white/60 flex flex-col justify-between relative shadow-sm border border-white">
                                                    <div className="flex gap-4">
                                                        <div className="w-24 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center p-2 text-center h-20 shadow-inner">
                                                            <span className="text-xl font-black text-emerald-800 my-1">{ev.time.substring(0,2)}</span>
                                                            <span className="text-slate-400 text-[9px]">Tháng {ev.time.substring(3,5)}</span>
                                                        </div>
                                                        <div className="flex-1 text-xs">
                                                            <h4 className="font-extrabold text-slate-800 text-sm mb-1">{ev.title}</h4>
                                                            <p className="text-slate-500 mb-0.5">📍 {ev.loc}</p>
                                                            <p className="text-slate-600 font-medium">{ev.desc}</p>
                                                        </div>
                                                    </div>
                                                    {ev.status === 'Đã duyệt' && (
                                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                            <span className="text-[11px] font-bold text-slate-500">Quân số: {ev.current}/{ev.max}</span>
                                                            <div className="flex gap-2">
                                                                <button className="px-3 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px]" onClick={()=>{setCurrentTab('11_transit'); alert('Đang tìm tuyến xe tới sự kiện này!')}}>🚙 Tìm Bus/Xe</button>
                                                                <button className="px-5 py-1.5 emerald-gradient text-white font-bold rounded-lg text-[10px] shadow-md">Tham gia</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: CHAT VỚI EMOJI */}
                                {currentTab === '4_chat' && (
                                    <div className="glass rounded-[24px] h-full border border-white flex max-w-4xl mx-auto overflow-hidden shadow-sm">
                                        <div className="w-44 bg-white/60 border-r border-slate-100 p-3 flex flex-col gap-1 text-left">
                                            <span className="font-bold text-[10px] text-slate-400 uppercase px-2 mb-1">Kênh thảo luận</span>
                                            {['Chung', 'Quận 1', 'Quận 8'].map(ch => (
                                                <button key={ch} onClick={()=>setActiveChannel(ch)} className={\`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all \${activeChannel === ch ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}\`}># Kênh {ch}</button>
                                            ))}
                                        </div>
                                        <div className="flex-1 flex flex-col bg-slate-50/20 text-left">
                                            <div className="p-3 bg-white/90 border-b border-slate-100 font-bold text-xs text-emerald-800 shadow-sm">📢 Phòng hội ý: Kênh {activeChannel}</div>
                                            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll text-xs">
                                                {chatData[activeChannel].map((msg) => (
                                                    <div key={msg.id} className={\`flex gap-2 \${msg.isMe ? 'flex-row-reverse' : ''}\`}>
                                                        <div className={\`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[9px] shadow-sm flex-shrink-0 \${msg.isMe ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-700'}\`}>{msg.isMe ? 'ME' : msg.sender.substring(0,2).toUpperCase()}</div>
                                                        <div className="flex flex-col gap-0.5 max-w-[70%] group relative">
                                                            <div className={\`p-3 rounded-xl shadow-sm \${msg.isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}\`}>
                                                                {!msg.isMe && <strong className="text-[9px] block mb-0.5 text-slate-400">{msg.sender}</strong>}
                                                                <p className="font-medium text-[11px] leading-relaxed">{msg.text}</p>
                                                            </div>
                                                            {Object.keys(msg.reacts).length > 0 && (
                                                                <div className="flex gap-1 mt-0.5"><span className="bg-white text-[9px] px-1.5 rounded-full border shadow-sm">{Object.entries(msg.reacts).map(([e, count]) => \`\${e}\${count}\`)}</span></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-white flex border-t border-slate-100 gap-2 relative">
                                                <button onClick={()=>setShowEmoji(!showEmoji)} className="px-2 text-xl hover:scale-110">😀</button>
                                                {showEmoji && (
                                                    <div className="absolute bottom-14 left-2 bg-white border p-2 rounded-xl shadow-xl flex gap-1 z-50">
                                                        {['😀','😂','❤️','🌿','🌍','👍'].map(e=><button key={e} className="text-xl hover:scale-125" onClick={() => sendChat(chatInput + e)}>{e}</button>)}
                                                    </div>
                                                )}
                                                <input type="text" placeholder="Gõ tin nhắn..." className="flex-1 bg-slate-50 p-2.5 text-xs rounded-xl border focus:border-emerald-500 outline-none" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} />
                                                <button className="px-4 emerald-gradient rounded-xl shadow-md" onClick={() => sendChat()}><span className="material-icons-round text-white text-sm">send</span></button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: ĐỌC BÁO MÔI TRƯỜNG */}
                                {currentTab === '5_news_handbook' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left">
                                        {selectedNews ? (
                                            <div className="glass p-6 rounded-3xl border animate-fadeIn relative">
                                                <button onClick={()=>setSelectedNews(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><span className="material-icons-round">close</span></button>
                                                <h2 className="font-black text-emerald-800 text-xl mb-4">{t['news'+selectedNews+'Title'] || 'Tin Tức'}</h2>
                                                <div className="text-sm text-slate-700 leading-relaxed space-y-3 font-medium">
                                                    <p>{t['news'+selectedNews+'Desc']}</p>
                                                    <p>Nội dung chi tiết của bài báo đang được tự động dịch sang ngôn ngữ bạn đã chọn (hiện tại là: {lang.toUpperCase()}). Chúng tôi sử dụng AI để mang thông tin môi trường toàn cầu đến với mọi người.</p>
                                                    <p>Biến đổi khí hậu đang là thách thức lớn nhất của nhân loại. Việc cắt giảm khí thải, bảo vệ hệ sinh thái biển và chuyển đổi sang năng lượng xanh là điều cấp thiết.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5"><span className="material-icons-round text-emerald-500">newspaper</span> Báo mới (Toàn cầu)</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {[1,2,3].map(n => (
                                                        <div key={n} onClick={()=>setSelectedNews(n)} className="glass p-4 rounded-2xl border hover:shadow-lg transition cursor-pointer">
                                                            <div className="h-32 bg-slate-200 rounded-xl mb-3 overflow-hidden"><img src={\`https://images.unsplash.com/photo-\${n===1?'1611273426858-450d8e8222a0':n===2?'1593941707882-a5bba14938cb':'1582967788606-a171c1080cb0'}?w=300&fit=crop\`} className="w-full h-full object-cover"/></div>
                                                            <h4 className="font-bold text-slate-800 text-sm mb-1">{t['news'+n+'Title'] || 'News Title'}</h4>
                                                            <p className="text-[10px] text-slate-500 line-clamp-2">{t['news'+n+'Desc'] || 'News Description'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* TAB 6: ECO REELS */}
                                {currentTab === '6_reels' && (
                                    <div className="flex justify-center items-center h-full gap-4 overflow-x-auto">
                                        {[1,2,3].map(n => (
                                            <div key={n} className="w-[300px] h-[550px] flex-shrink-0 bg-black rounded-[32px] relative overflow-hidden shadow-2xl border-[4px] border-slate-800">
                                                <img src={\`https://images.unsplash.com/photo-\${n===1?'1532996122724-e3c354a0b15b':n===2?'1611273426858-450d8e8222a0':'1542601906990-b4d3fb778b09'}?w=400&h=800&fit=crop\`} className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute top-6 left-5 text-white font-extrabold text-xs drop-shadow bg-black/40 px-3 py-1 rounded-full">Eco Reels {n}</div>
                                                <div className="absolute bottom-6 left-5 right-16 text-left text-white drop-shadow">
                                                    <h4 className="font-bold text-sm mb-0.5">@SaigonXanh</h4>
                                                    <p className="text-xs opacity-90 line-clamp-2">Clip hành động vì môi trường xanh! 🌿💪</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB 7: AI ECOBOT THÔNG MINH */}
                                {currentTab === '7_ai' && (
                                    <div className="glass rounded-[32px] h-full border flex flex-col max-w-3xl mx-auto overflow-hidden shadow-md bg-white/40 text-left">
                                        <div className="p-4 bg-white border-b flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-lg border border-emerald-200">🤖</div>
                                            <div><strong className="text-emerald-800 text-xs block">EcoBot AI (Bách Khoa Môi Trường)</strong><span className="text-[9px] text-emerald-500 font-bold">Hỏi đáp đa lĩnh vực</span></div>
                                        </div>
                                        <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs custom-scroll bg-slate-50/30">
                                            {aiMessages.map((msg, idx) => (
                                                <div key={idx} className={\`flex gap-2.5 \${msg.isBot ? '' : 'flex-row-reverse'}\`}>
                                                    <div className="h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white border shadow-sm text-[10px] font-black text-slate-500">{msg.isBot ? '🌱' : 'ME'}</div>
                                                    <div className={\`p-3.5 rounded-2xl max-w-[85%] shadow-sm \${msg.isBot ? 'bg-white text-slate-700 rounded-tl-none border' : 'emerald-gradient text-white rounded-tr-none'}\`}>
                                                        <p className="leading-relaxed text-[11px] font-medium">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 bg-white flex border-t gap-2">
                                            <input type="text" placeholder="Hỏi năng lượng, khí hậu, phân loại rác..." className="flex-1 bg-slate-50 p-2.5 text-xs rounded-xl border outline-none focus:border-emerald-500" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendAI()} />
                                            <button className="px-5 emerald-gradient text-white font-bold rounded-xl text-xs shadow-md" onClick={sendAI}>Gửi</button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 11: GIAO THÔNG XANH (XE BUÝT & XANH SM) - MỚI */}
                                {currentTab === '11_transit' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left animate-fadeIn">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-teal-500 text-2xl">directions_transit</span> Hệ Thống Giao Thông Xanh TP.HCM</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Xe Buýt */}
                                            <div className="glass p-6 rounded-[24px] border border-white bg-blue-50/50 shadow-sm">
                                                <h4 className="font-bold text-blue-800 text-base mb-2 flex items-center gap-1"><span className="material-icons-round">directions_bus</span> Tra cứu Tuyến Xe Buýt</h4>
                                                <p className="text-xs text-slate-500 mb-4 font-medium">Tìm tuyến xe buýt công cộng giảm phát thải, hướng dẫn lộ trình tối ưu nhất.</p>
                                                <input type="text" placeholder="Điểm đi (Ví dụ: Chợ Bến Thành)" className="w-full p-3 rounded-xl border mb-3 text-xs outline-none" />
                                                <input type="text" placeholder="Điểm đến (Ví dụ: Kênh Nhiêu Lộc)" className="w-full p-3 rounded-xl border mb-3 text-xs outline-none" />
                                                <button onClick={()=>alert('Lộ trình gợi ý: Bắt tuyến xe buýt số 152, sau đó chuyển sang tuyến 28. Chúc bạn đi đường vui vẻ!')} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs">{t.findBus}</button>
                                            </div>
                                            {/* Đặt xe Xanh SM */}
                                            <div className="glass p-6 rounded-[24px] border border-white bg-teal-50/50 shadow-sm">
                                                <h4 className="font-bold text-teal-800 text-base mb-2 flex items-center gap-1"><span className="material-icons-round">electric_car</span> Đặt Xe Điện Xanh SM</h4>
                                                <p className="text-xs text-slate-500 mb-4 font-medium">Di chuyển không tiếng ồn, không khói bụi. Đặt xe ngay hoặc hẹn lịch trước.</p>
                                                <input type="text" placeholder="Điểm đón" className="w-full p-3 rounded-xl border mb-3 text-xs outline-none" />
                                                <input type="text" placeholder="Điểm đến" className="w-full p-3 rounded-xl border mb-3 text-xs outline-none" />
                                                <div className="flex gap-2">
                                                    <button onClick={()=>alert('🚕 Tài xế Xanh SM (Biển số 51H-12345) đang trên đường tới đón bạn. Chi phí: 35,000 VND.')} className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs">{t.bookRide} (Ngay)</button>
                                                    <button onClick={()=>alert('Đã lên lịch đặt xe điện vào khung giờ bạn chọn!')} className="flex-1 py-3 bg-white text-teal-700 border border-teal-200 font-bold rounded-xl text-xs">Hẹn lịch</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 9: LỊCH VẠN NIÊN SIDEBAR */}
                                {currentTab === '9_calendar' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left max-w-4xl mx-auto w-full animate-fadeIn">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-amber-500 text-2xl">calendar_month</span> Lịch Hoạt Động</h3>
                                        <div className="glass p-6 rounded-[32px] border bg-white/60 shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 bg-white p-4 rounded-2xl border"><div className="text-center font-bold text-sm mb-4">Tháng 6, 2026</div><div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 font-bold mb-2"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div><div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-slate-700"><span className="opacity-20">1</span><span className="opacity-20">2</span><span className="opacity-20">3</span><span className="opacity-20">4</span><span className="opacity-20">5</span><span className="opacity-20">6</span><span className="opacity-20">7</span><span className="bg-emerald-50 rounded-lg py-1">8</span><span className="py-1">9</span><span className="py-1">10</span><span className="bg-emerald-600 text-white rounded-lg py-1">11</span><span className="py-1">12</span><span className="py-1">13</span><span className="bg-rose-50 rounded-lg py-1">14</span></div></div>
                                            <div className="flex-1 space-y-3">
                                                <h4 className="font-bold text-xs text-slate-500 uppercase">Sự kiện sắp tới:</h4>
                                                <div className="bg-rose-50 p-4 rounded-2xl border-l-4 border-rose-500 text-xs shadow-sm"><strong className="text-rose-800">Chủ Nhật Xanh (14/06)</strong><br/><span className="text-slate-600">📍 Kênh Tàu Hủ, Q8.</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 10: TRẠM KIỂM DUYỆT CÁN BỘ */}
                                {currentTab === '10_officer' && user?.role === 'Cán bộ' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left animate-fadeIn">
                                        <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-rose-500 text-2xl">admin_panel_settings</span> Trạm Quản Lý Khối Kiểm Duyệt</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            <div className="glass p-5 rounded-[24px] border border-white shadow-sm flex flex-col h-[500px]">
                                                <h4 className="font-black text-sm text-slate-700 uppercase mb-3 border-b pb-2">Xét duyệt Báo cáo</h4>
                                                <div className="flex-1 overflow-y-auto space-y-3">
                                                    {reports.filter(r => r.status === 'Chờ duyệt').map((rep) => (
                                                        <div key={rep.id} className="p-4 bg-white border rounded-2xl text-[11px] shadow-sm">
                                                            <div className="font-bold text-slate-400 mb-1">{rep.id} - {rep.location}</div>
                                                            <h5 className="font-black text-sm mb-1">{rep.title}</h5><p className="text-slate-500 mb-2">{rep.desc}</p>
                                                            <div className="flex gap-2"><button onClick={() => handleApprove('report', rep.id)} className="flex-1 py-1.5 bg-emerald-600 text-white font-bold rounded-lg">Duyệt</button><button onClick={() => setRejectModal({ isOpen: true, type: 'report', targetId: rep.id, reason: '' })} className="flex-1 py-1.5 bg-rose-100 text-rose-700 font-bold rounded-lg">Từ chối</button></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="glass p-5 rounded-[24px] border border-white shadow-sm flex flex-col h-[500px]">
                                                <h4 className="font-black text-sm text-slate-700 uppercase mb-3 border-b pb-2">Xét duyệt Sự kiện</h4>
                                                <div className="flex-1 overflow-y-auto space-y-3">
                                                    {events.filter(e => e.status === 'Chờ duyệt').map((ev) => (
                                                        <div key={ev.id} className="p-4 bg-white border rounded-2xl text-[11px] shadow-sm">
                                                            <div className="font-bold text-slate-400 mb-1">{ev.id} - {ev.org}</div>
                                                            <h5 className="font-black text-blue-800 text-sm mb-1">{ev.title}</h5>
                                                            <p className="text-slate-500 mb-2">{ev.desc}</p>
                                                            <div className="flex gap-2"><button onClick={() => handleApprove('event', ev.id)} className="flex-1 py-1.5 bg-blue-600 text-white font-bold rounded-lg">Cấp phép</button><button onClick={() => setRejectModal({ isOpen: true, type: 'event', targetId: ev.id, reason: '' })} className="flex-1 py-1.5 bg-rose-100 text-rose-700 font-bold rounded-lg">Từ chối</button></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 8: HỒ SƠ & QUÀ TẶNG THÊM MÓN NHỎ */}
                                {currentTab === '8_profile' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left max-w-4xl mx-auto w-full animate-fadeIn">
                                        <div className="glass p-6 rounded-[24px] border border-white flex items-center gap-6 bg-white/60 shadow-sm">
                                            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-3xl shadow-inner border border-white">🌲</div>
                                            <div className="flex-1">
                                                <h4 className="font-extrabold text-slate-800 text-xl mb-0.5">{user?.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium mb-2">{user?.email}</p>
                                                <span className="text-[9px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-bold uppercase">{user?.role}</span>
                                            </div>
                                            <div className="text-center bg-white p-4 rounded-xl border min-w-[120px]">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Điểm tích lũy</span>
                                                <span className="text-2xl font-black text-emerald-500 block">{user?.points || 0} <span className="text-xs">PTS</span></span>
                                            </div>
                                        </div>

                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">🎁 Đổi quà tặng môi trường</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { title: 'Huy hiệu Chiến binh Xanh', points: 50, icon: 'shield' },
                                                { title: 'Sổ tay tái chế Eco', points: 80, icon: 'book' },
                                                { title: 'Túi vải mầm xanh Canvas', points: 200, icon: 'shopping_bag' },
                                                { title: 'Bình giữ nhiệt Eco 500ml', points: 500, icon: 'local_drink' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="glass p-4 rounded-2xl border bg-white/40 flex flex-col justify-between shadow-sm">
                                                    <div className="text-xs">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="material-icons-round text-emerald-500 text-2xl">{item.icon}</span>
                                                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">{item.points} PTS</span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                                                    </div>
                                                    <button className="w-full mt-4 py-2 bg-slate-100 hover:emerald-gradient hover:text-white text-slate-500 font-bold rounded-xl text-[11px] transition-all shadow-sm" 
                                                    onClick={()=> {
                                                        if((user?.points || 0) >= item.points) alert(t.thanksReward);
                                                        else alert('Không đủ điểm PTS!');
                                                    }}>Đổi quà</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </main>
                        
                        {/* OVERLAYS (MODALS) */}
                        {rejectModal.isOpen && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-left border-t-4 border-red-500">
                                    <h3 className="font-black text-slate-800 text-sm mb-1 flex items-center gap-1"><span className="material-icons-round text-red-500 text-base">gavel</span> Lý Do Bác Bỏ Thẩm Định</h3>
                                    <textarea rows="3" placeholder="Nhập lý do bác bỏ chi tiết..." className="w-full bg-slate-50 border p-3 rounded-xl text-xs mb-4 outline-none focus:border-red-500" value={rejectModal.reason} onChange={e=>setRejectModal({...rejectModal, reason: e.target.value})}></textarea>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs" onClick={()=>setRejectModal({isOpen:false, type:'', targetId:'', reason:''})}>Hủy</button>
                                        <button className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md" onClick={submitReject}>Xác nhận</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showEventForm && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl text-left border border-slate-100">
                                    <h3 className="font-black text-emerald-800 text-sm mb-4">📝 Đơn Đề Xuất Hoạt Động Xanh</h3>
                                    <form onSubmit={handleCreateEvent} className="space-y-3 text-xs font-bold text-slate-600">
                                        <input name="title" type="text" placeholder="Tên chiến dịch..." className="w-full bg-slate-50 border p-3 rounded-xl outline-none" required />
                                        <input name="loc" type="text" placeholder="Địa điểm..." className="w-full bg-slate-50 border p-3 rounded-xl outline-none" required />
                                        <div className="grid grid-cols-2 gap-3"><input name="time" type="text" placeholder="DD/MM/YYYY" className="w-full bg-slate-50 border p-3 rounded-xl" required /><input name="max" type="number" placeholder="Số lượng TNV" className="w-full bg-slate-50 border p-3 rounded-xl" required /></div>
                                        <textarea name="desc" rows="3" placeholder="Mô tả..." className="w-full bg-slate-50 border p-3 rounded-xl outline-none resize-none" required></textarea>
                                        <div className="flex gap-2 pt-2"><button type="button" className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl" onClick={()=>setShowEventForm(false)}>Hủy</button><button type="submit" className="flex-1 py-3 emerald-gradient text-white rounded-xl shadow-md">Gửi đơn</button></div>
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
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V2.5 SUPREME PHOENIX đang chạy trên cổng ${PORT}`));

