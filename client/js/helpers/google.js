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
        var snippetRequest = this.gapi.client.youtube.videos.list({
            id: ids.join(','),
            part: 'snippet'
        });
        var detailsRequest = this.gapi.client.youtube.videos.list({
            id: ids.join(','),
            part: 'contentDetails'
        });
        snippetRequest.execute((snippetData) => {
            detailsRequest.execute((detailsData) => {
                let items = snippetData.items.map((snippet) => {
                    snippet.contentDetails = detailsData.items.filter((detail) => {
                        if (detail.id === snippet.id) {
                            return true;
                        }
                        return false;
                    })[0].contentDetails;
                    return snippet;
                });
                callback(items);
            });
        });
    }
}
