export type Role =
  | "ADMIN"
  | "TEAMLEAD_MANAGER"
  | "TRADER_MANAGER"
  | "TRADER"
  | "MERCHANT"
  | "MERCHANT_MANAGER"
  | "HEAD_SUPPORT"
  | "SUPPORT";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface ScenarioOption {
  id: string;
  label: string;
  feedback: string;
  correct: boolean;
}

export interface ScenarioStep {
  id: string;
  title: string;
  instruction: string;
  options: ScenarioOption[];
}

export interface Scenario {
  id: string;
  title: string;
  summary: string;
  role: Role;
  steps: ScenarioStep[];
}

export interface TrainingModule {
  id: string;
  title: string;
  roles: Role[];
  explanation: string;
  steps: string[];
  mistakes: string[];
  checklist: string[];
  quiz: QuizQuestion[];
  scenario?: Scenario;
}

export const roles: Role[] = [
  "ADMIN",
  "TEAMLEAD_MANAGER",
  "TRADER_MANAGER",
  "TRADER",
  "MERCHANT",
  "MERCHANT_MANAGER",
  "HEAD_SUPPORT",
  "SUPPORT"
];

const allRoles = roles;
function question(
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

export const trainingModules: TrainingModule[] = [
  {
    id: "psp-role-map",
    title: "Роли и границы доступа PSP",
    roles: allRoles,
    explanation:
      "Модуль фиксирует новую ролевую модель: кто создает пользователей, кто верифицирует, кто управляет командами, shop'ами, устройствами, реквизитами и ордерами.",
    steps: [
      "Сверьте роль пользователя: ADMIN, TEAMLEAD_MANAGER, TRADER_MANAGER, TRADER, MERCHANT, MERCHANT_MANAGER, HEAD_SUPPORT или SUPPORT.",
      "Определите область видимости: ADMIN видит все, TEAMLEAD_MANAGER видит организацию, TRADER_MANAGER видит trader-команду, TRADER видит свои объекты, MERCHANT видит свой shop.",
      "Проверьте, разрешено ли действие роли: MERCHANT не создает shop, TRADER не создает trader-команду, SUPPORT/HEAD_SUPPORT работают read-only со списком пользователей и верификацией.",
      "Если действие требует подтверждения пользователя или shop, отправьте объект на /psp/admin/verification и не продолжайте рабочий flow до верификации.",
      "Не используйте реальные API keys, реальные реквизиты или production-данные в учебных примерах."
    ],
    mistakes: [
      "Считать MERCHANT_MANAGER и MERCHANT одной ролью.",
      "Создавать TRADER без teamlead-команды и trader-команды.",
      "Пытаться создать реквизит до добавления устройства.",
      "Давать SUPPORT права на изменение пользователей вместо read-only и верификации."
    ],
    checklist: [
      "Роль определена точно.",
      "Область видимости понятна.",
      "Верификация пользователя или shop учтена.",
      "Запрещенные действия не выполняются.",
      "Учебные данные не содержат секретов."
    ],
    quiz: [
      question(
        "role-map-1",
        "Кто имеет полный доступ и видит мерчантов, ордера, кошельки и валюты?",
        "ADMIN",
        "TRADER_MANAGER",
        "MERCHANT_MANAGER",
        "ADMIN управляет всей системой и верификацией."
      ),
      question(
        "role-map-2",
        "Может ли MERCHANT сам создать shop?",
        "Нет, shop создает MERCHANT_MANAGER или ADMIN",
        "Да, если shop нужен срочно",
        "Да, после первого ордера",
        "У MERCHANT нет permission на создание shop."
      ),
      question(
        "role-map-3",
        "Что видит TEAMLEAD_MANAGER?",
        "Инвайт-коды и ордера всей своей организации",
        "Только свои личные ордера",
        "Все валюты и все кошельки системы",
        "TEAMLEAD_MANAGER управляет teamlead-командой в пределах организации."
      )
    ]
  },
  {
    id: "admin-verification",
    title: "ADMIN: пользователи и верификация",
    roles: ["ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    explanation:
      "ADMIN создает пользователей любых типов через /psp/admin/users и подтверждает пользователей или shop'ы через /psp/admin/verification. SUPPORT и HEAD_SUPPORT видят пользователей read-only и участвуют в проверке.",
    steps: [
      "Откройте /psp/admin/users и создайте нужный тип пользователя: TEAMLEAD_MANAGER, MERCHANT_MANAGER или другой тип по процессу.",
      "После создания откройте /psp/admin/verification и найдите пользователя во вкладке Пользователи.",
      "Проверьте тип роли, email/идентификатор, связанный контур и отсутствие явных ошибок в данных.",
      "Подтвердите пользователя только после проверки. Неподтвержденный пользователь не должен продолжать рабочий сценарий.",
      "Для shop используйте вкладку Магазины и проверяйте percent, payout_percent и trust_amount перед подтверждением."
    ],
    mistakes: [
      "Пропускать /psp/admin/verification после создания пользователя.",
      "Подтверждать shop без проверки percent, payout_percent и trust_amount.",
      "Путать read-only SUPPORT с ADMIN-действиями.",
      "Создавать рабочие объекты под непроверенным пользователем."
    ],
    checklist: [
      "/psp/admin/users использован только для создания пользователя.",
      "/psp/admin/verification выполнен до следующего шага.",
      "Тип пользователя соответствует сценарию.",
      "Shop проверен во вкладке Магазины.",
      "Решение видно в учебном следе."
    ],
    quiz: [
      question(
        "admin-verification-1",
        "Где ADMIN подтверждает TEAMLEAD_MANAGER или TRADER_MANAGER?",
        "/psp/admin/verification во вкладке Пользователи",
        "/psp/teamlead/members",
        "/psp/trader-manager/team",
        "Создание и подтверждение разделены: подтверждение идет через admin verification."
      ),
      question(
        "admin-verification-2",
        "Что проверять при подтверждении shop?",
        "percent, payout_percent и trust_amount",
        "Только название магазина",
        "Только наличие первого ордера",
        "Эти параметры влияют на готовность shop к работе."
      ),
      question(
        "admin-verification-3",
        "Что могут SUPPORT и HEAD_SUPPORT в этой модели?",
        "Read-only список пользователей и верификация",
        "Создавать любых пользователей",
        "Создавать trader-команды",
        "Поддержка не получает полный административный доступ."
      )
    ],
    scenario: {
      id: "admin-verify-teamlead",
      title: "ADMIN подтверждает TEAMLEAD_MANAGER",
      role: "ADMIN",
      summary:
        "Проверьте созданного teamlead-менеджера перед созданием организации.",
      steps: [
        {
          id: "admin-verify-teamlead-1",
          title: "Пользователь создан",
          instruction: "Что открыть после создания TEAMLEAD_MANAGER в /psp/admin/users?",
          options: [
            {
              id: "verification",
              label: "/psp/admin/verification, вкладка Пользователи",
              feedback: "Верно. Новый пользователь должен быть подтвержден ADMIN.",
              correct: true
            },
            {
              id: "team",
              label: "/psp/trader-manager/team",
              feedback: "Неверно. Trader-команда создается позже и другой ролью.",
              correct: false
            }
          ]
        },
        {
          id: "admin-verify-teamlead-2",
          title: "Решение",
          instruction: "Когда можно подтверждать пользователя?",
          options: [
            {
              id: "checked",
              label: "Когда тип роли и данные проверены",
              feedback: "Верно. После этого TEAMLEAD_MANAGER может создавать организацию.",
              correct: true
            },
            {
              id: "skip",
              label: "Сразу после нажатия Создать",
              feedback: "Неверно. Верификация обязательна.",
              correct: false
            }
          ]
        }
      ]
    }
  },
  {
    id: "teamlead-organization",
    title: "TEAMLEAD_MANAGER: организация и участники",
    roles: ["TEAMLEAD_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    explanation:
      "TEAMLEAD_MANAGER управляет teamlead-командой, создает организацию через /psp/teamlead/teams и добавляет TRADER_MANAGER или других участников через /psp/teamlead/members.",
    steps: [
      "Войдите под верифицированным TEAMLEAD_MANAGER.",
      "Откройте /psp/teamlead/teams и нажмите Создать команду. Это teamlead-команда, то есть организация.",
      "После создания проверьте инвайт-коды и область видимости ордеров организации.",
      "Откройте /psp/teamlead/members и нажмите Добавить участника.",
      "Выберите тип TRADER_MANAGER, создайте участника и передайте его на ADMIN-верификацию.",
      "Не создавайте trader-команду здесь: ее создает TRADER_MANAGER в отдельном разделе."
    ],
    mistakes: [
      "Путать teamlead-команду с trader-командой.",
      "Забывать подтверждение TRADER_MANAGER после добавления участника.",
      "Добавлять трейдера напрямую вместо TRADER_MANAGER.",
      "Считать ордера всей системы ордерами организации."
    ],
    checklist: [
      "TEAMLEAD_MANAGER подтвержден ADMIN.",
      "Организация создана в /psp/teamlead/teams.",
      "Инвайт-коды доступны в контуре организации.",
      "TRADER_MANAGER добавлен через /psp/teamlead/members.",
      "TRADER_MANAGER отправлен на подтверждение."
    ],
    quiz: [
      question(
        "teamlead-organization-1",
        "Где TEAMLEAD_MANAGER создает организацию?",
        "/psp/teamlead/teams",
        "/psp/trader-manager/team",
        "/psp/admin/users",
        "/psp/teamlead/teams отвечает за teamlead-команду/организацию."
      ),
      question(
        "teamlead-organization-2",
        "Как TEAMLEAD_MANAGER добавляет TRADER_MANAGER?",
        "Через /psp/teamlead/members и тип TRADER_MANAGER",
        "Через /psp/trader/requisites",
        "Через POST /order-service/orders",
        "Участники организации добавляются через members."
      ),
      question(
        "teamlead-organization-3",
        "Что должно произойти после добавления TRADER_MANAGER?",
        "ADMIN подтверждает TRADER_MANAGER в /psp/admin/verification",
        "TRADER сразу создает реквизит",
        "MERCHANT_MANAGER создает shop",
        "TRADER_MANAGER должен быть верифицирован до продолжения."
      )
    ],
    scenario: {
      id: "teamlead-add-trader-manager",
      title: "TEAMLEAD_MANAGER добавляет TRADER_MANAGER",
      role: "TEAMLEAD_MANAGER",
      summary:
        "Создайте участника организации и не пропустите обязательную ADMIN-верификацию.",
      steps: [
        {
          id: "teamlead-add-trader-manager-1",
          title: "Команда",
          instruction: "Что создать первым после входа TEAMLEAD_MANAGER?",
          options: [
            {
              id: "organization",
              label: "Teamlead-команду в /psp/teamlead/teams",
              feedback: "Верно. Это организация, внутри которой появятся участники.",
              correct: true
            },
            {
              id: "requisite",
              label: "Реквизит в /psp/trader/requisites",
              feedback: "Неверно. Реквизит создает TRADER в конце цепочки.",
              correct: false
            }
          ]
        },
        {
          id: "teamlead-add-trader-manager-2",
          title: "Участник",
          instruction: "Что выбрать в /psp/teamlead/members?",
          options: [
            {
              id: "trader-manager",
              label: "Добавить участника с типом TRADER_MANAGER",
              feedback: "Верно. Затем ADMIN подтверждает этого пользователя.",
              correct: true
            },
            {
              id: "merchant-manager",
              label: "Добавить MERCHANT_MANAGER для trader-команды",
              feedback: "Неверно. Merchant flow отделен от trader flow.",
              correct: false
            }
          ]
        }
      ]
    }
  },
  {
    id: "trader-manager-team",
    title: "TRADER_MANAGER: trader-команда и устройства",
    roles: ["TRADER_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    explanation:
      "TRADER_MANAGER работает внутри организации: создает отдельную trader-команду, добавляет устройства и потом добавляет TRADER. Устройство обязательно до создания реквизита.",
    steps: [
      "Войдите под подтвержденным TRADER_MANAGER.",
      "Откройте /psp/trader-manager/team и нажмите Создать команду. Это trader-команда, отдельная от teamlead-команды.",
      "Откройте /psp/trader-manager/devices и нажмите Добавить устройство.",
      "Убедитесь, что устройство активно в trader-команде: без него TRADER не сможет создать реквизит.",
      "Вернитесь в /psp/trader-manager/team и нажмите Добавить трейдера.",
      "Создайте пользователя типа TRADER и отправьте его на ADMIN-верификацию."
    ],
    mistakes: [
      "Пропускать добавление устройства.",
      "Думать, что teamlead-команда уже является trader-командой.",
      "Считать созданного TRADER готовым до ADMIN-верификации.",
      "Добавлять устройство после ошибки создания реквизита вместо подготовки заранее."
    ],
    checklist: [
      "TRADER_MANAGER подтвержден.",
      "Trader-команда создана в /psp/trader-manager/team.",
      "Устройство добавлено в /psp/trader-manager/devices.",
      "TRADER добавлен через trader-manager/team.",
      "TRADER подтвержден ADMIN."
    ],
    quiz: [
      question(
        "trader-manager-team-1",
        "Где TRADER_MANAGER создает trader-команду?",
        "/psp/trader-manager/team",
        "/psp/teamlead/teams",
        "/psp/admin/verification",
        "Trader-команда создается отдельно от teamlead-команды."
      ),
      question(
        "trader-manager-team-2",
        "Что обязательно добавить до создания реквизита?",
        "Устройство в /psp/trader-manager/devices",
        "Shop в /psp/merchant/shops",
        "API key",
        "Без устройства реквизит создать нельзя."
      ),
      question(
        "trader-manager-team-3",
        "Кто подтверждает созданного TRADER?",
        "ADMIN через /psp/admin/verification",
        "MERCHANT",
        "Сам TRADER",
        "Все рабочие пользователи проходят ADMIN-верификацию."
      )
    ],
    scenario: {
      id: "trader-manager-ready-team",
      title: "TRADER_MANAGER готовит команду",
      role: "TRADER_MANAGER",
      summary:
        "Создайте trader-команду, добавьте устройство и подготовьте TRADER к подтверждению.",
      steps: [
        {
          id: "trader-manager-ready-team-1",
          title: "Подготовка",
          instruction: "Что нужно сделать перед добавлением реквизита трейдером?",
          options: [
            {
              id: "device",
              label: "Добавить устройство в /psp/trader-manager/devices",
              feedback: "Верно. Устройство потом автоподставится в реквизит.",
              correct: true
            },
            {
              id: "api-key",
              label: "Создать api_key для shop",
              feedback: "Неверно. Это часть merchant flow.",
              correct: false
            }
          ]
        },
        {
          id: "trader-manager-ready-team-2",
          title: "Трейдер",
          instruction: "Где добавить пользователя TRADER?",
          options: [
            {
              id: "team",
              label: "/psp/trader-manager/team, действие Добавить трейдера",
              feedback: "Верно. Затем TRADER подтверждается ADMIN.",
              correct: true
            },
            {
              id: "members",
              label: "/psp/teamlead/members как TRADER_MANAGER",
              feedback: "Неверно. Этот раздел создает TRADER_MANAGER в организации.",
              correct: false
            }
          ]
        }
      ]
    }
  },
  {
    id: "trader-requisites",
    title: "TRADER: реквизиты, устройство, ордера",
    roles: ["TRADER", "TRADER_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    explanation:
      "TRADER создает реквизиты, видит свои ордера, кошелек и выводы. Для рабочего реквизита нужен подтвержденный TRADER и устройство, заранее добавленное TRADER_MANAGER.",
    steps: [
      "Убедитесь, что TRADER подтвержден ADMIN в /psp/admin/verification.",
      "Откройте /psp/trader/requisites и нажмите Создать реквизит.",
      "Выберите банк из dropdown. Не вводите банк свободным текстом, если доступен список.",
      "Проверьте автоподстановку устройства. Если устройство не подставилось, вернитесь к TRADER_MANAGER и добавьте устройство.",
      "Создайте реквизит и проверьте, что TRADER видит свои ордера, кошелек и выводы.",
      "Не используйте реквизиты другого трейдера и не обходите привязку устройства."
    ],
    mistakes: [
      "Пытаться создать реквизит без устройства.",
      "Выбирать банк вне dropdown.",
      "Создавать реквизит до подтверждения TRADER.",
      "Проверять ордера всей команды вместо своих ордеров."
    ],
    checklist: [
      "TRADER подтвержден ADMIN.",
      "Устройство доступно и автоподставляется.",
      "Банк выбран из dropdown.",
      "Реквизит создан в /psp/trader/requisites.",
      "TRADER видит только свои ордера, кошелек и выводы."
    ],
    quiz: [
      question(
        "trader-requisites-1",
        "Что произойдет, если устройство не добавлено заранее?",
        "Реквизит создать нельзя или устройство не подставится",
        "Система создаст устройство сама",
        "Можно выбрать устройство мерчанта",
        "Устройство обязательно в подготовке trader flow."
      ),
      question(
        "trader-requisites-2",
        "Как выбрать банк при создании реквизита?",
        "Из dropdown",
        "Ввести произвольное название",
        "Взять из api_key shop",
        "Требование пользователя: банк выбирается из dropdown."
      ),
      question(
        "trader-requisites-3",
        "Что видит TRADER?",
        "Свои ордера, кошелек и выводы",
        "Все ордера организации",
        "Все shop'ы мерчантов",
        "TRADER ограничен своим рабочим контуром."
      )
    ],
    scenario: {
      id: "trader-create-requisite",
      title: "TRADER создает рабочий реквизит",
      role: "TRADER",
      summary:
        "Создайте реквизит после подтверждения и проверьте автоподстановку устройства.",
      steps: [
        {
          id: "trader-create-requisite-1",
          title: "Банк",
          instruction: "Как выбрать банк?",
          options: [
            {
              id: "dropdown",
              label: "Выбрать банк из dropdown",
              feedback: "Верно. Это исключает произвольные и неверные значения.",
              correct: true
            },
            {
              id: "manual",
              label: "Ввести банк вручную в комментарий",
              feedback: "Неверно. Нужно использовать dropdown.",
              correct: false
            }
          ]
        },
        {
          id: "trader-create-requisite-2",
          title: "Устройство",
          instruction: "Что проверить перед сохранением?",
          options: [
            {
              id: "device-auto",
              label: "Устройство автоподставилось",
              feedback: "Верно. Без устройства реквизит не готов к работе.",
              correct: true
            },
            {
              id: "ignore-device",
              label: "Сохранить без устройства",
              feedback: "Неверно. Нужно вернуть задачу TRADER_MANAGER.",
              correct: false
            }
          ]
        }
      ]
    }
  },
  {
    id: "merchant-manager-shops",
    title: "MERCHANT_MANAGER: shop и параметры",
    roles: ["MERCHANT_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    explanation:
      "MERCHANT_MANAGER создает и редактирует shop'ы через /psp/merchant/shops. MERCHANT владеет shop'ом, но не создает его самостоятельно.",
    steps: [
      "ADMIN создает MERCHANT_MANAGER через /psp/admin/users.",
      "ADMIN подтверждает MERCHANT_MANAGER в /psp/admin/verification во вкладке Пользователи.",
      "MERCHANT_MANAGER входит в систему и открывает /psp/merchant/shops.",
      "Нажмите Создать магазин и заполните учебные параметры shop.",
      "Передайте shop на подтверждение ADMIN во вкладке Магазины.",
      "ADMIN проверяет percent, payout_percent и trust_amount перед подтверждением."
    ],
    mistakes: [
      "Давать MERCHANT создание shop, хотя у него нет permission.",
      "Пропускать подтверждение MERCHANT_MANAGER.",
      "Подтверждать shop без финансовых параметров.",
      "Считать созданный shop готовым до вкладки Магазины в verification."
    ],
    checklist: [
      "MERCHANT_MANAGER создан ADMIN.",
      "MERCHANT_MANAGER подтвержден.",
      "Shop создан через /psp/merchant/shops.",
      "Shop подтвержден ADMIN во вкладке Магазины.",
      "percent, payout_percent и trust_amount проверены."
    ],
    quiz: [
      question(
        "merchant-manager-shops-1",
        "Кто создает shop?",
        "MERCHANT_MANAGER или ADMIN",
        "MERCHANT",
        "TRADER_MANAGER",
        "У MERCHANT нет permission на создание shop."
      ),
      question(
        "merchant-manager-shops-2",
        "Где создается shop MERCHANT_MANAGER?",
        "/psp/merchant/shops",
        "/psp/admin/users",
        "/psp/trader/requisites",
        "Shop создается в merchant-разделе."
      ),
      question(
        "merchant-manager-shops-3",
        "Где ADMIN подтверждает shop?",
        "/psp/admin/verification, вкладка Магазины",
        "/psp/teamlead/members",
        "POST /order-service/orders",
        "Shop проходит отдельную верификацию во вкладке Магазины."
      )
    ],
    scenario: {
      id: "merchant-manager-create-shop",
      title: "MERCHANT_MANAGER создает shop",
      role: "MERCHANT_MANAGER",
      summary:
        "Подготовьте shop и передайте его ADMIN на подтверждение параметров.",
      steps: [
        {
          id: "merchant-manager-create-shop-1",
          title: "Создание",
          instruction: "Где нажать Создать магазин?",
          options: [
            {
              id: "shops",
              label: "/psp/merchant/shops",
              feedback: "Верно. Это рабочий раздел MERCHANT_MANAGER.",
              correct: true
            },
            {
              id: "orders",
              label: "POST /order-service/orders",
              feedback: "Неверно. Этот endpoint принимает ордера после api_key.",
              correct: false
            }
          ]
        },
        {
          id: "merchant-manager-create-shop-2",
          title: "Подтверждение",
          instruction: "Что должен проверить ADMIN?",
          options: [
            {
              id: "params",
              label: "percent, payout_percent и trust_amount",
              feedback: "Верно. Без проверки параметров shop не готов.",
              correct: true
            },
            {
              id: "device",
              label: "Устройство трейдера",
              feedback: "Неверно. Устройство относится к trader flow.",
              correct: false
            }
          ]
        }
      ]
    }
  },
  {
    id: "merchant-api-orders",
    title: "MERCHANT: api_key и входящие ордера",
    roles: ["MERCHANT", "MERCHANT_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"],
    explanation:
      "MERCHANT владеет shop'ом и видит ордера, выводы и апелляции своего shop. API key создается для подтвержденного shop, после чего внешняя система отправляет ордера с заголовком X-API-KEY.",
    steps: [
      "Убедитесь, что shop создан MERCHANT_MANAGER или ADMIN и подтвержден ADMIN во вкладке Магазины.",
      "ADMIN или MERCHANT_MANAGER вызывает POST /authentication-service/api-key/create.",
      "Передайте тело запроса: { owner_id: <shop_id>, owner_type: 'MERCHANT' }.",
      "Сохраните полученный api_key как секрет учебного контура. Не вставляйте его в открытые комментарии.",
      "Внешняя система cascade или интегратор отправляет ордера в POST /order-service/orders.",
      "В запросе должен быть заголовок X-API-KEY: <api_key>. Без него ордер не должен считаться корректным."
    ],
    mistakes: [
      "Создавать api_key до подтверждения shop.",
      "Использовать owner_type не MERCHANT.",
      "Передавать api_key в теле ордера вместо заголовка X-API-KEY.",
      "Давать MERCHANT право создавать shop."
    ],
    checklist: [
      "Shop подтвержден.",
      "api_key создан через authentication-service.",
      "owner_id равен shop_id.",
      "owner_type равен MERCHANT.",
      "Интегратор отправляет ордера с X-API-KEY."
    ],
    quiz: [
      question(
        "merchant-api-orders-1",
        "Какой owner_type используется при создании api_key для shop?",
        "MERCHANT",
        "SHOP",
        "TRADER",
        "Требуемое тело запроса содержит owner_type: 'MERCHANT'."
      ),
      question(
        "merchant-api-orders-2",
        "Куда интегратор отправляет ордера?",
        "POST /order-service/orders с X-API-KEY",
        "GET /psp/admin/users",
        "POST /psp/trader/requisites",
        "Ордера создаются через order-service и заголовок api key."
      ),
      question(
        "merchant-api-orders-3",
        "Что видит MERCHANT?",
        "Ордера своего shop, выводы и апелляции",
        "Все ордера организации",
        "Все устройства трейдеров",
        "MERCHANT ограничен своим shop."
      )
    ],
    scenario: {
      id: "merchant-api-order-flow",
      title: "API key для shop и первый ордер",
      role: "MERCHANT_MANAGER",
      summary:
        "Создайте api_key для подтвержденного shop и проверьте, как интегратор должен отправлять ордер.",
      steps: [
        {
          id: "merchant-api-order-flow-1",
          title: "API key",
          instruction: "Какое тело запроса корректно?",
          options: [
            {
              id: "merchant-owner",
              label: "{ owner_id: <shop_id>, owner_type: 'MERCHANT' }",
              feedback: "Верно. Ключ создается для владельца shop типа MERCHANT.",
              correct: true
            },
            {
              id: "trader-owner",
              label: "{ owner_id: <trader_id>, owner_type: 'TRADER' }",
              feedback: "Неверно. Это не merchant order flow.",
              correct: false
            }
          ]
        },
        {
          id: "merchant-api-order-flow-2",
          title: "Ордер",
          instruction: "Где должен быть api_key при отправке ордера?",
          options: [
            {
              id: "header",
              label: "В заголовке X-API-KEY",
              feedback: "Верно. Интегратор шлет POST /order-service/orders с этим заголовком.",
              correct: true
            },
            {
              id: "comment",
              label: "В комментарии к shop",
              feedback: "Неверно. API key нельзя раскрывать в комментариях.",
              correct: false
            }
          ]
        }
      ]
    }
  },
  {
    id: "support-readonly-verification",
    title: "HEAD_SUPPORT / SUPPORT: read-only и верификация",
    roles: ["HEAD_SUPPORT", "SUPPORT", "ADMIN"],
    explanation:
      "HEAD_SUPPORT и SUPPORT помогают проверять пользователей и shop'ы, но не получают права создания команд, shop'ов, реквизитов или API keys.",
    steps: [
      "Откройте список пользователей в read-only режиме и найдите нужный объект.",
      "Сверьте роль, статус верификации и связанный контур: организация, trader-команда или shop.",
      "Если объект требует подтверждения, работайте через процесс верификации, не меняя остальные данные.",
      "Для спорного shop проверьте percent, payout_percent и trust_amount, затем передайте решение ADMIN или зафиксируйте результат по своему процессу.",
      "Не создавайте пользователей, команды, устройства, реквизиты, shop'ы или api_key из роли поддержки."
    ],
    mistakes: [
      "Использовать SUPPORT как замену ADMIN.",
      "Менять параметры shop вместо проверки.",
      "Создавать объекты в чужих разделах.",
      "Писать секреты api_key в тикет."
    ],
    checklist: [
      "Режим read-only соблюден.",
      "Верификационный объект найден.",
      "Роль и контур объекта проверены.",
      "Секреты не раскрыты.",
      "Эскалация понятна."
    ],
    quiz: [
      question(
        "support-readonly-1",
        "Что запрещено SUPPORT?",
        "Создавать shop, команды, реквизиты и api_key",
        "Смотреть read-only список пользователей",
        "Участвовать в верификации",
        "SUPPORT не выполняет операционные действия других ролей."
      ),
      question(
        "support-readonly-2",
        "Что SUPPORT проверяет у shop при верификации?",
        "percent, payout_percent и trust_amount",
        "Устройство трейдера",
        "Инвайт-код организации",
        "Эти параметры относятся к подтверждению shop."
      ),
      question(
        "support-readonly-3",
        "Можно ли писать api_key в тикет поддержки?",
        "Нет, это секрет",
        "Да, если тикет внутренний",
        "Да, если ключ учебный",
        "Даже в тренажере секреты не должны попадать в открытые заметки."
      )
    ]
  }
];

export function getModulesForRole(role: Role): TrainingModule[] {
  return trainingModules.filter((module) => module.roles.includes(role));
}

export function getModuleById(moduleId: string): TrainingModule | undefined {
  return trainingModules.find((module) => module.id === moduleId);
}
