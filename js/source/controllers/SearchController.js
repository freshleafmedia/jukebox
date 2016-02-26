var $ = require('jquery');
var songHelper = require('../helpers/songs.js');
var prettyTime = songHelper.prettyTime;
var youtubeDurationToSeconds = songHelper.youtubeDurationToSeconds;

export default class SearchController
{
    constructor(socket, googleApi) {
        this.socket = socket;
        this.dialogEl = $('#addDialog');
        this.userSetupEl = $('#user-setup');
        this.userAreaEl = $('#user-area');
        this.searchControlsEl = $('#search-controls');

        this.initUser();
        googleApi.onInit(this.searchReady);
        this.initKeyEvents();
        this.initClickEvents();
    }

    initUser()
    {
        if(localStorage.getItem('username')) {
            this.userSetupEl.hide();
            this.userAreaEl.show();
        }
        $('#addUser').submit((e) => {
            e.preventDefault();
            if ($('#username').val() != "") {
                localStorage.setItem('username', $('#username').val());
                this.userSetupEl.hide();
                this.userAreaEl.show();
            }
        });
    }

    searchReady()
    {
        $('#search').prop('disabled', false);
    }

    initKeyEvents() {
        $(document).keyup((event) => {
            // Up/Down and j/k keys to navigate selecting a song
            if (event.keyCode == 40) {
                if ($('.highlight').length) {
                    var highlighted = $('.highlight');
                    highlighted.next().addClass('highlight');
                    highlighted.removeClass('highlight');
                } else {
                    $('#search-container > .songResult:first-child').addClass('highlight');
                }
                return;
            }
            if (event.keyCode == 38) {
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
                this.search($('#search').val(), (items) => {
                    this.buildResults(items)
                });
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

    search(query, callback)
    {
        var request = gapi.client.youtube.search.list({
            q: query,
            part: 'snippet',
            maxResults: '25'
        });

        request.execute((response) => {
            this.filterVideosOnly(response.result.items, (items) => {
                this.getExtraInfo(items, (items) => {
                    callback(items);
                });
            });
        });
    }

    filterVideosOnly(items, callback)
    {
        items = items.filter((item) => {
            if (item.id.kind == "youtube#video") {
                return true;
            }
            return false;
        });
        callback(items);
    }

    getExtraInfo(items, callback)
    {
        var ids = items.map(function(item) {
            return item.id.videoId;
        });
        var request = gapi.client.youtube.videos.list({
            id: ids.join(','),
            part: 'contentDetails'
        });

        request.execute((response) => {
            var extraInfo = response.items;
            items = items.map((item) => {
                item.contentDetails = extraInfo.filter((extra) => {
                    if (extra.id === item.id.videoId) {
                        return true;
                    }
                    return false;
                })[0].contentDetails;
                return item;
            });
            callback(items);
        });
    }

    buildResults(items)
    {
        $('#search-container').html('');
        $.each(items, function (index, item) {
            var el = songHelper.buildSongMarkup(item);
            $('#search-container').append(el);
        });
    }

    showDialog()
    {
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
