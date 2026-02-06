const {formatModuleName, normalizePath, determineGroup, formatSize, getModuleId} = require("./utils")

function graphDataBuilder(compilation, showOnlyProjectFiles = false) {
  const moduleGraph = compilation.moduleGraph
  const nodes = []
  const links = []
  const nodeIds = new Set()
  const processedLinks = new Set()

  // First pass: collect all valid modules and create nodes
  compilation.modules.forEach((module) => {
    const group = determineGroup(module)

    // Filter out node_modules if showOnlyProjectFiles is true
    if (showOnlyProjectFiles && group === "node_modules") {
      return
    }

    const moduleId = getModuleId(module)

    // Skip if we've already processed this module
    if (nodeIds.has(moduleId)) {
      return
    }

    // Skip modules without valid identifiers
    if (!moduleId || moduleId === "undefined" || moduleId === "null") {
      return
    }

    nodeIds.add(moduleId)

    const size = typeof module.size === "function" ? module.size() : module.size || 0

    nodes.push({
      id: moduleId,
      name: formatModuleName(module),
      group: group,
      size: size,
      displaySize: formatSize(size),
    })
  })

  // Second pass: create links only between existing nodes
  compilation.modules.forEach((module) => {
    const sourceGroup = determineGroup(module)

    // Skip node_modules if filtering
    if (showOnlyProjectFiles && sourceGroup === "node_modules") {
      return
    }

    const sourceId = getModuleId(module)

    // Skip if source node doesn't exist
    if (!nodeIds.has(sourceId)) {
      return
    }

    // Process outgoing connections (dependencies)
    if (module.dependencies) {
      module.dependencies.forEach((dependency) => {
        try {
          const depModule = moduleGraph.getModule(dependency)

          if (!depModule) {
            return
          }

          const targetGroup = determineGroup(depModule)

          // Skip node_modules if filtering
          if (showOnlyProjectFiles && targetGroup === "node_modules") {
            return
          }

          const targetId = getModuleId(depModule)

          // Skip if target node doesn't exist or is invalid
          if (!nodeIds.has(targetId) || !targetId || targetId === sourceId) {
            return
          }

          // Create a unique key for this link to avoid duplicates
          const linkKey = `${sourceId}|||${targetId}`

          if (!processedLinks.has(linkKey)) {
            processedLinks.add(linkKey)
            links.push({
              source: sourceId,
              target: targetId,
            })
          }
        } catch (e) {
          // Skip dependencies that can't be resolved
        }
      })
    }

    // Process blocks (async imports, dynamic imports)
    if (module.blocks) {
      module.blocks.forEach((block) => {
        if (block.dependencies) {
          block.dependencies.forEach((dependency) => {
            try {
              const depModule = moduleGraph.getModule(dependency)

              if (!depModule) {
                return
              }

              const targetGroup = determineGroup(depModule)

              if (showOnlyProjectFiles && targetGroup === "node_modules") {
                return
              }

              const targetId = getModuleId(depModule)

              if (!nodeIds.has(targetId) || !targetId || targetId === sourceId) {
                return
              }

              const linkKey = `${sourceId}|||${targetId}`

              if (!processedLinks.has(linkKey)) {
                processedLinks.add(linkKey)
                links.push({
                  source: sourceId,
                  target: targetId,
                })
              }
            } catch (e) {
              // Skip dependencies that can't be resolved
            }
          })
        }
      })
    }
  })

  // Log stats for debugging
  console.log(`[ModulesGraphPlugin] Generated graph with ${nodes.length} nodes and ${links.length} links`)

  return {nodes, links}
}

module.exports = {graphDataBuilder}
