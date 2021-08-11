<template>
    <div class="card test-card">
        <p class="test-card__title">{{ testTitle }}</p>
        <p class="test-card__result" :class="testProgressColorClass">{{ testProgress }}</p>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'TestCard',
    props: {
        index: {
            type: Number,
            required: true
        },
        result: {
            type: Number,
            required: false,
            default: null
        },
        maxPoints: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const testTitle = computed(() => `Вариант ${props.index + 1}`);
        const testProgress = computed(() =>
            (props.result !== null) ? `результат: ${props.result}/${props.maxPoints}` : 'не решено');
        const testProgressColorClass = computed(() => {
            const prefix = 'test-card__';
            if (props.result === null) {
                return `${prefix}not-solved`;
            }
            const percent = props.result / props.maxPoints * 100;
            const [GREAT_THRESHOLD, AVERAGE_THRESHOLD] = [85, 60];
            if (percent > GREAT_THRESHOLD) {
                return `${prefix}great-result`;
            }
            if (percent > AVERAGE_THRESHOLD) {
                return `${prefix}average-result`;
            }
            return `${prefix}bad-result`;
        });

        return {
            testTitle,
            testProgress,
            testProgressColorClass
        };
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

.test-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  color: $primary-text-color;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 2px 2px $green-accent inset;
  }

  &__title {
    font-size: 20px;
    font-weight: bold;
  }

  &__result {
    font-size: 16px;
  }

  /* TODO: fix colors */
  &__not-solved {
    color: grey
  }

  &__great-result {
    color: lawngreen;
  }

  &__average-result {
    color: yellow;
  }

  &__bad-result {
    color: red;
  }
}
</style>
