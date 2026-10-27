const API_BASE = "http://127.0.0.1:8000/api/v1";

function apiGet(path) {
    return $.ajax({
        url: API_BASE + path,
        method: "GET",
        dataType: "json"
    });
}

function apiSend(method, path, data) {
    return $.ajax({
        url: API_BASE + path,
        method: method,
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "json"
    });
}

function getApiErrorMessage(xhr) {
    if (xhr.responseJSON && xhr.responseJSON.error) {
        var error = xhr.responseJSON.error;
        if (error.message) {
            return error.message;
        }
    }
    if (xhr.status === 0) {
        return "Помилка мережі. Перевірте, чи запущений бекенд.";
    }
    return "Сталася помилка. Спробуйте пізніше.";
}

function getFieldErrors(xhr) {
    var fieldErrors = {};
    if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.details) {
        fieldErrors = xhr.responseJSON.error.details;
    }
    return fieldErrors;
}

function renderGameCard(game) {
    var $card = $('<div class="game-card"></div>');
    
    var $title = $('<h3></h3>');
    var $link = $('<a></a>')
        .text(game.title)
        .attr('href', 'game.html?id=' + game.id);
    $title.append($link);
    
    $card.append($title);
    
    if (game.rental_price_per_day !== undefined && game.rental_price_per_day !== null) {
        $card.append($('<p></p>').html('<strong>Ціна оренди за день:</strong> ' + game.rental_price_per_day + ' грн'));
    }
    
    if (game.rating !== undefined && game.rating !== null) {
        $card.append($('<p></p>').html('<strong>Рейтинг:</strong> ' + game.rating));
    }
    
    if (game.min_players !== undefined && game.min_players !== null && game.max_players !== undefined && game.max_players !== null) {
        $card.append($('<p></p>').html('<strong>Гравці:</strong> ' + game.min_players + '-' + game.max_players));
    }
    
    if (game.complexity) {
        $card.append($('<p></p>').html('<strong>Складність:</strong> ' + game.complexity));
    }
    
    if (game.hub && game.hub.name) {
        $card.append($('<p></p>').html('<strong>Хаб:</strong> ' + game.hub.name));
    }
    
    return $card;
}

function renderGenreCard(genre) {
    var $card = $('<div class="genre-card"></div>');
    
    var $title = $('<h3></h3>');
    var $link = $('<a></a>')
        .text(genre.name)
        .attr('href', 'genre.html?id=' + genre.id);
    $title.append($link);
    
    $card.append($title);
    
    if (genre.description) {
        $card.append($('<p></p>').text(genre.description));
    }
    
    return $card;
}

function renderHubCard(hub) {
    var $card = $('<div class="hub-card"></div>');
    
    var $title = $('<h3></h3>');
    var $link = $('<a></a>')
        .text(hub.name)
        .attr('href', 'hub.html?id=' + hub.id);
    $title.append($link);
    
    $card.append($title);
    
    if (hub.address) {
        $card.append($('<p></p>').html('<strong>Адреса:</strong> ' + hub.address));
    }
    
    if (hub.phone) {
        $card.append($('<p></p>').html('<strong>Телефон:</strong> ' + hub.phone));
    }
    
    if (hub.description) {
        $card.append($('<p></p>').text(hub.description));
    }
    
    return $card;
}

function showLoading($container) {
    $container.empty().append($('<div class="loading">Завантаження...</div>'));
}

function showError($container, message) {
    $container.empty().append($('<div class="error"></div>').text(message));
}

function showEmpty($container, message) {
    $container.empty().append($('<div class="empty"></div>').text(message || 'Немає даних'));
}

function getQueryParam(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function renderHeader() {
    var $header = $('header');
    if ($header.length === 0) {
        $header = $('<header></header>');
        $('body').prepend($header);
    }
    $header.empty();
    
    var $nav = $('<nav></nav>');
    $nav.append($('<a href="index.html">Ігри</a>'));
    $nav.append($('<a href="genres.html">Жанри</a>'));
    $nav.append($('<a href="hubs.html">Хаби</a>'));
    
    $header.append($nav);
}
