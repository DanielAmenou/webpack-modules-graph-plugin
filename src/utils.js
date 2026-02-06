const path = require("path")

function formatModuleName(module) {
  const identifier = module.identifier ? module.identifier() : ""

  // Remote module name
  if (identifier.startsWith("remote")) {
    const remoteModuleRegex = /webpack\/container\/reference\/([^ ]+) (.+)/
    const remoteMatch = identifier.match(remoteModuleRegex)
    if (remoteMatch && remoteMatch.length > 2) {
      return `${remoteMatch[1]} - ${remoteMatch[2]}`
    }
    return "remote-module"
  }

  // Container entry
  if (identifier.includes("container entry")) {
    return "Container Entry"
  }

  // Node_module name
  if (module.resource && module.resource.includes("node_modules")) {
    const regex = /node_modules[/\\](@[^/\\]+[/\\][^/\\]+|[^/\\]+)([^?]*)/
    const match = module.resource.match(regex)
    if (match && match[1]) {
      let formattedPath = (match[2] || "").replace(/^[/\\]+/, "").replace(/[/\\]+/g, "/")
      return formattedPath ? `${match[1]}/${formattedPath}` : match[1]
    }
  }

  // Project file
  if (module.resource) {
    return path.basename(module.resource)
  }

  // Asset modules
  if (module.type && module.type.startsWith("asset")) {
    if (module.rawRequest) {
      return path.basename(module.rawRequest)
    }
    return module.type
  }

  // CSS modules
  if (module.type && (module.type.includes("css") || module.type.includes("style"))) {
    if (module.rawRequest) {
      return path.basename(module.rawRequest)
    }
    return module.type
  }

  // Type-based fallback
  if (module.type) {
    return module.type
  }

  // Last resort: use identifier
  if (identifier) {
    // Try to extract something meaningful from the identifier
    const parts = identifier.split(/[/\\|]/)
    const lastPart = parts.filter((p) => p && !p.includes("=")).pop()
    if (lastPart) {
      return lastPart.substring(0, 50)
    }
  }

  return "Unknown Module"
}

function determineGroup(module) {
  const polyfillLibs = ["core-js", "babel-polyfill", "whatwg-fetch", "regenerator-runtime", "promise-polyfill"]
  const isPolyfill = polyfillLibs.some((lib) => module.resource && module.resource.includes(lib))

  if (isPolyfill) {
    return "polyfills"
  }

  // Check for remote modules
  const identifier = module.identifier ? module.identifier() : ""
  if (identifier.startsWith("remote") || (module.type && module.type === "remote-module")) {
    return "remote"
  }

  // Check for container entry
  if (identifier.includes("container entry")) {
    return "remote"
  }

  // Check for node_modules
  if (module.resource && module.resource.includes("node_modules")) {
    return "node_modules"
  }

  // Check for CSS/styles
  if (module.resource && /\.(css|scss|sass|less|styl)(\?.*)?$/.test(module.resource)) {
    return "css"
  }
  if (module.type && (module.type.includes("css") || module.type.includes("style"))) {
    return "css"
  }

  // Check for assets
  if (module.type && module.type.startsWith("asset")) {
    return "assets"
  }
  if (module.resource && /\.(png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf|pdf)(\?.*)?$/i.test(module.resource)) {
    return "assets"
  }

  return "project"
}

function formatSize(bytes) {
  if (typeof bytes !== "number" || isNaN(bytes) || bytes < 0) {
    return "0 B"
  }
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / 1048576).toFixed(2) + " MB"
}

/**
 * Get a unique, stable ID for a module
 * This ensures consistent identification across the graph
 */
function getModuleId(module) {
  if (!module) {
    return null
  }

  // Try to get the identifier first
  if (typeof module.identifier === "function") {
    const id = module.identifier()
    if (id) {
      return normalizePath(id)
    }
  }

  // Fall back to resource path
  if (module.resource) {
    return normalizePath(module.resource)
  }

  // Use request as last resort
  if (module.request) {
    return normalizePath(module.request)
  }

  return null
}

/**
 * Normalize a path/identifier for consistent comparison
 */
const normalizePath = (pathStr) => {
  if (!pathStr || typeof pathStr !== "string") {
    return ""
  }

  return (
    pathStr
      // Remove webpack loader prefixes
      .replace(/^.*!/, "")
      // Normalize node_modules paths
      .replace(/.*node_modules\//, "node_modules/")
      // Remove query strings
      .replace(/\?.*$/, "")
      // Normalize path separators
      .replace(/\\/g, "/")
      // Remove leading ./
      .replace(/^\.\//, "")
      // Collapse multiple slashes
      .replace(/\/+/g, "/")
  )
}

module.exports = {formatModuleName, determineGroup, formatSize, normalizePath, getModuleId}
