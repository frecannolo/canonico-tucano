let express = require('express');               // richiedo il modulo node 'express' per il progetto
let path = require('path');                     // richiedo il modulo node 'path' per eseguire operazioni con le path
let mysql = require('mysql');                   // richiedo il modulo node 'mysql' per eseguire operazioni sul database mysql
let mailer = require('nodemailer');             // richiedo il modulo node 'nodemailer' per poter inviare le email
let session = require('express-session');       // richiedo il modulo node 'express-session' per poter gestire le sessioni dei client
let bodyParser = require('body-parser');        // richiedo il modulo node 'body-parser' per leggere i valori passati dalle richieste POST
let fs = require('fs');                         // richiedo il modulo node 'fs' per eseguire operazioni sul file system
let multiparty = require('connect-multiparty'); // richiedo il modulo node 'connect-multiparty' per poter ricevere file delle request dei client

const PORT = 3000;                                                                      // porta del server
const URL = 'http://localhost:' + PORT;                                                 // url del server + porta
const NAME_DB = 'TUCANO';                                                               // nome del database
const USER_DB = 'cano';                                                                 // user per il database
const PASSWORD_DB = 'cano';                                                             // password per il database
const EMAIL = 'tucanomessages@gmail.com';                                               // email di Tucano
const EMAIL_PASS = 'tgpqsrgctnbnjhzr';                                                  // password dell'email
const CARACTS_CODE = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';  // caratteri possibili per il codice dell'utente
const LEN_CODE = 50;                                                                    // lunghezza del codice dell'utente
const PATH_UPLOADS = path.join('public', 'fotoProfilo');                                // path per le foto di uploads

let multipart = multiparty({ uploadDir: PATH_UPLOADS }); // assegno l'oggetto multipart per i file di upload

// creo la connessione per il database
let connection = mysql.createConnection({
    host: 'localhost',
    user: USER_DB,
    password: PASSWORD_DB,
    database: NAME_DB
});
connection.connect();

// creo un router, ovvero un oggetto per gestire a parte le route delle richieste api e gli permetto di fare operazioni sulle sessioni dei client
let router = express.Router();
router.use(session({
    secret: 'sonwgurbv',
    resave: false,
    saveUninitialized: false
}));

// ad app assegno l'applicazione server e gli permetto di utilizzare i moduli del bodyParser e l'oggetto router alla route '/'
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', router);

// rendo statiche e utilizzabili dal server le cartelle public e client
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));

// --- route per la richiesta di login (req è la richiesta e client, res la risposta)
router.post('/login', function(req, res) {
    // leggo i parametri POST username e password
    let { username, password } = req.body;

    // eseguo una query nel database l'utente
    connection.query(`SELECT id FROM user WHERE username='${username}' and password=TO_BASE64(MD5('${password}')) and verified=1 and removed=0;`, function(err, data) {
        if(data.length === 1) { // se la query ritorna uno e un solo elemento salvo un parametro idUser con l'id dell'utente al database
           req.session.idUser = data[0].id;
           res.json({ logged: true });
        } else
           res.json({ logged: false });
        // res.json contiene il json di risposta all'api
    });
});

// --- route per la richiesta di registrazione
router.post('/sign-up', function(req, res) {
    let { username, email, password } = req.body;

    // controllo che l'username non sia già stato preso
    connection.query(`SELECT id FROM user WHERE username='${username}' and removed=0;`, function(err, data) {
        if(data.length > 0)
            res.json({ error: `L'username ${username} esiste già` });
        else
            // controllo che la mail non sia già associata ad un altro account
            connection.query(`SELECT id FROM user WHERE email='${email}' and removed=0;`, function(err, data) {
                if(data.length > 0)
                    res.json({ error: 'Hai già un account con questa mail' });
                else {
                    // creo un codice è inserisco un nuovo account nel database, con verified = 0 perché bisogna fare la conferma via mail
                    let code = '';
                    for(let i = 0; i < LEN_CODE; i ++)
                        code += CARACTS_CODE[Math.floor(Math.random() * CARACTS_CODE.length)];
                    connection.query(`INSERT INTO user(username, password, email, verified, code, removed) VALUES('${username}', TO_BASE64(MD5('${password}')), '${email}', 0, '${code}', 0)`);

                    // preparo il trasporto dell'email
                    const transporter = mailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: EMAIL,
                            pass: EMAIL_PASS
                        }
                    });

                    fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'confirmSignUp.html'), { encoding: 'utf-8' }, function(err, data) {
                        // apro il file html della mail da inviare e sostituisco tutte le scritte '#link' con il link della pagina
                        data = data.replaceAll('#link', URL + '/checkCode?code=' + code);

                        // invio la mail inserendo tra gli attachments il logo di Tucano
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

                        res.json({ error: 'no errors' });
                    });
                }
            });
    });
});

