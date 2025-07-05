'use client'

import { useEffect, useState } from 'react'

type ServerStatus = {
    online: boolean
    latency?: number
    ip?: string
    city?: string
    country?: string
    org?: string
    hostname?: string
    error?: string
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

const countryCodeMap: Record<string, string> = {
    'India': 'in',
    'South Korea': 'kr',
    'United States': 'us',
    'Germany': 'de',
    'France': 'fr',
    'Japan': 'jp',
    'China': 'cn',
    'Brazil': 'br',
}

const getFlagUrl = (countryCode: string): string => {
    return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`
}

export default function Home() {
    const [clientTime, setClientTime] = useState('')
    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const [statuses, setStatuses] = useState<Record<string, ServerStatus | null>>({})

    useEffect(() => {
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
                                        <img
                                            src={getFlagUrl(status.country)}
                                            alt={`${status.country} flag`}
                                            style={{ width: '24px', height: '18px', verticalAlign: 'middle', marginLeft: '4px' }}
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