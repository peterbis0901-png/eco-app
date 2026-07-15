// DÒNG NÀY PHẢI NẰM Ở TRÊN CÙNG (Dòng 1 hoặc 2)
require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai'); // Vẫn dùng thư viện này vì nó hỗ trợ DeepSeek
const app = express();

// Khởi tạo client DeepSeek
// Lưu ý: baseURL là thứ giúp OpenAI SDK kết nối với server DeepSeek thay vì OpenAI
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY, 
  baseURL: 'https://api.deepseek.com',
});

// Các phần còn lại của code (middleware, routes...)
app.use(express.json());

// Ví dụ route xử lý AI
app.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;
    
    const completion = await client.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "deepseek-chat", // DeepSeek dùng model này
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("Lỗi rồi bro:", error);
    res.status(500).send("Có lỗi xảy ra");
  }
});

// ... phần còn lại của app
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'senior-architect-15-years-experience-secret-key';

// Cấu hình Multer lưu file ghi âm trên RAM
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cookieParser());

let users = []; 
let journals = []; 
let challenges = {}; 

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
    
    if (!user) {
        users.push({ username, password }); 
        challenges[username] = Array(21).fill(null).map((_, i) => ({ day: i + 1, completed: false, anxietyLevel: 0, note: '' }));
    }

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
    const adviceList = [
        "Tôi thấy bạn đang nhận thức rất rõ cảm xúc của mình. Việc viết ra được như thế này đã là bước đầu tiên để làm chủ nỗi sợ.",
        "Thần chú của bạn rất mạnh mẽ. Hãy mang theo nó trong tâm trí vào ngày mai nhé. Hít thở sâu nào.",
        "Tuyệt vời! Việc đặt mình vào góc nhìn của người khác chứng tỏ bạn có tư duy phản biện rất tốt.",
        "Hành động nhỏ ngày mai của bạn rất khả thi. Đừng cố gắng hoàn hảo, chỉ cần tốt hơn hôm qua 1% là đủ rồi."
    ];
    const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
    const newEntry = {
        id: Date.now(),
        username: req.user.username,
        ...req.body,
        createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        expertAdvice: randomAdvice
    };
    journals.unshift(newEntry);
    res.status(201).json(newEntry);
});

app.get('/api/challenge', authMiddleware, (req, res) => {
    if (!challenges[req.user.username]) {
        challenges[req.user.username] = Array(21).fill(null).map((_, i) => ({ day: i + 1, completed: false, anxietyLevel: 0, note: '' }));
    }
    res.json(challenges[req.user.username]);
});

app.post('/api/challenge/checkin', authMiddleware, (req, res) => {
    const { day, anxietyLevel, note } = req.body;
    let userColl = challenges[req.user.username];
    if (!userColl) {
        challenges[req.user.username] = Array(21).fill(null).map((_, i) => ({ day: i + 1, completed: false, anxietyLevel: 0, note: '' }));
        userColl = challenges[req.user.username];
    }
    const dayIndex = userColl.findIndex(d => d.day === parseInt(day));
    if (dayIndex !== -1) {
        userColl[dayIndex] = { day: parseInt(day), completed: true, anxietyLevel: parseInt(anxietyLevel), note };
    }
    res.json(userColl);
});

