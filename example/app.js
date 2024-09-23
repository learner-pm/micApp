// app.js
import {
  registerApplication,
  registerMainApplication,
  loadApp,
  unloadAllApps,
  start,
  unloadApp,
} from "./microfrontend.js";

registerMainApplication("app", "app-container");

// 注册两个子应用 A 和 B
registerApplication({
  name: "appA",
  url: "./a.html",
  path: "/a",
});
registerApplication({
  name: "appB",
  url: "./b.html",
  path: "/b",
  cache: false,
});

start();

const eventBus = window.eventBus;

eventBus.on("app:event", (data) => {
  const info = document.getElementById("app-info");
  info.innerHTML = data?.msg;
});

// 点击按钮加载子应用 A
document.getElementById("load-app-a").addEventListener("click", async () => {
  await unloadAllApps();
  await loadApp("appA");
});

// 点击按钮加载子应用 B
document.getElementById("load-app-b").addEventListener("click", async () => {
  await unloadAllApps();
  await loadApp("appB");
});

document.getElementById("clear").addEventListener("click", async () => {
  await unloadAllApps(); // 卸载当前所有子应用
});

document.getElementById("clear-a").addEventListener("click", async () => {
  await unloadApp("appA"); // 卸载当前所有子应用
});

document.getElementById("clear-b").addEventListener("click", async () => {
  await unloadApp("appB"); // 卸载当前所有子应用
});
