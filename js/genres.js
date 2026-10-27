$(document).ready(function() {
    renderHeader();
    loadGenres();
});

function loadGenres() {
    var $container = $('#genresContainer');
    showLoading($container);
    
    apiGet('/genres').done(function(genres) {
        $container.empty();
        if (!genres || genres.length === 0) {
            showEmpty($container, 'Жанрів не знайдено');
            return;
        }
        $.each(genres, function(i, genre) {
            $container.append(renderGenreCard(genre));
        });
    }).fail(function(xhr) {
        showError($container, getApiErrorMessage(xhr));
    });
}
