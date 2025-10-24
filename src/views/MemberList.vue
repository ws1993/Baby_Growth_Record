<template>
  <div class="member-list">
    <van-nav-bar title="成员管理" left-arrow @click-left="$router.go(-1)" />

    <div class="content">
      <van-empty description="成员管理页面开发中...">
        <van-button type="primary" @click="$router.push('/')">
          返回首页
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
// 成员列表页面 - 占位符，后续会实现完整功能
</script>

<style scoped>
.member-list {
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