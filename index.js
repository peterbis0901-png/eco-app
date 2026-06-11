/**
 * 🌱 ECOCONNECT HCM - BẢN V2.1 FIXED MASTERPIECE (FULL RESTORED)
 * - Khôi phục TOÀN BỘ Form Đăng ký, Đăng nhập chi tiết chuẩn thiết kế Light Theme sinh thái.
 * - Giữ nguyên vẹn 100% văn bản Hệ thống Điều khoản & Quy chế cộng đồng chi tiết.
 * - Giữ nguyên tính năng vượt rào lỗi chặn Mail của Render (Tự hiển thị mã OTP cứu cánh).
 * - Đầy đủ 100% không rút gọn: Biểu đồ Real-time, Bản đồ Leaflet, Phòng chat phân quận, 
 * Trợ lý AI EcoBot, Cán bộ duyệt sự cố & Từ chối nhập lý do, Đổi quà xanh, Eco Reels.
 */

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Kho dữ liệu lưu trữ tạm thời (In-memory database)
let users = [];
let otpStore = {};

// Khởi tạo danh sách sự cố môi trường mặc định trên địa bàn TP.HCM
let initialReports = [
    { id: "REP-001", title: "Bãi rác tự phát chân cầu chữ Y gây ô nhiễm mùi hôi", location: "Quận 8", status: "Chờ xử lý", type: "Rác thải", severity: "Nghiêm trọng", lat: 10.742, lng: 106.635, date: "2026-06-09", author: "Nguyễn Minh Triết" },
    { id: "REP-002", title: "Xả nước thải chưa qua xử lý đen ngòm ra kênh Nhiêu Lộc", location: "Quận 3", status: "Đang xử lý", type: "Nước thải", severity: "Cảnh báo", lat: 10.782, lng: 106.685, date: "2026-06-08", author: "Trần Thị Thư" },
    { id: "REP-003", title: "Cây xanh cổ thụ có hiện tượng mục rỗng gốc nguy hiểm", location: "Quận 1", status: "Đã xử lý", type: "Đô thị", severity: "Thông thường", lat: 10.776, lng: 106.695, date: "2026-06-07", author: "Lê Hoà Bình" }
];

// Khởi tạo chiến dịch tình nguyện môi trường mặc định
let initialEvents = [
    { id: "EV-101", title: "Chủ Nhật Xanh - Ra quân vớt rác lục bình làm sạch dòng kênh", loc: "Kênh Tàu Hủ, Quận 8", time: "08:00 - 21/06/2026", status: "Đã duyệt", current: 42, max: 100, org: "Đoàn Thanh Niên Quận 8", desc: "Tập trung thu gom rác thải nhựa trôi nổi và khơi thông dòng chảy tuyến kênh huyết mạch." },
    { id: "EV-102", title: "Ngày hội đổi pin cũ lấy cây xanh hành tinh", loc: "Công viên Lê Văn Tám, Quận 1", time: "09:00 - 28/06/2026", status: "Chờ duyệt", current: 0, max: 50, org: "Câu lạc bộ Hành Tinh Xanh", desc: "Thu gom pin độc hại đã qua sử dụng để chuyển giao cho nhà máy xử lý hóa chất chuyên dụng." }
];

// Cấu hình dịch vụ gửi Mail OTP cứu trạm tổng
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'peterbis0901@gmail.com',
        pass: 'bzqkxdqolforczrs'
    },
    tls: { rejectUnauthorized: false }
});

// Hàm tạo chuỗi mã xác thực OTP ngẫu nhiên dạng chữ và số bảo mật
function generateCustomOTP() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let charPart = ''; 
    let numPart = '';
    for (let i = 0; i < 3; i++) {
        charPart += letters.charAt(Math.floor(Math.random() * letters.length));
        numPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return charPart[0] + numPart[0] + charPart[1] + numPart[1] + charPart[2] + numPart[2];
}

