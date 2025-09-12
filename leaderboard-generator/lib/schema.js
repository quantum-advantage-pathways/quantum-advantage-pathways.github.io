/**
 * JSON Schema for validating leaderboard configurations
 */

export const leaderboardSchema = {
  type: "object",
  required: ["id", "title", "shortDescription", "columns", "visualization", "content"],
  properties: {
    id: {
      type: "string",
      pattern: "^[a-z0-9_-]+$",
      description: "URL-friendly identifier for the leaderboard"
    },
    title: {
      type: "string",
      description: "Display title for the leaderboard"
    },
    shortDescription: {
      type: "string",
      description: "Brief description shown in the hero section"
    },
    longDescription: {
      type: "string",
      description: "Detailed description of the leaderboard"
    },
    navigation: {
      type: "object",
      properties: {
        position: {
          type: "integer",
          description: "Position in the navigation menu (0-based index)"
        }
      }
    },
    initialStats: {
      type: "object",
      description: "Initial statistics to display in the dashboard",
      additionalProperties: true
    },
    columns: {
      type: "array",
      description: "Column definitions for the leaderboard table",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "name", "type"],
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the column"
          },
          name: {
            type: "string",
            description: "Display name for the column"
          },
          type: {
            type: "string",
            enum: ["number", "text", "percentage", "time", "hardware"],
            description: "Data type for the column"
          },
          width: {
            type: "string",
            description: "CSS width for the column"
          },
          className: {
            type: "string",
            description: "CSS class for the column"
          },
          sortable: {
            type: "boolean",
            description: "Whether the column is sortable"
          },
          defaultSort: {
            type: "boolean",
            description: "Whether this column is the default sort column"
          },
          sortDirection: {
            type: "string",
            enum: ["asc", "desc"],
            description: "Default sort direction"
          },
          formatting: {
            type: "object",
            description: "Formatting rules for the column",
            properties: {
              thresholds: {
                type: "array",
                items: {
                  type: "object",
                  required: ["value", "class"],
                  properties: {
                    value: {
                      type: "number",
                      description: "Threshold value"
                    },
                    class: {
                      type: "string",
                      description: "CSS class to apply when value meets threshold"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    initialEntries: {
      type: "array",
      description: "Initial entries for the leaderboard",
      items: {
        type: "object",
        description: "A leaderboard entry",
        additionalProperties: true
      }
    },
    visualization: {
      type: "object",
      description: "Configuration for the data visualization",
      required: ["type", "xAxis", "yAxis", "dataPoints"],
      properties: {
        type: {
          type: "string",
          enum: ["scatter", "bar", "line"],
          description: "Type of visualization"
        },
        xAxis: {
          type: "object",
          required: ["field", "label"],
          properties: {
            field: {
              type: "string",
              description: "Data field to use for the x-axis"
            },
            label: {
              type: "string",
              description: "Label for the x-axis"
            },
            min: {
              type: "number",
              description: "Minimum value for the x-axis"
            },
            max: {
              type: "number",
              description: "Maximum value for the x-axis"
            },
            ticks: {
              type: "array",
              items: {
                type: "number"
              },
              description: "Tick positions for the x-axis"
            },
            tickLabels: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Labels for the ticks on the x-axis"
            }
          }
        },
        yAxis: {
          type: "object",
          required: ["field", "label"],
          properties: {
            field: {
              type: "string",
              description: "Data field to use for the y-axis"
            },
            label: {
              type: "string",
              description: "Label for the y-axis"
            },
            min: {
              type: "number",
              description: "Minimum value for the y-axis"
            },
            max: {
              type: "number",
              description: "Maximum value for the y-axis"
            },
            ticks: {
              type: "array",
              items: {
                type: "number"
              },
              description: "Tick positions for the y-axis"
            },
            tickLabels: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Labels for the ticks on the y-axis"
            }
          }
        },
        dataPoints: {
          type: "object",
          required: ["categoryField", "categories"],
          properties: {
            categoryField: {
              type: "string",
              description: "Field to use for categorizing data points"
            },
            categories: {
              type: "object",
              description: "Category definitions",
              additionalProperties: {
                type: "object",
                required: ["shape", "color", "label"],
                properties: {
                  shape: {
                    type: "string",
                    enum: ["circle", "square", "triangle"],
                    description: "Shape of the data point"
                  },
                  color: {
                    type: "string",
                    description: "Color of the data point"
                  },
                  label: {
                    type: "string",
                    description: "Label for the category in the legend"
                  }
                }
              }
            }
          }
        },
        referenceLine: {
          type: "object",
          properties: {
            x: {
              type: "number",
              description: "X position for a vertical reference line"
            },
            y: {
              type: "number",
              description: "Y position for a horizontal reference line"
            },
            label: {
              type: "string",
              description: "Label for the reference line"
            },
            style: {
              type: "string",
              enum: ["solid", "dashed", "dotted"],
              description: "Line style for the reference line"
            }
          }
        }
      }
    },
    content: {
      type: "object",
      description: "Additional content sections for the leaderboard page",
      required: ["sections"],
      properties: {
        sections: {
          type: "array",
          items: {
            type: "object",
            required: ["title", "type"],
            properties: {
              title: {
                type: "string",
                description: "Section title"
              },
              type: {
                type: "string",
                enum: ["text", "cards", "grid"],
                description: "Section type"
              },
              content: {
                type: "string",
                description: "Text content for text sections"
              },
              cards: {
                type: "array",
                items: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: {
                      type: "string",
                      description: "Card title"
                    },
                    content: {
                      type: "string",
                      description: "Card content"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    customCss: {
      type: "string",
      description: "Custom CSS to include in the leaderboard page"
    }
  }
};

export default leaderboardSchema;

// Made with Bob
