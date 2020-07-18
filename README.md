# webrtc-multiplayer-framework
Browser framework that facilitates multiplayer connectivity.

Works in connection with 
* multi-signal-server - server software required for signalling between peers: https://github.com/ruurdbijlsma/multi-signal-server
* multi-peer - browser package for server/client structure for peer to peer connections: https://github.com/RuurdBijlsma/multi-peer


# Usage

## Example
The following example shows very basic usage. The host creates a room, all clients join that room and set their own position to 0,0. The position will automatically sync to all other players, and any changes to the state will automatically propagate to all other players and the server. Then the server sends a message to all clients telling them to start a new game with the parameter `'helloWorld'`.
```javascript
let mp = new Multiplayer('app-name')
// Host only:
if(host)
    await mp.hostRoom('localhost:1234', 'room-name')
await mp.joinRoom('localhost:1234', 'room-name')
// Set current player position
mp.client.state.position={x:0,y:0}
mp.server.broadcast([actionType.newGame, 'helloWorld'])
```
In the future, for a more detailed example look at https://github.com/ruurdbijlsma/mp-framework-demo.

## Enums / Messages

Messages sent to and from the server are always an array, with the first item being an action. This action defined as an enum. To send messages users of this framework can define their own enums. The values `0, 1, 2 and 3` are reserved and cannot be used as action enum values!

Example enum:
```javascript
export const actionType = {
    newGame: 4,
    playCard: 5,
    shuffleDeck: 6,
}
```

A message array can be any length and can contain any serializable objects/values. Only the first item in the array must be an integer referring to the action type.
Example message:
```javascript
[actionType.playCard, player.id, {type: 'queen', value: 'king'}]
```


## Classes

### Class `Multiplayer`

**`MPServer server`**

Contains an instance of MPServer class, is only used when `hostRoom` is called, making the current user of Multiplayer the host/server.

**`MPClient client`**

Contains an instance of MPClient class, which starts connecting when `joinRoom` is called.

**`async hostRoom(String url, String name, String password = '', Boolean hidden = false)`**

Create room on given server URL. If there is no connection to that server yet, the connection will be created. Calling this will make the current user of the Multiplayer class a host/server.

**`async joinRoom(String url, String name, String password = '')`**

Join existing room on given server URL. If there is no connection to that server yet, the connection will be created. Will return when connected a server in that room if there is one, else will also return.

### Class `MPServer`
**`Object state`**

State automatically shared with all clients. A change to this object will propagate to the `serverState` object in the `MPClient` class.

**`Array[ServerPlayer] players`**

List of players that are connected.

**`Object privateState`**

State of the server that doesn't get shared to anyone. This has to be saved in this object for host migration to work. Any server state that isn't saved in this object will not be migrated to a new host.

### Class `MPClient`

**`Object state`**

State automatically shared with all other clients and the server.

**`Object serverState`**

A reflection of the global server state.

**`Object privateState`**

State of the client that is only shared with the server, not any other clients. 

**`Array[Player] otherPlayers`**

List of all other players.

**`Array[Player] players`**

List of all players, including the current client player. 

### Class `Player`

Contains information about a player, such as `id`, `state`.

### Class `ServerPlayer` (extends Player)

Same as `Player` but also contains `privateState` field that's only needed in `MPServer`.

## Events
In the Multiplayer class there is an instance of a server and a client. Both have their own events.

**MPServer**

* `connect` args:`(String peerId)` - New connection to a client
* `disconnect` args:`(String peerId)` - Disconnected from a client 
* `full-connect` - Connected to all clients in room
* `message` args:`(Any data)` - Received message from one of the clients, data type is set by the sender.
* `player-state-change` args:`(Player player)` - State of player changed
* `player-private-state-change` args:`(Player player)` - Private state of player changed
* `server-state-change` args:`(Object serverState)` - State of server changed

**MPClient**

* `connect` args:`(String peerId)` - New connection to server
* `disconnect` args:`(String peerId)` - Disconnected from server
* `message` args:`(Any data)` - Received message from the server, data type is set by the sender.
* `player-state-change` args:`(Player player)` - State of player changed
* `player-private-state-change` args:`(Player player)` - Private state of current client player changed
* `server-state-change` args:`(Object serverState)` - State of server changed