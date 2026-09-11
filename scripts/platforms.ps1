param(
    [Parameter(Position=0)]
    [string]$Platform,

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

if (-not $Platform) {
    platforms list
    exit $LASTEXITCODE
}

& platforms $Platform @Arguments

exit $LASTEXITCODE
