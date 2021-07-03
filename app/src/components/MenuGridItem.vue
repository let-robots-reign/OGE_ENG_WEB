<template>
    <div class="menu-list-item">
        <p class="menu-list-item__text">{{ text }}</p>
    </div>
</template>

<script>
export default {
    name: 'MenuGridItem',
    props: {
        text: {
            type: String,
            required: true,
        }
    }
};
</script>

<style scoped>

.menu-list-item {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: var(--lighter-blue);
    border-radius: 8px;
    padding: 8px;
    min-width: 160px;
    min-height: 100px;
}

.menu-list-item__text {
    color: white;
    font-size: 20px;
    margin: 0;
}

</style>
