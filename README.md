# Fresh Jukebox


## Use

Two daemons run asynchronously:

### resolve.sh

This script watches `resolve_list` for YouTube IDs and when one is added it resolves it to a streamable URL
writes it to the `URLCache` table and also appends it to a file named `queue_list`

### play.sh

This script is responsible for the playing of songs. It watches the file `queue_list` for URLs that get added.
When a new URL is added it simply tries to play it and logs a play in the songs table.


## Setup

On a basic install of Raspbian you will need to install LAMP, `youtube-dl` and `vlc`

```
sudo apt-get install vlc
sudo curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl
```

## MySQL

### URLCache

This is the schema for the database used to store the URLs of the songs

```mysql
CREATE TABLE `URLCache` (
  `youTubeID` varchar(12) NOT NULL,
  `formatID` int(3) DEFAULT NULL,
  `URL` text,
  PRIMARY KEY (`youTubeID`),
  UNIQUE KEY `youTubeID_UNIQUE` (`youTubeID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

```

### songs

This is the schema for the table that holds metadata about a song, for now only the play count

```
CREATE TABLE `songs` (
  `youTubeID` varchar(12) NOT NULL,
  `plays` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`youTubeID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

```