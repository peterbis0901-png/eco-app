/**
 * 🌱 ECOCONNECT HCM - BẢN FIX CUỐI CÙNG V1.3
 * - Bổ sung Form nhập mã Cán bộ (Chỉ hiện khi chọn Cán bộ).
 * - Fix cứng cứng vụ Email (Xóa khoảng trắng mật khẩu).
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// 1. MIDDLEWARE
app.use(cors({ origin: '*' }));
app.use(express.json()); 

// 2. DATABASE MÔ PHỎNG
let users = []; 
let otpStore = {}; 
let reports = [
    { id: "REP-001", title: "Rác thải bừa bãi chân cầu", location: "Quận 8", status: "Chờ xử lý", type: "Trash", severity: "Severe", lat: 10.742, lng: 106.635 },
    { id: "REP-002", title: "Nước thải đen kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", severity: "Warning", lat: 10.782, lng: 106.685 }
];

// =========================================================================
// 3. 📧 ĐIỀN TRỰC TIẾP EMAIL VÀ MẬT KHẨU CỦA NÍ VÀO ĐÂY NHÉ
// =========================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // NÍ ĐIỀN EMAIL VÀ PASS VÀO GIỮA 2 DẤU NHÁY ĐƠN BÊN DƯỚI NHA:
        user: 'peterbis0901@gmail.com', 
        pass: 'wmwskurdnlftdlko' // <--- MẬT KHẨU 16 CHỮ CÁI (VIẾT DÍNH LIỀN, KHÔNG CÓ DẤU CÁCH)
    }
});
// =========================================================================

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

// 4. API ENDPOINTS
app.get('/api/reports', (req, res) => res.json(reports));

app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Họ tên, Email, Mật khẩu nha ní!' });
    }

    // 🚨 LOGIC XÁC THỰC MÃ CÁN BỘ ĐÃ TRỞ LẠI
    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') {
        return res.status(400).json({ success: false, message: 'Mã xác nhận Cán bộ không đúng! (Gợi ý: ADMIN123)' });
    }

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email này đã được đăng ký rồi bro!' });
    }

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; 

    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    const mailOptions = {
        from: '"EcoConnect HCM" <no-reply@ecoconnect.vn>',
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký Tài Khoản',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px; background-color: #fff;">
                <h2 style="color: #10b981; text-align: center;">Xác Thực Tài Khoản EcoConnect</h2>
                <p>Chào <strong>${name}</strong>,</p>
                <p>Bạn đang đăng ký tài khoản với vai trò: <strong>${role}</strong>.</p>
                <p>Mã OTP của bạn là:</p>
                <div style="background-color: #f0fdf4; padding: 15px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 5px; color: #065f46; border-radius: 8px;">
                    ${otpCode}
                </div>
                <p style="color: #64748b; font-size: 13px; text-align: center;">Mã có hiệu lực 5 phút. Vui lòng không chia sẻ cho người khác.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mã OTP đã gửi đi thành công! Check mail nha ní.' });
    } catch (error) {
        console.error('Lỗi gửi mail thật:', error);
        res.status(500).json({ success: false, message: 'Gửi mail thất bại! Đảm bảo Mật khẩu 16 chữ cái không có dấu cách nha.' });
    }
});

app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];

    if (!session) return res.status(400).json({ success: false, message: 'Không tìm thấy phiên đăng ký hoặc mã đã hết hạn!' });
    if (Date.now() > session.expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'Mã xác thực đã hết hạn rồi bro!' });
    }
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) {
        return res.status(400).json({ success: false, message: 'Mã xác thực nhập vào sai rồi ní ơi!' });
    }

    users.push(session.userData);
    delete otpStore[email]; 

    res.status(200).json({ success: true, message: 'Xác thực hoàn tất! Tài khoản đã được tạo.' });
});

// 5. GIAO DIỆN REACT + LEAFLET
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect HCM - Trạm Tổng</title>
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
            .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
            .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
            #map { height: 100%; width: 100%; border-radius: 24px; z-index: 1; }
            .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: #1e293b; color: #fff; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
            .custom-scroll::-webkit-scrollbar { width: 5px; }
            .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            input:focus { border-color: #10b981 !important; ring-color: #10b981 !important; }
        </style>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            function MapView({ reports }) {
                const mapRef = React.useRef(null);
                const mapInstance = React.useRef(null);

                React.useEffect(() => {
                    if (!mapInstance.current) {
                        mapInstance.current = L.map('map', { zoomControl: false }).setView([10.776, 106.695], 13);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance.current);
                        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
                    }

                    if (reports && reports.length > 0) {
                        mapInstance.current.eachLayer((layer) => { if (layer instanceof L.Marker) mapInstance.current.removeLayer(layer); });
                        reports.forEach(rep => {
                            const color = rep.severity === 'Severe' ? '#ef4444' : (rep.severity === 'Warning' ? '#f59e0b' : '#10b981');
                            const customIcon = L.divIcon({
                                className: 'custom-icon',
                                html: \`<div style="background-color: \${color}; width: 15px; height: 15px; border-radius: 50%; border: 3px solid #fff;"></div>\`,
                                iconSize: [15, 15]
                            });
                            L.marker([rep.lat, rep.lng], { icon: customIcon }).addTo(mapInstance.current).bindPopup(\`<strong>\${rep.id}</strong>: \${rep.title}\`);
                        });
                    }
                }, [reports]);
                return <div id="map" className="shadow-inner"></div>;
            }

            function App() {
                const [user, setUser] = React.useState(null); 
                const [view, setView] = React.useState('auth'); 
                const [authTab, setAuthTab] = React.useState('register'); 
                const [currentRole, setCurrentRole] = React.useState('Người dùng');
                
                const [showTerms, setShowTerms] = React.useState(false);
                const [showOtpModal, setShowOtpModal] = React.useState(false);
                
                // Đã thêm biến adminCode vào đây nha bro
                const [formData, setFormData] = React.useState({ name: '', email: '', password: '', adminCode: '', terms: false });
                const [otpInput, setOtpInput] = React.useState('');
                const [loading, setLoading] = React.useState(false);
                const [targetEmail, setTargetEmail] = React.useState('');
                const [reports, setReports] = React.useState([]);

                React.useEffect(() => {
                    if(view === 'dashboard') {
                        fetch('/api/reports').then(res => res.json()).then(data => setReports(data));
                    }
                }, [view]);

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
                            setShowOtpModal(true); 
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        setLoading(false);
                        alert("Lỗi kết nối server rồi bro ơi!");
                    }
                };

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
                            alert('🎉 Đăng ký thành công!');
                            setShowOtpModal(false);
                            setUser({email: targetEmail, name: formData.name, role: currentRole});
                            setView('dashboard'); 
                        } else {
                            alert(data.message);
                        }
                    } catch (err) {
                        alert("Lỗi kết nối xác thực rồi bro!");
                    }
                };

                const switchAuth = (tab) => { setAuthTab(tab); setOtpInput(''); setFormData({name:'', email:'', password:'', adminCode: '', terms:false}); }

                if (view === 'auth') {
                    return (
                        <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn">
                            <div className="glass w-full max-w-[450px] p-10 rounded-[32px] shadow-2xl relative text-center">
                                <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-5">
                                    <span className="material-icons-round text-3xl">spa</span>
                                </div>
                                <h1 className="text-2xl font-extrabold mb-1.5">EcoConnect</h1>
                                <p className="text-slate-400 text-sm mb-8">Chung tay bảo vệ môi trường Thành phố</p>

                                {authTab === 'register' && (
                                    <form onSubmit={handleRegisterRequest} className="space-y-4 animate-fadeIn">
                                        <input type="text" placeholder="Họ và tên" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} required />
                                        <input type="email" placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} required />
                                        <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none focus:border-emerald-500 text-sm" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} required />
                                        
                                        {/* 🚨 Ô NHẬP MÃ CÁN BỘ (CHỈ HIỆN KHI CHỌN ROLE CÁN BỘ) */}
                                        {currentRole === 'Cán bộ' && (
                                            <input 
                                                type="text" 
                                                placeholder="Nhập mã xác nhận của tổ chức (VD: ADMIN123)" 
                                                className="w-full bg-emerald-950/30 border border-emerald-500 p-3.5 rounded-xl focus:outline-none focus:border-emerald-400 text-sm animate-fadeIn text-emerald-300 placeholder-emerald-700" 
                                                onChange={e => setFormData({...formData, adminCode: e.target.value})} 
                                                value={formData.adminCode} 
                                                required 
                                            />
                                        )}

                                        <div className="grid grid-cols-3 gap-2 py-1">
                                            {['Người dùng', 'Cán bộ', 'Tổ chức'].map(r => (
                                                <button type="button" key={r} onClick={() => setCurrentRole(r)} className={\`py-2.5 text-[11px] font-bold rounded-lg border transition-all \${currentRole === r ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-950/30 border-slate-700 text-slate-400'}\`}>{r}</button>
                                            ))}
                                        </div>

                                        <div className="flex items-start text-left gap-2.5 pt-1 pb-3 text-[13px] text-slate-400 line-height-1.4">
                                            <input type="checkbox" id="policy" className="mt-1 accent-emerald-500 h-4 w-4" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                            <label htmlFor="policy">Tui đã đọc và đồng ý với <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setShowTerms(true)}>Chính sách & Điều khoản sử dụng</span>.</label>
                                        </div>

                                        <button type="submit" className="w-full py-3.5 emerald-gradient rounded-2xl text-slate-950 font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex justify-center items-center" disabled={loading}>
                                            {loading ? <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : 'Đăng ký tài khoản'}
                                        </button>
                                        <p className="text-sm text-slate-400 pt-3">Đã có tài khoản? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => switchAuth('login')}>Đăng nhập</span></p>
                                    </form>
                                )}

                                {authTab === 'login' && (
                                    <form className="space-y-4 animate-fadeIn pt-4">
                                        <input type="email" placeholder="Email" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none" required />
                                        <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-950/50 border border-slate-700 p-3.5 rounded-xl focus:outline-none" required />
                                        <button type="button" className="w-full py-3.5 emerald-gradient rounded-2xl text-slate-950 font-bold text-sm uppercase" onClick={() => alert("Đăng nhập thành công (Mô phỏng)!")}>Đăng nhập</button>
                                        <p className="text-sm text-slate-400 pt-3">Chưa có tài khoản? <span className="text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => switchAuth('register')}>Đăng ký</span></p>
                                    </form>
                                )}
                            </div>

                            {showTerms && (
                                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="glass w-full max-w-[500px] rounded-3xl p-7 border border-slate-700">
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-lg font-bold text-emerald-400">Điều Khoản Sử Dụng</h3>
                                            <span className="material-icons-round text-slate-500 cursor-pointer" onClick={() => setShowTerms(false)}>close</span>
                                        </div>
                                        <div className="space-y-4 text-sm text-slate-300 h-[300px] overflow-y-auto pr-3 custom-scroll text-left">
                                            <p><strong className="text-emerald-400">1. Quy định chung:</strong> Nền tảng kết nối cộng đồng tại TP.HCM. Bạn cam kết thông tin cung cấp là sự thật.</p>
                                            <p><strong className="text-red-400">2. Cấm:</strong> Không văng tục, không spam report.</p>
                                        </div>
                                        <button className="w-full mt-6 py-3 bg-emerald-600 rounded-xl font-bold text-sm" onClick={() => { setFormData({...formData, terms: true}); setShowTerms(false); }}>Tôi đồng ý</button>
                                    </div>
                                </div>
                            )}

                            {showOtpModal && (
                                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                                    <div className="glass w-full max-w-[400px] rounded-3xl p-8 border border-emerald-500/30 text-center">
                                        <h3 className="text-lg font-bold mb-4">Xác thực Email</h3>
                                        <p className="text-sm text-slate-400 mb-6">Nhập mã gửi đến <strong className="text-emerald-400">{targetEmail}</strong></p>
                                        <input type="text" placeholder="VD: A1B2C3" maxLength="6" className="w-full bg-slate-900 border-2 border-emerald-500 p-4 rounded-xl text-center text-3xl font-black tracking-[8px] uppercase text-emerald-400 focus:outline-none mb-6" onChange={e => setOtpInput(e.target.value)} value={otpInput} />
                                        <div className="flex gap-3">
                                            <button className="flex-1 py-3 bg-slate-800 rounded-xl text-sm" onClick={() => setShowOtpModal(false)}>Hủy</button>
                                            <button className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-sm" onClick={handleVerifyOtp}>Xác nhận</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="h-screen flex animate-fadeIn p-4 overflow-hidden">
                        <aside className="w-64 glass rounded-3xl p-6 mr-4 flex flex-col z-10">
                            <h1 className="text-xl font-bold text-emerald-400 mb-10">EcoConnect</h1>
                            <nav className="space-y-3 flex-1">
                                <button className="w-full bg-emerald-500/20 text-emerald-400 p-3 rounded-xl font-bold text-left">Bản đồ nóng</button>
                            </nav>
                        </aside>
                        <main className="flex-1 flex flex-col h-full min-h-0">
                            <header className="glass rounded-2xl p-4 mb-4 flex justify-between">
                                <h2 className="font-bold">Chào <span className="text-emerald-400">{user?.name}</span>!</h2>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 rounded-full text-xs font-bold">{user?.role}</span>
                            </header>
                            <div className="flex-1 glass rounded-3xl p-3 relative min-h-0">
                                <MapView reports={reports} />
                            </div>
                        </main>
                    </div>
                );
            }

            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
        </script>
    </body>
    </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Live on port ${PORT}`));
