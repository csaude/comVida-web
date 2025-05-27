<template>
  <div class="dashboard">

    <div class="chart-row">
      <apexchart
        width="600px"
        type="line"
        :options="lineChartOptions"
        :series="lineSeries"
      />

      <apexchart
        width="600px"
        type="bar"
        :options="barChartOptions"
        :series="barSeries"
      />
    </div>

    <div class="chart-row">
      <apexchart
        width="600px"
        type="area"
        :options="areaChartOptions"
        :series="areaSeries"
      />

      <apexchart
        width="600px"
        type="pie"
        :options="pieChartOptions"
        :series="pieSeries"
      />
    </div>

   
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

const lineSeries = ref([
  { name: 'Sales', data: [10, 41, 35, 51, 49, 62, 69, 91, 148] }
])
const lineChartOptions = ref({
  chart: { id: 'basic-line' },
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
})

const barSeries = ref([
  { name: 'Revenue', data: [20, 30, 40, 50, 60, 70, 80] }
])
const barChartOptions = ref({
  chart: { id: 'bar-chart' },
  xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
})

const areaSeries = ref([
  { name: 'Growth', data: [5, 15, 25, 35, 45, 30, 20] }
])
const areaChartOptions = ref({
  chart: { id: 'area-chart' },
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'] }
})

const pieSeries = ref([25, 15, 44, 55, 41])
const pieChartOptions = ref({
  labels: ['Apple', 'Banana', 'Grapes', 'Orange', 'Watermelon']
})

const radarSeries = ref([
  {
    name: 'Performance',
    data: [80, 50, 30, 40, 100, 20]
  }
])
const radarChartOptions = ref({
  chart: { id: 'radar-chart' },
  xaxis: {
    categories: ['Speed', 'Strength', 'Endurance', 'Agility', 'Flexibility', 'Stamina']
  }
})

const donutSeries = ref([44, 55, 13, 43, 22])
const donutChartOptions = ref({
  labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
})
</script>

<style scoped>
.dashboard {
  max-width: 100%;
  text-align: center;
}

.chart-row {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 40px;
}

.chart-row apexchart {
  flex: 1;
  max-width: 100%;
}
</style>