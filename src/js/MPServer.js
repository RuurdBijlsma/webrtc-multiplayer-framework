import {MultiPeerServer} from "multi-peer";
import {clientAction, serverAction, stateChangeType, stateChangeTypeNames} from './enums';
import Player from "@/js/Player";
import Observable from "observable-slim";

export default class MPServer extends MultiPeerServer {
    constructor(appName) {
        super(appName);

        this.state = {};
        this.players = [];
        this.setListeners();
    }

    setListeners() {
        this.on('full-connect', () => {
            //Send every player's state to every other player
            for (let playerA of this.players) {
                for (let playerB of this.players.filter(p => p !== playerA)) {
                    //Send to playerA: playerB's state
                    this.send(playerA.id, [clientAction.playerStateChange, playerB.id, stateChangeType.reset, '', playerB.state])
                }
                this.send(playerA.id, [clientAction.serverStateChange, stateChangeType.reset, '', this.state]);
            }
        });
        this.on('connect', id => {
            console.log("Server new connection", id, this.players);
            this.players.push(new Player(id, this.peers[id]));
        });
        this.on('disconnect', id => {
            //Update remaining players that this player is gone!
            let i = this.players.findIndex(p => p.id === id);
            if (i === -1)
                console.warn("Player disconnected that was not in server player list");
            else
                this.players.splice(i, 1);
        });
        this.on('data', (id, data) => {
            let player = this.players.find(p => p.id === id);
            let [action, ...rest] = JSON.parse(data);
            switch (action) {
                case serverAction.stateChange:
                    let [changeType, propertyString, value] = rest;
                    console.log('[SERVER]', {changeType: stateChangeTypeNames[changeType], propertyString, value});
                    for (let playerB of this.players.filter(p => p !== player)) {
                        this.send(playerB.id, [clientAction.playerStateChange, player.id, changeType, propertyString, value])
                    }
                    player.applyStateChange(changeType, propertyString, value);
                    this.emit("player-state-change", player);
                    break;
            }
        });
    }

    set state(value) {
        Observable.remove(this._state);
        this._state = Observable.create(value, false, changes => {
            console.log('[SERVER] state change', changes);
            for (let change of changes) {
                this.broadcast([clientAction.serverStateChange, stateChangeType[change.type], change.currentPath, change.newValue]);
            }
        });
        console.log("[SERVER] sending reset action to all clients")
        this.broadcast([clientAction.serverStateChange, stateChangeType.reset, '', value]);
    }

    get state() {
        return this._state;
    }
}