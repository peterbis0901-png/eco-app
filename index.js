const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 1. IN-MEMORY DATABASE & KNOWLEDGE DATASET
// Cập nhật cấu trúc câu hỏi thử thách theo format mới
const dailyChallenges = [
    "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Liệu hôm nay bạn có dám đưa ra ý kiến trong buổi họp/tiết học mà không lo sợ bị đánh giá?",
    "Liệu hôm nay bạn có dám từ chối một yêu cầu mà bạn thực sự không muốn làm?",
    "Liệu hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn của người khác?",
    "Liệu hôm nay bạn có dám nhận lỗi một cách thẳng thắn mà không tìm cãi lý?"
];

// Bức tường đồng cảm ẩn danh
let anonymousWallPosts = [
    { id: 1, author: 'Thành viên ẩn danh', text: 'Hôm nay tớ lỡ gọi lộn tên đồng nghiệp. Tưởng quê lắm nhưng 5 phút sau mọi người quên hết sạch!', time: '10 phút trước' },
    { id: 2, author: 'Bạn cùng tần số', text: 'Vừa thuyết trình bị vấp từ. Dùng AI dự đoán mới biết mọi người chỉ chú ý 12% thôi, nhẹ cả người.', time: '45 phút trước' },
    { id: 3, author: 'Ẩn danh 082', text: 'Đừng quá khắt khe với bản thân nhé mọi người. AI nói đúng: Ai cũng bận lo cho bản thân họ thôi!', time: '2 giờ trước' }
];

// Thông điệp trấn an ngẫu nhiên cho Loading Screen
const loadingAffirmations = [
    "Hít một hơi thật sâu nào, mọi chuyện rồi sẽ ổn thôi...",
    "Bạn đang làm rất tốt rồi, hãy chậm lại một chút nhé...",
    "Thế giới này không quá khắt khe như bạn tưởng đâu...",
    "Chào mừng bạn trở lại với không gian an toàn của chính mình..."
];

// 2. BACKEND API ENDPOINTS

// API AI Chatbot - Tích hợp xử lý tư vấn và khuyên nhủ
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
            reply = `Thử thách sinh ra là để chúng ta bước ra khỏi vùng an toàn. ${user} không cần làm nó một cách hoàn hảo, chỉ cần dám bắt đầu là bạn đã chiến thắng chính mình rồi!`;
        }

        setTimeout(() => res.json({ success: true, reply }), 350);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi hệ thống' });
    }
});

// API Thử thách
app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

// Các API khác giữ nguyên logic lõi
app.get('/api/wall', (req, res) => res.json({ success: true, posts: anonymousWallPosts }));
app.post('/api/wall', (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Trống' });
        const newPost = { id: Date.now(), author: `Thành viên ẩn danh #${Math.floor(100 + Math.random() * 900)}`, text: text.trim(), time: 'Vừa xong' };
        anonymousWallPosts.unshift(newPost);
        res.json({ success: true, post: newPost });
    } catch (err) { res.status(500).json({ success: false, error: 'Lỗi' }); }
});
app.post('/api/predict-spotlight', (req, res) => {
    try {
        const { event, perceivedPercent } = req.body;
        const perceived = parseInt(perceivedPercent) || 50;
        const predictedActual = Math.max(6, Math.round(perceived * 0.18 + Math.random() * 6));
        const explanation = `Theo thực nghiệm tâm lý xã hội, khi bạn ngỡ như có ${perceived}% ánh nhìn hướng về mình, mức độ chú ý THỰC TẾ từ đám đông chỉ đạt khoảng ${predictedActual}%. Đa số mọi người đang bị cuốn vào luồng suy nghĩ riêng của họ.`;
        const reframes = [
            `1. Góc nhìn thực tế: Sự cố này chỉ kéo dài vài giây, người khác sẽ quên ngay khi họ mở điện thoại ra.`,
            `2. Tái định khung: Sai sót là minh chứng bạn đang dũng cảm thử thách bản thân.`,
            `3. Sự đồng cảm: Đám đông thường có xu hướng thông cảm hơn là phán xét gắt gao.`
        ];
        setTimeout(() => res.json({ success: true, perceivedPercent: perceived, predictedPercent: predictedActual, explanation, reframes }), 400);
    } catch (err) { res.status(500).json({ success: false, error: 'Lỗi' }); }
});

