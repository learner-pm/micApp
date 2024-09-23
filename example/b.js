const eventBus = window.eventBus;

// 子应用 B
export default {
  beforeMount() {
    console.log("App B is about to mount");
  },
  mount() {
    console.log("App B is mounted");
    eventBus.emit("app:event", { msg: "子应用B mounted" });
  },
  unmount() {
    console.log("App B is unmounted");
    eventBus.emit("app:event", { msg: "子应用B unmounted" });
  },
};
