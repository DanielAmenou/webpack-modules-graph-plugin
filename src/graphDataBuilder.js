const {formatModuleName} = require("./utils")

function graphDataBuilder(compilation) {
  const moduleGraph = compilation.moduleGraph
  const nodes = []
  const links = []

  compilation.modules.forEach((module) => {
    nodes.push({
      id: module.identifier(),
      name: formatModuleName(module),
      group: determineGroup(module),
      size: module.size(),
    })

    module.dependencies.forEach((dependency) => {
      const depModule = moduleGraph.getModule(dependency)
      if (depModule) {
        links.push({source: module.identifier(), target: depModule.identifier()})
      }
    })
  })

  return {nodes, links}
}

function determineGroup(module) {
  if (module.resource && module.resource.includes("node_modules")) {
    return "node_modules"
  } else if (module.type && module.type.startsWith("asset")) {
    return "assets"
  }
  return "project"
}

module.exports = {graphDataBuilder}
