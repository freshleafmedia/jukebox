export function notify(title, content) {
    if (window.Notification) {
        if (Notification.permission === "granted") {
            var notification = new Notification(title, { 'body': content, 'icon': '/favicon.ico' });
        } else {
            Notification.requestPermission(function(permission) {
                var notification = new Notification(title, { 'body': content, 'icon': '/favicon.ico' });
            });
        }
    }
}