// Endpoint yêu cầu đăng ký tài khoản & gửi OTP trực tiếp
app.post('/api/auth/register-request', async (req, res) => {
    const { name, email, password, role, adminCode } = req.body;
    
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin biểu mẫu!' });
    }
    if (role === 'Cán bộ' && adminCode !== 'ADMIN123') {
        return res.status(400).json({ success: false, message: 'Mã xác thực quyền hạn Cán bộ quản lý không chính xác!' });
    }
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Địa chỉ Email này đã tồn tại trên trạm tổng!' });
    }

    const otpCode = generateCustomOTP();
    otpStore[email] = {
        code: otpCode,
        expires: Date.now() + 5 * 60 * 1000,
        userData: { name, email, password, role }
    };

    try {
        await transporter.sendMail({
            from: `"EcoConnect HCM" <peterbis0901@gmail.com>`,
            to: email,
            subject: '[EcoConnect] Mã Xác Thực Kích Hoạt Tài Khoản Hệ Thống',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px;">
                    <h2 style="color: #10b981; text-align: center;">KÍCH HOẠT TÀI KHOẢN XANH</h2>
                    <p>Chào bạn <b>${name}</b>,</p>
                    <p>Mã xác thực OTP của bạn dùng để đăng ký tham gia mạng lưới EcoConnect HCM là:</p>
                    <div style="background: #f0fdf4; border: 2px dashed #10b981; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #047857; margin: 20px 0; border-radius: 8px;">
                        ${otpCode}
                    </div>
                    <p style="font-size: 12px; color: #64748b;">* Mã xác thực có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                </div>
            `
        });
        return res.status(200).json({ success: true, message: 'Mã OTP đã được chuyển đi thành công!' });
    } catch (error) {
        // Vượt rào bảo mật phòng trường hợp Render chặn cổng SMTP
        return res.status(200).json({ 
            success: true, 
            isFallback: true, 
            fallbackOtp: otpCode,
            message: 'Đang dùng cổng dự phòng khẩn cấp!' 
        });
    }
});

// Endpoint xác nhận mã OTP hoàn tất chu trình đăng ký
app.post('/api/auth/register-verify', (req, res) => {
    const { email, code } = req.body;
    const session = otpStore[email];

    if (!session) {
        return res.status(400).json({ success: false, message: 'Yêu cầu xác thực không tồn tại hoặc đã bị hủy!' });
    }
    if (Date.now() > session.expires) {
        delete otpStore[email];
        return res.status(400).json({ success: false, message: 'Mã xác thực OTP đã hết hạn sử dụng!' });
    }
    if (session.code.toUpperCase() !== code.toUpperCase().trim()) {
        return res.status(400).json({ success: false, message: 'Mã xác thực nhập vào không chính xác!' });
    }

    users.push(session.userData);
    delete otpStore[email];
    return res.status(200).json({ success: true, message: 'Tài khoản kích hoạt thành công!' });
});

// Trả về toàn bộ trang SPA độc nhất
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EcoConnect HCM - Hệ Thống Số Hóa Sinh Thái Thành Phố</title>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
        <style>
            body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                background-color: #f8fafc;
                height: 100vh;
                overflow: hidden;
            }
            .glass {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(226, 232, 240, 0.8);
            }
            .emerald-gradient {
                background: linear-gradient(135deg, #34d399 0%, #059669 100%);
            }
            .custom-scroll::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }
            .custom-scroll::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
            }
            .custom-scroll::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
            #map-container {
                height: 100%;
                width: 100%;
                border-radius: 24px;
                overflow: hidden;
            }
            input:focus, select:focus, textarea:focus {
                border-color: #059669 !important;
                outline: none;
                box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2) !important;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade {
                animation: fadeIn 0.4s ease forwards;
            }
        </style>
    </head>
    <body>
        <div id="root"></div>

        <script type="text/babel">
            // Thành phần vẽ biểu đồ giám sát môi trường phức hợp
            function EnvironmentalCharts() {
                React.useEffect(() => {
                    const ctxLine = document.getElementById('aqiLineChart')?.getContext('2d');
                    const ctxPie = document.getElementById('wastePieChart')?.getContext('2d');
                    
                    if (!ctxLine || !ctxPie) return;

                    const lineChart = new Chart(ctxLine, {
                        type: 'line',
                        data: {
                            labels: ['08:00', '10:00', '12:00', '14:00', '16:00'],
                            datasets: [{
                                label: 'Chỉ số AQI PM2.5',
                                data: [45, 58, 62, 50, 41],
                                borderColor: '#059669',
                                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                                tension: 0.4,
                                fill: true,
                                borderWidth: 3
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
                        }
                    });

                    const pieChart = new Chart(ctxPie, {
                        type: 'doughnut',
                        data: {
                            labels: ['Hữu cơ', 'Tái chế', 'Còn lại'],
                            datasets: [{
                                data: [48, 35, 17],
                                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                                borderWidth: 0
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                            cutout: '70%'
                        }
                    });

                    // Vòng lặp cập nhật dữ liệu tự động Real-time mô phỏng cảm biến trạm trắc nghiệm
                    const interval = setInterval(() => {
                        lineChart.data.labels.push(new Date().toLocaleTimeString().substring(0, 5));
                        lineChart.data.datasets[0].data.push(Math.floor(40 + Math.random() * 30));
                        if (lineChart.data.labels.length > 6) {
                            lineChart.data.labels.shift();
                            lineChart.data.datasets[0].data.shift();
                        }
                        lineChart.update();
                    }, 5000);

                    return () => {
                        clearInterval(interval);
                        lineChart.destroy();
                        pieChart.destroy();
                    };
                }, []);

                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="glass p-5 rounded-2xl h-64 flex flex-col lg:col-span-2 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                <span className="material-icons-round text-emerald-500 text-sm">timeline</span> Diễn biến chất lượng không khí liên tục (AQI)
                            </h4>
                            <div className="flex-1 min-h-0"><canvas id="aqiLineChart"></canvas></div>
                        </div>
                        <div className="glass p-5 rounded-2xl h-64 flex flex-col shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                                <span className="material-icons-round text-blue-500 text-sm">pie_chart</span> Thống kê phân loại rác tuần này
                            </h4>
                            <div className="flex-1 min-h-0"><canvas id="wastePieChart"></canvas></div>
                        </div>
                    </div>
                );
            }

            // Thành phần bản đồ số hóa hiển thị tọa độ các điểm nóng ô nhiễm môi trường
            function EnvironmentalMap({ reportsList }) {
                const mapInstance = React.useRef(null);

                React.useEffect(() => {
                    if (!mapInstance.current) {
                        mapInstance.current = L.map('map-id', { zoomControl: false }).setView([10.776, 106.695], 12);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                            attribution: 'EcoConnect Map'
                        }).addTo(mapInstance.current);
                        L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);
                    }

                    // Xóa các điểm đánh dấu cũ tránh chồng chéo dữ liệu rác bộ nhớ RAM
                    mapInstance.current.eachLayer((layer) => {
                        if (layer instanceof L.Marker) {
                            mapInstance.current.removeLayer(layer);
                        }
                    });

                    // Khởi tạo điểm ghim định vị mới dựa theo trạng thái xử lý sự cố
                    reportsList.forEach((item) => {
                        let colorHex = '#ef4444'; // Chờ xử lý: Đỏ hồng
                        if (item.status === 'Đang xử lý') colorHex = '#f59e0b'; // Đang xử lý: Vàng hổ phách
                        if (item.status === 'Đã xử lý') colorHex = '#10b981'; // Đã xử lý: Xanh ngọc

                        const markerIcon = L.divIcon({
                            className: 'custom-leaflet-marker',
                            html: \`<div style="background: \${colorHex}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: all 0.3s;"></div>\`,
                            iconSize: [16, 16]
                        });

                        L.marker([item.lat, item.lng], { icon: markerIcon })
                            .addTo(mapInstance.current)
                            .bindPopup(\`
                                <div style="font-family: sans-serif; padding: 4px; width: 180px;">
                                    <h5 style="margin: 0 0 4px 0; font-weight: bold; color: #1e293b; font-size:13px;">\${item.id}</h5>
                                    <p style="margin: 0 0 6px 0; color: #475569; font-size: 11px; line-height:1.3;">\${item.title}</p>
                                    <span style="background: \${colorHex}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">\${item.status}</span>
                                </div>
                            \`);
                    });
                }, [reportsList]);

                return <div id="map-id" className="w-full h-full"></div>;
            }

            // Thành phần ứng dụng chính kết nối tổng quản lý toàn bộ hệ thống diện rộng
            function App() {
                const [view, setView] = React.useState('auth'); // Khởi tạo ban đầu ở màn hình định danh 'auth' hoặc chuyển tiếp sang 'main'
                const [authTab, setAuthTab] = React.useState('register'); // Quản trị tab 'register' (Đăng ký) và 'login' (Đăng nhập)
                const [currentRole, setCurrentRole] = React.useState('Người dùng'); // Vai trò phân cấp hệ thống: Người dùng / Cán bộ / Tổ chức
                const [currentTab, setCurrentTab] = React.useState('dash'); // Quản lý chuyển đổi tab nội bộ

                // Cấu trúc dữ liệu biểu mẫu Đăng ký / Đăng nhập khôi phục toàn vẹn nguyên gốc
                const [authForm, setAuthForm] = React.useState({
                    name: '',
                    email: '',
                    password: '',
                    adminCode: '',
                    agreeTerms: false
                });

                const [showOtpModal, setShowOtpModal] = React.useState(false);
                const [otpInput, setOtpInput] = React.useState('');
                const [isLoading, setIsLoading] = React.useState(false);
                const [fallbackOtpMessage, setFallbackOtpMessage] = React.useState('');
                const [showTermsModal, setShowTermsModal] = React.useState(false);
                const [currentUser, setCurrentUser] = React.useState(null);

                // Dữ liệu lõi mô phỏng tương tác cục bộ
                const [reports, setReports] = React.useState(initialReports);
                const [events, setEvents] = React.useState(initialEvents);

                // Quản trị biểu mẫu tạo mới báo cáo sự cố của Người dùng
                const [newReport, setNewReport] = React.useState({ title: '', location: 'Quận 1', type: 'Rác thải', severity: 'Thông thường', desc: '' });
                // Quản trị biểu mẫu tạo lập chiến dịch tình nguyện của Tổ chức
                const [showEventForm, setShowEventForm] = React.useState(false);
                const [newEvent, setNewEvent] = React.useState({ title: '', loc: '', max: 50, desc: '' });

                // Điều phối hộp thoại xử lý từ chối của Cán bộ lãnh đạo thẩm quyền
                const [rejectDialog, setRejectDialog] = React.useState({ isOpen: false, targetType: '', targetId: '', reason: '' });

                // Kênh thảo luận cộng đồng trực tuyến phân chia khu vực
                const [activeChannel, setActiveChannel] = React.useState('Toàn thành phố');
                const [chatInput, setChatInput] = React.useState('');
                const [channelsData, setChannelsData] = React.useState({
                    'Toàn thành phố': [
                        { id: 1, user: 'Trần Đại', message: 'Mọi người ơi, sáng nay không khí ở quận mình có vẻ trong lành lắm nè!', isMe: false },
                        { id: 2, user: 'Hoàng Oanh', message: 'Đúng rồi á ní, chỉ số AQI báo xanh lè thích ghê!', isMe: false }
                    ],
                    'Quận 1': [], 'Quận 3': [], 'Quận 8': []
                });

                // Hệ thống AI EcoBot trợ lý môi trường thông minh phục vụ người dân
                const [aiInput, setAiInput] = React.useState('');
                const [aiHistory, setAiHistory] = React.useState([
                    { isBot: true, text: 'Xin chào! Mình là Trợ lý Ảo EcoBot 🤖. Mình có thể giúp gì cho bạn về kiến thức phân loại rác thải, xử lý pin cũ, hay hướng dẫn báo cáo sự cố bảo vệ thành phố?' }
                ]);

                // Kho phần thưởng đổi điểm thưởng tích lũy xanh
                const greenRewards = [
                    { id: 'RW-01', title: 'Cây bàng Singapore lọc không khí để bàn', cost: 100, icon: 'nature_people', stock: 15 },
                    { id: 'RW-02', title: 'Túi vải Canvas EcoConnect chất liệu tự nhiên', cost: 50, icon: 'shopping_bag', stock: 40 },
                    { id: 'RW-03', title: 'Bộ ống hút Inox cao cấp kèm cọ vệ sinh', cost: 30, icon: 'clean_hands', stock: 99 },
                    { id: 'RW-04', title: 'Bình giữ nhiệt kim loại cách nhiệt thông minh', cost: 150, icon: 'local_drink', stock: 8 }
                ];

                // Xử lý gửi yêu cầu đăng ký tài khoản và xử lý lỗi kết nối thư điện tử cứu nguy Render
                const handleRegisterSubmit = async (e) => {
                    e.preventDefault();
                    if (!authForm.name || !authForm.email || !authForm.password) {
                        return alert('Vui lòng hoàn thiện toàn bộ các trường dữ liệu bắt buộc!');
                    }
                    if (!authForm.agreeTerms) {
                        return alert('Bạn cần tham khảo và tích chọn đồng ý tuân thủ Quy chế Điều khoản Cộng đồng!');
                    }
                    if (currentRole === 'Cán bộ' && authForm.adminCode !== 'ADMIN123') {
                        return alert('Mã khóa thẩm quyền Cán bộ quản lý cấp cao không hợp lệ!');
                    }

                    setIsLoading(true);
                    setFallbackOtpMessage('');
                    try {
                        const response = await fetch('/api/auth/register-request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: authForm.name,
                                email: authForm.email,
                                password: authForm.password,
                                role: currentRole,
                                adminCode: authForm.adminCode
                            })
                        });
                        const resData = await response.json();
                        setIsLoading(false);

                        if (resData.success) {
                            setShowOtpModal(true);
                            if (resData.isFallback) {
                                setFallbackOtpMessage(resData.fallbackOtp);
                                setOtpInput(resData.fallbackOtp); // Tự điền mã để hỗ trợ trải nghiệm thuận tiện vượt tường lửa
                            }
                        } else {
                            alert(resData.message);
                        }
                    } catch (error) {
                        setIsLoading(false);
                        alert('Hệ thống trục trặc kết nối máy chủ tổng, vui lòng thử lại sau!');
                    }
                };

                // Xác thực mã OTP hoàn thành thủ tục thiết lập tài khoản thành viên hệ thống
                const handleVerifyOtpSubmit = async (e) => {
                    e.preventDefault();
                    if (!otpInput.trim()) return alert('Vui lòng điền mã OTP gồm 6 ký tự để tiếp tục!');

                    try {
                        const response = await fetch('/api/auth/register-verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: authForm.email, code: otpInput })
                        });
                        const resData = await response.json();

                        if (resData.success) {
                            alert('🎉 Kích hoạt tài khoản thành viên mạng lưới EcoConnect HCM thành công tốt đẹp!');
                            setShowOtpModal(false);
                            setCurrentUser({
                                name: authForm.name,
                                email: authForm.email,
                                role: currentRole,
                                points: 100 // Tặng điểm thưởng khích lệ thành viên mới gia nhập hành tinh xanh
                            });
                            setView('main');
                        } else {
                            alert(resData.message);
                        }
                    } catch (error) {
                        alert('Xác thực OTP thất bại do lỗi hệ thống cục bộ!');
                    }
                };

                // Đăng nhập trực tiếp không thông qua rào cản phức tạp phục vụ kiểm thử nhanh chóng
                const handleLoginSubmit = (e) => {
                    e.preventDefault();
                    if (!authForm.email || !authForm.password) {
                        return alert('Hãy nhập tài khoản Email và mật khẩu bảo mật đăng nhập!');
                    }
                    const extractedName = authForm.email.split('@')[0];
                    setCurrentUser({
                        name: extractedName.charAt(0).toUpperCase() + extractedName.slice(1),
                        email: authForm.email,
                        role: currentRole,
                        points: 140
                    });
                    setView('main');
                };

                // Đăng ký tạo sự cố phản ánh môi trường mới từ Người dân địa bàn
                const handleCreateReport = (e) => {
                    e.preventDefault();
                    if (!newReport.title.trim() || !newReport.desc.trim()) return alert('Hãy điền tiêu đề và mô tả hiện trạng sự cố cụ thể!');
                    
                    const mockCoords = {
                        'Quận 1': { lat: 10.776, lng: 106.695 },
                        'Quận 3': { lat: 10.782, lng: 106.685 },
                        'Quận 8': { lat: 10.742, lng: 106.635 }
                    };
                    const selectedCoord = mockCoords[newReport.location] || { lat: 10.75 + Math.random() * 0.05, lng: 106.65 + Math.random() * 0.05 };

                    const generatedReport = {
                        id: \`REP-00\${reports.length + 1}\`,
                        title: newReport.title,
                        location: newReport.location,
                        status: "Chờ xử lý",
                        type: newReport.type,
                        severity: newReport.severity,
                        lat: selectedCoord.lat,
                        lng: selectedCoord.lng,
                        date: new Date().toISOString().split('T')[0],
                        author: currentUser?.name || 'Thành viên ẩn danh'
                    };

                    setReports([generatedReport, ...reports]);
                    setNewReport({ title: '', location: 'Quận 1', type: 'Rác thải', severity: 'Thông thường', desc: '' });
                    alert('Gửi phản ảnh sự cố thành công! Đang chờ Cán bộ khu vực tiếp nhận thẩm định đơn.');
                };

                // Tổ chức nộp đơn đăng ký khởi động chiến dịch tình nguyện mới lên hệ thống
                const handleCreateEvent = (e) => {
                    e.preventDefault();
                    if (!newEvent.title.trim() || !newEvent.loc.trim() || !newEvent.desc.trim()) {
                        return alert('Cung cấp đầy đủ thông tin chiến dịch xin cấp phép hoạt động!');
                    }

                    const newlyEvent = {
                        id: \`EV-\${100 + events.length + 1}\`,
                        title: newEvent.title,
                        loc: newEvent.loc,
                        time: "Tùy chọn thỏa thuận - 2026",
                        status: "Chờ duyệt",
                        current: 0,
                        max: parseInt(newEvent.max) || 50,
                        org: currentUser?.name || 'Tổ chức chưa xác minh',
                        desc: newEvent.desc
                    };

                    setEvents([...events, newlyEvent]);
                    setShowEventForm(false);
                    setNewEvent({ title: '', loc: '', max: 50, desc: '' });
                    alert('Đã gửi hồ sơ kế hoạch chiến dịch lên Cán bộ Sở Tài nguyên Môi trường xét duyệt thẩm định!');
                };

                // Nghiệp vụ Cán bộ thực thi: Phê duyệt chấp thuận hoặc kích hoạt lệnh từ chối
                const executeOfficerAction = (type, targetId, finalStatus) => {
                    if (finalStatus === 'Approved') {
                        if (type === 'report') {
                            setReports(reports.map(r => r.id === targetId ? { ...r, status: 'Đang xử lý' } : r));
                        } else {
                            setEvents(events.map(ev => ev.id === targetId ? { ...ev, status: 'Đã duyệt' } : ev));
                        }
                        alert('Đã tiến hành cập nhật trạng thái phê duyệt bản ghi thành công!');
                    } else if (finalStatus === 'Resolved') {
                        setReports(reports.map(r => r.id === targetId ? { ...r, status: 'Đã xử lý' } : r));
                        alert('Đã đóng hồ sơ sự cố: Đánh dấu trạng thái khắc phục hoàn tất!');
                    } else {
                        setRejectDialog({ isOpen: true, targetType: type, targetId, reason: '' });
                    }
                };

                // Cán bộ xác nhận lý do chính thức bác bỏ đơn yêu cầu
                const confirmRejectionSubmit = () => {
                    if (!rejectDialog.reason.trim()) return alert('Bắt buộc phải nhập văn bản lý do bác bỏ để thông báo tới người nộp đơn!');
                    
                    if (rejectDialog.targetType === 'report') {
                        setReports(reports.map(r => r.id === rejectDialog.targetId ? { ...r, status: \`Từ chối (\${rejectDialog.reason})\` } : r));
                    } else {
                        setEvents(events.map(ev => ev.id === rejectDialog.targetId ? { ...ev, status: \`Bị từ chối (\${rejectDialog.reason})\` } : ev));
                    }

                    alert('Hệ thống đã lưu lại quyết định phản hồi và gửi thông tri từ chối!');
                    setRejectDialog({ isOpen: false, targetType: '', targetId: '', reason: '' });
                };

                // Xử lý gửi tin nhắn thảo luận cộng đồng thời gian thực nội bộ
                const sendChatMessage = () => {
                    if (!chatInput.trim()) return;
                    const logMsg = {
                        id: Date.now(),
                        user: currentUser?.name || 'Tôi',
                        message: chatInput,
                        isMe: true
                    };
                    setChannelsData({
                        ...channelsData,
                        [activeChannel]: [...channelsData[activeChannel], logMsg]
                    });
                    setChatInput('');
                };

                // Xử lý truy vấn thông minh nhận phản hồi từ Trợ lý ảo EcoBot AI
                const processAiQuery = () => {
                    if (!aiInput.trim()) return;
                    const queryText = aiInput.toLowerCase().trim();
                    const updatedHistory = [...aiHistory, { isBot: false, text: aiInput }];
                    setAiHistory(updatedHistory);
                    setAiInput('');

                    let replyText = "EcoBot chưa tìm thấy câu trả lời chính xác trong cơ sở tri thức hiện hành, mình sẽ ghi nhận câu hỏi để tiếp tục nâng cấp phục vụ bạn tốt hơn! 🌱";
                    
                    if (queryText.includes('pin') || queryText.includes('điện tử')) {
                        replyText = "⚠️ Khuyến cáo khẩn cấp: Tuyệt đối không vứt pin cũ cùng rác sinh hoạt chung! Hóa chất kim loại nặng chì, thủy ngân sẽ rò rỉ làm ngộ độc nguồn nước ngầm. Hãy mang đến điểm thu gom số hóa của EcoConnect hoặc các siêu thị Coopmart gần nhất để xử lý an toàn bạn nhé.";
                    } else if (queryText.includes('hữu cơ')) {
                        replyText = "🍏 Hướng dẫn phân loại rác: Rác thải hữu cơ (thức ăn thừa, rau củ quả hư, bã cà phê...) hãy phân lập vào thùng chứa Màu Xanh Lá. Nhóm rác này sẽ được nhà máy vận chuyển ủ thành phân bón hữu cơ sinh học cực tốt cho cây trồng.";
                    } else if (queryText.includes('nhựa') || queryText.includes('tái chế')) {
                        replyText = "♻️ Mẹo nhỏ tái chế: Rác tái chế cứng (chai nhựa PET, lon nhôm, vỏ hộp giấy...) nên được rửa sơ, phơi khô ráo và bỏ vào thùng Màu Trắng/Xám. Việc này giúp công nhân môi trường dễ phân tách phân loại xuất khẩu tái sinh.";
                    } else if (queryText.includes('báo cáo') || queryText.includes('ô nhiễm')) {
                        replyText = "📸 Quy trình phản ánh sự cố: Bạn vui lòng truy cập tính năng 'Bản đồ số ô nhiễm' trên Menu Sidebar, điền thông tin tiêu đề vị trí kèm hình ảnh hiện trường thực tế. Hệ thống sẽ ngay lập tức đồng bộ chuyển giao đơn tới Cán bộ chuyên trách khu vực phản hồi xử lý nhanh.";
                    }

                    setTimeout(() => {
                        setAiHistory([...updatedHistory, { isBot: true, text: replyText }]);
                    }, 600);
                };

                // GIAO DIỆN AUTH: KHÔI PHỤC HOÀN TOÀN KHÔNG BỎ SÓT CHI TIẾT NÀO
                if (view === 'auth') return (
                    <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #e6f4ea 0%, transparent 40%)' }}>
                        <div className="glass w-full max-w-[440px] p-8 rounded-[32px] border border-white/80 shadow-2xl relative z-10">
                            
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                                    <span className="material-icons-round text-3xl">spa</span>
                                </div>
                                <h1 className="text-2xl font-black text-slate-800 tracking-tight">EcoConnect HCM</h1>
                                <p className="text-[11px] text-emerald-700 font-bold tracking-wide mt-1 uppercase">🌿 Đánh thức mầm xanh - Chữa lành Trái Đất 🌍</p>
                            </div>

                            {/* Thanh chọn vai trò phân tách ba nút cấu trúc nguyên thủy */}
                            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6 text-xs font-extrabold shadow-sm">
                                {['Người dùng', 'Cán bộ', 'Tổ chức'].map((role) => (
                                    <button 
                                        key={role} 
                                        type="button"
                                        onClick={() => setCurrentRole(role)}
                                        className={\`py-2.5 rounded-xl transition-all duration-300 \${currentRole === role ? 'emerald-gradient text-white shadow-md transform scale-[1.02]' : 'text-slate-500 hover:text-slate-800'}\`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>

                            {/* Đầu mục Tab Đăng ký / Đăng nhập chuyển giao mượt mà */}
                            <div className="flex border-b border-slate-200 mb-5 text-sm font-bold text-center">
                                <button type="button" className={\`flex-1 pb-2 \${authTab === 'register' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}\`} onClick={() => setAuthTab('register')}>Đăng ký thành viên</button>
                                <button type="button" className={\`flex-1 pb-2 \ McKay \${authTab === 'login' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400'}\`} onClick={() => setAuthTab('login')}>Đăng nhập</button>
                            </div>

                            {authTab === 'register' ? (
                                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left animate-fade">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Họ và tên thành viên</label>
                                        <input type="text" placeholder="Nhập tên thật của bạn..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold transition-all" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Địa chỉ thư điện tử Email</label>
                                        <input type="email" placeholder="vi-du@email.com..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold transition-all" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Mật khẩu bảo mật đăng nhập</label>
                                        <input type="password" placeholder="Tối thiểu 6 ký tự..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold transition-all" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                                    </div>

                                    {currentRole === 'Cán bộ' && (
                                        <div className="bg-emerald-50/50 p-3.5 border border-emerald-200/60 rounded-2xl animate-fade">
                                            <label className="block text-[11px] font-black text-emerald-800 mb-1.5 uppercase flex items-center gap-1"><span className="material-icons-round text-sm">verified_user</span>Mã ủy quyền quản trị cấp cao</label>
                                            <input type="text" placeholder="Vui lòng điền mã thẩm quyền để xác minh quyền hạn (ADMIN123)..." className="w-full bg-white border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold text-emerald-900 placeholder-emerald-400" value={authForm.adminCode} onChange={e => setAuthForm({ ...authForm, adminCode: e.target.value })} required />
                                        </div>
                                    )}

                                    <div className="flex items-start gap-2.5 text-[11px] text-slate-500 font-medium leading-normal">
                                        <input id="check-terms" type="checkbox" className="mt-0.5 h-4 w-4 accent-emerald-600 border-slate-200 rounded cursor-pointer" checked={authForm.agreeTerms} onChange={e => setAuthForm({ ...authForm, agreeTerms: e.target.checked })} />
                                        <label htmlFor="check-terms" className="cursor-pointer select-none">
                                            Tôi nghiêm túc đọc hiểu, cam kết đồng ý tuân thủ toàn diện <span className="text-emerald-600 font-bold underline hover:text-emerald-700" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>Quy chế hoạt động & Điều khoản điều lệ</span> bảo vệ an toàn thông tin môi trường xanh của trạm tổng.
                                        </label>
                                    </div>

                                    <button type="submit" className="w-full py-4 mt-2 emerald-gradient text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg hover:opacity-95 transition-all flex justify-center items-center gap-2">
                                        {isLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Khởi tạo tài khoản'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleLoginSubmit} className="space-y-4 text-left animate-fade">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Địa chỉ Email đăng nhập</label>
                                        <input type="email" placeholder="Nhập Email của bạn..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Mật khẩu tài khoản</label>
                                        <input type="password" placeholder="Nhập mật khẩu..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                                    </div>

                                    <button type="submit" className="w-full py-4 mt-4 emerald-gradient text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg hover:opacity-95 transition-all">
                                        Đăng nhập hệ thống
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* MODAL PHÂN HỆ OTP - PHÒNG HỜ LỖI CHẶN PORT GỬI THƯ CỦA SERVER RENDER */}
                        {showOtpModal && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fade">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-[380px] text-center border shadow-2xl">
                                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                        <span className="material-icons-round text-2xl">mark_email_read</span>
                                    </div>
                                    <h3 className="font-extrabold text-slate-800 text-base">Yêu Cầu Nhập Mã OTP</h3>
                                    <p className="text-[11px] text-slate-400 font-medium mt-1 mb-4 leading-relaxed">Hệ thống đang tiến hành định tuyến gửi mã xác thực gồm 6 ký tự bảo mật tới Email của bạn.</p>

                                    {fallbackOtpMessage && (
                                        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[10px] p-3 rounded-2xl text-left mb-4 leading-normal">
                                            <p className="font-bold text-amber-700 flex items-center gap-1 mb-1">
                                                <span className="material-icons-round text-xs">warning_amber</span> PHÒNG TRÁNH LỖI CHẶN SMTP HỆ THỐNG RENDER:
                                            </p>
                                            Hệ thống tự động đồng bộ kết xuất cấp mã test nội bộ trực tiếp dưới đây:<br/>
                                            <strong className="block text-center text-emerald-800 bg-emerald-100/70 p-2 rounded-xl mt-1.5 border border-emerald-300 font-mono text-base tracking-widest">{fallbackOtpMessage}</strong>
                                        </div>
                                    )}

                                    <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                                        <input type="text" placeholder="Gõ 6 ký tự OTP tại đây..." className="w-full p-3.5 bg-slate-50 border border-slate-200 text-center font-black tracking-widest text-lg rounded-xl uppercase placeholder-slate-300" maxLength="6" value={otpInput} onChange={e => setOtpInput(e.target.value)} required />
                                        <div className="flex gap-2 font-bold text-xs">
                                            <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl" onClick={() => setShowOtpModal(false)}>Hủy bỏ</button>
                                            <button type="submit" className="flex-1 py-3 emerald-gradient text-white rounded-xl shadow-md">Xác thực kích hoạt</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* CHÍNH SÁCH VÀ ĐIỀU KHOẢN CHI TIẾT NGUYÊN BẢN CỦA BRO KHÔNG MẤT MỘT CHỮ */}
                        {showTermsModal && (
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade">
                                <div className="bg-white w-full max-w-[500px] rounded-3xl p-6 shadow-2xl text-xs text-slate-600 leading-relaxed flex flex-col max-h-[85vh] border">
                                    <h3 className="font-black text-sm text-emerald-800 mb-3 flex items-center gap-1.5 border-b pb-2 flex-shrink-0">
                                        <span className="material-icons-round text-lg text-emerald-600">gavel</span> QUY CHẾ HOẠT ĐỘNG VÀ ĐIỀU KHOẢN HỆ THỐNG ECOCONNECT
                                    </h3>
                                    <div className="flex-1 overflow-y-auto pr-1 custom-scroll space-y-3 font-medium text-justify">
                                        <p><strong>Điều 1. Phạm vi áp dụng và Mục đích tôn chỉ:</strong> Hệ thống số hóa sinh thái EcoConnect thành phố Hồ Chí Minh là cổng thông tin tiếp nhận, điều phối, giám sát môi trường dựa trên sự đóng góp của cộng đồng. Hệ thống hướng đến xây dựng môi trường đô thị văn minh, xanh - sạch - đẹp.</p>
                                        <p><strong>Điều 2. Trách nhiệm định danh và Bảo mật tài khoản:</strong> Thành viên đăng ký có trách nhiệm cung cấp chính xác thông tin tên thật và địa chỉ email liên hệ. Mọi hành vi cố tình sử dụng thông tin giả mạo nhằm mục đích phá hoại trạm tổng sẽ bị khóa log IP vĩnh viễn.</p>
                                        <p><strong>Điều 3. Quy chế phản ánh và Kiểm soát thông tin sự cố:</strong> Người dùng cam kết chỉ gửi thông tin phản ánh về các hiện trạng ô nhiễm, bãi rác tự phát, xả bẩn môi trường có thực trên địa bàn kèm bằng chứng tọa độ rõ ràng. Tuyệt đối cấm các thông tin có tính chất bôi nhọ cá nhân, tuyên truyền kích động chính trị hoặc lừa đảo xã hội.</p>
                                        <p><strong>Điều 4. Chế tài xử phạt hành vi báo cáo rác giả mạo:</strong> Cán bộ chuyên trách có toàn quyền thực thi hủy bỏ, bác bỏ các đơn thư phản ánh sai sự thật. Tài khoản gửi thông tin sai phạm cố ý quá 3 lần sẽ bị tước bỏ toàn bộ điểm thưởng tích lũy (PTS) và cấm quyền tham gia các chiến dịch tình nguyện xanh vô thời hạn.</p>
                                        <p><strong>Điều 5. Cam kết bảo mật dữ liệu hành trình:</strong> EcoConnect cam kết bảo mật tuyệt đối thông tin cá nhân của người dân tham gia phản ánh sự cố, tuân thủ đúng pháp luật bảo vệ dữ liệu cá nhân. Tọa độ phản ánh chỉ được chia sẻ công khai cho Cán bộ cơ quan thẩm quyền trực tiếp thụ lý giải quyết.</p>
                                    </div>
                                    <button className="w-full mt-4 py-3.5 emerald-gradient text-white font-bold rounded-xl shadow-md uppercase tracking-wider text-[11px] flex-shrink-0" onClick={() => setShowTermsModal(false)}>Tôi đã đọc hiểu và hoàn toàn đồng ý tuân thủ</button>
                                </div>
                            </div>
                        )}
                    </div>
                );

                // =========================================================================
                // GIAO DIỆN CHÍNH (MAIN DASHBOARD APPLICATION) - GIỮ ĐẦY ĐỦ 100% CÁC TÍNH NĂNG 
                // =========================================================================
                const navigationItems = [
                    { id: 'dash', name: 'Tổng quan hệ thống', icon: 'dashboard' },
                    { id: 'map', name: 'Bản đồ sự cố ô nhiễm', icon: 'map' },
                    { id: 'report', name: 'Gửi phản ánh mới', icon: 'campaign' },
                    { id: 'event', name: 'Chiến dịch tình nguyện', icon: 'groups' },
                    { id: 'chat', name: 'Phòng chat cộng đồng', icon: 'forum' },
                    { id: 'ai', name: 'Trợ lý ảo EcoBot AI', icon: 'smart_toy' },
                    { id: 'reels', name: 'Eco Reels Video ngắn', icon: 'movie_filter' },
                    { id: 'rewards', name: 'Đổi quà tặng điểm thưởng', icon: 'workspace_premium' },
                    { id: 'profile', name: 'Hồ sơ thành viên', icon: 'account_circle' }
                ];

                return (
                    <div className="h-screen flex p-3 gap-3 bg-slate-100">
                        
                        {/* SIDEBAR BẢN KHUÂN MẪU CHUẨN ĐẸP MẮT */}
                        <aside className="w-64 glass rounded-[24px] p-4 flex flex-col shadow-sm flex-shrink-0">
                            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-200/60 flex-shrink-0">
                                <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                                    <span className="material-icons-round text-xl">spa</span>
                                </div>
                                <div>
                                    <h2 className="font-black text-slate-800 text-sm tracking-tight">EcoConnect</h2>
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">V2.1 MASTERPIECE</span>
                                </div>
                            </div>

                            <nav className="flex-1 space-y-1 overflow-y-auto custom-scroll">
                                {navigationItems.map((item) => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => setCurrentTab(item.id)} 
                                        className={\`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left \${currentTab === item.id ? 'emerald-gradient text-white shadow-md shadow-emerald-500/10' : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'}\`}
                                    >
                                        <span className="material-icons-round text-base">{item.icon}</span>
                                        <span>{item.name}</span>
                                    </button>
                                ))}
                            </nav>

                            <button onClick={() => { setCurrentUser(null); setView('auth'); }} className="w-full mt-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all flex-shrink-0">
                                <span className="material-icons-round text-sm">logout</span> Đăng xuất an toàn
                            </button>
                        </aside>

                        {/* KHOANG CHỨA NỘI DUNG BIẾN ĐỔI TAB LINH HOẠT TỐC ĐỘ CAO */}
                        <div className="flex-1 flex flex-col min-w-0">
                            
                            <header className="glass rounded-2xl p-4 mb-3 flex justify-between items-center shadow-sm border border-white flex-shrink-0">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span>Tài khoản trực tuyến:</span>
                                    <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-black flex items-center gap-1 shadow-inner">
                                        <span className="material-icons-round text-xs">shield</span> {currentUser?.name} ({currentUser?.role})
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-md tracking-wider uppercase">TP. HỒ CHÍ MINH</span>
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 font-black text-xs px-3 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                        <span className="material-icons-round text-sm text-amber-500">stars</span>
                                        <span>{currentUser?.points} PTS</span>
                                    </div>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto custom-scroll pr-1 min-h-0">
                                
                                {/* TAB 1: TỔNG QUAN HỆ THỐNG */}
                                {currentTab === 'dash' && (
                                    <div className="space-y-5 {{ animate-fade }}">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold text-slate-500">
                                            <div className="glass p-4 rounded-2xl border border-white flex items-center gap-4 shadow-sm">
                                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><span className="material-icons-round text-lg">workspace_premium</span></div>
                                                <div><p className="text-[10px] text-slate-400">Điểm cống hiến</p><p className="font-black text-slate-800 text-lg">{currentUser?.points} PTS</p></div>
                                            </div>
                                            <div className="glass p-4 rounded-2xl border border-white flex items-center gap-4 shadow-sm">
                                                <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><span className="material-icons-round text-lg">campaign</span></div>
                                                <div><p className="text-[10px] text-slate-400">Hồ sơ sự cố</p><p className="font-black text-slate-800 text-lg">{reports.length} Vụ việc</p></div>
                                            </div>
                                            <div className="glass p-4 rounded-2xl border border-white flex items-center gap-4 shadow-sm">
                                                <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><span className="material-icons-round text-lg">volunteer_activism</span></div>
                                                <div><p className="text-[10px] text-slate-400">Chiến dịch xanh</p><p className="font-black text-slate-800 text-lg">{events.length} Đợt</p></div>
                                            </div>
                                            <div className="glass p-4 rounded-2xl border border-white flex items-center gap-4 shadow-sm">
                                                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><span className="material-icons-round text-lg">cloud</span></div>
                                                <div><p className="text-[10px] text-slate-400">Mật độ PM2.5</p><p className="font-black text-blue-600 text-lg">36 μg/m³</p></div>
                                            </div>
                                        </div>
                                        <EnvironmentalCharts />
                                    </div>
                                )}

                                {/* TAB 2: BẢN ĐỒ SỰ CỐ Ô NHIỄM CÓ BẢNG ĐIỀU PHỐI CÁN BỘ */}
                                {currentTab === 'map' && (
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[calc(100vh-130px)] animate-fade">
                                        <div className="xl:col-span-2 glass rounded-3xl p-2 border border-white shadow-sm h-full">
                                            <EnvironmentalMap reportsList={reports} />
                                        </div>
                                        <div className="glass rounded-3xl p-4 border border-white flex flex-col h-full overflow-hidden">
                                            <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><span className="material-icons-round text-emerald-600 text-base">admin_panel_settings</span> Trạm điều phối sự cố cục bộ</h4>
                                            <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-1">
                                                {reports.map((item) => {
                                                    let badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
                                                    if (item.status === 'Đang xử lý') badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                                                    if (item.status === 'Đã xử lý') badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";

                                                    return (
                                                        <div key={item.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl text-[11px] font-medium shadow-sm space-y-2">
                                                            <div className="flex justify-between items-center text-slate-400 font-bold">
                                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">{item.id}</span>
                                                                <span className="flex items-center gap-0.5"><span className="material-icons-round text-xs">place</span>{item.location}</span>
                                                            </div>
                                                            <h5 className="font-black text-slate-700 text-xs leading-normal">{item.title}</h5>
                                                            <div className="text-slate-400">Người báo cáo: <span className="text-slate-600 font-bold">{item.author}</span></div>
                                                            <div className="flex justify-between items-center pt-2 border-t border-dashed">
                                                                <span className={\`px-2 py-0.5 font-bold rounded-md border \${badgeStyle}\`}>{item.status}</span>
                                                                
                                                                {currentUser?.role === 'Cán bộ' && !item.status.includes('Từ chối') && !item.status.includes('Đã xử lý') && (
                                                                    <div className="flex gap-1">
                                                                        {item.status === 'Chờ xử lý' && (
                                                                            <button onClick={() => executeOfficerAction('report', item.id, 'Approved')} className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:opacity-90">Tiếp nhận</button>
                                                                        )}
                                                                        {item.status === 'Đang xử lý' && (
                                                                            <button onClick={() => executeOfficerAction('report', item.id, 'Resolved')} className="px-2 py-1 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:opacity-90">Hoàn tất</button>
                                                                        )}
                                                                        <button onClick={() => executeOfficerAction('report', item.id, 'Reject')} className="px-2 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200">Bác bỏ</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: GỬI PHẢN ÁNH MỚI CHỮA LÀNH ĐÔ THỊ */}
                                {currentTab === 'report' && (
                                    <div className="glass rounded-3xl p-6 border border-white max-w-xl mx-auto shadow-sm animate-fade">
                                        <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-200"><span className="material-icons-round text-emerald-600 text-2xl">add_photo_alternate</span><div><h4 className="font-black text-sm text-slate-800">Nộp Đơn Phản Ánh Ô Nhiễm</h4><p className="text-[11px] text-slate-400 font-medium">Thông tin của bạn giúp cơ quan chức năng can thiệp kịp thời!</p></div></div>
                                        <form onSubmit={handleCreateReport} className="space-y-4 text-xs font-bold text-slate-600">
                                            <div>
                                                <label className="block mb-1.5 uppercase text-[10px] text-slate-400">Tiêu đề phản ánh ngắn gọn</label>
                                                <input type="text" placeholder="Ví dụ: Bãi tập kết rác tự phát bốc mùi hôi thối..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-semibold" value={newReport.title} onChange={e=>setNewReport({...newReport, title: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block mb-1.5 uppercase text-[10px] text-slate-400">Địa bàn Quận trực thuộc</label>
                                                    <select className="w-full bg-white border border-slate-200 px-3 py-3 rounded-xl font-semibold" value={newReport.location} onChange={e=>setNewReport({...newReport, location: e.target.value})}>
                                                        <option value="Quận 1">Quận 1</option><option value="Quận 3">Quận 3</option><option value="Quận 8">Quận 8</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block mb-1.5 uppercase text-[10px] text-slate-400">Phân hệ phân loại</label>
                                                    <select className="w-full bg-white border border-slate-200 px-3 py-3 rounded-xl font-semibold" value={newReport.type} onChange={e=>setNewReport({...newReport, type: e.target.value})}>
                                                        <option value="Rác thải">Rác thải sinh hoạt</option><option value="Nước thải">Nước thải độc hại</option><option value="Đô thị">Hạ tầng đô thị</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block mb-1.5 uppercase text-[10px] text-slate-400">Mức độ nghiêm trọng</label>
                                                    <select className="w-full bg-white border border-slate-200 px-3 py-3 rounded-xl font-semibold" value={newReport.severity} onChange={e=>setNewReport({...newReport, severity: e.target.value})}>
                                                        <option value="Thông thường">Thông thường</option><option value="Cảnh báo">Cảnh báo cao</option><option value="Nghiêm trọng">Nghiêm trọng bách cấp</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block mb-1.5 uppercase text-[10px] text-slate-400">Mô tả chi tiết bằng chứng và số nhà hiện trường</label>
                                                <textarea rows="4" placeholder="Vui lòng cung cấp mô tả chi tiết cụ thể để tổ công tác dễ tìm kiếm hiện trường..." className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl font-semibold resize-none" value={newReport.desc} onChange={e=>setNewReport({...newReport, desc: e.target.value})}></textarea>
                                            </div>
                                            <button type="submit" className="w-full py-4 emerald-gradient text-white font-bold rounded-xl uppercase tracking-widest shadow-md hover:opacity-95 transition-all">Gửi tờ trình phê duyệt</button>
                                        </form>
                                    </div>
                                )}

                                {/* TAB 4: CHIẾN DỊCH TÌNH NGUYỆN PHỐI HỢP CÁN BỘ & TỔ CHỨC */}
                                {currentTab === 'event' && (
                                    <div className="space-y-4 animate-fade">
                                        <div className="flex justify-between items-center">
                                            <div><h3 className="font-black text-slate-700 text-sm uppercase">Chiến dịch tình nguyện môi trường</h3><p className="text-[11px] text-slate-400 font-medium">Chung tay hành động vì một thành phố xanh tươi hơn</p></div>
                                            
                                            {currentUser?.role === 'Tổ chức' && (
                                                <button onClick={() => setShowEventForm(true)} className="px-4 py-2.5 emerald-gradient text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"><span className="material-icons-round text-sm">add</span> Đăng ký trận ra quân mới</button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {events.map((ev) => (
                                                <div key={ev.id} className="glass p-5 rounded-2xl border border-white flex flex-col justify-between shadow-sm space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400"><span>Mã trận: {ev.id}</span><span className="text-emerald-600">🏫 {ev.org}</span></div>
                                                        <h4 className="font-black text-slate-700 text-xs leading-normal">{ev.title}</h4>
                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{ev.desc}</p>
                                                        <p className="text-[11px] text-slate-400 font-semibold pt-1">📍 Địa điểm: {ev.loc}<br/>⏱ Thời gian: {ev.time}</p>
                                                    </div>

                                                    <div className="pt-3 border-t border-dashed flex justify-between items-center text-[11px] font-bold text-slate-500">
                                                        <div>Quân số tham gia: <span className="text-emerald-600 font-black">{ev.current}/{ev.max}</span> người</div>
                                                        
                                                        {currentUser?.role === 'Cán bộ' && ev.status === 'Chờ duyệt' ? (
                                                            <div className="flex gap-1.5">
                                                                <button onClick={() => executeOfficerAction('event', ev.id, 'Approved')} className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg shadow-sm">Duyệt cấp phép</button>
                                                                <button onClick={() => executeOfficerAction('event', ev.id, 'Reject')} className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg">Bác bỏ</button>
                                                            </div>
                                                        ) : (
                                                            <span className={\`px-2 py-0.5 rounded font-black \${ev.status === 'Đã duyệt' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}\`}>{ev.status}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 5: PHÒNG CHAT THẢO LUẬN CỘNG ĐỒNG THEO PHÂN KHU ĐỊA BÀN */}
                                {currentTab === 'chat' && (
                                    <div className="glass rounded-3xl h-[calc(100vh-130px)] border border-white flex overflow-hidden shadow-sm animate-fade">
                                        <div className="w-44 bg-slate-50/60 border-r border-slate-200/80 p-3 flex flex-col gap-1.5 text-[11px] font-bold">
                                            <span className="text-[9px] uppercase tracking-wider text-slate-400 mb-1 pl-2">Kênh thảo luận</span>
                                            {Object.keys(channelsData).map((ch) => (
                                                <button key={ch} onClick={() => setActiveChannel(ch)} className={\`p-3 rounded-xl text-left flex items-center gap-1.5 transition-all \${activeChannel === ch ? 'emerald-gradient text-white shadow-md' : 'text-slate-600 hover:bg-white/70'}\`}>
                                                    <span># {ch}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1 flex flex-col bg-white/40">
                                            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scroll text-xs">
                                                {channelsData[activeChannel].length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-medium gap-1"><span className="material-icons-round text-3xl">chat_bubble_outline</span>Chưa có tin nhắn thảo luận nào tại khu vực này!</div>
                                                ) : (
                                                    channelsData[activeChannel].map((msg) => (
                                                        <div key={msg.id} className={\`flex flex-col \${msg.isMe ? 'items-end' : 'items-start'}\`}>
                                                            <span className="text-[10px] text-slate-400 font-black mb-1 px-1">{msg.user}</span>
                                                            <p className={\`p-3 rounded-2xl max-w-sm font-semibold shadow-sm leading-relaxed \${msg.isMe ? 'emerald-gradient text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}\`}>{msg.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <div className="p-3 bg-white border-t border-slate-200/80 flex gap-2">
                                                <input type="text" placeholder={\`Nhắn tin gửi tới nhóm phòng # \${activeChannel}...\`} className="flex-1 border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold outline-none" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} />
                                                <button onClick={sendChatMessage} className="px-5 emerald-gradient text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"><span className="material-icons-round text-sm">send</span> Gửi</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 6: TRỢ LÝ ẢO THÔNG MINH ECOBOT AI */}
                                {currentTab === 'ai' && (
                                    <div className="glass rounded-3xl h-[calc(100vh-130px)] border border-white flex flex-col overflow-hidden max-w-2xl mx-auto shadow-sm animate-fade">
                                        <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1"><span className="material-icons-round text-emerald-600 text-sm">smart_toy</span> Trung tâm tư vấn trực tuyến EcoBot AI</h4>
                                        </div>

                                        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto custom-scroll text-xs bg-slate-50/20">
                                            {aiHistory.map((m, index) => (
                                                <div key={index} className={\`flex gap-2.5 \${m.isBot ? 'items-start' : 'items-start flex-row-reverse'}\`}>
                                                    <div className={\`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm \${m.isBot ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}\`}>
                                                        {m.isBot ? 'AI' : 'ME'}
                                                    </div>
                                                    <p className={\`p-3.5 rounded-2xl max-w-md font-medium shadow-sm leading-relaxed text-justify \${m.isBot ? 'bg-white border text-slate-700' : 'emerald-gradient text-white'}\`}>{m.text}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-3 bg-white border-t border-slate-200 flex gap-2 flex-shrink-0">
                                            <input type="text" placeholder="Hỏi AI cách phân loại rác, xử lý pin, điểm đổi quà..." className="flex-1 border border-slate-200 px-4 py-3 rounded-xl text-xs font-semibold" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && processAiQuery()} />
                                            <button onClick={processAiQuery} className="px-5 emerald-gradient text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1">Hỏi Đáp</button>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 7: ECO REELS - VIDEO NGẮN TRUYỀN CẢM HỨNG MÔI TRƯỜNG */}
                                {currentTab === 'reels' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade">
                                        {[
                                            { title: "Cách xử lý 100% vỏ hộp sữa giấy học đường đúng chuẩn", view: "12K views", duration: "0:45", bg: "from-emerald-500 to-teal-700" },
                                            { title: "Hành trình hồi sinh dòng kênh Nhiêu Lộc - Thị Nghè lịch sử", view: "45K views", duration: "1:00", bg: "from-blue-500 to-indigo-700" },
                                            { title: "Vòng đời tái sinh của chiếc chai nhựa PET vứt đúng thùng rác", view: "8K views", duration: "0:30", bg: "from-amber-500 to-orange-700" }
                                        ].map((video, idx) => (
                                            <div key={idx} className="glass rounded-3xl overflow-hidden border border-white shadow-sm flex flex-col h-80 relative group">
                                                <div className={\`flex-1 bg-gradient-to-br \${video.bg} flex flex-col justify-between p-4 text-white relative\`}>
                                                    <span className="absolute top-3 right-3 bg-black/40 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">{video.duration}</span>
                                                    <div className="h-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all cursor-pointer">
                                                        <span className="material-icons-round text-5xl bg-white/20 p-2 rounded-full backdrop-blur-sm">play_arrow</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="bg-white/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm">🎬 Eco Reels</span>
                                                        <h4 className="font-black text-xs leading-snug drop-shadow-sm">{video.title}</h4>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white flex justify-between items-center text-[11px] font-bold text-slate-500 border-t">
                                                    <span className="flex items-center gap-0.5 text-slate-400"><span className="material-icons-round text-xs">visibility</span> {video.view}</span>
                                                    <button onClick={() => alert('Đã cộng thêm 5 điểm xanh lan tỏa chia sẻ nội dung video này!')} className="text-emerald-600 flex items-center gap-0.5 hover:underline"><span className="material-icons-round text-xs">share</span> Chia sẻ</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TAB 8: ĐỔI QUÀ TẶNG ĐIỂM THƯỞNG TÍCH LŨY XANH */}
                                {currentTab === 'rewards' && (
                                    <div className="space-y-4 animate-fade">
                                        <div><h3 className="font-black text-slate-700 text-sm uppercase">Cửa hàng quà tặng sinh thái</h3><p className="text-[11px] text-slate-400 font-medium">Tích lũy điểm xanh từ các báo cáo chuẩn xác và chiến dịch tình nguyện để đổi lấy quà hữu ích</p></div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {greenRewards.map((reward) => (
                                                <div key={reward.id} className="glass p-4 rounded-2xl border border-white flex flex-col justify-between shadow-sm space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="h-28 w-full bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 text-center p-2 relative">
                                                            <span className="material-icons-round text-4xl text-emerald-500 mb-1">{reward.icon}</span>
                                                            <span className="absolute top-2 left-2 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">{reward.cost} PTS</span>
                                                        </div>
                                                        <h4 className="font-black text-slate-700 text-xs leading-normal">{reward.title}</h4>
                                                        <div className="text-[10px] font-bold text-slate-400 flex justify-between"><span>Mã: {reward.id}</span><span>Còn lại: {reward.stock} sản phẩm</span></div>
                                                    </div>
                                                    <button onClick={() => {
                                                        if ((currentUser?.points || 0) >= reward.cost) {
                                                            alert(\`🎉 Đổi quà thành công! Mã QR nhận quà tại bưu cục Phường đã được gửi tới hòm thư \${currentUser?.email}\`);
                                                        } else {
                                                            alert('Rất tiếc! Số lượng điểm thưởng tích lũy xanh hiện hành của bạn chưa đủ để quy đổi món quà này!');
                                                        }
                                                    }} className="w-full py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white font-extrabold rounded-xl text-xs text-slate-600 transition-all shadow-sm">Quy đổi ngay</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 9: HỒ SƠ THÀNH VIÊN BAN ĐẦU */}
                                {currentTab === 'profile' && (
                                    <div className="glass rounded-3xl p-6 border border-white max-w-md mx-auto shadow-sm text-center space-y-5 animate-fade relative overflow-hidden">
                                        <div className="absolute top-0 inset-x-0 h-20 emerald-gradient opacity-10"></div>
                                        <div className="relative pt-4 flex flex-col items-center">
                                            <div className="h-20 w-20 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center shadow-md font-black text-slate-600 text-2xl mb-3 uppercase">
                                                {currentUser?.name ? currentUser.name.substring(0,2) : 'US'}
                                            </div>
                                            <h4 className="font-black text-slate-800 text-base">{currentUser?.name}</h4>
                                            <p className="text-[11px] text-slate-400 font-semibold mb-2">📧 Hòm thư: {currentUser?.email}</p>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black uppercase border border-emerald-200 shadow-inner">{currentUser?.role} chính thức</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left space-y-2 text-[11px] font-medium text-slate-500">
                                            <p className="font-black text-slate-700 uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1"><span className="material-icons-round text-sm text-amber-500">military_tech</span> Huy chương thành tích đạt được</p>
                                            <div className="flex gap-2 flex-wrap pt-1">
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold">🛡 Đại sứ xanh thành phố</span>
                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold">⚡ Phản ánh trung thực</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* HỘP THOẠI POPUP NHẬP LÝ DO TỪ CHỐI BÁC BỎ - PHỤC VỤ NGHIỆP VỤ CÁN BỘ */}
                        {rejectDialog.isOpen && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade">
                                <div className="bg-white rounded-2xl p-5 w-full max-w-[350px] shadow-2xl border text-xs font-bold text-slate-600 space-y-3">
                                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1"><span className="material-icons-round text-rose-600 text-base">gavel</span> Lý Do Bác Bỏ Thẩm Định</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Vui lòng ghi rõ lý do từ chối hồ sơ này để hệ thống cập nhật đồng bộ thông báo phản hồi chính thức cho người nộp đơn được biết.</p>
                                    <textarea className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-semibold resize-none" rows="3" placeholder="Nhập văn bản phản hồi cụ thể (Ví dụ: Sai lệch tọa độ thực tế, hình ảnh giả mạo...)" value={rejectDialog.reason} onChange={e => setRejectDialog({ ...rejectDialog, reason: e.target.value })}></textarea>
                                    <div className="flex gap-2 font-bold text-xs pt-1">
                                        <button className="flex-1 py-2.5 bg-slate-100 text-slate-500 rounded-xl" onClick={() => setRejectDialog({ isOpen: false, targetType: '', targetId: '', reason: '' })}>Hủy</button>
                                        <button className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl shadow-md" onClick={confirmRejectionSubmit}>Xác nhận bác bỏ</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BIỂU MẪU ĐĂNG KÝ SỰ KIỆN DÀNH RIÊNG CHO CẤP TỔ CHỨC */}
                        {showEventForm && (
                            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade">
                                <div className="bg-white rounded-3xl p-6 w-full max-w-[440px] shadow-2xl border text-xs font-bold text-slate-600 space-y-4">
                                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1"><span className="material-icons-round text-emerald-600 text-base">assignment</span> Đăng Ký Hồ Sơ Hoạt Động Xanh</h4>
                                    <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Tên tiêu đề chiến dịch ra quân</label>
                                            <input type="text" placeholder="Ví dụ: Ngày hội gom rác tái chế đổi quà..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} required />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Địa điểm tổ chức</label>
                                                <input type="text" placeholder="Địa chỉ cụ thể..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold" value={newEvent.loc} onChange={e=>setNewEvent({...newEvent, loc: e.target.value})} required />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-400 uppercase mb-1">Quân số tối đa (Người)</label>
                                                <input type="number" placeholder="50..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold" value={newEvent.max} onChange={e=>setNewEvent({...newEvent, max: e.target.value})} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase mb-1">Mô tả chi tiết nội dung hoạt động xanh</label>
                                            <textarea rows="3" placeholder="Mô tả chi tiết nội dung hoạt động..." className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-semibold resize-none" value={newEvent.desc} onChange={e=>setNewEvent({...newEvent, desc: e.target.value})} required></textarea>
                                        </div>
                                        <div className="flex gap-2 pt-2 text-xs">
                                            <button type="button" className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl" onClick={() => setShowEventForm(false)}>Hủy bỏ</button>
                                            <button type="submit" className="flex-1 py-3 emerald-gradient text-white rounded-xl shadow-md">Nộp đơn lên Cán bộ</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        
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
app.listen(PORT, '0.0.0.0', () => console.log(`Trạm tổng V2.1 FIXED MASTERPIECE đang chạy trên cổng ${PORT}`));
