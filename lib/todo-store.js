import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** Fields written to one JSONL line. Unknown fields are discarded. */
const TODO_FIELDS = new Set(['id', 'text', 'completed', 'group', 'createdAt', 'completedAt', 'dueAt'])

/**
 * Normalize one todo read from disk or received from the browser.
 * @param {unknown} value candidate record
 * @returns {{id:string,text:string,completed:boolean,group?:string,createdAt?:number,completedAt?:number,dueAt?:number}|null}
 */
export function normalizeTodo(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const record = /** @type {Record<string, unknown>} */ (value)
  if (typeof record.text !== 'string') return null
  const text = record.text.trim()
  if (text === '') return null
  const id = typeof record.id === 'string' && record.id.trim() !== '' ? record.id.trim() : undefined
  const completed = record.completed === true
  const group = typeof record.group === 'string' ? record.group.trim() : ''
  const createdAt = chronological(record.createdAt)
  const completedAt = completed ? chronological(record.completedAt) : undefined
  const dueAt = chronological(record.dueAt)
  return {
    id: id ?? globalThis.crypto.randomUUID(),
    text,
    completed,
    ...(group === '' ? {} : { group }),
    ...(createdAt === undefined ? {} : { createdAt }),
    ...(completedAt === undefined ? {} : { completedAt }),
    ...(dueAt === undefined ? {} : { dueAt }),
  }
}

/** Accept only finite non-negative epoch milliseconds. */
function chronological(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined
}

/**
 * Parse a JSONL todo file. Blank lines are ignored; malformed lines are
 * reported and skipped so one corrupt line cannot hide the rest of the list.
 * @param {string} text file contents
 * @returns {{todos: ReturnType<typeof normalizeTodo>[], errors: string[]}}
 */
export function parseJsonl(text) {
  const todos = []
  const errors = []
  for (const [index, line] of text.split(/\r?\n/u).entries()) {
    if (line.trim() === '') continue
    let parsed
    try {
      parsed = JSON.parse(line)
    } catch {
      errors.push(`line ${index + 1}: invalid JSON`)
      continue
    }
    const todo = normalizeTodo(parsed)
    if (todo === null) {
      errors.push(`line ${index + 1}: not a todo record`)
      continue
    }
    todos.push(todo)
  }
  return { todos, errors }
}

/**
 * Serialize todos as JSONL, one normalized record per line.
 * @param {unknown[]} todos todo records
 * @returns {string}
 */
export function serializeJsonl(todos) {
  const lines = []
  for (const value of todos) {
    const todo = normalizeTodo(value)
    if (todo !== null) lines.push(JSON.stringify(pickFields(todo)))
  }
  return lines.length === 0 ? '' : `${lines.join('\n')}\n`
}

function pickFields(todo) {
  const result = { id: todo.id, text: todo.text, completed: todo.completed }
  if (todo.group !== undefined) result.group = todo.group
  if (todo.createdAt !== undefined) result.createdAt = todo.createdAt
  if (todo.completedAt !== undefined) result.completedAt = todo.completedAt
  if (todo.dueAt !== undefined) result.dueAt = todo.dueAt
  return result
}

/** Resolve the fixed todo file under a workspace directory. */
export function todoFilePath(workspace) {
  return path.join(workspace, '.dsh', 'todo.jsonl')
}

/**
 * Read one workspace's todo file.
 * @param {string} workspace absolute workspace directory
 */
export async function readTodoFile(workspace) {
  const file = todoFilePath(workspace)
  let bytes
  try {
    bytes = await readFile(file, 'utf8')
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT') {
      return { file, todos: [], errors: [], missing: true }
    }
    throw error
  }
  const parsed = parseJsonl(bytes)
  return { file, ...parsed, missing: false }
}

/**
 * Atomically replace one workspace's todo file. The `.dsh` directory is
 * created when needed; a sibling temp file is renamed over the target.
 * @param {string} workspace absolute workspace directory
 * @param {unknown[]} todos full list to persist
 */
export async function writeTodoFile(workspace, todos) {
  const file = todoFilePath(workspace)
  await mkdir(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`
  await writeFile(tmp, serializeJsonl(todos), { encoding: 'utf8', mode: 0o600 })
  await rename(tmp, file)
  return file
}

/** Confirm that a browser-provided workspace names an existing directory. */
export async function validWorkspace(workspace) {
  if (typeof workspace !== 'string' || workspace.trim() === '') return null
  const absolute = path.resolve(workspace)
  try {
    const info = await stat(absolute)
    return info.isDirectory() ? absolute : null
  } catch {
    return null
  }
}
