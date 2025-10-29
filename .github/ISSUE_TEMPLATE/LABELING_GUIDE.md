# Issue Labeling Guide

## How Issues Are Automatically Tagged

When a submission issue is created, labels are applied automatically in two stages:

### Stage 1: Template Labels (Immediate)
When a user selects an issue template and submits, GitHub immediately applies:

| Template | Auto-Applied Labels |
|----------|-------------------|
| 📊 Path 1 - Observable Estimations | `pathway: observable-estimations`, `submission` |
| ⚛️ Path 2 - Variational Problems | `pathway: variational-problems`, `submission` |
| ✅ Path 3 - Classically Verifiable | `pathway: classically-verifiable`, `submission` |

### Stage 2: Workflow Labels (Within 1-2 minutes)
GitHub Actions workflow automatically adds:

| Detected Pathway | Path Label Added |
|-----------------|------------------|
| `pathway: observable-estimations` | **`Path 1 submission`** |
| `pathway: variational-problems` | **`Path 2 submission`** |
| `pathway: classically-verifiable` | **`Path 3 submission`** |

Plus validation labels:
- ✅ `validated` - Circuit exists, all validations passed
- ⚠️ `needs-review` - Circuit not found or issues detected
- 📝 `incomplete` - Required fields missing

## Complete Label Reference

### Pathway Identification Labels
- `pathway: observable-estimations` - Technical pathway identifier
- `pathway: variational-problems` - Technical pathway identifier
- `pathway: classically-verifiable` - Technical pathway identifier

### Human-Readable Path Labels
- `Path 1 submission` - Observable Estimations submission
- `Path 2 submission` - Variational Problems submission
- `Path 3 submission` - Classically Verifiable submission

### Status Labels
- `submission` - Marks this as a submission issue
- `validated` - Passed automated validation
- `needs-review` - Requires manual review
- `incomplete` - Missing required information

## Example: Complete Label Set

When a **Path 2 - Variational Problems** submission is created and validated, it will have:

```
✅ pathway: variational-problems    (from template)
✅ submission                        (from template)
✅ Path 2 submission                 (from workflow)
✅ validated                         (from workflow - if passes)
```

## For Filtering Issues

### Find all Path 1 submissions:
- Filter by: `label:"Path 1 submission"`

### Find all Path 2 submissions that need review:
- Filter by: `label:"Path 2 submission" label:"needs-review"`

### Find all validated submissions:
- Filter by: `label:"validated"`

### Find all incomplete Path 3 submissions:
- Filter by: `label:"Path 3 submission" label:"incomplete"`

## Why Two Types of Pathway Labels?

1. **Technical Labels** (`pathway: X`):
   - Used by automation and scripts
   - Stable identifier that won't change
   - Used in workflow conditions

2. **Human-Readable Labels** (`Path N submission`):
   - Easy to understand at a glance
   - Great for filtering and organizing
   - User-friendly in GitHub interface
   - Can be used for project boards and automation

## Maintainer Actions

Maintainers can add additional labels as needed:
- `approved` - Submission approved for inclusion
- `rejected` - Submission rejected with explanation
- `duplicate` - Duplicate submission
- `question` - Requires clarification from submitter

These labels work alongside the automatic labels to manage the submission workflow.
