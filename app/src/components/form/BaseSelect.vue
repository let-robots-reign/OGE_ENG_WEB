<template>
    <div class="form-control">
        <label :for=id>{{ label }}</label>
        <select
                :value="modelValue"
                :id="id"
                v-bind=$attrs
                @change="$emit('update:modelValue', $event.target.value)"
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
            type: String,
            required: true,
            default: ''
        },
        modelValue: {
            type: [String, Number],
            default: ''
        },
        options: {
            type: Array,
            required: true,
        }
    },
    setup() {
        const id = `base-select-${Math.random()}`;
        return {id};
    }
};
</script>

<style scoped>

</style>