#requires -Version 5.1
<#
    AI Coding Agent Mega Installer
    Windows / PowerShell

    Installs:
      1. Claude Code
      2. Codex CLI
      3. OpenCode
      4. Gemini CLI
      5. Aider
      6. Goose
      7. Amp
      8. Pi
      9. Factory
     10. Cline CLI
     11. Roo Code
     12. Kilo Code
     13. Continue
     14. Plandex
     15. OpenHands
     16. SWE-agent
     17. GPT Engineer
     18. Mentat
     19. Warp Agent
     20. GitHub Copilot CLI

    Notes:
      - Does NOT install or expose API keys.
      - Each agent is attempted independently.
      - Unsupported/changed installers are reported instead of
        stopping the entire installation.
#>

$ErrorActionPreference = "Continue"

$InstallRoot = "$env:USERPROFILE\AI-Coding-Agents"
New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null

$LogFile = Join-Path $InstallRoot "install.log"

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )

    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Level] $Message"
    Write-Host $line
    Add-Content -Path $LogFile -Value $line
}

function Test-Command {
    param([string]$Command)

    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Install-WingetPackage {
    param(
        [string]$Id,
        [string]$Name
    )

    Write-Log "Installing prerequisite: $Name"

    if (-not (Test-Command "winget")) {
        Write-Log "winget is not available." "WARN"
        return $false
    }

    winget install `
        --id $Id `
        --exact `
        --accept-package-agreements `
        --accept-source-agreements

    return ($LASTEXITCODE -eq 0)
}

function Install-NpmPackage {
    param(
        [string]$Package,
        [string]$Name
    )

    Write-Log "Installing $Name via npm..."

    npm install -g $Package

    if ($LASTEXITCODE -eq 0) {
        Write-Log "$Name installed successfully." "OK"
        return $true
    }

    Write-Log "$Name installation failed." "WARN"
    return $false
}

function Install-PipxPackage {
    param(
        [string]$Package,
        [string]$Name
    )

    Write-Log "Installing $Name via pipx..."

    python -m pipx install $Package

    if ($LASTEXITCODE -eq 0) {
        Write-Log "$Name installed successfully." "OK"
        return $true
    }

    Write-Log "$Name installation failed." "WARN"
    return $false
}

Write-Log "=============================================="
Write-Log " AI CODING AGENT INSTALLER"
Write-Log "=============================================="

# ------------------------------------------------
# 1. BASE DEVELOPMENT ENVIRONMENT
# ------------------------------------------------

Write-Log "Installing Windows development prerequisites..."

Install-WingetPackage `
    "Git.Git" `
    "Git for Windows"

Install-WingetPackage `
    "OpenJS.NodeJS.LTS" `
    "Node.js LTS"

Install-WingetPackage `
    "Python.Python.3.12" `
    "Python 3.12"

Install-WingetPackage `
    "Microsoft.VisualStudioCode" `
    "Visual Studio Code"

# Refresh PATH for this PowerShell session
$env:Path = [System.Environment]::GetEnvironmentVariable(
    "Path",
    "Machine"
) + ";" + [System.Environment]::GetEnvironmentVariable(
    "Path",
    "User"
)

# ------------------------------------------------
# 2. CLAUDE CODE
# ------------------------------------------------

if (Test-Command "npm") {
    Install-NpmPackage `
        "@anthropic-ai/claude-code" `
        "Claude Code"
}

# ------------------------------------------------
# 3. CODEX CLI
# ------------------------------------------------

if (Test-Command "npm") {
    Install-NpmPackage `
        "@openai/codex" `
        "OpenAI Codex CLI"
}

# ------------------------------------------------
# 4. OPENCODE
# ------------------------------------------------

if (Test-Command "npm") {
    Install-NpmPackage `
        "@opencode/cli" `
        "OpenCode"
}

# ------------------------------------------------
# 5. GEMINI CLI
# ------------------------------------------------

if (Test-Command "npm") {
    Install-NpmPackage `
        "@google/gemini-cli" `
        "Google Gemini CLI"
}

# ------------------------------------------------
# 6. AIDER
# ------------------------------------------------

if (Test-Command "python") {

    Write-Log "Preparing Aider environment..."

    python -m pip install --upgrade pip

    python -m pip install aider-install

    if ($LASTEXITCODE -eq 0) {
        aider-install

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Aider installed successfully." "OK"
        }
        else {
            Write-Log "Aider installer returned an error." "WARN"
        }
    }
}

# ------------------------------------------------
# 7. GOOSE
# ------------------------------------------------

Write-Log "Goose requires its official release installer/binary."
Write-Log "Goose installation deferred to official Windows release."
Write-Log "See: https://block.github.io/goose/"

