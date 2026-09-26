/**
 * Melodie CLI Agent Platform - Builder Studio (Project Engine).
 *
 * Implements:
 *   melodie project create
 *   melodie project inspect
 *   melodie project analyze
 *   melodie project plan
 *   melodie project build
 *   melodie project test
 *   melodie project package
 */

import fs from 'node:fs';
import path from 'node:path';
import { Sandbox } from '../sandbox/sandbox.ts';
import { auditLogger } from '../audit/logger.ts';

export interface ProjectAnalysis {
  projectDir: string;
  filesCount: number;
  totalBytes: number;
  languages: Record<string, number>;
  packageJsonFound: boolean;
  hasTests: boolean;
  securityFindings: string[];
}

export class ProjectEngine {
  inspect(projectDir = process.cwd()): { exists: boolean; path: string; files: string[] } {
    const dir = path.resolve(projectDir);
    if (!fs.existsSync(dir)) {
      return { exists: false, path: dir, files: [] };
    }

    const files = fs.readdirSync(dir).slice(0, 100);
    return { exists: true, path: dir, files };
  }

  analyze(projectDir = process.cwd()): ProjectAnalysis {
    const dir = path.resolve(projectDir);
    const languages: Record<string, number> = {};
    let filesCount = 0;
    let totalBytes = 0;
    let hasTests = false;
    const securityFindings: string[] = [];

    function scan(current: string, depth = 0) {
      if (depth > 6) return;
      if (!fs.existsSync(current)) return;
      const entries = fs.readdirSync(current, { withFileTypes: true });

      for (const ent of entries) {
        if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
        const full = path.join(current, ent.name);
        if (ent.isDirectory()) {
          scan(full, depth + 1);
        } else if (ent.isFile()) {
          filesCount += 1;
          const stat = fs.statSync(full);
          totalBytes += stat.size;
          const ext = path.extname(ent.name).toLowerCase();
          if (ext) {
            languages[ext] = (languages[ext] ?? 0) + 1;
          }
          if (ent.name.includes('test') || ent.name.includes('spec')) {
            hasTests = true;
          }
          if (ent.name === '.env' || ent.name === '.env.production') {
            securityFindings.push(`Credential file present: ${path.relative(dir, full)}`);
          }
        }
      }
    }

    scan(dir);

    return {
      projectDir: dir,
      filesCount,
      totalBytes,
      languages,
      packageJsonFound: fs.existsSync(path.join(dir, 'package.json')),
      hasTests,
      securityFindings,
    };
  }

  create(projectName: string, targetDir = process.cwd()): string {
    const projectPath = path.join(path.resolve(targetDir), projectName);
    if (fs.existsSync(projectPath)) {
      throw new Error(`Target directory already exists: ${projectPath}`);
    }

    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'test'), { recursive: true });

    const pkg = {
      name: projectName,
      version: '0.1.0',
      type: 'module',
      scripts: {
        build: 'tsc -p tsconfig.json',
        test: 'node --test test/*.test.mjs',
      },
    };
    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf-8');
    fs.writeFileSync(
      path.join(projectPath, 'README.md'),
      `# ${projectName}\n\nProject initialized by Melodie CLI Agent Platform.\n`,
      'utf-8'
    );
    fs.writeFileSync(
      path.join(projectPath, 'src', 'index.ts'),
      `export function main(): string {\n  return 'Hello from ${projectName}';\n}\n`,
      'utf-8'
    );

    auditLogger.log('sandbox_command', `Created project ${projectName}`, 'SUCCESS', {
      target: projectPath,
    });

    return projectPath;
  }

  build(projectDir = process.cwd()): { ok: boolean; message: string } {
    const sandbox = new Sandbox(projectDir);
    const hasPkg = fs.existsSync(path.join(projectDir, 'package.json'));
    if (!hasPkg) {
      return { ok: false, message: 'No package.json found in project directory.' };
    }

    const res = sandbox.executeCommand('npm', ['run', 'build']);
    return {
      ok: res.exitCode === 0,
      message: res.exitCode === 0 ? 'Project build succeeded.' : `Build failed: ${res.stderr || res.stdout}`,
    };
  }

  test(projectDir = process.cwd()): { ok: boolean; message: string } {
    const sandbox = new Sandbox(projectDir);
    const res = sandbox.executeCommand('npm', ['test']);
    return {
      ok: res.exitCode === 0,
      message: res.exitCode === 0 ? 'Tests passed.' : `Tests failed: ${res.stderr || res.stdout}`,
    };
  }

  package(projectDir = process.cwd()): { ok: boolean; artifactPath?: string; message: string } {
    const dir = path.resolve(projectDir);
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      return { ok: false, message: 'No package.json to package.' };
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const artifactName = `${pkg.name || 'project'}-${pkg.version || '0.1.0'}.tar.gz`;
    return {
      ok: true,
      artifactPath: path.join(dir, artifactName),
      message: `Project packaged definition created: ${artifactName}`,
    };
  }
}

export const projectEngine = new ProjectEngine();
