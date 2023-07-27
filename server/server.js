let express = require('express');
let path = require('path');
let mysql = require('mysql');
let mailer = require('nodemailer');
let session = require('express-session');
let bodyParser = require('body-parser');
let fs = require('fs');
let multiparty = require('connect-multiparty');

const PORT = 3000;
const URL = 'http://localhost:' + PORT;
const NAME_DB = 'TUCANO_1';
const USER_DB = 'cano';
const PASSWORD_DB = 'cano';
const EMAIL = 'tucanomessages@gmail.com';
const EMAIL_PASS = 'tgpqsrgctnbnjhzr';
const CARACTS_CODE = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
const LEN_CODE = 50;
const PATH_UPLOADS = path.join('public', 'fotoProfilo');

let multipart = multiparty({ uploadDir: PATH_UPLOADS });

let connection = mysql.createConnection({
    host: 'localhost',
    user: USER_DB,
    password: PASSWORD_DB,
    database: NAME_DB
});
connection.connect();

let router = express.Router();
router.use(session({
    secret: 'sonwgurbv',
    resave: false,
    saveUninitialized: false
}));

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));
app.use('/', router);

router.post('/login', function(req, res) {
    let { username, password } = req.body;

    connection.query(`SELECT * FROM user WHERE username='${username}' && password='${password}' && verified=1;`, function(err, data) {
       if(data.length === 1) {
           req.session.idUser = data[0].id;

           res.json({
               logged: true
               // manca l'immagine
           });
       } else
           res.json({ logged: false });
    });
});

router.post('/sign-up', function(req, res) {
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

router.get('/checkCode', function(req, res) {
    let code = req.query.code;
    let filename;

    connection.query(`SELECT * FROM user WHERE code='${code}' && verified=0;`, function (err, data) {
        if (data.length === 0)
            filename = 'codeFailed';
        else {
            connection.query(`UPDATE user SET verified=1 WHERE code='${code}';`);
            filename = 'codeSuccess';
        }

        res.sendFile(path.join(__dirname, 'public', 'htmls', filename + '.html'));
    });
});

router.get('/logged', function(req, res) {
    res.json({ logged: req.session.idUser !== undefined });
});

router.get('/logout', function(req, res) {
    if(req.session.idUser !== undefined)
        req.session.destroy();
    res.json({ });
});

router.get('/account/get-username', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            res.json({ username: data[0].username });
        });
});

router.get('/account/get-data', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            res.json({
                username: data[0].username,
                password: data[0].password,
                email: data[0].email
            });
        });
});

router.post('/account/new-photo', multipart, function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ success: false });

    if(req.files !== undefined && req.files.file !== undefined) {
        let file = req.files.file;
        let ext = file.type.substring(file.type.indexOf('/') + 1);

        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            fs.renameSync(file.path, path.join(PATH_UPLOADS, username + '.' + ext));

            fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                if(filename.indexOf(username) === 0 && filename !== username + '.' + ext)
                    fs.unlinkSync(path.join(__dirname, PATH_UPLOADS, filename));
            });
            res.json({ success: true });
        });
    } else
        res.json({ success: false });
});

router.get('/account/getPhoto', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                if(filename.indexOf(username) === 0)
                    res.sendFile(path.join(__dirname, PATH_UPLOADS, filename));
            });
        });
});

router.get('/account/src-photo', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            fs.readdir(path.join(__dirname, PATH_UPLOADS), function(err, files) {
                if(err)
                    res.json({ path: null });

                let inviato = false;
                files.forEach(f => {
                    if(f.indexOf(username) === 0 && !inviato  && f[username.length] === '.') {
                        inviato = true;
                        res.json({ path: URL + '/account/getPhoto' });
                    }
                });
                if(!inviato)
                    res.json({ path: null });
            });
        });
});

