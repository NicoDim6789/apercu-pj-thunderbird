# build-xpi.ps1 — packager l'extension en .xpi installable
#
# Génère dist\apercu-pj-vX.Y.Z.xpi avec la version lue dans manifest.json.
# Le .xpi est un simple zip de la racine de l'extension (avec manifest.json
# au top-level, pas dans un sous-dossier).

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$manifest = Get-Content -Raw -Path 'manifest.json' | ConvertFrom-Json
$version = $manifest.version
$distDir = Join-Path $repoRoot 'dist'
$xpiPath = Join-Path $distDir "apercu-pj-v$version.xpi"
$zipPath = Join-Path $distDir "apercu-pj-v$version.zip"

if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

if (Test-Path $xpiPath) { Remove-Item $xpiPath -Force }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# On exclut les artefacts de build, le .git, et le dossier dist lui-même.
$exclude = @('.git', '.claude', 'dist', 'tools', '*.xpi', '*.zip', 'prompt-extension-thunderbird-apercu-pdf.md')

$itemsToZip = Get-ChildItem -Path $repoRoot -Force | Where-Object {
    $exclude -notcontains $_.Name -and -not ($_.Name -like '*.xpi') -and -not ($_.Name -like '*.zip')
}

Compress-Archive -Path $itemsToZip.FullName -DestinationPath $zipPath -Force
Rename-Item -Path $zipPath -NewName (Split-Path -Leaf $xpiPath)

Write-Host ""
Write-Host "✔ Build OK : $xpiPath" -ForegroundColor Green
Write-Host ""
Write-Host "Installation :"
Write-Host "  Thunderbird → Outils → Modules complémentaires → ⚙ → Installer un module depuis un fichier…"
Write-Host "  Sélectionner : $xpiPath"
Write-Host ""
