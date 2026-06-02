import type { QuizQuestion, Role } from "./training-content";

export interface RolePlaybook {
  role: Role;
  responsibility: string;
  firstChecks: string[];
  dailyTasks: string[];
  allowedActions: string[];
  forbidden: string[];
  commonMistakes: string[];
  attentionStatuses: string[];
  escalation: string[];
  endOfDayChecklist: string[];
  explainToColleague: string;
}

export interface StatusGlossaryItem {
  group: string;
  code: string;
  label: string;
  meaning: string;
  visibleTo: string;
  changedBy: string;
  nextAction: string;
  commonMistake: string;
}

export interface ProcessMap {
  id: string;
  title: string;
  steps: string[];
  result: string;
}

export interface DecisionTree {
  id: string;
  situation: string;
  rules: string[];
  escalation: string;
}

export interface TrainingCase {
  id: string;
  title: string;
  situation: string;
  role: Role;
  inspect: string[];
  correctAction: string;
  incorrectAction: string;
  expectedResult: string;
}

export interface RoleSimulation {
  id: string;
  title: string;
  role: Role;
  situation: string;
  task: string;
  steps: string[];
  choices: Array<{
    id: string;
    text: string;
  }>;
  correctChoiceId: string;
  explanation: string;
  expectedResult: string;
  commonWrongAction: string;
}

export interface QuickReferenceSection {
  title: string;
  items: string[];
}

export interface ModuleDeepDive {
  moduleId: string;
  purpose: string;
  users: Role[];
  screen: string;
  card: string;
  fieldsToCheck: string[];
  allowedActions: string[];
  blockedActions: string[];
  verifyAfterAction: string[];
  escalationRule: string;
  miniExample: string;
}

function examQuestion(
  id: string,
  prompt: string,
  correct: string,
  wrongA: string,
  wrongB: string,
  explanation: string
): QuizQuestion {
  return {
    id,
    question: prompt,
    options: [
      { id: "a", text: correct },
      { id: "b", text: wrongA },
      { id: "c", text: wrongB }
    ],
    correctOptionId: "a",
    explanation
  };
}

