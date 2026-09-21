const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());

// ==========================================
// 1. BACKEND: IN-MEMORY DATABASE & DATASET
// ==========================================
const dailyChallenges = [
    "Liệu hôm nay bạn có dám mỉm cười và chào hỏi một người bạn chưa từng nói chuyện?",
    "Liệu hôm nay bạn có dám đưa ra ý kiến trong buổi họp/tiết học mà không lo sợ bị đánh giá?",
    "Liệu hôm nay bạn có dám từ chối một yêu cầu mà bạn thực sự không muốn làm?",
    "Liệu hôm nay bạn có dám mặc bộ đồ bạn thích nhất mà không bận tâm ánh nhìn của người khác?",
    "Liệu hôm nay bạn có dám nhận lỗi một cách thẳng thắn mà không tìm cãi lý?"
];

// Khởi tạo 10 tin nhắn mẫu và tính năng tự động xóa sau 24 giờ
let anonymousWallPosts = [
    { id: 1, author: 'Thành viên ẩn danh #102', text: 'Hôm nay tớ lỡ gọi lộn tên đồng nghiệp. Tưởng quê lắm nhưng 5 phút sau mọi người quên hết sạch!', time: '10 phút trước', timestamp: Date.now() - 10 * 60 * 1000 },
    { id: 2, author: 'Bạn cùng tần số #405', text: 'Vừa thuyết trình bị vấp từ. Dùng AI dự đoán mới biết mọi người chỉ chú ý 12% thôi, nhẹ cả người.', time: '45 phút trước', timestamp: Date.now() - 45 * 60 * 1000 },
    { id: 3, author: 'Ẩn danh #082', text: 'Đừng quá khắt khe với bản thân nhé mọi người. AI nói đúng: Ai cũng bận lo cho bản thân họ thôi!', time: '1 giờ trước', timestamp: Date.now() - 60 * 60 * 1000 },
    { id: 4, author: 'Thành viên ẩn danh #219', text: 'Ngồi trong quán cafe mà cứ tưởng ai cũng dòm mình, hóa ra mọi người đều cắm mặt vô laptop.', time: '2 giờ trước', timestamp: Date.now() - 2 * 60 * 60 * 1000 },
    { id: 5, author: 'Ẩn danh #551', text: 'Nói lỡ lời trong nhóm chat, cứ lo mọi người đánh giá. Hóa ra chả ai để ý.', time: '4 giờ trước', timestamp: Date.now() - 4 * 60 * 60 * 1000 },
    { id: 6, author: 'Bạn cùng tần số #112', text: 'Mặc bộ đồ hơi khác lạ ra đường cứ sợ bị chê. Nhưng nhớ lại lời AI bảo: ai cũng bận sống cuộc đời họ!', time: '6 giờ trước', timestamp: Date.now() - 6 * 60 * 60 * 1000 },
    { id: 7, author: 'Ẩn danh #309', text: 'Hôm nay lỡ đánh rơi ly nước vỡ xoảng. Xấu hổ quá nhưng 10 phút sau quán trở lại bình thường.', time: '8 giờ trước', timestamp: Date.now() - 8 * 60 * 60 * 1000 },
    { id: 8, author: 'Thành viên ẩn danh #884', text: 'Gửi lời chúc lành đến tất cả những ai đang bị suy nghĩ quá nhiều (overthinking) đêm nay nhé!', time: '12 giờ trước', timestamp: Date.now() - 12 * 60 * 60 * 1000 },
    { id: 9, author: 'Ẩn danh #601', text: 'Tập thở 5 phút xong thấy nhẹ lòng hơn hẳn. Cùng cố gắng nha mọi người.', time: '15 giờ trước', timestamp: Date.now() - 15 * 60 * 60 * 1000 },
    { id: 10, author: 'Bạn cùng tần số #733', text: 'Lỗi lầm hôm nay chỉ là hạt cát của ngày mai. Hít sâu thở ra nào!', time: '18 giờ trước', timestamp: Date.now() - 18 * 60 * 60 * 1000 }
];

const loadingAffirmations = [
    "Hít một hơi thật sâu nào, mọi chuyện rồi sẽ ổn thôi...",
    "Bạn đang làm rất tốt rồi, hãy chậm lại một chút nhé...",
    "Thế giới này không quá khắt khe như bạn tưởng đâu...",
    "Chào mừng bạn trở lại với không gian an toàn của chính mình..."
];

