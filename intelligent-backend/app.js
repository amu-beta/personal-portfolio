const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const pageNames = {
  home: "首页",
  trade: "交易财务",
  product: "商品库存",
  mentor: "导师",
  members: "会员",
  marketing: "营销触达",
  service: "客服",
  finance: "财务",
};

const state = {
  page: ["home", "trade", "product", "mentor", "members", "marketing", "service", "finance"].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "home",
  secondaryActive: {
    trade: "订单管理",
    product: "商品列表",
    mentor: "资料审核",
    members: "用户会员",
    marketing: "活动中心",
    service: "数据概览",
    finance: "总览",
  },
  messageOpen: false,
  assistantOpen: false,
  assistantHistoryOpen: false,
  assistantThinking: false,
  assistantSessions: [],
  assistantMessages: [
    {
      role: "assistant",
      text: "你好，我是小知。我可以帮你分析运营数据、定位异常，并给出可执行的处理顺序。"
    }
  ],
  reminderTab: "todo",
  systemRead: false,
  trendRange: "7d",
  trendMetric: "sales",
  memberLevel: "全部等级",
  memberStatus: "全部状态",
  memberQuery: "",
  hideSilent: false,
  selectedMembers: new Set(),
  memberDetailId: null,
  memberDrawerTab: "profile",
  memberEditMode: false,
  contactChannel: "site",
  tradeStatus: "全部订单",
  tradeQuery: "",
  tradeType: "全部类型",
  tradePayment: "全部支付",
  tradeFulfillment: "全部履约",
  tradeDetailId: null,
  tradeNoteEditing: false,
  refundConfirmId: null,
  tradeFinanceFocus: "",
  productTab: "全部商品",
  productQuery: "",
  stockFilter: "全部库存",
  productCategory: "全部分类",
  productPage: 1,
  selectedInventory: new Set(),
  productDetailId: null,
  productEditMode: false,
  productLogTab: "profile",
  restockId: null,
  publishProductOpen: false,
  mentorSection: "资料审核",
  mentorStatus: "全部",
  mentorSort: "申请时间",
  mentorTrendRange: "近7天",
  selectedMentors: new Set(),
  marketingSection: "活动中心",
  marketingStatus: "全部状态",
  marketingQuery: "",
  campaignDetailId: null,
  campaignEditMode: false,
  campaignCreateOpen: false,
  touchPlanOpen: false,
  touchPlanType: "Push推送",
  campaignLogs: ["今天 15:06 · 运营员创建会员续费触达任务", "今天 11:32 · 系统完成活动转化数据更新"],
};
state.messageOpen = false;

let renderMotionMode = "page";
let renderMotionTimer = null;

const primaryNav = [
  ["home", "首页", "home"],
  ["trade", "交易", "order"],
  ["product", "商品", "box"],
  ["mentor", "导师", "users"],
  ["marketing", "营销", "ticket"],
  ["promotion", "推广", "send"],
  ["members", "会员", "users"],
  ["finance", "财务", "wallet"],
  ["divider", "", ""],
  ["tools", "服务", "grid"],
];

const secondaryMenus = {
  trade: [
    { links: ["订单管理", "退款售后", "会员支付", "导师结算", "发票对账"] },
  ],
  product: [
    { links: ["商品列表", "发布商品", "SKU管理", "库存管理", "物流管理", "商品售后"] },
  ],
  mentor: [
    { links: ["导师总览"] },
    { title: "导师管理", links: ["资料审核", "导师列表", "排班管理", "服务评价"] },
    { title: "能力运营", links: ["擅长领域", "服务价格", "内容贡献"] },
  ],
  members: [
    { links: ["会员总览"] },
    { title: "会员管理", links: ["用户会员", "会员等级", "标签管理", "会员权益"] },
    { title: "会员运营", links: ["触达任务", "续费提醒", "权益记录"] },
  ],
  marketing: [
    { links: ["活动中心", "优惠券", "邀请裂变", "签到储值", "推送通知", "Banner管理"] },
  ],
  service: [
    { title: "客服总览", links: ["数据概览", "绩效考核"] },
    { title: "客服管理", links: ["现场管理", "客服分流"] },
    { title: "客服工具", links: ["接待工具"] },
    { title: "机器人", links: ["机器人主页", "接待设置"] },
  ],
  finance: [
    { links: ["总览", "资金管理"] },
    { title: "对账管理", links: ["账户明细", "收支账单", "对账凭据"] },
    { title: "发票管理", links: ["申请发票", "给平台开票", "给买家开票"] },
    { links: ["基础信息", "保证金"] },
  ],
};

const memberUsers = [
  { id: "XZ-U-26092801", name: "林知夏", phone: "138****4821", level: "黑金会员", status: "活跃", source: "小程序", spend: 12860, lastActive: "今天 15:18", wechat: "linzhixia_28", birthday: "1992-06-18", tags: ["高净值", "事业咨询"], color: "#6688ef", logs: ["今天 14:28 · 运营员小岚更新会员等级", "09-26 18:42 · 完成年度流年报告", "09-21 10:16 · 小程序支付 ¥1,288"] },
  { id: "XZ-U-26092718", name: "周予安", phone: "186****0937", level: "金曜会员", status: "活跃", source: "公众号", spend: 7680, lastActive: "今天 14:52", wechat: "zhouyuan_77", birthday: "1988-11-02", tags: ["情感合盘", "续费意向"], color: "#9b75e5", logs: ["今天 11:05 · 标签新增「续费意向」", "09-27 09:30 · 查看合盘报告"] },
  { id: "XZ-U-26092633", name: "陈星野", phone: "159****6472", level: "银曜会员", status: "待激活", source: "活动落地页", spend: 1980, lastActive: "昨天 20:36", wechat: "chenxingye", birthday: "1996-03-12", tags: ["新客", "待首咨"], color: "#52a982", logs: ["昨天 20:36 · 完成手机号注册", "昨天 20:34 · 领取新人权益"] },
  { id: "XZ-U-26092109", name: "沈月白", phone: "133****8250", level: "金曜会员", status: "沉默", source: "导师推荐", spend: 9360, lastActive: "18天前", wechat: "shenyuebai", birthday: "1990-09-26", tags: ["择日", "需召回"], color: "#ef8a55", logs: ["09-10 16:12 · 系统标记为沉默用户", "08-28 13:40 · 完成择日报告"] },
  { id: "XZ-U-26091827", name: "顾云深", phone: "177****3158", level: "星曜会员", status: "活跃", source: "小程序", spend: 680, lastActive: "今天 12:17", wechat: "guyunshen18", birthday: "1998-01-15", tags: ["轻咨询"], color: "#4fa7c8", logs: ["今天 12:17 · 浏览会员中心", "09-18 19:22 · 首次购买咨询"] },
  { id: "XZ-U-26091542", name: "苏晚晴", phone: "151****7904", level: "银曜会员", status: "活跃", source: "公众号", spend: 3260, lastActive: "今天 10:08", wechat: "suwanqing09", birthday: "1994-07-09", tags: ["事业咨询", "内容活跃"], color: "#db708f", logs: ["今天 10:08 · 阅读内容《九月运势》", "09-23 15:36 · 完成事业咨询"] },
  { id: "XZ-U-26091016", name: "陆青川", phone: "189****2646", level: "星曜会员", status: "沉默", source: "活动落地页", spend: 980, lastActive: "31天前", wechat: "luqingchuan", birthday: "1986-12-30", tags: ["需召回"], color: "#8f8fb9", logs: ["08-28 08:42 · 系统标记为沉默用户"] },
  { id: "XZ-U-26090508", name: "叶听澜", phone: "136****1189", level: "黑金会员", status: "活跃", source: "导师推荐", spend: 18520, lastActive: "今天 09:41", wechat: "yetinglan05", birthday: "1989-04-21", tags: ["高净值", "会员续费", "内容活跃"], color: "#5b6d89", logs: ["今天 09:41 · 续费黑金会员", "09-25 17:20 · 完成合盘咨询"] },
  { id: "XZ-U-26090214", name: "许昭昭", phone: "158****5033", level: "金曜会员", status: "待激活", source: "小程序", spend: 4280, lastActive: "3天前", wechat: "xuzhaozhao", birthday: "1993-08-14", tags: ["待激活", "报告偏好"], color: "#dc9762", logs: ["09-25 19:06 · 会员等级调整为金曜会员", "09-18 14:20 · 完成命盘报告"] },
  { id: "XZ-U-26082936", name: "温时予", phone: "137****4460", level: "银曜会员", status: "活跃", source: "公众号", spend: 5480, lastActive: "今天 08:56", wechat: "wenshiyu", birthday: "1991-02-17", tags: ["内容活跃", "情感合盘"], color: "#6d9f75", logs: ["今天 08:56 · 点击续费提醒", "09-24 12:03 · 收藏情感内容"] },
];

const tradeOrders = [
  { id: "XZ-20260928-0836", user: "林知夏", phone: "138****4821", type: "会员支付", product: "黑金会员年度续费", owner: "会员运营", amount: 1288, payment: "已支付", fulfillment: "已完成", time: "今天 15:18", note: "高净值会员续费", logs: ["15:18 · 支付成功", "15:19 · 会员等级已更新"] },
  { id: "XZ-20260928-0819", user: "周予安", phone: "186****0937", type: "导师服务", product: "双人合盘深度咨询", owner: "周老师", amount: 680, payment: "退款中", fulfillment: "退款处理中", time: "今天 14:52", note: "用户申请取消咨询", logs: ["14:52 · 用户提交退款申请", "14:55 · 系统暂停导师结算"] },
  { id: "XZ-20260928-0788", user: "陈星野", phone: "159****6472", type: "报告订单", product: "事业财运趋势报告", owner: "报告中心", amount: 198, payment: "待支付", fulfillment: "未开始", time: "今天 13:36", note: "", logs: ["13:36 · 创建订单"] },
  { id: "XZ-20260928-0751", user: "苏晚晴", phone: "151****7904", type: "导师服务", product: "事业方向一对一咨询", owner: "林老师", amount: 980, payment: "已支付", fulfillment: "履约中", time: "今天 12:17", note: "已预约明日 10:00", logs: ["12:17 · 支付成功", "12:20 · 导师已接单"] },
  { id: "XZ-20260928-0694", user: "叶听澜", phone: "136****1189", type: "商品订单", product: "年度运势实体手册", owner: "商品中心", amount: 328, payment: "已支付", fulfillment: "待发货", time: "今天 10:41", note: "发票抬头待确认", logs: ["10:41 · 支付成功", "10:43 · 进入待发货队列"] },
  { id: "XZ-20260928-0612", user: "顾云深", phone: "177****3158", type: "报告订单", product: "一生核心命盘报告", owner: "报告中心", amount: 268, payment: "已退款", fulfillment: "已关闭", time: "今天 09:28", note: "退款已原路返回", logs: ["09:28 · 支付成功", "11:02 · 退款完成", "11:02 · 订单关闭"] },
  { id: "XZ-20260927-2286", user: "温时予", phone: "137****4460", type: "会员支付", product: "金曜会员季度续费", owner: "会员运营", amount: 398, payment: "已支付", fulfillment: "已完成", time: "昨天 21:06", note: "", logs: ["昨天 21:06 · 支付成功", "昨天 21:07 · 会员权益发放"] },
  { id: "XZ-20260927-2198", user: "沈月白", phone: "133****8250", type: "导师服务", product: "开业择日咨询", owner: "陈老师", amount: 520, payment: "已支付", fulfillment: "已完成", time: "昨天 18:42", note: "服务已完成", logs: ["昨天 18:42 · 支付成功", "今天 09:12 · 服务完成"] },
];

const inventoryProducts = [
  { id: "XZ-P-10081", name: "年度流年深度报告", image: "assets/images/product-cover-01.jpg", category: "数字报告", price: 198, sku: 3, stock: 986, sales30: 326, quality: "优", published: "2026-08-16", status: "在售", description: "覆盖事业、财富、关系和关键月份的年度报告。", logs: ["今天 11:20 · 调整可用库存", "09-26 15:32 · 更新商品描述"] },
  { id: "XZ-P-10076", name: "双人合盘关系分析", image: "assets/images/product-cover-02.jpg", category: "数字报告", price: 268, sku: 4, stock: 214, sales30: 185, quality: "优", published: "2026-08-02", status: "在售", description: "从相处模式、沟通与长期趋势分析双人关系。", logs: ["今天 09:42 · 商品装修完成"] },
  { id: "XZ-P-10063", name: "事业方向一对一咨询", image: "assets/images/product-cover-03.jpg", category: "导师服务", price: 980, sku: 6, stock: 18, sales30: 72, quality: "良", published: "2026-07-18", status: "在售", description: "60 分钟一对一事业方向咨询服务。", logs: ["今天 10:14 · 库存低于预警线", "09-25 18:20 · 新增导师 SKU"] },
  { id: "XZ-P-10057", name: "年度运势实体手册", image: "assets/images/product-cover-04.jpg", category: "实体商品", price: 328, sku: 2, stock: 6, sales30: 41, quality: "良", published: "2026-06-26", status: "在售", description: "定制年度运势手册，含重点日期与行动建议。", logs: ["今天 08:56 · 触发库存预警", "昨天 16:18 · 发货 12 件"] },
  { id: "XZ-P-10042", name: "开业择日咨询", image: "assets/images/product-cover-05.jpg", category: "导师服务", price: 520, sku: 3, stock: 0, sales30: 28, quality: "待优化", published: "2026-05-20", status: "下架", description: "根据业务类型与负责人信息提供开业日期建议。", logs: ["今天 09:06 · 库存耗尽自动下架"] },
  { id: "XZ-P-10038", name: "会员专属月度答疑", image: "assets/images/product-cover-06.jpg", category: "会员权益", price: 88, sku: 1, stock: 480, sales30: 96, quality: "优", published: "2026-04-11", status: "在售", description: "面向会员的月度集中答疑服务。", logs: ["09-24 11:30 · 调整销售价格"] },
  { id: "XZ-P-10031", name: "真命情人缘分报告", image: "assets/images/product-cover-07.jpg", category: "数字报告", price: 168, sku: 2, stock: 326, sales30: 83, quality: "优", published: "2026-03-28", status: "在售", description: "结合双方信息生成情感关系与相处建议报告。", logs: ["09-22 16:10 · 更新商品封面"] },
];

const marketingCampaigns = [
  { id: "MK-260928-01", name: "国庆会员续费礼", subtitle: "续费即赠专属月度答疑权益", start: "2026-09-28", end: "2026-10-08", participants: 286, conversion: "18.6%", channels: ["小程序", "系统消息"], type: "会员续费", status: "进行中", logs: ["今天 09:00 · 活动自动开始", "昨天 18:20 · 调整人群包"] },
  { id: "MK-260926-03", name: "新会员首咨优惠", subtitle: "首次导师咨询立减 80 元", start: "2026-09-26", end: "2026-10-15", participants: 412, conversion: "22.4%", channels: ["公众号", "Push"], type: "拉新", status: "进行中", logs: ["09-26 10:00 · 活动开始"] },
  { id: "MK-260930-02", name: "沉默会员召回计划", subtitle: "专属报告优惠券与内容提醒", start: "2026-09-30", end: "2026-10-12", participants: 0, conversion: "--", channels: ["短信", "微信"], type: "召回", status: "待开始", logs: ["今天 14:36 · 完成活动配置"] },
  { id: "MK-260920-06", name: "九月内容签到季", subtitle: "连续签到领取成长值和优惠券", start: "2026-09-20", end: "2026-09-30", participants: 1386, conversion: "31.8%", channels: ["小程序", "Banner"], type: "促活", status: "进行中", logs: ["昨天 22:00 · 发放签到奖励"] },
];

function legacyIcon(name, size = 18) {
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/><path d="M9 21v-7h6v7"/>',
    briefcase: '<rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5h6v2M4 12h16"/>',
    order: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    box: '<path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10"/>',
    ticket: '<path d="M5 5h14v4a2 2 0 0 0 0 4v6H5v-6a2 2 0 0 0 0-4z"/><path d="M12 7v10"/>',
    send: '<path d="m3 11 18-8-8 18-2-8zM11 13l10-10"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1zM17 19c0 2-2 2-4 2"/>',
    store: '<path d="M4 10v10h16V10M3 5h18l-2 5H5z"/><path d="M9 20v-6h6v6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
    wallet: '<path d="M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13"/><path d="M15 11h6v5h-6a2.5 2.5 0 0 1 0-5"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v5c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 11v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    feedback: '<path d="M4 4h16v13H7l-3 3z"/><path d="M8 9h8M8 13h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    rule: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    agreement: '<path d="M7 3h10v4h3v14H4V7h3z"/><path d="M8 12h8M8 16h6"/>',
    manager: '<path d="M4 17c2-5 4-7 8-7s6 2 8 7"/><circle cx="12" cy="6" r="3"/><path d="M4 17h16v4H4z"/>',
    flag: '<path d="M5 21V4M5 5h11l-2 3 2 3H5"/>',
    message: '<path d="M4 5h16v12H8l-4 4z"/><path d="M8 9h8M8 13h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    refresh: '<path d="M20 6v5h-5"/><path d="M19 11a8 8 0 1 0 .2 5"/>',
    thumbsUp: '<path d="M7 10v10H3V10zM7 18c2 0 3 2 6 2h3.5a2 2 0 0 0 2-1.6l1.2-6A2 2 0 0 0 17.8 10H14l.5-3.1A3.4 3.4 0 0 0 11 3l-1 4-3 3"/>',
    thumbsDown: '<path d="M7 14V4H3v10zM7 6c2 0 3-2 6-2h3.5a2 2 0 0 1 2 1.6l1.2 6a2 2 0 0 1-1.9 2.4H14l.5 3.1A3.4 3.4 0 0 1 11 21l-1-4-3-3"/>',
    trendUp: '<path d="M3 17 9 11l4 4 8-9"/><path d="M15 6h6v6"/>',
    trendDown: '<path d="m3 7 6 6 4-4 8 9"/><path d="M15 18h6v-6"/>',
    crown: '<path d="m4 7 4 4 4-7 4 7 4-4-1 12H5z"/><path d="M5 16h14"/>',
    diamond: '<path d="m12 3 7 6-7 12L5 9z"/><path d="m5 9 14 0M9 9l3 12 3-12"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
}

/* iconfont override: the user-supplied icon packs are the single visual source for app icons. */
const iconGlyphs = {
  home:["nav","e6b8"], homefill:["nav","e6bb"], service:["nav","e6ff"], creativefill:["nav","e718"], creative:["nav","e719"], servicefill:["nav","e737"], circlefill:["nav","e7b0"], circle:["nav","e7b1"], goodsnewfill:["nav","e7bf"], goodsnew:["nav","e7c0"], group_fill_light:["nav","e7f4"], group_fill:["nav","e7f5"], activity:["action","e6de"],
  briefcase:["action","e6f4"], order:["action","e732"], box:["nav","e7c0"], ticket:["action","e6ee"], send:["action","e726"], headset:["nav","e6ff"], store:["nav","e7c0"], users:["nav","e7f4"], wallet:["action","e704"], coins:["action","e704"], chart:["action","e6f7"], grid:["nav","e7b1"], search:["action","e71b"], bell:["action","e6de"], feedback:["action","e6fa"], download:["action","e720"], rule:["action","e6f4"], agreement:["action","e6f4"], manager:["nav","e7f4"], flag:["action","e6fc"], message:["action","e6e4"], clock:["action","e6f7"], copy:["action","e6eb"], refresh:["action","e72e"], thumbsUp:["action","e6fa"], thumbsDown:["action","e6f3"], trendUp:["action","e721"], trendDown:["action","e720"], crown:["action","e6ee"], diamond:["action","e6eb"], enter:["action","e6f8"], right:["action","e721"]
};
function icon(name, size = 18) {
  const [family, code] = iconGlyphs[name] || iconGlyphs.circle;
  return `<span class="qn-icon qn-icon-${family}" style="font-size:${size}px" aria-hidden="true">${String.fromCodePoint(parseInt(code, 16))}</span>`;
}
function assistantSendIcon() {
  return `<svg class="assistant-send-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path d="M512 604.16l61.013333 294.4a16.64 16.64 0 0 0 19.626667 12.942222 16.071111 16.071111 0 0 0 6.684444-3.128889L671.715556 853.333333A99.555556 99.555556 0 0 0 711.111111 773.831111V469.333333z" fill="#14CFFF"></path><path d="M365.084444 223.573333l285.724445 142.222223 199.111111-127.004445A76.657778 76.657778 0 0 1 952.888889 256a69.831111 69.831111 0 0 1-14.222222 97.848889l-449.991111 332.8a199.111111 199.111111 0 0 1-218.453334 12.231111l-98.133333-56.888889 66.275555-93.582222 31.288889 7.68a99.555556 99.555556 0 0 0 79.075556-14.222222L440.888889 482.133333 218.311111 281.6a16.782222 16.782222 0 0 1-1.28-23.608889 21.902222 21.902222 0 0 1 4.124445-3.271111l50.488888-28.444444a99.555556 99.555556 0 0 1 93.44-2.702223zM118.897778 518.968889L205.795556 540.444444l-60.871112 85.333334-72.391111-41.244445a31.146667 31.146667 0 0 1-11.377777-42.666666 16.213333 16.213333 0 0 1 2.133333-3.271111 53.475556 53.475556 0 0 1 55.608889-19.626667z" fill="#8CE6FF"></path></svg>`;
}
function assistantChevronIcon() {
  return `<svg class="assistant-fab-chevron-icon" viewBox="0 0 1024 1024" aria-hidden="true"><path d="M890.336 330.912c-12.576-12.416-32.8-12.352-45.248 0.192L517.248 661.952 184.832 332.512c-12.576-12.448-32.8-12.352-45.28 0.192-12.448 12.576-12.352 32.832 0.192 45.28l353.312 350.112c0.544 0.544 1.248 0.672 1.792 1.184 0.128 0.128 0.16 0.288 0.288 0.416 6.24 6.176 14.4 9.28 22.528 9.28 8.224 0 16.48-3.168 22.72-9.472l350.112-353.312C902.976 363.616 902.88 343.36 890.336 330.912z"></path></svg>`;
}