router.get('/account/rem-photo', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            let founded = null;

            fs.readdir(path.join(__dirname, PATH_UPLOADS), function(err, files) {
               if(err)
                   res.json({ removed: false });
               files.forEach(f => {
                   if(f.indexOf(username) === 0 && f[username.length] === '.' && founded == null)
                       founded = f;
               });

               if(typeof founded === 'string') {
                   fs.unlinkSync(path.join(__dirname, PATH_UPLOADS, founded));
                   res.json({ removed: true });
               } else
                   res.json({ removed: false });
            });
        });
});

router.post('/account/email-change-data', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        let {name, value} = req.body;
        connection.query(`SELECT * FROM newCredential WHERE id=${req.session.idUser};`, function (err, data) {
            if (data.length === 0)
                connection.query(`INSERT INTO newCredential(id, ${name}) VALUES(${req.session.idUser}, '${value}')`);
            else
                connection.query(`UPDATE newCredential SET ${name}='${value}' WHERE id=${req.session.idUser}`);
        });

        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function (err, data) {
            if (err)
                res.json({success: false});

            const code = data[0].code;
            const emailTo = data[0].email;
            const transporter = mailer.createTransport({
                service: 'gmail',
                auth: {
                    user: EMAIL,
                    pass: EMAIL_PASS
                }
            });

            fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'changeData.html'), {encoding: 'utf-8'}, function (err, data) {
                if (err)
                    res.json({success: false});
                data = data.replaceAll('#nameData', name);
                data = data.replaceAll('#link', `${URL}/account/pageChangeData?name=${name}&code=${code}`);

                transporter.sendMail({
                    from: EMAIL,
                    to: emailTo,
                    subject: `Cambio ${name}`,
                    html: data,
                    attachments: [
                        {
                            file: 'logo.png',
                            path: path.join(__dirname, 'public', 'images', 'logo.png'),
                            cid: 'logo.image'
                        }
                    ]
                }).then(() => res.json({success: true}));
            });
        });
    }
});

router.get('/account/pageChangeData', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        let {name, code} = req.query;
        connection.query(`SELECT * FROM user WHERE code='${code}';`, function (err, data) {
            if (err || data.length === 0)
                res.send('Non puoi accedere a questa pagina');
            else {
                connection.query(`SELECT * FROM newCredential WHERE id=${data[0].id};`, function (err, data) {
                    if (err || data.length === 0)
                        res.send('Non puoi accedere a questa pagina');
                    else {
                        let everyNULL = true;
                        for (let key in data[0])
                            if (key !== 'id' && data[0][key] != null) {
                                everyNULL = false;
                                break;
                            }

                        if (everyNULL)
                            res.send('Non puoi accedere a questa pagina');
                        else
                            res.sendFile(path.join(__dirname, 'public', 'htmls', 'change_' + name + '.html'));
                    }
                });
            }
        });
    }
});

router.post('/account/checkNewData', function(req, res) {
    let { psw, new_val, code, type } = req.body;

    connection.query(`SELECT * FROM user WHERE code='${code}'`, function(err, data) {
        if(err || data.length === 0 || data[0].password !== psw)
           res.json( { success: false });
        else
           connection.query(`SELECT * FROM newCredential WHERE id=${data[0].id}`, function(err, data) {
              if(err || data.length === 0 || data[0][type] !== new_val)
                  res.json({ success: false });
              else {
                  connection.query(`UPDATE user SET ${type}='${new_val}' WHERE id=${data[0].id}`);
                  connection.query(`UPDATE newCredential SET ${type}=NULL WHERE id=${data[0].id}`);
                  connection.query(`SELECT * FROM newCredential WHERE id=${data[0].id};`, function(err, data) {
                      let everyNULL = true;
                      for(let key in data[0])
                          if(key !== 'id' && data[0][key] != null) {
                              everyNULL = false;
                              break;
                          }

                      if(everyNULL)
                          connection.query(`DELETE FROM newCredential WHERE id=${data[0].id};`);

                      res.json({ success: true });
                  });
              }
           });
    });
});

