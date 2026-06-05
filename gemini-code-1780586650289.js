/**
 * ARCHITECT MONOLITH CONTROL ENGINE - VERSION 3.5.0
 * Core Framework: Express.js (Node.js)
 * View Engine: Embedded React 18 & Tailwind CSS Pipeline
 * System State: In-Memory Data Storage Layer (Thread-Safe Simulation)
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================================================
// 🚀 TẦNG 1: CẤU HÌNH HỆ THỐNG & MIDDLEWARE CHẶN LỖI CAO CẤP
// =========================================================================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// =========================================================================
// 💾 TẦNG 2: STATE DATABASE MÔ PHỎNG (IN-MEMORY PERSISTENCE LAYER)
// =========================================================================
let currentSession = null; 

let leaderboard = [
    { id: "u_01", full_name: "Hoàng Minh Đức", username: "duc_eco", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=duc", points: 1450 },
    { id: "u_02", full_name: "Lê Thị Mai", username: "mai_green", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=mai", points: 1210 },
    { id: "u_03", full_name: "Trần Bảo Nam", username: "nam_clean", avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=nam", points: 980 }
];

let reports = [
    {
        id: "rep_101",
        title: "Rác thải nhựa bủa vây bờ kênh rạch Quận 8",
        category: "Rác thải nhựa",
        description: "Lượng lớn túi nilon, chai nhựa dồn ứ lâu ngày bốc mùi hôi thối, cản trở dòng chảy nghiêm trọng.",
        severity: "critical",
        latitude: 10.742,
        longitude: 106.635,
        image_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
        approvals: 6,
        rejections: 1,
        reporter: "Hoàng Minh Đức"
    },
    {
        id: "rep_102",
        title: "Bãi rác tự phát lấn chiếm lòng lề đường",
        category: "Rác thải nhựa",
        description: "Người dân tập kết rác sinh hoạt sai quy định ngay ngã tư gây mất mỹ quan đô thị và ô nhiễm.",
        severity: "high",
        latitude: 10.785,
        longitude: 106.695,
        image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
        approvals: 3,
        rejections: 0,
        reporter: "Lê Thị Mai"
    }
];

let posts = [
    {
        id: "post_201",
        title: "Chiến dịch 21 ngày cai nhựa dùng một lần",
        category: "SốngXanh",
        content: "Hôm nay là ngày thứ 10 mình từ chối lấy túi nilon khi đi siêu thị. Cảm giác cầm túi vải cá nhân vừa thời trang vừa đỡ mang tội với Trái Đất!",
        likes: 42,
        comments: 8,
        author: "Nguyễn Văn Hùng",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hung"
    },
    {
        id: "post_202",
        title: "Địa điểm thu hồi pin cũ miễn phí tại trung tâm",
        category: "SựKiện",
        content: "Mọi người nhớ gom pin cũ lại mang qua các siêu thị lớn hoặc điểm UBND phường để xử lý nha, đừng vứt chung thùng rác sinh hoạt cực độc hại.",
        likes: 88,
        comments: 19,
        author: "Trần Bảo Nam",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nam"
    }
];

// =========================================================================
// 📡 TẦNG 3: CONTROLLER & ROUTING CORE API ENDPOINTS
// =========================================================================

// 🔐 MODULE 3.1: AUTHENTICATION (Đúng chuẩn tài khoản đề bài yêu cầu)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (String(email).trim() === 'user@test.com' && String(password) === 'User@123456') {
        currentSession = { 
            email: 'user@test.com', 
            full_name: 'Chiến Binh Sinh Thái v3', 
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=warrior' 
        };
        return res.status(200).json({ success: true, user: currentSession });
    }
    return res.status(401).json({ success: false, message: "Tài khoản hoặc mật khẩu không chính xác!" });
});

app.post('/api/auth/logout', (req, res) => {
    currentSession = null;
    res.status(200).json({ success: true });
});

app.get('/api/auth/session', (req, res) => {
    res.status(200).json({ success: true, user: currentSession });
});

// 📊 MODULE 3.2: LIVE SYSTEM STATISTICS
app.get('/api/stats', (req, res) => {
    const totalPoints = leaderboard.reduce((acc, curr) => acc + Number(curr.points), 0);
    const verified = reports.filter(r => Number(r.approvals) >= 5).length;
    res.status(200).json({
        success: true,
        data: {
            totalReports: reports.length,
            verifiedReports: verified,
            activeUsers: leaderboard.length + (currentSession ? 1 : 0),
            totalEcoPoints: totalPoints
        }
    });
});

app.get('/api/profiles/leaderboard', (req, res) => {
    const sortedList = [...leaderboard].sort((a, b) => b.points - a.points);
    res.status(200).json({ success: true, data: sortedList });
});

// 🚨 MODULE 3.3: SỰ CỐ MÔI TRƯỜNG & RADAR MAP PINS
app.get('/api/reports', (req, res) => {
    res.status(200).json({ success: true, data: reports });
});

app.post('/api/reports', (req, res) => {
    const { title, description, category, severity } = req.body;
    
    // Giả lập thuật toán cấp tọa độ ngẫu nhiên xung quanh khu vực TP.HCM để Render map pins
    const baseLat = 10.75;
    const baseLng = 10.66;
    const randLat = baseLat + (Math.random() * 0.08);
    const randLng = baseLng + (Math.random() * 0.08);

    const newIncident = {
        id: "rep_" + Date.now(),
        title: String(title || "Sự cố chưa đặt tên"),
        description: String(description || "Không có mô tả chi tiết."),
        category: String(category || "Chưa phân loại"),
        severity: String(severity || "medium"),
        latitude: parseFloat(randLat.toFixed(4)),
        longitude: parseFloat(randLng.toFixed(4)),
        image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
        approvals: 0,
        rejections: 0,
        reporter: currentSession ? currentSession.full_name : "Chiến binh ẩn danh"
    };

    reports.unshift(newIncident);
    res.status(201).json({ success: true, data: newIncident });
});

app.post('/api/reports/:id/vote', (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body;
    const item = reports.find(r => r.id === id);

    if (!item) return res.status(404).json({ success: false, message: "Hồ sơ sự cố không tồn tại!" });

    if (voteType === 'approve') {
        item.approvals = Number(item.approvals) + 1;
        // Cơ chế thưởng điểm danh vọng khi đạt đủ KPI xác thực cộng đồng (5 votes)
        if (item.approvals === 5) {
            const userInLeaderboard = leaderboard.find(u => u.full_name === item.reporter);
            if (userInLeaderboard) userInLeaderboard.points += 50;
        }
    } else {
        item.rejections = Number(item.rejections) + 1;
    }

    res.status(200).json({ success: true, data: item });
});

// 💬 MODULE 3.4: DIỄN ĐÀN THẢO LUẬN CỘNG ĐỒNG
app.get('/api/community/feed', (req, res) => {
    res.status(200).json({ success: true, data: posts });
});

app.post('/api/community/posts', (req, res) => {
    const { title, category, content } = req.body;
    const newForumPost = {
        id: "post_" + Date.now(),
        title: String(title),
        category: String(category || "SốngXanh"),
        content: String(content),
        likes: 0,
        comments: 0,
        author: currentSession ? currentSession.full_name : "Cư dân Xanh",
        avatar: currentSession ? currentSession.avatar : "https://api.dicebear.com/7.x/bottts/svg?seed=anonymous"
    };

    posts.unshift(newForumPost);
    res.status(201).json({ success: true, data: newForumPost });
});

app.post('/api/community/posts/:id/like', (req, res) => {
    const targetPost = posts.find(p => p.id === req.params.id);
    if (!targetPost) return res.status(404).json({ success: false, message: "Bài viết đã bị xóa!" });
    targetPost.likes = Number(targetPost.likes) + 1;
    res.status(200).json({ success: true, data: targetPost });
});

// 🤖 MODULE 3.5: TRỢ LÝ ẢO TỐI ƯU ECO-BRO AI VVIP ENGINE (Nói chuyện tự nhiên, bánh cuốn)
app.post('/api/ai/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Bro chưa nhập nội dung chat kìa!" });

    const clientMsg = message.toLowerCase();
    let aiResponse = "";

    if (clientMsg.includes("chào") || clientMsg.includes("hello") || clientMsg.includes("hi")) {
        aiResponse = "Yo bro! Tui là Eco-Bro, tổng tư lệnh ảo hỗ trợ tác chiến môi trường đây. Nay có bãi rác nào cần 'san phẳng' hay cần tui hiến kế sống xanh cua crush không, báo tui nghe coi!";
    } else if (clientMsg.includes("pin") || clientMsg.includes("vứt pin")) {
        aiResponse = "Ní ơi tỉnh táo lại! Pin cũ tuyệt đối không được vứt bừa bãi vô thùng rác nhà đâu nha độc hại kinh khủng khiếp! Một viên pin nhỏ xíu có thể làm ô nhiễm 500 lít nước hoặc 1 mét khối đất trong mấy chục năm luôn á. Gom lại bỏ lọ thủy tinh, cuối tuần xách ra mấy điểm thu gom của thành phố hoặc đem qua Quận 1 đổi sen đá nha bro! 💚";
    } else if (clientMsg.includes("nhựa") || clientMsg.includes("nilon") || clientMsg.includes("ly trà sữa")) {
        aiResponse = "Uống một ly trà sữa mất 15 phút nhưng cái ly với ống hút nhựa mất tới 500 năm mới phân hủy hết đó ní ơi. Ra đường sắm quả bình giữ nhiệt thép không gỉ xách theo vừa ngầu, vừa được chủ quán giảm giá, lại cứu thế giới bớt đi một tấn nghiệp nhựa. Kèo này quá hời, triển ngay đi bro!";
    } else if (clientMsg.includes("điểm") || clientMsg.includes("eco point") || clientMsg.includes("top")) {
        aiResponse = "Đua top bảng vàng vinh danh hả bro? Dễ ẹt! Chịu khó xách xe đi săn lùng mấy điểm ô nhiễm rồi chụp ảnh báo cáo lên Radar Map nè (được cộng ngay 50 điểm khi cộng đồng duyệt), hoặc viết bài chia sẻ mẹo tái chế xịn mịn lên diễn đàn kiếm like. Cày điểm đi, tui đứng đây cổ vũ ông!";
    } else if (clientMsg.includes("bản đồ") || clientMsg.includes("radar") || clientMsg.includes("map")) {
        aiResponse = "Màn hình Radar Grid điều khiển của mình xịn lắm á! Mỗi khi ông hoặc anh em chiến binh gửi báo cáo, hệ thống lập tức ghim một cái chấm đỏ (Pin) nhấp nháy định vị lên bản đồ vệ tinh. Từ đó mọi người xung quanh nhìn thấy là biết đường né ô nhiễm hoặc cùng rủ nhau ra dọn dẹp phụ á, đỉnh chóp luôn!";
    } else {
        aiResponse = `Nghe cuốn đấy bro! Ý tưởng về "${message}" chứng tỏ ông có tố chất làm chuyên gia khí quyển rồi đó. Cứ tích cực phát huy tinh thần thép này nha, Trái Đất ghi công ông một điểm thanh lịch! Cần hỏi sâu góc nào nữa cứ ném hết vào đây tui cân tất!`;
    }

    res.status(200).json({ success: true, reply: aiResponse });
});

// =========================================================================
// 🎨 TẦNG 4: VIEW ENGINE - NHÚNG TOÀN BỘ FRONTEND PREMIUM COMPONENT INTERFACE
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Eco-System Tactical Command Dashboard</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
                body { background-color: #030712; color: #f3f4f6; font-family: ui-sans-serif, system-ui, sans-serif; overflow-x: hidden; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.25); border-radius: 999px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
            </style>
        </head>
        <body>
            <div id="app-viewport"></div>

            <script type="text/babel">
                const { useState, useEffect, useRef } = React;

                function EcoCommandCenter() {
                    const [user, setUser] = useState(null);
                    const [globalStats, setGlobalStats] = useState({ totalReports: 0, verifiedReports: 0, activeUsers: 0, totalEcoPoints: 0 });
                    const [incidents, setIncidents] = useState([]);
                    const [feedPosts, setFeedPosts] = useState([]);
                    const [rankingList, setRankingList] = useState([]);
                    const [isAppLoading, setIsAppLoading] = useState(true);

                    // Auth State
                    const [inputEmail, setInputEmail] = useState("user@test.com");
                    const [inputPassword, setInputPassword] = useState("User@123456");
                    const [authErrorMessage, setAuthErrorMessage] = useState("");

                    // Form State
                    const [formTitle, setFormTitle] = useState("");
                    const [formCategory, setFormCategory] = useState("Rác thải nhựa");
                    const [formSeverity, setFormSeverity] = useState("medium");
                    const [formDesc, setFormDesc] = useState("");

                    const [forumTitle, setForumTitle] = useState("");
                    const [forumCategory, setForumCategory] = useState("SốngXanh");
                    const [forumContent, setForumContent] = useState("");

                    // AI Chat Bot Module State
                    const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
                    const [currentChatText, setCurrentChatText] = useState("");
                    const [isAiResponding, setIsAiResponding] = useState(false);
                    const [chatLog, setChatLog] = useState([
                        { role: "bot", msg: "Yo chiến binh! Tui là Eco-Bro AI đây. Nay thế giới có biến động môi trường gì cần tui xử lý phụ không ní?" }
                    ]);
                    const autoScrollAnchor = useRef(null);

                    const synchronizeCoreMetrics = async () => {
                        try {
                            const [sessionData, statsData, reportsData, postsData, boardData] = await Promise.all([
                                fetch('/api/auth/session').then(res => res.json()),
                                fetch('/api/stats').then(res => res.json()),
                                fetch('/api/reports').then(res => res.json()),
                                fetch('/api/community/feed').then(res => res.json()),
                                fetch('/api/profiles/leaderboard').then(res => res.json())
                            ]);

                            if (sessionData.user) setUser(sessionData.user);
                            if (statsData.success) setGlobalStats(statsData.data);
                            if (reportsData.success) setIncidents(reportsData.data);
                            if (postsData.success) setFeedPosts(postsData.data);
                            if (boardData.success) setRankingList(boardData.data);
                        } catch (err) {
                            console.error("Critical System Outage during synchronization:", err);
                        } finally {
                            setIsAppLoading(false);
                        }
                    };

                    useEffect(() => { synchronizeCoreMetrics(); }, []);
                    useEffect(() => { autoScrollAnchor.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog, isAiResponding]);

                    const triggerSecurityAuthentication = async (e) => {
                        e.preventDefault();
                        setAuthErrorMessage("");
                        const apiResponse = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: inputEmail, password: inputPassword })
                        });
                        const responseBody = await apiResponse.json();
                        if (apiResponse.ok) {
                            setUser(responseBody.user);
                            synchronizeCoreMetrics();
                        } else {
                            setAuthErrorMessage(responseBody.message);
                        }
                    };

                    const terminateSession = async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        setUser(null);
                    };

                    const submitNewIncidentReport = async (e) => {
                        e.preventDefault();
                        if(!formTitle.trim() || !formDesc.trim()) return alert("Vui lòng điền đủ thông tin để vệ tinh lập tọa độ dữ liệu!");
                        await fetch('/api/reports', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: formTitle, description: formDesc, category: formCategory, severity: formSeverity })
                        });
                        setFormTitle(""); setFormDesc("");
                        synchronizeCoreMetrics();
                    };

                    const registerCommunityVote = async (targetId, type) => {
                        await fetch(\`/api/reports/\${targetId}/vote\`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ voteType: type })
                        });
                        synchronizeCoreMetrics();
                    };

                    const dispatchForumArticle = async (e) => {
                        e.preventDefault();
                        if(!forumTitle.trim() || !forumContent.trim()) return alert("Nội dung bài viết diễn đàn không được bỏ trống bro ơi!");
                        await fetch('/api/community/posts', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: forumTitle, category: forumCategory, content: forumContent })
                        });
                        setForumTitle(""); setForumContent("");
                        synchronizeCoreMetrics();
                    };

                    const amplifyPostEngagement = async (postId) => {
                        await fetch(\`/api/community/posts/\${postId}/like\`, { method: 'POST' });
                        synchronizeCoreMetrics();
                    };

                    const interfaceWithAiAssistant = async (e) => {
                        e.preventDefault();
                        if(!currentChatText.trim()) return;
                        const bufferedPrompt = currentChatText;
                        setChatLog(prev => [...prev, { role: "user", msg: bufferedPrompt }]);
                        setCurrentChatText("");
                        setIsAiResponding(true);

                        const response = await fetch('/api/ai/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: bufferedPrompt })
                        }).then(r => r.json());

                        setChatLog(prev => [...prev, { role: "bot", msg: response.reply }]);
                        setIsAiResponding(false);
                    };

                    if (isAppLoading) return (
                        <div className="flex h-screen w-screen flex-col items-center justify-center font-mono text-xs text-emerald-400">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            INITIALIZING SYSTEM INTERFACES V3.5...
                        </div>
                    );

                    // COMPONENT: MÀN HÌNH ĐĂNG NHẬP SECURE SECURITY PORTAL
                    if (!user) return (
                        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
                            <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">⚡</div>
                                    <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">COMMAND CONTROL SIGN-IN</h1>
                                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Xác thực quyền truy cập trạm trung tâm</p>
                                </div>
                                <form onSubmit={triggerSecurityAuthentication} className="flex flex-col gap-4 text-xs">
                                    <div>
                                        <label className="block text-slate-400 font-mono uppercase text-[9px] mb-1">Xác định mã danh tính (Email)</label>
                                        <input type="email" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" value={inputEmail} onChange={e=>setInputEmail(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 font-mono uppercase text-[9px] mb-1">Khóa mật mã truy cập (Password)</label>
                                        <input type="password" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" value={inputPassword} onChange={e=>setInputPassword(e.target.value)} required />
                                    </div>
                                    {authErrorMessage && <div className="text-rose-400 font-mono text-[11px] text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{authErrorMessage}</div>}
                                    <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-98 transition-all">ĐĂNG NHẬP HỆ THỐNG 🪐</button>
                                </form>
                                <div className="mt-5 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-center text-slate-400 font-mono">
                                    💡 Thông tin tài khoản trong tệp tài liệu: <br/>
                                    Tài khoản: <span className="text-emerald-400 font-bold">user@test.com</span> <br/>
                                    Mật khẩu: <span className="text-emerald-400 font-bold">User@123456</span>
                                </div>
                            </div>
                        </div>
                    );

                    // COMPONENT: MAIN CONTROL PANEL SUITE
                    return (
                        <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
                            
                            {/* TOP CONTROL HUB BRAND BAR */}
                            <header className="mb-6 flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-md">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">🌐</div>
                                    <div>
                                        <h1 className="text-xl font-black text-white tracking-tight">ECO-SYSTEM CENTRAL OPERATIONS</h1>
                                        <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Hệ thống giám sát thực địa toàn cầu v3.5</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3.5 mt-3 md:mt-0 text-xs">
                                    <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-2 rounded-xl">
                                        <img src={user.avatar} className="w-5 h-5 rounded-full" />
                                        <span className="font-bold text-slate-200 text-[11px]">{user.full_name}</span>
                                    </div>
                                    <button onClick={terminateSession} className="text-[10px] font-mono text-rose-400 hover:text-rose-300 bg-rose-500/5 px-3 py-2 rounded-xl border border-rose-500/10 tracking-wider font-bold transition-all">ĐĂNG XUẤT</button>
                                </div>
                            </header>

                            {/* STATISTICS DISPLAY CONSOLE */}
                            <section className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-center text-xs">
                                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                                    <div className="text-slate-500 uppercase text-[9px] tracking-wider">Tổng Sự Cố Thu Thập</div>
                                    <div className="text-2xl font-black text-slate-100 mt-1">{globalStats.totalReports}</div>
                                </div>
                                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                                    <div className="text-emerald-400 uppercase text-[9px] tracking-wider">Đã Xác Minh Vệ Tinh</div>
                                    <div className="text-2xl font-black text-emerald-400 mt-1">{globalStats.verifiedReports} / {globalStats.totalReports}</div>
                                </div>
                                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                                    <div className="text-slate-500 uppercase text-[9px] tracking-wider">Nhân Sự Trực Tuyến</div>
                                    <div className="text-2xl font-black text-slate-100 mt-1">{globalStats.activeUsers}</div>
                                </div>
                                <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                                    <div className="text-teal-400 uppercase text-[9px] tracking-wider">Tích Lũy EcoPoints</div>
                                    <div className="text-2xl font-black text-teal-400 mt-1">+{globalStats.totalEcoPoints} XP</div>
                                </div>
                            </section>

                            {/* TACTICAL PANELS HUB */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                
                                {/* TACTICAL COLUMN A: DIGITAL RADAR GRID & DISPATCH FORM */}
                                <div className="lg:col-span-4 flex flex-col gap-6">
                                    
                                    {/* SIMULATED SATELLITE RADAR VISUALIZER */}
                                    <div className="p-4 rounded-2xl border border-white/5 bg-slate-950/80">
                                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                            <span>🛰️ Satellite Radar Grid Tracker</span>
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        </div>
                                        
                                        <div className="w-full h-48 bg-slate-900 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:16px_16px]">
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent animate-pulse"></div>
                                            <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest select-none z-0">Khu vực kiểm soát: TP.HCM</div>
                                            
                                            {/* Vectorized Radar Pins Map Translation */}
                                            {incidents.map((incidentItem, index) => (
                                                <div 
                                                    key={incidentItem.id}
                                                    className={\`absolute w-3 h-3 rounded-full flex items-center justify-center cursor-pointer group z-10 \${incidentItem.severity === 'critical' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-amber-400'}\`}
                                                    style={{
                                                        top: \`\${25 + (index * 30) % 65}%\`,
                                                        left: \`\${15 + (index * 40) % 75}%\`
                                                    }}
                                                >
                                                    <div className="absolute -inset-2.5 bg-inherit rounded-full opacity-20 scale-150 hidden group-hover:block"></div>
                                                    
                                                    {/* Floating Cyber Tooltip Context */}
                                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-slate-950 border border-white/10 text-[9px] p-2 rounded-xl whitespace-nowrap z-50 font-sans shadow-2xl">
                                                        <span className="text-emerald-400 font-bold font-mono">[{incidentItem.category}]</span> {incidentItem.title}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] font-mono text-slate-500 text-center mt-2.5">💡 Rê chuột vào các điểm Radar Node để giải mã gói tin thực địa</p>
                                    </div>

                                    {/* FORM DISPATCH: INCIDENT LOGGING ENTRY */}
                                    <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/20">
                                        <h3 className="text-[11px] font-mono text-teal-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/5">🚨 Gửi Tín Hiệu Báo Cáo Thực Địa</h3>
                                        <form onSubmit={submitNewIncidentReport} className="flex flex-col gap-3 text-xs">
                                            <input type="text" placeholder="Tiêu đề vụ việc..." className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500/40" value={formTitle} onChange={e=>setFormTitle(e.target.value)} required />
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                <select className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-300 outline-none" value={formCategory} onChange={e=>setFormCategory(e.target.value)}>
                                                    <option>Rác thải nhựa</option>
                                                    <option>Ô nhiễm nguồn nước</option>
                                                    <option>Khói bụi độc hại</option>
                                                </select>
                                                <select className="bg-slate-950 border border-white/10 rounded-xl p-2.5 text-slate-300 outline-none" value={formSeverity} onChange={e=>setFormSeverity(e.target.value)}>
                                                    <option value="medium">Mức độ: Vừa</option>
                                                    <option value="high">Mức độ: Cao</option>
                                                    <option value="critical">Nguy cấp 🚨</option>
                                                </select>
                                            </div>

                                            <textarea rows="2" placeholder="Nhập tọa độ hoặc mô tả chi tiết dấu hiệu vi phạm sinh thái..." className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-emerald-500/40" value={formDesc} onChange={e=>setFormDesc(e.target.value)} required />
                                            <button type="submit" className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono font-black uppercase tracking-wider text-[11px]">BẮN DỮ LIỆU LÊN HỆ THỐNG</button>
                                        </form>
                                    </div>
                                </div>

                                {/* TACTICAL COLUMN B: INCIDENT TELEMETRY STREAM */}
                                <div className="lg:col-span-5 flex flex-col gap-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <h2 className="text-sm font-black text-white">📡 Luồng Dữ Liệu Hiện Trường Sống</h2>
                                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest font-bold">Live Processing</span>
                                    </div>

                                    <div className="flex flex-col gap-4 max-h-[620px] overflow-y-auto pr-1">
                                        {incidents.map(item => (
                                            <div key={item.id} className="p-4 rounded-2xl border border-white/5 bg-slate-900/30 group hover:border-emerald-500/20 transition-all">
                                                <div className="w-full h-36 rounded-xl overflow-hidden border border-white/10 mb-3 bg-slate-950">
                                                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-102 transition-all opacity-90" />
                                                </div>
                                                
                                                <div className="flex justify-between text-[9px] font-mono uppercase font-bold mb-1.5">
                                                    <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">{item.category}</span>
                                                    <span className={item.severity === 'critical' ? 'text-rose-400 animate-pulse' : 'text-amber-400'}>{item.severity}</span>
                                                </div>

                                                <h4 className="text-xs font-black text-slate-100 group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                                                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
                                                
                                                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-white/5 mt-3.5 pt-2">
                                                    <span className="truncate max-w-[55%]">📍 GPS: {item.latitude}, {item.longitude} | Agent: {item.reporter}</span>
                                                    <div className="flex items-center gap-1.5 text-[10px]">
                                                        <button onClick={()=>registerCommunityVote(item.id, 'approve')} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all">👍 Duyệt ({item.approvals})</button>
                                                        <button onClick={()=>registerCommunityVote(item.id, 'reject')} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 font-bold hover:bg-rose-500/20 transition-all">👎 Bác ({item.rejections})</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* TACTICAL COLUMN C: COMMUNITY DATA FEED & HERO LEADERBOARD */}
                                <div className="lg:col-span-3 flex flex-col gap-6">
                                    
                                    {/* HERO RANKING DISPLAY BOARD */}
                                    <div className="p-4 rounded-2xl border border-white/5 bg-slate-950/50">
                                        <h3 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-3 font-bold">🏆 Đại Cáo Bảng Vinh Danh</h3>
                                        <div className="flex flex-col gap-2">
                                            {rankingList.map((rankItem, position) => (
                                                <div key={rankItem.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] border border-white/5 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-4 text-center font-mono font-black text-slate-500">{position + 1}</span>
                                                        <img src={rankItem.avatar_url} className="w-6 h-6 rounded-full border border-white/10" />
                                                        <div className="font-bold text-slate-300 max-w-[90px] truncate">{rankItem.full_name}</div>
                                                    </div>
                                                    <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">+{rankItem.points} XP</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* COMMUNITY FORUM HUB COMPONENT */}
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-xs font-black text-white border-b border-white/5 pb-1">💬 Diễn Đàn Sáng Kiến Xanh</h3>
                                        
                                        {/* FAST POST FORUM FIELD */}
                                        <form onSubmit={dispatchForumArticle} className="p-3 rounded-xl border border-white/5 bg-slate-900/10 flex flex-col gap-2 text-[11px]">
                                            <input type="text" placeholder="Tiêu đề sáng kiến..." className="bg-slate-950 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-emerald-500/30" value={forumTitle} onChange={e=>setForumTitle(e.target.value)} required />
                                            <textarea rows="2" placeholder="Mô tả cách thức vận hành hành trình sống xanh..." className="bg-slate-950 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-emerald-500/30" value={forumContent} onChange={e=>setForumContent(e.target.value)} required />
                                            <button type="submit" className="py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[10px] hover:bg-emerald-500/30 transition-all">ĐĂNG TẢI KHÍ THẾ</button>
                                        </form>

                                        {/* FORUM ARTICLES MAP FEED */}
                                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-0.5">
                                            {feedPosts.map(postItem => (
                                                <div key={postItem.id} className="p-3 rounded-xl border border-white/5 bg-slate-900/20 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <img src={postItem.avatar} className="w-4 h-4 rounded-full" />
                                                            <span className="text-[9px] font-mono text-slate-500 font-bold">{postItem.author}</span>
                                                        </div>
                                                        <span className="text-[9px] text-teal-400 font-mono font-black">#{postItem.category}</span>
                                                        <h4 className="text-xs font-bold text-slate-200 mt-0.5 leading-snug">{postItem.title}</h4>
                                                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{postItem.content}</p>
                                                    </div>
                                                    <div className="flex gap-2 border-t border-white/5 mt-2.5 pt-1.5 text-[9px] font-mono">
                                                        <button onClick={()=>amplifyPostEngagement(postItem.id)} className="text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-bold hover:bg-rose-500/10 transition-colors">❤️ {postItem.likes} tim</button>
                                                        <span className="text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-white/5">💬 {postItem.comments} cmt</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* 🔮 PREMIUM EXTRA: FLOATING ECO-BRO AI ASSISTANT LAYOVER */}
                            <div className="fixed bottom-6 right-6 z-50 font-sans">
                                {!isChatWidgetOpen ? (
                                    <button 
                                        onClick={() => setIsChatWidgetOpen(true)}
                                        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all animate-bounce duration-[2.5s]"
                                    >
                                        🤖
                                        <span className="absolute top-0 right-0 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                        </span>
                                    </button>
                                ) : (
                                    <div className="w-[330px] md:w-[360px] h-[460px] flex flex-col rounded-2xl border border-white/10 bg-slate-950 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        
                                        {/* AI Header Console */}
                                        <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-500/10">🤖</div>
                                                <div>
                                                    <div className="text-[11px] font-mono tracking-widest text-emerald-400 font-bold">ECO-BRO AI COMPILER</div>
                                                    <div className="text-[9px] text-slate-400 flex items-center gap-1">● Core Engine Active</div>
                                                </div>
                                            </div>
                                            <button onClick={() => setIsChatWidgetOpen(false)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-full text-xs">✕</button>
                                        </div>

                                        {/* AI Chat History Terminal */}
                                        <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3">
                                            {chatLog.map((chatNode, cIdx) => (
                                                <div key={cIdx} className={\`flex \${chatNode.role === "user" ? "justify-end" : "justify-start"}\`}>
                                                    <div className={\`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-md \${
                                                        chatNode.role === "user" 
                                                            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black rounded-tr-none" 
                                                            : "bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none"
                                                    }\`}>
                                                        {chatNode.msg}
                                                    </div>
                                                </div>
                                            ))}
                                            {isAiResponding && (
                                                <div className="text-[10px] font-mono text-emerald-400 animate-pulse tracking-wider">🤖 Eco-Bro AI đang quét ma trận dữ liệu...</div>
                                            )}
                                            <div ref={autoScrollAnchor} />
                                        </div>

                                        {/* AI Input Text Block */}
                                        <form onSubmit={interfaceWithAiAssistant} className="p-2 border-t border-white/5 bg-black/30 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Hỏi tui cách dọn pin, hạn chế nilon đi bro..."
                                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/40 placeholder:text-slate-600"
                                                value={currentChatText}
                                                onChange={(e) => setCurrentChatText(e.target.value)}
                                            />
                                            <button type="submit" className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono text-xs font-black uppercase tracking-wider">GỬI</button>
                                        </form>

                                    </div>
                                )}
                            </div>

                        </div>
                    );
                }

                const renderingTargetNode = ReactDOM.createRoot(document.getElementById('app-viewport'));
                renderingTargetNode.render(<EcoCommandCenter />);
            </script>
        </body>
        </html>
    `);
});

// =========================================================================
// 🚨 TẦNG 5: GLOBAL ERROR HANDLING MIDDLEWARE (CHỐNG CRASH SERVER)
// =========================================================================
app.use((err, req, res, next) => {
    console.error("❌ CRITICAL UNCAUGHT SERVER EXCEPTION DETECTED:", err.stack);
    res.status(500).json({ success: false, message: "Hệ thống trạm trung tâm gặp sự cố xử lý bất đồng bộ nội bộ!" });
});

// KHỞI ĐỘNG TRẠM ĐIỀU KHIỂN SỰ CỐ
app.listen(PORT, () => {
    console.log(`====================================================================`);
    console.log(` 👑 ARCHITECT NODE MONOLITH CORE DEPLOYED SUCCESSFULLY`);
    console.log(` 🔌 TRẠM CHỦ LOCALHOST PORT: http://localhost:${PORT}`);
    console.log(` 🔐 TÀI KHOẢN TRONG FILE HƯỚNG DẪN: user@test.com / User@123456`);
    console.log(` 🛡️ ENGINE CHỐNG CRASH HỆ THỐNG & ĐỒNG BỘ DỮ LIỆU ĐÃ KÍCH HOẠT`);
    console.log(`====================================================================`);
});