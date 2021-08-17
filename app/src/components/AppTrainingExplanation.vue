<template>
    <div class="explanation" v-for="(explanation, index) in explanationsArray" :key="index">
        <p>
            <span :class="(userAnswers[index] === rightAnswers[index]) ? 'right' : 'wrong'">
                <strong>{{ index + 1 }}.</strong>
                {{ userAnswerClean(userAnswers[index]) }}
            </span>
        </p>
        <p>Правильный ответ: <strong>{{ rightAnswers[index] }}</strong></p>
        <p v-html="explanation"></p>
    </div>
</template>

<script>
import {computed} from 'vue';
import {injectAccentTag} from '@/utils/injectAccentTag';

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
        const explanationsArray = computed(() => {
            const explanations = props.explanation.split('\r\n---');
            // в тексте объяснение выделяется символами "|", заменим их на теги <strong>, чтобы выделить жирным
            return explanations.map((explanation) => injectAccentTag(explanation, '|', 'strong'));
        });
        const userAnswerClean = (answer) => {
            if (answer === 'Выберите ответ' || !answer) {
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