router.post('/account/change-data', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        let {name, value} = req.body;
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser};`, function (err, data) {
            if (name === 'username')
                fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                    if (filename.indexOf(data[0].username + '.') === 0) {
                        let ext = filename.split('.')[1];
                        fs.renameSync(path.join(__dirname, PATH_UPLOADS, filename), path.join(__dirname, PATH_UPLOADS, value + '.' + ext));
                    }
                });

            connection.query(`UPDATE user SET ${name}='${value}' WHERE id=${req.session.idUser};`);
            res.json({ });
        });
    }
});

router.post('/account/username-by-id', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM user WHERE id=${req.body.id};`, function(err, data) {
            if(err || data.length === 0)
                res.json({ user: 'inesistente' });
            else
                res.json({ user: data[0].username });
        });
});

router.get('/account/get-history', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM history WHERE user=${req.session.idUser};`, function(err, data) {
            if(err)
                res.json({ history: [] });
            else
                res.json({ history: data.filter(d => !Boolean(d.canceled)) });
        });
});

router.get('/account/clear-history', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        connection.query(`SELECT * FROM history WHERE user=${req.session.idUser} && action=2`, function(err, data) {
            let n1 = 0, n2 = data.length;
            data.forEach(d => {
                connection.query(`DELETE FROM history WHERE id=${d.idHistory}`);
                n1 ++;
            });
            let int = setInterval(function() {
                if(n1 === n2) {
                    connection.query(`DELETE FROM history WHERE user=${req.session.idUser} && action=2`);
                    connection.query(`UPDATE history SET canceled=1 WHERE user=${req.session.idUser} && action=1`);
                    clearInterval(int);
                    res.json({ success: true });

                }
            }, 3);
        });
    }
});

router.post('/account/email-rem-account', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        connection.query(`SELECT * FROM user WHERE id=${req.session.idUser}`, function(err, data) {
            if(err || data.length !== 1)
                res.json({ });
            else {
                let { code, email } = data[0];

                const transporter = mailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: EMAIL,
                        pass: EMAIL_PASS
                    }
                });

                fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'remAccount.html'), { encoding: 'utf-8' }, function(err, data) {
                    data = data.replaceAll('#link', URL + '/account/rem-account-page?code=' + code);

                    transporter.sendMail({
                        from: EMAIL,
                        to: email,
                        subject: 'Elimina il tuo account',
                        html: data,
                        attachments: [
                            {
                                file: 'logo.png',
                                path: path.join(__dirname, 'public', 'images', 'logo.png'),
                                cid: 'logo.image'
                            }
                        ]
                    });

                    res.json({ success: true });
                });
            }
        })
    }
});

router.get('/account/rem-account-page', function(req, res) {
    connection.query(`SELECT * FROM user WHERE code='${req.query.code}';`, function(err, data) {
        if(err || data.length !== 1)
            res.send('non puoi accedere a questo url');
        else
            res.sendFile(path.join(__dirname, 'public', 'htmls', 'confRemAccount.html'));

    });
});

router.post('/account/rem-account', function(req, res) {
    let { password, code } = req.body;
    connection.query(`SELECT * FROM user WHERE password='${password}' && code='${code}';`, function(err, data) {
        if(err || data.length !== 1)
            res.json({ success: false });
        else {
            let id = data[0].id;
            connection.query(`DELETE FROM newCredential WHERE id=${id};`);
            connection.query('SELECT * FROM history WHERE user=${id};', function(err, data) {
                if(!err)
                    for(let d of data)
                        if(d.id_email !== null)
                            clearInterval(d.id_email);
            });
            connection.query(`DELETE FROM history WHERE user=${id};`);
            connection.query(`DELETE FROM user WHERE id=${id};`);

            fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                if(filename.indexOf(data[0].username + '.') === 0)
                    fs.unlinkSync(path.join(__dirname, PATH_UPLOADS, filename));
            });

            req.session.destroy();
            res.json({ success: true });
        }
    });
});

router.post('/books/get-rooms', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        connection.query('SELECT * FROM room;', function (err, data) {
            data.forEach(d => {
                d.css = JSON.parse(d.css);
                d.css.left = d.css.sx;
                delete d.css.sx;
            });
            if (err)
                res.json({ rooms: [ ] });
            else
                res.json({ rooms: data });
        });
    }
});

router.get('/books/getPlan', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        res.sendFile(path.join(__dirname, 'public', 'images', 'zones', req.query.name + '.png'));
});

router.get('/books/save-book', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        const { name, zone, day, time, reason } = req.query;
        let d = new Date();
        let s = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} alle ${d.getHours()}:${d.getMinutes()}`;
        connection.query(`INSERT INTO history(action, room, zone, day, time, date, user, reason, visualized, secured, canceled) VALUES(1, '${name}', '${zone}', '${day}', '${time}', '${s}', ${req.session.idUser}, '${reason}', 0, 0, 0);`);

        res.json({
            success: true,
            save: {
                room: name,
                zone: zone,
                day: day,
                time: time,
                user: req.session.idUser,
                reason: reason,
                date: s,
                visualized: 0,
                secured: 0,
                action: 1
            }
        });
    }
});

