const path = require("path")

function formatModuleName(module) {
  const identifier = module.identifier()
  // remote module name
  if (identifier.startsWith("remote")) {
    const remoteModuleRegex = /webpack\/container\/reference\/([^ ]+) (.+)/
    const remoteMatch = identifier.match(remoteModuleRegex)
    if (remoteMatch && remoteMatch.length > 2) {
      return `${remoteMatch[1]} - ${remoteMatch[2]}`
    }
    return "remote-module"
  }

  // node_module name
  if (module.resource && module.resource.includes("node_modules")) {
    const regex = /node_modules[/\\](@[^/\\]+[/\\][^/\\]+|[^/\\]+)([^?]*)/
    const match = module.resource.match(regex)
    if (match && match[1]) {
      let formattedPath = (match[2] || "").replace(/^[/\\]+/, "").replace(/[/\\]+/g, "/")
      return formattedPath ? `${match[1]}/${formattedPath}` : match[1]
    }
  }

  if (module.resource) {
    return path.basename(module.resource)
  }

  if (module.type) {
    return module.type
  }

  return "Unknown Module"
}

function determineGroup(module) {
  const polyfillLibs = ["core-js", "babel-polyfill", "whatwg-fetch", "regenerator-runtime", "promise-polyfill"]
  const isPolyfill = polyfillLibs.some((lib) => module.resource && module.resource.includes(lib))
  if (isPolyfill) {
    return "polyfills"
  }
  if (module.type && module.type === "remote-module") {
    return "remote"
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

const normalizePath = (path) => {
  return path.replace(/.*node_modules\//, "").replace(/\?.*/, "")
}

module.exports = {formatModuleName, determineGroup, formatSize, normalizePath}
