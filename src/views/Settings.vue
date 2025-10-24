<template>
  <div class="settings">
    <van-nav-bar title="设置" left-arrow @click-left="$router.go(-1)" />

    <div class="content">
      <van-empty description="设置页面开发中...">
        <van-button type="primary" @click="$router.push('/')">
          返回首页
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
// 设置页面 - 占位符，后续会实现完整功能
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background: #f7f8fa;
}

.content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 46px);
  padding: 16px;
}
</style>