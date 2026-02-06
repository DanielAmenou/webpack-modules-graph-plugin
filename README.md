# Webpack Modules Graph Plugin

A powerful Webpack plugin that generates an interactive **3D visualization** of your project's module dependency graph using Three.js. Explore your bundle in an immersive 3D space!

## ✨ Features

- **3D Interactive Graph** - Navigate your module graph in 3D space with zoom, pan, and rotate
- **Beautiful Modern UI** - Glassmorphism design with dark theme
- **Module Categories** - Visual distinction between project files, node_modules, assets, CSS, remote modules, and polyfills
- **Real-time Filtering** - Search and filter modules by name or type
- **Color Customization** - Customize colors for each module category
- **Module Details** - Click any node to see detailed information
- **Dependency Removal** - Right-click to remove a module and its dependencies
- **Animated Links** - Particle animation shows dependency flow direction
- **Responsive Design** - Works on desktop and mobile

## 🚀 Installation

```bash
npm install --save-dev webpack-modules-graph-plugin
```

or

```bash
yarn add --dev webpack-modules-graph-plugin
```

## 📦 Usage

```javascript
const ModulesGraphPlugin = require("webpack-modules-graph-plugin")

module.exports = {
  plugins: [
    new ModulesGraphPlugin({
      filename: "modules-graph.html", // Output file name (default: modules-graph.html)
      openFile: true, // Auto-open in browser after build (default: true)
      showOnlyProjectFiles: false, // Hide node_modules (default: false)
    }),
  ],
}
```

### Options

| Option                 | Type    | Default                | Description                                |
| ---------------------- | ------- | ---------------------- | ------------------------------------------ |
| `filename`             | string  | `"modules-graph.html"` | Name of the output HTML file               |
| `openFile`             | boolean | `true`                 | Auto-open the graph in browser after build |
| `showOnlyProjectFiles` | boolean | `false`                | Show only project files, hide node_modules |

## 🎮 Controls

- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Pan**: Right-click and drag
- **Select Node**: Left-click on a node
- **Remove Node + Dependencies**: Right-click on a node
- **Reset View**: Use the camera controls in bottom-right

## 🎨 Module Types

| Type                | Description                           |
| ------------------- | ------------------------------------- |
| 🔵 **Project**      | Your source files                     |
| 🔴 **node_modules** | Third-party dependencies              |
| 🟣 **Assets**       | Images, fonts, and other static files |
| 🟢 **CSS**          | Stylesheets (CSS, SCSS, SASS, Less)   |
| 🟠 **Polyfills**    | Browser polyfills                     |
| 🟣 **Remote**       | Module Federation remote modules      |

## 📸 Example

![3D Module Graph](/assets/graph-1.png "3D Graph Example")
![Large Project Graph](/assets/graph-2.png "Large Graph Example")

## 🛠️ Technology Stack

- **Three.js** - 3D rendering
- **3d-force-graph** - Force-directed graph layout
- **Modern CSS** - Glassmorphism, CSS variables, animations

## 📄 License

MIT
