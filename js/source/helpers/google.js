"use strict";

export default class GoogleApi
{

    constructor()
    {
        this.gapi = null;
        this.initCallbacks = [];
        this.init();
    }

    onInit(callback)
    {
        if (this.gapi) {
            callback();
        } else {
            this.initCallbacks.push(callback);
        }
    }

    init()
    {
        setTimeout(googleApiClientReady.bind(this), 1000);
        function googleApiClientReady() {
            this.gapi = gapi;
            this.gapi.client.setApiKey('AIzaSyC5ZNaxUE7HwOxi6r5xMq9aeRlUVdJXU7I');
            this.gapi.auth.init(() => {
                this.gapi.client.load('youtube', 'v3', () => {
                    if (this.initCallbacks.length > 0) {
                        for (var i = 0; i < this.initCallbacks.length; i++) {
                            this.initCallbacks[i]();
                        }
                    }
                });
            });
        }
    }

    getInfo(ids, callback)
    {
        var request = this.gapi.client.youtube.videos.list({
            id: ids.join(','),
            part: 'snippet'
        });
        request.execute((response) => {
            callback(response.items);
        });
    }
}