// 3. FRONTEND SINGLE PAGE APPLICATION (SPA)
app.get('/', (req, res) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotlight Check</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;600;700;800&display=swap');
        
        :root {
            --primary: #5b21b6; /* Tím trầm tĩnh */
            --primary-light: #ede9fe;
            --accent: #10b981;
            --bg: #f9f8f6; /* Màu giấy sổ tay */
            --paper: #ffffff;
            --text: #374151;
            --text-muted: #6b7280;
            --line-color: #e5e7eb;
            --margin-line: #fca5a5;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }
        body { background: var(--bg); color: var(--text); padding-bottom: 3rem; background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23f9f8f6'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h100v100H0V0zm2 2h96v96H2V2z' fill='%23f1f0ee'/%3E%3C/svg%3E"); }
        
        /* Loading */
        #splashLoader { position: fixed; top:0; left:0; width:100vw; height:100vh; background: #faf9f6; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.6s ease, visibility 0.6s; }
        .aura-circle { width: 100px; height: 100px; border-radius: 50%; border: 4px solid var(--primary-light); border-top-color: var(--primary); animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .splash-msg { color: var(--text); font-family: 'Lora', serif; font-style: italic; text-align: center; max-width: 80%; font-size: 1.1rem; }

        header { background: #fff; padding: 1.5rem 1rem; text-align: center; position: sticky; top: 0; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .app-title { font-size: 1.6rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: -0.5px; }
        .slogan { font-size: 0.95rem; color: var(--text-muted); margin-top: 8px; font-style: italic; font-family: 'Lora', serif; }
        
        .container { max-width: 600px; margin: 1.5rem auto; padding: 0 1rem; }
        
        .user-bar { background: #fff; padding: 1rem 1.2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .streak-badge { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
        
        /* Cấu trúc Sổ tay */
        .notebook-card {
            background: var(--paper);
            border-radius: 8px;
            padding: 2rem 2rem 2rem 3rem;
            margin-bottom: 1.5rem;
            box-shadow: 2px 4px 15px rgba(0,0,0,0.05);
            position: relative;
            background-image: repeating-linear-gradient(transparent, transparent 31px, var(--line-color) 31px, var(--line-color) 32px);
            background-attachment: local;
            background-position: 0 2.5rem;
        }
        .notebook-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 2rem; width: 2px; background: var(--margin-line); }
        
        .card-title { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem; display: inline-block; background: #fff; padding: 0 5px; position: relative; z-index: 2; }
        
        .notebook-input { width: 100%; background: transparent; border: none; font-size: 1rem; line-height: 32px; resize: none; outline: none; font-family: 'Lora', serif; color: #1f2937; padding: 0; min-height: 64px; overflow: hidden; }
        .notebook-input::placeholder { color: #9ca3af; font-style: italic; }
        
        /* Navigation (Dấu trang) */
        .nav-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; justify-content: center; }
        .tab-btn { background: #fff; border: 1px solid #e5e7eb; padding: 0.7rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(91, 33, 182, 0.2); }
        .tab-content { display: none; animation: fadeIn 0.4s ease; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* Buttons & Controls */
        .slider-container { background: #fff; padding: 1rem; border-radius: 12px; border: 1px dashed #cbd5e1; margin: 1rem 0; position: relative; z-index: 2; text-align: center; }
        .slider-val { font-size: 1.5rem; font-weight: 800; color: #ef4444; }
        input[type="range"] { width: 100%; accent-color: var(--primary); margin-top: 10px; }
        
        .btn { width: 100%; padding: 1rem; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; transition: transform 0.2s; font-size: 1rem; position: relative; z-index: 2; }
        .btn:active { transform: scale(0.98); }
        .btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
        
        .ai-result-box { display: none; margin-top: 1rem; background: var(--primary-light); border-left: 4px solid var(--primary); padding: 1.2rem; border-radius: 0 8px 8px 0; font-size: 0.95rem; color: #4c1d95; line-height: 1.6; position: relative; z-index: 2; font-family: 'Lora', serif; }

        /* AI Chatbot & Challenge */
        .chat-challenge-banner { background: linear-gradient(135deg, var(--primary), #8b5cf6); border-radius: 16px; padding: 1.5rem; color: #fff; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .challenge-q { font-size: 1.15rem; font-weight: 700; font-family: 'Lora', serif; font-style: italic; margin-top: 0.5rem; line-height: 1.5; }
        
        .chat-wrapper { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f3f4f6; }
        .chat-box { height: 350px; overflow-y: auto; padding: 1.5rem; background: #fdfaf6; }
        .chat-msg { margin-bottom: 1rem; max-width: 85%; padding: 0.8rem 1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; }
        .chat-msg.bot { background: #fff; border: 1px solid #e5e7eb; color: var(--text); border-bottom-left-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .chat-msg.user { background: var(--primary); color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }
        .chat-input-area { display: flex; padding: 1rem; background: #fff; border-top: 1px solid #f3f4f6; gap: 10px; }
        .chat-input-area input { flex: 1; border: 1px solid #e5e7eb; border-radius: 20px; padding: 0 1.2rem; font-size: 0.95rem; outline: none; }
        .chat-input-area input:focus { border-color: var(--primary); }
        .chat-input-area button { width: auto; padding: 0.8rem 1.5rem; border-radius: 20px; }

        /* Support Links */
        .support-card { background: #fff; border-radius: 12px; padding: 1.5rem; text-align: center; margin-bottom: 1rem; border: 1px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .btn-call { display: inline-block; width: 100%; background: #ef4444; color: #fff; text-decoration: none; padding: 1rem; border-radius: 12px; font-weight: 700; margin-top: 1rem; transition: opacity 0.2s; }
        .btn-link { display: inline-block; width: 100%; background: #0ea5e9; color: #fff; text-decoration: none; padding: 1rem; border-radius: 12px; font-weight: 700; margin-top: 1rem; transition: opacity 0.2s; }
        .btn-call:hover, .btn-link:hover { opacity: 0.9; }

        /* Modal Login - Đơn giản hóa */
        #nameModal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; }
        .modal-box { background: #fff; padding: 2.5rem 2rem; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .modal-box input { width: 100%; padding: 1rem; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 1rem; margin: 1.5rem 0; outline: none; transition: border 0.3s; text-align: center; }
        .modal-box input:focus { border-color: var(--primary); }
    </style>
</head>
<body>
    <!-- Splash Screen -->
    <div id="splashLoader">
        <div class="aura-circle"></div>
        <div class="splash-msg" id="splashMsg">Đang chuẩn bị trang giấy mới cho bạn...</div>
    </div>

    <!-- Login Modal (Chỉ cần Tên) -->
    <div id="nameModal">
        <div class="modal-box">
            <h2 style="color:var(--primary); font-weight:800; font-size:1.8rem;">Spotlight Check</h2>
            <p style="color:var(--text-muted); margin-top:10px; font-family:'Lora', serif;">Không cần đăng ký phức tạp, hãy cho chúng tớ biết tên gọi mà bạn yêu thích nhất.</p>
            <input type="text" id="usernameInput" placeholder="Nhập tên của bạn...">
            <button class="btn" onclick="saveName()">Mở Sổ Tay</button>
        </div>
    </div>

    <header>
        <div class="app-title">📖 Spotlight Check</div>
        <div class="slogan">Hôm nay bạn thế nào? Dù có vui hay buồn thì vẫn luôn có chúng tớ ở đây.</div>
    </header>

    <div class="container">
        <div class="user-bar">
            <div style="font-size:1.05rem;">Chào <strong id="displayName" style="color:var(--primary);">Bạn</strong>,</div>
            <div class="streak-badge">🔥 <span id="streakCount">1</span> Ngày</div>
        </div>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab(event, 'journal')">Sổ Tay Phản Tư</button>
            <button class="tab-btn" onclick="switchTab(event, 'ai-chat')">AI Tâm Lý & Thử Thách</button>
            <button class="tab-btn" onclick="switchTab(event, 'support')">Hỗ Trợ Chuyên Gia</button>
        </div>
        
        <!-- TAB 1: SỔ TAY -->
        <div id="journal" class="tab-content active">
            <div class="notebook-card">
                <div class="card-title">Phần 1: Nhìn nhận lại vấn đề</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:5px; position:relative; z-index:2;">Sự kiện / Tình huống khiến bạn lo lắng là gì?</p>
                <textarea id="eventInput" class="notebook-input" placeholder="Ví dụ: Lỡ phát biểu vấp trong cuộc họp..." oninput="autoResize(this)"></textarea>
                
                <p style="font-size:0.9rem; color:var(--text-muted); margin:15px 0 5px; position:relative; z-index:2;">Mọi người đang phán xét bạn thế nào?</p>
                <textarea id="judgeInput" class="notebook-input" placeholder="Tôi sợ họ nghĩ tôi kém cỏi..." oninput="autoResize(this)"></textarea>
                
                <div class="slider-container">
                    <p style="font-size:0.9rem; font-weight:700; color:var(--text);">Bạn cảm thấy mức độ chú ý của họ là bao nhiêu %?</p>
                    <div class="slider-val" id="percentVal">50%</div>
                    <input type="range" id="percentSlider" min="0" max="100" value="50" oninput="document.getElementById('percentVal').innerText = this.value + '%'">
                </div>
                
                <button class="btn" style="background:var(--text);" onclick="predictAttention()">Bật Kính Lúp Sự Thật 🔍</button>
                <div id="aiPredictionResult" class="ai-result-box"></div>
            </div>

            <div class="notebook-card">
                <div class="card-title" style="color:var(--accent);">Phần 2: Kiểm chứng thực tế</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:5px; position:relative; z-index:2;">Có bằng chứng nào cho thấy mọi người THỰC SỰ để ý đến bạn không?</p>
                <textarea id="proofInput" class="notebook-input" placeholder="Hình như không ai cười hay nói gì cả..." oninput="autoResize(this)"></textarea>
            </div>
            
            <button class="btn" onclick="saveJournal()">Đóng Sổ Tay (Lưu tiến trình)</button>
        </div>

        <!-- TAB 2: AI CHATBOT & THỬ THÁCH -->
        <div id="ai-chat" class="tab-content">
            <div class="chat-challenge-banner">
                <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.8;">Thử thách 21 Ngày</div>
                <div class="challenge-q" id="challengeText">Đang tải thử thách hôm nay...</div>
            </div>

            <div class="chat-wrapper">
                <div class="chat-box" id="chatBox">
                    <div class="chat-msg bot">Xin chào! Tớ là AI đồng hành của Spotlight Check. Bạn đã sẵn sàng để thực hiện thử thách hôm nay chưa, hay có tâm sự gì muốn kể tớ nghe không?</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" placeholder="Nhắn tin với AI..." onkeypress="if(event.key==='Enter') sendChat()">
                    <button class="btn" onclick="sendChat()">Gửi</button>
                </div>
            </div>
        </div>

        <!-- TAB 3: HỖ TRỢ CHUYÊN GIA -->
        <div id="support" class="tab-content">
            <div class="support-card">
                <h3 style="color:var(--text); font-weight:800;">Tổng đài Bảo vệ Trẻ em Quốc gia</h3>
                <p style="font-size:0.95rem; color:var(--text-muted); margin-top:10px;">Hỗ trợ tư vấn khẩn cấp về sức khỏe tinh thần và bảo vệ tâm lý, hoạt động 24/7.</p>
                <a href="tel:111" class="btn-call">📞 Liên hệ 111 (Miễn phí)</a>
            </div>
            <div class="support-card">
                <h3 style="color:var(--text); font-weight:800;">Phòng tham vấn tâm lý học đường LTV</h3>
                <p style="font-size:0.95rem; color:var(--text-muted); margin-top:10px;">Hỗ trợ chuyên sâu giúp bạn vượt qua lo âu xã hội, giải tỏa căng thẳng trong học tập.</p>
                <a href="https://www.facebook.com/share/1CGCq3ZcUu/" target="_blank" class="btn-link">🔗 Truy cập Fanpage Tâm Lý LTV</a>
            </div>
        </div>
    </div>

    <script>
        // Auto resize textarea cho giống dòng kẻ sổ
        function autoResize(textarea) {
            textarea.style.height = '64px';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }

        // Logic Splash & Khởi tạo
        window.addEventListener('DOMContentLoaded', () => {
            const affirmations = ${JSON.stringify(loadingAffirmations)};
            document.getElementById('splashMsg').innerText = affirmations[Math.floor(Math.random() * affirmations.length)];
            setTimeout(() => {
                const splash = document.getElementById('splashLoader');
                splash.style.opacity = '0';
                setTimeout(() => splash.style.visibility = 'hidden', 600);
            }, 1500);
            checkUser();
        });

        // Xử lý Tên người dùng
        function checkUser() {
            const name = localStorage.getItem("spotlight_username");
            if (name) {
                document.getElementById("nameModal").style.display = "none";
                document.getElementById("displayName").innerText = name;
            } else {
                document.getElementById("nameModal").style.display = "flex";
            }
            updateStreak();
        }

        function saveName() {
            const name = document.getElementById("usernameInput").value.trim();
            if (name) {
                localStorage.setItem("spotlight_username", name);
                checkUser();
            } else {
                alert("Bạn nhập một cái tên nhé, biệt danh cũng được!");
            }
        }

        function updateStreak() {
            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");
            document.getElementById("streakCount").innerText = streak;
        }

        // Chuyển Tab
        function switchTab(evt, tabId) {
            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");
            evt.currentTarget.classList.add("active");
            
            if (tabId === "ai-chat" && document.getElementById("challengeText").innerText.includes("Đang tải")) {
                loadChallenge();
            }
        }

        // Kính lúp sự thật (AI Predict)
        async function predictAttention() {
            const event = document.getElementById("eventInput").value.trim();
            const perceived = document.getElementById("percentSlider").value;
            const resDiv = document.getElementById("aiPredictionResult");

            if (!event) {
                alert("Hãy viết ra tình huống khiến bạn bận tâm ở Phần 1 trước nhé.");
                return;
            }

            resDiv.style.display = "block";
            resDiv.innerHTML = "⏳ Kính lúp đang phân tích dữ liệu...";

            try {
                const response = await fetch("/api/predict-spotlight", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event, perceivedPercent: perceived })
                });
                const data = await response.json();

                if (data.success) {
                    resDiv.innerHTML = "<strong>🔍 Sự thật là:</strong><br>Sự chú ý THỰC TẾ từ đám đông chỉ khoảng <strong style='color:#ef4444; font-size:1.2rem;'>" + data.predictedPercent + "%</strong> (so với " + data.perceivedPercent + "% bạn tưởng tượng).<br><br>" + data.explanation;
                }
            } catch (err) {
                resDiv.innerHTML = "❌ Lỗi kết nối AI. Vui lòng kiểm tra mạng.";
            }
        }

        // Đóng sổ
        function saveJournal() {
            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");
            localStorage.setItem("spotlight_streak", streak + 1);
            updateStreak();
            alert("Trang sổ hôm nay đã được gấp lại. Cảm ơn bạn vì đã dũng cảm đối mặt với cảm xúc của chính mình!");
            document.getElementById("eventInput").value = "";
            document.getElementById("judgeInput").value = "";
            document.getElementById("proofInput").value = "";
            document.getElementById("aiPredictionResult").style.display = "none";
            document.querySelectorAll('textarea').forEach(t => t.style.height = '64px');
        }

        // Tải Thử thách
        async function loadChallenge() {
            try {
                const res = await fetch("/api/challenge");
                const data = await res.json();
                if(data.success) {
                    document.getElementById("challengeText").innerText = data.challenge;
                }
            } catch(e) {
                document.getElementById("challengeText").innerText = "Liệu hôm nay bạn có dám mỉm cười chào hỏi một người bạn mới?";
            }
        }

        // Gửi tin nhắn Chatbot
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
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: msg, userName })
                });
                const data = await res.json();
                if (data.success) {
                    chatBox.innerHTML += "<div class='chat-msg bot'>" + data.reply + "</div>";
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            } catch (err) {
                chatBox.innerHTML += "<div class='chat-msg bot'>Tớ đang gặp chút trục trặc mạng, bạn chờ tớ xíu rồi nhắn lại nhé.</div>";
            }
        }
    </script>
</body>
</html>
    `;
    res.send(htmlContent);
});

// 4. SERVER INITIALIZATION
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Spotlight Check System running on port ${PORT}`);
});