export const rolePlaybooks: RolePlaybook[] = [
  {
    role: "ADMIN",
    responsibility:
      "Полный доступ: создает пользователей любых типов, верифицирует пользователей и shop'ы, видит мерчантов, ордера, кошельки и валюты.",
    firstChecks: [
      "Проверить очередь /psp/admin/verification.",
      "Разделить вкладки Пользователи и Магазины.",
      "Для shop проверить percent, payout_percent и trust_amount."
    ],
    dailyTasks: [
      "Создавать TEAMLEAD_MANAGER и MERCHANT_MANAGER через /psp/admin/users.",
      "Подтверждать TEAMLEAD_MANAGER, TRADER_MANAGER, TRADER и MERCHANT_MANAGER.",
      "Подтверждать shop перед созданием api_key.",
      "Разбирать доступы по мерчантам, ордерам, кошелькам и валютам."
    ],
    allowedActions: [
      "Создание пользователей любых типов.",
      "Верификация пользователей и shop'ов.",
      "Создание или помощь в создании shop и api_key.",
      "Просмотр всей системы."
    ],
    forbidden: [
      "Пропускать верификацию перед продолжением рабочего flow.",
      "Подтверждать shop без percent, payout_percent и trust_amount.",
      "Раскрывать api_key в комментариях или учебных заметках."
    ],
    commonMistakes: [
      "Считать созданного пользователя уже готовым к работе.",
      "Путать вкладку Пользователи и вкладку Магазины.",
      "Создавать ключ для неподтвержденного shop."
    ],
    attentionStatuses: ["Ожидает верификации", "Shop на проверке", "API key создан"],
    escalation: [
      "К владельцу процесса: если параметры shop не согласованы.",
      "К интегратору: если ордера идут без X-API-KEY.",
      "К поддержке: если нужна проверка данных пользователя."
    ],
    endOfDayChecklist: [
      "Нет пользователей, созданных без решения по verification.",
      "Shop'ы с ключами подтверждены.",
      "Секреты не записаны в открытые поля."
    ],
    explainToColleague:
      "ADMIN сначала создает или проверяет объект, затем обязательно подтверждает пользователя или shop в /psp/admin/verification."
  },
  {
    role: "TEAMLEAD_MANAGER",
    responsibility:
      "Управляет teamlead-командой, то есть организацией. Создает организацию, добавляет TRADER_MANAGER и видит инвайт-коды и ордера всей организации.",
    firstChecks: [
      "Убедиться, что ADMIN подтвердил TEAMLEAD_MANAGER.",
      "Открыть /psp/teamlead/teams.",
      "Проверить инвайт-коды и границы организации."
    ],
    dailyTasks: [
      "Создавать организацию.",
      "Добавлять TRADER_MANAGER через /psp/teamlead/members.",
      "Смотреть ордера всей организации.",
      "Передавать созданных участников на ADMIN-верификацию."
    ],
    allowedActions: [
      "Создание teamlead-команды.",
      "Добавление участников организации.",
      "Просмотр ордеров организации и инвайт-кодов."
    ],
    forbidden: [
      "Создавать trader-команду вместо TRADER_MANAGER.",
      "Добавлять TRADER напрямую в обход TRADER_MANAGER.",
      "Продолжать flow с неподтвержденным TRADER_MANAGER."
    ],
    commonMistakes: [
      "Путать teamlead-команду и trader-команду.",
      "Забывать шаг ADMIN-верификации.",
      "Ожидать видимость всех ордеров системы."
    ],
    attentionStatuses: ["Организация создана", "TRADER_MANAGER ожидает подтверждения"],
    escalation: [
      "К ADMIN: подтверждение TRADER_MANAGER.",
      "К TRADER_MANAGER: дальнейшее создание trader-команды.",
      "К SUPPORT: проверка видимости пользователя."
    ],
    endOfDayChecklist: [
      "Организация создана.",
      "Участники добавлены с правильным типом.",
      "TRADER_MANAGER отправлен на verification."
    ],
    explainToColleague:
      "TEAMLEAD_MANAGER отвечает за организацию и участников верхнего уровня, а trader-команду создает уже TRADER_MANAGER."
  },
  {
    role: "TRADER_MANAGER",
    responsibility:
      "Управляет trader-командой внутри организации: создает команду, добавляет TRADER, добавляет устройства и видит ордера команды.",
    firstChecks: [
      "Проверить, что ADMIN подтвердил TRADER_MANAGER.",
      "Открыть /psp/trader-manager/team.",
      "Проверить наличие устройства в /psp/trader-manager/devices."
    ],
    dailyTasks: [
      "Создавать trader-команду.",
      "Добавлять устройства.",
      "Добавлять TRADER.",
      "Контролировать ордера команды."
    ],
    allowedActions: [
      "Создание trader-команды.",
      "Добавление устройства.",
      "Добавление TRADER.",
      "Просмотр ордеров команды."
    ],
    forbidden: [
      "Пропускать устройство перед созданием реквизита.",
      "Подтверждать TRADER самостоятельно.",
      "Создавать shop или api_key."
    ],
    commonMistakes: [
      "Считать teamlead-команду готовой trader-командой.",
      "Добавлять TRADER до устройства.",
      "Не отправлять TRADER на ADMIN-верификацию."
    ],
    attentionStatuses: ["Trader-команда создана", "Устройство добавлено", "TRADER на проверке"],
    escalation: [
      "К ADMIN: подтверждение TRADER.",
      "К TEAMLEAD_MANAGER: проблемы организации.",
      "К SUPPORT: проверка видимости команды."
    ],
    endOfDayChecklist: [
      "Trader-команда создана.",
      "Устройство добавлено.",
      "TRADER добавлен и отправлен на verification."
    ],
    explainToColleague:
      "TRADER_MANAGER готовит рабочую площадку трейдера: отдельную команду, устройство и пользователя TRADER."
  },
  {
    role: "TRADER",
    responsibility:
      "Создает реквизиты и устройства, видит свои ордера, кошелек и выводы. Работает только после подтверждения и наличия устройства.",
    firstChecks: [
      "Проверить, что ADMIN подтвердил TRADER.",
      "Открыть /psp/trader/requisites.",
      "Убедиться, что устройство автоподставляется."
    ],
    dailyTasks: [
      "Создавать реквизиты.",
      "Выбирать банк из dropdown.",
      "Смотреть свои ордера, кошелек и выводы.",
      "Сообщать TRADER_MANAGER, если устройство не подставилось."
    ],
    allowedActions: [
      "Создание реквизита.",
      "Работа со своими ордерами.",
      "Просмотр своего кошелька и выводов."
    ],
    forbidden: [
      "Создавать реквизит без устройства.",
      "Использовать чужие устройства или реквизиты.",
      "Смотреть ордера всей организации как свои."
    ],
    commonMistakes: [
      "Искать банк через ручной ввод вместо dropdown.",
      "Продолжать без автоподставленного устройства.",
      "Начинать работу до ADMIN-верификации."
    ],
    attentionStatuses: ["Устройство не найдено", "Реквизит создан", "TRADER подтвержден"],
    escalation: [
      "К TRADER_MANAGER: устройство или команда.",
      "К ADMIN: статус верификации.",
      "К SUPPORT: вопросы по видимости данных."
    ],
    endOfDayChecklist: [
      "Реквизиты созданы только с устройством.",
      "Банк выбран из dropdown.",
      "Ордера проверены только в своем контуре."
    ],
    explainToColleague:
      "TRADER не готов к работе, пока его не подтвердил ADMIN и пока TRADER_MANAGER не добавил устройство."
  },
  {
    role: "MERCHANT_MANAGER",
    responsibility:
      "Создает и редактирует shop'ы. После подтверждения shop может получить api_key для приема ордеров от интегратора.",
    firstChecks: [
      "Проверить, что ADMIN подтвердил MERCHANT_MANAGER.",
      "Открыть /psp/merchant/shops.",
      "Проверить параметры shop перед передачей на verification."
    ],
    dailyTasks: [
      "Создавать shop.",
      "Редактировать shop.",
      "Передавать shop на подтверждение ADMIN.",
      "Создавать api_key для подтвержденного shop, если это разрешено процессом."
    ],
    allowedActions: [
      "Создание и редактирование shop.",
      "Запрос api_key для shop.",
      "Подготовка merchant flow."
    ],
    forbidden: [
      "Создавать shop под ролью MERCHANT.",
      "Создавать api_key до подтверждения shop.",
      "Передавать api_key в открытый тикет."
    ],
    commonMistakes: [
      "Пропускать вкладку Магазины в verification.",
      "Путать owner_id с user_id вместо shop_id.",
      "Указывать owner_type не MERCHANT."
    ],
    attentionStatuses: ["Shop создан", "Shop на verification", "API key создан"],
    escalation: [
      "К ADMIN: подтверждение shop.",
      "К интегратору: проверка X-API-KEY.",
      "К SUPPORT: верификационные вопросы."
    ],
    endOfDayChecklist: [
      "Shop создан корректно.",
      "Параметры переданы на проверку.",
      "API key хранится как секрет."
    ],
    explainToColleague:
      "MERCHANT_MANAGER создает shop, а рабочим он становится после подтверждения ADMIN и выдачи api_key."
  },
  {
    role: "MERCHANT",
    responsibility:
      "Владелец shop'а. Видит ордера своего shop'а, выводы и апелляции, но сам shop не создает.",
    firstChecks: [
      "Проверить, что shop создан MERCHANT_MANAGER или ADMIN.",
      "Убедиться, что shop подтвержден.",
      "Проверить входящие ордера своего shop."
    ],
    dailyTasks: [
      "Смотреть ордера shop.",
      "Смотреть выводы.",
      "Смотреть апелляции.",
      "Сообщать о проблемах интеграции по X-API-KEY."
    ],
    allowedActions: [
      "Просмотр ордеров своего shop.",
      "Просмотр выводов и апелляций.",
      "Разбор статусов с поддержкой."
    ],
    forbidden: [
      "Создавать shop.",
      "Создавать trader-команды.",
      "Использовать api_key в открытых комментариях."
    ],
    commonMistakes: [
      "Ожидать доступ к чужим shop'ам.",
      "Считать отсутствие ордеров ошибкой без проверки X-API-KEY.",
      "Пытаться редактировать shop без роли MERCHANT_MANAGER."
    ],
    attentionStatuses: ["Нет ордеров", "Апелляция открыта", "Вывод ожидает"],
    escalation: [
      "К MERCHANT_MANAGER: настройки shop.",
      "К ADMIN: verification или api_key.",
      "К SUPPORT: апелляции и видимость."
    ],
    endOfDayChecklist: [
      "Проверены ордера своего shop.",
      "Апелляции не оставлены без статуса.",
      "Секреты не раскрыты."
    ],
    explainToColleague:
      "MERCHANT работает с уже созданным shop и его операциями, но создание shop находится у MERCHANT_MANAGER или ADMIN."
  },
  {
    role: "HEAD_SUPPORT",
    responsibility:
      "Read-only список пользователей и участие в верификации. Помогает проверять данные, но не создает рабочие объекты.",
    firstChecks: [
      "Открыть список пользователей в read-only.",
      "Проверить роль, контур и статус verification.",
      "Отделить пользовательскую verification от shop verification."
    ],
    dailyTasks: [
      "Проверять пользователей.",
      "Проверять shop-параметры.",
      "Фиксировать безопасный вывод.",
      "Эскалировать ADMIN действия создания и изменения."
    ],
    allowedActions: [
      "Read-only просмотр пользователей.",
      "Участие в verification.",
      "Разбор фактов по объекту."
    ],
    forbidden: [
      "Создавать пользователей.",
      "Создавать shop, устройства, реквизиты или api_key.",
      "Менять параметры вместо владельца процесса."
    ],
    commonMistakes: [
      "Принимать read-only роль за ADMIN.",
      "Раскрывать api_key в тикете.",
      "Подтверждать объект без проверки контура."
    ],
    attentionStatuses: ["Ожидает verification", "Нужна проверка", "Недостаточно данных"],
    escalation: [
      "К ADMIN: создание, изменение и финальное решение.",
      "К MERCHANT_MANAGER: параметры shop.",
      "К TRADER_MANAGER: устройства и команда."
    ],
    endOfDayChecklist: [
      "Проверки зафиксированы.",
      "Секреты не раскрыты.",
      "Эскалации направлены владельцам."
    ],
    explainToColleague:
      "HEAD_SUPPORT помогает проверить и объяснить, но не выполняет действия владельцев ролей."
  },
  {
    role: "SUPPORT",
    responsibility:
      "Read-only список пользователей и участие в верификации. Работает с фактами, статусами и безопасной эскалацией.",
    firstChecks: [
      "Найти пользователя или shop.",
      "Проверить роль и статус.",
      "Посмотреть, кто владелец следующего действия."
    ],
    dailyTasks: [
      "Проверять статусы.",
      "Помогать с verification.",
      "Объяснять ограничения ролей.",
      "Передавать задачи ADMIN, TEAMLEAD_MANAGER, TRADER_MANAGER или MERCHANT_MANAGER."
    ],
    allowedActions: [
      "Read-only просмотр пользователей.",
      "Проверка данных для verification.",
      "Эскалация с фактами."
    ],
    forbidden: [
      "Создавать пользователей или команды.",
      "Создавать shop или api_key.",
      "Менять реквизиты или устройства."
    ],
    commonMistakes: [
      "Обещать создание объекта вместо владельца роли.",
      "Не различать teamlead-команду и trader-команду.",
      "Сохранять секреты в комментариях."
    ],
    attentionStatuses: ["Неподтвержден", "Нет устройства", "Shop не подтвержден"],
    escalation: [
      "К ADMIN: verification.",
      "К TRADER_MANAGER: устройство.",
      "К MERCHANT_MANAGER: shop."
    ],
    endOfDayChecklist: [
      "Каждая проверка имеет следующий шаг.",
      "Нет раскрытых секретов.",
      "Нет действий вне read-only."
    ],
    explainToColleague:
      "SUPPORT проверяет и направляет, а не создает объекты за другие роли."
  }
];

