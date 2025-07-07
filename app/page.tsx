'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from 'react-simple-maps'
import { feature } from 'topojson-client'
import type { Feature } from 'geojson'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

type ServerStatus = {
    online: boolean
    latency?: number
    ip?: string
    city?: string
    country?: string
    org?: string
    hostname?: string
    error?: string
    loc?: string
}

type MirrorServer = {
    name: string
    apiEndpoint: string
    timezone: string
    hostname: string
}

const mirrors: MirrorServer[] = [
    {
        name: 'arch.mirror.lunastev.org',
        apiEndpoint: '/api/status/arch',
        timezone: 'Asia/Kolkata',
        hostname: 'arch.mirror.lunastev.org',
    },
]

const getFlagUrl = (countryCode: string): string => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`
}

export default function Home() {
    const [clientTime, setClientTime] = useState('')
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const [statuses, setStatuses] = useState<Record<string, ServerStatus | null>>({})
    const [geographies, setGeographies] = useState<Feature[]>([])

    useEffect(() => {
        // Load map data
        fetch(geoUrl)
            .then((res) => res.json())
            .then((data) => {
                const geo = feature(data, data.objects.countries).features
                setGeographies(geo)
            })

        // Fetch mirror status
        mirrors.forEach((mirror) => {
            fetch(mirror.apiEndpoint)
                .then((res) => res.json())
                .then((data) => {
                    setStatuses((prev) => ({ ...prev, [mirror.name]: data }))
                })
                .catch(() => {
                    setStatuses((prev) => ({
                        ...prev,
                        [mirror.name]: { online: false, error: 'Unable to fetch data' },
                    }))
                })
        })

        // Client time update
        const updateClientTime = () => {
            const now = new Date().toLocaleString('en-US', {
                hour12: false,
                timeZone: clientTimeZone,
            })
            setClientTime(`${now} (${clientTimeZone})`)
        }

        updateClientTime()
        const interval = setInterval(updateClientTime, 1000)

        return () => clearInterval(interval)
    }, [clientTimeZone])

    const getServerTime = (timezone: string) => {
        try {
            return new Date().toLocaleString('en-US', {
                timeZone: timezone,
                hour12: false,
            })
        } catch {
            return 'Unavailable'
        }
    }

    return (
        <main id="container">
            <div className="header">
                <h1>Mirror Server Status</h1>
                <div className="time-info">
                    <p><strong>Client Time:</strong> {clientTime}</p>
                </div>
            </div>

            <div className="map-wrapper">
                <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 170 }}>
                    {geographies.length > 0 && (
                        <Geographies geography={geographies}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#1f1f1f"
                                        stroke="#00d4ff"
                                        strokeWidth={0.3}
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { fill: '#2a2a2a' },
                                            pressed: { fill: '#111' },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>
                    )}

                    {mirrors.map((mirror) => {
                        const status = statuses[mirror.name]
                        if (!status || !status.loc) return null

                        const [latStr, lonStr] = status.loc.split(',')
                        const latitude = parseFloat(latStr)
                        const longitude = parseFloat(lonStr)

                        return (
                            <Marker key={mirror.name} coordinates={[longitude, latitude]}>
                                <circle r={6} fill="#00d4ff" stroke="#ffffff" strokeWidth={1.5} />
                                <text
                                    textAnchor="middle"
                                    y={-12}
                                    style={{ fill: '#f0f2f5', fontSize: '0.65rem' }}
                                >
                                    {mirror.name}
                                </text>
                            </Marker>
                        )
                    })}
                </ComposableMap>
            </div>

            {mirrors.map((mirror) => {
                const status = statuses[mirror.name]

                return (
                    <div className="status-info" key={mirror.name}>
                        <h2>{mirror.name}</h2>
                        <p><strong>Server Time:</strong> {getServerTime(mirror.timezone)} ({mirror.timezone})</p>

                        {!status && <p>Loading server status...</p>}

                        {status && (
                            <>
                                <p><strong>Status:</strong> {status.online ? 'Online' : 'Offline'}</p>
                                {status.latency !== undefined && (
                                    <p><strong>Response Speed:</strong> {status.latency} ms</p>
                                )}
                                {status.ip && <p><strong>IP Address:</strong> {status.ip}</p>}
                                <p><strong>Host Name:</strong> {mirror.hostname}</p>
                                {status.city && status.country && (
                                    <p>
                                        <strong>Location:</strong> {status.city}, {status.country}{' '}
                                        <Image
                                            src={getFlagUrl(status.country)}
                                            alt={`${status.country} flag`}
                                            width={24}
                                            height={18}
                                            style={{
                                                verticalAlign: 'middle',
                                                marginLeft: '4px'
                                            }}
                                        />
                                    </p>
                                )}
                                {status.org && <p><strong>ISP:</strong> {status.org}</p>}
                                {status.error && <p className="error"><strong>Error:</strong> {status.error}</p>}
                            </>
                        )}
                    </div>
                )
            })}
        </main>
    )
}
