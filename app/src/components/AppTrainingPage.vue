<template>
    <teleport to="body">
        <app-modal v-if="showInstruction" title="Инструкция" @close="showInstruction = false">
            <div>
                <slot name="training-instruction"></slot>
                <button class="btn btn-block btn-centered primary" @click="showInstruction = false">ОК</button>
            </div>
        </app-modal>
    </teleport>

    <AppTrainingHeader :topic="topic" @show-instruction="showInstruction = true"/>

    <slot name="training-content"></slot>

    <div class="buttons-group">
        <button class="btn primary send-answers-btn" :disabled="isChecking"
                v-if="!isChecked" @click="$emit('check-answers')">
            Проверить
        </button>
        <button class="btn secondary" @click="$router.go(-1)">Выход</button>
    </div>

    <teleport to="body">
        <app-modal v-if="showResult" :title="result" @close="showResult = false">
            <div>
                <p>Вы можете посмотреть свои ошибки и правильные ответы</p>
                <button class="btn btn-block btn-centered primary" @click="showResult = false">ОК</button>
            </div>
        </app-modal>
    </teleport>
</template>

<script>
import AppTrainingHeader from '@/components/AppTrainingHeader';
import {ref} from 'vue';
import AppModal from '@/components/AppModal';

export default {
    name: 'AppTrainingPage',
    components: {AppTrainingHeader, AppModal},
    emits: ['check-answers'],
    props: {
        topic: {
            type: String,
            required: true
        }
    },
    setup() {
        const showInstruction = ref(false);

        const isChecking = ref(false);
        const isChecked = ref(false);
        const showResult = ref(false);
        const result = ref('');

        const setShowInstruction = (ifShow) => showInstruction.value = ifShow;
        const setIsChecking = (ifIsChecking) => isChecking.value = ifIsChecking;
        const setResult = (res) => {
            isChecking.value = false;
            isChecked.value = true;
            result.value = res;
            showResult.value = true;
        };

        return {
            showInstruction,
            isChecking,
            isChecked,
            result,
            showResult,
            setShowInstruction,
            setIsChecking,
            setResult
        };
    }
};
</script>

<style lang="scss" scoped>
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