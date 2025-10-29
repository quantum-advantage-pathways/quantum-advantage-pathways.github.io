# Issue Template Validation System

This directory contains GitHub issue templates for pathway problem submissions. The system ensures that submissions are correctly tagged and validated automatically.

## How Pathway Tagging Works

### 1. **Automatic Label Assignment**

When a user creates a new issue using one of the templates, GitHub automatically applies the appropriate labels:

- **Path 1 - Observable Estimations**: Automatically tagged with:
  - `pathway: observable-estimations`
  - `submission`

- **Path 2 - Variational Problems**: Automatically tagged with:
  - `pathway: variational-problems`
  - `submission`

- **Path 3 - Classically Verifiable**: Automatically tagged with:
  - `pathway: classically-verifiable`
  - `submission`

### 2. **Template Chooser Configuration**

The `config.yml` file:
- Disables blank issues (forces template use)
- Provides helpful links to documentation
- Guides users to the correct resources

### 3. **Automated Validation Workflow**

The GitHub Action workflow (`.github/workflows/validate-submission.yml`) automatically:

#### ✅ **Checks Pathway Assignment**
- Verifies that the issue has a pathway label
- Ensures the correct template was used
- Warns if pathway label is missing

#### ✅ **Validates Circuit ID**
- Extracts the Circuit ID from the issue body
- Checks if the circuit exists in the correct pathway directory
- Searches in:
  - `problems/{pathway}/{circuit_id}.qasm`
  - `problems/{pathway}/{circuit_id}.json`
  - `data/paths/{pathway}/problems.json`

#### ✅ **Validates Required Fields**
- Checks that all required fields are completed:
  - Circuit
  - Method
  - Institution
  - Quantum Time
  - Quantum Hardware
  - Submission Date
- Adds `incomplete` label if fields are missing

#### ✅ **Provides Feedback**
- **Success**: Adds `validated` label and posts confirmation comment
- **Circuit Not Found**: Posts warning with troubleshooting steps and adds `needs-review` label
- **Missing Fields**: Posts list of incomplete fields and adds `incomplete` label

### 4. **How Users Know They're Using the Right Template**

1. **Template Selection Screen**: When creating a new issue, users see three clear options with icons:
   - 📊 Observable Estimations Submission
   - ⚛️ Variational Problems Submission
   - ✅ Classically Verifiable Problems Submission

2. **Template Header**: Each template displays the pathway name prominently at the top

3. **Circuit ID Field**: Users must provide the circuit ID, which is validated against the pathway

4. **Validation Comments**: The bot provides immediate feedback if something is wrong

## Validation Flow

```
User Creates Issue
        ↓
Template Auto-Applies Labels
        ↓
GitHub Action Triggers
        ↓
Validates Pathway Label ──→ Missing? ──→ Warning Comment
        ↓ Present
Extracts Circuit ID ──→ Missing? ──→ Warning Comment
        ↓ Present
Checks Circuit Exists in Pathway
        ↓
   ┌────┴────┐
   ↓         ↓
 Exists   Not Found
   ↓         ↓
✅ Label  ⚠️ Label
Validated  needs-review
   ↓         ↓
Success   Warning
Comment   Comment
```

## Label System

### Automatic Labels (from templates)
- `pathway: observable-estimations`
- `pathway: variational-problems`
- `pathway: classically-verifiable`
- `submission`

### Bot-Applied Labels
- `validated` - Submission passed all validation checks
- `needs-review` - Circuit not found or other issues detected
- `incomplete` - Required fields are missing

## Maintainer Workflow

1. **Validated Issues** (`validated` label):
   - Circuit exists in correct pathway
   - All required fields completed
   - Ready for technical review

2. **Needs Review** (`needs-review` label):
   - Circuit not found (might be new circuit submission)
   - Wrong pathway possibly selected
   - Requires manual verification

3. **Incomplete** (`incomplete` label):
   - Missing required fields
   - User needs to edit and complete the issue

## For Contributors

To ensure your submission is validated correctly:

1. ✅ Use the appropriate official template for your pathway
2. ✅ Fill in all required fields (marked with *)
3. ✅ Use the correct Circuit ID from the problems directory
4. ✅ Wait for the validation bot to comment (usually within 1-2 minutes)
5. ✅ Address any warnings or issues raised by the bot
6. ✅ Check that your issue has the `validated` label before awaiting review

## Testing the Validation

To test the validation system:
1. Create a test issue using one of the templates
2. Fill in the Circuit ID field with an existing circuit
3. Wait for the bot to comment
4. Check the applied labels

## Troubleshooting

**Issue: No validation comment appears**
- Check if GitHub Actions are enabled for the repository
- Verify the workflow file syntax is correct
- Check Actions tab for workflow run logs

**Issue: Wrong pathway label applied**
- User must have created issue without using a template
- Close issue and ask user to use official templates

**Issue: Circuit validation fails for valid circuit**
- Check circuit ID spelling
- Verify circuit exists in `problems/{pathway}/` directory
- Check if circuit is listed in `data/paths/{pathway}/problems.json`
