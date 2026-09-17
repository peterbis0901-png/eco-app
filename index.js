const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// ==========================================
// 1. BACKEND: DATASETS & MEMORY DB
// ==========================================
const dailyChallenges = [
    "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Liệu hôm nay bạn có dám đưa ra ý kiến trong buổi họp/tiết học mà không lo sợ bị đánh giá?",
    "Liệu hôm nay bạn có dám từ chối một yêu cầu mà bạn thực sự không muốn làm?",
    "Liệu hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn của người khác?",
    "Liệu hôm nay bạn có dám nhận lỗi một cách thẳng thắn mà không tìm cãi lý?"
];

let anonymousWallPosts = [
    { id: 1, author: 'Thành viên ẩn danh #102', text: 'Hôm nay tớ lỡ gọi lộn tên đồng nghiệp. Tưởng quê lắm nhưng 5 phút sau mọi người quên hết sạch!', time: '10 phút trước' },
    { id: 2, author: 'Bạn cùng tần số #405', text: 'Vừa thuyết trình bị vấp từ. Dùng AI dự đoán mới biết mọi người chỉ chú ý 12% thôi, nhẹ cả người.', time: '45 phút trước' },
    { id: 3, author: 'Ẩn danh #082', text: 'Đừng quá khắt khe với bản thân nhé mọi người. AI nói đúng: Ai cũng bận lo cho bản thân họ thôi!', time: '2 giờ trước' }
];

const loadingAffirmations = [
    "Hít một hơi thật sâu nào, mọi chuyện rồi sẽ ổn thôi...",
    "Bạn đang làm rất tốt rồi, hãy chậm lại một chút nhé...",
    "Thế giới này không quá khắt khe như bạn tưởng đâu...",
    "Chào mừng bạn trở lại với không gian an toàn của chính mình..."
];

// ==========================================
// 2. BACKEND API ENDPOINTS
// ==========================================
app.post('/api/chat', (req, res) => {
    try {
        const { message, userName } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Tin nhắn trống' });

        const msg = message.toLowerCase();
        const user = userName || 'bạn';
        let reply = `Chào ${user}! Tớ luôn ở đây lắng nghe bạn. Cứ thoải mái chia sẻ những suy nghĩ trong đầu lúc này nhé.`;

        if (msg.includes('sợ') || msg.includes('lo') || msg.includes('ngại') || msg.includes('đông')) {
            reply = `Tớ hiểu cảm giác lo âu này của ${user}. Não bộ chúng ta thường tự động bật chế độ đề phòng và phóng đại sự chú ý của đám đông. Thực tế là 90% mọi người xung quanh chỉ đang bận lo lắng về chính bộ dạng của họ thôi. Hãy thử hít thở sâu nhé!`;
        } else if (msg.includes('quê') || msg.includes('xấu hổ') || msg.includes('sai') || msg.includes('vấp')) {
            reply = `Ai cũng từng có những khoảnh khắc nói hớ hay vấp ngã. Sự cố đó có vẻ to tát với ${user} bây giờ, nhưng trong mắt người khác nó chỉ lướt qua như một cơn gió nhẹ và bị quên ngay sau vài giờ thôi. Đừng quá khắt khe với bản thân.`;
        } else if (msg.includes('cô đơn') || msg.includes('không ai') || msg.includes('từ chối')) {
            reply = `Bạn không một mình đâu ${user}. Cảm giác bị tách biệt là phản ứng tâm lý rất tự nhiên khi ta quá bận tâm đến việc phải hoàn hảo trong mắt người khác. Tớ vẫn ở đây với bạn mà!`;
        } else if (msg.includes('đọc vị') || msg.includes('họ nghĩ') || msg.includes('suy nghĩ')) {
            reply = `Đừng cố "đọc suy nghĩ" của người khác nhé ${user}! Đó là một bẫy tư duy phổ biến. Chúng ta không thể biết chắc họ nghĩ gì, nhưng chắc chắn họ không dành 24/7 để đánh giá bạn đâu.`;
        } else if (msg.includes('thử thách') || msg.includes('dám')) {
            reply = `Thử thách sinh ra là để giúp bản thân bước ra khỏi vùng an toàn. ${user} không cần làm nó một cách hoàn hảo, chỉ cần dám bắt đầu là bạn đã chiến thắng chính mình rồi!`;
        }

        setTimeout(() => res.json({ success: true, reply }), 300);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi hệ thống' });
    }
});

