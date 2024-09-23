const eventBus = window.eventBus;
// 子应用 A
export default {
  beforeMount() {
    console.log("App A is about to mount");
  },
  mount() {
    console.log("App A is mounted");
    eventBus.emit("app:event", { msg: "子应用A mounted" });
  },
  unmount() {
    console.log("App A is unmounted");
    eventBus.emit("app:event", { msg: "子应用A unmounted" });
  },
};
