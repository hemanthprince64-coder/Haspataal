import { PrismaClient, LabResultStatus } from '@haspataal/db';

import { ResultStateMachine } from '../domain/state-machine/ResultStateMachine';
import { CriticalValueEngine } from '../services/CriticalValueEngine';

const prisma = new PrismaClient();

export interface EnterResultValueDTO {
  parameterId: string;
  value: string;
}

export interface EnterResultDTO {
  clinicalOrderId: string;
  templateId: string;
  hospitalId: string;
  patientId: string;
  enteredBy: string;
  values: EnterResultValueDTO[];
}

export class EnterResultUseCase {
  public async execute(data: EnterResultDTO) {
    // 1. Fetch template to evaluate flags
    const template = await prisma.testTemplate.findUnique({
      where: { id: data.templateId },
      include: { parameters: true },
    });

    if (!template) throw new Error('Test Template not found');

    // 2. Map and evaluate values
    const resultValues = data.values.map((val) => {
      const param = template.parameters.find((p) => p.id === val.parameterId);
      if (!param) throw new Error(`Parameter ${val.parameterId} not found in template`);

      const evaluation = CriticalValueEngine.evaluate(val.value, param);
      const referenceRange = `${param.normalMin ?? ''} - ${param.normalMax ?? ''}`;

      return {
        parameterId: param.id,
        parameterName: param.name,
        value: val.value,
        unit: param.unit,
        referenceRange: referenceRange === ' - ' ? null : referenceRange,
        flag: evaluation.flag,
        isCritical: evaluation.isCritical,
      };
    });

    const labResult = await prisma.$transaction(async (tx) => {
      let result = await tx.labResult.findUnique({
        where: { clinicalOrderId: data.clinicalOrderId },
      });

      if (result) {
        ResultStateMachine.validateTransition(result.status, LabResultStatus.DRAFT);

        await tx.labResultValue.deleteMany({
          where: { labResultId: result.id },
        });

        result = await tx.labResult.update({
          where: { id: result.id },
          data: {
            status: LabResultStatus.DRAFT,
            enteredBy: data.enteredBy,
            enteredAt: new Date(),
          },
        });
      } else {
        const order = await tx.clinicalOrder.findUnique({ where: { id: data.clinicalOrderId } });
        if (!order) throw new Error('Order not found');

        result = await tx.labResult.create({
          data: {
            clinicalOrderId: data.clinicalOrderId,
            hospitalId: data.hospitalId,
            patientId: data.patientId,
            templateId: data.templateId,
            status: LabResultStatus.DRAFT,
            enteredBy: data.enteredBy,
            enteredAt: new Date(),
          },
        });
      }

      await tx.labResultValue.createMany({
        data: resultValues.map((v) => ({ ...v, labResultId: result!.id })),
      });

      return result;
    });

    const { TimelinePublisher, TimelineEventType } = await import('@haspataal/timeline');
    const timelinePublisher = new TimelinePublisher();

    const clinicalOrder = await prisma.clinicalOrder.findUnique({
      where: { id: data.clinicalOrderId },
    });

    await timelinePublisher.publish({
      patientId: data.patientId,
      encounterId: clinicalOrder?.encounterId || '',
      hospitalId: data.hospitalId,
      eventType: TimelineEventType.RESULT_ENTERED,
      title: 'Lab Result Entered (Draft)',
      description: 'The laboratory result has been drafted and is pending verification.',
      actorId: data.enteredBy,
      timestamp: new Date(),
      metadata: { labResultId: labResult.id },
    });

    return await prisma.labResult.findUnique({
      where: { id: labResult.id },
      include: { values: true },
    });
  }
}