const navIconPairs = {
  home:[["nav","e6b8"],["nav","e6bb"]], trade:[["action","e732"],["action","e733"]], product:[["nav","e7c0"],["nav","e7bf"]], mentor:[["nav","e7f4"],["nav","e7f5"]], marketing:[["action","e6ee"],["action","e6ed"]], promotion:[["nav","e719"],["nav","e718"]], shop:[["nav","e7c0"],["nav","e7bf"]], members:[["nav","e7f4"],["nav","e7f5"]], finance:[["action","e704"],["action","e703"]], tools:[["nav","e7b1"],["nav","e7b0"]]
};
function renderNavIcon(key, active = false, size = 18) {
  const [family, code] = (navIconPairs[key] || navIconPairs.tools)[active ? 1 : 0];
  return `<span class="qn-icon qn-icon-${family}" style="font-size:${size}px" aria-hidden="true">${String.fromCodePoint(parseInt(code,16))}</span>`;
}
function renderSolidIcon(name, size = 18) {
  const solidMap = { box:["nav","e7bf"], users:["nav","e7f5"], ticket:["action","e6ed"], send:["action","e6df"], order:["action","e733"], chart:["action","e6f6"], grid:["nav","e7b0"] };
  const [family, code] = solidMap[name] || ["nav","e7b0"];
  return `<span class="qn-icon qn-icon-${family}" style="font-size:${size}px" aria-hidden="true">${String.fromCodePoint(parseInt(code,16))}</span>`;
}
function customerSmileIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8.5 14.2c1 1.15 2.15 1.7 3.5 1.7s2.5-.55 3.5-1.7"/></svg>`;
}
function inviteGroupIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" fill="none" aria-hidden="true"><path d="M668.8 384c0-140.8-115.2-256-256-256s-256 115.2-256 256c0 92.8 51.2 172.8 124.8 217.6-105.6 44.8-192 137.6-217.6 256-3.2 16 6.4 35.2 22.4 38.4h6.4c16 0 28.8-9.6 32-25.6 32-134.4 153.6-233.6 288-233.6h3.2c140.8 0 252.8-115.2 252.8-252.8z m-448 0c0-105.6 86.4-192 192-192s192 86.4 192 192-86.4 192-192 192-192-86.4-192-192zM732.8 544c-19.2 0-32 16-28.8 35.2 0 16 16 28.8 32 28.8h3.2c105.6-6.4 188.8-96 188.8-201.6s-83.2-192-185.6-201.6c-19.2 0-32 12.8-35.2 28.8 0 19.2 12.8 32 28.8 35.2 70.4 6.4 128 67.2 128 137.6 0 73.6-57.6 134.4-131.2 137.6zM960 758.4c-9.6-41.6-41.6-92.8-80-118.4-16-9.6-35.2-3.2-44.8 9.6-9.6 16-3.2 35.2 9.6 44.8 22.4 12.8 44.8 51.2 51.2 76.8 3.2 16 16 25.6 32 25.6h6.4c19.2-3.2 28.8-19.2 25.6-38.4zM620.8 640l-19.2-12.8c-16-9.6-35.2-6.4-44.8 9.6s-6.4 35.2 9.6 44.8l19.2 12.8c57.6 41.6 102.4 105.6 118.4 176 3.2 16 16 25.6 32 25.6h6.4c16-3.2 28.8-22.4 22.4-38.4-22.4-89.6-73.6-166.4-144-217.6z" fill="currentColor"></path></svg>`;
}
function helpCircleIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.35 2.35 0 1 1 3.65 1.95c-.95.65-1.45 1.12-1.45 2.05M12 17h.01"/></svg>`;
}
function mentorNavIcon(size = 24) {
  return `<svg class="mentor-nav-svg" width="${size}" height="${size}" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true"><path d="M160 608c-17.664 0-32-14.304-32-32V416c0-17.664 14.336-32 32-32s32 14.336 32 32v160c0 17.696-14.336 32-32 32z"></path><path d="M864 928H224c-52.928 0-96-42.752-96-95.328V768c0-17.696 14.336-32 32-32s32 14.304 32 32v64.672C192 849.984 206.368 864 224 864h640c17.664 0 32-14.336 32-32V192c0-17.632-14.336-32-32-32H224c-18.56 0-32 10.144-32 17.024V224c0 17.664-14.336 32-32 32s-32-14.336-32-32v-46.976C128 132.352 171.072 96 224 96h640c52.928 0 96 43.072 96 96v640c0 52.928-43.072 96-96 96z"></path><path d="M192 352H96c-17.664 0-32-14.336-32-32s14.336-32 32-32h96c17.664 0 32 14.336 32 32s-14.336 32-32 32zM192 704H96c-17.664 0-32-14.304-32-32s14.336-32 32-32h96c17.664 0 32 14.304 32 32s-14.336 32-32 32z"></path><path d="M319.456 800.992c-14.56 0-27.712-9.984-31.136-24.736-4-17.216 6.688-34.4 23.936-38.4 4.544-1.056 97.792-22.656 167.744-30.56v-20.032c-67.136-57.6-96-139.52-96-269.92 0-127.84 64.608-192.672 192-192.672 158.688 0 192 104.416 192 192 0 139.008-66.24 223.2-127.2 271.2l.224 19.84c69.28 8.544 161.504 29.088 165.984 30.08 17.248 3.84 28.096 20.96 24.224 38.208-3.808 17.216-20.704 28.224-38.208 24.224-1.184-.256-121.856-27.168-185.92-31.648-16.64-1.152-29.568-14.912-29.76-31.552l-.672-64.672c-.128-10.464 4.864-20.32 13.408-26.368C642.016 608.8 704 538.848 704 416.672c0-90.912-37.088-128-128-128-92.096 0-128 36.064-128 128.672 0 117.632 24.16 184.032 83.392 229.248C539.328 652.64 544 662.016 544 672v64.672c0 17.088-13.408 31.168-30.464 31.968-63.584 3.04-185.568 31.264-186.784 31.52-2.432.576-4.864.832-7.296.832z"></path></svg>`;
}
function memberNavIcon(size = 18) {
  return `<svg class="member-nav-svg" width="${size}" height="${size}" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true"><path d="M777.6 384c0-160-128-288-288-288s-288 128-288 288c0 108.8 57.6 201.6 147.2 249.6-121.6 48-214.4 153.6-240 288-3.2 16 6.4 35.2 25.6 38.4h6.4c16 0 28.8-9.6 32-25.6 28.8-150.4 160-259.2 313.6-262.4h6.4c156.8 0 284.8-128 284.8-288zm-512 0c0-124.8 99.2-224 224-224s224 99.2 224 224c0 121.6-99.2 220.8-220.8 224H483.2c-121.6-3.2-217.6-102.4-217.6-224zM966.4 742.4c-3.2-12.8-12.8-19.2-25.6-22.4l-83.2-12.8-38.4-80c-6.4-12.8-16-19.2-28.8-19.2s-22.4 6.4-28.8 19.2l-38.4 80-83.2 12.8c-12.8 3.2-22.4 9.6-25.6 22.4-3.2 12.8 0 22.4 6.4 32l60.8 60.8-16 89.6c-3.2 12.8 3.2 25.6 12.8 32 9.6 6.4 22.4 6.4 35.2 3.2l73.6-41.6 73.6 41.6c6.4 3.2 9.6 3.2 16 3.2s12.8-3.2 19.2-6.4c9.6-6.4 16-19.2 12.8-32l-12.8-89.6 60.8-60.8c9.6-9.6 12.8-22.4 9.6-32zm-124.8 60.8c-6.4 6.4-9.6 16-9.6 28.8l6.4 38.4-32-16c-6.4-3.2-9.6-3.2-16-3.2s-9.6 0-16 3.2l-32 16 6.4-38.4c3.2-9.6 0-19.2-9.6-28.8l-28.8-28.8 38.4-6.4c9.6 0 19.2-9.6 25.6-19.2l16-32 16 32c3.2 9.6 12.8 16 25.6 19.2l38.4 6.4-28.8 28.8z"/></svg>`;
}
function renderPercentChange(value, comparison = "") {
  const numeric = Number(value);
  const direction = numeric >= 0 ? "up" : "down";
  const amount = Math.abs(numeric).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  const directionLabel = direction === "up" ? "上升" : "下降";
  const accessibleLabel = `${comparison ? `${comparison} ` : ""}${directionLabel} ${amount}%`;
  return `<span class="trend-change ${direction}" aria-label="${accessibleLabel}">${legacyIcon(direction === "up" ? "trendUp" : "trendDown", 16)}<span class="trend-value">${amount}%</span>${comparison ? `<em>${comparison}</em>` : ""}</span>`;
}

function renderLegacyTrendChanges(markup) {
  return markup
    .replace(/<small>(较(?:昨日|上月|上期)\s*)?([+-])(\d+(?:\.\d+)?)%<\/small>/g, (_, comparison = "", sign, amount) => renderPercentChange(sign === "+" ? Number(amount) : -Number(amount), comparison.trim()))
    .replace(/<small class="(?:red|green)">([▲▼])\s*(-?\d+(?:\.\d+)?)%<\/small>/g, (_, arrow, amount) => renderPercentChange(arrow === "▲" ? Math.abs(Number(amount)) : -Math.abs(Number(amount)), "较上期"));
}

function renderTopbar() {
  const tools = [
    ["rule", "规则"], ["bell", "消息"], ["feedback", "反馈"], ["customer", "客服"],
  ];
  return `
    <header class="topbar">
      <div class="backend-brand" data-action="home"><img src="assets/images/xiaozhi-logo.png" alt="小知智能后台 Logo" /><strong>小知智能后台</strong></div>
      <div class="topbar-assistant-entry" id="assistantQuickEntry" data-action="assistant" role="button" tabindex="0" aria-label="打开小知并提问">
        <img src="assets/images/qn-robot-face.png" alt="" aria-hidden="true" />
        <input id="assistantQuickInput" placeholder="问问小知，快速分析数据" autocomplete="off" aria-label="问问小知" />
        <button class="topbar-assistant-search" type="button" aria-label="提交给小知">${legacyIcon("search", 16)}</button>
      </div>
      <nav class="header-tools">
        ${tools.map(([i, label]) => `<div class="tool-item" data-tool="${label}">${label === "消息" ? '<span class="tool-dot"></span>' : ''}${i === "bell" ? legacyIcon("bell") : i === "customer" ? customerSmileIcon() : i === "feedback" ? helpCircleIcon() : icon(i)}<em>${label}</em></div>`).join("")}
      </nav>
      <div class="user-menu" data-action="user-menu">
        <div class="avatar">☀</div><div class="user-copy"><b>观星阁</b><small>XZ202609</small></div><span class="caret">▾</span>
      </div>
    </header>`;
}

function renderPrimaryNav() {
  return `
    <aside class="primary-nav">
      ${primaryNav.map(([key, label, ico]) => key === "divider"
        ? '<div class="nav-divider"></div>'
        : `<button class="nav-item ${state.page === key ? "active" : ""}" data-page="${["home","trade","product","mentor","members","marketing","service","finance"].includes(key) ? key : ""}" data-module="${key}">${key === "mentor" ? mentorNavIcon() : key === "members" ? memberNavIcon() : renderNavIcon(key, state.page === key)}<span>${label}</span></button>`).join("")}
      <div class="nav-footer"><span>关于先知</span>Copyright<br />© Xianzhi Studio</div>
    </aside>`;
}

function renderSecondary() {
  const groups = secondaryMenus[state.page];
  if (!groups) return "";
  const active = state.secondaryActive[state.page];
  return `<aside class="secondary-nav"><div class="secondary-title">${pageNames[state.page]}</div>${groups.map((group) => `
    <div class="secondary-group">
      ${group.title ? `<div class="secondary-group-title">${group.title}</div>` : ""}
      <div class="secondary-links">${group.links.map(link => `<a class="secondary-link ${link === active ? "active" : ""}" data-secondary="${link}">${link}</a>`).join("")}</div>
    </div>`).join("")}</aside>`;
}

function selectField(label, value = "全部", options = ["全部", "待处理", "已完成"]) {
  return `<div class="field select-trigger"><label>${label}</label><b>${value}</b><div class="select-menu">${options.map((o, i) => `<div class="select-option ${i === 0 ? "selected" : ""}" data-value="${o}">${o}</div>`).join("")}</div></div>`;
}

function smoothSvgPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  return points.slice(0, -1).reduce((path, point, index) => {
    const p0 = points[index - 1] || point;
    const p1 = point;
    const p2 = points[index + 1];
    const p3 = points[index + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    return `${path} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }, `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`);
}

function niceAxisMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function formatAxisValue(value, metric) {
  if (!value) return "0";
  if (metric === "sales") return `${Number(value.toFixed(1))}万`;
  return Math.round(value).toLocaleString("zh-CN");
}

function renderTrendChart() {
  const ranges = {
    "7d": { labels: ["09/22", "09/23", "09/24", "09/25", "09/26", "09/27", "今天"], values: [8.2, 10.5, 9.6, 13.4, 12.2, 15.1, 12.86], orders: [210, 350, 270, 410, 560, 510, 620], members: [24, 32, 38, 41, 49, 55, 48], visitors: [520, 610, 580, 720, 810, 880, 940], total: "¥81.86万", average: "日均 ¥11.69万" },
    "30d": { labels: ["09/01", "09/06", "09/11", "09/16", "09/21", "09/26", "今天"], values: [7.1, 9.4, 11.2, 10.6, 14.3, 13.8, 12.86], orders: [180, 290, 390, 340, 540, 520, 590], members: [21, 28, 36, 42, 51, 58, 64], visitors: [460, 580, 620, 710, 840, 810, 920], total: "¥326.40万", average: "日均 ¥10.88万" },
    "1y": { labels: ["10月", "12月", "2月", "4月", "6月", "8月", "9月"], values: [62, 74, 69, 92, 108, 121, 128.6], orders: [1800, 2400, 2200, 3100, 3600, 4200, 4500], members: [140, 180, 210, 270, 310, 390, 440], visitors: [4200, 4800, 5100, 6200, 7300, 8600, 9400], total: "¥1,264.80万", average: "月均 ¥105.40万" },
  };
  const current = ranges[state.trendRange];
  const metricMap = {
    sales: { label: "成交额（元）", values: current.values, totalLabel: "范围成交额", total: current.total, averageLabel: "成交均值", average: current.average },
    orders: { label: "订单数", values: current.orders, totalLabel: "范围订单数", suffix: " 单" },
    members: { label: "新增会员", values: current.members, totalLabel: "范围新增会员", suffix: " 人" },
    visitors: { label: "访客数", values: current.visitors, totalLabel: "范围访客数", suffix: " 人" },
  };
  const activeMetric = metricMap[state.trendMetric] || metricMap.sales;
  const isSales = state.trendMetric === "sales";
  const activeTotal = isSales ? activeMetric.total : `${Math.round(activeMetric.values.reduce((sum, value) => sum + value, 0)).toLocaleString("zh-CN")}${activeMetric.suffix}`;
  const activeAverage = isSales ? activeMetric.average : `${state.trendRange === "1y" ? "月均" : "日均"} ${Math.round(activeMetric.values.reduce((sum, value) => sum + value, 0) / activeMetric.values.length).toLocaleString("zh-CN")}${activeMetric.suffix}`;
  const secondaryValues = state.trendMetric === "orders" ? current.values : current.orders;
  const secondaryMetric = state.trendMetric === "orders" ? "sales" : "orders";
  const width = 760, height = 230;
  const plot = { left: 31, right: 729, top: 22, bottom: 188 };
  const primaryMax = niceAxisMax(Math.max(...activeMetric.values) * 1.06);
  const secondaryMax = niceAxisMax(Math.max(...secondaryValues) * 1.06);
  const stepX = (plot.right - plot.left) / (current.labels.length - 1);
  const points = activeMetric.values.map((value, index) => {
    const x = plot.left + index * stepX;
    const y = plot.bottom - (value / primaryMax) * (plot.bottom - plot.top);
    return [x, y];
  });
  const orderPoints = secondaryValues.map((value, index) => {
    const x = plot.left + index * stepX;
    const y = plot.bottom - (value / secondaryMax) * (plot.bottom - plot.top);
    return [x, y];
  });
  const line = smoothSvgPath(points);
  const orderLine = smoothSvgPath(orderPoints);
  const area = `${line} L ${points.at(-1)[0].toFixed(1)} ${plot.bottom} L ${points[0][0].toFixed(1)} ${plot.bottom} Z`;
  const orderArea = `${orderLine} L ${orderPoints.at(-1)[0].toFixed(1)} ${plot.bottom} L ${orderPoints[0][0].toFixed(1)} ${plot.bottom} Z`;
  const axisRatios = [1, .75, .5, .25, 0];
  return `<div class="trend-summary"><span><small>${activeMetric.totalLabel}</small><b>${activeTotal}</b></span><span><small>${isSales ? activeMetric.averageLabel : "范围均值"}</small><b>${activeAverage}</b></span></div>
    <div class="trend-chart-wrap"><svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="成交趋势图">
      <defs>
        <linearGradient id="trendLinePrimary" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#67a4ff"/><stop offset="1" stop-color="#2e74f0"/></linearGradient>
        <linearGradient id="trendLineSecondary" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#76e5df"/><stop offset="1" stop-color="#20b9c5"/></linearGradient>
        <linearGradient id="trendAreaPrimary" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f86f7" stop-opacity=".24"/><stop offset="1" stop-color="#4f86f7" stop-opacity="0"/></linearGradient>
        <linearGradient id="trendAreaSecondary" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36cbd0" stop-opacity=".16"/><stop offset="1" stop-color="#36cbd0" stop-opacity="0"/></linearGradient>
      </defs>
      <g class="chart-grid">${axisRatios.map(ratio => { const y = plot.top + (1 - ratio) * (plot.bottom - plot.top); return `<line x1="${plot.left}" y1="${y.toFixed(1)}" x2="${plot.right}" y2="${y.toFixed(1)}"/>`; }).join("")}</g>
      <g class="trend-axis trend-axis-left">${axisRatios.map(ratio => { const y = plot.top + (1 - ratio) * (plot.bottom - plot.top); return `<text x="25" y="${(y + 3).toFixed(1)}" text-anchor="end">${formatAxisValue(primaryMax * ratio, state.trendMetric)}</text>`; }).join("")}</g>
      <g class="trend-axis trend-axis-right">${axisRatios.map(ratio => { const y = plot.top + (1 - ratio) * (plot.bottom - plot.top); return `<text x="735" y="${(y + 3).toFixed(1)}" text-anchor="start">${formatAxisValue(secondaryMax * ratio, secondaryMetric)}</text>`; }).join("")}</g>
      <path d="${area}" fill="url(#trendAreaPrimary)"/><path d="${orderArea}" fill="url(#trendAreaSecondary)"/>
      <path d="${line}" class="trend-line"/><path d="${orderLine}" class="trend-line order-line"/>
      ${points.map(([x,y], index) => `<circle cx="${x}" cy="${y}" r="4" class="trend-dot"><title>${current.labels[index]}：${activeMetric.values[index]}</title></circle>`).join("")}
      ${orderPoints.map(([x,y], index) => `<circle cx="${x}" cy="${y}" r="3.5" class="trend-dot order-dot"><title>${current.labels[index]}：${secondaryValues[index]}</title></circle>`).join("")}
      ${points.map(([x], index) => `<text x="${x}" y="220" text-anchor="middle">${current.labels[index]}</text>`).join("")}
      ${points.map(([x,y], index) => {
        const start = index === 0 ? plot.left : x - stepX / 2;
        const end = index === points.length - 1 ? plot.right : x + stepX / 2;
        const sales = `¥${Math.round(current.values[index] * 10000).toLocaleString("zh-CN")}`;
        return `<g class="trend-hover-group"><line class="trend-hover-guide" x1="${x}" y1="${plot.top}" x2="${x}" y2="${plot.bottom}"/><circle class="trend-hover-ring" cx="${x}" cy="${y}" r="6"/><circle class="trend-hover-ring secondary" cx="${x}" cy="${orderPoints[index][1]}" r="5.5"/><rect class="trend-hover-zone" x="${start.toFixed(1)}" y="${plot.top}" width="${(end - start).toFixed(1)}" height="${plot.bottom - plot.top}" tabindex="0" role="button" aria-label="${current.labels[index]}，成交额 ${sales}，订单数 ${current.orders[index]}" data-tooltip-date="${current.labels[index]}" data-tooltip-sales="${sales}" data-tooltip-orders="${current.orders[index].toLocaleString("zh-CN")}" data-tooltip-x="${(x / width * 100).toFixed(2)}"></rect></g>`;
      }).join("")}
    </svg><div class="trend-tooltip" role="status" aria-hidden="true"></div></div>`;
}

function renderHomeAction(label) {
  return `<span>${label}</span><span class="action-chevron" aria-hidden="true">${icon("enter", 19)}</span>`;
}

function buildSparklineValues(value, bars) {
  const text = String(value ?? "");
  const numeric = Number(text.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return bars.map(point => String(point));
  const max = Math.max(...bars, 1);
  return bars.map(point => {
    const scaled = numeric * point / max;
    if (text.includes("¥")) return `¥${Math.round(scaled).toLocaleString("zh-CN")}`;
    if (text.includes("%")) return `${scaled.toFixed(1)}%`;
    return Math.max(1, Math.round(scaled)).toLocaleString("zh-CN");
  });
}

function renderDashboardMetric({ label, value, note = "", trend = "", iconName, iconMarkup = "", asset = "", tone = "blue", bars = [28, 48, 72, 58, 88] }, className = "") {
  const recentBars = bars.slice(-5);
  return DesignSystem.metricCard({
    label,
    value,
    note,
    trend,
    tone,
    icon: iconMarkup || (asset ? `<img class="dashboard-metric-image" src="${asset}" alt="" />` : icon(iconName, 20)),
    sparkline: recentBars,
    sparklineValues: buildSparklineValues(value, recentBars),
    className: `dashboard-metric tone-${tone} ${className}`.trim(),
  });
}

function renderUnifiedKpis(items, className = "") {
  return `<div class="dashboard-kpis unified-kpis ${className}">${items.map(item => renderDashboardMetric({
    ...item,
    trend: item.trend || (item.change !== undefined ? renderPercentChange(item.change, item.comparison || "") : ""),
    tone: "blue",
  }, item.className || "")).join("")}</div>`;
}

function renderMiniLineChart({ labels, primary, secondary = [], primaryLabel, secondaryLabel = "", primaryColor = "#3d7fff", secondaryColor = "#ff8b32", max = null }) {
  const width = 560;
  const height = 176;
  const plot = { left: 40, right: 542, top: 16, bottom: 140 };
  const all = secondary.length ? primary.concat(secondary) : primary;
  const ceiling = max || Math.max(...all) * 1.12;
  const points = values => values.map((value, index) => [
    plot.left + (plot.right - plot.left) * index / Math.max(1, values.length - 1),
    plot.bottom - (plot.bottom - plot.top) * value / ceiling,
  ]);
  const primaryPoints = points(primary);
  const secondaryPoints = secondary.length ? points(secondary) : [];
  const path = pts => pts.map(([x,y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return `<div class="dashboard-chart"><div class="dashboard-chart-legend"><span><i style="--legend:${primaryColor}"></i>${primaryLabel}</span>${secondary.length ? `<span><i style="--legend:${secondaryColor}"></i>${secondaryLabel}</span>` : ""}</div><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${primaryLabel}${secondaryLabel ? `与${secondaryLabel}` : ""}趋势图"><g class="dashboard-chart-grid">${[0,.25,.5,.75,1].map(ratio => `<line x1="${plot.left}" y1="${plot.top + (plot.bottom - plot.top) * ratio}" x2="${plot.right}" y2="${plot.top + (plot.bottom - plot.top) * ratio}"/>`).join("")}</g><path d="${path(primaryPoints)}" fill="none" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${primaryPoints.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${primaryColor}" stroke-width="2"/>`).join("")}${secondary.length ? `<path d="${path(secondaryPoints)}" fill="none" stroke="${secondaryColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${secondaryPoints.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#fff" stroke="${secondaryColor}" stroke-width="2"/>`).join("")}` : ""}<g class="dashboard-chart-labels">${labels.map((label,index) => `<text x="${plot.left + (plot.right - plot.left) * index / Math.max(1, labels.length - 1)}" y="165" text-anchor="middle">${label}</text>`).join("")}</g></svg></div>`;
}

function renderStackedBars(rows) {
  return `<div class="stacked-bars">${rows.map(([label, first, second, third]) => `<div class="stacked-bar"><div class="stacked-bar-track"><i class="bar-primary" style="height:${first}%"></i><i class="bar-warning" style="height:${second}%"></i><i class="bar-soft" style="height:${third}%"></i></div><span>${label}</span></div>`).join("")}</div>`;
}

function renderHome() {
  const kpis = [
    { label: "今日成交额", value: "¥128,640.00", change: 12.8, comparison: "较昨日", asset: "assets/images/kpi-revenue.png", tone: "blue", bars: [28, 46, 68, 90, 62] },
    { label: "付费订单数", value: "326", change: 8.4, comparison: "较昨日", asset: "assets/images/kpi-orders.png", tone: "blue", bars: [24, 50, 73, 94, 66] },
    { label: "新增会员数", value: "48", change: 6.7, comparison: "较昨日", asset: "assets/images/kpi-members.png", tone: "blue", bars: [34, 56, 45, 82, 70] },
    { label: "在线导师数", value: "76", note: "共 93 位认证导师", asset: "assets/images/kpi-mentors.png", tone: "blue", bars: [38, 62, 54, 86, 72] },
  ];
  const diagnostics = [
    { level: "高", title: "退款审核积压", detail: "6 笔退款超过 2 小时未审核", action: "处理退款", page: "trade", tone: "danger", asset: "assets/images/diagnosis-refund.png" },
    { level: "中", title: "导师资料审核效率偏低", detail: "近 24 小时平均审核时长 5.2 小时", action: "查看审核", page: "mentor", tone: "warning", asset: "assets/images/diagnosis-mentor.png" },
    { level: "提示", title: "内容发布时间集中", detail: "68% 的内容集中在 20:00 后发布", action: "查看排期", page: "product", tone: "info", asset: "assets/images/diagnosis-content.png" },
    { level: "中", title: "投诉处理响应偏慢", detail: "3 笔投诉超过 1 小时未响应", action: "查看投诉", page: "service", tone: "warning", asset: "assets/images/diagnosis-complaint.png" },
  ];
  const health = [
    { label: "咨询履约", value: 96, note: "目标 ≥ 95%" },
    { label: "报告生成", value: 92, note: "平均 18 分钟" },
    { label: "内容发布", value: 78, note: "本周 31 / 40" },
    { label: "会员续费", value: 84, change: 3.1, comparison: "较上月" },
  ];
  const todos = [
    { label: "发布商品", icon: "box", page: "product" },
    { label: "新增导师", icon: "users", page: "mentor" },
    { label: "创建活动", icon: "ticket", page: "marketing" },
    { label: "发送通知", icon: "send", page: "marketing" },
    { label: "订单管理", icon: "order", page: "trade" },
    { label: "会员管理", icon: "users", page: "members" },
    { label: "数据报表", icon: "chart", page: "finance" },
    { label: "推广素材", icon: "grid", page: "marketing" },
  ];
  return `<section class="page home-page operation-overview">
    ${DesignSystem.pageHeader({ title: "运营总览", subtitle: "今天是 2026年9月28日　星期一　15:26　｜　数据更新于 15:26", className: "overview-head" })}
    ${renderUnifiedKpis(kpis.map(item => ({ ...item, className: "home-kpi" })), "operation-kpis")}
    <div class="operation-grid">
      <article class="overview-card trend-card"><div class="overview-card-head"><div><h2>成交趋势</h2></div><div class="trend-card-actions"><div class="range-switch"><button class="${state.trendRange === "7d" ? "active" : ""}" data-trend-range="7d">近7天</button><button class="${state.trendRange === "30d" ? "active" : ""}" data-trend-range="30d">近30天</button><button class="${state.trendRange === "1y" ? "active" : ""}" data-trend-range="1y">近一年</button></div><a class="link-action home-link-action" data-action="toast" data-message="趋势明细为演示视图">${renderHomeAction("查看更多")}</a></div></div><div class="trend-toolbar"><div class="trend-metrics">${[["sales","成交额"],["orders","订单数"],["members","新增会员"],["visitors","访客数"]].map(([key,label]) => `<button class="${state.trendMetric === key ? "active" : ""}" data-trend-metric="${key}">${label}</button>`).join("")}</div><div class="trend-legend"><span><i class="legend-dot sales"></i>${(state.trendMetric && state.trendMetric !== "sales") ? ({orders:"订单数",members:"新增会员",visitors:"访客数"}[state.trendMetric]) : "成交额（元）"}</span><span><i class="legend-dot orders"></i>${state.trendMetric === "orders" ? "成交额（元）" : "订单数"}</span></div></div>${renderTrendChart()}</article>
      <article class="overview-card diagnosis-card"><div class="overview-card-head"><div><h2>运营诊断</h2></div><div class="diagnosis-head-actions"><span class="diagnosis-count">4 项待优化</span><a class="link-action home-link-action" data-action="toast" data-message="诊断全部事项为演示视图">${renderHomeAction("查看全部")}</a></div></div><div class="diagnosis-list">${diagnostics.map(item => `<div class="diagnosis-item"><span class="diagnosis-icon diagnosis-blue"><img src="${item.asset}" alt="" /></span><div class="diagnosis-copy"><div><b>${item.title}</b><span class="severity ${item.tone}">${item.level}</span></div><p>${item.detail}</p></div><button class="diagnosis-action" data-page="${item.page}">${renderHomeAction(item.action)}</button></div>`).join("")}</div></article>
    </div>
    <div class="health-todo-layout"><article class="overview-card health-card"><div class="overview-card-head"><div><h2>业务健康指标</h2></div><a class="link-action home-link-action" data-action="toast" data-message="健康指标详情为演示视图">${renderHomeAction("查看详情")}</a></div><div class="health-grid">${health.map(item => `<div class="health-item"><div class="health-label"><b>${item.label}</b></div><div class="health-value-row"><strong>${item.value}%</strong>${item.change !== undefined ? renderPercentChange(item.change) : ""}</div><div class="health-track"><i style="width:${item.value}%"></i></div><small>${item.change !== undefined ? `${item.comparison}提升 ${item.change}%` : item.note}</small></div>`).join("")}</div></article>
    <article class="overview-card todo-section"><div class="overview-card-head"><div><h2>快捷入口</h2></div><a class="link-action home-link-action" data-action="toast" data-message="快捷入口配置为演示视图">${renderHomeAction("管理配置")}</a></div><div class="todo-grid">${todos.map(item => `<button class="todo-entry quick-entry" data-page="${item.page}"><span class="todo-icon">${renderSolidIcon(item.icon,18)}</span><span class="todo-copy"><b>${item.label}</b></span></button>`).join("")}</div></article></div>
  </section>`;
}

function getFilteredTradeOrders() {
  const query = state.tradeQuery.trim().toLowerCase();
  return tradeOrders.filter(order => {
    const sectionMatch = state.secondaryActive.trade === "退款售后" ? order.payment.includes("退款") : state.secondaryActive.trade === "会员支付" ? order.type === "会员支付" : true;
    const statusMatch = state.tradeStatus === "全部订单" || state.tradeStatus === order.payment || state.tradeStatus === order.fulfillment || (state.tradeStatus === "已完成" && order.fulfillment === "已完成") || (state.tradeStatus === "已关闭" && order.fulfillment === "已关闭");
    const typeMatch = state.tradeType === "全部类型" || order.type === state.tradeType;
    const paymentMatch = state.tradePayment === "全部支付" || order.payment === state.tradePayment;
    const fulfillmentMatch = state.tradeFulfillment === "全部履约" || order.fulfillment === state.tradeFulfillment;
    const queryMatch = !query || [order.id, order.user, order.phone, order.product].some(value => value.toLowerCase().includes(query));
    return sectionMatch && statusMatch && typeMatch && paymentMatch && fulfillmentMatch && queryMatch;
  });
}

function tradeStateClass(value) {
  if (["已支付", "已完成"].includes(value)) return "success";
  if (["退款中", "退款处理中", "待发货", "履约中"].includes(value)) return "warning";
  if (["已退款", "已关闭"].includes(value)) return "neutral";
  return "info";
}

function renderTradeOrderRow(order) {
  return `<div class="trade-order-row"><div class="trade-order-id"><b>${order.id}</b><small>${order.time}</small></div><div class="trade-order-user"><b>${order.user}</b><small>${order.phone}</small></div><div><span class="order-type-chip">${order.type}</span></div><div class="trade-product"><b>${order.product}</b><small>${order.note || "暂无备注"}</small></div><div>${order.owner}</div><div class="trade-amount">¥${order.amount.toLocaleString("zh-CN")}</div><div><span class="trade-state ${tradeStateClass(order.payment)}">${order.payment}</span></div><div><span class="trade-state ${tradeStateClass(order.fulfillment)}">${order.fulfillment}</span></div><div class="trade-row-actions"><button data-trade-detail="${order.id}">详情</button><button data-trade-note="${order.id}">备注</button>${order.payment === "退款中" ? `<button class="danger-link" data-refund-order="${order.id}">确认退款</button>` : ""}</div></div>`;
}

function renderTradeDrawer() {
  const order = tradeOrders.find(item => item.id === state.tradeDetailId);
  if (!order) return "";
  return `<div class="member-drawer-backdrop" data-action="close-trade-drawer"></div><aside class="member-drawer trade-detail-drawer"><header class="member-drawer-head"><div><h2>订单详情</h2><p>${order.id}</p></div><button class="close" data-action="close-trade-drawer">×</button></header><div class="trade-detail-body"><div class="trade-detail-summary"><div><span>订单金额</span><b>¥${order.amount.toLocaleString("zh-CN")}</b></div><div><span>支付状态</span><b class="trade-state ${tradeStateClass(order.payment)}">${order.payment}</b></div><div><span>履约状态</span><b class="trade-state ${tradeStateClass(order.fulfillment)}">${order.fulfillment}</b></div></div><dl class="trade-detail-grid"><div><dt>用户</dt><dd>${order.user}</dd></div><div><dt>手机号</dt><dd>${order.phone}</dd></div><div><dt>订单类型</dt><dd>${order.type}</dd></div><div><dt>负责人</dt><dd>${order.owner}</dd></div><div class="full"><dt>商品或服务</dt><dd>${order.product}</dd></div><div class="full"><dt>下单时间</dt><dd>${order.time}</dd></div></dl><div class="trade-note-editor"><h3>订单备注</h3><textarea id="tradeNoteInput" placeholder="添加本地订单备注">${order.note}</textarea><button class="btn primary" data-action="save-trade-note">保存备注</button></div><div class="member-logs"><h3>本地操作记录</h3>${order.logs.map((log,index) => `<div class="member-log"><i></i><div><b>${log.split(" · ")[0]}</b><p>${log.split(" · ").slice(1).join(" · ")}</p></div>${index === 0 ? '<span>最近</span>' : ''}</div>`).join("")}</div></div></aside>`;
}

function renderRefundDialog() {
  const order = tradeOrders.find(item => item.id === state.refundConfirmId);
  if (!order) return "";
  return `<div class="confirm-backdrop" data-action="cancel-refund"></div><div class="confirm-dialog"><span class="confirm-icon">!</span><h3>确认通过退款？</h3><p>订单 ${order.id} 将退款 ¥${order.amount.toLocaleString("zh-CN")}。确认后支付状态变为“已退款”，履约状态变为“已关闭”。</p><div><button class="btn" data-action="cancel-refund">取消</button><button class="btn primary danger-btn" data-action="confirm-refund">确认退款</button></div></div>`;
}

function renderTrade() {
  const orders = getFilteredTradeOrders();
  const tabs = ["全部订单", "待支付", "已支付", "履约中", "退款中", "已完成", "已关闭"];
  const finance = [["今日收入", "¥128,640.00", renderPercentChange(12.8, "较昨日")], ["退款金额", "¥6,840.00", "6 笔处理中"], ["平台服务费", "¥3,216.00", "费率 2.5%"], ["导师待结算", "¥42,680.00", "18 位导师"]];
  const todos = [["退款审核", "6", "2 笔已等待超过 2 小时", "退款售后", "refund"], ["发票对账", "12", "本周待核对与开具", "发票对账", "invoice"], ["导师结算", "18", "预计今日 18:00 结算", "导师结算", "mentor"]];
  const tradeMetrics = [
    { label:"今日成交额", value:"¥128,640.00", change:12.8, comparison:"较昨日", asset:"assets/images/trade-revenue.png", bars:[28,46,68,90,62] },
    { label:"付费订单数", value:"326", note:"支付转化率 18.4%", asset:"assets/images/trade-orders.png", bars:[24,50,73,94,66] },
    { label:"退款处理中", value:"6", note:"2 笔超过 2 小时", asset:"assets/images/trade-refund.png", bars:[72,64,48,42,35] },
    { label:"导师待结算", value:"¥42,680", note:"涉及 18 位导师", asset:"assets/images/trade-settlement.png", bars:[35,48,58,76,68] },
  ];
  return `<section class="page trade-page trade-finance-page"><div class="overview-head"><div><h1>交易财务</h1><p>统一查看订单、支付、履约、退款和结算情况</p></div></div>${renderUnifiedKpis(tradeMetrics,"trade-kpis")}<article class="overview-card trade-order-section"><div class="overview-card-head"><div><h2>${state.secondaryActive.trade}</h2><p>按订单号、用户、手机号、商品或服务名称查询</p></div></div><div class="trade-status-tabs">${tabs.map(tab => `<button class="${state.tradeStatus === tab ? "active" : ""}" data-trade-status="${tab}">${tab}</button>`).join("")}</div><div class="trade-search-panel"><div class="member-query"><span>${icon("search",16)}</span><input id="orderQuery" value="${state.tradeQuery}" placeholder="搜索订单号、用户、手机号、商品或服务名称" /></div><select data-trade-filter="type"><option>全部类型</option>${["会员支付", "导师服务", "报告订单", "商品订单"].map(value => `<option ${state.tradeType === value ? "selected" : ""}>${value}</option>`).join("")}</select><select data-trade-filter="payment"><option>全部支付</option>${["待支付", "已支付", "退款中", "已退款"].map(value => `<option ${state.tradePayment === value ? "selected" : ""}>${value}</option>`).join("")}</select><select data-trade-filter="fulfillment"><option>全部履约</option>${["未开始", "履约中", "待发货", "退款处理中", "已完成", "已关闭"].map(value => `<option ${state.tradeFulfillment === value ? "selected" : ""}>${value}</option>`).join("")}</select><button class="btn primary" data-action="trade-search">搜索</button><button class="btn" data-action="reset-trade-search">重置</button></div><div class="trade-orders-scroll"><div class="trade-orders-head"><span>订单号 / 下单时间</span><span>用户</span><span>订单类型</span><span>商品或服务</span><span>负责人</span><span>金额</span><span>支付状态</span><span>履约状态</span><span>操作</span></div>${orders.length ? orders.map(renderTradeOrderRow).join("") : `<div class="member-empty"><span>${icon("order",28)}</span><b>没有匹配订单</b><p>请调整状态、筛选条件或搜索关键词</p><button class="btn" data-action="reset-trade-search">重置搜索</button></div>`}</div></article><div class="trade-finance-layout"><article class="overview-card"><div class="overview-card-head"><div><h2>今日财务数据</h2><p>数据更新时间 15:26</p></div></div><div class="today-finance-grid">${finance.map(([label,value,note]) => `<div><span>${label}</span><b>${value}</b><small>${note}</small></div>`).join("")}</div></article><article class="overview-card"><div class="overview-card-head"><div><h2>财务待办</h2><p>从待办进入对应处理流程</p></div></div><div class="finance-todo-list">${todos.map(([label,count,note,section,focus]) => `<button class="${state.tradeFinanceFocus === focus ? "active" : ""}" data-trade-todo="${focus}" data-trade-section="${section}"><span>${label}</span><b>${count}</b><small>${note}</small><i>›</i></button>`).join("")}</div></article></div></section>`;
}

function getFilteredInventory() {
  const query = state.productQuery.trim().toLowerCase();
  return inventoryProducts.filter(product => {
    const tabMatch = state.productTab === "全部商品" || state.productTab === product.status;
    const stockMatch = state.stockFilter === "全部库存" || (state.stockFilter === "库存正常" ? product.stock >= 20 : product.stock < 20);
    const categoryMatch = state.productCategory === "全部分类" || state.productCategory === product.category;
    const queryMatch = !query || product.name.toLowerCase().includes(query) || product.id.toLowerCase().includes(query);
    return tabMatch && stockMatch && categoryMatch && queryMatch;
  });
}

function inventoryQualityClass(quality) {
  return quality === "优" ? "success" : quality === "良" ? "info" : "warning";
}

function renderInventoryRow(product) {
  const thumbnail = product.image || "assets/images/product-cover-07.jpg";
  return `<div class="inventory-row ${state.selectedInventory.has(product.id) ? "selected" : ""}"><div><label class="check"><input class="inventory-check" type="checkbox" value="${product.id}" ${state.selectedInventory.has(product.id) ? "checked" : ""} /></label></div><div class="inventory-name"><img class="inventory-thumb" src="${thumbnail}" alt="${product.name}" /><div><b>${product.name}</b><small>${product.id} <button data-copy-product-id="${product.id}">复制</button></small></div></div><div>${product.category}</div><div class="inventory-price">¥${product.price.toLocaleString("zh-CN")}</div><div>${product.sku}</div><div class="inventory-stock ${product.stock < 20 ? "low" : ""}"><b>${product.stock}</b>${product.stock < 20 ? "<small>库存预警</small>" : ""}</div><div>${product.sales30}</div><div><span class="trade-state ${inventoryQualityClass(product.quality)}">${product.quality}</span></div><div><span class="trade-state ${product.status === "在售" ? "success" : "neutral"}">${product.status}</span><small class="inventory-date">${product.published}</small></div><div class="inventory-actions"><button data-edit-product="${product.id}">编辑</button><button data-toggle-product="${product.id}">${product.status === "在售" ? "下架" : "上架"}</button>${product.stock < 20 ? `<button class="danger-link" data-restock-product="${product.id}">补货</button>` : ""}<button data-action="toast" data-message="更多商品操作为演示视图">更多</button></div></div>`;
}

function renderProductDrawer() {
  const product = inventoryProducts.find(item => item.id === state.productDetailId);
  const creating = state.publishProductOpen;
  if (!product && !creating) return "";
  const value = product || { id: `XZ-P-${String(Date.now()).slice(-5)}`, name: "", category: "数字报告", price: 0, sku: 1, stock: 0, status: "下架", description: "", logs: [] };
  return `<div class="member-drawer-backdrop" data-action="close-product-drawer"></div><aside class="member-drawer product-drawer"><header class="member-drawer-head"><div><h2>${creating ? "发布新商品" : "编辑商品"}</h2><p>${value.id}</p></div><button class="close" data-action="close-product-drawer">×</button></header>${!creating ? `<div class="member-drawer-tabs"><button class="${state.productLogTab === "profile" ? "active" : ""}" data-product-drawer-tab="profile">商品资料</button><button class="${state.productLogTab === "logs" ? "active" : ""}" data-product-drawer-tab="logs">本地操作记录</button></div>` : ""}${state.productLogTab === "logs" && product ? `<div class="member-logs">${product.logs.map((log,index) => `<div class="member-log"><i></i><div><b>${log.split(" · ")[0]}</b><p>${log.split(" · ").slice(1).join(" · ")}</p></div>${index === 0 ? '<span>最近</span>' : ''}</div>`).join("")}</div>` : `<form class="product-edit-form" id="productEditForm"><label class="full"><span>商品名称</span><input name="name" value="${value.name}" placeholder="请输入商品名称" /></label><label><span>商品分类</span><select name="category">${["数字报告", "导师服务", "实体商品", "会员权益"].map(option => `<option ${value.category === option ? "selected" : ""}>${option}</option>`).join("")}</select></label><label><span>销售状态</span><select name="status"><option ${value.status === "在售" ? "selected" : ""}>在售</option><option ${value.status === "下架" ? "selected" : ""}>下架</option></select></label><label><span>价格</span><input name="price" type="number" min="0" value="${value.price}" /></label><label><span>SKU 数量</span><input name="sku" type="number" min="1" value="${value.sku}" /></label><label><span>可用库存</span><input name="stock" type="number" min="0" value="${value.stock}" /></label><label><span>质量状态</span><select name="quality"><option ${value.quality === "优" ? "selected" : ""}>优</option><option ${value.quality === "良" ? "selected" : ""}>良</option><option ${value.quality === "待优化" ? "selected" : ""}>待优化</option></select></label><label class="full"><span>商品描述</span><textarea name="description" placeholder="补充商品卖点与服务说明">${value.description}</textarea></label><div class="member-form-actions full"><button type="button" class="btn" data-action="close-product-drawer">取消</button><button type="button" class="btn primary" data-action="save-product">${creating ? "发布商品" : "保存修改"}</button></div></form>`}</aside>`;
}

function renderRestockDialog() {
  const product = inventoryProducts.find(item => item.id === state.restockId);
  if (!product) return "";
  return `<div class="confirm-backdrop" data-action="cancel-restock"></div><div class="confirm-dialog"><span class="confirm-icon stock-icon">+</span><h3>为“${product.name}”补货</h3><p>当前可用库存 ${product.stock}，请输入本次增加的库存数量。</p><input class="restock-input" id="restockAmount" type="number" min="1" value="50" /><div><button class="btn" data-action="cancel-restock">取消</button><button class="btn primary" data-action="confirm-restock">确认补货</button></div></div>`;
}

function renderProduct() {
  const products = getFilteredInventory();
  const warningProducts = inventoryProducts.filter(product => product.stock < 20);
  const selectedVisible = products.filter(product => state.selectedInventory.has(product.id)).length;
  const categoryRanks = [["数字报告", 42, "26.9%"], ["合盘分析", 28, "17.9%"], ["个人咨询", 24, "15.4%"], ["实体商品", 18, "11.5%"], ["年度报告", 16, "10.3%"]];
  const headerActions = DesignSystem.button({ label: "发布新商品", variant: "primary", icon: icon("box", 16), attributes: { "data-action": "publish-product" } });
  const metrics = [
    { label: "商品总数", value: "156", trend: renderPercentChange(12.6, "较上周"), asset: "assets/images/product-metric-total.png", tone: "blue", bars: [28,48,68,58,88] },
    { label: "在售数量", value: "128", trend: renderPercentChange(8.4, "较上周"), asset: "assets/images/product-metric-active.png", tone: "green", bars: [24,48,76,88,62,80] },
    { label: "库存预警", value: "8", trend: renderPercentChange(-20, "较上周"), asset: "assets/images/product-metric-warning.png", tone: "orange", bars: [76,58,42,28,18] },
    { label: "待发货数量", value: "14", trend: renderPercentChange(-27.3, "较上周"), asset: "assets/images/product-metric-shipment.png", tone: "violet", bars: [20,42,80,68,54,40] },
  ];
  const healthBody = `${DesignSystem.sectionTitle({ title: "库存健康分布" })}<div class="inventory-health"><div class="dashboard-donut inventory-donut"><div><strong>156</strong><span>商品总数</span></div></div><div class="dashboard-legend">${[["库存充足",128,"82.1%","blue"],["库存预警",8,"5.1%","orange"],["库存不足",12,"7.7%","red"],["无库存",8,"5.1%","gray"]].map(([label,value,percent,tone]) => `<div><span><i class="${tone}"></i>${label}</span><b>${value}</b><em>${percent}</em></div>`).join("")}</div></div>`;
  const trendBody = `${DesignSystem.sectionTitle({ title: "近7天商品数据趋势" })}${renderMiniLineChart({ labels:["09/22","09/23","09/24","09/25","09/26","09/27","09/28"], primary:[1300,2000,2400,2050,3500,5000,4100], secondary:[520,980,960,1280,1320,1980,1880], primaryLabel:"浏览量", secondaryLabel:"成交量", max:6000 })}`;
  const rankBody = `${DesignSystem.sectionTitle({ title: "热销品类 TOP5", actions: `<button class="link-action home-link-action product-rank-more" data-action="toast" data-message="已展示全部商品类目">${renderHomeAction("查看更多")}</button>` })}<div class="ranking-list">${categoryRanks.map(([label,value,percent],index) => `<div><span class="rank-number rank-${index+1}">${index+1}</span><b>${label}</b><i><em style="width:${value/42*100}%"></em></i><strong>${value}</strong><small>${percent}</small></div>`).join("")}</div>`;
  const listHeader = DesignSystem.sectionTitle({ title: state.secondaryActive.product, description: "商品基础资料、库存状态、物流与售后统一管理" });
  return `<section class="page product-page inventory-page reference-dashboard-page">
    ${DesignSystem.pageHeader({ title: "商品库存", subtitle: "管理商品资料、上下架状态、库存、物流与售后", actions: headerActions, className: "overview-head" })}
    ${renderUnifiedKpis(metrics, "inventory-kpis")}
    <div class="product-insights-grid">${DesignSystem.card({ className:"dashboard-panel", body:healthBody })}${DesignSystem.card({ className:"dashboard-panel product-trend-panel", body:trendBody })}${DesignSystem.card({ className:"dashboard-panel", body:rankBody })}</div>
    ${DesignSystem.card({ className:"inventory-list-card dashboard-table-card", body:`${listHeader}<div class="inventory-tabs">${["全部商品", "在售", "下架"].map(tab => `<button class="${state.productTab === tab ? "active" : ""}" data-inventory-tab="${tab}">${tab}</button>`).join("")}</div><div class="inventory-search"><div class="member-query"><span>${icon("search",16)}</span><input id="productQuery" value="${state.productQuery}" placeholder="搜索商品名称或商品ID" /></div><select data-stock-filter><option ${state.stockFilter === "全部库存" ? "selected" : ""}>全部库存</option><option ${state.stockFilter === "库存正常" ? "selected" : ""}>库存正常</option><option ${state.stockFilter === "库存预警" ? "selected" : ""}>库存预警</option></select><select data-product-category>${["全部分类","数字报告","导师服务","实体商品","会员权益"].map(category=>`<option ${state.productCategory===category?"selected":""}>${category}</option>`).join("")}</select><button class="btn primary" data-action="product-search">搜索</button><button class="btn" data-action="reset-inventory-search">重置</button></div><div class="inventory-batch-bar ${state.selectedInventory.size ? "active" : ""}"><label class="check"><input type="checkbox" data-select-all="inventory" ${products.length && selectedVisible === products.length ? "checked" : ""} /></label><b>已选 ${state.selectedInventory.size} 件</b><button class="btn small" data-inventory-bulk="status" ${state.selectedInventory.size ? "" : "disabled"}>批量上下架 ▾</button><button class="btn small" data-inventory-bulk="stock" ${state.selectedInventory.size ? "" : "disabled"}>批量调整库存 ▾</button><button class="btn small" data-inventory-bulk="decorate" ${state.selectedInventory.size ? "" : "disabled"}>商品装修</button><button class="btn small inventory-export" data-action="export-products">导出数据</button><button class="text-btn" data-action="clear-inventory-selection" ${state.selectedInventory.size ? "" : "disabled"}>取消选择</button></div><div class="inventory-table-scroll"><div class="inventory-table-head"><span></span><span>商品名称 / ID</span><span>分类</span><span>价格</span><span>SKU数量</span><span>可用库存</span><span>30日销量</span><span>质量状态</span><span>发布时间 / 状态</span><span>操作</span></div>${products.length ? products.map(renderInventoryRow).join("") : `<div class="member-empty"><span>${icon("box",28)}</span><b>没有匹配商品</b><p>请调整搜索或库存筛选条件</p><button class="btn" data-action="reset-inventory-search">重置筛选</button></div>`}</div><div class="inventory-pagination"><span>共 156 条记录 · 第 ${state.productPage} / 16 页</span><div><button data-product-page="${Math.max(1,state.productPage-1)}" ${state.productPage===1?"disabled":""}>‹</button>${[1,2,3].map(page=>`<button class="${state.productPage===page?"active":""}" data-product-page="${page}">${page}</button>`).join("")}<button class="${state.productPage===16?"active":""}" data-product-page="16">… 16</button><button data-product-page="${Math.min(16,state.productPage+1)}" ${state.productPage===16?"disabled":""}>›</button></div></div>` })}
  </section>`;
}

function renderService() {
  const pending = [["0", "待分配任务"], ["0", "处理中任务"], ["0", "待售后"], ["0", "待处理投诉"], ["0", "违规"]];
  const metrics = [["消息拒收点击率", "0%", "已达标"], ["旺旺满意度", "-", ""], ["3分钟人工响应率", "100%", "体验分"], ["真实体验分", "-", "体验分"], ["客服销售额", "-", "开通数据服务"], ["客服销售占比", "-", "开通数据服务"], ["接待人数", "-", "开通数据服务"], ["询单转化率", "-", "开通数据服务"], ["旺旺人工平均时长", "-", "体验分"], ["平台求助率", "-", "体验分"]];
  const tools = ["欢迎语", "聊天记录", "互动服务窗", "快捷短语", "离线消息", "工单中心", "服务小组", "AI机器人"];
  const serviceKpis = [
    { label:"待分配任务", value:"0", note:"当前无待分配任务", iconName:"order", bars:[18,24,20,16,12] },
    { label:"3分钟人工响应率", value:"100%", note:"已达标", iconName:"service", bars:[72,82,88,94,100] },
    { label:"待处理投诉", value:"0", note:"当前无待处理投诉", iconName:"feedback", bars:[24,18,16,12,8] },
    { label:"询单转化率", value:"--", note:"待开通数据服务", iconName:"chart", bars:[20,32,28,42,38] },
  ];
  return `<section class="page service-page reference-dashboard-page">
    ${DesignSystem.pageHeader({ title:"客服服务", subtitle:"统一查看客服任务、响应效率、服务质量与团队表现", className:"overview-head" })}
    ${renderUnifiedKpis(serviceKpis,"service-kpis")}
    <div class="tabs product-tabs service-tabs"><button class="tab active" data-service-tab="服务数据">服务数据</button><button class="tab" data-service-tab="服务质量明细">服务质量明细</button><button class="tab" data-service-tab="团队评级数据">团队评级数据</button></div>
    <div class="service-layout"><div>
      <div class="info-strip">ⓘ 双11优+服务标准及新增免费工具详解 <a class="link-action">点此学习</a></div>
      <h2 class="section-title">客服待办任务</h2><div class="task-overview">${pending.map(([v,l]) => `<div class="task-item"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      <h2 class="section-title"><span id="serviceDataTitle">服务数据</span></h2><div class="muted" style="margin:-8px 0 18px">昨日数据&nbsp; 2026-09-27 数据 <a class="link-action" style="float:right">⊞ 指标 ›</a></div><div class="service-metrics">${metrics.map(([l,v,a]) => `<div class="metric-card"><label>${l} ⓘ</label><strong>${v}</strong>${a ? `<a>${a}</a>` : ""}</div>`).join("")}</div>
    </div><aside class="right-panel"><h3>月度考核结果 <small class="muted">每月1日更新</small></h3><div class="assessment card"><b>8月基础考核 ⓘ</b><p>消息拒收点击率&nbsp;&nbsp; 不考核 ›</p></div><div class="assessment card"><b>8月团队考核 ⓘ</b><p>◉ 普通客服团队<br /><small>提升评级以获得客服金标</small></p></div><h3 style="margin-top:32px">常用接待工具 <small class="muted" style="float:right">⚙ 自定义</small></h3><div class="tool-grid">${tools.map((t,i) => `<div class="service-tool" data-action="toast" data-message="${t}为静态演示"><div class="round">${["Hi","Q","↔","…","✕","◇","Q","⚙"][i]}</div><span>${t}</span></div>`).join("")}</div></aside></div>
  </section>`;
}

function campaignStateClass(status) {
  return status === "进行中" ? "success" : status === "待开始" ? "info" : "neutral";
}

function renderCampaignDrawer() {
  const campaign = marketingCampaigns.find(item => item.id === state.campaignDetailId);
  const creating = state.campaignCreateOpen;
  if (!campaign && !creating) return "";
  const value = campaign || { id: `MK-${String(Date.now()).slice(-8)}`, name: "", subtitle: "", start: "2026-09-28", end: "2026-10-15", channels: ["小程序"], type: "促活", status: "待开始", participants: 0, conversion: "--", logs: [] };
  const editing = state.campaignEditMode || creating;
  return `<div class="member-drawer-backdrop" data-action="close-campaign-drawer"></div><aside class="member-drawer campaign-drawer"><header class="member-drawer-head"><div><h2>${creating ? "创建活动" : "活动详情"}</h2><p>${value.id}</p></div><button class="close" data-action="close-campaign-drawer">×</button></header><div class="campaign-drawer-body">${editing ? `<form class="campaign-edit-form" id="campaignEditForm"><label class="full"><span>活动名称</span><input name="name" value="${value.name}" placeholder="输入活动名称" /></label><label class="full"><span>副标题</span><input name="subtitle" value="${value.subtitle}" placeholder="一句话说明活动利益点" /></label><label><span>开始时间</span><input name="start" type="date" value="${value.start}" /></label><label><span>结束时间</span><input name="end" type="date" value="${value.end}" /></label><label><span>活动类型</span><select name="type">${["拉新","促活","续费","召回","会员续费"].map(option => `<option ${value.type === option ? "selected" : ""}>${option}</option>`).join("")}</select></label><label><span>活动状态</span><select name="status"><option ${value.status === "待开始" ? "selected" : ""}>待开始</option><option ${value.status === "进行中" ? "selected" : ""}>进行中</option><option ${value.status === "已结束" ? "selected" : ""}>已结束</option></select></label><label class="full"><span>投放渠道</span><input name="channels" value="${value.channels.join("、")}" placeholder="使用顿号分隔" /></label><div class="member-form-actions full"><button type="button" class="btn" data-action="close-campaign-drawer">取消</button><button type="button" class="btn primary" data-action="save-campaign">${creating ? "创建活动" : "保存修改"}</button></div></form>` : `<div class="campaign-detail-hero"><span class="trade-state ${campaignStateClass(value.status)}">${value.status}</span><h2>${value.name}</h2><p>${value.subtitle}</p><button class="btn small" data-action="edit-campaign">编辑活动</button></div><dl class="trade-detail-grid"><div><dt>活动时间</dt><dd>${value.start} ~ ${value.end}</dd></div><div><dt>活动类型</dt><dd>${value.type}</dd></div><div><dt>参与人数</dt><dd>${value.participants.toLocaleString("zh-CN")}</dd></div><div><dt>转化率</dt><dd>${value.conversion}</dd></div><div class="full"><dt>投放渠道</dt><dd>${value.channels.join("、")}</dd></div></dl><div class="member-logs"><h3>本地操作记录</h3>${value.logs.map((log,index) => `<div class="member-log"><i></i><div><b>${log.split(" · ")[0]}</b><p>${log.split(" · ").slice(1).join(" · ")}</p></div>${index===0?'<span>最近</span>':''}</div>`).join("")}</div>`}</div></aside>`;
}

function renderTouchPlanDialog() {
  if (!state.touchPlanOpen) return "";
  return `<div class="confirm-backdrop" data-action="close-touch-plan"></div><div class="touch-plan-dialog"><header><div><h3>新建触达计划</h3><p>创建后写入本地操作日志</p></div><button class="close" data-action="close-touch-plan">×</button></header><form id="touchPlanForm"><label><span>计划名称</span><input name="name" value="${state.touchPlanType}运营计划" /></label><label><span>目标人群</span><select name="audience"><option>新增会员</option><option>活跃会员</option><option>沉默会员</option><option>即将到期会员</option><option>高净值会员</option></select></label><label><span>触达渠道</span><select name="channel"><option ${state.touchPlanType.includes("Push") ? "selected" : ""}>Push推送</option><option>系统消息</option><option>短信</option><option>微信</option></select></label><label><span>计划时间</span><input name="time" type="datetime-local" value="2026-09-29T10:00" /></label><label class="full"><span>触达内容</span><textarea name="content">您好，先知命局为您准备了专属会员权益，点击查看详情。</textarea></label><div class="member-form-actions full"><button type="button" class="btn" data-action="close-touch-plan">取消</button><button type="button" class="btn primary" data-action="save-touch-plan">保存计划</button></div></form></div>`;
}

function renderMarketing() {
  const marketingQuery = state.marketingQuery.trim().toLowerCase();
  const visibleCampaigns = marketingCampaigns.filter(campaign => (state.marketingStatus === "全部状态" || campaign.status === state.marketingStatus) && (!marketingQuery || campaign.name.toLowerCase().includes(marketingQuery)));
  const metrics = [
    { label:"进行中活动", value:"3", note:"覆盖 2,084 人", asset:"assets/images/marketing-active.png", tone:"blue", bars:[26,52,44,72,92] },
    { label:"待开始活动", value:"1", note:"最近 9月30日", asset:"assets/images/marketing-pending.png", tone:"blue", bars:[20,60,84,62,90] },
    { label:"本月新增会员", value:"428", trend:renderPercentChange(16.2,"较上月"), asset:"assets/images/marketing-members.png", tone:"blue", bars:[24,42,58,78,70,96,75] },
    { label:"活动转化率", value:"21.7%", trend:renderPercentChange(2.8,"较上月"), asset:"assets/images/marketing-conversion.png", tone:"blue", bars:[25,42,50,72,62,82,94] },
  ];
  const touch = [["今日发送量", "18,620", renderPercentChange(-12.5,"较昨日")], ["打开率", "42.8%", renderPercentChange(3.6,"较昨日")], ["点击率", "16.4%", renderPercentChange(2.1,"较昨日")], ["今日发送计划", "5", "3 个进行中"]];
  const tools = ["发放优惠券", "限时折扣", "组合优惠", "邀请裂变", "签到", "储值", "Push推送", "系统消息", "Banner管理", "转化分析", "人群分析"];
  const audiences = [["新注册用户", "3,286", "25.4%", "blue"], ["高活跃用户", "4,120", "31.9%", "violet"], ["沉默用户", "2,584", "20.0%", "green"], ["沉睡用户", "1,860", "14.4%", "orange"], ["付费会员", "14.4%", "", "purple"], ["流失风险", "8.4%", "", "red"]];
  const headerActions = DesignSystem.button({ label:"创建活动", variant:"primary", icon:icon("ticket",16), attributes:{ "data-action":"create-campaign" } });
  const campaignActions = `<select class="dashboard-select" aria-label="活动状态" data-marketing-status>${["全部状态","进行中","待开始"].map(status=>`<option ${state.marketingStatus===status?"selected":""}>${status}</option>`).join("")}</select><label class="campaign-search">${icon("search",15)}<input id="marketingQuery" value="${state.marketingQuery}" placeholder="搜索活动名称" /></label><button class="ds-button ds-button--outline" data-action="marketing-search">筛选</button>`;
  const campaignBody = `${DesignSystem.sectionTitle({ title:"活动列表", description:"查看参与、转化与渠道投放表现", actions:campaignActions })}<div class="campaign-table-scroll"><div class="campaign-table-head"><span>活动名称</span><span>活动时间</span><span>参与人数</span><span>转化率</span><span>投放渠道</span><span>状态</span><span>操作</span></div>${visibleCampaigns.map((campaign,index) => `<div class="campaign-row"><div class="campaign-name"><span class="campaign-glyph tone-${["red","orange","blue","violet"][index%4]}">${icon(["ticket","crown","send","agreement"][index%4],18)}</span><div><b>${campaign.name}</b><small>${campaign.subtitle}</small></div></div><div>${campaign.start}<br/>至 ${campaign.end}</div><div>${campaign.participants.toLocaleString("zh-CN")}</div><div>${campaign.conversion}</div><div class="campaign-channels">${campaign.channels.map(channel => `<span>${channel}</span>`).join("")}</div><div>${DesignSystem.badge({ label:campaign.status, tone:campaign.status === "进行中" ? "success" : "info" })}</div><div class="campaign-actions"><button data-campaign-detail="${campaign.id}">查看详情</button><button data-campaign-edit="${campaign.id}">编辑</button></div></div>`).join("") || `<div class="member-empty"><span>${icon("ticket",28)}</span><b>没有匹配活动</b><p>请调整活动状态筛选</p></div>`}</div>`;
  const touchBody = `${DesignSystem.sectionTitle({ title:"今日触达", description:"消息与推送计划执行情况", actions:DesignSystem.button({ label:"新建计划", variant:"primary", size:"sm", attributes:{ "data-action":"new-touch-plan" } }) })}<div class="touch-metrics reference-touch-metrics">${touch.map(([label,value,note],index) => `<div><span class="touch-icon tone-${["blue","violet","blue","blue"][index]}">${icon(["send","message","creative","activity"][index],18)}</span><span>${label}</span><b>${value}</b><small>${note}</small></div>`).join("")}</div>`;
  const audienceBody = `${DesignSystem.sectionTitle({ title:"人群包统计", description:"针对不同人群开展运营", actions:`<a class="link-action home-link-action" data-action="new-touch-plan">${renderHomeAction("查看更多")}</a>` })}<div class="audience-overview"><div class="dashboard-donut audience-donut"><div><strong>12,930</strong><span>总人数</span></div></div><div class="audience-summary">${audiences.map(([label,value,percent,tone]) => `<div><span><i class="${tone}"></i>${label}</span><b>${value}</b>${percent ? `<em>${percent}</em>` : ""}</div>`).join("")}</div></div>`;
  return `<section class="page marketing-page reference-dashboard-page">
    ${DesignSystem.pageHeader({ title:"营销触达", subtitle:"创建营销活动，安排会员消息和推送计划，提升用户活跃与转化", actions:headerActions, className:"overview-head" })}
    ${renderUnifiedKpis(metrics, "marketing-kpis")}
    ${DesignSystem.card({ className:"campaign-card dashboard-table-card", body:campaignBody })}
    <div class="marketing-analytics-grid">${DesignSystem.card({ className:"dashboard-panel touch-panel", body:touchBody })}${DesignSystem.card({ className:"dashboard-panel audience-panel", body:audienceBody })}</div>
    ${DesignSystem.card({ className:"marketing-tools-card dashboard-panel", body:`${DesignSystem.sectionTitle({ title:"营销工具", description:"选择工具快速创建对应运营计划" })}<div class="marketing-tools">${tools.map((tool,index) => `<button data-marketing-tool="${tool}"><span>${tool === "邀请裂变" ? inviteGroupIcon(20) : icon(["ticket","ticket","box","users","agreement","wallet","send","bell","grid","chart","users"][index],20)}</span><b>${tool}</b><small>${index < 6 ? "活动与权益" : index < 9 ? "消息与展示" : "数据分析"}</small></button>`).join("")}</div>` })}
  </section>`;
}

function getFilteredMembers() {
  const query = state.memberQuery.trim().toLowerCase();
  return memberUsers.filter(user => {
    const levelMatch = state.memberLevel === "全部等级" || user.level === state.memberLevel;
    const statusMatch = state.memberStatus === "全部状态" || user.status === state.memberStatus;
    const queryMatch = !query || [user.name, user.phone, user.id].some(value => value.toLowerCase().includes(query));
    const silentMatch = !state.hideSilent || user.status !== "沉默";
    return levelMatch && statusMatch && queryMatch && silentMatch;
  });
}

function memberStatusClass(status) {
  return status === "活跃" ? "active" : status === "沉默" ? "silent" : "pending";
}

function renderMemberDrawer() {
  const user = memberUsers.find(item => item.id === state.memberDetailId);
  if (!user) return "";
  const editing = state.memberEditMode;
  return `<div class="member-drawer-backdrop" data-action="close-member-drawer"></div><aside class="member-drawer"><header class="member-drawer-head"><div class="member-profile"><span class="member-avatar large" style="--avatar:${user.color}">${user.name.slice(0,1)}</span><div><h2>${user.name}</h2><p>${user.id} <button class="copy-id" data-copy-member-id="${user.id}" title="复制用户编号">${icon("agreement",13)} 复制</button></p></div></div><button class="close" data-action="close-member-drawer">×</button></header>
    <div class="member-drawer-tabs"><button class="${state.memberDrawerTab === "profile" ? "active" : ""}" data-member-drawer-tab="profile">用户档案</button><button class="${state.memberDrawerTab === "logs" ? "active" : ""}" data-member-drawer-tab="logs">本地操作记录</button></div>
    ${state.memberDrawerTab === "logs" ? `<div class="member-logs">${user.logs.map((log,index) => `<div class="member-log"><i></i><div><b>${log.split(" · ")[0]}</b><p>${log.split(" · ").slice(1).join(" · ")}</p></div>${index === 0 ? '<span>最近</span>' : ''}</div>`).join("")}</div>` : `
      <div class="member-drawer-body"><div class="member-status-line"><span class="member-level ${user.level}">${user.level}</span><span class="user-status ${memberStatusClass(user.status)}">${user.status}</span><span class="source-chip">来源：${user.source}</span><button class="btn small" data-action="toggle-member-edit">${editing ? "取消编辑" : "编辑档案"}</button></div>
      ${editing ? `<form class="member-edit-form" id="memberEditForm"><label><span>用户姓名</span><input name="name" value="${user.name}" /></label><label><span>会员等级</span><select name="level"><option ${user.level === "星曜会员" ? "selected" : ""}>星曜会员</option><option ${user.level === "银曜会员" ? "selected" : ""}>银曜会员</option><option ${user.level === "金曜会员" ? "selected" : ""}>金曜会员</option><option ${user.level === "黑金会员" ? "selected" : ""}>黑金会员</option></select></label><label><span>手机号</span><input name="phone" value="${user.phone}" /></label><label><span>微信</span><input name="wechat" value="${user.wechat}" /></label><label><span>生日</span><input name="birthday" type="date" value="${user.birthday}" /></label><label><span>用户状态</span><select name="status"><option ${user.status === "活跃" ? "selected" : ""}>活跃</option><option ${user.status === "沉默" ? "selected" : ""}>沉默</option><option ${user.status === "待激活" ? "selected" : ""}>待激活</option></select></label><label class="full"><span>用户标签</span><input name="tags" value="${user.tags.join("、")}" placeholder="使用顿号分隔" /></label><div class="member-form-actions full"><button type="button" class="btn" data-action="toggle-member-edit">取消</button><button type="button" class="btn primary" data-action="save-member">保存修改</button></div></form>` : `<dl class="member-info-grid"><div><dt>手机号</dt><dd>${user.phone}</dd></div><div><dt>微信</dt><dd>${user.wechat}</dd></div><div><dt>生日</dt><dd>${user.birthday}</dd></div><div><dt>累计消费</dt><dd>¥${user.spend.toLocaleString("zh-CN")}</dd></div><div><dt>最近活跃</dt><dd>${user.lastActive}</dd></div><div><dt>注册来源</dt><dd>${user.source}</dd></div></dl><div class="member-tag-section"><h3>用户标签</h3><div>${user.tags.map(tag => `<span>${tag}</span>`).join("")}</div></div>`}
      <div class="contact-section"><div><h3>联系用户</h3><p>选择本次触达渠道，仅记录为本地演示任务</p></div><div class="contact-channels"><button class="${state.contactChannel === "site" ? "active" : ""}" data-contact-channel="site">${icon("bell",15)} 站内消息</button><button class="${state.contactChannel === "sms" ? "active" : ""}" data-contact-channel="sms">${icon("feedback",15)} 短信</button><button class="${state.contactChannel === "wechat" ? "active" : ""}" data-contact-channel="wechat">${icon("users",15)} 微信</button></div><textarea id="contactMessage" placeholder="输入联系内容">您好，您的会员权益已更新，请及时查看。</textarea><button class="btn primary contact-submit" data-action="create-contact-task">创建联系任务</button></div></div>`}
  </aside>`;
}

function renderMembers() {
  const filtered = getFilteredMembers();
  const levels = ["全部等级", "星曜会员", "银曜会员", "金曜会员", "黑金会员"];
  const statuses = ["全部状态", "活跃", "沉默", "待激活"];
  const selectedVisible = filtered.filter(user => state.selectedMembers.has(user.id)).length;
  const kpis = [
    { label: "会员总数", value: "12,930", change:16.8, comparison:"较上月", asset:"assets/images/member-total.png", bars:[30,50,70,88,62,92] },
    { label: "高活跃会员", value: "4,120", note:"31.9%", asset:"assets/images/member-active.png", bars:[24,42,58,76,88,70] },
    { label: "付费会员", value: "1,860", note:"14.4%", asset:"assets/images/member-paid.png", className:"member-kpi-paid", bars:[18,34,52,68,82,64] },
    { label: "沉默会员", value: "2,584", note:"20.0% · 需召回", asset:"assets/images/member-silent.png", className:"member-kpi-silent", bars:[68,62,54,48,40,32] },
  ];
  const levelData = [
    ["星曜会员", "6,238", "48.2%", "#3d7fff"],
    ["银曜会员", "3,428", "26.5%", "#8b72ef"],
    ["金曜会员", "2,098", "16.2%", "#ffad4f"],
    ["黑金会员", "1,166", "9.1%", "#48556b"],
  ];
  const trendValues = [
    ["09/22", 58, 18, 12], ["09/23", 72, 21, 14], ["09/24", 60, 18, 12],
    ["09/25", 88, 28, 18], ["09/26", 80, 25, 16], ["09/27", 96, 29, 18], ["今天", 106, 32, 20],
  ];
  const retentionSvg = `<svg class="member-retention-svg" viewBox="0 0 520 190" role="img" aria-label="会员留存率趋势图"><defs><filter id="roughCurve" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.024" numOctaves="1" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g class="member-chart-grid">${[24, 61, 98, 135].map(y => `<line x1="40" y1="${y}" x2="500" y2="${y}"/>`).join("")}</g><g class="member-chart-axis"><text x="31" y="28" text-anchor="end">100%</text><text x="31" y="65" text-anchor="end">75%</text><text x="31" y="102" text-anchor="end">50%</text><text x="31" y="139" text-anchor="end">25%</text><text x="31" y="176" text-anchor="end">0%</text></g><path class="retention-line paid" filter="url(#roughCurve)" d="M40 46 C84 56 96 73 127 77 S183 91 219 91 S286 98 321 99 S393 99 429 98 S468 96 500 95"/><path class="retention-line new" filter="url(#roughCurve)" d="M40 66 C72 80 99 91 127 108 S183 119 219 127 S280 130 321 130 S390 131 429 132 S470 128 500 126"/><g class="retention-dots paid"><circle cx="40" cy="46" r="4"/><circle cx="127" cy="77" r="4"/><circle cx="219" cy="91" r="4"/><circle cx="321" cy="99" r="4"/><circle cx="429" cy="98" r="4"/><circle cx="500" cy="95" r="4"/></g><g class="retention-dots new"><circle cx="40" cy="66" r="4"/><circle cx="127" cy="108" r="4"/><circle cx="219" cy="127" r="4"/><circle cx="321" cy="130" r="4"/><circle cx="429" cy="132" r="4"/><circle cx="500" cy="126" r="4"/></g><g class="member-chart-labels"><text x="40" y="185" text-anchor="middle">第1天</text><text x="127" y="185" text-anchor="middle">第7天</text><text x="219" y="185" text-anchor="middle">第14天</text><text x="321" y="185" text-anchor="middle">第21天</text><text x="429" y="185" text-anchor="middle">第30天</text></g></svg>`;
  const headerActions = DesignSystem.button({ label:"导出用户 CSV", variant:"primary", icon:icon("download",16), attributes:{ "data-action":"export-members" } });
  return `<section class="page members-page"><div class="overview-head"><div><h1>用户会员</h1><p>查询会员资料、消费情况，维护等级、状态和运营标签</p></div>${headerActions}</div>
    ${renderUnifiedKpis(kpis,"member-kpis")}
    <div class="member-analytics-grid">
      ${DesignSystem.card({ className: "member-analytics-card member-level-card", body: `<div class="overview-card-head member-chart-head"><div><h2>会员等级分布 <span class="chart-info">i</span></h2></div><a class="link-action home-link-action chart-action" data-action="toast" data-message="会员等级详情为演示视图">${renderHomeAction("查看详情")}</a></div><div class="member-level-chart"><div class="member-donut"><div><strong>12,930</strong><span>会员总数</span></div></div><div class="member-level-legend">${levelData.map(([label,value,percent,color]) => `<div><span><i style="--dot:${color}"></i>${label}</span><b>${value}</b><em>${percent}</em></div>`).join("")}</div></div>` })}
      ${DesignSystem.card({ className: "member-analytics-card member-trend-card", body: `<div class="overview-card-head member-chart-head"><div><h2>会员活跃趋势</h2></div><div class="member-chart-tools"><span><i class="legend-dot active"></i>活跃</span><span><i class="legend-dot silent"></i>沉默</span><span><i class="legend-dot pending"></i>待激活</span></div></div><div class="member-bar-chart"><div class="member-y-axis"><span>1,200</span><span>900</span><span>600</span><span>300</span><span>0</span></div><div class="member-bars">${trendValues.map(([label, active, silent, pending]) => `<div class="member-bar-col"><div class="member-bar-stack"><i class="bar-active" style="height:${active / 1.2}px"></i><i class="bar-pending" style="height:${pending / 1.2}px"></i><i class="bar-silent" style="height:${silent / 1.2}px"></i></div><span>${label}</span></div>`).join("")}<div class="member-bar-baseline"></div></div></div>` })}
      ${DesignSystem.card({ className: "member-analytics-card member-retention-card", body: `<div class="overview-card-head member-chart-head"><div><h2>会员留存率 <span class="chart-info">?</span></h2></div><div class="member-chart-tools"><span><i class="legend-line new"></i>新会员留存</span><span><i class="legend-line paid"></i>付费会员留存</span></div></div><div class="member-retention-wrap">${retentionSvg}<span class="retention-label paid-label">68.2%</span><span class="retention-label new-label">42.6%</span></div>` })}
    </div>
    <article class="member-filter-card overview-card"><div class="member-filter-row"><span class="filter-name">会员等级</span><div class="member-filter-tabs">${levels.map(level => `<button class="${state.memberLevel === level ? "active" : ""}" data-member-level="${level}">${level}</button>`).join("")}</div></div><div class="member-filter-row"><span class="filter-name">用户状态</span><div class="member-filter-tabs status-tabs">${statuses.map(status => `<button class="${state.memberStatus === status ? "active" : ""}" data-member-status="${status}">${status}</button>`).join("")}</div></div><div class="member-query-row"><div class="member-query"><span>${icon("search",16)}</span><input id="memberQuery" value="${state.memberQuery}" placeholder="搜索昵称、手机号或用户ID" /></div><button class="btn primary" data-action="member-search">搜索用户</button><button class="btn" data-action="reset-member-filters">重置</button><label class="check hide-silent"><input type="checkbox" data-hide-silent ${state.hideSilent ? "checked" : ""} />不显示沉默用户</label></div></article>
    <div class="member-result-head"><div>查询结果 <b>${filtered.length}</b> 位用户 <small>当前选择 ${selectedVisible} 人</small></div></div>
    <div class="member-batch-bar ${state.selectedMembers.size ? "active" : ""}"><label class="check"><input type="checkbox" data-select-all="members" ${filtered.length && selectedVisible === filtered.length ? "checked" : ""} /></label><b>已选 ${state.selectedMembers.size} 人</b><button class="btn small" data-member-bulk="level" ${state.selectedMembers.size ? "" : "disabled"}>批量调整等级 ▾</button><button class="btn small" data-member-bulk="benefit" ${state.selectedMembers.size ? "" : "disabled"}>批量发放权益</button><button class="btn small" data-member-bulk="tag" ${state.selectedMembers.size ? "" : "disabled"}>批量添加标签</button><button class="btn small" data-member-bulk="notify" ${state.selectedMembers.size ? "" : "disabled"}>发送通知</button><button class="btn small" data-member-bulk="sync" ${state.selectedMembers.size ? "" : "disabled"}>同步标签</button><button class="text-btn member-clear-selection" data-action="clear-member-selection" ${state.selectedMembers.size ? "" : "disabled"}>取消选择</button></div>
    <article class="members-table overview-card"><div class="members-table-scroll"><div class="members-table-head"><span>用户</span><span>联系方式 / ID</span><span>会员等级</span><span>用户状态</span><span>注册来源</span><span>累计消费</span><span>最近活跃</span><span>操作</span></div>${filtered.length ? filtered.map(user => `<div class="member-row ${state.selectedMembers.has(user.id) ? "selected" : ""}"><div class="member-person"><label class="check"><input type="checkbox" class="member-check" value="${user.id}" ${state.selectedMembers.has(user.id) ? "checked" : ""} /></label><span class="member-avatar" style="--avatar:${user.color}">${user.name.slice(0,1)}</span><div><b>${user.name}</b><p>${user.tags.slice(0,2).map(tag => `<em>${tag}</em>`).join("")}</p></div></div><div class="member-contact"><b>${user.phone}</b><small>${user.id}</small></div><div><span class="member-level">${user.level}</span></div><div><span class="user-status ${memberStatusClass(user.status)}">${user.status}</span></div><div>${user.source}</div><div class="member-spend">¥${user.spend.toLocaleString("zh-CN")}</div><div class="muted">${user.lastActive}</div><div><button class="member-detail-link" data-member-detail="${user.id}">查看详情</button></div></div>`).join("") : `<div class="member-empty"><span>${icon("users",28)}</span><b>没有匹配的会员</b><p>请调整筛选条件或清空搜索关键词</p><button class="btn" data-action="reset-member-filters">重置筛选</button></div>`}</div></article>
  </section>`;
}

function renderMentor() {
  const mentors = [
    ["林老师", "10023", "紫微斗数 · 事业财运", "资料待审核", "提交于 2026-09-28 10:24", "已等待 2 小时", "4.9", "审核"],
    ["周老师", "10021", "八字命理 · 情感合盘", "资料待补充", "更新于 2026-09-28 09:48", "已等待 5 小时", "4.8", "联系补充"],
    ["陈老师", "10019", "择日 · 居家风水", "排班待确认", "更新于 2026-09-27 18:20", "已等待 16 小时", "4.9", "确认排班"],
    ["王老师", "10018", "奇门遁甲 · 事业决策", "资料待审核", "提交于 2026-09-27 14:32", "已等待 20 小时", "4.7", "审核"],
    ["李老师", "10017", "塔罗占卜 · 情感疗愈", "资料待补充", "更新于 2026-09-27 11:06", "已等待 1 天", "4.6", "联系补充"],
  ];
  const filteredMentors = mentors
    .filter(mentor => state.mentorStatus === "全部" || mentor[3].includes(state.mentorStatus.replace("待", "待")))
    .sort((a,b) => state.mentorSort === "评分" ? Number(b[6]) - Number(a[6]) : state.mentorSort === "等待时长" ? b[5].localeCompare(a[5], "zh-CN") : b[4].localeCompare(a[4], "zh-CN"));
  const mentorTrendRows = state.mentorTrendRange === "近7天"
    ? [["09/22",18,12,8],["09/23",28,18,10],["09/24",36,22,14],["09/25",58,26,20],["09/26",40,22,12],["09/27",48,20,14],["09/28",54,20,16]]
    : state.mentorTrendRange === "近30天"
      ? [["第1周",38,18,12],["第2周",52,24,16],["第3周",64,28,18],["第4周",72,30,20]]
      : [["一季度",46,20,12],["二季度",62,26,18],["三季度",78,32,22],["四季度",86,36,24]];
  const headerActions = DesignSystem.button({ label:"新增导师", variant:"primary", icon:mentorNavIcon(16), attributes:{ "data-action":"toast", "data-message":"新增导师为演示操作" } });
  const tabs = `<div class="mentor-workflow-tabs">${[["资料审核","4"],["导师列表",""] ,["排班管理",""] ,["服务评价",""]].map(([label,count])=>`<button class="${state.mentorSection===label?"active":""}" data-mentor-section="${label}">${label}${count?`<em>${count}</em>`:""}</button>`).join("")}</div>`;
  const tableActions = `<div class="mentor-status-filters">${[["全部","4"],["待审核","2"],["待补充","1"],["待确认","1"]].map(([label,count])=>`<button class="${state.mentorStatus===label?"active":""}" data-mentor-status="${label}">${label} <em>${count}</em></button>`).join("")}</div><select class="dashboard-select" aria-label="审核排序" data-mentor-sort>${["申请时间","等待时长","评分"].map(label=>`<option ${state.mentorSort===label?"selected":""}>${label}</option>`).join("")}</select>${DesignSystem.button({ label:`批量审核${state.selectedMentors.size?` (${state.selectedMentors.size})`:""}`, variant:"primary", size:"sm", attributes:{ "data-action":"toast", "data-message":"批量审核为演示操作", disabled:state.selectedMentors.size===0 } })}`;
  const tableBody = `${DesignSystem.sectionTitle({ title:state.mentorSection, description:"优先处理等待时间较长的申请，审核通过后导师即可上架提供服务", actions:tableActions })}<div class="mentor-table-scroll"><div class="mentor-table-head"><label class="check"><input type="checkbox" data-select-all="mentor" ${filteredMentors.length && filteredMentors.every(mentor=>state.selectedMentors.has(mentor[1]))?"checked":""} /></label><span>导师</span><span>擅长领域</span><span>当前状态</span><span>更新时间</span><span>评分</span><span>操作</span></div>${filteredMentors.map((mentor,index) => `<div class="mentor-row"><label class="check"><input class="mentor-check" type="checkbox" value="${mentor[1]}" ${state.selectedMentors.has(mentor[1])?"checked":""} /></label><div class="mentor-name"><span class="avatar-${index+1}">${mentor[0].slice(0,1)}</span><div><b>${mentor[0]}</b><small>ID: ${mentor[1]}</small></div></div><div>${mentor[2]}</div><div><em class="mentor-status ${mentor[3].includes("待审核")?"waiting":mentor[3].includes("待补充")?"warning":"info"}">${mentor[3]}</em></div><div class="mentor-time"><span>${mentor[4]}</span><small>${mentor[5]}</small></div><div class="mentor-rating"><b>${mentor[6]}</b><span>★★★★★</span></div><div class="mentor-row-actions"><button class="btn small" data-action="toast" data-message="已打开 ${mentor[0]} 的审核资料">查看资料</button><button class="btn small primary" data-action="toast" data-message="${mentor[7]}为演示操作">${mentor[7]}</button><button class="mentor-more" data-action="toast" data-message="更多导师操作为演示视图" aria-label="更多操作">•••</button></div></div>`).join("") || `<div class="member-empty"><span>${icon("users",28)}</span><b>没有匹配导师</b><p>请调整审核状态</p></div>`}</div>`;
  const auditBody = `${DesignSystem.sectionTitle({ title:"审核统计" })}<div class="mentor-audit-summary"><div class="dashboard-donut mentor-donut"><div><strong>12</strong><span>待处理</span></div></div><div class="dashboard-legend">${[["资料待审核","4","33.3%","red"],["资料待补充","3","25.0%","orange"],["排班待确认","2","16.7%","blue"],["已通过","2","16.7%","green"],["已驳回","1","8.3%","purple"]].map(([label,value,percent,tone])=>`<div><span><i class="${tone}"></i>${label}</span><b>${value}</b><em>${percent}</em></div>`).join("")}</div></div>`;
  const trendBody = `${DesignSystem.sectionTitle({ title:"审核趋势", actions:`<div class="compact-segment">${["近7天","近30天","近一年"].map(label=>`<button class="${state.mentorTrendRange===label?"active":""}" data-mentor-trend="${label}">${label}</button>`).join("")}</div>` })}${renderStackedBars(mentorTrendRows)}`;
  const quickBody = `${DesignSystem.sectionTitle({ title:"快速操作" })}<div class="mentor-quick-grid">${[["新增导师","users"],["批量审核","agreement"],["导出列表","download"],["审核设置","grid"],["排班管理","calendar"],["服务评价","feedback"]].map(([label,iconName])=>`<button data-action="toast" data-message="${label}为演示操作"><span>${label === "新增导师" ? mentorNavIcon(24) : icon(iconName,24)}</span><b>${label}</b></button>`).join("")}</div>`;
  return `<section class="page mentor-page reference-dashboard-page">
    ${DesignSystem.pageHeader({ title:"导师管理", subtitle:"认证、排班与服务质量统一管理，助力平台服务生态健康发展", actions:headerActions, className:"overview-head" })}
    ${tabs}
    ${DesignSystem.card({ className:"mentor-list-card dashboard-table-card", body:tableBody })}
    <div class="mentor-bottom-grid">${DesignSystem.card({ className:"dashboard-panel", body:auditBody })}${DesignSystem.card({ className:"dashboard-panel", body:trendBody })}${DesignSystem.card({ className:"dashboard-panel", body:quickBody })}</div>
  </section>`;
}

function renderFinance() {
  const nav = `<div class="finance-local-nav"><h1>财务</h1>${["总览","资金管理","对账管理","发票管理","基础信息","保证金"].map(label=>`<button class="${state.secondaryActive.finance===label?"active":""}" data-finance-nav="${label}">${label}</button>`).join("")}<span>数据更新于 2026-09-28 15:26 ${icon("refresh",15)}</span></div>`;
  const todos = [["待开票","给买家开票(笔)","12","order","blue"],["待缴费","待补缴保证金(元)","3,680.00","agreement","green"],["欠费金额","欠费金额(元)","560.00","grid","orange"]];
  const todoBody = `${DesignSystem.sectionTitle({ title:"待办" })}<div class="finance-todo-metrics">${todos.map(([label,note,value,iconName,tone])=>`<button data-action="toast" data-message="${label}处理流程为演示视图"><span class="finance-todo-icon tone-${tone}">${icon(iconName,22)}</span><span><b>${label}</b><small>${note}</small><strong>${value} <em>›</em></strong></span></button>`).join("")}</div>`;
  const assistantBody = `<div class="finance-assistant-copy"><b>财务助手</b><h2>免费自动对账工具</h2><p>提供对账、开票、结算等财务工具，提升财务效率</p>${DesignSystem.button({ label:"查看本月财务概况", variant:"primary", attributes:{ "data-action":"toast", "data-message":"财务概况为演示视图" } })}</div><img src="assets/images/finance-assistant.png" alt="财务助手自动对账工具" />`;
  const accountCards = [
    ["货款账户","支付宝账户","3,280.00","wallet","primary",[["可提现余额(元)","3,280.00"],["提现中(元)","0.00"],["冻结金额(元)","0.00"]]],
    ["保证金账户","可用余额(元)","1,680.00","agreement","blue",[["总金额","1,680.00"],["冻结金额","0.00"]]],
    ["推广业务账户","直通车(元)","0.00","send","orange",[["超级推荐","0.00"],["万相台","0.00"],["其它推广","0.00"]]],
  ];
  const accountBody = accountCards.map(([title,label,value,iconName,tone,details])=>`<article class="finance-account-card tone-${tone}"><div class="finance-account-head"><span>${icon(iconName,22)}</span><div><b>${title}</b><small>${label}</small></div><button data-action="toast" data-message="${title}明细为演示视图">账户明细 ›</button></div><strong>${value}</strong><div class="finance-account-subrow">${details.map(([detail,amount])=>`<span><small>${detail}</small><b>${amount}</b></span>`).join("")}</div></article>`).join("");
  const ranges = `<div class="compact-segment finance-range"><button class="active" data-range="当月">今日</button><button data-range="近7天">近7天</button><button data-range="近14天">近14天</button><button data-range="近30天">近30天</button></div><span class="finance-date-range range-date">2026-09-22　~　2026-09-28</span>`;
  const incomeMetrics = [
    ["已支付金额(元)","896.40",renderPercentChange(-23.4,"较上期"),"coins","green","paid"],
    ["子订单(笔)","9",renderPercentChange(-25,"较上期"),"order","blue","orders"],
    ["已收款(元)","168.40",renderPercentChange(-12.6,"较上期"),"wallet","orange","received"],
    ["收入金额(元)","797.60",renderPercentChange(-12.6,"较上期"),"chart","violet","income"],
    ["退款金额(元)","98.80",renderPercentChange(9.2,"较上期"),"refresh","red","refund"],
    ["支出(元)","3.85",renderPercentChange(.6,"较上期"),"grid","orange","expense"],
  ];
  const financeKpis = [
    { label:"已支付金额", value:"¥896.40", change:-23.4, comparison:"较上期", iconName:"coins", bars:[62,54,48,40,35] },
    { label:"子订单数", value:"9", change:-25, comparison:"较上期", iconName:"order", bars:[58,50,42,36,28] },
    { label:"收入金额", value:"¥797.60", change:-12.6, comparison:"较上期", iconName:"chart", bars:[38,48,56,68,62] },
    { label:"退款金额", value:"¥98.80", change:9.2, comparison:"较上期", iconName:"refresh", bars:[18,26,34,44,52] },
  ];
  const financeSummary = `${DesignSystem.sectionTitle({ title:"销售收支分析", description:"统计截止时间：2026年9月28日", actions:ranges })}<div class="finance-income-kpis">${incomeMetrics.map(([label,value,note,iconName,tone,key])=>`<div><span class="touch-icon tone-${tone}">${icon(iconName,18)}</span><span>${label}</span><b data-finance-value="${key}">${value}</b><small>${note}</small></div>`).join("")}</div><div class="finance-chart-grid"><div class="finance-chart-panel"><h3>收支趋势</h3>${renderMiniLineChart({ labels:["09/22","09/23","09/24","09/25","09/26","09/27","09/28"], primary:[5200,8800,6800,11200,10800,14600,16200], secondary:[2800,4100,5600,5000,7800,11000,10400], primaryLabel:"本期收入(元)", secondaryLabel:"上期收入(元)", max:20000 })}</div><div class="finance-chart-panel"><h3>订单与退款趋势</h3><div class="finance-combo-chart">${[40,48,56,61,47,67,68].map((value,index)=>`<div><i style="height:${value}%"></i><span>${["09/22","09/23","09/24","09/25","09/26","09/27","09/28"][index]}</span></div>`).join("")}<svg viewBox="0 0 560 148" aria-hidden="true"><path d="M25 128 L108 98 L192 98 L276 112 L360 56 L444 28 L535 72"/><g>${[[25,128],[108,98],[192,98],[276,112],[360,56],[444,28],[535,72]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join("")}</g></svg></div></div></div>`;
  const detailsBody = `${DesignSystem.sectionTitle({ title:"收支明细", actions:`<button class="link-action home-link-action" data-action="toast" data-message="收支明细为演示视图">${renderHomeAction("查看更多")}</button>` })}<div class="finance-detail-head"><span>创建时间</span><span>类型</span><span>订单 / 单号</span><span>金额(元)</span><span>余额(元)</span><span>状态</span></div><div class="finance-detail-row"><span>2026-09-28 14:56</span><span>${DesignSystem.badge({ label:"收入", tone:"success" })}</span><span>订单 20260928123456</span><b>+288.00</b><span>3,280.00</span><span>${DesignSystem.badge({ label:"已收款", tone:"success" })}</span></div>`;
  const topBody = `${DesignSystem.sectionTitle({ title:"资金去向 TOP5", actions:`<button class="link-action home-link-action" data-action="toast" data-message="资金去向为演示视图">${renderHomeAction("查看更多")}</button>` })}<div class="ranking-list finance-ranking">${[["导师分佣","12,860.00","32.6%"],["商品采购","9,280.00","23.5%"],["平台服务费","6,430.00","16.3%"],["营销推广","5,180.00","13.1%"],["退款支出","3,840.00","9.7%"]].map(([label,value,percent],index)=>`<div><span class="rank-number rank-${index+1}">${index+1}</span><b>${label}</b><strong>${value}</strong><small>${percent}</small><i><em style="width:${parseFloat(percent)}%"></em></i></div>`).join("")}</div>`;
  return `<section class="page finance-page reference-dashboard-page">
    ${nav}
    ${renderUnifiedKpis(financeKpis,"finance-kpis")}
    <div class="finance-top-grid">${DesignSystem.card({ className:"dashboard-panel finance-todo-card", body:todoBody })}${DesignSystem.card({ className:"dashboard-panel finance-assistant-card", body:assistantBody })}</div>
    <h2 class="finance-section-heading">我的账户</h2><div class="finance-account-grid">${accountBody}</div>
    ${DesignSystem.card({ className:"dashboard-panel finance-analysis-card", body:financeSummary })}
    <div class="finance-bottom-grid">${DesignSystem.card({ className:"dashboard-panel", body:detailsBody })}${DesignSystem.card({ className:"dashboard-panel", body:topBody })}</div>
  </section>`;
}

function renderPage() {
  if (state.page === "home") return renderHome();
  if (state.page === "trade") return renderTrade();
  if (state.page === "product") return renderProduct();
  if (state.page === "mentor") return renderMentor();
  if (state.page === "members") return renderMembers();
  if (state.page === "marketing") return renderMarketing();
  if (state.page === "service") return renderService();
  return renderFinance();
}

function renderReminderContent() {
  if (state.reminderTab === "todo") {
    return `<div class="reminder-list"><button class="reminder-row" data-page="trade"><span class="reminder-type danger">退</span><div><b>6 笔退款等待审核</b><p>其中 2 笔已等待超过 2 小时</p></div><strong>去处理 ›</strong></button><button class="reminder-row" data-page="mentor"><span class="reminder-type warning">导</span><div><b>4 份导师资料待审核</b><p>平均等待时长 5.2 小时</p></div><strong>去审核 ›</strong></button><button class="reminder-row" data-page="product"><span class="reminder-type info">内</span><div><b>7 条内容等待发布</b><p>建议分散到不同时段发布</p></div><strong>去排期 ›</strong></button></div>`;
  }
  if (state.reminderTab === "system") {
    return `<div class="reminder-list"><div class="reminder-row system-row ${state.systemRead ? "read" : ""}"><span class="reminder-type info">系</span><div><b>运营日报已生成 ${state.systemRead ? "" : '<i class="unread-dot"></i>'}</b><p>9月28日运营日报已生成，可前往数据中心查看</p></div>${state.systemRead ? "<span class='read-label'>已读</span>" : '<button class="mark-read" data-action="mark-read">标记已读</button>'}</div><div class="reminder-row system-row read"><span class="reminder-type success">会</span><div><b>会员续费任务已更新</b><p>未来 3 天共有 9 位会员即将到期</p></div><span class="read-label">已读</span></div><div class="reminder-row system-row read"><span class="reminder-type warning">维</span><div><b>系统维护通知</b><p>本周三 02:00–03:00 进行例行维护</p></div><span class="read-label">已读</span></div></div>`;
  }
  return `<div class="reminder-list"><div class="reminder-row log-row"><span class="log-time">15:08</span><div><b>运营员「小岚」审核通过退款</b><p>订单 XZ-20260928-0836</p></div></div><div class="reminder-row log-row"><span class="log-time">14:42</span><div><b>导师「林老师」更新了认证资料</b><p>等待运营审核</p></div></div><div class="reminder-row log-row"><span class="log-time">13:16</span><div><b>系统发布了 3 条内容</b><p>发布渠道：小程序、公众号</p></div></div></div>`;
}

const assistantPrompts = [
  "分析今天咨询履约异常，并给出处理顺序",
  "检查退款订单原因和金额",
  "看看导师排班和晚高峰接待情况",
  "总结近 7 日咨询履约率趋势",
];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[character]));
}

