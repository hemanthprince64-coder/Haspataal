'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotificationCommandHandler = void 0;
const platform_contracts_1 = require('@haspataal/platform-contracts');
const types_1 = require('./types');
const engine_1 = require('./engine');
const SendNotificationCommandSchema = (0, platform_contracts_1.createPlatformCommandSchema)(
  types_1.NotificationInputSchema,
);
class NotificationCommandHandler {
  engine;
  constructor(engine) {
    this.engine = engine || new engine_1.NotificationEngine();
  }
  async handleSendNotification(rawCommand) {
    const command = SendNotificationCommandSchema.parse(rawCommand);
    const input = {
      ...command.payload,
      hospitalId: command.payload.hospitalId || command.tenantContext.hospitalId,
    };
    await this.engine.enqueue(input);
  }
  async handleSendNotificationPrepareDb(rawCommand, options) {
    const command = SendNotificationCommandSchema.parse(rawCommand);
    const input = {
      ...command.payload,
      hospitalId: command.payload.hospitalId || command.tenantContext.hospitalId,
    };
    return await this.engine.prepareDb(input, options?.tx);
  }
  async handleSendNotificationDispatch(queueName, notificationId, priority) {
    await this.engine.dispatchQueue(queueName, notificationId, priority);
  }
  async handleCreateTemplate(command) {
    const { prisma } = await Promise.resolve().then(() => __importStar(require('@haspataal/db')));
    const { hospitalId } = command.tenantContext;
    const template = await prisma.notificationTemplate.create({
      data: {
        ...command.payload,
        hospitalId,
      },
    });
    return template;
  }
  async handleCreateCampaign(command) {
    const { prisma } = await Promise.resolve().then(() => __importStar(require('@haspataal/db')));
    const { hospitalId } = command.tenantContext;
    const campaign = await prisma.notificationCampaign.create({
      data: {
        ...command.payload,
        hospitalId,
      },
    });
    return campaign;
  }
}
exports.NotificationCommandHandler = NotificationCommandHandler;
