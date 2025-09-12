#!/usr/bin/env node

/**
 * Leaderboard Generator for Quantum Advantage Framework
 * 
 * This script automates the creation of new leaderboards on the Quantum Advantage Pathways website.
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Import modules
import { validateConfigFile } from './lib/config-validator.js';
import { generateLeaderboard } from './lib/file-generator.js';
import { updateNavigation } from './lib/navigation-updater.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the base directory (parent of the script directory)
const baseDir = path.resolve(__dirname, '..');

// Set up the command-line interface
const program = new Command();

program
  .name('leaderboard-generator')
  .description('Generate a new leaderboard for the Quantum Advantage Framework')
  .version('1.0.0');

program
  .option('-c, --config <path>', 'Path to the configuration file')
  .option('-i, --interactive', 'Run in interactive mode')
  .option('-s, --skip-navigation', 'Skip updating navigation links')
  .parse(process.argv);

const options = program.opts();

/**
 * Main function
 */
async function main() {
  try {
    console.log(chalk.blue('Quantum Advantage Framework - Leaderboard Generator'));
    console.log(chalk.blue('================================================='));
    
    let config;
    
    if (options.config) {
      // Load configuration from file
      const configPath = path.resolve(options.config);
      console.log(chalk.blue(`Loading configuration from: ${configPath}`));
      
      config = await validateConfigFile(configPath);
    } else if (options.interactive) {
      // Run in interactive mode
      config = await runInteractiveMode();
    } else {
      // No configuration provided
      console.error(chalk.red('Error: No configuration provided. Use --config or --interactive option.'));
      program.help();
      process.exit(1);
    }
    
    // Generate the leaderboard
    await generateLeaderboard(config, baseDir);
    
    // Update navigation links
    if (!options.skipNavigation) {
      await updateNavigation(config, baseDir);
    }
    
    console.log(chalk.green('Leaderboard generation completed successfully!'));
    console.log(chalk.green(`New leaderboard available at: leaderboard/${config.id}/`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Runs the interactive mode to collect configuration
 * @returns {Promise<Object>} - The configuration object
 */
async function runInteractiveMode() {
  console.log(chalk.blue('Running in interactive mode...'));
  
  // Basic information
  const basicInfo = await inquirer.prompt([
    {
      type: 'input',
      name: 'id',
      message: 'Enter leaderboard ID (URL-friendly, e.g., quantum-chemistry):',
      validate: input => /^[a-z0-9_-]+$/.test(input) ? true : 'ID must contain only lowercase letters, numbers, underscores, and hyphens'
    },
    {
      type: 'input',
      name: 'title',
      message: 'Enter leaderboard title:',
      validate: input => input.trim() !== '' ? true : 'Title is required'
    },
    {
      type: 'input',
      name: 'shortDescription',
      message: 'Enter short description:',
      validate: input => input.trim() !== '' ? true : 'Description is required'
    },
    {
      type: 'input',
      name: 'longDescription',
      message: 'Enter longer description (optional):',
      default: ''
    }
  ]);
  
  // Navigation
  const navigationInfo = await inquirer.prompt([
    {
      type: 'number',
      name: 'position',
      message: 'Enter position in navigation menu (0-based index, leave empty for end):',
      default: -1
    }
  ]);
  
  // Columns
  const columns = [];
  console.log(chalk.blue('\nDefining columns for the leaderboard table:'));
  
  // Add required columns
  columns.push({
    id: 'rank',
    name: 'Rank',
    type: 'number',
    width: '60px',
    className: 'rank-column',
    sortable: true,
    defaultSort: true,
    sortDirection: 'asc'
  });
  
  let addMoreColumns = true;
  while (addMoreColumns) {
    const column = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Enter column ID:',
        validate: input => /^[a-zA-Z0-9_]+$/.test(input) ? true : 'ID must contain only letters, numbers, and underscores'
      },
      {
        type: 'input',
        name: 'name',
        message: 'Enter column display name:',
        validate: input => input.trim() !== '' ? true : 'Name is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Select column data type:',
        choices: ['number', 'text', 'percentage', 'time', 'hardware']
      },
      {
        type: 'input',
        name: 'width',
        message: 'Enter column width (CSS value, e.g., 100px):',
        default: '100px'
      },
      {
        type: 'confirm',
        name: 'sortable',
        message: 'Is this column sortable?',
        default: true
      }
    ]);
    
    columns.push(column);
    
    const { addAnother } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addAnother',
        message: 'Add another column?',
        default: false
      }
    ]);
    
    addMoreColumns = addAnother;
  }
  
  // Visualization
  console.log(chalk.blue('\nDefining visualization:'));
  
  const visualization = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select visualization type:',
      choices: ['scatter', 'bar', 'line'],
      default: 'scatter'
    },
    {
      type: 'input',
      name: 'xAxisField',
      message: 'Enter data field for x-axis:',
      default: columns.length > 1 ? columns[1].id : 'value'
    },
    {
      type: 'input',
      name: 'xAxisLabel',
      message: 'Enter label for x-axis:',
      default: columns.length > 1 ? columns[1].name : 'Value'
    },
    {
      type: 'input',
      name: 'yAxisField',
      message: 'Enter data field for y-axis:',
      default: columns.length > 2 ? columns[2].id : 'score'
    },
    {
      type: 'input',
      name: 'yAxisLabel',
      message: 'Enter label for y-axis:',
      default: columns.length > 2 ? columns[2].name : 'Score'
    },
    {
      type: 'input',
      name: 'categoryField',
      message: 'Enter field for categorizing data points:',
      default: 'hardware'
    }
  ]);
  
  // Create visualization configuration
  const visualizationConfig = {
    type: visualization.type,
    xAxis: {
      field: visualization.xAxisField,
      label: visualization.xAxisLabel,
      min: 0,
      max: 100,
      ticks: [0, 25, 50, 75, 100],
      tickLabels: ['0', '25', '50', '75', '100']
    },
    yAxis: {
      field: visualization.yAxisField,
      label: visualization.yAxisLabel,
      min: 0,
      max: 100,
      ticks: [0, 25, 50, 75, 100],
      tickLabels: ['0%', '25%', '50%', '75%', '100%']
    },
    dataPoints: {
      categoryField: visualization.categoryField,
      categories: {
        quantum: {
          shape: 'circle',
          color: '#0f62fe',
          label: 'Quantum Hardware'
        },
        classical: {
          shape: 'square',
          color: '#9B5CFF',
          label: 'Classical Hardware'
        }
      }
    },
    referenceLine: {
      y: 95,
      label: 'Classical Limit',
      style: 'dashed'
    }
  };
  
  // Content sections
  console.log(chalk.blue('\nDefining content sections:'));
  
  const contentSections = [];
  
  // Add a default section
  const { addSection } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'addSection',
      message: 'Add a content section?',
      default: true
    }
  ]);
  
  if (addSection) {
    const section = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter section title:',
        validate: input => input.trim() !== '' ? true : 'Title is required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Select section type:',
        choices: ['text', 'cards'],
        default: 'text'
      },
      {
        type: 'input',
        name: 'content',
        message: 'Enter section content:',
        when: answers => answers.type === 'text',
        validate: input => input.trim() !== '' ? true : 'Content is required'
      }
    ]);
    
    if (section.type === 'text') {
      contentSections.push({
        title: section.title,
        type: 'text',
        content: section.content
      });
    } else if (section.type === 'cards') {
      const cards = [];
      
      let addMoreCards = true;
      while (addMoreCards) {
        const card = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Enter card title:',
            validate: input => input.trim() !== '' ? true : 'Title is required'
          },
          {
            type: 'input',
            name: 'content',
            message: 'Enter card content:',
            validate: input => input.trim() !== '' ? true : 'Content is required'
          }
        ]);
        
        cards.push(card);
        
        const { addAnother } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'addAnother',
            message: 'Add another card?',
            default: false
          }
        ]);
        
        addMoreCards = addAnother;
      }
      
      contentSections.push({
        title: section.title,
        type: 'cards',
        cards
      });
    }
  }
  
  // Build the configuration object
  const config = {
    id: basicInfo.id,
    title: basicInfo.title,
    shortDescription: basicInfo.shortDescription,
    longDescription: basicInfo.longDescription || basicInfo.shortDescription,
    navigation: {
      position: navigationInfo.position >= 0 ? navigationInfo.position : undefined
    },
    columns,
    visualization: visualizationConfig,
    content: {
      sections: contentSections
    },
    initialStats: {
      totalEntries: 0,
      institutions: 0,
      bestScore: '0%',
      averageTime: '0 min'
    },
    initialEntries: []
  };
  
  // Ask if the user wants to save the configuration
  const { saveConfig } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'saveConfig',
      message: 'Save this configuration to a file?',
      default: true
    }
  ]);
  
  if (saveConfig) {
    const { configPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'configPath',
        message: 'Enter path to save configuration:',
        default: `./examples/${basicInfo.id}.json`
      }
    ]);
    
    const fullPath = path.resolve(configPath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, JSON.stringify(config, null, 2));
    
    console.log(chalk.green(`Configuration saved to: ${fullPath}`));
  }
  
  return config;
}

// Run the main function
main();

// Made with Bob
