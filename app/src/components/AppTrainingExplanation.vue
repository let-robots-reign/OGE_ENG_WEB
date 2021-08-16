<template>
    <div class="explanation" v-for="(explanation, index) in explanationsArray" :key="index">
        <p>
            <span :class="(userAnswers[index] === rightAnswers[index]) ? 'right' : 'wrong'">
                <strong>{{ index + 1 }}.</strong>
                {{ userAnswerClean(userAnswers[index]) }}
            </span>
        </p>
        <p>Правильный ответ: <strong>{{ rightAnswers[index] }}</strong></p>
        <p>{{ explanation }}</p>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'AppTrainingExplanation',
    props: {
        userAnswers: {
            type: Array,
            required: true
        },
        rightAnswers: {
            type: Array,
            required: true
        },
        explanation: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const explanationsArray = computed(() => props.explanation.split('\r\n---'));
        const userAnswerClean = (answer) => {
            if (answer === 'Выберите ответ') {
                answer = 'Нет ответа';
            }
            return answer;
        };

        return {
            explanationsArray,
            userAnswerClean
        };
    }
};
</script>

<style scoped>
.explanation {
    font-size: 18px;
    margin: 8px 0;
}

.right {
    color: #c3e991;
}

.wrong {
    color: #e53935;
}
</style>