function getAssistantReply(prompt) {
  if (/退款|退款订单/.test(prompt)) {
    return "已检查 6 笔待审退款：2 笔已超过 2 小时，涉及金额 ¥1,360。建议先处理「导师服务已取消」的 2 笔，再核对数字报告类订单的生成状态。";
  }
  if (/导师|排班|高峰|接待/.test(prompt)) {
    return "今晚 20:00–22:00 是预计咨询高峰，当前在线导师 76 位。有4 份导师资料待审核，建议在 18:00 前完成，并为事业咨询增加 2 个备班席位。";
  }
  if (/近\s*7|趋势|履约率|满意度/.test(prompt)) {
    return "近 7 日咨询履约率整体稳定，当前为 96%，晚高峰的首次响应时间略有上升。建议继续观察 20:00 后的排队时长，并将超过 10 分钟的会话自动升级为提醒。";
  }
  if (/咨询|履约|异常|运营|待办/.test(prompt)) {
    return "今日有 3 类事项需要优先处理：① 2 笔超时退款；② 4 份导师资料待审核；③ 20:00 后咨询高峰的排班缺口。建议按「资金风险 → 供给准备 → 高峰容量」的顺序处理。";
  }
  return "我已结合当前演示数据进行分析。今天最值得关注的是退款审核时效、导师审核积压和晚高峰接待容量。你可以继续问某一项的原因、数量或处理建议。";
}

