"use strict";
var $ = require('jquery');

export function prettyTime(seconds)
{
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var seconds = seconds - (hours * 3600) - (minutes * 60);

    function str_pad_left(string,pad,length) {
        return (new Array(length+1).join(pad)+string).slice(-length);
    }

    var display = "";
    if (hours > 0) {
        display += hours + ":";
    }
    if (hours > 0 || minutes > 0) {
        if (hours > 0) {
            display += str_pad_left(minutes, "0", 2);
        } else {
            display += minutes;
        }
        display += ":";
    }
    if (hours > 0 || minutes > 0 || seconds > 0) {
        if (hours > 0 || minutes > 0) {
            display += str_pad_left(seconds, "0", 2);
        } else {
            display += seconds;
        }
    }
    return display;
}

export function youtubeDurationToSeconds(duration)
{
    duration = duration.replace('PT', '');
    var hours = duration.indexOf('H') !== -1 ? parseInt(duration.split('H')[0]) : 0;
    var minutes = duration.indexOf('M') !== -1 ? parseInt(duration.split('M')[0]) : 0;
    var seconds = duration.indexOf('S') !== -1 ? parseInt(duration.split('S')[0]) : 0;
    return (hours * 3600) + (minutes * 60) + seconds;
}

export function buildSongMarkup(item)
{
    var el = $('<div />', {'class': 'songResult'});
    el.data('url', item.id.videoId);
    var image = $('<img />', {src: item.snippet.thumbnails.default.url});
    var descWrap = $('<div />');
    var title = $('<p />', {text: item.snippet.title, 'class': 'title'});
    var duration = $('<p />', { 'class': 'duration', text: this.prettyTime(youtubeDurationToSeconds(item.contentDetails.duration)) });
    //var author = $('<p />', { text: item.snippet.channelTitle, 'class': 'description' });
    descWrap.append(title);
    //descWrap.append(author);
    var imgwrap = $('<div />', {'class': 'imageWrapper'});
    imgwrap.append(image);
    el.append(imgwrap);
    el.append(descWrap);
    el.append(duration);
    return el;
}