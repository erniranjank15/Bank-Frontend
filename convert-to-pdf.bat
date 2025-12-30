@echo off
echo Converting Banking System Documentation to PDF...

REM Check if pandoc is installed
pandoc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Pandoc is not installed. Please install it from https://pandoc.org/installing.html
    pause
    exit /b 1
)

REM Convert markdown to PDF
pandoc BANKING_SYSTEM_DOCUMENTATION.md -o "Banking_System_Full_Stack_Documentation.pdf" --pdf-engine=wkhtmltopdf

if %errorlevel% equ 0 (
    echo PDF generated successfully: Banking_System_Full_Stack_Documentation.pdf
) else (
    echo Error generating PDF. Trying alternative method...
    pandoc BANKING_SYSTEM_DOCUMENTATION.md -o "Banking_System_Full_Stack_Documentation.pdf"
)

pause