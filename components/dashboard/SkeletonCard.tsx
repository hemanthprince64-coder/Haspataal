/**
 * Shimmer skeleton card — used as loading placeholder for dashboard sections.
 */
export function SkeletonCard({ height = "120px", width = "100%" }: { height?: string; width?: string }) {
    return (
        <div style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            height,
            width,
            overflow: "hidden",
            position: "relative",
        }}>
            <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s ease-in-out infinite",
            }} />
        </div>
    );
}

export function MetricSkeleton() {
    return (
        <div style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            borderLeft: "3px solid #e5e7eb",
            padding: "1rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
        }}>
            <div style={{ width: "60%", height: "10px", borderRadius: "4px", background: "#f1f5f9", animation: "shimmer 1.5s ease-in-out infinite" }} />
            <div style={{ width: "40%", height: "24px", borderRadius: "4px", background: "#f1f5f9", animation: "shimmer 1.5s ease-in-out infinite" }} />
            <div style={{ width: "80%", height: "8px", borderRadius: "4px", background: "#f1f5f9", animation: "shimmer 1.5s ease-in-out infinite" }} />
        </div>
    );
}

export function ErrorInline({ message, onRetry }: { message?: string; onRetry?: () => void }) {
    return (
        <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8rem",
        }}>
            <span style={{ color: "#991b1b" }}>⚠ {message || "Failed to load"}</span>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        fontSize: "0.72rem",
                        fontWeight: "600",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "6px",
                        border: "1px solid #fca5a5",
                        background: "#fff",
                        color: "#dc2626",
                        cursor: "pointer",
                    }}
                >
                    Retry
                </button>
            )}
        </div>
    );
}
