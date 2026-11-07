import { defineTool } from '@deepseek-ai/dsh-tools'
import { mutateTodoFile, normalizeTodo, readTodoFile } from './todo-store.js'

export const PROJ_TODO_TOOL_NAME = 'proj_todo'

const DESCRIPTION = [
  "Read or update this project's persistent todo list.",
  'This is project-scoped, stored in the workspace, shared across sessions, and shown in the DSH sidebar.',
  'It is separate from the session-scoped `todo_write` planning list: use `proj_todo` for durable project work items that must survive sessions and remain visible to the user.',
  'Actions: `read` returns every todo; `add` creates one and returns its UUID; `modify` updates one todo by UUID.',
].join(' ')

/** Convert an ISO 8601 tool value to the epoch milliseconds stored on disk. */
function parseDueAt(value) {
  if (value === '') return undefined
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) throw new Error('dueAt must be an ISO 8601 date/time string, or an empty string to clear it')
  return parsed
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
        description: 'Optional DDL as an ISO 8601 date/time, for example 2026-11-08T18:00:00+08:00. An empty string clears the DDL on modify.',
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
        return { action: 'read', file: result.file, todos: result.todos, errors: result.errors }
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
        return { action: 'add', id: todo.id, todo, file: written.file }
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
      return { action: 'modify', todo: written.result, file: written.file }
    },
  })
}
