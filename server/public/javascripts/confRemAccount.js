const par = new URLSearchParams(window.location.search);
const code = par.get('code');

const spinner = document.getElementById('spinner');
const confirm = document.getElementById('confirm');
const password = document.getElementById('new-password');
const failed = document.getElementById('failed');
const success = document.getElementById('success');

confirm.addEventListener('click', function() {
    spinner.style.display = 'block';
    confirm.disabled = true;
    failed.style.display = 'none';
    success.style.display = 'none';

    setTimeout(function() {
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

function doAlways() {
    console.log('qui')
    spinner.style.display = 'none';
    confirm.disabled = false;
}
