import { spawn, type ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(__dirname, '..');

const services = [
  { name: 'api', color: '\x1b[36m', cwd: root, args: ['run', 'dev:api'] },
  { name: 'web', color: '\x1b[35m', cwd: resolve(root, 'web'), args: ['run', 'dev'] },
];

const children: ChildProcess[] = [];
let stopping = false;

function stop(code: number) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 300);
}

for (const service of services) {
  const child = spawn('npm', service.args, { cwd: service.cwd, env: process.env });
  children.push(child);
  const prefix = `${service.color}[${service.name}]\x1b[0m `;
  const pipe = (stream: NodeJS.ReadableStream, target: NodeJS.WriteStream) => {
    let buffer = '';
    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) target.write(`${prefix}${line}\n`);
    });
  };
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  child.on('exit', (code) => {
    if (!stopping) console.error(`${prefix}exited with code ${code ?? 'null'}`);
    stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
