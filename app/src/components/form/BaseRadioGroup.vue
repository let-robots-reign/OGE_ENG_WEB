<template>
    <component
            v-for="option in options"
            :key="option"
            :is="(vertical) ? 'div' : 'span'"
            :class="{'horizontal': !vertical}"
    >
        <BaseRadio
            :value="option"
            :label="option"
            :name="name"
            :modelValue="modelValue"
            @update:modelValue="$emit('update:modelValue', $event)"
            :disabled="disabled"
            :isChosenCorrect="isChosenCorrect"
        />
    </component>
</template>

<script>
import BaseRadio from '@/components/form/BaseRadio';
export default {
    name: 'BaseRadioGroup',
    components: {BaseRadio},
    props: {
        options: {
            type: Array,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        modelValue: {
            type: [String, Number],
            required: true
        },
        vertical: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        isChosenCorrect: {
            type: Boolean,
            default: null,
        },
    }
};
</script>

<style scoped>
    .horizontal {
        margin-right: 20px;
    }
</style>