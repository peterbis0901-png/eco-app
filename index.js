const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// ==========================================
// 1. DATABASE TẠM (IN-MEMORY) & DATASET
// ==========================================

const dailyChallenges = [
    "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Liệu hôm nay bạn có dám đưa ra ý kiến mà không lo sợ bị đánh giá?",
    "Liệu hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn?"
];

let anonymousWallPosts = [
    { id: 1, author: 'Thành viên ẩn danh', text: 'Hôm nay tớ lỡ gọi lộn tên đồng nghiệp. Tưởng quê lắm nhưng 5 phút sau mọi người quên hết sạch!', time: '10 phút trước' },
    { id: 2, author: 'Ẩn danh 082', text: 'Vừa thuyết trình bị vấp từ. Nhờ tập thở mà tớ đã bình tĩnh lại được.', time: '1 giờ trước' }
];

// --- KỊCH BẢN CHATBOT AI (Cập nhật theo yêu cầu) ---
const botOpenings = [
    "Hôm nay có chuyện gì khiến bạn thấy không thoải mái không?",
    "Điều gì đang khiến bạn suy nghĩ nhiều nhất lúc này?",
    "Có chuyện gì bạn muốn kể cho mình nghe không?",
    "Dạo này bạn có đang lo lắng về điều gì không?",
    "Bạn đang cảm thấy thế nào ngay lúc này?",
    "Có điều gì đang khiến bạn tự ti hoặc ngại ngùng không?",
    "Bạn có đang cảm thấy mọi người chú ý đến mình nhiều hơn bình thường không?",
    "Có khoảnh khắc nào gần đây khiến bạn cứ nghĩ mãi không?",
    "Điều gì khiến bạn cảm thấy áp lực nhất?",
    "Bạn đang lo người khác sẽ nghĩ gì về mình à?",
    "Có chuyện gì bạn muốn được nhìn nhận theo một cách nhẹ nhàng hơn không?",
    "Bạn muốn mình lắng nghe, an ủi hay cùng bạn tìm cách giải quyết?",
    "Nếu được nói thật lòng, điều gì đang khiến bạn khó chịu nhất?",
    "Bạn có đang tự trách mình vì một chuyện vừa xảy ra không?",
    "Bạn muốn bắt đầu kể từ đâu cũng được, mình đang nghe đây"
];

const botResponses = {
    loi_sai: [
        "Mình biết bạn cứ nghĩ mãi về chuyện đó, nhưng có thể người khác đã quên từ lâu rồi.",
        "Một khoảnh khắc sai không đáng để bạn mang theo cả ngày đâu. 🫂",
        "Bạn nhớ chuyện đó vì nó xảy ra với bạn, còn với người khác, có thể nó chỉ là một khoảnh khắc rất bình thường."
    ],
    truoc_lop: [
        "Ôi, chắc lúc đó bạn ngại lắm nhỉ… Nhưng trả lời sai không có nghĩa là bạn không giỏi.",
        "Bạn đã đủ can đảm để giơ tay và thử rồi. Điều đó đáng ghi nhận mà.",
        "Lần sau mình thử lại nhé. Sai một lần không có nghĩa lần sau cũng sẽ sai."
    ],
    bi_nhin: [
        "Cảm giác ấy thật lắm, nhưng chưa chắc mọi ánh mắt đều đang hướng về bạn đâu.",
        "Mỗi người đều đang có câu chuyện riêng trong đầu. Bạn không phải tâm điểm của mọi thứ đâu."
    ],
    ngoai_hinh: [
        "Bạn đang nhìn bản thân bằng ánh mắt nghiêm khắc hơn rất nhiều so với người khác đấy.",
        "Một bộ quần áo không quyết định giá trị của bạn.",
        "Bạn không cần phải trông hoàn hảo mới có thể tự tin bước ra ngoài."
    ]
};

// Hàm lấy câu trả lời ngẫu nhiên từ mảng
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// 2. BACKEND API ENDPOINTS
// ==========================================

app.post('/api/chat/init', (req, res) => {
    res.json({ success: true, message: getRandom(botOpenings) });
});

app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;
        const msg = message.toLowerCase();
        let reply = "Mình luôn ở đây lắng nghe. Bạn cứ chia sẻ thêm nhé, mọi cảm xúc của bạn đều hợp lệ.";

        // Logic "bắt bệnh" từ khóa (Keyword matching)
        if (msg.includes('lớp') || msg.includes('phát biểu') || msg.includes('cô giáo') || msg.includes('thầy')) {
            reply = getRandom(botResponses.truoc_lop);
        } else if (msg.includes('ngoại hình') || msg.includes('quần áo') || msg.includes('mặc') || msg.includes('xấu')) {
            reply = getRandom(botResponses.ngoai_hinh);
        } else if (msg.includes('nhìn') || msg.includes('ánh mắt') || msg.includes('chú ý')) {
            reply = getRandom(botResponses.bi_nhin);
        } else if (msg.includes('sai') || msg.includes('lỗi') || msg.includes('nhớ') || msg.includes('ám ảnh')) {
            reply = getRandom(botResponses.loi_sai);
        }

        setTimeout(() => res.json({ success: true, reply }), 400); // Giả lập độ trễ AI
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi hệ thống' });
    }
});

