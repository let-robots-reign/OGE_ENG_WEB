<template>
    <div class="form-control">
        <label :for=id v-if="label">{{ label }}</label>
        <select
                :value="modelValue"
                :id="id"
                v-bind=$attrs
                @change="$emit('update:modelValue', $event.target.value)"
                :disabled="disabled"
        >
            <option
                    v-for="option in options"
                    :key="option"
                    :value="option"
                    :selected="option === modelValue"
            >{{ option }}</option>
        </select>
    </div>
</template>

<script>
export default {
    name: 'BaseSelect',
    props: {
        label: {
            type: String
        },
        modelValue: {
            type: [String, Number],
            default: ''
        },
        options: {
            type: Array,
            required: true
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const id = `base-select-${Math.random()}`;
        return {id};
    }
};
</script>

<style lang="scss" scoped>
.autofit {
    width: fit-content;
    min-width: 0;
    display: inline-block;
    margin-right: 4px;
}
</style>