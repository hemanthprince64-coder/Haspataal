import { ClinicalOrderStatus } from '@haspataal/types';

import {
  PlaceClinicalOrderUseCase,
  PlaceClinicalOrderDTO,
} from '../usecases/PlaceClinicalOrderUseCase';
import {
  UpdateClinicalOrderStatusUseCase,
  UpdateClinicalOrderStatusDTO,
} from '../usecases/UpdateClinicalOrderStatusUseCase';

export class ClinicalOrderFacade {
  static async placeOrder(data: PlaceClinicalOrderDTO) {
    return PlaceClinicalOrderUseCase.execute(data);
  }

  static async updateStatus(data: UpdateClinicalOrderStatusDTO) {
    return UpdateClinicalOrderStatusUseCase.execute(data);
  }

  static async cancelOrder(
    data: Omit<UpdateClinicalOrderStatusDTO, 'status'> & { reason?: string },
  ) {
    return UpdateClinicalOrderStatusUseCase.execute({
      ...data,
      status: ClinicalOrderStatus.CANCELLED,
      // We might need to handle reason if it's added to UpdateClinicalOrderStatusDTO later
    });
  }
}
