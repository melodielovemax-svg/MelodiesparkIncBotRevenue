#!/usr/bin/env pwsh
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Compiled = Join-Path $ScriptDir "..\dist\index.js"
$Sources = Join-Path $ScriptDir "..\src\index.ts"

if (Test-Path $Compiled) {
    node $Compiled @args
} else {
    node $Sources @args
}