// --- route per verificare il codice di registrazione
router.get('/checkCode', function(req, res) {
    let code = req.query.code;
    let filename;

    connection.query(`SELECT * FROM user WHERE code='${code}' and verified=0 and removed=0;`, function (err, data) {
        /*
            controllo che ci sia un'account non verificato con il codice passato come parametro, in base al numero di
            risultati scelgo il file da far visualizzare all'utente e segno l'account come verificato
        */
        if (data.length === 0)
            filename = 'codeFailed';
        else {
            connection.query(`UPDATE user SET verified=1 WHERE code='${code}';`);
            filename = 'codeSuccess';
        }

        res.sendFile(path.join(__dirname, 'public', 'htmls', filename + '.html'));
    });
});

// --- route per sapere se la session è attiva
router.get('/logged', function(req, res) {
    res.json({ logged: req.session.idUser !== undefined });
});

// --- route per eseguire il logout e distruggere la session attiva
router.get('/logout', function(req, res) {
    // distruggo la session
    if(req.session.idUser !== undefined)
        req.session.destroy();
    res.json({ });
});

// --- route per fare il controllo delle password
router.post('/check-password', function(req, res) {
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT id FROM user WHERE id=${req.session.idUser} and password=TO_BASE64(MD5('${req.body.password}'))`, function(err, data) {
            res.json({ success: !err && data.length === 1 });
        });
});

// --- route per ritornare l'username dell'utente appena eseguito il login
router.get('/account/get-username', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT username FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            res.json({ username: data[0].username });
        });
});

// --- route per ritornare i valori dei campi inseriti per la registrazione
router.get('/account/get-data', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT username, email FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            res.json({
                username: data[0].username,
                password: '',
                email: data[0].email
            });
        });
});

// --- route per passare al server la nuova foto profilo tramite l'oggetto multipart
router.post('/account/new-photo', multipart, function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ success: false });
    else if(req.files && req.files.file) { // se il file esiste...
        let file = req.files.file;
        // prendo l'estensione del file
        let ext = file.type.substring(file.type.indexOf('/') + 1);

        connection.query(`SELECT username FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            // rinomino il file in 'username'.'estensione'
            fs.renameSync(file.path, path.join(PATH_UPLOADS, username + '.' + ext));

            // leggo la cartella degli uploads per eliminare eventuali foto vecchie rimaste lì perché hanno un'estensione diversa
            fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                if(filename.indexOf(username) === 0 && filename !== username + '.' + ext)
                    fs.unlinkSync(path.join(__dirname, PATH_UPLOADS, filename));
            });
            res.json({ success: true });
        });
    } else
        res.json({ success: false });
});

// --- route che ritorna l'immagine profilo dell'user
router.get('/account/get-photo', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT username FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            // leggo i file nella cartella fino a quando non trovo quello che va bene
            fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                if(filename.indexOf(username) === 0)
                    res.sendFile(path.join(__dirname, PATH_UPLOADS, filename));
            });
        });
});

// --- route che ritorna il path della foto profilo o null se non c'è
router.get('/account/src-photo', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT username FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            // leggo la cartella con le foto
            fs.readdir(path.join(__dirname, PATH_UPLOADS), function(err, files) {
                if(err)
                    res.json({ path: null });

                let inviato = false;
                files.forEach(f => {
                    if(f.indexOf(username) === 0 && !inviato  && f[username.length] === '.') {
                        // trovo il file e scrivo l'URL
                        inviato = true;
                        res.json({ path: URL + '/account/get-photo' });
                    }
                });

                // non è stato trovato alcun file e ritorno null
                if(!inviato)
                    res.json({ path: null });
            });
        });
});

