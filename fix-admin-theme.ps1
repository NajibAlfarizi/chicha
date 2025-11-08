# Script untuk mengubah hardcoded slate colors menjadi theme-aware di semua file admin
$adminFiles = @(
    "app\admin\pesanan\page.tsx",
    "app\admin\booking\page.tsx",
    "app\admin\teknisi\page.tsx",
    "app\admin\target\page.tsx",
    "app\admin\keluhan\page.tsx",
    "app\admin\user\page.tsx"
)

$replacements = @{
    # Text colors
    'text-white' = ''
    'text-slate-300' = ''
    'text-slate-400' = 'text-muted-foreground'
    
    # Background colors for cards
    'bg-slate-800/50 border-amber-500/20' = 'shadow-sm'
    'bg-slate-800/50' = 'shadow-sm'
    'bg-slate-900 border-amber-500/20 text-white' = ''
    'bg-slate-900' = ''
    'bg-slate-800 border-slate-700 text-white' = ''
    'bg-slate-800 border-slate-700' = ''
    'bg-slate-800' = ''
    'bg-slate-700' = 'bg-muted'
    
    # Border colors
    'border-slate-700 hover:bg-slate-700/50' = 'hover:bg-muted/50'
    'border-slate-700 hover:bg-slate-700/30' = 'hover:bg-muted/30'
    'border-slate-700 text-slate-300' = ''
    'border-slate-700' = ''
    
    # Button colors (hanya batal button)
    'bg-amber-500 hover:bg-amber-600 text-slate-900' = 'bg-amber-500 hover:bg-amber-600 text-white'
}

foreach ($file in $adminFiles) {
    $filePath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Apply replacements
        foreach ($old in $replacements.Keys) {
            $new = $replacements[$old]
            if ($new -eq '') {
                # Remove the class completely, handle className properly
                $content = $content -replace "className=`"([^`"]*?)$([regex]::Escape($old))\s*([^`"]*?)`"", 'className="$1$3"'
                $content = $content -replace "className=`"\s*$([regex]::Escape($old))\s*`"", 'className=""'
                $content = $content -replace 'className=`"`"', ''  # Remove empty className
                $content = $content -replace '\s+className=`"`"', ''  # Remove empty className with space
            } else {
                $content = $content -replace [regex]::Escape($old), $new
            }
        }
        
        # Clean up double spaces in className
        $content = $content -replace 'className="([^"]*?)\s{2,}([^"]*?)"', 'className="$1 $2"'
        $content = $content -replace 'className="\s+', 'className="'
        $content = $content -replace '\s+"', '"'
        
        Set-Content $filePath $content -NoNewline
        
        Write-Host "✓ Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! All admin files have been updated." -ForegroundColor Cyan
