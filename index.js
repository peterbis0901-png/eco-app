const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 1. IN-MEMORY DATABASE & KNOWLEDGE DATASET
const dailyChallenges = [
    "Hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Hôm nay bạn có dám đưa ra ý kiến trong buổi họp/tiết học mà không lo sợ bị đánh giá?",
    "Hôm nay bạn có dám từ chối một yêu cầu mà bạn thực sự không muốn làm?",
    "Hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn của người khác?",
    "Hôm nay bạn có dám nhận lỗi một cách thẳng thắn mà không tìm cãi lý?"
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
// API AI Chatbot với Ngữ cảnh phong phú
app.post('/api/chat', (req, res) => {
    try {
        const { message, userName } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Tin nhắn trống' });

        const msg = message.toLowerCase();
        const user = userName || 'bạn';
        let reply = `Chào ${user}! Tớ luôn ở đây lắng nghe bạn. Bạn có thể chia sẻ rõ hơn về cảm giác lúc này không?`;

        if (msg.includes('sợ') || msg.includes('lo') || msg.includes('ngại') || msg.includes('đông')) {
            reply = `Tớ hiểu cảm giác lo âu này của ${user}. Não bộ chúng ta thường tự động bật chế độ đề phòng và phóng đại sự chú ý của đám đông. Thực tế là 90% mọi người xung quanh chỉ đang bận lo lắng về chính bộ dạng của họ thôi!`;
        } else if (msg.includes('quê') || msg.includes('xấu hổ') || msg.includes('sai') || msg.includes('vấp')) {
            reply = `Ai cũng từng có những khoảnh khắc nói hớ hay vấp ngã. Sự cố đó có vẻ to tát với bạn bây giờ, nhưng trong mắt người khác nó chỉ lướt qua như một cơn gió nhẹ và bị quên ngay sau vài giờ thôi ${user} à.`;
        } else if (msg.includes('cô đơn') || msg.includes('không ai') || msg.includes('từ chối')) {
            reply = `Bạn không một mình đâu ${user}. Cảm giác bị tách biệt là phản ứng tâm lý rất tự nhiên khi ta quá bận tâm đến việc phải hoàn hảo trong mắt người khác. Hãy thử mở lòng một chút nhé!`;
        } else if (msg.includes('đọc vị') || msg.includes('họ nghĩ') || msg.includes('suy nghĩ')) {
            reply = `Đừng cố "đọc suy nghĩ" của người khác nhé ${user}! Đó là một bẫy tư duy phổ biến. Chúng ta không thể biết chắc họ nghĩ gì, nhưng chắc chắn họ không dành 24/7 để đánh giá bạn đâu.`;
        }

        setTimeout(() => res.json({ success: true, reply }), 350);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi hệ thống' });
    }
});

// API AI Dự đoán & Tái cấu trúc tư duy (Reframing)
app.post('/api/predict-spotlight', (req, res) => {
    try {
        const { event, perceivedPercent } = req.body;
        if (!event) return res.status(400).json({ success: false, error: 'Chưa nhập sự kiện' });

        const perceived = parseInt(perceivedPercent) || 50;
        // Thuật toán giảm độ chú ý ảo dựa trên nghiên cứu tâm lý Spotlight Effect
        const predictedActual = Math.max(6, Math.round(perceived * 0.18 + Math.random() * 6));
        
        const explanation = `Theo thực nghiệm tâm lý xã hội, khi bạn ngỡ như có ${perceived}% ánh nhìn hướng về mình, mức độ chú ý THỰC TẾ từ đám đông chỉ đạt khoảng ${predictedActual}%. Đa số mọi người đang bị cuốn vào luồng suy nghĩ riêng của họ.`;

        const reframes = [
            `1. Góc nhìn thực tế: Sự cố này chỉ kéo dài vài giây, người khác sẽ quên ngay khi họ mở điện thoại ra xem tin tức.`,
            `2. Tái định khung: Sai sót là minh chứng bạn đang dũng cảm thử thách bản thân, không phải dấu hiệu của sự kém cỏi.`,
            `3. Sự đồng cảm: Đám đông thường có xu hướng bỏ qua hoặc thông cảm hơn là phán xét gắt gao như bạn lo sợ.`,
            `4. Bài học nhỏ: Bạn có nhớ lần gần nhất một người bạn lỡ lời là khi nào không? Nếu bạn quên rồi, họ cũng sẽ quên bạn như vậy!`
        ];

        setTimeout(() => {
            res.json({
                success: true,
                perceivedPercent: perceived,
                predictedPercent: predictedActual,
                explanation: explanation,
                reframes: reframes
            });
        }, 400);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi tính toán AI' });
    }
});

// API Bức tường đồng cảm (Anonymous Wall Feed)
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
        res.status(500).json({ success: false, error: 'Lỗi đăng bài' });
    }
});

