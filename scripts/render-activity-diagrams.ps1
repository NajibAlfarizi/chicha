# Script untuk Render Activity Diagrams
# Render semua activity diagram ke format PNG/SVG

param(
    [ValidateSet('svg', 'png', 'pdf')]
    [string]$OutFormat = 'png',
    
    [switch]$OpenAfter = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Activity Diagrams Renderer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah @mermaid-js/mermaid-cli sudah terinstall
$mmdc = Get-Command mmdc -ErrorAction SilentlyContinue

if (-not $mmdc) {
    Write-Host "ERROR: @mermaid-js/mermaid-cli belum terinstall!" -ForegroundColor Red
    Write-Host "Install dengan: npm install -g @mermaid-js/mermaid-cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "CATATAN: Untuk PlantUML diagram (.puml), Anda bisa:" -ForegroundColor Yellow
    Write-Host "1. Install PlantUML: npm install -g node-plantuml" -ForegroundColor Yellow
    Write-Host "2. Atau gunakan online editor: http://www.plantuml.com/plantuml/uml/" -ForegroundColor Yellow
    Write-Host "3. Atau install VS Code extension 'PlantUML' by jebbs" -ForegroundColor Yellow
    exit 1
}

# Path
$activityDiagramsPath = "docs\activity-diagrams"
$outputPath = "$activityDiagramsPath\dist"

# Buat folder output jika belum ada
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
    Write-Host "Created output directory: $outputPath" -ForegroundColor Green
}

# Cari semua file .puml
$pumlFiles = Get-ChildItem -Path $activityDiagramsPath -Filter "*.puml" -File

if ($pumlFiles.Count -eq 0) {
    Write-Host "No .puml files found in $activityDiagramsPath" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($pumlFiles.Count) PlantUML activity diagram(s)" -ForegroundColor Green
Write-Host "Output format: $OutFormat" -ForegroundColor Cyan
Write-Host ""

# Counter
$successCount = 0
$errorCount = 0

# Render setiap diagram
foreach ($file in $pumlFiles) {
    $inputFile = $file.FullName
    $baseName = $file.BaseName
    $outputFile = Join-Path $outputPath "$baseName.$OutFormat"
    
    Write-Host "Rendering: $($file.Name)..." -NoNewline
    
    try {
        # Catatan: mmdc adalah untuk Mermaid, bukan PlantUML
        # Untuk PlantUML, gunakan puml atau plantuml CLI
        # Script ini akan update jika user install node-plantuml
        
        # Cek apakah puml command tersedia
        $puml = Get-Command puml -ErrorAction SilentlyContinue
        
        if ($puml) {
            # Gunakan node-plantuml
            & puml generate $inputFile -o $outputFile 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " OK" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host " FAILED" -ForegroundColor Red
                $errorCount++
            }
        } else {
            Write-Host " SKIPPED (install node-plantuml)" -ForegroundColor Yellow
            Write-Host "  Install: npm install -g node-plantuml" -ForegroundColor DarkGray
        }
    }
    catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Total files: $($pumlFiles.Count)" -ForegroundColor White
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "White" })
Write-Host "  Output: $outputPath" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Buka folder output
if ($OpenAfter -and $successCount -gt 0) {
    Write-Host ""
    Write-Host "Opening output folder..." -ForegroundColor Yellow
    Invoke-Item $outputPath
}

# Alternative: Tampilkan cara manual render
if ($errorCount -gt 0 -or $successCount -eq 0) {
    Write-Host ""
    Write-Host "ALTERNATIVE RENDERING METHODS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Online Editor (Paling Mudah):" -ForegroundColor Cyan
    Write-Host "   - Buka: http://www.plantuml.com/plantuml/uml/" -ForegroundColor White
    Write-Host "   - Copy-paste isi file .puml" -ForegroundColor White
    Write-Host "   - Download hasil render" -ForegroundColor White
    Write-Host ""
    Write-Host "2. VS Code Extension:" -ForegroundColor Cyan
    Write-Host "   - Install: PlantUML by jebbs" -ForegroundColor White
    Write-Host "   - Buka file .puml" -ForegroundColor White
    Write-Host "   - Tekan Alt+D untuk preview" -ForegroundColor White
    Write-Host "   - Right-click > Export" -ForegroundColor White
    Write-Host ""
    Write-Host "3. CLI (Install terlebih dahulu):" -ForegroundColor Cyan
    Write-Host "   npm install -g node-plantuml" -ForegroundColor White
    Write-Host "   puml generate docs/activity-diagrams/*.puml -o docs/activity-diagrams/dist/" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
