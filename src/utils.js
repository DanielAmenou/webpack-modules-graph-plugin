const path = require("path")

function formatModuleName(module) {
  // Check if the module is from node_modules
  if (module.resource && module.resource.includes("node_modules")) {
    // This regex matches both scoped and unscoped package names
    const regex = /node_modules[/\\](@[^/\\]+[/\\][^/\\]+|[^/\\]+)/
    const match = module.resource.match(regex)
    if (match && match[1]) {
      // Return the matched package name
      return match[1]
    }
  }

  // For non-node_modules resources, return the basename of the module
  if (module.resource) {
    return path.basename(module.resource)
  }

  // Fallback for any other case
  return "Unknown Module"
}

module.exports = {formatModuleName}
