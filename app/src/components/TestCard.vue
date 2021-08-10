<template>
    <div class="test-card">
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
            required: true,
        },
        result: {
            type: Number,
            required: false,
            default: null,
        },
        maxPoints: {
            type: Number,
            required: true,
        }
    },
    setup() {
        const testTitle = computed(() => `Вариант ${this.index + 1}`);
        const testProgress = computed(() =>
            (this.result !== null) ? `результат: ${this.result}/${this.maxPoints}` : 'не решено');
        const testProgressColorClass = computed(() => {
            const prefix = 'test-card__';
            if (this.result === null) {
                return `${prefix}not-solved`;
            }
            const percent = this.result / this.maxPoints * 100;
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

<style scoped>
.test-card {
    background-color: var(--light-blue-shadow);
    padding: 16px;
    border-radius: 24px;
    color: var(--primary-text-color);
    cursor: pointer;
}

.test-card__title {
    font-size: 20px;
    font-weight: bold;
}

.test-card__result {
    font-size: 16px;
}

/* TODO: fix colors */
.test-card__not-solved {
    color: grey
}

.test-card__great-result {
    color: lawngreen;
}

.test-card__average-result {
    color: yellow;
}

.test-card__bad-result {
    color: red;
}
</style>
