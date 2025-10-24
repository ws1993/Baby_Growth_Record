<template>
  <van-dialog
    v-model:show="visible"
    :title="title"
    :message="message"
    show-cancel-button
    :confirm-button-text="confirmText"
    :cancel-button-text="cancelText"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <template v-if="$slots.default" #default>
      <slot></slot>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  show?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '确认操作',
  message: '确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消',
  show: false,
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  'update:show': [value: boolean];
}>();

const visible = ref(props.show);

const onConfirm = () => {
  emit('confirm');
  visible.value = false;
  emit('update:show', false);
};

const onCancel = () => {
  emit('cancel');
  visible.value = false;
  emit('update:show', false);
};

// 监听show prop的变化
watch(() => props.show, (newVal) => {
  visible.value = newVal;
});
</script>