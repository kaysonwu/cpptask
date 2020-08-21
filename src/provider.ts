import { parse, join } from 'path';
import { mkdirSync, symlinkSync } from 'fs';
import type { ExecOptions } from 'child_process';
import { TaskProvider, Task, TaskScope, CustomExecution } from 'vscode';
import * as globby from 'globby';
import { CppTaskDefinition } from './interface';
import { mergeDefinition, normalizePatterns, relatives, slash } from './utils';
import Terminal from './terminal';

class CppTaskProvider implements TaskProvider {

  private static async parseSources(patterns: string[], cwd?: string) {
    const files = await globby(
      normalizePatterns(patterns),
      { cwd, expandDirectories: false, onlyFiles: true },
    );
    
    // Mainly used to shorten command parameters
    if (cwd) {
      return relatives(cwd, files);
    }

    return files;
  }

  private static async parseLibraies(patterns: string[], output: string, cwd?: string) {
    const files = await globby(
      normalizePatterns(patterns),
      { cwd, expandDirectories: false, onlyFiles: true },
    );
    
    const directories: string[] = [];
    const names: string[] = [];

    files.forEach(file => {
      const { dir, base, name } = parse(file);
      names.push(name);

      try {
        symlinkSync(file, join(output, base));
      } catch { }

      if (!directories.includes(dir)) {
        directories.push(dir);
      }
    }); 
    
    return [directories, names];
  }

  private static async parseDefinition({
    compilerPath, 
    compilerArgs, 
    sources,
    output,
    includePath,
    libraryPath, 
    options: { cwd, env } = {},
  }: CppTaskDefinition): Promise<[string, string[], ExecOptions]> {
    const { dir } = parse(output);
    const options = { cwd, env: { ...env } };
    const args = await CppTaskProvider.parseSources(sources, cwd);
 
    // Always try to create the output directory.
    mkdirSync(dir, { recursive: true });
    
    if (includePath) {
      options.env.CPATH = (await globby(
        normalizePatterns(includePath), 
        { cwd, expandDirectories: false, onlyDirectories: true },
      )).join(';');
    }

    if (libraryPath) {
      const [directories, names] = await CppTaskProvider.parseLibraies(libraryPath, dir, cwd);
      options.env.LIBRARY_PATH = directories.join(';');
      names.forEach(name => args.unshift('-l', name));
    }

    args.unshift(...compilerArgs, '-o', slash(output));

    return [compilerPath, args, options];
  }

  public provideTasks() {
    return undefined;
  }
  
  public resolveTask(task: Task) {
    const definition = mergeDefinition(task.definition as CppTaskDefinition);
    const { sources, output } = definition;

    if (sources && output) {
      return new Task(
        definition,
        TaskScope.Workspace,
        'cpp', 
        'cpp',
        // @ts-ignore
        new CustomExecution(async definition => new Terminal(...(await CppTaskProvider.parseDefinition(definition)))),
      );
    }

    return undefined;
  }
}

export default CppTaskProvider;
