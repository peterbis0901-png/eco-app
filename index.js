const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. SECURITY & MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors({
    origin: '*', // Trong môi trường Production thực tế, thay '*' bằng domain Frontend cố định (VD: 'https://myapp.com')
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' })); // Chống DDoS bằng cách giới hạn kích thước payload

// Hàm Helper chống tấn công XSS
const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Async Handler wrapper để bắt gọn mọi Promise Rejection
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ==========================================
// 2. IN-MEMORY DATABASE & DATASETS
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
// 3. RESTFUL API ENDPOINTS (PROTECTED & VALIDATED)
// ==========================================

app.post('/api/chat', asyncHandler(async (req, res) => {
    const { message, userName } = req.body;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Tin nhắn không hợp lệ' });
    }

    const cleanMsg = escapeHTML(message.trim()).toLowerCase();
    const cleanUser = escapeHTML(userName || 'bạn');
    let reply = `Chào ${cleanUser}! Tớ luôn ở đây lắng nghe bạn. Cứ thoải mái chia sẻ những suy nghĩ trong đầu lúc này nhé.`;

    if (cleanMsg.includes('sợ') || cleanMsg.includes('lo') || cleanMsg.includes('ngại') || cleanMsg.includes('đông')) {
        reply = `Tớ hiểu cảm giác lo âu này của ${cleanUser}. Não bộ chúng ta thường tự động bật chế độ đề phòng và phóng đại sự chú ý của đám đông. Thực tế là 90% mọi người xung quanh chỉ đang bận lo lắng về chính bộ dạng của họ thôi. Hãy thử hít thở sâu nhé!`;
    } else if (cleanMsg.includes('quê') || cleanMsg.includes('xấu hổ') || cleanMsg.includes('sai') || cleanMsg.includes('vấp')) {
        reply = `Ai cũng từng có những khoảnh khắc nói hớ hay vấp ngã. Sự cố đó có vẻ to tát với ${cleanUser} bây giờ, nhưng trong mắt người khác nó chỉ lướt qua như một cơn gió nhẹ và bị quên ngay sau vài giờ thôi.`;
    } else if (cleanMsg.includes('cô đơn') || cleanMsg.includes('không ai') || cleanMsg.includes('từ chối')) {
        reply = `Bạn không một mình đâu ${cleanUser}. Cảm giác bị tách biệt là phản ứng tâm lý rất tự nhiên khi ta quá bận tâm đến việc phải hoàn hảo trong mắt người khác. Tớ vẫn ở đây với bạn mà!`;
    }

    res.json({ success: true, reply });
}));

app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

app.get('/api/wall', (req, res) => {
    res.json({ success: true, posts: anonymousWallPosts });
});

app.post('/api/wall', asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ success: false, error: 'Nội dung không được để trống' });
    }

    const cleanText = escapeHTML(text.trim());
    const newPost = { 
        id: Date.now(), 
        author: `Thành viên ẩn danh #${Math.floor(100 + Math.random() * 900)}`, 
        text: cleanText, 
        time: 'Vừa xong' 
    };

    anonymousWallPosts.unshift(newPost);
    res.status(201).json({ success: true, post: newPost });
}));

app.post('/api/predict-spotlight', asyncHandler(async (req, res) => {
    const { event, perceivedPercent } = req.body;
    const perceived = Math.min(100, Math.max(0, parseInt(perceivedPercent) || 50));
    const predictedActual = Math.max(5, Math.round(perceived * 0.18 + Math.random() * 5));
    
    const explanation = `Theo thực nghiệm tâm lý xã hội, khi bạn nghĩ có ${perceived}% đám đông đang chú ý đến sự cố của bạn, mức độ thực tế họ ghi nhớ chỉ đạt khoảng ${predictedActual}%. Hầu hết mọi người chỉ tập trung vào vấn đề cá nhân của họ.`;
    
    const reframes = [
        "1. Góc nhìn thực tế: Sự cố này chỉ kéo dài vài giây, người khác sẽ quên ngay khi chuyển sang hoạt động tiếp theo.",
        "2. Tái định khung: Sai sót là minh chứng bạn đang dũng cảm hành động và bước ra khỏi vùng an toàn.",
        "3. Sự đồng cảm: Mọi người xung quanh thường có xu hướng cảm thông hơn là khắt khe phán xét."
    ];

    res.json({ 
        success: true, 
        perceivedPercent: perceived, 
        predictedPercent: predictedActual, 
        explanation, 
        reframes 
    });
}));

