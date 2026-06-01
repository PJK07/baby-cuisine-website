$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$node = "C:\Program Files\nodejs\node.exe"
$script = Join-Path $repo "scripts\telegram-sophie.mjs"
$log = Join-Path $repo "telegram-sophie.supervisor.log"

Set-Location -LiteralPath $repo

while ($true) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $log -Value "[$timestamp] Starting Chef Sophie Telegram bot"

  & $node $script *>> $log

  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Add-Content -LiteralPath $log -Value "[$timestamp] Bot exited with code $LASTEXITCODE; restarting in 5 seconds"
  Start-Sleep -Seconds 5
}
