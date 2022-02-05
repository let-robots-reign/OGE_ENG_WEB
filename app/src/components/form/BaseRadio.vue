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
  <label
    :for="id"
    :disabled="disabled"
    :class="getClassForLabel"
  >
    {{ label }}
  </label>
</template>

<script>
import {computed} from 'vue';

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
    },
    isChosenCorrect: {
      type: Boolean,
      default: null,
    },
  },
  setup(props) {
    const id = `base-radio-${Math.random()}`;
    const getClassForLabel = computed(() => {
      if (props.modelValue === props.value && props.isChosenCorrect !== null) {
        return (props.isChosenCorrect) ? 'correct' : 'wrong';
      }
      return '';
    });
    return {id, getClassForLabel};
  }
};
</script>

<style scoped>
label {
  margin-left: 8px;
}

.correct {
  color: #42b983;
}

.wrong {
  color: #e53935;
}
</style>
