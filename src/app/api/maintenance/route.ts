import { jsonResponse } from '@/lib/auth'
import { getMaintenanceStatus } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

export async function GET() {
  return jsonResponse(await getMaintenanceStatus())
}
