<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Freshleaf Jukebox</title>

    <link rel="stylesheet" type="text/css" href="{{ app(\App\Services\ResourceService::class)->resolvePath('resources/css/app.scss') }}" media="all">

    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico">
    <link href="https://fonts.googleapis.com/css?family=Pacifico|Nunito:400,300,700" rel="stylesheet" type="text/css">
    @livewireStyles
</head>
<body class="playing">
    <livewire:jukebox />
    @livewireScripts
    <script>
        Livewire.on('songAdded', (song) => {
            if (Notification.permission === "granted") {
                new Notification("Song Added", { 'body': song['title'], 'icon': '/favicon.ico' });
            } else {
                Notification.requestPermission()
                    .then(function () {
                        new Notification("Song Added", { 'body': ['title'], 'icon': '/favicon.ico' });
                    });
            }
        });
    </script>
</body>
</html>
