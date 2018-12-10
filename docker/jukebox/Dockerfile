FROM debian:jessie

RUN apt-get update
RUN apt-get -y install curl

# Required for Node.js 5
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -

RUN DEBIAN_FRONTEND=noninteractive apt-get -y install \
    apache2 \
    nodejs \
    vlc \
    supervisor \
    netcat

# Install youtube-dl
RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl

# Create necessary folders
RUN mkdir logs /run/user/

RUN useradd jukebox

# Allow VLC to run as root
#RUN sed -i 's/geteuid/getppid/' /usr/bin/vlc

EXPOSE 80 443

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

WORKDIR /var/www/html
CMD ["/usr/bin/supervisord"]
