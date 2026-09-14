const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// 1. MOCK DATABASE & BACKEND LOGIC
const dailyChallenges = [
    "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Liệu hôm nay bạn có dám phát biểu ý kiến của mình trong buổi họp/tiết học mà không sợ sai?",
    "Liệu hôm nay bạn có dám từ chối một yêu cầu mà bạn không muốn làm?",
    "Liệu hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn người khác?"
];

// Backend API: Trò chuyện AI Chatbot
app.post('/api/chat', (req, res) => {
    try {
        const { message, userName } = req.body;
        if (!message) return res.status(400).json({ success: false, error: 'Tin nhắn trống' });

        const lowerMsg = message.toLowerCase();
        let reply = `Chào ${userName || 'bạn'}! Tớ luôn ở đây lắng nghe bạn. Bạn có thể chia sẻ kỹ hơn về cảm giác lúc này không?`;

        if (lowerMsg.includes('lo') || lowerMsg.includes('sợ') || lowerMsg.includes('ngại')) {
            reply = `Tớ hiểu cảm giác của ${userName || 'bạn'}. Tâm lý con người thường phóng đại sự chú ý của đám đông (Hiệu ứng Spotlight). Thực tế mọi người đều đang bận tâm về chính họ hơn là soi xét bạn đấy!`;
        } else if (lowerMsg.includes('xấu hổ') || lowerMsg.includes('vấp') || lowerMsg.includes('sai')) {
            reply = `Ai trong chúng ta cũng có lúc vấp ngã hoặc nói hớ. Đám đông thường sẽ quên điều đó chỉ sau vài phút. Đừng quá khắtkha với bản thân nhé ${userName || ''}!`;
        } else if (lowerMsg.includes('thử thách') || lowerMsg.includes('dám')) {
            reply = `Cố lên ${userName || 'bạn'}! Bước ra khỏi vùng an toàn từng chút một là cách tuyệt vời nhất để chiến thắng sự lo âu xã hội. Tớ tin bạn làm được!`;
        }

        setTimeout(() => {
            res.json({ success: true, reply });
        }, 500);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
    }
});

// Backend API: Dự đoán % Mức độ quan tâm thực tế bằng thuật toán AI tâm lý
app.post('/api/predict-spotlight', (req, res) => {
    try {
        const { event, perceivedPercent } = req.body;
        if (!event) return res.status(400).json({ success: false, error: 'Chưa nhập nội dung sự kiện' });

        const perceived = parseInt(perceivedPercent) || 50;
        // Thuật toán tâm lý: Đám đông chỉ chú ý từ 15% - 30% so với những gì cá nhân tự suy tưởng
        const predictedActual = Math.max(3, Math.round(perceived * 0.22 + Math.random() * 4));
        
        const explanation = `Dựa trên mô hình phân tích tâm lý lo âu xã hội, khi bạn cảm thấy ${perceived}% đám đông đang soi xét, thực tế mức độ chú ý THỰC TẾ chỉ khoảng ${predictedActual}%. Đa số mọi người đều bận tâm về vấn đề của chính họ và sẽ nhanh chóng quên đi sự cố của bạn.`;

        setTimeout(() => {
            res.json({
                success: true,
                perceivedPercent: perceived,
                predictedPercent: predictedActual,
                explanation: explanation
            });
        }, 450);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi xử lý dự đoán' });
    }
});

// Endpoint lấy thử thách ngẫu nhiên
app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

