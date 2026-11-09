$(document).ready(function() {
    renderHeader();
    
    // Guard: авторизований користувач не може відкрити сторінку логіну
    if (isAuthenticated()) {
        var next = getQueryParam('next');
        if (next) {
            window.location.href = next;
        } else {
            window.location.href = 'profile.html';
        }
        return;
    }
    
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        doLogin();
    });
});

function doLogin() {
    $('.error').text('');
    
    var username = $('#username').val().trim();
    var password = $('#password').val();
    
    if (!username) {
        $('#error-username').text('Логін обов\'язковий.');
        return;
    }
    if (!password) {
        $('#error-password').text('Пароль обов\'язковий.');
        return;
    }
    
    var $submitBtn = $('#loginForm button[type="submit"]');
    $submitBtn.prop('disabled', true).text('Вхід...');
    
    $.ajax({
        url: API_BASE + '/token',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username: username, password: password }),
        dataType: 'json'
    }).done(function(data) {
        if (data && data.access && data.refresh) {
            setTokens(data.access, data.refresh);
            fetchCurrentUser(true).done(function(user) {
                var next = getQueryParam('next');
                if (next) {
                    window.location.href = next;
                } else {
                    window.location.href = 'profile.html';
                }
            }).fail(function() {
                var next = getQueryParam('next');
                if (next) {
                    window.location.href = next;
                } else {
                    window.location.href = 'profile.html';
                }
            });
        } else {
            $('#formError').text('Невідома відповідь сервера.');
            $submitBtn.prop('disabled', false).text('Увійти');
        }
    }).fail(function(xhr) {
        $submitBtn.prop('disabled', false).text('Увійти');
        if (xhr.status === 401) {
            $('#formError').text(getApiErrorMessage(xhr));
        } else {
            var msg = getApiErrorMessage(xhr);
            $('#formError').text(msg);
        }
    });
}