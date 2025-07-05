import { NextResponse } from 'next/server'

export async function GET() {
    const target = 'http://arch.mirror.lunastev.org/'
    const ipinfo = 'https://ipinfo.io/65.20.79.97/json'

    try {
        const start = Date.now()
        const res = await fetch(target, { method: 'GET', cache: 'no-store' })
        const latency = Date.now() - start

        const locationRes = await fetch(ipinfo)
        const location = await locationRes.json()

        return NextResponse.json({
            online: res.ok,
            latency,
            ip: location.ip,
            city: location.city,
            country: location.country,
            org: location.org,
            loc: location.loc,
            hostname: 'arch.mirror.lunastev.org',
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        })
    } catch (e) {
        return NextResponse.json({
            online: false,
            error: (e as Error).message,
        })
    }
}