// API Thử thách
app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

// 3. FRONTEND SINGLE PAGE APPLICATION (SPA)
app.get('/', (req, res) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotlight Check - Chữa Lành Lo Âu Xã Hội</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {
            --primary: #0d9488;
            --primary-light: #ccfbf1;
            --accent: #6366f1;
            --accent-light: #e0e7ff;
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --text: #334155;
            --text-muted: #64748b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { background: var(--bg); color: var(--text); padding-bottom: 3rem; }
        
        /* Aura Splash Loading Screen */
        #splashLoader {
            position: fixed; top:0; left:0; width:100vw; height:100vh;
            background: #0f172a; display: flex; flex-direction: column;
            justify-content: center; align-items: center; z-index: 9999;
            transition: opacity 0.6s ease, visibility 0.6s;
        }
        .aura-circle {
            width: 130px; height: 130px; border-radius: 50%;
            background: radial-gradient(circle, rgba(45,212,191,0.8) 0%, rgba(99,102,241,0.4) 70%, rgba(15,23,42,0) 100%);
            animation: auraPulse 3s infinite ease-in-out;
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; color: #fff; margin-bottom: 1.5rem;
            box-shadow: 0 0 40px rgba(45,212,191,0.4);
        }
        @keyframes auraPulse {
            0%, 100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 20px rgba(45,212,191,0.3); }
            50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 50px rgba(99,102,241,0.6); }
        }
        .splash-msg { color: #cbd5e1; font-size: 0.95rem; font-style: italic; text-align: center; max-width: 80%; }

        header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 1.2rem 1rem; text-align: center; position: sticky; top: 0; z-index: 10; }
        .app-title { font-size: 1.35rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .slogan { font-size: 0.82rem; color: var(--text-muted); margin-top: 4px; font-style: italic; }
        
        .container { max-width: 540px; margin: 1rem auto; padding: 0 1rem; }
        .user-bar { background: #fff; padding: 0.85rem 1.2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
        .streak-badge { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 3px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 700; }
        
        .nav-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 0.75rem; }
        .tab-btn { background: #fff; border: 1px solid #e2e8f0; padding: 0.6rem 0.2rem; border-radius: 12px; font-size: 0.73rem; font-weight: 600; cursor: pointer; text-align: center; color: var(--text-muted); transition: all 0.2s; }
        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); font-weight: 700; }
        
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        
        .card { background: var(--card-bg); border-radius: 20px; padding: 1.35rem; margin-bottom: 1.25rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
        .card-title { font-size: 0.98rem; font-weight: 700; color: var(--primary); margin-bottom: 0.85rem; display: flex; align-items: center; gap: 6px; }
        
        label { font-size: 0.83rem; font-weight: 600; color: #475569; display: block; margin-bottom: 0.4rem; }
        textarea, input[type="text"] { width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 0.88rem; margin-bottom: 0.9rem; outline: none; transition: border 0.2s; }
        textarea:focus, input[type="text"]:focus { border-color: var(--primary); }
        
        .slider-container { text-align: center; margin: 0.6rem 0 1rem 0; }
        .slider-val { font-size: 1.25rem; font-weight: 800; color: #ef4444; }
        input[type="range"] { width: 100%; accent-color: var(--primary); }
        
        .btn { width: 100%; padding: 0.85rem; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; transition: opacity 0.2s; font-size: 0.9rem; }
        .btn:hover { opacity: 0.92; }
        .btn-ai { background: var(--accent); color: #fff; margin-bottom: 0.6rem; }
        .btn-call { background: #ef4444; color: #fff; text-decoration: none; display: block; text-align: center; padding: 0.7rem; border-radius: 10px; font-weight: 700; font-size: 0.88rem; }
        .btn-link { background: var(--primary); color: #fff; text-decoration: none; display: block; text-align: center; padding: 0.7rem; border-radius: 10px; font-weight: 700; font-size: 0.88rem; }
        
        .chat-box { height: 270px; overflow-y: auto; border: 1px solid #f1f5f9; padding: 0.8rem; border-radius: 12px; background: #fafafa; margin-bottom: 0.75rem; }
        .chat-msg { margin-bottom: 0.65rem; max-width: 88%; padding: 0.65rem 0.85rem; border-radius: 14px; font-size: 0.84rem; line-height: 1.45; }
        .chat-msg.bot { background: var(--accent-light); color: #3730a3; border-bottom-left-radius: 2px; }
        .chat-msg.user { background: var(--primary); color: #fff; margin-left: auto; border-bottom-right-radius: 2px; }
        
        #nameModal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.6); display: flex; justify-content: center; align-items: center; z-index: 100; }
        .modal-box { background: #fff; padding: 1.75rem; border-radius: 20px; width: 90%; max-width: 380px; text-align: center; }
        .ai-result-box { display: none; margin-top: 0.85rem; background: #f3e8ff; border: 1px solid #d8b4fe; padding: 0.9rem; border-radius: 12px; font-size: 0.84rem; color: #581c87; line-height: 1.45; }
        
        /* Breathing Circle */
        .breathe-circle { width: 130px; height: 130px; background: #c7d2fe; border-radius: 50%; margin: 1.5rem auto; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #3730a3; transition: transform 4s ease-in-out, background-color 4s ease-in-out; }
        .breathe-circle.inhale { transform: scale(1.45); background: #818cf8; color: #fff; }
        .breathe-circle.hold { transform: scale(1.45); background: #6366f1; color: #fff; }
        .breathe-circle.exhale { transform: scale(1); background: #c7d2fe; color: #3730a3; }
        
        /* Wall Posts */
        .wall-post { background: #f8fafc; border-left: 4px solid var(--primary); padding: 0.8rem; border-radius: 8px; margin-bottom: 0.65rem; font-size: 0.85rem; }
        .wall-meta { font-size: 0.72rem; color: var(--text-muted); margin-top: 6px; }
    </style>
</head>
<body>
    <!-- Aura Splash Loading Screen -->
    <div id="splashLoader">
        <div class="aura-circle">🧘</div>
        <div class="splash-msg" id="splashMsg">Đang kết nối không gian an toàn...</div>
    </div>

    <!-- Modal Tên Người Dùng -->
    <div id="nameModal">
        <div class="modal-box">
            <h3 style="margin-bottom: 0.5rem; color:var(--primary);">Chào mừng bạn! 🌟</h3>
            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.2rem;">Nhập tên hoặc biệt danh để bắt đầu hành trình giải tỏa lo âu.</p>
            <input type="text" id="usernameInput" placeholder="Tên hoặc biệt danh của bạn...">
            <button class="btn" onclick="saveName()">Bắt đầu ngay</button>
        </div>
    </div>

    <header>
        <div class="app-title">🔍 Spotlight Check</div>
        <div class="slogan">Hôm nay bạn thế nào? Dù vui hay buồn, tớ vẫn luôn ở đây cùng bạn.</div>
    </header>

    <div class="container">
        <div class="user-bar">
            <div>Xin chào, <strong id="displayName" style="color:var(--primary);">Bạn</strong>! 👋</div>
            <div class="streak-badge">🔥 <span id="streakCount">1</span> Ngày dũng cảm</div>
            <button onclick="changeName()" style="background:none; border:none; color:var(--primary); font-size:0.75rem; cursor:pointer; text-decoration:underline;">Đổi tên</button>
        </div>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab(event, 'journal')">📖 Sổ Tay</button>
            <button class="tab-btn" onclick="switchTab(event, 'breathe')">🫁 Tập Thở</button>
            <button class="tab-btn" onclick="switchTab(event, 'progress')">📊 Tiến Trình</button>
            <button class="tab-btn" onclick="switchTab(event, 'wall')">🧱 Bức Tường</button>
        </div>
        <div class="nav-tabs">
            <button class="tab-btn" onclick="switchTab(event, 'chatbot')">🤖 AI Chat</button>
            <button class="tab-btn" onclick="switchTab(event, 'challenge')">🏆 Thử Thách</button>
            <button class="tab-btn" onclick="switchTab(event, 'support')" style="grid-column: span 2;">📞 Hỗ Trợ Chuyên Gia</button>
        </div>
        
        <!-- TAB 1: SỔ TAY PHẢN TƯ -->
        <div id="journal" class="tab-content active">
            <div class="card">
                <div class="card-title">Phần 1: Nhìn nhận lại vấn đề</div>
                <label>Sự kiện / Tình huống khiến bạn lo lắng là gì?</label>
                <textarea id="eventInput" rows="2" placeholder="Ví dụ: Lỡ nói vấp trong buổi thuyết trình..."></textarea>
                <label>Bạn nghĩ mọi người đang phán xét bạn thế nào?</label>
                <textarea id="judgeInput" rows="2" placeholder="Tớ sợ họ nghĩ tớ kém cỏi và không chuẩn bị bài..."></textarea>
                <label>Bạn CẢM THẤY mức độ chú ý của họ là bao nhiêu %?</label>
                <div class="slider-container">
                    <span class="slider-val" id="percentVal">50%</span>
                    <input type="range" id="percentSlider" min="0" max="100" value="50" oninput="document.getElementById('percentVal').innerText = this.value + '%'">
                </div>
                <button class="btn btn-ai" onclick="predictAttention()">🔮 AI Dự Đoán & Tái Cấu Trúc Tư Duy</button>
                <div id="aiPredictionResult" class="ai-result-box"></div>
            </div>
            <div class="card">
                <div class="card-title" style="color: #10b981;">Phần 2: Kiểm chứng thực tế</div>
                <label>Có bằng chứng thực tế nào cho thấy họ thực sự chú ý đến bạn không?</label>
                <textarea id="proofInput" rows="2" placeholder="Ví dụ: Sau đó mọi người vẫn hỏi đáp bình thường, không ai nhắc lại..."></textarea>
            </div>
            <div class="card">
                <div class="card-title" style="color: var(--accent);">Phần 3: Ghi nhận & Lưu tiến trình</div>
                <button class="btn" onclick="saveJournal()">Đóng Sổ Tay & Cập Nhật Đồ Thị</button>
            </div>
        </div>

        <!-- TAB 2: BÀI TẬP THỞ GROUNDING -->
        <div id="breathe" class="tab-content">
            <div class="card" style="text-align: center;">
                <div class="card-title" style="justify-content: center;">🫁 Bài Tập Thở 4-7-8 Giải Trừ Lo Âu</div>
                <p style="font-size:0.8rem; color:#64748b; margin-bottom:1rem;">Dừng lại 1 phút để đưa hệ thần kinh về trạng thái cân bằng trước khi phản tư.</p>
                <div id="breatheCircle" class="breathe-circle">Sẵn sàng</div>
                <div id="breatheInstruction" style="font-weight:700; color:var(--primary); margin-bottom:1.2rem;">Nhấn nút để bắt đầu nhịp thở</div>
                <button class="btn" onclick="startBreathing()">Bắt đầu nhịp thở</button>
            </div>
        </div>

        <!-- TAB 3: TIẾN TRÌNH & ĐỒ THỊ TRỰC TIẾP -->
        <div id="progress" class="tab-content">
            <div class="card">
                <div class="card-title">📊 Đồ Thị Giải Ảo Spotlight</div>
                <p style="font-size:0.78rem; color:#64748b; margin-bottom:1rem;">So sánh mức độ Lo âu tưởng tượng vs Thực tế được AI tính toán qua các lần viết sổ.</p>
                <canvas id="spotlightChart" width="400" height="230"></canvas>
            </div>
            <div class="card">
                <div class="card-title">🏅 Huy Hiệu Dũng Cảm</div>
                <div style="display:flex; gap:10px; justify-content:space-around; font-size:0.8rem; text-align:center;">
                    <div style="opacity:1;">🌱<br><b>Tân Thủ</b><br><small>Viết sổ 1 lần</small></div>
                    <div id="badge3" style="opacity:0.3;">🛡️<br><b>Tự Tin</b><br><small>Streak 3 ngày</small></div>
                    <div id="badge7" style="opacity:0.3;">👑<br><b>Vô Cực</b><br><small>Streak 7 ngày</small></div>
                </div>
            </div>
        </div>

        <!-- TAB 4: BỨC TƯỜNG ĐỒNG CẢMẨN DẠNH -->
        <div id="wall" class="tab-content">
            <div class="card">
                <div class="card-title">🧱 Bức Tường Đồng Cảm Ẩn Danh</div>
                <p style="font-size:0.8rem; color:#64748b; margin-bottom:0.75rem;">Đăng tải những trải nghiệm lỡ lời/quê độ để giải tỏa và nhận lại sự đồng cảm từ cộng đồng.</p>
                <textarea id="wallInput" rows="2" placeholder="Chia sẻ ẩn danh khoảnh khắc bạn từng lo lắng..."></textarea>
                <button class="btn" onclick="postToWall()">Đăng Bài Lên Bức Tường</button>
            </div>
            <div class="card">
                <div class="card-title">💬 Chia Sẻ Mới Nhất</div>
                <div id="wallPostsList">Đang tải nội dung bức tường...</div>
            </div>
        </div>

        <!-- TAB 5: AI CHATBOT -->
        <div id="chatbot" class="tab-content">
            <div class="card">
                <div class="card-title">🤖 AI Chatbot Trò Chuyện Tâm Lý</div>
                <p style="font-size:0.8rem; color:#64748b; margin-bottom:0.75rem;">Không gian trải lòng 1-1 không phán xét, tháo gỡ lo âu tức thì.</p>
                <div class="chat-box" id="chatBox">
                    <div class="chat-msg bot">Chào bạn! Tớ là AI lắng nghe của Spotlight Check. Có điều gì đang làm bạn bận tâm hôm nay không?</div>
                </div>
                <div style="display:flex; gap:6px;">
                    <input type="text" id="chatInput" placeholder="Nhập suy nghĩ của bạn..." style="margin-bottom:0;" onkeypress="if(event.key==='Enter') sendChat()">
                    <button class="btn" style="width: auto; padding: 0 1.2rem;" onclick="sendChat()">Gửi</button>
                </div>
            </div>
        </div>

        <!-- TAB 6: THỬ THÁCH MỖI NGÀY -->
        <div id="challenge" class="tab-content">
            <div class="card" style="text-align: center;">
                <div class="card-title" style="justify-content: center;">🏆 Thử Thách Dũng Cảm Mỗi Ngày</div>
                <p style="font-size:0.83rem; color:#64748b; margin-bottom:1rem;">Từng bước nhỏ vượt qua hiệu ứng Spotlight bằng hành động thực tế.</p>
                <div style="background: var(--primary-light); padding:1.1rem; border-radius:14px; margin-bottom:1.2rem; font-weight:600; color:var(--primary); font-size:0.92rem;" id="challengeText">
                    Đang tải thử thách hôm nay...
                </div>
                <button class="btn" onclick="loadChallenge()">Lấy Thử Thách Khác</button>
            </div>
        </div>

        <!-- TAB 7: HỖ TRỢ CHUYÊN GIA -->
        <div id="support" class="tab-content">
            <div class="card">
                <div class="card-title">🚨 Đường Dây Nóng Quốc Gia</div>
                <p style="font-size:0.83rem; color:#64748b; margin-bottom:0.8rem;">Hỗ trợ khẩn cấp 24/7 về sức khỏe tinh thần và bảo vệ tâm lý.</p>
                <a href="tel:111" class="btn-call">📞 Gọi 111 (Miễn phí)</a>
            </div>
            <div class="card">
                <div class="card-title">🩺 Phòng Tham Vấn Tâm Lý LTV</div>
                <p style="font-size:0.83rem; color:#64748b; margin-bottom:0.8rem;">Hỗ trợ tư vấn chuyên sâu vượt qua lo âu xã hội & nâng cao tự tin.</p>
                <a href="https://www.facebook.com/share/1CGCq3ZcUu/" target="_blank" class="btn-link">🔗 Kết Nối Ngay (Facebook)</a>
            </div>
        </div>
    </div>

    <script>
        let chartInstance = null;
        let lastPredictedVal = 15;

        // An Aura Loading Screen khi vao app
        window.addEventListener('DOMContentLoaded', () => {
            const affirmations = ${JSON.stringify(loadingAffirmations)};
            const randomMsg = affirmations[Math.floor(Math.random() * affirmations.length)];
            document.getElementById('splashMsg').innerText = randomMsg;

            setTimeout(() => {
                const splash = document.getElementById('splashLoader');
                splash.style.opacity = '0';
                setTimeout(() => splash.style.visibility = 'hidden', 600);
            }, 2200);

            checkUser();
        });

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
            }
        }

        function changeName() {
            localStorage.removeItem("spotlight_username");
            checkUser();
        }

        function updateStreak() {
            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");
            document.getElementById("streakCount").innerText = streak;
            if(streak >= 3) document.getElementById("badge3").style.opacity = "1";
            if(streak >= 7) document.getElementById("badge7").style.opacity = "1";
        }

        function switchTab(evt, tabId) {
            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
            document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");
            evt.currentTarget.classList.add("active");
            
            if (tabId === "challenge") loadChallenge();
            if (tabId === "wall") loadWall();
            if (tabId === "progress") renderChart();
        }

        async function predictAttention() {
            const event = document.getElementById("eventInput").value.trim();
            const perceived = document.getElementById("percentSlider").value;
            const resDiv = document.getElementById("aiPredictionResult");

            if (!event) {
                alert("Vui lòng nhập tình huống khiến bạn bận tâm ở Phần 1 trước nhé!");
                return;
            }

            resDiv.style.display = "block";
            resDiv.innerHTML = "⏳ AI đang phân tích dữ liệu và tái cấu trúc tư duy cho bạn...";

            try {
                const response = await fetch("/api/predict-spotlight", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ event, perceivedPercent: perceived })
                });
                const data = await response.json();

                if (data.success) {
                    lastPredictedVal = data.predictedPercent;
                    let reframesHTML = data.reframes.map(r => "<div style='margin-top:5px;'>" + r + "</div>").join("");
                    
                    resDiv.innerHTML = "<strong>🤖 Phân tích từ AI:</strong><br>Chú ý THỰC TẾ từ đám đông chỉ khoảng <strong style='color:#6366f1; font-size:1.15rem;'>" + data.predictedPercent + "%</strong> (so với " + data.perceivedPercent + "% lo âu tưởng tượng).<br><br>" + data.explanation + "<br><br><strong>✨ Góc Nhìn Tái Cấu Trúc (CBT Reframing):</strong>" + reframesHTML;
                }
            } catch (err) {
                resDiv.innerHTML = "❌ Không thể kết nối với AI. Vui lòng kiểm tra lại mạng!";
            }
        }

        function saveJournal() {
            const perceived = parseInt(document.getElementById("percentSlider").value);
            let history = JSON.parse(localStorage.getItem("spotlight_history") || "[]");
            
            history.push({ 
                date: "Lần " + (history.length + 1), 
                perceived: perceived, 
                actual: lastPredictedVal 
            });

            if(history.length > 7) history.shift();
            localStorage.setItem("spotlight_history", JSON.stringify(history));
            
            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");
            localStorage.setItem("spotlight_streak", streak + 1);
            updateStreak();

            alert("Đã ghi nhận tiến trình! Đồ thị phản tư đã được cập nhật trực tiếp.");
            
            document.getElementById("eventInput").value = "";
            document.getElementById("judgeInput").value = "";
            document.getElementById("proofInput").value = "";
            document.getElementById("aiPredictionResult").style.display = "none";

            // Cap nhat lai do thi ngay lap tuc
            renderChart();
        }

        // Bài tập thở 4-7-8
        function startBreathing() {
            const circle = document.getElementById("breatheCircle");
            const txt = document.getElementById("breatheInstruction");
            
            circle.className = "breathe-circle inhale";
            circle.innerText = "Hít vào";
            txt.innerText = "Hít vào từ từ bằng mũi (4 giây)...";
            
            setTimeout(() => {
                circle.className = "breathe-circle hold";
                circle.innerText = "Giữ thở";
                txt.innerText = "Giữ hơi thở thư giãn (7 giây)...";
            }, 4000);

            setTimeout(() => {
                circle.className = "breathe-circle exhale";
                circle.innerText = "Thở ra";
                txt.innerText = "Thở ra nhẹ nhàng bằng miệng (8 giây)...";
            }, 11000);

            setTimeout(() => {
                circle.innerText = "Hoàn thành";
                txt.innerText = "Tốt lắm! Bấm lại để tiếp tục một nhịp thở mới.";
            }, 19000);
        }

        // Đồ thị Chart.js Cập nhật Trực tiếp
        function renderChart() {
            const ctx = document.getElementById("spotlightChart").getContext("2d");
            let history = JSON.parse(localStorage.getItem("spotlight_history") || "[{\\"date\\":\\"Lần 1\\",\\"perceived\\":75,\\"actual\\":18},{\\"date\\":\\"Lần 2\\",\\"perceived\\":55,\\"actual\\":14}]");
            
            const labels = history.map(h => h.date);
            const perceivedData = history.map(h => h.perceived);
            const actualData = history.map(h => h.actual);

            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        { label: "% Tưởng tượng (Lo âu)", data: perceivedData, borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)", fill: true, tension: 0.3 },
                        { label: "% Thực tế (AI tính toán)", data: actualData, borderColor: "#0d9488", backgroundColor: "rgba(13, 148, 136, 0.1)", fill: true, tension: 0.3 }
                    ]
                },
                options: { 
                    responsive: true, 
                    scales: { y: { min: 0, max: 100 } },
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        // Bức tường đồng cảm - Tải & Đăng bài trực tiếp
        async function loadWall() {
            const list = document.getElementById("wallPostsList");
            try {
                const res = await fetch("/api/wall");
                const data = await res.json();
                if (data.success) {
                    list.innerHTML = data.posts.map(p => "<div class='wall-post'><div>" + p.text + "</div><div class='wall-meta'>💬 " + p.author + " • " + p.time + "</div></div>").join("");
                }
            } catch(e) { 
                list.innerHTML = "Không thể tải nội dung bức tường."; 
            }
        }

        async function postToWall() {
            const txt = document.getElementById("wallInput").value.trim();
            if (!txt) {
                alert("Vui lòng nhập nội dung chia sẻ!");
                return;
            }
            try {
                const res = await fetch("/api/wall", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: txt })
                });
                const data = await res.json();
                if (data.success) {
                    document.getElementById("wallInput").value = "";
                    loadWall(); // Tải lại feed trực tiếp
                }
            } catch(e) { 
                alert("Không thể đăng bài. Vui lòng thử lại!"); 
            }
        }

        // AI Chatbot
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
                chatBox.innerHTML += "<div class='chat-msg bot'>Rất tiếc, đã có lỗi kết nối. Bạn thử lại nhé!</div>";
            }
        }

        // Thử thách
        async function loadChallenge() {
            try {
                const res = await fetch("/api/challenge");
                const data = await res.json();
                if(data.success) {
                    document.getElementById("challengeText").innerText = data.challenge;
                }
            } catch(e) {
                document.getElementById("challengeText").innerText = "Hôm nay bạn có dám mỉm cười chào hỏi một người bạn mới?";
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
