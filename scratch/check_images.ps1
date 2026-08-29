Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -Path "c:\Users\franc\OneDrive\Documenti\SitiWeb\PalioCave\SitoNuovo\FotoUfficiali" -Recurse -File

foreach ($f in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        [PSCustomObject]@{
            RelativePath = $f.FullName.Substring($f.FullName.IndexOf("FotoUfficiali"))
            SizeMB = [math]::Round($f.Length / 1MB, 2)
            Width = $img.Width
            Height = $img.Height
        }
        $img.Dispose()
    } catch {
        [PSCustomObject]@{
            RelativePath = $f.Name
            SizeMB = [math]::Round($f.Length / 1MB, 2)
            Width = "ERR"
            Height = "ERR"
        }
    }
}