export const statusGlossary: StatusGlossaryItem[] = [
  {
    group: "Пользователь",
    code: "pending_verification",
    label: "Ожидает подтверждения",
    meaning: "Пользователь создан, но еще не готов к рабочему flow.",
    visibleTo: "ADMIN, HEAD_SUPPORT, SUPPORT",
    changedBy: "ADMIN",
    nextAction: "Открыть /psp/admin/verification и подтвердить или отклонить.",
    commonMistake: "Продолжать создание команды или реквизита до подтверждения."
  },
  {
    group: "Shop",
    code: "shop_pending",
    label: "Shop на проверке",
    meaning: "Shop создан MERCHANT_MANAGER или ADMIN, но еще не подтвержден.",
    visibleTo: "ADMIN, MERCHANT_MANAGER, HEAD_SUPPORT, SUPPORT",
    changedBy: "ADMIN",
    nextAction: "Проверить percent, payout_percent и trust_amount во вкладке Магазины.",
    commonMistake: "Создавать api_key до подтверждения shop."
  },
  {
    group: "Устройство",
    code: "device_required",
    label: "Требуется устройство",
    meaning: "TRADER не сможет создать реквизит без устройства.",
    visibleTo: "TRADER_MANAGER, TRADER, ADMIN",
    changedBy: "TRADER_MANAGER",
    nextAction: "Добавить устройство в /psp/trader-manager/devices.",
    commonMistake: "Пытаться создать реквизит и игнорировать отсутствие автоподстановки."
  },
  {
    group: "Интеграция",
    code: "x_api_key_required",
    label: "Нужен X-API-KEY",
    meaning: "Интегратор должен отправить ордер с api_key в заголовке.",
    visibleTo: "ADMIN, MERCHANT_MANAGER, MERCHANT, SUPPORT",
    changedBy: "Внешняя система cascade / интегратор",
    nextAction: "Проверить POST /order-service/orders и заголовок X-API-KEY.",
    commonMistake: "Передавать ключ в теле запроса или комментарии."
  }
];