// --- route che indica al server di rimuovere la foto profilo dell'utente
router.get('/account/rem-photo', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT username FROM user WHERE id=${req.session.idUser};`, function(err, data) {
            let username = data[0].username;
            let founded = null;

            // cerco il nome della foto
            fs.readdir(path.join(__dirname, PATH_UPLOADS), function(err, files) {
               if(err)
                   res.json({ removed: false });
               files.forEach(f => {
                   if(f.indexOf(username) === 0 && f[username.length] === '.' && founded == null)
                       founded = f;
               });

               if(typeof founded === 'string') {
                   // se si trova la foto con la function fs.unlink si rimuove un file
                   fs.unlinkSync(path.join(__dirname, PATH_UPLOADS, founded));
                   res.json({ removed: true });
               } else
                   res.json({ removed: false });
            });
        });
});

// --- route che indica al server di mandare la mail per poter cambiare un dato sensibile dalla mail
router.post('/account/email-change-data', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        let { name, value } = req.body;
        connection.query(`SELECT id FROM newCredential WHERE id=${req.session.idUser};`, function (err, data) {
            // inserisco dentro la table newCredential la possibile nuova credenziale o aggiono la riga
            if (data.length === 0 && name === 'password')
                connection.query(`INSERT INTO newCredential(id, password) VALUES(${req.session.idUser}, TO_BASE64(MD5('${value}')))`);
            else if(data.length === 0)
                connection.query(`INSERT INTO newCredential(id, ${name}) VALUES(${req.session.idUser}, '${value}')`);
            else if(name === 'password')
                connection.query(`UPDATE newCredential SET password=TO_BASE64(MD5('${value}')) WHERE id=${req.session.idUser}`);
            else
                connection.query(`UPDATE newCredential SET ${name}='${value}' WHERE id=${req.session.idUser}`);
        });

        connection.query(`SELECT email, code FROM user WHERE id=${req.session.idUser};`, function (err, data) {
            if (err)
                res.json({ success: false });

            // preparo l'invio la mail
            const code = data[0].code;
            const emailTo = data[0].email;
            const transporter = mailer.createTransport({
                service: 'gmail',
                auth: {
                    user: EMAIL,
                    pass: EMAIL_PASS
                }
            });

            // leggo il file html della mail e sostituisco i campi necessari
            fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'changeData.html'), {encoding: 'utf-8'}, function (err, data) {
                if (err)
                    res.json({ success: false });
                data = data.replaceAll('#nameData', name);
                data = data.replaceAll('#link', `${URL}/account/page-change-data?name=${name}&code=${code}`);

                // setto il subject della mail in base quale campo l'utente desidera cambiare
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
                }).then(() => res.json({ success: true }));
            });
        });
    }
});

// --- route che permette al client di visualizzare la pagina corretta in base al campo che desidera modificare
router.get('/account/page-change-data', function(req, res) {
    // name è il nome del campo da modificare
    let {name, code} = req.query;

    connection.query(`SELECT id FROM user WHERE code='${code}';`, function (err, data) {
        // controllo sull'accesso della pagina
        if (err || data.length === 0)
            res.send('Non puoi accedere a questa pagina');
        else
            connection.query(`SELECT * FROM newCredential WHERE id=${data[0].id};`, function (err, data) {
                // controllo sull'accesso della pagina
                if (err || data.length === 0)
                    res.send('Non puoi accedere a questa pagina');
                else {
                    // controlla se l'utente ha davvero qualche campo da modificare
                    let everyNULL = true;
                    for (let key in data[0])
                        if (key !== 'id' && data[0][key] != null) {
                            everyNULL = false;
                            break;
                        }

                    // controllo sull'accesso della pagina
                    if (everyNULL)
                        res.send('Non puoi accedere a questa pagina');
                    else
                        res.sendFile(path.join(__dirname, 'public', 'htmls', 'change_' + name + '.html'));
                }
            });
    });
});

// --- route che permette all'utente di cambiare i dati dalla pagina web esterna
router.post('/account/check-new-data', function(req, res) {
    let { psw, new_val, code, type } = req.body;

    connection.query(`SELECT id FROM user WHERE code='${code}' and password=TO_BASE64(MD5('${psw}'))`, function(err, data) {
        // controllo se la password inserita è corretta
        if(err || data.length === 0)
           res.json( { success: false });
        else {
            let query;
            if(type === 'password')
                query = `SELECT id FROM newCredential WHERE id=${data[0].id} and password=TO_BASE64(MD5('${new_val}'))`;
            else
                query = `SELECT di FROM newCredential WHERE id=${data[0].id} and ${type}='${new_val}'`;

            connection.query(query, function (err, data) {
                // controllo se il nuovo valore sia uguale a quello salvato sul database
                if (err || data.length === 0)
                    res.json({success: false});
                else {
                    // cancello la nuova credenziale dal database
                    connection.query(`UPDATE newCredential SET ${type}=NULL WHERE id=${data[0].id}`);
                    // controllo quante credenziali del medesimo utente sono state cambiate, se lo sono tutte si elimina la riga
                    connection.query(`SELECT * FROM newCredential WHERE id=${data[0].id};`, function (err, data) {
                        let everyNULL = true;
                        for (let key in data[0])
                            if (key !== 'id' && data[0][key] != null) {
                                everyNULL = false;
                                break;
                            }

                        if (everyNULL)
                            connection.query(`DELETE FROM newCredential WHERE id=${data[0].id};`);

                        if (type === 'email')
                            // se bisogna cambiare la mail, controllo che quella mail non sia già associata ad atri account
                            connection.query(`SELECT id FROM user WHERE email='${new_val}' and removed=0`, function (err, data) {
                                if (data.length > 0)
                                    res.json({ success: false });
                                else { // update del database degli utenti
                                    if (type === 'password')
                                        connection.query(`UPDATE user SET password=TO_BASE64(MD5('${new_val}')) WHERE id=${data[0].id}`);
                                    else
                                        connection.query(`UPDATE user SET ${type}='${new_val}' WHERE id=${data[0].id}`);
                                    res.json({success: true});
                                }
                            });
                        else {
                            if (type === 'password')
                                connection.query(`UPDATE user SET password=TO_BASE64(MD5('${new_val}')) WHERE id=${data[0].id}`);
                            else
                                connection.query(`UPDATE user SET ${type}='${new_val}' WHERE id=${data[0].id}`);
                            res.json({success: true});
                        }
                    });
                }
            });
        }
    });
});

// --- route che permette all'utente di cambiare un dato che non necessita la mail di conferma
router.post('/account/change-data', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        let { name, value } = req.body;

        connection.query(`SELECT id FROM user WHERE ${name}='${value}' and removed=0;`, function(err, data) {
            // controllo che non ci sia nessun utente prima con lo stesso username / email
            if(name !== 'password' && data.length > 0)
                res.json({ success: false });
            else
                connection.query(`SELECT username FROM user WHERE id=${req.session.idUser};`, function (err, data) {
                    // cambio il nome dell'immagine di profilo (se ne ha una)
                    if (name === 'username')
                        fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                            if (filename.indexOf(data[0].username + '.') === 0) {
                                let ext = filename.split('.')[1];
                                fs.renameSync(path.join(__dirname, PATH_UPLOADS, filename), path.join(__dirname, PATH_UPLOADS, value + '.' + ext));
                            }
                        });

                    // update del database con il nuovo dato (non bisogna passare da newCredential)
                    connection.query(`UPDATE user SET ${name}='${value}' WHERE id=${req.session.idUser};`);
                    res.json({ success: true });
                });
        });
    }
});

// --- route che ritorna un json con l'username di un utente nel database o ''
router.post('/account/username-by-id', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT username FROM user WHERE id=${req.body.id};`, function(err, data) {
            if(err || data.length === 0)
                res.json({ user: '' });
            else
                res.json({ user: data[0].username });
        });
});

