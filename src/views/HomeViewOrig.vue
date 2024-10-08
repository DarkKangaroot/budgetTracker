<script setup lang="ts">
import { ref, watch, onBeforeMount } from "vue";
import { Plus, Edit, Delete, Check, Close } from '@element-plus/icons-vue'


interface BudgetTrackerHeader {
  month: string,
  period: number
  budget: number,
  isEdit: boolean,
  details: BudgetTrackerDetail[]
}
interface BudgetTrackerDetail {
  name: string,
  amount: number,
  isPaid: boolean
}

const formatCurrency = (number: number): string => {
    let nf = new Intl.NumberFormat('en-US');
    return nf.format(number);
}
const sliderRef = ref();
const months = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
const budgetData = ref<BudgetTrackerHeader[]>([])


const getTotalCost = (data: BudgetTrackerDetail[]): number => data.reduce((acc, item) => acc + item.amount, 0);
const getRemainingBudget = (budget: number, totalCost: number) => budget - totalCost

const addNewBudget = () => {
  const data = [
    {
      month: "",
      period: 1,
      budget: 0,
      details: [] as BudgetTrackerDetail[]
    }
  ] as BudgetTrackerHeader[]

  budgetData.value = [...budgetData.value, ...data]

  // sliderRef.value.next()
}

const addNewDetails = (index: number) => {
  const data: BudgetTrackerDetail = {
    name: "",
    amount: 0,
    isPaid: false
  }

  budgetData.value[index].details = [...[data], ...budgetData.value[index].details]
}
const deleteHeader = (index: number) => budgetData.value = budgetData.value.filter((_:BudgetTrackerHeader,  i: number) => i !== index)
const deleteDetailItem = (headerIndex: number, detailIndex: number) => {
  budgetData.value[headerIndex].details = budgetData.value[headerIndex].details.filter((item: BudgetTrackerDetail, index: number) => index !== detailIndex)
}


const getDataFromStorage = () => {
  const budgetDataString = localStorage.getItem("budgetData")
  if (!budgetDataString || budgetDataString === "[]") {
    budgetData.value = [
      {
        month: "",
        period: 1,
        budget: 0,
        details: [] as BudgetTrackerDetail[]
      }
    ] as BudgetTrackerHeader[]
    return;
  }
  budgetData.value = JSON.parse(budgetDataString) as BudgetTrackerHeader[]
}
watch(() => budgetData.value, (data) => {
  if(data.length === 0) return;

  const budgetDataString = JSON.stringify(data)
  localStorage.setItem("budgetData", budgetDataString)
}, { deep: true, immediate: true })

onBeforeMount(() => {
  getDataFromStorage();

  window.addEventListener("beforeunload", () => {
    budgetData.value.forEach(x => x.isEdit = false)
  })
})
</script>

<template>
  <el-carousel ref="sliderRef" :interval="4000" :autoplay="false" height="600px" indicator-position="outside" arrow="never" trigger="click">
    <el-carousel-item v-for="(header, index) in budgetData" :key="index">
      <el-card class="overflow-auto">
        <el-button-group class="mb-2">
          <el-button type="primary" v-if="index === (budgetData.length - 1)" @click="addNewBudget" :icon="Plus"/>
          <el-button type="primary" @click="header.isEdit = !header.isEdit" :icon="header.isEdit ? Check : Edit"/>
          <el-popconfirm 
              width="220" 
              :icon="Delete" title="Are you sure to remove this data"
              @confirm="deleteHeader(index)"
              v-if="index !== 0">
              <template #reference>
                  <el-button type="danger" :icon="Delete" />
              </template>
              <template #actions="{ confirm, cancel }">
                  <el-button @click="cancel">No!</el-button>
                  <el-button type="danger" @click="confirm">
                      Yes
                  </el-button>
              </template>
          </el-popconfirm>
        </el-button-group>
        <el-form label-position="top" v-if="header.isEdit">
          <div class="grid grid-cols-1 gap-2">
            <el-form-item props="month" label="Month">
              <el-select v-model="header.month">
                <el-option v-for="(item, index) in months" :key="index" :value="item">{{ item }}</el-option>
              </el-select>
            </el-form-item>
            <el-form-item props="period" label="Period">
              <el-input-number v-model.number="header.period" :min="1" />
            </el-form-item>
            <el-form-item props="budget" label="Total Budget">
              <el-input 
                v-model.number="header.budget"
                :formatter="(value: number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')" 
              />
            </el-form-item>
          </div>
        </el-form>
        <div class="grid grid-cols-1 gap-2 mb-5" v-else>
          <div class="flex flex-wrap justify-between">
            <div class="text-lg font-bold">
              Month: {{ header.month }}
            </div>
          </div>
          <div class="text-lg font-bold">Period: {{ header.period }}</div>
          <div class="text-lg font-bold">Initial Amount: {{ header.budget === 0 ? 0 : formatCurrency(header.budget) }}</div>
        </div>
        <div class="text-xl font-bold">Tracker</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Total">
            {{ formatCurrency(getTotalCost(header.details)) }}
          </el-descriptions-item>
          <el-descriptions-item label="Remaining">
            {{ formatCurrency(getRemainingBudget(header.budget, getTotalCost(header.details))) }}
          </el-descriptions-item>
        </el-descriptions>
        <el-table 
          :data="header.details" 
          height="200px"
          >
          <el-table-column prop="name" label="Name">
            <template #default="scope">
              <el-input v-model="scope.row.name" v-if="header.isEdit" />
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="Amount">
            <template #default="scope">
              <el-input v-model.number="scope.row.amount"
                :formatter="(value: number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')"
                v-if="header.isEdit"
                />
                <span v-else>{{ scope.row.amount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="Name">
            <template #default="scope">
              <div v-if="header.isEdit">
                <el-checkbox v-model="scope.row.isPaid" />
              </div>
              <div v-else>
                <div class="w-7 h-7 text-green-600" v-if="scope.row.isPaid"> 
                    <Check />
                  </div>
                  <div class="w-7 h-7 text-red-600" v-else> 
                    <Close /> 
                  </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="" label="" v-if="header.isEdit">
            <template #header>
              <el-button type="primary" :icon="Plus" circle @click="addNewDetails(index)"/>
            </template>
            <template #default="scope">
              <el-button type="danger" :icon="Delete" circle @click="deleteDetailItem(index, scope.$index)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-carousel-item>
  </el-carousel>
</template>

