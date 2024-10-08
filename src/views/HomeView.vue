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

interface RepetitiveTracker {
    name: string,
    amount: number,
    period: number
}

const formatCurrency = (number: number): string => {
    let nf = new Intl.NumberFormat('en-US');
    return nf.format(number);
}
const sliderRef = ref();
const months = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
const budgetDataList = ref<BudgetTrackerHeader[]>([])
const filter = ref({
  month: "",
  period: 0
})
const budgetDataIndex = ref(-1)


const getTotalCost = (data: BudgetTrackerDetail[]): number => {
  if(!data) return 0

  return data.reduce((acc, item) => acc + item.amount, 0);
}
const getRemainingBudget = (budget: number, totalCost: number) => {
  return (budget ?? 0) - totalCost;
}
const getRepetitiveList = (period: number) => {
  const repetitiveListString = localStorage.getItem("repetitiveList")
  if(!repetitiveListString || repetitiveListString === "[]") return [];

  const data = JSON.parse(repetitiveListString) as RepetitiveTracker[];
  return data.filter(x => x.period === period)

}
const addNewBudget = (month: string, period: number) => {
  const repetitiveList = getRepetitiveList(period)
  const data = [
    {
      month: month,
      period: period,
      budget: 0,
      details: [
        ...(
            repetitiveList.length > 0 ? 
                repetitiveList.map(x => {
                  const mapper: BudgetTrackerDetail = {
                    name: x.name,
                    amount: x.amount,
                    isPaid: false
                  }
                  return mapper
                }) as BudgetTrackerDetail[]
          :
          [] as BudgetTrackerDetail[]
        )
      ] as BudgetTrackerDetail[]
    }
  ] as BudgetTrackerHeader[]

  budgetDataList.value = [...budgetDataList.value, ...data]
  budgetDataIndex.value = budgetDataList.value.length - 1
}

const addNewDetails = (index: number) => {
  const data: BudgetTrackerDetail = {
    name: "",
    amount: 0,
    isPaid: false
  }

  budgetDataList.value[budgetDataIndex.value].details = [...budgetDataList.value[budgetDataIndex.value].details, ...[data]]
}
const deleteHeader = () => {
  budgetDataList.value = budgetDataList.value.filter((x, index: number) => index !== budgetDataIndex.value)
  budgetDataIndex.value = budgetDataList.value.length - 1

  filter.value.month = budgetDataList.value[budgetDataIndex.value].month
  filter.value.period = budgetDataList.value[budgetDataIndex.value].period
}
const deleteDetailItem = (index: number) => {
  budgetDataList.value[budgetDataIndex.value].details = budgetDataList.value[budgetDataIndex.value].details.filter((item: BudgetTrackerDetail, i: number) => i !== index)
}


const getDataFromStorage = () => {
  const budgetDataString = localStorage.getItem("budgetData")
  if (!budgetDataString || budgetDataString === "[]") {
    addNewBudget("January", 1)
    filter.value.month = budgetDataList.value[0].month
    filter.value.period = budgetDataList.value[0].period
    return;
  }
  const data = JSON.parse(budgetDataString) as BudgetTrackerHeader[];
  budgetDataList.value = data
  filter.value.month = data[0].month
  filter.value.period = data[0].period
  budgetDataIndex.value = data.length - 1
}


const getBudgetDataIndex = () => {
  const {
    month,
    period
  } = filter.value
  let result = budgetDataList.value.find(x => x.month == month && x.period == period)
  if(!result){
    addNewBudget(month, period);
    result = budgetDataList.value.find(x => x.month == month && x.period == period)
  }
  budgetDataIndex.value = budgetDataList.value.indexOf(result!)
  return;
}

watch(() => filter.value, (data) => {
  getBudgetDataIndex();
}, { deep: true })

watch(() => budgetDataList.value, (data) => {
  if(data.length === 0) return;

  const budgetDataString = JSON.stringify(data)
  localStorage.setItem("budgetData", budgetDataString)
}, { deep: true, immediate: true })


onBeforeMount(() => {
  getDataFromStorage();

  window.addEventListener("beforeunload", () => {
    budgetDataList.value.forEach(x => x.isEdit = false)
  })
})
</script>

<template>
  
  <div class="flex md:justify-center ">
    <el-card class="w-full md:basis-1/2">
      <el-button-group class="mb-2">
        <el-button type="primary" @click="budgetDataList[budgetDataIndex].isEdit = !budgetDataList[budgetDataIndex].isEdit" :icon="budgetDataList[budgetDataIndex].isEdit ? Check : Edit"/>
        <el-popconfirm 
            width="220" 
            :icon="Delete" title="Are you sure to remove this data"
            @confirm="deleteHeader"
            v-if="budgetDataList.length != 1">
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
      <el-form label-position="top">
        <div class="grid grid-cols-1">
          <el-form-item props="month" label="Month">
            <el-select v-model="filter.month">
              <el-option v-for="(item, index) in months" :key="index" :value="item">{{ item }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item props="period" label="Period">
            <el-input-number v-model.number="filter.period" :min="1" />
          </el-form-item>
          <el-form-item props="budget" label="Total Budget">
            <el-input 
              v-model.number="budgetDataList[budgetDataIndex].budget"
              :formatter="(value: number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')" 
            />
          </el-form-item>
        </div>
      </el-form>
      <p class="text-xl font-bold">Tracker</p>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="Total">
          {{ formatCurrency(getTotalCost(budgetDataList[budgetDataIndex].details)) }}
        </el-descriptions-item>
        <el-descriptions-item label="Remaining">
          {{ formatCurrency(getRemainingBudget(budgetDataList[budgetDataIndex].budget, getTotalCost(budgetDataList[budgetDataIndex].details))) }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table 
        :data="budgetDataList[budgetDataIndex].details"
        height="300px"
        border
        >
        <el-table-column prop="name" label="Name" width="200px">
          <template #default="scope">
            <el-input v-model="scope.row.name" type="textarea" v-if="budgetDataList[budgetDataIndex].isEdit" autosize/>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount"  width="150px">
          <template #default="scope">
            <el-input v-model.number="scope.row.amount"
              :formatter="(value: number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value: string) => value.replace(/\$\s?|(,*)/g, '')"
              v-if="budgetDataList[budgetDataIndex].isEdit"
              />
              <span v-else>{{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isPaid" label="Paid">
          <template #default="scope">
            <div v-if="budgetDataList[budgetDataIndex].isEdit">
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
        <el-table-column prop="" label="" v-if="budgetDataList[budgetDataIndex].isEdit">
          <template #header>
            <el-button type="primary" :icon="Plus" circle @click="addNewDetails"/>
          </template>
          <template #default="scope">
            <el-button type="danger" :icon="Delete" circle @click="deleteDetailItem(scope.$index)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

