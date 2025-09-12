/**
 * Template engine for leaderboard generator
 */

import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import prettier from 'prettier';

/**
 * Registers Handlebars helpers
 */
function registerHelpers() {
  // Helper to format a number as a percentage
  Handlebars.registerHelper('percentage', function(value) {
    return `${value}%`;
  });
  
  // Helper to join array items with a separator
  Handlebars.registerHelper('join', function(array, separator) {
    return array.join(separator);
  });
  
  // Helper for conditional rendering
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  });
  
  // Helper for greater than comparison
  Handlebars.registerHelper('ifGt', function(arg1, arg2, options) {
    return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
  });
  
  // Helper for less than comparison
  Handlebars.registerHelper('ifLt', function(arg1, arg2, options) {
    return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
  });
}

// Removed loadTemplate function as it's now handled directly in renderTemplate

/**
 * Generates HTML content from a template and data
 * @param {string} templatePath - Path to the template file
 * @param {Object} data - Data to use for template rendering
 * @returns {string} - Rendered HTML content
 */
export async function renderTemplate(templatePath, data) {
  try {
    // Register helpers
    registerHelpers();
    
    // Load and compile the template
    const templateContent = await fs.readFile(templatePath, 'utf8');
    
    // Use noEscape option to prevent HTML escaping
    const template = Handlebars.compile(templateContent, { noEscape: true });
    
    // Render the template with the provided data
    const renderedContent = template(data);
    
    // Skip formatting to avoid HTML entity escaping issues
    return renderedContent;
  } catch (error) {
    throw new Error(`Template rendering failed: ${error.message}`);
  }
}

/**
 * Generates navigation links HTML
 * @param {Object} config - Leaderboard configuration
 * @param {string} currentPath - Current file path
 * @returns {string} - HTML for navigation links
 */
export function generateNavigationLinks(config, currentPath) {
  const links = [
    { href: '../../', text: 'Overview', active: false },
    { href: '../../confidence_bounds.html', text: 'Confidence Bounds', active: false },
    { href: '../../algorithmic_methods.html', text: 'Algorithmic Methods', active: false },
    { href: '../../classical_verification.html', text: 'Classical Verification', active: false }
  ];
  
  // Add existing leaderboards
  // This would typically come from scanning the leaderboard directory
  // For now, we'll just add the Peak Circuits leaderboard
  links.push({ href: '../peak_circuits/', text: 'Peak Circuits', active: false });
  
  // Add the new leaderboard at the specified position or at the end
  const position = config.navigation?.position !== undefined ? 
    config.navigation.position + 4 : // +4 to account for the main navigation items
    links.length;
  
  links.splice(position, 0, {
    href: './',
    text: config.title,
    active: true
  });
  
  // Generate the HTML
  return links.map(link => {
    const activeClass = link.active ? ' class="active"' : '';
    return `<li><a href="${link.href}"${activeClass}>${link.text}</a></li>`;
  }).join('\n                ');
}

/**
 * Generates table headers HTML
 * @param {Array} columns - Column definitions
 * @returns {string} - HTML for table headers
 */
export function generateTableHeaders(columns) {
  return columns.map(column => {
    return `<th>${column.name}</th>`;
  }).join('\n                            ');
}

/**
 * Generates chart axis labels HTML
 * @param {Object} axis - Axis configuration
 * @param {string} type - 'x' or 'y'
 * @returns {string} - HTML for axis labels
 */
export function generateAxisLabels(axis, type) {
  if (!axis.ticks || !axis.tickLabels || axis.ticks.length !== axis.tickLabels.length) {
    return '';
  }
  
  return axis.ticks.map((tick, index) => {
    const label = axis.tickLabels[index];
    
    if (type === 'x') {
      // Calculate x position based on the tick value
      const xPos = 80 + ((tick - axis.min) / (axis.max - axis.min)) * 670;
      return `<text x="${xPos}" y="375" class="axis-tick" text-anchor="middle">${label}</text>`;
    } else {
      // Calculate y position based on the tick value
      const yPos = 350 - ((tick - axis.min) / (axis.max - axis.min)) * 300;
      return `<text x="30" y="${yPos}" class="axis-tick" text-anchor="end">${label}</text>`;
    }
  }).join('\n                            ');
}

/**
 * Generates reference line HTML
 * @param {Object} referenceLine - Reference line configuration
 * @returns {string} - HTML for reference line
 */
