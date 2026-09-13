require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo DeepSeek AI
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

// Toàn bộ HTML, CSS và JavaScript Giao diện được đóng gói vào biến này
const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spotlight check</title>
    <style>
        * { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body {
            background-color: #f4f1ea;
            margin: 0; padding: 20px;
            display: flex; justify-content: center;
        }
        .notebook-container {
            background-color: #fffdf7;
            width: 100%; max-width: 600px;
            min-height: 80vh;
            border-radius: 12px;
            box-shadow: -5px 5px 15px rgba(0,0,0,0.1);
            border-left: 20px solid #5c6bc0;
            position: relative;
            padding: 20px;
            background-image: repeating-linear-gradient(transparent, transparent 31px, #e0e0e0 31px, #e0e0e0 32px);
            line-height: 32px;
        }
        .slogan {
            font-size: 16px; color: #5c6bc0;
            text-align: center; font-style: italic;
            background: #fff; padding: 5px; border-radius: 8px;
            line-height: normal;
        }
        nav { display: flex; justify-content: space-between; margin-bottom: 20px; background: #fff; }
        nav button {
            flex: 1; padding: 10px; border: none;
            background: #e8eaf6; color: #3949ab;
            cursor: pointer; font-weight: bold; margin: 2px;
            border-radius: 8px;
        }
        nav button:hover { background: #c5cae9; }
        .tab-content { display: none; background: rgba(255,255,255,0.8); padding: 10px; border-radius: 8px;}
        .tab-content.active { display: block; }
        textarea, input[type="text"] {
            width: 100%; padding: 10px; margin: 10px 0;
            border: 1px solid #ccc; border-radius: 8px;
            line-height: normal;
        }
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100;}
        .modal-content { background: white; padding: 30px; border-radius: 12px; text-align: center; width: 90%; max-width: 400px; line-height: normal;}
        .modal button { background: #5c6bc0; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px;}
        .contact-card { background: #fff; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #eee; line-height: normal;}
        .hot-line { background: #ffebee; }
        .school-room { background: #e3f2fd; }
        .btn { display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 8px; color: white; font-weight: bold; margin-top: 10px;}
        .call-btn { background: #e53935; }
        .fb-btn { background: #1e88e5; }
        .chat-box { height: 300px; overflow-y: auto; background: #fafafa; border: 1px solid #ddd; padding: 10px; border-radius: 8px; line-height: normal;}
        .message { margin-bottom: 10px; padding: 8px 12px; border-radius: 12px; max-width: 80%; line-height: 1.4; word-wrap: break-word;}
        .user-msg { background: #5c6bc0; color: white; margin-left: auto; text-align: right; }
        .ai-msg { background: #e0e0e0; color: black; margin-right: auto; }
        .chat-input-area { display: flex; gap: 10px; margin-top: 10px;}
        .chat-input-area button { background: #5c6bc0; color: white; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer;}
        .challenge-card { background: #fff; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #ccc; line-height: normal;}
        .challenge-card button { background: #3949ab; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px;}
    </style>
</head>
<body>
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <h2>Chào cậu! Cậu tên là gì nhỉ?</h2>
            <input type="text" id="username-input" placeholder="Nhập tên của bạn...">
            <button onclick="saveName()">Bắt đầu</button>
        </div>
    </div>

    <div class="notebook-container" id="main-app" style="display: none;">
        <header>
            <h1 class="slogan">Hôm nay bạn thế nào? Dù có vui hay buồn thì vẫn luôn có chúng tớ ở đây.</h1>
            <nav>
                <button onclick="switchTab('notebook')">Sổ Tay</button>
                <button onclick="switchTab('ai-chat')">Trợ Lý AI</button>
                <button onclick="switchTab('challenge')">Thử Thách</button>
                <button onclick="switchTab('support')">Hỗ Trợ</button>
            </nav>
        </header>

        <main>
            <section id="notebook" class="tab-content active">
                <h2>Phần 1: Nhìn nhận lại vấn đề</h2>
                <label>Sự kiện / Tình huống khiến bạn lo lắng là gì?</label>
                <textarea placeholder="Ví dụ: Lỡ phát biểu vấp trong cuộc họp..."></textarea>
                
                <label>Mọi người đang phán xét bạn thế nào?</label>
                <textarea placeholder="Tôi sợ họ nghĩ tôi kém cỏi..."></textarea>
            </section>

            <section id="ai-chat" class="tab-content">
                <h2>Người bạn Đồng hành</h2>
                <div id="chat-box" class="chat-box"></div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Kể cho chúng tớ nghe nhé...">
                    <button onclick="sendMessage()">Gửi</button>
                </div>
            </section>

            <section id="challenge" class="tab-content">
                <h2>Thử thách 21 Ngày</h2>
                <div class="challenge-card">
                    <h3 id="daily-challenge-text">Đang tải thử thách...</h3>
                    <button onclick="getChallenge()">Lấy thử thách khác</button>
                </div>
            </section>

            <section id="support" class="tab-content">
                <h2>Liên Hệ Chuyên Gia</h2>
                <p>Nếu cảm thấy quá áp lực, đừng ngần ngại tìm kiếm sự giúp đỡ.</p>
                
                <div class="contact-card hot-line">
                    <h3>Đường Dây Nóng Quốc Gia (111)</h3>
                    <p>Hỗ trợ khẩn cấp 24/7 về bảo vệ trẻ em và sức khỏe tâm lý.</p>
                    <a href="tel:111" class="btn call-btn">📞 Gọi 111 (Miễn phí)</a>
                </div>

                <div class="contact-card school-room">
                    <h3>Phòng Tâm Lý Học Đường LTV</h3>
                    <p>Luôn mở cửa đón nhận và lắng nghe tâm sự của các bạn học sinh.</p>
                    <a href="https://www.facebook.com/share/1CGCq3ZcUu/" target="_blank" class="btn fb-btn">🌐 Nhắn tin qua Facebook</a>
                </div>
            </section>
        </main>
    </div>

    <script>
        let currentUser = "";

        window.onload = () => {
            const savedName = localStorage.getItem("spotlight_username");
            if (savedName) {
                currentUser = savedName;
                document.getElementById("login-modal").style.display = "none";
                document.getElementById("main-app").style.display = "block";
                getChallenge();
            }
        };

        function saveName() {
            const nameInput = document.getElementById("username-input").value.trim();
            if (nameInput) {
                localStorage.setItem("spotlight_username", nameInput);
                currentUser = nameInput;
                document.getElementById("login-modal").style.display = "none";
                document.getElementById("main-app").style.display = "block";
                getChallenge();
            } else {
                alert("Nhập tên để chúng tớ biết cách xưng hô nhé!");
            }
        }

        function switchTab(tabId) {
            document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
            document.getElementById(tabId).classList.add("active");
        }

        async function sendMessage() {
            const inputField = document.getElementById("chat-input");
            const message = inputField.value.trim();
            if (!message) return;

            const chatBox = document.getElementById("chat-box");
            
            chatBox.innerHTML += '<div class="message user-msg">' + message + '</div>';
            inputField.value = "";
            chatBox.scrollTop = chatBox.scrollHeight;

            const loadingId = "loading-" + Date.now();
            chatBox.innerHTML += '<div id="' + loadingId + '" class="message ai-msg">Chúng tớ đang suy nghĩ...</div>';
            chatBox.scrollTop = chatBox.scrollHeight;
            
            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: message, username: currentUser })
                });
                const data = await response.json();
                
                document.getElementById(loadingId).remove();
                chatBox.innerHTML += '<div class="message ai-msg">' + data.reply + '</div>';
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch (error) {
                document.getElementById(loadingId).innerText = "Lỗi kết nối, cậu thử lại nhé!";
            }
        }

        async function getChallenge() {
            const challengeText = document.getElementById("daily-challenge-text");
            challengeText.innerText = "Đang xin vũ trụ một thử thách...";
            
            try {
                const response = await fetch("/api/challenge");
                const data = await response.json();
                challengeText.innerText = data.challenge;
            } catch (error) {
                challengeText.innerText = "Chưa thể lấy thử thách, cậu hãy tự tin mỉm cười với một người bạn nhé!";
            }
        }
    </script>
</body>
</html>
`;

// Cấp phát giao diện khi truy cập trang chủ
app.get('/', (req, res) => {
    res.send(htmlContent);
});

// API: Chatbot Khuyên nhủ Tâm lý
app.post('/api/chat', async (req, res) => {
    try {
        const { message, username } = req.body;
        const completion = await client.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Bạn là một người bạn đồng hành tâm lý học đường ấm áp. Hãy luôn xưng 'chúng tớ' và gọi người dùng bằng tên của họ. Giúp họ vượt qua sự tự ti, hội chứng Spotlight Effect (sợ bị phán xét)." 
                },
                { role: "user", content: `Tên tớ là ${username}. ${message}` }
            ],
            model: "deepseek-chat",
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("Lỗi Chatbot:", error);
        res.status(500).json({ error: "Hệ thống AI đang bận, thử lại sau nhé!" });
    }
});

// API: Khởi tạo Thử thách mỗi ngày
app.get('/api/challenge', async (req, res) => {
    try {
        const completion = await client.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Tạo 1 câu hỏi thử thách tâm lý ngắn gọn cho học sinh để vượt qua rào cản sợ hãi đám đông. BẮT BUỘC bắt đầu bằng cụm từ: 'Liệu hôm nay bạn có dám...?'" 
                }
            ],
            model: "deepseek-chat",
        });
        res.json({ challenge: completion.choices[0].message.content });
    } catch (error) {
        console.error("Lỗi AI Challenge:", error);
        res.status(500).json({ error: "Không thể tạo thử thách lúc này." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Hệ thống Spotlight Check đang chạy tại port ${PORT}`);
});
