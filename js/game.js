$(document).ready(function() {
    renderHeader();
    loadGame();
});

function loadGame() {
    var gameId = getQueryParam('id');
    var $container = $('#gameContainer');
    
    if (!gameId) {
        showError($container, 'Гру не знайдено');
        $('#editBtn').hide();
        $('#deleteBtn').hide();
        return;
    }
    
    showLoading($container);
    
    apiGet('/games/' + gameId).done(function(game) {
        $container.empty();
        
        var $detail = $('<div class="game-detail"></div>');
        
        $detail.append($('<h2></h2>').text(game.title));
        
        if (game.description) {
            $detail.append($('<p></p>').html('<strong>Опис:</strong> ' + game.description));
        }
        
        if (game.rental_price_per_day !== undefined && game.rental_price_per_day !== null) {
            $detail.append($('<p></p>').html('<strong>Ціна оренди за день:</strong> ' + game.rental_price_per_day + ' грн'));
        }
        
        if (game.play_time_mins !== undefined && game.play_time_mins !== null) {
            $detail.append($('<p></p>').html('<strong>Час гри:</strong> ' + game.play_time_mins + ' хв'));
        }
        
        if (game.min_players !== undefined && game.min_players !== null && game.max_players !== undefined && game.max_players !== null) {
            $detail.append($('<p></p>').html('<strong>Кількість гравців:</strong> ' + game.min_players + '-' + game.max_players));
        }
        
        if (game.complexity) {
            $detail.append($('<p></p>').html('<strong>Складність:</strong> ' + game.complexity));
        }
        
        if (game.rating !== undefined && game.rating !== null) {
            $detail.append($('<p></p>').html('<strong>Рейтинг:</strong> ' + game.rating));
        }
        
        if (game.hub) {
            var $hubP = $('<p></p>').html('<strong>Хаб:</strong> ');
            var $hubLink = $('<a></a>')
                .text(game.hub.name)
                .attr('href', 'hub.html?id=' + game.hub.id);
            $hubP.append($hubLink);
            $detail.append($hubP);
        }
        
        if (game.genres && game.genres.length > 0) {
            var $genresP = $('<p></p>').html('<strong>Жанри:</strong> ');
            $.each(game.genres, function(i, genre) {
                var $genreLink = $('<a></a>')
                    .text(genre.name)
                    .attr('href', 'genre.html?id=' + genre.id);
                $genresP.append($genreLink);
                if (i < game.genres.length - 1) {
                    $genresP.append(', ');
                }
            });
            $detail.append($genresP);
        }
        
        $container.append($detail);
        
        $('#editBtn').attr('href', 'game-form.html?id=' + gameId);
        $('#deleteBtn').on('click', function() {
            deleteGame(gameId);
        });
        
        // Показувати кнопки редагування/видалення лише адміну
        fetchCurrentUser().then(function(user) {
            if (user && user.role === 'admin') {
                $('#editBtn').show();
                $('#deleteBtn').show();
            } else {
                $('#editBtn').hide();
                $('#deleteBtn').hide();
            }
        }).catch(function() {
            $('#editBtn').hide();
            $('#deleteBtn').hide();
        });
    }).fail(function(xhr) {
        if (xhr.status === 404) {
            $container.empty().append($('<div class="error">Гру не знайдено</div>'));
        } else {
            showError($container, getApiErrorMessage(xhr));
        }
        $('#editBtn').hide();
        $('#deleteBtn').hide();
    });
}

function deleteGame(gameId) {
    if (!confirm('Ви впевнені, що хочете видалити цю гру?')) {
        return;
    }
    
    apiSend('DELETE', '/games/' + gameId).done(function() {
        window.location.href = 'index.html';
    }).fail(function(xhr) {
        if (xhr.status === 401) {
            handleAuthFailure();
        } else {
            alert(getApiErrorMessage(xhr));
        }
    });
}
