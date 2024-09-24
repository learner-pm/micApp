const blockedGlobals = [
  "localStorage",
  "sessionStorage",
  "document",
  "alert",
  "confirm",
];

// 沙箱类，用于隔离全局变量
class Sandbox {
  constructor(name) {
    this.name = name;
    this.proxy = null;
    this.active = false;
    this.sandbox = {};
    this.windowProxy = this.createProxy();
  }

  createProxy() {
    const sandbox = this.sandbox;
    const instance = this; // 保存 Sandbox 实例

    return new Proxy(window, {
      get(target, prop) {
        if (!instance.active) {
          throw new Error(`Sandbox is inactive, cannot access ${prop}`);
        }
        if (blockedGlobals.includes(prop)) {
          throw new Error(`Access to ${prop} is blocked for security reasons`);
        }
        if (prop in sandbox) {
          return sandbox[prop];
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (!instance.active) {
          throw new Error(`Sandbox is inactive, cannot set ${prop}`);
        }
        sandbox[prop] = value;
        return true;
      },
      has(target, prop) {
        if (!instance.active) {
          return false;
        }
        return prop in sandbox || prop in target;
      },
      deleteProperty(target, prop) {
        if (!instance.active) {
          throw new Error(`Sandbox is inactive, cannot delete ${prop}`);
        }
        if (prop in sandbox) {
          delete sandbox[prop];
        }
        return true;
      },
    });
  }

  activate() {
    this.active = true;
  }

  deactivate() {
    this.active = false;
  }

  reset() {
    this.sandbox = {};
  }
}

// CSS 作用域隔离
function scopeCSS(html, scopeId) {
  return html.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (match, startTag, css, endTag) => {
      const scopedCSS = css.replace(
        /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
        (selector, selectors, after) => {
          const scopedSelector = selectors
            .split(",")
            .map((sel) => `#${scopeId} ${sel.trim()}`)
            .join(",");
          return `${scopedSelector} ${after}`;
        }
      );
      return `${startTag}${scopedCSS}${endTag}`;
    }
  );
}

async function executeScriptInSandbox(html, sandboxWindow) {
  const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  for (const match of scriptMatches) {
    const scriptContent = match[1];
    if (scriptContent) {
      // 使用异步执行 Function 构造函数，防止阻塞主线程
      const scriptFunction = new Function("window", scriptContent);
      await scriptFunction(sandboxWindow); // 确保按顺序执行
    }
  }
}

export { scopeCSS, Sandbox, executeScriptInSandbox };