// --- route che ritorna un json con un array con tutta la history visibile dall'utente
router.get('/account/get-history', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT * FROM history WHERE user=${req.session.idUser} and canceled=0;`, function(err, data) {
            if(err)
                res.json({ history: [] });
            else
                // ritorno solo quelli non cancellati in precedenza
                res.json({ history: data });
        });
});

// --- route che pulisce la cronologia di un'utente
router.get('/account/clear-history', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else
        // faccio la ricerca sulle operazioni di annullamento di prenotazione
        connection.query(`SELECT idHistory FROM history WHERE user=${req.session.idUser} and action=2`, function(err, data) {
            // cancello tutte lee operazioni di annullamento e le operazioni di prenotazione collegate a esse
            data.forEach(d => connection.query(`DELETE FROM history WHERE id=${d.idHistory}`));
            connection.query(`DELETE FROM history WHERE user=${req.session.idUser} and action=2`);

            // update della cronologia settando canceled = 1 alle operazioni rimaste
            connection.query(`UPDATE history SET canceled=1 WHERE user=${req.session.idUser} and action=1`);
            res.json({ success: true });
        });
});

// --- route che invia la mail a chi vuole eliminare il proprio account
router.post('/account/email-rem-account', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else
        connection.query(`SELECT code, email FROM user WHERE id=${req.session.idUser}`, function(err, data) {
            if(err || data.length !== 1)
                res.json({ });
            else {
                let { code, email } = data[0];

                // prepaaro il transporter della mail
                const transporter = mailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: EMAIL,
                        pass: EMAIL_PASS
                    }
                });

                // leggo l'html della mail da inviare e sostituisco la stringa '#link con il link necessario
                fs.readFile(path.join(__dirname, 'public', 'htmls', 'emails', 'remAccount.html'), { encoding: 'utf-8' }, function(err, data) {
                    data = data.replaceAll('#link', URL + '/account/rem-account-page?code=' + code);

                    // invio la mail
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
        });
});

// --- route che fa visualizzare all'utente la pagina web per rimuovere l'account
router.get('/account/rem-account-page', function(req, res) {
    connection.query(`SELECT id FROM user WHERE code='${req.query.code}';`, function(err, data) {
        // controlli sull'accesso
        if(err || data.length !== 1)
            res.send('non puoi accedere a questo url');
        else
            res.sendFile(path.join(__dirname, 'public', 'htmls', 'confRemAccount.html'));

    });
});

// --- route che rimuove l'utente
router.post('/account/rem-account', function(req, res) {
    let { password, code } = req.body;
    connection.query(`SELECT id FROM user WHERE password=TO_BASE64(MD5('${password}')) and code='${code}' and removed=0;`, function(err, data) {
        // controllo sull'utente
        if(err || data.length !== 1)
            res.json({ success: false });
        else {
            let id = data[0].id;
            // elimino le possibili nuove credenziali e annullo l'invio delle mail di notifica
            connection.query(`DELETE FROM newCredential WHERE id=${id};`);
            connection.query('SELECT id_email FROM history WHERE user=${id};', function(err, data) {
                if(!err)
                    for(let d of data)
                        if(d.id_email !== null)
                            clearInterval(d.id_email);
            });

            // rimuovo l'utente dal database e l'eventuale foto profilo (non tocco la history)
            connection.query(`UPDATE user SET removed=1 WHERE id=${id};`);
            fs.readdirSync(path.join(__dirname, PATH_UPLOADS)).map(filename => {
                if(filename.indexOf(data[0].username + '.') === 0)
                    fs.unlinkSync(path.join(__dirname, PATH_UPLOADS, filename));
            });

            // infine distruggo la sessione corrente
            req.session.destroy();
            res.json({ success: true });
        }
    });
});

// --- route che ritorna json con un array con tutte le stanze e le caratteristiche di ognuna di esse
router.post('/books/get-rooms', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        connection.query('SELECT * FROM room;', function (err, data) {
            data.forEach(d => {
                // codifico la parte json del css di ogni stanza
                d.css = JSON.parse(d.css);
                // rimuovo d.css.sx perché si deve chiamare in tutte d.css.left
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

// --- route che ritorna la foto della planimetria da far visualizzare
router.get('/books/getPlan', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else
        res.sendFile(path.join(__dirname, 'public', 'images', 'zones', req.query.name + '.png'));
});

// --- route che salva e ritorna sotto forma di json una prenotazione
router.get('/books/save-book', function(req, res) {
    // controllo sulla sessione
    if(req.session.idUser === undefined)
        res.json({ });
    else {
        const { name, zone, day, time, reason } = req.query;
        let d = new Date();
        // creo la stringa con la data di prenotazione
        let s = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} alle ${d.getHours()}:${d.getMinutes()}`;
        // inserisco la prenotazione nella cronologia
        connection.query(`INSERT INTO history(action, room, zone, day, time, date, user, reason, visualized, secured, canceled) VALUES(1, '${name}', '${zone}', '${day}', '${time}', '${s}', ${req.session.idUser}, '${reason}', 0, 0, 0);`);

        // ritorno il successo e il salvataggio
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

// --- route che ritorna un json con un array di prenotazioni (non cancellate) data la stanza e la zona
router.get('/books/get-books', function(req, res) {
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        const { name, zone } = req.query;
        connection.query(`SELECT * FROM history WHERE room='${name}' and zone='${zone}' and action=1;`, function(err, data) {
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
                   });
               })
               /*
                interval necessario perché le query sono asincrone e bisogna attendere che siano tutte completate
                prima di inviare il json di risposta
               */
               let int = setInterval(function() {
                   if(n1 === n2) {
                       clearInterval(int);
                       res.json({ data: toRet });
                   }
               }, 3);
           }
        });
    }
});

