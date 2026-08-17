# Haspataal Main Branch Protection Policy

To ensure production stability and security, the following branch protection rules must be applied to the `main` branch in the GitHub UI (Settings -> Branches -> Add protection rule).

## GitHub UI Settings

| Setting | Value | Rationale |
| :--- | :--- | :--- |
| **Branch name pattern** | `main` | Target branch |
| **Require a pull request before merging** | **YES** | Prevents direct commits to production |
| **Required approvals** | `1` | Ensures at least one peer reviewer has seen the code |
| **Require status checks to pass before merging** | **YES** | Blocks broken code from entering main |
| **Status checks to require** | `quality`, `test`, `security-scan` | Syncs with `ci.yml` automation jobs |
| **Require branches to be up to date before merging** | **YES** | Prevents integration issues with outdated code |
| **Block force pushes** | **YES** | Prevents overwriting history |
| **Block deletions** | **YES** | Prevents accidental deletion of the production branch |
| **Require linear history** | **YES** | Keeps a clean, easy-to-revert git history |
| **Include administrators** | **YES** | Enforces the same rules for repository owners |

---

## Programmatic Setup (GitHub CLI)

If you have the GitHub CLI installed and the appropriate permissions, you can apply these rules using the following command:

```bash
gh api -X PUT /repos/:owner/:repo/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=quality" \
  -f "required_status_checks[contexts][]=test" \
  -f "required_status_checks[contexts][]=security-scan" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1" \
  -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  -f "restrictions=null" \
  -f "allow_force_pushes=false" \
  -f "allow_deletions=false" \
  -f "required_linear_history=true"
```

*Note: Replace `:owner` and `:repo` with your actual GitHub organization/username and repository name.*
