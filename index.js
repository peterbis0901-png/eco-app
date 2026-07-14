const express = require('express');
const cookieParser = require('cookieParser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'senior-architect-15-years-experience-secret-key';

// Middleware cấu hình hệ thống
app.use(express.json());
app.use(cookieParser());

// Bộ nhớ RAM tạm thời thay thế Database
const users = []; 
const journals = []; 
const challenges = {}; 

// Middleware xác thực người dùng bằng HttpOnly Cookie
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Chưa đăng nhập!' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token không hợp lệ!' });
    }
};

// ==================== BACKEND API ROUTES ====================

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Vui lòng điền đủ thông tin!' });
    if (users.find(u => u.username === username)) return res.status(400).json({ message: 'Tài khoản đã tồn tại!' });
    
    users.push({ username, password });
    challenges[username] = Array(21).fill(null).map((_, i) => ({ day: i + 1, completed: false, anxietyLevel: 0, note: '' }));
    res.status(201).json({ message: 'Đăng ký thành công!' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu!' });

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 86400000 }); 
    res.json({ username });
});

app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Đã đăng xuất!' });
});

app.get('/api/user', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Chưa đăng nhập' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ username: decoded.username });
    } catch {
        res.status(401).json({ message: 'Token lỗi' });
    }
});

app.get('/api/journals', authMiddleware, (req, res) => {
    const userJournals = journals.filter(j => j.username === req.user.username);
    res.json(userJournals);
});

app.post('/api/journals', authMiddleware, (req, res) => {
    const { title, content, spotlightScale } = req.body;
    const newEntry = {
        id: Date.now(),
        username: req.user.username,
        title,
        content,
        spotlightScale: parseInt(spotlightScale) || 50,
        createdAt: new Date().toLocaleDateString('vi-VN')
    };
    journals.unshift(newEntry);
    res.status(201).json(newEntry);
});

app.get('/api/challenge', authMiddleware, (req, res) => {
    res.json(challenges[req.user.username] || []);
});

app.post('/api/challenge/checkin', authMiddleware, (req, res) => {
    const { day, anxietyLevel, note } = req.body;
    const userColl = challenges[req.user.username];
    if (!userColl) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
    
    const dayIndex = userColl.findIndex(d => d.day === parseInt(day));
    if (dayIndex !== -1) {
        userColl[dayIndex] = { day: parseInt(day), completed: true, anxietyLevel: parseInt(anxietyLevel), note };
    }
    res.json(userColl);
});

