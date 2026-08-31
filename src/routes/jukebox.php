<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Freshleaf Jukebox</title>

    <link rel="stylesheet" type="text/css" href="/assets/app.css" media="all">
    <link rel="icon" href="/assets/images/icon.png" type="image/png">

    <script src="/assets/htmx-4.0.0.js"></script>
    <script src="/assets/htmx-4.0.0-ext-sse.js"></script>
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

    <dialog id="nameDialog">
        <div class="overlay-wrapper">
            <div class="search-header">
                <h2 class="search-title">What's your name?</h2>
            </div>

            <form id="nameForm">
                <input
                    type="text"
                    id="username"
                    name="username"
                    autofocus
                    required
                    maxlength="50"
                    placeholder=""
                >
                <button type="submit" id="saveUsernameButton">Save</button>
            </form>
        </div>
    </dialog>

    <dialog id="addDialog">
        <div class="overlay-wrapper">
            <div class="search-header">
                <h2 class="search-title">Song Search</h2>

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
        const USERNAME_KEY = 'name';
        const nameDialog = document.getElementById('nameDialog');
        const nameForm = document.getElementById('nameForm');

        if (!localStorage.getItem(USERNAME_KEY)) {
            nameDialog.showModal();
        }

        nameDialog.addEventListener('cancel', (event) => {
            event.preventDefault();
        });

        nameForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();

            if (username === '') {
                return;
            }

            localStorage.setItem(USERNAME_KEY, username);
            nameDialog.close();
        });

        const addDialog = document.getElementById('addDialog');

        addDialog.addEventListener('click', (event) => {
            if (event.target.id === 'addDialog') {
                event.target.close();
            }
        });

        addDialog.addEventListener('close', () => {
            addDialog.querySelector('#search').value = '';
            addDialog.querySelector('#search-results').innerHTML = '';
        });

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }

        function updateRemoveButtons() {
            const currentUser = localStorage.getItem(USERNAME_KEY);

            if (!currentUser) {
                return;
            }

            document.querySelectorAll('.remove-song-btn').forEach((button) => {
                const songDiv = button.closest('.songResult');
                const queuedBy = songDiv?.dataset.queuedBy;

                if (queuedBy === currentUser) {
                    button.style.display = 'flex';
                    button.style.pointerEvents = 'auto';
                } else {
                    button.style.display = 'none';
                    button.style.pointerEvents = 'none';
                }
            });
        }

        const queueObserver = new MutationObserver(() => {
            updateRemoveButtons();
        });

        queueObserver.observe(document.getElementById('queueContainer'), {
            childList: true,
            subtree: true
        });

        updateRemoveButtons();
    </script>
</body>
</html>
