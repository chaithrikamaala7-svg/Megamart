import { spawn } from 'node:child_process'

function run(command, args, name) {
  const child = spawn(command, args, { stdio: 'inherit', shell: true })
  child.on('exit', (code) => {
    if (typeof code === 'number' && code !== 0) {
      console.error(`[${name}] exited with code ${code}`)
      process.exitCode = code
    }
  })
  return child
}

const client = run('npm', ['run', 'dev:client'], 'client')
const server = run('npm', ['run', 'dev:server'], 'server')

function shutdown() {
  client.kill('SIGTERM')
  server.kill('SIGTERM')
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

