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
    <!-- Three.js and 3D Force Graph -->
    <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
    <script src="https://unpkg.com/3d-force-graph@1.73.0/dist/3d-force-graph.min.js"></script>
    <style>${styles}</style>
</head>
<body>
    <!-- Header -->
    <header class="header glass-panel">
      <div class="header-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
          <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
        </svg>
      </div>
      <h1>Webpack Modules Graph</h1>
    </header>

    <!-- Side Panel -->
    <aside id="side-panel" class="side-panel glass-panel">
      <div class="panel-header">
        <span class="panel-title">Filters</span>
      </div>

      <!-- Search -->
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" id="searchInput" placeholder="Search modules...">
      </div>

      <!-- Type Filter -->
      <select id="typeFilter">
        <option value="">All Modules</option>
        <option value="remote">Remote Modules</option>
        <option value="project">Project Modules</option>
        <option value="node_modules">Libraries (node_modules)</option>
        <option value="assets">Assets</option>
        <option value="css">CSS / Styles</option>
        <option value="polyfills">Polyfills</option>
      </select>

      <!-- Filter Actions -->
      <div class="filter-actions">
        <button class="btn btn-secondary" onclick="window.resetFilters()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset
        </button>
        <button class="btn btn-primary" onclick="window.focusGraph()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
          Fit View
        </button>
      </div>

      <div class="section-divider"></div>

      <!-- Color Customization -->
      <div class="panel-header">
        <span class="panel-title">Module Types</span>
      </div>
      <div id="colorSelectors"></div>

      <!-- Help -->
      <div class="help-text">
        <strong>Tips:</strong><br>
        • Click a node to see details<br>
        • Right-click to remove with dependencies<br>
        • Scroll to zoom, drag to rotate<br>
        • Drag nodes to reposition
      </div>
    </aside>

    <!-- Node Details Panel -->
    <aside id="node-details" class="glass-panel"></aside>

    <!-- Stats Panel -->
    <div class="stats-panel glass-panel">
      <div class="stat-box">
        <div class="stat-value" id="modules-count">0</div>
        <div class="stat-label">Modules</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" id="modules-size">0 B</div>
        <div class="stat-label">Total Size</div>
      </div>
    </div>

    <!-- Camera Controls -->
    <div class="camera-controls">
      <button class="camera-btn" onclick="window.resetCamera()" title="Reset Camera">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
      <button class="camera-btn" onclick="window.focusGraph()" title="Fit to View">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
        </svg>
      </button>
    </div>

    <!-- Graph Container -->
    <div id="graph-container"></div>

    <!-- Graph Data -->
    <script>let graph = ${graphDataStr};</script>
    
    <!-- Main Script -->
    <script>
      ${scripts}
    </script>
</body>
</html>
  `
}

module.exports = generateGraphHtml
