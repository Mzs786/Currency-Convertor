// Example of ES module syntax for PostCSS config
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default {
  plugins: [
    autoprefixer(),
    cssnano()
  ]
};