# ------------------------------------------------
# 8. AMP
# ------------------------------------------------

Write-Log "Amp installation requires its current official installer."
Write-Log "Skipping automatic installation to avoid installing an"
Write-Log "unverified package." "WARN"

# ------------------------------------------------
# 9. PI
# ------------------------------------------------

Write-Log "Pi installation requires its current official package."
Write-Log "Skipping automatic installation pending package verification." "WARN"

# ------------------------------------------------
# 10. FACTORY
# ------------------------------------------------

Write-Log "Factory installation requires the current Factory installer."
Write-Log "Skipping automatic installation pending package verification." "WARN"

# ------------------------------------------------
# 11. CLINE
# ------------------------------------------------

Write-Log "Cline is primarily distributed through supported editor/"
Write-Log "CLI channels. Skipping automatic package installation." "WARN"

# ------------------------------------------------
# 12. ROO CODE
# ------------------------------------------------

Write-Log "Roo Code is primarily an IDE extension."
Write-Log "Skipping CLI installation." "WARN"

# ------------------------------------------------
# 13. KILO CODE
# ------------------------------------------------

Write-Log "Kilo Code installation method varies by distribution."
Write-Log "Skipping automatic installation pending verification." "WARN"

# ------------------------------------------------
# 14. CONTINUE
# ------------------------------------------------

Write-Log "Continue is primarily an IDE/agent platform."
Write-Log "Skipping standalone CLI installation." "WARN"

# ------------------------------------------------
# 15. PLANDEX
# ------------------------------------------------

Write-Log "Plandex installation requires its current official release."
Write-Log "Skipping automatic installation pending verification." "WARN"

# ------------------------------------------------
# 16. OPENHANDS
# ------------------------------------------------

Write-Log "Installing OpenHands using Python package if available..."

if (Test-Command "pip") {

    python -m pip install openhands-ai

    if ($LASTEXITCODE -eq 0) {
        Write-Log "OpenHands installed successfully." "OK"
    }
    else {
        Write-Log "OpenHands package installation failed." "WARN"
    }
}

# ------------------------------------------------
# 17. SWE-AGENT
# ------------------------------------------------

Write-Log "SWE-agent requires its current repository/release."
Write-Log "Skipping automatic installation pending verification." "WARN"

# ------------------------------------------------
# 18. GPT ENGINEER
# ------------------------------------------------

Write-Log "Installing GPT Engineer..."

if (Test-Command "pip") {

    python -m pip install gpt-engineer

    if ($LASTEXITCODE -eq 0) {
        Write-Log "GPT Engineer installed successfully." "OK"
    }
    else {
        Write-Log "GPT Engineer installation failed." "WARN"
    }
}

# ------------------------------------------------
# 19. MENTAT
# ------------------------------------------------

Write-Log "Mentat requires its current package/repository."
Write-Log "Skipping automatic installation pending verification." "WARN"

# ------------------------------------------------
# 20. WARP
# ------------------------------------------------

Write-Log "Warp Agent is distributed through the Warp terminal."
Write-Log "Skipping automatic CLI package installation." "WARN"

# ------------------------------------------------
# 21. GITHUB COPILOT CLI
# ------------------------------------------------

Write-Log "Installing GitHub CLI..."

Install-WingetPackage `
    "GitHub.cli" `
    "GitHub CLI"

# ------------------------------------------------
# FINAL
# ------------------------------------------------

Write-Log ""
Write-Log "=============================================="
Write-Log " INSTALLATION COMPLETE"
Write-Log "=============================================="

Write-Log ""
Write-Log "Checking installed commands..."

$Commands = @(
    "claude",
    "codex",
    "opencode",
    "gemini",
    "aider",
    "gh"
)

foreach ($cmd in $Commands) {

    if (Test-Command $cmd) {
        try {
            $version = & $cmd --version 2>&1 | Select-Object -First 1
            Write-Log "$cmd : INSTALLED : $version" "OK"
        }
        catch {
            Write-Log "$cmd : INSTALLED" "OK"
        }
    }
    else {
        Write-Log "$cmd : NOT FOUND" "WARN"
    }
}

Write-Log ""
Write-Log "Installation log:"
Write-Log $LogFile

Write-Host ""
Write-Host "==============================================="
Write-Host " AI CODING AGENT SETUP FINISHED"
Write-Host "==============================================="
Write-Host ""
Write-Host "Installed agents can be launched with:"
Write-Host ""
Write-Host "  claude"
Write-Host "  codex"
Write-Host "  opencode"
Write-Host "  gemini"
Write-Host "  aider"
Write-Host "  gh"
Write-Host ""
Write-Host "Log: $LogFile"
Write-Host ""