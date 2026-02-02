$root = $PSScriptRoot

$backend  = Join-Path $root "flask-server"
$frontend = Join-Path $root "my-app"

Start-Process powershell -WorkingDirectory $backend  -ArgumentList "-NoExit","-Command","py server.py"
Start-Process powershell -WorkingDirectory $frontend -ArgumentList "-NoExit","-Command","npm start"