// Bộ từ khóa và phản hồi AI dựa trên file Chatbox_AI_Spotlight_Effect_50_cau.docx
const aiResponsesGroup = [
    // NHÓM 1 — Cảm giác mọi người đang nhìn
    { keywords: ['nhìn', 'đông', 'tâm điểm', 'lớp', 'để ý', 'bàn tán'], replies: [
        "Có thể bạn đang chú ý đến bản thân nhiều hơn bình thường nên cảm giác ấy trở nên rõ hơn. Không phải mọi ánh mắt đều hướng về bạn đâu.",
        "Bạn không thể biết chính xác họ đang nhìn gì, nên đừng vội biến một suy đoán thành sự thật nhé.",
        "Mọi người cũng có những câu chuyện riêng để quan tâm. Có thể khoảnh khắc đó không được chú ý nhiều như bạn nghĩ.",
        "Một ánh mắt không nhất thiết mang theo sự đánh giá. Đôi khi họ chỉ vô tình nhìn về phía bạn thôi.",
        "Khi không biết người khác đang nói gì, não mình thường tự lấp đầy khoảng trống bằng điều đáng sợ nhất. Nhưng đó vẫn chỉ là giả định thôi!"
    ]},
    // NHÓM 2 — Vừa mắc lỗi
    { keywords: ['sai', 'lỗi', 'quê', 'vấp', 'ngốc', 'té', 'ngã', 'quên lời', 'thuyết trình'], replies: [
        "Bạn nhớ chuyện đó lâu vì nó xảy ra với chính mình, nhưng với người khác có thể chỉ là một khoảnh khắc rất nhỏ.",
        "Ai cũng có những lúc nói nhầm hoặc vấp ngã. Một sự cố nhỏ không thể định nghĩa con người bạn.",
        "Một lần quên lời hay trả lời sai chỉ có nghĩa là hôm đó bạn chưa chuẩn bị kịp, không có nghĩa bạn kém cỏi.",
        "Bạn không được nhớ đến chỉ bởi một lỗi lầm. Bạn còn rất nhiều điều tuyệt vời khác tạo nên con người mình.",
        "Bạn không thể quay lại khoảnh khắc ấy, nhưng bạn có thể ngừng dùng nó để phán xét chính mình."
    ]},
    // NHÓM 3 — Tự ti về ngoại hình
    { keywords: ['mặt', 'tóc', 'đồ', 'trang phục', 'xấu', 'đẹp', 'ngoại hình', 'khuyết điểm', 'soi gương'], replies: [
        "Bạn đang tập trung vào khuyết điểm đó nên nó có vẻ nổi bật hơn rất nhiều. Điều bạn thấy rõ chưa chắc là điều người khác chú ý.",
        "Một ngày tóc chưa như ý hay bộ đồ đơn giản không làm bạn trở nên kém giá trị hay kém đáng yêu hơn đâu.",
        "Vì bạn nhìn nó mỗi ngày nên bạn biết rất rõ về nó. Người khác không nhìn bạn bằng mức độ soi xét như bạn đang nhìn chính mình.",
        "Hãy thử nhìn bản thân như cách bạn nhìn một người bạn thân: nhẹ nhàng hơn và bớt khắt khe hơn nhé.",
        "Bạn không cần phải hoàn hảo mới xứng đáng có những khoảnh khắc đẹp và được trân trọng."
    ]},
    // NHÓM 4 — Overthinking
    { keywords: ['overthink', 'suy nghĩ', 'lo', 'phân tích', 'đánh giá', 'mệt', 'nghĩ nhiều', 'đầu óc'], replies: [
        "Bạn đang dành rất nhiều sự chú ý cho một khoảnh khắc nhỏ. Đôi khi điều mình nghĩ mãi lại không quan trọng với người khác đến vậy.",
        "Bạn không thể đọc được suy nghĩ của người khác chỉ qua một ánh mắt. Đừng bắt bản thân phải giải mã mọi thứ nhé.",
        "Không sao cả, cảm xúc của bạn vẫn đáng được lắng nghe dù lý trí biết chuyện đó không quá lớn.",
        "Bạn không thể kiểm soát suy nghĩ của người khác, nhưng bạn có thể chọn không để những suy đoán ấy kiểm soát mình.",
        "Bạn không cần giải quyết tất cả suy nghĩ ngay lúc này. Cho đầu óc nghỉ ngơi một chút cũng là cách chăm sóc bản thân."
    ]},
    // NHÓM 5 — Muốn được lắng nghe
    { keywords: ['lắng nghe', 'hiểu', 'nhỏ bé', 'tự tin', 'thoải mái', 'sợ', 'chia sẻ', 'cô đơn'], replies: [
        "Tớ hiểu rằng cảm giác lúc nào cũng sợ bị chú ý và đánh giá có thể rất mệt. Bạn không cần phải cố tỏ ra ổn ngay lúc này.",
        "Bạn không nhỏ bé chỉ vì bạn đang cảm thấy mình bị nhìn thấy quá nhiều. Tớ luôn ở đây lắng nghe bạn.",
        "Bạn không cần trở nên tự tin ngay lập tức. Bắt đầu bằng việc cho phép mình xuất hiện dù vẫn còn lo lắng đã là một bước tiến lớn rồi.",
        "Bạn có thể kể mọi thứ theo cách bạn muốn. Không phải câu chuyện nào cũng cần giải quyết ngay; đôi khi được lắng nghe đã đủ rồi.",
        "Bạn không cần sống dưới một chiếc đèn sân khấu tưởng tượng. Bạn luôn có quyền bước ra khỏi đó và trở về là chính mình."
    ]}
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

        // Tìm kiếm câu trả lời phù hợp nhất từ kho dữ liệu 50 câu Spotlight Effect
        let foundGroup = aiResponsesGroup.find(group => group.keywords.some(kw => msg.includes(kw)));
        if (foundGroup) {
            const randomReply = foundGroup.replies[Math.floor(Math.random() * foundGroup.replies.length)];
            reply = `${randomReply}`;
        }

        setTimeout(() => res.json({ success: true, reply }), 350);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Lỗi hệ thống' });
    }
});

