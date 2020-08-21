import { TaskDefinition } from 'vscode';

export interface CppTaskOption {
  /**
   * The current working directory of the compiler.
   */
  cwd?: string;

  /**
   * The shell environment of the compiler.
   */
  env?: any;
}

export interface CppTaskPlatformDefinition {
  /**
   * C/C++ compiler file path.
   * 
   * @default  g++
   */
  compilerPath: string;

  /**
   * The parameters to be passed to the compiler.
   * 
   * @default ['-g']
   */
  compilerArgs: string[];

  /**
   * Additional include directories, will find header files in it.
   */
  includePath?: string[];

  /**
   * Additional library directories, will find library files in it.
   */
  libraryPath?: string[];

  /**
   * Other command options.
   */
  options?: CppTaskOption;
}

export interface CppTaskDefinition extends CppTaskPlatformDefinition, TaskDefinition {

  /**
   * The source files to be compiled, supports glob pattern.
   */
  sources: string[];

  /**
   * Place the output into file.
   */
  output: string;

  /**
   * Specific command configuration for windows.
   */
  windows?: CppTaskPlatformDefinition,

  /**
   * Specific command configuration for linux
   */
  linux?: CppTaskPlatformDefinition,

  /**
   * Specific command configuration for macOS
   */
  osx?: CppTaskPlatformDefinition;
}
