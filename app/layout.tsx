import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mirror Status',
    description: 'Check the status of the mirror.lunastev.org server',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
        <body>{children}</body>
        </html>
    )
}
