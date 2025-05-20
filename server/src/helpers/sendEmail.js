import nodemailer from "nodemailer";
import path from 'path';
import hbs from "nodemailer-express-handlebars";
import dotenv from "dotenv";
import {fileURLToPath} from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async(subject, send_to, reply_to, template, sent_from, name, link) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        // host: "smtp-office365.com",
        // port: 587,
        // secure: false,
        auth: {
            user: process.env.USER_EMAIL, // your email
            pass: process.env.EMAIL_PASS // your password
        },
        tls:{
            ciphers:'SSLv3',
        }
    });

    const handlebarOptions = {
        viewEngine: {
            extName: ".hbs",
            partialsDir: path.resolve(__dirname, "../views"),
            defaultLayout: false,
        },
        viewPath: path.resolve(__dirname, "../views"),
        extName: ".hbs",
    };

    transporter.use("compile", hbs(handlebarOptions));

    const mailOptions = {
        from :sent_from,
        to: send_to,
        replyTo: reply_to,
        subject,
        template,
        context: {
            name,
            link,
        },
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message send: %s , info.messageId ")
        return info;
    } catch (error) {
        console.log("Error sending email: ", error);
        throw new error("Email could not be sent")
        
    }
    
    };

    export default sendEmail