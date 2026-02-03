@echo off
echo Adicionando regra de Firewall para porta 7777...
netsh advfirewall firewall add rule name="Allow Port 7777" dir=in action=allow protocol=TCP localport=7777
echo.
echo Regra adicionada! Tente abrir o app nvoamente.
pause
