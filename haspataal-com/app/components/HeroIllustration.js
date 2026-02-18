export default function HeroIllustration() {
    return (
        <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
            {/* Background Circle */}
            <circle cx="300" cy="250" r="240" fill="#e0f2fe" opacity="0.5" />

            {/* --- Family Figures --- */}

            {/* Father (Left, Blue) */}
            <g transform="translate(140, 150)">
                <rect x="0" y="50" width="80" height="200" rx="40" fill="#0284c7" /> {/* Body */}
                <circle cx="40" cy="0" r="35" fill="#fde68a" /> {/* Head */}
            </g>

            {/* Mother (Center, Teal) */}
            <g transform="translate(250, 160)">
                <rect x="0" y="50" width="80" height="200" rx="40" fill="#0d9488" /> {/* Body */}
                <circle cx="40" cy="0" r="35" fill="#fde68a" /> {/* Head */}
            </g>

            {/* Child (Right-Center, Orange) */}
            <g transform="translate(360, 230)">
                <rect x="0" y="40" width="55" height="120" rx="27" fill="#f59e0b" /> {/* Body */}
                <circle cx="27" cy="0" r="27" fill="#fde68a" /> {/* Head */}
            </g>

            {/* Additional Figure (Far Right, Gray/Blue) */}
            <g transform="translate(440, 150)">
                <rect x="0" y="50" width="80" height="200" rx="40" fill="#64748b" /> {/* Body */}
                <circle cx="40" cy="0" r="35" fill="#e2e8f0" /> {/* Head */}
            </g>

            {/* --- Decorative Elements --- */}

            {/* Red Heart Icon */}
            <g transform="translate(160, 170)">
                <path d="M47.6 15.4C41.8 9.6 32.4 9.6 26.6 15.4L24 18L21.4 15.4C15.6 9.6 6.2 9.6 0.4 15.4C-5.4 21.2 -5.4 30.6 0.4 36.4L24 60L47.6 36.4C53.4 30.6 53.4 21.2 47.6 15.4Z"
                    fill="#ef4444" stroke="white" strokeWidth="3" />
            </g>

            {/* Shield/Half-Circle (Left) */}
            <path d="M0 250 C0 290 40 290 40 250 L40 210 L0 210 Z" fill="#0284c7" transform="translate(60, 60)" />

            {/* Floating Circle (Right) */}
            <circle cx="520" cy="120" r="40" fill="#d1fae5" opacity="0.8" />
            {/* Floating Circle (Bottom Left) */}
            <circle cx="80" cy="400" r="30" fill="#f3e8ff" opacity="0.8" />

        </svg>
    );
}