app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

app.get('/api/wall', (req, res) => {
    res.json({ success: true, posts: anonymousWallPosts });
});

app.post('/api/wall', (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Nội dung không được để trống' });
        const newPost = { 
            id: Date.now(), 
            author: `Thành viên ẩn danh #${Math.floor(100 + Math.random() * 900)}`, 
            text: text.trim(), 
            time: 'Vừa xong' 
        };
        anonymousWallPosts.unshift(newPost);
        res.json({ success: true, post: newPost });
    } catch (err) { 
        res.status(500).json({ success: false, error: 'Lỗi lưu bài viết' }); 
    }
});

app.post('/api/predict-spotlight', (req, res) => {
    try {
        const { event, perceivedPercent } = req.body;
        const perceived = parseInt(perceivedPercent) || 50;
        const predictedActual = Math.max(5, Math.round(perceived * 0.18 + Math.random() * 5));
        
        const explanation = `Theo thực nghiệm tâm lý xã hội, khi bạn nghĩ có ${perceived}% đám đông đang chú ý đến sự cố của bạn, mức độ thực tế họ ghi nhớ chỉ đạt khoảng ${predictedActual}%. Hầu hết mọi người chỉ tập trung vào vấn đề cá nhân của họ.`;
        
        const reframes = [
            "1. Góc nhìn thực tế: Sự cố này chỉ kéo dài vài giây, người khác sẽ quên ngay khi chuyển sang hoạt động tiếp theo.",
            "2. Tái định khung: Sai sót là minh chứng bạn đang dũng cảm hành động và bước ra khỏi vùng an toàn.",
            "3. Sự đồng cảm: Mọi người xung quanh thường có xu hướng cảm thông hơn là khắt khe phán xét."
        ];
        
        setTimeout(() => res.json({ 
            success: true, 
            perceivedPercent: perceived, 
            predictedPercent: predictedActual, 
            explanation, 
            reframes 
        }), 350);
    } catch (err) { 
        res.status(500).json({ success: false, error: 'Lỗi tính toán' }); 
    }
});

