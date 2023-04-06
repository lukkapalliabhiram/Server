const nodemailer = require('nodemailer');
const GMAIL_USER = require("./keys").GMAIL_USER;
const GMAIL_PASS = require("./keys").GMAIL_PASS;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "hanabiyuga2023@gmail.com",
        pass: "ojfdlqwcsrjleefu"
    },
    port: 465,
    host: 'smtp.gmail.com'
});

module.exports = async (senderAddress, s, t) => {
    let error = false;

    try {
        let info = await transporter.sendMail({
            from: '"Hanabi Yuga" <your.email@gmail.com>',
            to: senderAddress,
            subject: s,
            html: t
        });

        console.log('Email sent:', info.messageId);
    } catch (e) {
        error = true;
        console.error('Email sending error:', e);
    }
};
