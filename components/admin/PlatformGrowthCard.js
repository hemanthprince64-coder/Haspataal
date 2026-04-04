export default function PlatformGrowthCard() {
    return (
        <div className="card" style={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-card)",
            backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
        }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📈</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-main)" }}>Analytics Engine Coming Soon</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Revenue split operations and investor dashboards will populate here.</p>
            </div>
        </div>
    );
}
