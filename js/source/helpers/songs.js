"use strict";

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