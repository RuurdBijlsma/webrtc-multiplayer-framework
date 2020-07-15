import {MultiPeerClient} from "multi-peer";
import Observable from "observable-slim";
import {actionType, stateChangeType, stateChangeTypeNames} from './enums';
import Player from "@/js/Player";
import Utils from "@/js/StateUtils";
import StateUtils from "./StateUtils";
//state change template
//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

export default class MPClient extends MultiPeerClient {
    constructor(appName) {
        super(appName, false);
        this.stateUtils = new StateUtils();
        this.state = {};
        this.serverState = {};

        //Refers to players besides this client, i.e. other players
        this.players = [];

        this.setListeners();
    }

    setListeners() {
        this.on('data', (id, data) => {
            let [action, ...rest] = this.stateUtils.receiveStateChange(id, data);
            switch (action) {
                case actionType.stateChange:
                    let [stateOwner, changeType, propertyString, value] = rest;
                    console.log("[CLIENT] Receiving state change event", stateOwner)
                    if (stateOwner === 0) {
                        this.stateUtils.applyStateChange(this, 'serverState', changeType, propertyString, value);
                        this.emit("server-state-change", this.serverState);
                    } else {
                        console.log("[CLIENT] Receiving state change event on player state")
                        let player = this.players.find(p => p.id === stateOwner);
                        if (player === undefined) {
                            console.log("[CLIENT] Creating new player")
                            player = new Player(stateOwner, null);
                            this.players.push(player);
                        }
                        console.log('[CLIENT]', {
                            stateOwner,
                            changeType: stateChangeTypeNames[changeType],
                            propertyString,
                            value
                        });
                        this.stateUtils.applyStateChange(player, 'state', changeType, propertyString, value);
                        this.emit("player-state-change", player);
                    }
                    break;
            }
        });
    }

    set state(value) {
        Observable.remove(this._state);
        this._state = Observable.create(value, false, changes => {
            console.log('[CLIENT] state change', changes);
            for (let change of changes) {
                this.stateUtils.sendStateChange(d => this.send(d), 0, 0, stateChangeType[change.type], change.currentPath, change.newValue);
            }
        });
        console.log("[CLIENT] sending reset action to server");
        this.stateUtils.sendStateChange(d => this.send(d), 0, 0, stateChangeType.reset, '', value);
    }

    get state() {
        return this._state;
    }
}