import uglify from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';

let optimize = process.env.optimize || false;

export default {
  input: 'src/easytimer/easytimer.js',
  output: {
    format: 'umd',
    name: 'Timer',
    file: `dist/easytimer${optimize ? '.min' : ''}.js`
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    optimize ? uglify() : {}
  ]
};