// --- route che segna come già letta una notifica (nella cronologia)
router.get('/my-books/segna-gia-letto', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        connection.query(`UPDATE history SET visualized=1 WHERE id=${req.query.id}`);
        res.json({success: true});
    }
});

// --- route che serve per fissare o sbloccare una prenotazione
router.get('/my-books/change-secured', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        connection.query(`UPDATE history SET secured=${req.query.value} WHERE id=${req.query.id}`);
        res.json({success: true});
    }
});

// --- route per cancellare una prenotazione
router.get('/my-books/delete-book', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        //vengono fatti gli stessi passaggi fatti nella route precedente
        let { id, room, zone, day, time } = req.query;

        let date = new Date();
        let s = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} alle ${date.getHours()}:${date.getMinutes()}`;
        connection.query(`INSERT INTO history(action, room, zone, day, time, date, user, visualized, idHistory, canceled) VALUES(2, '${room}', '${zone}', '${day}', '${time}', '${s}', ${req.session.idUser}, 0, ${id}, 0);`);

        connection.query(`SELECT id_email FROM history WHERE id=${id}`, function(err, data) {
            if(data[0].id_email !== null)
                clearInterval(data[0].id_email);
            connection.query(`UPDATE history SET id_email=NULL WHERE id=${id}`);
        });
        res.json({ success: true });
    }
});

// --- route per cancellare l'email di notifica
router.get('/my-books/delete-email', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        clearIntervalEmail(req.query.id);
        res.json({ success: true });
    }
});

// --- route per impostare una mail di notifica
router.get('/my-books/set-email', function(req, res) {
    // controllo sulla sessione
    if (req.session.idUser === undefined)
        res.json({ });
    else {
        let { id, time } = req.query;

        connection.query(`UPDATE history SET time_email='${time}' WHERE id=${id}`, function() {
           connection.query(`SELECT * FROM history WHERE id=${id}`, function(err, data) {
               // pulisce un eventuale intervallo precedente
               if(data[0].id_email != null)
                   clearInterval(data[0].id_email);

               // assegno un nuovo intervallo
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
onInit(); // eseguo onInit

// funzione da eseguire sempre all'avvio del server
function onInit() {
    // cerco quando l'id non è null per far ripartire l'interval della mail
    connection.query(`SELECT * FROM history WHERE id_email IS NOT NULL`, function (err, data) {
        let now = new Date();
        now.setUTCHours(now.getHours());

        for (let da of data) {
            let d = new Date();
            let [day, mounth, year] = da.day.split('/');
            let [ hD, mD ] = da.time.split(' - ')[0].split(':');
            d.setDate(parseInt(day));
            d.setMonth(parseInt(mounth) - 1);
            d.setFullYear(parseInt(year));
            d.setUTCHours(parseInt(hD));
            d.setUTCMinutes(parseInt(mD));
            d.setUTCSeconds(0);

            // se la prenotazione è passata, si setta l'id_email = NULL
            if(now > d)
                connection.query(`UPDATE history SET id_email=NULL WHERE id=${da.id}`);
            else
                connection.query(`UPDATE history SET id_email=${getIntervalForEmail(da)} WHERE id=${da.id}`);
        }
    });
}

// ritorna l'id dell'interval per sapere quando inviare le email di notifica
function getIntervalForEmail(da) {
    // creo l'oggetto date in base all'oggetto da
    let date = new Date();
    let [ d, h, m ] = da.time_email.split(' ');

    let [ dayD, dayM, dayY ] = da.day.split('/');
    let [ hD, mD ] = da.time.split(' - ')[0].split(':');

    date.setMonth(parseInt(dayM) - 1);
    date.setFullYear(parseInt(dayY));
    date.setDate(parseInt(dayD) - parseInt(d));
    date.setUTCHours(parseInt(hD) - parseInt(h));
    date.setUTCMinutes(parseInt(mD) - parseInt(m));
    date.setUTCSeconds(0);

    // creo l'interval ogni 1 minuto
    let interval = setInterval(function() {
        let d = new Date();
        d.setUTCHours(d.getHours());

        // se la data attuale a più avanti della data d'invio
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
                // leggo l'html della mail da inviare
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

                    // invio la mail
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

                        // pulisco gli intervalli
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

// funzione per cancellare l'intervallo e l'invio dell'email di notifica per una prenotazione dato l'id della prenotazione nel database
function clearIntervalEmail(id) {
    connection.query(`SELECT * FROM history WHERE id=${id}`, function(err, data) {
        clearInterval(data[0].id_email);
        connection.query(`UPDATE history SET id_EMAIL=NULL WHERE id=${id}`);
    });
}