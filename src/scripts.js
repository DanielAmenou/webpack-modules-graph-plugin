// Three.js 3D Force-Directed Graph Visualization
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("graph-container")
  const groups = ["node_modules", "assets", "project", "css", "remote", "polyfills"]

  // Color palette with vibrant modern colors
  const groupColors = {
    node_modules: "#ef4444",
    assets: "#a855f7",
    project: "#3b82f6",
    css: "#22c55e",
    polyfills: "#f97316",
    remote: "#6366f1",
  }

  const currentFilter = {
    searchTerm: "",
    typeTerm: "",
  }

  // Deep clone the original graph for filtering
  const originalGraph = JSON.parse(JSON.stringify(graph))

  // Initialize 3D Force Graph
  const Graph = ForceGraph3D()(container)
    .graphData(graph)
    .nodeId("id")
    .nodeLabel(
      (node) => `
      <div class="node-tooltip">
        <div class="tooltip-name">${node.name}</div>
        <div class="tooltip-group">${node.group}</div>
        <div class="tooltip-size">${node.displaySize}</div>
      </div>
    `,
    )
    .nodeColor((node) => {
      if (node.highlighted) {
        return "#fbbf24"
      }
      return groupColors[node.group] || "#64748b"
    })
    .nodeOpacity(0.9)
    .nodeResolution(16)
    .nodeVal((node) => Math.sqrt(node.size) / 50 + 2)
    .linkColor(() => "rgba(255, 255, 255, 0.15)")
    .linkWidth(0.5)
    .linkOpacity(0.6)
    .backgroundColor("rgba(0,0,0,0)")
    .showNavInfo(false)
    .enableNodeDrag(true)
    .onNodeDragEnd((node) => {
      // Fix node position after drag
      node.fx = node.x
      node.fy = node.y
      node.fz = node.z
    })
    .onNodeClick((node) => {
      highlightConnectedNodes(node)
    })
    .onNodeRightClick((node) => {
      deleteNodeAndDependencies(node.id)
    })
    .onBackgroundClick(() => {
      clearHighlights()
    })

  // Configure camera
  Graph.cameraPosition({x: 0, y: 0, z: 500})

  // Add ambient lighting
  const scene = Graph.scene()
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // Add point light
  const pointLight = new THREE.PointLight(0xffffff, 0.8)
  pointLight.position.set(200, 200, 200)
  scene.add(pointLight)

  // Handle window resize
  window.addEventListener("resize", () => {
    Graph.width(container.clientWidth)
    Graph.height(container.clientHeight)
  })

  // Setup color selectors
  const colorSelectors = document.getElementById("colorSelectors")
  groups.forEach((group) => {
    const groupItem = document.createElement("div")
    groupItem.className = "group-item"

    const colorPreview = document.createElement("div")
    colorPreview.className = "group-color"
    colorPreview.style.backgroundColor = groupColors[group]

    const label = document.createElement("span")
    label.className = "group-label"
    label.textContent = group.charAt(0).toUpperCase() + group.slice(1).replace("_", " ")

    const colorPicker = document.createElement("input")
    colorPicker.type = "color"
    colorPicker.value = groupColors[group]
    colorPicker.style.visibility = "hidden"
    colorPicker.style.position = "absolute"
    colorPicker.style.width = "0"
    colorPicker.style.height = "0"
    colorPreview.addEventListener("click", () => colorPicker.click())

    colorPicker.addEventListener("input", (e) => {
      const newColor = e.target.value
      groupColors[group] = newColor
      colorPreview.style.backgroundColor = newColor
      Graph.nodeColor(Graph.nodeColor()) // Force re-render
    })

    groupItem.appendChild(colorPreview)
    groupItem.appendChild(label)
    groupItem.appendChild(colorPicker)

    colorSelectors.appendChild(groupItem)
  })

  // Highlight connected nodes
  function highlightConnectedNodes(node) {
    const currentData = Graph.graphData()
    const connectedNodeIds = new Set([node.id])

    // Find all connected nodes
    currentData.links.forEach((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target
      if (sourceId === node.id) connectedNodeIds.add(targetId)
      if (targetId === node.id) connectedNodeIds.add(sourceId)
    })

    // Update node highlighting
    currentData.nodes.forEach((n) => {
      n.highlighted = connectedNodeIds.has(n.id)
    })

    Graph.nodeColor(Graph.nodeColor()) // Force re-render

    // Update info panel
    showNodeDetails(node)
  }

  // Clear all highlights
  function clearHighlights() {
    const currentData = Graph.graphData()
    currentData.nodes.forEach((n) => {
      n.highlighted = false
    })
    Graph.nodeColor(Graph.nodeColor())
    hideNodeDetails()
  }

  // Show node details panel
  function showNodeDetails(node) {
    const detailsPanel = document.getElementById("node-details")
    const currentData = Graph.graphData()

    // Count dependencies
    const incomingCount = currentData.links.filter((l) => {
      const targetId = typeof l.target === "object" ? l.target.id : l.target
      return targetId === node.id
    }).length

    const outgoingCount = currentData.links.filter((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : l.source
      return sourceId === node.id
    }).length

    detailsPanel.innerHTML = `
      <div class="details-header">
        <span class="details-color" style="background-color: ${groupColors[node.group]}"></span>
        <span class="details-title">Module Details</span>
      </div>
      <div class="details-content">
        <div class="detail-row">
          <span class="detail-label">Name</span>
          <span class="detail-value">${node.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Type</span>
          <span class="detail-value detail-badge" style="background-color: ${groupColors[node.group]}20; color: ${groupColors[node.group]}">${node.group}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Size</span>
          <span class="detail-value">${node.displaySize}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Dependencies</span>
          <span class="detail-value">${outgoingCount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Dependents</span>
          <span class="detail-value">${incomingCount}</span>
        </div>
      </div>
      <div class="details-actions">
        <button onclick="window.deleteSelectedNode('${node.id}')" class="btn-danger">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          Remove with dependencies
        </button>
      </div>
    `
    detailsPanel.classList.add("visible")
  }

  // Hide node details panel
  function hideNodeDetails() {
    const detailsPanel = document.getElementById("node-details")
    detailsPanel.classList.remove("visible")
  }

  // Delete node and its dependencies
  function deleteNodeAndDependencies(nodeId) {
    const currentData = Graph.graphData()

    function collectDependencies(toBeRemoved, currentNodeId) {
      currentData.links.forEach((link) => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source
        const targetId = typeof link.target === "object" ? link.target.id : link.target
        if (sourceId === currentNodeId && !toBeRemoved.has(targetId)) {
          toBeRemoved.add(targetId)
          collectDependencies(toBeRemoved, targetId)
        }
      })
    }

    const toBeRemoved = new Set([nodeId])
    collectDependencies(toBeRemoved, nodeId)

    const remainingNodes = currentData.nodes.filter((node) => !toBeRemoved.has(node.id))
    const remainingLinks = currentData.links.filter((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target
      return !toBeRemoved.has(sourceId) && !toBeRemoved.has(targetId)
    })

    Graph.graphData({nodes: remainingNodes, links: remainingLinks})
    updateModuleInfo(remainingNodes)
    hideNodeDetails()
  }

  // Expose to window for button click
  window.deleteSelectedNode = deleteNodeAndDependencies

  // Filter graph
  function filterGraph() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    const typeTerm = document.getElementById("typeFilter").value

    currentFilter.searchTerm = searchTerm
    currentFilter.typeTerm = typeTerm

    const filteredNodes = originalGraph.nodes.filter((node) => node.name.toLowerCase().includes(searchTerm) && (typeTerm === "" || node.group === typeTerm))

    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))

    const filteredLinks = originalGraph.links.filter((link) => filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target))

    Graph.graphData({nodes: filteredNodes, links: filteredLinks})
    updateModuleInfo(filteredNodes)
  }

  // Reset filters
  function resetFilters() {
    document.getElementById("searchInput").value = ""
    document.getElementById("typeFilter").value = ""
    currentFilter.searchTerm = ""
    currentFilter.typeTerm = ""
    Graph.graphData(JSON.parse(JSON.stringify(originalGraph)))
    updateModuleInfo(originalGraph.nodes)
  }

  // Expose reset function
  window.resetFilters = resetFilters

  // Update modules info
  function updateModuleInfo(nodes) {
    const totalCount = nodes.length
    const totalSize = nodes.reduce((acc, node) => acc + (node.size || 0), 0)
    const countElement = document.getElementById("modules-count")
    const sizeElement = document.getElementById("modules-size")

    countElement.textContent = totalCount.toLocaleString()
    sizeElement.textContent = formatBytes(totalSize)

    // Update group stats
    updateGroupStats(nodes)
  }

  // Update group statistics
  function updateGroupStats(nodes) {
    const stats = {}
    groups.forEach((g) => (stats[g] = {count: 0, size: 0}))

    nodes.forEach((node) => {
      if (stats[node.group]) {
        stats[node.group].count++
        stats[node.group].size += node.size || 0
      }
    })

    const statsContainer = document.getElementById("group-stats")
    statsContainer.innerHTML = groups
      .map(
        (group) => `
        <div class="stat-item">
          <span class="stat-color" style="background-color: ${groupColors[group]}"></span>
          <span class="stat-label">${group.charAt(0).toUpperCase() + group.slice(1).replace("_", " ")}</span>
          <span class="stat-value">${stats[group].count}</span>
        </div>
      `,
      )
      .join("")
  }

  // Format bytes
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 B"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  // Camera controls
  window.focusGraph = () => {
    Graph.zoomToFit(1000, 50)
  }

  window.resetCamera = () => {
    Graph.cameraPosition({x: 0, y: 0, z: 500}, {x: 0, y: 0, z: 0}, 1000)
  }

  // Toggle panel visibility
  window.togglePanel = (panelId) => {
    const panel = document.getElementById(panelId)
    panel.classList.toggle("collapsed")
  }

  // Event listeners
  document.getElementById("searchInput").addEventListener("input", filterGraph)
  document.getElementById("typeFilter").addEventListener("change", filterGraph)

  // Initial render
  updateModuleInfo(graph.nodes)

  // Auto zoom to fit after initial render
  setTimeout(() => {
    Graph.zoomToFit(1000, 100)
  }, 500)
})
