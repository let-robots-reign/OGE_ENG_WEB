<template>
    <UseOfEnglishCard
            v-for="(question, index) in questions"
            :key="index"
            :question="question.task"
            :origin="question.origin"
    />
</template>

<script>
import UseOfEnglishCard from '@/components/cards/UseOfEnglishCard';
import {onMounted, ref} from 'vue';
import {API} from '@/services/api';
export default {
    name: 'UseOfEnglish',
    components: {UseOfEnglishCard},
    props: {
        topic: {
            type: String,
        }
    },
    setup(props) {
        const questions = ref([]);

        onMounted(async () => {
            API.getUoeTraining(props.topic)
                .then((res) => {
                    questions.value = res.data.questions;
                })
                .catch((err) => console.log(err));
        });

        return {
            questions
        };
    }
};
</script>

<style scoped>

</style>