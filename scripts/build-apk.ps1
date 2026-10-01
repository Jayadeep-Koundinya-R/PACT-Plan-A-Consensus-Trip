# PACT Local Release APK Build Script
# 1. Suspends OneDrive background sync to avoid file locks
# 2. Uses Windows virtual drive (P:) to bypass 260-char MAX_PATH limit for C++/CMake compilation

Write-Host ">>> Temporarily suspending OneDrive background sync to prevent file locks..." -ForegroundColor Cyan
Stop-Process -Name 'OneDrive' -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Push-Location android; .\gradlew.bat --stop; Pop-Location

$rootPath = (Get-Item .).FullName
if (Get-PSDrive -Name P -ErrorAction SilentlyContinue) {
    subst P: /d 2>$null
}
subst P: "$rootPath"

try {
    Write-Host ">>> Cleaning stale build folders and caches..." -ForegroundColor Cyan
    cmd.exe /c "rd /s /q P:\node_modules\@react-native\gradle-plugin\shared\build" 2>$null
    cmd.exe /c "rd /s /q P:\node_modules\@react-native\gradle-plugin\settings-plugin\build" 2>$null
    cmd.exe /c "rd /s /q P:\node_modules\@react-native\gradle-plugin\react-native-gradle-plugin\build" 2>$null
    cmd.exe /c "rd /s /q P:\node_modules\react-native-reanimated\android\.cxx" 2>$null
    cmd.exe /c "rd /s /q P:\android\app\build\outputs" 2>$null

    Write-Host ">>> Running Gradle assembleRelease from virtual drive P:\android (MAX_PATH bypass)..." -ForegroundColor Cyan
    Push-Location "P:\android"
    .\gradlew.bat assembleRelease -x lint -x test --no-daemon
    Pop-Location

    $apkSource = "P:\android\app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkSource) {
        Copy-Item -Path $apkSource -Destination "$rootPath\PACT-app.apk" -Force
        $fileInfo = Get-Item "$rootPath\PACT-app.apk"
        Write-Host ">>> SUCCESS! Fresh APK generated ($([math]::Round($fileInfo.Length / 1MB, 2)) MB) -> PACT-app.apk" -ForegroundColor Green
    } else {
        Write-Host ">>> Warning: Build finished, searching for APK in build tree..." -ForegroundColor Yellow
        Get-ChildItem -Path "P:\android\app\build\outputs" -Recurse -Filter "*.apk"
    }
} finally {
    Write-Host ">>> Cleaning up virtual drive P: and resuming OneDrive..." -ForegroundColor Cyan
    subst P: /d 2>$null
    Start-Process "$env:LOCALAPPDATA\Microsoft\OneDrive\OneDrive.exe" -ArgumentList "/background" -ErrorAction SilentlyContinue
}
