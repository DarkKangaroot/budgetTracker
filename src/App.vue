<script setup lang="ts">
import BaseHeader from "@/layouts/BaseHeader.vue"
</script>

<template>
  <el-container>
    <el-header>
      <BaseHeader />
    </el-header>
    <el-main class="">
      <RouterView />
    </el-main>
    <!-- <el-footer class="p-0 fixed bottom-0 w-full">
      <el-card>
        <div class="flex justify-center">
          Footer
        </div>
      </el-card>
    </el-footer> -->
  </el-container>
</template>