router.get('/books/get-books', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        const { name, zone } = req.query;
        connection.query(`SELECT * FROM history WHERE room='${name}' && zone='${zone}' && action=1;`, function(err, data) {
           if(err)
               res.json({ data: [] });
           else {
               let n1 = 0, n2 = data.length;
               let toRet = [];
               data.forEach(d => {
                   connection.query(`SELECT * FROM history WHERE idHistory=${d.id};`, function(err, data) {
                       if(!err && data.length === 0)
                           toRet.push(d);
                       n1 ++;
                   })
               })
               let int = setInterval(function() {
                   if(n1 === n2) {
                       clearInterval(int);
                       res.json({data: toRet});
                   }
               }, 3);
           }
        });
    }
});

router.get('/my-books/segna-gia-letto', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        let { id, room, zone, day, time } = req.query;

        if(id === undefined)
            connection.query(`SELECT * FROM history WHERE room='${room}' && zone='${zone}' && day='${day}' && time='${time}' && action=1;`, function (err, data) {
                data.forEach(d => {
                    connection.query(`SELECT * FROM history WHERE idHistory=${d.id}`, function (err, data) {
                        if (data.length === 0)
                            id = d.id;
                    });
                });
            });

        let int = setInterval(function() {
            if(id !== undefined) {
                connection.query(`UPDATE history SET visualized=1 WHERE id=${id}`);
                clearInterval(int);
                res.json({success: true});
            }
        }, 5);
    }
});

router.get('/my-books/change-secured', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        let { id, value, room, zone, day, time } = req.query;

        if (id === undefined)
            connection.query(`SELECT * FROM history WHERE room='${room}' && zone='${zone}' && day='${day}' && time='${time}' && action=1;`, function (err, data) {
                data.forEach(d => {
                    connection.query(`SELECT * FROM history WHERE idHistory=${d.id}`, function (err, data) {
                        if (data.length === 0)
                            id = d.id;
                    });
                });
            });

        let int = setInterval(function () {
            if (id !== undefined) {
                connection.query(`UPDATE history SET secured=${value} WHERE id=${id}`);
                clearInterval(int);
                res.json({success: true});
            }
        });
    }
});

