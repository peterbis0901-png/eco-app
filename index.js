const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 1. DATABASE LƯU TRỮ TRÊN RAM (IN-MEMORY DB)
const dailyChallenges = [
    "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Liệu hôm nay bạn có dám phát biểu ý kiến của mình trong buổi họp/tiết học mà không sợ sai?",
    "Liệu hôm nay bạn có dám từ chối một yêu cầu mà bạn không muốn làm?",
    "Liệu hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn người khác?"
];

// Bức tường đồng cảm ẩn danh (Mẫu ban đầu)
let anonymousWallPosts = [
    { id: 1, author: 'Thành viên ẩn danh', text: 'Hôm qua tớ lỡ gọi lộn tên thầy giáo trong lớp. Tưởng quê lắm nhưng 5 phút sau không ai nhớ nữa!', time: '10 phút trước' },
    { id: 2, author: 'Một bạn ẩn danh', text: 'Tớ vừa thuyết trình bị vấp. Dùng tính năng AI dự đoán mới biết mọi người chỉ chú ý có 15% thôi, nhẹ cả người!', time: '1 giờ trước' }
];

// 2. BACKEND API ENDPOINTS
// API AI Chatbot
app.post('/api/chat', (req, res) => {
    try {
        const { message, userName } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Tin nhắn trống' });

        const lowerMsg = message.toLowerCase();
        let reply = `Chào ${userName || 'bạn'}! Tớ luôn ở đây lắng nghe bạn. Bạn có thể chia sẻ kỹ hơn về cảm giác lúc này không?`;

        if (lowerMsg.includes('lo') || lowerMsg.includes('sợ') || lowerMsg.includes('ngại')) {
            reply = `Tớ hiểu cảm giác của ${userName || 'bạn'}. Tâm lý con người thường phóng đại sự chú ý của đám đông (Hiệu ứng Spotlight). Thực tế mọi người đều đang bận tâm về chính họ hơn là soi xét bạn đấy!`;
        } else if (lowerMsg.includes('xấu hổ') || lowerMsg.includes('vấp') || lowerMsg.includes('sai')) {
            reply = `Ai trong chúng ta cũng có lúc vấp ngã hoặc nói hớ. Đám đông thường sẽ quên điều đó chỉ sau vài phút. Đừng quá khắt khe với bản thân nhé ${userName || ''}!`;
        } else if (lowerMsg.includes('thử thách') || lowerMsg.includes('dám')) {
            reply = `Cố lên ${userName || 'bạn'}! Bước ra khỏi vùng an toàn từng chút một là cách tuyệt vời nhất để chiến thắng sự lo âu xã hội. Tớ tin bạn làm được!`;
        }

        setTimeout(() => res.json({ success: true, reply }), 400);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
    }
});

// API AI Dự đoán Spotlight % & Tái cấu trúc tư duy (Reframing)
app.post('/api/predict-spotlight', (req, res) => {
    try {
        const { event, perceivedPercent } = req.body;
        if (!event) return res.status(400).json({ success: false, error: 'Chưa nhập nội dung sự kiện' });

        const perceived = parseInt(perceivedPercent) || 50;
        const predictedActual = Math.max(5, Math.round(perceived * 0.22 + Math.random() * 5));
        
        const explanation = `Dựa trên phân tích tâm lý lo âu xã hội, khi bạn nghĩ ${perceived}% đám đông đang soi xét, mức độ chú ý THỰC TẾ chỉ khoảng ${predictedActual}%. Đa số mọi người đều bận tâm về công việc cá nhân của họ.`;

        const reframes = [
            "1. Sự cố này chỉ là 1 khoảnh khắc nhỏ, mọi người sẽ quên ngay sau vài giờ.",
            "2. Sai sót chứng tỏ bạn đang dám thử sức và học hỏi, không ai hoàn hảo cả.",
            "3. Đám đông thường thông cảm hơn là phán xét như cách bạn đang lo sợ."
        ];

        setTimeout(() => {
            res.json({
                success: true,
                perceivedPercent: perceived,
                predictedPercent: predictedActual,
                explanation: explanation,
                reframes: reframes
            });
        }, 450);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi xử lý dự đoán' });
    }
});

