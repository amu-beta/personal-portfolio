'use strict';
const modules = {
  home: ['运营总览','经营的第一视角','今天怎么样，先看这一屏。','成交额、订单、新增会员与在线导师集中呈现，结合成交趋势、运营诊断和快捷入口，找到今天的工作重点。'],
  trade: ['交易订单','从支付到履约','每一笔订单，都有清晰的来龙去脉。','按条件检索咨询与商品订单，查看支付、履约、退款和发票状态，在详情中跟进业务与记录备注。'],
  product: ['商品库存','围绕商品的日常管理','从上架到补货，把商品管明白。','集中查看商品与库存健康情况，支持分类筛选、发布编辑、上下架、补货、批量操作和 CSV 导出。'],
  mentor: ['导师管理','服务供给的管理入口','让导师审核，跟上服务节奏。','按审核状态查看导师资料，结合统计与快捷操作，推进认证审核、资料管理与日常跟进。'],
  members: ['用户会员','从用户列表到用户档案','认识每一位用户，做好每一次触达。','通过等级、标签与状态筛选会员，查看和编辑用户档案，完成批量运营、联系渠道选择与数据导出。'],
  marketing: ['营销触达','连接活动与目标用户','活动有计划，触达有对象。','创建和管理营销活动、触达计划与人群包，查看参与和转化数据，让下一次运营动作更有依据。'],
  service: ['客户服务','关注服务中的每个问题','把用户的问题，带回处理流程。','汇总服务相关指标与工单信息，关注咨询、投诉与响应情况，为客服跟进提供统一入口。'],
  finance: ['财务管理','看清每一笔资金流向','收支、余额与明细，放在一起看。','账户卡、收支指标、趋势和资金去向集中展示，便于财务人员核对明细、理解账户变动。']
};
let activeModule = 'home';
const moduleTabs = [...document.querySelectorAll('[data-module]')];
const moduleKeys = moduleTabs.map(tab => tab.dataset.module);
const carouselStage = document.querySelector('.car-stage');
const carouselSlides = [...document.querySelectorAll('.slide')];
const carouselDots = [...document.querySelectorAll('[data-dot]')];
const reduceMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let carouselIndex = 0;

