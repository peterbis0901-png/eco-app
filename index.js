/**
 * 🌱 ECOCONNECT HCM - TRẠM TỔNG SIÊU HOÀN CHỈNH V1.2
 * - Đã fix lỗi Exited with status 1 (Do trùng lặp code).
 * - Đã fix lỗi EADDRINUSE (Do gọi app.listen 2 lần).
 * - Tối ưu thứ tự Middleware (Fixed req.body rỗng).
 * - Giao diện React x Leaflet Bản đồ x Tailwind x Modal flow.
 * - Gửi mail OTP thật (3 chữ, 3 số).
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// =========================================================================
// 1. MIDDLEWARE CẤU HÌNH (BẮT BUỘC NẰM ĐẦU)
// =========================================================================
app.use(cors({ origin: '*' }));
app.use(express.json()); // Để đọc dữ liệu JSON gửi lên từ Frontend

// =========================================================================
// 2. 💾 DATABASE MÔ PHỎNG (LƯU TRONG RAM) & HELPERS
// =========================================================================
let users = []; // Lưu thông tin user đã đăng ký xong
let otpStore = {}; // Lưu mã OTP tạm thời: { email: { code, expires, userData } }

// Database báo cáo mô phỏng cho Bản đồ
let reports = [
    { id: "REP-001", title: "Rác thải bừa bãi chân cầu", location: "Quận 8", status: "Chờ xử lý", type: "Trash", severity: "Severe", lat: 10.742, lng: 106.635 },
    { id: "REP-002", title: "Nước thải đen kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", severity: "Warning", lat: 10.782, lng: 106.685 },
    { id: "REP-003", title: "Cây xanh đổ gãy sau mưa", location: "Quận 1", status: "Đã xử lý", type: "Tree", severity: "Normal", lat: 10.775, lng: 106.698 }
];

// Hàm sinh mã OTP ngẫu nhiên: 3 chữ cái IN HOA + 3 chữ số (VD: A1B2C3) đúng chuẩn Figma
function generateCustomOTP() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let charPart = ''; let numPart = '';
    for (let i = 0; i < 3; i++) {
        charPart += letters.charAt(Math.floor(Math.random() * letters.length));
        numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return charPart[0] + numPart[0] + charPart[1] + numPart[1] + charPart[2] + numPart[2];
}

// =========================================================================
// 3. 📧 CẤU HÌNH GỬI MAIL (Check biến môi trường Render)
// =========================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'peterbis0901@gmail.com', 
        pass: process.env.EMAIL_PASS || 'wmws kurd nlft dlko' 
    }
});

// =========================================================================
// 4. 🚀 API ENDPOINTS HẬU ĐÀI (BACKEND LOGIC)
// =========================================================================

// A. API Lấy danh sách báo cáo cho bản đồ
app.get('/api/reports', (req, res) => res.json(reports));

// B. API ĐĂNG KÝ - BƯỚC 1: Nhận thông tin & gửi mail OTP
app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Họ tên, Email, Mật khẩu nha ní!' });
    }

    // Kiểm tra user tồn tại (mô phỏng)
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email này đã được đăng ký rồi bro!' });
    }

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; // Mã có hiệu lực trong 5 phút

    // Lưu tạm vào otpStore
    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    // Cấu hình nội dung Mail
    const mailOptions = {
        from: `"EcoConnect HCM" <${process.env.EMAIL_USER || 'peterbis0901@gmail.com'}>`,
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký Tài Khoản',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #fff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="background-color: #10b981; color: white; width: 50px; height: 50px; border-radius: 12px; display: inline-flex; justify-content: center; align-items: center; font-size: 24px;">🌿</div>
                </div>
                <h2 style="color: #0f172a; text-align: center; margin-bottom: 10px;">Xác Thực Tài Khoản</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Chào <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Bạn đang đăng ký tài khoản vai trò <strong>${role}</strong> trên hệ thống EcoConnect HCM. Dưới đây là mã xác thực OTP của bạn:</p>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #10b981; margin: 25px 0; border-radius: 12px; border: 1px solid #e2e8f0;">
                    ${otpCode}
                </div>
                <p style="color: #64748b; font-size: 13px; text-align: center; background-color: #fefce8; padding: 10px; border-radius: 8px;">Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">Đây là email tự động, vui lòng không phản hồi.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mã OTP đã gửi đi thành công! Check mail nha ní.' });
    } catch (error) {
        console.error('Lỗi gửi mail thật:', error);
        res.status(500).json({ success: false, message: 'Gửi mail thất bại! Ní check lại EMAIL_PASS trên Render nha.' });
    }
});

// C. API ĐĂNG KÝ - BƯỚC 2: Kiểm tra OTP & Tạo user
app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];

    if (!session) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy phiên đăng ký hoặc mã đã hết hạn!' });
    }

    if (Date.now() > session.expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn rồi bro!' });
    }

    if (session.code.toUpperCase() !== code.toUpperCase().trim()) {
        return res.status(400).json({ success: false, message: 'Mã xác thực nhập vào sai rồi ní ơi!' });
    }

    // OTP Chuẩn -> Đẩy user vào Database RAM (Chính thức tạo tài khoản)
    users.push(session.userData);
    delete otpStore[email]; // Xóa OTP sau khi dùng xong

    console.log("🎉 User mới đăng ký thành công:", session.userData.email);
    res.status(200).json({ success: true, message: 'Xác thực hoàn tất! Tài khoản đã được tạo.' });
});

// =========================================================================
// 5. 🎨 FRONTEND GIAO DIỆN "HỒI SINH" (REACT + LEAFLET + TAILWIND)
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect HCM - Trạm Tổng Thông Minh</title>
        
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
        
        <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; overflow: hidden; height: 100vh; }
            
            /* UI Helpers */
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
            .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
            
            /* Map Custon */
            #map { height: 100%; width: 100%; border-radius: 24px; z-index: 1; }
            .leaflet-popup-content-wrapper { background: #1e293b; color: #fff; border-radius: 12px; padding: 5px; }
            .leaflet-popup-tip { background: #1e293b; }
            
            /* Animation */
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            
            /* Scrollbar */
            .custom-scroll::-webkit-scrollbar { width: 5px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
            
            /* Fix input active border */
            input:focus { border-color: #10b981 !important; ring-color: #10b981 !important; }
        </style>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            // =========================================================================
            // COMPONENT: BẢN ĐỒ INTERACTIVE (LEAFLET)
            // =========================================================================
            function MapView({ reports }) {
                const mapRef = React.useRef(null);
                const mapInstance = React.useRef(null);

                React.useEffect(() => {
                    if (!mapInstance.current) {
                        // Khởi tạo bản đồ tâm TP.HCM
                        mapInstance.current = L.map('map', { zoomControl: false }).setView([10.776, 106.695], 13);
                        
                        // Thêm Map Tile (Dark Mode mượt)
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        }).addTo(mapInstance.current);
                        
                        // Đưa nút Zoom sang phải
                        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
                    }

                    // Thêm Markers từ dữ liệu báo cáo
                    if (reports && reports.length > 0) {
                        // Xóa markers cũ nếu có
                        mapInstance.current.eachLayer((layer) => { if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer); });

                        reports.forEach(rep => {
                            // Màu sắc theo độ khẩn cấp
                            const color = rep.severity === 'Severe' ? '#ef4444' : (rep.severity === 'Warning' ? '#f59e0b' : '#10b981');
                            
                            const customIcon = L.divIcon({
                                className: 'custom-icon',
                                html: \`<div style="background-color: \${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px \${color};"></div>\`,
                                iconSize: [15, 15], iconAnchor: [7, 7]
                            });

                            L.marker([rep.lat, rep.lng], { icon: customIcon })
                             .addTo(mapInstance.current)
                             .bindPopup(\`
                                <div class="p-1 text-sm">
                                    <strong class="text-emerald-400">\${rep.id}</strong>: \${rep.title}<br/>
                                    <span class="text-slate-400">📍 \${rep.location}</span><br/>
                                    <span class="inline-block mt-1 px-2 py-0.5 rounded text-xs \${rep.status === 'Đã xử lý' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">\${rep.status}</span>
                                </div>
                             \`);
                        });
                    }

                }, [reports]);

                return <div id="map" className="shadow-inner"></div>;
            }

            // =========================================================================
            // COMPONENT CHÍNH: APP ROUTING & UI
            // =========================================================================
            function App() {
                // Core States
                const [user, setUser] = React.useState(null); // Lưu user khi đăng ký xong
                const [view, setView] = React.useState('auth'); // Màn hình: auth (đăng ký) / dashboard
                const [authTab, setAuthTab] = React.useState('register'); // register / login (chỉ mô phỏng)
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                
                // Modal States
                const [showTerms, setShowTerms] = React.useState(false);
                const [showOtpModal, setShowOtpModal] = React.useState(false);
                
                // Form & API States
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', terms: false });
                const [otpInput, setOtpInput] = React.useState('');
                const [loading, setLoading] = React.useState(false);
                const [targetEmail, setTargetEmail] = React.useState('');

                // Dashboard Data
                const [reports, setReports] = React.useState([]);

                // Load dữ liệu khi vào dashboard
                React.useEffect(() => {
                    if(view === 'dashboard') {
                        fetch('/api/reports').then(res => res.json()).then(data => setReports(data)).catch(err => console.error("Lỗi tải reports:", err));
                    }
                }, [view]);

                // --- XỬ LÝ LOGIC API ---

                // 1. Bấm Đăng ký -> Gọi API gửi OTP thực tế
                const handleRegisterRequest = async (e) => {
                    e.preventDefault();
                    if(!formData.name || !formData.email || !formData.password) return alert("Điền đủ thông tin nha ní!");
                    if(!formData.terms) return alert("Ní phải tick đồng ý điều khoản sử dụng!");

                    setLoading(true);
                    try {
                        const res = await fetch('/api/auth/register-request', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({...formData, role: currentRole})
                        });
                        const data = await res.json();
                        setLoading(false);

                        if(data.success) {
                            setTargetEmail(formData.email);
                            setShowOtpModal(true); // Bật Modal OTP (chuẩn thiết kế)
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        setLoading(false);
                        alert("Lỗi kết nối server rồi bro ơi!");
                    }
                };

                // 2. Bấm Xác nhận OTP -> Hoàn tất đăng ký online
                const handleVerifyOtp = async () => {
                    if(!otpInput) return alert("Nhập mã OTP vào đã ní ơi!");

                    try {
                        const res = await fetch('/api/auth/register-verify', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: targetEmail, code: otpInput })
                        });
                        const data = await res.json();

                        if(data.success) {
                            alert('🎉 Đăng ký thành công mỹ mãn! Chuyển vào Trạm tổng nha.');
                            setShowOtpModal(false);
                            setUser({email: targetEmail, name: formData.name, role: currentRole}); // Lưu user tạm
                            setView('dashboard'); // Chuyển màn hình
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        alert("Lỗi kết nối xác thực rồi bro!");
                    }
                };

                // Helper toggle
                const switchAuth = (tab) => { setAuthTab(tab); setOtpInput(''); setFormData({name:'', email:'', password:'', terms:false}); }

                // =========================================================================
                // RENDER: MÀN HÌNH ĐĂNG KÝ (AUTH) - THEO FIGMA
                // =========================================================================
                if (view === 'auth') {
                    return (
                        <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn">
                            {/* Card chính */}
                            <div className="glass w-full max-w-[450px] p-10 rounded-[32px] shadow-2xl relative text-center">
                                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-5">
                                    <span className="material-icons-round text-3xl">spa</span>
                                </div>
                                <h1 className="text-2xl font-extrabold mb-1.5">EcoConnect</h1>
                                <p className="text-slate-400 text-sm mb-8">Chung tay bảo vệ môi trường Thành phố</p>

                                {/* Form Đăng ký */}
                                {authTab === 'register' && (
                                    <form onSubmit={handleRegisterRequest} className="space-y-4 animate-fadeIn">
                                        <input type="text" placeholder="Họ và tên" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                        <input type="email" placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                        <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                        
                                        {/* Role Tabs */}
                                        <div className="grid grid-cols-3 gap-2 py-1">
                                            {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => (
                                                <button type="button" key={r} onClick={() => setCurrentRole(r)} className={\`py-2.5 text-[11px] font-bold rounded-lg border transition-all \${currentRole === r ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-950/30 border-slate-700 text-slate-400'}\`}>{r}</button>
                                            ))}
                                        </div>

                                        {/* Checkbox Điều khoản */}
                                        <div className="flex items-start text-left gap-2.5 pt-1 pb-3 text-[13px] text-slate-400 line-height-1.4">
                                            <input type="checkbox" id="policy" className="mt-1 accent-emerald-500 h-4 w-4" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                            <label htmlFor="policy">Tui đã đọc và đồng ý với <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>Chính sách & Điều khoản sử dụng</span> của EcoConnect HCM.</label>
                                        </div>

                                        <button type="submit" className="w-full py-3.5 emerald-gradient rounded-2xl text-slate-950 font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex justify-center items-center gap-2" disabled={loading}>
                                            {loading ? <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : 'Đăng ký tài khoản'}
                                        </button>
                                        <p className="text-sm text-slate-400 pt-3">Đã có tài khoản? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => switchAuth('login')}>Đăng nhập</span></p>
                                    </form>
                                )}

                                {/* Form Đăng nhập (Mô phỏng) */}
                                {authTab === 'login' && (
                                    <form className="space-y-4 animate-fadeIn pt-4">
                                        <input type="email" placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none" required />
                                        <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none" required />
                                        <button type="button" className="w-full py-3.5 emerald-gradient rounded-2xl text-slate-950 font-bold text-sm uppercase" onClick={() => alert("Đăng nhập thành công (Mô phỏng)!")}>Đăng nhập</button>
                                        <p className="text-sm text-slate-400 pt-3">Chưa có tài khoản? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => switchAuth('register')}>Đăng ký</span></p>
                                    </form>
                                )}
                            </div>

                            {/* =========================================================================
                                🔲 MODAL: CHÍNH SÁCH & ĐIỀU KHOẢN (ĐÃ FIX THEO ẢNH CỦA NI)
                                ========================================================================= */}
                            {showTerms && (
                                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="glass w-full max-w-[500px] rounded-3xl p-7 border border-slate-700">
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-lg font-bold text-emerald-400">Chính Sách & Điều Khoản Sử Dụng</h3>
                                            <span className="material-icons-round text-slate-500 cursor-pointer hover:text-white" onClick={() => setShowTerms(false)}>close</span>
                                        </div>
                                        {/* Nội dung scroll */}
                                        <div className="space-y-4 text-sm text-slate-300 h-[300px] overflow-y-auto pr-3 custom-scroll line-height-1.6 text-left">
                                            <p><strong className="text-emerald-400">1. Quy định chung:</strong> Chào mừng bạn đến với EcoConnect. Nền tảng được xây dựng nhằm mục đích bảo vệ môi trường, kết nối cộng đồng tại TP.HCM. Bạn cam kết cung cấp thông tin xác thực khi đăng ký.</p>
                                            <p><strong className="text-red-400">2. Hành vi bị cấm:</strong> Nghiêm cấm xài ngôn từ thô tục, chửi thề, lăng mạ người khác. Nghiêm cấm đăng tin giả, nội dung phản cảm bạo lực.</p>
                                            <div className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded-r-lg text-xs">
                                                <strong>⚠️ Quy chế xử phạt:</strong> Vi phạm nhẹ sẽ bị ẩn nội dung & cảnh cáo. Vi phạm nghiêm trọng (chửi thề vi phạm thuần phong mỹ tục) sẽ bị <strong>KHOÁ TÀI KHOẢN VĨNH VIỄN</strong> và chuyển dữ liệu cho cơ quan chức năng.
                                            </div>
                                        </div>
                                        <button className="w-full mt-6 py-3 bg-emerald-600 rounded-xl font-bold text-sm" onClick={() => { setFormData({...formData, terms: true}); setShowTerms(false); }}>Tôi đã đọc và đồng ý</button>
                                    </div>
                                </div>
                            )}

                            {/* =========================================================================
                                🔲 MODAL: XÁC THỰC EMAIL OTP (3 CHỮ, 3 SỐ - FIGMA MẪU)
                                ========================================================================= */}
                            {showOtpModal && (
                                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="glass w-full max-w-[400px] rounded-3xl p-8 border border-emerald-500/30 text-center shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold">Xác thực Email</h3>
                                            <span className="material-icons-round text-slate-500 cursor-pointer" onClick={() => setShowOtpModal(false)}>close</span>
                                        </div>
                                        <p className="text-sm text-slate-400 text-left mb-6 line-height-1.5">
                                            Vui lòng nhập mã gồm 6 ký tự <strong className="text-white">(3 chữ, 3 số)</strong> đã được gửi đến email <strong className="text-emerald-400">{targetEmail}</strong>
                                        </p>
                                        <input type="text" placeholder="VD: A1B2C3" maxLength="6" className="w-full bg-slate-900 border-2 border-emerald-500 p-4 rounded-xl text-center text-3xl font-black tracking-[8px] uppercase text-emerald-400 focus:outline-none mb-6 shadow-inner" onChange={e => setOtpInput(e.target.value)} value={otpInput} />
                                        <div className="flex gap-3">
                                            <button className="flex-1 py-3 bg-slate-800 rounded-xl font-semibold text-sm text-slate-300" onClick={() => setShowOtpModal(false)}>Hủy</button>
                                            <button className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-sm" onClick={handleVerifyOtp}>Tạo Tài Khoản</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                // =========================================================================
                // RENDER: MÀN HÌNH CHÍNH (DASHBOARD + MAP HỒI SINH)
                // =========================================================================
                return (
                    <div className="h-screen flex animate-fadeIn overflow-hidden">
                        {/* Sidebar */}
                        <aside className="w-64 glass m-4 mr-0 rounded-3xl p-6 flex flex-col z-10 border border-slate-800 shadow-xl">
                            <div className="flex items-center gap-3 mb-10 pb-2 border-b border-slate-800">
                                <span className="material-icons-round text-emerald-400 text-3xl">spa</span>
                                <h1 className="text-xl font-bold">EcoConnect</h1>
                            </div>
                            <nav className="space-y-3 flex-1">
                                {['home', 'map', 'community', 'chat'].map(tab => (
                                    <button key={tab} onClick={() => setCurrentTab(tab)} className={\`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all \${currentTab === tab ? 'emerald-gradient text-slate-950 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}\`}>
                                        <span className="material-icons-round text-xl">
                                            {tab === 'home' ? 'dashboard' : (tab === 'map' ? 'map' : (tab === 'community' ? 'groups' : 'forum'))}
                                        </span>
                                        <span className="capitalize">{tab === 'home' ? 'Tổng quan' : (tab === 'map' ? 'Bản đồ nóng' : tab)}</span>
                                    </button>
                                ))}
                            </nav>
                            <div className="bg-slate-800 p-4 rounded-2xl text-center text-xs text-slate-400 border border-slate-700">🌿 Phiên bản Trạm Tổng V1.2</div>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 p-4 flex flex-col h-screen overflow-hidden">
                            {/* Header */}
                            <header className="glass rounded-2xl p-4 mb-4 flex justify-between items-center border border-slate-800 shadow-lg">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <span className="material-icons-round text-emerald-400">waving_hand</span>
                                    Chào ní, <span className="text-emerald-400">{user?.name || targetEmail}</span>!
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-bold">{user?.role}</span>
                                    <button className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-950 hover:text-red-300 transition-all" onClick={() => window.location.reload()} title="Đăng xuất">
                                        <span className="material-icons-round text-sm">logout</span>
                                    </button>
                                </div>
                            </header>

                            {/* Content Area - CHỖ CHỨA BẢN ĐỒ HỒI SINH */}
                            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                                {/* Cột 1+2: Bản đồ nóng */}
                                <div className="col-span-2 glass rounded-3xl p-3 flex flex-col border border-slate-800 shadow-2xl relative min-h-0">
                                    <div className="flex justify-between items-center p-3 absolute top-5 left-5 right-5 z-10 glass rounded-xl border border-slate-700/50">
                                        <h3 className="font-bold flex items-center gap-2 text-sm">📍 Bản đồ sự cố Môi trường TP.HCM</h3>
                                        <span className="text-xs text-slate-400 font-medium">Cập nhật thực thời</span>
                                    </div>
                                    <div className="flex-1 rounded-2xl overflow-hidden mt-0 z-1">
                                        {/* GỌI COMPONENT BẢN ĐỒ */}
                                        <MapView reports={reports} />
                                    </div>
                                </div>
                                
                                {/* Cột 3: Danh sách sự cố */}
                                <div className="glass rounded-3xl p-5 border border-slate-800 flex flex-col shadow-xl min-h-0">
                                    <h3 className="font-bold mb-5 flex items-center gap-2">🚨 Báo cáo mới nhất ({reports.length})</h3>
                                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scroll min-h-0">
                                        {reports.map(rep => (
                                            <div key={rep.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-emerald-800 transition-all cursor-pointer">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="font-bold text-emerald-400">{rep.id}</span>
                                                    <span className={\`font-medium \${rep.severity === 'Severe' ? 'text-red-400' : 'text-amber-400'}\`}>{rep.location}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-white mb-2">{rep.title}</p>
                                                <span className={\`px-2 py-0.5 rounded text-[11px] font-bold \${rep.status === 'Đã xử lý' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}\`}>{rep.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                );
            }

            // Gắn React vào DOM
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        </script>
    </body>
    </html>
    `);
});

// =========================================================================
// 6. 🚀 KHỞI ĐỘNG SERVER LẮG NGHE (DUY NHẤT Ở CUỐI FILE)
// =========================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🎉 EcoConnect Trạm Tổng đã LIVE online thành công!`);
    console.log(`🌐 Cổng chạy: ${PORT}`);
    console.log(`👉 Truy cập link Render của ní để test nha.`);
    console.log(`⚠️ Nhớ check EMAIL_USER/PASS trên Render nếu ko gửi đc mail.`);
    console.log(`--------------------------------------------------`);
});
