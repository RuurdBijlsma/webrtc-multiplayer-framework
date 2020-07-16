<template>
    <div class="platformer">
        <canvas ref="canvas" class="canvas" width="500" height="500" @mousemove="changeBallPos"></canvas>
    </div>
</template>

<script>
    import Multiplayer from "../js/Multiplayer";

    export default {
        name: "Platformer",
        props: {
            host: {
                type: Boolean,
                default: false,
            },
        },
        data: () => ({
            canvas: null,
            context: null,
            animationFrame: -1,
            mp: new Multiplayer('platformer'),
        }),
        beforeDestroy() {
            this.mp.destroy();
            this.cancelAnimationFrame(this.animationFrame);
        },
        async mounted() {
            this.canvas = this.$refs.canvas;
            this.context = this.canvas.getContext('2d');

            if (this.host) {
                await this.mp.hostRoom('https://api.ruurd.dev', 'room-name');
            }
            await this.mp.joinRoom('https://api.ruurd.dev', 'room-name');
            this.mp.client.state.ball = {x: 0, y: 0};
            this.mp.client.state.color = ['red', 'blue', 'green', 'orange'][Math.floor(Math.random() * 4)];
            this.render();
        },
        methods: {
            render() {
                this.animationFrame = requestAnimationFrame(this.render);
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

                for (let player of this.mp.client.players) {
                    this.context.fillStyle = player.state?.color;
                    this.context.fillRect(player.state.ball?.x, player.state.ball?.y, 10, 10);
                }
            },
            changeBallPos(e) {
                let {top, left} = this.canvas?.getBoundingClientRect();
                let x = e.pageX - left;
                let y = e.pageY - top;
                this.mp.client.state.ball = {x, y};
            },
        },
    }
</script>

<style scoped>
    .platformer {

    }

    .canvas {
        background-color: white;
        width: 500px;
        height: 500px;
    }
</style>