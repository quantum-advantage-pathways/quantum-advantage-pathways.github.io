# AGENTS.md

This file provides guidance to Bobshell when working with code in this repository.

## Project Overview

This repository contains the source code for the Quantum Advantage Pathways website, a resource for understanding the pathways to achieving quantum advantage in quantum computing. The project is based on research from an IBM-Pasqal collaboration and focuses on three main pathways to quantum advantage:

1. **Provable Confidence Bounds** - Establishing trust through rigorous error control
2. **Algorithmic Methods** - Certifiable quantum solutions via the variational principle
3. **Efficient Classical Verification** - Quantum outputs that are hard to find but easy to check

The website also features a "Peak Circuits" leaderboard that tracks and compares quantum advantage experiments worldwide.

## Project Structure

The repository is organized as follows:

- **Root directory**: Contains the main HTML pages for the website, including:
  - `index.html` - Main landing page
  - `confidence_bounds.html` - Information about the confidence bounds pathway
  - `algorithmic_methods.html` - Information about the algorithmic methods pathway
  - `classical_verification.html` - Information about the classical verification pathway
  - `styles.css` - Main stylesheet for the website
  - `leaderboard_data.json` - Data for the Peak Circuits leaderboard

- **`/leaderboard/`**: Contains leaderboard pages, currently featuring:
  - `/peak_circuits/` - The Peak Circuits leaderboard page

- **`/leaderboard-generator/`**: A Node.js tool for generating new leaderboards, including:
  - `index.js` - Main script entry point
  - `/lib/` - Core functionality modules
  - `/templates/` - HTML templates for leaderboard generation
  - `/examples/` - Example configuration files
  - `/chat-interface/` - A web interface for interacting with the leaderboard generator

## Technology Stack

- **Frontend**: Pure HTML, CSS, and JavaScript (no framework)
- **Backend Tools**: Node.js for the leaderboard generator
- **Deployment**: GitHub Pages

## Building and Running

### Running the Website Locally

To run the website locally, you can use a simple HTTP server:

```bash
# Using Node.js
npx serve

# Or with Python
python -m http.server
```

### Using the Leaderboard Generator

To generate a new leaderboard:

```bash
# Navigate to the leaderboard generator directory
cd leaderboard-generator

# Install dependencies
npm install

# Generate a leaderboard using a configuration file
node index.js --config examples/your-config.json

# Or use interactive mode
node index.js --interactive
```

## Development Conventions

### HTML Structure

- Each page follows a consistent structure with:
  - Navigation bar
  - Hero section
  - Content sections
  - Footer

### CSS Organization

- The `styles.css` file uses CSS variables for consistent theming
- Responsive design is implemented with media queries
- Class naming follows a descriptive convention (e.g., `grid-3`, `card`, `btn`)

### Leaderboard Generation

- New leaderboards should be created using the leaderboard generator tool
- Leaderboard configurations should follow the schema defined in `leaderboard-generator/lib/schema.js`
- Navigation links are automatically updated when new leaderboards are generated

## Working with the Codebase

### Adding New Content

1. For new pages, follow the structure of existing HTML files
2. For new leaderboards, use the leaderboard generator
3. Update `leaderboard_data.json` to add new entries to existing leaderboards

### Modifying Styles

1. Make changes to `styles.css` for global styling
2. For leaderboard-specific styles, modify the inline `<style>` section in the leaderboard HTML

### Updating Navigation

When adding new pages, update the navigation links in all HTML files to maintain consistency.

## Key Files for Understanding the Project

- `README.md` - Basic project information and setup instructions
- `index.html` - Main page structure and overview of quantum advantage pathways
- `leaderboard-generator/README.md` - Detailed documentation on the leaderboard generator
- `leaderboard/peak_circuits/index.html` - Example of a leaderboard implementation
- `leaderboard_data.json` - Data structure for leaderboard entries

## Best Practices

- Maintain consistent styling across all pages
- Follow the established HTML structure when adding new pages
- Use the leaderboard generator for creating new leaderboards rather than manual HTML creation
- Keep the navigation consistent across all pages
- Update `leaderboard_data.json` when adding new leaderboard entries
