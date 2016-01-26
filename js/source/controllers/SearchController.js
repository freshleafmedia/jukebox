var $ = require('jquery');

export default class SearchController
{
    constructor(socket) {
        this.socket = socket;
        this.dialogEl = $('#addDialog');
        this.userSetupEl = $('#user-setup');
        this.searchControlsEl = $('#search-controls');

        this.initUser();
        this.initGoogleApi(this.searchReady);
        this.initKeyEvents();
        this.initClickEvents();
    }

    initUser()
    {
        if(localStorage.getItem('username')) {
            this.userSetupEl.hide();
            this.searchControlsEl.show();
        }
        $('#addUser').submit((e) => {
            e.preventDefault();
            if ($('#username').val() != "") {
                localStorage.setItem('username', $('#username').val());
                this.userSetupEl.hide();
                this.searchControlsEl.show();
            }
        });
    }

    searchReady()
    {
        $('#search').prop('disabled', false);
    }

    initGoogleApi(callback)
    {
        setTimeout(googleApiClientReady, 1000);
        function googleApiClientReady() {
            gapi.client.setApiKey('AIzaSyC5ZNaxUE7HwOxi6r5xMq9aeRlUVdJXU7I');
            gapi.auth.init(function() {
                gapi.client.load('youtube', 'v3', function () {
                    callback();
                });
            });
        }
    }

    initKeyEvents() {
        $(document).keyup((event) => {
            // Up/Down and j/k keys to navigate selecting a song
            if (event.keyCode == 40 || event.keyCode == 74) {
                if ($('.highlight').length) {
                    var highlighted = $('.highlight');
                    highlighted.next().addClass('highlight');
                    highlighted.removeClass('highlight');
                } else {
                    $('#search-container > .songResult:first-child').addClass('highlight');
                }
                return;
            }
            if (event.keyCode == 38 || event.keyCode == 75) {
                if ($('.highlight').length) {
                    var highlighted = $('.highlight');
                    highlighted.prev().addClass('highlight');
                    highlighted.removeClass('highlight');
                }
                return;
            }
            // Esc closes dialog
            if (event.keyCode == 27) {
                this.closeDialog();
            }
            // Run search on keydown in search box
            if ($(event.target).is('#search')) {
                if (event.keyCode == 13 && $('.highlight').length) {
                    $('.highlight').click();
                    return;
                }
                this.search($('#search').val());
            }
            // Keys when form input isn't focused
            if (!$(event.target).is('input')) {
                // A or Enter triggers dialog
                if (event.keyCode == 65 || event.keyCode == 13) {
                    this.showDialog();
                }
            }
        });
    }

    search(query)
    {
        var request = gapi.client.youtube.search.list({
            q: query,
            part: 'snippet',
            maxResults: '25'
        });

        request.execute((response) => {
            $('#search-container').html('');
            $.each(response.result.items, function (index, item) {
                if (item.id.kind == "youtube#video") {
                    var el = $('<div />', {'class': 'songResult'});
                    el.data('url', item.id.videoId);
                    var image = $('<img />', {src: item.snippet.thumbnails.default.url});
                    var descWrap = $('<div />');
                    var title = $('<p />', {text: item.snippet.title, 'class': 'title'});
                    //var author = $('<p />', { text: item.snippet.channelTitle, 'class': 'description' });
                    descWrap.append(title);
                    //descWrap.append(author);
                    var imgwrap = $('<div />', {'class': 'imageWrapper'});
                    imgwrap.append(image);
                    el.append(imgwrap);
                    el.append(descWrap);
                    $('#search-container').append(el);
                }
            })
        });
    }

    showDialog() {
        this.dialogEl.show();
        if (localStorage.getItem('username')) {
            $('#search').focus().val('');
        } else {
            $('#username').focus().val('');
        }
    }

    closeDialog()
    {
        this.dialogEl.hide();
    }

    initClickEvents()
    {
        $('#addButton').click(() => {
            this.showDialog();
        });
        $('#addDialogClose, .overlay').click(() => {
            this.closeDialog();
        });
        $('#search-container').on('click', '> div', (event) => {
            var song = {
                id: $(event.currentTarget).data('url'),
                title: $(event.currentTarget).find('p.title').text(),
                thumbnail: $(event.currentTarget).find('img').attr('src'),
                username: localStorage.getItem('username')
            };
            this.addSongToPlaylist(song);
            $(event.currentTarget).addClass('added');
        });

    }

    addSongToPlaylist(song)
    {
        console.log('Adding.. ' + song.id);
        this.socket.emit('addsong', song);
    }
}
