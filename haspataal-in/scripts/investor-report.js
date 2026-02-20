
// Script to generate Investor Report
console.log("==========================================");
console.log("      HASPATAAL INVESTOR REPORT");
console.log("      Series A Readiness Check");
console.log("==========================================");

const metrics = {
    generatedAt: new Date().toISOString(),
    mrr: "$45,000 (Projected)",
    cac: "$150",
    ltv: "$5,000",
    retentionRate: "98%",
    churn: "2%",
    activeHospitals: 15, // Mock data
    totalPatients: 12500,
    growthMoM: "15%"
};

console.log(JSON.stringify(metrics, null, 2));
console.log("==========================================");
