const fs = require('fs');
const p = 'packages/pharmacy/index.ts';
let c = fs.readFileSync(p, 'utf-8');
c += `
// Use cases
export * from './src/use-cases/ProcessPharmacyOrderUseCase';
export * from './src/use-cases/VerifyPharmacyOrderUseCase';
export * from './src/use-cases/DispenseMedicationUseCase';
export * from './src/use-cases/CancelPharmacyOrderUseCase';

// Domain
export * from './src/domain/state-machine/PharmacyStateMachine';
`;
fs.writeFileSync(p, c);
