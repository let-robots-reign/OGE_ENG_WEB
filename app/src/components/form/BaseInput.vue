<template>
    <div class="form-control" :class="{'valid': valid, 'invalid': errors && errors.length}">
        <label :for=id>{{ label }}</label>
        <input
                v-bind=$attrs
                :id=id
                :placeholder="placeholder"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
        >
        <small class="form-error-message" v-for="error in errors" :key="error.$uid">{{ error.$message }}</small>
    </div>
</template>

<script>
export default {
    name: 'BaseInput',
    props: {
        label: {
            type: String,
            required: true
        },
        placeholder: {
            type: String,
            required: false,
            default: (props) => props.label,
        },
        modelValue: {
            type: [String, Number],
            default: ''
        },
        valid: {
            type: Boolean,
            default: null
        },
        errors: {
            type: Array,
            default: null
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