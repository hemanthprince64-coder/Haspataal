#!/bin/bash
# check-openspec.sh - Cross-platform script to verify openspec CLI installation
# Works on Linux, macOS, and Windows (Git Bash/WSL)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${CYAN}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

check_command() {
    local cmd="$1"
    local version_flag="${2:---version}"
    if command -v "$cmd" >/dev/null 2>&1; then
        local version
        version=$("$cmd" "$version_flag" 2>/dev/null | head -n1)
        echo "$version"
        return 0
    fi
    return 1
}

log_info "Checking for openspec CLI installation..."

# Primary check
if version=$(check_command openspec); then
    log_success "openspec CLI found: $version"
    exit 0
fi

# Check alternative paths
alt_paths=(
    "$HOME/.openspec/bin/openspec"
    "$HOME/.local/bin/openspec"
    "/usr/local/bin/openspec"
    "/opt/homebrew/bin/openspec"
)

for path in "${alt_paths[@]}"; do
    if [[ -x "$path" ]]; then
        if version=$(check_command "$path"); then
            log_success "openspec CLI found at: $path ($version)"
            log_warn "Add to PATH: export PATH=\"\$PATH:$(dirname "$path")\""
            exit 0
        fi
    fi
done

log_warn "openspec CLI not found on system."
echo
echo "========================================"
echo "  INSTALLATION INSTRUCTIONS"
echo "========================================"
echo

log_info "Option 1: Install via npm (Recommended)"
echo "  npm install -g @openspec/cli"
echo

log_info "Option 2: Install via Homebrew (macOS/Linux)"
echo "  brew install openspec/tap/openspec"
echo

log_info "Option 3: Install via binary release"
echo "  # Download from: https://github.com/openspec/openspec/releases"
echo "  # Extract and add to PATH"
echo

log_info "Required dependencies:"
echo "  - Node.js 18+ (for npm install)"
echo "  - Git (for version control integration)"
echo

log_info "Post-installation verification:"
echo "  openspec --version"
echo "  openspec --help"
echo

# Check if --install flag provided
if [[ "${1:-}" == "--install" ]] || [[ "${1:-}" == "-i" ]]; then
    log_info "Attempting automatic installation via npm..."
    if command -v npm >/dev/null 2>&1; then
        if npm install -g @openspec/cli; then
            if version=$(check_command openspec); then
                log_success "openspec CLI installed successfully: $version"
                exit 0
            else
                log_error "Installation may have succeeded but openspec not in PATH."
                echo "  Restart your shell or add npm global bin to PATH."
                echo "  npm bin -g  # to find the bin directory"
            fi
        else
            log_error "Automatic installation failed."
            echo "  Please run manually: npm install -g @openspec/cli"
        fi
    else
        log_error "npm not found. Please install Node.js first."
        echo "  Visit: https://nodejs.org/"
    fi
else
    log_info "To auto-install, re-run with: $0 --install"
fi

echo
log_info "Related files for Haspataal project:"
echo "  - .openspec/ (project configuration)"
echo "  - openspec.json (CLI config)"
echo "  - .github/workflows/openspec.yml (CI integration)"

exit 1