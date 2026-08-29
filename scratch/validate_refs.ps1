$baseDir = "c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo"
$htmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html"

$errors = @()

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # 1. Check img src
    $imgMatches = [regex]::Matches($content, '<img[^>]+src=["'']([^"'']+)["'']')
    foreach ($m in $imgMatches) {
        $src = $m.Groups[1].Value
        $resolved = [System.IO.Path]::Combine($baseDir, $src.Replace('/', '\'))
        if (!(Test-Path $resolved)) {
            $errors += "Broken img src in $($file.Name): $src -> $resolved"
        }
    }

    # 2. Check inline style background-image
    $bgMatches = [regex]::Matches($content, 'url\(["'']?([^"'')]+)["'']?\)')
    foreach ($m in $bgMatches) {
        $bg = $m.Groups[1].Value
        if ($bg -notmatch '^http') {
            $resolved = [System.IO.Path]::Combine($baseDir, $bg.Replace('/', '\'))
            if (!(Test-Path $resolved)) {
                $errors += "Broken inline bg in $($file.Name): $bg -> $resolved"
            }
        }
    }
}

# 3. Check CSS background-images
$cssFile = "$baseDir\css\style.css"
if (Test-Path $cssFile) {
    $cssContent = Get-Content $cssFile -Raw
    $cssDir = "$baseDir\css"
    $cssBgMatches = [regex]::Matches($cssContent, 'url\(["'']?([^"'')]+)["'']?\)')
    foreach ($m in $cssBgMatches) {
        $bg = $m.Groups[1].Value
        if ($bg -notmatch '^http' -and $bg -notmatch '^data:') {
            $resolved = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($cssDir, $bg.Replace('/', '\')))
            if (!(Test-Path $resolved)) {
                $errors += "Broken CSS url in style.css: $bg -> $resolved"
            }
        }
    }
}

if ($errors.Count -eq 0) {
    Write-Host "SUCCESS: All image references across all HTML and CSS files are perfectly resolved!" -ForegroundColor Green
} else {
    Write-Host "ERRORS FOUND:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
}
