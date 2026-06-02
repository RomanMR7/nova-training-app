(function () {
  var root = document.getElementById("root");
  if (!root || root.children.length > 0) {
    return;
  }

  var SESSION_KEY = "nova-training-session-v1";
  var PROGRESS_PREFIX = "nova-training-progress-v2";
  var PASSWORD = "Training123!";
  var roles = [
    "ADMIN",
    "TEAMLEAD_MANAGER",
    "TRADER_MANAGER",
    "TRADER",
    "MERCHANT",
    "MERCHANT_MANAGER",
    "HEAD_SUPPORT",
    "SUPPORT"
  ];
  var roleIdByLabel = {
    ADMIN: "admin",
    TEAMLEAD_MANAGER: "teamlead_manager",
    TRADER_MANAGER: "trader_manager",
    TRADER: "trader",
    MERCHANT: "merchant",
    MERCHANT_MANAGER: "merchant_manager",
    HEAD_SUPPORT: "head_support",
    SUPPORT: "support"
  };
  var roleLabelById = {
    admin: "ADMIN",
    teamlead_manager: "TEAMLEAD_MANAGER",
    trader_manager: "TRADER_MANAGER",
    trader: "TRADER",
    merchant: "MERCHANT",
    merchant_manager: "MERCHANT_MANAGER",
    head_support: "HEAD_SUPPORT",
    support: "SUPPORT"
  };
  var trainingUsers = [
    user("training-admin", "admin@training.local", "Учебный ADMIN", "admin", roles.map(function (role) { return roleIdByLabel[role]; })),
    user("training-teamlead-manager", "teamlead.manager@training.local", "Учебный TEAMLEAD_MANAGER", "teamlead_manager"),
    user("training-trader-manager", "trader.manager@training.local", "Учебный TRADER_MANAGER", "trader_manager"),
    user("training-trader", "trader@training.local", "Учебный TRADER", "trader"),
    user("training-merchant", "merchant@training.local", "Учебный MERCHANT", "merchant"),
    user("training-merchant-manager", "merchant.manager@training.local", "Учебный MERCHANT_MANAGER", "merchant_manager"),
    user("training-head-support", "head.support@training.local", "Учебный HEAD_SUPPORT", "head_support"),
    user("training-support", "support@training.local", "Учебный SUPPORT", "support")
  ];

  var modules = [
    module("psp-role-map", "Роли и границы доступа PSP", roles, "Кто создает пользователей, команды, shop'ы, устройства, реквизиты и api_key.", [
      "ADMIN видит все и подтверждает пользователей или shop'ы.",
      "TEAMLEAD_MANAGER управляет организацией и добавляет TRADER_MANAGER.",
      "TRADER_MANAGER создает trader-команду, устройства и TRADER.",
      "MERCHANT не создает shop, это делает MERCHANT_MANAGER или ADMIN."
    ]),
    module("admin-verification", "ADMIN: пользователи и верификация", ["ADMIN", "HEAD_SUPPORT", "SUPPORT"], "Пользователи подтверждаются во вкладке Пользователи, shop'ы во вкладке Магазины.", [
      "ADMIN создает пользователя в /psp/admin/users.",
      "ADMIN открывает /psp/admin/verification.",
      "Для shop проверяет percent, payout_percent и trust_amount.",
      "Без подтверждения следующий рабочий шаг не выполняется."
    ]),
    module("teamlead-organization", "TEAMLEAD_MANAGER: организация и участники", ["TEAMLEAD_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"], "Организация создается через /psp/teamlead/teams, участники через /psp/teamlead/members.", [
      "Создать teamlead-команду в /psp/teamlead/teams.",
      "Открыть /psp/teamlead/members.",
      "Добавить участника с типом TRADER_MANAGER.",
      "Передать TRADER_MANAGER на ADMIN-верификацию."
    ]),
    module("trader-manager-team", "TRADER_MANAGER: trader-команда и устройства", ["TRADER_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"], "Trader-команда отдельна от teamlead-команды, а устройство обязательно до реквизита.", [
      "Создать trader-команду в /psp/trader-manager/team.",
      "Добавить устройство в /psp/trader-manager/devices.",
      "Добавить TRADER через /psp/trader-manager/team.",
      "Дождаться ADMIN-верификации TRADER."
    ]),
    module("trader-requisites", "TRADER: реквизиты, устройство, ордера", ["TRADER", "TRADER_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"], "TRADER создает реквизит только после подтверждения и с автоподставленным устройством.", [
      "Открыть /psp/trader/requisites.",
      "Нажать Создать реквизит.",
      "Выбрать банк из dropdown.",
      "Проверить, что устройство автоподставилось."
    ]),
    module("merchant-manager-shops", "MERCHANT_MANAGER: shop и параметры", ["MERCHANT_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"], "MERCHANT_MANAGER создает и редактирует shop'ы, а ADMIN подтверждает shop.", [
      "ADMIN создает MERCHANT_MANAGER и подтверждает его.",
      "MERCHANT_MANAGER открывает /psp/merchant/shops.",
      "Создает магазин.",
      "ADMIN подтверждает shop во вкладке Магазины."
    ]),
    module("merchant-api-orders", "MERCHANT: api_key и входящие ордера", ["MERCHANT", "MERCHANT_MANAGER", "ADMIN", "HEAD_SUPPORT", "SUPPORT"], "api_key выдается для подтвержденного shop, а интегратор отправляет ордера с X-API-KEY.", [
      "Создать api_key через POST /authentication-service/api-key/create.",
      "Передать { owner_id: <shop_id>, owner_type: 'MERCHANT' }.",
      "Интегратор отправляет POST /order-service/orders.",
      "В запросе должен быть заголовок X-API-KEY: <api_key>."
    ]),
    module("support-readonly-verification", "HEAD_SUPPORT / SUPPORT: read-only и верификация", ["HEAD_SUPPORT", "SUPPORT", "ADMIN"], "Поддержка проверяет и эскалирует, но не создает рабочие объекты.", [
      "Найти пользователя или shop.",
      "Проверить роль, контур и статус.",
      "Не создавать пользователей, команды, реквизиты, shop'ы или api_key.",
      "Передать следующий шаг владельцу роли."
    ])
  ];

  var processCards = [
    ["Создать трейдера готового к работе", [
      "ADMIN -> /psp/admin/users -> Тимлид-менеджер",
      "ADMIN -> /psp/admin/verification -> подтвердить TEAMLEAD_MANAGER",
      "TEAMLEAD_MANAGER -> /psp/teamlead/teams -> Создать команду",
      "TEAMLEAD_MANAGER -> /psp/teamlead/members -> TRADER_MANAGER",
      "ADMIN -> подтвердить TRADER_MANAGER",
      "TRADER_MANAGER -> /psp/trader-manager/team -> Создать команду",
      "TRADER_MANAGER -> /psp/trader-manager/devices -> Добавить устройство",
      "TRADER_MANAGER -> /psp/trader-manager/team -> Добавить TRADER",
      "ADMIN -> подтвердить TRADER",
      "TRADER -> /psp/trader/requisites -> банк из dropdown, устройство автоподставится"
    ]],
    ["Создать мерчанта", [
      "ADMIN -> /psp/admin/users -> Мерчант-менеджер",
      "ADMIN -> /psp/admin/verification -> Пользователи -> подтвердить MERCHANT_MANAGER",
      "MERCHANT_MANAGER -> /psp/merchant/shops -> Создать магазин",
      "ADMIN -> /psp/admin/verification -> Магазины -> проверить percent / payout_percent / trust_amount",
      "ADMIN или MERCHANT_MANAGER -> POST /authentication-service/api-key/create",
      "Тело: { owner_id: <shop_id>, owner_type: 'MERCHANT' }",
      "cascade / интегратор -> POST /order-service/orders с X-API-KEY"
    ]]
  ];

  var state = {
    screen: "dashboard",
    activeModuleId: null,
    loginError: ""
  };

  function user(id, email, displayName, role, accessibleRoles) {
    return {
      id: id,
      email: email,
      displayName: displayName,
      role: role,
      accessibleRoles: accessibleRoles || [role],
      roleLabel: roleLabelById[role]
    };
  }

  function module(id, title, moduleRoles, explanation, steps) {
    return {
      id: id,
      title: title,
      roles: moduleRoles,
      explanation: explanation,
      steps: steps,
      mistakes: [
        "Пропустить обязательную verification.",
        "Выполнить действие чужой роли.",
        "Записать api_key, реальные реквизиты или production-данные в открытый текст."
      ],
      checklist: [
        "Роль и контур проверены.",
        "Обязательная verification выполнена.",
        "Следующий шаг принадлежит правильной роли.",
        "Секреты не раскрыты."
      ],
      quiz: [
        q(id + "-1", "Что проверить первым?", "Роль, контур и статус verification", "Только цвет кнопки", "Контекст определяет доступное действие."),
        q(id + "-2", "Можно ли обходить permission роли?", "Нет", "Да, если задача срочная", "Границы ролей являются частью процесса.")
      ]
    };
  }

  function q(id, question, right, wrong, explanation) {
    return {
      id: id,
      question: question,
      options: [
        { id: "a", text: right },
        { id: "b", text: wrong }
      ],
      correctOptionId: "a",
      explanation: explanation
    };
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char];
    });
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function loadSession() {
    try {
      var raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveSession(user) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
  }

  function authenticate(email, password) {
    if (password !== PASSWORD) return null;
    return trainingUsers.find(function (item) {
      return item.email === normalizeEmail(email);
    }) || null;
  }

  function canAccessRole(session, role) {
    return Boolean(session && session.accessibleRoles.indexOf(roleIdByLabel[role]) >= 0);
  }

  function defaultRoleForUser(session) {
    return roleLabelById[session.accessibleRoles[0] || session.role];
  }

  function progressKey(session, role) {
    return PROGRESS_PREFIX + ":" + (session ? session.email : "anonymous") + ":" + role;
  }

  function loadProgress(role) {
    var session = loadSession();
    try {
      var saved = JSON.parse(window.localStorage.getItem(progressKey(session, role)) || "{}");
      return {
        selectedRole: saved.selectedRole || role,
        completedModules: saved.completedModules || []
      };
    } catch (error) {
      return { selectedRole: role, completedModules: [] };
    }
  }

  function saveProgress(progress) {
    window.localStorage.setItem(progressKey(loadSession(), progress.selectedRole), JSON.stringify(progress));
  }

  function setActiveRole(role) {
    var progress = loadProgress(role);
    progress.selectedRole = role;
    saveProgress(progress);
  }

  function activeRole() {
    var session = loadSession();
    if (!session) return null;
    return loadProgress(defaultRoleForUser(session)).selectedRole || defaultRoleForUser(session);
  }

  function filteredModules(role) {
    return modules.filter(function (item) {
      return item.roles.indexOf(role) >= 0;
    });
  }

  function renderShell(content) {
    var session = loadSession();
    var role = session ? activeRole() : null;
    root.innerHTML =
      '<main class="app-shell">' +
      '<header class="topbar"><button class="brand-button" type="button" data-action="dashboard"><img alt="" class="brand-mark small" src="./public/anchor-pay-logo.png" onerror="this.style.display=&quot;none&quot;"><span>Anchor Pay</span></button>' +
      '<div class="topbar-actions">' +
      (session ? '<span class="account-badge">' + escapeHtml(session.displayName) + '</span><span class="role-badge">' + escapeHtml(role) + '</span><span class="status-pill">Offline demo</span><button class="ghost-button compact" type="button" data-action="logout">Выйти</button>' : "") +
      "</div></header>" +
      content +
      "</main>";
  }

  function renderLogin() {
    root.innerHTML =
      '<main class="login-shell"><section class="login-panel" aria-labelledby="login-title"><div class="login-copy">' +
      '<div class="brand-lockup large"><img alt="" class="brand-mark" src="./public/anchor-pay-logo.png" onerror="this.style.display=&quot;none&quot;"><div><p class="eyebrow">Учебный тренажер рабочего места</p><h1 id="login-title">Anchor Pay</h1></div></div>' +
      '<p class="lead">Новая PSP-программа: ADMIN, TEAMLEAD_MANAGER, TRADER_MANAGER, TRADER, MERCHANT, MERCHANT_MANAGER, HEAD_SUPPORT и SUPPORT. Все данные учебные.</p>' +
      '<div class="mode-note warning">Прямое открытие index.html работает локально: пароль Training123!, прогресс хранится только в браузере.</div></div>' +
      '<form class="login-form" id="fallback-login-form"><label><span>Email</span><input id="fallback-email" type="email" autocomplete="username"></label><label><span>Пароль</span><input id="fallback-password" type="password" autocomplete="current-password"></label>' +
      (state.loginError ? '<div class="feedback negative" role="alert">' + escapeHtml(state.loginError) + "</div>" : "") +
      '<button class="primary-button" type="submit">Войти в тренажер</button></form></section>' +
      '<section class="demo-accounts"><div class="section-heading"><p class="eyebrow">Offline demo</p><h2>Локальные учебные аккаунты</h2><p>Нажмите аккаунт, затем введите пароль Training123!.</p></div><div class="demo-account-grid">' +
      trainingUsers.map(function (item) {
        return '<button class="demo-account-card" type="button" data-action="demo-fill" data-email="' + escapeHtml(item.email) + '"><strong>' + escapeHtml(item.displayName) + '</strong><span>' + escapeHtml(item.email) + '</span><span>' + escapeHtml(item.roleLabel) + '</span></button>';
      }).join("") +
      "</div></section></main>";
  }

  function renderRoles() {
    var session = loadSession();
    var selectedRole = activeRole();
    renderShell(
      '<section class="screen-stack"><div class="section-heading"><p class="eyebrow">Роли и доступ</p><h1>Выберите доступный маршрут</h1><p>ADMIN видит все роли. Остальные аккаунты видят только назначенный PSP-маршрут.</p></div><div class="role-grid">' +
      roles.map(function (role) {
        var locked = !canAccessRole(session, role);
        return '<button class="role-card ' + (selectedRole === role ? "is-selected " : "") + (locked ? "is-locked" : "") + '" type="button" data-action="select-role" data-role="' + escapeHtml(role) + '"' + (locked ? " disabled" : "") + '><span class="role-name">' + escapeHtml(role) + '</span><span>' + (locked ? "Недоступно для текущего аккаунта." : "Открыть учебный маршрут роли.") + "</span></button>";
      }).join("") +
      '</div><button class="ghost-button" type="button" data-action="dashboard">Назад</button></section>'
    );
  }

  function renderDashboard() {
    var session = loadSession();
    var role = activeRole();
    var progress = loadProgress(role);
    var visible = filteredModules(role);
    renderShell(
      '<section class="screen-stack"><div class="dashboard-hero"><div><p class="eyebrow">Anchor Pay training simulator</p><h1>Учебная смена</h1><p>Маршрут роли <strong>' + escapeHtml(role) + '</strong>: PSP-роли, verification, teamlead/trader flow, shop, api_key и orders.</p></div><div class="dashboard-actions">' +
      (session.accessibleRoles.length > 1 ? '<button class="secondary-button" type="button" data-action="roles">Сменить роль</button>' : "") +
      '<button class="secondary-button" type="button" data-action="reference">Справочник</button><button class="primary-button" type="button" data-action="final">Итоги</button></div></div>' +
      '<section class="dashboard-section"><div class="module-card-head"><div><p class="eyebrow">Мой маршрут</p><h2>Учебные модули роли</h2></div><span class="role-badge">' + escapeHtml(role) + '</span></div><div class="module-grid">' +
      visible.map(function (item) {
        var done = progress.completedModules.indexOf(item.id) >= 0;
        return '<article class="module-card"><div class="module-card-head"><span class="status-pill ' + (done ? "done" : "") + '">' + (done ? "Завершен" : "В плане") + '</span></div><h2>' + escapeHtml(item.title) + '</h2><p>' + escapeHtml(item.explanation) + '</p><button class="secondary-button full-width" type="button" data-action="open-module" data-module="' + escapeHtml(item.id) + '">Открыть модуль</button></article>';
      }).join("") +
      "</div></section></section>"
    );
  }

  function renderModule() {
    var item = modules.find(function (moduleItem) {
      return moduleItem.id === state.activeModuleId;
    });
    if (!item) {
      renderDashboard();
      return;
    }
    renderShell(
      '<section class="screen-stack"><div class="module-header"><button class="ghost-button" type="button" data-action="dashboard">К дашборду</button></div><div class="section-heading"><p class="eyebrow">Модуль</p><h1>' + escapeHtml(item.title) + '</h1><p>' + escapeHtml(item.explanation) + '</p></div>' +
      '<div class="content-layout"><section class="content-panel"><h2>Практические шаги</h2><ol class="rich-list">' + item.steps.map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") + '</ol></section><section class="content-panel"><h2>Частые ошибки</h2><ul class="rich-list">' + item.mistakes.map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") + '</ul></section><section class="content-panel"><h2>Чеклист</h2><ul class="check-list">' + item.checklist.map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") + "</ul></section></div>" +
      '<div class="action-strip"><button class="primary-button" type="button" data-action="complete-module">Отметить модуль завершенным</button></div></section>'
    );
  }

  function renderReference() {
    renderShell(
      '<section class="screen-stack"><div class="module-header"><button class="ghost-button" type="button" data-action="dashboard">К дашборду</button></div><div class="section-heading"><p class="eyebrow">Справочник</p><h1>PSP-процессы</h1><p>Две ключевые цепочки из актуальной программы.</p></div><div class="reference-grid">' +
      processCards.map(function (card) {
        return '<article class="reference-card wide"><h2>' + escapeHtml(card[0]) + '</h2><ol class="rich-list">' + card[1].map(function (step) { return "<li>" + escapeHtml(step) + "</li>"; }).join("") + "</ol></article>";
      }).join("") +
      "</div></section>"
    );
  }

  function renderFinal() {
    var role = activeRole();
    var progress = loadProgress(role);
    var visible = filteredModules(role);
    var completed = visible.filter(function (item) {
      return progress.completedModules.indexOf(item.id) >= 0;
    });
    renderShell(
      '<section class="screen-stack"><div class="module-header"><button class="ghost-button" type="button" data-action="dashboard">К дашборду</button><span class="role-badge">' + escapeHtml(role) + '</span></div><div class="section-heading"><p class="eyebrow">Итоги</p><h1>Прогресс Anchor Pay</h1><p>Сводка хранится локально и не отправляется во внешние сервисы.</p></div><div class="result-grid"><div class="result-card"><span class="metric">' + completed.length + '</span><span>завершено из ' + visible.length + '</span></div></div><section class="content-panel"><h2>Завершенные модули</h2>' +
      (completed.length ? '<ul class="check-list">' + completed.map(function (item) { return "<li>" + escapeHtml(item.title) + "</li>"; }).join("") + "</ul>" : "<p>Пока нет завершенных модулей.</p>") +
      "</section></section>"
    );
  }

  function render() {
    if (!loadSession()) {
      renderLogin();
      return;
    }
    if (state.screen === "roles") renderRoles();
    else if (state.screen === "module") renderModule();
    else if (state.screen === "reference") renderReference();
    else if (state.screen === "final") renderFinal();
    else renderDashboard();
  }

  document.addEventListener("click", function (event) {
    var control = event.target.closest("[data-action]");
    if (!control) return;
    var action = control.dataset.action;
    if (action === "demo-fill") {
      var emailInput = document.getElementById("fallback-email");
      var passwordInput = document.getElementById("fallback-password");
      if (emailInput) emailInput.value = control.dataset.email || "";
      if (passwordInput) passwordInput.value = "";
      state.loginError = "";
      return;
    }
    if (action === "logout") {
      clearSession();
      state.screen = "dashboard";
    } else if (action === "roles") {
      state.screen = "roles";
    } else if (action === "select-role") {
      var role = control.dataset.role;
      if (canAccessRole(loadSession(), role)) {
        setActiveRole(role);
        state.screen = "dashboard";
      }
    } else if (action === "open-module") {
      state.activeModuleId = control.dataset.module;
      state.screen = "module";
    } else if (action === "complete-module") {
      var progress = loadProgress(activeRole());
      if (progress.completedModules.indexOf(state.activeModuleId) < 0) {
        progress.completedModules.push(state.activeModuleId);
      }
      saveProgress(progress);
      state.screen = "dashboard";
    } else if (action === "reference") {
      state.screen = "reference";
    } else if (action === "final") {
      state.screen = "final";
    } else {
      state.screen = "dashboard";
    }
    render();
  });

  document.addEventListener("submit", function (event) {
    if (!event.target.matches("#fallback-login-form")) return;
    event.preventDefault();
    var emailInput = document.getElementById("fallback-email");
    var passwordInput = document.getElementById("fallback-password");
    var session = authenticate(emailInput ? emailInput.value : "", passwordInput ? passwordInput.value : "");
    if (!session) {
      state.loginError = "Неверный email или пароль для учебного входа.";
      renderLogin();
      return;
    }
    saveSession(session);
    setActiveRole(defaultRoleForUser(session));
    state.screen = "dashboard";
    render();
  });

  render();
})();