// 整卡轮播：下一张从左侧进入，整块卡片向右滑动
function layoutCarousel(dragPx = 0) {
  if (!carouselStage) return;
  const n = carouselSlides.length;
  const stageW = carouselStage.clientWidth;
  const narrow = stageW < 640;
  const cardW = stageW * (narrow ? .86 : .66);
  const step = cardW * (narrow ? .96 : .74);
  carouselStage.style.height = `${cardW * 1000 / 1440 + 34}px`;
  carouselSlides.forEach((slide, i) => {
    let pos = ((carouselIndex - i) % n + n) % n; if (pos > n / 2) pos -= n; // 下一张在左侧（pos=-1）
    const x = pos * step + dragPx;
    const visible = Math.abs(pos) <= 1;
    slide.style.width = `${cardW}px`;
    slide.style.transform = `translateX(calc(-50% + ${x}px)) scale(${pos === 0 ? 1 : .86})`;
    slide.style.opacity = pos === 0 ? 1 : visible ? .5 : 0;
    slide.style.zIndex = String(10 - Math.abs(pos));
    slide.style.pointerEvents = visible ? 'auto' : 'none';
    slide.classList.toggle('is-current', pos === 0);
    slide.tabIndex = pos === 0 ? 0 : -1;
  });
}
function activateModule(key, focus = false, bringIntoView = false) {
  if (!modules[key]) return;
  activeModule = key;
  carouselIndex = moduleKeys.indexOf(key);
  const [label,kicker,title,description] = modules[key];
  moduleTabs.forEach(tab => { const selected = tab.dataset.module === key; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; if(selected && focus) tab.focus(); });
  if (bringIntoView) { const tab = moduleTabs[carouselIndex]; const bar = tab.parentElement; bar.scrollTo({left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth'}); }
  carouselDots.forEach(dot => dot.classList.toggle('is-active', dot.dataset.dot === key));
  const counter = document.getElementById('car-index'); if (counter) counter.textContent = String(carouselIndex + 1).padStart(2, '0');
  layoutCarousel();
  document.getElementById('module-panel').setAttribute('aria-labelledby', `tab-${key}`);
  const caption = document.querySelector('.module-caption');
  caption.classList.remove('is-switching'); void caption.offsetWidth; caption.classList.add('is-switching');
  document.getElementById('module-kicker').textContent = kicker;
  document.getElementById('module-title').textContent = title;
  document.getElementById('module-description').textContent = description;
  document.dispatchEvent(new CustomEvent('module-change', {detail: {key, index: carouselIndex}}));
}
// 与轮播方向一致：“下一页”让卡片向右移动
function stepModule(delta) { activateModule(moduleKeys[(carouselIndex + delta + moduleKeys.length) % moduleKeys.length], false, true); }
moduleTabs.forEach(tab => tab.addEventListener('click', () => activateModule(tab.dataset.module, false, true)));
carouselDots.forEach(dot => dot.addEventListener('click', () => activateModule(dot.dataset.dot, false, true)));
document.querySelector('.car-arrow.prev')?.addEventListener('click', () => stepModule(-1));
document.querySelector('.car-arrow.next')?.addEventListener('click', () => stepModule(1));
addEventListener('resize', () => layoutCarousel());
function keyboardTabs(tabs, activate, vertical = false) {
  tabs.forEach((tab,index) => tab.addEventListener('keydown', event => {
    let next = index;
    if(event.key === 'ArrowRight' || (vertical && event.key === 'ArrowDown')) next = (index+1)%tabs.length;
    else if(event.key === 'ArrowLeft' || (vertical && event.key === 'ArrowUp')) next = (index-1+tabs.length)%tabs.length;
    else if(event.key === 'Home') next = 0;
    else if(event.key === 'End') next = tabs.length-1;
    else return;
    event.preventDefault(); activate(tabs[next]); tabs[next].focus();
  }));
}
keyboardTabs(moduleTabs, tab => activateModule(tab.dataset.module, false, true));

// 拖动：向右拖 = 下一张（与自动播放方向一致）
let dragStartX = null, dragDelta = 0, dragged = false;
if (carouselStage) {
  carouselStage.addEventListener('pointerdown', event => { dragStartX = event.clientX; dragDelta = 0; dragged = false; carouselStage.classList.add('is-dragging'); });
  addEventListener('pointermove', event => {
    if (dragStartX === null) return;
    dragDelta = event.clientX - dragStartX;
    if (Math.abs(dragDelta) > 6) dragged = true;
    layoutCarousel(dragDelta);
  });
  addEventListener('pointerup', () => {
    if (dragStartX === null) return;
    carouselStage.classList.remove('is-dragging');
    const threshold = carouselStage.clientWidth * .08;
    if (dragDelta > threshold) stepModule(1); else if (dragDelta < -threshold) stepModule(-1); else layoutCarousel();
    dragStartX = null;
  });
  carouselStage.addEventListener('keydown', event => { if (event.key === 'ArrowRight') stepModule(1); if (event.key === 'ArrowLeft') stepModule(-1); });
}

const dialog = document.getElementById('image-dialog');
carouselSlides.forEach(slide => slide.addEventListener('click', event => {
  if (dragged) { event.preventDefault(); return; }
  if (!slide.classList.contains('is-current')) { activateModule(slide.dataset.slide, false, true); return; }
  const key = slide.dataset.slide;
  const img = document.getElementById('preview-image'); img.src = `assets/images/showcase-${key}.png`; img.alt = `${modules[key][0]}放大界面`; dialog.showModal(); document.body.style.overflow = 'hidden';
}));
document.querySelector('.ds-board-btn')?.addEventListener('click', () => {
  const img = document.getElementById('preview-image'); img.src = 'assets/showcase/design-system-board.jpg'; img.alt = '设计系统规范大图'; dialog.showModal(); document.body.style.overflow = 'hidden';
});
document.getElementById('preview-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if(event.target === dialog) { const rect = dialog.getBoundingClientRect(); if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; document.querySelector('.slide.is-current')?.focus(); });
activateModule('home');

// 设计规范：色彩 / 字体 / 间距 切换
const specTabs = [...document.querySelectorAll('[data-spec]')];
const specShots = [...document.querySelectorAll('[data-spec-shot]')];
const specInd = document.querySelector('.spec-ind');
function placeSpecInd() { const t = specTabs.find(x => x.getAttribute('aria-selected') === 'true'); if (t && specInd) { specInd.style.width = `${t.offsetWidth}px`; specInd.style.transform = `translateX(${t.offsetLeft}px)`; } }
function activateSpec(key) {
  const from = specTabs.findIndex(x => x.getAttribute('aria-selected') === 'true');
  const to = specTabs.findIndex(x => x.dataset.spec === key);
  specTabs.forEach(t => { const on = t.dataset.spec === key; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
  specShots.forEach(s => { const on = s.dataset.specShot === key; s.classList.toggle('is-current', on); s.dataset.dir = to > from ? 'right' : 'left'; });
  placeSpecInd();
}
specTabs.forEach(t => t.addEventListener('click', () => activateSpec(t.dataset.spec)));
keyboardTabs(specTabs, t => activateSpec(t.dataset.spec));
addEventListener('resize', placeSpecInd);
if (document.fonts) document.fonts.ready.then(placeSpecInd); placeSpecInd();

const assistantFrame = document.getElementById('assistant-frame');
const assistantEmbedStatus = document.getElementById('assistant-embed-status');
function mountExistingAssistant() {
  try {
    const frameDocument = assistantFrame.contentDocument;
    if (!frameDocument?.head || frameDocument.URL === 'about:blank') return false;
    if (!frameDocument.querySelector('#assistantPanel')) {
      assistantEmbedStatus.textContent = '小知组件尚未加载，请稍后重试或直接打开后台。';
      assistantEmbedStatus.classList.add('has-error');
      document.querySelector('[data-open-assistant]')?.classList.add('is-fallback');
      assistantFrame.classList.add('is-error');
      return false;
    }
    const markConnected = () => {
      assistantEmbedStatus.textContent = '已载入后台同款小知组件，可直接对话';
      assistantEmbedStatus.classList.remove('has-error');
      assistantEmbedStatus.classList.add('is-connected');
      document.querySelector('[data-open-assistant]')?.classList.remove('is-fallback');
      assistantFrame.classList.remove('is-error');
      assistantFrame.classList.add('is-ready');
      return true;
    };
    if (frameDocument.getElementById('showcase-assistant-embed-style')) return markConnected();
    const style = frameDocument.createElement('style');
    style.id = 'showcase-assistant-embed-style';
    style.textContent = `
      html,body,#app,.app-shell{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;overflow:hidden!important;background:transparent!important}
      .app-shell{position:relative!important}
      .topbar,.workspace,.assistant-fab,.system-message,.popover,.toast,.member-drawer,.member-drawer-backdrop,.trade-detail-drawer,.confirm-dialog,.confirm-backdrop,.product-drawer,.campaign-drawer,.touch-plan-dialog{display:none!important}
      .assistant-panel,.assistant-panel.open{display:grid!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;margin:0!important;border:1px solid #d9eaf7!important;border-radius:18px!important;box-shadow:0 18px 45px rgba(29,67,119,.15)!important;transform:none!important;animation:none!important}
      .assistant-panel::before,.assistant-panel::after{display:none!important}
      .assistant-title{min-height:42px!important;padding:0 10px!important}
      .assistant-title .assistant-close{display:none!important}
      .assistant-conversation{min-height:0!important}
      .assistant-composer-shell{padding-bottom:max(0px,env(safe-area-inset-bottom))!important}
    `;
    frameDocument.head.appendChild(style);
    const welcomeTitle = frameDocument.querySelector('.assistant-welcome h4');
    if (welcomeTitle) welcomeTitle.textContent = '你好！我是小知';
    const welcomeCopy = frameDocument.querySelector('.assistant-welcome p');
    if (welcomeCopy) welcomeCopy.textContent = '我可以帮你分析运营数据、定位异常，并给出可执行的处理顺序。';
    return markConnected();
  } catch (error) {
    assistantEmbedStatus.textContent = '当前打开方式限制了跨页面嵌入，请通过本地网页服务器打开介绍页。';
    assistantEmbedStatus.classList.add('has-error');
    document.querySelector('[data-open-assistant]')?.classList.add('is-fallback');
    assistantFrame.classList.add('is-error');
    return false;
  }
}
assistantFrame.addEventListener('load', mountExistingAssistant);
if (assistantFrame.contentDocument?.readyState === 'complete') mountExistingAssistant();
document.querySelector('[data-open-assistant]').addEventListener('click', () => {
  if (mountExistingAssistant()) {
    assistantFrame.contentDocument.querySelector('#assistantInput')?.focus();
    assistantFrame.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  } else {
    document.querySelector('.assistant-live-card')?.scrollIntoView({behavior:'smooth',block:'center'});
  }
});

const revealSelectors = [
  '.sec-title','.ov-card','.goal-tiles figure','.sb-card','.construction','.lockup',
  '.layout-notes li','.layout-device','.nav-copy','.nav-shot','.module-tabs','.module-panel',
  '.stats-grid > div','.business-copy','.business-visual','.task-columns article',
  '.ai-prompt-box','.chat-shot','.mood-intro','.moods figure','.ai-explanation','.assistant-live-card','.conversation-details',
  '.human-role','.loop-center','.codex-role','.build-heading','.build-steps','.build-panel',
  '.toolkit-heading','.toolkit article','.delivery','.closing .container > *'
];
const staggered = new Set(['.ov-card','.goal-tiles figure','.sb-card','.lockup','.layout-notes li','.nav-shot','.stats-grid > div','.task-columns article','.chat-shot','.moods figure','.toolkit article']);
revealSelectors.forEach((selector,index) => document.querySelectorAll(selector).forEach((element,elementIndex) => {
  if(element.closest('.chat-fan')) return; // 聊天扇形卡片自带旋转，不参与位移动画
  element.classList.add('scroll-reveal');
  if(['.business-visual','.assistant-live-card','.codex-role','.layout-device'].includes(selector)) element.dataset.revealDirection = 'right';
  else if(['.business-copy','.ai-explanation','.human-role','.nav-copy'].includes(selector)) element.dataset.revealDirection = 'left';
  if(staggered.has(selector)) element.style.setProperty('--reveal-delay', `${Math.min(elementIndex * 80, 320)}ms`);
}));
function revealElement(element) {
  element.classList.add('is-revealed');
  // 入场动画结束后移除辅助类，避免 transition-delay 影响后续悬停效果
  const done = event => { if(event.target !== element || event.propertyName !== 'opacity') return; element.removeEventListener('transitionend', done); element.classList.remove('scroll-reveal','is-revealed'); element.style.removeProperty('--reveal-delay'); };
  element.addEventListener('transitionend', done);
}
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
  if(entry.isIntersecting) { revealElement(entry.target); revealObserver.unobserve(entry.target); }
}), {rootMargin:'0px 0px -8% 0px',threshold:.08}) : null;
document.querySelectorAll('.scroll-reveal').forEach(element => {
  if(!revealObserver || element.getBoundingClientRect().top < innerHeight * .92) revealElement(element);
  else revealObserver.observe(element);
});
const progressHeader = document.querySelector('.site-header');
let progressQueued = false;
window.addEventListener('scroll', () => {
  if(progressQueued) return;
  progressQueued = true;
  requestAnimationFrame(() => {
    const maximum = document.documentElement.scrollHeight - innerHeight;
    progressHeader?.style.setProperty('--scroll-progress', maximum > 0 ? String(scrollY / maximum) : '0');
    progressQueued = false;
  });
}, {passive:true});
const hero = document.querySelector('.hero');
hero.addEventListener('pointermove', event => {
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const bounds = hero.getBoundingClientRect();
  hero.style.setProperty('--hero-shift-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}px`);
  hero.style.setProperty('--hero-shift-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
});
hero.addEventListener('pointerleave', () => { hero.style.setProperty('--hero-shift-x','0px'); hero.style.setProperty('--hero-shift-y','0px'); });

const steps = [
  ['项目读取 / 需求梳理','从真实业务出发，先读懂这个后台。','读取 README、已有页面与交互代码，确认用户、导师、咨询订单和财务之间的关系。将参考图拆成视觉层级、界面展示与制作过程三条内容线。','输入\n  业务目标 + 参考图 + 现有项目\n\n梳理\n  谁使用 → 做什么 → 需要什么信息\n\n产出\n  页面结构 / 功能清单 / 内容边界','清楚的产品定位与页面结构'],
  ['视觉参考 / 设计系统','把参考图的语言，转成自己的产品界面。','提取蓝白配色、深浅区块交替和设备展示的节奏。结合已有 Token、组件样式与机器人素材，让每个业务页面保持一致。','design-system/\n  tokens.css       颜色、间距、字号\n  components.css   卡片、按钮、表格样式\n  components.js    可复用组件\n\nassets/\n  图标字体 / 小知素材 / 产品界面','可复用的视觉规则与组件'],
  ['文件编辑 / HTML · CSS · JavaScript','让静态设计，变成能点、能问的原型。','用原生 HTML、CSS 和 JavaScript 组织页面。围绕筛选、详情、批量操作与消息反馈补齐交互；小知通过本地场景规则展示提问、思考与回复流程。','界面层\n  导航 / 业务模块 / 对话窗口\n\n交互层\n  搜索筛选 → 详情操作 → 状态反馈\n\n对话演示\n  输入问题 → 本地规则 → 示例回复','后台交互页面与小知对话原型'],
  ['agent-browser / 浏览器截图','不止读代码，还要打开页面亲自验证。','在浏览器里切换模块、发送问题、查看反馈，并以桌面与手机宽度检查布局。真实后台截图用于介绍页展示，发现裁切、溢出或交互问题后再调整。','桌面检查\n  模块切换 / 大图查看 / 对话发送\n\n移动端检查\n  导航 / 文本换行 / 横向溢出\n\n反馈循环\n  实际操作 → 发现问题 → 修改 → 复查','经过浏览器检查的可交互网页'],
  ['本地交付 / 后续迭代','交付一个能继续往下做的项目。','保留设计系统、素材与说明。这一阶段交付的是本地交互原型；真实模型、业务数据、权限与持久化服务，是下一阶段的接入工作。','已交付\n  index.html       后台入口\n  showcase.html    产品介绍页\n  design-system/   设计系统\n\n下一步\n  服务端模型 API + 业务数据 + 权限','可运行的本地项目与清晰的下一步']
];
const stepTabs=[...document.querySelectorAll('[data-step]')];
function activateStep(index) {
  const step=steps[index];
  stepTabs.forEach(tab => { const selected=Number(tab.dataset.step)===index; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex=selected?0:-1; });
  document.getElementById('build-panel').setAttribute('aria-labelledby',`step-${index}`);
  ['build-tool','build-title','build-description','build-code','build-output'].forEach((id,i)=>document.getElementById(id).textContent=step[i]);
  document.getElementById('build-number').textContent=`STEP 0${index+1}`;
}
// 滚动驱动：每滚动一段，下一步移动到首位，右侧内容随之切换
const buildScroller = document.querySelector('.build-scroller');
const stepsList = document.querySelector('.build-steps');
const scrollDriven = () => buildScroller && !matchMedia('(max-width: 760px)').matches;
function placeSteps(index) {
  if (!stepsList) return;
  const first = stepTabs[0]; const target = stepTabs[index];
  const shift = scrollDriven() ? target.offsetTop - first.offsetTop : 0;
  stepsList.style.setProperty('--shift', `${-shift}px`);
  stepTabs.forEach((tab, i) => { tab.classList.toggle('is-past', i < index); tab.classList.toggle('is-next', i > index); });
}
let currentStep = 0;
function setStep(index) {
  if (index === currentStep && stepTabs[index].getAttribute('aria-selected') === 'true') { placeSteps(index); return; }
  currentStep = index; activateStep(index); placeSteps(index);
  document.dispatchEvent(new CustomEvent('build-step', {detail: index}));
}
function onBuildScroll() {
  if (!scrollDriven()) return;
  const r = buildScroller.getBoundingClientRect();
  const total = buildScroller.offsetHeight - innerHeight;
  const p = Math.min(.999, Math.max(0, -r.top / Math.max(1, total)));
  buildScroller.style.setProperty('--build-p', p.toFixed(3));
  setStep(Math.floor(p * stepTabs.length));
}
addEventListener('scroll', () => requestAnimationFrame(onBuildScroll), {passive: true});
addEventListener('resize', () => { placeSteps(currentStep); onBuildScroll(); });
stepTabs.forEach((tab, i) => tab.addEventListener('click', () => {
  if (scrollDriven()) {
    const top = buildScroller.getBoundingClientRect().top + scrollY;
    const total = buildScroller.offsetHeight - innerHeight;
    scrollTo({top: top + total * (i + .5) / stepTabs.length, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  } else setStep(i);
}));
placeSteps(0);
keyboardTabs(stepTabs,tab=>activateStep(Number(tab.dataset.step)),true);
const navLinks=[...document.querySelectorAll('.site-header nav a')];
const sections=navLinks.map(link=>document.querySelector(link.getAttribute('href')));
function updateNavigation(){let current='';sections.forEach(section=>{if(section.getBoundingClientRect().top<=180) current=`#${section.id}`;});navLinks.forEach(link=>{const selected=link.getAttribute('href')===current;link.classList.toggle('active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
let scrollQueued=false;window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{updateNavigation();scrollQueued=false;});}},{passive:true});updateNavigation();