// ==================== TRỢ LÝ GIỌNG NÓI AI (VOICE ASSISTANT) ====================
app.post('/api/voice-assistant', authMiddleware, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Không nhận được âm thanh.' });

        // 1. OpenAI Whisper (STT) - Nghe người dùng nói
        const sttForm = new FormData();
        sttForm.append('file', req.file.buffer, { filename: 'voice.webm', contentType: req.file.mimetype });
        sttForm.append('model', 'whisper-1');

        const sttResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', sttForm, {
            headers: { ...sttForm.getHeaders(), 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        const userText = sttResponse.data.text;

        // 2. DeepSeek API (LLM) - Tạo câu trả lời an ủi tâm lý
        const llmResponse = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                { 
                    role: 'system', 
                    content: 'Bạn là chuyên gia tâm lý tư vấn về chứng lo âu xã hội (hiệu ứng ánh đèn sân khấu). Hãy trả lời thật ngắn gọn (dưới 40 chữ), ấm áp, như một người bạn thân đang động viên. Không dùng ký tự đặc biệt hay gạch đầu dòng.' 
                },
                { role: 'user', content: userText }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' }
        });
        const aiResponseText = llmResponse.data.choices[0].message.content;

        // 3. OpenAI TTS - Đọc câu trả lời
        const ttsResponse = await axios.post('https://api.openai.com/v1/audio/speech', {
            model: 'tts-1',
            voice: 'nova', // Giọng nữ ấm áp
            input: aiResponseText
        }, {
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer' 
        });

        res.set('Content-Type', 'audio/mpeg');
        res.send(ttsResponse.data);

    } catch (error) {
        console.error('Lỗi AI Pipeline:', error.response?.data || error.message);
        res.status(500).json({ error: 'Hệ thống AI đang quá tải.' });
    }
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
        body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; scroll-behavior: smooth; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .modal-enter { animation: modalFadeIn 0.3s ease-out forwards; }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        /* Animation cho nút ghi âm AI */
        @keyframes pulse-ring { 
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); } 
            70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); } 
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } 
        }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        // [CÁC COMPONENT CŨ ĐƯỢC GIỮ NGUYÊN: LoadingScreen, AuthPage, AdviceModal, DiarySection, SpotlightSimulator, Challenge21Days, HotlineSection]
        
        const LoadingScreen = ({ message = "Hệ thống đang đồng bộ dữ liệu..." }) => (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 bg-opacity-75 backdrop-blur-md">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="absolute text-xl">🧠</span>
                </div>
                <p className="mt-4 text-white font-medium text-lg animate-pulse">{message}</p>
            </div>
        );

        const AuthPage = ({ onAuthSuccess, setIsGlobalLoading }) => {
            const [isLogin, setIsLogin] = React.useState(true);
            const [username, setUsername] = React.useState('');
            const [password, setPassword] = React.useState('');
            const [error, setError] = React.useState('');

            const handleSubmit = async (e) => {
                e.preventDefault();
                setError(''); setIsGlobalLoading(true);
                try {
                    const res = await fetch(isLogin ? '/api/login' : '/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || 'Có lỗi xảy ra');
                    
                    if (isLogin) onAuthSuccess(data.username);
                    else { alert('Đăng ký thành công! Mời bạn đăng nhập.'); setIsLogin(true); }
                } catch (err) { setError(err.message); } 
                finally { setIsGlobalLoading(false); }
            };

            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-slate-100">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">MindNote 🧠</h1>
                            <p className="text-slate-500 text-sm mt-2 font-medium">Nhật ký vượt qua Hiệu ứng ánh đèn sân khấu</p>
                        </div>
                        
                        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
                            <button type="button" className={"flex-1 py-2.5 rounded-lg font-bold text-sm transition-all " + (isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")} onClick={() => setIsLogin(true)}>Đăng Nhập</button>
                            <button type="button" className={"flex-1 py-2.5 rounded-lg font-bold text-sm transition-all " + (!isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")} onClick={() => setIsLogin(false)}>Đăng Ký</button>
                        </div>

                        {error && <div className="p-3 bg-rose-50 text-rose-600 font-medium text-sm rounded-xl mb-4 text-center">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tên tài khoản</label>
                                <input type="text" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nhập tên của bạn..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mật khẩu</label>
                                <input type="password" required className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                            </div>
                            <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                                {isLogin ? 'Vào Hệ Thống' : 'Tạo Sổ Tay Mới'}
                            </button>
                        </form>
                    </div>
                </div>
            );
        };

        const AdviceModal = ({ advice, onClose }) => {
            if (!advice) return null;
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl modal-enter relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌿</span>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800">Thông Điệp Chữa Lành</h3>
                        </div>
                        <p className="text-slate-600 text-center text-lg leading-relaxed mb-8 italic">"{advice}"</p>
                        <button onClick={onClose} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">Mình Đã Hiểu ❤️</button>
                    </div>
                </div>
            );
        };

        const DiarySection = ({ setIsGlobalLoading }) => {
            const [entries, setEntries] = React.useState([]);
            const [showForm, setShowForm] = React.useState(false);
            const [newAdvice, setNewAdvice] = React.useState(null);
            const [formData, setFormData] = React.useState({
                situation: '', judgment: '', spotlightScale: 50, evidence: '', roleReversal: '', friendPerspective: '',
                thoughts: { busy: false, unnotice: false, anxiousToo: false, other: '' }, mantra: '', nextAction: ''
            });

            const fetchDiaries = async () => {
                const res = await fetch('/api/journals');
                if (res.ok) setEntries(await res.json());
            };

            React.useEffect(() => { fetchDiaries(); }, []);

            const handleSubmit = async (e) => {
                e.preventDefault();
                setIsGlobalLoading(true);
                const res = await fetch('/api/journals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    const data = await res.json();
                    setNewAdvice(data.expertAdvice);
                }
                setFormData({ situation: '', judgment: '', spotlightScale: 50, evidence: '', roleReversal: '', friendPerspective: '', thoughts: { busy: false, unnotice: false, anxiousToo: false, other: '' }, mantra: '', nextAction: '' });
                setShowForm(false);
                await fetchDiaries();
                setIsGlobalLoading(false);
            };

            return (
                <div className="space-y-8 relative">
                    <AdviceModal advice={newAdvice} onClose={() => setNewAdvice(null)} />
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800">Nhật Ký Phản Tư</h2>
                            <p className="text-slate-500 text-sm mt-1">Ghi chép và gỡ rối những suy nghĩ lo âu của bạn.</p>
                        </div>
                        <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-all">
                            {showForm ? 'Đóng Sổ Tay' : '+ Viết Trang Mới'}
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                            
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-sm">Phần 1</span> Nhìn nhận lại vấn đề</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Sự kiện / Tình huống khiến bạn lo lắng là gì?</label>
                                    <textarea required rows="2" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} placeholder="Ví dụ: Lỡ phát biểu vấp..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mọi người đang phán xét bạn thế nào?</label>
                                    <textarea required rows="2" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.judgment} onChange={e => setFormData({...formData, judgment: e.target.value})} placeholder="Tôi sợ họ nghĩ tôi kém..."></textarea>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bạn cảm thấy mức độ chú ý của họ là bao nhiêu %? <span className="text-rose-600 font-black text-lg">{formData.spotlightScale}%</span></label>
                                    <input type="range" min="0" max="100" className="w-full accent-rose-500" value={formData.spotlightScale} onChange={e => setFormData({...formData, spotlightScale: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-emerald-600 flex items-center gap-2"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-sm">Phần 2</span> Kiểm chứng thực tế</h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Có bằng chứng nào cho thấy mọi người THỰC SỰ để ý đến bạn không?</label>
                                    <input type="text" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} placeholder="Hình như không ai cười..." />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-sm">Phần 3</span> Góc nhìn mới</h3>
                                <div className="mt-4 bg-amber-50 p-5 rounded-xl border border-amber-200">
                                    <label className="block text-sm font-bold text-amber-800 mb-2">✨ Viết ra một câu "thần chú" để nhắc nhở bản thân:</label>
                                    <input type="text" required className="w-full p-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none font-medium text-amber-900" value={formData.mantra} onChange={e => setFormData({...formData, mantra: e.target.value})} placeholder="Ví dụ: Không ai soi xét mình kỹ như mình nghĩ!" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-sky-600 flex items-center gap-2"><span className="bg-sky-100 text-sky-700 px-2 py-1 rounded-md text-sm">Phần 4</span> Hành động nhỏ cho ngày mai</h3>
                                <div>
                                    <textarea required rows="2" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" value={formData.nextAction} onChange={e => setFormData({...formData, nextAction: e.target.value})} placeholder="Ví dụ: Tự tin mỉm cười..."></textarea>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold text-lg rounded-xl hover:bg-slate-800 shadow-xl transition-all">🔒 Ghi Lại & Nhận Lời Khuyên</button>
                        </form>
                    )}

                    <div className="space-y-5">
                        {entries.length === 0 ? 
                            <div className="bg-white p-10 text-center rounded-2xl border border-slate-100 shadow-sm">
                                <span className="text-4xl mb-3 block">📖</span>
                                <p className="text-slate-500 font-medium">Cuốn sổ vẫn đang trống. Hãy viết trang đầu tiên nhé!</p>
                            </div> 
                            : 
                            entries.map(item => (
                                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.createdAt}</span>
                                            <h4 className="font-extrabold text-slate-800 text-lg mt-1">{item.situation}</h4>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">Độ lo âu</span>
                                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-lg shadow-inner">{item.spotlightScale}%</div>
                                        </div>
                                    </div>
                                    
                                    {item.expertAdvice && (
                                        <div className="mb-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3 items-start">
                                            <span className="text-xl">🌿</span>
                                            <div>
                                                <span className="text-xs font-bold text-emerald-600 block mb-1">CHUYÊN GIA KHUYÊN</span>
                                                <p className="text-sm text-emerald-800 italic">{item.expertAdvice}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <span className="text-xs font-bold text-slate-400 block mb-1">MÌNH TỪNG NGHĨ</span>
                                            <p className="text-sm text-slate-700 italic">"{item.judgment}"</p>
                                        </div>
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                            <span className="text-xs font-bold text-amber-600 block mb-1">THẦN CHÚ GIẢI TỎA</span>
                                            <p className="text-sm font-bold text-amber-900">✨ "{item.mantra}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            );
        };

        const SpotlightSimulator = () => {
            const [inputScale, setInputScale] = React.useState(80);
            const [simulated, setSimulated] = React.useState(false);

            return (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold text-slate-800">Spotlight Simulator 🎭</h2>
                        <p className="text-slate-500 text-sm mt-2">Trực quan hóa sự chênh lệch giữa "tưởng tượng" và "thực tế".</p>
                    </div>

                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-100">
                        <label className="block font-bold text-slate-700 mb-4 text-center">Bạn nghĩ bao nhiêu phần trăm đám đông đang soi xét bạn?</label>
                        <input type="range" min="10" max="100" className="w-full accent-teal-600 h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer" value={inputScale} onChange={e => { setInputScale(e.target.value); setSimulated(false); }} />
                        <div className="text-center text-teal-700 font-black text-3xl mt-4">{inputScale}%</div>
                    </div>

                    <div className="text-center">
                        <button onClick={() => setSimulated(true)} className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105">Bật Kính Lúp Sự Thật 🔍</button>
                    </div>

                    {simulated && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center shadow-inner">
                                <h4 className="font-bold text-rose-400 uppercase text-xs mb-2 tracking-widest">Trong đầu bạn</h4>
                                <div className="text-5xl font-black text-rose-600 mb-3">{inputScale}%</div>
                                <p className="text-sm text-rose-800 font-medium">Cảm giác như cả thế giới đang chĩa máy quay vào bạn.</p>
                            </div>
                            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center shadow-inner">
                                <h4 className="font-bold text-emerald-500 uppercase text-xs mb-2 tracking-widest">Thực tế phũ phàng</h4>
                                <div className="text-5xl font-black text-emerald-600 mb-3">~ 5%</div>
                                <p className="text-sm text-emerald-800 font-medium">Mọi người đều bận làm "nhân vật chính" trong cuộc đời họ mất rồi!</p>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

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
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800">Thử Thách 21 Ngày Vượt Ngại 🏆</h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Mỗi ngày một bước nhỏ ra khỏi vùng an toàn.</p>
                    </div>

                    {daysData.length === 0 ? (
                        <div className="text-center p-10 bg-slate-50 rounded-xl">Đang khôi phục dữ liệu...</div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                            {daysData.map(d => (
                                <button key={d.day} onClick={() => setSelectedDay(d.day)} className={"h-20 flex flex-col items-center justify-center rounded-2xl border-2 font-bold transition-all " + (d.completed ? "bg-indigo-600 border-indigo-600 text-white shadow-md transform hover:scale-105" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600")}>
                                    <span className="text-sm">Ngày {d.day}</span>
                                    {d.completed ? 
                                        <span className="text-[10px] bg-indigo-800/30 px-2 py-0.5 rounded-full mt-1">Lv.{d.anxietyLevel}</span> 
                                        : <span className="text-xl mt-0.5 opacity-30">🔒</span>
                                    }
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedDay && (
                        <form onSubmit={handleCheckIn} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                            <h3 className="font-extrabold text-indigo-900 text-lg border-b border-slate-200 pb-2">🎯 Hoàn thành Ngày {selectedDay}</h3>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Độ run rẩy hôm nay (1-10): <span className="text-indigo-600 text-lg">{anxiety}</span></label>
                                <input type="range" min="1" max="10" className="w-full accent-indigo-600" value={anxiety} onChange={e => setAnxiety(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">Bạn đã làm gì để vượt qua nó?</label>
                                <input type="text" required placeholder="Ví dụ: Bắt chuyện với đồng nghiệp..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={note} onChange={e => setNote(e.target.value)} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setSelectedDay(null)} className="px-5 py-2.5 text-sm text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition">Hủy</button>
                                <button type="submit" className="px-6 py-2.5 text-sm bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition transform hover:-translate-y-0.5">Xác Nhận Check-in</button>
                            </div>
                        </form>
                    )}
                </div>
            );
        };

        const HotlineSection = () => (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Liên Hệ Chuyên Gia 🩺</h2>
                    <p className="text-slate-500 text-sm mt-2">Nếu cảm thấy quá áp lực, đừng ngần ngại tìm kiếm sự giúp đỡ từ những người có chuyên môn.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 text-xl shadow-sm mb-4">🚨</div>
                        <h3 className="font-bold text-slate-800 mb-1">Đường Dây Nóng Quốc Gia</h3>
                        <p className="text-sm text-slate-600 mb-4">Hỗ trợ khẩn cấp 24/7 về sức khỏe tinh thần và tâm lý.</p>
                        <a href="tel:111" className="inline-block px-5 py-2.5 bg-rose-500 text-white font-bold rounded-lg shadow-md hover:bg-rose-600 transition">📞 Gọi 111 (Miễn phí)</a>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 text-xl shadow-sm mb-4">💬</div>
                        <h3 className="font-bold text-slate-800 mb-1">MindCare Vietnam</h3>
                        <p className="text-sm text-slate-600 mb-4">Phòng tham vấn tâm lý chuyên môn.</p>
                        <a href="tel:19001234" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition">📞 Gọi 1900 1234</a>
                    </div>
                </div>
            </div>
        );

        // ================= COMPONENT MỚI: VOICE ASSISTANT WIDGET =================
        const VoiceAssistantWidget = () => {
            const [isRecording, setIsRecording] = React.useState(false);
            const [isLoading, setIsLoading] = React.useState(false);
            const mediaRecorderRef = React.useRef(null);
            const audioChunksRef = React.useRef([]);
            const audioPlayerRef = React.useRef(null); // Để quản lý file đang phát

            const startRecording = async (e) => {
                e.preventDefault();
                if (isLoading) return;
                
                // Dừng audio cũ nếu đang phát
                if (audioPlayerRef.current) {
                    audioPlayerRef.current.pause();
                    audioPlayerRef.current = null;
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const mediaRecorder = new MediaRecorder(stream);
                    mediaRecorderRef.current = mediaRecorder;
                    audioChunksRef.current = [];

                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data.size > 0) audioChunksRef.current.push(e.data);
                    };

                    mediaRecorder.onstop = async () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        await sendToAI(audioBlob);
                    };

                    mediaRecorder.start();
                    setIsRecording(true);
                } catch (err) {
                    alert('Vui lòng cấp quyền Micro trên trình duyệt để gọi AI!');
                }
            };

            const stopRecording = (e) => {
                e.preventDefault();
                if (isRecording && mediaRecorderRef.current) {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Tắt mic thu
                    setIsRecording(false);
                }
            };

            const sendToAI = async (audioBlob) => {
                setIsLoading(true);
                const formData = new FormData();
                formData.append('audio', audioBlob, 'voice.webm');

                try {
                    const res = await fetch('/api/voice-assistant', {
                        method: 'POST',
                        body: formData
                    });

                    if (!res.ok) throw new Error('Máy chủ AI đang quá tải.');

                    const audioBlobResponse = await res.blob();
                    const audioUrl = URL.createObjectURL(audioBlobResponse);
                    const audio = new Audio(audioUrl);
                    audioPlayerRef.current = audio;
                    
                    audio.play();
                } catch (error) {
                    alert('Lỗi AI: ' + error.message);
                } finally {
                    setIsLoading(false);
                }
            };

            return (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-center">
                    <div className={"mb-3 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all " + (isRecording ? "bg-rose-500" : isLoading ? "bg-indigo-500" : "bg-slate-800 opacity-0")}>
                        {isRecording ? "Đang nghe... (Nhả ra để gửi)" : isLoading ? "AI đang suy nghĩ..." : ""}
                    </div>
                    
                    <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={isLoading}
                        className={"w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all select-none outline-none " + 
                            (isRecording ? "bg-rose-500 text-white scale-95 shadow-[0_0_0_10px_rgba(244,63,94,0.3)]" : 
                             isLoading ? "bg-slate-300 text-slate-500 cursor-not-allowed" : 
                             "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-110 hover:shadow-indigo-500/50")}
                    >
                        {isLoading ? "⏳" : "🎙️"}
                    </button>
                </div>
            );
        };

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

            if (isGlobalLoading) return <LoadingScreen message="Đang tải hệ thống tâm lý..." />;
            if (!user) return <AuthPage onAuthSuccess={setUser} setIsGlobalLoading={setIsGlobalLoading} />;

            return (
                <div className="min-h-screen flex flex-col md:flex-row bg-[#f4f7fb] relative">
                    <div className="w-full md:w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                        <div className="space-y-8">
                            <div className="text-center md:text-left mt-4">
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">MindNote</h2>
                                <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-2">Workspace</p>
                            </div>
                            <div className="space-y-2">
                                <button onClick={() => setActiveTab('diary')} className={"w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all " + (activeTab === 'diary' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                                    <span className="text-lg">📖</span> Sổ Tay Phản Tư
                                </button>
                                <button onClick={() => setActiveTab('simulator')} className={"w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all " + (activeTab === 'simulator' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                                    <span className="text-lg">🎭</span> Giả Lập Tâm Lý
                                </button>
                                <button onClick={() => setActiveTab('challenge')} className={"w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all " + (activeTab === 'challenge' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                                    <span className="text-lg">🏆</span> Thử Thách 21 Ngày
                                </button>
                                <button onClick={() => setActiveTab('hotline')} className={"w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all " + (activeTab === 'hotline' ? "bg-rose-50 text-rose-700 shadow-sm border border-rose-100" : "text-slate-600 hover:bg-slate-50")}>
                                    <span className="text-lg">📞</span> Hỗ Trợ Chuyên Gia
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {user.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs text-slate-400 font-medium">Người dùng</p>
                                    <p className="text-sm font-bold text-slate-700">{user}</p>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-full transition" title="Đăng xuất">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 md:p-10 max-w-5xl mx-auto w-full h-screen overflow-y-auto custom-scrollbar">
                        <div className="pb-10">
                            {activeTab === 'diary' && <DiarySection setIsGlobalLoading={setIsGlobalLoading} />}
                            {activeTab === 'simulator' && <SpotlightSimulator />}
                            {activeTab === 'challenge' && <Challenge21Days setIsGlobalLoading={setIsGlobalLoading} />}
                            {activeTab === 'hotline' && <HotlineSection />}
                        </div>
                    </div>

                    {/* HIỂN THỊ WIDGET AI Ở GÓC MÀN HÌNH */}
                    <VoiceAssistantWidget />
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
    console.log("Server dang chay tai cong: " + PORT);
});
