import { defineTool } from '@deepseek-ai/dsh-tools'
import { mutateTodoFile, normalizeTodo, nowSeconds, readTodoFile } from './todo-store.js'

export const PROJ_TODO_TOOL_NAME = 'proj_todo'

const DATE_TIME_FORMATS = '`yyyymmdd`, `yyyymmdd HH`, `yyyymmdd HH:mm`, or `yyyymmdd HH:mm:ss`'

const DESCRIPTION = [
  "Read or update this project's persistent todo list.",
  'This is project-scoped, stored in the workspace, shared across sessions, and shown in the DSH sidebar.',
  'Actions: `read` returns every todo; `add` creates one and returns its UUID; `modify` updates one todo by UUID.',
  `Times use the local ${DATE_TIME_FORMATS} format, for example \`19700101 00:00:00\`.`,
].join(' ')

function pad2(value) {
  return String(value).padStart(2, '0')
}

/** Render Unix seconds in the tool-facing local `yyyymmdd HH:mm:ss` format. */
function formatDateTime(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  const date = new Date(value * 1000)
  if (Number.isNaN(date.getTime())) return undefined
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

/** Convert an accepted tool date-time string to Unix seconds. */
function parseDateTime(value, field) {
  const error = `${field} must use ${DATE_TIME_FORMATS}, for example 19700101 00:00:00`
  if (value === '') return undefined
  if (typeof value !== 'string') throw new Error(error)
  const match = /^(\d{4})(\d{2})(\d{2})(?: (\d{2})(?::(\d{2})(?::(\d{2}))?)?)?$/u.exec(value.trim())
  if (match === null) throw new Error(error)
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = match[4] === undefined ? 0 : Number(match[4])
  const minute = match[5] === undefined ? 0 : Number(match[5])
  const second = match[6] === undefined ? 0 : Number(match[6])
  const date = new Date(year, month - 1, day, hour, minute, second, 0)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
    || date.getHours() !== hour
    || date.getMinutes() !== minute
    || date.getSeconds() !== second
  ) {
    throw new Error(error)
  }
  return Math.floor(date.getTime() / 1000)
}

/** Map one stored todo to the tool-facing shape without changing the JSONL schema. */
function presentTodo(todo) {
  return {
    id: todo.id,
    text: todo.text,
    ...(todo.group === undefined ? {} : { group: todo.group }),
    startAt: formatDateTime(todo.startAt),
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
      group: {
        type: 'string',
        description: 'Optional group label. An empty string clears the group on modify.',
      },
      startAt: {
        type: 'string',
        description: `Optional start time (${DATE_TIME_FORMATS}). For add, an omitted or empty value defaults to the current time. For modify, an empty value is rejected because every todo must have a start time.`,
      },
      completedAt: {
        type: 'string',
        description: `Optional completion time (${DATE_TIME_FORMATS}). The todo is completed when this value exists. An empty string clears completion on modify.`,
      },
      dueAt: {
        type: 'string',
        description: `Optional DDL (${DATE_TIME_FORMATS}). An empty string clears the DDL on modify.`,
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
        const startAt = args.startAt === undefined || args.startAt === ''
          ? nowSeconds()
          : parseDateTime(args.startAt, 'startAt')
        const completedAt = args.completedAt === undefined ? undefined : parseDateTime(args.completedAt, 'completedAt')
        const dueAt = args.dueAt === undefined ? undefined : parseDateTime(args.dueAt, 'dueAt')
        const todo = normalizeTodo({
          id: globalThis.crypto.randomUUID(),
          text,
          group: args.group,
          startAt,
          completedAt,
          dueAt,
        })
        if (todo === null) throw new Error('todo is invalid')
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
        if (args.startAt !== undefined) {
          const startAt = parseDateTime(args.startAt, 'startAt')
          if (startAt === undefined) throw new Error('startAt is required when action is modify')
          next.startAt = startAt
        }
        if (args.completedAt !== undefined) {
          const completedAt = parseDateTime(args.completedAt, 'completedAt')
          if (completedAt === undefined) delete next.completedAt
          else next.completedAt = completedAt
        }
        if (args.dueAt !== undefined) {
          const dueAt = parseDateTime(args.dueAt, 'dueAt')
          if (dueAt === undefined) delete next.dueAt
          else next.dueAt = dueAt
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