export const processMaps: ProcessMap[] = [
  {
    id: "ready-trader",
    title: "Создать трейдера готового к работе",
    steps: [
      "ADMIN: /psp/admin/users -> Создать -> тип Тимлид-менеджер",
      "ADMIN: /psp/admin/verification -> подтвердить TEAMLEAD_MANAGER",
      "TEAMLEAD_MANAGER: /psp/teamlead/teams -> Создать команду",
      "TEAMLEAD_MANAGER: /psp/teamlead/members -> Добавить участника -> TRADER_MANAGER",
      "ADMIN: /psp/admin/verification -> подтвердить TRADER_MANAGER",
      "TRADER_MANAGER: /psp/trader-manager/team -> Создать команду",
      "TRADER_MANAGER: /psp/trader-manager/devices -> Добавить устройство",
      "TRADER_MANAGER: /psp/trader-manager/team -> Добавить трейдера -> TRADER",
      "ADMIN: /psp/admin/verification -> подтвердить TRADER",
      "TRADER: /psp/trader/requisites -> Создать реквизит, выбрать банк из dropdown"
    ],
    result: "TRADER подтвержден, имеет устройство и может создать рабочий реквизит."
  },
  {
    id: "ready-merchant",
    title: "Создать мерчанта и подключить ордера",
    steps: [
      "ADMIN: /psp/admin/users -> Создать -> тип Мерчант-менеджер",
      "ADMIN: /psp/admin/verification -> Пользователи -> подтвердить MERCHANT_MANAGER",
      "MERCHANT_MANAGER: /psp/merchant/shops -> Создать магазин",
      "ADMIN: /psp/admin/verification -> Магазины -> подтвердить shop",
      "ADMIN или MERCHANT_MANAGER: POST /authentication-service/api-key/create",
      "Тело: { owner_id: <shop_id>, owner_type: 'MERCHANT' }",
      "Интегратор: POST /order-service/orders с заголовком X-API-KEY: <api_key>"
    ],
    result: "Shop подтвержден, api_key выдан, интегратор может отправлять ордера."
  }
];

