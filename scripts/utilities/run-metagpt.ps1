# MetaGPT Runner for Haspataal
# This script executes MetaGPT with optimized configurations for the healthcare project.

param (
    [string]$Idea = ""
)

if ($Idea -eq "") {
    Write-Host "Usage: ./scripts/run-metagpt.ps1 -Idea 'Your project idea here'" -ForegroundColor Red
    exit
}

# Define configuration paths
$CONFIG_PATH = ".metagpt/config2.yaml"
$SOP_PATH = ".claude/METAGPT_SOP.md"

# Verify MetaGPT is installed
if (!(Get-Command metagpt -ErrorAction SilentlyContinue)) {
    Write-Host "MetaGPT is not installed. Please install it with: pip install metagpt" -ForegroundColor Yellow
    exit
}

Write-Host "--- Running MetaGPT with Haspataal Optimized Environment ---" -ForegroundColor Cyan
Write-Host "Config: $CONFIG_PATH"
Write-Host "SOP: $SOP_PATH"
Write-Host "Idea: $Idea"
Write-Host "-------------------------------------------------------------"

# Execute MetaGPT
# We use config2.yaml for hybrid routing (Groq for reasoning, Ollama for code)
# We include the SOP specifically for healthcare compliance
metagpt $Idea --config $CONFIG_PATH --inc-sop-path $SOP_PATH

Write-Host "--- MetaGPT Execution Complete ---" -ForegroundColor Green
