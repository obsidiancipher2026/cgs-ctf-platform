param([string]$Target = "sqlite")

$prismaDir = Join-Path $PSScriptRoot ".." "prisma" -Resolve
$schemaFile = Join-Path $prismaDir "schema.prisma"

switch ($Target.ToLower()) {
  "sqlite" {
    $sourceFile = Join-Path $prismaDir "schema.sqlite.prisma"
    if (-not (Test-Path $sourceFile)) {
      Write-Error "schema.sqlite.prisma not found at $sourceFile"
      exit 1
    }
    Copy-Item -Path $sourceFile -Destination $schemaFile -Force
    Write-Host "[+] Switched to SQLite schema"
  }
  "postgres" {
    $sourceFile = Join-Path $prismaDir "schema.postgres.prisma"
    if (-not (Test-Path $sourceFile)) {
      Write-Error "schema.postgres.prisma not found at $sourceFile"
      exit 1
    }
    Copy-Item -Path $sourceFile -Destination $schemaFile -Force
    Write-Host "[+] Switched to PostgreSQL schema"
  }
  default {
    Write-Error "Unknown target '$Target'. Use 'sqlite' or 'postgres'."
    exit 1
  }
}
