<template>
    <div class="menu-item">
        <p class="menu-item__title">{{ title }}</p>
    </div>
</template>

<script>
export default {
    name: 'MenuListItem',
    props: {
        title: {
            type: String,
            default: '',
            required: true,
        }
    }
};
</script>

<style scoped>
.menu-item {
    background-color: var(--light-blue-shadow);
    padding: 16px;
    border-radius: 24px;
    color: var(--primary-text-color);
    cursor: pointer;
}

.menu-item__title {
    font-size: 20px;
    font-weight: bold;
}

</style>
