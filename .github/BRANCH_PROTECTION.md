# Branch Protection Configuration

This document describes the branch protection rules configured for the ArbiSecure repository.

**Important:** The configuration in `branch-protection.json` is provided as specified in the requirements. The `allow_force_pushes` field structure may need adjustment depending on your GitHub environment (standard API vs. Enterprise) or API version.

## Configuration File

The branch protection settings are defined in `.github/branch-protection.json`.

## Protection Rules

### Pull Request Reviews
- **Required approving review count**: 1
  - At least one approval is required before merging a pull request
- **Dismiss stale reviews**: Enabled
  - When new commits are pushed, previous approvals are dismissed
- **Require code owner reviews**: Disabled
  - Code owner approval is not mandatory

### Administrative Enforcement
- **Enforce admins**: Enabled
  - These rules apply to repository administrators as well

### Push Restrictions
- **Restricted users**: alhadad-xyz
  - This is a whitelist: only the specified user can push directly to protected branches
  - Since enforce_admins is enabled, administrators must also follow this restriction

### Force Push Settings
- **Allow force pushes**: Enabled for specific users
  - User `alhadad-xyz` is allowed to force push to protected branches

### Other Settings
- **Required linear history**: Disabled
  - Merge commits are allowed
- **Allow deletions**: Disabled
  - Protected branches cannot be deleted
- **Required conversation resolution**: Enabled
  - All conversations must be resolved before merging

## Applying These Rules

To apply these branch protection rules to a branch (e.g., `main`):

1. Navigate to the repository on GitHub
2. Go to Settings > Branches
3. Click "Add branch protection rule"
4. Enter the branch name pattern (e.g., `main`)
5. Configure the settings according to the values in `branch-protection.json`

Alternatively, use the GitHub API:

```bash
curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/alhadad-xyz/ArbiSecure/branches/main/protection \
  -d @.github/branch-protection.json
```

**Note:** The `allow_force_pushes` field structure with users/teams/apps may be specific to GitHub Enterprise or a newer API version. If using the standard GitHub REST API, you may need to adjust this field to a boolean value and manage force push permissions through other means.

## Benefits

These protection rules ensure:
- Code quality through required reviews
- Protection against accidental deletions
- Conversation resolution before merging
- Controlled access to the protected branches
- Fresh reviews after code changes
