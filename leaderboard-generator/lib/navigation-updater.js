/**
 * Navigation updater for leaderboard generator
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { glob } from 'glob';

/**
 * Updates navigation links in all HTML files
 * @param {Object} config - Leaderboard configuration
 * @param {string} baseDir - Base directory for the project
 * @returns {Promise<void>}
 */
export async function updateNavigation(config, baseDir) {
  try {
    console.log(chalk.blue('Updating navigation links in HTML files...'));
    
    // Find all HTML files
    const htmlFiles = await findHtmlFiles(baseDir);
    console.log(chalk.blue(`Found ${htmlFiles.length} HTML files to update`));
    
    // Update each file
    for (const htmlFile of htmlFiles) {
      await updateNavigationInFile(htmlFile, config, baseDir);
    }
    
    console.log(chalk.green('Navigation links updated successfully'));
  } catch (error) {
    console.error(chalk.red(`Error updating navigation: ${error.message}`));
    throw error;
  }
}

/**
 * Finds all HTML files in the project
 * @param {string} baseDir - Base directory for the project
 * @returns {Promise<string[]>} - Array of HTML file paths
 */
async function findHtmlFiles(baseDir) {
  try {
    // Find root HTML files
    const rootHtmlFiles = await glob('*.html', { cwd: baseDir });
    
    // Find leaderboard HTML files
    const leaderboardHtmlFiles = await glob('leaderboard/**/index.html', { cwd: baseDir });
    
    // Combine and return all HTML files
    return [...rootHtmlFiles, ...leaderboardHtmlFiles].map(file => path.join(baseDir, file));
  } catch (error) {
    console.error(chalk.red(`Error finding HTML files: ${error.message}`));
    throw error;
  }
}

/**
 * Updates navigation links in a single HTML file
 * @param {string} htmlFile - Path to the HTML file
 * @param {Object} config - Leaderboard configuration
 * @param {string} baseDir - Base directory for the project
 * @returns {Promise<void>}
 */
async function updateNavigationInFile(htmlFile, config, baseDir) {
  try {
    // Read the HTML file
    const htmlContent = await fs.readFile(htmlFile, 'utf8');
    
    // Find the navigation section
    const navSection = findNavigationSection(htmlContent);
    if (!navSection) {
      console.warn(chalk.yellow(`No navigation section found in ${htmlFile}`));
      return;
    }
    
    // Calculate the relative path to the new leaderboard
    const relativePath = calculateRelativePath(htmlFile, config.id, baseDir);
    
    // Check if the file is the new leaderboard's index.html
    const isNewLeaderboard = htmlFile.includes(`leaderboard/${config.id}/index.html`);
    
    // Insert the new link
    const updatedHtml = insertNavigationLink(
      htmlContent, 
      navSection, 
      config, 
      relativePath, 
      isNewLeaderboard
    );
    
    // Write the updated HTML file
    await fs.writeFile(htmlFile, updatedHtml);
    
    console.log(chalk.green(`Updated navigation in: ${path.relative(baseDir, htmlFile)}`));
  } catch (error) {
    console.error(chalk.red(`Error updating navigation in ${htmlFile}: ${error.message}`));
    throw error;
  }
}

/**
 * Finds the navigation section in HTML content
 * @param {string} htmlContent - HTML content
 * @returns {Object|null} - Navigation section information or null if not found
 */
function findNavigationSection(htmlContent) {
  const navRegex = /<nav class="nav">[\s\S]*?<ul class="nav-links">([\s\S]*?)<\/ul>[\s\S]*?<\/nav>/;
  const match = htmlContent.match(navRegex);
  
  if (!match) {
    return null;
  }
  
  return {
    fullNav: match[0],
    navLinks: match[1]
  };
}

/**
 * Calculates the relative path to the new leaderboard
 * @param {string} htmlFile - Path to the HTML file
 * @param {string} leaderboardId - ID of the new leaderboard
 * @param {string} baseDir - Base directory for the project
 * @returns {string} - Relative path to the new leaderboard
 */
function calculateRelativePath(htmlFile, leaderboardId, baseDir) {
  // Get the relative path from the base directory
  const relativePath = path.relative(baseDir, htmlFile);
  
  // For root HTML files
  if (!relativePath.includes(path.sep)) {
    return `leaderboard/${leaderboardId}/`;
  }
  
  // For existing leaderboard files
  if (relativePath.startsWith('leaderboard')) {
    // Count directory levels
    const levels = relativePath.split(path.sep).length - 2; // -2 for 'leaderboard' and the file itself
    
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

/**
 * Inserts a new navigation link in the HTML content
 * @param {string} htmlContent - HTML content
 * @param {Object} navSection - Navigation section information
 * @param {Object} config - Leaderboard configuration
 * @param {string} relativePath - Relative path to the new leaderboard
 * @param {boolean} isActive - Whether the link should be active
 * @returns {string} - Updated HTML content
 */
function insertNavigationLink(htmlContent, navSection, config, relativePath, isActive) {
  // Parse existing links to determine insertion position
  const linkRegex = /<li><a href="([^"]*)"([^>]*)>([^<]*)<\/a><\/li>/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(navSection.navLinks)) !== null) {
    links.push({
      href: match[1],
      attributes: match[2],
      text: match[3]
    });
  }
  
  // Create the new link
  const newLink = {
    href: relativePath,
    attributes: isActive ? ' class="active"' : '',
    text: config.title
  };
  
  // Determine insertion position based on config
  const position = config.navigation?.position !== undefined ? 
    config.navigation.position + 4 : // +4 to account for the main navigation items
    links.length;
  
  // Insert the new link
  const newLinks = [...links];
  
  // Check if the link already exists
  const existingIndex = newLinks.findIndex(link => link.text === config.title);
  if (existingIndex !== -1) {
    // Update the existing link
    newLinks[existingIndex] = newLink;
  } else {
    // Insert the new link
    newLinks.splice(position, 0, newLink);
  }
  
  // Rebuild the navigation HTML
  const newNavLinks = newLinks.map(link => 
    `<li><a href="${link.href}"${link.attributes}>${link.text}</a></li>`
  ).join('\n                ');
  
  // Replace the old navigation with the new one
  const newNav = navSection.fullNav.replace(navSection.navLinks, '\n                ' + newNavLinks + '\n            ');
  return htmlContent.replace(navSection.fullNav, newNav);
}

export default {
  updateNavigation
};

// Made with Bob
