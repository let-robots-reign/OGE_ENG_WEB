<template>
    <div class="form-checkbox">
        <input :id="id" type="checkbox" :value="modelValue">
        <label :for="id">{{ label }}</label>
    </div>
</template>

<script>
export default {
    name: 'BaseCheckbox',
    props: {
        label: {
            type: String,
            required: true
        }
    }
};
</script>

<style scoped>

</style>