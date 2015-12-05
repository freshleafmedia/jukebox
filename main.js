setTimeout(googleApiClientReady, 1000);
function googleApiClientReady() {
    gapi.client.setApiKey('AIzaSyC5ZNaxUE7HwOxi6r5xMq9aeRlUVdJXU7I');
    gapi.auth.init(function() {
        gapi.client.load('youtube', 'v3', function () {
            handleAPILoaded();
        });
    });
}

function handleAPILoaded()
{
    $('#search').prop('disabled', false);
}

$('#search').on('keyup', function () {
    search($('#search').val());
});

function search(query) {
    var request = gapi.client.youtube.search.list({
        q: query,
        part: 'snippet',
        maxResults: '25'
    });

    request.execute(function (response) {
        console.log(response.result);
        $('#search-container').html('');
        $.each(response.result.items, function(index, item) {
            if (item.id.kind == "youtube#video") {
                var el = $('<div />', { 'class': 'songResult' });
                el.data('url', item.id.videoId);
                var image = $('<img />', { src: item.snippet.thumbnails.default.url });
                var descWrap = $('<div />');
                var title = $('<p />', { text: item.snippet.title, 'class': 'title' });
                //var author = $('<p />', { text: item.snippet.channelTitle, 'class': 'description' });
                descWrap.append(title);
                //descWrap.append(author);
                el.append(image);
                el.append(descWrap);
                $('#search-container').append(el);
            }
        })
    });
}

$('#search-container').on('click', '> div', function() {
    var id = $(this).data('url');
    addSong(id);
    $(this).clone().appendTo('.queue-container');
    $(this).addClass('added');
});

function addSong(id) {
    console.log('Adding.. ' + id);
    $.ajax('/dj.php', {
        data: {
            id: id
        },
        success: function(data) {
            console.log('Song added! [server: ' + data + ']');
        }
    });
}

$('#addButton').click(function() {
    $('#addDialog').show();
});

$('#addDialogClose').click(function() {
    $('#addDialog').hide();
});