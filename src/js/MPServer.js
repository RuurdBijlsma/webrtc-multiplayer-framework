import {MultiPeerServer} from "multi-peer";
import {actionType, actionNames, stateChangeType, stateChangeTypeNames} from './enums';
import PrivatePlayer from "./PrivatePlayer";
import Observable from "observable-slim";
import StateUtils from "./StateUtils";
import StateChange from "./StateChange";
import Utils from "./Utils";
//state change template
//[action, stateChangeOrigin (0 or playerId), changeType, propertyName, value]

export default class MPServer extends MultiPeerServer {
    constructor(appName) {
        super(appName, false);
        this.stateUtils = new StateUtils();
        this.players = [];

        this.state = {};
        //For host migration
        this.privateState = {};

        this.setListeners();
    }

    setListeners() {
        this.on('full-connect', () => {
            console.log("Server full connect")
        });
        this.on('connect', id => {
            console.log("Server new connection", id, this.players);
            let newPlayer = new PrivatePlayer(id);
            for (let player of this.players) {
                console.log("Sending state data of player", player.id, "to player", id);
                this.stateUtils.sendStateChange(d => this.send(id, d), id, new StateChange(actionType.stateChange, player.id, stateChangeType.reset, '', player.state));
                this.stateUtils.sendStateChange(d => this.send(player.id, d), player.id, new StateChange(actionType.stateChange, id, stateChangeType.reset, '', newPlayer.state));
            }
            this.players.push(newPlayer);
            this.stateUtils.sendStateChange(d => this.send(id, d), id, new StateChange(actionType.reset, 0, stateChangeType.reset, '', this.state));
        });
        this.on('disconnect', id => {
            //TODO Update remaining players that this player is gone!
            let i = this.players.findIndex(p => p.id === id);
            if (i === -1)
                console.warn("Player disconnected that was not in server player list");
            else {
                this.players.splice(i, 1);
                this.broadcast([actionType.userDisconnect, id]);
            }
        });
        this.on('data', (id, data) => {
            console.log("[SERVER] data", data);
            if (!Utils.isReservedData(data)) {
                this.emit('message', id, data);
                return;
            }
            if (Utils.isStateChange(data)) {
                this.handleStateChange(id, data);
            }
        });
    }

    handleStateChange(id, data) {
        let player = this.players.find(p => p.id === id);
        let stateChange = this.stateUtils.receiveStateChange(id, data);
        stateChange.stateOwner = id;
        console.log('[SERVER] state change', stateChange);
        let stateProperty = 'privateState';
        if (stateChange.action === actionType.stateChange) {
            stateProperty = 'state';
            //Share player state to all other players
            for (let playerB of this.players.filter(p => p !== player))
                this.stateUtils.sendStateChange(d => this.send(playerB.id, d), playerB.id, stateChange);
        }
        StateUtils.applyStateChange(player, stateProperty, stateChange, true);
        if (stateChange.action === actionType.stateChange)
            this.emit("player-state-change", player, stateChange);
        else
            this.emit("player-private-state-change", player, stateChange);
    }

    set state(value) {
        Observable.remove(this._state);
        this._state = Observable.create(value, false, changes => {
            for (let change of changes) {
                let stateChange = StateChange.fromObservable(actionType.stateChange, 0, change);
                this.stateUtils.sendStateChange(d => this.broadcast(d), 'all', stateChange);
                this.emit("server-state-change", this._state, stateChange);
            }
        });
        let stateChange = new StateChange(actionType.stateChange, 0, stateChangeType.reset, '', value);
        this.emit("server-state-change", this._state, stateChange);
        this.stateUtils.sendStateChange(d => this.broadcast(d), 'all', stateChange);
    }

    get state() {
        return this._state;
    }
}