// ==================== FRONTEND UI INTEGRATION ====================
app.get('*', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MindNote - Sổ Tay Điện Tử Phản Tư</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        // 1. LOADING SCREEN GLOBAL
        const LoadingScreen = ({ message = "Hệ thống đang đồng bộ dữ liệu..." }) => (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 bg-opacity-75 backdrop-blur-md">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="absolute text-xl">🧠</span>
                </div>
                <p className="mt-4 text-white font-medium text-lg animate-pulse">{message}</p>
            </div>
        );

        // 2. FORM ĐĂNG NHẬP / ĐĂNG KÝ
        const AuthPage = ({ onAuthSuccess, setIsGlobalLoading }) => {
            const [isLogin, setIsLogin] = React.useState(true);
            const [username, setUsername] = React.useState('');
            const [password, setPassword] = React.useState('');
            const [error, setError] = React.useState('');

            const handleSubmit = async (e) => {
                e.preventDefault();
                setError('');
                setIsGlobalLoading(true);

                const endpoint = isLogin ? '/api/login' : '/api/register';
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    
                    if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
                    
                    if (isLogin) {
                        onAuthSuccess(data.username);
                    } else {
                        alert('Đăng ký thành công! Mời bạn đăng nhập.');
                        setIsLogin(true);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsGlobalLoading(false);
                }
            };

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-extrabold text-indigo-600">MindNote 🧠</h1>
                            <p className="text-slate-500 text-sm mt-1">Sổ tay vượt qua Hiệu ứng ánh đèn sân khấu</p>
                        </div>
                        
                        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                            <button type="button" className={"flex-1 py-2 rounded-md font-medium text-sm transition-all " + (isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")} onClick={() => setIsLogin(true)}>Đăng Nhập</button>
                            <button type="button" className={"flex-1 py-2 rounded-md font-medium text-sm transition-all " + (!isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")} onClick={() => setIsLogin(false)}>Đăng Ký</button>
                        </div>

                        {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg mb-4">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tên tài khoản</label>
                                <input type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={username} onChange={e => setUsername(e.target.value)} placeholder="Tên của bạn..." />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Mật khẩu</label>
                                <input type="password" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all">
                                {isLogin ? 'Vào Hệ Thống' : 'Tạo Tài Khoản'}
                            </button>
                        </form>
                    </div>
                </div>
            );
        };

        // 3. CHỨC NĂNG SỔ TAY / NHẬT KÝ
        const DiarySection = ({ setIsGlobalLoading }) => {
            const [entries, setEntries] = React.useState([]);
            const [title, setTitle] = React.useState('');
            const [content, setContent] = React.useState('');
            const [scale, setScale] = React.useState(70);

            const fetchDiaries = async () => {
                const res = await fetch('/api/journals');
                if (res.ok) setEntries(await res.json());
            };

            React.useEffect(() => { fetchDiaries(); }, []);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setIsGlobalLoading(true);
                await fetch('/api/journals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content, spotlightScale: scale })
                });
                setTitle(''); setContent(''); setScale(70);
                await fetchDiaries();
                setIsGlobalLoading(false);
            };

            return (
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Viết Nhật Ký Phản Tư</h2>
                        <input type="text" required placeholder="Sự kiện tiêu điểm khiến bạn lo lắng hôm nay?" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={title} onChange={e => setTitle(e.target.value)} />
                        <textarea required placeholder="Mô tả chi tiết cảm xúc hoặc hành động lúc đó..." rows="3" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={content} onChange={e => setContent(e.target.value)}></textarea>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ bạn nghĩ mọi người phán xét bạn: <span className="text-indigo-600 font-bold">{scale}%</span></label>
                            <input type="range" min="0" max="100" className="w-full accent-indigo-600" value={scale} onChange={e => setScale(e.target.value)} />
                        </div>
                        <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm">Lưu Vào Nhật Ký</button>
                    </form>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-700">Lịch sử ghi chép</h3>
                        {entries.length === 0 ? <p className="text-slate-400 italic">Chưa có nhật ký nào.</p> : 
                            entries.map(item => (
                                <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                                        <span className="text-xs text-slate-400 font-medium">{item.createdAt}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm whitespace-pre-line mb-3">{item.content}</p>
                                    <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                        <span>Bạn ước tính: {item.spotlightScale}% | Thực tế xã hội: ~5%</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            );
        };

        // 4. BỘ MÔ PHỎNG SPOTLIGHT SIMULATOR
        const SpotlightSimulator = () => {
            const [inputScale, setInputScale] = React.useState(80);
            const [simulated, setSimulated] = React.useState(false);

            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Spotlight Simulator</h2>
                        <p className="text-slate-500 text-sm mt-1">Trực quan hóa sự chênh lệch nhận thức.</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                        <label className="block font-medium text-slate-700 mb-2 text-sm">Bạn nghĩ bao nhiêu phần trăm đám đông chú ý đến lỗi sai của bạn?</label>
                        <input type="range" min="10" max="100" className="w-full accent-teal-600" value={inputScale} onChange={e => { setInputScale(e.target.value); setSimulated(false); }} />
                        <div className="text-right text-teal-600 font-extrabold text-xl mt-1">{inputScale}%</div>
                    </div>

                    <div className="text-center">
                        <button onClick={() => setSimulated(true)} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm transition">Chạy Mô Phỏng Thực Tế</button>
                    </div>

                    {simulated && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl">
                                <h4 className="font-bold uppercase text-xs mb-1">Bạn cảm thấy</h4>
                                <div className="text-3xl font-black mb-2">{inputScale}%</div>
                                <p className="text-xs">Cảm giác như mọi người đang nhìn chằm chằm và đánh giá bạn.</p>
                            </div>
                            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl">
                                <h4 className="font-bold uppercase text-xs mb-1">Thực tế cuộc sống</h4>
                                <div className="text-3xl font-black mb-2">~ 5%</div>
                                <p className="text-xs">Mọi người chỉ tập trung vào chính họ và hầu như không bận tâm đến bạn.</p>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        // 5. THỬ THÁCH 21 NGÀY
        const Challenge21Days = ({ setIsGlobalLoading }) => {
            const [daysData, setDaysData] = React.useState([]);
            const [selectedDay, setSelectedDay] = React.useState(null);
            const [anxiety, setAnxiety] = React.useState(5);
            const [note, setNote] = React.useState('');

            const fetchChallenge = async () => {
                const res = await fetch('/api/challenge');
                if (res.ok) setDaysData(await res.json());
            };

            React.useEffect(() => { fetchChallenge(); }, []);

            const handleCheckIn = async (e) => {
                e.preventDefault();
                setIsGlobalLoading(true);
                const res = await fetch('/api/challenge/checkin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ day: selectedDay, anxietyLevel: anxiety, note })
                });
                if (res.ok) {
                    setDaysData(await res.json());
                    setSelectedDay(null);
                    setNote('');
                }
                setIsGlobalLoading(false);
            };

            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Thử Thách 21 Ngày Vượt Ngại</h2>
                        <p className="text-slate-500 text-sm mt-1">Từng bước tích lũy sự tự tin mỗi ngày.</p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                        {daysData.map(d => (
                            <button key={d.day} onClick={() => setSelectedDay(d.day)} className={"h-16 flex flex-col items-center justify-center rounded-xl border font-bold text-sm transition-all " + (d.completed ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300")}>
                                <span>Ngày {d.day}</span>
                                {d.completed && <span className="text-[10px] bg-indigo-500 px-1 rounded mt-0.5">Lv.{d.anxietyLevel}</span>}
                            </button>
                        ))}
                    </div>

                    {selectedDay && (
                        <form onSubmit={handleCheckIn} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <h3 className="font-bold text-slate-800 text-sm">Check-in Ngày {selectedDay}</h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Mức độ lo lắng hôm nay (1-Thấp, 10-Cao): <span className="text-indigo-600 font-bold">{anxiety}</span></label>
                                <input type="range" min="1" max="10" className="w-full accent-indigo-600" value={anxiety} onChange={e => setAnxiety(e.target.value)} />
                            </div>
                            <input type="text" required placeholder="Hôm nay bạn đã làm được điều gì tự tin?" className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none" value={note} onChange={e => setNote(e.target.value)} />
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setSelectedDay(null)} className="px-3 py-1.5 text-xs text-slate-500 font-medium">Hủy</button>
                                <button type="submit" className="px-4 py-1.5 text-xs bg-indigo-600 text-white font-medium rounded-lg">Xác Nhận</button>
                            </div>
                        </form>
                    )}
                </div>
            );
        };

        // ĐIỀU HƯỚNG MAIN APP
        const App = () => {
            const [user, setUser] = React.useState(null);
            const [activeTab, setActiveTab] = React.useState('diary');
            const [isGlobalLoading, setIsGlobalLoading] = React.useState(true);

            React.useEffect(() => {
                fetch('/api/user')
                    .then(res => res.ok ? res.json() : null)
                    .then(data => { if(data) setUser(data.username); })
                    .finally(() => setIsGlobalLoading(false));
            }, []);

            const handleLogout = async () => {
                setIsGlobalLoading(true);
                await fetch('/api/logout', { method: 'POST' });
                setUser(null);
                setIsGlobalLoading(false);
            };

            if (isGlobalLoading) return <LoadingScreen message="Đang kết nối hệ thống..." />;
            if (!user) return <AuthPage onAuthSuccess={setUser} setIsGlobalLoading={setIsGlobalLoading} />;

            return (
                <div className="min-h-screen flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-slate-900 text-slate-200 p-6 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-indigo-400">MindNote 🧠</h2>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Kiến trúc quản lý nhận thức</p>
                            </div>
                            <div className="space-y-1">
                                <button onClick={() => setActiveTab('diary')} className={"w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition " + (activeTab === 'diary' ? "bg-indigo-600 text-white" : "hover:bg-slate-800")}>Sổ Tay Nhật Ký</button>
                                <button onClick={() => setActiveTab('simulator')} className={"w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition " + (activeTab === 'simulator' ? "bg-indigo-600 text-white" : "hover:bg-slate-800")}>Bộ Mô Phỏng Tâm Lý</button>
                                <button onClick={() => setActiveTab('challenge')} className={"w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition " + (activeTab === 'challenge' ? "bg-indigo-600 text-white" : "hover:bg-slate-800")}>Thử Thách 21 Ngày</button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                            <span>User: <b>{user}</b></span>
                            <button onClick={handleLogout} className="text-rose-400 hover:underline">Đăng xuất</button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
                        {activeTab === 'diary' && <DiarySection setIsGlobalLoading={setIsGlobalLoading} />}
                        {activeTab === 'simulator' && <SpotlightSimulator />}
                        {activeTab === 'challenge' && <Challenge21Days setIsGlobalLoading={setIsGlobalLoading} />}
                    </div>
                </div>
            );
        };

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log("Server dang chay muot ma tai cong: " + PORT);
});
