import {MultiPeerServer} from "multi-peer";
import {actionType, stateChangeType, stateChangeTypeNames} from './enums';
import Player from "@/js/Player";
import Observable from "observable-slim";
import StateUtils from "./StateUtils";
//state change template
//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

export default class MPServer extends MultiPeerServer {
    constructor(appName) {
        super(appName, false);

        this.stateUtils = new StateUtils();
        this.state = {};
        this.players = [];
        this.setListeners();
    }

    setListeners() {
        this.on('full-connect', () => {
            console.log("Server full connect")
        });
        this.on('connect', id => {
            console.log("Server new connection", id, this.players);
            let newPlayer = new Player(id, this.peers[id]);
            for (let player of this.players) {
                console.log("Sending state data of player", player.id, "to player", id);
                this.stateUtils.sendStateChange(d => this.send(id, d), id, player.id, stateChangeType.reset, '', player.state);
                this.stateUtils.sendStateChange(d => this.send(player.id, d), player.id, id, stateChangeType.reset, '', newPlayer.state);
            }
            this.players.push(newPlayer);
            this.stateUtils.sendStateChange(d => this.send(id, d), id, 0, stateChangeType.reset, '', this.state);
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
            console.log("[SERVER]data", data);
            let player = this.players.find(p => p.id === id);
            let [action, ...rest] = this.stateUtils.receiveStateChange(id, data);
            switch (action) {
                case actionType.stateChange:
                    let [_, changeType, propertyString, value] = rest;
                    console.log('[SERVER]', {changeType: stateChangeTypeNames[changeType], propertyString, value});
                    for (let playerB of this.players.filter(p => p !== player)) {
                        this.stateUtils.sendStateChange(d => this.send(playerB.id, d), playerB.id, player.id, changeType, propertyString, value);
                    }
                    this.stateUtils.applyStateChange(player, 'state', changeType, propertyString, value);
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
                this.broadcast([actionType.stateChange, 0, stateChangeType[change.type], change.currentPath, change.newValue]);
                this.stateUtils.sendStateChange(d => this.broadcast(d), 'all', 0, stateChangeType[change.type], change.currentPath, change.newValue);
            }
        });
        console.log("[SERVER] sending reset action to all clients")
        this.stateUtils.sendStateChange(d => this.broadcast(d), 'all', 0, stateChangeType.reset, '', value);
    }

    get state() {
        return this._state;
    }
}