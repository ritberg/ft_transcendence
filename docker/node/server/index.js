//include ws
const WebSocket = require("ws");

//creates a socket to connect to on port 8082
const wss = new WebSocket.Server({port: 3333});
//assign player number to clients
let clients = {
    id : 1,
    num : 1
}

//lets clients know if game is ready
let ready = {
    id : 2,
    isready : 0
}

var client_count = 0;


wss.on("connection", ws => {
    console.log("new client arrived");
    ws.send(JSON.stringify(clients));
    clients.num++;
    if (clients.num > 2)
        clients.num = 1;

    ws.on("message", client_message => {
        //if id is received is 10/11/12 sends it back to other players
        //if id is 3 or 4, change the player count
        let array = JSON.parse(client_message);
        //console.log(array);
        if (array.id == 3)
        {
            client_count++;
        }
        if (array.id == 4)
        {
            if (client_count > 0)
                client_count--;
            console.log("client left");
        }
        //if client_count is smaller than 2 stop the came
        if (client_count < 2)
        {
            ready.isready = 0;
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(ready));
                }
            });
        }
        //if client_count == 2, start the game
        if (client_count == 2)
        {
            ready.isready = 1;
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(ready));
                }
            });
        }
        if (array.id == 10 || array.id == 11 || array.id == 13)
        {
            wss.clients.forEach(function each(client) {
                if (ws !== client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(array));
                }
            });
        }
        if (array.id == 12)
        {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(array));
                }
            });
        }
        //console.log(client_count);
    });
    ws.on("close", () => {
        client_count--;
        console.log("client left");
    })
});
