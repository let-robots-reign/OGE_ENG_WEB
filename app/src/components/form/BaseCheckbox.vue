<template>
    <div class="form-checkbox">
        <div class="checkbox">
            <input
                    :id="id"
                    type="checkbox"
                    :checked="modelValue"
                    @change="$emit('update:modelValue', $event.target.checked)"
            >
            <label :for="id">{{ label }}</label>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BaseCheckbox',
    props: {
        label: {
            type: String,
            required: true
        },
        modelValue: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const id = `base-checkbox-${Math.random()}`;
        return {id};
    }
};
</script>
