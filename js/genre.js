$(document).ready(function() {
    renderHeader();
    loadGenre();
});

function loadGenre() {
    var genreId = getQueryParam('id');
    var $genreInfo = $('#genreInfo');
    var $gamesContainer = $('#gamesContainer');
    
    if (!genreId) {
        $('#genreTitle').text('Жанр не знайдено');
        $genreInfo.empty();
        showEmpty($gamesContainer, 'Жанр не знайдено');
        return;
    }
    
    showLoading($gamesContainer);
    
    // Завантажити інформацію про жанр
    apiGet('/genres/' + genreId).done(function(genre) {
        $('#genreTitle').text(genre.name);
        $genreInfo.empty();
        var $info = $('<div class="game-detail"></div>');
        if (genre.description) {
            $info.append($('<p></p>').text(genre.description));
        }
        $genreInfo.append($info);
    }).fail(function(xhr) {
        if (xhr.status === 404) {
            $('#genreTitle').text('Жанр не знайдено');
            $genreInfo.empty().append($('<div class="error">Жанр не знайдено</div>'));
        } else {
            $genreInfo.empty().append($('<div class="error"></div>').text(getApiErrorMessage(xhr)));
        }
    });
    
    // Завантажити ігри жанру через GET /games?genre_id={id}
    apiGet('/games?genre_id=' + genreId).done(function(data) {
        $gamesContainer.empty();
        if (!data.results || data.results.length === 0) {
            showEmpty($gamesContainer, 'Ігор не знайдено');
            return;
        }
        $.each(data.results, function(i, game) {
            $gamesContainer.append(renderGameCard(game));
        });
    }).fail(function(xhr) {
        if (xhr.status === 404) {
            showEmpty($gamesContainer, 'Жанр не знайдено');
        } else {
            showError($gamesContainer, getApiErrorMessage(xhr));
        }
    });
}
