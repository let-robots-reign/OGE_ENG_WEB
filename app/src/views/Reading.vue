<template>
    <main>
        <teleport to="body">
            <app-modal v-if="showInstruction" title="Инструкция" @close="showInstruction = false">
                <div>
                    <p>
                        Определите, в каком из текстов <strong>A-F</strong> содержатся ответы на вопросы
                        <strong>1-7</strong>.
                    </p>
                    <p>
                        Используйте каждую цифру только один раз.
                    </p>
                    <p>
                        В задании есть один лишний вопрос.
                    </p>
                    <button class="btn btn-block btn-centered primary" @click="showInstruction = false">ОК</button>
                </div>
            </app-modal>
        </teleport>

        <AppTrainingHeader :topic="topic" @show-instruction="showInstruction = true"/>
    </main>
</template>

<script>
import AppTrainingHeader from '@/components/AppTrainingHeader';
import {ref} from 'vue';
import AppModal from '@/components/AppModal';

export default {
    name: 'Reading',
    components: {AppTrainingHeader, AppModal},
    props: {
        topic: {
            type: String,
            required: true
        }
    },
    setup() {
        const questions = ref([]);
        const textSections = ref([]);
        const showInstruction = ref(false);

        return {
            questions,
            textSections,
            showInstruction
        };
    }
};
</script>

<style lang="scss" scoped>
main {
  width: 50%;
  margin: 32px auto;
}
</style>