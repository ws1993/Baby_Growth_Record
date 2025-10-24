import { createPinia } from 'pinia';

const pinia = createPinia();

export default pinia;

// 导出所有store
export { useMembersStore } from './members';
export { useRecordsStore } from './records';
export { useSettingsStore } from './settings';
