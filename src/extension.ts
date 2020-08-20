import { ExtensionContext, tasks } from 'vscode';
import CppTaskProvider from './provider';

export function activate(context: ExtensionContext) {
	const disposable = tasks.registerTaskProvider('cpp', new CppTaskProvider());
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
