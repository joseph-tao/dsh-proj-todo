import z from '@deepseek-ai/schemastery'
import { readTodoFile, replaceTodoFile, validWorkspace } from './todo-store.js'
import { createProjTodoTool, PROJ_TODO_TOOL_NAME } from './proj-todo-tool.js'

/** Loader-facing plugin name. */
export const name = 'dsh-proj-todo'

/** The web route, browser trust fence, model tool registry, and workspace resolver. */
export const inject = ['webServer', 'connection', 'tools', 'workingDirectory']

/** Live plugin settings; volatile fields are editable through the Settings service. */
export const Config = z.object({
  toolEnabled: z.boolean().default(true).volatile(),
})

/** One exact JSON endpoint for reading and replacing the workspace todo list. */
const API_PATH = '/dsh-proj-todo/api'
const MAX_BODY_BYTES = 2 * 1024 * 1024

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

async function readBoundedBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_BODY_BYTES) {
      req.resume()
      return null
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks, size).toString('utf8')
}

function rejection(ctx, req, res) {
  const connection = Reflect.get(ctx, 'connection')
  const status = connection?.requestRejection?.(req)
  if (status === undefined) return false
  res.statusCode = status
  res.end()
  return true
}

/** Register the read/write endpoint and optional project todo tool. */
export function apply(ctx, config) {
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber))
  })
  ctx.effect(() => ctx.tools.register(createProjTodoTool(ctx), {
    when: () => config.toolEnabled.get(),
  }), `dsh-proj-todo: tool ${PROJ_TODO_TOOL_NAME}`)

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: API_PATH,
    handler: async (req, res) => {
      if (rejection(ctx, req, res)) return

      const url = new URL(String(req.url), 'http://localhost')
      if (req.method === 'GET') {
        const workspace = await validWorkspace(url.searchParams.get('workspace'))
        if (workspace === null) {
          sendJson(res, 400, { error: 'invalid-workspace', message: 'workspace must be an existing directory' })
          return
        }
        try {
          const result = await readTodoFile(workspace)
          sendJson(res, 200, result)
        } catch (error) {
          sendJson(res, 500, { error: 'read-failed', message: error instanceof Error ? error.message : String(error) })
        }
        return
      }

      if (req.method === 'PUT') {
        if (String(req.headers['content-type']).split(';', 1)[0]?.trim().toLowerCase() !== 'application/json') {
          sendJson(res, 415, { error: 'unsupported-media-type', message: 'content-type must be application/json' })
          return
        }
        let body
        try {
          const text = await readBoundedBody(req)
          if (text === null) {
            sendJson(res, 413, { error: 'too-large', message: 'request body is too large' })
            return
          }
          body = JSON.parse(text)
        } catch {
          sendJson(res, 400, { error: 'bad-request', message: 'request body must be JSON' })
          return
        }
        const workspace = await validWorkspace(body?.workspace)
        if (workspace === null) {
          sendJson(res, 400, { error: 'invalid-workspace', message: 'workspace must be an existing directory' })
          return
        }
        if (!Array.isArray(body?.todos)) {
          sendJson(res, 400, { error: 'bad-request', message: 'todos must be an array' })
          return
        }
        try {
          const file = await replaceTodoFile(workspace, body.todos)
          sendJson(res, 200, { ok: true, file })
        } catch (error) {
          sendJson(res, 500, { error: 'write-failed', message: error instanceof Error ? error.message : String(error) })
        }
        return
      }

      res.statusCode = 405
      res.setHeader('allow', 'GET, PUT')
      res.end()
    },
  }), `dsh-proj-todo: ${API_PATH}`)
}
