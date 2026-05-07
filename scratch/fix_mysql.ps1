$mysqlPath = "C:\xampp\mysql"
$dataPath = Join-Path $mysqlPath "data"
$dataOldPath = Join-Path $mysqlPath "data_old"
$backupPath = Join-Path $mysqlPath "backup"

if (Test-Path $dataOldPath) {
    Write-Host "data_old already exists. Removing it..."
    Remove-Item -Path $dataOldPath -Recurse -Force
}

Write-Host "Renaming data to data_old..."
Rename-Item -Path $dataPath -NewName "data_old"

Write-Host "Creating new data folder..."
New-Item -ItemType Directory -Path $dataPath

Write-Host "Copying backup to data..."
Copy-Item -Path "$backupPath\*" -Destination $dataPath -Recurse

Write-Host "Copying user databases..."
$excludedFolders = @("mysql", "performance_schema", "phpmyadmin")
$dataOldFolders = Get-ChildItem -Path $dataOldPath -Directory
foreach ($folder in $dataOldFolders) {
    if ($excludedFolders -notcontains $folder.Name) {
        Write-Host "Copying $($folder.Name)..."
        Copy-Item -Path $folder.FullName -Destination $dataPath -Recurse
    }
}

Write-Host "Copying ibdata1..."
Copy-Item -Path "$dataOldPath\ibdata1" -Destination $dataPath -Force

Write-Host "Done! Please try starting MySQL from XAMPP Control Panel."
