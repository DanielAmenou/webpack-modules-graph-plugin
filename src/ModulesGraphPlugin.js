const fs = require("fs")
const path = require("path")
const generateGraphHtml= require("./generateGraphHtml")
const {graphDataBuilder} = require("./GraphDataBuilder")

class ModulesGraphPlugin {
  constructor(options = {}) {
    this.filename = options.filename || "modules-graph.html"
    // Add an option to show only project files
    this.showOnlyProjectFiles = options.showOnlyProjectFiles || false
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync("ModulesGraphPlugin", async (stats, callback) => {
      const outputPath = compiler.options.output.path
      const graphData = graphDataBuilder(stats.compilation, this.showOnlyProjectFiles) // Pass the option to the builder
      const graphHtml = generateGraphHtml(graphData)
      const filePath = path.resolve(outputPath, this.filename)

      fs.writeFile(filePath, graphHtml, (err) => {
        if (err) {
          console.error("Failed to write the modules graph HTML file:", err)
          callback(err)
          return
        }
        import("open")
          .then((open) => {
            open.default(filePath).then(() => callback())
          })
          .catch((err) => console.error("Failed to open the file:", err))
      })
    })
  }
}

module.exports = ModulesGraphPlugin
