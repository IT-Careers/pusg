var app = app || {};

class SocketService {
    constructor() {
        this.homeConnection = null;
        this.gameConnection = null;
    }

    async initGameConnection() {
        this.gameConnection = await new signalR.HubConnectionBuilder()
            .withUrl(`${app.config.SERVICE_URL}/game`)
            .build();
    }

    disconnectGame() {
        this.gameConnection.stop();
        this.gameConnection = null;
    }

    initGameReceivers() {
        this.gameConnection.on('OnConnected', ([message]) => {
            console.log(message);
        });

        this.gameConnection.on('StartGame', ([color]) => {
            window.location.hash = '#/play';
            app.config.USER.COLOR = color;
        });

        this.gameConnection.on('OtherUp', () => {
            app.eventService.triggerEvent('OtherUp');
        });

        this.gameConnection.on('OtherRight', () => {
            app.eventService.triggerEvent('OtherRight');
        });

        this.gameConnection.on('OtherDown', () => {
            app.eventService.triggerEvent('OtherDown');
        });

        this.gameConnection.on('OtherLeft', () => {
            app.eventService.triggerEvent('OtherLeft');
        });

        this.gameConnection.on('OtherRotateLeft', () => {
            app.eventService.triggerEvent('OtherRotateLeft');
        });

        this.gameConnection.on('OtherRotateRight', () => {
            app.eventService.triggerEvent('OtherRotateRight');
        });

        this.gameConnection.on('GameState', (state) => {
            app.eventService.triggerEvent('GameState', state);
        });

        this.gameConnection.on('GameEnd', (result) => {
            app.eventService.triggerEvent('GameEnd', result);
        });
    }

    initGame() {
        return this.initGameConnection().then(() => {
            this.initGameReceivers();
            return this.start(this.gameConnection);
        });
    }

    async initHomeConnection() {
        this.homeConnection = await new signalR.HubConnectionBuilder()
            .withUrl(`${app.config.SERVICE_URL}/home`)
            .build();
    }

    initHomeReceivers() {
        this.homeConnection.on('OnConnected', ([message]) => {
            console.log(message);
        });

        this.homeConnection.on('ReceiveMessage', ([user, message]) => {
            const messageNode = app.htmlService
                .getElementFromTemplate('message', {
                    user: user,
                    message: message
                });

            app.htmlService.attachElement(app.htmlService.createElement(messageNode)
                , '.history-messages');
        });
    }

    initHome() {
        return this.initHomeConnection().then(() => {
            this.initHomeReceivers();
            return this.start(this.homeConnection);
        });
    }

    start(connection) {
        const starting = async () => {
            try {
                await connection.start();
            } catch (e) {
                console.log(e);
            }
        };

        return starting().then(() => {});
    }

    send(location, method, ...args) {
        if(location === 'home') this.homeConnection.invoke(method, ...args);
        if(location === 'game') this.gameConnection.invoke(method, ...args);
    }
}

app.socketService = new SocketService();




