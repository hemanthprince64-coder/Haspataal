"use client";

export default function PharmacyPage() {
    const medicines = [
        {
            id: "med-1",
            name: "Paracetamol 500mg",
            brand: "Dolo 650",
            price: 32,
            discount: "15% off",
            image: "💊"
        },
        {
            id: "med-2",
            name: "Azithromycin 500mg",
            brand: "Azithral",
            price: 120,
            discount: "10% off",
            image: "💊"
        },
        {
            id: "med-3",
            name: "Cough Syrup",
            brand: "Benadryl",
            price: 115,
            discount: "5% off",
            image: "🍾"
        }
    ];

    return (
        <>
            <div className="page-header" style={{ padding: '32px 20px 24px', textAlign: 'left', background: 'var(--navy)' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>E-Pharmacy</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0 }}>Order medicines with superfast 2-hour delivery</p>
            </div>

            <div className="section" style={{ paddingTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <input
                        type="text"
                        placeholder="Search for medicines, vitamins..."
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                    <button style={{ background: 'var(--amber)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📸</span> Rx
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', margin: 0 }}>Trending Products</h3>
                    <span style={{ color: 'var(--blue)', fontSize: '13px', fontWeight: 'bold' }}>See All</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {medicines.map(med => (
                        <div key={med.id} className="card" style={{ padding: '16px', textAlign: 'center', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '4px' }}>
                                {med.discount}
                            </div>
                            <div style={{ fontSize: '48px', marginBottom: '12px', background: 'var(--bg-main)', borderRadius: '12px', padding: '16px 0' }}>{med.image}</div>
                            <h4 style={{ fontSize: '13px', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)', textAlign: 'left', height: '36px', overflow: 'hidden' }}>{med.name}</h4>
                            <p style={{ fontSize: '11px', color: 'var(--text3)', margin: '0 0 8px 0', textAlign: 'left' }}>{med.brand}</p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>₹{med.price}</span>
                                <button style={{ background: 'var(--blue-light)', color: 'var(--blue)', border: 'none', width: '28px', height: '28px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(to right, var(--teal-light), var(--blue-light))', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: 'var(--navy)' }}>Upload Prescription</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2)' }}>Let our pharmacist do the work</p>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '13px' }}>Upload</button>
                </div>
            </div>
        </>
    );
}