export function generateReferenceLine(referenceLine) {
  if (!referenceLine) {
    return '';
  }
  
  let html = '';
  
  if (referenceLine.y !== undefined) {
    // Calculate y position based on the visualization configuration
    let yMin = 0;
    let yMax = 100;
    
    if (referenceLine.visualization && referenceLine.visualization.yAxis) {
      yMin = referenceLine.visualization.yAxis.min;
      yMax = referenceLine.visualization.yAxis.max;
    }
    
    const yPos = 350 - ((referenceLine.y - yMin) / (yMax - yMin)) * 300;
    
    html += `<line x1="80" y1="${yPos}" x2="750" y2="${yPos}" class="reference-line"/>`;
    
    if (referenceLine.label) {
      html += `<text x="755" y="${yPos - 5}" class="axis-tick">${referenceLine.label}</text>`;
    }
  }
  
  if (referenceLine.x !== undefined) {
    // Calculate x position based on the visualization configuration
    let xMin = 0;
    let xMax = 100;
    
    if (referenceLine.visualization && referenceLine.visualization.xAxis) {
      xMin = referenceLine.visualization.xAxis.min;
      xMax = referenceLine.visualization.xAxis.max;
    }
    
    const xPos = 80 + ((referenceLine.x - xMin) / (xMax - xMin)) * 670;
    
    html += `<line x1="${xPos}" y1="50" x2="${xPos}" y2="350" class="reference-line"/>`;
    
    if (referenceLine.label) {
      html += `<text x="${xPos}" y="45" class="axis-tick" text-anchor="middle">${referenceLine.label}</text>`;
    }
  }
  
  return html;
}

/**
 * Generates legend items HTML
 * @param {Object} dataPoints - Data points configuration
 * @returns {string} - HTML for legend items
 */
export function generateLegendItems(dataPoints) {
  if (!dataPoints || !dataPoints.categories) {
    return '';
  }
  
  const categories = dataPoints.categories;
  
  return Object.keys(categories).map(key => {
    const category = categories[key];
    const legendClass = key.toLowerCase();
    
    return `
                        <div class="legend-item">
                            <div class="legend-${legendClass}"></div>
                            <span>${category.label}</span>
                        </div>`;
  }).join('\n');
}

/**
 * Generates content sections HTML
 * @param {Object} content - Content configuration
 * @returns {string} - HTML for content sections
 */
export function generateContentSections(content) {
  if (!content || !content.sections) {
    return '';
  }
  
  return content.sections.map(section => {
    let sectionHtml = `
        <section class="section">
            <div class="container">
                <h2>${section.title}</h2>`;
    
    if (section.type === 'text' && section.content) {
      sectionHtml += `
                <p>${section.content}</p>`;
    } else if (section.type === 'cards' && section.cards) {
      sectionHtml += `
                <div class="grid grid-${Math.min(section.cards.length, 3)}">`;
      
      section.cards.forEach(card => {
        sectionHtml += `
                    <div class="card">
                        <h3>${card.title}</h3>
                        <p>${card.content}</p>
                    </div>`;
      });
      
      sectionHtml += `
                </div>`;
    }
    
    sectionHtml += `
            </div>
        </section>`;
    
    return sectionHtml;
  }).join('\n');
}

/**
 * Generates JavaScript code for the leaderboard
 * @param {Object} config - Leaderboard configuration
 * @returns {string} - JavaScript code
 */
export function generateJavaScript(config) {
  return `
    // Load leaderboard data from JSON
    async function loadLeaderboardData() {
        try {
            const response = await fetch('../../leaderboard_data.json');
            const data = await response.json();
            
            // Get this leaderboard's data
            const leaderboardData = data["${config.id}"];
            
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
        
        if (!stats) {
            statsContainer.innerHTML = '<div class="error-message">No statistics available</div>';
            return;
        }
        
        let statsHtml = '';
        
        Object.keys(stats).forEach(key => {
            statsHtml += \`
                <div class="stat-card">
                    <div class="stat-number">\${stats[key]}</div>
                    <div class="stat-label">\${formatStatLabel(key)}</div>
                </div>
            \`;
        });
        
        statsContainer.innerHTML = statsHtml;
    }
    
    function formatStatLabel(key) {
        // Convert camelCase to Title Case with spaces
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    function populateLeaderboard(entries) {
        const tbody = document.getElementById('leaderboard-tbody');
        
        if (!entries || entries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="${config.columns.length}">No entries available</td></tr>';
            return;
        }
        
        tbody.innerHTML = entries.map(entry => {
            ${generateTableRowCode(config.columns)}
        }).join('');
    }

    function populatePerformanceChart(data) {
        const chartContainer = document.getElementById('chart-data-points');
        
        // Clear existing points
        chartContainer.innerHTML = '';
        
        if (!data || data.length === 0) {
            return;
        }
        
        data.forEach(entry => {
            ${generateChartPointsCode(config.visualization)}
        });
    }
    
    ${generateHelperFunctions(config)}

    // Load data when DOM is ready
    document.addEventListener('DOMContentLoaded', loadLeaderboardData);
  `;
}

/**
 * Generates code for table row rendering
 * @param {Array} columns - Column definitions
 * @returns {string} - JavaScript code for rendering table rows
 */
function generateTableRowCode(columns) {
  let code = `
            let row = '<tr>';
  `;
  
  columns.forEach(column => {
    if (column.id === 'rank') {
      code += `
            const rank = parseInt(entry.rank);
            const rankClass = rank <= 3 ? \`rank-\${rank}\` : 'rank-other';
            row += \`<td><span class="rank-badge \${rankClass}">\${entry.rank}</span></td>\`;`;
    } else {
      let valueCode = `entry.${column.id}`;
      
      // Add formatting based on column type
      if (column.formatting && column.formatting.thresholds) {
        code += `
            let ${column.id}Class = '';
            const ${column.id}Value = ${valueCode};
        `;
        
        column.formatting.thresholds.forEach(threshold => {
          code += `
            if (${column.id}Value >= ${threshold.value}) {
                ${column.id}Class = '${threshold.class}';
            }`;
        });
        
        code += `
            row += \`<td class="\${${column.id}Class}">\${${valueCode}}</td>\`;`;
      } else {
        code += `
            row += \`<td>\${${valueCode}}</td>\`;`;
      }
    }
  });
  
  code += `
            row += '</tr>';
            return row;`;
  
  return code;
}

