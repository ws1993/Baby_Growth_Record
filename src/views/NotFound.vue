<template>
  <div class="not-found">
    <van-nav-bar title="页面未找到" left-arrow @click-left="$router.go(-1)" />

    <div class="content">
      <van-empty
        image="error"
        description="抱歉，您访问的页面不存在"
      >
        <van-button
          type="primary"
          @click="$router.push('/')"
        >
          返回首页
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NavBar, Empty, Button } from 'vant';
// 404页面 - 不需要复杂的逻辑
</script>

<style scoped>
.not-found {
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