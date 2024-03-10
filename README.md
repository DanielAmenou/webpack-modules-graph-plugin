# Webpack Modules Graph Plugin

This Webpack plugin generates a visual graph representing the modules in your project, including dependencies, to help you visualize and understand your project's structure better.

## Features

- Generates an interactive graph of your Webpack modules.
- Offers customizable options to include/exclude specific modules.
- Provides a clear visual distinction between different types of modules (e.g., project files, node_modules, assets).
- Supports color customization for module groups through a user interface.
- Offers a search feature to find specific modules in the graph.

## Installation

`npm i --save-dev webpack-modules-graph-plugin`

`yarn add --dev webpack-modules-graph-plugin`

## Usage

```javascript
const ModulesGraphPlugin = require("webpack-modules-graph-plugin")

module.exports = {
  plugins: [
    new ModulesGraphPlugin({
      // Options here
      openFile: true, // Open the generated file in the browser
      filename: "modules-graph.html", // Output file
      showOnlyProjectFiles: false, // Customize according to your needs
    }),
  ],
}
```

### Options

filename: Name of the output HTML file containing the graph.
showOnlyProjectFiles: Boolean to show only project files, excluding node_modules.

## Example

![example of the UI interface](/assets/graph-1.png "Graph Example")
![example of a large graph](/assets/graph-2.png "Large Graph Example")
