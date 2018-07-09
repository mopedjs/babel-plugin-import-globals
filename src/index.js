import {addNamed, isModule} from '@babel/helper-module-imports';

module.exports = ({types: t}) => {
  return {
    pre(file) {
      const opts = this.opts;
      if (
        !(
          opts &&
          typeof opts === 'object' &&
          Object.keys(opts).every(key => (
            opts[key] &&
            (
              typeof opts[key] === 'string' ||
              (
                typeof opts[key] === 'object' &&
                typeof opts[key].moduleName === 'string' &&
                typeof opts[key].exportName === 'string'
              )
            )
          ))
        )
      ) {
        throw new Error(
          'Invalid config options for babel-plugin-import-globals, espected a mapping from global variable name ' +
          'to either a module name (with a default export) or an object of the type {moduleName: string, ' +
          'exportName: string}.'
        );
      }

      // Adapted from babel-plugin-transform-runtime
      // https://github.com/babel/babel/blob/dd6da3b3af7a09833ef5d90079ca833985eed7dc/packages/babel-plugin-transform-runtime/src/index.js#L58
      const cache = new Map();
      this.addImport = (source, name, nameHint) => {
        // If something on the page adds a helper when the file is an ES6
        // file, we can't reused the cached helper name after things have been
        // transformed because it has almost certainly been renamed.
        const cacheKey = isModule(file.path);
        const key = `${source}:${name}:${nameHint}:${cacheKey || ''}`;

        let cached = cache.get(key);
        if (cached) {
          cached = t.cloneDeep(cached);
        } else {
          cached = addNamed(file.path, name, source, {nameHint});
          cache.set(key, cached);
        }
        return cached;
      };
    },
    visitor: {
      ReferencedIdentifier(path) {
        const {node, scope} = path;
        if (scope.getBindingIdentifier(node.name)) return;
        const opts = this.opts;
        const name = node.name;
        if (!(name in opts) || (typeof opts[name] !== 'string' && typeof opts[name] !== 'object')) {
          return;
        }

        const source = (
          typeof opts[name] === 'string'
            ? {moduleName: opts[name], exportName: 'default'}
            : opts[name]
        );

        const newIdentifier = this.addImport(source.moduleName, source.exportName, name);

        path.replaceWith(
          node.type === 'JSXIdentifier'
            ? t.jSXIdentifier(newIdentifier.name)
            : newIdentifier
        );
      },
    },
  };
};
