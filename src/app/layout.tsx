import ClientLayout from '@/components/ClientLayout';
import { AuthProvider } from '@/context/AuthProvider';
import type { Metadata } from 'next';
import './globals.css';
import React from "react";


export const metadata: Metadata = {
    title: 'Aitu Network',
    description: 'Explore world with us',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
        </body>
        </html>
    );
}
