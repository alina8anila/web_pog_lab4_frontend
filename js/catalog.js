$(document).ready(function() {
    renderHeader();
    loadFilters();
    loadGames();
    
    $('#applyFilters').on('click', function() {
        loadGames();
    });
    
    $('#resetFilters').on('click', function() {
        $('#search').val('');
        $('#hub_id').val('');
        $('#genre_id').val('');
        $('#min_players').val('');
        $('#complexity').val('');
        $('#sort').val('');
        loadGames();
    });
});

function loadFilters() {
    apiGet('/hubs').done(function(hubs) {
        var $hubSelect = $('#hub_id');
        $.each(hubs, function(i, hub) {
            $hubSelect.append($('<option></option>').val(hub.id).text(hub.name));
        });
    }).fail(function(xhr) {
        // Просто ігноруємо помилку завантаження фільтрів
    });
    
    apiGet('/genres').done(function(genres) {
        var $genreSelect = $('#genre_id');
        $.each(genres, function(i, genre) {
            $genreSelect.append($('<option></option>').val(genre.id).text(genre.name));
        });
    }).fail(function(xhr) {
        // Просто ігноруємо помилку завантаження фільтрів
    });
}

function loadGames() {
    var $container = $('#gamesContainer');
    showLoading($container);
    
    var params = [];
    var search = $('#search').val().trim();
    if (search) {
        params.push('search=' + encodeURIComponent(search));
    }
    
    var hubId = $('#hub_id').val();
    if (hubId) {
        params.push('hub_id=' + encodeURIComponent(hubId));
    }
    
    var genreId = $('#genre_id').val();
    if (genreId) {
        params.push('genre_id=' + encodeURIComponent(genreId));
    }
    
    var minPlayers = $('#min_players').val();
    if (minPlayers) {
        params.push('min_players=' + encodeURIComponent(minPlayers));
    }
    
    var complexity = $('#complexity').val();
    if (complexity) {
        params.push('complexity=' + encodeURIComponent(complexity));
    }
    
    var sort = $('#sort').val();
    if (sort) {
        params.push('sort=' + encodeURIComponent(sort));
    }
    
    var queryString = params.length > 0 ? '?' + params.join('&') : '';
    
    apiGet('/games' + queryString).done(function(data) {
        $container.empty();
        if (!data.results || data.results.length === 0) {
            showEmpty($container, 'Ігор не знайдено');
            return;
        }
        $.each(data.results, function(i, game) {
            $container.append(renderGameCard(game));
        });
    }).fail(function(xhr) {
        showError($container, getApiErrorMessage(xhr));
    });
}
