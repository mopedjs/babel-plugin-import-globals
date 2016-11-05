# babel-plugin-import-globals

Automatically import a whitelist of modules when they are used.  This is a bit like setting a global variable, except
that it is isolated to your project (it does not affect dependencies or dependents of the module as they will not be
running your babel transforms).  This can save a lot of time with the few core modules that are used everywhere, while
still leaving most modules using the standard `import foo from 'foo'` syntax so it's very explicit where something comes
from.

[![Build Status](https://img.shields.io/travis/mopedjs/babel-plugin-import-globals/master.svg)](https://travis-ci.org/mopedjs/babel-plugin-import-globals)
[![Dependency Status](https://img.shields.io/david/mopedjs/babel-plugin-import-globals/master.svg)](http://david-dm.org/mopedjs/babel-plugin-import-globals)
[![NPM version](https://img.shields.io/npm/v/babel-plugin-import-globals.svg)](https://www.npmjs.org/package/babel-plugin-import-globals)

## Installation

```
npm install babel-plugin-import-globals --save
```

## Usage

Put something like this in your .babelrc:


.babelrc
```js
{
  "plugins": [
    [
      "import-globals",
      {
        "React": "react",
        "Component": {"moduleName": "react", "exportName": "Component"},
        "PropTypes": {"moduleName": "react", "exportName": "PropTypes"}
      }
    ]
  ]
}
```

And then you can just do

```js
class MyElement extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
  };
  render() {
    return <div>{this.props.name}</div>
  }
}
```

And this tool will magically add in:

```js
import React, {Componet, PropTypes} from 'react';

class MyElement extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
  };
  render() {
    return <div>{this.props.name}</div>
  }
}
```

## License

MIT
