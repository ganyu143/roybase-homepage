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
      "// it works on my machine —— 因为我的机器就是服务器",
      "roy：99 little problems a server can have…",
      "// git push --force 之前，先 git pull",
      "访客：服务器又挂了？",
      "roy：没有，只是重启了一下。",
      "// SELECT * FROM 生活 WHERE 计划 = '随便'",
      "roy：备份是写给未来自己的一封情书。",
      "// 404: 需求文档 not found",
      "访客：为什么不用云？",
      "roy：云就是别人的服务器。",
      "// while(alive) { coffee(); code(); }",
      "roy：最好的代码是没写的代码。",
      "// TODO: 明天再重构（明天永远不会来）",
      "访客：这个 bug 存在多久了？",
      "roy：它不叫 bug，叫未文档化的特性。",
      "// rm -rf 之前，先想三秒",
      "roy：监控没报警，不代表没问题。",
      "// 告警响了 30 次，第 31 次才是真的",
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
    const week = "日一二三四五六"[now.getDay()];
    if (gregorian) gregorian.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 周${week}`;
    calendar.textContent = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      year: "numeric", month: "long", day: "numeric",
    }).format(now);
    // 宜忌按日期轮换：年内第 N 天对文案池取模，每天不同
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const notes = [
      ["整理服务清单","冲动改配置"],["阅读文档","熬夜硬扛"],["写一点代码","复制粘贴密钥"],
      ["更新备份","跳过验证"],["发布文章","忘记缓存"],["清理日志","忽略告警"],["休息一下","把周末当生产"],
      ["提交代码","force push"],["写测试","跳过测试"],["升级系统","不读 changelog"],
      ["检查证书","裸奔上线"],["备份数据库","只信口头承诺"],["整理书签","收藏吃灰"],
      ["复盘事故","甩锅给运气"],["给服务加监控","裸奔跑生产"],["清理磁盘","rm -rf 一把梭"],
      ["更新依赖","锁死旧版本"],["写 README","留白给后人"],["拆分脚本","面条式脚本"],
      ["加索引","全表扫描"],["用事务","裸写 SQL"],["开事务","长事务锁表"],
      ["压测一下","直接上生产"],["灰度发布","全量梭哈"],["看监控","凭感觉调参"],
      ["写注释","注释与代码打架"],["重构","边跑边改"],["加日志","无日志排障"],
      ["轮值巡检","告警疲劳"],["归档旧数据","无限增长"],["限流保护","裸奔扛流量"],
      ["演练恢复","只备不演"],["更新密钥","密钥永不过期"],["收敛权限","全员 root"],
      ["读一遍告警","告警当背景音"],["给备份做恢复演练","备份从没用过"],
    ];
    const [yi,ji] = notes[dayOfYear % notes.length];
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
    // 同源代理：服务器直连 open-meteo，国内访客浏览器不必直连外网
    fetch("/api/weather")
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

  // 6b. 访客信息：IP 由同源 Nginx 脱敏，地域由 ipwho.is（CORS 开放）解析，浏览器信息在本地读取。
  const visitorIp = document.getElementById("visitor-ip");
  const visitorRegion = document.getElementById("visitor-region");
  const visitorBrowser = document.getElementById("visitor-browser");
  const visitorDevice = document.getElementById("visitor-device");
  if (visitorIp || visitorRegion || visitorBrowser || visitorDevice) {
    fetch("/api/visitor")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((v) => { if (visitorIp) visitorIp.textContent = v.ip || "隐藏"; })
      .catch(() => { if (visitorIp) visitorIp.textContent = "隐藏"; });
    // 地域：ipwho.is 免费无 key、CORS 开放；失败时显示“未知”不隐藏卡片
    if (visitorRegion) {
      visitorRegion.textContent = "解析中…";
      fetch("https://ipwho.is/")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((v) => {
          if (!v.success) throw new Error("ipwho");
          const country = { China: "中国", Japan: "日本", US: "美国", USA: "美国", Germany: "德国", UK: "英国", Singapore: "新加坡" }[v.country] || v.country;
          visitorRegion.textContent = [v.city, country].filter(Boolean).join(" · ") || "未知";
        })
        .catch(() => { visitorRegion.textContent = "未知"; });
    }
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
    const device = /Mobi|Android/i.test(ua) ? "Mobile" : "Desktop";
    if (visitorBrowser) visitorBrowser.textContent = browser;
    if (visitorDevice) visitorDevice.textContent = `${device} · ${navigator.language || "--"}`;
  }
  // 7. 博客文章列表：RSS feed → 文件树（年→月→文章，<details> 原生折叠）
  const articleList = document.getElementById("article-list");
  if (articleList) {
    const pad2 = (n) => String(n).padStart(2, "0");
    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    const loadArticles = () =>
      fetch("/api/blog")
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .then((text) => {
          const doc = new DOMParser().parseFromString(text, "text/xml");
          const items = [...doc.querySelectorAll("item")].slice(0, 30);
          if (!items.length) { articleList.innerHTML = '<p class="tree-empty">// 暂无文章</p>'; return; }
          // 分组：年 → 月 → 文章
          const tree = {};
          for (const item of items) {
            const title = item.querySelector("title")?.textContent ?? "";
            const link = (item.querySelector("link")?.textContent ?? "#").replace("http://127.0.0.1:9100","https://blog.roybase.top");
            const dateStr = item.querySelector("pubDate")?.textContent ?? "";
            const d = dateStr ? new Date(dateStr) : null;
            const y = d ? String(d.getFullYear()) : "未知";
            const m = d ? pad2(d.getMonth() + 1) : "00";
            const dm = d ? `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` : "";
            (tree[y] ??= {})[m] ??= [];
            tree[y][m].push({ title, link, dm });
          }
          const yearKeys = Object.keys(tree).sort().reverse();
          articleList.innerHTML = yearKeys.map((y) => {
            const monthKeys = Object.keys(tree[y]).sort().reverse();
            return `<details class="tree-node" open><summary class="tree-branch">📁 ${esc(y)}</summary>
              <div class="tree-children">${monthKeys.map((m) => `
                <details class="tree-node" open><summary class="tree-branch">📁 ${esc(m)}</summary>
                  <div class="tree-children">${tree[y][m].map((a) => `
                    <a class="tree-leaf" href="${esc(a.link)}" target="_blank" rel="noopener">📄 ${esc(a.title)}<span class="tree-date">${a.dm}</span></a>
                  `).join("")}</div>
                </details>`).join("")}
              </div>
            </details>`;
          }).join("");
        })
        .catch(() => { articleList.innerHTML = '<p class="tree-empty">// 文章列表不可达</p>'; });
    loadArticles();
  }
  // 7b. 收藏文章：静态数据 → 文件树（分类→链接，<details> 原生折叠）
  const bookmarkTree = document.getElementById("bookmark-tree");
  if (bookmarkTree) {
    const BOOKMARKS = [
      { group: "编程与数据库", links: [
        { name: "Python 教程", url: "https://www.w3school.com.cn/python/index.asp", note: "w3school" },
        { name: "SQL 简介", url: "https://www.runoob.com/sql/sql-intro.html", note: "菜鸟教程" },
        { name: "Codewars", url: "https://www.codewars.com/", note: "算法刷题" },
        { name: "简单教程，简单编程", url: "https://www.twle.cn/", note: "编程入门" },
        { name: "自学SQL网", url: "https://xuesql.cn/", note: "教程+练习" },
      ]},
      { group: "AI 与人工智能", links: [
        { name: "AI 工具集 ai-bot.cn", url: "https://ai-bot.cn/", note: "AI 导航" },
        { name: "魔搭社区 ModelScope", url: "https://www.modelscope.cn/home", note: "模型社区" },
        { name: "通义千问", url: "https://tongyi.aliyun.com/", note: "对话" },
        { name: "awesome-chatgpt-prompts", url: "https://github.com/f/awesome-chatgpt-prompts", note: "GitHub" },
      ]},
      { group: "技术社区", links: [
        { name: "博客园", url: "https://www.cnblogs.com/", note: "技术博客" },
        { name: "稀土掘金", url: "https://juejin.cn/", note: "技术社区" },
        { name: "大侠阿木", url: "https://daxiaamu.com/", note: "个人博客" },
      ]},
      { group: "GitHub 项目", links: [
        { name: "30-Days-Of-Python", url: "https://github.com/Asabeneh/30-Days-Of-Python", note: "Python 入门" },
        { name: "RustScan", url: "https://github.com/bee-san/RustScan", note: "端口扫描" },
        { name: "Gitee", url: "https://gitee.com/", note: "代码托管" },
      ]},
      { group: "RSS 新闻", links: [
        { name: "阮一峰 · 科技爱好者周刊", url: "https://www.ruanyifeng.com/blog/weekly/index.html", note: "周刊 RSS" },
        { name: "少数派 Sspai", url: "https://sspai.com/", note: "数字生活 RSS" },
        { name: "酷壳 CoolShell", url: "https://coolshell.cn/", note: "技术博客 RSS" },
        { name: "InfoQ 中文", url: "https://www.infoq.cn/", note: "技术资讯 RSS" },
        { name: "开源中国", url: "https://www.oschina.net/", note: "开源社区 RSS" },
        { name: "Hacker News", url: "https://news.ycombinator.com/", note: "极客新闻" },
      ]},
      { group: "影视与娱乐", links: [
        { name: "哔哩哔哩", url: "https://www.bilibili.com/", note: "视频" },
        { name: "HDArea", url: "https://www.hdarea.co/", note: "PT 站" },
        { name: "百川PT", url: "https://www.hitpt.com/", note: "PT 站" },
      ]},
      { group: "NAS 与存储", links: [
        { name: "GXNAS 博客", url: "https://wp.gxnas.com/", note: "群晖教程" },
        { name: "群晖 ssh 命令清单大全", url: "https://zhuanlan.zhihu.com/p/459751737", note: "命令速查" },
      ]},
    ];
    const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    bookmarkTree.innerHTML = BOOKMARKS.map((g) => `
      <details class="tree-node" open><summary class="tree-branch">📁 ${esc(g.group)}</summary>
        <div class="tree-children">${g.links.map((l) => `
          <a class="tree-leaf" href="${esc(l.url)}" target="_blank" rel="noopener">🔗 ${esc(l.name)}<span class="tree-note">${esc(l.note)}</span></a>
        `).join("")}</div>
      </details>`).join("");
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
  for (const link of document.querySelectorAll('#topnav a[href^="#"]')) {
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
