const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");



const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'acodewebdev@gmail.com',
        pass: 'atedndpgrmvducdi'
    }
});


const sendMailAsync = (mailOptions, options = {}) => {

    // console.log(mailOptions);

    return new Promise((res, rej) => {

        const emailTemplate = fs.readFileSync(require.resolve(mailOptions.html), 'utf-8');
        const renderedEmail = ejs.render(emailTemplate, { ...options, subject: mailOptions.subject })
        mailOptions.html = renderedEmail

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                rej('Failed to send mail.');
            }
            res(info.response);
        });
    })
}


module.exports = transporter;
module.exports = { sendMailAsync };