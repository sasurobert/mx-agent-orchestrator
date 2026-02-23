import type { Metadata } from 'next';
import './globals.css';
import { DappInitializer } from './components/DappInitializer';
import { NetworkSwitch } from './components/NetworkSwitch';

export const metadata: Metadata = {
    title: 'Agent Orchestrator — MultiversX Agent Economy',
    description: 'Decompose tasks, discover expert agents, pay with crypto, and get results. Powered by MX-8004.',
    keywords: ['AI agents', 'MultiversX', 'orchestrator', 'x402', 'agent economy', 'micropayments'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <meta name="color-scheme" content="dark" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                <DappInitializer>
                    <NetworkSwitch />
                    {children}
                </DappInitializer>
            </body>
        </html>
    );
}
