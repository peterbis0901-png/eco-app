const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. BẢO MẬT & CẤU HÌNH (Middleware)
// Xử lý triệt để lỗi CORS khi gọi API từ các domain khác nhau
app.use(cors({
    origin: '*', // Trong thực tế (Production), hãy thay '*' bằng domain thật của bạn
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Tự động parse JSON body từ Request
app.use(express.json());

// 2. MÔ PHỎNG DATABASE (In-memory Database)
// Giúp app chạy ngay trên Render mà không cần setup DB bên ngoài
let tasks = [
    { id: 1, title: 'Thiết kế hệ thống phân tán', status: 'completed' },
    { id: 2, title: 'Tối ưu hóa truy vấn Database', status: 'pending' }
];

// 3. XÂY DỰNG API (Backend Endpoints)
// Lấy danh sách (Có xử lý lỗi bất đồng bộ cơ bản)
app.get('/api/tasks', async (req, res, next) => {
    try {
        // Mô phỏng delay mạng
        await new Promise(resolve => setTimeout(resolve, 300));
        res.json({ success: true, data: tasks });
    } catch (error) {
        next(error); // Chuyển lỗi xuống Middleware xử lý tập trung
    }
});

// Thêm mới
app.post('/api/tasks', async (req, res, next) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ success: false, message: 'Thiếu tiêu đề!' });
        
        const newTask = { id: Date.now(), title, status: 'pending' };
        tasks.push(newTask);
        res.status(201).json({ success: true, data: newTask });
    } catch (error) {
        next(error);
    }
});

// 4. GIAO DIỆN FRONTEND (Đóng gói SSR siêu nhẹ)
// Render trực tiếp HTML chứa Vanilla JS và CSS
app.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fullstack Task Manager</title>
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f4f4f9; color: #333; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
            h1 { border-bottom: 2px solid #3498db; padding-bottom: 0.5rem; }
            .task-card { background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem; display: flex; justify-content: space-between; }
            .completed { text-decoration: line-through; color: #7f8c8d; }
            input { padding: 0.5rem; width: 70%; border: 1px solid #ccc; border-radius: 4px; }
            button { padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #2980b9; }
            #error-msg { color: #e74c3c; margin-bottom: 1rem; }
        </style>
    </head>
    <body>
        <h1>Kiến trúc hệ thống - Mini App</h1>
        <div style="margin-bottom: 1rem;">
            <input type="text" id="taskInput" placeholder="Nhập công việc mới...">
            <button onclick="addTask()">Thêm</button>
        </div>
        <div id="error-msg"></div>
        <div id="taskList">Đang tải dữ liệu...</div>

        <script>
            // Xử lý gọi API mượt mà, tránh lỗi crash do bất đồng bộ
            async function fetchTasks() {
                try {
                    const response = await fetch('/api/tasks');
                    if (!response.ok) throw new Error('Lỗi mạng');
                    const { data } = await response.json();
                    renderTasks(data);
                } catch (error) {
                    document.getElementById('error-msg').innerText = 'Không thể tải dữ liệu: ' + error.message;
                }
            }

            async function addTask() {
                const input = document.getElementById('taskInput');
                const title = input.value.trim();
                if (!title) return;

                try {
                    // Reset lỗi
                    document.getElementById('error-msg').innerText = '';
                    
                    const response = await fetch('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title })
                    });
                    
                    if (!response.ok) throw new Error('Thêm thất bại');
                    input.value = ''; // Clear input
                    fetchTasks(); // Reload list
                } catch (error) {
                    document.getElementById('error-msg').innerText = error.message;
                }
            }

            function renderTasks(tasks) {
                const list = document.getElementById('taskList');
                list.innerHTML = tasks.map(t => 
                    \`<div class="task-card">
                        <span class="\${t.status === 'completed' ? 'completed' : ''}">\${t.title}</span>
                        <span style="font-size: 0.8rem; background: #eee; padding: 2px 6px; border-radius: 12px;">\${t.status}</span>
                    </div>\`
                ).join('');
            }

            // Khởi chạy khi load trang
            window.onload = fetchTasks;
        </script>
    </body>
    </html>
    `;
    res.send(htmlContent);
});

// 5. BẮT LỖI TẬP TRUNG (Global Error Handler)
// Đảm bảo server không bị crash (treo) khi có lỗi logic hoặc lỗi DB
app.use((err, req, res, next) => {
    console.error('[Error System]:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Lỗi máy chủ nội bộ. Đội ngũ kỹ thuật đang xử lý.' 
    });
});

// 6. KHỞI CHẠY SERVER CHUẨN CLOUD
// Lắng nghe trên 0.0.0.0 để tương thích với Docker/Kubernetes và nền tảng Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`🚀 Hệ thống Fullstack đang chạy tại port \${PORT}\`);
});