app.get('/api/challenge', (req, res) => {
    const random = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];
    res.json({ success: true, challenge: random });
});

// GET Wall: Chỉ trả về tin nhắn trong vòng 24H
app.get('/api/wall', (req, res) => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const activePosts = anonymousWallPosts.filter(post => (now - post.timestamp) <= twentyFourHours);
    res.json({ success: true, posts: activePosts });
});

app.post('/api/wall', (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) return res.status(400).json({ success: false, error: 'Nội dung không được để trống' });
        const newPost = { 
            id: Date.now(), 
            author: `Thành viên ẩn danh #${Math.floor(100 + Math.random() * 900)}`, 
            text: text.trim(), 
            time: 'Vừa xong',
            timestamp: Date.now()
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
        }), 400);
    } catch (err) { 
        res.status(500).json({ success: false, error: 'Lỗi tính toán' }); 
    }
});

// ==========================================
// 3. FRONTEND SPA (SPOTLIGHT CHECK & MINDFUL)
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
            /* MÀU SẮC THEO PALETTE HÌNH ĐÃ CHO (Petal Rouge, Pink Mist, Petal Frost, Beige, Light Blue) */
            --primary: #E27396;        /* Petal Rouge */
            --primary-light: #EFCFE3;  /* Petal Frost */
            --primary-dark: #C25275;   /* Darker Petal Rouge */
            --accent: #EB9AB2;         /* Pink Mist */
            --bg: #ECF2D8;             /* Beige */
            --light-blue: #B3DEE2;     /* Light Blue */
            --paper: #ffffff;
            --text: #374151;
            --text-muted: #6b7280;
            --line-color: #e5e7eb;
            --margin-line: #EB9AB2;
            --mindful-green: #E27396;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Nunito', sans-serif; }
        body { 
            background: var(--bg); 
            color: var(--text); 
            padding-bottom: 3rem; 
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23ECF2D8'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h100v100H0V0zm2 2h96v96H2V2z' fill='%23e4ebd0'/%3E%3C/svg%3E"); 
        }
        
        /* Loader & Splash */
        #splashLoader { position: fixed; top:0; left:0; width:100vw; height:100vh; background: var(--bg); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.6s ease, visibility 0.6s; }
        .aura-circle { width: 90px; height: 90px; border-radius: 50%; border: 4px solid var(--primary-light); border-top-color: var(--primary); animation: spin 1s linear infinite; margin-bottom: 1.5rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .splash-msg { color: var(--text); font-family: 'Lora', serif; font-style: italic; text-align: center; max-width: 80%; font-size: 1.1rem; }

        header { background: #fff; padding: 1.5rem 1rem; text-align: center; position: sticky; top: 0; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-bottom: 2px solid var(--light-blue); }
        .app-title { font-size: 1.6rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: -0.5px; }
        .slogan { font-size: 0.95rem; color: var(--text-muted); margin-top: 6px; font-style: italic; font-family: 'Lora', serif; }
        
        .container { max-width: 700px; margin: 1.5rem auto; padding: 0 1rem; }
        
        .user-bar { background: #fff; padding: 1rem 1.2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid var(--light-blue); }
        .streak-badge { background: #fff5f7; color: var(--primary); border: 1px solid var(--primary-light); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; }
        
        /* Navigation Tabs */
        .nav-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1.5rem; justify-content: center; }
        .tab-btn { background: #fff; border: 1px solid var(--light-blue); padding: 0.65rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(226, 115, 150, 0.3); }
        
        /* CONTAINER CHO CÁC TAB - THÊM BACKGROUND WATERMARK TRONG SUỐT */
        .tab-content { display: none; animation: fadeIn 0.4s ease; position: relative; border-radius: 16px; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        /* Background watermark cho 5 Tab được chỉ định */
        .tab-watermark-bg::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 260px;
            height: 260px;
            background-image: url('1789915182260_299025560367026467_299025560367026467_n.jpg');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.12; /* Transparent không che mờ chữ */
            pointer-events: none;
            z-index: 0;
        }

        /* Sổ tay Phản tư */
        .notebook-card { background: var(--paper); border-radius: 8px; padding: 2rem 2rem 2rem 3rem; margin-bottom: 1.5rem; box-shadow: 2px 4px 15px rgba(0,0,0,0.05); position: relative; background-image: repeating-linear-gradient(transparent, transparent 31px, var(--line-color) 31px, var(--line-color) 32px); background-attachment: local; background-position: 0 2.5rem; z-index: 1; }
        .notebook-card::before { content: ''; position: absolute; top: 0; bottom: 0; left: 2rem; width: 2px; background: var(--margin-line); }
        .card-title { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem; display: inline-block; background: #fff; padding: 0 5px; position: relative; z-index: 2; }
        .notebook-input { width: 100%; background: transparent; border: none; font-size: 1rem; line-height: 32px; resize: none; outline: none; font-family: 'Lora', serif; color: #1f2937; padding: 0; min-height: 64px; overflow: hidden; position: relative; z-index: 2; }
        .notebook-input::placeholder { color: #9ca3af; font-style: italic; }
        
        .slider-container { background: #fff; padding: 1rem; border-radius: 12px; border: 1px dashed var(--accent); margin: 1rem 0; position: relative; z-index: 2; text-align: center; }
        .slider-val { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
        input[type="range"] { width: 100%; accent-color: var(--primary); margin-top: 10px; }
        
        .btn { width: 100%; padding: 1rem; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-weight: 700; cursor: pointer; transition: transform 0.2s; font-size: 1rem; position: relative; z-index: 2; margin-bottom: 10px; }
        .btn:active { transform: scale(0.98); }
        
        .ai-result-box { display: none; margin-top: 1rem; background: var(--primary-light); border-left: 4px solid var(--primary); padding: 1.2rem; border-radius: 0 8px 8px 0; font-size: 0.95rem; color: var(--primary-dark); line-height: 1.6; position: relative; z-index: 2; font-family: 'Lora', serif; }
        .reframe-item { background: #fff; padding: 0.6rem 0.8rem; border-radius: 6px; margin-top: 6px; font-size: 0.9rem; color: var(--text); }

        /* AI Chatbot & Wall */
        .chat-challenge-banner { background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 16px; padding: 1.5rem; color: #fff; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(226, 115, 150, 0.3); position: relative; z-index: 1; }
        .challenge-q { font-size: 1.1rem; font-weight: 700; font-family: 'Lora', serif; font-style: italic; margin-top: 0.5rem; line-height: 1.5; }
        .chat-wrapper { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--light-blue); position: relative; z-index: 1; }
        .chat-box { height: 320px; overflow-y: auto; padding: 1.5rem; background: #fffdfd; }
        .chat-msg { margin-bottom: 1rem; max-width: 85%; padding: 0.8rem 1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; }
        .chat-msg.bot { background: var(--primary-light); border: 1px solid var(--accent); color: var(--text); border-bottom-left-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .chat-msg.user { background: var(--primary); color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }
        .chat-input-area { display: flex; padding: 1rem; background: #fff; border-top: 1px solid #f3f4f6; gap: 10px; }
        .chat-input-area input { flex: 1; border: 1px solid var(--light-blue); border-radius: 20px; padding: 0 1.2rem; font-size: 0.95rem; outline: none; }
        .chat-input-area button { width: auto; padding: 0.8rem 1.5rem; border-radius: 20px; }

        /* TAB ĐỒNG CẢM: WATERMARK HÌNH CHIM CÁNH CỤT CẦU THƯ */
        .wall-wrapper-bg { position: relative; min-height: 350px; }
        .wall-watermark-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 220px;
            max-width: 75%;
            opacity: 0.15; /* Transparent giữ chữ luôn rõ nét */
            pointer-events: none;
            z-index: 0;
        }

        .wall-post-card { background: #fff; border-radius: 12px; padding: 1.2rem; margin-bottom: 1rem; border: 1px solid var(--light-blue); box-shadow: 0 2px 8px rgba(0,0,0,0.02); position: relative; z-index: 1; }
        .wall-author { font-size: 0.85rem; font-weight: 700; color: var(--primary); display: flex; justify-content: space-between; }
        .wall-text { font-size: 0.95rem; margin-top: 6px; font-family: 'Lora', serif; color: var(--text); line-height: 1.5; }

        /* MINDFUL APP STYLES */
        .mindful-card { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; position: relative; z-index: 1; border: 1px solid var(--light-blue); }
        .progress-bar-container { background: #e0e0e0; border-radius: 10px; height: 20px; width: 100%; overflow: hidden; margin-top: 10px; }
        .progress-bar { background: var(--primary); height: 100%; width: 0%; transition: width 0.5s ease; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; position: relative; z-index: 1; }
        .stat-box { text-align: center; padding: 20px; background: var(--primary-light); border-radius: 10px; }
        .stat-box h3 { font-size: 30px; color: var(--primary-dark); }
        
        /* Tập Thở CSS */
        .breathe-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 350px; }
        .circle-outer { width: 220px; height: 220px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; transition: all 1s linear; }
        .circle-inner { width: 90px; height: 90px; border-radius: 50%; background: var(--primary); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-weight: bold; text-align: center; box-shadow: 0 0 20px rgba(226, 115, 150, 0.5); }
        .breathe-text { font-size: 16px; margin-bottom: 5px; }
        .breathe-timer { font-size: 24px; }
        .btn-mindful { background: var(--primary); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; font-size: 16px; margin-top: 20px; width: 100%; font-weight: 700; transition: 0.3s; }
        .btn-mindful:hover { background: var(--primary-dark); }
        
        /* Thử thách 21 Ngày CSS */
        .challenge-box { background: var(--primary-light); padding: 15px; border-left: 5px solid var(--primary); margin-bottom: 20px; border-radius: 4px; }
        .journal-form textarea { width: 100%; height: 100px; padding: 10px; border: 1px solid var(--light-blue); border-radius: 5px; resize: none; margin-bottom: 15px; font-family: 'Nunito', sans-serif;}
        .emoji-selector { display: flex; gap: 15px; margin-bottom: 15px; font-size: 30px; justify-content: center; align-items: center; cursor: pointer; }
        .emoji { opacity: 0.4; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
        .emoji.selected, .emoji:hover { opacity: 1; transform: scale(1.2); }
        .tracker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; margin-top: 20px; }
        .tracker-day { background: #f0f0f0; border-radius: 5px; padding: 10px; text-align: center; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .tracker-day.completed { background: var(--primary-light); border: 1px solid var(--primary); }
        .message-box { display: none; background: #e3f2fd; color: #1565c0; padding: 15px; border-radius: 5px; margin-top: 15px; text-align: center; font-style: italic; }

        /* Modal Đăng nhập */
        #nameModal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; }
        .modal-box { background: #fff; padding: 2.5rem 2rem; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 2px solid var(--primary-light); }
        .modal-box input { width: 100%; padding: 1rem; border: 2px solid var(--light-blue); border-radius: 12px; font-size: 1rem; margin: 1.5rem 0; outline: none; text-align: center; }
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
        <div style="margin-top: 10px; font-size: 0.9rem; font-weight: 600;">
            📞 Hotline: <a href="tel:111" style="color: var(--primary); text-decoration: none;">111</a> (Tổng đài 24/7) | 
            🌐 <a href="https://facebook.com" target="_blank" style="color: var(--primary); text-decoration: none;">Facebook</a>
        </div>
    </header>

    <div class="container">
        <div class="user-bar">
            <div style="font-size:1.05rem;">Chào <strong id="displayName" style="color:var(--primary);">Bạn</strong>,</div>
            <div class="streak-badge">🔥 <span id="streakCount">1</span> Ngày</div>
        </div>

        <!-- NAVIGATION TABS -->
        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab(event, 'journal')">Sổ Tay</button>
            <button class="tab-btn" onclick="switchTab(event, 'ai-chat')">AI Tâm Lý</button>
            <button class="tab-btn" onclick="switchTab(event, 'wall')">Đồng Cảm</button>
            <button class="tab-btn" onclick="switchTab(event, 'progress')">📊 Tiến Trình</button>
            <button class="tab-btn" onclick="switchTab(event, 'breathe')">🫁 Tập Thở</button>
            <button class="tab-btn" onclick="switchTab(event, 'challenge21')">🎯 21 Ngày</button>
        </div>
        
        <!-- TAB 1: SỔ TAY PHẢN TƯ (CÓ BACKGROUND WATERMARK) -->
        <div id="journal" class="tab-content tab-watermark-bg active">
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
                
                <button class="btn" style="background:var(--primary-dark);" onclick="predictAttention()">Bật Kính Lúp Sự Thật 🔍</button>
                <div id="aiPredictionResult" class="ai-result-box"></div>
            </div>

            <div class="notebook-card">
                <div class="card-title" style="color:var(--primary);">Phần 2: Bằng chứng thực tế</div>
                <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:5px; position:relative; z-index:2;">Có bằng chứng rõ ràng nào cho thấy họ thực sự chú ý không?</p>
                <textarea id="proofInput" class="notebook-input" placeholder="Hình như không ai nói gì, họ tiếp tục bấm điện thoại..." oninput="autoResize(this)"></textarea>
            </div>
            
            <button class="btn" onclick="saveJournal()">Gấp Sổ Tay (Lưu Tiến Trình)</button>
        </div>

        <!-- TAB 2: AI CHAT (CÓ BACKGROUND WATERMARK) -->
        <div id="ai-chat" class="tab-content tab-watermark-bg">
            <div class="chat-challenge-banner">
                <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">Thử thách dũng cảm hôm nay</div>
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

        <!-- TAB 3: BỨC TƯỜNG ĐỒNG CẢM (CÓ HÌNH CHIM CÁNH CỤT CẦU THƯ TRONG SUỐT Ở CHÍNH GIỮA) -->
        <div id="wall" class="tab-content">
            <div class="notebook-card">
                <div class="card-title">Chia sẻ câu chuyện của bạn</div>
                <textarea id="wallInput" class="notebook-input" placeholder="Viết một suy nghĩ hoặc sự cố nhỏ hôm nay (hoàn toàn ẩn danh)..." oninput="autoResize(this)"></textarea>
                <button class="btn" style="margin-top:10px;" onclick="postToWall()">Gửi Lên Bức Tường 💌</button>
            </div>

            <div class="wall-wrapper-bg">
                <!-- Hình chim cánh cụt cầm thư fit giữa khung chat/wall (Opacity transparent 0.15) -->
                <img src="1789915316422_299025560367026467_299025560367026467_n.jpg" class="wall-watermark-center" alt="Penguin Letter">
                <div id="wallPostsContainer"></div>
            </div>
        </div>

        <!-- TAB 4: TIẾN TRÌNH (CÓ BACKGROUND WATERMARK) -->
        <div id="progress" class="tab-content tab-watermark-bg">
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

        <!-- TAB 5: TẬP THỞ (CÓ BACKGROUND WATERMARK) -->
        <div id="breathe" class="tab-content tab-watermark-bg">
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
                <audio id="breatheAudio" src="link_den_file_cua_ban.mp3" preload="auto"></audio>
                
                <div style="margin-top: 20px; width: 100%; text-align: center;">
                    <p style="font-size: 14px; margin-bottom: 10px; color: var(--text-muted);">* Nhạc thiền tĩnh tâm</p>
                    <iframe width="100%" height="80" src="https://www.youtube.com/embed/fuXfT4Rv_WM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>

        <!-- TAB 6: THỬ THÁCH 21 NGÀY (CÓ BACKGROUND WATERMARK & EMOJI CÁNH CỤT ĐẶC BIỆT) -->
        <div id="challenge21" class="tab-content tab-watermark-bg">
            <h2 style="color:var(--primary-dark); margin-bottom:15px;">Mindful 21 Ngày</h2>
            <div class="mindful-card">
                <h3 style="margin-bottom:10px;">Nhiệm vụ (<span id="current-day-label">Ngày 1</span>)</h3>
                <div class="challenge-box">
                    <strong style="font-size: 16px;" id="daily-task-mindful">Đang tải thử thách...</strong>
                </div>

                <div class="journal-form">
                    <p style="margin-bottom:10px;"><strong>Cảm giác của bạn hôm nay?</strong></p>
                    <div class="emoji-selector" id="emoji-list">
                        <span class="emoji" onclick="selectEmoji('😢')">😢</span>
                        <span class="emoji" onclick="selectEmoji('😕')">😕</span>
                        <span class="emoji" onclick="selectEmoji('😐')">😐</span>
                        <span class="emoji" onclick="selectEmoji('🙂')">🙂</span>
                        <!-- EMOJI ĐẶC BIỆT: Hình chim cánh cụt happy -->
                        <span class="emoji" onclick="selectEmoji('🐧')">
                            <img src="1789915299317_299025560367026467_299025560367026467_n.jpg" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;" alt="Penguin Emoji">
                        </span>
                    </div>
                    <textarea id="journal-entry" placeholder="Ghi nhận lại hôm nay bạn đã thực hiện ra sao..."></textarea>
                    <button class="btn-mindful" onclick="saveDailyProgress()">Lưu ghi nhận</button>
                </div>
                <div id="motivation-message" class="message-box"></div>
            </div>

            <div class="mindful-card">
                <h3>Bảng theo dõi</h3>
                <div class="tracker-grid" id="tracker-board"></div>
            </div>
        </div>

    </div>

    <script>
        // ==========================================
        // KHỞI TẠO HỆ THỐNG VÀ TIỆN ÍCH CHUNG
        // ==========================================
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
            }, 1200);
            
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
            updateStreak();
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

        function updateStreak() {
            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");
            document.getElementById("streakCount").innerText = streak;
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
        // LOGIC SPOTLIGHT & CHATBOT
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
                    resDiv.innerHTML = "<strong>🔍 Kết quả phân tích:</strong><br>Sự chú ý THỰC TẾ từ người khác chỉ khoảng <strong style='color:var(--primary); font-size:1.2rem;'>" + data.predictedPercent + "%</strong> (thay vì " + data.perceivedPercent + "%).<br><br>" + data.explanation + "<br><br><strong>Gợi ý tái định khung:</strong>" + reframesHtml;
                }
            } catch (err) {
                resDiv.innerHTML = "❌ Không thể kết nối hệ thống phân tích.";
            }
        }

        function saveJournal() {
            let streak = parseInt(localStorage.getItem("spotlight_streak") || "1");
            localStorage.setItem("spotlight_streak", streak + 1);
            updateStreak();
            alert("Trang sổ hôm nay đã lưu lại. Bạn đã làm rất tốt!");
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
        // LOGIC MINDFUL APP
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
            try { document.getElementById('breatheAudio').play(); } catch(e){}
            let pIndex = 0;
            let timeLeft = breathePhases[pIndex].time;
            const outerCircle = document.getElementById('circle-outer');
            const textEl = document.getElementById('breathe-text');
            const timerEl = document.getElementById('breathe-timer');

            function updatePhase() {
                textEl.innerText = breathePhases[pIndex].text;
                outerCircle.style.transform = \`scale(\${breathePhases[pIndex].scale})\`;
                timeLeft = breathePhases[pIndex].time;
                timerEl.innerText = timeLeft;
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
            let audio = document.getElementById('breatheAudio');
            try { audio.pause(); audio.currentTime = 0; } catch(e){}
            clearInterval(timerInterval);
            document.getElementById('circle-outer').style.transform = 'scale(1)';
            document.getElementById('breathe-text').innerText = 'Chuẩn bị';
            document.getElementById('breathe-timer').innerText = '4';
        }

        const mindfulTasks = [
            "Dành 15 phút đọc sách hoặc nghe podcast tích cực.",
            "Đi dạo 20 phút mà không mang theo điện thoại.",
            "Uống đủ 2 lít nước và ăn nhiều rau xanh hôm nay.",
            "Viết ra 3 điều bạn cảm thấy biết ơn lúc này.",
            "Dọn dẹp lại góc làm việc/phòng ngủ cho gọn gàng.",
            "Nhắn tin hỏi thăm một người bạn/người thân đã lâu không gặp.",
            "Thực hiện bài tập thở Box Breathing 5 lần."
        ];

        let mindfulAppData = JSON.parse(localStorage.getItem('mindfulAppData')) || {};
        let currentEmoji = '';
        
        const mStartDate = localStorage.getItem('mStartDate') || new Date().toDateString();
        if(!localStorage.getItem('mStartDate')) localStorage.setItem('mStartDate', mStartDate);
        
        const dayDiff = Math.floor((new Date() - new Date(mStartDate)) / (1000 * 60 * 60 * 24));
        const currentMindfulDay = Math.min(dayDiff + 1, 21); 

        function initMindfulChallengeData() {
            document.getElementById('current-day-label').innerText = \`Ngày \${currentMindfulDay}\`;
            const taskIndex = (new Date().getDate() + currentMindfulDay) % mindfulTasks.length;
            document.getElementById('daily-task-mindful').innerText = mindfulTasks[taskIndex];
            renderMindfulTracker();
            updateMindfulProgress();
        }

        function selectEmoji(emoji) {
            document.querySelectorAll('.emoji').forEach(el => el.classList.remove('selected'));
            if(event.target.classList.contains('emoji')) {
                event.target.classList.add('selected');
            } else {
                event.target.closest('.emoji').classList.add('selected');
            }
            currentEmoji = emoji;
        }

        function saveDailyProgress() {
            const journal = document.getElementById('journal-entry').value;
            if (!currentEmoji) return alert("Chọn 1 cảm xúc hôm nay nhé!");

            const displayEmoji = currentEmoji === '🐧' ? '🐧' : currentEmoji;
            mindfulAppData[\`day_\${currentMindfulDay}\`] = { emoji: displayEmoji, journal, completed: true };
            localStorage.setItem('mindfulAppData', JSON.stringify(mindfulAppData));

            const msgBox = document.getElementById('motivation-message');
            msgBox.innerText = "Tuyệt vời! Mỗi bước đi nhỏ đều tạo nên hành trình lớn.";
            msgBox.style.display = 'block';

            document.getElementById('journal-entry').value = '';
            document.querySelectorAll('.emoji').forEach(el => el.classList.remove('selected'));
            currentEmoji = '';

            renderMindfulTracker();
            updateMindfulProgress();
        }

        function renderMindfulTracker() {
            const board = document.getElementById('tracker-board');
            board.innerHTML = '';
            for (let i = 1; i <= 21; i++) {
                const dayData = mindfulAppData[\`day_\${i}\`];
                const isCompleted = dayData && dayData.completed;
                board.innerHTML += \`<div class="tracker-day \${isCompleted ? 'completed' : ''}"><strong>N.\${i}</strong><span>\${isCompleted ? dayData.emoji : '⚪'}</span></div>\`;
            }
        }

        function updateMindfulProgress() {
            const completedDays = Object.keys(mindfulAppData).filter(k => mindfulAppData[k].completed).length;
            const percentage = Math.min((completedDays / 21) * 100, 100);
            
            document.getElementById('main-progress').style.width = percentage + '%';
            document.getElementById('progress-text').innerText = \`\${completedDays}/21 ngày\`;
            document.getElementById('stat-days').innerText = completedDays;
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