function renderAssistantMessage(message, index) {
  const isUser = message.role === "user";
  return `<div class="assistant-message-row ${isUser ? "user" : "bot"}">
    ${isUser ? "" : '<span class="assistant-mini-avatar" aria-hidden="true"><img src="assets/images/qn-robot-face.png" alt="" /></span>'}
    <div class="assistant-message-wrap">
      <div class="assistant-message">${escapeHTML(message.text)}</div>
      ${!isUser && index === state.assistantMessages.length - 1 && state.assistantMessages.some(item => item.role === "user") ? `<div class="assistant-message-tools" aria-label="回复操作">
        <button data-action="assistant-copy" title="复制" aria-label="复制小知回复">${legacyIcon("copy", 16)}</button>
        <button data-action="assistant-regenerate" title="重新分析" aria-label="重新分析上一个问题">${legacyIcon("refresh", 16)}</button>
        <button data-action="assistant-like" title="有帮助" aria-label="这条回复有帮助">${legacyIcon("thumbsUp", 16)}</button>
        <button data-action="assistant-dislike" title="没帮助" aria-label="这条回复没帮助">${legacyIcon("thumbsDown", 16)}</button>
      </div>` : ""}
    </div>
  </div>`;
}

function renderAssistantPanel() {
  const welcome = state.assistantMessages.length === 1 && !state.assistantThinking && !state.assistantMessages.some(message => message.role === "user");
  return `<section class="assistant-panel ${state.assistantOpen ? "open" : ""}" id="assistantPanel" role="dialog" aria-modal="false" aria-labelledby="assistantTitle">
    <header class="assistant-title">
      <h3 id="assistantTitle" class="sr-only">小知智能助理</h3>
      <button class="assistant-close" data-action="assistant" aria-label="关闭小知运营助手">×</button>
    </header>
    <div class="assistant-conversation" id="assistantConversation">
      ${state.assistantHistoryOpen ? `<div class="assistant-history"><div><b>历史对话</b><small>${state.assistantSessions.length} 个会话</small></div>${state.assistantSessions.length ? state.assistantSessions.map((session, index) => `<button data-assistant-session-index="${index}"><span>${index + 1}</span>${escapeHTML(session.title)}</button>`).join("") : "<p>还没有历史会话。完成提问后点击「新建对话」，本轮记录会保存在这里。</p>"}</div>` : ""}
      <div class="assistant-messages ${welcome ? "has-welcome" : ""}" aria-live="polite" aria-relevant="additions text">
        ${welcome ? `<div class="assistant-welcome"><div class="assistant-welcome-avatar"><img src="assets/images/qn-robot-face.png" alt="小知" /></div><h4>你好！我是已接入 DeepSeek 的小知</h4><p>我可以帮你分析运营数据、定位异常，并给出可执行的处理顺序。</p><div class="assistant-welcome-prompts" aria-label="快捷问题">${assistantPrompts.slice(0, 4).map(prompt => `<button data-assistant-prompt="${escapeHTML(prompt)}">${escapeHTML(prompt)}<span>›</span></button>`).join("")}</div></div>` : `${state.assistantMessages.map(renderAssistantMessage).join("")}${state.assistantThinking ? `<div class="assistant-thinking-row"><span class="assistant-mini-avatar"><img src="assets/images/qn-robot-face.png" alt="" /></span><div class="assistant-thinking"><span>小知正在思考</span><i></i><i></i><i></i></div></div>` : ""}`}
      </div>
    </div>
    <div class="assistant-session-actions">
      <button data-action="assistant-new">${icon("message", 18)}<span>新建对话</span></button>
      <button class="${state.assistantHistoryOpen ? "active" : ""}" data-action="assistant-history">${icon("clock", 18)}<span>历史对话</span></button>
    </div>
    <div class="assistant-composer-shell">
      <div class="assistant-composer">
        <textarea id="assistantInput" rows="2" maxlength="400" placeholder="你可以向小知提问任何问题" aria-label="向小知提问"></textarea>
        <div class="assistant-composer-foot"><button class="assistant-model" type="button" aria-label="当前模型">模型：深度思考 <span>›</span></button><button class="assistant-send ${state.assistantThinking ? "sending" : ""}" data-action="assistant-send" aria-label="发送消息" aria-disabled="true" ${state.assistantThinking ? "disabled" : "disabled"}>${assistantSendIcon()}<span class="assistant-send-label">发送</span></button></div>
      </div>
    </div>
  </section>`;
}

