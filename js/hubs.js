$(document).ready(function() {
    renderHeader();
    loadHubs();
});

function loadHubs() {
    var $container = $('#hubsContainer');
    showLoading($container);
    
    apiGet('/hubs').done(function(hubs) {
        $container.empty();
        if (!hubs || hubs.length === 0) {
            showEmpty($container, 'Хабів не знайдено');
            return;
        }
        $.each(hubs, function(i, hub) {
            $container.append(renderHubCard(hub));
        });
    }).fail(function(xhr) {
        showError($container, getApiErrorMessage(xhr));
    });
}
