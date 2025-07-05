'use client'

import { useEffect, useState } from 'react'

type ServerStatus = {
    online: boolean
    latency?: number
    ip?: string
    city?: string
    country?: string
    region?: string
    timezone?: string
    postal?: string
    org?: string
    hostname?: string
    error?: string
}

export default function Home() {
    const [status, setStatus] = useState<ServerStatus | null>(null)
    const [clientTime, setClientTime] = useState('')
    const [serverTime, setServerTime] = useState('')

    const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const serverTimeZone = 'Asia/Kolkata'

    useEffect(() => {
        fetch('/api/status')
            .then((res) => res.json())
            .then((data) => {
                setStatus(data)
                try {
                    const now = new Date()
                    const serverLocale = now.toLocaleString('en-US', {
                        timeZone: serverTimeZone,
                        hour12: false,
                    })
                    setServerTime(`${serverLocale} (${serverTimeZone})`)
                } catch {
                    setServerTime('Unavailable')
                }
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

    if (!status) return <p>Loading server status...</p>

    return (
        <main id="container">
            <div className="header">
                <h1>arch.mirror.lunastev.org</h1>
                <div className="time-info">
                    <p><strong>Client Time:</strong> {clientTime}</p>
                    <p><strong>Server Time:</strong> {serverTime}</p>
                </div>
            </div>

            <div className="status-info">
                <p>
                    <strong>Status:</strong> {status.online ? 'Online 🟢' : 'Offline 🔴'}
                </p>

                {status.latency !== undefined && (
                    <p>
                        <strong>Response Speed:</strong> {status.latency} ms ⚡️
                    </p>
                )}

                {status.ip && (
                    <p>
                        <strong>IP Address:</strong> {status.ip} 📡
                    </p>
                )}

                {status.hostname && (
                    <p>
                        <strong>Host Name:</strong> {status.hostname} 🖥️
                    </p>
                )}

                {(status.city || status.region || status.country) && (
                    <p>
                        <strong>Location:</strong>{' '}
                        {[status.city, status.region, status.country].filter(Boolean).join(', ')} 📍
                    </p>
                )}

                {status.postal && (
                    <p>
                        <strong>Postal Code:</strong> {status.postal} ✉️
                    </p>
                )}

                {status.timezone && (
                    <p>
                        <strong>Time Zone:</strong> {status.timezone} 🌐
                    </p>
                )}

                {status.org && (
                    <p>
                        <strong>ISP/Organization:</strong> {status.org} 🏢
                    </p>
                )}

                {status.error && (
                    <p className="error">
                        <strong>Error:</strong> {status.error} ⚠️
                    </p>
                )}
            </div>
        </main>
    )
}
