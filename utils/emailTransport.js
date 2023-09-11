const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'acodewebdev@gmail.com',
        pass: 'atedndpgrmvducdi'
    }
});


module.exports = transporter;