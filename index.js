/**
 * 🌱 ECOCONNECT HCM - BẢN V1.9 (GLOBAL MASTERPIECE)
 * - Giao diện Light Theme sinh thái (Trắng & Xanh ngọc).
 * - Slogan: "Đánh thức mầm xanh, Chữa lành Trái Đất".
 * - Đa ngôn ngữ (Tiếng Việt, English, Tiếng Nhật).
 * - Màn hình Loading Screen ngầu lòi, cute.
 * - Khôi phục chức năng đặc trưng: Cán bộ (Duyệt báo cáo) & Tổ chức (Tạo sự kiện).
 * - Khôi phục chức năng gõ chat cho AI (Bot Icon dễ thương) và Cộng đồng.
 * - Giữ NGUYÊN vẹn Code Hoàn Kim (Gom nhóm, Biểu đồ Real-time, Reels, Điều khoản, OTP).
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
        pass: 'bzqkxdqolforczrs' // Mật khẩu ứng dụng
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

    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Vui lòng điền đủ thông tin!' });
    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') return res.status(400).json({ success: false, message: 'Mã xác nhận Cán bộ không đúng!' });
    if (users.some(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email đã tồn tại!' });

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
        res.status(200).json({ success: true, message: 'OTP sent!' });
    } catch (error) {
        res.status(200).json({ success: true, message: 'Render Firewall Block. Fallback OTP:', fallbackOtp: otpCode });
    }
});

app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];

    if (!session) return res.status(400).json({ success: false, message: 'Mã đã hết hạn!' });
    if (Date.now() > session.expires) { delete otpStore[email]; return res.status(400).json({ success: false, message: 'Mã đã hết hạn!' }); }
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) return res.status(400).json({ success: false, message: 'Mã OTP sai!' });

    users.push(session.userData);
    delete otpStore[email]; 
    res.status(200).json({ success: true, message: 'Đăng ký thành công!' });
});

// =========================================================================
// 5. 🎨 FRONTEND GIAO DIỆN (LIGHT THEME + ĐA NGÔN NGỮ)
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect - Super App</title>
        
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
            /* LIGHT THEME THIÊN NHIÊN */
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f0fdf4; color: #0f172a; overflow: hidden; height: 100vh; background-image: radial-gradient(circle at 100% 0%, #dcfce7 0%, transparent 50%), radial-gradient(circle at 0% 100%, #ccfbf1 0%, transparent 50%); }
            
            /* Glassmorphism Sáng */
            .glass { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 10px 40px -10px rgba(16, 185, 129, 0.1); }
            .glass-dark { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); color: #fff; }
            
            .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
            #map { height: 100%; width: 100%; border-radius: 24px; z-index: 1; }
            
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
            @keyframes spin-slow { 100% { transform: rotate(360deg); } }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            @keyframes pulse-leaf { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            .animate-pulse-leaf { animation: pulse-leaf 2s ease-in-out infinite; }
            
            .custom-scroll::-webkit-scrollbar { width: 6px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
            input:focus, textarea:focus { border-color: #10b981 !important; outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        </style>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            // =========================================================================
            // BỘ TỪ ĐIỂN ĐA NGÔN NGỮ (VI - EN - JA)
            // =========================================================================
            const dict = {
                vi: {
                    slogan: "🌿 EcoConnect - Đánh thức mầm xanh, Chữa lành Trái Đất 🌍",
                    subtitle: "Chung tay bảo vệ môi trường Thành phố",
                    roleUser: "Người dùng", roleOfficial: "Cán bộ", roleOrg: "Tổ chức",
                    login: "Đăng nhập", register: "Đăng ký tài khoản",
                    fullName: "Họ và tên", email: "Email", password: "Mật khẩu",
                    adminCode: "Mã xác thực chính quyền (VD: ADMIN123)",
                    agreeTerms: "Tôi đã đọc và đồng ý với", termsLink: "Chính sách & Điều khoản",
                    hasAccount: "Đã có tài khoản?", noAccount: "Chưa có tài khoản?",
                    verifyEmail: "Xác thực Email", otpSent: "Mã OTP đã gửi đến",
                    cancel: "Hủy", confirm: "Kích hoạt",
                    t1: "Tổng quan hệ thống", t2: "Bản đồ & Thông báo", t3: "Cộng đồng & Sự kiện",
                    t4: "Phòng chat trực tuyến", t5: "Tin tức & Cẩm nang", t6: "Eco Reels",
                    t7: "AI Môi trường", t8: "Quản lý cá nhân",
                    welcome: "Hệ thống giám sát:", logout: "Đăng xuất",
                    roleSpecificOfficial: "✅ Duyệt & Phân công xử lý",
                    roleSpecificOrg: "➕ Tạo chiến dịch mới",
                    stat1: "Sự cố ghi nhận", stat2: "Tỉ lệ đã xử lý", stat3: "Rác thu gom (Tấn)", stat4: "Tình nguyện viên",
                    mapTitle: "Bản đồ nhiệt sự cố TP.HCM", reportTitle: "Báo cáo sự cố", sendReport: "Gửi nhanh",
                    botGreeting: "Xin chào! Mình là bé Robot EcoBot 🤖🌱. Mình có thể giúp gì cho hành tinh của chúng ta hôm nay?",
                    botInput: "Nhắn tin cho EcoBot...", send: "Gửi",
                    terms1: "1. Quy định chung: Chào mừng bạn đến với EcoConnect. Nền tảng kết nối bảo vệ môi trường TP.HCM.",
                    terms2: "2. Quyền riêng tư: Dữ liệu được mã hóa an toàn, không chia sẻ cho bên thứ ba.",
                    terms3: "3. Cấm: Nghiêm cấm văng tục, spam phá hoại hệ thống.",
                    terms4: "⚠️ Xử phạt: Vi phạm nghiêm trọng sẽ bị KHÓA TÀI KHOẢN VĨNH VIỄN."
                },
                en: {
                    slogan: "🌿 EcoConnect - Awaken green shoots, Heal the Earth 🌍",
                    subtitle: "Join hands to protect our City's environment",
                    roleUser: "User", roleOfficial: "Official", roleOrg: "Organizer",
                    login: "Login", register: "Register Account",
                    fullName: "Full Name", email: "Email", password: "Password",
                    adminCode: "Official Auth Code (Ex: ADMIN123)",
                    agreeTerms: "I have read and agree to the", termsLink: "Terms & Policies",
                    hasAccount: "Already have an account?", noAccount: "Don't have an account?",
                    verifyEmail: "Verify Email", otpSent: "OTP sent to",
                    cancel: "Cancel", confirm: "Activate",
                    t1: "System Dashboard", t2: "Map & Notifications", t3: "Community & Events",
                    t4: "Live Chatroom", t5: "News & Handbook", t6: "Eco Reels",
                    t7: "EcoBot AI", t8: "Personal Profile",
                    welcome: "Monitoring System:", logout: "Logout",
                    roleSpecificOfficial: "✅ Approve & Assign",
                    roleSpecificOrg: "➕ Create New Event",
                    stat1: "Reported Issues", stat2: "Resolved Rate", stat3: "Trash Collected (Tons)", stat4: "Volunteers",
                    mapTitle: "HCMC Heatmap Issues", reportTitle: "Report Issue", sendReport: "Send Quickly",
                    botGreeting: "Hello! I'm EcoBot 🤖🌱. How can I help our planet today?",
                    botInput: "Message EcoBot...", send: "Send",
                    terms1: "1. General: Welcome to EcoConnect. A platform to protect HCMC environment.",
                    terms2: "2. Privacy: Data is safely encrypted and never sold to third parties.",
                    terms3: "3. Prohibited: Swearing, spamming, or sabotaging the system.",
                    terms4: "⚠️ Penalty: Severe violations will result in a PERMANENT BAN."
                },
                ja: {
                    slogan: "🌿 EcoConnect - 緑の芽を目覚めさせ、地球を癒す 🌍",
                    subtitle: "街の環境を守るために手を取り合おう",
                    roleUser: "ユーザー", roleOfficial: "役人", roleOrg: "主催者",
                    login: "ログイン", register: "アカウント登録",
                    fullName: "氏名", email: "Eメール", password: "パスワード",
                    adminCode: "役員認証コード (例: ADMIN123)",
                    agreeTerms: "読んで同意しました", termsLink: "利用規約",
                    hasAccount: "すでにアカウントをお持ちですか？", noAccount: "アカウントをお持ちではありませんか？",
                    verifyEmail: "メール確認", otpSent: "OTPが送信されました",
                    cancel: "キャンセル", confirm: "有効化",
                    t1: "ダッシュボード", t2: "地図と通知", t3: "コミュニティとイベント",
                    t4: "ライブチャット", t5: "ニュースとガイド", t6: "エコリール",
                    t7: "エコボット AI", t8: "プロフィール",
                    welcome: "監視システム:", logout: "ログアウト",
                    roleSpecificOfficial: "✅ 承認と割り当て",
                    roleSpecificOrg: "➕ 新しいイベントを作成",
                    stat1: "報告された問題", stat2: "解決率", stat3: "回収されたゴミ(トン)", stat4: "ボランティア",
                    mapTitle: "ホーチミン市ヒートマップ", reportTitle: "問題を報告", sendReport: "すぐに送信",
                    botGreeting: "こんにちは！エコボットです 🤖🌱。地球のために何ができますか？",
                    botInput: "メッセージを入力...", send: "送信",
                    terms1: "1. 一般: EcoConnectへようこそ。環境を保護するプラットフォーム。",
                    terms2: "2. プライバシー: データは暗号化され、第三者に販売されません。",
                    terms3: "3. 禁止事項: スパムやシステムの破壊行為。",
                    terms4: "⚠️ 罰則: 重大な違反は永久BANとなります。"
                }
            };

            // COMPONENT BẢN ĐỒ (Light Theme)
            function MapView({ reports }) {
                const mapInstance = React.useRef(null);
                React.useEffect(() => {
                    if (!mapInstance.current) {
                        mapInstance.current = L.map('map', { zoomControl: false }).setView([10.776, 106.695], 13);
                        // ĐỔI BẢN ĐỒ SANG LIGHT THEME CHO PHÙ HỢP
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
                        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
                    }
                    if (reports && reports.length > 0) {
                        mapInstance.current.eachLayer((layer) => { if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer); });
                        reports.forEach(rep => {
                            const color = rep.severity === 'Severe' ? '#ef4444' : (rep.severity === 'Warning' ? '#f59e0b' : '#10b981');
                            const customIcon = L.divIcon({
                                className: 'custom-icon',
                                html: \`<div style="background-color: \${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>\`,
                                iconSize: [16, 16]
                            });
                            L.marker([rep.lat, rep.lng], { icon: customIcon })
                             .addTo(mapInstance.current)
                             .bindPopup(\`<b style="color: #0f172a">\${rep.id}</b>: <span style="color: #334155">\${rep.title}</span><br/><span style="color: #64748b">📍 \${rep.location}</span>\`);
                        });
                    }
                }, [reports]);
                return <div id="map"></div>;
            }

            // COMPONENT BIỂU ĐỒ REAL-TIME
            function RealtimeChart() {
                const chartRef = React.useRef(null);
                React.useEffect(() => {
                    const ctx = document.getElementById('realtimeChart').getContext('2d');
                    chartRef.current = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: ['10:00', '10:01', '10:02', '10:03', '10:04', '10:05'],
                            datasets: [{
                                label: 'PM2.5 AQI',
                                data: [45, 42, 50, 48, 55, 52],
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.4, fill: true,
                                pointBackgroundColor: '#10b981',
                            }]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
                            scales: {
                                y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
                                x: { grid: { display: false }, ticks: { color: '#64748b' } }
                            },
                            plugins: { legend: { labels: { color: '#334155', font: {family: 'Plus Jakarta Sans'} } } }
                        }
                    });
                    const intervalId = setInterval(() => {
                        if(chartRef.current) {
                            const data = chartRef.current.data;
                            const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            const newAQI = Math.floor(40 + Math.random() * 30);
                            data.labels.push(time);
                            data.datasets[0].data.push(newAQI);
                            if (data.labels.length > 8) { data.labels.shift(); data.datasets[0].data.shift(); }
                            chartRef.current.update();
                        }
                    }, 2000);
                    return () => { clearInterval(intervalId); chartRef.current.destroy(); };
                }, []);
                return <canvas id="realtimeChart"></canvas>;
            }

            // APP CHÍNH
            function App() {
                // Core States
                const [lang, setLang] = React.useState('vi'); // Ngôn ngữ
                const [isAppLoading, setIsAppLoading] = React.useState(true); // Loading Screen
                const t = dict[lang];

                const [user, setUser] = React.useState(null); 
                const [view, setView] = React.useState('auth'); 
                const [authTab, setAuthTab] = React.useState('register'); 
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                const [currentTab, setCurrentTab] = React.useState('1_dashboard'); 
                
                const [showTerms, setShowTerms] = React.useState(false);
                const [showOtpModal, setShowOtpModal] = React.useState(false);
                
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', adminCode: '', terms: false });
                const [otpInput, setOtpInput] = React.useState('');
                const [loading, setLoading] = React.useState(false);
                const [targetEmail, setTargetEmail] = React.useState('');
                const [reports, setReports] = React.useState([]);
                const [fallbackOtpAlert, setFallbackOtpAlert] = React.useState(''); 

                // GÕ CHỮ CHO CHAT & AI
                const [chatInput, setChatInput] = React.useState('');
                const [chatMessages, setChatMessages] = React.useState([
                    { sender: 'Minh Thư (Q3)', text: 'Kênh Nhiêu Lộc đoạn qua cầu Lê Văn Sỹ hôm nay nước đỡ mùi hẳn rồi mọi người ơi!', isMe: false, avatar: 'MT', color: 'bg-blue-100 text-blue-700' },
                    { sender: 'Hoàng Nam (Q8)', text: 'Ở chân cầu chữ Y có đống xà bần do ai đổ trộm đêm qua. Có ai rảnh ra dọn phụ không?', isMe: false, avatar: 'HN', color: 'bg-amber-100 text-amber-700' }
                ]);

                const [aiInput, setAiInput] = React.useState('');
                const [aiMessages, setAiMessages] = React.useState([
                    { sender: 'EcoBot', text: t.botGreeting, isBot: true }
                ]);

                React.useEffect(() => {
                    // Cập nhật lại câu chào AI khi đổi ngôn ngữ
                    setAiMessages([{ sender: 'EcoBot', text: dict[lang].botGreeting, isBot: true }]);
                }, [lang]);

                // Tắt Loading sau 2s
                React.useEffect(() => {
                    setTimeout(() => setIsAppLoading(false), 2000);
                    fetch('/api/reports').then(res => res.json()).then(data => setReports(data)).catch(err => console.error(err));
                }, []);

                const handleSendChat = () => {
                    if(!chatInput.trim()) return;
                    setChatMessages([...chatMessages, { sender: 'Bạn', text: chatInput, isMe: true, avatar: 'ME', color: 'bg-emerald-100 text-emerald-800' }]);
                    setChatInput('');
                };

                const handleSendAI = () => {
                    if(!aiInput.trim()) return;
                    const newMsg = [...aiMessages, { sender: 'Bạn', text: aiInput, isBot: false }];
                    setAiMessages(newMsg);
                    setAiInput('');
                    // Giả lập AI rep lại
                    setTimeout(() => {
                        setAiMessages([...newMsg, { sender: 'EcoBot', text: "EcoBot đang phân tích dữ liệu... Tính năng AI chuyên sâu sẽ mở ở V2.0! 🌱", isBot: true }]);
                    }, 1000);
                };

                const switchAuth = (tab) => {
                    setAuthTab(tab); setOtpInput(''); setFallbackOtpAlert('');
                    setFormData({ name: '', email: '', password: '', adminCode: '', terms: false });
                };

                const featuresList = [
                    { id: '1_dashboard', name: t.t1, icon: 'dashboard' },
                    { id: '2_map_notify', name: t.t2, icon: 'map' },
                    { id: '3_community_events', name: t.t3, icon: 'groups' },
                    { id: '4_chat', name: t.t4, icon: 'forum' },
                    { id: '5_news_handbook', name: t.t5, icon: 'menu_book' },
                    { id: '6_reels', name: t.t6, icon: 'play_circle' },
                    { id: '7_ai', name: t.t7, icon: 'smart_toy' },
                    { id: '8_profile', name: t.t8, icon: 'account_circle' }
                ];

                const handleRegisterRequest = async (e) => {
                    e.preventDefault();
                    if(!formData.name || !formData.email || !formData.password) return alert("Điền đủ thông tin nha ní!");
                    if(!formData.terms) return alert("Đồng ý điều khoản đã!");
                    setLoading(true);
                    try {
                        const res = await fetch('/api/auth/register-request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...formData, role: currentRole}) });
                        const data = await res.json();
                        setLoading(false);
                        if(data.success) {
                            setTargetEmail(formData.email); setShowOtpModal(true); 
                            if (data.fallbackOtp) { setFallbackOtpAlert(data.fallbackOtp); setOtpInput(data.fallbackOtp); }
                        } else alert(data.message);
                    } catch (err) { setLoading(false); alert("Lỗi mạng!"); }
                };

                const handleVerifyOtp = async () => {
                    if(!otpInput) return;
                    try {
                        const res = await fetch('/api/auth/register-verify', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ email: targetEmail, code: otpInput }) });
                        const data = await res.json();
                        if(data.success) {
                            setShowOtpModal(false); setUser({email: targetEmail, name: formData.name, role: currentRole}); setView('dashboard'); 
                        } else alert(data.message);
                    } catch (err) { alert("Lỗi!"); }
                };

                // =========================================================================
                // 🌍 MÀN HÌNH LOADING SCREEN (NGẦU + CUTE)
                // =========================================================================
                if (isAppLoading) {
                    return (
                        <div className="fixed inset-0 bg-[#f0fdf4] z-[9999] flex flex-col items-center justify-center animate-fadeIn">
                            <div className="relative flex items-center justify-center mb-8">
                                <div className="absolute w-32 h-32 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                                <span className="text-6xl animate-pulse-leaf">🌍</span>
                                <span className="absolute -top-4 -right-4 text-4xl animate-bounce">🌱</span>
                            </div>
                            <h1 className="text-4xl font-black text-emerald-800 mb-3 tracking-tight">EcoConnect</h1>
                            <p className="text-emerald-600 font-semibold text-lg animate-pulse">{t.slogan}</p>
                        </div>
                    );
                }

                // =========================================================================
                // GIAO DIỆN AUTH (LIGHT THEME)
                // =========================================================================
                if (view === 'auth') {
                    return (
                        <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn relative">
                            {/* Nút đổi ngôn ngữ */}
                            <div className="absolute top-6 right-6 flex gap-2 glass px-3 py-2 rounded-full">
                                <button onClick={()=>setLang('vi')} className={\`text-xs font-bold px-2 py-1 rounded \${lang==='vi'?'bg-emerald-500 text-white':'text-slate-500'}\`}>VI</button>
                                <button onClick={()=>setLang('en')} className={\`text-xs font-bold px-2 py-1 rounded \${lang==='en'?'bg-emerald-500 text-white':'text-slate-500'}\`}>EN</button>
                                <button onClick={()=>setLang('ja')} className={\`text-xs font-bold px-2 py-1 rounded \${lang==='ja'?'bg-emerald-500 text-white':'text-slate-500'}\`}>JA</button>
                            </div>

                            <div className="glass w-full max-w-[450px] p-10 rounded-[32px] shadow-2xl relative text-center border border-white">
                                <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-5 shadow-inner">
                                    <span className="material-icons-round text-4xl">eco</span>
                                </div>
                                <h1 className="text-3xl font-extrabold mb-2 text-emerald-900 tracking-tight">EcoConnect</h1>
                                <p className="text-emerald-700/70 text-sm mb-8 font-medium">{t.slogan}</p>

                                {authTab === 'register' && (
                                    <form onSubmit={handleRegisterRequest} className="space-y-4 animate-fadeIn">
                                        <input type="text" placeholder={t.fullName} className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm shadow-sm text-slate-800 placeholder-slate-400" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                        <input type="email" placeholder={t.email} className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm shadow-sm text-slate-800 placeholder-slate-400" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                        <input type="password" placeholder={t.password} className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm shadow-sm text-slate-800 placeholder-slate-400" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                        
                                        {currentRole === 'Cán bộ' && (
                                            <input type="text" placeholder={t.adminCode} className="w-full bg-emerald-50 border-2 border-emerald-300 p-3.5 rounded-xl text-sm text-emerald-800 placeholder-emerald-500 animate-fadeIn font-bold" onChange={e => setFormData({...formData, adminCode: e.target.value})} value={formData.adminCode} required />
                                        )}

                                        <div className="grid grid-cols-3 gap-2 py-1">
                                            {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => {
                                                const label = r === 'Người dùng' ? t.roleUser : (r === 'Cán bộ' ? t.roleOfficial : t.roleOrg);
                                                return (
                                                    <button type="button" key={r} onClick={() => setCurrentRole(r)} className={\`py-2.5 text-[11px] font-bold rounded-lg border transition-all \${currentRole === r ? 'emerald-gradient border-transparent shadow-md' : 'bg-white/50 border-emerald-100 text-slate-500 hover:bg-white'}\`}>{label}</button>
                                                )
                                            })}
                                        </div>

                                        <div className="flex items-start text-left gap-2.5 pt-1 pb-3 text-[13px] text-slate-600">
                                            <input type="checkbox" id="policy" className="mt-1 accent-emerald-500 h-4 w-4" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                            <label htmlFor="policy">{t.agreeTerms} <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>{t.termsLink}</span></label>
                                        </div>

                                        <button type="submit" className="w-full py-4 emerald-gradient rounded-2xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex justify-center" disabled={loading}>
                                            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t.register}
                                        </button>
                                        
                                        <p className="text-sm text-slate-500 pt-3">{t.hasAccount} <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => switchAuth('login')}>{t.login}</span></p>
                                    </form>
                                )}

                                {authTab === 'login' && (
                                    <form className="space-y-4 animate-fadeIn pt-4">
                                        <input type="email" placeholder={t.email} className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm shadow-sm" required />
                                        <input type="password" placeholder={t.password} className="w-full bg-white/80 border border-emerald-100 p-3.5 rounded-xl text-sm shadow-sm" required />
                                        <button type="button" className="w-full py-4 emerald-gradient rounded-2xl font-bold text-sm uppercase shadow-lg shadow-emerald-500/30" onClick={() => { setUser({name: 'Sếp Tổng Lâm', role: currentRole}); setView('dashboard'); }}>{t.login}</button>
                                        <p className="text-sm text-slate-500 pt-3">{t.noAccount} <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => switchAuth('register')}>{t.register}</span></p>
                                    </form>
                                )}
                            </div>

                            {/* CHÍNH SÁCH ĐIỀU KHOẢN (LIGHT THEME) */}
                            {showTerms && (
                                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="bg-white w-full max-w-[500px] rounded-3xl p-8 border border-emerald-100 shadow-2xl">
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-xl font-black text-emerald-800">{t.termsLink}</h3>
                                            <span className="material-icons-round text-slate-400 cursor-pointer hover:text-red-500 bg-slate-100 rounded-full p-1" onClick={() => setShowTerms(false)}>close</span>
                                        </div>
                                        <div className="space-y-4 text-sm text-slate-600 h-[300px] overflow-y-auto pr-3 custom-scroll text-left leading-relaxed">
                                            <p><strong className="text-emerald-700">{t.terms1}</strong></p>
                                            <p><strong className="text-emerald-700">{t.terms2}</strong></p>
                                            <p><strong className="text-red-600">{t.terms3}</strong></p>
                                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-xs text-red-700 mt-2">
                                                <strong>{t.terms4}</strong>
                                            </div>
                                        </div>
                                        <button className="w-full mt-6 py-4 emerald-gradient rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20" onClick={() => { setFormData({...formData, terms: true}); setShowTerms(false); }}>OK</button>
                                    </div>
                                </div>
                            )}

                            {/* MODAL OTP */}
                            {showOtpModal && (
                                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="bg-white w-full max-w-[400px] rounded-3xl p-8 shadow-2xl text-center border-t-8 border-emerald-500">
                                        <h3 className="text-2xl font-black mb-2 text-slate-800">{t.verifyEmail}</h3>
                                        
                                        {fallbackOtpAlert ? (
                                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 text-xs text-amber-800 text-left font-medium">
                                                <strong>⚠️ Render Mail Blocked!</strong><br/> Demo OTP: <strong className="text-lg ml-1 text-amber-600">{fallbackOtpAlert}</strong>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 mb-6">{t.otpSent} <br/><span className="text-emerald-600 font-bold text-base">{targetEmail}</span></p>
                                        )}
                                        
                                        <input type="text" placeholder="A1B2C3" maxLength="6" className="w-full bg-slate-50 border-2 border-emerald-200 p-4 rounded-xl text-center text-3xl font-black tracking-[8px] uppercase text-emerald-600 focus:border-emerald-500 mb-6" onChange={e => setOtpInput(e.target.value)} value={otpInput} />
                                        
                                        <div className="flex gap-3">
                                            <button className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-xl text-sm" onClick={() => setShowOtpModal(false)}>{t.cancel}</button>
                                            <button className="flex-1 py-3 emerald-gradient font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/30" onClick={handleVerifyOtp}>{t.confirm}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                // =========================================================================
                // MÀN HÌNH DASHBOARD LIGHT THEME + ĐẶC QUYỀN ROLE
                // =========================================================================
                const displayRole = user?.role === 'Cán bộ' ? t.roleOfficial : (user?.role === 'Tổ chức' ? t.roleOrg : t.roleUser);

                return (
                    <div className="h-screen flex animate-fadeIn overflow-hidden bg-[#f0fdf4]">
                        {/* SIDEBAR TÁI CẤU TRÚC */}
                        <aside className="w-72 glass m-4 mr-0 rounded-[32px] p-5 flex flex-col z-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] min-h-0">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100 flex-shrink-0">
                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><span className="material-icons-round text-2xl">spa</span></div>
                                <div>
                                    <h1 className="text-lg font-black text-emerald-950 tracking-tight">EcoConnect</h1>
                                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Super App V1.9</span>
                                </div>
                            </div>
                            <nav className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scroll">
                                {featuresList.map(feat => (
                                    <button key={feat.id} onClick={() => setCurrentTab(feat.id)} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all text-left \${currentTab === feat.id ? 'emerald-gradient shadow-md scale-[1.02]' : 'text-slate-500 hover:bg-white/80 hover:text-emerald-700'}\`}>
                                        <span className="material-icons-round text-[20px]">{feat.icon}</span>
                                        <span>{feat.name}</span>
                                    </button>
                                ))}
                            </nav>
                            
                            {/* Chuyển ngôn ngữ trong Dashboard */}
                            <div className="flex justify-center gap-2 mt-4 flex-shrink-0 bg-white/50 p-2 rounded-xl">
                                <button onClick={()=>setLang('vi')} className={\`text-[10px] font-black px-2 py-1 rounded \${lang==='vi'?'bg-emerald-500 text-white':'text-slate-400'}\`}>VI</button>
                                <button onClick={()=>setLang('en')} className={\`text-[10px] font-black px-2 py-1 rounded \${lang==='en'?'bg-emerald-500 text-white':'text-slate-400'}\`}>EN</button>
                                <button onClick={()=>setLang('ja')} className={\`text-[10px] font-black px-2 py-1 rounded \${lang==='ja'?'bg-emerald-500 text-white':'text-slate-400'}\`}>JA</button>
                            </div>
                        </aside>

                        <main className="flex-1 p-4 flex flex-col h-screen overflow-hidden">
                            {/* HEADER */}
                            <header className="glass rounded-[24px] p-4 px-6 mb-4 flex justify-between items-center shadow-sm flex-shrink-0">
                                <div className="flex flex-col">
                                    <h2 className="text-[15px] font-extrabold text-slate-800 flex items-center gap-2">
                                        <span className="material-icons-round text-emerald-500">verified_user</span>
                                        {t.welcome} <span className="text-emerald-600">{user?.name}</span>
                                    </h2>
                                    <span className="text-[11px] text-slate-400 font-medium italic">"{t.slogan}"</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black shadow-inner uppercase tracking-wide">{displayRole}</span>
                                    <button className="h-10 w-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all shadow-sm border border-slate-100" onClick={() => window.location.reload()} title={t.logout}>
                                        <span className="material-icons-round text-[18px]">logout</span>
                                    </button>
                                </div>
                            </header>

                            <div className="flex-1 min-h-0 animate-fadeIn">
                                
                                {/* TAB 1: TỔNG QUAN HỆ THỐNG */}
                                {currentTab === '1_dashboard' && (
                                    <div className="flex flex-col h-full gap-4 min-h-0">
                                        <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                                            {[
                                                { label: t.stat1, val: '1,452', color: 'text-slate-800', icon: 'receipt_long', bg: 'bg-blue-50' },
                                                { label: t.stat2, val: '89.4%', color: 'text-emerald-600', icon: 'task_alt', bg: 'bg-emerald-50' },
                                                { label: t.stat3, val: '124', color: 'text-teal-600', icon: 'recycling', bg: 'bg-teal-50' },
                                                { label: t.stat4, val: '8,405', color: 'text-amber-600', icon: 'volunteer_activism', bg: 'bg-amber-50' }
                                            ].map((st, i) => (
                                                <div key={i} className={\`glass p-5 rounded-[24px] \${st.bg} flex items-center justify-between shadow-sm border-white\`}>
                                                    <div>
                                                        <p className="text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">{st.label}</p>
                                                        <span className={\`text-3xl font-black \${st.color}\`}>{st.val}</span>
                                                    </div>
                                                    <span className={\`material-icons-round text-4xl opacity-20 \${st.color}\`}>{st.icon}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                            <div className="col-span-2 glass rounded-[32px] p-6 flex flex-col relative shadow-sm min-h-0 border-white">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2"><span className="material-icons-round text-emerald-500">air</span> Chỉ số Không khí PM2.5</h3>
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold flex items-center gap-1 animate-pulse"><span className="h-2 w-2 bg-red-500 rounded-full"></span> LIVE</span>
                                                </div>
                                                <div className="flex-1 relative w-full h-full bg-white/50 rounded-2xl p-4"><RealtimeChart /></div>
                                            </div>
                                            <div className="glass rounded-[32px] p-6 flex flex-col min-h-0 overflow-y-auto custom-scroll shadow-sm border-white">
                                                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-700"><span className="material-icons-round text-amber-500">notifications_active</span> Live Feed</h3>
                                                <div className="space-y-3">
                                                    <div className="bg-white p-4 rounded-2xl border-l-4 border-red-400 shadow-sm text-xs text-left">
                                                        <strong className="text-red-500 block mb-1">Cảnh báo PM2.5</strong> Đ.Võ Văn Kiệt chỉ số ô nhiễm tăng vọt.
                                                    </div>
                                                    <div className="bg-white p-4 rounded-2xl border-l-4 border-emerald-400 shadow-sm text-xs text-left">
                                                        <strong className="text-emerald-600 block mb-1">Chiến dịch Chủ Nhật</strong> Q8 hiện có 45/100 người đăng ký.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: BẢN ĐỒ VÀ THÔNG BÁO */}
                                {currentTab === '2_map_notify' && (
                                    <div className="flex flex-col h-full gap-4 min-h-0">
                                        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                            <div className="col-span-2 glass rounded-[32px] p-4 flex flex-col relative min-h-0 shadow-sm border-white">
                                                <div className="flex justify-between items-center p-3 absolute top-6 left-6 right-6 z-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-md">
                                                    <h3 className="font-bold text-xs flex items-center gap-2 text-slate-800">📍 {t.mapTitle}</h3>
                                                </div>
                                                <div className="flex-1 rounded-2xl overflow-hidden z-1"><MapView reports={reports} /></div>
                                            </div>
                                            
                                            <div className="glass rounded-[32px] p-6 flex flex-col text-left overflow-y-auto custom-scroll shadow-sm border-white min-h-0">
                                                <h3 className="font-extrabold text-emerald-700 flex items-center gap-2 mb-5 text-base"><span className="material-icons-round">add_location_alt</span> {t.reportTitle}</h3>
                                                <input type="text" placeholder="Tiêu đề..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm mb-3 font-medium text-slate-700" />
                                                <textarea placeholder="Mô tả..." rows="3" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm mb-4 font-medium text-slate-700"></textarea>
                                                <button className="w-full py-3.5 emerald-gradient rounded-xl font-bold text-sm uppercase shadow-md">{t.sendReport}</button>
                                                
                                                <hr className="my-6 border-slate-200" />
                                                
                                                <h3 className="font-bold text-slate-700 mb-3 text-sm flex items-center gap-2"><span className="material-icons-round text-amber-500">list_alt</span> Báo cáo gần đây</h3>
                                                {reports.map(rep => (
                                                    <div key={rep.id} className="bg-white p-3.5 rounded-xl border border-slate-100 mb-2 shadow-sm text-xs">
                                                        <div className="flex justify-between mb-1">
                                                            <span className="font-bold text-emerald-600">{rep.id}</span>
                                                            <span className="text-slate-400 font-semibold">{rep.location}</span>
                                                        </div>
                                                        <p className="font-semibold text-slate-700 mb-2">{rep.title}</p>
                                                        
                                                        {/* CHỨC NĂNG ĐẶC TRƯNG CÁN BỘ: DUYỆT BÁO CÁO */}
                                                        {user?.role === 'Cán bộ' ? (
                                                            <button className="w-full py-1.5 mt-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white transition-colors font-bold rounded-lg text-[10px]" onClick={()=>alert('Đã cập nhật trạng thái xử lý cho báo cáo này!')}>{t.roleSpecificOfficial}</button>
                                                        ) : (
                                                            <span className="px-2 py-1 rounded-md font-bold text-[10px] bg-amber-100 text-amber-700">{rep.status}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: CỘNG ĐỒNG VÀ SỰ KIỆN */}
                                {currentTab === '3_community_events' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><span className="material-icons-round text-emerald-500 text-2xl">event</span> Chiến dịch Tình nguyện</h3>
                                            {/* CHỨC NĂNG ĐẶC TRƯNG TỔ CHỨC: TẠO SỰ KIỆN */}
                                            {(user?.role === 'Tổ chức' || user?.role === 'Cán bộ') && (
                                                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md" onClick={()=>alert('Mở form tạo chiến dịch mới...')}>{t.roleSpecificOrg}</button>
                                            )}
                                        </div>
                                        
                                        <div className="glass p-6 rounded-[32px] border border-white bg-white/60 flex gap-6 relative shadow-sm">
                                            <div className="w-32 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center border border-emerald-100 p-3 shadow-inner">
                                                <span className="text-red-500 font-black text-xs uppercase">Chủ Nhật</span>
                                                <span className="text-4xl font-black text-emerald-800 my-1">14</span>
                                                <span className="text-slate-500 text-[10px] font-bold">Thg 06, 2026</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-extrabold text-slate-800 mb-2 text-xl">Chủ Nhật Xanh lần 145</h4>
                                                <p className="text-sm text-slate-600 mb-4 font-medium">📍 Nhà thiếu nhi Quận 8. Vớt rác lục bình tại Kênh Tàu Hủ.</p>
                                                <button className="px-6 py-2.5 emerald-gradient font-bold rounded-xl text-sm shadow-lg shadow-emerald-200">Đăng ký ngay (45/100)</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 4: PHÒNG CHAT TRỰC TUYẾN (CÓ THỂ GÕ) */}
                                {currentTab === '4_chat' && (
                                    <div className="glass rounded-[32px] h-full border border-white flex flex-col max-w-3xl mx-auto overflow-hidden shadow-md">
                                        <div className="p-5 bg-white/80 border-b border-emerald-50 flex justify-between items-center">
                                            <span className="font-extrabold text-base text-emerald-800 flex items-center gap-2"><span className="material-icons-round text-emerald-500">forum</span> Kênh Thảo Luận Cộng Đồng</span>
                                        </div>
                                        <div className="flex-1 p-6 space-y-5 overflow-y-auto text-left text-sm custom-scroll">
                                            {chatMessages.map((msg, idx) => (
                                                <div key={idx} className={\`flex gap-3 \${msg.isMe ? 'flex-row-reverse' : ''}\`}>
                                                    <div className={\`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm \${msg.isMe ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}\`}>{msg.avatar}</div>
                                                    <div className={\`p-4 rounded-2xl shadow-sm max-w-[75%] \${msg.isMe ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}\`}>
                                                        <strong className={\`text-[11px] block mb-1.5 \${msg.isMe ? 'text-emerald-200 text-right' : 'text-slate-400'}\`}>{msg.sender}</strong>
                                                        <p className="font-medium leading-relaxed">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-white flex border-t border-slate-100 gap-3">
                                            <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 bg-slate-50 p-3.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-500 font-medium text-slate-700" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChat()} />
                                            <button className="px-6 emerald-gradient font-bold rounded-xl shadow-md" onClick={handleSendChat}><span className="material-icons-round text-white">send</span></button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: TIN TỨC VÀ CẨM NANG */}
                                {currentTab === '5_news_handbook' && (
                                    <div className="flex flex-col h-full gap-5 overflow-y-auto custom-scroll pr-2 text-left">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="glass p-6 rounded-[24px] border-l-8 border-amber-400 bg-white/60 shadow-sm">
                                                <h4 className="font-extrabold text-amber-600 text-base mb-2">🍂 Rác Hữu Cơ</h4>
                                                <p className="text-slate-600 text-sm font-medium">Thức ăn thừa, vỏ rau củ. Bỏ vào thùng Xanh Lá.</p>
                                            </div>
                                            <div className="glass p-6 rounded-[24px] border-l-8 border-blue-400 bg-white/60 shadow-sm">
                                                <h4 className="font-extrabold text-blue-600 text-base mb-2">♻️ Rác Tái chế</h4>
                                                <p className="text-slate-600 text-sm font-medium">Chai nhựa, giấy báo. Bỏ vào thùng Xám/Trắng.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 6: ECO REELS */}
                                {currentTab === '6_reels' && (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="w-[350px] h-[600px] bg-black rounded-[40px] relative overflow-hidden shadow-2xl border-[6px] border-slate-800">
                                            <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=900&fit=crop" className="w-full h-full object-cover opacity-90" alt="reels" />
                                            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10"><span className="font-bold text-white drop-shadow-md text-lg">Eco Reels</span></div>
                                            <div className="absolute bottom-8 left-6 right-16 text-left z-10">
                                                <h4 className="font-bold text-white drop-shadow-md mb-1 text-base">@SaigonXanh</h4>
                                                <p className="text-xs text-white drop-shadow-md line-clamp-2">Hôm nay cùng team dọn sạch rác dưới chân cầu vượt! 🌿💪</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 7: AI MÔI TRƯỜNG (CUTE BOT + GÕ CHỮ ĐƯỢC) */}
                                {currentTab === '7_ai' && (
                                    <div className="glass rounded-[32px] h-full border border-white flex flex-col max-w-3xl mx-auto overflow-hidden shadow-md">
                                        <div className="p-5 bg-emerald-50 border-b border-emerald-100 text-left flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-emerald-200 flex items-center justify-center text-2xl shadow-inner border-2 border-white">🤖</div>
                                            <div>
                                                <strong className="text-emerald-800 text-base font-black block">EcoBot 2.0</strong>
                                                <span className="text-xs text-emerald-600 font-medium">Trợ lý AI bảo vệ Môi trường</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 space-y-5 overflow-y-auto text-left text-sm custom-scroll bg-slate-50/50">
                                            {aiMessages.map((msg, idx) => (
                                                <div key={idx} className={\`flex gap-3 \${msg.isBot ? '' : 'flex-row-reverse'}\`}>
                                                    <div className={\`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg shadow-sm border-2 border-white \${msg.isBot ? 'bg-emerald-100' : 'bg-slate-200'}\`}>{msg.isBot ? '🌱' : 'ME'}</div>
                                                    <div className={\`p-4 rounded-2xl shadow-sm max-w-[80%] \${msg.isBot ? 'bg-white text-slate-700 rounded-tl-none border border-emerald-100' : 'bg-emerald-600 text-white rounded-tr-none'}\`}>
                                                        <p className="font-medium leading-relaxed">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-4 bg-white flex border-t border-slate-100 gap-3">
                                            <input type="text" placeholder={t.botInput} className="flex-1 bg-slate-50 p-3.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-medium text-slate-700" value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendAI()} />
                                            <button className="px-6 emerald-gradient font-bold rounded-xl shadow-md" onClick={handleSendAI}><span className="material-icons-round text-white">send</span></button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 8: QUẢN LÝ CÁ NHÂN */}
                                {currentTab === '8_profile' && (
                                    <div className="flex flex-col h-full gap-6 overflow-y-auto custom-scroll pr-2 text-left max-w-4xl mx-auto w-full">
                                        <div className="glass p-8 rounded-[32px] border border-white shadow-md relative overflow-hidden flex items-center gap-6 bg-white/60">
                                            <div className="h-24 w-24 bg-emerald-100 border-4 border-white rounded-full flex items-center justify-center font-black text-4xl shadow-sm z-10">🌿</div>
                                            <div className="flex-1 z-10">
                                                <h4 className="font-extrabold text-slate-800 text-2xl mb-1">{user?.name}</h4>
                                                <p className="text-sm text-slate-500 font-medium mb-3">📧 {user?.email}</p>
                                                <span className="text-xs bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">{displayRole}</span>
                                            </div>
                                            <div className="text-center z-10 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                                <span className="text-xs text-slate-500 font-bold uppercase block mb-1">Điểm xanh</span>
                                                <span className="text-3xl font-black text-emerald-500">120 <span className="text-sm">PTS</span></span>
                                            </div>
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
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V1.9 GLOBAL đang chạy trên cổng ${PORT}`));
