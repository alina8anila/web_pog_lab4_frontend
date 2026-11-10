$(document).ready(function() {
    renderHeader();
    
    // Guard: авторизований користувач не може відкрити сторінку реєстрації
    if (isAuthenticated()) {
        var next = getQueryParam('next');
        if (next) {
            window.location.href = next;
        } else {
            window.location.href = 'profile.html';
        }
        return;
    }
    
    $('#registerForm').on('submit', function(e) {
        e.preventDefault();
        doRegister();
    });
});

function doRegister() {
    $('.error').text('');
    
    var data = {
        username: $('#username').val().trim(),
        first_name: $('#first_name').val().trim(),
        last_name: $('#last_name').val().trim(),
        email: $('#email').val().trim(),
        password: $('#password').val(),
        password_confirmation: $('#password_confirmation').val()
    };
    
    if (!data.username) {
        $('#error-username').text('Логін обов\'язковий.');
        return;
    }
    if (!data.email) {
        $('#error-email').text('Email обов\'язковий.');
        return;
    }
    if (!data.password) {
        $('#error-password').text('Пароль обов\'язковий.');
        return;
    }
    if (!data.password_confirmation) {
        $('#error-password_confirmation').text('Підтвердження пароля обов\'язкове.');
        return;
    }
    
    var $submitBtn = $('#registerForm button[type="submit"]');
    $submitBtn.prop('disabled', true).text('Реєстрація...');
    
    apiSend('POST', '/register', data).done(function(response) {
        // Успішна реєстрація → редірект на логін
        window.location.href = 'login.html?registered=1';
    }).fail(function(xhr) {
        $submitBtn.prop('disabled', false).text('Зареєструватися');
        
        var fieldErrors = getFieldErrors(xhr);
        if (Object.keys(fieldErrors).length > 0) {
            $.each(fieldErrors, function(field, messages) {
                var errorDiv = $('#error-' + field);
                if (errorDiv.length) {
                    if (Array.isArray(messages)) {
                        errorDiv.text(messages.join(' '));
                    } else {
                        errorDiv.text(messages);
                    }
                }
            });
        } else {
            $('#formError').text(getApiErrorMessage(xhr));
        }
    });
}