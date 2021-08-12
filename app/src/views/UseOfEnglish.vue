<template>
    <main v-if="questions.length">
        <UseOfEnglishCard
                v-for="(question, index) in questions"
                :key="index"
                :question="question.task"
                :origin="question.origin"
        />
        <div class="buttons-group">
            <button class="btn primary send-answers-btn">Проверить</button>
            <button class="btn secondary" @click="$router.go(-1)">Выход</button>
        </div>
    </main>
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
                .then((res) => questions.value = res.data.questions)
                .catch((err) => console.log(err));
        });

        return {
            questions
        };
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

main {
  width: 50%;
  margin: 0 auto;
}

.buttons-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;

  button {
    width: 100%;
    height: 50px;
    border-radius: 8px;
    font-size: 18px;
    font-family: Inter, Roboto, Oxygen, Fira Sans, Helvetica Neue, sans-serif;
  }
}
</style>