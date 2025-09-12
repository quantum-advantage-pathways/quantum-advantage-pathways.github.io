# Leaderboard Generator for Quantum Advantage Framework

This tool automates the creation of new leaderboards on the Quantum Advantage Pathways website.

## Features

- Generate new leaderboard pages with consistent styling and functionality
- Update navigation links across the site
- Support for custom data visualization
- Interactive mode for guided leaderboard creation
- Configuration file support for reproducible leaderboard generation

## Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-username/quantum-advantage-pathways.github.io.git
cd quantum-advantage-pathways.github.io

# Install dependencies
cd leaderboard-generator
npm install
```

## Usage

### Using a Configuration File

Create a JSON configuration file (see examples directory) and run:

```bash
node index.js --config examples/quantum-chemistry.json
```

### Interactive Mode

Run the generator in interactive mode to be guided through the configuration process:

```bash
node index.js --interactive
```

### Options

- `--config <path>`: Path to the configuration file
- `--interactive`: Run in interactive mode
- `--skip-navigation`: Skip updating navigation links

## Configuration Schema

The configuration file should follow this structure:

```json
{
  "id": "leaderboard-id",
  "title": "Leaderboard Title",
  "shortDescription": "Brief description",
  "longDescription": "Detailed description",
  "navigation": {
    "position": 1
  },
  "columns": [
    {
      "id": "column-id",
      "name": "Column Name",
      "type": "text",
      "width": "100px",
      "className": "custom-class",
      "sortable": true
    }
  ],
  "visualization": {
    "type": "scatter",
    "xAxis": {
      "field": "fieldName",
      "label": "X-Axis Label",
      "min": 0,
      "max": 100
    },
    "yAxis": {
      "field": "fieldName",
      "label": "Y-Axis Label",
      "min": 0,
      "max": 100
    },
    "dataPoints": {
      "categoryField": "category",
      "categories": {
        "category1": {
          "shape": "circle",
          "color": "#0f62fe",
          "label": "Category 1"
        }
      }
    }
  },
  "content": {
    "sections": [
      {
        "title": "Section Title",
        "type": "text",
        "content": "Section content"
      }
    ]
  }
}
```

## Example Configurations

See the `examples` directory for sample configuration files:

- `quantum-chemistry.json`: Example configuration for a quantum chemistry simulations leaderboard

## Directory Structure

```
leaderboard-generator/
├── index.js                 # Main script entry point
├── lib/
│   ├── config-validator.js  # Validates configuration input
│   ├── file-generator.js    # Generates HTML and updates JSON
│   ├── navigation-updater.js # Updates navigation in all files
│   ├── schema.js            # JSON schema for configuration
│   └── template-engine.js   # Handles template processing
├── templates/
│   └── leaderboard.html     # Main HTML template
└── examples/
    └── quantum-chemistry.json # Example configuration
