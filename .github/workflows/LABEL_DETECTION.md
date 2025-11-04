# Intelligent Label Detection System

## How It Works

The validation workflow now **intelligently detects** which pathway an issue belongs to by parsing the issue content itself, not just relying on template labels.

### Detection Priority

1. **Primary Method: Parse Issue Body** 🔍
   - Searches for checked checkbox: `- [x] Path 1 submission`, `- [x] Path 2 submission`, or `- [x] Path 3 submission`
   - This is the most reliable method as it comes directly from user input

2. **Fallback Method: Check Template Labels** 🏷️
   - If no checkbox is found, falls back to checking labels:
     - `pathway: observable-estimations` → Path 1
     - `pathway: variational-problems` → Path 2
     - `pathway: classically-verifiable` → Path 3

3. **Failure Mode: Warning Comment** ⚠️
   - If neither method detects a path, posts a warning to the issue

## What Gets Applied

When a path is detected, the workflow automatically:

✅ **Applies the label** `Path N` to the issue (where N = 1, 2, or 3)
✅ **Posts a comment** showing which path was detected
✅ **Validates the circuit** exists in the correct pathway directory
✅ **Adds status labels**: `validated` or `needs-review`

## Example Detection Flow

### User Creates Issue:
```markdown
### Check the Path submission

- [x] Path 2 submission

### Circuit

lih_molecule

### Energy

-7.8823
...
```

### Workflow Detects:
1. ✅ Finds `- [x] Path 2 submission` checkbox in issue body
2. ✅ Applies label: `Path 2`
3. ✅ Maps to pathway: `variational_problems`
4. ✅ Checks if circuit exists in `problems/variational_problems/`
5. ✅ Posts validation result comment

## Benefits

### 🎯 More Accurate
- Reads directly from user's checkbox selection
- Less prone to template misconfiguration

### 🔄 Flexible Fallback
- Still works if checkbox is missing
- Uses template labels as backup

### 🔍 Easy to Filter
- Issues automatically tagged with simple, readable labels
- Filter by: `label:"Path 1"`, `label:"Path 2"`, `label:"Path 3"`

### 🤖 Fully Automated
- No manual labeling required
- Works even if user doesn't select proper template (with fallback)

## For Users

When creating a submission:

1. ✅ Select the correct pathway template
2. ✅ **Check the "Path N submission" checkbox** (most important!)
3. ✅ Fill in all required fields
4. ✅ Submit the issue

The workflow will automatically:
- Detect your path selection
- Apply the appropriate label
- Validate your submission
- Provide feedback

## For Maintainers

To find submissions by path:

```
# All Path 1 submissions
label:"Path 1"

# Path 2 submissions needing review
label:"Path 2" label:"needs-review"

# All validated submissions
label:"validated"

# Path 3 incomplete submissions
label:"Path 3" label:"incomplete"
```

## Technical Details

### Regex Pattern Used:
```javascript
/- \[x\] Path 1 submission/i
/- \[x\] Path 2 submission/i
/- \[x\] Path 3 submission/i
```

### Label Mapping:
```javascript
{
  1: 'observable_estimations',
  2: 'variational_problems',
  3: 'classically_verifiable'
}
```

### Applied Labels:
- `Path 1` → Observable Estimations
- `Path 2` → Variational Problems
- `Path 3` → Classically Verifiable

## Troubleshooting

### Label Not Applied?
1. Check that the checkbox was checked (not just unchecked)
2. Verify the checkbox text matches exactly: `Path N submission`
3. Look at workflow logs in Actions tab for detection messages

### Wrong Label Applied?
1. Edit the issue
2. Uncheck the wrong path checkbox
3. Check the correct path checkbox
4. Save - workflow will re-run and update labels

### No Path Detected?
1. Ensure you used one of the official templates
2. Check that template labels are present: `submission`
3. Manually check the correct path checkbox and save
