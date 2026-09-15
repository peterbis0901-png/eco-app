const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ==========================================
// TẦNG 1: MIDDLEWARE & SECURITY (KIẾN TRÚC BẢO MẬT)
// ==========================================
// 1. Bảo vệ HTTP Headers (Chống XSS, Sniffing)
app.use(helmet({ contentSecurityPolicy: false })); // Tắt CSP tạm thời để chạy inline script cho frontend gộp

// 2. Cấu hình CORS (Giải quyết lỗi chặn API từ trình duyệt)
app.use(cors({
  origin: '*', // Trong thực tế, hãy đổi thành domain của frontend (VD: 'https://myapp.com')
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Cấu hình Multer lưu file trên RAM (Tránh lỗi ghi file không quyền trên Cloud)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB chống DDoS
});

// ==========================================
// TẦNG 2: CORE LOGIC & ENGINE
// ==========================================
// Đọc nội dung file .docx
function parseDocxBuffer(buffer) {
  try {
    const str = buffer.toString('utf8', 0, buffer.length);
    const matches = str.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
    if (!matches.length) return 'Tài liệu không chứa văn bản thuần hoặc file bị hỏng.';
    return matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ');
  } catch (err) {
    throw new Error('Lỗi Engine: Không thể phân tích cấu trúc file .docx.');
  }
}

// Bộ quy tắc chuẩn System Architecture & Security
const SPOTLIGHT_RULES = [
  { id: 'AUTH_ENPOINT', name: 'Bảo vệ Endpoint (API)', category: 'Security', level: 'CRITICAL', description: 'Kiểm tra phân quyền JWT. Tránh lộ dữ liệu nhạy cảm qua DevTools.' },
  { id: 'TOKEN_STORAGE', name: 'Lưu Token sai cách', category: 'Security', level: 'HIGH', description: 'Cảnh báo lưu JWT ở localStorage. Bắt buộc dùng HttpOnly Cookie chống XSS.' },
  { id: 'CORS_CONFIG', name: 'Lỗi CORS & Network', category: 'DevOps', level: 'HIGH', description: 'Xác minh Frontend/Backend giao tiếp đúng cấu hình domain/cổng.' },
  { id: 'N1_QUERY', name: 'N+1 Queries & Index DB', category: 'Database', level: 'HIGH', description: 'Tối ưu hoá truy vấn SQL/NoSQL bằng kỹ thuật JOIN, DataLoader và tạo Index.' },
  { id: 'STATE_MGMT', name: 'Spaghetti Code & State', category: 'Architecture', level: 'MEDIUM', description: 'Tách biệt Logic/UI, sử dụng State Management để luồng dữ liệu không bị rối.' }
];

// ==========================================
// TẦNG 3: API ENDPOINTS (ROUTING)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', system: 'Architect Spotlight Engine', timestamp: new Date() });
});

app.post('/api/spotlight/check', (req, res) => {
  const { query = '', stack = 'MERN' } = req.body;
  const filteredRules = SPOTLIGHT_RULES.filter(rule => 
    rule.name.toLowerCase().includes(query.toLowerCase()) || 
    rule.category.toLowerCase().includes(query.toLowerCase())
  );
  
  res.status(200).json({ query, stack, totalRules: SPOTLIGHT_RULES.length, results: filteredRules.length ? filteredRules : SPOTLIGHT_RULES });
});

// Xử lý File an toàn với try-catch (Chống crash Node.js)
app.post('/api/upload-docx', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Vui lòng chọn định dạng file .docx' });

    const extractedText = parseDocxBuffer(req.file.buffer);
    const leaks = [];
    
    // Rà soát bảo mật môi trường và dữ liệu
    if (/API_KEY|SECRET|PASSWORD|DATABASE_URL|JWT_SECRET/i.test(extractedText)) {
      leaks.push('Rò rỉ khóa bảo mật/Biến môi trường (Hardcoded Secrets).');
    }
    if (/http:\/\//i.test(extractedText)) {
      leaks.push('Sử dụng liên kết HTTP không mã hóa (Khuyến nghị HTTPS).');
    }

    res.status(200).json({
      filename: req.file.originalname,
      sizeBytes: req.file.size,
      textPreview: extractedText.substring(0, 300) + (extractedText.length > 300 ? '...' : ''),
      securityAudit: { passed: leaks.length === 0, warnings: leaks }
    });
  } catch (error) {
    next(error); // Đẩy lỗi về Global Error Handler
  }
});

