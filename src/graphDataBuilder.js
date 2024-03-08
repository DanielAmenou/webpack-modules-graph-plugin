const {formatModuleName, determineGroup, formatSize} = require("./utils")

function graphDataBuilder(compilation, showOnlyProjectFiles = false) {
  const moduleGraph = compilation.moduleGraph
  const nodes = []
  const links = []

  compilation.modules.forEach((module) => {
    // Filter out node_modules if showOnlyProjectFiles is true
    if (!showOnlyProjectFiles || (showOnlyProjectFiles && determineGroup(module) !== 'node_modules')) {
      nodes.push({
        id: module.identifier(),
        name: formatModuleName(module),
        group: determineGroup(module),
        size: module.size(),
        displaySize: formatSize(module.size()),
      })

      module.dependencies.forEach((dependency) => {
        const depModule = moduleGraph.getModule(dependency)
        if (depModule && (!showOnlyProjectFiles || (showOnlyProjectFiles && determineGroup(depModule) !== 'node_modules'))) {
          links.push({source: module.identifier(), target: depModule.identifier()})
        }
      })
    }
  })

  return {nodes, links}
}

module.exports = {graphDataBuilder}
