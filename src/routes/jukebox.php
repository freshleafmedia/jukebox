<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Freshleaf Jukebox</title>

    <link rel="stylesheet" type="text/css" href="/assets/app.css" media="all">
    <link rel="icon" href="/assets/images/freshleaf.svg" type="image/svg+xml">
    <link href="https://fonts.googleapis.com/css?family=Pacifico|Nunito:400,300,700" rel="stylesheet" type="text/css">

    <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0" integrity="sha384-BvJpBiO8Kh31EqtJe5DRIeWrHWnCGkwytKs9NKFi86Hhw96dEqdEMzZDeK9iEGTc" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/htmx.org@4.0.0/dist/ext/hx-sse.min.js" integrity="sha384-VZD0TLKqhJ26ayBUgQg3ud6DsOLMJvtcz0ANpNc9WSbgIuQTnlXI2IfsF5jhBjT6" crossorigin="anonymous"></script>
</head>
<body class="playing" hx-sse:connect="/sse?<?= bin2hex(random_bytes(8)) ?>">
    <div id="background"></div>
    <div id="debugUpdateTime"></div>
    <div id="wrapper">
        <header>
            <div class="masthead">
                <h1>Freshleaf Jukebox</h1>
                <button class="btn" id="addButton" onclick="document.getElementById('addDialog').showModal()">Add Song</button>
            </div>

            <div class="media-controls" id="mediaControls"></div>
        </header>

        <div class="queue">
            <p><strong>Whats on the list?</strong></p>

            <div class="queue-container" id="queueContainer"></div>
        </div>

        <section id="footer">Lovingly Crafted by Team Freshleaf</section>
    </div>

    <dialog id="addDialog">
        <div class="overlay-wrapper">
            <form method="dialog">
                <button id="addDialogClose">X</button>
            </form>

            <div class="search-header">
                <strong>Search YouTube</strong>
                <input
                    type="text"
                    id="search"
                    name="q"
                    autofocus
                    hx-get="/action/search"
                    hx-target="#search-results"
                    hx-trigger="input changed delay:400ms, search"
                    hx-indicator="#search-status"
                >
            </div>

            <div id="search-container">
                <p id="search-status" class="htmx-indicator status">Searching...</p>
                <div id="search-results"></div>
            </div>
        </div>
    </dialog>

    <script>
        const addDialog = document.getElementById('addDialog');

        addDialog.addEventListener('click', (event) => {
            if (event.target.id === 'addDialog') {
                event.target.close();
            }
        });

        addDialog.addEventListener('close', () => {
            document.getElementById('search').value = '';
            document.getElementById('search-results').innerHTML = '';
        });
    </script>
</body>
</html>
