var socket = io('//:3000');
socket.on('connect', function(){
    console.log('connected to websocket server');
});

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
    var song = {
	id: $(this).data('url'),
	title: $(this).find('p.title').text(),
	thumbnail: $(this).find('img').attr('src')
    };
    addSong(song);
    $(this).addClass('added');
});

function addSong(song) {
    console.log('Adding.. ' + song.id);
    socket.emit('addsong', song);
}

$('#addButton').click(function() {
    $('#addDialog').show();
});

$('#addDialogClose').click(function() {
    $('#addDialog').hide();
});

socket.on('newsong', function(song) {
    console.log('From websocket: new song' + song.id);
    addToQueue(song);
});

socket.on('queuelist', function(data) {
    console.log('From websocket: whole list');
    setQueue(data);
});

function addToQueue(song) {
    var item = $('<div />', { 'class': 'songResult' });
    var image = $('<img />', { src: song.thumbnail });
    var title = $('<p />', { 'class': 'title', text: song.title });
    item.append(image);
    item.append(title);
    $('.queue-container').append(item);
}

function setQueue(data) {
    $.each(data, function(index, item) {
	addToQueue(item);
    });
}
