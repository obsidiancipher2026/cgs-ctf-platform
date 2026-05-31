param(
  [Parameter(Mandatory)]
  [ValidateSet('sqlite', 'postgresql')]
  [string]$Target
)

$schemaDir = Join-Path $PSScriptRoot '..' 'prisma'
$mainSchema = Join-Path $schemaDir 'schema.prisma'
$sqliteSchema = Join-Path $schemaDir 'schema.sqlite.prisma'

if ($Target -eq 'sqlite') {
  if (Test-Path $sqliteSchema) {
    Copy-Item -Path $sqliteSchema -Destination $mainSchema -Force
    Write-Output "Switched to SQLite schema (for local development)"
  } else {
    Write-Error "schema.sqlite.prisma not found at $sqliteSchema"
    exit 1
  }
} else {
  Write-Output "PostgreSQL schema is already the default in schema.prisma"
  Write-Output "Ensure DATABASE_URL points to your PostgreSQL instance"
}

Write-Output ""
Write-Output "Run: npx prisma generate && npx prisma db push"
