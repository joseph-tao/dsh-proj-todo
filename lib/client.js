window.__ModuleLoader__.load({
  id: "dsh-proj-todo",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");
    const h = React.createElement;

    const NS = "projTodo";
    const TODO_ID = "dsh-proj-todo";
    const TODO_KIND = "todo";
    const API_PATH = "/dsh-proj-todo/api";
    const MINUTE = 60 * 1000;

    const CSS = `
    .proj-todo-root{
      --pt-border:color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent);
      --pt-border-strong:color-mix(in srgb,var(--dsw-alias-label-primary) 30%,transparent);
      --pt-fill:var(--dsw-alias-fill-l1);
      --pt-menu:var(--dsw-specific-menu,#fff);
      --pt-accent:var(--dsw-alias-state-business-primary,#3b82f6);
      --pt-danger:var(--dsw-alias-state-error-primary,#dc2626);
      height:100%;max-height:100%;min-width:0;min-height:0;overflow:hidden;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);
      font-size:14px;line-height:21px
    }
    .proj-todo-root *{box-sizing:border-box}
    .proj-todo-head{display:flex;align-items:center;gap:8px;padding:14px 16px 10px;flex:none}
    .proj-todo-heading{font-size:17px;font-weight:650;line-height:24px;flex:1;min-width:0}
    .proj-todo-count{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;margin-left:7px}
    .proj-todo-iconbtn{box-sizing:border-box;border:1px solid transparent;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-tertiary);width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;flex:none}
    @media(hover:hover){.proj-todo-iconbtn:hover{background:var(--pt-fill);color:var(--dsw-alias-label-primary);border-color:var(--pt-border)}}
    .proj-todo-iconbtn:focus-visible,.proj-todo-btn:focus-visible,.proj-todo-check:focus-visible,.proj-todo-segbtn:focus-visible{outline:2px solid var(--pt-accent);outline-offset:2px}
    .proj-todo-toolbar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:0 16px 10px;flex:none}
    .proj-todo-segment{display:inline-flex;align-items:center;background:0 0;border:0;border-radius:0;padding:0;gap:2px}
    .proj-todo-segbtn{border:0;background:0 0;color:var(--dsw-alias-label-tertiary);border-radius:0;font:inherit;font-size:12px;line-height:22px;padding:0 5px;cursor:pointer;white-space:nowrap}
    .proj-todo-segbtn[data-on="true"]{background:0 0;color:var(--pt-accent);font-weight:600;box-shadow:none}
    .proj-todo-select{appearance:none;box-sizing:border-box;border:1px solid var(--pt-border);background:var(--pt-menu);color:var(--dsw-alias-label-primary);border-radius:var(--dsw-radius-sm);font:inherit;font-size:12px;font-weight:500;line-height:19px;height:28px;padding:2px 24px 2px 8px;max-width:176px;background-image:linear-gradient(45deg,transparent 50%,var(--dsw-alias-label-primary) 50%),linear-gradient(135deg,var(--dsw-alias-label-primary) 50%,transparent 50%);background-position:calc(100% - 12px) 12px,calc(100% - 8px) 12px;background-size:4px 4px,4px 4px;background-repeat:no-repeat;cursor:pointer}
    .proj-todo-sortdir{border:1px solid transparent;border-radius:var(--dsw-radius-sm);background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;line-height:22px;width:27px;height:28px;padding:0;cursor:pointer;flex:none}
    @media(hover:hover){.proj-todo-sortdir:hover{background:var(--pt-fill);border-color:var(--pt-border)}}
    .proj-todo-add{margin:0 16px 12px;padding:10px;border:1px solid var(--pt-border);border-radius:var(--dsw-radius-lg);background:var(--pt-fill);flex:none}
    .proj-todo-addrow{display:flex;gap:6px;align-items:flex-end}
    .proj-todo-field{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
    .proj-todo-field .proj-todo-input{flex:1}
    .proj-todo-label{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:15px;white-space:nowrap}
    .proj-todo-input,.proj-todo-textarea{box-sizing:border-box;width:100%;border:1px solid var(--pt-border-strong);border-radius:var(--dsw-radius-sm);background:var(--pt-menu);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;padding:5px 8px;outline:none;min-width:0}
    .proj-todo-input:focus,.proj-todo-textarea:focus{border-color:var(--pt-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--pt-accent) 14%,transparent)}
    .proj-todo-textarea{resize:vertical;min-height:54px}
    .proj-todo-subrow{display:flex;gap:6px;margin-top:6px;align-items:center}
    .proj-todo-subrow .proj-todo-input{flex:1;min-width:0}
    .proj-todo-btn{border:1px solid var(--pt-border-strong);border-radius:var(--dsw-radius-sm);background:var(--pt-menu);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:19px;padding:4px 9px;cursor:pointer;white-space:nowrap}
    .proj-todo-btn[data-primary="true"]{border-color:var(--pt-accent);background:var(--pt-accent);color:#fff}
    .proj-todo-btn:disabled{opacity:.5;cursor:default}
    .proj-todo-list{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 10px 18px;position:relative}
    .proj-todo-list-inner{position:relative}
    .proj-todo-now-line{position:absolute;top:0;bottom:0;width:0;border-left:2px dashed var(--pt-accent);z-index:4;pointer-events:none;opacity:.85}
    .proj-todo-item-wrap{margin:1px 6px;position:relative}
    .proj-todo-hoverinfo{display:none;margin:4px 0 2px 31px;padding-top:4px;border-top:1px dashed var(--pt-border);color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow:hidden}
    .proj-todo-item-wrap:hover .proj-todo-hoverinfo{display:block}
    .proj-todo-item{display:flex;gap:8px;align-items:flex-start;border:1px solid transparent;border-radius:var(--dsw-radius-md);padding:7px 6px;position:relative}
    @media(hover:hover){.proj-todo-item:hover{background:var(--pt-fill);border-color:var(--pt-border)}}
    .proj-todo-check{box-sizing:border-box;width:18px;height:18px;margin:1px 0 0;flex:none;border:1px solid var(--pt-border-strong);border-radius:5px;background:var(--pt-menu);color:#fff;display:inline-flex;align-items:center;justify-content:center;padding:0;cursor:pointer}
    .proj-todo-check[data-done="true"]{background:var(--pt-accent);border-color:var(--pt-accent)}
    .proj-todo-main{flex:1;min-width:0}
    .proj-todo-compact{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}
    .proj-todo-text{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:21px}
    .proj-todo-item[data-done="true"] .proj-todo-text{color:var(--dsw-alias-label-tertiary)}
    .proj-todo-group{flex:none;min-width:0;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb,var(--pt-accent) 12%,transparent);border:1px solid color-mix(in srgb,var(--pt-accent) 24%,transparent);border-radius:4px;padding:0 5px;font-size:11px;line-height:17px}
    .proj-todo-detail-row{display:flex;align-items:center;gap:2px;min-width:0;margin-top:3px}
    .proj-todo-detail-left{flex:0 0 var(--pt-left-width,auto);width:var(--pt-left-width,auto);min-width:0;max-width:calc(50% - 1px);overflow:hidden;padding-right:4px}
    .proj-todo-detail-name-row{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}
    .proj-todo-detail-name{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;line-height:21px}
    .proj-todo-detail-name-row .proj-todo-group{flex:0 1 auto;max-width:50%}
    .proj-todo-item[data-done="true"] .proj-todo-detail-name{color:var(--dsw-alias-label-tertiary)}
    .proj-todo-detail-meta{display:flex;align-items:center;min-width:0;overflow:hidden}
    .proj-todo-deadline{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
    .proj-todo-detail-right{flex:1 1 50%;min-width:0;display:flex;align-items:center;overflow:hidden}
    .proj-todo-progress{position:relative;height:20px;min-width:0;flex:1 1 auto;width:100%}
    .proj-todo-progress-track{position:absolute;left:0;right:0;top:9px;height:2px;border-radius:999px;background:var(--pt-border)}
    .proj-todo-progress-fill{position:absolute;top:6px;height:8px;min-width:2px;border-radius:999px;background:var(--pt-accent)}
    .proj-todo-progress-start,.proj-todo-progress-due{position:absolute;top:3px;width:0;height:14px;margin-left:-1px}
    .proj-todo-progress-start{border-left:2px solid var(--dsw-alias-label-secondary);z-index:1}
    .proj-todo-progress-due{border-left:2px solid var(--pt-danger);z-index:2}
    .proj-todo-menu{position:fixed;z-index:10000;min-width:136px;padding:3px;border:1px solid var(--pt-border);border-radius:var(--dsw-radius-sm);background:var(--pt-menu);display:flex;flex-direction:column;gap:1px}
    .proj-todo-menu button{display:block;width:100%;text-align:left;border:0;border-radius:2px;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:19px;padding:6px 9px;cursor:pointer}
    @media(hover:hover){.proj-todo-menu button:hover{background:var(--pt-fill)}}
    .proj-todo-menu button[data-danger="true"]{color:var(--pt-danger)}
    .proj-todo-edit{margin:4px 6px 8px;padding:9px;border:1px solid var(--pt-border-strong);border-radius:var(--dsw-radius-md);background:var(--pt-menu)}
    .proj-todo-empty{padding:32px 20px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:20px}
    .proj-todo-empty strong{display:block;color:var(--dsw-alias-label-secondary);font-size:14px;margin-bottom:3px}
    .proj-todo-status{padding:0 16px 10px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px;min-height:17px}
    .proj-todo-error{color:var(--pt-danger);padding:0 16px 10px;font-size:12px;line-height:17px;overflow-wrap:anywhere}
    `;
    const styleId = "dsh-proj-todo/client.css";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-proj-todo";
      tag.dataset.pluginCss = styleId;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    const en = {
      "type.label": "Todos",
      "guide.title": "Project todos",
      "guide.description": "A graphical todo list stored in this workspace",
      title: "Todos",
      count: "{active} active · {total} total",
      filter: "Show",
      "filter.all": "All",
      "filter.active": "Active",
      "filter.completed": "Completed",
      "group.all": "All groups",
      "group.uncategorized": "Uncategorized",
      "view.label": "View",
      "view.compact": "Compact",
      "view.detailed": "Detailed",
      "sort.label": "Sort",
      "sort.createdAt": "Added time",
      "sort.completedAt": "Completion time",
      "sort.dueAt": "DDL",
      "sort.group": "Group",
      "sort.asc": "Ascending",
      "sort.desc": "Descending",
      "sort.toggle": "Reverse sort order",
      "add.placeholder": "What needs doing?",
      "field.text": "Todo",
      "field.createdAt": "Created",
      "field.completedAt": "Completed",
      "add.group": "Group",
      "add.due": "DDL",
      "now.label": "Now",
      "add.submit": "Add todo",
      "add.needText": "Type a todo first.",
      "edit.save": "Save",
      "edit.cancel": "Cancel",
      "item.edit": "Edit",
      "item.delete": "Delete",
      "item.undo": "Undo",
      "item.completed": "Mark incomplete",
      "item.active": "Mark complete",
      "item.deleteConfirm": "Delete this todo?",
      "detail.resize": "Drag to resize",
      "deadline.none": "No DDL",
      "meta.due": "DDL {time}",
      "progress.added": "Added {time}",
      "progress.now": "Now {time}",
      "progress.due": "DDL {time}",
      "progress.completed": "Completed {time}",
      "hover.added": "Added: {time}",
      "hover.completed": "Completed: {time}",
      "hover.due": "DDL: {time}",
      "empty.title": "No todos yet",
      "empty.body": "Add one above. It will be stored in .dsh/todo.jsonl.",
      "empty.filtered": "Nothing matches these filters.",
      loading: "Loading todos…",
      saving: "Saving…",
      saved: "Saved",
      reload: "Reload",
      noWorkspace: "This session has no workspace directory.",
      file: "Stored in {file}",
      "error.load": "Could not load todos: {message}",
      "error.save": "Could not save todos: {message}",
      "warning.lines": "Skipped malformed lines: {count}",
    };
    const zh = {
      "type.label": "待办",
      "guide.title": "项目待办",
      "guide.description": "保存在当前工作区中的图形化待办列表",
      title: "待办",
      count: "{active} 个未完成 · 共 {total} 个",
      filter: "显示",
      "filter.all": "全部",
      "filter.active": "仅未完成",
      "filter.completed": "仅已完成",
      "group.all": "全部分组",
      "group.uncategorized": "未分类",
      "view.label": "视图",
      "view.compact": "紧凑",
      "view.detailed": "详细",
      "sort.label": "排序",
      "sort.createdAt": "添加时间",
      "sort.completedAt": "完成时间",
      "sort.dueAt": "DDL 时间",
      "sort.group": "分组",
      "sort.asc": "升序",
      "sort.desc": "降序",
      "sort.toggle": "反转排序方向",
      "add.placeholder": "要做什么？",
      "field.text": "待办",
      "field.createdAt": "创建时间",
      "field.completedAt": "完成时间",
      "add.group": "分组",
      "add.due": "DDL",
      "now.label": "现在",
      "add.submit": "添加待办",
      "add.needText": "请先输入待办内容。",
      "edit.save": "保存",
      "edit.cancel": "取消",
      "item.edit": "编辑",
      "item.delete": "删除",
      "item.undo": "撤销",
      "item.completed": "标记为未完成",
      "item.active": "标记为已完成",
      "item.deleteConfirm": "删除这条待办？",
      "detail.resize": "拖动调整宽度",
      "deadline.none": "无 DDL",
      "meta.due": "DDL {time}",
      "progress.added": "添加于 {time}",
      "progress.now": "当前 {time}",
      "progress.due": "DDL {time}",
      "progress.completed": "完成于 {time}",
      "hover.added": "添加：{time}",
      "hover.completed": "完成：{time}",
      "hover.due": "DDL：{time}",
      "empty.title": "还没有待办",
      "empty.body": "在上方添加一条待办，它会保存在 .dsh/todo.jsonl。",
      "empty.filtered": "没有符合当前筛选条件的待办。",
      loading: "正在加载待办…",
      saving: "正在保存…",
      saved: "已保存",
      reload: "重新加载",
      noWorkspace: "当前会话没有工作区目录。",
      file: "保存于 {file}",
      "error.load": "加载待办失败：{message}",
      "error.save": "保存待办失败：{message}",
      "warning.lines": "已跳过格式错误行：{count}",
    };

    function TodoGuideIcon() {
      return h("svg", { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true },
        h("rect", { x: 4, y: 3, width: 16, height: 18, rx: 3, stroke: "currentColor", strokeWidth: 1.6 }),
        h("path", { d: "M8 8.5l1.5 1.5L12 7.5M8 14.5l1.5 1.5L12 13.5", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }),
        h("path", { d: "M14 9h3M14 15h3", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" })
      );
    }

    function CheckIcon() {
      return h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", "aria-hidden": true },
        h("path", { d: "M2.2 6.2l2.3 2.3 5-5", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" })
      );
    }

    function RefreshIcon() {
      return h("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true },
        h("path", { d: "M13 8a5 5 0 1 1-1.5-3.6M13 2.5V6H9.5", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" })
      );
    }

    function formatTime(value, fallback) {
      if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
      try {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
      } catch {
        return new Date(value).toLocaleString();
      }
    }

    function pad2(value) {
      return String(value).padStart(2, "0");
    }

    function formatClock(value) {
      try {
        return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
      } catch {
        return "";
      }
    }

    function formatRelativeTime(value, now) {
      if (typeof value !== "number" || !Number.isFinite(value)) return "";
      const diff = value - now;
      const abs = Math.abs(diff);
      let amount;
      let unit;
      if (abs >= 24 * 60 * MINUTE) {
        amount = Math.round(diff / (24 * 60 * MINUTE));
        unit = "day";
      } else if (abs >= 60 * MINUTE) {
        amount = Math.round(diff / (60 * MINUTE));
        unit = "hour";
      } else {
        amount = Math.round(diff / MINUTE);
        unit = "minute";
      }
      try {
        return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(amount, unit);
      } catch {
        return "";
      }
    }

    function toDateTimeLocal(value) {
      if (typeof value !== "number" || !Number.isFinite(value)) return "";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }

    function fromDateTimeLocal(value) {
      if (typeof value !== "string" || value === "") return undefined;
      const time = new Date(value).getTime();
      return Number.isFinite(time) ? time : undefined;
    }

    function nextId() {
      try {
        return globalThis.crypto.randomUUID();
      } catch {
        return "todo-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      }
    }

    function fallbackCompare(a, b) {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    }

    function compareTodos(a, b, field, direction) {
      let aValue;
      let bValue;
      if (field === "group") {
        aValue = a.group ? a.group : null;
        bValue = b.group ? b.group : null;
      } else {
        aValue = typeof a[field] === "number" && Number.isFinite(a[field]) ? a[field] : null;
        bValue = typeof b[field] === "number" && Number.isFinite(b[field]) ? b[field] : null;
      }
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      const compared = typeof aValue === "string" ? fallbackCompare(aValue, bValue) : aValue - bValue;
      return direction === "desc" ? -compared : compared;
    }

    function buildProgressDomain(todos, now) {
      const points = [now];
      for (const todo of todos) {
        for (const field of ["createdAt", "completedAt", "dueAt"]) {
          const value = todo[field];
          if (typeof value === "number" && Number.isFinite(value)) points.push(value);
        }
      }
      let start = Math.min(...points);
      let end = Math.max(...points);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        start = now - 60 * MINUTE;
        end = now + 60 * MINUTE;
      } else if (end <= start) {
        start -= 60 * MINUTE;
        end += 60 * MINUTE;
      } else {
        const padding = Math.max((end - start) * 0.04, MINUTE);
        start -= padding;
        end += padding;
      }
      return { start, end };
    }

    function progressPosition(value, domain) {
      if (typeof value !== "number" || !Number.isFinite(value)) return null;
      return Math.min(100, Math.max(0, ((value - domain.start) / (domain.end - domain.start)) * 100));
    }

    function TodoProgress({ item, domain, now, t }) {
      if (typeof item.createdAt !== "number" || !Number.isFinite(item.createdAt)) {
        return h("div", { className: "proj-todo-progress", "aria-hidden": true });
      }
      const start = progressPosition(item.createdAt, domain);
      const due = progressPosition(item.dueAt, domain);
      const completed = item.completed ? progressPosition(item.completedAt, domain) : null;
      return h("div", { className: "proj-todo-progress" },
        h("div", { className: "proj-todo-progress-track" }),
        completed !== null && completed >= start
          ? h("div", { className: "proj-todo-progress-fill", style: { left: `${start}%`, width: `${Math.max(0, completed - start)}%` } })
          : null,
        h("div", { className: "proj-todo-progress-start", style: { left: `${start}%` } }),
        due !== null ? h("div", { className: "proj-todo-progress-due", style: { left: `${due}%` } }) : null
      );
    }

    function TodoBody(props) {
      const { sessionId, useSessions, t } = props;
      const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
      const [items, setItems] = React.useState([]);
      const [loading, setLoading] = React.useState(true);
      const [saving, setSaving] = React.useState(false);
      const [error, setError] = React.useState(null);
      const [warning, setWarning] = React.useState(null);
      const [statusFilter, setStatusFilter] = React.useState("all");
      const [groupFilter, setGroupFilter] = React.useState("");
      const [viewMode, setViewMode] = React.useState("detailed");
      const [sortBy, setSortBy] = React.useState("createdAt");
      const [sortDirection, setSortDirection] = React.useState("desc");
      const [text, setText] = React.useState("");
      const [group, setGroup] = React.useState("");
      const [dueInput, setDueInput] = React.useState("");
      const [editingId, setEditingId] = React.useState(null);
      const [draft, setDraft] = React.useState({ text: "", group: "", dueAt: "", createdAt: "", completedAt: "" });
      const [addError, setAddError] = React.useState(null);
      const [menu, setMenu] = React.useState(null);
      const [now, setNow] = React.useState(() => Date.now());
      const listInnerRef = React.useRef(null);
      const nowLineRef = React.useRef(null);
      const leftRefs = React.useRef(new Map());
      const contentWidthRef = React.useRef(0);
      const nowPercentRef = React.useRef(null);
      const layoutFrameRef = React.useRef(null);

      React.useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), MINUTE);
        return () => clearInterval(timer);
      }, []);

      React.useEffect(() => {
        if (!menu) return undefined;
        function closeMenu(event) {
          if (event.target instanceof Element && event.target.closest(".proj-todo-menu")) return;
          setMenu(null);
        }
        document.addEventListener("pointerdown", closeMenu);
        window.addEventListener("blur", closeMenu);
        return () => {
          document.removeEventListener("pointerdown", closeMenu);
          window.removeEventListener("blur", closeMenu);
        };
      }, [menu]);

      const load = React.useCallback(async () => {
        if (!cwd) {
          setLoading(false);
          return;
        }
        setLoading(true);
        setError(null);
        setWarning(null);
        try {
          const response = await fetch(`${API_PATH}?workspace=${encodeURIComponent(cwd)}`, { credentials: "same-origin" });
          const body = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(body.message || `HTTP ${response.status}`);
          setItems(Array.isArray(body.todos) ? body.todos : []);
          if (Array.isArray(body.errors) && body.errors.length > 0) setWarning(t("warning.lines", { count: body.errors.length }));
        } catch (cause) {
          setError(t("error.load", { message: cause instanceof Error ? cause.message : String(cause) }));
        } finally {
          setLoading(false);
        }
      }, [cwd, t]);

      React.useEffect(() => {
        void load();
      }, [load]);

      const save = React.useCallback(async (nextItems) => {
        if (!cwd) return false;
        setSaving(true);
        setError(null);
        try {
          const response = await fetch(API_PATH, {
            method: "PUT",
            credentials: "same-origin",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ workspace: cwd, todos: nextItems }),
          });
          const body = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(body.message || `HTTP ${response.status}`);
          setItems(nextItems);
          return true;
        } catch (cause) {
          setError(t("error.save", { message: cause instanceof Error ? cause.message : String(cause) }));
          return false;
        } finally {
          setSaving(false);
        }
      }, [cwd, t]);

      const groups = React.useMemo(() => [...new Set(items.map((item) => item.group).filter(Boolean))].sort(fallbackCompare), [items]);

      React.useEffect(() => {
        if (groupFilter && groupFilter !== "__ungrouped__" && !groups.includes(groupFilter)) setGroupFilter("");
      }, [groupFilter, groups]);

      const filtered = React.useMemo(() => items.filter((item) => {
        if (statusFilter === "active" && item.completed) return false;
        if (statusFilter === "completed" && !item.completed) return false;
        if (groupFilter === "__ungrouped__" && item.group) return false;
        if (groupFilter && groupFilter !== "__ungrouped__" && item.group !== groupFilter) return false;
        return true;
      }), [items, statusFilter, groupFilter]);

      const sorted = React.useMemo(() => {
        const copy = [...filtered];
        copy.sort((a, b) => {
          const compared = compareTodos(a, b, sortBy, sortDirection);
          if (compared !== 0) return compared;
          return compareTodos(a, b, "createdAt", "desc");
        });
        return copy;
      }, [filtered, sortBy, sortDirection]);

      const domain = React.useMemo(() => buildProgressDomain(sorted, now), [sorted, now]);
      const nowPercent = progressPosition(now, domain);
      const activeCount = items.filter((item) => !item.completed).length;

      nowPercentRef.current = nowPercent;

      const applyLayout = React.useCallback(() => {
        const inner = listInnerRef.current;
        if (!inner) return;
        const detailed = viewMode === "detailed";
        if (!detailed) {
          contentWidthRef.current = 0;
          inner.style.removeProperty("--pt-left-width");
        } else {
          const row = inner.querySelector(".proj-todo-detail-row");
          const maxLeft = row ? Math.max(0, row.clientWidth * 0.5 - 2) : 0;
          const target = contentWidthRef.current > 0 && maxLeft > 0
            ? Math.min(contentWidthRef.current, maxLeft)
            : 0;
          if (target > 0) inner.style.setProperty("--pt-left-width", `${Math.floor(target)}px`);
          else inner.style.removeProperty("--pt-left-width");
        }
        const line = nowLineRef.current;
        if (!line || !detailed || editingId !== null || nowPercentRef.current === null) return;
        const gantt = inner.querySelector(".proj-todo-detail-row .proj-todo-progress");
        if (!gantt) return;
        const innerRect = inner.getBoundingClientRect();
        const ganttRect = gantt.getBoundingClientRect();
        line.style.left = `${ganttRect.left - innerRect.left + ganttRect.width * (nowPercentRef.current / 100)}px`;
      }, [viewMode, editingId]);

      const scheduleLayout = React.useCallback(() => {
        if (layoutFrameRef.current !== null) return;
        layoutFrameRef.current = requestAnimationFrame(() => {
          layoutFrameRef.current = null;
          applyLayout();
        });
      }, [applyLayout]);

      React.useLayoutEffect(() => {
        if (viewMode !== "detailed") {
          contentWidthRef.current = 0;
          applyLayout();
          return undefined;
        }
        if (editingId !== null) {
          applyLayout();
          return undefined;
        }
        const nodes = [...leftRefs.current.values()];
        let contentWidth = 0;
        for (const node of nodes) {
          const name = node.querySelector(".proj-todo-detail-name");
          const group = node.querySelector(".proj-todo-group");
          const deadline = node.querySelector(".proj-todo-deadline");
          const firstLine = (name?.scrollWidth ?? 0) + (group ? group.scrollWidth + 6 : 0);
          const secondLine = deadline?.scrollWidth ?? 0;
          contentWidth = Math.max(contentWidth, firstLine, secondLine);
        }
        contentWidthRef.current = contentWidth > 0 ? Math.ceil(contentWidth) + 8 : 0;
        applyLayout();
        return undefined;
      }, [viewMode, editingId, sorted, applyLayout]);

      React.useLayoutEffect(() => {
        applyLayout();
      }, [applyLayout, nowPercent, filtered.length]);

      React.useLayoutEffect(() => {
        const inner = listInnerRef.current;
        if (!inner) return undefined;
        const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleLayout) : null;
        if (observer) observer.observe(inner);
        window.addEventListener("resize", scheduleLayout);
        return () => {
          if (observer) observer.disconnect();
          window.removeEventListener("resize", scheduleLayout);
          if (layoutFrameRef.current !== null) {
            cancelAnimationFrame(layoutFrameRef.current);
            layoutFrameRef.current = null;
          }
        };
      }, [scheduleLayout]);

      async function addTodo(event) {
        event.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) {
          setAddError(t("add.needText"));
          return;
        }
        setAddError(null);
        const dueAt = fromDateTimeLocal(dueInput);
        const todo = {
          id: nextId(),
          text: trimmed,
          completed: false,
          createdAt: Date.now(),
          ...(group.trim() ? { group: group.trim() } : {}),
          ...(dueAt === undefined ? {} : { dueAt }),
        };
        if (await save([...items, todo])) {
          setText("");
          setDueInput("");
        }
      }

      async function toggleTodo(item) {
        const next = items.map((candidate) => candidate.id === item.id
          ? {
              ...candidate,
              completed: !candidate.completed,
              ...(candidate.completed ? { completedAt: undefined } : { completedAt: Date.now() }),
            }
          : candidate);
        await save(next);
      }

      function beginEdit(item) {
        setEditingId(item.id);
        setDraft({
          text: item.text,
          group: item.group || "",
          dueAt: toDateTimeLocal(item.dueAt),
          createdAt: toDateTimeLocal(item.createdAt),
          completedAt: toDateTimeLocal(item.completedAt),
        });
      }

      async function saveEdit(item) {
        const trimmed = draft.text.trim();
        if (!trimmed) return;
        const dueAt = fromDateTimeLocal(draft.dueAt);
        const createdAt = fromDateTimeLocal(draft.createdAt);
        const completedAt = item.completed ? fromDateTimeLocal(draft.completedAt) : undefined;
        const next = items.map((candidate) => candidate.id === item.id
          ? {
              ...candidate,
              text: trimmed,
              group: draft.group.trim() || undefined,
              dueAt,
              createdAt,
              completedAt,
            }
          : candidate);
        if (await save(next)) setEditingId(null);
      }

      async function deleteTodo(item) {
        await save(items.filter((candidate) => candidate.id !== item.id));
      }

      function openItemMenu(event, item) {
        event.preventDefault();
        const width = 168;
        const height = 88;
        setMenu({
          id: item.id,
          x: Math.max(8, Math.min(event.clientX, window.innerWidth - width - 8)),
          y: Math.max(8, Math.min(event.clientY, window.innerHeight - height - 8)),
        });
      }

      if (!cwd) {
        return h("div", { className: "proj-todo-root", "data-todo-state": "no-workspace" },
          h("div", { className: "proj-todo-empty" }, t("noWorkspace")));
      }

      const field = (value, onChange, placeholder, extra) => h("input", {
        className: "proj-todo-input",
        value,
        placeholder,
        onChange: (event) => onChange(event.target.value),
        ...(extra || {}),
      });

      function renderItem(item) {
        if (editingId === item.id) {
          return h("div", { className: "proj-todo-edit", key: item.id },
            h("label", { className: "proj-todo-field" },
              h("span", { className: "proj-todo-label" }, t("field.text")),
              h("textarea", {
                className: "proj-todo-textarea",
                value: draft.text,
                "aria-label": t("field.text"),
                onChange: (event) => setDraft({ ...draft, text: event.target.value }),
              })
            ),
            h("div", { className: "proj-todo-subrow" },
              h("label", { className: "proj-todo-field" },
                h("span", { className: "proj-todo-label" }, t("add.group")),
                field(draft.group, (value) => setDraft({ ...draft, group: value }), "", { "aria-label": t("add.group") })
              ),
              h("label", { className: "proj-todo-field" },
                h("span", { className: "proj-todo-label" }, t("add.due")),
                field(draft.dueAt, (value) => setDraft({ ...draft, dueAt: value }), "", { "aria-label": t("add.due"), type: "datetime-local" })
              )
            ),
            h("div", { className: "proj-todo-subrow" },
              h("label", { className: "proj-todo-field" },
                h("span", { className: "proj-todo-label" }, t("field.createdAt")),
                field(draft.createdAt, (value) => setDraft({ ...draft, createdAt: value }), "", { "aria-label": t("field.createdAt"), type: "datetime-local" })
              ),
              h("label", { className: "proj-todo-field" },
                h("span", { className: "proj-todo-label" }, t("field.completedAt")),
                field(draft.completedAt, (value) => setDraft({ ...draft, completedAt: value }), "", { "aria-label": t("field.completedAt"), type: "datetime-local", disabled: !item.completed })
              )
            ),
            h("div", { className: "proj-todo-subrow" },
              h("button", { type: "button", className: "proj-todo-btn", "data-primary": "true", disabled: saving, onClick: () => void saveEdit(item) }, t("edit.save")),
              h("button", { type: "button", className: "proj-todo-btn", onClick: () => setEditingId(null) }, t("edit.cancel"))
            )
          );
        }
        const dueLabel = item.dueAt ? t("meta.due", { time: formatTime(item.dueAt, "") }) : t("deadline.none");
        return h("div", { className: "proj-todo-item-wrap", key: item.id },
          h("div", {
            className: "proj-todo-item",
            "data-done": item.completed ? "true" : "false",
            "data-view": viewMode,
            onContextMenu: (event) => openItemMenu(event, item),
          },
            h("button", {
              type: "button",
              className: "proj-todo-check",
              "data-done": item.completed ? "true" : "false",
              "aria-label": item.completed ? t("item.completed") : t("item.active"),
              title: item.completed ? t("item.completed") : t("item.active"),
              onClick: () => void toggleTodo(item),
            }, item.completed ? h(CheckIcon) : null),
            h("div", { className: "proj-todo-main" },
              viewMode === "compact"
                ? h("div", { className: "proj-todo-compact" },
                    h("span", { className: "proj-todo-text", title: item.text }, item.text),
                    item.group ? h("span", { className: "proj-todo-group", title: item.group }, item.group) : null
                  )
                : h("div", { className: "proj-todo-detail-row" },
                    h("div", {
                      className: "proj-todo-detail-left",
                      ref: (node) => {
                        if (node) leftRefs.current.set(item.id, node);
                        else leftRefs.current.delete(item.id);
                      },
                    },
                      h("div", { className: "proj-todo-detail-name-row" },
                        h("span", { className: "proj-todo-detail-name", title: item.text }, item.text),
                        item.group ? h("span", { className: "proj-todo-group", title: item.group }, item.group) : null
                      ),
                      h("div", { className: "proj-todo-detail-meta" },
                        h("span", { className: "proj-todo-deadline", title: dueLabel }, dueLabel)
                      )
                    ),
                    h("div", { className: "proj-todo-detail-right" },
                      h(TodoProgress, { item, domain, now, t })
                    )
                  )
            )
          ),
          viewMode === "detailed" ? h("div", { className: "proj-todo-hoverinfo" },
            item.createdAt ? h("div", null, t("hover.added", { time: formatTime(item.createdAt, "") })) : null,
            item.completedAt ? h("div", null, t("hover.completed", { time: formatTime(item.completedAt, "") })) : null,
            item.dueAt ? h("div", null, t("hover.due", { time: formatRelativeTime(item.dueAt, now) })) : null
          ) : null
        );
      }

      return h("div", { className: "proj-todo-root", "data-todo-root": true },
        h("div", { className: "proj-todo-head" },
          h("div", { className: "proj-todo-heading" }, t("title"), h("span", { className: "proj-todo-count" }, t("count", { active: activeCount, total: items.length }))),
          h("button", { type: "button", className: "proj-todo-iconbtn", "aria-label": t("reload"), title: t("reload"), onClick: () => void load() }, h(RefreshIcon))
        ),
        h("div", { className: "proj-todo-toolbar" },
          h("div", { className: "proj-todo-segment", role: "group", "aria-label": t("filter") },
            ["all", "active", "completed"].map((value) => h("button", {
              key: value,
              type: "button",
              className: "proj-todo-segbtn",
              "data-on": statusFilter === value ? "true" : "false",
              onClick: () => setStatusFilter(value),
            }, t(`filter.${value}`)))
          ),
          groups.length > 0 || groupFilter ? h("select", {
            className: "proj-todo-select",
            value: groupFilter,
            "aria-label": t("group.all"),
            onChange: (event) => setGroupFilter(event.target.value),
          },
            h("option", { value: "" }, t("group.all")),
            groups.map((current) => h("option", { key: current, value: current }, current)),
            items.some((item) => !item.group) ? h("option", { value: "__ungrouped__" }, t("group.uncategorized")) : null
          ) : null,
          h("select", {
            className: "proj-todo-select",
            value: sortBy,
            "aria-label": t("sort.label"),
            title: t("sort.label"),
            onChange: (event) => setSortBy(event.target.value),
          },
            h("option", { value: "createdAt" }, t("sort.createdAt")),
            h("option", { value: "completedAt" }, t("sort.completedAt")),
            h("option", { value: "dueAt" }, t("sort.dueAt")),
            h("option", { value: "group" }, t("sort.group"))
          ),
          h("button", {
            type: "button",
            className: "proj-todo-sortdir",
            "aria-label": t("sort.toggle"),
            title: `${t("sort.toggle")} (${sortDirection === "asc" ? t("sort.asc") : t("sort.desc")})`,
            onClick: () => setSortDirection(sortDirection === "asc" ? "desc" : "asc"),
          }, sortDirection === "asc" ? "↑" : "↓"),
          h("div", { className: "proj-todo-segment", role: "group", "aria-label": t("view.label") },
            ["compact", "detailed"].map((value) => h("button", {
              key: value,
              type: "button",
              className: "proj-todo-segbtn",
              "data-on": viewMode === value ? "true" : "false",
              onClick: () => setViewMode(value),
            }, t(`view.${value}`)))
          )
        ),
        h("form", { className: "proj-todo-add", onSubmit: addTodo },
          h("div", { className: "proj-todo-addrow" },
            h("label", { className: "proj-todo-field" },
              h("span", { className: "proj-todo-label" }, t("field.text")),
              field(text, setText, "", { "aria-label": t("field.text") })
            ),
            h("button", { type: "submit", className: "proj-todo-btn", "data-primary": "true", disabled: saving }, t("add.submit"))
          ),
          h("div", { className: "proj-todo-subrow" },
            h("label", { className: "proj-todo-field" },
              h("span", { className: "proj-todo-label" }, t("add.group")),
              field(group, setGroup, "", { "aria-label": t("add.group"), list: "proj-todo-groups" })
            ),
            h("label", { className: "proj-todo-field" },
              h("span", { className: "proj-todo-label" }, t("add.due")),
              field(dueInput, setDueInput, "", { "aria-label": t("add.due"), type: "datetime-local" })
            )
          ),
          h("datalist", { id: "proj-todo-groups" }, groups.map((current) => h("option", { key: current, value: current }))),
          addError ? h("div", { className: "proj-todo-error" }, addError) : null
        ),
        error ? h("div", { className: "proj-todo-error", role: "alert" }, error) : null,
        warning ? h("div", { className: "proj-todo-status" }, warning) : null,
        h("div", { className: "proj-todo-status" }, loading ? t("loading") : saving ? t("saving") : ""),
        h("div", { className: "proj-todo-list" },
          h("div", { className: "proj-todo-list-inner", ref: listInnerRef },
            loading ? h("div", { className: "proj-todo-empty" }, t("loading"))
              : filtered.length === 0 ? h("div", { className: "proj-todo-empty" },
                  h("strong", null, items.length === 0 ? t("empty.title") : t("empty.filtered")),
                  items.length === 0 ? t("empty.body") : null)
              : sorted.map(renderItem),
            viewMode === "detailed" && editingId === null && filtered.length > 0
              ? h("div", { className: "proj-todo-now-line", ref: nowLineRef })
              : null
          )
        ),
        menu ? h("div", {
          className: "proj-todo-menu",
          style: { left: `${menu.x}px`, top: `${menu.y}px` },
          onPointerDown: (event) => event.stopPropagation(),
        },
          h("button", {
            type: "button",
            onClick: () => {
              const item = items.find((candidate) => candidate.id === menu.id);
              setMenu(null);
              if (item) beginEdit(item);
            },
          }, t("item.edit")),
          h("button", {
            type: "button",
            "data-danger": "true",
            onClick: () => {
              const item = items.find((candidate) => candidate.id === menu.id);
              setMenu(null);
              if (item) void deleteTodo(item);
            },
          }, t("item.delete"))
        ) : null
      );
    }

    const inject = ["slots", "locale", "sidebarRightTabs", "sidebarRight"];

    function apply(ctx) {
      const t = ctx.locale.bind(NS);
      ctx.effect(() => ctx.locale.register(NS, { en, zh }), "proj-todo: dictionaries");
      ctx.effect(() => ctx.sidebarRightTabs.register({
        id: TODO_ID,
        kind: TODO_KIND,
        priority: "extension",
        title: () => t("type.label"),
        guide: [{
          id: "todo",
          order: 10,
          title: () => t("guide.title"),
          description: () => t("guide.description"),
          icon: TodoGuideIcon,
        }],
      }), "proj-todo: sidebar type");
      ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
        name: "sidebar.right.pane.tab",
        key: TODO_ID,
        locale: NS,
      }, TodoBody)), "proj-todo: sidebar body");
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
