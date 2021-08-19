<template>
  <div class="outer">
    <h1>Report</h1>
    <p>Select the assessments/industries to include in the report.</p>
    <v-treeview
        :items="assessments_and_industries_tree"
        dense
        hoverable
        selectable
        selection-type="leaf"
        return-object
        v-model="selected_industries"
    ></v-treeview>

    <br>
    <v-btn
        :disabled="!selected_industries.length"
        @click="make_report"
        small
        outlined
    >
      Print report
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "Make_report",
  data() {
    return {
      created_assessments: this.$assessments,  //Created assessments
      selected_industries: []
    }
  },
  computed: {
    assessments_and_industries_tree: function () {
      let id = 0
      let items = []
      this.created_assessments.forEach(assessment => {
        let obj = {}
        obj["name"] = assessment.name
        obj["children"] = []
        obj["id"] = id
        id++
        assessment.industries.forEach(industry => {
          obj["children"].push({
            "name":  industry.name,
            "id": id
          })
          id++
        })
        items.push(obj)
      })
      return items
    }
  },
  methods: {
    make_report(){
      console.log(this.selected_industries)
    }
  }
}

</script>

<style scoped>

</style>