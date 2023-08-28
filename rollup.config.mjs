import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import license from 'rollup-plugin-license';

const optimize = process.env.optimize || false;

export default {
  input: 'src/easytimer/easytimer.js',
  output: {
    format: 'umd',
    name: 'easytimer',
    file: `dist/easytimer${optimize ? '.min' : ''}.js`,
    exports: 'named'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled'
    }),
    optimize ? terser() : {},
    license({
      banner: `
        <%= pkg.name %>
        Generated: <%= moment().format('YYYY-MM-DD') %>
        Version: <%= pkg.version %>
        `
    })
  ]
};