function renderOverlays() {
  return `
    <div class="popover" id="toolPopover"></div>
    <div class="popover" id="userPopover"><div class="popover-item">🏪 切换店铺</div><div class="popover-item">⚙ 账号设置</div><div class="popover-item">↗ 退出登录</div></div>
    <button class="assistant-fab ${state.assistantOpen ? "is-open" : ""}" data-action="assistant" aria-label="打开小知运营助手" aria-expanded="${state.assistantOpen}"><span class="assistant-fab-robot"><img src="assets/images/qn-robot.png" alt="" /></span><span class="assistant-fab-copy"><b>小知运营助手</b><small>有什么可以帮你？</small></span><span class="assistant-fab-chevron">${assistantChevronIcon()}</span></button>
    ${renderAssistantPanel()}
    <aside class="system-message reminder-center ${state.messageOpen ? "" : "hidden"}" id="systemMessage"><div class="system-message-head"><div><strong>提醒中心</strong><p>重要事项及时处理</p></div><span class="badge">${state.systemRead ? "5" : "6"}</span><button class="close" data-action="close-message">×</button></div><div class="reminder-tabs"><button class="${state.reminderTab === "todo" ? "active" : ""}" data-reminder-tab="todo">待办提醒 <em>3</em></button><button class="${state.reminderTab === "system" ? "active" : ""}" data-reminder-tab="system">系统消息 <em>${state.systemRead ? "2" : "3"}</em></button><button class="${state.reminderTab === "logs" ? "active" : ""}" data-reminder-tab="logs">操作记录</button></div>${renderReminderContent()}<div class="reminder-foot">仅展示最近 30 天提醒与记录</div></aside>${state.page === "members" ? renderMemberDrawer() : ""}${state.page === "trade" ? renderTradeDrawer() + renderRefundDialog() : ""}${state.page === "product" ? renderProductDrawer() + renderRestockDialog() : ""}${state.page === "marketing" ? renderCampaignDrawer() + renderTouchPlanDialog() : ""}
    <div class="toast" id="toast"></div>`;
}

function render() {
  document.title = `先知命局 · ${pageNames[state.page] || "工作台"}`;
  const motionClass = renderMotionMode === "page" ? "is-page-entering" : renderMotionMode === "charts" ? "is-chart-refreshing" : "";
  document.querySelector("#app").innerHTML = `<div class="app-shell">${renderTopbar()}<div class="workspace">${renderPrimaryNav()}${renderSecondary()}<main class="main ${state.page === "home" ? "home-main" : ""} ${motionClass}" data-page="${state.page}" data-motion="${renderMotionMode}">${renderLegacyTrendChanges(renderPage())}</main></div>${renderOverlays()}</div>`;
  renderMotionMode = "";
  bindDynamicInputs();
  clearTimeout(renderMotionTimer);
  if (motionClass) {
    renderMotionTimer = setTimeout(() => document.querySelector(".main")?.classList.remove(motionClass), 680);
  }
}

function replayChartMotion() {
  const main = document.querySelector(".main");
  if (!main) return;
  main.classList.remove("is-chart-refreshing");
  void main.offsetWidth;
  main.classList.add("is-chart-refreshing");
  clearTimeout(replayChartMotion.timer);
  replayChartMotion.timer = setTimeout(() => main.classList.remove("is-chart-refreshing"), 680);
}

