$(document).ready(function() {
    renderHeader();
    var gameId = getQueryParam('id');
    
    if (gameId) {
        $('#formTitle').text('Редагувати гру');
        loadGameData(gameId);
    } else {
        $('#formTitle').text('Додати гру');
    }
    
    loadHubs();
    loadGenres();
    
    $('#gameForm').on('submit', function(e) {
        e.preventDefault();
        saveGame(gameId);
    });
});

function loadHubs() {
    apiGet('/hubs').done(function(hubs) {
        var $hubSelect = $('#hub_id');
        $.each(hubs, function(i, hub) {
            $hubSelect.append($('<option></option>').val(hub.id).text(hub.name));
        });
    }).fail(function(xhr) {
        // Ігноруємо помилку
    });
}

function loadGenres() {
    apiGet('/genres').done(function(genres) {
        var $checkboxes = $('#genreCheckboxes');
        $.each(genres, function(i, genre) {
            var $label = $('<label></label>');
            var $input = $('<input type="checkbox" name="genre_ids" value="' + genre.id + '">');
            $label.append($input).append(' ' + genre.name);
            $checkboxes.append($label);
        });
    }).fail(function(xhr) {
        // Ігноруємо помилку
    });
}

function loadGameData(gameId) {
    apiGet('/games/' + gameId).done(function(game) {
        $('#title').val(game.title);
        $('#description').val(game.description);
        $('#rental_price_per_day').val(game.rental_price_per_day);
        $('#play_time_mins').val(game.play_time_mins);
        $('#min_players').val(game.min_players);
        $('#max_players').val(game.max_players);
        $('#complexity').val(game.complexity);
        $('#hub_id').val(game.hub ? game.hub.id : '');
        
        if (game.genres) {
            $.each(game.genres, function(i, genre) {
                $('input[name="genre_ids"][value="' + genre.id + '"]').prop('checked', true);
            });
        }
    }).fail(function(xhr) {
        if (xhr.status === 404) {
            $('main').html('<h1>Редагувати гру</h1><div class="error">Гру не знайдено</div><div class="form-actions"><a href="index.html" class="btn btn-secondary">Назад до каталогу</a></div>');
        } else {
            alert(getApiErrorMessage(xhr));
        }
    });
}

function saveGame(gameId) {
    // Очистити попередні помилки
    $('.error').text('');
    
    var selectedGenres = [];
    $('input[name="genre_ids"]:checked').each(function() {
        selectedGenres.push(parseInt($(this).val()));
    });
    
    var data = {
        title: $('#title').val(),
        description: $('#description').val(),
        rental_price_per_day: parseFloat($('#rental_price_per_day').val()),
        play_time_mins: parseInt($('#play_time_mins').val()),
        min_players: parseInt($('#min_players').val()),
        max_players: parseInt($('#max_players').val()),
        complexity: $('#complexity').val(),
        hub_id: parseInt($('#hub_id').val()),
        genre_ids: selectedGenres
    };
    
    if (gameId) {
        // Редагування
        $.ajax({
            url: API_BASE + '/games/' + gameId,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function() {
                window.location.href = 'game.html?id=' + gameId;
            },
            error: function(xhr) {
                handleFormErrors(xhr);
            }
        });
    } else {
        // Створення
        apiSend('POST', '/games', data).done(function(response) {
            if (response.id) {
                window.location.href = 'game.html?id=' + response.id;
            } else {
                window.location.href = 'index.html';
            }
        }).fail(function(xhr) {
            handleFormErrors(xhr);
        });
    }
}

function handleFormErrors(xhr) {
    var fieldErrors = getFieldErrors(xhr);
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
    // Якщо немає полівих помилок, показати загальну
    if ($.isEmptyObject(fieldErrors)) {
        alert(getApiErrorMessage(xhr));
    }
}
