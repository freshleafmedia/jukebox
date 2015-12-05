FROM debian:jessie

RUN apt-get update && \
      DEBIAN_FRONTEND=noninteractive apt-get -y install \
      apache2 \
      libapache2-mod-php5 \
      php5 \
      python \
      curl

# Apache + PHP requires preforking Apache for best results & enable Apache SSL
# forward request and error logs to docker log collector
RUN a2dismod mpm_event && \
    a2enmod mpm_prefork \
            ssl \
            rewrite && \
    a2ensite default-ssl && \
    ln -sf /dev/stdout /var/log/apache2/access.log && \
    ln -sf /dev/stderr /var/log/apache2/error.log

WORKDIR /var/www/html

# Make sure playlist file exists and is writable
RUN touch /var/www/html/playlist
RUN chmod 777 /var/www/html/playlist

# Install youtube-dl
RUN curl https://yt-dl.org/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl

EXPOSE 80
EXPOSE 443

CMD ["apache2ctl", "-D", "FOREGROUND"]