function bindDynamicInputs() {
  const globalSearch = $("#globalSearch");
  if (globalSearch) {
    globalSearch.addEventListener("focus", () => $("#searchWrap").classList.add("open"));
    globalSearch.addEventListener("input", (event) => {
      const keyword = event.target.value.trim();
      $$(".suggestion").forEach(item => item.style.display = !keyword || item.innerText.includes(keyword) ? "flex" : "none");
      $("#searchWrap").classList.add("open");
    });
  }
  const quickInput = $("#assistantQuickInput");
  if (quickInput) {
    const askQuickQuestion = () => {
      const prompt = quickInput.value.trim();
      if (!prompt) { quickInput.focus(); return; }
      state.assistantOpen = true;
      render();
      requestAnimationFrame(() => submitAssistantPrompt(prompt));
    };
    quickInput.addEventListener("click", event => event.stopPropagation());
    quickInput.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      askQuickQuestion();
    });
    $(".topbar-assistant-search")?.addEventListener("click", event => { event.stopPropagation(); askQuickQuestion(); });
  }
  const orderQuery = $("#orderQuery");
  if (orderQuery) orderQuery.addEventListener("keydown", event => { if (event.key === "Enter") filterOrders(); });
  const productQuery = $("#productQuery");
  if (productQuery) productQuery.addEventListener("keydown", event => { if (event.key === "Enter") filterProducts(); });
  const memberQuery = $("#memberQuery");
  if (memberQuery) memberQuery.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      state.memberQuery = memberQuery.value;
      state.selectedMembers.clear();
      render();
    }
  });
  const assistantInput = $("#assistantInput");
  if (assistantInput) {
    const syncSendState = () => {
      const sendButton = $(".assistant-send");
      const ready = Boolean(assistantInput.value.trim());
      sendButton?.classList.toggle("ready", ready);
      if (sendButton) {
        sendButton.disabled = !ready;
        sendButton.setAttribute("aria-disabled", String(!ready));
      }
    };
    assistantInput.addEventListener("input", syncSendState);
    assistantInput.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitAssistantPrompt(assistantInput.value);
      }
    });
    syncSendState();
  }
  $$(".ds-metric-card__sparkline i").forEach(bar => {
    const tooltip = bar.querySelector(".sparkline-tooltip");
    const show = () => {
      bar.classList.add("show-value");
      if (tooltip) { tooltip.style.setProperty("opacity", "1", "important"); tooltip.style.setProperty("transform", "translate(-50%,0)", "important"); }
    };
    const hide = () => {
      bar.classList.remove("show-value");
      if (tooltip) { tooltip.style.setProperty("opacity", "0", "important"); tooltip.style.setProperty("transform", "translate(-50%,4px)", "important"); }
    };
    bar.addEventListener("pointerenter", show);
    bar.addEventListener("pointerleave", hide);
    bar.addEventListener("focus", show);
    bar.addEventListener("blur", hide);
  });
}

