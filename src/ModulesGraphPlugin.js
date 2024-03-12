const fs = require("fs")
const path = require("path")
const generateGraphHtml = require("./generateGraphHtml")
const {graphDataBuilder} = require("./graphDataBuilder")

class ModulesGraphPlugin {
  constructor(options = {}) {
    this.filename = options.filename || "modules-graph.html"
    this.openFile = options.openFile !== undefined ? options.openFile : true
    this.showOnlyProjectFiles = options.showOnlyProjectFiles || false
  }

  apply(compiler) {
    compiler.hooks.done.tapAsync("ModulesGraphPlugin", async (stats, callback) => {
      const outputPath = compiler.options.output.path
      const graphData = graphDataBuilder(stats.compilation, this.showOnlyProjectFiles) // Pass the option to the builder
      const graphHtml = generateGraphHtml(graphData)
      const filePath = path.resolve(outputPath, this.filename)
      const isWatchMode = compiler.watchMode

      fs.writeFile(filePath, graphHtml, (err) => {
        if (err) {
          console.error("Failed to write the modules graph HTML file:", err)
          callback(err)
          return
        }
        if (this.openFile && !isWatchMode) {
          import("open")
            .then((open) => {
              open.default(filePath).then(() => callback())
            })
            .catch((err) => console.error(`Failed to open ${filePath}`, err))
        }
      })
    })
  }
}

module.exports = ModulesGraphPlugin
