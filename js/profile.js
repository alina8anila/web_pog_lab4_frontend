$(document).ready(function() {
    renderHeader();
    loadProfile();
});

function loadProfile() {
    var $container = $('#profileContainer');
    
    // Guard: неавторизований → редірект на логін з next
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }
    
    showLoading($container);
    
    fetchCurrentUser(true).done(function(user) {
        $container.empty();
        var $detail = $('<div class="game-detail"></div>');
        
        $detail.append($('<h2></h2>').text(user.first_name && user.last_name 
            ? user.first_name + ' ' + user.last_name 
            : user.username));
        
        $detail.append($('<p></p>').html('<strong>Логін:</strong> ' + user.username));
        
        if (user.first_name) {
            $detail.append($('<p></p>').html('<strong>Ім\'я:</strong> ' + user.first_name));
        }
        if (user.last_name) {
            $detail.append($('<p></p>').html('<strong>Прізвище:</strong> ' + user.last_name));
        }
        $detail.append($('<p></p>').html('<strong>Email:</strong> ' + user.email));
        $detail.append($('<p></p>').html('<strong>Роль:</strong> ' + (user.role === 'admin' ? 'Адміністратор' : 'Користувач')));
        
        $container.append($detail);
        refreshHeader();
    }).fail(function(xhr) {
        if (xhr && xhr.status === 401) {
            handleAuthFailure();
        } else {
            showError($container, getApiErrorMessage(xhr));
        }
    });
}