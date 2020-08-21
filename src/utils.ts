import { relative } from 'path';
// @ts-ignore: default export.
import * as merge from 'lodash.merge';
import { CppTaskDefinition } from './interface';

/**
 * If the given value is not an array and not null, wrap it in one.
 * 
 * @param   {T | T[]} value
 * @returns {T[]}
 */
function wrap<T>(value: T | T[]) {
  return Array.isArray(value) ? value : [value];
}

export function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(path);

	if (isExtendedLengthPath || hasNonAscii) {
		return path;
	}

	return path.replace(/\\/g, '/');
}

function normalizePlatform(platform: NodeJS.Platform) {
  switch (platform) {
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    case 'darwin':
      return 'osx';
    default:
      return platform;   
  }
}

export function mergeDefinition(definition: CppTaskDefinition, platform = process.platform) {
  const name = normalizePlatform(platform);

  if (Object.prototype.hasOwnProperty.call(definition, name)) {
    return merge({}, definition, definition[name]) as CppTaskDefinition;
  }

  return definition;
}

export function normalizePatterns(patterns: string | string[]) {
  return wrap(patterns).map(
    pattern => process.platform === 'win32' ? slash(pattern) : pattern
  );
}

export function relatives(from: string, to: string[]) {
  return to.map(file => {
    const path = relative(from, file);
    return process.platform === 'win32' ? slash(path) : path;
  });
}
