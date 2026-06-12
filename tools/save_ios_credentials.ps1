param(
  [string]$AppId = "com.xie.vocab",
  [string]$Certificate = "signing/cert.p12",
  [string]$ProvisioningProfile = "signing/profile.mobileprovision",
  [ValidateSet("ad_hoc", "app_store")]
  [string]$Distribution = "ad_hoc",
  [switch]$Help
)

if ($Help) {
  Write-Host "Usage:"
  Write-Host "  npm run ios:credentials"
  Write-Host ""
  Write-Host "Default file locations:"
  Write-Host "  signing/cert.p12"
  Write-Host "  signing/profile.mobileprovision"
  exit 0
}

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Certificate)) {
  throw "Certificate not found: $Certificate"
}

if (-not (Test-Path -LiteralPath $ProvisioningProfile)) {
  throw "Provisioning profile not found: $ProvisioningProfile"
}

$securePassword = Read-Host "Enter .p12 password. Input stays local" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

  npx.cmd capgo build credentials save `
    --local `
    --appId $AppId `
    --platform ios `
    --certificate $Certificate `
    --p12-password $plainPassword `
    --ios-provisioning-profile $ProvisioningProfile `
    --ios-distribution $Distribution `
    --output-upload `
    --output-retention 7d `
    --skip-build-number-bump
}
finally {
  if ($bstr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}
