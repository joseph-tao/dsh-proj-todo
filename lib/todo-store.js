import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'


/**
 * Normalize one todo read from disk or received from the browser.
 * Times are stored as Unix seconds; completion is derived from `completedAt`.
 * @param {unknown} value candidate record
 * @returns {{id:string,text:string,group?:string,startAt:number,completedAt?:number,dueAt?:number}|null}
 */
export function normalizeTodo(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const record = /** @type {Record<string, unknown>} */ (value)
  if (typeof record.text !== 'string') return null
  const text = record.text.trim()
  if (text === '') return null
  const id = typeof record.id === 'string' && record.id.trim() !== '' ? record.id.trim() : undefined
  const group = typeof record.group === 'string' ? record.group.trim() : ''
  const startAt = chronological(record.startAt)
  if (startAt === undefined) return null
  const completedAt = chronological(record.completedAt)
  const dueAt = chronological(record.dueAt)
  return {
    id: id ?? globalThis.crypto.randomUUID(),
    text,
    ...(group === '' ? {} : { group }),
    startAt,
    ...(completedAt === undefined ? {} : { completedAt }),
    ...(dueAt === undefined ? {} : { dueAt }),
  }
}

/** All persisted times use whole Unix seconds. */
export function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

/** Accept only finite non-negative Unix-second values. */
function chronological(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : undefined
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
  const result = { id: todo.id, text: todo.text, startAt: todo.startAt }
  if (todo.group !== undefined) result.group = todo.group
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

/** Per-file write chains keep concurrent saves from interleaving. */
const writeChains = new Map()

function serializedWrite(key, operation) {
  const previous = writeChains.get(key) ?? Promise.resolve()
  const current = previous.catch(() => {}).then(operation)
  writeChains.set(key, current)
  current.then(
    () => { if (writeChains.get(key) === current) writeChains.delete(key) },
    () => { if (writeChains.get(key) === current) writeChains.delete(key) },
  )
  return current
}

/**
 * Serialize a full-list replacement with other writes to the same todo file.
 * @param {string} workspace absolute workspace directory
 * @param {unknown[]} todos full list to persist
 */
export function replaceTodoFile(workspace, todos) {
  return serializedWrite(todoFilePath(workspace), () => writeTodoFile(workspace, todos))
}

/**
 * Serialize a read-modify-write against one workspace's todo file.
 * @param {string} workspace absolute workspace directory
 * @param {(todos: NonNullable<ReturnType<typeof normalizeTodo>>[], current: Awaited<ReturnType<typeof readTodoFile>>) => {todos: unknown[], result?: unknown} | Promise<{todos: unknown[], result?: unknown}>} mutate
 * @returns the mutation result plus the written file path
 */
export function mutateTodoFile(workspace, mutate) {
  const file = todoFilePath(workspace)
  return serializedWrite(file, async () => {
    const current = await readTodoFile(workspace)
    const next = await mutate(current.todos, current)
    await writeTodoFile(workspace, next.todos)
    return { file, ...next }
  })
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
