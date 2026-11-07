# dsh-proj-todo

[中文](README_cn.md) | [English](README.md)

在 DSH 右侧栏中管理当前项目待办的图形化插件。待办数据保存在工作区的 `.dsh/todo.jsonl` 中。

## 功能

- 在 DSH Web 右侧栏添加、编辑、删除和完成待办
- 支持待办分组、DDL 以及开始/完成时间
- 支持按状态、分组筛选，以及按时间、DDL、分组排序
- 提供紧凑与详细两种视图
- 详细视图包含甘特图，可显示开始、DDL、完成时间和当前时间标记
- 甘特图支持显示范围预设：全部、今天内、一周内、从今天开始、手动
- 悬停甘特图可查看光标位置对应的时间
- 点击详细视图中的待办可展开查看时间详情

## 安装

```bash
dsh plugin --profile web add github:joseph-tao/dsh-proj-todo
```

安装后启动或刷新 DSH Web，打开右侧栏即可使用。

## 数据存储

每个工作区的待办保存在：

```text
<workspace>/.dsh/todo.jsonl
```

时间以 Unix 秒存储。待办是否存在完成时间由 `completedAt` 决定，不再单独存储完成标记。

日期时间输入支持 `yyyymmdd`、`yyyymmdd HH`、`yyyymmdd HH:mm` 和 `yyyymmdd HH:mm:ss`。

删除工作区中的 `.dsh/todo.jsonl` 不会影响插件本身，但会清空该工作区的待办记录。
