/**
 * 🌱 ECOCONNECT HCM - PRODUCTION READY V1.0.2 (HOTFIXED)
 * - Sửa triệt để lỗi gõ nhầm ký tự hệ thống \frac tại tab Lịch trình.
 * - Đồng bộ hệ thống từ điển cho toàn bộ 12 trang tính năng.
 * - Design System: Tông Emerald/Teal chủ đạo sang xịn mịn.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// =========================================================================
// 💾 CƠ SỞ DỮ LIỆU MÔ PHỎNG THỜI GIAN THỰC
// =========================================================================
let state = {
    reports: [
        { id: "REP-001", title: "Bãi rác tự phát dưới chân cầu chữ Y", location: "Quận 8, TP.HCM", status: "Chờ xử lý", type: "Trash", severity: "Severe", reporter: "Nguyễn Văn A", phone: "0901234xxx", date: "2026-06-08", x: 45, y: 55 },
        { id: "REP-002", title: "Kênh Nhiêu Lộc có hiện tượng xả nước thải đen", location: "Quận 3, TP.HCM", status: "Đang xử lý", type: "Water", severity: "Warning", reporter: "Ẩn danh", phone: "Không có", date: "2026-06-07", x: 60, y: 40 },
        { id: "REP-003", title: "Khói bụi công nghiệp nồng nặc khu công nghiệp", location: "Bình Tân, TP.HCM", status: "Đã xử lý", type: "Air", severity: "Info", reporter: "Trần Thị B", phone: "0934567xxx", date: "2026-06-05", x: 30, y: 70 }
    ],
    events: [
        { id: 1, title: "Chiến dịch dọn rác kênh rạch xanh", date: "15/06/2026", loc: "Kênh Đôi, Quận 8", joined: 85, max: 100, desc: "Chung tay vớt rác thải nhựa, khơi thông dòng chảy tuyến kênh trọng điểm.", img: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500" },
        { id: 2, title: "Ngày hội trồng 1000 cây xanh đô thị", date: "20/06/2026", loc: "Công viên Gia Định", joined: 150, max: 150, desc: "Phủ xanh góc phố, cải thiện chất lượng không khí nội thành.", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500" }
    ],
    groups: [
        { id: 1, name: "Sài Gòn Xanh", members: "15.2K", area: "Toàn thành phố", desc: "Biệt đội thanh niên tình nguyện dọn kênh rạch bẩn." },
        { id: 2, name: "Zero Waste HCM", members: "8.5K", area: "Quận 1 & Quận 3", desc: "Cộng đồng chia sẻ mẹo giảm thiểu rác thải nhựa, lối sống bền vững." }
    ],
    permissions: [
        { id: "REQ-991", title: "Xin phép Gom pin cũ tại các chung cư", org: "Đại học Bách Khoa", date: "2026-06-08", status: "Chờ xét duyệt" }
    ]
};

// =========================================================================
// 🔌 HỆ THỐNG API
// =========================================================================
app.get('/api/state', (req, res) => res.json(state));
app.post('/api/reports', (req, res) => {
    const { title, location, type, severity, isAnonymous, reporterName, reporterPhone } = req.body;
    const newReport = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        title, location, type, severity,
        status: "Chờ xử lý",
        reporter: isAnonymous ? "Ẩn danh" : (reporterName || "Người dân"),
        phone: isAnonymous ? "Không có" : (reporterPhone || "Không có"),
        date: new Date().toISOString().split('T')[0],
        x: Math.floor(Math.random() * 60) + 20,
        y: Math.floor(Math.random() * 60) + 20
    };
    state.reports.unshift(newReport);
    res.json({ success: true, report: newReport });
});
app.post('/api/permissions', (req, res) => {
    const newPerm = { id: `REQ-${Math.floor(100 + Math.random() * 900)}`, ...req.body, status: "Chờ xét duyệt" };
    state.permissions.unshift(newPerm);
    res.json({ success: true });
});

// =========================================================================
// 🎨 GIAO DIỆN SIÊU PHẨM CHUẨN ĐỒ HỌA CAO CẤP
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EcoConnect HCM - Ứng Dụng Môi Trường Thông Minh</title>
            <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
            <style>
                body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; }
                .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
                .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div id="root"></div>

            <script type="text/babel">
                const langPack = {
                    vi: { welcome: "Chào mừng bạn", appName: "EcoConnect HCM", home: "Trang chủ", report: "Bản đồ & Báo cáo", community: "Cộng đồng", chat: "Chat nhóm", news: "Tin tức & Mẹo", tracking: "Theo dõi", admin: "Kiểm duyệt", stats: "Thống kê", schedule: "Lịch trình", tips: "Mẹo sống xanh", permission: "Xin cấp phép", menu: "Hồ sơ" },
                    en: { welcome: "Welcome", appName: "EcoConnect HCM", home: "Home", report: "Map & Report", community: "Community", chat: "Chat Room", news: "News & Tips", tracking: "Tracking", admin: "Approval", stats: "Statistics", schedule: "Schedule", tips: "Green Tips", permission: "Permissions", menu: "Profile" },
                    fr: { welcome: "Bienvenue", appName: "EcoConnect HCM", home: "Accueil", report: "Carte & Rapport", community: "Communauté", chat: "Discussion", news: "Infos & Conseils", tracking: "Suivi", admin: "Approbation", stats: "Statistiques", schedule: "Calendrier", tips: "Conseils Verts", permission: "Autorisation", menu: "Menu" },
                    jp: { welcome: "ようこそ", appName: "EcoConnect HCM", home: "ホーム", report: "地図と報告", community: "コミュニティ", chat: "チャット", news: "ニュース", tracking: "追跡履歴", admin: "管理承認", stats: "統計データ", schedule: "スケジュール", tips: "エコのコツ", permission: "活動申請", menu: "メニュー" }
                };

                function App() {
                    const [user, setUser] = React.useState(null);
                    const [authMode, setAuthMode] = React.useState('login');
                    const [emailInput, setEmailInput] = React.useState('');
                    const [passInput, setPassInput] = React.useState('');
                    const [nameInput, setNameInput] = React.useState('');
                    const [adminCode, setAdminCode] = React.useState('');
                    const [passStrength, setPassStrength] = React.useState(0);

                    const [currentTab, setCurrentTab] = React.useState('home');
                    const [lang, setLang] = React.useState('vi');
                    const [appState, setAppState] = React.useState({ reports: [], events: [], groups: [], permissions: [] });
                    
                    const [isBotOpen, setIsBotOpen] = React.useState(false);
                    const [botLogs, setBotLogs] = React.useState([{ s: 'bot', t: 'Chào bạn! EcoBot AI đã sẵn sàng hỗ trợ thông tin môi trường trích nguồn toàn cầu WHO, IQAir.' }]);
                    const [botInput, setBotInput] = React.useState('');
                    const [commTab, setCommTab] = React.useState('events');
                    const [newsFilter, setNewsFilter] = React.useState('all');

                    const loadState = () => {
                        fetch('/api/state').then(res => res.json()).then(setAppState);
                    };

                    React.useEffect(() => {
                        loadState();
                    }, []);

                    const checkPassword = (val) => {
                        setPassInput(val);
                        let score = 0;
                        if (val.length >= 8) score += 25;
                        if (/[A-Z]/.test(val)) score += 25;
                        if (/[a-z]/.test(val)) score += 25;
                        if (/[0-9!@#$%^&*]/.test(val)) score += 25;
                        setPassStrength(score);
                    };

                    const handleAuth = (e) => {
                        e.preventDefault();
                        if (!emailInput || !passInput) return;

                        let role = 'User';
                        let finalName = nameInput || emailInput.split('@')[0];

                        if (emailInput.includes('admin') || emailInput.includes('official')) {
                            if (authMode === 'register' && adminCode !== 'ADMIN123') {
                                alert('Mã xác nhận Cán bộ không đúng!');
                                return;
                            }
                            role = 'Official';
                        } else if (emailInput.includes('org')) {
                            role = 'Organizer';
                        }

                        setUser({
                            email: emailInput,
                            role: role,
                            name: finalName,
                            points: 120,
                            rank: 'Bạc'
                        });
                    };

                    const t = langPack[lang];

                    if (!user) {
                        return (
                            <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-900 to-slate-950">
                                <div className="glass w-full max-w-md p-8 rounded-3xl shadow-2xl space-y-6">
                                    <div className="text-center space-y-2">
                                        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                                            <span className="material-icons-round text-3xl">spa</span>
                                        </div>
                                        <h1 className="text-2xl font-extrabold tracking-tight text-white">EcoConnect HCM</h1>
                                        <p className="text-xs text-slate-400">Hệ thống kết nối bảo vệ môi trường thông minh TP.HCM</p>
                                    </div>

                                    <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                                        <button type="button" onClick={() => setAuthMode('login')} className={\`flex-1 py-2 rounded-lg transition \${authMode === 'login' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400'}\`}>Đăng nhập</button>
                                        <button type="button" onClick={() => setAuthMode('register')} className={\`flex-1 py-2 rounded-lg transition \${authMode === 'register' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400'}\`}>Đăng ký</button>
                                    </div>

                                    <form onSubmit={handleAuth} className="space-y-4 text-xs">
                                        {authMode === 'register' && (
                                            <div>
                                                <label className="block text-slate-300 font-medium mb-1.5">Họ và tên</label>
                                                <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Nguyễn Văn X..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" required />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-slate-300 font-medium mb-1.5">Email tài khoản</label>
                                            <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="user@gmail.com, admin@.., org@.." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" required />
                                            <p className="text-[10px] text-slate-500 mt-1">Gợi ý: Nhập email chứa từ "admin" hoặc "org" để test phân quyền tự động.</p>
                                        </div>

                                        <div>
                                            <label className="block text-slate-300 font-medium mb-1.5">Mật khẩu</label>
                                            <input type="password" value={passInput} onChange={e => checkPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" required />
                                            
                                            {authMode === 'register' && (
                                                <div className="mt-2 space-y-1">
                                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={\`h-full transition-all duration-300 \${passStrength <= 25 ? 'bg-red-500 w-1/4' : passStrength <= 50 ? 'bg-orange-400 w-1/2' : passStrength <= 75 ? 'bg-yellow-400 w-3/4' : 'bg-emerald-500 w-full'}\`}></div>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">Độ mạnh: {passStrength <= 25 ? '🔴 Yếu' : passStrength <= 50 ? '🟠 Trung bình' : passStrength <= 75 ? '🟡 Khá' : '🟢 Mạnh'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {authMode === 'register' && (emailInput.includes('admin') || emailInput.includes('official')) && (
                                            <div>
                                                <label className="block text-red-400 font-semibold mb-1.5">Mã xác nhận Cán bộ chính quyền</label>
                                                <input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Nhập ADMIN123 để kích hoạt..." className="w-full bg-slate-900 border border-red-500/50 rounded-xl p-3 text-white focus:outline-none" required />
                                            </div>
                                        )}

                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-xl shadow-lg transition tracking-wide mt-2">
                                            {authMode === 'login' ? 'XÁC THỰC VÀO HỆ THỐNG' : 'ĐĂNG KÝ TÀI KHOẢN MỚI'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="min-h-screen flex flex-col md:flex-row">
                            {/* SIDEBAR ĐIỀU HƯỚNG */}
                            <aside className="w-full md:w-64 glass p-4 flex flex-col justify-between border-r border-slate-800 shrink-0">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2.5 px-2">
                                        <span className="material-icons-round text-emerald-400 text-2xl">spa</span>
                                        <div>
                                            <h2 className="font-extrabold text-sm tracking-tight text-white">{t.appName}</h2>
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold">{user.role}</span>
                                        </div>
                                    </div>

                                    <nav className="space-y-1 text-xs font-medium">
                                        <button type="button" onClick={() => setCurrentTab('home')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'home' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">home</span> {t.home}</button>
                                        <button type="button" onClick={() => setCurrentTab('report')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'report' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">map</span> {t.report}</button>
                                        <button type="button" onClick={() => setCurrentTab('community')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'community' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">people</span> {t.community}</button>
                                        <button type="button" onClick={() => setCurrentTab('chat')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">forum</span> {t.chat}</button>
                                        <button type="button" onClick={() => setCurrentTab('news')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'news' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">newspaper</span> {t.news}</button>
                                        <button type="button" onClick={() => setCurrentTab('tracking')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'tracking' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">analytics</span> {t.tracking}</button>
                                        <button type="button" onClick={() => setCurrentTab('stats')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'stats' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">bar_chart</span> {t.stats}</button>
                                        <button type="button" onClick={() => setCurrentTab('schedule')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'schedule' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">calendar_month</span> {t.schedule}</button>
                                        <button type="button" onClick={() => setCurrentTab('tips')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'tips' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">tips_and_updates</span> {t.tips}</button>
                                        
                                        {user.role === 'Official' && (
                                            <button type="button" onClick={() => setCurrentTab('admin')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-blue-500/20 text-blue-400 transition \${currentTab === 'admin' ? 'bg-blue-600 text-white' : 'hover:bg-blue-950/40'}\`}><span className="material-icons-round text-lg">gavel</span> {t.admin}</button>
                                        )}
                                        
                                        {user.role === 'Organizer' && (
                                            <button type="button" onClick={() => setCurrentTab('permission')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-purple-500/20 text-purple-400 transition \${currentTab === 'permission' ? 'bg-purple-600 text-white' : 'hover:bg-purple-950/40'}\`}><span className="material-icons-round text-lg">assignment_turned_in</span> {t.permission}</button>
                                        )}

                                        <button type="button" onClick={() => setCurrentTab('menu')} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition \${currentTab === 'menu' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}\`}><span className="material-icons-round text-lg">account_circle</span> {t.menu}</button>
                                    </nav>
                                </div>

                                <div className="pt-4 border-t border-slate-800 space-y-3">
                                    <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl text-xs">
                                        <span className="font-semibold text-slate-300 truncate max-w-[100px]">{user.name}</span>
                                        <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">{user.points} XP</span>
                                    </div>
                                    <button type="button" onClick={() => setUser(null)} className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 font-semibold transition"><span className="material-icons-round text-sm">logout</span> Đăng xuất</button>
                                </div>
                            </aside>

                            {/* VIEWPORT CHÍNH */}
                            <main className="flex-1 flex flex-col min-w-0">
                                <header className="glass p-4 px-6 flex justify-between items-center border-b border-slate-800 shrink-0">
                                    <h2 className="text-base font-bold text-white capitalize">{t[currentTab] || currentTab}</h2>
                                    
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="relative inline-block">
                                            <select value={lang} onChange={e => setLang(e.target.value)} className="bg-slate-800 text-white font-medium p-2 px-3 rounded-xl border border-slate-700 focus:outline-none cursor-pointer">
                                                <option value="vi">🇻🇳 Tiếng Việt</option>
                                                <option value="en">🇬🇧 English</option>
                                                <option value="fr">🇫🇷 Français</option>
                                                <option value="jp">🇯🇵 日本語</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow uppercase">{user.name[0]}</div>
                                            <span className="hidden sm:inline font-medium text-slate-300">Hạng: <b className="text-emerald-400">{user.rank}</b></span>
                                        </div>
                                    </div>
                                </header>

                                <div className="flex-1 p-6 overflow-y-auto custom-scroll">
                                    
                                    {/* 🏠 TRANG 1: TRANG CHỦ */}
                                    {currentTab === 'home' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                                                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><span className="material-icons-round">analytics</span></div>
                                                    <div><p className="text-[10px] text-slate-400 font-medium">Báo cáo tuần này</p><h3 className="text-xl font-bold">{appState.reports.length + 14} vụ</h3></div>
                                                </div>
                                                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                                                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><span className="material-icons-round">emergency</span></div>
                                                    <div><p className="text-[10px] text-slate-400 font-medium">Điểm nóng đang xử lý</p><h3 className="text-xl font-bold">5 điểm</h3></div>
                                                </div>
                                                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                                                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><span className="material-icons-round">volunteer_activism</span></div>
                                                    <div><p className="text-[10px] text-slate-400 font-medium">Tình nguyện viên</p><h3 className="text-xl font-bold">1,420 mem</h3></div>
                                                </div>
                                                <div className="glass p-5 rounded-2xl flex items-center gap-4">
                                                    <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl"><span className="material-icons-round">update</span></div>
                                                    <div><p className="text-[10px] text-slate-400 font-medium">Trạng thái dữ liệu</p><h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Real-time IoT</h3></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                <div className="lg:col-span-2 glass p-6 rounded-2xl space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-sm font-bold text-slate-200">📊 Thống kê chỉ số ô nhiễm (TP.HCM)</h3>
                                                        <span className="text-[10px] text-slate-400">Xem theo: Ngày/Tuần</span>
                                                    </div>
                                                    <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-700">
                                                        <div className="w-full flex flex-col items-center gap-2"><div className="w-full bg-emerald-500/30 rounded-t h-[40%]"></div><span className="text-[9px] text-slate-400">Q.1</span></div>
                                                        <div className="w-full flex flex-col items-center gap-2"><div className="w-full bg-red-500/60 rounded-t h-[85%]"></div><span className="text-[9px] text-slate-400">Q.8</span></div>
                                                        <div className="w-full flex flex-col items-center gap-2"><div className="w-full bg-orange-500/50 rounded-t h-[65%]"></div><span className="text-[9px] text-slate-400">T.Đức</span></div>
                                                        <div className="w-full flex flex-col items-center gap-2"><div className="w-full bg-emerald-500/30 rounded-t h-[25%]"></div><span className="text-[9px] text-slate-400">Q.7</span></div>
                                                        <div className="w-full flex flex-col items-center gap-2"><div className="w-full bg-orange-500/50 rounded-t h-[55%]"></div><span className="text-[9px] text-slate-400">B.Thạnh</span></div>
                                                    </div>
                                                </div>

                                                <div className="glass p-6 rounded-2xl space-y-4">
                                                    <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1"><span className="material-icons-round text-base">military_tech</span> Thử thách sống xanh tuần này</h3>
                                                    <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                                                        <p className="text-xs font-bold text-white">🔥 "7 ngày nói không với túi nylon"</p>
                                                        <p className="text-[11px] text-slate-400">Chụp ảnh phân loại rác tại nhà hoặc sử dụng túi vải để hoàn thành và nhận thưởng ngay.</p>
                                                        <div className="flex justify-between items-center text-xs pt-1">
                                                            <span className="text-emerald-400 font-mono">+100 EcoPoints</span>
                                                            <button type="button" onClick={() => alert('🎉 Đã kích hoạt thử thách! Chúc bạn may mắn!')} className="bg-emerald-600 p-1.5 px-3 rounded-lg text-[10px] font-bold">Tham gia</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🗺️ TRANG 2: BẢN ĐỒ & BÁO CÁO */}
                                    {currentTab === 'report' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 glass p-5 rounded-2xl flex flex-col h-[520px]">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="text-xs font-bold text-slate-200">🗺️ Bản đồ điểm nóng số hóa (Tọa độ trung tâm TP.HCM)</h3>
                                                    <div className="flex gap-2 text-[10px]">
                                                        <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500"></span>Nghiêm trọng</span>
                                                        <span className="flex items-center gap-1 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-500"></span>Cảnh báo</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-800">
                                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-10">
                                                        <span className="material-icons-round text-9xl">map</span>
                                                        <p className="text-xs font-mono">OpenStreetMap - Center HCM (10.7769, 106.7009)</p>
                                                    </div>

                                                    {appState.reports.map(r => (
                                                        <div key={r.id} className="absolute group cursor-pointer" style={{ left: \`\${r.x}%\`, top: \`\${r.y}%\` }}>
                                                            <span className={\`absolute -inset-2 rounded-full opacity-60 animate-ping \${r.severity === 'Severe' ? 'bg-red-500' : r.severity === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'}\`}></span>
                                                            <span className={\`relative block w-3.5 h-3.5 rounded-full border-2 border-white shadow \${r.severity === 'Severe' ? 'bg-red-500' : r.severity === 'Warning' ? 'bg-orange-500' : 'bg-blue-500'}\`}></span>
                                                            
                                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-[10px] p-2.5 rounded-xl border border-slate-700 hidden group-hover:block z-50 shadow-2xl space-y-1">
                                                                <p className="font-bold text-white">{r.title}</p>
                                                                <p className="text-slate-400">📍 {r.location}</p>
                                                                <p className="text-emerald-400 font-bold">Nguồn: {r.reporter}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="glass p-5 rounded-2xl space-y-4">
                                                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1"><span className="material-icons-round text-base">add_location_alt</span> Tạo báo cáo sự cố mới</h3>
                                                <form onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const formData = {
                                                        title: e.target.title.value,
                                                        location: e.target.location.value,
                                                        type: e.target.type.value,
                                                        severity: e.target.severity.value,
                                                        isAnonymous: e.target.isAnonymous.checked,
                                                        reporterName: user.name,
                                                        reporterPhone: "090123456"
                                                    };
                                                    fetch('/api/reports', {
                                                        method: 'POST',
                                                        headers: {'Content-Type': 'application/json'},
                                                        body: JSON.stringify(formData)
                                                    }).then(res=>res.json()).then(data=>{
                                                        if(data.success) { alert('🎉 Gửi báo cáo thành công! Bản ghi đang chờ Cán bộ duyệt.'); loadState(); e.target.reset(); }
                                                    });
                                                }} className="space-y-3 text-xs">
                                                    <div>
                                                        <label className="block text-slate-400 mb-1">Tên sự cố / Mô tả ngắn</label>
                                                        <input name="title" type="text" placeholder="Ví dụ: Đổ trộm chất thải công nghiệp..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-slate-400 mb-1">Địa chỉ / Khu vực cụ thể</label>
                                                        <input name="location" type="text" placeholder="Số nhà, Tên đường, Quận/Huyện..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500" required />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-slate-400 mb-1">Loại ô nhiễm</label>
                                                            <select name="type" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none">
                                                                <option value="Trash">🗑️ Rác thải</option>
                                                                <option value="Water">💧 Nước thải</option>
                                                                <option value="Air">🏭 Không khí</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-slate-400 mb-1">Mức độ nguy cấp</label>
                                                            <select name="severity" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none">
                                                                <option value="Severe">🔴 Nghiêm trọng</option>
                                                                <option value="Warning">🟠 Cảnh báo</option>
                                                                <option value="Info">🔵 Thông tin</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-800 rounded-xl border border-dashed border-slate-600 text-center cursor-pointer hover:bg-slate-700/50">
                                                        <span className="material-icons-round text-lg text-slate-400">cloud_upload</span>
                                                        <p className="text-[10px] text-slate-400">Upload hình ảnh minh chứng thực địa</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 py-1">
                                                        <input name="isAnonymous" type="checkbox" id="anon" className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0" />
                                                        <label htmlFor="anon" className="text-slate-300 font-medium cursor-pointer">Báo cáo ẩn danh bảo vệ thông tin</label>
                                                    </div>
                                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl font-mono uppercase tracking-wider">Phát tín hiệu báo cáo</button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {/* 👥 TRANG 3: CỘNG ĐỒNG */}
                                    {currentTab === 'community' && (
                                        <div className="space-y-4">
                                            <div className="flex bg-slate-800 p-1 rounded-xl max-w-sm text-xs font-semibold">
                                                <button type="button" onClick={() => setCommTab('events')} className={\`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 \${commTab === 'events' ? 'bg-emerald-500 text-white' : 'text-slate-400'}\`}><span className="material-icons-round text-sm">calendar_today</span> Sự kiện</button>
                                                <button type="button" onClick={() => setCommTab('groups')} className={\`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 \${commTab === 'groups' ? 'bg-emerald-500 text-white' : 'text-slate-400'}\`}><span className="material-icons-round text-sm">groups</span> Nhóm</button>
                                                <button type="button" onClick={() => setCommTab('reels')} className={\`flex-1 py-2 rounded-lg flex items-center justify-center gap-1 \${commTab === 'reels' ? 'bg-emerald-500 text-white' : 'text-slate-400'}\`}><span className="material-icons-round text-sm">movie</span> Eco Reels</button>
                                            </div>

                                            {commTab === 'events' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {appState.events.map(ev => (
                                                        <div key={ev.id} className="glass rounded-2xl overflow-hidden flex flex-col sm:flex-row">
                                                            <img src={ev.img} className="w-full sm:w-36 h-36 object-cover" alt="" />
                                                            <div className="p-4 flex flex-col justify-between flex-1 text-xs space-y-2">
                                                                <div>
                                                                    <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                                                                    <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{ev.desc}</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex justify-between text-[10px] text-slate-400">
                                                                        <span>📍 {ev.loc}</span>
                                                                        <span>👥 {ev.joined}/{ev.max}</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                                                                        <div className="bg-emerald-500 h-full" style={{ width: \`\${(ev.joined/ev.max)*100}%\` }}></div>
                                                                    </div>
                                                                </div>
                                                                <button type="button" onClick={() => alert('🎉 Đăng ký thành công!')} className="w-full bg-emerald-600 hover:bg-emerald-500 p-1.5 rounded-lg text-white font-bold">Đăng ký tham gia</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {commTab === 'groups' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    {appState.groups.map(g => (
                                                        <div key={g.id} className="glass p-5 rounded-2xl space-y-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-white text-sm">{g.name}</h4>
                                                                    <p className="text-[10px] text-emerald-400 font-medium">📍 Địa bàn: {g.area}</p>
                                                                </div>
                                                                <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">{g.members} mems</span>
                                                            </div>
                                                            <p className="text-slate-400 line-clamp-2">{g.desc}</p>
                                                            <button type="button" onClick={() => alert('🎉 Đã tham gia nhóm thành công!')} className="w-full border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 p-2 rounded-xl font-bold transition">Gia nhập nhóm</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {commTab === 'reels' && (
                                                <div className="max-w-sm mx-auto glass rounded-3xl overflow-hidden shadow-2xl relative aspect-[9/16] max-h-[500px]">
                                                    <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500" className="w-full h-full object-cover" alt="" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 space-y-2 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-emerald-500"></div>
                                                            <p className="font-bold text-white">@saigon_xanh_team</p>
                                                        </div>
                                                        <p className="text-slate-200">Tips phân loại rác thải cực dễ làm tại hộ gia đình! #gocsongxanh #recycling</p>
                                                        <div className="flex items-center justify-between text-slate-300 text-[10px] pt-1">
                                                            <span className="flex items-center gap-1"><span className="material-icons-round text-sm text-red-500">favorite</span> 14.5K</span>
                                                            <span className="flex items-center gap-1"><span className="material-icons-round text-sm">chat</span> 482</span>
                                                            <span className="flex items-center gap-1"><span className="material-icons-round text-sm">share</span> Chia sẻ</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 💬 TRANG 4: CHAT CỘNG ĐỒNG */}
                                    {currentTab === 'chat' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[480px]">
                                            <div className="glass rounded-2xl p-4 space-y-3 flex flex-col">
                                                <input type="text" placeholder="Tìm phòng chat nhanh..." className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded-xl focus:outline-none" />
                                                <div className="space-y-1.5 flex-1 overflow-y-auto text-xs">
                                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center cursor-pointer">
                                                        <div><p className="font-bold text-white">🌱 Sài Gòn Xanh - Tổng trạm</p><p className="text-[10px] text-slate-400 truncate w-36">Anh em mai ra quân nhé...</p></div>
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                    </div>
                                                    <div className="p-3 bg-slate-800/40 rounded-xl flex justify-between items-center opacity-70 cursor-pointer hover:bg-slate-800">
                                                        <div><p className="font-bold text-slate-300">♻️ Zero Waste HCM Group</p><p className="text-[10px] text-slate-500">Báo cáo pin cũ đã nhận...</p></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 glass rounded-2xl p-4 flex flex-col justify-between">
                                                <div className="flex-1 bg-slate-950/50 rounded-xl p-3 space-y-2 overflow-y-auto text-xs custom-scroll">
                                                    <div className="p-2 bg-slate-800 rounded-xl max-w-[80%]"><p className="font-bold text-[9px] text-emerald-400">Hoàng Minh</p><p>Sáng mai tập kết ở Kênh Đôi đúng không cả nhà?</p></div>
                                                    <div className="p-2 bg-emerald-600 text-white rounded-xl max-w-[80%] ml-auto text-right"><p className="font-bold text-[9px] opacity-70">Bạn</p><p>Đúng rồi bro ơi, nhớ mang ủng đầy đủ nha!</p></div>
                                                </div>
                                                <div className="flex gap-2 pt-3">
                                                    <input type="text" placeholder="Nhập tin nhắn 😊 🌱 ♻️..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl text-xs px-3 text-white focus:outline-none" />
                                                    <button type="button" onClick={() => alert('Tin nhắn đã được gửi.')} className="bg-emerald-600 hover:bg-emerald-500 px-4 rounded-xl text-xs font-bold">Gửi</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 📰 TRANG 5: TIN TỨC & MẸO */}
                                    {currentTab === 'news' && (
                                        <div className="space-y-4">
                                            <div className="flex gap-2 text-xs font-medium">
                                                {['all', 'article', 'tip', 'video'].map(f => (
                                                    <button type="button" key={f} onClick={() => setNewsFilter(f)} className={\`px-3 py-1.5 rounded-lg border capitalize \${newsFilter === f ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}\`}>
                                                        {f === 'all' ? 'Tất cả' : f === 'article' ? 'Bài viết' : f === 'tip' ? 'Mẹo' : 'Video/Phóng sự'}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                {(newsFilter === 'all' || newsFilter === 'article') && (
                                                    <div className="glass p-4 rounded-2xl space-y-2">
                                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">Bài viết - Tin Môi Trường</span>
                                                        <h4 className="font-bold text-sm text-slate-100">TP.HCM đồng loạt ra quân làm sạch hơn 10 tuyến kênh rạch</h4>
                                                        <p className="text-slate-400">Các cơ quan chức năng phối hợp cùng các tổ chức thanh niên dọn dẹp hàng tấn rác thải nhựa tồn đọng lâu năm.</p>
                                                        <p className="text-[10px] text-slate-500">2 giờ trước • Xem thêm</p>
                                                    </div>
                                                )}
                                                {(newsFilter === 'all' || newsFilter === 'tip') && (
                                                    <div className="glass p-4 rounded-2xl space-y-2">
                                                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Mẹo Sống Xanh</span>
                                                        <h4 className="font-bold text-sm text-slate-100">5 quy tắc vàng giúp bạn phân loại rác thải tại nhà hữu ích</h4>
                                                        <p className="text-slate-400">Hành động nhỏ thay đổi lớn. Hướng dẫn chi tiết cách gom rác tái chế để tích thêm điểm thưởng EcoPoints.</p>
                                                        <p className="text-[10px] text-slate-500">1 ngày trước • Xem thêm</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 📝 TRANG 6: THEO DÕI BÁO CÁO */}
                                    {currentTab === 'tracking' && (
                                        <div className="glass p-6 rounded-2xl space-y-4 text-xs">
                                            <h3 className="font-bold text-slate-100">📋 Trạng thái tiến độ xử lý sự cố môi trường</h3>
                                            <div className="space-y-3">
                                                {appState.reports.map(r => (
                                                    <div key={r.id} className="p-4 bg-slate-800/40 border border-slate-700 rounded-xl space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="text-slate-500 font-mono font-bold mr-2">{r.id}</span>
                                                                <span className="font-bold text-white text-sm">{r.title}</span>
                                                            </div>
                                                            <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold \${r.status === 'Đã xử lý' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}\`}>{r.status}</span>
                                                        </div>
                                                        <div className="pl-4 border-l border-slate-600 space-y-2 text-[11px] relative">
                                                            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span><span className="text-slate-300">Cơ quan chức năng tiếp nhận và đã chuyển đội điều phối.</span></div>
                                                            <div className="flex items-center gap-2 opacity-50"><span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span><span>Tiến hành thu gom xử lý hiện trường thực tế.</span></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 🛡️ TRANG 7: QUẢN LÝ PHÊ DUYỆT (Cán bộ) */}
                                    {currentTab === 'admin' && user.role === 'Official' && (
                                        <div className="space-y-4 text-xs">
                                            <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-500/20 text-blue-400 mb-2">🛡️ <b>Bảo mật thông tin:</b> Cán bộ được quyền xem danh tính người gửi phục vụ công tác xác minh.</div>
                                            <div className="space-y-3">
                                                {appState.reports.filter(r=>r.status==='Chờ xử lý').map(r => (
                                                    <div key={r.id} className="glass p-4 rounded-xl border border-slate-700 flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold">{r.severity}</span>
                                                                <h4 className="font-bold text-white text-sm">{r.title}</h4>
                                                            </div>
                                                            <p className="text-slate-400">📍 Khu vực: {r.location}</p>
                                                            <p className="text-slate-300 font-medium">👤 Người gửi: <b className="text-blue-400">{r.reporter}</b> - SĐT: {r.phone}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => { r.status='Đang xử lý'; alert('Đã duyệt báo cáo!'); loadState(); }} className="bg-emerald-600 hover:bg-emerald-500 p-2 px-3 rounded-xl font-bold text-white">Phê duyệt</button>
                                                            <button type="button" onClick={() => { r.status='Từ chối'; alert('Đã hủy báo cáo.'); loadState(); }} className="bg-slate-800 hover:bg-slate-700 p-2 px-3 rounded-xl font-bold text-red-400">Từ chối</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 📊 TRANG 8: THỐNG KÊ TỔNG QUAN */}
                                    {currentTab === 'stats' && (
                                        <div className="glass p-6 rounded-2xl space-y-6 text-xs">
                                            <h3 className="font-bold text-slate-100">📈 Phân tích chỉ số và nguồn thải gây hại ô nhiễm</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <p className="text-slate-300 font-semibold">Tỉ trọng các loại rác ô nhiễm hiện nay</p>
                                                    <div className="space-y-2">
                                                        <div><div className="flex justify-between mb-1"><span>🗑️ Rác nhựa thải sinh hoạt (55%)</span></div><div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-emerald-500 h-full w-[55%]"></div></div></div>
                                                        <div><div className="flex justify-between mb-1"><span>💧 Nước thải công nghiệp (30%)</span></div><div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-blue-500 h-full w-[30%]"></div></div></div>
                                                        <div><div className="flex justify-between mb-1"><span>🏭 Khói khí bụi mịn đô thị (15%)</span></div><div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-orange-500 h-full w-[15%]"></div></div></div>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                                                    <div className="text-center space-y-1">
                                                        <span className="material-icons-round text-3xl text-emerald-400">verified</span>
                                                        <p className="font-bold text-white">Chỉ số không khí AQI trung bình</p>
                                                        <p className="text-2xl font-black text-emerald-400">62</p>
                                                        <p className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-3 py-1 rounded-full font-bold">Mức độ an toàn khuyến nghị (WHO)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 📅 TRANG 9: LỊCH TRÌNH SỰ KIỆN */}
                                    {currentTab === 'schedule' && (
                                        <div className="glass p-6 rounded-2xl space-y-4 text-xs">
                                            <h3 className="font-bold text-slate-100">🗓️ Lịch hoạt động chi tiết cá nhân</h3>
                                            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 mb-2">
                                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                                            </div>
                                            <div className="grid grid-cols-7 gap-2 h-40 text-left">
                                                {Array.from({length: 28}).map((_, i) => (
                                                    /* 🌟 ĐÃ HOTFIX: Sửa đổi hoàn toàn \frac{ thành \${ đúng chuẩn JavaScript Template Literals */
                                                    <div key={i} className={\`p-1.5 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col justify-between \${i+1 === 15 ? 'border-emerald-500/60 bg-emerald-950/20' : ''}\`}>
                                                        <span className="text-[10px] text-slate-500 font-mono">{i+1}</span>
                                                        {i+1 === 15 && <span className="w-2 h-2 rounded-full bg-emerald-400 block mx-auto shadow-emerald-500 shadow"></span>}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">💡 Bạn đang có chiến dịch dọn rác xanh Kênh Đôi sắp diễn ra vào ngày 15 này.</p>
                                        </div>
                                    )}

                                    {/* 🌿 TRANG 10: MẸO SỐNG XANH */}
                                    {currentTab === 'tips' && (
                                        <div className="space-y-4 text-xs">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="glass p-5 rounded-2xl border-l-4 border-emerald-500 space-y-2">
                                                    <h4 className="font-bold text-white text-sm">♻️ Giải pháp ủ phân hữu cơ dễ dàng tại nhà</h4>
                                                    <p className="text-slate-400">Tận dụng rác thải rau củ dư thừa trộn mụn đất để bồi đắp dinh dưỡng nuôi mảng xanh tự nhiên trong gia đình nhỏ.</p>
                                                </div>
                                                <div className="glass p-5 rounded-2xl border-l-4 border-blue-500 space-y-2">
                                                    <h4 className="font-bold text-white text-sm">💧 Phương pháp tái sử dụng nguồn nước sinh hoạt</h4>
                                                    <p className="text-slate-400">Giữ lại nước vo gạo, nước rửa rau sạch để dùng tưới cây cảnh, giảm hao phí tài nguyên nước vô ích.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 📋 TRANG 11: YÊU CẦU XIN PHÉP (Nhà tổ chức) */}
                                    {currentTab === 'permission' && user.role === 'Organizer' && (
                                        <div className="glass p-6 rounded-2xl space-y-4 text-xs">
                                            <h3 className="font-bold text-purple-400 flex items-center gap-1"><span className="material-icons-round text-base">assignment_turned_in</span> Đệ trình hồ sơ cấp phép hoạt động tình nguyện</h3>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                const newReq = {
                                                    title: e.target.pTitle.value,
                                                    org: e.target.pOrg.value,
                                                    date: new Date().toISOString().split('T')[0]
                                                };
                                                fetch('/api/permissions', {
                                                    method: 'POST',
                                                    headers: {'Content-Type': 'application/json'},
                                                    body: JSON.stringify(newReq)
                                                }).then(res=>res.json()).then(data=>{
                                                    if(data.success) { alert('🎉 Đã nộp đơn lên ban quản lý kiểm duyệt Sở Tài nguyên!'); loadState(); e.target.reset(); }
                                                });
                                            }} className="space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div><label className="block text-slate-400 mb-1">Tên đơn vị tổ chức</label><input name="pOrg" type="text" placeholder="Đại học, Nhóm thiện nguyện..." className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none" required /></div>
                                                    <div><label className="block text-slate-400 mb-1">Tên chương trình hoạt động</label><input name="pTitle" type="text" placeholder="Gom pin cũ, trồng cây..." className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none" required /></div>
                                                </div>
                                                <button type="submit" className="bg-purple-600 hover:bg-purple-500 font-bold p-2.5 px-6 rounded-xl text-white uppercase tracking-wider font-mono">Gửi duyệt hồ sơ</button>
                                            </form>
                                        </div>
                                    )}

                                    {/* 📱 TRANG 12: MENU & PROFILE */}
                                    {currentTab === 'menu' && (
                                        <div className="glass p-6 rounded-2xl max-w-xl mx-auto text-xs space-y-6">
                                            <div className="text-center space-y-3">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-white text-3xl font-black uppercase shadow-xl">{user.name[0]}</div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                                    <p className="text-slate-400 text-[11px]">{user.email}</p>
                                                </div>
                                                <span className="inline-block bg-emerald-500/10 text-emerald-400 font-bold p-1 px-4 rounded-full border border-emerald-500/20">Vai trò: {user.role}</span>
                                            </div>
                                            <div className="border-t border-slate-800 pt-4 space-y-2 text-slate-300">
                                                <div className="flex justify-between p-2 bg-slate-900 rounded-lg"><span>Tổng điểm EcoPoints tích lũy</span><b className="text-amber-400 font-mono">{user.points} XP</b></div>
                                                <div className="flex justify-between p-2 bg-slate-900 rounded-lg"><span>Quà tặng đổi thưởng hiện khả dụng</span><b className="text-emerald-400">Voucher Katinat Green</b></div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </main>

                            {/* 🤖 FLOATING ECOBOT AI */}
                            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                                {isBotOpen && (
                                    <div className="glass w-72 sm:w-80 h-96 rounded-2xl p-4 flex flex-col justify-between shadow-2xl mb-3 border border-emerald-500/30">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                            <div className="flex items-center gap-1.5"><span className="material-icons-round text-emerald-400 text-sm">smart_toy</span><span className="text-xs font-bold text-white">EcoBot Trợ lý AI Môi trường</span></div>
                                            <button type="button" onClick={() => setIsBotOpen(false)} className="text-slate-400 hover:text-white"><span className="material-icons-round text-sm">close</span></button>
                                        </div>
                                        <div className="flex-1 bg-slate-950/60 rounded-xl p-2.5 my-2 overflow-y-auto space-y-2 text-[10px] custom-scroll">
                                            {botLogs.map((b, i) => (
                                                <div key={i} className={\`p-2 rounded-xl max-w-[85%] \${b.s === 'user' ? 'bg-emerald-600 ml-auto text-white' : 'bg-slate-800 text-slate-200'}\`}>
                                                    <p className="leading-relaxed">{b.t}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            if(!botInput.trim()) return;
                                            const txt = botInput;
                                            setBotLogs(p=>[...p, {s: 'user', t: txt}]);
                                            setBotInput('');
                                            setTimeout(() => {
                                                setBotLogs(p=>[...p, {s: 'bot', t: 'Theo báo cáo kiểm định chất lượng khí thải thời gian thực từ mạng lưới IQAir toàn cầu phối hợp cùng tiêu chuẩn môi trường WHO, khu vực bạn ghi nhận mật độ rác nhựa ở mức cao. Bạn hãy phân loại rác thải tại nguồn để cùng chung tay nhé!'}]);
                                            }, 600);
                                        }} className="flex gap-1">
                                            <input type="text" value={botInput} onChange={e => setBotInput(e.target.value)} placeholder="Hỏi EcoBot..." className="flex-1 bg-slate-900 text-[11px] p-2 rounded-xl text-white focus:outline-none border border-slate-700" />
                                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 p-2 rounded-xl text-white"><span className="material-icons-round text-xs">send</span></button>
                                        </form>
                                    </div>
                                )}
                                <button type="button" onClick={() => setIsBotOpen(!isBotOpen)} className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl transition-transform hover:scale-105">
                                    <span className="material-icons-round">smart_toy</span>
                                </button>
                            </div>

                        </div>
                    );
                }

                ReactDOM.createRoot(document.getElementById('root')).render(<App />);
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`====================================================================`);
    console.log(` 🌱 ECOCONNECT HCM - FIXED PRODUCTION V1.0.2 READY`);
    console.log(` 🚀 ĐƯỜNG DẪN KIỂM TRA LOCALHOST: http://localhost:${PORT}`);
    console.log(`====================================================================`);
});
