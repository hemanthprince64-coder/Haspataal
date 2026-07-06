"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEngine = void 0;
const db_1 = require("@haspataal/db");
const uuid_1 = require("uuid");
class ConfigEngine {
    /**
     * Helper to write an outbox event.
     */
    async dispatchConfigUpdatedEvent(tx, eventType, hospitalId, payload) {
        await tx.outboxEvent.create({
            data: {
                id: (0, uuid_1.v4)(),
                eventType,
                payload: {
                    commandId: (0, uuid_1.v4)(),
                    commandVersion: 1,
                    target: 'all',
                    tenantContext: { hospitalId, branchId: 'default' },
                    actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                    correlationId: (0, uuid_1.v4)(),
                    idempotencyKey: `config-update-${hospitalId}-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    payload,
                },
                processed: false,
            },
        });
    }
    async getHospitalConfig(hospitalId) {
        const hospital = await db_1.prisma.hospitalsMaster.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital)
            return null;
        // Filter properties to match HospitalConfig interface
        return {
            logoUrl: hospital.logoUrl,
            faviconUrl: hospital.faviconUrl,
            brandColor: hospital.brandColor,
            stateRegistrationNumber: hospital.stateRegistrationNumber,
            nabhCertUrl: hospital.nabhCertUrl,
            nablCertUrl: hospital.nablCertUrl,
            timezone: hospital.timezone,
            workingDays: hospital.workingDays,
            openTime: hospital.openTime,
            closeTime: hospital.closeTime,
            emergencyContact: hospital.emergencyContact,
            isMultiBranch: hospital.isMultiBranch,
            invoicePrefix: hospital.invoicePrefix,
            nextInvoiceNumber: hospital.nextInvoiceNumber,
            gstInclusivePricing: hospital.gstInclusivePricing,
            letterheadTemplate: hospital.letterheadTemplate,
            prescriptionHeader: hospital.prescriptionHeader,
            prescriptionFooter: hospital.prescriptionFooter,
            isListedOnMarketplace: hospital.isListedOnMarketplace,
            marketplaceTagline: hospital.marketplaceTagline,
            marketplaceAbout: hospital.marketplaceAbout,
            marketplaceFacilities: hospital.marketplaceFacilities,
            showConsultationFees: hospital.showConsultationFees,
            showBedCharges: hospital.showBedCharges,
            showPackagePrices: hospital.showPackagePrices,
            allowOnlineBooking: hospital.allowOnlineBooking,
            requiresApproval: hospital.requiresApproval,
            cancellationPolicy: hospital.cancellationPolicy,
            depositRequired: hospital.depositRequired,
            depositAmount: hospital.depositAmount ? Number(hospital.depositAmount) : null,
            rankingScore: hospital.rankingScore,
            coverImageUrl: hospital.coverImageUrl,
            galleryUrls: hospital.galleryUrls,
            insurancePanels: hospital.insurancePanels,
            customCancellationTerms: hospital.customCancellationTerms,
            allowsInstantBooking: hospital.allowsInstantBooking,
            specialities: hospital.specialities,
        };
    }
    async updateHospitalConfig(hospitalId, data) {
        return await db_1.prisma.$transaction(async (tx) => {
            // 1. Update DB
            const updated = await tx.hospitalsMaster.update({
                where: { id: hospitalId },
                data: {
                    ...data,
                },
            });
            // 2. Dispatch Outbox Event
            await this.dispatchConfigUpdatedEvent(tx, 'HOSPITAL_CONFIG_UPDATED', hospitalId, { hospitalId, changes: data });
            return this.getHospitalConfig(hospitalId);
        });
    }
    async getOpdConfig(hospitalId) {
        const config = await db_1.prisma.opdConfig.findUnique({
            where: { hospitalId },
        });
        if (!config)
            return null;
        return {
            tokenMode: config.tokenMode,
            tokenPrefix: config.tokenPrefix,
            resetDaily: config.resetDaily,
            displayQueueOnTV: config.displayQueueOnTV,
            allowWalkIn: config.allowWalkIn,
            allowOnline: config.allowOnline,
            avgConsultationMinutes: config.avgConsultationMinutes,
            notifyPatientSms: config.notifyPatientSms,
            patientsAheadAlert: config.patientsAheadAlert,
            allowOverbooking: config.allowOverbooking,
            maxOverbookingPercent: config.maxOverbookingPercent,
            noShowPolicy: config.noShowPolicy,
            blockAfterNoShows: config.blockAfterNoShows,
            noShowCooldownDays: config.noShowCooldownDays,
            enableSmartSlots: config.enableSmartSlots,
            slotBufferMinutes: config.slotBufferMinutes,
            dailySlotCap: config.dailySlotCap,
            lunchBreakStart: config.lunchBreakStart,
            lunchBreakEnd: config.lunchBreakEnd,
            noShowFee: Number(config.noShowFee),
        };
    }
    async updateOpdConfig(hospitalId, data) {
        return await db_1.prisma.$transaction(async (tx) => {
            // Upsert to handle initial creation safely
            await tx.opdConfig.upsert({
                where: { hospitalId },
                create: {
                    hospitalId,
                    ...data,
                },
                update: {
                    ...data,
                },
            });
            await this.dispatchConfigUpdatedEvent(tx, 'OPD_CONFIG_UPDATED', hospitalId, { hospitalId, changes: data });
            return this.getOpdConfig(hospitalId);
        });
    }
    async getBillingProfile(hospitalId) {
        const profile = await db_1.prisma.hospitalBillingProfile.findUnique({
            where: { hospitalId },
        });
        if (!profile)
            return null;
        return {
            bankAccountNumber: profile.bankAccountNumber,
            bankIfsc: profile.bankIfsc,
            gstApplicable: profile.gstApplicable,
            tdsApplicable: profile.tdsApplicable,
            commissionPercentage: profile.commissionPercentage ? Number(profile.commissionPercentage) : null,
            payoutCycle: profile.payoutCycle,
            invoiceLayout: profile.invoiceLayout,
            headerText: profile.headerText,
            footerText: profile.footerText,
        };
    }
    async updateBillingProfile(hospitalId, data) {
        return await db_1.prisma.$transaction(async (tx) => {
            await tx.hospitalBillingProfile.upsert({
                where: { hospitalId },
                create: {
                    hospitalId,
                    ...data,
                },
                update: {
                    ...data,
                },
            });
            await this.dispatchConfigUpdatedEvent(tx, 'BILLING_PROFILE_UPDATED', hospitalId, { hospitalId, changes: data });
            return this.getBillingProfile(hospitalId);
        });
    }
}
exports.ConfigEngine = ConfigEngine;
//# sourceMappingURL=engine.js.map