// API Bức Tường Đồng Cảm (Wall)
app.get('/api/wall', (req, res) => {
    res.json({ success: true, posts: anonymousWallPosts });
});

app.post('/api/wall', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, error: 'Nội dung trống' });

    const newPost = {
        id: Date.now(),
        author: 'Thành viên ẩn danh',
        text: text,
        time: 'Vừa xong'
    };
    anonymousWallPosts.unshift(newPost);
    res.json({ success: true, post: newPost });
});

// API Thử thách
app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

// 3. FRONTEND UI & APPS
app.get('/', (req, res) => {
    const htmlContent = [
        '<!DOCTYPE html>',
        '<html lang="vi">',
        '<head>',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '    <title>Spotlight Check - Sổ Tay Phản Tư</title>',
        '    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>',
        '    <style>',
        '        :root {',
        '            --primary: #4f46e5;',
        '            --primary-light: #eef2ff;',
        '            --bg: #f8fafc;',
        '            --card-bg: #ffffff;',
        '            --text: #1e293b;',
        '            --accent: #10b981;',
        '        }',
        '        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }',
        '        body { background: var(--bg); color: var(--text); padding-bottom: 3rem; }',
        '        header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 1rem; text-align: center; position: sticky; top: 0; z-index: 10; }',
        '        .app-title { font-size: 1.4rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; }',
        '        .slogan { font-size: 0.85rem; color: #64748b; margin-top: 4px; font-style: italic; }',
        '        .container { max-width: 520px; margin: 1rem auto; padding: 0 1rem; }',
        '        .user-bar { background: #fff; padding: 0.75rem 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }',
        '        .streak-badge { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; }',
        '        .nav-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 1rem; }',
        '        .tab-btn { background: #fff; border: 1px solid #e2e8f0; padding: 0.55rem 0.2rem; border-radius: 10px; font-size: 0.72rem; font-weight: 600; cursor: pointer; text-align: center; }',
        '        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }',
        '        .tab-content { display: none; }',
        '        .tab-content.active { display: block; }',
        '        .card { background: var(--card-bg); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }',
        '        .card-title { font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px; }',
        '        label { font-size: 0.85rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.4rem; }',
        '        textarea, input[type="text"] { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1rem; outline: none; }',
        '        textarea:focus, input[type="text"]:focus { border-color: var(--primary); }',
        '        .slider-container { text-align: center; margin: 0.5rem 0; }',
        '        .slider-val { font-size: 1.2rem; font-weight: 800; color: #ef4444; }',
        '        input[type="range"] { width: 100%; accent-color: var(--primary); }',
        '        .btn { width: 100%; padding: 0.8rem; border: none; border-radius: 10px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; }',
        '        .btn-ai { background: #8b5cf6; color: #fff; font-size: 0.85rem; margin-bottom: 0.5rem; }',
        '        .btn-call { background: #ef4444; color: #fff; text-decoration: none; display: inline-block; text-align: center; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }',
        '        .btn-link { background: var(--primary); color: #fff; text-decoration: none; display: inline-block; text-align: center; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }',
        '        .chat-box { height: 260px; overflow-y: auto; border: 1px solid #f1f5f9; padding: 0.75rem; border-radius: 10px; background: #fafafa; margin-bottom: 0.75rem; }',
        '        .chat-msg { margin-bottom: 0.6rem; max-width: 85%; padding: 0.6rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; }',
        '        .chat-msg.bot { background: #e0e7ff; color: #3730a3; align-self: flex-start; }',
        '        .chat-msg.user { background: var(--primary); color: #fff; margin-left: auto; text-align: right; }',
        '        #nameModal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }',
        '        .modal-box { background: #fff; padding: 1.5rem; border-radius: 16px; width: 90%; max-width: 380px; text-align: center; }',
        '        .ai-result-box { display: none; margin-top: 0.75rem; background: #f3e8ff; border: 1px solid #d8b4fe; padding: 0.8rem; border-radius: 10px; font-size: 0.85rem; color: #581c87; line-height: 1.4; }',
        '        ',
        '        /* Breathing Circle */',
        '        .breathe-circle { width: 120px; height: 120px; background: #c7d2fe; border-radius: 50%; margin: 1.5rem auto; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #3730a3; transition: transform 4s ease-in-out; }',
        '        .breathe-circle.inhale { transform: scale(1.5); background: #818cf8; color: #fff; }',
        '        .breathe-circle.hold { transform: scale(1.5); background: #6366f1; color: #fff; }',
        '        .breathe-circle.exhale { transform: scale(1); background: #c7d2fe; color: #3730a3; }',
        '        ',
        '        /* Wall Posts */',
        '        .wall-post { background: #f8fafc; border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.6rem; font-size: 0.85rem; }',
        '        .wall-meta { font-size: 0.7rem; color: #94a3b8; margin-top: 4px; }',
        '    </style>',
        '</head>',
        '<body>',
        '    <div id="nameModal">',
        '        <div class="modal-box">',
        '            <h3 style="margin-bottom: 0.5rem;">Chào mừng bạn! 🌟</h3>',
        '            <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">Nhập tên hoặc biệt danh để bắt đầu trải nghiệm Spotlight Check.</p>',
        '            <input type="text" id="usernameInput" placeholder="Nhập tên của bạn...">',
        '            <button class="btn" onclick="saveName()">Bắt đầu ngay</button>',
        '        </div>',
        '    </div>',
        '    <header>',
        '        <div class="app-title">🔍 Spotlight Check</div>',
        '        <div class="slogan">Hôm nay bạn thế nào? Dù có vui hay buồn thì vẫn luôn có chúng tớ ở đây.</div>',
        '    </header>',
        '    <div class="container">',
        '        <div class="user-bar">',
        '            <div>Xin chào, <strong id="displayName">Bạn</strong>! 👋</div>',
        '            <div class="streak-badge">🔥 <span id="streakCount">1</span> Ngày dũng cảm</div>',
        '            <button onclick="changeName()" style="background:none; border:none; color:var(--primary); font-size:0.75rem; cursor:pointer;">Đổi tên</button>',
        '        </div>',
        '        <div class="nav-tabs">',
        '            <button class="tab-btn active" onclick="switchTab(event, \'journal\')">📖 Sổ Tay</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'breathe\')">🫁 Tập Thở</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'progress\')">📊 Tiến Trình</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'wall\')">🧱 Bức Tường</button>',
        '        </div>',
        '        <div class="nav-tabs">',
        '            <button class="tab-btn" onclick="switchTab(event, \'chatbot\')">🤖 AI Chat</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'challenge\')">🏆 Thử Thách</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'support\')" style="grid-column: span 2;">📞 Hỗ Trợ Chuyên Gia</button>',
        '        </div>',
        '        ',
        '        <!-- TAB 1: SỔ TAY PHẢN TƯ -->',
        '        <div id="journal" class="tab-content active">',
        '            <div class="card">',
        '                <div class="card-title">Phần 1: Nhìn nhận lại vấn đề</div>',
        '                <label>Sự kiện / Tình huống khiến bạn lo lắng là gì?</label>',
        '                <textarea id="eventInput" rows="2" placeholder="Ví dụ: Lỡ phát biểu vấp trong cuộc họp..."></textarea>',
        '                <label>Mọi người đang phán xét bạn thế nào?</label>',
        '                <textarea id="judgeInput" rows="2" placeholder="Tôi sợ họ nghĩ tôi kém cỏi..."></textarea>',
        '                <label>Bạn CẢM THẤY mức độ chú ý của họ là bao nhiêu %?</label>',
        '                <div class="slider-container">',
        '                    <span class="slider-val" id="percentVal">50%</span>',
        '                    <input type="range" id="percentSlider" min="0" max="100" value="50" oninput="document.getElementById(\'percentVal\').innerText = this.value + \'%\'">',
        '                </div>',
        '                <button class="btn btn-ai" onclick="predictAttention()">🔮 AI Dự Đoán & Tái Cấu Trúc Tư Duy</button>',
        '                <div id="aiPredictionResult" class="ai-result-box"></div>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title" style="color: var(--accent);">Phần 2: Kiểm chứng thực tế</div>',
        '                <label>Có bằng chứng nào cho thấy mọi người THỰC SỰ để ý đến bạn không?</label>',
        '                <textarea id="proofInput" rows="2" placeholder="Hình như không ai cười hay nói gì cả..."></textarea>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title">Phần 3: Góc nhìn mới</div>',
        '                <button class="btn" onclick="saveJournal()">Đóng Sổ Tay & Ghi Nhận Tiến Trình</button>',
        '            </div>',
        '        </div>',

        '        <!-- TAB MỚI: BÀI TẬP THỞ GROUNDING -->',
        '        <div id="breathe" class="tab-content">',
        '            <div class="card" style="text-align: center;">',
        '                <div class="card-title" style="justify-content: center;">🫁 Bài Tập Thở 4-7-8 Tháo Gỡ Lo Âu</div>',
        '                <p style="font-size:0.8rem; color:#64748b;">Dừng lại 1 phút để cân bằng hệ thần kinh trước khi viết phản tư.</p>',
        '                <div id="breatheCircle" class="breathe-circle">Sẵn sàng</div>',
        '                <div id="breatheInstruction" style="font-weight:700; color:var(--primary); margin-bottom:1rem;">Nhấn nút để bắt đầu</div>',
        '                <button class="btn" onclick="startBreathing()">Bắt đầu nhịp thở</button>',
        '            </div>',
        '        </div>',

        '        <!-- TAB MỚI: TIẾN TRÌNH & ĐỒ THỊ -->',
        '        <div id="progress" class="tab-content">',
        '            <div class="card">',
        '                <div class="card-title">📊 Đồ Thị Giải Ảo Spotlight</div>',
        '                <p style="font-size:0.75rem; color:#64748b; margin-bottom:1rem;">So sánh % Lo âu bạn nghĩ vs % Thực tế AI tính toán.</p>',
        '                <canvas id="spotlightChart" width="400" height="220"></canvas>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title">🏅 Huy Hiệu Của Bạn</div>',
        '                <div style="display:flex; gap:10px; justify-content:space-around; font-size:0.8rem; text-align:center;">',
        '                    <div style="opacity:1;">🌱<br><b>Tân Thủ</b><br><small>Viết sổ 1 lần</small></div>',
        '                    <div id="badge7" style="opacity:0.3;">🛡️<br><b>Tự Tin</b><br><small>Streak 3 ngày</small></div>',
        '                    <div id="badge21" style="opacity:0.3;">👑<br><b>Vô Cực</b><br><small>Streak 7 ngày</small></div>',
        '                </div>',
        '            </div>',
        '        </div>',

        '        <!-- TAB MỚI: BỨC TƯỜNG ĐỒNG CẢM -->',
        '        <div id="wall" class="tab-content">',
        '            <div class="card">',
        '                <div class="card-title">🧱 Bức Tường Đồng Cảm Ẩn Danh</div>',
        '                <p style="font-size:0.8rem; color:#64748b; margin-bottom:0.75rem;">Chia sẻ những khoảnh khắc lỡ lời/quê độ để giải tỏa và nhận lại sự đồng cảm.</p>',
        '                <textarea id="wallInput" rows="2" placeholder="Chia sẻ ẩn danh trải nghiệm của bạn..."></textarea>',
        '                <button class="btn" onclick="postToWall()">Đăng Lên Bức Tường</button>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title">💬 Chia Sẻ Mới Nhất</div>',
        '                <div id="wallPostsList">Đang tải bức tường...</div>',
        '            </div>',
        '        </div>',

        '        <!-- TAB 2: AI CHATBOT -->',
        '        <div id="chatbot" class="tab-content">',
        '            <div class="card">',
        '                <div class="card-title">🤖 AI Chatbot Trò Chuyện</div>',
        '                <p style="font-size:0.8rem; color:#64748b; margin-bottom:0.75rem;">Trực quan hóa & tháo gỡ sự chênh lệch giữa "tưởng tượng" và "thực tế".</p>',
        '                <div class="chat-box" id="chatBox">',
        '                    <div class="chat-msg bot">Chào bạn! Tớ là AI lắng nghe của Spotlight Check. Bạn đang bận tâm điều gì hôm nay?</div>',
        '                </div>',
        '                <div style="display:flex; gap:6px;">',
        '                    <input type="text" id="chatInput" placeholder="Nhập suy nghĩ của bạn..." style="margin-bottom:0;" onkeypress="if(event.key===\'Enter\') sendChat()">',
        '                    <button class="btn" style="width: auto; padding: 0 1rem;" onclick="sendChat()">Gửi</button>',
        '                </div>',
        '            </div>',
        '        </div>',

        '        <!-- TAB 3: THỬ THÁCH MỖI NGÀY -->',
        '        <div id="challenge" class="tab-content">',
        '            <div class="card" style="text-align: center;">',
        '                <div class="card-title" style="justify-content: center;">🏆 Thử Thách 21 Ngày</div>',
        '                <p style="font-size:0.85rem; color:#64748b; margin-bottom:1rem;">Vượt qua hiệu ứng Spotlight bằng những hành động nhỏ mỗi ngày.</p>',
        '                <div style="background: var(--primary-light); padding:1rem; border-radius:12px; margin-bottom:1rem; font-weight:600; color:var(--primary);" id="challengeText">',
        '                    Đang tải thử thách...',
        '                </div>',
        '                <button class="btn" onclick="loadChallenge()">Lấy Thử Thách Mới</button>',
        '            </div>',
        '        </div>',

        '        <!-- TAB 4: HỖ TRỢ CHUYÊN GIA -->',
        '        <div id="support" class="tab-content">',
        '            <div class="card">',
        '                <div class="card-title">🚨 Đường Dây Nóng Quốc Gia</div>',
        '                <p style="font-size:0.85rem; color:#64748b; margin-bottom:0.75rem;">Hỗ trợ khẩn cấp 24/7 về sức khỏe tinh thần và tâm lý.</p>',
        '                <a href="tel:111" class="btn-call">📞 Gọi 111 (Miễn phí)</a>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title">🩺 Phòng Tâm Lý Học Đường LTV</div>',
        '                <p style="font-size:0.85rem; color:#64748b; margin-bottom:0.75rem;">Phòng tham vấn tâm lý, hỗ trợ vượt qua lo âu xã hội.</p>',
        '                <a href="https://www.facebook.com/share/1CGCq3ZcUu/" target="_blank" class="btn-link">🔗 Kết Nối Ngay (Facebook)</a>',
        '            </div>',
        '        </div>',
        '    </div>',

        '    <script>',
        '        let chartInstance = null;',
        '        let lastPredictedVal = 15;',
        '        ',
        '        function checkUser() {',
        '            const name = localStorage.getItem("spotlight_username");',
        '            if (name) {',
        '                document.getElementById("nameModal").style.display = "none";',
        '                document.getElementById("displayName").innerText = name;',
        '            } else {',
        '                document.getElementById("nameModal").style.display = "flex";',
        '            }',
        '            updateStreak();',
        '        }',

        '        function saveName() {',
        '            const name = document.getElementById("usernameInput").value.trim();',
        '            if (name) {',
        '                localStorage.setItem("spotlight_username", name);',
        '                checkUser();',
        '            }',
        '        }',

        '        function changeName() {',
        '            localStorage.removeItem("spotlight_username");',
        '            checkUser();',
        '        }',

        '        function updateStreak() {',
        '            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");',
        '            document.getElementById("streakCount").innerText = streak;',
        '            if(streak >= 3) document.getElementById("badge7").style.opacity = "1";',
        '            if(streak >= 7) document.getElementById("badge21").style.opacity = "1";',
        '        }',

        '        function switchTab(evt, tabId) {',
        '            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));',
        '            document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));',
        '            document.getElementById(tabId).classList.add("active");',
        '            evt.currentTarget.classList.add("active");',
        '            if (tabId === "challenge") loadChallenge();',
        '            if (tabId === "wall") loadWall();',
        '            if (tabId === "progress") renderChart();',
        '        }',

        '        async function predictAttention() {',
        '            const event = document.getElementById("eventInput").value.trim();',
        '            const perceived = document.getElementById("percentSlider").value;',
        '            const resDiv = document.getElementById("aiPredictionResult");',
        '            if (!event) {',
        '                alert("Vui lòng ghi lại sự kiện bạn đang bận tâm ở Phần 1 trước nhé!");',
        '                return;',
        '            }',
        '            resDiv.style.display = "block";',
        '            resDiv.innerHTML = "⏳ AI đang phân tích và tái cấu trúc tư duy cho bạn...";',
        '            try {',
        '                const response = await fetch("/api/predict-spotlight", {',
        '                    method: "POST",',
        '                    headers: { "Content-Type": "application/json" },',
        '                    body: JSON.stringify({ event, perceivedPercent: perceived })',
        '                });',
        '                const data = await response.json();',
        '                if (data.success) {',
        '                    lastPredictedVal = data.predictedPercent;',
        '                    let reframesHTML = data.reframes.map(r => "<div style=\\"margin-top:4px;\\">" + r + "</div>").join("");',
        '                    resDiv.innerHTML = "<strong>🤖 Dự đoán từ AI:</strong><br>Chú ý THỰC TẾ chỉ khoảng <strong style=\\"color:#8b5cf6; font-size:1.1rem;\\">" + data.predictedPercent + "%</strong> (so với " + data.perceivedPercent + "% tưởng tượng).<br><br>" + data.explanation + "<br><br><strong>✨ 3 Góc Nhìn Mới (Reframing):</strong>" + reframesHTML;',
        '                }',
        '            } catch (err) {',
        '                resDiv.innerHTML = "❌ Không thể kết nối với AI. Vui lòng thử lại!";',
        '            }',
        '        }',

        '        function saveJournal() {',
        '            const perceived = parseInt(document.getElementById("percentSlider").value);',
        '            let history = JSON.parse(localStorage.getItem("spotlight_history") || "[]");',
        '            history.push({ date: "Lần " + (history.length + 1), perceived: perceived, actual: lastPredictedVal });',
        '            if(history.length > 7) history.shift();',
        '            localStorage.setItem("spotlight_history", JSON.stringify(history));',
        '            ',
        '            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");',
        '            localStorage.setItem("spotlight_streak", streak + 1);',
        '            updateStreak();',

        '            alert("Đã ghi nhận tiến trình phản tư! Bạn nhận được +1 Ngày dũng cảm.");',
        '            document.getElementById("eventInput").value = "";',
        '            document.getElementById("judgeInput").value = "";',
        '            document.getElementById("proofInput").value = "";',
        '            document.getElementById("aiPredictionResult").style.display = "none";',
        '        }',

        '        // Tap tho 4-7-8',
        '        function startBreathing() {',
        '            const circle = document.getElementById("breatheCircle");',
        '            const txt = document.getElementById("breatheInstruction");',
        '            let step = 0;',
        '            circle.className = "breathe-circle inhale";',
        '            circle.innerText = "Hít vào";',
        '            txt.innerText = "Hít vào từ từ bằng mũi (4 giây)...";',
        '            ',
        '            setTimeout(() => {',
        '                circle.className = "breathe-circle hold";',
        '                circle.innerText = "Giữ thở";',
        '                txt.innerText = "Giữ hơi thở thư giãn (7 giây)...";',
        '            }, 4000);',

        '            setTimeout(() => {',
        '                circle.className = "breathe-circle exhale";',
        '                circle.innerText = "Thở ra";',
        '                txt.innerText = "Thở ra nhẹ nhàng bằng miệng (8 giây)...";',
        '            }, 11000);',

        '            setTimeout(() => {',
        '                circle.innerText = "Hoàn thành";',
        '                txt.innerText = "Tốt lắm! Nhấn lại để tiếp tục nhịp mới.";',
        '            }, 19000);',
        '        }',

        '        // Do thi',
        '        function renderChart() {',
        '            const ctx = document.getElementById("spotlightChart").getContext("2d");',
        '            let history = JSON.parse(localStorage.getItem("spotlight_history") || "[{\\"date\\":\\"Lần 1\\",\\"perceived\\":75,\\"actual\\":18},{\\"date\\":\\"Lần 2\\",\\"perceived\\":50,\\"actual\\":12}]");',
        '            ',
        '            const labels = history.map(h => h.date);',
        '            const perceivedData = history.map(h => h.perceived);',
        '            const actualData = history.map(h => h.actual);',

        '            if (chartInstance) chartInstance.destroy();',

        '            chartInstance = new Chart(ctx, {',
        '                type: "line",',
        '                data: {',
        '                    labels: labels,',
        '                    datasets: [',
        '                        { label: "% Tưởng tượng (Lo âu)", data: perceivedData, borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)", fill: true },',
        '                        { label: "% Thực tế (AI)", data: actualData, borderColor: "#4f46e5", backgroundColor: "rgba(79, 70, 229, 0.1)", fill: true }',
        '                    ]',
        '                },',
        '                options: { responsive: true, scales: { y: { min: 0, max: 100 } } }',
        '            });',
        '        }',

        '        // Buc tuong dong cam',
        '        async function loadWall() {',
        '            const list = document.getElementById("wallPostsList");',
        '            try {',
        '                const res = await fetch("/api/wall");',
        '                const data = await res.json();',
        '                if (data.success) {',
        '                    list.innerHTML = data.posts.map(p => "<div class=\\"wall-post\\"><div>" + p.text + "</div><div class=\\"wall-meta\\">💬 " + p.author + " • " + p.time + "</div></div>").join("");',
        '                }',
        '            } catch(e) { list.innerHTML = "Khởi tạo bức tường thất bại."; }',
        '        }',

        '        async function postToWall() {',
        '            const txt = document.getElementById("wallInput").value.trim();',
        '            if (!txt) return;',
        '            try {',
        '                await fetch("/api/wall", {',
        '                    method: "POST",',
        '                    headers: { "Content-Type": "application/json" },',
        '                    body: JSON.stringify({ text: txt })',
        '                });',
        '                document.getElementById("wallInput").value = "";',
        '                loadWall();',
        '            } catch(e) { alert("Lỗi khi đăng bài!"); }',
        '        }',

        '        async function sendChat() {',
        '            const input = document.getElementById("chatInput");',
        '            const msg = input.value.trim();',
        '            if (!msg) return;',
        '            const chatBox = document.getElementById("chatBox");',
        '            chatBox.innerHTML += "<div class=\\"chat-msg user\\">" + msg + "</div>";',
        '            input.value = "";',
        '            chatBox.scrollTop = chatBox.scrollHeight;',
        '            const userName = localStorage.getItem("spotlight_username") || "Bạn";',
        '            try {',
        '                const res = await fetch("/api/chat", {',
        '                    method: "POST",',
        '                    headers: { "Content-Type": "application/json" },',
        '                    body: JSON.stringify({ message: msg, userName })',
        '                });',
        '                const data = await res.json();',
        '                if (data.success) {',
        '                    chatBox.innerHTML += "<div class=\\"chat-msg bot\\">" + data.reply + "</div>";',
        '                    chatBox.scrollTop = chatBox.scrollHeight;',
        '                }',
        '            } catch (err) {',
        '                chatBox.innerHTML += "<div class=\\"chat-msg bot\\">Lỗi kết nối. Vui lòng thử lại sau!</div>";',
        '            }',
        '        }',

        '        async function loadChallenge() {',
        '            try {',
        '                const res = await fetch("/api/challenge");',
        '                const data = await res.json();',
        '                if(data.success) {',
        '                    document.getElementById("challengeText").innerText = data.challenge;',
        '                }',
        '            } catch(e) {',
        '                document.getElementById("challengeText").innerText = "Liệu hôm nay bạn có dám mỉm cười với một người lạ?";',
        '            }',
        '        }',

        '        window.onload = checkUser;',
        '    </script>',
        '</body>',
        '</html>'
    ].join('\n');

    res.send(htmlContent);
});

// 4. SERVER INITIALIZATION
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Spotlight Check Advanced App running on port ${PORT}`);
});
