<template>
    <div class="modal-backdrop" @click="$emit('close')"></div>
    <div class="modal" :class="`modal_size_${size}`">
        <h3 v-if="title" class="modal__title">{{ title }}</h3>

        <div class="modal__content">
            <slot/>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppModal',
    emits: ['close'],
    props: {
        title: {
            type: String
        },
        size: {
            type: String,
            default: 'small'
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/variables';

.modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: fixed;
  top: 40%;
  padding: 2rem 1rem 0.5rem 1rem;
  background: #fff;
  z-index: 1000;
  left: 50%;
  border-radius: 10px;
  transform: translate(-50%, -40%);
  box-shadow: 2px 3px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  max-height: 80%;

  &_size {
    &_small {
      width: 30%;
    }

    &_medium {
      width: 60%;
    }

    &_large {
      width: 90%;
    }
  }

  &__title {
    margin: 0 2rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  &__content {
    font-size: 18px;
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .35);
  z-index: 100;
}

@media screen and (max-width: 1100px) {
  .modal {
    &_size {
      &_small {
        width: 80%;
      }

      &_medium {
        width: 90%;
      }

      &_large {
        width: 90%;
      }
    }
  }
}
</style>
