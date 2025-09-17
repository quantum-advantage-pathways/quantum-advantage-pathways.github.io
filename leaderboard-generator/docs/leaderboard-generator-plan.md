# Leaderboard Generator Script Design

This document outlines the design and implementation plan for a script that automates the creation of new leaderboards on the Quantum Advantage Pathways website.

## Table of Contents

1. [Overview](#overview)
2. [Existing Leaderboard Analysis](#existing-leaderboard-analysis)
3. [Required Inputs](#required-inputs)
4. [Data Schema](#data-schema)
5. [Script Architecture](#script-architecture)
6. [File Generation Process](#file-generation-process)
7. [Navigation Update Strategy](#navigation-update-strategy)
8. [Implementation Plan](#implementation-plan)
9. [Testing Strategy](#testing-strategy)
10. [Potential Challenges](#potential-challenges)

## Overview

The Quantum Advantage Pathways website currently features a "Peak Circuits" leaderboard that showcases competition results. This script will automate the process of creating additional leaderboards for different quantum computing contests while maintaining consistency across the site.

## Existing Leaderboard Analysis

The current leaderboard implementation consists of:

1. **Directory structure**: A dedicated folder under `/leaderboard/`
2. **HTML template**: An `index.html` file with specific sections:
   - Navigation bar
   - Hero section with title and description
   - Statistics dashboard
   - Data visualization (chart)
   - Leaderboard table with custom columns
   - Explanatory content
3. **Data source**: JSON structure in `leaderboard_data.json`
4. **JavaScript functionality**: For loading data and rendering visualizations
5. **Navigation links**: References in all site pages

## Required Inputs

To create a new leaderboard, the following inputs are required:

### Basic Information
- Leaderboard ID/slug (for URL and directory naming)
- Leaderboard title
- Short description
- Longer explanation text

### Data Structure
- Column definitions (name, data type, display format)
- Sorting criteria
- Special formatting rules (e.g., color coding for scores)
- Statistics to display

### Visualization Configuration
- Chart type (current implementation uses an SVG scatter plot)
- X and Y axis definitions
- Data point representation
- Legend items

### Navigation
- Position in site navigation
- Related content pages

## Data Schema

The leaderboard data will follow this schema:

```javascript
{
  // Top-level contains all leaderboards
  "stats": { /* Global statistics */ },
  "leaderboard": [ /* Original leaderboard data */ ],
  
  // New leaderboard data structure
  "quantum_chemistry": {  // Using the leaderboard ID as the key
    "metadata": {
      "title": "Quantum Chemistry Simulations",
      "description": "Benchmarking molecular simulation accuracy",
      "created": "2025-09-12",
      "lastUpdated": "2025-09-12"
    },
    
    "stats": {
      "totalSimulations": 42,
      "institutions": 8,
      "bestAccuracy": "99.8%",
      "largestMolecule": "C20H25N3O"
    },
    
    "columns": [
      {
        "id": "rank",
        "name": "Rank",
        "type": "number",
        "width": "60px",
        "className": "rank-column",
        "sortable": true,
        "defaultSort": true,
        "sortDirection": "asc"
      },
      {
        "id": "molecule",
        "name": "Molecule",
        "type": "text",
        "width": "120px",
        "className": "molecule-column",
        "sortable": true
      },
      {
        "id": "accuracy",
        "name": "Accuracy",
        "type": "percentage",
        "width": "100px",
        "className": "accuracy-column",
        "sortable": true,
        "formatting": {
          "thresholds": [
            {"value": 99, "class": "score-100"},
            {"value": 95, "class": "score-high"},
            {"value": 90, "class": "score-medium"},
            {"value": 0, "class": "score-low"}
          ]
        }
      }
      // More column definitions...
    ],
    
    "entries": [
      {
        "rank": 1,
        "molecule": "H2O",
        "accuracy": 99.8,
        "time": 120,
        "hardware": "quantum",
        "qubits": 32,
        "institution": "XXXA",
        "method": "VQE+Error Mitigation"
      }
      // More entries...
    ],
    
    "visualization": {
      "type": "scatter",
      "xAxis": {
        "field": "time",
        "label": "Computation Time (s)",
        "min": 0,
        "max": 3600,
        "ticks": [0, 900, 1800, 2700, 3600],
        "tickLabels": ["0", "15min", "30min", "45min", "60min"]
      },
      "yAxis": {
        "field": "accuracy",
        "label": "Simulation Accuracy (%)",
        "min": 80,
        "max": 100,
        "ticks": [80, 85, 90, 95, 100],
        "tickLabels": ["80%", "85%", "90%", "95%", "100%"]
      },
      "dataPoints": {
        "categoryField": "hardware",
        "categories": {
          "quantum": {
            "shape": "circle",
            "color": "#0f62fe",
            "label": "Quantum Hardware"
          },
          "classical": {
            "shape": "square",
            "color": "#9B5CFF",
            "label": "Classical Hardware"
          }
        }
      },
      "referenceLine": {
        "y": 95,
        "label": "Classical Limit",
        "style": "dashed"
      }
    },
    
    "content": {
      "sections": [
        {
          "title": "Understanding Quantum Chemistry Simulations",
          "type": "text",
          "content": "This leaderboard tracks the accuracy and performance of quantum algorithms for molecular simulations..."
        },
        {
          "title": "Scoring System",
          "type": "cards",
          "cards": [
            {
              "title": "Accuracy Measurement",
              "content": "Accuracy is measured by comparing to FCI calculations..."
            },
            {
              "title": "Time Measurement",
              "content": "Time includes circuit preparation, execution, and post-processing..."
            },
            {
              "title": "Hardware Categories",
              "content": "Results are categorized by hardware type..."
            }
          ]
        }
      ]
    }
  }
}
```

## Script Architecture

The leaderboard generator will be implemented as a Node.js script with the following architecture:

### Input Methods

The script will support two methods of input:

1. **Configuration File**: A JSON file containing all leaderboard details
2. **Interactive Prompts**: A series of questions to collect the necessary information

### Workflow Steps

1. **Input Collection**:
   - Command-line mode: `node leaderboard-generator.js --config config.json`
   - Interactive mode: `node leaderboard-generator.js` (prompts for inputs)

2. **Input Validation**:
   - Check for required fields
   - Validate ID/slug format (URL-friendly)
   - Ensure no conflicts with existing leaderboards

3. **Directory Creation**:
   - Create `/leaderboard/{leaderboard-id}/` directory

4. **File Generation**:
   - Generate `index.html` from template
   - Update or create JSON data file

5. **Navigation Updates**:
   - Scan all HTML files for navigation sections
   - Insert new leaderboard link

6. **Verification**:
   - Check that all files were created successfully
   - Validate HTML and JSON syntax

## File Generation Process

The script will generate files using a template-based approach:

### HTML Template

The HTML template will contain placeholders that will be replaced with actual content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Quantum Advantage Framework</title>
    <link rel="stylesheet" href="../../styles.css">
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        {{{customCss}}}
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="nav">
        <div class="container">
            <a href="../../" class="nav-logo">Quantum Advantage Framework</a>
            <ul class="nav-links">
                {{{navigationLinks}}}
            </ul>
        </div>
    </nav>

    <main>
        <!-- Hero Section -->
        <section class="hero">
            <div class="container">
                <h1>{{title}}</h1>
                <p>{{shortDescription}}</p>
                <a href="#submit-info" class="btn" style="margin-top: var(--spacing-md);">Submit Your Results</a>
            </div>
        </section>

        <!-- Main Content -->
        {{{mainContent}}}
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Quantum Advantage Framework. {{title}} - Live Results</p>
        </div>
    </footer>

    <script>
        {{{javascript}}}
    </script>
</body>
</html>
```

### JavaScript Generation

The script will generate custom JavaScript code based on the leaderboard configuration:

```javascript
// Load leaderboard data from JSON
async function loadLeaderboardData() {
    try {
        const response = await fetch('{{dataPath}}');
        const data = await response.json();
        
        // Get this leaderboard's data
        const leaderboardData = data.{{leaderboardId}};
        
        // Populate stats
        populateStats(leaderboardData.stats);
        
        // Populate leaderboard table
        populateLeaderboard(leaderboardData.entries);
        
        // Populate performance chart
        populatePerformanceChart(leaderboardData.entries);
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
        showErrorMessage();
    }
}

function populateStats(stats) {
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = `
        {{statsHtml}}
    `;
}

function populateLeaderboard(leaderboard) {
    const tbody = document.getElementById('leaderboard-tbody');
    
    tbody.innerHTML = leaderboard.map(entry => {
        {{tableRowGeneration}}
    }).join('');
}

function populatePerformanceChart(data) {
    const chartContainer = document.getElementById('chart-data-points');
    
    // Clear existing points
    chartContainer.innerHTML = '';
    
    {{chartGenerationCode}}
}

{{additionalFunctions}}

// Load data when DOM is ready
document.addEventListener('DOMContentLoaded', loadLeaderboardData);
```

### File Generation Steps

1. **Create Directory**:
   ```javascript
   const dir = path.join('leaderboard', config.id);
   fs.mkdirSync(dir, { recursive: true });
   ```

2. **Generate HTML File**:
   ```javascript
   const htmlTemplate = fs.readFileSync('templates/leaderboard.html', 'utf8');
   
   // Replace placeholders with actual content
   const html = htmlTemplate
     .replace('{{TITLE}}', config.title)
     .replace('{{SHORT_DESCRIPTION}}', config.shortDescription)
     .replace('{{LEADERBOARD_DESCRIPTION}}', config.longDescription)
     .replace('{{TABLE_HEADERS}}', generateTableHeaders(config.columns))
     .replace('{{CHART_SVG_ELEMENTS}}', generateChartSvg(config.visualization))
     .replace('{{LEGEND_ITEMS}}', generateLegendItems(config.visualization))
     .replace('{{CONTENT_SECTIONS}}', generateContentSections(config.content))
     .replace('{{SUBMISSION_SECTION}}', generateSubmissionSection(config))
     .replace('{{JAVASCRIPT_CODE}}', generateJavaScript(config))
     .replace('{{CUSTOM_CSS}}', generateCustomCss(config))
     .replace('{{NAVIGATION_LINKS}}', generateNavigationLinks(config));
   
   fs.writeFileSync(path.join(dir, 'index.html'), html);
   ```

3. **Update JSON Data File**:
   ```javascript
   // Read existing data file
   const dataPath = 'leaderboard_data.json';
   const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
   
   // Add new leaderboard data structure
   data[config.id] = {
     metadata: {
       title: config.title,
       description: config.shortDescription,
       created: new Date().toISOString().split('T')[0],
       lastUpdated: new Date().toISOString().split('T')[0]
     },
     stats: config.initialStats || {},
     columns: config.columns,
     entries: config.initialEntries || [],
     visualization: config.visualization,
     content: config.content
   };
   
   // Write updated data file
   fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
   ```

## Navigation Update Strategy

Updating the navigation across all pages is a critical part of integrating a new leaderboard:

### 1. Identifying Files to Update

The script will find and update all HTML files that contain navigation links:

```javascript
function findHtmlFiles() {
  const htmlFiles = [];
  
  // Find root HTML files
  fs.readdirSync('.').forEach(file => {
    if (file.endsWith('.html')) {
      htmlFiles.push(file);
    }
  });
  
  // Find leaderboard HTML files
  function scanDir(dir) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file === 'index.html') {
        htmlFiles.push(fullPath);
      }
    });
  }
  
  scanDir('leaderboard');
  
  return htmlFiles;
}
```

### 2. Navigation Pattern Recognition

The script will identify the navigation section in each HTML file:

```javascript
function findNavigationSection(htmlContent) {
  const navRegex = /<nav class="nav">[\s\S]*?<ul class="nav-links">([\s\S]*?)<\/ul>[\s\S]*?<\/nav>/;
  const match = htmlContent.match(navRegex);
  
  if (!match) {
    throw new Error('Navigation section not found in HTML file');
  }
  
  return {
    fullNav: match[0],
    navLinks: match[1]
  };
}
```

### 3. Determining Relative Paths

The script will calculate the correct relative paths for each HTML file:

```javascript
function calculateRelativePath(htmlFile, leaderboardId) {
  // For root HTML files
  if (!htmlFile.includes('/')) {
    return `leaderboard/${leaderboardId}/`;
  }
  
  // For existing leaderboard files
  if (htmlFile.startsWith('leaderboard/')) {
    // Count directory levels
    const levels = htmlFile.split('/').length - 2; // -2 for 'leaderboard' and the file itself
    
    if (levels === 1) {
      // Same level as the new leaderboard
      return `../${leaderboardId}/`;
    } else {
      // Need to go up additional levels
      return '../'.repeat(levels) + leaderboardId + '/';
    }
  }
  
  return `leaderboard/${leaderboardId}/`;
}
```

### 4. Inserting the New Link

The script will insert the new leaderboard link in the correct position:

```javascript
function insertNavigationLink(htmlContent, leaderboardConfig, htmlFile) {
  const { fullNav, navLinks } = findNavigationSection(htmlContent);
  
  // Parse existing links to determine insertion position
  const linkRegex = /<li><a href="([^"]*)"([^>]*)>([^<]*)<\/a><\/li>/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(navLinks)) !== null) {
    links.push({
      href: match[1],
      attributes: match[2],
      text: match[3]
    });
  }
  
  // Create the new link
  const relativePath = calculateRelativePath(htmlFile, leaderboardConfig.id);
  const isActive = htmlFile.includes(`leaderboard/${leaderboardConfig.id}/`);
  const newLink = `<li><a href="${relativePath}"${isActive ? ' class="active"' : ''}>${leaderboardConfig.title}</a></li>`;
  
  // Determine insertion position based on config
  const position = leaderboardConfig.navigation?.position || links.length;
  
  // Insert the new link
  const newLinks = [...links];
  newLinks.splice(position, 0, {
    href: relativePath,
    attributes: isActive ? ' class="active"' : '',
    text: leaderboardConfig.title
  });
  
  // Rebuild the navigation HTML
  const newNavLinks = newLinks.map(link => 
    `<li><a href="${link.href}"${link.attributes}>${link.text}</a></li>`
  ).join('\n                ');
  
  // Replace the old navigation with the new one
  const newNav = fullNav.replace(navLinks, '\n                ' + newNavLinks + '\n            ');
  return htmlContent.replace(fullNav, newNav);
}
```

## Implementation Plan

### Project Structure

```
leaderboard-generator/
├── package.json
├── index.js                 # Main script entry point
├── lib/
│   ├── config-validator.js  # Validates configuration input
│   ├── file-generator.js    # Generates HTML and updates JSON
│   ├── navigation-updater.js # Updates navigation in all files
│   └── template-engine.js   # Handles template processing
├── templates/
│   ├── leaderboard.html     # Main HTML template
│   ├── chart-svg.html       # SVG chart template
│   └── javascript.js        # JavaScript template
└── examples/
    └── quantum-chemistry.json # Example configuration
```

### Dependencies

```json
{
  "name": "leaderboard-generator",
  "version": "1.0.0",
  "description": "Generator for Quantum Advantage Framework leaderboards",
  "main": "index.js",
  "dependencies": {
    "chalk": "^4.1.2",        // For colorful console output
    "commander": "^9.4.0",    // For command-line argument parsing
    "inquirer": "^8.2.4",     // For interactive prompts
    "fs-extra": "^10.1.0",    // Enhanced file system operations
    "ajv": "^8.11.0",         // JSON schema validation
    "handlebars": "^4.7.7",   // Template processing
    "prettier": "^2.7.1"      // Code formatting
  }
}
```

### Implementation Steps

1. **Set Up Project Structure**:
   ```bash
   mkdir -p leaderboard-generator/lib leaderboard-generator/templates leaderboard-generator/examples
   cd leaderboard-generator
   npm init -y
   npm install chalk commander inquirer fs-extra ajv handlebars prettier
   ```

2. **Create Configuration Schema**:
   Create a JSON schema for validating leaderboard configurations.

3. **Create HTML Templates**:
   Create the base HTML template and any sub-templates needed.

4. **Implement Core Modules**:
   - `config-validator.js`: Validate configuration input
   - `file-generator.js`: Generate HTML and update JSON
   - `navigation-updater.js`: Update navigation in all files
   - `template-engine.js`: Handle template processing

5. **Create Main Script**:
   Implement the main script entry point that ties everything together.

6. **Create Example Configuration**:
   Create an example configuration file to demonstrate usage.

7. **Test and Refine**:
   Test the script with various configurations and refine as needed.

## Testing Strategy

1. **Unit Tests**:
   - Test each module independently
   - Validate configuration schema
   - Test template rendering
   - Test path calculations

2. **Integration Tests**:
   - Test the full workflow with sample configurations
   - Verify generated files match expected output
   - Check navigation updates across multiple files

3. **Manual Testing**:
   - Test with real-world examples
   - Verify browser rendering
   - Test responsive design

## Potential Challenges

1. **Challenge**: Handling different relative paths in navigation links
   **Solution**: Implement robust path calculation based on file location

2. **Challenge**: Ensuring generated HTML is valid and well-formatted
   **Solution**: Use Prettier for consistent formatting and validate HTML structure

3. **Challenge**: Maintaining backward compatibility with existing leaderboards
   **Solution**: Design the script to work with the existing data structure

4. **Challenge**: Handling custom visualizations and styling
   **Solution**: Provide flexible configuration options and template overrides

5. **Challenge**: Ensuring the script works across different environments
   **Solution**: Use cross-platform libraries and avoid OS-specific features