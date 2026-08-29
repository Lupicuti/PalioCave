Add-Type -AssemblyName System.Drawing

$srcDir = "c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\FotoUfficiali"
$destDir = "c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\assets\images"
$contradeDestDir = Join-Path $destDir "contrade"

if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }
if (!(Test-Path $contradeDestDir)) { New-Item -ItemType Directory -Path $contradeDestDir -Force }

function Save-OptimizedImage {
    param(
        [string]$SourcePath,
        [string]$TargetPath,
        [int]$MaxDimension = 1920,
        [int]$Quality = 85
    )

    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $w = $src.Width
    $h = $src.Height

    $scale = 1.0
    if ($w -gt $MaxDimension -or $h -gt $MaxDimension) {
        $scale = [Math]::Min($MaxDimension / $w, $MaxDimension / $h)
    }

    $newW = [int][Math]::Round($w * $scale)
    $newH = [int][Math]::Round($h * $scale)

    $destBmp = New-Object System.Drawing.Bitmap($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $g.DrawImage($src, 0, 0, $newW, $newH)
    $g.Dispose()
    $src.Dispose()

    $ext = [System.IO.Path]::GetExtension($TargetPath).ToLower()
    if ($ext -eq ".jpg" -or $ext -eq ".jpeg") {
        # Convert to RGB (white background if alpha) and save as JPG with quality
        $jpgBmp = New-Object System.Drawing.Bitmap($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $jg = [System.Drawing.Graphics]::FromImage($jpgBmp)
        $jg.Clear([System.Drawing.Color]::White)
        $jg.DrawImage($destBmp, 0, 0, $newW, $newH)
        $jg.Dispose()
        $destBmp.Dispose()

        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        $jpgBmp.Save($TargetPath, $jpegCodec, $encoderParams)
        $jpgBmp.Dispose()
    } else {
        $destBmp.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $destBmp.Dispose()
    }

    $outFileInfo = Get-Item $TargetPath
    Write-Host "Processed $(Split-Path $TargetPath -Leaf): $($newW)x$($newH) - $([Math]::Round($outFileInfo.Length / 1KB, 1)) KB"
}

# 1. Main images
$imageMap = @{
    "Hero-bg.jpg" = "hero-bg.jpg"
    "corteo-bg.jpg" = "corteo-bg.jpg"
    "palio-bg.jpg" = "palio-bg.jpg"
    "rievocazione-bg.jpg" = "rievocazione-bg.jpg"
    "storia-bg.jpg" = "storia-bg.jpg"
    "firma pace.jpg" = "firma-pace.jpg"
    "cena-rinascimentale.jpg" = "cena-rinascimentale.jpg"
    "balestra.png" = "balestra.png"
    "bambini.png" = "bambini.png"
    "conca.jpg" = "conca.jpg"
    "ruzzica.jpg" = "ruzzica.jpg"
    "sacchi.jpg" = "sacchi.jpg"
    "tiro-fune.jpg" = "tiro-fune.jpg"
    "logo.jpg" = "logo.jpg"
}

foreach ($kv in $imageMap.GetEnumerator()) {
    $src = Join-Path $srcDir $kv.Key
    $dst = Join-Path $destDir $kv.Value
    if (Test-Path $src) {
        $ext = [System.IO.Path]::GetExtension($kv.Value).ToLower()
        if ($ext -eq ".png") {
            # Copy or resize PNG preserving transparency
            Save-OptimizedImage -SourcePath $src -TargetPath $dst -MaxDimension 1200 -Quality 90
        } else {
            Save-OptimizedImage -SourcePath $src -TargetPath $dst -MaxDimension 1920 -Quality 85
        }
    } else {
        Write-Warning "Source not found: $src"
    }
}

# 2. Contrade gonfaloni
$gonfaloniMap = @{
    "contrada-4 santi.png" = "contrada-quattro-santi.png"
    "contrada-campo.png" = "contrada-campo.png"
    "contrada-ceppo.png" = "contrada-ceppo.png"
    "contrada-rocca.png" = "contrada-rocca.png"
    "contrada-san lorenzo.png" = "contrada-san-lorenzo.png"
    "contrada-santostefano.png" = "contrada-santo-stefano.png"
    "contrada-svr.png" = "contrada-santa-maria-vecchia-refota.png"
}

$gonfaloniSrcDir = Join-Path $srcDir "confaloni digitali"
foreach ($kv in $gonfaloniMap.GetEnumerator()) {
    $src = Join-Path $gonfaloniSrcDir $kv.Key
    $dst = Join-Path $contradeDestDir $kv.Value
    if (Test-Path $src) {
        Save-OptimizedImage -SourcePath $src -TargetPath $dst -MaxDimension 800 -Quality 90
    } else {
        Write-Warning "Gonfalone not found: $src"
    }
}
