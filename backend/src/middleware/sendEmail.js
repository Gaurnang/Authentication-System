import nodemailer from "nodemailer";

export const sendEmail = async (data) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,

            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: data.email,
            subject: data.subject,
            html: data.html,
        };
        await transporter.sendMail(mailOptions);
        return true;

    }
    catch (error) {
        console.error("Email not sent:", error);
        return false;
    }
};

