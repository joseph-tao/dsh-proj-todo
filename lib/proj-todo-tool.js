import { defineTool } from '@deepseek-ai/dsh-tools'
import { mutateTodoFile, normalizeTodo, readTodoFile } from './todo-store.js'

export const PROJ_TODO_TOOL_NAME = 'proj_todo'

const DESCRIPTION = [
  "Read or update this project's persistent todo list.",
  'This is project-scoped, stored in the workspace, shared across sessions, and shown in the DSH sidebar.',
  'Actions: `read` returns every todo; `add` creates one and returns its UUID; `modify` updates one todo by UUID.',
  'Times use the local `yyyymmdd HH:mm` format, for example `19700101 00:00`.',
].join(' ')

function pad2(value) {
  return String(value).padStart(2, '0')
}

/** Render epoch milliseconds in the tool-facing local `yyyymmdd HH:mm` format. */
function formatDateTime(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/** Convert a `yyyymmdd HH:mm` tool value to the epoch milliseconds stored on disk. */
function parseDueAt(value) {
  if (value === '') return undefined
  if (typeof value !== 'string') throw new Error('dueAt must use yyyymmdd HH:mm, for example 19700101 00:00')
  const match = /^(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2})$/u.exec(value.trim())
  if (match === null) throw new Error('dueAt must use yyyymmdd HH:mm, for example 19700101 00:00')
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const date = new Date(year, month - 1, day, hour, minute, 0, 0)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
    || date.getHours() !== hour
    || date.getMinutes() !== minute
  ) {
    throw new Error('dueAt must use yyyymmdd HH:mm, for example 19700101 00:00')
  }
  return date.getTime()
}

/** Map one stored todo to the tool-facing shape without changing the JSONL schema. */
function presentTodo(todo) {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    ...(todo.group === undefined ? {} : { group: todo.group }),
    ...(todo.createdAt === undefined ? {} : { createdAt: formatDateTime(todo.createdAt) }),
    ...(todo.completedAt === undefined ? {} : { completedAt: formatDateTime(todo.completedAt) }),
    ...(todo.dueAt === undefined ? {} : { dueAt: formatDateTime(todo.dueAt) }),
  }
}

/** Build the project-level todo tool over the calling agent's workspace. */
export function createProjTodoTool(ctx) {
  return defineTool({
    name: PROJ_TODO_TOOL_NAME,
    description: DESCRIPTION,
    parameters: {
      action: {
        type: 'string',
        required: true,
        enum: ['read', 'add', 'modify'],
        description: 'read the full project list, add one todo, or modify one todo by UUID.',
      },
      id: {
        type: 'string',
        description: 'UUID of the todo to modify. Required for modify.',
      },
      text: {
        type: 'string',
        description: 'Todo text. Required for add; optional for modify.',
      },
      completed: {
        type: 'boolean',
        description: 'Completion state. Optional for add and modify. Completing sets completedAt; reopening clears it.',
      },
      group: {
        type: 'string',
        description: 'Optional group label. An empty string clears the group on modify.',
      },
      dueAt: {
        type: 'string',
        description: 'Optional DDL in local yyyymmdd HH:mm format, for example 19700101 00:00. An empty string clears the DDL on modify.',
      },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args, exec) {
      if (exec.agent === undefined) {
        throw new Error('proj_todo requires an owning agent session to resolve the project workspace')
      }
      const workspace = await ctx.workingDirectory.ensure(exec.agent, exec.signal)

      if (args.action === 'read') {
        const result = await readTodoFile(workspace)
        return { action: 'read', file: result.file, todos: result.todos.map(presentTodo), errors: result.errors }
      }

      if (args.action === 'add') {
        const text = typeof args.text === 'string' ? args.text.trim() : ''
        if (text === '') throw new Error('text is required when action is add')
        const dueAt = args.dueAt === undefined ? undefined : parseDueAt(args.dueAt)
        const now = Date.now()
        const todo = normalizeTodo({
          id: globalThis.crypto.randomUUID(),
          text,
          completed: args.completed === true,
          group: args.group,
          createdAt: now,
          completedAt: args.completed === true ? now : undefined,
          dueAt,
        })
        if (todo === null) throw new Error('text must be a non-empty string')
        const written = await mutateTodoFile(workspace, (todos) => ({
          todos: [...todos, todo],
          result: todo,
        }))
        return { action: 'add', id: todo.id, todo: presentTodo(todo), file: written.file }
      }

      const id = typeof args.id === 'string' ? args.id.trim() : ''
      if (id === '') throw new Error('id is required when action is modify')
      const written = await mutateTodoFile(workspace, (todos) => {
        const index = todos.findIndex((todo) => todo.id === id)
        if (index === -1) throw new Error(`todo not found: ${id}`)
        const current = todos[index]
        const next = { ...current }
        if (args.text !== undefined) {
          const text = typeof args.text === 'string' ? args.text.trim() : ''
          if (text === '') throw new Error('text must be a non-empty string')
          next.text = text
        }
        if (args.group !== undefined) {
          const group = typeof args.group === 'string' ? args.group.trim() : ''
          if (group === '') delete next.group
          else next.group = group
        }
        if (args.dueAt !== undefined) {
          const dueAt = parseDueAt(args.dueAt)
          if (dueAt === undefined) delete next.dueAt
          else next.dueAt = dueAt
        }
        if (args.completed !== undefined) {
          next.completed = args.completed === true
          if (next.completed) next.completedAt = Date.now()
          else delete next.completedAt
        }
        const updated = normalizeTodo(next)
        if (updated === null) throw new Error('todo is invalid after modification')
        const updatedTodos = [...todos]
        updatedTodos[index] = updated
        return { todos: updatedTodos, result: updated }
      })
      return { action: 'modify', todo: presentTodo(written.result), file: written.file }
    },
  })
}
