#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Checks if openspec CLI is installed and provides installation instructions if not found.

.DESCRIPTION
    This script verifies the presence of the openspec CLI tool on the system.
    If not found, it outputs the commands needed to install it and its dependencies.

.NOTES
    File: check-openspec.ps1
    Author: Generated for Haspataal project
    Date: 2026-06-29
#>

param(
    [switch]$Install,
    [switch]$Verbose
)

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Check-Command {
    param([string]$Command, [string]$VersionFlag = '--version')
    try {
        $result = & $Command $VersionFlag 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $result.Trim()
        }
    } catch {
        return $null
    }
    return $null
}

Write-Info "Checking for openspec CLI installation..."

# Check for openspec CLI
$openspecVersion = Check-Command 'openspec'
if ($openspecVersion) {
    Write-Success "openspec CLI found: $openspecVersion"
    exit 0
}

# Check alternative locations
$altPaths = @(
    "$env:USERPROFILE\.openspec\bin\openspec.exe",
    "$env:LOCALAPPDATA\openspec\bin\openspec.exe",
    "$env:APPDATA\npm\openspec.cmd",
    "$env:APPDATA\npm\openspec.exe",
    "$env:USERPROFILE\scoop\apps\openspec\current\openspec.exe"
)

foreach ($path in $altPaths) {
    if (Test-Path $path) {
        $openspecVersion = Check-Command $path
        if ($openspecVersion) {
            Write-Success "openspec CLI found at: $path ($openspecVersion)"
            Write-Warning "Add to PATH: `$env:PATH += ';$(Split-Path $path)'"
            exit 0
        }
    }
}

Write-Warning "openspec CLI not found on system."

Write-Host ""
Write-Host "========================================"
Write-Host "  INSTALLATION INSTRUCTIONS"
Write-Host "========================================"
Write-Host ""

Write-Info "Option 1: Install via npm (Recommended)"
Write-Host "  npm install -g @openspec/cli"
Write-Host ""

Write-Info "Option 2: Install via Scoop (Windows)"
Write-Host "  scoop install openspec"
Write-Host ""

Write-Info "Option 3: Install via Homebrew (macOS/Linux)"
Write-Host "  brew install openspec/tap/openspec"
Write-Host ""

Write-Info "Option 4: Install via binary release"
Write-Host "  # Download from: https://github.com/openspec/openspec/releases"
Write-Host "  # Extract and add to PATH"
Write-Host ""

Write-Info "Required dependencies:"
Write-Host "  - Node.js 18+ (for npm install)"
Write-Host "  - Git (for version control integration)"
Write-Host ""

Write-Info "Post-installation verification:"
Write-Host "  openspec --version"
Write-Host "  openspec --help"
Write-Host ""

if ($Install) {
    Write-Info "Attempting automatic installation via npm..."
    try {
        npm install -g @openspec/cli
        $newVersion = Check-Command 'openspec'
        if ($newVersion) {
            Write-Success "openspec CLI installed successfully: $newVersion"
        } else {
            Write-Error "Installation may have succeeded but openspec not in PATH."
            Write-Host "  Restart your shell or add npm global bin to PATH."
        }
    } catch {
        Write-Error "Automatic installation failed: $_"
        Write-Host "  Please run manually: npm install -g @openspec/cli"
    }
} else {
    Write-Info "To auto-install, re-run with: .\check-openspec.ps1 -Install"
}

Write-Host ""
Write-Info "Related files for Haspataal project:"
Write-Host "  - .openspec/ (project configuration)"
Write-Host "  - openspec.json (CLI config)"
Write-Host "  - .github/workflows/openspec.yml (CI integration)"
Write-Host ""

exit 1