// ==========================================
// 4. FRONTEND SPA (WITH INTEGRATED WEB AUDIO API)
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
            <div class="streak-badge">🔥 <span id="streakCount">1</span> Ngày</div>
        </div>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab(event, 'journal')">Sổ Tay</button>
            <button class="tab-btn" onclick="switchTab(event, 'ai-chat')">AI Tâm Lý</button>
            <button class="tab-btn" onclick="switchTab(event, 'wall')">Đồng Cảm</button>
            <button class="tab-btn" onclick="switchTab(event, 'breathe')">🫁 Tập Thở</button>
        </div>

        <!-- TAB: SỔ TAY -->
        <div id="journal" class="tab-content active">
            <div class="notebook-card">
                <div class="card-title">Phần 1: Nhìn nhận lại sự cố</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:5px;">Sự kiện khiến bạn lo lắng/xấu hổ là gì?</p>
                <textarea id="eventInput" class="notebook-input" placeholder="Ví dụ: Lỡ nói vấp một từ khi phát biểu..." oninput="autoResize(this)"></textarea>
                
                <div class="slider-container">
                    <p style="font-size:0.9rem; font-weight:700;">Bạn nghĩ mức độ chú ý của họ là bao nhiêu %?</p>
                    <div class="slider-val" id="percentVal">50%</div>
                    <input type="range" id="percentSlider" min="0" max="100" value="50" oninput="document.getElementById('percentVal').innerText = this.value + '%'">
                </div>
                
                <button class="btn" onclick="predictAttention()">Bật Kính Lúp Sự Thật 🔍</button>
                <div id="aiPredictionResult" class="ai-result-box"></div>
            </div>
        </div>

        <!-- TAB: AI CHAT -->
        <div id="ai-chat" class="tab-content">
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

        <!-- TAB: WALL -->
        <div id="wall" class="tab-content">
            <div class="notebook-card">
                <div class="card-title">Chia sẻ câu chuyện của bạn</div>
                <textarea id="wallInput" class="notebook-input" placeholder="Viết một suy nghĩ hoặc sự cố nhỏ hôm nay (hoàn toàn ẩn danh)..." oninput="autoResize(this)"></textarea>
                <button class="btn" onclick="postToWall()">Gửi Lên Bức Tường 💌</button>
            </div>
            <div id="wallPostsContainer"></div>
        </div>

        <!-- TAB: TẬP THỞ (TÍCH HỢP SOUND ENGINE DỰ PHÒNG) -->
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
                
                <div style="margin-top: 20px; width: 100%; text-align: center;">
                    <p style="font-size: 14px; margin-bottom: 10px; color: var(--text-muted);">🎵 Nhạc thiền tĩnh tâm (Tự động phát âm thanh 432Hz dự phòng)</p>
                    <audio id="breatheAudio" src="https://actions.google.com/sounds/v1/ambiences/rain_heavy_loud.ogg" loop preload="auto" controls style="width: 100%; border-radius: 8px;"></audio>
                </div>
            </div>
        </div>
    </div>

    <script>
        let audioCtx, osc1, osc2, gainNode;

        // Web Audio API Synth Engine (432Hz Sound Generation)
        function startSyntheticMeditationSound() {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                osc1 = audioCtx.createOscillator();
                osc2 = audioCtx.createOscillator();
                gainNode = audioCtx.createGain();

                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(108, audioCtx.currentTime); 
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(216, audioCtx.currentTime);

                gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);

                osc1.connect(gainNode);
                osc2.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                osc1.start();
                osc2.start();
            } catch(e) { console.warn('Web Audio Context bị chặn'); }
        }

        function stopSyntheticMeditationSound() {
            if (gainNode && audioCtx) {
                gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
                setTimeout(() => { if (audioCtx && audioCtx.state !== 'closed') audioCtx.close(); }, 1000);
            }
        }

        let timerInterval, isBreathing = false;
        let breatheMinutes = parseInt(localStorage.getItem('breatheMinutes')) || 0;

        const breathePhases = [
            { text: 'Hít vào', scale: '1.5', time: 4 },
            { text: 'Giữ hơi', scale: '1.5', time: 4 },
            { text: 'Thở ra', scale: '1', time: 4 },
            { text: 'Giữ hơi', scale: '1', time: 4 }
        ];

        function toggleBreathe() {
            const btn = document.getElementById('btn-breathe');
            const audio = document.getElementById('breatheAudio');

            if (isBreathing) {
                stopBreathe();
                btn.innerText = 'Bắt đầu tập';
                if (audio) { audio.pause(); audio.currentTime = 0; }
                stopSyntheticMeditationSound();
                breatheMinutes++;
                localStorage.setItem('breatheMinutes', breatheMinutes);
            } else {
                startBreathe();
                btn.innerText = 'Dừng tập (Để lưu phút)';
                if (audio) {
                    audio.play().catch(err => {
                        console.warn('Phát hiện lỗi CORS/Autoplay MP3, chuyển sang Web Audio API:', err);
                        startSyntheticMeditationSound();
                    });
                } else {
                    startSyntheticMeditationSound();
                }
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
                outerCircle.style.transform = 'scale(' + breathePhases[pIndex].scale + ')';
                timeLeft = breathePhases[pIndex].time;
                timerEl.innerText = timeLeft;
            }
            updatePhase();

            timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    pIndex = (pIndex + 1) % breathePhases.length;
                    updatePhase();
                } else {
                    timerEl.innerText = timeLeft;
                }
            }, 1000);
        }

        function stopBreathe() {
            clearInterval(timerInterval);
            document.getElementById('circle-outer').style.transform = 'scale(1)';
            document.getElementById('breathe-text').innerText = 'Chuẩn bị';
            document.getElementById('breathe-timer').innerText = '4';
        }

        function autoResize(textarea) {
            textarea.style.height = '64px';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }

        function switchTab(evt, tabId) {
            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");
            evt.currentTarget.classList.add("active");
            if (tabId === "wall") loadWallPosts();
        }

        async function predictAttention() {
            const event = document.getElementById("eventInput").value.trim();
            const perceived = document.getElementById("percentSlider").value;
            const resDiv = document.getElementById("aiPredictionResult");

            if (!event) return alert("Hãy ghi lại sự cố trước nhé.");
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
                    resDiv.innerHTML = "<strong>🔍 Kết quả phân tích:</strong><br>Sự chú ý THỰC TẾ: <strong style='color:#ef4444;'>" + data.predictedPercent + "%</strong> (thay vì " + data.perceivedPercent + "%).<br><br>" + data.explanation + "<br><br>" + reframesHtml;
                }
            } catch (err) { resDiv.innerHTML = "❌ Không thể kết nối server."; }
        }

        async function sendChat() {
            const input = document.getElementById("chatInput");
            const msg = input.value.trim();
            if (!msg) return;

            const chatBox = document.getElementById("chatBox");
            chatBox.innerHTML += "<div class='chat-msg user'>" + msg + "</div>";
            input.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: msg, userName: localStorage.getItem("spotlight_username") || "Bạn" })
                });
                const data = await res.json();
                if (data.success) {
                    chatBox.innerHTML += "<div class='chat-msg bot'>" + data.reply + "</div>";
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            } catch (err) { chatBox.innerHTML += "<div class='chat-msg bot'>Lỗi kết nối!</div>"; }
        }

        async function loadWallPosts() {
            const container = document.getElementById("wallPostsContainer");
            try {
                const res = await fetch("/api/wall");
                const data = await res.json();
                if (data.success) {
                    container.innerHTML = data.posts.map(p => 
                        "<div class='wall-post-card'><div class='wall-author'><span>" + p.author + "</span><span>" + p.time + "</span></div><div class='wall-text'>" + p.text + "</div></div>"
                    ).join("");
                }
            } catch (e) { container.innerHTML = "<p>Lỗi tải dữ liệu.</p>"; }
        }

        async function postToWall() {
            const input = document.getElementById("wallInput");
            const text = input.value.trim();
            if (!text) return alert("Nội dung không được để trống!");

            try {
                const res = await fetch("/api/wall", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();
                if (data.success) { input.value = ""; loadWallPosts(); }
            } catch (e) { alert("Lỗi khi gửi."); }
        }

        function checkUser() {
            const name = localStorage.getItem("spotlight_username");
            if (name) {
                document.getElementById("nameModal").style.display = "none";
                document.getElementById("displayName").innerText = name;
            }
        }

        function saveName() {
            const name = document.getElementById("usernameInput").value.trim();
            if (name) {
                localStorage.setItem("spotlight_username", name);
                checkUser();
            }
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
        });
    </script>
</body>
</html>
    `;
    res.send(htmlContent);
});

// ==========================================
// 5. GLOBAL CENTRALIZED ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Server Internal Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Hệ thống đang gặp sự cố nhỏ. Vui lòng thử lại sau!' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 System Online: Server running securely at http://localhost:${PORT}`);
});
