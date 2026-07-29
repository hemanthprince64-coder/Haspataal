'use strict';
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var client_1 = require('@prisma/client');
var consumer_registry_1 = require('../workers/consumer-registry');
var platform_contracts_1 = require('@haspataal/platform-contracts');
var prisma = new client_1.PrismaClient();
function parsePayload(raw) {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var args,
      consumerArg,
      fromArg,
      allConsumers,
      targetConsumer,
      fromDate,
      lastProcessedId,
      batchSize,
      processedCount,
      events,
      _loop_1,
      _i,
      events_1,
      record;
    var _this = this;
    var _a, _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          args = process.argv.slice(2);
          consumerArg =
            (_a = args.find(function (a) {
              return a.startsWith('--consumer=');
            })) === null || _a === void 0
              ? void 0
              : _a.split('=')[1];
          fromArg =
            (_b = args.find(function (a) {
              return a.startsWith('--from=');
            })) === null || _b === void 0
              ? void 0
              : _b.split('=')[1];
          if (!consumerArg) {
            console.error(
              'Usage: npx ts-node scripts/replay-events.ts --consumer=Timeline [--from=2024-01-01]',
            );
            process.exit(1);
          }
          allConsumers = consumer_registry_1.outboxConsumerRegistry.getAllConsumers();
          targetConsumer = allConsumers.find(function (c) {
            return c.consumerName === consumerArg;
          });
          if (!targetConsumer) {
            console.error(
              "Consumer '".concat(consumerArg, "' not found in registry. Valid consumers: ").concat(
                allConsumers
                  .map(function (c) {
                    return c.consumerName;
                  })
                  .join(', '),
              ),
            );
            process.exit(1);
          }
          fromDate = fromArg ? new Date(fromArg) : new Date(0);
          console.log(
            "Starting replay for consumer '"
              .concat(consumerArg, "' from ")
              .concat(fromDate.toISOString(), '...'),
          );
          // Force checkpoint status
          return [
            4 /*yield*/,
            prisma.$executeRaw(
              templateObject_1 ||
                (templateObject_1 = __makeTemplateObject(
                  [
                    '\n    INSERT INTO projection_checkpoint (consumer_name, last_replayed_at, status)\n    VALUES (',
                    ", NOW(), 'REPLAYING')\n    ON CONFLICT (consumer_name) DO UPDATE SET status = 'REPLAYING'\n  ",
                  ],
                  [
                    '\n    INSERT INTO projection_checkpoint (consumer_name, last_replayed_at, status)\n    VALUES (',
                    ", NOW(), 'REPLAYING')\n    ON CONFLICT (consumer_name) DO UPDATE SET status = 'REPLAYING'\n  ",
                  ],
                )),
              consumerArg,
            ),
          ];
        case 1:
          // Force checkpoint status
          _d.sent();
          lastProcessedId = null;
          batchSize = 100;
          processedCount = 0;
          _d.label = 2;
        case 2:
          if (!true) return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            prisma.outboxEvent.findMany(
              __assign(
                {
                  where: {
                    createdAt: { gte: fromDate },
                  },
                  orderBy: { createdAt: 'asc' },
                  take: batchSize,
                },
                lastProcessedId ? { cursor: { id: lastProcessedId }, skip: 1 } : {},
              ),
            ),
          ];
        case 3:
          events = _d.sent();
          if (events.length === 0) return [3 /*break*/, 8];
          _loop_1 = function (record) {
            var payload, envelope, effectiveEventType;
            return __generator(this, function (_e) {
              switch (_e.label) {
                case 0:
                  payload = parsePayload(record.payload);
                  envelope = (0, platform_contracts_1.normalizeLegacyOutbox)(record);
                  effectiveEventType =
                    (_c = payload === null || payload === void 0 ? void 0 : payload.eventName) !==
                      null && _c !== void 0
                      ? _c
                      : record.eventType;
                  if (!targetConsumer.supportedEvents().includes(effectiveEventType))
                    return [3 /*break*/, 2];
                  return [
                    4 /*yield*/,
                    (0, consumer_registry_1.executeWithPrismaTxIdempotency)(
                      record.id,
                      targetConsumer.consumerName,
                      function (tx) {
                        return __awaiter(_this, void 0, void 0, function () {
                          return __generator(this, function (_a) {
                            switch (_a.label) {
                              case 0:
                                return [4 /*yield*/, targetConsumer.handle(envelope, tx)];
                              case 1:
                                _a.sent();
                                return [2 /*return*/];
                            }
                          });
                        });
                      },
                    ),
                  ];
                case 1:
                  _e.sent();
                  processedCount++;
                  _e.label = 2;
                case 2:
                  lastProcessedId = record.id;
                  return [2 /*return*/];
              }
            });
          };
          ((_i = 0), (events_1 = events));
          _d.label = 4;
        case 4:
          if (!(_i < events_1.length)) return [3 /*break*/, 7];
          record = events_1[_i];
          return [5 /*yield**/, _loop_1(record)];
        case 5:
          _d.sent();
          _d.label = 6;
        case 6:
          _i++;
          return [3 /*break*/, 4];
        case 7:
          console.log('Processed batch... Total so far: '.concat(processedCount));
          return [3 /*break*/, 2];
        case 8:
          return [
            4 /*yield*/,
            prisma.$executeRaw(
              templateObject_2 ||
                (templateObject_2 = __makeTemplateObject(
                  [
                    "\n    UPDATE projection_checkpoint\n    SET status = 'ACTIVE', last_replayed_at = NOW(), last_event_id = ",
                    '\n    WHERE consumer_name = ',
                    '\n  ',
                  ],
                  [
                    "\n    UPDATE projection_checkpoint\n    SET status = 'ACTIVE', last_replayed_at = NOW(), last_event_id = ",
                    '\n    WHERE consumer_name = ',
                    '\n  ',
                  ],
                )),
              lastProcessedId,
              consumerArg,
            ),
          ];
        case 9:
          _d.sent();
          console.log(
            "Replay complete. Total events processed for '"
              .concat(consumerArg, "': ")
              .concat(processedCount),
          );
          return [2 /*return*/];
      }
    });
  });
}
main()
  .catch(console.error)
  .finally(function () {
    return prisma.$disconnect();
  });
var templateObject_1, templateObject_2;
