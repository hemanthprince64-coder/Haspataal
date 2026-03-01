"use client";

import Link from "next/link";
import styles from "./DoctorCard.module.css";

export default function DoctorCard({ doctor }) {
    const { id, name, speciality, hospital, distance, fees, matches, stars, image } = doctor;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.avatarWrap}>
                    <img src={image} alt={name} className={styles.avatar} />
                    <div className={styles.matchBadge}>{matches}% Match</div>
                </div>
                <div className={styles.info}>
                    <h3 className={styles.name}>{name}</h3>
                    <p className={styles.speciality}>{speciality}</p>
                    <div className={styles.metaRow}>
                        <span className={styles.hospital}>{hospital}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.distance}>📍 {distance}</span>
                    </div>
                    <div className={styles.statsRow}>
                        <span className={styles.stars}>⭐ {stars}</span>
                        <span className={styles.fees}>₹{fees}</span>
                    </div>
                </div>
            </div>
            <div className={styles.actions}>
                <Link href={`/doctor/${id}`} className={styles.viewBtn}>View Profile</Link>
                <Link href={`/book/${id}`} className={styles.bookBtn}>Book Consult</Link>
            </div>
        </div>
    );
}
