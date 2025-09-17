/**
 * Leaderboard Service for the Leaderboard Generator Chat Interface
 * 
 * This service handles the generation of leaderboards, integrating with
 * the existing leaderboard-generator components.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import logger from '../utils/logger.js';

// Import the existing leaderboard-generator components
import { generateLeaderboard } from '../../../lib/file-generator.js';
import { updateNavigation } from '../../../lib/navigation-updater.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the base directory (parent of the script directory)
const baseDir = path.resolve(__dirname, '..', '..', '..', '..', '..');

/**
 * Initialize the leaderboard service
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
export async function initializeLeaderboardService(options = {}) {
  logger.info('Initializing leaderboard service...');
  
  try {
    // Create necessary directories
    const previewsDir = path.join(__dirname, '..', '..', 'data', 'previews');
    await fs.ensureDir(previewsDir);
    
    logger.info('Leaderboard service initialized successfully');
  } catch (error) {
    logger.error('Error initializing leaderboard service:', error);
    throw error;
  }
}

/**
 * Generate a leaderboard
 * @param {Object} config - Leaderboard configuration
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generation result
 */
export async function generateLeaderboardFiles(config, options = {}) {
  try {
    logger.info(`Generating leaderboard: ${config.id}`);
    
    // Validate the configuration
    if (!config.id) {
      throw new Error('Configuration must have an ID');
    }
    
    // Generate the leaderboard files
    await generateLeaderboard(config, baseDir);
    
    // Update navigation if requested
    if (options.updateNavigation !== false) {
      await updateNavigation(config, baseDir);
    }
    
    const leaderboardPath = path.join('leaderboard', config.id);
    
    logger.info(`Leaderboard generated successfully: ${leaderboardPath}`);
    
    return {
      success: true,
      path: leaderboardPath,
      logs: [`Leaderboard generated successfully: ${leaderboardPath}`]
    };
  } catch (error) {
    logger.error('Error generating leaderboard:', error);
    
    return {
      success: false,
      error: error.message,
      logs: [`Error generating leaderboard: ${error.message}`]
    };
  }
}

/**
 * Generate a preview of a leaderboard
 * @param {Object} config - Leaderboard configuration
 * @returns {Promise<string>} - HTML preview
 */
