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
    <div class="dashboard">
      <div id="filters">
      <input type="text" id="searchInput" placeholder="Search...">
      <select id="typeFilter">
        <option value="">All Modules</option>
        <option value="remote">Remote Modules</option>
        <option value="project">Project Modules</option>
        <option value="node_modules">Libraries Modules</option>
        <option value="assets">Assets</option>
        <option value="css">CSS</option>
        <option value="polyfills">Polyfills</option>
      </select>
      </div>
      <div id="colorCustomization">
        <div id="colorSelectors"></div>
      </div>
    </div>

    <script>let graph = ${graphDataStr};</script>
    <script>
     ${scripts}
    </script>
    <div id="modules-info"></div>
</body>
</html>
  `
}

module.exports = generateGraphHtml
