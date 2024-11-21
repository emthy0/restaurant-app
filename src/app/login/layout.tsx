import { Suspense } from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense>
            <section>{children}</section>
        </Suspense>
    );
}
