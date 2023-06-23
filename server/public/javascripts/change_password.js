const par = new URLSearchParams(window.location.search)
const code = par.get('code');
const type = par.get('name');

const spinner = document.getElementById('spinner');
const confirm = document.getElementById('confirm');
const new_passwd = document.getElementById('new-password');
const old_passwd = document.getElementById('old-password');
const failed = document.getElementById('failed');
const success = document.getElementById('success');

confirm.addEventListener('click', function() {
   spinner.style.display = 'block';
   confirm.disabled = true;
   failed.style.display = 'none';
   success.style.display = 'none';

   if(new_passwd.value.trim() !== '' && old_passwd.value.trim() !== '') {
      setTimeout(function() {
         $.ajax({
            type: 'POST',
            url: '/account/checkNewData',
            data: JSON.stringify({
               psw: old_passwd.value,
               new_val: new_passwd.value,
               code: code,
               type: type
            }),
            contentType:"application/json; charset=utf-8",
            success: function(res) {
               doAlways();
               if(res.success)
                  success.style.display = 'block';
               else
                  failed.style.display = 'block';
            },
            error: function() {
               doAlways();
            }
         });
      }, 1000);
   }
});

function doAlways() {
   spinner.style.display = 'none';
   confirm.disabled = false;
}