// 2. FRONTEND (SỔ TAY PHẢN TƯ + SPOTLIGHT CHECK + AI PREDICT)
app.get('/', (req, res) => {
    const htmlContent = [
        '<!DOCTYPE html>',
        '<html lang="vi">',
        '<head>',
        '    <meta charset="UTF-8">',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '    <title>Spotlight Check - Sổ Tay Phản Tư</title>',
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
        '        .container { max-width: 500px; margin: 1rem auto; padding: 0 1rem; }',
        '        .user-bar { background: #fff; padding: 0.75rem 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }',
        '        .nav-tabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 1.5rem; }',
        '        .tab-btn { background: #fff; border: 1px solid #e2e8f0; padding: 0.6rem 0.2rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-align: center; }',
        '        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }',
        '        .tab-content { display: none; }',
        '        .tab-content.active { display: block; }',
        '        .card { background: var(--card-bg); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }',
        '        .card-title { font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 6px; }',
        '        label { font-size: 0.85rem; font-weight: 600; color: #334155; display: block; margin-bottom: 0.4rem; }',
        '        textarea, input[type="text"] { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.9rem; margin-bottom: 1rem; outline: none; }',
        '        textarea:focus, input[type="text"]:focus { border-color: var(--primary); }',
        '        .slider-container { text-align: center; margin: 1rem 0 0.5rem 0; }',
        '        .slider-val { font-size: 1.2rem; font-weight: 800; color: #ef4444; }',
        '        input[type="range"] { width: 100%; accent-color: var(--primary); }',
        '        .btn { width: 100%; padding: 0.8rem; border: none; border-radius: 10px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; }',
        '        .btn-ai { background: #8b5cf6; color: #fff; font-size: 0.85rem; margin-bottom: 0.5rem; }',
        '        .btn-call { background: #ef4444; color: #fff; text-decoration: none; display: inline-block; text-align: center; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }',
        '        .btn-link { background: var(--primary); color: #fff; text-decoration: none; display: inline-block; text-align: center; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }',
        '        .chat-box { height: 280px; overflow-y: auto; border: 1px solid #f1f5f9; padding: 0.75rem; border-radius: 10px; background: #fafafa; margin-bottom: 0.75rem; }',
        '        .chat-msg { margin-bottom: 0.6rem; max-width: 85%; padding: 0.6rem 0.8rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; }',
        '        .chat-msg.bot { background: #e0e7ff; color: #3730a3; align-self: flex-start; }',
        '        .chat-msg.user { background: var(--primary); color: #fff; margin-left: auto; text-align: right; }',
        '        #nameModal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }',
        '        .modal-box { background: #fff; padding: 1.5rem; border-radius: 16px; width: 90%; max-width: 380px; text-align: center; }',
        '        .ai-result-box { display: none; margin-top: 0.75rem; background: #f3e8ff; border: 1px solid #d8b4fe; padding: 0.8rem; border-radius: 10px; font-size: 0.85rem; color: #581c87; line-height: 1.4; }',
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
        '            <button onclick="changeName()" style="background:none; border:none; color:var(--primary); font-size:0.8rem; cursor:pointer;">Đổi tên</button>',
        '        </div>',
        '        <div class="nav-tabs">',
        '            <button class="tab-btn active" onclick="switchTab(event, \'journal\')">📖 Sổ Tay</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'chatbot\')">🤖 AI Chat</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'challenge\')">🏆 Thử Thách</button>',
        '            <button class="tab-btn" onclick="switchTab(event, \'support\')">📞 Hỗ Trợ</button>',
        '        </div>',
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
        '                <button class="btn btn-ai" onclick="predictAttention()">🔮 AI Dự Đoán % Mức Độ Quan Tâm Thực Tế</button>',
        '                <div id="aiPredictionResult" class="ai-result-box"></div>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title" style="color: var(--accent);">Phần 2: Kiểm chứng thực tế</div>',
        '                <label>Có bằng chứng nào cho thấy mọi người THỰC SỰ để ý đến bạn không?</label>',
        '                <textarea id="proofInput" rows="2" placeholder="Hình như không ai cười hay nói gì cả..."></textarea>',
        '            </div>',
        '            <div class="card">',
        '                <div class="card-title">Phần 3: Góc nhìn mới</div>',
        '                <button class="btn" onclick="saveJournal()">Đóng Sổ Tay & Ghi Nhận</button>',
        '            </div>',
        '        </div>',
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
        '        function checkUser() {',
        '            const name = localStorage.getItem("spotlight_username");',
        '            if (name) {',
        '                document.getElementById("nameModal").style.display = "none";',
        '                document.getElementById("displayName").innerText = name;',
        '            } else {',
        '                document.getElementById("nameModal").style.display = "flex";',
        '            }',
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
        '        function switchTab(evt, tabId) {',
        '            document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));',
        '            document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));',
        '            document.getElementById(tabId).classList.add("active");',
        '            evt.currentTarget.classList.add("active");',
        '            if (tabId === "challenge") loadChallenge();',
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
        '            resDiv.innerHTML = "⏳ AI đang phân tích mức độ quan tâm thực tế của đám đông...";',
        '            try {',
        '                const response = await fetch("/api/predict-spotlight", {',
        '                    method: "POST",',
        '                    headers: { "Content-Type": "application/json" },',
        '                    body: JSON.stringify({ event, perceivedPercent: perceived })',
        '                });',
        '                const data = await response.json();',
        '                if (data.success) {',
        '                    resDiv.innerHTML = "<strong>🤖 Dự đoán từ AI:</strong><br>Mức độ chú ý THỰC TẾ của mọi người chỉ khoảng <strong style=\\"color:#8b5cf6; font-size:1.1rem;\\">" + data.predictedPercent + "%</strong> (so với " + data.perceivedPercent + "% bạn tưởng tượng).<br><br>" + data.explanation;',
        '                }',
        '            } catch (err) {',
        '                resDiv.innerHTML = "❌ Không thể kết nối với AI. Vui lòng thử lại!";',
        '            }',
        '        }',
        '        function saveJournal() {',
        '            alert("Đã lưu phản tư của bạn! Hãy thả lỏng cơ thể và nhớ rằng mọi người ít để ý tới sai sót của bạn hơn bạn nghĩ đấy.");',
        '            document.getElementById("eventInput").value = "";',
        '            document.getElementById("judgeInput").value = "";',
        '            document.getElementById("proofInput").value = "";',
        '            document.getElementById("aiPredictionResult").style.display = "none";',
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

// 3. SERVER INITIALIZATION
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Spotlight Check App running on port ${PORT}`);
});