export async function generatePreview(config) {
  try {
    logger.info(`Generating preview for leaderboard: ${config.id || 'unnamed'}`);
    
    // Create a temporary configuration with a unique ID if none is provided
    const previewConfig = { ...config };
    if (!previewConfig.id) {
      previewConfig.id = `preview-${Date.now()}`;
    }
    
    // Save the preview configuration
    const previewsDir = path.join(__dirname, '..', '..', 'data', 'previews');
    const previewFile = path.join(previewsDir, `${previewConfig.id}.json`);
    await fs.writeJson(previewFile, previewConfig, { spaces: 2 });
    
    // Generate the preview
    const previewDir = path.join(previewsDir, previewConfig.id);
    await fs.ensureDir(previewDir);
    
    // Use the existing generator to create the preview files
    await generateLeaderboard(previewConfig, previewsDir, {
      skipNavigation: true,
      previewMode: true
    });
    
    // Read the generated HTML
    const htmlFile = path.join(previewDir, 'index.html');
    const html = await fs.readFile(htmlFile, 'utf-8');
    
    // Clean up temporary files
    await fs.remove(previewDir);
    await fs.remove(previewFile);
    
    logger.info(`Preview generated successfully for: ${previewConfig.id}`);
    
    return html;
  } catch (error) {
    logger.error('Error generating preview:', error);
    
    // Return a simple error page
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preview Error</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          .error { color: red; background: #ffeeee; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Preview Error</h1>
        <div class="error">
          <p>Error generating preview: ${error.message}</p>
        </div>
      </body>
      </html>
    `;
  }
}

/**
 * Generate a visualization preview
 * @param {Object} config - Visualization configuration
 * @returns {Promise<string>} - SVG preview
 */
export async function generateVisualizationPreview(config) {
  try {
    logger.info('Generating visualization preview');
    
    // Extract visualization configuration
    const visualization = config.visualization;
    if (!visualization) {
      throw new Error('No visualization configuration provided');
    }
    
    // Generate a simple SVG preview based on the visualization type
    let svg = '';
    
    switch (visualization.type) {
      case 'scatter':
        svg = generateScatterPlotSVG(visualization, config.initialEntries || []);
        break;
      case 'bar':
        svg = generateBarChartSVG(visualization, config.initialEntries || []);
        break;
      case 'line':
        svg = generateLineChartSVG(visualization, config.initialEntries || []);
        break;
      default:
        throw new Error(`Unsupported visualization type: ${visualization.type}`);
    }
    
    logger.info('Visualization preview generated successfully');
    
    return svg;
  } catch (error) {
    logger.error('Error generating visualization preview:', error);
    
    // Return a simple error SVG
    return `
      <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="600" height="400" fill="#f8f8f8" />
        <text x="300" y="200" text-anchor="middle" fill="red">
          Error generating visualization: ${error.message}
        </text>
      </svg>
    `;
  }
}

/**
 * Generate a scatter plot SVG
 * @param {Object} visualization - Visualization configuration
 * @param {Array<Object>} data - Data points
 * @returns {string} - SVG content
 */
function generateScatterPlotSVG(visualization, data) {
  const width = 600;
  const height = 400;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  
  const xField = visualization.xAxis?.field || 'x';
  const yField = visualization.yAxis?.field || 'y';
  const categoryField = visualization.dataPoints?.categoryField || 'category';
  
  const xMin = visualization.xAxis?.min || 0;
  const xMax = visualization.xAxis?.max || 100;
  const yMin = visualization.yAxis?.min || 0;
  const yMax = visualization.yAxis?.max || 100;
  
  const xLabel = visualization.xAxis?.label || xField;
  const yLabel = visualization.yAxis?.label || yField;
  
  const categories = visualization.dataPoints?.categories || {
    default: { shape: 'circle', color: '#0f62fe', label: 'Default' }
  };
  
  // Generate SVG
  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      
      <!-- Axes -->
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#000000" />
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#000000" />
      
      <!-- Axis Labels -->
      <text x="${width / 2}" y="${height - margin.bottom / 3}" text-anchor="middle">${xLabel}</text>
      <text x="${margin.left / 3}" y="${height / 2}" text-anchor="middle" transform="rotate(-90, ${margin.left / 3}, ${height / 2})">${yLabel}</text>
      
      <!-- Title -->
      <text x="${width / 2}" y="${margin.top / 2}" text-anchor="middle" font-weight="bold">Scatter Plot</text>
  `;
  
  // Add reference line if specified
  if (visualization.referenceLine?.y) {
    const y = height - margin.bottom - ((visualization.referenceLine.y - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom);
    const style = visualization.referenceLine.style || 'dashed';
    const dashArray = style === 'dashed' ? '5,5' : (style === 'dotted' ? '2,2' : 'none');
    
    svg += `
      <!-- Reference Line -->
      <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#666666" stroke-dasharray="${dashArray}" />
      <text x="${width - margin.right + 5}" y="${y}" alignment-baseline="middle">${visualization.referenceLine.label || ''}</text>
    `;
  }
  
  // Add data points
  if (data.length > 0) {
    for (const point of data) {
      const x = margin.left + ((point[xField] - xMin) / (xMax - xMin)) * (width - margin.left - margin.right);
      const y = height - margin.bottom - ((point[yField] - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom);
      const category = point[categoryField] || 'default';
      const categoryConfig = categories[category] || categories.default || { shape: 'circle', color: '#0f62fe' };
      
      svg += `
        <!-- Data Point -->
      `;
      
      if (categoryConfig.shape === 'circle') {
        svg += `<circle cx="${x}" cy="${y}" r="5" fill="${categoryConfig.color}" />`;
      } else if (categoryConfig.shape === 'square') {
        svg += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${categoryConfig.color}" />`;
      } else if (categoryConfig.shape === 'triangle') {
        svg += `<polygon points="${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}" fill="${categoryConfig.color}" />`;
      }
    }
  } else {
    // Add sample points if no data
    const categories = Object.keys(visualization.dataPoints?.categories || { default: {} });
    
    for (let i = 0; i < 10; i++) {
      const x = margin.left + Math.random() * (width - margin.left - margin.right);
      const y = height - margin.bottom - Math.random() * (height - margin.top - margin.bottom);
      const category = categories[Math.floor(Math.random() * categories.length)] || 'default';
      const categoryConfig = visualization.dataPoints?.categories?.[category] || { shape: 'circle', color: '#0f62fe' };
      
      svg += `
        <!-- Sample Point -->
      `;
      
      if (categoryConfig.shape === 'circle') {
        svg += `<circle cx="${x}" cy="${y}" r="5" fill="${categoryConfig.color}" />`;
      } else if (categoryConfig.shape === 'square') {
        svg += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${categoryConfig.color}" />`;
      } else if (categoryConfig.shape === 'triangle') {
        svg += `<polygon points="${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}" fill="${categoryConfig.color}" />`;
      }
    }
  }
  
  // Add legend
  if (visualization.dataPoints?.categories) {
    const legendX = width - margin.right - 100;
    const legendY = margin.top;
    
    svg += `
      <!-- Legend -->
      <rect x="${legendX - 10}" y="${legendY - 10}" width="110" height="${Object.keys(visualization.dataPoints.categories).length * 25 + 10}" fill="#ffffff" stroke="#cccccc" />
    `;
    
    let i = 0;
    for (const [category, config] of Object.entries(visualization.dataPoints.categories)) {
      const y = legendY + i * 25;
      
      svg += `
        <!-- Legend Item -->
      `;
      
      if (config.shape === 'circle') {
        svg += `<circle cx="${legendX}" cy="${y}" r="5" fill="${config.color}" />`;
      } else if (config.shape === 'square') {
        svg += `<rect x="${legendX - 4}" y="${y - 4}" width="8" height="8" fill="${config.color}" />`;
      } else if (config.shape === 'triangle') {
        svg += `<polygon points="${legendX},${y - 5} ${legendX - 4},${y + 3} ${legendX + 4},${y + 3}" fill="${config.color}" />`;
      }
      
      svg += `<text x="${legendX + 15}" y="${y + 5}">${config.label || category}</text>`;
      
      i++;
    }
  }
  
  svg += `</svg>`;
  
  return svg;
}

/**
 * Generate a bar chart SVG
 * @param {Object} visualization - Visualization configuration
 * @param {Array<Object>} data - Data points
 * @returns {string} - SVG content
 */
function generateBarChartSVG(visualization, data) {
  // Similar implementation to scatter plot but for bar charts
  // For brevity, returning a placeholder
  return `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#ffffff" />
      <text x="300" y="200" text-anchor="middle">
        Bar Chart Preview (Implementation simplified for this example)
      </text>
    </svg>
  `;
}

/**
 * Generate a line chart SVG
 * @param {Object} visualization - Visualization configuration
 * @param {Array<Object>} data - Data points
 * @returns {string} - SVG content
 */
function generateLineChartSVG(visualization, data) {
  // Similar implementation to scatter plot but for line charts
  // For brevity, returning a placeholder
  return `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" fill="#ffffff" />
      <text x="300" y="200" text-anchor="middle">
        Line Chart Preview (Implementation simplified for this example)
      </text>
    </svg>
  `;
}

/**
 * Shutdown the leaderboard service
 * @returns {Promise<void>}
 */
export async function shutdownLeaderboardService() {
  logger.info('Shutting down leaderboard service...');
  
  try {
    // Clean up preview files
    const previewsDir = path.join(__dirname, '..', '..', 'data', 'previews');
    
    if (await fs.pathExists(previewsDir)) {
      await fs.emptyDir(previewsDir);
    }
    
    logger.info('Leaderboard service shut down successfully');
  } catch (error) {
    logger.error('Error shutting down leaderboard service:', error);
    throw error;
  }
}

export default {
  initializeLeaderboardService,
  generateLeaderboardFiles,
  generatePreview,
  generateVisualizationPreview,
  shutdownLeaderboardService
};

// Made with Bob
