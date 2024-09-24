// 微前端框架

import { scopeCSS, Sandbox, executeScriptInSandbox } from "./core/sandbox.js";
import { EventBus } from "./core/eventBus.js";
import { fetchApplicationHTML } from "./core/cache.js";

const appRegistry = [];
const sandboxRegistry = {};
const mainApp = {};

const getAppByName = (appName) => appRegistry?.find((e) => e?.name === appName);
const getAppByPath = (appPath) => appRegistry?.find((e) => e?.path === appPath);

// 注册主应用
export function registerMainApplication(name, containerId) {
  mainApp.name = name;
  mainApp.containerId = containerId;
}

// 注册子应用
/** name appUrl path cache**/
export function registerApplication(config) {
  appRegistry.push({
    cache: true,
    active: false,
    ...(config || {}),
  });
}

const updateAppData = (name, key, value) => {
  appRegistry.forEach((e) => {
    if (e?.name === name) {
      e[key] = value;
    }
  });
};

// 加载app
export async function loadApp(name) {
  const appData = getAppByName(name);

  if (!appData) {
    throw new Error(`Application ${name} is not registered`);
  }
  updateAppData(name, "active", true);
  // 动态导入子应用的生命周期管理模块
  const appModule = await import(`${appData.url.replace(".html", ".js")}`);

  // 调用子应用的 beforeMount 生命周期钩子
  if (typeof appModule.default.beforeMount === "function") {
    appModule.default.beforeMount();
  }

  // 获取子应用的 HTML 并添加 CSS 作用域
  const appHTML = await fetchApplicationHTML(appData);
  const scopedHTML = scopeCSS(appHTML, mainApp.containerId);

  // 查找容器元素并加载子应用内容
  const container = document.getElementById(mainApp.containerId);
  container.innerHTML = scopedHTML;

  // 创建或激活沙箱
  if (!sandboxRegistry[name]) {
    sandboxRegistry[name] = new Sandbox(name);
  }
  sandboxRegistry[name].activate();

  // 执行子应用的脚本，确保沙箱隔离
  executeScriptInSandbox(appHTML, sandboxRegistry[name].windowProxy);

  // 调用子应用的 mount 生命周期钩子
  if (typeof appModule.default.mount === "function") {
    appModule.default.mount();
  }
}

export function unloadApp(appName) {
  const app = getAppByName(appName);
  if (!app.active) return;
  updateAppData(appName, "active", false);
  // 动态导入子应用的生命周期管理模块
  import(`${app.url.replace(".html", ".js")}`).then((appModule) => {
    // 调用子应用的 unmount 生命周期钩子
    if (typeof appModule.default.unmount === "function") {
      appModule.default.unmount();
    }
  });
  sandboxRegistry[appName]?.deactivate();
  const containerId = mainApp.containerId;
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = "";
  }
}

export function unloadAllApps() {
  // 清空所有子应用的容器并停用沙箱
  appRegistry.forEach((app) => {
    unloadApp(app?.name);
  });
}

const loadRoute = async () => {
  const path = window.location.pathname;
  const app = getAppByPath(path);
  if (app) {
    loadApp(app?.url);
  }
};

export const start = () => {
  loadRoute();
  window.onpopstate = loadRoute;
  window.eventBus = new EventBus();
};
