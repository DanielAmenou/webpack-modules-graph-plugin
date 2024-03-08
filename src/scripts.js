const width = document.body.clientWidth
const height = document.body.clientHeight

const color = d3.scaleOrdinal().domain(["node_modules", "assets", "project", "css", "internal_lib"]).range(["#377eb8", "#ff7f00", "#4daf4a", "#984ea3", "#e41a1c"])

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)

const simulation = d3
  .forceSimulation(graph.nodes)
  .force(
    "link",
    d3.forceLink(graph.links).id((d) => d.id)
  )
  .force("charge", d3.forceManyBody().strength(-40))
  .force("center", d3.forceCenter(width / 2, height / 2))

const svg = d3.select("body").append("svg").attr("viewBox", [0, 0, width, height]).style("font", "12px sans-serif")

const link = svg.append("g").attr("stroke-width", 1.5).selectAll("line").data(graph.links).join("line").attr("stroke", "#999").attr("stroke-opacity", 0.6)

const node = svg
  .append("g")
  .attr("stroke", "#fff")
  .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(graph.nodes)
  .join("circle")
  .attr("r", (d) => Math.sqrt(d.size) / 10 + 5) // Update node size based on module size
  .attr("fill", (d) => color(d.group))
  .call(drag(simulation))

simulation.on("tick", () => {
  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)

  node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)
})

// Correctly setting up the drag behavior
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    // Do not reset fx and fy to null here to keep the node in the new position
    // event.subject.fx = null;
    // event.subject.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

// Show tooltip on mouseover
node.on("mouseover", function(event, d) {
  tooltip.transition()
    .duration(200)
    .style("opacity", .9)
  tooltip.html(`${d.name} (${d.displaySize})`)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px")
})

// Hide tooltip on mouseout
node.on("mouseout", function() {
  tooltip.transition()
    .duration(500)
    .style("opacity", 0)
})

node.call(drag(simulation))

svg.call(
  d3.zoom().on("zoom", (event) => {
    const {transform} = event
    svg.selectAll("g").attr("transform", transform)
  })
)
