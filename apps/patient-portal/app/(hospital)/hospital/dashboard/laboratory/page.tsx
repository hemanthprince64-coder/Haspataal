import { Metadata } from 'next';

import { LaboratoryWorklist } from '@/components/laboratory/LaboratoryWorklist';

export const metadata: Metadata = {
  title: 'Laboratory | Haspataal',
  description: 'Laboratory Dashboard',
};

export default function LaboratoryPage() {
  return (
    <main className="p-8">
      <LaboratoryWorklist />
    </main>
  );
}
