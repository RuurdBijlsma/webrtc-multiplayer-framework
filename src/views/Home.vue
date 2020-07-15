<template>
    <div class="home">
        <h2>Server state</h2>
        <p :key="updateKey">Client 1 server state:{{JSON.stringify(multiplayer.client.serverState)}}</p>
        <p :key="updateKey+1">Client 2 server state:{{JSON.stringify(multiplayer2.client.serverState)}}</p>
        <!--        <p :key="updateKey">Actual server state:{{JSON.stringify(multiplayer.server.state)}}</p>-->
        <h2>Client 1 state</h2>
        <!--        <p :key="updateKey">Actual client1 state:{{JSON.stringify(multiplayer.client.state)}}</p>-->
        <p :key="updateKey+4" v-for="player in multiplayer2.client.players">Client 2 {{player.id}}} state:{{JSON.stringify(player.state)}}</p>
        <p :key="updateKey+5" v-if="multiplayer.server.players.find(p=>p.id===multiplayer.client.signal.id)">Server client1 state:{{JSON.stringify(multiplayer.server.players.find(p=>p.id===multiplayer.client.signal.id).state)}}</p>
        <h2>Client 2 state</h2>
        <!--        <p :key="updateKey">Actual client1 state:{{JSON.stringify(multiplayer.client.state)}}</p>-->
        <p :key="updateKey+7" v-for="player in multiplayer.client.players">Client 1 {{player.id}}} state:{{JSON.stringify(player.state)}}</p>
        <p :key="updateKey+8" v-if="multiplayer.server.players.find(p=>p.id===multiplayer2.client.signal.id)">Server client2 state:{{JSON.stringify(multiplayer.server.players.find(p=>p.id===multiplayer2.client.signal.id).state)}}</p>
        <h2>Counts</h2>
        <p>Server player count {{multiplayer.server.players.length}}</p>
        <p>Client 1 player count {{multiplayer.client.players.length}}</p>
        <p>Client 2 player count {{multiplayer2.client.players.length}}</p>
    </div>
</template>

<script>
    import Observable from 'observable-slim';
    import {MultiPeerServer, MultiPeerClient} from 'multi-peer'
    import Multiplayer from "@/js/Multiplayer";


    export default {
        name: 'Home',
        components: {},
        data: () => ({
            multiplayer: new Multiplayer('test'),
            multiplayer2: new Multiplayer('test'),
            clientText: '',
            serverText: '',
            updateKey: 0,
        }),
        async mounted() {
            // await this.server.connect('https://api.ruurd.dev');
            // console.log("Server started", this.server);
            // await this.client.connect('https://api.ruurd.dev');
            // console.log("Client started", this.client);

            await this.multiplayer.hostRoom('https://api.ruurd.dev', 'room-name');
            await this.multiplayer.joinRoom('https://api.ruurd.dev', 'room-name');
            await this.multiplayer2.joinRoom('https://api.ruurd.dev', 'room-name');

            console.log(this.multiplayer)
            this.multiplayer.client.state = {
                hello: 'world',
                arr: [2],
                health: 100,
            }
            setTimeout(() => {
                this.multiplayer.client.state.hello += 'bye';
                this.multiplayer.client.state.arr.push(5);
                this.multiplayer.client.state.health -= 1;
                this.multiplayer.client.state.health -= 1;
                this.multiplayer.client.state.health -= 1;
                this.multiplayer.client.state.health -= 1;
                this.multiplayer.client.state.health -= 1;
                this.multiplayer.client.state.wow = 'gang';
                this.multiplayer.server.state.initional = 5;
                this.multiplayer.server.state.text = 'asdf';
                console.log(this.multiplayer);
            }, 100);
            this.multiplayer.client.on('player-state-change', () => this.updateKey++);
            this.multiplayer.client.on('server-state-change', () => this.updateKey++);
            this.multiplayer.server.on('player-state-change', () => this.updateKey++);
            this.multiplayer2.client.on('player-state-change', () => this.updateKey++);
            this.multiplayer2.client.on('server-state-change', () => this.updateKey++);
        },
        beforeDestroy() {
            this.server.destroy();
            this.client.destroy();
            this.multiplayer.destroy();
            console.log("Destroying");
        },
        methods: {
            async joinRoom(room) {
                await this.client.join(room);
                console.log("Room joined");
            },
            createRoom(room) {
                this.server.create(room);
                console.log("Room created");
            },
            clientSend(text) {
                this.client.send(text);
            },
            serverSend(text) {
                this.server.broadcast(text);
            },
        }
    }
</script>
