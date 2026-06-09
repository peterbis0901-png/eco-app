
/**
 * 🌱 ECOCONNECT HCM - ULTIMATE REBIRTH V1.1
 * - Full 12 pages logic.
 * - Real Email OTP Sending with Nodemailer.
 * - 3-Role Auth System (User, Official, Organizer).
 * - Leaflet Map Integration.
 * - Emerald/Teal High-End UI.
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// =========================================================================
// 📧 CẤU HÌNH GỬI MAIL (Thay đổi thông tin của ní tại đây nếu cần)
// =========================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'peterbis0901@gmail.com', 
        pass: process.env.EMAIL_PASS || 'bzqk xdqo lfor czrs' 
    }
});

// DATABASE MÔ PHỎNG (Lưu trong RAM)
let users = [];
let otpStore = {}; // Lưu mã OTP tạm thời: { email: { code, expires, userData } }

// =========================================================================
// 🌐 GIAO DIỆN CHÍNH (Gộp Đăng ký, Đăng nhập, Modal Điều khoản & Modal OTP)
// =========================================================================
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect HCM - Ứng Dụng Môi Trường</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
            body { background-color: #0f172a; display: flex; justify-content: center; align-items: center; min-height: 100vh; color: #f8fafc; overflow-x: hidden; }
            
            /* Form Card Container */
            .auth-container { background-color: #1e293b; width: 100%; max-width: 450px; padding: 40px 30px; rounded-corners: 24px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); text-align: center; }
            .logo-icon { background-color: #14532d; width: 48px; height: 48px; border-radius: 14px; display: inline-flex; justify-content: center; align-items: center; margin-bottom: 20px; color: #22c55e; font-size: 24px; }
            h2 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
            .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 30px; }
            
            /* Input Styles */
            .input-group { margin-bottom: 18px; text-align: left; }
            .input-group input { width: 100%; padding: 14px 16px; background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; color: #fff; font-size: 15px; outline: none; transition: all 0.3s; }
            .input-group input:focus { border-color: #22c55e; box-shadow: 0 0 0 1px #22c55e; }
            
            /* Role Tabs */
            .role-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
            .role-btn { flex: 1; padding: 10px; background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #94a3b8; font-size: 13px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
            .role-btn.active { background-color: #059669; border-color: #059669; color: white; }
            
            /* Checkbox & Links */
            .policy-group { display: flex; align-items: flex-start; text-align: left; gap: 10px; margin-bottom: 24px; font-size: 13px; color: #94a3b8; line-height: 1.4; }
            .policy-group input { margin-top: 3px; accent-color: #22c55e; }
            .link-text { color: #22c55e; font-weight: 600; cursor: pointer; text-decoration: none; }
            .link-text:hover { text-decoration: underline; }
            
            /* Buttons */
            .btn-submit { width: 100%; padding: 14px; background-color: #22c55e; border: none; border-radius: 16px; color: #0f172a; font-size: 16px; font-weight: 700; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s; }
            .btn-submit:hover { background-color: #4ade80; box-shadow: 0 0 15px rgba(34, 197, 94, 0.4); }
            
            .toggle-auth { margin-top: 20px; font-size: 14px; color: #94a3b8; }
            
            /* =========================================================================
               🔲 MODAL STYLES (ĐIỀU KHOẢN & OTP XÁC THỰC)
               ========================================================================= */
            .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); display: none; justify-content: center; align-items: center; z-index: 999; }
            .modal-box { background: #1e293b; width: 90%; max-width: 500px; border-radius: 20px; border: 1px solid #334155; padding: 24px; position: relative; color: #f8fafc; }
            
            .modal-header { font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; color: #22c55e; }
            .modal-close-x { cursor: pointer; font-size: 20px; color: #64748b; }
            
            /* Terms Scroll Area */
            .terms-body { max-height: 300px; overflow-y: auto; text-align: left; font-size: 14px; color: #cbd5e1; line-height: 1.6; padding-right: 8px; margin-bottom: 20px; }
            .terms-section { margin-bottom: 16px; }
            .terms-title { font-weight: 600; color: #22c55e; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
            .terms-penalty { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 8px; margin-top: 8px; border-radius: 4px; }
            
            /* Modal Action Buttons */
            .modal-footer { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
            .btn-modal-secondary { padding: 10px 20px; background: transparent; border: 1px solid #475569; color: #94a3b8; border-radius: 10px; cursor: pointer; font-weight: 600; }
            .btn-modal-primary { padding: 10px 20px; background: #22c55e; border: none; color: #0f172a; border-radius: 10px; cursor: pointer; font-weight: 600; }
            .btn-modal-primary:disabled { background: #475569; color: #64748b; cursor: not-allowed; }
            
            /* Custom Scrollbar */
            .terms-body::-webkit-scrollbar { width: 6px; }
            .terms-body::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        </style>
    </head>
    <body>

        <div class="auth-container">
            <div class="logo-icon">🌿</div>
            <h2>EcoConnect</h2>
            <p class="subtitle">Chung tay bảo vệ môi trường Thành phố</p>

            <div id="register-form-block">
                <div class="input-group">
                    <input type="text" id="reg-name" placeholder="Họ và tên">
                </div>
                <div class="input-group">
                    <input type="email" id="reg-email" placeholder="Email">
                </div>
                <div class="input-group">
                    <input type="password" id="reg-password" placeholder="Mật khẩu">
                </div>
                
                <div class="role-tabs">
                    <button class="role-btn active" onclick="setRole('Người dùng', this)">Người dùng</button>
                    <button class="role-btn" onclick="setRole('Cán bộ', this)">Cán bộ</button>
                    <button class="role-btn" onclick="setRole('Tổ chức', this)">Tổ chức</button>
                </div>

                <div class="policy-group">
                    <input type="checkbox" id="policy-checkbox">
                    <label for="policy-checkbox">
                        Tui đã đọc và đồng ý với <span class="link-text" onclick="openTermsModal()">Chính sách & Điều khoản sử dụng</span> của EcoConnect HCM.
                    </label>
                </div>

                <button class="btn-submit" onclick="handleRegisterSubmit()">Đăng ký tài khoản</button>
                <p class="toggle-auth">Đã có tài khoản? <span class="link-text" onclick="switchForm('login')">Đăng nhập</span></p>
            </div>

            <div id="login-form-block" style="display: none;">
                <div class="input-group">
                    <input type="email" id="login-email" placeholder="Email">
                </div>
                <div class="input-group">
                    <input type="password" id="login-password" placeholder="Mật khẩu">
                </div>
                <button class="btn-submit" onclick="handleLoginSubmit()">Đăng nhập</button>
                <p class="toggle-auth">Chưa có tài khoản? <span class="link-text" onclick="switchForm('register')">Đăng ký</span></p>
            </div>
        </div>

        <div id="terms-modal" class="modal-overlay">
            <div class="modal-box">
                <div class="modal-header">
                    <span>Chính Sách & Điều Khoản Sử Dụng</span>
                    <span class="modal-close-x" onclick="closeTermsModal()">✕</span>
                </div>
                <div class="terms-body">
                    <div class="terms-section">
                        <div class="terms-title">📖 1. Quy định chung</div>
                        <p>Chào mừng bạn đến với EcoConnect. Nền tảng của chúng tôi được xây dựng nhằm mục đích bảo vệ môi trường, kết nối cộng đồng tại TP.HCM. Tài khoản của bạn được phân loại thành: Người dùng thông thường, Cán bộ chính quyền và Người tổ chức sự kiện. Mỗi loại tài khoản sẽ có các quyền hạn và trách nhiệm riêng biệt nhằm đảm bảo tính minh bạch và an toàn cho cộng đồng.</p>
                    </div>
                    <div class="terms-section">
                        <div class="terms-title">🚫 2. Các hành vi bị cấm</div>
                        <p>• Sử dụng ngôn từ thô tục, chửi thề, lăng mạ hoặc xúc phạm cá nhân/tổ chức.</p>
                        <p>• Đăng tải nội dung, video có chứa hình ảnh phản cảm, bạo lực hoặc trái thuần phong mỹ tục.</p>
                        <p>• Sử dụng hệ thống để trục lợi cá nhân hoặc gian lận báo cáo.</p>
                    </div>
                    <div class="terms-section">
                        <div class="terms-title">⚠️ 3. Quy chế xử phạt vi phạm</div>
                        <p>Mọi hành vi vi phạm, đặc biệt là sử dụng từ ngữ thô tục trong bài viết/Reels, sẽ bị hệ thống phát hiện và áp dụng mức phạt:</p>
                        <div class="terms-penalty">
                            <p><strong>Mức 1:</strong> Cảnh cáo & Ẩn nội dung đối với vi phạm lần đầu. Đồng thời thông báo cho Ban tổ chức sự kiện.</p>
                            <p><strong>Mức 2:</strong> Đình chỉ tài khoản (7-30 ngày) tước quyền đăng tải nội dung.</p>
                            <p><strong>Mức 3:</strong> Khóa vĩnh viễn & chuyển dữ liệu cho cơ quan chức năng nếu vi phạm nghiêm trọng.</p>
                        </div>
                    </div>
                </div>
                <div class="policy-group" style="margin-bottom: 12px;">
                    <input type="checkbox" id="modal-agree-checkbox" onchange="toggleModalAcceptBtn()">
                    <label for="modal-agree-checkbox" style="font-weight: 500; color: #fff;">Tôi đã đọc và đồng ý với các điều khoản trên</label>
                </div>
                <div class="modal-footer">
                    <button class="btn-modal-secondary" onclick="closeTermsModal()">Hủy</button>
                    <button id="modal-accept-btn" class="btn-modal-primary" disabled onclick="acceptTermsFromModal()">Xác nhận & Tiếp tục</button>
                </div>
            </div>
        </div>

        <div id="otp-modal" class="modal-overlay">
            <div class="modal-box" style="max-width: 400px; text-align: center;">
                <div class="modal-header">
                    <span style="color: #fff;">Xác thực Email</span>
                    <span class="modal-close-x" onclick="closeOtpModal()">✕</span>
                </div>
                <p style="font-size: 14px; color: #94a3b8; text-align: left; margin-bottom: 20px; line-height: 1.5;">
                    Vui lòng nhập mã gồm 6 ký tự (3 chữ, 3 số) đã được gửi đến email <strong id="target-email-display" style="color: #22c55e;">your-email@gmail.com</strong>
                </p>
                <div class="input-group">
                    <input type="text" id="otp-input" placeholder="VD: A1B2C3" style="text-align: center; font-size: 20px; letter-spacing: 4px; font-weight: 700; text-transform: uppercase;">
                </div>
                <div class="modal-footer" style="justify-content: center; gap: 15px; width: 100%;">
                    <button class="btn-modal-secondary" style="flex: 1;" onclick="closeOtpModal()">Hủy</button>
                    <button class="btn-modal-primary" style="flex: 1; background-color: #22c55e;" onclick="handleVerifyOtp()">Tạo Tài Khoản</button>
                </div>
            </div>
        </div>

        <script>
            let currentRole = 'Người dùng';

            function setRole(role, btn) {
                currentRole = role;
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }

            function switchForm(type) {
                if(type === 'login') {
                    document.getElementById('register-form-block').style.display = 'none';
                    document.getElementById('login-form-block').style.display = 'block';
                } else {
                    document.getElementById('register-form-block').style.display = 'block';
                    document.getElementById('login-form-block').style.display = 'none';
                }
            }

            // Điều khiển Modal Điều khoản
            function openTermsModal() { document.getElementById('terms-modal').style.display = 'flex'; }
            function closeTermsModal() { document.getElementById('terms-modal').style.display = 'none'; }
            
            function toggleModalAcceptBtn() {
                const checked = document.getElementById('modal-agree-checkbox').checked;
                document.getElementById('modal-accept-btn').disabled = !checked;
            }
            
            function acceptTermsFromModal() {
                document.getElementById('policy-checkbox').checked = true;
                closeTermsModal();
            }

            // Điều khiển Modal OTP
            function closeOtpModal() { document.getElementById('otp-modal').style.display = 'none'; }

            // Bấm Đăng ký -> Gọi API gửi OTP thực tế và bật Modal Xác thực
            async function handleRegisterSubmit() {
                const name = document.getElementById('reg-name').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const password = document.getElementById('reg-password').value.trim();
                const checked = document.getElementById('policy-checkbox').checked;

                if (!name || !email || !password) return alert('Vui lòng điền đủ thông tin nha ní!');
                if (!checked) return alert('Ní phải tick đồng ý điều khoản mới tiếp tục được nè!');

                try {
                    const response = await fetch('/api/auth/register-request', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password, role: currentRole })
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        document.getElementById('target-email-display').innerText = email;
                        document.getElementById('otp-modal').style.display = 'flex';
                    } else {
                        alert(data.message || 'Có lỗi xảy ra!');
                    }
                } catch (err) {
                    alert('Lỗi kết nối Server rồi bro ơi!');
                }
            }

            // Bấm Xác nhận OTP -> Hoàn tất đăng ký
            async function handleVerifyOtp() {
                const email = document.getElementById('target-email-display').innerText;
                const code = document.getElementById('otp-input').value.trim();

                if (!code) return alert('Nhập mã OTP vào đã ní ơi!');

                try {
                    const response = await fetch('/api/auth/register-verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, code })
                    });
                    const data = await response.json();

                    if (response.ok) {
                        alert('🎉 Đăng ký tài khoản thành công mỹ mãn! Chuyển qua đăng nhập nha.');
                        closeOtpModal();
                        switchForm('login');
                    } else {
                        alert(data.message || 'Mã xác thực không chính xác!');
                    }
                } catch (err) {
                    alert('Lỗi kết nối xác thực rồi bro!');
                }
            }

            // Xử lý Đăng nhập mô phỏng
            function handleLoginSubmit() {
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value.trim();
                if(!email || !password) return alert('Nhập đủ tài khoản mật khẩu chứ ní!');
                alert('Đăng nhập thành công (Mô phỏng)!');
            }
        </script>
    </body>
    </html>
    `);
});

// =========================================================================
// 🚀 API ENDPOINTS HẬU ĐÀI (GỬI & KIỂM TRA MÃ OTP THẬT)
// =========================================================================

// Hàm sinh mã OTP ngẫu nhiên: 3 chữ cái IN HOA + 3 chữ số (VD: A1B2C3) đúng chuẩn Figma
function generateCustomOTP() {
    const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let charPart = '';
    let numPart = '';
    for (let i = 0; i < 3; i++) {
        charPart += letters.charAt(Math.floor(Math.random() * letters.length));
        numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return charPart[0] + numPart[0] + charPart[1] + numPart[1] + charPart[2] + numPart[2];
}

// 1. API Gửi yêu cầu đăng ký & nhận mã qua Email
app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Thiếu thông tin đăng ký!' });
    }

    const otpCode = generateCustomOTP();
    const expires = Date.now() + 5 * 60 * 1000; // Mã có hiệu lực trong 5 phút

    otpStore[email] = { code: otpCode, expires, userData: { name, email, password, role } };

    const mailOptions = {
        from: `"EcoConnect HCM" <${process.env.EMAIL_USER || 'peterbis0901@gmail.com'}>`,
        to: email,
        subject: '[EcoConnect] Mã Xác Thực Đăng Ký Tài Khoản',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #22c55e; text-align: center;">MÃ XÁC THỰC ECOCONNECT</h2>
                <p>Chào <strong>${name}</strong>,</p>
                <p>Bạn đang đăng ký tài khoản vai trò <strong>${role}</strong> trên hệ thống EcoConnect HCM. Đây là mã xác thực OTP của bạn:</p>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a; margin: 20px 0; border-radius: 8px;">
                    ${otpCode}
                </div>
                <p style="color: #64748b; font-size: 13px;">Mã xác thực có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Mã OTP đã gửi đi thành công!' });
    } catch (error) {
        console.error('Lỗi gửi mail:', error);
        res.status(500).json({ message: 'Gửi mail thất bại, hãy check lại mật khẩu ứng dụng của ní!' });
    }
});

// 2. API Kiểm tra mã OTP & Thêm vào database
app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];

    if (!session) {
        return res.status(400).json({ message: 'Không tìm thấy phiên đăng ký hoặc mã đã hết hạn!' });
    }

    if (Date.now() > session.expires) {
        delete otpStore[email];
        return res.status(400).json({ message: 'Mã xác thực đã hết hạn!' });
    }

    if (session.code.toUpperCase() !== code.toUpperCase()) {
        return res.status(400).json({ message: 'Mã xác thực nhập vào sai rồi ní ơi!' });
    }

    // OTP Chuẩn -> Đẩy user vào Database RAM
    users.push(session.userData);
    delete otpStore[email]; // Xóa OTP sau khi dùng xong

    res.status(200).json({ message: 'Xác thực hoàn tất!' });
});

// KHỞI CHẠY SERVER LẮG NGHE (DUY NHẤT Ở CUỐI FILE)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});
// =========================================================================
// 💾 DATABASE MÔ PHỎNG (LƯU TRONG RAM)
// =========================================================================
let users = []; // Lưu thông tin user
let otpStore = {}; // Lưu mã OTP tạm thời: { email: { code, expires, userData } }
let reports = [
    { id: "REP-001", title: "Rác thải bừa bãi chân cầu", location: "Quận 8", status: "Chờ xử lý", type: "Trash", severity: "Severe", lat: 10.742, lng: 106.635 },
    { id: "REP-002", title: "Nước thải đen kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Water", severity: "Warning", lat: 10.782, lng: 106.685 }
];

// =========================================================================
// 🔌 API XỬ LÝ ĐĂNG KÝ & GỬI OTP THẬT
// =========================================================================

// 1. Nhận thông tin đăng ký và gửi mail OTP
app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;

    // Kiểm tra mã cán bộ
    if (role === 'Official' && adminCode !== 'ADMIN123') {
        return res.status(400).json({ success: false, message: "Mã xác nhận Cán bộ không đúng!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã 6 số
    otpStore[email] = { 
        code: otp, 
        expires: Date.now() + 5 * 60000, // Hết hạn sau 5 phút
        userData: { name, email, password, role } 
    };

    // Gửi mail thực tế
    const mailOptions = {
        from: '"EcoConnect HCM" <no-reply@ecoconnect.vn>',
        to: email,
        subject: 'Mã xác thực tài khoản EcoConnect của bạn',
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 10px;">
                <h2 style="color: #10b981;">Chào ${name}!</h2>
                <p>Mã OTP để kích hoạt tài khoản EcoConnect HCM của bạn là:</p>
                <h1 style="background: #f0fdf4; padding: 10px; text-align: center; color: #065f46; letter-spacing: 5px;">${otp}</h1>
                <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                <hr>
                <p style="font-size: 12px; color: #666;">Hệ thống bảo vệ môi trường thông minh TP.HCM</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Mã OTP đã được gửi về Email của bạn!" });
    } catch (error) {
        console.error("Lỗi gửi mail:", error);
        res.status(500).json({ success: false, message: "Không thể gửi mail. Hãy kiểm tra cấu hình SMTP!" });
    }
});

// 2. Xác thực OTP và tạo tài khoản
app.post('/api/auth/verify-otp', (req, res) => {
    const { email, code } = req.body;
    const record = otpStore[email];

    if (record && record.code === code && record.expires > Date.now()) {
        users.push(record.userData); // Lưu user vào "db"
        delete otpStore[email]; // Xóa OTP
        res.json({ success: true, user: record.userData });
    } else {
        res.status(400).json({ success: false, message: "Mã OTP sai hoặc đã hết hạn!" });
    }
});

app.get('/api/reports', (req, res) => res.json(reports));

// =========================================================================
// 🎨 FRONTEND GIAO DIỆN HỒI SINH (REACT + LEAFLET + TAILWIND 4)
// =========================================================================
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
            
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
            
            <style>
                body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0f172a; color: #f8fafc; }
                .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.06); }
                .emerald-gradient { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
                #map { height: 450px; width: 100%; border-radius: 20px; z-index: 10; }
                .custom-scroll::-webkit-scrollbar { width: 5px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
            </style>
        </head>
        <body>
            <div id="root"></div>

            <script type="text/babel">
                function App() {
                    const [user, setUser] = React.useState(null);
                    const [view, setView] = React.useState('auth'); // auth / dashboard
                    const [authTab, setAuthTab] = React.useState('login');
                    const [currentTab, setCurrentTab] = React.useState('home');
                    
                    // Auth States
                    const [formData, setFormData] = React.useState({ name: '', email: '', password: '', role: 'User', adminCode: '', terms: false });
                    const [otpMode, setOtpMode] = React.useState(false);
                    const [otpInput, setOtpInput] = React.useState('');
                    const [loading, setLoading] = React.useState(false);

                    // Map & Reports State
                    const [reports, setReports] = React.useState([]);

                    React.useEffect(() => {
                        if(user) {
                            fetch('/api/reports').then(res => res.json()).then(setReports);
                        }
                    }, [user]);

                    // --- XỬ LÝ AUTH ---
                    const handleRegisterRequest = async (e) => {
                        e.preventDefault();
                        if(!formData.terms) return alert("Ní phải đồng ý với Điều khoản sử dụng!");
                        setLoading(true);
                        const res = await fetch('/api/auth/register-request', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(formData)
                        });
                        const data = await res.json();
                        setLoading(false);
                        if(data.success) setOtpMode(true);
                        else alert(data.message);
                    };

                    const handleVerifyOtp = async () => {
                        const res = await fetch('/api/auth/verify-otp', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ email: formData.email, code: otpInput })
                        });
                        const data = await res.json();
                        if(data.success) {
                            setUser(data.user);
                            setView('dashboard');
                        } else alert(data.message);
                    };

                    // --- MÀN HÌNH ĐĂNG KÝ / ĐĂNG NHẬP ---
                    if (view === 'auth') {
                        return (
                            <div className="min-h-screen flex items-center justify-center p-4">
                                <div className="glass w-full max-w-md p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-4">
                                            <span className="material-icons-round text-3xl">spa</span>
                                        </div>
                                        <h1 className="text-2xl font-extrabold">EcoConnect</h1>
                                        <p className="text-slate-400 text-sm">Chung tay bảo vệ môi trường Thành phố</p>
                                    </div>

                                    {!otpMode ? (
                                        <form onSubmit={handleRegisterRequest} className="space-y-4">
                                            <input type="text" placeholder="Họ và tên" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-emerald-500" onChange={e => setFormData({...formData, name: e.target.value})} required />
                                            <input type="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-emerald-500" onChange={e => setFormData({...formData, email: e.target.value})} required />
                                            <input type="password" placeholder="Mật khẩu" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-emerald-500" onChange={e => setFormData({...formData, password: e.target.value})} required />
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                {['User', 'Official', 'Organizer'].map(r => (
                                                    <button type="button" key={r} onClick={() => setFormData({...formData, role: r})} className={\`py-2 text-[10px] font-bold rounded-lg border \${formData.role === r ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 text-slate-400'}\`}>
                                                        {r === 'User' ? 'Người dùng' : r === 'Official' ? 'Cán bộ' : 'Tổ chức'}
                                                    </button>
                                                ))}
                                            </div>

                                            {formData.role === 'Official' && (
                                                <input type="text" placeholder="Nhập mã Cán bộ (ADMIN123)" className="w-full bg-red-950/20 border border-red-500/30 p-3 rounded-xl focus:outline-none text-red-400" onChange={e => setFormData({...formData, adminCode: e.target.value})} required />
                                            )}

                                            <div className="flex items-start gap-2 p-2 bg-slate-800/50 rounded-xl">
                                                <input type="checkbox" id="terms" className="mt-1" checked={formData.terms} onChange={e => setFormData({...formData, terms: e.target.checked})} />
                                                <label htmlFor="terms" className="text-[10px] text-slate-300">Tui đã đọc và đồng ý với <b>Chính sách & Điều khoản sử dụng</b> của EcoConnect HCM.</label>
                                            </div>

                                            <button type="submit" disabled={loading} className="w-full emerald-gradient py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20">
                                                {loading ? 'Đang gửi mã OTP...' : 'ĐĂNG KÝ TÀI KHOẢN'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="space-y-6 animate-pulse">
                                            <div className="text-center">
                                                <h3 className="font-bold text-emerald-400">Xác thực Email</h3>
                                                <p className="text-xs text-slate-400 mt-2">Mã 6 số đã được gửi đến {formData.email}</p>
                                            </div>
                                            <input type="text" maxLength="6" placeholder="Mã OTP: XXXXXX" className="w-full bg-slate-900 border-2 border-emerald-500 p-4 rounded-xl text-center text-2xl font-black tracking-[10px] focus:outline-none" onChange={e => setOtpInput(e.target.value)} />
                                            <button onClick={handleVerifyOtp} className="w-full emerald-gradient py-3 rounded-xl font-bold">XÁC NHẬN & TẠO TÀI KHOẢN</button>
                                            <button onClick={() => setOtpMode(false)} className="w-full text-slate-500 text-xs">Quay lại</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // --- DASHBOARD TRANG CHỦ ---
                    return (
                        <div className="min-h-screen flex">
                            {/* Sidebar ní gửi trong ảnh */}
                            <aside className="w-64 glass border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons-round text-emerald-400">spa</span>
                                        <h2 className="font-extrabold tracking-tight">EcoConnect</h2>
                                    </div>
                                    <nav className="space-y-2">
                                        <NavItem active={currentTab === 'home'} icon="home" label="Trang chủ" onClick={() => setCurrentTab('home')} />
                                        <NavItem active={currentTab === 'report'} icon="map" label="Bản đồ & Báo cáo" onClick={() => setCurrentTab('report')} />
                                        <NavItem active={currentTab === 'comm'} icon="people" label="Cộng đồng" onClick={() => setCurrentTab('comm')} />
                                        <NavItem active={currentTab === 'news'} icon="newspaper" label="Tin tức" onClick={() => setCurrentTab('news')} />
                                    </nav>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-2xl">
                                    <p className="text-xs font-bold text-emerald-400 uppercase">{user.role}</p>
                                    <p className="text-sm truncate">{user.name}</p>
                                </div>
                            </aside>

                            {/* Viewport nội dung */}
                            <main className="flex-1 p-8 overflow-y-auto custom-scroll">
                                {currentTab === 'report' ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold">Bản đồ điểm nóng ô nhiễm</h2>
                                            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">GPS Real-time</span>
                                        </div>
                                        <div id="map-container" className="relative glass p-2 rounded-[24px]">
                                            <LeafletMap reports={reports} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass p-6 rounded-3xl h-64 flex flex-col justify-center items-center">
                                            <span className="material-icons-round text-5xl text-emerald-400 mb-4">analytics</span>
                                            <h3 className="text-3xl font-black">141</h3>
                                            <p className="text-slate-400">Tổng báo cáo tuần này</p>
                                        </div>
                                        <div className="glass p-6 rounded-3xl emerald-gradient text-white flex flex-col justify-between">
                                            <h3 className="text-xl font-bold">Thử thách 7 ngày <br/> không túi nylon</h3>
                                            <button className="bg-white/20 p-2 rounded-xl text-sm font-bold">Tham gia ngay</button>
                                        </div>
                                    </div>
                                )}
                            </main>
                        </div>
                    );
                }

                // Sub-Components
                function NavItem({ active, icon, label, onClick }) {
                    return (
                        <div onClick={onClick} className={\`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition \${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'}\`}>
                            <span className="material-icons-round">{icon}</span>
                            <span className="text-sm font-semibold">{label}</span>
                        </div>
                    );
                }

                function LeafletMap({ reports }) {
                    React.useEffect(() => {
                        const map = L.map('map').setView([10.7769, 106.7009], 13);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        
                        reports.forEach(r => {
                            const color = r.severity === 'Severe' ? '#ef4444' : r.severity === 'Warning' ? '#f97316' : '#3b82f6';
                            L.circleMarker([r.lat, r.lng], {
                                radius: 10,
                                fillColor: color,
                                color: "#fff",
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).addTo(map).bindPopup(\`<b>\${r.title}</b><br/>\${r.location}\`);
                        });

                        return () => map.remove();
                    }, [reports]);

                    return <div id="map"></div>;
                }

                ReactDOM.createRoot(document.getElementById('root')).render(<App />);
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🌱 ECOCONNECT HCM - PHIÊN BẢN HỒI SINH ĐÃ SẴN SÀNG`);
    console.log(` 🚀 TRẠM CHỦ: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});
