param(
  [string]$AppId = "com.xie.vocab",
  [ValidateSet("debug", "release")]
  [string]$BuildMode = "release",
  [ValidateSet("ad_hoc", "app_store")]
  [string]$Distribution = "ad_hoc",
  [string]$OutputRecord = "dist/capgo-ios-build-output.json",
  [switch]$Help
)

if ($Help) {
  Write-Host "Usage:"
  Write-Host "  npm run ios:cloud-build"
  Write-Host ""
  Write-Host "Before this, run:"
  Write-Host "  npx capgo login YOUR_CAPGO_API_KEY"
  Write-Host "  npm run ios:credentials"
  exit 0
}

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath ".capgo-credentials.json")) {
  throw "Missing .capgo-credentials.json. Run npm run ios:credentials first."
}

$outputDir = Split-Path -Parent $OutputRecord
if ($outputDir -and -not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

npm.cmd run cap:sync:ios

npx.cmd capgo build request $AppId `
  --platform ios `
  --path . `
  --build-mode $BuildMode `
  --ios-scheme App `
  --ios-target App `
  --ios-distribution $Distribution `
  --output-upload `
  --output-retention 7d `
  --output-record $OutputRecord

if (Test-Path -LiteralPath $OutputRecord) {
  Write-Host ""
  Write-Host "Build output record:"
  Get-Content -Raw -LiteralPath $OutputRecord
}
