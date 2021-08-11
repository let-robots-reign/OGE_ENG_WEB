<template>
    <div class="form-control">
        <label :for=id>{{ label }}</label>
        <input
                v-bind=$attrs
                :id=id
                :placeholder="placeholder"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
        >
    </div>
</template>

<script>
export default {
    name: 'BaseInput',
    props: {
        label: {
            type: String,
            required: true,
            default: ''
        },
        placeholder: {
            type: String,
            required: false,
            default: (props) => props.label,
        },
        modelValue: {
            type: [String, Number],
            default: ''
        }
    },
    setup() {
        const id = `base-input-${Math.random()}`;
        return {id};
    }
};
</script>

<style scoped>

</style>