/**
 * Generates code for chart points rendering
 * @param {Object} visualization - Visualization configuration
 * @returns {string} - JavaScript code for rendering chart points
 */
function generateChartPointsCode(visualization) {
  const xField = visualization.xAxis.field;
  const yField = visualization.yAxis.field;
  const categoryField = visualization.dataPoints.categoryField;
  
  return `
            // Get x and y values
            const xValue = entry.${xField};
            const yValue = entry.${yField};
            
            // Calculate positions on chart (chart dimensions: 80-750 x, 350-70 y)
            const xMin = ${visualization.xAxis.min};
            const xMax = ${visualization.xAxis.max};
            const yMin = ${visualization.yAxis.min};
            const yMax = ${visualization.yAxis.max};
            
            const x = Math.min(80 + ((xValue - xMin) / (xMax - xMin)) * 670, 750);
            const y = 350 - ((yValue - yMin) / (yMax - yMin)) * 280;
            
            // Determine category
            const category = entry.${categoryField};
            
            // Create point based on category
            ${generateCategoryPointsCode(visualization.dataPoints.categories)}
  `;
}

/**
 * Generates code for creating chart points based on categories
 * @param {Object} categories - Category definitions
 * @returns {string} - JavaScript code for creating chart points
 */
function generateCategoryPointsCode(categories) {
  let code = '';
  
  Object.keys(categories).forEach(key => {
    const category = categories[key];
    
    code += `
            if (category === '${key}') {`;
    
    if (category.shape === 'circle') {
      code += `
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', '8');
                circle.setAttribute('fill', 'none');
                circle.setAttribute('stroke', '${category.color}');
                circle.setAttribute('stroke-width', '3');
                
                // Add tooltip
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = \`\${entry.${key}}: \${xValue}, \${yValue}\`;
                circle.appendChild(title);
                
                chartContainer.appendChild(circle);`;
    } else if (category.shape === 'square') {
      code += `
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x - 8);
                rect.setAttribute('y', y - 8);
                rect.setAttribute('width', '16');
                rect.setAttribute('height', '16');
                rect.setAttribute('fill', '${category.color}');
                
                // Add tooltip
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = \`\${entry.${key}}: \${xValue}, \${yValue}\`;
                rect.appendChild(title);
                
                chartContainer.appendChild(rect);`;
    } else if (category.shape === 'triangle') {
      code += `
                const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                triangle.setAttribute('points', \`\${x},\${y-8} \${x-8},\${y+8} \${x+8},\${y+8}\`);
                triangle.setAttribute('fill', '${category.color}');
                
                // Add tooltip
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = \`\${entry.${key}}: \${xValue}, \${yValue}\`;
                triangle.appendChild(title);
                
                chartContainer.appendChild(triangle);`;
    }
    
    code += `
            }`;
  });
  
  return code;
}

/**
 * Generates helper functions for the JavaScript code
 * @param {Object} config - Leaderboard configuration
 * @returns {string} - JavaScript code for helper functions
 */
function generateHelperFunctions(config) {
  // Add any helper functions needed based on the configuration
  let code = '';
  
  // Add function to convert time strings to minutes if time field is used
  const timeColumn = config.columns.find(col => col.type === 'time');
  if (timeColumn) {
    code += `
    function convertTimeToMinutes(timeString) {
        // Handle different time formats: "5 min", "1h 25min", "2h 0min"
        const timeStr = timeString.toLowerCase();
        let totalMinutes = 0;
        
        // Extract hours
        const hourMatch = timeStr.match(/(\\d+)h/);
        if (hourMatch) {
            totalMinutes += parseInt(hourMatch[1]) * 60;
        }
        
        // Extract minutes
        const minMatch = timeStr.match(/(\\d+)\\s*min/);
        if (minMatch) {
            totalMinutes += parseInt(minMatch[1]);
        }
        
        return totalMinutes;
    }`;
  }
  
  // Add error handling function
  code += `
    function showErrorMessage() {
        const statsContainer = document.getElementById('stats-container');
        const tbody = document.getElementById('leaderboard-tbody');
        
        statsContainer.innerHTML = '<div class="error-message">Error loading statistics data</div>';
        tbody.innerHTML = '<tr><td colspan="${config.columns.length}">Error loading leaderboard data</td></tr>';
    }`;
  
  return code;
}

export default {
  renderTemplate,
  generateNavigationLinks,
  generateTableHeaders,
  generateAxisLabels,
  generateReferenceLine,
  generateLegendItems,
  generateContentSections,
  generateJavaScript
};

// Made with Bob
