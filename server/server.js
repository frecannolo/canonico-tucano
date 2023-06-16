const PORT = 3000;
const URL = 'http://localhost:' + PORT;
const NAME_DB = 'TUCANO_1';
const USER_DB = 'cano';
const PASSWORD_DB = 'cano';
const EMAIL = 'tucanomessages@gmail.com';
const EMAIL_PASS = 'tgpqsrgctnbnjhzr';
const CARACTS_CODE = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
const LEN_CODE = 50;

let express = require('express');
let path = require('path');
let mysql = require('mysql');
let mailer = require('nodemailer');
let session = require('express-session');
let bodyParser = require('body-parser');
let fs = require('fs');

let connection = mysql.createConnection({
    host: 'localhost',
    user: USER_DB,
    password: PASSWORD_DB,
    database: NAME_DB
});
connection.connect();

let app = express();
app.use(session({
    secret: 'sonwgurbv',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/login', function(req, res) {
    let { username, password } = req.body;

    connection.query(`SELECT * FROM user WHERE username='${username}' && password='${password}' && verified=1;`, function(err, data) {
       if(data.length === 1) {
           req.session.inSessione = true;
           res.json({
               logged: true,
               username: data.username,
               password: data.password,
               email: data.email,
               id: data.id
               // manca l'immagine
           });
       } else
           res.json({ logged: false });
    });
});

app.post('/sign-up', function(req, res) {
    let { username, email, password } = req.body;

    connection.query(`SELECT * FROM user WHERE username='${username}';`, function(err, data) {
        if(data.length > 0)
            res.json({ error: `L'username ${username} esiste già` });
    });
    connection.query(`SELECT * FROM user WHERE email='${email}';`, function(err, data) {
        if(data.length > 0)
            res.json({ error: 'Hai già un account con questa mail' });
    })

    let code = '';
    for(let i = 0; i < LEN_CODE; i ++)
        code += CARACTS_CODE[Math.floor(Math.random() * CARACTS_CODE.length)];
    connection.query(`INSERT INTO user(username, password, email, verified, code) VALUES('${username}', '${password}', '${email}', 0, '${code}')`);

    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: EMAIL_PASS
        }
    });
    fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'confirmSignUp.html'), { encoding: 'utf-8' }, function(err, data) {
       data = data.replaceAll('#link', URL + '/checkCode?code=' + code);

       transporter.sendMail({
           from: EMAIL,
           to: email,
           subject: 'Conferma la tua registrazione',
           html: data,
           attachments: [
               {
                   file: 'logo.png',
                   path: path.join(__dirname, 'public', 'images', 'logo.png'),
                   cid: 'logo.image'
               }
           ]
       });

       res.json({ });
    });
});

app.get('/checkCode', function(req, res) {
    let code = req.query.code;
    let filename;

    connection.query(`SELECT * FROM user WHERE code='${code}' && verified=0;`, function(err, data) {
       if(data.length === 0)
           filename = 'codeFailed';
       else {
           connection.query(`UPDATE user SET verified=1 WHERE code='${code}';`);
           filename = 'codeSuccess';
       }

       res.sendFile(path.join(__dirname, 'public', 'htmls', filename + '.html'));
    });
});

app.listen(PORT);