router.get('/my-books/delete-book', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        let { id, room, zone, day, time } = req.query;

        if (id === undefined)
            connection.query(`SELECT * FROM history WHERE room='${room}' && zone='${zone}' && day='${day}' && time='${time}' && action=1;`, function (err, data) {
                data.forEach(d => {
                    connection.query(`SELECT * FROM history WHERE idHistory=${d.id}`, function (err, data) {
                        if (data.length === 0)
                            id = d.id;
                    });
                });
            });

        let date = new Date();
        let s = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} alle ${date.getHours()}:${date.getMinutes()}`;
        let int = setInterval(function() {
            if(id !== undefined) {
                connection.query(`INSERT INTO history(action, room, zone, day, time, date, user, visualized, idHistory, canceled) VALUES(2, '${room}', '${zone}', '${day}', '${time}', '${s}', ${req.session.idUser}, 0, ${id}, 0);`);

                connection.query(`SELECT * FROM history WHERE id=${id}`, function(err, data) {
                    if(data[0].id_email !== null)
                        clearInterval(data[0].id_email);
                });

                res.json({ success: true });
                clearInterval(int);
            }
        }, 5);
    }
});

router.get('/my-books/delete-email', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        clearIntervalEmail(req.query.id);
        res.json({ success: true });
    }
});

router.get('/my-books/set-email', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        let { id, time } = req.query;
        connection.query(`UPDATE history SET time_email='${time}' WHERE id=${id}`, function() {
           connection.query(`SELECT * FROM history WHERE id=${id}`, function(err, data) {
               if(data[0].id_email != null)
                   clearInterval(data[0].id_ema2il);

               let int = getIntervalForEmail(data[0]);
               connection.query(`UPDATE history SET id_email=${int} WHERE id=${id}`);
               res.json({
                   success: true,
                   d_email: int
               });
           });
        });
    }
});

app.listen(PORT);

connection.query(`SELECT * FROM history WHERE id_email IS NOT NULL`, function(err, data) {
    for(let da of data)
        connection.query(`UPDATE history SET id_email=${getIntervalForEmail(da)} WHERE id=${da.id}`);
});

function getIntervalForEmail(da) {
    let date = new Date();
    let [ d, h, m ] = da.time_email.split(' ');

    let [ dayD, dayM, dayY ] = da.day.split('/');
    let [ hD, mD ] = da.time.split(' - ')[0].split(':');

    date.setMonth(parseInt(dayM) - 1);
    date.setFullYear(parseInt(dayY));
    date.setDate(parseInt(dayD) - parseInt(d));
    date.setUTCHours(parseInt(hD) - parseInt(h) - 1);
    date.setUTCMinutes(parseInt(mD) - parseInt(m));
    date.setUTCSeconds(0);

    let interval = setInterval(function() {
        let d = new Date();
        d.setUTCHours(d.getHours());
        if(date < d) {
            connection.query(`SELECT * FROM history WHERE id=${da.id}`, function (err, data) {
                let pren = data[0];
                const transporter = mailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: EMAIL,
                        pass: EMAIL_PASS
                    }
                });
                fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'rememberEvent.html'), {encoding: 'utf-8'}, function (err, data) {
                    data = data.replaceAll('#nomeRoom', pren.room);
                    data = data.replaceAll('#nomeZone', pren.zone);
                    data = data.replaceAll('#giorno', pren.day);
                    data = data.replaceAll('#orario', pren.time);

                    let traQuanto = '';
                    let [d, h, m] = pren.time_email.split(' ');
                    traQuanto = parseInt(d) === 0 ? '' : parseInt(d) === 1 ? '1 giorno' : d + ' giorni';
                    traQuanto += parseInt(h) === 0 ? '' : parseInt(h) === 1 ? ' 1 ora' : ' ' + h + ' ore';
                    traQuanto += parseInt(m) === 0 ? '' : parseInt(m) === 1 ? ' 1 minuto' : ' ' + m + ' minuti';
                    let textToSend = data.replaceAll('#traQuanto', traQuanto);

                    connection.query(`SELECT * FROM user WHERE id=${da.user}`, function(err, data) {
                        transporter.sendMail({
                            from: EMAIL,
                            to: data[0].email,
                            subject: 'Ricorda',
                            html: textToSend,
                            attachments: [
                                {
                                    file: 'logo.png',
                                    path: path.join(__dirname, 'public', 'images', 'logo.png'),
                                    cid: 'logo.image'
                                }
                            ]
                        });

                        clearInterval(pren.id_email);
                        clearInterval(interval);
                        connection.query(`UPDATE history SET id_EMAIL=NULL WHERE id=${da.id}`);
                    });
                });
            });
        }
    }, 600);

    return Number(interval);
}

function clearIntervalEmail(id) {
    connection.query(`SELECT * FROM history WHERE id=${id}`, function(err, data) {
        clearInterval(data[0].id_email);
        connection.query(`UPDATE history SET id_EMAIL=NULL WHERE id=${id}`);
    });
}