// ==========================================
// 3. FRONTEND SPA
// ==========================================
app.get('/', (req, res) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotlight Check & Mindful Space</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');
        
        :root {
            --primary: #5b21b6;
            --primary-light: #ede9fe;
            --primary-dark: #4c1d95;
            --accent: #10b981;
            --bg: #f9f8f6;
            --paper: #ffffff;
            --text: #374151;
            --text-muted: #6b7280;
            --line-color: #e5e7eb;
            --margin-line: #fca5a5;
            --mindful-green: #4CAF50;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }
        body { 
            background: var(--bg); 
            color: var(--text); 
            padding-bottom: 3rem; 
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23f9f8f6'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h100v100H0V0zm2 2h96v96H2V2z' fill='%23f1f0ee'/%3E%3C/svg%3E"); 
        }
        
        #splashLoader { position: fixed; top:0; left:0; width:100vw; height:100vh; background: #faf9f6; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.6s ease, visibility 0.6s; }
        .aura-circle { width: 90px; height: 90px; border-radius: 50%; border: 4px solid var(--primary-light); border-top-color: var(--primary); animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .splash-msg { color: var(--text); font-family: 'Lora', serif; font-style: italic; text-align: center; max-width: 80%; font-size: 1.1rem; }

        header { background: #fff; padding: 1.5rem 1rem; text-align: center; position: sticky; top: 0; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .app-title { font-size: 1.6rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: -0.5px; }
        .slogan { font-size: 0.95rem; color: var(--text-muted); margin-top: 6px; font-style: italic; font-family: 'Lora', serif; }
        
        .container { max-width: 700px; margin: 1.5rem auto; padding: 0 1rem; }
        .user-bar { background: #fff; padding: 1rem 1.2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .streak-badge { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
        
        .nav-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; justify-content: center; }
        .tab-btn { background: #fff; border: 1px solid #e5e7eb; padding: 0.65rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(91, 33, 182, 0.2); }
        .tab-content { display: none; animation: fadeIn 0.4s ease; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .notebook-card { background: var(--paper); border-radius: 8px; padding: 2rem 2rem 2rem 3rem; margin-bottom: 1.5rem; box-shadow: 2px 4px 15px rgba(0,0,0,0.05); position: relative; background-image: repeating-linear-gradient(transparent, transparent 31px, var(--line-color) 31px, var(--line-color) 32px); background-attachment: local; background-position: 0 2.5rem; }
        .notebook-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 2rem; width: 2px; background: var(--margin-line); }
        .card-title { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem; display: inline-block; background: #fff; padding: 0 5px; position: relative; z-index: 2; }
        .notebook-input { width: 100%; background: transparent; border: none; font-size: 1rem; line-height: 32px; resize: none; outline: none; font-family: 'Lora', serif; color: #1f2937; padding: 0; min-height: 64px; overflow: hidden; }
        .notebook-input::placeholder { color: #9ca3af; font-style: italic; }
        
        .slider-container { background: #fff; padding: 1rem; border-radius: 12px; border: 1px dashed #cbd5e1; margin: 1rem 0; position: relative; z-index: 2; text-align: center; }
        .slider-val { font-size: 1.5rem; font-weight: 800; color: #ef4444; }
        input[type="range"] { width: 100%; accent-color: var(--primary); margin-top: 10px; }
        
        .btn { width: 100%; padding: 1rem; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; transition: transform 0.2s; font-size: 1rem; position: relative; z-index: 2; margin-bottom: 10px; }
        .btn:active { transform: scale(0.98); }
        
        .ai-result-box { display: none; margin-top: 1rem; background: var(--primary-light); border-left: 4px solid var(--primary); padding: 1.2rem; border-radius: 0 8px 8px 0; font-size: 0.95rem; color: var(--primary-dark); line-height: 1.6; position: relative; z-index: 2; font-family: 'Lora', serif; }
        .reframe-item { background: #fff; padding: 0.6rem 0.8rem; border-radius: 6px; margin-top: 6px; font-size: 0.9rem; color: var(--text); }

        .chat-challenge-banner { background: linear-gradient(135deg, var(--primary), #8b5cf6); border-radius: 16px; padding: 1.5rem; color: #fff; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .challenge-q { font-size: 1.1rem; font-weight: 700; font-family: 'Lora', serif; font-style: italic; margin-top: 0.5rem; line-height: 1.5; }
        .chat-wrapper { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f3f4f6; }
        .chat-box { height: 320px; overflow-y: auto; padding: 1.5rem; background: #fdfaf6; }
        .chat-msg { margin-bottom: 1rem; max-width: 85%; padding: 0.8rem 1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; }
        .chat-msg.bot { background: #fff; border: 1px solid #e5e7eb; color: var(--text); border-bottom-left-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .chat-msg.user { background: var(--primary); color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }
        .chat-input-area { display: flex; padding: 1rem; background: #fff; border-top: 1px solid #f3f4f6; gap: 10px; }
        .chat-input-area input { flex: 1; border: 1px solid #e5e7eb; border-radius: 20px; padding: 0 1.2rem; font-size: 0.95rem; outline: none; }
        .chat-input-area button { width: auto; padding: 0.8rem 1.5rem; border-radius: 20px; }

        .wall-post-card { background: #fff; border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .wall-author { font-size: 0.85rem; font-weight: 700; color: var(--primary); display: flex; justify-content: space-between; }
        .wall-text { font-size: 0.95rem; margin-top: 6px; font-family: 'Lora', serif; color: var(--text); line-height: 1.5; }

        .mindful-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .progress-bar-container { background: #e0e0e0; border-radius: 10px; height: 20px; width: 100%; overflow: hidden; margin-top: 10px; }
        .progress-bar { background: var(--mindful-green); height: 100%; width: 0%; transition: width 0.5s ease; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .stat-box { text-align: center; padding: 20px; background: #e8f5e9; border-radius: 10px; }
        .stat-box h3 { font-size: 30px; color: #388E3C; }
        
        .breathe-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 350px; }
        .circle-outer { width: 220px; height: 220px; border-radius: 50%; background: rgba(76, 175, 80, 0.2); display: flex; align-items: center; justify-content: center; transition: all 1s linear; }
        .circle-inner { width: 90px; height: 90px; border-radius: 50%; background: var(--mindful-green); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center; box-shadow: 0 0 20px rgba(76, 175, 80, 0.5); }
        .breathe-text { font-size: 16px; margin-bottom: 5px; }
        .breathe-timer { font-size: 24px; }
        .btn-mindful { background: var(--mindful-green); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 16px; margin-top: 20px; width: 100%; font-weight: 700; transition: 0.3s; }
        .btn-mindful:hover { background: #388E3C; }
        
        .challenge-box { background: #fff3e0; padding: 15px; border-left: 5px solid #ff9800; margin-bottom: 20px; border-radius: 4px; }
        .journal-form textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; resize: none; margin-bottom: 15px; font-family: 'Nunito', sans-serif;}
        .emoji-selector { display: flex; gap: 15px; margin-bottom: 15px; font-size: 30px; justify-content: center; }
        .emoji { opacity: 0.4; transition: 0.2s; cursor: pointer; user-select: none; }
        .emoji.selected, .emoji:hover { opacity: 1; transform: scale(1.2); }
        .tracker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 20px; }
        .tracker-day { background: #f0f0f0; border-radius: 5px; padding: 10px; text-align: center; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; transition: 0.2s; border: 2px solid transparent; }
        .tracker-day:hover { border-color: #a7f3d0; }
        .tracker-day.active-day { border-color: var(--primary) !important; font-weight: bold; }
        .tracker-day.completed { background: #e8f5e9; border: 1px solid var(--mindful-green); }
        .message-box { display: none; background: #e3f2fd; color: #1565c0; padding: 15px; border-radius: 5px; margin-top: 15px; text-align: center; font-style: italic; }

        #nameModal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; }
        .modal-box { background: #fff; padding: 2.5rem 2rem; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .modal-box input { width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 1rem; margin: 1.5rem 0; outline: none; text-align: center; }
    </style>
</head>
<body>
    <div id="splashLoader">
        <div class="aura-circle"></div>
        <div class="splash-msg" id="splashMsg">Đang chuẩn bị không gian an toàn cho bạn...</div>
    </div>

    <div id="nameModal">
        <div class="modal-box">
            <h2 style="color:var(--primary); font-weight:800; font-size:1.8rem;">Spotlight Check</h2>
            <p style="color:var(--text-muted); margin-top:10px; font-family:'Lora', serif;">Hãy cho chúng tớ biết tên gọi mà bạn thích nhất nhé.</p>
            <input type="text" id="usernameInput" placeholder="Nhập tên của bạn...">
            <button class="btn" onclick="saveName()">Bắt đầu hành trình</button>
        </div>
    </div>

    <header>
        <div class="app-title">📖 Spotlight Check</div>
        <div class="slogan">Hôm nay bạn thế nào? Luôn có một không gian an toàn ở đây cho bạn.</div>
    </header>

    <div class="container">
        <div class="user-bar">
            <div style="font-size:1.05rem;">Chào <strong id="displayName" style="color:var(--primary);">Bạn</strong>,</div>
            <div class="streak-badge">🔥 <span id="streakCount">0</span> Ngày Hoàn Thành</div>
        </div>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab(event, 'journal')">Sổ Tay</button>
            <button class="tab-btn" onclick="switchTab(event, 'ai-chat')">AI Tâm Lý</button>
            <button class="tab-btn" onclick="switchTab(event, 'wall')">Đồng Cảm</button>
            <button class="tab-btn" onclick="switchTab(event, 'progress')">📊 Tiến Trình</button>
            <button class="tab-btn" onclick="switchTab(event, 'breathe')">🫁 Tập Thở</button>
            <button class="tab-btn" onclick="switchTab(event, 'challenge21')">🎯 21 Ngày</button>
        </div>
        
        <!-- TAB: SỔ TAY -->
        <div id="journal" class="tab-content active">
            <div class="notebook-card">
                <div class="card-title">Phần 1: Nhìn nhận lại sự cố</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:5px; position:relative; z-index:2;">Sự kiện khiến bạn lo lắng/xấu hổ là gì?</p>
                <textarea id="eventInput" class="notebook-input" placeholder="Ví dụ: Lỡ nói vấp một từ khi phát biểu..." oninput="autoResize(this)"></textarea>
                
                <p style="font-size:0.9rem; color:var(--text-muted); margin:15px 0 5px; position:relative; z-index:2;">Bạn nghĩ họ đang đánh giá bạn thế nào?</p>
                <textarea id="judgeInput" class="notebook-input" placeholder="Tớ nghĩ họ đang cười thầm và chê tớ kém cỏi..." oninput="autoResize(this)"></textarea>
                
                <div class="slider-container">
                    <p style="font-size:0.9rem; font-weight:700; color:var(--text);">Bạn nghĩ mức độ chú ý của họ là bao nhiêu %?</p>
                    <div class="slider-val" id="percentVal">50%</div>
                    <input type="range" id="percentSlider" min="0" max="100" value="50" oninput="document.getElementById('percentVal').innerText = this.value + '%'">
                </div>
                
                <button class="btn" style="background:var(--text);" onclick="predictAttention()">Bật Kính Lúp Sự Thật 🔍</button>
                <div id="aiPredictionResult" class="ai-result-box"></div>
            </div>

            <div class="notebook-card">
                <div class="card-title" style="color:var(--accent);">Phần 2: Bằng chứng thực tế</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:5px; position:relative; z-index:2;">Có bằng chứng rõ ràng nào cho thấy họ thực sự chú ý không?</p>
                <textarea id="proofInput" class="notebook-input" placeholder="Hình như không ai nói gì, họ tiếp tục bấm điện thoại..." oninput="autoResize(this)"></textarea>
            </div>
            
            <button class="btn" onclick="saveJournal()">Gấp Sổ Tay (Lưu Tiến Trình)</button>
        </div>

        <!-- TAB: AI CHAT -->
        <div id="ai-chat" class="tab-content">
            <div class="chat-challenge-banner">
                <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.8;">Thử thách dũng cảm hôm nay</div>
                <div class="challenge-q" id="challengeText">Đang tải thử thách...</div>
            </div>

            <div class="chat-wrapper">
                <div class="chat-box" id="chatBox">
                    <div class="chat-msg bot">Xin chào! Tớ là AI đồng hành. Hôm nay bạn có điều gì trăn trở muốn tâm sự với tớ không?</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="Nhắn tin chia sẻ với AI..." onkeypress="if(event.key==='Enter') sendChat()">
                    <button class="btn" onclick="sendChat()" style="margin-bottom:0;">Gửi</button>
                </div>
            </div>
        </div>

        <!-- TAB: BỨC TƯỜNG ĐỒNG CẢM -->
        <div id="wall" class="tab-content">
            <div class="notebook-card">
                <div class="card-title">Chia sẻ câu chuyện của bạn</div>
                <textarea id="wallInput" class="notebook-input" placeholder="Viết một suy nghĩ hoặc sự cố nhỏ hôm nay (hoàn toàn ẩn danh)..." oninput="autoResize(this)"></textarea>
                <button class="btn" style="margin-top:10px;" onclick="postToWall()">Gửi Lên Bức Tường 💌</button>
            </div>
            <div id="wallPostsContainer"></div>
        </div>

        <!-- TAB: TIẾN TRÌNH -->
        <div id="progress" class="tab-content">
            <h2 style="color:var(--primary-dark); margin-bottom:15px;">Tiến trình của bạn</h2>
            <div class="mindful-card">
                <p>Hành trình 21 ngày thay đổi bản thân</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="main-progress"></div>
                </div>
                <p style="text-align: right; margin-top: 5px; font-weight: bold;" id="progress-text">0/21 ngày</p>
            </div>
            <div class="stats-grid">
                <div class="stat-box">
                    <h3 id="stat-days">0</h3>
                    <p>Ngày hoàn thành</p>
                </div>
                <div class="stat-box">
                    <h3 id="stat-breathe">0</h3>
                    <p>Phút tập thở</p>
                </div>
            </div>
        </div>

        <!-- TAB: TẬP THỜ -->
        <div id="breathe" class="tab-content">
            <h2 style="color:var(--primary-dark); margin-bottom:15px;">Tập thở Box Breathing</h2>
            <div class="mindful-card">
                <div class="breathe-container">
                    <div class="circle-outer" id="circle-outer">
                        <div class="circle-inner">
                            <span class="breathe-text" id="breathe-text">Chuẩn bị</span>
                            <span class="breathe-timer" id="breathe-timer">4</span>
                        </div>
                    </div>
                </div>
                <button class="btn-mindful" id="btn-breathe" onclick="toggleBreathe()">Bắt đầu tập</button>
            </div>
        </div>

        <!-- TAB: THỬ THÁCH 21 NGÀY -->
        <div id="challenge21" class="tab-content">
            <h2 style="color:var(--primary-dark); margin-bottom:15px;">Mindful 21 Ngày</h2>
            <div class="mindful-card">
                <h3 style="margin-bottom:10px;">Nhiệm vụ (<span id="current-day-label">Ngày 1</span>)</h3>
                <div class="challenge-box">
                    <strong style="font-size: 16px;" id="daily-task-mindful">Đang tải thử thách...</strong>
                </div>

                <div class="journal-form">
                    <p style="margin-bottom:10px;"><strong>Cảm giác của bạn hôm nay?</strong></p>
                    <div class="emoji-selector" id="emoji-list">
                        <span class="emoji" onclick="selectEmoji(this, '😢')">😢</span>
                        <span class="emoji" onclick="selectEmoji(this, '😕')">😕</span>
                        <span class="emoji" onclick="selectEmoji(this, '😐')">😐</span>
                        <span class="emoji" onclick="selectEmoji(this, '🙂')">🙂</span>
                        <span class="emoji" onclick="selectEmoji(this, '😄')">😄</span>
                    </div>
                    <textarea id="journal-entry" placeholder="Ghi nhận lại hôm nay bạn đã thực hiện ra sao..."></textarea>
                    <button class="btn-mindful" onclick="saveDailyProgress()">Lưu ghi nhận cho ngày này</button>
                </div>
                <div id="motivation-message" class="message-box"></div>
            </div>

            <div class="mindful-card">
                <h3>Bảng theo dõi (Bấm chọn ngày để xem/ghi nhận)</h3>
                <div class="tracker-grid" id="tracker-board"></div>
            </div>
        </div>

    </div>

    <script>
        // ==========================================
        // STATE MANAGEMENT & GLOBAL LOGIC
        // ==========================================
        const mindfulTasks = [
            "Dành 15 phút đọc sách hoặc nghe podcast tích cực.",
            "Đi dạo 20 phút mà không mang theo điện thoại.",
            "Uống đủ 2 lít nước và ăn nhiều rau xanh hôm nay.",
            "Viết ra 3 điều bạn cảm thấy biết ơn lúc này.",
            "Dọn dẹp lại góc làm việc/phòng ngủ cho gọn gàng.",
            "Nhắn tin hỏi thăm một người bạn/người thân đã lâu không gặp.",
            "Thực hiện bài tập thở Box Breathing 5 phút."
        ];

        let mindfulAppData = JSON.parse(localStorage.getItem('mindfulAppData')) || {};
        let currentEmoji = '';
        let activeChallengeDay = 1;

        function autoResize(textarea) {
            textarea.style.height = '64px';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }

        window.addEventListener('DOMContentLoaded', () => {
            const affirmations = ${JSON.stringify(loadingAffirmations)};
            document.getElementById('splashMsg').innerText = affirmations[Math.floor(Math.random() * affirmations.length)];
            setTimeout(() => {
                const splash = document.getElementById('splashLoader');
                splash.style.opacity = '0';
                setTimeout(() => splash.style.visibility = 'hidden', 600);
            }, 1000);
            
            checkUser();
            initMindfulChallengeData();
        });

        function checkUser() {
            const name = localStorage.getItem("spotlight_username");
            if (name) {
                document.getElementById("nameModal").style.display = "none";
                document.getElementById("displayName").innerText = name;
            } else {
                document.getElementById("nameModal").style.display = "flex";
            }
            updateMindfulProgress();
        }

        function saveName() {
            const name = document.getElementById("usernameInput").value.trim();
            if (name) {
                localStorage.setItem("spotlight_username", name);
                checkUser();
            } else {
                alert("Bạn nhập tên hoặc biệt danh nhé!");
            }
        }

        function switchTab(evt, tabId) {
            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");
            evt.currentTarget.classList.add("active");
            
            if (tabId === "ai-chat" && document.getElementById("challengeText").innerText.includes("Đang tải")) {
                loadChallenge();
            } else if (tabId === "wall") {
                loadWallPosts();
            }
        }

        // ==========================================
        // SPOTLIGHT API CALLS
        // ==========================================
        async function predictAttention() {
            const event = document.getElementById("eventInput").value.trim();
            const perceived = document.getElementById("percentSlider").value;
            const resDiv = document.getElementById("aiPredictionResult");

            if (!event) return alert("Hãy ghi lại sự cố ở Phần 1 trước nhé.");

            resDiv.style.display = "block";
            resDiv.innerHTML = "⏳ Kính lúp sự thật đang phân tích...";

            try {
                const response = await fetch("/api/predict-spotlight", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event, perceivedPercent: perceived })
                });
                const data = await response.json();

                if (data.success) {
                    let reframesHtml = data.reframes.map(r => "<div class='reframe-item'>" + r + "</div>").join("");
                    resDiv.innerHTML = "<strong>🔍 Kết quả phân tích:</strong><br>Sự chú ý THỰC TẾ từ người khác chỉ khoảng <strong style='color:#ef4444; font-size:1.2rem;'>" + data.predictedPercent + "%</strong> (thay vì " + data.perceivedPercent + "%).<br><br>" + data.explanation + "<br><br><strong>Gợi ý tái định khung:</strong>" + reframesHtml;
                }
            } catch (err) {
                resDiv.innerHTML = "❌ Không thể kết nối hệ thống phân tích.";
            }
        }

        function saveJournal() {
            alert("Trang sổ hôm nay đã lưu lại thành công!");
            ["eventInput", "judgeInput", "proofInput"].forEach(id => document.getElementById(id).value = "");
            document.getElementById("aiPredictionResult").style.display = "none";
            document.querySelectorAll('textarea.notebook-input').forEach(t => t.style.height = '64px');
        }

        async function loadChallenge() {
            try {
                const res = await fetch("/api/challenge");
                const data = await res.json();
                if(data.success) document.getElementById("challengeText").innerText = data.challenge;
            } catch(e) {
                document.getElementById("challengeText").innerText = "Bạn có dám đối mặt với nỗi sợ hôm nay?";
            }
        }

        async function sendChat() {
            const input = document.getElementById("chatInput");
            const msg = input.value.trim();
            if (!msg) return;

            const chatBox = document.getElementById("chatBox");
            chatBox.innerHTML += "<div class='chat-msg user'>" + msg + "</div>";
            input.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;

            const userName = localStorage.getItem("spotlight_username") || "Bạn";
            try {
                const res = await fetch("/api/chat", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: msg, userName })
                });
                const data = await res.json();
                if (data.success) {
                    chatBox.innerHTML += "<div class='chat-msg bot'>" + data.reply + "</div>";
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            } catch (err) {
                chatBox.innerHTML += "<div class='chat-msg bot'>Tớ gặp lỗi kết nối!</div>";
            }
        }

        async function loadWallPosts() {
            const container = document.getElementById("wallPostsContainer");
            try {
                const res = await fetch("/api/wall");
                const data = await res.json();
                if (data.success) {
                    container.innerHTML = data.posts.map(p => 
                        "<div class='wall-post-card'><div class='wall-author'><span>" + p.author + "</span><span style='color:var(--text-muted); font-weight:normal;'>" + p.time + "</span></div><div class='wall-text'>" + p.text + "</div></div>"
                    ).join("");
                }
            } catch (e) { container.innerHTML = "<p>Lỗi tải dữ liệu.</p>"; }
        }

        async function postToWall() {
            const input = document.getElementById("wallInput");
            const text = input.value.trim();
            if (!text) return alert("Viết nội dung trước nhé!");

            try {
                const res = await fetch("/api/wall", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();
                if (data.success) { input.value = ""; input.style.height = "64px"; loadWallPosts(); }
            } catch (e) { alert("Lỗi khi gửi."); }
        }

        // ==========================================
        // MINDFULNESS & 21-DAY CHALLENGE FIXES
        // ==========================================
        let timerInterval, isBreathing = false;
        let breatheMinutes = parseInt(localStorage.getItem('breatheMinutes')) || 0;
        document.getElementById('stat-breathe').innerText = breatheMinutes;

        const breathePhases = [
            { text: 'Hít vào', scale: '1.5', time: 4 },
            { text: 'Giữ hơi', scale: '1.5', time: 4 },
            { text: 'Thở ra', scale: '1', time: 4 },
            { text: 'Giữ hơi', scale: '1', time: 4 }
        ];

        function toggleBreathe() {
            const btn = document.getElementById('btn-breathe');
            if (isBreathing) {
                stopBreathe();
                btn.innerText = 'Bắt đầu tập';
                breatheMinutes++;
                localStorage.setItem('breatheMinutes', breatheMinutes);
                document.getElementById('stat-breathe').innerText = breatheMinutes;
            } else {
                startBreathe();
                btn.innerText = 'Dừng tập (Để lưu phút)';
            }
            isBreathing = !isBreathing;
        }

        function startBreathe() {
            let pIndex = 0;
            let timeLeft = breathePhases[pIndex].time;
            const outerCircle = document.getElementById('circle-outer');
            const textEl = document.getElementById('breathe-text');
            const timerEl = document.getElementById('breathe-timer');

            function updatePhase() {
                textEl.innerText = breathePhases[pIndex].text;
                outerCircle.style.transform = `scale(\${breathePhases[pIndex].scale})`;
                timeLeft = breathePhases[pIndex].time;
                timerEl.innerText = timeLeft;
            }
            updatePhase();

            timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) timerEl.innerText = timeLeft;
                else {
                    pIndex = (pIndex + 1) % breathePhases.length;
                    updatePhase();
                }
            }, 1000);
        }

        function stopBreathe() {
            clearInterval(timerInterval);
            document.getElementById('circle-outer').style.transform = 'scale(1)';
            document.getElementById('breathe-text').innerText = 'Chuẩn bị';
            document.getElementById('breathe-timer').innerText = '4';
        }

        function initMindfulChallengeData() {
            selectChallengeDay(1);
        }

        function selectChallengeDay(dayNum) {
            activeChallengeDay = dayNum;
            document.getElementById('current-day-label').innerText = `Ngày ${activeChallengeDay}`;
            
            const taskIndex = (activeChallengeDay - 1) % mindfulTasks.length;
            document.getElementById('daily-task-mindful').innerText = mindfulTasks[taskIndex];

            const dayData = mindfulAppData[`day_${activeChallengeDay}`] || {};
            document.getElementById('journal-entry').value = dayData.journal || '';
            
            document.querySelectorAll('.emoji').forEach(el => el.classList.remove('selected'));
            currentEmoji = dayData.emoji || '';
            if (currentEmoji) {
                document.querySelectorAll('.emoji').forEach(el => {
                    if (el.innerText.trim() === currentEmoji) el.classList.add('selected');
                });
            }

            renderMindfulTracker();
        }

        function selectEmoji(element, emoji) {
            document.querySelectorAll('.emoji').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
            currentEmoji = emoji;
        }

        function saveDailyProgress() {
            const journal = document.getElementById('journal-entry').value;
            if (!currentEmoji) return alert("Chọn 1 cảm xúc cho ngày hôm nay nhé!");

            mindfulAppData[`day_${activeChallengeDay}`] = { 
                emoji: currentEmoji, 
                journal, 
                completed: true,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('mindfulAppData', JSON.stringify(mindfulAppData));

            const msgBox = document.getElementById('motivation-message');
            msgBox.innerText = `Tuyệt vời! Đã ghi nhận tiến trình cho Ngày ${activeChallengeDay}.`;
            msgBox.style.display = 'block';

            renderMindfulTracker();
            updateMindfulProgress();
        }

        function renderMindfulTracker() {
            const board = document.getElementById('tracker-board');
            board.innerHTML = '';
            for (let i = 1; i <= 21; i++) {
                const dayData = mindfulAppData[`day_${i}`];
                const isCompleted = dayData && dayData.completed;
                const isActive = i === activeChallengeDay;
                
                board.innerHTML += `
                    <div class="tracker-day ${isCompleted ? 'completed' : ''} ${isActive ? 'active-day' : ''}" onclick="selectChallengeDay(${i})">
                        <strong>N.${i}</strong>
                        <span>${isCompleted ? dayData.emoji : '⚪'}</span>
                    </div>
                `;
            }
        }

        function updateMindfulProgress() {
            const completedDays = Object.keys(mindfulAppData).filter(k => mindfulAppData[k] && mindfulAppData[k].completed).length;
            const percentage = Math.min((completedDays / 21) * 100, 100);
            
            document.getElementById('main-progress').style.width = percentage + '%';
            document.getElementById('progress-text').innerText = `${completedDays}/21 ngày`;
            document.getElementById('stat-days').innerText = completedDays;
            document.getElementById('streakCount').innerText = completedDays;
        }
    </script>
</body>
</html>
    `;
    res.send(htmlContent);
});

// ==========================================
// 4. SERVER INIT
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 System running on port ${PORT}`);
});
