import { relative } from 'path';
// @ts-ignore: default export.
import * as slash from 'slash';
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
  if (process.platform === 'win32') {
    return wrap(patterns).map(slash);
  }

  return patterns;
}

export function relatives(from: string, to: string[]) {
  return to.map(file => {
    const path = relative(from, file);
    return process.platform === 'win32' ? slash(path) : path;
  });
}
