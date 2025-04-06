const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "jagadeep.bsg@gmail.com",
        pass: "rehj rxir ujts zmhp",
    },
});

const mailOptions = {
    from: "jagadeep.bsg@gmail.com",
    to: "venkatkarthikeyandec@gmail.com",
    subject: "Test Email",
    text: "This is a test email from Nodemailer!",
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log("Error:", error);
    } else {
        console.log("Email sent:", info.response);
    }
});
