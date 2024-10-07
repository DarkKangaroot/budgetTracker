<script lang="ts" setup>
import { useDark, useToggle } from "@vueuse/core";
import { Icon } from "@iconify/vue"

const isDark = useDark();
const toggleDark = useToggle(isDark);
const props = defineProps({
    isSideMenuOpen: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(["onClickMenu"])

const onClickMenu = () => emits("onClickMenu")
</script>

<template>
    <el-menu mode="horizontal" router :ellipsis="false" style="">
        <el-menu-item @click="onClickMenu">
            <!-- <Icon class="cursor-pointer font-black" :icon="`${isSideMenuOpen ? `material-symbols:menu-open` : `material-symbols:menu-rounded`}`" width="25" ></Icon> -->
        </el-menu-item>
        <el-menu-item index="0" route="/">
            <h3>Budget Tracker</h3>
        </el-menu-item>
        <div class="flex-grow" />
        <el-menu-item h="full" @click="toggleDark()">
            <Icon class="cursor-pointer font-black" :icon="`${isDark ? `ic:baseline-nights-stay` : `ic:baseline-wb-sunny`}`" width="18" ></Icon>
        </el-menu-item>
    </el-menu>
</template>