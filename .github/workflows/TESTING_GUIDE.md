# Testing the Validation Workflow

## How to Test the Workflow

### Method 1: Create a Test Issue Using a Template

1. Go to your repository's Issues tab
2. Click "New Issue"
3. Select one of the pathway templates (e.g., "Path 2 - Variational Problems Submission")
4. Fill in the required fields:
   - **Circuit**: Use an existing circuit ID (e.g., "some_hamiltonian")
   - **Energy**: Any number (e.g., "-7.8823")
   - **Method**: Add a link or description
   - **Institution**: Your institution name
   - **Quantum Time (seconds)**: Any number (e.g., "5.2")
   - **Quantum Hardware**: Any hardware name (e.g., "IBM Heron r2")
   - **Submission Date**: Today's date (e.g., "2025-10-29")
5. Submit the issue
6. Wait 1-2 minutes for the workflow to run

### Method 2: Manually Add Labels to Existing Issue

1. Open an existing issue
2. Add these labels:
   - `submission`
   - `pathway: variational-problems` (or another pathway)
3. The workflow will trigger automatically
4. Check the "Actions" tab to see the workflow run

### Method 3: Edit an Existing Submission

1. Open an issue that already has submission labels
2. Click "Edit" and make a change
3. Save the changes
4. The workflow will trigger on the edit

## Checking Workflow Results

### In the Actions Tab:
1. Go to the "Actions" tab in your repository
2. Click on the "Validate Submission" workflow
3. You should see recent runs
4. Click on a run to see the details
5. Click on the "validate" job to see logs

### Expected Behavior:

**For a submission issue:**
- ✅ Workflow runs successfully
- ✅ Adds the appropriate "Path N submission" label
- ✅ Posts a validation comment on the issue
- ✅ Adds either `validated` or `needs-review` label

**For a non-submission issue:**
- ✅ Workflow runs but exits early
- ✅ Logs show "Not a submission issue, skipping validation"
- ✅ No comments or labels added

## Troubleshooting

### "This job was skipped"
**Fixed!** The workflow no longer has a job-level condition. It will always run but exit early for non-submission issues.

### Workflow doesn't run at all
- Check that GitHub Actions are enabled for the repository
- Verify the workflow file is in `.github/workflows/` directory
- Check that the file has `.yml` or `.yaml` extension

### Workflow runs but doesn't add labels
- Check that the GitHub Actions bot has permission to add labels
- In repository Settings → Actions → General → Workflow permissions
- Ensure "Read and write permissions" is selected

### Circuit validation always fails
- Verify the circuit ID exists in `problems/{pathway}/` directory
- Check the circuit ID spelling matches exactly
- Ensure `problems.json` file exists in `data/paths/{pathway}/`

## Example Test Issue Body

```markdown
### Circuit

some_hamiltonian

### Energy

-7.8823

### Bounds (Low)

-0.001

### Bounds (High)

+0.001

### Method

Testing the validation workflow

### Institution

Test University

### Quantum Time (seconds)

5.2

### Classical Time (seconds)

9000

### Quantum Hardware

IBM Heron r2

### Classical Hardware

AMD EPYC 7763

### Submission Date

2025-10-29

### Validation

- [x] Method is variational (energy is upper bound)
- [x] Method documentation provided (paper/code/explanation)
- [x] Results are reproducible
```

## Expected Workflow Output

### Step 1: Validate Pathway Assignment
```
✅ Detected pathway: variational_problems
✅ Added label: "Path 2 submission"
✅ Circuit ID: some_hamiltonian
⚠️ Circuit not found in repository (expected for test)
✅ Added label: "needs-review"
✅ Posted validation comment
```

### Step 2: Validate Required Fields
```
✅ All required fields present
```

## Manual Testing Checklist

- [ ] Create issue using Path 1 template
- [ ] Create issue using Path 2 template
- [ ] Create issue using Path 3 template
- [ ] Verify "Path N submission" labels are added
- [ ] Verify validation comments appear
- [ ] Edit an issue and verify workflow runs again
- [ ] Create issue without template (should skip validation)
- [ ] Verify workflow doesn't fail on non-submission issues

## Need Help?

Check the workflow logs in the Actions tab for detailed information about what happened during each run.
