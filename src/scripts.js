document.addEventListener("DOMContentLoaded", function () {
  const width = document.body.clientWidth
  const height = document.body.clientHeight

  const color = d3.scaleOrdinal(["#377eb8", "#ff7f00", "#4daf4a", "#984ea3", "#e41a1c"])

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
      .on("mouseover", (event, d) => {
        const displaySize = typeof d.displaySize !== 'undefined' ? d.displaySize : d.size;
        const tooltipContent = `Name: ${d.name}<br>Size: ${displaySize}`;
        tooltip.html(tooltipContent)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px")
          .style("visibility", "visible")
          .style("opacity", 1);
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

    const filteredNodes = graph.nodes.filter((d) => d.name.toLowerCase().includes(searchTerm) && (typeTerm === "" || d.group === typeTerm))
    const filteredLinks = graph.links.filter((l) => filteredNodes.some((n) => n.id === l.source.id || n.id === l.target.id))

    updateGraph({nodes: filteredNodes, links: filteredLinks})
  }

  document.getElementById("searchInput").addEventListener("input", filterAndUpdate)
  document.getElementById("typeFilter").addEventListener("change", filterAndUpdate)

  // Assuming 'graph' is your initial data
  updateGraph(graph)
})
