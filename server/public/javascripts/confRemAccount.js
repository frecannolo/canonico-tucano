const code = new URLSearchParams(window.location.search).get('code');  // code conterrà il parametro code dell'url

const spinner = document.getElementById('spinner');           // spinner di attesa
const confirm = document.getElementById('confirm');           // pulsante
const password = document.getElementById('new-password');     // input del nuovo valore
const failed = document.getElementById('failed');             // input della password
const success = document.getElementById('success');           // scritta in caso di fallimento nelle operazioni

confirm.addEventListener('click', function() {
    // mostro lo spinner, disabilito il pulsante e nascondo le scritte
    spinner.style.display = 'block';
    confirm.disabled = true;
    failed.style.display = 'none';
    success.style.display = 'none';

    // setTimeout per inserire un'attesa
    setTimeout(function() {
        /*
            Effettuo la richiesta ajax della libreria jquery per facilitare l'invio di dati, i quali vengono passati
            sotto forma di JSON in stringa.
            success e failed sono funzioni che vengo eseguite in caso di successo o errore nella richiesta
        */
        $.ajax({
            type: 'POST',
            url: '/account/rem-account',
            data: JSON.stringify({
                password: password.value,
                code: code
            }),
            contentType:'application/json; charset=utf-8',
            success: function(res) {
                doAlways();
                if(res.success)
                    success.style.display = 'block';
                else
                    failed.style.display = 'block';
            },
            error: doAlways
        });
    }, 1000);
});

// funzione da fare sia in caso di successo o di fallimento
function doAlways() {
    spinner.style.display = 'none';
    confirm.disabled = false;
}
