<template>
    <div class="form-control" :class="{'valid': valid, 'invalid': errors && errors.length}">
        <label :for=id v-if="label">{{ label }}</label>
        <input
                v-bind=$attrs
                :id=id
                :placeholder="placeholder"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                :disabled="disabled"
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
            default: ''
        },
        placeholder: {
            type: String,
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
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const id = `base-input-${Math.random()}`;
        return {id};
    }
};
</script>

<style lang="scss" scoped>
.no-borders {
  border-radius: 0;
}

.first-item {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.last-item {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>