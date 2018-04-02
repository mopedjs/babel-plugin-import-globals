import {transform} from 'babel-core';
import transformRuntime from '@babel/plugin-transform-runtime';
import syntaxClassProperties from '@babel/plugin-syntax-class-properties';
import syntaxJsx from '@babel/plugin-syntax-jsx';
import transformJsx from '@babel/plugin-transform-react-jsx';
import plugin from '../src';

test('Invalid options throws helpful error', () => {
  // counter example
  const opts = {
    babelrc: false,
    plugins: [
      [
        plugin,
        {
          Promise: {name: 'promise'},
        },
      ],
    ],
  };
  const input = `Promise.resolve(foo).then(console.log);`;
  expect(
    () => transform(input, opts)
  ).toThrow(/Invalid config options for babel-plugin-import-globals/);
});

test('Imports Promise', () => {
  const opts = {
    babelrc: false,
    plugins: [
      [
        plugin,
        {
          Promise: 'promise',
        },
      ],
    ],
  };
  const input = `Promise.resolve(foo).then(console.log);`;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});
test('Still imports Promise when we use transform runtime first', () => {
  const opts = {
    babelrc: false,
    plugins: [
      transformRuntime,
      [
        plugin,
        {
          Promise: {moduleName: 'promise', exportName: 'default'},
        },
      ],
    ],
  };
  const input = `Promise.resolve(foo).then(console.log);`;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});
test('Still imports Promise when we use transform runtime after', () => {
  const opts = {
    babelrc: false,
    plugins: [
      [
        plugin,
        {
          Promise: {moduleName: 'promise', exportName: 'default'},
        },
      ],
      transformRuntime,
    ],
  };
  const input = `Promise.resolve(foo).then(console.log);`;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});
test('Imports React', () => {
  const opts = {
    babelrc: false,
    plugins: [
      syntaxClassProperties,
      syntaxJsx,
      [
        plugin,
        {
          React: 'react',
          Component: {moduleName: 'react', exportName: 'Component'},
          PropTypes: {moduleName: 'react', exportName: 'PropTypes'},
        },
      ],
    ],
  };
  const input = `
    class MyElement extends Component {
      static propTypes = {
        name: PropTypes.string.isRequired,
      };
      render() {
        return <div>{this.props.name}</div>
      }
    }
  `;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});

test('Imports React + JSX', () => {
  const opts = {
    babelrc: false,
    plugins: [
      syntaxClassProperties,
      transformJsx,
      [
        plugin,
        {
          React: 'react',
          Component: {moduleName: 'react', exportName: 'Component'},
          PropTypes: {moduleName: 'react', exportName: 'PropTypes'},
        },
      ],
    ],
  };
  const input = `
    class MyElement extends Component {
      static propTypes = {
        name: PropTypes.string.isRequired,
      };
      render() {
        return <div>{this.props.name}</div>
      }
    }
  `;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});


test('Does not double import React + JSX', () => {
  const opts = {
    babelrc: false,
    plugins: [
      syntaxClassProperties,
      transformJsx,
      [
        plugin,
        {
          React: 'react',
          Component: {moduleName: 'react', exportName: 'Component'},
          PropTypes: {moduleName: 'react', exportName: 'PropTypes'},
        },
      ],
    ],
  };
  const input = `
    import React, {Component, PropTypes} from 'react';

    class MyElement extends Component {
      static propTypes = {
        name: PropTypes.string.isRequired,
      };
      render() {
        return <div>{this.props.name}</div>
      }
    }
  `;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});

test('JSX Elements', () => {
  const opts = {
    babelrc: false,
    plugins: [
      syntaxClassProperties,
      transformJsx,
      [
        plugin,
        {
          React: 'react',
          Component: {moduleName: 'react', exportName: 'Component'},
          PropTypes: {moduleName: 'react', exportName: 'PropTypes'},
          Match: {moduleName: 'react-router', exportName: 'Match'},
        },
      ],
    ],
  };
  const input = `
    const element = (
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/topics">Topics</Link></li>
        </ul>

        <hr/>

        <Match exactly pattern="/" component={Home} />
        <Match pattern="/about" component={About} />
        <Match pattern="/topics" component={Topics} />
      </div>
    );
  `;
  const {code} = transform(input, opts);
  expect(code).toMatchSnapshot();
});
