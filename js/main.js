// roybase 个人主页 — 主脚本
// 纯函数（可 node --test 测试）+ 浏览器端 DOM 逻辑

// 纯函数（可测试）
export function formatUptime(sec) {
  const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
const WMO = { 0: "晴", 1: "大部晴", 2: "多云", 3: "阴", 45: "雾", 48: "雾凇", 51: "毛毛雨", 53: "毛毛雨", 55: "毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨", 71: "小雪", 73: "中雪", 75: "大雪", 80: "阵雨", 81: "阵雨", 82: "强阵雨", 95: "雷阵雨", 99: "强雷阵雨" };
export function formatWeather({ temp, code }) {
  return `${Math.round(temp)}°C ${WMO[code] ?? "未知"}`;
}
export function typewriterText(full, i) {
  // 返回第 1..i 帧应显示的文本数组；超过长度后帧保持全文
  return Array.from({ length: i }, (_, k) => full.slice(0, Math.min(k + 1, full.length)));
}
export function parseStatus(obj) {
  // status.json → { key: "up"|"down" }
  const m = {};
  for (const [k, v] of Object.entries(obj)) m[k] = v.status;
  return m;
}

// 浏览器端（DOM 存在时执行）
if (typeof document !== "undefined") {
  // 1. 时钟：#clock 每秒更新 HH:MM:SS（本地时间）
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

  // 2. 打字机：#typewriter 按 80ms/字 展开，完成后光标闪烁（CSS 已处理）
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

  // 3. 天气：Open-Meteo 荆州（30.35N, 112.24E，免 key）；失败 → 隐藏卡片
  const weather = document.getElementById("weather");
  const weatherCard = document.getElementById("weather-card");
  if (weather) {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=30.35&longitude=112.24&current=temperature_2m,weather_code&timezone=Asia%2FShanghai")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => {
        const c = j.current;
        weather.textContent = formatWeather({ temp: c.temperature_2m, code: c.weather_code });
      })
      .catch(() => weatherCard && weatherCard.remove());
  }

  // 4. 服务状态灯：fetch status.json → .service-card[data-key] 的灯置 up/down；
  //    失败时灯保持灰并显示“状态未知”（与 cron 同频，5 分钟重取）
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

  // 5. 统计信息：stats.json（cron 每 10 分钟）+ /api/visits（openresty lua）
  const statUptime = document.getElementById("stat-uptime");
  const statLoad = document.getElementById("stat-load");
  const statMem = document.getElementById("stat-mem");
  if (statUptime) {
    fetch("/data/stats.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((s) => {
        statUptime.textContent = formatUptime(s.uptime_sec);
        statLoad.textContent = s.load;
        statMem.textContent = `${s.mem_pct}%`;
      })
      .catch(() => {});
  }
  const statVisits = document.getElementById("stat-visits");
  if (statVisits) {
    // 本机无 lua 端点时 404，隐藏卡片不报错
    fetch("/api/visits")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((v) => (statVisits.textContent = v.visits))
      .catch(() => statVisits.closest(".stat-card").remove());
  }

  // 6. 入场动画：IntersectionObserver 给 .reveal 加 .in
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
}