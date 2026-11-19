[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$project = Join-Path $repo 'portal-empresarial'
$templates = Join-Path $PSScriptRoot 'portable-windows'
$output = Join-Path $repo 'release'
$filename = 'Conecta-Rural-Portable-Windows.zip'
$version = '22.23.5'
$expected = '247e9693d316da9857e44990e5e11709f596f18112251b8026ec6eed80bdf38a'
$source = "https://nodejs.org/dist/v$version"
$stage = Join-Path ([IO.Path]::GetTempPath()) ('conecta-package-' + [guid]::NewGuid().ToString('N'))
$stagedZip = Join-Path $stage $filename
$package = Join-Path $stage 'Conecta Rural Empresarial'
$runtime = Join-Path $package 'runtime'
$null = New-Item -ItemType Directory -Path $runtime

try {
    Push-Location -LiteralPath $project
    try {
        npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
        npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
    } finally {
        Pop-Location
    }

    $binary = Join-Path $runtime 'node.exe'
    $manifest = Join-Path $stage 'SHASUMS256.txt'
    Invoke-WebRequest -UseBasicParsing "$source/SHASUMS256.txt" -OutFile $manifest
    $entry = Get-Content -LiteralPath $manifest | Where-Object { $_ -match '^[a-f0-9]{64}\s+win-x64/node\.exe$' }
    if (-not $entry -or ($entry -split '\s+')[0] -ne $expected) {
        throw "Official manifest does not match the pinned Windows x64 digest for Node.js v$version."
    }

    Invoke-WebRequest -UseBasicParsing "$source/win-x64/node.exe" -OutFile $binary
    if ((Get-FileHash -LiteralPath $binary -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected) {
        throw 'SHA-256 verification of the downloaded runtime failed.'
    }

    Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/nodejs/node/v$version/LICENSE" -OutFile (Join-Path $runtime 'LICENSE.txt')
    @("Node.js v$version (Windows x64)", "$source/win-x64/node.exe", "$source/SHASUMS256.txt", $entry) |
        Set-Content -LiteralPath (Join-Path $runtime 'ORIGEN-Y-SHA256.txt') -Encoding ASCII
    foreach ($file in @('INICIAR.cmd', 'CERRAR.cmd', 'README.txt', 'portable.cjs')) {
        Copy-Item -LiteralPath (Join-Path $templates $file) -Destination $package
    }
    Copy-Item -LiteralPath (Join-Path $project 'dist') -Destination (Join-Path $package 'app') -Recurse

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [IO.Compression.ZipFile]::Open($stagedZip, [IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $package -Recurse -File | Sort-Object FullName | ForEach-Object {
            $relative = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')
            $record = $archive.CreateEntry($relative, [IO.Compression.CompressionLevel]::Optimal)
            $record.LastWriteTime = [DateTimeOffset]::new(2020, 1, 1, 0, 0, 0, [TimeSpan]::Zero)
            $inputStream = [IO.File]::OpenRead($_.FullName)
            try {
                $zipStream = $record.Open()
                try { $inputStream.CopyTo($zipStream) } finally { $zipStream.Dispose() }
            } finally {
                $inputStream.Dispose()
            }
        }
    } finally {
        $archive.Dispose()
    }
    $null = New-Item -ItemType Directory -Path $output -Force
    $destination = Join-Path $output $filename
    Copy-Item -LiteralPath $stagedZip -Destination $destination -Force
    $digest = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
    "$digest  $filename" | Set-Content -LiteralPath ($destination + '.sha256') -Encoding ASCII
    Write-Host "Portable ZIP: $destination"
    Write-Host "SHA-256: $digest"
} finally {
    if (Test-Path -LiteralPath $stage) {
        $resolvedStage = (Resolve-Path -LiteralPath $stage).Path
        $temp = (Resolve-Path -LiteralPath ([IO.Path]::GetTempPath())).Path.TrimEnd('\')
        if ((Split-Path -Parent $resolvedStage) -eq $temp -and
            (Split-Path -Leaf $resolvedStage) -match '^conecta-package-[a-f0-9]{32}$') {
            Remove-Item -LiteralPath $resolvedStage -Recurse -Force
        }
    }
}