export const decisionTrees: DecisionTree[] = [
  {
    id: "trader-no-device",
    situation: "TRADER не может создать реквизит",
    rules: [
      "Проверить, подтвержден ли TRADER в /psp/admin/verification.",
      "Проверить, добавил ли TRADER_MANAGER устройство в /psp/trader-manager/devices.",
      "Если устройство отсутствует, вернуть задачу TRADER_MANAGER.",
      "После добавления устройства повторить создание реквизита и выбрать банк из dropdown."
    ],
    escalation: "Если все шаги выполнены, но устройство не подставляется, передать ADMIN или техническому владельцу."
  },
  {
    id: "merchant-no-orders",
    situation: "MERCHANT не видит ордера shop",
    rules: [
      "Проверить, подтвержден ли shop во вкладке Магазины.",
      "Проверить, был ли создан api_key для owner_id = shop_id.",
      "Проверить owner_type = 'MERCHANT'.",
      "Проверить, отправляет ли интегратор POST /order-service/orders с X-API-KEY."
    ],
    escalation: "Если ключ и заголовок корректны, передать интегратору или ADMIN."
  },
  {
    id: "wrong-role-action",
    situation: "Пользователь пытается выполнить действие чужой роли",
    rules: [
      "MERCHANT не создает shop.",
      "TEAMLEAD_MANAGER не создает trader-команду.",
      "SUPPORT и HEAD_SUPPORT не создают рабочие объекты.",
      "TRADER не добавляет себя и не создает устройство вместо TRADER_MANAGER."
    ],
    escalation: "Передать задачу владельцу роли и зафиксировать безопасный следующий шаг."
  }
];

export const trainingCases: TrainingCase[] = [
  {
    id: "case-ready-trader",
    title: "Трейдер создан, но реквизит не создается",
    situation: "TRADER подтвержден, но в /psp/trader/requisites устройство не подставилось.",
    role: "TRADER_MANAGER",
    inspect: [
      "/psp/trader-manager/devices",
      "Связь устройства с trader-командой",
      "Статус подтверждения TRADER"
    ],
    correctAction: "Добавить устройство и попросить TRADER повторить создание реквизита.",
    incorrectAction: "Просить TRADER сохранить реквизит без устройства.",
    expectedResult: "Устройство автоподставляется, банк выбирается из dropdown."
  },
  {
    id: "case-merchant-shop",
    title: "MERCHANT просит создать shop",
    situation: "Пользователь с ролью MERCHANT хочет нажать Создать магазин.",
    role: "SUPPORT",
    inspect: ["Роль пользователя", "Наличие MERCHANT_MANAGER", "Статус shop"],
    correctAction: "Объяснить, что shop создает MERCHANT_MANAGER или ADMIN.",
    incorrectAction: "Выдать MERCHANT временный доступ на создание shop.",
    expectedResult: "Задача передана MERCHANT_MANAGER или ADMIN без нарушения прав."
  },
  {
    id: "case-api-key",
    title: "Ордера не приходят от интегратора",
    situation: "Shop подтвержден, но внешняя система не создает ордера.",
    role: "MERCHANT_MANAGER",
    inspect: [
      "Наличие api_key",
      "owner_id равен shop_id",
      "owner_type равен MERCHANT",
      "Заголовок X-API-KEY в POST /order-service/orders"
    ],
    correctAction: "Проверить заголовок X-API-KEY и параметры выдачи ключа.",
    incorrectAction: "Создать новый shop без проверки существующего ключа.",
    expectedResult: "Интегратор отправляет корректный запрос с X-API-KEY."
  }
];

export const roleSimulations: RoleSimulation[] = [
  {
    id: "sim-admin-shop-verification",
    title: "Подтвердить shop",
    role: "ADMIN",
    situation: "MERCHANT_MANAGER создал shop и отправил его на проверку.",
    task: "Проверить обязательные параметры перед подтверждением.",
    steps: ["Открыть /psp/admin/verification", "Перейти во вкладку Магазины", "Проверить percent, payout_percent, trust_amount"],
    choices: [
      { id: "approve-after-check", text: "Подтвердить после проверки параметров" },
      { id: "api-first", text: "Сначала создать api_key, потом проверить shop" }
    ],
    correctChoiceId: "approve-after-check",
    explanation: "api_key создается только после подтверждения shop.",
    expectedResult: "Shop подтвержден и готов к выдаче api_key.",
    commonWrongAction: "Создавать ключ для неподтвержденного shop."
  },
  {
    id: "sim-teamlead-member",
    title: "Добавить TRADER_MANAGER",
    role: "TEAMLEAD_MANAGER",
    situation: "Организация создана, нужен управляющий trader-командой.",
    task: "Добавить участника правильного типа.",
    steps: ["/psp/teamlead/members", "Добавить участника", "Тип TRADER_MANAGER"],
    choices: [
      { id: "add-trader-manager", text: "Добавить TRADER_MANAGER и отправить на ADMIN-верификацию" },
      { id: "add-trader", text: "Добавить TRADER напрямую" }
    ],
    correctChoiceId: "add-trader-manager",
    explanation: "TRADER создается позже через TRADER_MANAGER.",
    expectedResult: "TRADER_MANAGER ожидает подтверждения ADMIN.",
    commonWrongAction: "Пропустить слой TRADER_MANAGER."
  },
  {
    id: "sim-trader-requisite",
    title: "Создать реквизит",
    role: "TRADER",
    situation: "TRADER подтвержден, устройство уже добавлено.",
    task: "Создать реквизит безопасным путем.",
    steps: ["/psp/trader/requisites", "Создать реквизит", "Банк из dropdown", "Проверить устройство"],
    choices: [
      { id: "dropdown-device", text: "Выбрать банк из dropdown и проверить автоподставленное устройство" },
      { id: "manual-bank", text: "Ввести банк вручную и сохранить без устройства" }
    ],
    correctChoiceId: "dropdown-device",
    explanation: "Банк выбирается из dropdown, устройство обязательно.",
    expectedResult: "Реквизит создан и привязан к устройству.",
    commonWrongAction: "Игнорировать отсутствие устройства."
  },
  {
    id: "sim-api-order",
    title: "Проверить первый ордер интегратора",
    role: "MERCHANT_MANAGER",
    situation: "Интегратор cascade готов отправить первый ордер.",
    task: "Проверить, что ключ и запрос оформлены правильно.",
    steps: ["api_key создан для shop_id", "owner_type = MERCHANT", "POST /order-service/orders", "Заголовок X-API-KEY"],
    choices: [
      { id: "header", text: "Проверить X-API-KEY в заголовке" },
      { id: "body", text: "Попросить отправить api_key в теле запроса" }
    ],
    correctChoiceId: "header",
    explanation: "Ордера принимаются с заголовком X-API-KEY.",
    expectedResult: "Ордер идет в shop MERCHANT.",
    commonWrongAction: "Раскрывать ключ в теле или комментарии."
  }
];

