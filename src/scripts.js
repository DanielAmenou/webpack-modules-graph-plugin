document.addEventListener("DOMContentLoaded", function () {
  const width = document.body.clientWidth
  const height = document.body.clientHeight
  const groups = ["node_modules", "assets", "project", "css", "remote", "polyfills"]

  const currentFilter = {
    searchTerm: "",
    typeTerm: "",
  }

  // Setting up the color selectors
  groups.forEach((group) => {
    const groupItem = document.createElement("div")
    groupItem.className = "group-item"

    const colorPreview = document.createElement("div")
    colorPreview.className = "group-color"
    colorPreview.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--color-${group}`)

    const label = document.createElement("span")
    label.textContent = group.charAt(0).toUpperCase() + group.slice(1).replace("_", " ")

    const colorPicker = document.createElement("input")
    colorPicker.type = "color"
    colorPicker.value = rgbToHex(colorPreview.style.backgroundColor)
    colorPicker.style.visibility = "hidden"
    colorPicker.style.width = "0"
    colorPicker.style.height = "0"
    colorPreview.addEventListener("click", () => colorPicker.click())

    colorPicker.addEventListener("input", (e) => {
      const newColor = e.target.value
      document.documentElement.style.setProperty(`--color-${group}`, newColor)
      colorPreview.style.backgroundColor = newColor
      updateNodeColors(group, newColor) // Function to update node colors in the graph
    })

    groupItem.appendChild(colorPreview)
    groupItem.appendChild(label)
    groupItem.appendChild(colorPicker)

    colorSelectors.appendChild(groupItem)
  })

  function updateNodeColors(group, color) {
    node.each(function (d) {
      if (d.group === group) {
        d3.select(this).style("fill", color)
      }
    })
  }

  const color = d3
    .scaleOrdinal()
    .domain(groups)
    .range(groups.map((group) => getComputedStyle(document.documentElement).getPropertyValue(`--color-${group}`).trim()))

  // Setting up the SVG with zoom functionality
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(
      d3.zoom().on("zoom", (event) => {
        graphGroup.attr("transform", event.transform)
      })
    )
    .append("g")

  const graphGroup = svg.append("g") // This group will contain all the elements that are subject to zoom.

  // Tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "#fff")
    .style("border", "1px solid #ddd")
    .style("padding", "10px")
    .style("border-radius", "5px")

  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))

  let link = graphGroup.append("g").attr("class", "links").selectAll("line")

  let node = graphGroup.append("g").attr("class", "nodes").selectAll("circle")

  function filterGraphBasedOnCurrentCriteria(graph, filter) {
    const filteredNodes = graph.nodes.filter((node) => node.name.toLowerCase().includes(filter.searchTerm) && (filter.typeTerm === "" || node.group === filter.typeTerm))
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))
    const filteredLinks = graph.links.filter((link) => filteredNodeIds.has(link.source.id) && filteredNodeIds.has(link.target.id))
    return {nodes: filteredNodes, links: filteredLinks}
  }

  function deleteNodeAndDependencies(nodeId) {
    function collectDependencies(toBeRemoved, currentNodeId) {
      graph.links.forEach((link) => {
        if (link.source.id === currentNodeId && !toBeRemoved.has(link.target.id)) {
          toBeRemoved.add(link.target.id)
          collectDependencies(toBeRemoved, link.target.id)
        }
      })
    }

    const toBeRemoved = new Set([nodeId])
    collectDependencies(toBeRemoved, nodeId)

    const remainingNodes = graph.nodes.filter((node) => !toBeRemoved.has(node.id))
    const remainingLinks = graph.links.filter((link) => !toBeRemoved.has(link.source.id) && !toBeRemoved.has(link.target.id))

    const newGraph = {nodes: remainingNodes, links: remainingLinks}

    graph = newGraph
    const filteredGraph = filterGraphBasedOnCurrentCriteria(graph, currentFilter)
    updateGraph(filteredGraph)

    simulation.nodes(remainingNodes)
    simulation.force("link").links(remainingLinks)
    simulation.alpha(1).restart()
    displayModuleInfo(aggregateModulesData(remainingNodes))
  }

  function updateGraph(filteredGraph) {
    link = link.data(filteredGraph.links, (d) => d.source.id + "-" + d.target.id)
    link.exit().remove()
    link = link.enter().append("line").merge(link).attr("stroke-width", 1.5).attr("stroke", "#999")

    node = node.data(filteredGraph.nodes, (d) => d.id)
    node.exit().remove()
    node = node
      .enter()
      .append("circle")
      .merge(node)
      .attr("r", (d) => Math.sqrt(d.size) / 10 + 5)
      .attr("fill", (d) => color(d.group))
      .attr("stroke", "#fff")
      .on("dblclick", (event, d) => {
        event.preventDefault()
        event.stopPropagation()
        deleteNodeAndDependencies(d.id)
      })
      .on("mouseover", (event, d) => {
        const displaySize = typeof d.displaySize !== "undefined" ? d.displaySize : d.size
        const tooltipContent = `Name: ${d.name}<br>Size: ${displaySize}`
        tooltip
          .html(tooltipContent)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("visibility", "visible")
          .style("opacity", 1)
      })

      .on("mouseout", () => tooltip.style("visibility", "hidden"))
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))

    simulation.nodes(filteredGraph.nodes).on("tick", ticked)
    simulation.force("link").links(filteredGraph.links)
    simulation.alpha(1).restart()
  }

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)
  }

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = event.x // Keep the node at the dropped position
    event.subject.fy = event.y
  }

  function filterAndUpdate() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    const typeTerm = document.getElementById("typeFilter").value
    currentFilter.searchTerm = searchTerm
    currentFilter.typeTerm = typeTerm

    const filteredNodes = graph.nodes.filter((node) => node.name.toLowerCase().includes(searchTerm) && (typeTerm === "" || node.group === typeTerm))
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id))
    const filteredLinks = graph.links.filter((link) => filteredNodeIds.has(link.source.id) && filteredNodeIds.has(link.target.id))

    const newGraph = {nodes: filteredNodes, links: filteredLinks}
    updateGraph(newGraph)
    displayModuleInfo(aggregateModulesData(newGraph.nodes))
  }

  function aggregateModulesData(nodes) {
    return nodes.reduce(
      (acc, node) => {
        acc.totalCount += 1
        acc.totalSize += node.size || 0
        return acc
      },
      {totalCount: 0, totalSize: 0}
    )
  }

  function displayModuleInfo({totalCount, totalSize}) {
    const countElement = document.getElementById("modules-info")
    countElement.textContent = `${totalCount} modules, Total size: ${formatBytes(totalSize)}`
  }

  document.getElementById("searchInput").addEventListener("input", filterAndUpdate)
  document.getElementById("typeFilter").addEventListener("change", filterAndUpdate)

  updateGraph(graph)
  displayModuleInfo(aggregateModulesData(graph.nodes))
})

function rgbToHex(rgb) {
  let [r, g, b] = rgb.match(/\d+/g)
  return "#" + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