function navigate(page) {
  if (!page) return;
  state.page = page;
  renderMotionMode = "page";
  state.messageOpen = false;
  state.assistantOpen = false;
  state.assistantThinking = false;
  location.hash = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function submitAssistantPrompt(rawPrompt) {
  const prompt = String(rawPrompt || "").trim();
  if (!prompt) {
    $("#assistantInput")?.focus();
    return;
  }
  if (state.assistantThinking) return;
  state.assistantHistoryOpen = false;
  state.assistantMessages.push({ role: "user", text: prompt });
  state.assistantThinking = true;
  const panel = $("#assistantPanel");
  const input = $("#assistantInput");
  const send = $(".assistant-send");
  const messages = panel?.querySelector(".assistant-messages");
  if (!panel || !messages) { render(); return; }
  messages.classList.remove("has-welcome");
  messages.innerHTML = `${state.assistantMessages.map(renderAssistantMessage).join("")}<div class="assistant-thinking-row"><span class="assistant-mini-avatar"><img src="assets/images/qn-robot-face.png" alt="" /></span><div class="assistant-thinking"><span>小知正在思考</span><i></i><i></i><i></i></div></div>`;
  if (input) { input.value = ""; input.disabled = true; }
  if (send) { send.disabled = true; send.classList.add("sending"); send.setAttribute("aria-disabled", "true"); }
  const conversation = $("#assistantConversation");
  if (conversation) conversation.scrollTop = conversation.scrollHeight;
  clearTimeout(submitAssistantPrompt.timer);
  submitAssistantPrompt.timer = setTimeout(() => {
    state.assistantMessages.push({ role: "assistant", text: getAssistantReply(prompt) });
    state.assistantThinking = false;
    const activeMessages = $("#assistantPanel")?.querySelector(".assistant-messages");
    if (activeMessages) activeMessages.innerHTML = state.assistantMessages.map(renderAssistantMessage).join("");
    const activeInput = $("#assistantInput");
    const activeSend = $(".assistant-send");
    if (activeInput) { activeInput.disabled = false; activeInput.focus(); }
    if (activeSend) { activeSend.disabled = true; activeSend.classList.remove("sending"); activeSend.setAttribute("aria-disabled", "true"); }
    const activeConversation = $("#assistantConversation");
    if (activeConversation) activeConversation.scrollTop = activeConversation.scrollHeight;
  }, 1450);
}

function copyAssistantReply() {
  const message = [...state.assistantMessages].reverse().find(item => item.role === "assistant");
  if (!message) return;
  const fallback = () => {
    const textarea = document.createElement("textarea");
    textarea.value = message.text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(message.text).catch(fallback);
  else fallback();
  showToast("已复制小知的回复");
}

function closePopovers(except) {
  $$(".popover.open").forEach(p => { if (p !== except) p.classList.remove("open"); });
  $$(".field.open").forEach(p => { if (p !== except) p.classList.remove("open"); });
}

function updateServiceContent(tabName) {
  const sets = {
    "服务数据": [["消息拒收点击率","0%","已达标"],["旺旺满意度","-",""],["3分钟人工响应率","100%","体验分"],["真实体验分","-","体验分"]],
    "服务质量明细": [["响应质量","100%","达标"],["平均响应时长","-","待统计"],["满意度评价","-","待评价"],["投诉待处理","0","无待办"]],
    "团队评级数据": [["团队等级","普通","当月"],["基础考核","不考核","8月"],["团队考核","-","待更新"],["服务金标","未获得","去提升"]]
  };
  const cards = sets[tabName];
  const root = $(".service-metrics");
  if (root) root.innerHTML = cards.map(([label,value,action]) => `<div class="metric-card"><label>${label} ⓘ</label><strong>${value}</strong>${action ? `<a>${action}</a>` : ""}</div>`).join("");
}

function updateFinanceRange(rangeName) {
  const sets = {
    "当月": {date:"2026-09-01 ~ 2026-09-27", paid:"896.40", orders:"9", income:"797.60", refund:"98.80"},
    "近7天": {date:"2026-09-21 ~ 2026-09-27", paid:"354.00", orders:"3", income:"354.00", refund:"0.00"},
    "近14天": {date:"2026-09-14 ~ 2026-09-27", paid:"728.00", orders:"6", income:"629.20", refund:"98.80"},
    "近30天": {date:"2026-08-28 ~ 2026-09-27", paid:"896.40", orders:"9", income:"797.60", refund:"98.80"}
  };
  const data = sets[rangeName];
  $$(".range-date").forEach(label => label.textContent = data.date);
  const financeSummary = {
    paid: document.querySelector('[data-finance-value="paid"]'),
    orders: document.querySelector('[data-finance-value="orders"]'),
    income: document.querySelector('[data-finance-value="income"]'),
    refund: document.querySelector('[data-finance-value="refund"]'),
  };
  if (financeSummary.paid) financeSummary.paid.textContent = data.paid;
  if (financeSummary.orders) financeSummary.orders.textContent = data.orders;
  if (financeSummary.income) financeSummary.income.textContent = data.income;
  if (financeSummary.refund) financeSummary.refund.textContent = data.refund;
  const values = $$(".income-head b");
  if (values[0]) values[0].childNodes[0].nodeValue = `${data.paid} `;
  if (values[1]) values[1].childNodes[0].nodeValue = `${data.orders} `;
  if (values[2]) values[2].textContent = data.income;
  if (values[3]) values[3].textContent = data.refund;
}

function filterOrders() {
  state.tradeQuery = $("#orderQuery")?.value || "";
  const count = getFilteredTradeOrders().length;
  render();
  showToast(state.tradeQuery ? `已筛选到 ${count} 条演示订单` : `当前条件共 ${count} 条演示订单`);
}

function filterProducts() {
  state.productQuery = $("#productQuery")?.value || "";
  state.productPage = 1;
  const count = getFilteredInventory().length;
  render();
  showToast(state.productQuery ? `已筛选到 ${count} 件商品` : `当前条件共 ${count} 件商品`);
}

function exportMembersCSV() {
  const users = getFilteredMembers();
  const rows = [["用户姓名", "手机号", "用户ID", "会员等级", "用户状态", "注册来源", "累计消费", "最近活跃时间", "微信", "生日", "标签"], ...users.map(user => [user.name, user.phone, user.id, user.level, user.status, user.source, user.spend, user.lastActive, user.wechat, user.birthday, user.tags.join("|")])];
  const csv = "\uFEFF" + rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `先知命局-会员名单-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${users.length} 位会员的 CSV 文件`);
}

function exportInventoryCSV() {
  const products = getFilteredInventory();
  const rows = [["商品名称", "商品ID", "分类", "价格", "SKU数量", "可用库存", "30日销量", "质量状态", "发布状态", "发布时间"], ...products.map(product => [product.name, product.id, product.category, product.price, product.sku, product.stock, product.sales30, product.quality, product.status, product.published])];
  const csv = "\uFEFF" + rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `先知命局-商品库存-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(`已导出 ${products.length} 件商品的 CSV 文件`);
}

function copyMemberId(id, label = "用户编号") {
  const fallback = () => {
    const textarea = document.createElement("textarea");
    textarea.value = id;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(id).catch(fallback);
  else fallback();
  showToast(`已复制${label} ${id}`);
}

function applyMemberBulk(type, value = "") {
  const users = memberUsers.filter(user => state.selectedMembers.has(user.id));
  if (!users.length) return;
  if (type === "level") users.forEach(user => { user.level = value; user.logs.unshift(`刚刚 · 批量调整等级为${value}`); });
  if (type === "tag") users.forEach(user => { if (!user.tags.includes(value)) user.tags.push(value); user.logs.unshift(`刚刚 · 批量添加标签「${value}」`); });
  if (type === "benefit") users.forEach(user => user.logs.unshift("刚刚 · 发放月度报告权益"));
  if (type === "notify") users.forEach(user => user.logs.unshift(`刚刚 · 创建${value}通知任务`));
  if (type === "sync") users.forEach(user => user.logs.unshift("刚刚 · 同步外部运营标签"));
  const labels = { level: `等级已调整为${value}`, tag: `已添加标签「${value}」`, benefit: "权益已发放", notify: `${value}通知任务已创建`, sync: "标签已同步" };
  render();
  showToast(`${users.length} 位用户${labels[type]}`);
}

function applyInventoryBulk(type, value = "") {
  const products = inventoryProducts.filter(product => state.selectedInventory.has(product.id));
  if (!products.length) return;
  if (type === "status") products.forEach(product => { product.status = value === "上架" ? "在售" : "下架"; product.logs.unshift(`刚刚 · 批量${value}`); });
  if (type === "stock") products.forEach(product => { product.stock = value === "库存 +10" ? product.stock + 10 : value === "库存 +50" ? product.stock + 50 : 100; product.logs.unshift(`刚刚 · 批量调整库存为 ${product.stock}`); });
  if (type === "decorate") products.forEach(product => product.logs.unshift("刚刚 · 创建商品装修任务"));
  const labels = { status: `已批量${value}`, stock: `已执行${value}`, decorate: "已创建商品装修任务" };
  render();
  showToast(`${products.length} 件商品${labels[type]}`);
}

document.addEventListener("click", (event) => {
  if (!event.target.closest("#searchWrap")) $("#searchWrap")?.classList.remove("open");
  const pageTarget = event.target.closest("[data-page]");
  if (pageTarget?.dataset.page) {
    event.preventDefault();
    navigate(pageTarget.dataset.page);
    return;
  }

  const nav = event.target.closest(".nav-item");
  if (nav && !nav.dataset.page) {
    showToast(`${nav.innerText.trim() || "该"}模块为静态预览`);
    return;
  }

  const secondary = event.target.closest("[data-secondary]");
  if (secondary) {
    state.secondaryActive[state.page] = secondary.dataset.secondary;
    if (state.page === "trade") {
      state.tradeFinanceFocus = secondary.dataset.secondary === "导师结算" ? "mentor" : secondary.dataset.secondary === "发票对账" ? "invoice" : "";
      state.tradeStatus = secondary.dataset.secondary === "退款售后" ? "退款中" : "全部订单";
      state.tradeType = secondary.dataset.secondary === "会员支付" ? "会员支付" : "全部类型";
      render();
      if (["导师结算", "发票对账"].includes(secondary.dataset.secondary)) requestAnimationFrame(() => $(".trade-finance-layout")?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } else if (state.page === "product") {
      const section = secondary.dataset.secondary;
      if (section === "发布商品") {
        state.publishProductOpen = true;
        state.productLogTab = "profile";
      }
      if (section === "库存管理") state.stockFilter = "库存预警";
      if (section === "商品列表") state.stockFilter = "全部库存";
      render();
      if (section === "物流管理") requestAnimationFrame(() => $(".logistics-grid")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      if (section === "商品售后") requestAnimationFrame(() => $(".after-sales-grid")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      if (["SKU管理", "商品装修"].includes(section)) showToast(`已进入${section}演示视图`);
    } else if (state.page === "marketing") {
      state.marketingSection = secondary.dataset.secondary;
      render();
      const tool = $(`[data-marketing-tool="${secondary.dataset.secondary}"]`);
      requestAnimationFrame(() => (tool || $(".marketing-tools-card"))?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } else {
      $$(".secondary-link").forEach(link => link.classList.toggle("active", link === secondary));
      showToast(`已选择：${secondary.dataset.secondary}`);
    }
    return;
  }

  const groupTitle = event.target.closest(".secondary-group-title");
  if (groupTitle) {
    groupTitle.parentElement.classList.toggle("collapsed");
    return;
  }

  const select = event.target.closest(".select-trigger");
  if (select && !event.target.closest(".select-option")) {
    const opening = !select.classList.contains("open");
    closePopovers(select);
    select.classList.toggle("open", opening);
    event.stopPropagation();
    return;
  }

  const option = event.target.closest(".select-option");
  if (option) {
    const field = option.closest(".field");
    $("b", field).textContent = option.dataset.value;
    $$(".select-option", field).forEach(item => item.classList.toggle("selected", item === option));
    field.classList.remove("open");
    event.stopPropagation();
    return;
  }

  const memberBulk = event.target.closest("[data-member-bulk]");
  if (memberBulk && !memberBulk.disabled) {
    const type = memberBulk.dataset.memberBulk;
    if (type === "benefit" || type === "sync") {
      applyMemberBulk(type);
      return;
    }
    const choices = {
      level: ["星曜会员", "银曜会员", "金曜会员", "黑金会员"],
      tag: ["重点跟进", "高净值", "续费意向", "需召回"],
      notify: ["站内消息", "短信", "微信"],
    };
    const pop = $("#toolPopover");
    pop.innerHTML = `<div class="popover-item"><b>${type === "level" ? "选择会员等级" : type === "tag" ? "选择用户标签" : "选择通知渠道"}</b></div>${choices[type].map(choice => `<button class="popover-item member-bulk-option" data-member-bulk-option="${choice}" data-member-bulk-type="${type}">${choice}</button>`).join("")}`;
    const rect = memberBulk.getBoundingClientRect();
    pop.style.top = `${rect.bottom + 6}px`;
    pop.style.left = `${Math.min(rect.left, innerWidth - 210)}px`;
    pop.style.right = "auto";
    closePopovers(pop);
    pop.classList.add("open");
    event.stopPropagation();
    return;
  }

  const bulkOption = event.target.closest("[data-member-bulk-option]");
  if (bulkOption) {
    applyMemberBulk(bulkOption.dataset.memberBulkType, bulkOption.dataset.memberBulkOption);
    return;
  }

  const inventoryBulk = event.target.closest("[data-inventory-bulk]");
  if (inventoryBulk && !inventoryBulk.disabled) {
    const type = inventoryBulk.dataset.inventoryBulk;
    if (type === "decorate") {
      applyInventoryBulk(type);
      return;
    }
    const choices = type === "status" ? ["上架", "下架"] : ["库存 +10", "库存 +50", "库存设为100"];
    const pop = $("#toolPopover");
    pop.innerHTML = `<div class="popover-item"><b>${type === "status" ? "批量调整状态" : "批量调整库存"}</b></div>${choices.map(choice => `<button class="popover-item inventory-bulk-option" data-inventory-bulk-option="${choice}" data-inventory-bulk-type="${type}">${choice}</button>`).join("")}`;
    const rect = inventoryBulk.getBoundingClientRect();
    pop.style.top = `${rect.bottom + 6}px`; pop.style.left = `${Math.min(rect.left, innerWidth - 210)}px`; pop.style.right = "auto";
    closePopovers(pop); pop.classList.add("open"); event.stopPropagation(); return;
  }
  const inventoryBulkOption = event.target.closest("[data-inventory-bulk-option]");
  if (inventoryBulkOption) {
    applyInventoryBulk(inventoryBulkOption.dataset.inventoryBulkType, inventoryBulkOption.dataset.inventoryBulkOption);
    return;
  }

  const tool = event.target.closest("[data-tool]");
  if (tool) {
    if (tool.dataset.tool === "消息") {
      state.messageOpen = !state.messageOpen;
      $("#systemMessage").classList.toggle("hidden", !state.messageOpen);
    } else {
      const pop = $("#toolPopover");
      pop.innerHTML = `<div class="popover-item"><b>${tool.dataset.tool}</b></div><div class="popover-item">最近功能与快捷入口</div><div class="popover-item blue">查看全部 ›</div>`;
      pop.style.top = "58px";
      pop.style.right = `${Math.max(90, innerWidth - tool.getBoundingClientRect().right)}px`;
      const opening = !pop.classList.contains("open");
      closePopovers(pop);
      pop.classList.toggle("open", opening);
    }
    event.stopPropagation();
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "home") navigate("home");
  if (action === "user-menu") {
    const pop = $("#userPopover");
    pop.style.top = "58px"; pop.style.right = "20px";
    const opening = !pop.classList.contains("open");
    closePopovers(pop); pop.classList.toggle("open", opening);
    event.stopPropagation();
  }
  if (action === "assistant") {
    state.assistantOpen = !state.assistantOpen;
    state.messageOpen = false;
    render();
    if (state.assistantOpen && matchMedia("(hover: hover) and (pointer: fine)").matches) requestAnimationFrame(() => $("#assistantInput")?.focus());
  }
  if (action === "assistant-send") submitAssistantPrompt($("#assistantInput")?.value || "");
  if (action === "assistant-new") {
    const firstQuestion = state.assistantMessages.find(message => message.role === "user");
    if (firstQuestion) {
      state.assistantSessions.unshift({
        title: firstQuestion.text,
        messages: state.assistantMessages.map(message => ({ ...message }))
      });
      state.assistantSessions = state.assistantSessions.slice(0, 6);
    }
    state.assistantHistoryOpen = false;
    state.assistantThinking = false;
    state.assistantMessages = [{ role: "assistant", text: "新对话已开始。你想先看今天的异常、趋势，还是某个具体订单？" }];
    render();
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) requestAnimationFrame(() => $("#assistantInput")?.focus());
  }
  if (action === "assistant-history") {
    state.assistantHistoryOpen = !state.assistantHistoryOpen;
    render();
  }
  if (action === "assistant-copy") copyAssistantReply();
  if (action === "assistant-regenerate") {
    const lastPrompt = [...state.assistantMessages].reverse().find(item => item.role === "user");
    if (lastPrompt) {
      const lastAssistantIndex = state.assistantMessages.map(item => item.role).lastIndexOf("assistant");
      if (lastAssistantIndex >= 0) state.assistantMessages[lastAssistantIndex] = { role: "assistant", text: getAssistantReply(lastPrompt.text) };
      render();
      showToast("已重新分析");
    }
  }
  if (action === "assistant-like" || action === "assistant-dislike") {
    showToast(action === "assistant-like" ? "感谢反馈，小知会继续优化" : "已记录，小知会调整分析方式");
  }
  if (action === "open-reminders") {
    state.messageOpen = true;
    state.assistantOpen = false;
    render();
  }
  if (action === "close-message") { state.messageOpen = false; $("#systemMessage").classList.add("hidden"); }
  if (action === "mark-read") {
    state.systemRead = true;
    render();
    showToast("系统消息已标记为已读");
  }
  if (action === "member-search") {
    state.memberQuery = $("#memberQuery")?.value || "";
    state.selectedMembers.clear();
    render();
  }
  if (action === "reset-member-filters") {
    state.memberLevel = "全部等级";
    state.memberStatus = "全部状态";
    state.memberQuery = "";
    state.hideSilent = false;
    state.selectedMembers.clear();
    render();
  }
  if (action === "clear-member-selection") {
    state.selectedMembers.clear();
    render();
  }
  if (action === "export-members") exportMembersCSV();
  if (action === "close-member-drawer") {
    state.memberDetailId = null;
    state.memberEditMode = false;
    render();
  }
  if (action === "toggle-member-edit") {
    state.memberEditMode = !state.memberEditMode;
    render();
  }
  if (action === "save-member") {
    const user = memberUsers.find(item => item.id === state.memberDetailId);
    const form = $("#memberEditForm");
    if (user && form) {
      const data = new FormData(form);
      user.name = String(data.get("name") || user.name).trim();
      user.level = String(data.get("level") || user.level);
      user.phone = String(data.get("phone") || user.phone).trim();
      user.wechat = String(data.get("wechat") || user.wechat).trim();
      user.birthday = String(data.get("birthday") || user.birthday);
      user.status = String(data.get("status") || user.status);
      user.tags = String(data.get("tags") || "").split(/[、,，|]/).map(tag => tag.trim()).filter(Boolean);
      user.logs.unshift("刚刚 · 本地编辑用户档案");
      state.memberEditMode = false;
      render();
      showToast("用户档案已保存到本地演示数据");
    }
  }
  if (action === "create-contact-task") {
    const user = memberUsers.find(item => item.id === state.memberDetailId);
    const labels = { site: "站内消息", sms: "短信", wechat: "微信" };
    if (user) user.logs.unshift(`刚刚 · 创建${labels[state.contactChannel]}联系任务`);
    showToast(`已创建${labels[state.contactChannel]}联系任务`);
  }
  if (action === "reset-trade-search") {
    state.tradeStatus = "全部订单";
    state.tradeQuery = "";
    state.tradeType = "全部类型";
    state.tradePayment = "全部支付";
    state.tradeFulfillment = "全部履约";
    state.secondaryActive.trade = "订单管理";
    state.tradeFinanceFocus = "";
    render();
  }
  if (action === "close-trade-drawer") {
    state.tradeDetailId = null;
    state.tradeNoteEditing = false;
    render();
  }
  if (action === "save-trade-note") {
    const order = tradeOrders.find(item => item.id === state.tradeDetailId);
    if (order) {
      order.note = $("#tradeNoteInput")?.value.trim() || "";
      order.logs.unshift("刚刚 · 更新本地订单备注");
      render();
      showToast("订单备注已保存");
    }
  }
  if (action === "cancel-refund") {
    state.refundConfirmId = null;
    render();
  }
  if (action === "confirm-refund") {
    const order = tradeOrders.find(item => item.id === state.refundConfirmId);
    if (order) {
      order.payment = "已退款";
      order.fulfillment = "已关闭";
      order.logs.unshift("刚刚 · 退款审核通过，订单已关闭");
      state.refundConfirmId = null;
      render();
      showToast(`订单 ${order.id} 已退款并关闭`);
    }
  }
  if (action === "publish-product") {
    state.publishProductOpen = true; state.productDetailId = null; state.productLogTab = "profile"; render();
  }
  if (action === "close-product-drawer") {
    state.publishProductOpen = false; state.productDetailId = null; state.productLogTab = "profile"; render();
  }
  if (action === "reset-inventory-search") {
    state.productTab = "全部商品"; state.productQuery = ""; state.stockFilter = "全部库存"; state.productCategory = "全部分类"; state.productPage = 1; state.selectedInventory.clear(); render();
  }
  if (action === "clear-inventory-selection") { state.selectedInventory.clear(); render(); }
  if (action === "save-product") {
    const form = $("#productEditForm");
    if (form) {
      const data = new FormData(form);
      let product = inventoryProducts.find(item => item.id === state.productDetailId);
      if (!product) {
        product = { id: `XZ-P-${String(Date.now()).slice(-5)}`, sales30: 0, published: new Date().toISOString().slice(0,10), logs: [] };
        inventoryProducts.unshift(product);
      }
      product.name = String(data.get("name") || "未命名商品").trim(); product.category = String(data.get("category")); product.status = String(data.get("status")); product.price = Number(data.get("price") || 0); product.sku = Number(data.get("sku") || 1); product.stock = Number(data.get("stock") || 0); product.quality = String(data.get("quality")); product.description = String(data.get("description") || ""); product.logs.unshift(`刚刚 · ${state.publishProductOpen ? "发布商品" : "编辑商品资料"}`);
      state.publishProductOpen = false; state.productDetailId = null; render(); showToast("商品资料已保存到本地演示数据");
    }
  }
  if (action === "cancel-restock") { state.restockId = null; render(); }
  if (action === "confirm-restock") {
    const product = inventoryProducts.find(item => item.id === state.restockId);
    const amount = Math.max(1, Number($("#restockAmount")?.value || 0));
    if (product) { product.stock += amount; product.logs.unshift(`刚刚 · 补货 ${amount} 件`); if (product.status === "下架" && product.stock > 0) product.status = "在售"; }
    state.restockId = null; render(); showToast(`${product?.name || "商品"} 已补货 ${amount} 件`);
  }
  if (action === "marketing-search") { state.marketingQuery = $("#marketingQuery")?.value || ""; render(); }
  if (action === "create-campaign") { state.campaignCreateOpen = true; state.campaignDetailId = null; state.campaignEditMode = true; render(); }
  if (action === "close-campaign-drawer") { state.campaignCreateOpen = false; state.campaignDetailId = null; state.campaignEditMode = false; render(); }
  if (action === "edit-campaign") { state.campaignEditMode = true; render(); }
  if (action === "save-campaign") {
    const form = $("#campaignEditForm");
    if (form) {
      const data = new FormData(form); let campaign = marketingCampaigns.find(item => item.id === state.campaignDetailId);
      if (!campaign) { campaign = { id:`MK-${String(Date.now()).slice(-8)}`, participants:0, conversion:"--", logs:[] }; marketingCampaigns.unshift(campaign); }
      campaign.name = String(data.get("name") || "未命名活动").trim(); campaign.subtitle = String(data.get("subtitle") || ""); campaign.start = String(data.get("start")); campaign.end = String(data.get("end")); campaign.type = String(data.get("type")); campaign.status = String(data.get("status")); campaign.channels = String(data.get("channels") || "小程序").split(/[、,，|]/).map(v=>v.trim()).filter(Boolean); campaign.logs.unshift(`刚刚 · ${state.campaignCreateOpen ? "创建活动" : "编辑活动"}`); state.campaignLogs.unshift(`刚刚 · ${state.campaignCreateOpen ? "创建" : "更新"}活动「${campaign.name}」`); state.campaignCreateOpen=false; state.campaignDetailId=null; state.campaignEditMode=false; render(); showToast("活动已保存到本地演示数据");
    }
  }
  if (action === "new-touch-plan") { state.touchPlanType = event.target.closest("[data-tool-plan]")?.dataset.toolPlan || "Push推送"; state.touchPlanOpen = true; render(); }
  if (action === "close-touch-plan") { state.touchPlanOpen = false; render(); }
  if (action === "save-touch-plan") {
    const form = $("#touchPlanForm"); if (form) { const data = new FormData(form); state.campaignLogs.unshift(`刚刚 · 创建${data.get("channel")}计划「${data.get("name")}」· 人群：${data.get("audience")}`); state.touchPlanOpen=false; render(); showToast("触达计划已保存并写入本地日志"); }
  }
  if (action === "collapse-filters") {
    $("#tradeFilters").classList.toggle("collapsed");
    event.target.innerHTML = $("#tradeFilters").classList.contains("collapsed") ? "⌄ 展开筛选项" : "⌃ 收起筛选项";
  }
  if (action === "clear-filters") {
    $$("#tradeFilters input").forEach(input => input.value = "");
    $$("#tradeFilters .select-trigger b").forEach(el => el.textContent = "全部");
    showToast("筛选条件已清除");
  }
  if (action === "trade-search") filterOrders();
  if (action === "product-search") filterProducts();
  if (action === "export-products") exportInventoryCSV();
  if (action === "clear-product") {
    $$(".product-filters input").forEach(input => input.value = "");
    $$(".product-filters .select-trigger b").forEach(el => el.textContent = "请选择");
    $$(".quality-chip").forEach((chip, index) => chip.classList.toggle("active", index === 0));
    filterProducts();
  }
  if (action === "toast") showToast(event.target.closest("[data-message]")?.dataset.message || "操作已记录");

  const memberLevel = event.target.closest("[data-member-level]");
  if (memberLevel) {
    state.memberLevel = memberLevel.dataset.memberLevel;
    state.selectedMembers.clear();
    render();
  }
  const memberStatus = event.target.closest("[data-member-status]");
  if (memberStatus) {
    state.memberStatus = memberStatus.dataset.memberStatus;
    state.selectedMembers.clear();
    render();
  }
  const memberDetail = event.target.closest("[data-member-detail]");
  if (memberDetail) {
    state.memberDetailId = memberDetail.dataset.memberDetail;
    state.memberDrawerTab = "profile";
    state.memberEditMode = false;
    state.contactChannel = "site";
    render();
  }
  const drawerTab = event.target.closest("[data-member-drawer-tab]");
  if (drawerTab) {
    state.memberDrawerTab = drawerTab.dataset.memberDrawerTab;
    state.memberEditMode = false;
    render();
  }
  const contactChannel = event.target.closest("[data-contact-channel]");
  if (contactChannel) {
    state.contactChannel = contactChannel.dataset.contactChannel;
    $$("[data-contact-channel]").forEach(button => button.classList.toggle("active", button === contactChannel));
  }
  const copyId = event.target.closest("[data-copy-member-id]");
  if (copyId) copyMemberId(copyId.dataset.copyMemberId);
  const inventoryTab = event.target.closest("[data-inventory-tab]");
  if (inventoryTab) { state.productTab = inventoryTab.dataset.inventoryTab; state.productPage = 1; state.selectedInventory.clear(); render(); }
  const inventoryPage = event.target.closest("[data-product-page]");
  if (inventoryPage && !inventoryPage.disabled) { state.productPage = Number(inventoryPage.dataset.productPage); render(); showToast(`已切换到商品第 ${state.productPage} 页`); }
  const mentorSection = event.target.closest("[data-mentor-section]");
  if (mentorSection) { state.mentorSection = mentorSection.dataset.mentorSection; state.mentorStatus = "全部"; state.selectedMentors.clear(); render(); showToast(`已切换至${state.mentorSection}`); }
  const mentorStatus = event.target.closest("[data-mentor-status]");
  if (mentorStatus) { state.mentorStatus = mentorStatus.dataset.mentorStatus; state.selectedMentors.clear(); render(); }
  const mentorTrend = event.target.closest("[data-mentor-trend]");
  if (mentorTrend) { state.mentorTrendRange = mentorTrend.dataset.mentorTrend; renderMotionMode = "charts"; render(); }
  const financeNav = event.target.closest("[data-finance-nav]");
  if (financeNav) { state.secondaryActive.finance = financeNav.dataset.financeNav; render(); showToast(`已切换至财务${state.secondaryActive.finance}`); }
  const editProduct = event.target.closest("[data-edit-product]");
  if (editProduct) { state.productDetailId = editProduct.dataset.editProduct; state.publishProductOpen=false; state.productLogTab="profile"; render(); }
  const toggleProduct = event.target.closest("[data-toggle-product]");
  if (toggleProduct) { const product=inventoryProducts.find(item=>item.id===toggleProduct.dataset.toggleProduct); if(product){product.status=product.status==="在售"?"下架":"在售"; product.logs.unshift(`刚刚 · 商品${product.status}`); render(); showToast(`${product.name} 已${product.status}`);} }
  const restockProduct = event.target.closest("[data-restock-product]");
  if (restockProduct) { state.restockId = restockProduct.dataset.restockProduct; render(); }
  const copyProductId = event.target.closest("[data-copy-product-id]");
  if (copyProductId) copyMemberId(copyProductId.dataset.copyProductId, "商品编号");
  const productDrawerTab = event.target.closest("[data-product-drawer-tab]");
  if (productDrawerTab) { state.productLogTab = productDrawerTab.dataset.productDrawerTab; render(); }
  const campaignDetail = event.target.closest("[data-campaign-detail]");
  if (campaignDetail) { state.campaignDetailId=campaignDetail.dataset.campaignDetail; state.campaignEditMode=false; state.campaignCreateOpen=false; render(); }
  const campaignEdit = event.target.closest("[data-campaign-edit]");
  if (campaignEdit) { state.campaignDetailId=campaignEdit.dataset.campaignEdit; state.campaignEditMode=true; state.campaignCreateOpen=false; render(); }
  const marketingTool = event.target.closest("[data-marketing-tool]");
  if (marketingTool) { state.touchPlanType=marketingTool.dataset.marketingTool; state.touchPlanOpen=true; render(); }
  const tradeStatus = event.target.closest("[data-trade-status]");
  if (tradeStatus) {
    state.tradeStatus = tradeStatus.dataset.tradeStatus;
    render();
  }
  const tradeDetail = event.target.closest("[data-trade-detail]");
  if (tradeDetail) {
    state.tradeDetailId = tradeDetail.dataset.tradeDetail;
    state.tradeNoteEditing = false;
    render();
  }
  const tradeNote = event.target.closest("[data-trade-note]");
  if (tradeNote) {
    state.tradeDetailId = tradeNote.dataset.tradeNote;
    state.tradeNoteEditing = true;
    render();
    requestAnimationFrame(() => $("#tradeNoteInput")?.focus());
  }
  const refundOrder = event.target.closest("[data-refund-order]");
  if (refundOrder) {
    state.refundConfirmId = refundOrder.dataset.refundOrder;
    render();
  }
  const tradeTodo = event.target.closest("[data-trade-todo]");
  if (tradeTodo) {
    state.tradeFinanceFocus = tradeTodo.dataset.tradeTodo;
    state.secondaryActive.trade = tradeTodo.dataset.tradeSection;
    if (tradeTodo.dataset.tradeTodo === "refund") state.tradeStatus = "退款中";
    render();
    requestAnimationFrame(() => (tradeTodo.dataset.tradeTodo === "refund" ? $(".trade-order-section") : $(".trade-finance-layout"))?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const status = event.target.closest("[data-status]");
  if (status) {
    $$("[data-status]").forEach(tab => tab.classList.toggle("active", tab === status));
    $$(".pagination button[data-page-num]").forEach(button => button.classList.toggle("active", button.dataset.pageNum === "1"));
    applyTradeView();
    showToast(`已切换到「${status.dataset.status}」`);
  }
  const productTab = event.target.closest("[data-product-tab]");
  if (productTab) {
    $$("[data-product-tab]").forEach(tab => tab.classList.toggle("active", tab === productTab));
    applyProductTab(productTab.dataset.productTab);
    showToast(`已切换到「${productTab.dataset.productTab}」`);
  }
  const trendRange = event.target.closest("[data-trend-range]");
  if (trendRange) {
    state.trendRange = trendRange.dataset.trendRange;
    renderMotionMode = "charts";
    render();
  }
  const trendMetric = event.target.closest("[data-trend-metric]");
  if (trendMetric) {
    state.trendMetric = trendMetric.dataset.trendMetric;
    renderMotionMode = "charts";
    render();
  }
  const reminderTab = event.target.closest("[data-reminder-tab]");
  if (reminderTab) {
    state.reminderTab = reminderTab.dataset.reminderTab;
    state.messageOpen = true;
    render();
  }
  const serviceTab = event.target.closest("[data-service-tab]");
  if (serviceTab) {
    $$("[data-service-tab]").forEach(tab => tab.classList.toggle("active", tab === serviceTab));
    if ($("#serviceDataTitle")) $("#serviceDataTitle").textContent = serviceTab.dataset.serviceTab;
    updateServiceContent(serviceTab.dataset.serviceTab);
    replayChartMotion();
    showToast(`已切换到「${serviceTab.dataset.serviceTab}」`);
  }
  const range = event.target.closest("[data-range]");
  if (range) {
    $$("[data-range]").forEach(button => {
      button.classList.toggle("primary", button === range);
      button.classList.toggle("active", button === range);
    });
    updateFinanceRange(range.dataset.range);
    replayChartMotion();
  }
  const pageButton = event.target.closest("[data-page-num]");
  if (pageButton) {
    let next = pageButton.dataset.pageNum;
    const active = Number($(".pagination button.active")?.dataset.pageNum || 1);
    if (next === "prev") next = String(Math.max(1, active - 1));
    if (next === "next") next = String(Math.min(3, active + 1));
    $$(".pagination button[data-page-num]").forEach(button => button.classList.toggle("active", button.dataset.pageNum === next));
    applyTradeView();
    showToast(`已切换到第 ${next} 页`);
  }
  const batch = event.target.closest("[data-batch]");
  if (batch) showToast(`${batch.dataset.batch}：已选 ${$$(".order-check:checked").length} 个演示订单`);
  const qualityChip = event.target.closest(".quality-chip");
  if (qualityChip) {
    $$(".quality-chip").forEach(chip => chip.classList.toggle("active", chip === qualityChip));
  }
  const assistantPrompt = event.target.closest("[data-assistant-prompt]");
  if (assistantPrompt) submitAssistantPrompt(assistantPrompt.dataset.assistantPrompt);
  const assistantSession = event.target.closest("[data-assistant-session-index]");
  if (assistantSession) {
    const selectedIndex = Number(assistantSession.dataset.assistantSessionIndex);
    const selected = state.assistantSessions[selectedIndex];
    if (selected) {
      state.assistantSessions.splice(selectedIndex, 1);
      state.assistantMessages = selected.messages.map(message => ({ ...message }));
      state.assistantHistoryOpen = false;
      render();
      requestAnimationFrame(() => {
        const conversation = $("#assistantConversation");
        if (conversation) conversation.scrollTop = conversation.scrollHeight;
      });
    }
  }
  if (!event.target.closest(".popover") && !event.target.closest(".field")) closePopovers();
});

function showTrendTooltip(zone) {
  const wrap = zone.closest(".trend-chart-wrap");
  const tooltip = wrap?.querySelector(".trend-tooltip");
  if (!tooltip) return;
  const x = Number(zone.dataset.tooltipX);
  tooltip.innerHTML = `<b>${zone.dataset.tooltipDate}</b><span><i></i>成交额<strong>${zone.dataset.tooltipSales}</strong></span><span><i class="orders"></i>订单数<strong>${zone.dataset.tooltipOrders}</strong></span>`;
  tooltip.style.left = `${x}%`;
  tooltip.classList.toggle("align-left", x < 24);
  tooltip.classList.toggle("align-right", x > 76);
  tooltip.classList.add("show");
  tooltip.setAttribute("aria-hidden", "false");
}

function hideTrendTooltip(zone) {
  const tooltip = zone.closest(".trend-chart-wrap")?.querySelector(".trend-tooltip");
  if (!tooltip) return;
  tooltip.classList.remove("show", "align-left", "align-right");
  tooltip.setAttribute("aria-hidden", "true");
}

document.addEventListener("pointerover", event => {
  const zone = event.target.closest?.(".trend-hover-zone");
  if (zone) showTrendTooltip(zone);
});

document.addEventListener("pointerout", event => {
  const zone = event.target.closest?.(".trend-hover-zone");
  if (zone && !zone.contains(event.relatedTarget)) hideTrendTooltip(zone);
});

document.addEventListener("focusin", event => {
  const zone = event.target.closest?.(".trend-hover-zone");
  if (zone) showTrendTooltip(zone);
});

document.addEventListener("focusout", event => {
  const zone = event.target.closest?.(".trend-hover-zone");
  if (zone) hideTrendTooltip(zone);
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-marketing-status]")) { state.marketingStatus = event.target.value; render(); return; }
  if (event.target.matches("[data-product-category]")) { state.productCategory = event.target.value; state.productPage = 1; state.selectedInventory.clear(); render(); return; }
  if (event.target.matches("[data-mentor-sort]")) { state.mentorSort = event.target.value; render(); return; }
  if (event.target.matches("[data-stock-filter]")) { state.stockFilter = event.target.value; state.productPage = 1; state.selectedInventory.clear(); render(); return; }
  if (event.target.matches("[data-select-all='inventory']")) { const ids=getFilteredInventory().map(product=>product.id); if(event.target.checked) ids.forEach(id=>state.selectedInventory.add(id)); else ids.forEach(id=>state.selectedInventory.delete(id)); render(); return; }
  if (event.target.matches(".inventory-check")) { if(event.target.checked) state.selectedInventory.add(event.target.value); else state.selectedInventory.delete(event.target.value); render(); return; }
  if (event.target.matches("[data-trade-filter]")) {
    const map = { type: "tradeType", payment: "tradePayment", fulfillment: "tradeFulfillment" };
    state[map[event.target.dataset.tradeFilter]] = event.target.value;
    render();
    return;
  }
  if (event.target.matches("[data-hide-silent]")) {
    state.hideSilent = event.target.checked;
    state.selectedMembers.clear();
    render();
    return;
  }
  if (event.target.matches("[data-select-all='members']")) {
    const visibleIds = getFilteredMembers().map(user => user.id);
    if (event.target.checked) visibleIds.forEach(id => state.selectedMembers.add(id));
    else visibleIds.forEach(id => state.selectedMembers.delete(id));
    render();
    return;
  }
  if (event.target.matches(".member-check")) {
    if (event.target.checked) state.selectedMembers.add(event.target.value);
    else state.selectedMembers.delete(event.target.value);
    render();
    return;
  }
  if (event.target.matches("[data-select-all='products']")) {
    $$(".product-check").forEach(check => check.checked = event.target.checked);
  }
  if (event.target.matches("[data-select-all='mentor']")) {
    $$(".mentor-check").forEach(check => { if (event.target.checked) state.selectedMentors.add(check.value); else state.selectedMentors.delete(check.value); });
    render();
    return;
  }
  if (event.target.matches(".mentor-check")) {
    if (event.target.checked) state.selectedMentors.add(event.target.value); else state.selectedMentors.delete(event.target.value);
    render();
    return;
  }
  if (event.target.matches(".product-check") || event.target.matches("[data-select-all='products']")) {
    const count = $$(".product-check:checked").length;
    if ($("#selectedProducts")) $("#selectedProducts").textContent = count;
  }
  if (event.target.matches("[data-select-all='orders']")) {
    $$(".order-check").forEach(check => check.checked = event.target.checked);
  }
  if (event.target.matches(".order-check") || event.target.matches("[data-select-all='orders']")) {
    const count = $$(".order-check:checked").length;
    if ($("#selectedOrders")) $("#selectedOrders").textContent = String(count);
    $$('[data-batch]').forEach(button => button.disabled = count === 0);
  }
});

window.addEventListener("hashchange", () => {
  const next = location.hash.slice(1);
  if (next && next !== state.page && pageNames[next]) {
    state.page = next;
    renderMotionMode = "page";
    state.messageOpen = false;
    render();
  }
});

render();
