import {addDefault, addNamed} from '@babel/helper-module-imports';

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
    },
    visitor: {
      Program(path) {
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

        const newIdentifier = source.exportName === 'default'
          ? addDefault(path, source.moduleName, {nameHint: name})
          : addNamed(path, source.exportName, source.moduleName);

        path.replaceWith(
          node.type === 'JSXIdentifier'
            ? t.jSXIdentifier(newIdentifier.name)
            : newIdentifier
        );
      },
    },
  };
};
