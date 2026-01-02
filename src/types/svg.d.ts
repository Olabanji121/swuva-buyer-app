/**
 * SVG Module Declaration
 *
 * Allows importing SVG files as React components.
 * Works with react-native-svg-transformer/expo.
 */

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
