$(document).ready(function() {
    renderHeader();
    loadHub();
});

function loadHub() {
    var hubId = getQueryParam('id');
    var $hubInfo = $('#hubInfo');
    var $gamesContainer = $('#gamesContainer');
    
    if (!hubId) {
        $('#hubTitle').text('Хаб не знайдено');
        $hubInfo.empty();
        showEmpty($gamesContainer, 'Хаб не знайдено');
        return;
    }
    
    showLoading($gamesContainer);
    
    // Завантажити інформацію про хаб
    apiGet('/hubs/' + hubId).done(function(hub) {
        $('#hubTitle').text(hub.name);
        $hubInfo.empty();
        var $info = $('<div class="game-detail"></div>');
        if (hub.address) {
            $info.append($('<p></p>').html('<strong>Адреса:</strong> ' + hub.address));
        }
        if (hub.phone) {
            $info.append($('<p></p>').html('<strong>Телефон:</strong> ' + hub.phone));
        }
        if (hub.description) {
            $info.append($('<p></p>').text(hub.description));
        }
        $hubInfo.append($info);
    }).fail(function(xhr) {
        if (xhr.status === 404) {
            $('#hubTitle').text('Хаб не знайдено');
            $hubInfo.empty().append($('<div class="error">Хаб не знайдено</div>'));
        } else {
            $hubInfo.empty().append($('<div class="error"></div>').text(getApiErrorMessage(xhr)));
        }
    });
    
    // Завантажити ігри хабу через GET /games?hub_id={id}
    apiGet('/games?hub_id=' + hubId).done(function(data) {
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
            showEmpty($gamesContainer, 'Хаб не знайдено');
        } else {
            showError($gamesContainer, getApiErrorMessage(xhr));
        }
    });
}
