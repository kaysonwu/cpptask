import { exec, ExecOptions } from 'child_process';
import { Pseudoterminal, EventEmitter } from 'vscode';

class Terminal implements Pseudoterminal {
  private writeEmitter = new EventEmitter<string>();
  private closeEmitter = new EventEmitter<void | number>();

  private command: string;
  private options: ExecOptions;

  public onDidWrite = this.writeEmitter.event;
	public onDidClose = this.closeEmitter.event;

  public constructor(command: string, args: string[], options: ExecOptions = {}) {
    this.command = `${command} ${args.join(' ')}`;
    this.options = options;
  }

  private static line(content: string) {
    if (process.platform === 'win32') {
      return `${content.replace(/\r?\n/g, '\r\n')}\r\n`;
    }

    return `${content}\n`;
  }

  private error(title: string, description: string) {
    this.writeEmitter.fire('\x1b[31merror ' + Terminal.line(title) + '\x1b[0m' + Terminal.line(description));
    this.closeEmitter.fire(1);
  }

  private success(message: string) {
    this.writeEmitter.fire('\x1b[32msuccess \x1b[0m' + Terminal.line(message));
    this.closeEmitter.fire(0);
  }

  public open() {
    this.writeEmitter.fire(Terminal.line(`$ ${this.command}`));
    exec(this.command, this.options, (_, __, stderr) => {
      if (stderr) {
        this.error('Compilation failed', stderr);
      } else {
        this.success('Compiled successfully');
      }
    });
  }

  public close() {}
}

export default Terminal;