export const quickReference: QuickReferenceSection[] = [
  {
    title: "Кто создает",
    items: [
      "ADMIN создает пользователей любых типов.",
      "TEAMLEAD_MANAGER создает организацию и TRADER_MANAGER через /psp/teamlead/members.",
      "TRADER_MANAGER создает trader-команду, устройства и TRADER.",
      "MERCHANT_MANAGER или ADMIN создает shop.",
      "MERCHANT не создает shop."
    ]
  },
  {
    title: "Где подтверждать",
    items: [
      "Пользователи: /psp/admin/verification, вкладка Пользователи.",
      "Shop: /psp/admin/verification, вкладка Магазины.",
      "Shop проверяется по percent, payout_percent и trust_amount.",
      "Неподтвержденный пользователь или shop не считается готовым."
    ]
  },
  {
    title: "API и ордера",
    items: [
      "Создание ключа: POST /authentication-service/api-key/create.",
      "Тело: { owner_id: <shop_id>, owner_type: 'MERCHANT' }.",
      "Ордера: POST /order-service/orders.",
      "Заголовок: X-API-KEY: <api_key>.",
      "api_key не пишется в открытых комментариях."
    ]
  }
];

export const moduleDeepDives: ModuleDeepDive[] = [
  {
    moduleId: "psp-role-map",
    purpose: "Быстро определить, кто владеет действием и где проходит граница доступа.",
    users: ["ADMIN", "TEAMLEAD_MANAGER", "TRADER_MANAGER", "TRADER", "MERCHANT", "MERCHANT_MANAGER", "HEAD_SUPPORT", "SUPPORT"],
    screen: "Ролевой маршрут",
    card: "Матрица PSP-ролей",
    fieldsToCheck: ["Роль", "Контур видимости", "Разрешенное действие", "Нужна ли verification"],
    allowedActions: ["Выбрать правильный маршрут", "Передать действие владельцу роли"],
    blockedActions: ["Обход permission", "Создание объектов чужой ролью"],
    verifyAfterAction: ["Следующий шаг соответствует роли", "Нет секретов в данных"],
    escalationRule: "Если роль не владеет действием, передать владельцу процесса.",
    miniExample: "MERCHANT просит создать shop -> задача у MERCHANT_MANAGER или ADMIN."
  },
  {
    moduleId: "admin-verification",
    purpose: "Научить ADMIN подтверждать пользователей и shop'ы без пропуска обязательной проверки.",
    users: ["ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    screen: "/psp/admin/verification",
    card: "Пользователи / Магазины",
    fieldsToCheck: ["Тип роли", "Статус", "percent", "payout_percent", "trust_amount"],
    allowedActions: ["Подтвердить пользователя", "Подтвердить shop после проверки параметров"],
    blockedActions: ["Создать api_key до подтверждения shop", "Продолжить flow с неподтвержденным пользователем"],
    verifyAfterAction: ["Статус подтвержден", "Следующий владелец роли может продолжить"],
    escalationRule: "Неполные параметры shop возвращаются MERCHANT_MANAGER.",
    miniExample: "TRADER_MANAGER добавлен -> ADMIN подтверждает его во вкладке Пользователи."
  },
  {
    moduleId: "teamlead-organization",
    purpose: "Показать создание организации и участника TRADER_MANAGER.",
    users: ["TEAMLEAD_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    screen: "/psp/teamlead/teams и /psp/teamlead/members",
    card: "Организация и участники",
    fieldsToCheck: ["Teamlead-команда", "Инвайт-коды", "Тип участника TRADER_MANAGER"],
    allowedActions: ["Создать организацию", "Добавить TRADER_MANAGER"],
    blockedActions: ["Создать trader-команду", "Добавить TRADER напрямую"],
    verifyAfterAction: ["TRADER_MANAGER отправлен на ADMIN-верификацию"],
    escalationRule: "После добавления TRADER_MANAGER нужен ADMIN.",
    miniExample: "TEAMLEAD_MANAGER создал организацию -> добавил TRADER_MANAGER -> ждет verification."
  },
  {
    moduleId: "trader-manager-team",
    purpose: "Подготовить trader-команду, устройство и пользователя TRADER.",
    users: ["TRADER_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    screen: "/psp/trader-manager/team и /psp/trader-manager/devices",
    card: "Trader-команда",
    fieldsToCheck: ["Команда", "Устройство", "Пользователь TRADER", "Статус verification"],
    allowedActions: ["Создать trader-команду", "Добавить устройство", "Добавить TRADER"],
    blockedActions: ["Создать реквизит за TRADER", "Подтвердить TRADER без ADMIN"],
    verifyAfterAction: ["Устройство есть", "TRADER отправлен на verification"],
    escalationRule: "Подтверждение TRADER делает ADMIN.",
    miniExample: "Без устройства реквизит у TRADER не создается."
  },
  {
    moduleId: "trader-requisites",
    purpose: "Создать рабочий реквизит TRADER с банком из dropdown и автоподставленным устройством.",
    users: ["TRADER", "TRADER_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    screen: "/psp/trader/requisites",
    card: "Создать реквизит",
    fieldsToCheck: ["Статус TRADER", "Банк dropdown", "Автоподставленное устройство"],
    allowedActions: ["Создать реквизит", "Смотреть свои ордера, кошелек и выводы"],
    blockedActions: ["Сохранить без устройства", "Ввести банк вне dropdown"],
    verifyAfterAction: ["Реквизит привязан к устройству"],
    escalationRule: "Нет устройства -> TRADER_MANAGER.",
    miniExample: "TRADER выбирает банк из dropdown, устройство подставляется автоматически."
  },
  {
    moduleId: "merchant-manager-shops",
    purpose: "Создать shop и подготовить его к подтверждению ADMIN.",
    users: ["MERCHANT_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    screen: "/psp/merchant/shops",
    card: "Создать магазин",
    fieldsToCheck: ["Shop", "percent", "payout_percent", "trust_amount", "Статус verification"],
    allowedActions: ["Создать shop", "Редактировать shop", "Передать на verification"],
    blockedActions: ["Создать shop под MERCHANT", "Создать api_key до подтверждения"],
    verifyAfterAction: ["Shop виден ADMIN во вкладке Магазины"],
    escalationRule: "Подтверждение shop делает ADMIN.",
    miniExample: "MERCHANT_MANAGER создал shop -> ADMIN проверяет параметры."
  },
  {
    moduleId: "merchant-api-orders",
    purpose: "Выдать api_key для подтвержденного shop и принять ордера от интегратора.",
    users: ["MERCHANT", "MERCHANT_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    screen: "/authentication-service/api-key/create и /order-service/orders",
    card: "API key и ордера",
    fieldsToCheck: ["shop_id", "owner_type MERCHANT", "api_key", "X-API-KEY"],
    allowedActions: ["Создать ключ для подтвержденного shop", "Проверить ордер с X-API-KEY"],
    blockedActions: ["Передавать key в теле запроса", "Создавать key для неподтвержденного shop"],
    verifyAfterAction: ["Интегратор отправляет POST /order-service/orders с X-API-KEY"],
    escalationRule: "Нет ордеров -> проверить header и owner_id.",
    miniExample: "POST api-key/create с owner_id=<shop_id>, owner_type='MERCHANT'."
  },
  {
    moduleId: "support-readonly-verification",
    purpose: "Закрепить read-only границы SUPPORT и HEAD_SUPPORT.",
    users: ["HEAD_SUPPORT", "SUPPORT", "ADMIN"],
    screen: "Список пользователей и verification",
    card: "Проверка объекта",
    fieldsToCheck: ["Роль", "Статус", "Контур", "Следующий владелец"],
    allowedActions: ["Read-only проверка", "Участие в verification", "Эскалация"],
    blockedActions: ["Создание пользователей", "Создание shop", "Создание api_key"],
    verifyAfterAction: ["Факты проверены", "Владелец следующего шага указан"],
    escalationRule: "Создание и изменения передаются владельцу роли.",
    miniExample: "SUPPORT видит проблему shop и передает ее ADMIN/MERCHANT_MANAGER."
  }
];

export const finalCertificationQuiz: QuizQuestion[] = [
  examQuestion("final-1", "Кто создает TEAMLEAD_MANAGER?", "ADMIN через /psp/admin/users", "TRADER_MANAGER", "MERCHANT", "Пользователей любых типов создает ADMIN."),
  examQuestion("final-2", "Где подтверждается TRADER?", "/psp/admin/verification", "/psp/trader/requisites", "/psp/merchant/shops", "TRADER становится готовым после ADMIN-верификации."),
  examQuestion("final-3", "Что обязательно до создания реквизита?", "Устройство", "api_key", "shop", "Без устройства реквизит не создать."),
  examQuestion("final-4", "Кто создает shop?", "MERCHANT_MANAGER или ADMIN", "MERCHANT", "SUPPORT", "MERCHANT не имеет permission на создание shop."),
  examQuestion("final-5", "Где должен быть api_key при создании ордера?", "В заголовке X-API-KEY", "В комментарии", "В названии shop", "Интегратор отправляет POST /order-service/orders с X-API-KEY.")
];

const commonRoleQuestions = {
  ADMIN: [
    examQuestion("admin-exam-1", "Что ADMIN делает после создания TEAMLEAD_MANAGER?", "Подтверждает его в /psp/admin/verification", "Создает реквизит", "Отправляет ордер", "Пользователь должен быть подтвержден."),
    examQuestion("admin-exam-2", "Что проверить перед подтверждением shop?", "percent, payout_percent, trust_amount", "Только email", "Только устройство", "Shop проверяется по финансовым параметрам."),
    examQuestion("admin-exam-3", "Можно ли создавать api_key до подтверждения shop?", "Нет", "Да", "Только SUPPORT", "Ключ создается для подтвержденного shop.")
  ],
  TEAMLEAD_MANAGER: [
    examQuestion("teamlead-exam-1", "Где создается организация?", "/psp/teamlead/teams", "/psp/trader-manager/team", "/psp/trader/requisites", "Это teamlead-команда."),
    examQuestion("teamlead-exam-2", "Кого добавляет TEAMLEAD_MANAGER через /psp/teamlead/members?", "TRADER_MANAGER", "TRADER напрямую", "MERCHANT", "TRADER_MANAGER управляет trader-командой."),
    examQuestion("teamlead-exam-3", "Что видно TEAMLEAD_MANAGER?", "Инвайт-коды и ордера организации", "Все кошельки системы", "Только свои реквизиты", "Видимость ограничена организацией.")
  ],
  TRADER_MANAGER: [
    examQuestion("trader-manager-exam-1", "Где создается trader-команда?", "/psp/trader-manager/team", "/psp/teamlead/teams", "/psp/merchant/shops", "Trader-команда отдельна от организации."),
    examQuestion("trader-manager-exam-2", "Что добавить до реквизита?", "Устройство", "Shop", "API key", "Устройство обязательно."),
    examQuestion("trader-manager-exam-3", "Кто подтверждает TRADER?", "ADMIN", "TRADER_MANAGER", "MERCHANT", "Подтверждение идет через ADMIN.")
  ],
  TRADER: [
    examQuestion("trader-exam-1", "Где TRADER создает реквизит?", "/psp/trader/requisites", "/psp/teamlead/members", "/psp/merchant/shops", "Реквизиты создаются в trader-разделе."),
    examQuestion("trader-exam-2", "Как выбрать банк?", "Из dropdown", "Вручную в комментарии", "Через api_key", "Банк выбирается из списка."),
    examQuestion("trader-exam-3", "Что видит TRADER?", "Свои ордера, кошелек и выводы", "Все ордера организации", "Все shop'ы", "TRADER ограничен своим контуром.")
  ],
  MERCHANT: [
    examQuestion("merchant-exam-1", "Может ли MERCHANT создать shop?", "Нет", "Да", "Только после первого ордера", "Shop создает MERCHANT_MANAGER или ADMIN."),
    examQuestion("merchant-exam-2", "Что видит MERCHANT?", "Ордера своего shop, выводы, апелляции", "Все устройства трейдеров", "Все организации", "MERCHANT ограничен своим shop."),
    examQuestion("merchant-exam-3", "Что делать, если ордера не приходят?", "Проверить shop, api_key и X-API-KEY", "Создать реквизит", "Добавить устройство", "Проблема обычно в merchant integration flow.")
  ],
  MERCHANT_MANAGER: [
    examQuestion("merchant-manager-exam-1", "Где создается shop?", "/psp/merchant/shops", "/psp/trader/requisites", "/psp/teamlead/teams", "Shop создается в merchant-разделе."),
    examQuestion("merchant-manager-exam-2", "Какое тело для api_key?", "{ owner_id: <shop_id>, owner_type: 'MERCHANT' }", "{ owner_id: <user_id>, owner_type: 'SHOP' }", "{ owner_id: <trader_id>, owner_type: 'TRADER' }", "owner_id должен быть shop_id."),
    examQuestion("merchant-manager-exam-3", "Когда создавать api_key?", "После подтверждения shop", "До создания shop", "До verification", "Shop сначала подтверждается ADMIN.")
  ],
  HEAD_SUPPORT: [
    examQuestion("head-support-exam-1", "Какая граница HEAD_SUPPORT?", "Read-only список пользователей и верификация", "Полное создание пользователей", "Создание устройств", "HEAD_SUPPORT не заменяет ADMIN."),
    examQuestion("head-support-exam-2", "Можно ли раскрывать api_key в тикете?", "Нет", "Да", "Только в учебном", "Секреты не пишутся в открытых полях."),
    examQuestion("head-support-exam-3", "Куда эскалировать создание shop?", "MERCHANT_MANAGER или ADMIN", "TRADER", "SUPPORT", "Shop создает владелец merchant flow.")
  ],
  SUPPORT: [
    examQuestion("support-exam-1", "Что может SUPPORT?", "Read-only список пользователей и верификация", "Создавать shop", "Создавать TRADER", "SUPPORT работает с проверкой и эскалацией."),
    examQuestion("support-exam-2", "TRADER без устройства. Кому передать?", "TRADER_MANAGER", "MERCHANT_MANAGER", "MERCHANT", "Устройство добавляет TRADER_MANAGER."),
    examQuestion("support-exam-3", "MERCHANT просит создать shop. Что ответить?", "Shop создает MERCHANT_MANAGER или ADMIN", "MERCHANT может создать сам", "Нужно создать реквизит", "У MERCHANT нет permission.")
  ]
};

export const roleFinalExams: Record<Role, QuizQuestion[]> = commonRoleQuestions;

export function getModuleDeepDive(moduleId: string): ModuleDeepDive | undefined {
  return moduleDeepDives.find((module) => module.moduleId === moduleId);
}
