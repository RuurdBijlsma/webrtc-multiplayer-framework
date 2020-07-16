<template>
    <div class="game-test">
        <platformer :host="true"></platformer>
        <platformer></platformer>
    </div>
</template>

<script>
    import Platformer from "../components/Platformer";


    export default {
        name: 'GameTest',
        components: {Platformer},
        data: () => ({}),
        async mounted() {
        },
        beforeDestroy() {
        },
        methods: {}
    }
</script>
<style scoped>
    .game-test {
        display: flex;
        flex-direction: row;
    }

    .game-test > * {
        margin: 10px;
    }
</style>
