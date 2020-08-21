import { TaskProvider, Task, TaskScope, CustomExecution } from 'vscode';
import * as globby from 'globby';
import { CppTaskDefinition } from './interface';
import { mergeDefinition, normalizePatterns, relatives } from './utils';
import Terminal from './terminal';

class CppTaskProvider implements TaskProvider {

  private static async parseDefinition(definition: CppTaskDefinition): Promise<CppTaskDefinition> {
    const { cwd } = definition.options || {};
    let { sources, includePath, libraryPath } = definition;

    sources = await globby(
      normalizePatterns(sources),
      { cwd, expandDirectories: false, onlyFiles: true },
    );

    // Mainly used to shorten command parameters
    if (cwd) {
      sources = relatives(cwd, sources);
    }
    
    if (includePath) {
      includePath = await globby(
        normalizePatterns(includePath), 
        { cwd, expandDirectories: false, onlyDirectories: true },
      );
    }

    if (libraryPath) {
      libraryPath = await globby(
        normalizePatterns(libraryPath),
        { cwd, expandDirectories: false, onlyFiles: true },
      );
    }

    return { ...definition, sources, includePath, libraryPath };
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
        new CustomExecution(async definition => new Terminal(await CppTaskProvider.parseDefinition(definition))),
      );
    }

    return undefined;
  }
}

export default CppTaskProvider;
