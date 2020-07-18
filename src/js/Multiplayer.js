import Observable from 'observable-slim';
import MPServer from "@/js/MPServer";
import MPClient from "@/js/MPClient";

//Multiplayer framework
// [----------------- [TODO] ----------------] //
// * broadcasted game state (lobby/ingame/postgame/etc) (for people not in looking at a server browser)
// * streams support
// * lobby passwords
// * only allow p2p connection when password is given, so this has to be in signalserver
// * do some communication over the socket to find out more room info (surface level info for each server: rooms, room names, room user counts) (deeper info could be anything, game state/lobby state)
// * room name generator
// * rooms list
// * Check version of every client

// [----------------- [DONE] ----------------] //
// * host/not host support
// * make state observable?
// * auto state sharing
// * send buffered at 60? tps
// * webrtc
// * update meshserver? (make npm module?)
// * in meshserver, include both mesh and server/client structure (server is one of the peers)
// * Change signalserver to support server/client peer to peer structure

export default class Multiplayer {
    constructor(appName) {
        //remember that the state of every player has to be shared, on every client level state change, send the change to the server, who will send it to all(?) clients
        this.server = new MPServer(appName);
        this.client = new MPClient(appName);
        this.isHost = false;
    }

    async hostRoom(url, name, password = '', hidden = false) {
        if (this.server.url !== url) {
            await this.server.connect(url);
        }
        this.isHost = true;
        await this.server.create(name, password, hidden);
        console.log("Room created", this.server);
    }

    async joinRoom(url, name, password = '') {
        if (this.client.url !== url) {
            await this.client.connect(url);
        }
        await this.client.join(name, password);
        console.log("Room joined", this.client);
    }

    destroy() {
        this.client.destroy();
        this.server.destroy();
    }
}