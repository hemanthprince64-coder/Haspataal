/**
 * Shared SWR fetcher — uses cookie-based auth (no Bearer token needed).
 * Next.js API routes read the session cookie directly.
 */
export const fetcher = async (url: string) => {
    const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'API error' }));
        const err = new Error(body.error || `API error ${res.status}`);
        (err as any).status = res.status;
        throw err;
    }

    return res.json();
};
