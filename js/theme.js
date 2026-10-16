// 主题初始化（P0-1：内联脚本被 CSP script-src 'self' 拦，外置为独立文件）
// 在样式表之前定下 data-theme，避免浅色用户先闪一屏深色
(function () {
  var saved = null;
  try { saved = localStorage.getItem('roybase-theme'); } catch (e) {}
  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  var meta = document.getElementById('meta-theme-color');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0e14' : '#f5f7fa');
})();
