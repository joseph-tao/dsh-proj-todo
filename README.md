# dsh-proj-todo

[中文](README_cn.md) | [English](README.md)

A graphical plugin for managing project todos in DSH's right sidebar. Todo data is stored in the workspace's `.dsh/todo.jsonl`.

## Features

- Add, edit, delete, and complete todos in DSH Web's right sidebar
- Supports todo groups, DDLs, and created/completed timestamps
- Filter by status and group, and sort by time, DDL, or group
- Compact and detailed views
- The detailed view includes a Gantt chart showing creation, DDL, completion times, and a current-time marker
- Gantt range presets: All, Today, Within a week, From today, Manual
- Click a todo in the detailed view to expand its time details

## Installation

```bash
dsh plugin --profile web add github:joseph-tao/dsh-proj-todo
```

After installation, start or refresh DSH Web and open the right sidebar.

## Data storage

Todos for each workspace are stored at:

```text
<workspace>/.dsh/todo.jsonl
```

Deleting `.dsh/todo.jsonl` from a workspace will not affect the plugin itself, but it will clear that workspace's todo records.
