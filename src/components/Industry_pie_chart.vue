<script>
import { Pie } from 'vue-chartjs'

export default {
  extends: Pie,
  props: {
    labels: Array,
    dataset: Array
  },
  data () {
    return {
      chartData: {
        labels: this.labels,
        datasets: this.dataset
      },
      options: {
        legend: {
          display: true
        },
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
