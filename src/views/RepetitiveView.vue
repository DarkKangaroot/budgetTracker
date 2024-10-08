<script lang="ts" setup>
import { ref, watch, onBeforeMount } from "vue";
import { Plus,Delete } from '@element-plus/icons-vue'

interface RepetitiveTracker {
    name: string,
    amount: number,
    period: number
}
const repetitiveList = ref<RepetitiveTracker[]>([
    {
        name: "",
        amount: 0,
        period: 1
    }
])

const add = () => repetitiveList.value.push({ name: "", amount: 0, period: 1 })
const remove = (index: number) => repetitiveList.value = repetitiveList.value.filter((x, i: number) => i !== index);
const loadData = () => {
  const repetitiveListString = localStorage.getItem("repetitiveList")
  if(!repetitiveListString || repetitiveListString === "[]") return


  const data = JSON.parse(repetitiveListString) as RepetitiveTracker[];
  repetitiveList.value = data;
}
watch(() => repetitiveList.value, (data) => {
  if(data.length === 0) return;

  const repetitiveListString = JSON.stringify(data)
  localStorage.setItem("repetitiveList", repetitiveListString)
}, { deep: true })

onBeforeMount(() => {
  loadData()
})

</script>

<template>
    <el-card>
      <h1>Repetitive Cost</h1>
      <el-divider></el-divider>
      <el-button type="primary" circle :icon="Plus" @click="add"/>
      <el-table :data="repetitiveList" border class="mt-5">
          <el-table-column prop="name" label="Name">
            <template #default="scope">
              <el-input v-model="scope.row.name" type="textarea"autosize/>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="Amount">
            <template #default="scope">
              <el-input v-model.number="scope.row.amount"
                :formatter="(value: number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')"
                />
            </template>
          </el-table-column>
          <el-table-column prop="period" label="Period">
            <template #default="scope">
              <el-input-number v-model.number="scope.row.period" :min="1"/>
            </template>
          </el-table-column>
          <el-table-column prop="" label="">
            <template #default="scope">
              <el-button type="danger" :icon="Delete" circle @click="remove(scope.$index)" />
            </template>
          </el-table-column>
      </el-table>
    </el-card>
</template>