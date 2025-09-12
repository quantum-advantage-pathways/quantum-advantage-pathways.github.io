/**
 * File generator for leaderboard generator
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import * as templateEngine from './template-engine.js';

/**
 * Generates a leaderboard directory and files
 * @param {Object} config - Leaderboard configuration
 * @param {string} baseDir - Base directory for the project
 * @returns {Promise<void>}
 */
export async function generateLeaderboard(config, baseDir) {
  try {
    console.log(chalk.blue(`Generating leaderboard: ${config.title} (${config.id})`));
    
    // Create the leaderboard directory
    const leaderboardDir = path.join(baseDir, 'leaderboard', config.id);
    await fs.ensureDir(leaderboardDir);
    console.log(chalk.green(`Created directory: ${leaderboardDir}`));
    
    // Generate the HTML file
    await generateHtmlFile(config, leaderboardDir, baseDir);
    
    // Update the leaderboard data file
    await updateDataFile(config, baseDir);
    
    console.log(chalk.green(`Leaderboard generation complete: ${config.id}`));
  } catch (error) {
    console.error(chalk.red(`Error generating leaderboard: ${error.message}`));
    throw error;
  }
}

/**
 * Generates the HTML file for the leaderboard
 * @param {Object} config - Leaderboard configuration
 * @param {string} leaderboardDir - Directory for the leaderboard
 * @param {string} baseDir - Base directory for the project
 * @returns {Promise<void>}
 */
async function generateHtmlFile(config, leaderboardDir, baseDir) {
  try {
    // Prepare template data
    const templateData = {
      title: config.title,
      shortDescription: config.shortDescription,
      leaderboardDescription: config.longDescription || config.shortDescription,
      customCss: config.customCss || '',
      navigationLinks: templateEngine.generateNavigationLinks(config),
      tableHeaders: templateEngine.generateTableHeaders(config.columns),
      xAxisTitle: config.visualization.xAxis.label,
      yAxisTitle: config.visualization.yAxis.label,
      xAxisLabels: templateEngine.generateAxisLabels(config.visualization.xAxis, 'x'),
      yAxisLabels: templateEngine.generateAxisLabels(config.visualization.yAxis, 'y'),
      referenceLine: templateEngine.generateReferenceLine({
        ...config.visualization.referenceLine,
        visualization: config.visualization
      }),
      legendItems: templateEngine.generateLegendItems(config.visualization.dataPoints),
      contentSections: templateEngine.generateContentSections(config.content),
      submissionRequirements: generateSubmissionRequirements(config),
      javascript: templateEngine.generateJavaScript(config)
    };
    
    // Load and render the template
    const templatePath = path.join(baseDir, 'leaderboard-generator', 'templates', 'leaderboard.html');
    const renderedHtml = await templateEngine.renderTemplate(templatePath, templateData);
    
    // Write the HTML file
    const htmlPath = path.join(leaderboardDir, 'index.html');
    await fs.writeFile(htmlPath, renderedHtml);
    
    console.log(chalk.green(`Generated HTML file: ${htmlPath}`));
  } catch (error) {
    console.error(chalk.red(`Error generating HTML file: ${error.message}`));
    throw error;
  }
}

/**
 * Updates the leaderboard data file with the new leaderboard
 * @param {Object} config - Leaderboard configuration
 * @param {string} baseDir - Base directory for the project
 * @returns {Promise<void>}
 */
async function updateDataFile(config, baseDir) {
  try {
    const dataPath = path.join(baseDir, 'leaderboard_data.json');
    
    // Read existing data file
    let data = {};
    if (await fs.pathExists(dataPath)) {
      const dataContent = await fs.readFile(dataPath, 'utf8');
      data = JSON.parse(dataContent);
    }
    
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
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    
    console.log(chalk.green(`Updated data file: ${dataPath}`));
  } catch (error) {
    console.error(chalk.red(`Error updating data file: ${error.message}`));
    throw error;
  }
}

/**
 * Generates submission requirements HTML based on the configuration
 * @param {Object} config - Leaderboard configuration
 * @returns {string} - HTML for submission requirements
 */
function generateSubmissionRequirements(config) {
  // Generate default submission requirements based on columns
  const requirements = config.columns.map(column => {
    return `<li><strong>${column.name}:</strong> Required information for submission</li>`;
  });
  
  // Add additional requirements
  requirements.push('<li><strong>Reproducibility:</strong> Code, parameters, and setup instructions</li>');
  
  return requirements.join('\n                            ');
}

export default {
  generateLeaderboard
};

// Made with Bob