// ==========================================
// TẦNG 4: GLOBAL ERROR HANDLER (CHỐNG EXITED STATUS 1)
// ==========================================
app.use((err, req, res, next) => {
  console.error('[System Error]:', err.message);
  res.status(500).json({
    error: 'Hệ thống gặp sự cố nội bộ. Đội ngũ kỹ thuật đang xử lý.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==========================================
// TẦNG 5: FRONTEND (UI)
// ==========================================
const HTML_UI = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Architect Spotlight - System Auditor</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col items-center p-6">
  
  <header class="w-full max-w-4xl flex justify-between items-center py-4 border-b border-slate-800">
    <div class="flex items-center space-x-3">
      <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
      <h1 class="text-xl font-bold tracking-wide text-white">Architect Spotlight <span class="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">Pro 15y</span></h1>
    </div>
    <div class="text-sm text-slate-400">Nhấn <kbd class="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-200">Cmd + K</kbd> hoặc <kbd class="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-200">Ctrl + K</kbd></div>
  </header>

  <main class="w-full max-w-4xl mt-8 space-y-6">
    <div onclick="openSpotlight()" class="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-indigo-500/50 transition flex items-center justify-between text-slate-400 shadow-2xl">
      <div class="flex items-center space-x-3">
        <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <span>Tìm kiếm quy tắc kiến trúc, lỗ hổng bảo mật, CORS, DB N+1...</span>
      </div>
      <span class="text-xs bg-slate-800 px-2.5 py-1 rounded-md text-slate-400">Search</span>
    </div>

    <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 backdrop-blur">
      <h2 class="text-lg font-semibold text-slate-200 mb-2">Kiểm tra File .docx & Dữ liệu nhạy cảm</h2>
      <p class="text-sm text-slate-400 mb-4">Tải file .docx lên để tự động bóc tách dữ liệu và rà soát rò rỉ token, credentials.</p>
      
      <div class="flex items-center justify-center w-full">
        <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 hover:border-indigo-500/50 transition">
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-8 h-8 mb-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p class="text-sm text-slate-400"><span class="font-semibold text-indigo-400">Tải file .docx</span> hoặc kéo thả vào đây</p>
          </div>
          <input id="docxInput" type="file" accept=".docx" class="hidden" onchange="uploadDocx()" />
        </label>
      </div>
      <div id="docxResult" class="hidden mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-sm"></div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
      <h2 class="text-lg font-semibold text-slate-200 mb-4">Danh Mục Audit Hệ Thống Chủ Động</h2>
      <div id="rulesList" class="space-y-3"></div>
    </div>
  </main>

  <div id="spotlightModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md hidden justify-center pt-20 px-4 z-50">
    <div class="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden h-fit">
      <div class="p-4 border-b border-slate-800 flex items-center space-x-3">
        <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input id="spotlightInput" type="text" placeholder="Gõ từ khóa (CORS, Token, N+1, XSS...)" class="w-full bg-transparent text-white outline-none placeholder-slate-500 text-base" oninput="runSearch()" />
        <button onclick="closeSpotlight()" class="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white">ESC</button>
      </div>
      <div id="modalResults" class="max-h-96 overflow-y-auto p-4 space-y-2"></div>
    </div>
  </div>

  <script>
    async function fetchRules(query = '') {
      try {
        const res = await fetch('/api/spotlight/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        return await res.json();
      } catch (err) {
        console.error('Lỗi kết nối API', err);
        return { results: [] };
      }
    }

    function renderRules(rules, targetId) {
      const container = document.getElementById(targetId);
      container.innerHTML = rules.map(r => \`
        <div class="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="font-medium text-slate-200">\${r.name}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">\${r.category}</span>
            </div>
            <p class="text-xs text-slate-400">\${r.description}</p>
          </div>
          <span class="text-[10px] font-mono font-bold px-2 py-1 rounded self-start sm:self-center \${r.level === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">\${r.level}</span>
        </div>
      \`).join('');
    }

    async function init() {
      const data = await fetchRules();
      if(data.results) renderRules(data.results, 'rulesList');
    }

    function openSpotlight() {
      document.getElementById('spotlightModal').classList.remove('hidden');
      document.getElementById('spotlightModal').classList.add('flex');
      document.getElementById('spotlightInput').focus();
      runSearch();
    }

    function closeSpotlight() {
      document.getElementById('spotlightModal').classList.add('hidden');
      document.getElementById('spotlightModal').classList.remove('flex');
    }

    async function runSearch() {
      const query = document.getElementById('spotlightInput').value;
      const data = await fetchRules(query);
      if(data.results) renderRules(data.results, 'modalResults');
    }

    async function uploadDocx() {
      const fileInput = document.getElementById('docxInput');
      if (!fileInput.files.length) return;

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      try {
        const res = await fetch('/api/upload-docx', { method: 'POST', body: formData });
        const data = await res.json();

        if(data.error) throw new Error(data.error);

        const resBox = document.getElementById('docxResult');
        resBox.classList.remove('hidden');
        resBox.innerHTML = \`
          <div class="font-semibold text-indigo-400 mb-1">File: \${data.filename} (\${Math.round(data.sizeBytes/1024)} KB)</div>
          <div class="text-slate-300 mb-3 text-xs leading-relaxed"><strong>Data:</strong> "\${data.textPreview}"</div>
          <div class="text-xs p-3 rounded \${data.securityAudit.passed ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-rose-950/60 text-rose-400 border border-rose-800'}">
            \${data.securityAudit.passed ? '✓ Tốt: Không phát hiện rò rỉ dữ liệu nhạy cảm hoặc Token tĩnh.' : '⚠️ Cảnh báo Kiến trúc: ' + data.securityAudit.warnings.join(', ')}
          </div>
        \`;
      } catch (err) {
        alert('Lỗi xử lý file: ' + err.message);
      }
    }

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSpotlight(); }
      if (e.key === 'Escape') closeSpotlight();
    });

    init();
  </script>
</body>
</html>
`;

app.get('*', (req, res) => res.send(HTML_UI));

// ==========================================
// TẦNG 6: KHỞI ĐỘNG SERVER (DYNAMIC PORT MAPPING)
// ==========================================
// ĐÂY LÀ CHÌA KHÓA FIX LỖI CRASH TRÊN RENDER: Lấy Port động từ môi trường.
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Architect Engine] Server deployed & running safely on port ${PORT}`);
});
