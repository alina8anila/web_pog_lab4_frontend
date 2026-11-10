const API_BASE = "http://127.0.0.1:8000/api/v1";

var AUTH_ACCESS_KEY = "bg_access";
var AUTH_REFRESH_KEY = "bg_refresh";
var AUTH_USER_KEY = "bg_user";
var refreshPromise = null;
var isRedirectingToLogin = false;

function getAccessToken() {
    return localStorage.getItem(AUTH_ACCESS_KEY);
}

function getRefreshToken() {
    return localStorage.getItem(AUTH_REFRESH_KEY);
}

function setTokens(access, refresh) {
    if (access) {
        localStorage.setItem(AUTH_ACCESS_KEY, access);
    }
    if (refresh) {
        localStorage.setItem(AUTH_REFRESH_KEY, refresh);
    }
}

function clearAuth() {
    localStorage.removeItem(AUTH_ACCESS_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
}

function isAuthenticated() {
    return !!getAccessToken() || !!getRefreshToken();
}

function getCurrentUserCached() {
    var raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function setCurrentUserCached(user) {
    if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(AUTH_USER_KEY);
    }
}

function isAdmin() {
    var user = getCurrentUserCached();
    return !!(user && user.role === "admin");
}

function buildAuthHeaders(extraHeaders) {
    var headers = extraHeaders ? $.extend({}, extraHeaders) : {};
    var token = getAccessToken();
    if (token) {
        headers.Authorization = "Bearer " + token;
    }
    return headers;
}

function refreshAccessToken() {
    if (refreshPromise) {
        return refreshPromise;
    }
    var refresh = getRefreshToken();
    if (!refresh) {
        return $.Deferred().reject().promise();
    }
    refreshPromise = $.ajax({
        url: API_BASE + "/token/refresh",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ refresh: refresh }),
        dataType: "json"
    }).then(function (data) {
        if (data && data.access) {
            localStorage.setItem(AUTH_ACCESS_KEY, data.access);
            return data.access;
        }
        return $.Deferred().reject(data).promise();
    }).always(function () {
        refreshPromise = null;
    });
    return refreshPromise;
}

function redirectToLogin() {
    if (isRedirectingToLogin) {
        return;
    }
    isRedirectingToLogin = true;
    var next = window.location.pathname.split("/").pop() + window.location.search;
    if (!next || next === "login.html" || next === "register.html") {
        window.location.href = "login.html";
        return;
    }
    window.location.href = "login.html?next=" + encodeURIComponent(next);
}

function handleAuthFailure() {
    clearAuth();
    redirectToLogin();
}

function apiRequest(options, retryOn401, silent) {
    var opts = $.extend(true, {}, options);
    opts.url = API_BASE + opts.path;
    delete opts.path;
    opts.headers = buildAuthHeaders(opts.headers);
    if (retryOn401 === undefined) {
        retryOn401 = true;
    }
    if (silent === undefined) {
        silent = false;
    }

    return $.ajax(opts).catch(function (xhr) {
        if (xhr.status === 401 && retryOn401 && getRefreshToken()) {
            return refreshAccessToken().then(function () {
                var retryOpts = $.extend(true, {}, options);
                retryOpts.url = API_BASE + retryOpts.path;
                delete retryOpts.path;
                retryOpts.headers = buildAuthHeaders(retryOpts.headers);
                return $.ajax(retryOpts);
            }).catch(function (refreshXhr) {
                if (!silent) {
                    handleAuthFailure();
                } else {
                    clearAuth();
                }
                return $.Deferred().reject(refreshXhr || xhr).promise();
            });
        }
        if (xhr.status === 401 && !retryOn401) {
            return $.Deferred().reject(xhr).promise();
        }
        return $.Deferred().reject(xhr).promise();
    });
}

function apiGet(path) {
    return apiRequest({
        path: path,
        method: "GET",
        dataType: "json"
    });
}

function apiSend(method, path, data) {
    var opts = {
        path: path,
        method: method,
        dataType: "json"
    };
    if (data !== undefined) {
        opts.contentType = "application/json";
        opts.data = JSON.stringify(data);
    }
    return apiRequest(opts);
}

function apiAuthGet(path) {
    return apiRequest({
        path: path,
        method: "GET",
        dataType: "json"
    }, true);
}

function apiAuthSend(method, path, data) {
    return apiSend(method, path, data);
}

function fetchCurrentUser(force, silent) {
    if (silent === undefined) {
        silent = false;
    }
    if (!force) {
        var cached = getCurrentUserCached();
        if (cached && getAccessToken()) {
            return $.Deferred().resolve(cached).promise();
        }
    }
    if (!getAccessToken() && !getRefreshToken()) {
        return $.Deferred().reject({ status: 401 }).promise();
    }
    return apiRequest({
        path: "/users/me",
        method: "GET",
        dataType: "json"
    }, true, silent).then(function (user) {
        setCurrentUserCached(user);
        return user;
    });
}

function getApiErrorMessage(xhr) {
    if (xhr && xhr.responseJSON && xhr.responseJSON.error) {
        var error = xhr.responseJSON.error;
        if (error.message) {
            return error.message;
        }
    }
    if (xhr && xhr.status === 0) {
        return "Помилка мережі. Перевірте, чи запущений бекенд.";
    }
    if (xhr && xhr.status === 401) {
        return "Потрібна авторизація.";
    }
    if (xhr && xhr.status === 403) {
        return "Недостатньо прав для цієї дії.";
    }
    return "Сталася помилка. Спробуйте пізніше.";
}

function getFieldErrors(xhr) {
    var fieldErrors = {};
    if (xhr && xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.details) {
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

function refreshHeader() {
    var $header = $('header');
    if ($header.length === 0) {
        return;
    }
    
    $header.empty();
    var $nav = $('<nav></nav>');
    
    var $main = $('<div class="nav-main"></div>');
    $main.append($('<a href="index.html">Ігри</a>'));
    $main.append($('<a href="genres.html">Жанри</a>'));
    $main.append($('<a href="hubs.html">Хаби</a>'));
    $main.append($('<a href="profile.html">Профіль</a>'));
    $nav.append($main);
    
    var $auth = $('<div class="nav-auth"></div>');
    
    if (isAuthenticated()) {
        var user = getCurrentUserCached();
        var displayName = user ? (user.first_name || user.username) : '';
        if (displayName) {
            $auth.append($('<span class="user-name"></span>').text(displayName));
        }
        var $logoutBtn = $('<button class="auth-btn auth-btn-danger">Вийти</button>');
        $logoutBtn.on('click', function () {
            logout();
        });
        $auth.append($logoutBtn);
    } else {
        var $loginLink = $('<a href="login.html" class="auth-btn auth-btn-primary">Увійти</a>');
        $auth.append($loginLink);
        var $registerLink = $('<a href="register.html" class="auth-btn">Реєстрація</a>');
        $auth.append($registerLink);
    }
    
    $nav.append($auth);
    $header.append($nav);
}

function renderHeader() {
    var $header = $('header');
    if ($header.length === 0) {
        $header = $('<header></header>');
        $('body').prepend($header);
    }
    refreshHeader();
    
    if (isAuthenticated()) {
        fetchCurrentUser(false, true).then(function (user) {
            refreshHeader();
        }).catch(function () {});
    }
}

function logout() {
    clearAuth();
    refreshHeader();
    var page = window.location.pathname.split('/').pop();
    if (page === 'profile.html' || page === 'game-form.html') {
        window.location.href = 'index.html';
    }
}
