import {MultiPeerClient} from "multi-peer";
import Observable from "observable-slim";
import {clientAction, serverAction, stateChangeType, stateChangeTypeNames} from './enums';
import Player from "@/js/Player";
import Utils from "@/js/Utils";

export default class MPClient extends MultiPeerClient {
    constructor(appName) {
        super(appName, true);
        this.state = {};
        this.serverState = {};

        //Refers to players besides this client, i.e. other players
        this.players = [];

        this.setListeners();
    }

    setListeners() {
        this.on('data', (id, data) => {
            let [action, ...rest] = data;
            switch (action) {
                case clientAction.serverStateChange:
                    let [sChangeType, sPropertyString, sValue] = rest;
                    Utils.applyStateChange(this, 'serverState', sChangeType, sPropertyString, sValue);
                    this.emit("server-state-change", this.serverState);
                    break;
                case clientAction.playerStateChange:
                    let [playerId, changeType, propertyString, value] = rest;
                    let player = this.players.find(p => p.id === playerId);
                    if (player === undefined) {
                        player = new Player(playerId, null);
                        this.players.push(player);
                    }
                    console.log('[CLIENT]', {
                        playerId,
                        changeType: stateChangeTypeNames[changeType],
                        propertyString,
                        value
                    });
                    player.applyStateChange(changeType, propertyString, value);
                    this.emit("player-state-change", player);
                    break;
            }
        });
    }

    set state(value) {
        Observable.remove(this._state);
        this._state = Observable.create(value, false, changes => {
            console.log('[CLIENT] state change', changes);
            for (let change of changes) {
                this.send([serverAction.stateChange, stateChangeType[change.type], change.currentPath, change.newValue]);
            }
        });
        console.log("[CLIENT] sending reset action to server")
        this.send([serverAction.stateChange, stateChangeType.reset, '', value]);
    }

    get state() {
        return this._state;
    }
}