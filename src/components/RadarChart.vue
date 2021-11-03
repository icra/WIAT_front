
<script>
import { Radar } from 'vue-chartjs'

export default {
  extends: Radar,
  props: ['chartdata', 'options'],
  mounted () {
    this.renderChart(this.chartdata, this.options)
  },
  watch: {
    chartdata(newData) {
      this.renderChart(newData, this.options)
    },
    options(newOptions) {
      this.renderChart(this.chartdata, newOptions)
    },
  }
}
</script>

<style>
</style>