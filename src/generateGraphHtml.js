const fs = require("fs")
const path = require("path")

const styles = fs.readFileSync(path.join(__dirname, "./styles.css"), "utf8")
const scripts = fs.readFileSync(path.join(__dirname, "./scripts.js"), "utf8")

function generateGraphHtml(graphData) {
  const graphDataStr = JSON.stringify(graphData)
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpack Modules Graph</title>
    <script src="https://d3js.org/d3.v6.min.js"></script>
    <style>${styles}</style>
</head>
<body>
    <div id="filters">
        <input type="text" id="searchInput" placeholder="Search...">
        <select id="typeFilter">
            <option value="">Filter by Type</option>
            <option value="project">Project</option>
            <option value="node_modules">Node Modules</option>
            <option value="assets">Assets</option>
            <option value="css">CSS</option>
            <option value="internal_lib">Internal Libraries</option>
        </select>
    </div>
    <script>const graph = ${graphDataStr};</script>
    <script>
     ${scripts}
    </script>
</body>
</html>
  `
}

module.exports = generateGraphHtml
