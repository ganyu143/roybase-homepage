// roybase 个人主页 — 主脚本 v2
// 纯函数（可 node --test 测试）+ 浏览器端 DOM 逻辑

// 纯函数
export function formatUptime(sec) {
  const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const WMO = { 0: "晴", 1: "大部晴", 2: "多云", 3: "阴", 45: "雾", 48: "雾凇", 51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨", 71: "小雪", 73: "中雪", 75: "大雪", 80: "阵雨", 81: "中阵雨", 82: "强阵雨", 95: "雷阵雨", 96: "雷暴", 99: "冰雹" };

export function formatWeather({ temp, code }) {
  return `${Math.round(temp)}°C ${WMO[code] ?? "未知"}`;
}

export function typewriterText(full, i) {
  return Array.from({ length: i }, (_, k) => full.slice(0, Math.min(k + 1, full.length)));
}

export function parseStatus(obj) {
  const m = {};
  for (const [k, v] of Object.entries(obj)) m[k] = v.status;
  return m;
}

// 浏览器端
if (typeof document !== "undefined") {

  // 1. 时钟
  const clock = document.getElementById("clock");
  if (clock) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // 2. 随机对话：短句、问答和状态提示混合轮播。
  const dialogue = document.getElementById("random-dialogue");
  if (dialogue) {
    const lines = [
      "访客：今天也要把服务跑起来吗？",
      "roy：先看状态灯，再决定要不要重启。",
      "// self-hosted is a habit, not a slogan",
      "访客：为什么还在折腾？",
      "roy：因为可控，也因为好玩。",
      "// no vendor lock · no midnight panic",
      "访客：今天的宜忌是什么？",
      "roy：宜提交，忌把 token 写进仓库。",
    ];
    let last = -1;
    const rotateDialogue = () => {
      let next;
      do next = Math.floor(Math.random() * lines.length); while (next === last);
      last = next;
      dialogue.classList.remove("dialogue-in");
      requestAnimationFrame(() => {
        dialogue.textContent = lines[next];
        dialogue.classList.add("dialogue-in");
      });
    };
    rotateDialogue();
    setInterval(rotateDialogue, 5200);
  }
  // 2b. 公历、农历与轻量皇历提示（浏览器原生 Intl，无外部依赖）。
  const calendar = document.getElementById("calendar");
  const gregorian = document.getElementById("calendar-gregorian");
  const huangli = document.getElementById("huangli");
  if (calendar) {
    const now = new Date();
    if (gregorian) gregorian.textContent = new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(now);
    calendar.textContent = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      dateStyle: "full",
    }).format(now);
    const day = now.getDay();
    const notes = [
      ["整理服务清单", "冲动改配置"], ["阅读文档", "熬夜硬扛"],
      ["写一点代码", "复制粘贴密钥"], ["更新备份", "跳过验证"],
      ["发布文章", "忘记缓存"], ["清理日志", "忽略告警"], ["休息一下", "把周末当生产"],
    ];
    const [yi,ji] = notes[day];
    if (huangli) huangli.textContent = `宜：${yi}　忌：${ji}`;
  }
  // 3. 打字机
  const tw = document.getElementById("typewriter");
  if (tw) {
    const full = 'echo "你好，我是 roy —— 把能自托管的都自托管了"';
    let i = 0;
    const step = () => {
      i += 1;
      tw.textContent = typewriterText(full, i).at(-1);
      if (i < full.length) setTimeout(step, 80);
    };
    setTimeout(step, 400);
  }

  // 4. 天气
  const weather = document.getElementById("weather");
  const weatherCard = document.getElementById("weather-card");
  if (weather) {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=30.35&longitude=112.24&current=temperature_2m,weather_code&timezone=Asia/Shanghai")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        const c = j.current;
        weather.textContent = formatWeather({ temp: c.temperature_2m, code: c.weather_code });
      })
      .catch(() => weatherCard && weatherCard.remove());
  }

  // 5. 服务状态灯
  const statusNote = document.getElementById("status-note");
  const loadStatus = () =>
    fetch("/data/status.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((s) => {
        const m = parseStatus(s);
        for (const card of document.querySelectorAll(".service-card[data-key]")) {
          const dot = card.querySelector(".status-dot");
          if (!dot) continue;
          dot.className = "status-dot" + (m[card.dataset.key] === "up" ? " up" : " down");
        }
        if (statusNote) statusNote.hidden = true;
      })
      .catch(() => {
        for (const dot of document.querySelectorAll(".status-dot")) dot.className = "status-dot";
        if (statusNote) {
          statusNote.hidden = false;
          statusNote.textContent = "// 状态未知：status.json 不可达";
        }
      });
  loadStatus();
  setInterval(loadStatus, 5 * 60 * 1000);

  // 6. 统计信息
  const statUptime = document.getElementById("stat-uptime");
  const statLoad   = document.getElementById("stat-load");
  const statMem    = document.getElementById("stat-mem");
  if (statUptime) {
    fetch("/data/stats.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((s) => {
        statUptime.textContent = formatUptime(s.uptime_sec);
        statLoad.textContent   = s.load;
        statMem.textContent    = `${s.mem_pct}%`;
      })
      .catch(() => {});
  }
  const statVisits = document.getElementById("stat-visits");
  if (statVisits) {
    fetch("/api/visits")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((v) => (statVisits.textContent = v.visits))
      .catch(() => statVisits.closest(".stat-card").remove());
  }

  // 6b. 访客信息：IP 由同源 Nginx 脱敏，浏览器信息在本地读取。
  const visitorIp = document.getElementById("visitor-ip");
  const visitorBrowser = document.getElementById("visitor-browser");
  const visitorDevice = document.getElementById("visitor-device");
  if (visitorIp || visitorBrowser || visitorDevice) {
    fetch("/api/visitor")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((v) => { if (visitorIp) visitorIp.textContent = v.ip || "隐藏"; })
      .catch(() => { if (visitorIp) visitorIp.textContent = "隐藏"; });
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
    const device = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
    if (visitorBrowser) visitorBrowser.textContent = browser;
    if (visitorDevice) visitorDevice.textContent = `${device} · ${navigator.language || "--"}`;
  }
  // 7. 博客文章列表（RSS feed 动态渲染）
  const articleList = document.getElementById("article-list");
  if (articleList) {
    const loadArticles = () =>
      fetch("/api/blog")
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .then((text) => {
          const doc = new DOMParser().parseFromString(text, "text/xml");
          const items = [...doc.querySelectorAll("item")].slice(0, 10);
          const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
          articleList.innerHTML = items.map((item) => {
            const title = item.querySelector("title")?.textContent ?? "";
            const link = (item.querySelector("link")?.textContent ?? "#").replace("http://127.0.0.1:9100","https://blog.roybase.top").replace("https://www.roybase.top/index.php/archives/","https://blog.roybase.top/index.php/archives/");
            const dateStr = item.querySelector("pubDate")?.textContent ?? "";
            const desc = (item.querySelector("description")?.textContent ?? "").replace(/<[^>]*>/g,"").slice(0,120);
            const d = dateStr ? new Date(dateStr) : null;
            const dateFmt = d ? d.toISOString().slice(0,10) : "";
            return `<a class="card article-card" href="${esc(link)}" target="_blank" rel="noopener">
              <h4>${esc(title)}</h4>
              <span class="article-date mono">${dateFmt}</span>
              <p>${esc(desc)}</p>
            </a>`;
          }).join("");
        })
        .catch(() => {
          articleList.innerHTML = "<p style=\"opacity:0.5;font-family:var(--mono)\">// 文章列表不可达</p>";
        });
    loadArticles();
  }
  // 8. 分类切换：一次只展示一个内容视图，切换时重新触发入场动画。
  const sections = [...document.querySelectorAll(".collapsible-section")];
  const setView = (section, open = true) => {
    for (const item of sections) {
      const toggle = item.querySelector(".section-toggle");
      const panel = document.getElementById(toggle?.getAttribute("aria-controls"));
      const active = open && item === section;
      toggle?.setAttribute("aria-expanded", String(active));
      if (panel) {
        panel.hidden = !active;
        if (active) {
          panel.classList.remove("view-refresh");
          requestAnimationFrame(() => panel.classList.add("view-refresh"));
        }
      }
      item.classList.toggle("is-active", active);
    }
  };
  for (const btn of document.querySelectorAll(".section-toggle")) {
    btn.addEventListener("click", () => {
      const section = btn.closest(".collapsible-section");
      setView(section, btn.getAttribute("aria-expanded") !== "true");
    });
  }
  // 顶部导航是分类入口，不只是锚点：激活对应视图并更新选中态。
  for (const link of document.querySelectorAll("#topnav a[href^="#"]")) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      document.querySelectorAll("#topnav a").forEach((item) => item.classList.toggle("active", item === link));
      if (id === "hero") {
        setView(null, false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (section) {
        setView(section, true);
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  document.querySelector('#topnav a[href="#hero"]')?.classList.add("active");
  // 9. 入场动画
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("in"));
  }

  // 10. 侧栏跑马灯
  const ticker = document.getElementById("ticker-inner");
  if (ticker) {
    const messages = [
      "roybase · self-hosted",
      "jdcloud · aipc · nas",
      "jdy 117.72.46.139",
      "roybase.top",
      "2026 · uptime matters",
      "no vendor lock",
    ];
    // 双份拼接实现无缝循环
    const all = messages.concat(messages);
    ticker.innerHTML = all.map(m => `<div>${m}</div>`).join("");
  }
}
