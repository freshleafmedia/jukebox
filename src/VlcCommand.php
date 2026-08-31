<?php

enum VlcCommand: string
{
    case PLAY = 'play';
    case PAUSE = 'pause';
    case VOLUME_UP = 'volup 1';
    case VOLUME_DOWN = 'voldown 1';
    case GET_TIME = 'get_time';
}
