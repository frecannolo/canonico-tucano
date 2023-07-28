const par = new URLSearchParams(window.location.search);             // par conterrà una mappa con tutti i parametri dell'url
const code = par.get('code');                                        // code conterrà il parametro code dell'url
const type = par.get('name');                                        // type conterrà il parametro name dell'url

const spinner = document.getElementById('spinner');         // spinner di attesa
const confirm = document.getElementById('confirm');         // pulsante
const new_value = document.getElementById('new-password');  // input del nuovo valore
const old_passwd = document.getElementById('old-password'); // input della password
const failed = document.getElementById('failed');           // scritta in caso di fallimento nelle operazioni
const success = document.getElementById('success');         // scritta in caso di successo delle operazioni

confirm.addEventListener('click', function() {
   // mostro lo spinner, disabilito il pulsante e nascondo le scritte
   spinner.style.display = 'block';
   confirm.disabled = true;
   failed.style.display = 'none';
   success.style.display = 'none';

   if(new_value.value.trim() !== '' && old_passwd.value.trim() !== '') {
      // setTimeout per inserire un'attesa
      setTimeout(function() {
         /*
            Effettuo la richiesta ajax della libreria jquery per facilitare l'invio di dati, i quali vengono passati
            sotto forma di JSON in stringa.
            success e failed sono funzioni che vengo eseguite in caso di successo o errore nella richiesta
         */
         $.ajax({
            type: 'POST',
            url: '/account/check-new-data',
            data: JSON.stringify({
               psw: old_passwd.value,
               new_val: new_value.value,
               code: code,
               type: type
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
   }
});

// funzione da fare sia in caso di successo o di fallimento
function doAlways() {
   spinner.style.display = 'none';
   confirm.disabled = false;
}