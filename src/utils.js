const path = require("path")

function formatModuleName(module) {
  // Check if the module is from node_modules
  if (module.resource && module.resource.includes("node_modules")) {
    // Adjust the regex to capture the path after the package name
    // This regex captures both scoped (@namespace/package) and unscoped (package) names,
    // and it also captures the path after the package name up to a file extension or end of string
    const regex = /node_modules[/\\](@[^/\\]+[/\\][^/\\]+|[^/\\]+)([^?]*)/
    const match = module.resource.match(regex)
    if (match && match[1]) {
      // Construct the formatted name using the package name and the additional path,
      // trimming leading slashes and replacing all forward/backward slashes with a unified format
      let formattedPath = (match[2] || "").replace(/^[/\\]+/, "").replace(/[/\\]+/g, "/")
      return formattedPath ? `${match[1]}/${formattedPath}` : match[1]
    }
  }

  // For non-node_modules resources, return the basename of the module
  if (module.resource) {
    return path.basename(module.resource)
  }

  // Fallback for any other case
  return "Unknown Module"
}

function determineGroup(module) {
  if (module.resource && module.resource.includes("core-js")) {
    return "internal_lib"
  }
  if (module.resource && module.resource.includes("node_modules")) {
    return "node_modules"
  } else if (module.resource && /\.(css|scss|sass|less)$/.test(module.resource)) {
    return "css"
  } else if (module.type && module.type.startsWith("asset")) {
    return "assets"
  }

  return "project"
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / 1048576).toFixed(2) + " MB"
}

module.exports = {formatModuleName, determineGroup, formatSize}
