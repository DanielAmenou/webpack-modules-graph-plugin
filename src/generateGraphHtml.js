const fs = require("fs")
const path = require("path")

const styles = fs.readFileSync(path.join(__dirname, "./styles.css"), "utf8")
const scripts = fs.readFileSync(path.join(__dirname, "./scripts.js"), "utf8")

function generateGraphHtml(graphData) {
  const graphDataStr = JSON.stringify(graphData).replace(/<\/script>/g, "<\\/script>")
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
    <script>const graph = ${graphDataStr};</script>
    <script>
     ${scripts}
    </script>
</body>
</html>
  `
}

module.exports = generateGraphHtml
