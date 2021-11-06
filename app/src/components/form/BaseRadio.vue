<template>
    <input
            :id="id"
            type="radio"
            :checked="modelValue === value"
            :value="value"
            v-bind="$attrs"
            @change="$emit('update:modelValue', value)"
            :disabled="disabled"
    >
    <label :for="id" :disabled="disabled">{{ label }}</label>
</template>

<script>
export default {
    name: 'BaseRadio',
    props: {
        label: {
            type: String,
            required: true
        },
        modelValue: {
            // modelValue - value of currently checked BaseRadio
            type: [String, Number],
            default: ''
        },
        value: {
            // value - value of particular BaseRadio
            type: [String, Number],
            required: true
        },
        disabled: {
            type: Boolean,
            default: false,
        }
    },
    setup() {
        const id = `base-radio-${Math.random()}`;
        return {id};
    }
};
</script>

<style scoped>
label {
    margin-left: 8px;
}
</style>
