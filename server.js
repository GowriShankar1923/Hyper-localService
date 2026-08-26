const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to use IPv4 instead of IPv6 for DNS resolution
// This fixes the ENETUNREACH error when your ISP blocks or badly routes IPv6 traffic.
dns.setDefaultResultOrder('ipv4first');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kalagowrishankar8@gmail.com',
        pass: 'yktxmcpvpwpgegwv' // App Password
    }
});

app.post('/send-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const mailOptions = {
        from: '"Hyperlocal Services" <kalagowrishankar8@gmail.com>',
        to: email,
        subject: 'Your OTP Code - Hyperlocal Services',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #064ca3; text-align: center;">Hyperlocal Services</h2>
                <p>Hello,</p>
                <p>You requested to register as a customer. Please use the following One-Time Password (OTP) to complete your registration:</p>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <h1 style="letter-spacing: 5px; margin: 0; color: #333;">${otp}</h1>
                </div>
                <p>This code is valid for 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Hyperlocal Services Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${email} (OTP: ${otp})`);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending real email (Fallback to offline mode):', error);
        // Fallback: If no internet or network blocks SMTP, return the OTP to the frontend
        res.json({ success: true, simulated: true, otp: otp, message: 'Offline Mode: Email blocked by network' });
    }
});

app.listen(port, () => {
    console.log(`OTP Backend Server running on http://localhost:${port}`);
});