```

## Testing

To test the generator with the example configuration:

```bash
node index.js --config examples/quantum-chemistry.json
```

This will create a new leaderboard at `leaderboard/quantum-chemistry/` and update the navigation links across the site.

## License

This project is licensed under the same license as the Quantum Advantage Pathways website.

## Step-by-Step Guide: Creating a New Leaderboard

This guide walks you through the process of creating a new leaderboard for the Quantum Advantage Framework website.

### Method 1: Using a Configuration File (Recommended)

1. **Create a Configuration File**

   Create a JSON file with your leaderboard configuration. You can start by copying and modifying an existing example:

   ```bash
   cp examples/quantum-chemistry.json examples/your-leaderboard.json
   ```

   Edit the file to customize your leaderboard:

   ```json
   {
     "id": "your-leaderboard-id",
     "title": "Your Leaderboard Title",
     "shortDescription": "Brief description of your leaderboard",
     "longDescription": "More detailed description of what this leaderboard tracks",
     ...
   }
   ```

2. **Key Configuration Sections**

   - **Basic Information**:
     - `id`: URL-friendly identifier (use lowercase with hyphens)
     - `title`: Display title for the leaderboard
     - `shortDescription`: Brief description for the hero section
     - `longDescription`: Detailed description shown above the table

   - **Navigation**:
     - `position`: Where to place this leaderboard in the navigation menu (0-based index)

   - **Columns**:
     - Define the columns that will appear in your leaderboard table
     - Always include a `rank` column as the first column
     - Each column needs an `id`, `name`, `type`, and other optional properties

   - **Visualization**:
     - Configure the chart visualization with `xAxis`, `yAxis`, and `dataPoints`
     - Define reference lines if needed
     - Customize data point appearance based on categories

   - **Content Sections**:
     - Add additional content sections with explanatory text or cards
     - Use `text` type for paragraphs and `cards` type for multi-column layouts

   - **Initial Data**:
     - `initialStats`: Statistics to display at the top of the page
     - `initialEntries`: Starting data points for the leaderboard

   - **Custom Styling**:
     - `customCss`: Add custom CSS rules for your leaderboard

3. **Generate the Leaderboard**

   Run the generator with your configuration file:

   ```bash
   node index.js --config examples/your-leaderboard.json
   ```

4. **Verify the Results**

   - Check the generated files in `leaderboard/your-leaderboard-id/`
   - Verify that navigation links have been updated across the site
   - Open the leaderboard in a browser to ensure it displays correctly

### Method 2: Interactive Mode

1. **Start Interactive Mode**

   ```bash
   node index.js --interactive
   ```

2. **Follow the Prompts**

   The interactive mode will guide you through:
   - Basic information (ID, title, descriptions)
   - Navigation position
   - Column definitions
   - Visualization settings
   - Content sections
   - Initial data

3. **Save Configuration (Optional)**

   At the end of the process, you'll be asked if you want to save the configuration to a file for future reference or modifications.

### Example: Creating a Quantum Error Correction Leaderboard

Here's a practical example of creating a new leaderboard for quantum error correction:

1. Create a configuration file `examples/error-correction.json`:

```json
{
  "id": "error-correction",
  "title": "Quantum Error Correction",
  "shortDescription": "Benchmarking error correction codes",
  "longDescription": "This leaderboard tracks the performance of quantum error correction codes across different physical qubit platforms.",
  "navigation": {
    "position": 2
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
      "id": "code",
      "name": "Code",
      "type": "text",
      "width": "120px",
      "className": "code-column",
      "sortable": true
    },
    {
      "id": "logicalError",
      "name": "Logical Error Rate",
      "type": "percentage",
      "width": "150px",
      "className": "error-column",
      "sortable": true,
      "formatting": {
        "thresholds": [
          {"value": 0.1, "class": "score-100"},
          {"value": 1, "class": "score-high"},
          {"value": 5, "class": "score-medium"},
          {"value": 100, "class": "score-low"}
        ]
      }
    },
    {
      "id": "physicalQubits",
      "name": "Physical Qubits",
      "type": "number",
      "width": "120px",
      "className": "qubits-column",
      "sortable": true
    },
    {
      "id": "platform",
      "name": "Platform",
      "type": "text",
      "width": "120px",
      "className": "platform-column",
      "sortable": true
    },
    {
      "id": "institution",
      "name": "Institution",
      "type": "text",
      "width": "120px",
      "className": "institution-column",
      "sortable": true
    }
  ],
  "visualization": {
    "type": "scatter",
    "xAxis": {
      "field": "physicalQubits",
      "label": "Number of Physical Qubits",
      "min": 0,
      "max": 100,
      "ticks": [0, 25, 50, 75, 100],
      "tickLabels": ["0", "25", "50", "75", "100"]
    },
    "yAxis": {
      "field": "logicalError",
      "label": "Logical Error Rate (%)",
      "min": 0,
      "max": 10,
      "ticks": [0, 2.5, 5, 7.5, 10],
      "tickLabels": ["0%", "2.5%", "5%", "7.5%", "10%"]
    },
    "dataPoints": {
      "categoryField": "platform",
      "categories": {
        "superconducting": {
          "shape": "circle",
          "color": "#0f62fe",
          "label": "Superconducting"
        },
        "ion-trap": {
          "shape": "square",
          "color": "#9B5CFF",
          "label": "Ion Trap"
        },
        "photonic": {
          "shape": "triangle",
          "color": "#FF7EB6",
          "label": "Photonic"
        }
      }
    },
    "referenceLine": {
      "y": 1,
      "label": "Fault-Tolerance Threshold",
      "style": "dashed"
    }
  },
  "content": {
    "sections": [
      {
        "title": "Understanding Quantum Error Correction",
        "type": "text",
        "content": "Quantum error correction is essential for building fault-tolerant quantum computers. This leaderboard tracks the performance of different error correction codes and their implementation on various quantum hardware platforms."
      }
    ]
  },
  "initialStats": {
    "totalImplementations": 12,
    "institutions": 5,
    "bestErrorRate": "0.1%",
    "averageQubits": 27
  },
  "initialEntries": []
}
```

2. Generate the leaderboard:

```bash
node index.js --config examples/error-correction.json
```

3. The new leaderboard will be available at `leaderboard/error-correction/index.html`

### Troubleshooting

- **HTML Escaping Issues**: If you notice HTML entities being displayed instead of rendered HTML, ensure you're using the latest version of the generator which includes fixes for HTML escaping.
- **Navigation Not Updated**: If navigation links aren't updated correctly, try running the generator with the `--skip-navigation` option first, then run it again without this option.
- **Visualization Problems**: Check that your data fields match the field names specified in the visualization configuration.
- **Custom CSS Not Applied**: Verify that your custom CSS is properly formatted and targets the correct elements.

### Best Practices

1. **Use Descriptive IDs**: Choose clear, descriptive IDs for your leaderboard and columns
2. **Test with Sample Data**: Always include some initial entries to test the visualization
3. **Keep Backups**: Save your configuration files for future updates
4. **Consistent Styling**: Follow the existing design patterns for a cohesive look
5. **Responsive Design**: Test your leaderboard on different screen sizes