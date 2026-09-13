// Khởi tạo an toàn: Chỉ gọi dotenv khi chạy ở máy local (tránh lỗi MODULE_NOT_FOUND trên Render)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo DeepSeek AI (Kiểm tra kỹ biến môi trường DEEPSEEK_API_KEY trên Render)
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

// ==========================================
// GIAO DIỆN FRONTEND (HTML/CSS/JS)
// ==========================================
const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Spotlight check</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --bg-color: #f8f9fa;
            --primary-color: #5c6bc0;
            --primary-light: #e8eaf6;
            --text-main: #333;
            --text-muted: #666;
            --card-bg: #ffffff;
        }
        
        * { box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 0; }
        
        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            display: flex; justify-content: center;
            min-height: 100vh;
        }

        .app-container {
            width: 100%; max-width: 480px;
            background-color: var(--bg-color);
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.05);
            display: flex; flex-direction: column;
        }

        /* --- Slogan & Header --- */
        header { padding: 20px 15px 10px; background: white; border-bottom: 1px solid #eee; text-align: center;}
        .slogan {
            font-size: 15px; color: var(--primary-color);
            font-style: italic; font-weight: 600;
            line-height: 1.4;
        }

        /* --- Navigation Menu --- */
        .nav-menu {
            display: flex; flex-direction: column; gap: 10px; padding: 20px 15px;
        }
        .nav-item {
            background: var(--card-bg); padding: 15px 20px;
            border-radius: 16px; display: flex; align-items: center; gap: 15px;
            font-weight: 600; font-size: 16px; color: var(--text-main);
            box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer;
            transition: transform 0.1s;
        }
        .nav-item:active { transform: scale(0.98); }
        .nav-icon { 
            width: 40px; height: 40px; background: var(--primary-light); 
            border-radius: 12px; display: flex; justify-content: center; align-items: center;
            font-size: 20px; color: var(--primary-color);
        }

        /* --- User Profile Header --- */
        .user-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 15px; margin-top: 10px;
        }
        .avatar {
            width: 45px; height: 45px; background: var(--primary-color); color: white;
            border-radius: 50%; display: flex; justify-content: center; align-items: center;
            font-size: 20px; font-weight: bold;
        }
        .logout-btn { color: #e53935; background: none; border: none; font-size: 20px; cursor: pointer; }

        /* --- Tab Contents --- */
        .tab-content { display: none; padding: 15px; flex: 1; overflow-y: auto; background: var(--bg-color); }
        .tab-content.active { display: block; }
        .back-btn {
            background: none; border: none; font-size: 16px; color: var(--text-muted);
            margin-bottom: 15px; cursor: pointer; display: flex; align-items: center; gap: 5px;
        }

        /* --- Thiết kế dạng Sổ tay (Notebook) --- */
        .notebook-page {
            background-color: #fffdf7;
            border-radius: 12px; padding: 25px 20px;
            box-shadow: 2px 4px 12px rgba(0,0,0,0.05);
            border-left: 12px solid #ffcc80; /* Gáy sổ */
            background-image: repeating-linear-gradient(transparent, transparent 35px, #e0e0e0 35px, #e0e0e0 36px);
            line-height: 36px;
            min-height: 400px;
        }
        .notebook-page h3 { color: var(--primary-color); margin-bottom: 10px; background: #fffdf7; display: inline-block; padding-right: 10px;}
        .notebook-input {
            width: 100%; background: transparent; border: none; outline: none;
            font-size: 16px; color: var(--text-main); font-family: inherit;
            resize: none; overflow: hidden; line-height: 36px; margin-bottom: 15px;
        }
        .notebook-input::placeholder { color: #aaa; font-style: italic; }
        
        .slider-container { margin: 20px 0; background: #fffdf7; padding: 10px; border-radius: 8px; line-height: normal; }
        .slider-container label { font-weight: 600; font-size: 15px;}
        .slider-val { color: #e53935; font-weight: bold; font-size: 18px; }
        input[type="range"] { width: 100%; margin-top: 10px; accent-color: #e53935; }

        /* --- Chatbot UI --- */
        .chat-container { display: flex; flex-direction: column; height: calc(100vh - 120px); }
        .chat-box { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 10px; background: white; border-radius: 12px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.02);}
        .message { padding: 12px 16px; border-radius: 18px; max-width: 85%; line-height: 1.4; font-size: 15px; word-wrap: break-word;}
        .user-msg { background: var(--primary-color); color: white; align-self: flex-end; border-bottom-right-radius: 4px;}
        .ai-msg { background: #f1f3f5; color: var(--text-main); align-self: flex-start; border-bottom-left-radius: 4px;}
        .chat-input-area { display: flex; gap: 10px; margin-top: 15px; }
        .chat-input-area input { flex: 1; padding: 12px 15px; border: 1px solid #ddd; border-radius: 25px; outline: none; font-size: 15px; }
        .chat-input-area button { background: var(--primary-color); color: white; border: none; width: 45px; height: 45px; border-radius: 50%; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 18px;}

        /* --- Hỗ Trợ Chuyên Gia UI --- */
        .contact-card { padding: 20px; border-radius: 16px; margin-bottom: 15px; line-height: 1.5; }
        .hotline-111 { background-color: #ffebee; }
        .hotline-ltv { background-color: #e3f2fd; }
        .contact-card h3 { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 18px; }
        .btn-link { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; color: white; text-decoration: none; font-weight: 600; margin-top: 15px; width: 100%; justify-content: center;}
        .btn-red { background: #e53935; }
        .btn-blue { background: #1e88e5; }

        /* --- Thử Thách UI --- */
        .challenge-card { background: white; padding: 30px 20px; border-radius: 16px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05);}
        .challenge-icon { font-size: 50px; margin-bottom: 15px; }
        .challenge-text { font-size: 20px; font-weight: bold; color: var(--primary-color); margin-bottom: 20px; line-height: 1.4;}
        .btn-refresh { background: var(--primary-light); color: var(--primary-color); border: none; padding: 12px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; font-size: 16px;}

        /* --- Modal Đăng nhập --- */
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;}
        .modal-content { background: white; padding: 30px; border-radius: 20px; text-align: center; width: 90%; max-width: 350px; }
        .modal-content h2 { margin-bottom: 20px; color: var(--primary-color); font-size: 22px;}
        .modal-content input { width: 100%; padding: 15px; border: 2px solid #eee; border-radius: 12px; margin-bottom: 20px; font-size: 16px; outline: none; text-align: center;}
        .modal-content input:focus { border-color: var(--primary-color); }
        .modal-content button { background: var(--primary-color); color: white; border: none; padding: 15px; width: 100%; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;}
    </style>
</head>
<body>

    <!-- Màn hình đăng nhập (Chỉ yêu cầu Tên) -->
    <div id="login-modal" class="modal">
        <div class="modal-content">
            <h2>Chào cậu! Cậu tên là gì nhỉ? 🌿</h2>
            <input type="text" id="username-input" placeholder="Nhập tên của cậu vào đây...">
            <button onclick="saveName()">Bắt đầu hành trình</button>
        </div>
    </div>

    <!-- App Chính -->
    <div class="app-container" id="main-app" style="display: none;">
        
        <!-- Tab 0: Menu Chính (Dashboard) -->
        <div id="menu-tab" class="tab-content active" style="padding: 0;">
            <header>
                <h1 class="slogan">"Hôm nay bạn thế nào? Dù có vui hay buồn thì vẫn luôn có chúng tớ ở đây."</h1>
            </header>
            
            <div class="user-header">
                <div class="avatar" id="user-avatar">A</div>
                <button class="logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i></button>
            </div>

            <div class="nav-menu">
                <div class="nav-item" onclick="openTab('notebook')">
                    <div class="nav-icon"><i class="fas fa-book-open"></i></div>
                    Sổ Tay Phản Tư
                </div>
                <div class="nav-item" onclick="openTab('chat')">
                    <div class="nav-icon"><i class="fas fa-robot"></i></div>
                    Trợ Lý AI Đồng Hành
                </div>
                <div class="nav-item" onclick="openTab('challenge')">
                    <div class="nav-icon"><i class="fas fa-trophy"></i></div>
                    Thử Thách 21 Ngày
                </div>
                <div class="nav-item" onclick="openTab('support')">
                    <div class="nav-icon"><i class="fas fa-stethoscope"></i></div>
                    Hỗ Trợ Chuyên Gia
                </div>
            </div>
        </div>

        <!-- Tab 1: Sổ Tay Phản Tư -->
        <div id="notebook-tab" class="tab-content">
            <button class="back-btn" onclick="openTab('menu')"><i class="fas fa-arrow-left"></i> Quay lại Menu</button>
            <div class="notebook-page">
                <h3>Phần 1: Nhìn nhận lại</h3><br>
                <span>Sự kiện khiến bạn lo lắng là gì?</span>
                <textarea class="notebook-input" rows="2" placeholder="Ví dụ: Lỡ phát biểu vấp trong cuộc họp..." oninput="autoResize(this)"></textarea>
                
                <span>Mọi người đang phán xét bạn thế nào?</span>
                <textarea class="notebook-input" rows="2" placeholder="Tôi sợ họ nghĩ tôi kém cỏi..." oninput="autoResize(this)"></textarea>

                <div class="slider-container">
                    <label>Bạn cảm thấy mức độ chú ý của họ là bao nhiêu %? <span class="slider-val" id="slider-val">50%</span></label>
                    <input type="range" min="0" max="100" value="50" oninput="document.getElementById('slider-val').innerText = this.value + '%'">
                </div>

                <h3>Phần 2: Kiểm chứng thực tế</h3><br>
                <span>Có bằng chứng nào cho thấy họ THỰC SỰ để ý không?</span>
                <textarea class="notebook-input" rows="2" placeholder="Hình như không ai cười hay nói gì cả..." oninput="autoResize(this)"></textarea>
            </div>
        </div>

        <!-- Tab 2: Trợ Lý AI Chatbot -->
        <div id="chat-tab" class="tab-content">
            <button class="back-btn" onclick="openTab('menu')"><i class="fas fa-arrow-left"></i> Quay lại Menu</button>
            <div class="chat-container">
                <div id="chat-box" class="chat-box">
                    <div class="message ai-msg">Chào cậu, tớ ở đây để lắng nghe. Cậu đang nghĩ gì vậy? 🌻</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Gõ tâm sự của cậu vào đây..." onkeypress="handleEnter(event)">
                    <button onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>

        <!-- Tab 3: Thử Thách 21 Ngày -->
        <div id="challenge-tab" class="tab-content">
            <button class="back-btn" onclick="openTab('menu')"><i class="fas fa-arrow-left"></i> Quay lại Menu</button>
            <div class="challenge-card">
                <div class="challenge-icon">🎯</div>
                <div class="challenge-text" id="daily-challenge-text">Đang kết nối vũ trụ để lấy thử thách...</div>
                <button class="btn-refresh" onclick="getChallenge()"><i class="fas fa-sync-alt"></i> Đổi thử thách khác</button>
            </div>
        </div>

        <!-- Tab 4: Hỗ Trợ Chuyên Gia -->
        <div id="support-tab" class="tab-content">
            <button class="back-btn" onclick="openTab('menu')"><i class="fas fa-arrow-left"></i> Quay lại Menu</button>
            
            <p style="margin-bottom: 20px; color: var(--text-muted); text-align: center; font-size: 15px;">Nếu cảm thấy quá áp lực, đừng ngần ngại tìm kiếm sự giúp đỡ từ những người có chuyên môn.</p>

            <div class="contact-card hotline-111">
                <h3><i class="fas fa-phone-alt" style="color: #e53935;"></i> Đường Dây Nóng Quốc Gia</h3>
                <p style="font-size: 14px; color: #555;">Hỗ trợ khẩn cấp 24/7 về bảo vệ trẻ em, sức khỏe tinh thần và tâm lý.</p>
                <a href="tel:111" class="btn-link btn-red"><i class="fas fa-phone"></i> Gọi 111 (Miễn phí)</a>
            </div>

            <div class="contact-card hotline-ltv">
                <h3><i class="fas fa-school" style="color: #1e88e5;"></i> Phòng Tâm Lý Học Đường LTV</h3>
                <p style="font-size: 14px; color: #555;">Luôn mở cửa đón nhận, chia sẻ và lắng nghe tâm sự của các bạn học sinh Lương Thế Vinh.</p>
                <a href="https://www.facebook.com/share/1CGCq3ZcUu/" target="_blank" class="btn-link btn-blue"><i class="fab fa-facebook-messenger"></i> Nhắn tin Facebook</a>
            </div>
        </div>

    </div>

    <script>
        let currentUser = "";

        // Tự động giãn dòng Sổ tay
        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        window.onload = () => {
            const savedName = localStorage.getItem("spotlight_username");
            if (savedName) {
                initApp(savedName);
            }
        };

        function saveName() {
            const nameInput = document.getElementById("username-input").value.trim();
            if (nameInput) {
                localStorage.setItem("spotlight_username", nameInput);
                initApp(nameInput);
            } else {
                alert("Nhập tên để chúng tớ biết cách xưng hô nhé!");
            }
        }

        function initApp(name) {
            currentUser = name;
            document.getElementById("user-avatar").innerText = name.charAt(0).toUpperCase();
            document.getElementById("login-modal").style.display = "none";
            document.getElementById("main-app").style.display = "flex";
            // Nạp trước dữ liệu challenge ngầm để trải nghiệm mượt hơn
            getChallenge(true); 
        }

        function logout() {
            localStorage.removeItem("spotlight_username");
            location.reload();
        }

        function openTab(tabName) {
            document.querySelectorAll(".tab-content").forEach(tab => {
                tab.classList.remove("active");
            });
            document.getElementById(tabName + "-tab").classList.add("active");
        }

        function handleEnter(e) {
            if (e.key === 'Enter') sendMessage();
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
            chatBox.innerHTML += '<div id="' + loadingId + '" class="message ai-msg"><i class="fas fa-ellipsis-h fa-fade"></i></div>';
            chatBox.scrollTop = chatBox.scrollHeight;
            
            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: message, username: currentUser })
                });
                const data = await response.json();
                
                document.getElementById(loadingId).remove();
                chatBox.innerHTML += '<div class="message ai-msg">' + data.reply.replace(/\\n/g, '<br>') + '</div>';
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch (error) {
                document.getElementById(loadingId).innerText = "Mạng đang chập chờn, cậu thử lại nhé!";
            }
        }

        // isPreload: Nạp sẵn lúc mở app để không bắt user chờ
        async function getChallenge(isPreload = false) {
            const challengeText = document.getElementById("daily-challenge-text");
            if(!isPreload) challengeText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
            
            try {
                const response = await fetch("/api/challenge");
                const data = await response.json();
                challengeText.innerText = data.challenge;
            } catch (error) {
                if(!isPreload) challengeText.innerText = "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn mới không?";
            }
        }
    </script>
</body>
</html>
`;

// ==========================================
// ĐỊNH TUYẾN EXPRESS & API
// ==========================================

// Phục vụ Giao diện (Trả về HTML dạng String)
app.get('/', (req, res) => {
    res.send(htmlContent);
});

// API: Trợ Lý AI Tâm Lý
app.post('/api/chat', async (req, res) => {
    try {
        const { message, username } = req.body;
        const completion = await client.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Bạn là một người bạn đồng hành tâm lý học đường, thấu cảm, xưng hô 'chúng tớ' và gọi người dùng bằng tên của họ. Giúp họ phân tích và vượt qua hội chứng Spotlight Effect (sợ bị đám đông phán xét). Giữ câu trả lời súc tích, ngắt đoạn rõ ràng, dễ đọc trên điện thoại." 
                },
                { role: "user", content: \`Tên tớ là \${username}. \${message}\` }
            ],
            model: "deepseek-chat",
            temperature: 0.7,
        });
        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error("Lỗi AI Chatbot:", error);
        res.status(500).json({ error: "Hệ thống AI đang bận." });
    }
});

// API: Tạo Thử thách Tâm lý
app.get('/api/challenge', async (req, res) => {
    try {
        const completion = await client.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "Bạn là hệ thống tạo thử thách tâm lý. Hãy đưa ra MỘT câu hỏi thử thách thực hành duy nhất để giúp học sinh tự tin hơn, bớt sợ hãi đám đông. YÊU CẦU BẮT BUỘC: Câu trả lời phải bắt đầu bằng cụm từ 'Liệu hôm nay bạn có dám...?' và ngắn gọn dưới 25 chữ." 
                }
            ],
            model: "deepseek-chat",
            temperature: 0.8,
        });
        res.json({ challenge: completion.choices[0].message.content });
    } catch (error) {
        console.error("Lỗi AI Challenge:", error);
        res.status(500).json({ error: "Không thể lấy thử thách." });
    }
});

// Khởi chạy Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(\`🚀 Hệ thống Spotlight Check đã sửa lỗi dotenv và đang chạy tại port \${PORT}\`);
});
