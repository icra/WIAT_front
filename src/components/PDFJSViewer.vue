<template>
  <div>
    <iframe height="100%" width=100% src="" id="visualizer"></iframe>
  </div>
</template>

<script>
export default {
  name: 'PDFJSViewer',
  methods: {
    make_pdf(pdf_doc){
      let f = document.getElementById('visualizer');
      let callback = function(url) { f.setAttribute('src', url)}
      pdf_doc.getDataUrl(callback, pdf_doc);
      return this.fileName
    }
  }
}
</script>
<style scoped>
div {
  width: 90%;
  height: 90vh;
  min-width: 400px;
}
</style>