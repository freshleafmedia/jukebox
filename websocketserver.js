var io = require('socket.io')(3000);
var fs  = require("fs");

var resolve_list = 'resolve_list';

io.on('connection', function(socket){
    console.log('a user connected');

    fs.readFile(resolve_list, function(err, f){
        var queue = f.toString().split('\n');
        socket.emit('queuelist', queue);
    });

    socket.on('addsong', function(data) {
        fs.appendFile(resolve_list, data.id + "\n", function (err) {
            console.log('song added: ' + data.id);
            io.emit('newsong', data);
        });
    });
});