app.get('/api/challenge', (req, res) => {
    res.json({ success: true, challenge: getRandom(dailyChallenges) });
});

app.get('/api/wall', (req, res) => res.json({ success: true, posts: anonymousWallPosts }));

app.post('/api/wall', (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false });
    const newPost = { id: Date.now(), author: `Ẩn danh #${Math.floor(100 + Math.random() * 900)}`, text: text.trim(), time: 'Vừa xong' };
    anonymousWallPosts.unshift(newPost);
    res.json({ success: true, post: newPost });
});

// ==========================================
// 3. FRONTEND (GIAO DIỆN)
// ==========================================
app.get('/', (req, res) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotlight Check - Nơi an toàn của bạn</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        :root { --primary: #5b21b6; --bg: #f9f8f6; --text: #374151; --paper: #ffffff; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }
        body { background: var(--bg); color: var(--text); padding-bottom: 3rem; }
        
        header { background: #fff; padding: 1.5rem 1rem; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .app-title { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        
        .container { max-width: 600px; margin: 1.5rem auto; padding: 0 1rem; }
        
        /* Navbar Tabs */
        .nav-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; justify-content: center; }
        .tab-btn { background: #fff; border: 1px solid #e5e7eb; padding: 0.6rem 1rem; border-radius: 20px; font-weight: 700; cursor: pointer; color: #6b7280; }
        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
        .tab-content { display: none; animation: fadeIn 0.3s; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* Card chung */
        .card { background: var(--paper); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
        .btn { width: 100%; padding: 1rem; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; margin-top: 10px;}
        
        /* Module: Tiến trình */
        .progress-bar { background: #e5e7eb; height: 10px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { background: #10b981; height: 100%; width: 0%; transition: width 0.5s; }

        /* Module: Tập thở */
        .breathe-container { text-align: center; padding: 3rem 0; }
        .circle { width: 150px; height: 150px; border-radius: 50%; background: rgba(91, 33, 182, 0.2); margin: 0 auto; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); animation: breathe 8s infinite ease-in-out; border: 4px solid var(--primary); }
        @keyframes breathe {
            0%, 100% { transform: scale(1); background: rgba(91, 33, 182, 0.1); }
            50% { transform: scale(1.6); background: rgba(91, 33, 182, 0.4); }
        }
        .breathe-text::after { content: 'Hít vào...'; animation: textChange 8s infinite; }
        @keyframes textChange { 0%, 45% { content: 'Hít vào...'; } 50%, 100% { content: 'Thở ra...'; } }

        /* Module: Bức tường */
        .wall-input { width: 100%; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; resize: none; margin-bottom: 10px; font-family: inherit; }
        .wall-post { border-bottom: 1px dashed #e5e7eb; padding: 10px 0; }
        .wall-post:last-child { border-bottom: none; }
        
        /* Module: Chat AI & Thử thách */
        .challenge-box { background: #fff7ed; border-left: 4px solid #ea580c; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; }
        .chat-box { height: 300px; overflow-y: auto; background: #fdfaf6; padding: 1rem; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 10px; }
        .msg { margin-bottom: 10px; max-width: 85%; padding: 10px 15px; border-radius: 15px; font-size: 0.95rem; line-height: 1.4; }
        .msg.bot { background: #fff; border: 1px solid #e5e7eb; border-bottom-left-radius: 2px; }
        .msg.user { background: var(--primary); color: #fff; margin-left: auto; border-bottom-right-radius: 2px; }
        .chat-input { display: flex; gap: 5px; }
        .chat-input input { flex: 1; padding: 0.8rem; border: 1px solid #e5e7eb; border-radius: 20px; outline: none; }
        .chat-input button { width: auto; padding: 0 1.5rem; border-radius: 20px; margin-top: 0; }
    </style>
</head>
<body>
    <header>
        <div class="app-title">Spotlight Check</div>
        <p style="font-size: 0.9rem; color: #6b7280; margin-top: 5px;">Hôm nay bạn thế nào? Chúng tớ luôn ở đây.</p>
    </header>

    <div class="container">
        <!-- Điều hướng -->
        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab(event, 'tab-progress')">Tiến Trình</button>
            <button class="tab-btn" onclick="switchTab(event, 'tab-breathe')">Tập Thở</button>
            <button class="tab-btn" onclick="switchTab(event, 'tab-wall')">Bức Tường</button>
            <button class="tab-btn" onclick="switchTab(event, 'tab-ai')">Chat AI & Thử Thách</button>
        </div>

        <!-- 1. TIẾN TRÌNH -->
        <div id="tab-progress" class="tab-content active card">
            <h3 style="color:var(--primary);">🔥 Chuỗi ngày dũng cảm</h3>
            <p style="margin: 10px 0; color: #4b5563;">Bạn đã duy trì được <strong id="streakTxt">0</strong> ngày liên tiếp đối mặt với nỗi sợ.</p>
            <div class="progress-bar"><div class="progress-fill" id="streakFill"></div></div>
            <button class="btn" onclick="checkIn()">Điểm danh hôm nay</button>
        </div>

        <!-- 2. TẬP THỞ -->
        <div id="tab-breathe" class="tab-content card">
            <h3 style="text-align: center; color:var(--primary);">Bài tập điều hòa nhịp tim</h3>
            <p style="text-align: center; font-size:0.9rem; color:#6b7280; margin-top:5px;">Làm theo nhịp điệu của vòng tròn bên dưới nhé.</p>
            <div class="breathe-container">
                <div class="circle"><span class="breathe-text"></span></div>
            </div>
        </div>

        <!-- 3. BỨC TƯỜNG -->
        <div id="tab-wall" class="tab-content card">
            <h3 style="color:var(--primary); margin-bottom:10px;">Bức Tường Ẩn Danh</h3>
            <textarea id="wallInput" class="wall-input" rows="3" placeholder="Chia sẻ một khoảnh khắc bạn thấy ngại ngùng hôm nay..."></textarea>
            <button class="btn" onclick="postWall()">Dán lên tường</button>
            <div id="wallFeed" style="margin-top: 20px;"></div>
        </div>

        <!-- 4. CHAT AI & THỬ THÁCH -->
        <div id="tab-ai" class="tab-content card">
            <div class="challenge-box">
                <strong>🎯 Thử thách hôm nay:</strong>
                <div id="dailyChallenge" style="margin-top:5px; font-style:italic;">Đang tải...</div>
            </div>
            <div class="chat-box" id="chatHistory"></div>
            <div class="chat-input">
                <input type="text" id="chatMsg" placeholder="Tâm sự với AI..." onkeypress="if(event.key==='Enter') sendMsg()">
                <button class="btn" onclick="sendMsg()">Gửi</button>
            </div>
        </div>
    </div>

    <script>
        // Chuyển Tab
        function switchTab(evt, tabId) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            evt.currentTarget.classList.add('active');
        }

        // Logic Tiến Trình (Streak)
        function loadStreak() {
            let streak = parseInt(localStorage.getItem('streak') || '0');
            document.getElementById('streakTxt').innerText = streak;
            document.getElementById('streakFill').style.width = Math.min(streak * 10, 100) + '%';
        }
        function checkIn() {
            let streak = parseInt(localStorage.getItem('streak') || '0') + 1;
            localStorage.setItem('streak', streak);
            loadStreak();
            alert('Tuyệt vời! Bạn đã vượt qua chính mình thêm một ngày nữa.');
        }

        // Logic Bức tường
        async function loadWall() {
            const res = await fetch('/api/wall');
            const data = await res.json();
            const feed = document.getElementById('wallFeed');
            feed.innerHTML = data.posts.map(p => 
                '<div class="wall-post"><strong style="color:var(--primary);font-size:0.85rem;">' + p.author + '</strong><p style="font-size:0.95rem;margin-top:4px;">' + p.text + '</p></div>'
            ).join('');
        }
        async function postWall() {
            const text = document.getElementById('wallInput').value;
            if(!text) return;
            await fetch('/api/wall', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({text}) });
            document.getElementById('wallInput').value = '';
            loadWall();
        }

        // Logic AI Chat & Thử thách
        const chatHistory = document.getElementById('chatHistory');
        
        function appendMsg(sender, text) {
            chatHistory.innerHTML += '<div class="msg ' + sender + '">' + text + '</div>';
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }

        async function initAI() {
            // Lấy thử thách
            const cRes = await fetch('/api/challenge');
            const cData = await cRes.json();
            document.getElementById('dailyChallenge').innerText = cData.challenge;

            // Mở đầu Chat ngẫu nhiên
            const bRes = await fetch('/api/chat/init', { method: 'POST' });
            const bData = await bRes.json();
            appendMsg('bot', bData.message);
        }

        async function sendMsg() {
            const input = document.getElementById('chatMsg');
            const text = input.value.trim();
            if(!text) return;
            
            appendMsg('user', text);
            input.value = '';

            const res = await fetch('/api/chat', { 
                method: 'POST', 
                headers:{'Content-Type':'application/json'}, 
                body: JSON.stringify({message: text}) 
            });
            const data = await res.json();
            appendMsg('bot', data.reply);
        }

        // Khởi tạo khi trang web tải xong
        window.onload = () => {
            loadStreak();
            loadWall();
            initAI();
        };
    </script>
</body>
</html>
    `;
    res.send(htmlContent);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server chạy tại port ${PORT}`));
