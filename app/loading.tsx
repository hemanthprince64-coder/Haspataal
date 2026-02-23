export default function GlobalLoading() {
    return (
        <div className="container" style={{ padding: "4rem 1rem", minHeight: "70vh", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="skeleton" style={{ height: "40px", width: "70%", borderRadius: "8px" }}></div>
                <div className="skeleton" style={{ height: "20px", width: "40%", borderRadius: "8px" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginTop: "1rem" }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="card" style={{ padding: "0", height: "350px", display: "flex", flexDirection: "column" }}>
                        {/* Banner Skeleton */}
                        <div className="skeleton" style={{ height: "140px", width: "100%", borderRadius: "0 0 0 0" }}></div>

                        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                            {/* Title Skeleton */}
                            <div className="skeleton" style={{ height: "24px", width: "80%", borderRadius: "6px" }}></div>

                            {/* Badges Skeleton */}
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <div className="skeleton" style={{ height: "24px", width: "100px", borderRadius: "6px" }}></div>
                                <div className="skeleton" style={{ height: "24px", width: "80px", borderRadius: "6px" }}></div>
                            </div>

                            {/* Divider metrics */}
                            <div style={{ display: "flex", gap: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)", marginTop: "0.5rem" }}>
                                <div className="skeleton" style={{ height: "36px", width: "60px", borderRadius: "6px" }}></div>
                                <div className="skeleton" style={{ height: "36px", width: "60px", borderRadius: "6px" }}></div>
                            </div>

                            {/* Buttons Skeleton */}
                            <div style={{ marginTop: "auto", display: "flex", gap: "0.75rem" }}>
                                <div className="skeleton" style={{ height: "40px", flex: 1, borderRadius: "var(--radius)" }}></div>
                                <div className="skeleton" style={{ height: "40px", flex: 1, borderRadius: "var(--radius)" }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
