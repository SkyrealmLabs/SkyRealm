import * as React from "react";
import Svg, { Path } from "react-native-svg";

const Phone = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color="#000000" fill="none" {...props}>
    <Path d="M22 16.5V19.75C22 20.3 21.78 20.82 21.39 21.21C21 21.6 20.48 21.82 19.93 21.82C16.07 21.82 12.51 19.95 9.84998 17.29C7.18998 14.63 5.31998 11.07 5.31998 7.21C5.31998 6.66 5.53998 6.14 5.92998 5.75C6.31998 5.36 6.83998 5.14 7.38998 5.14H10.64C11.05 5.14 11.43 5.34 11.67 5.69L13.05 7.68C13.29 8.03 13.32 8.48 13.11 8.86L11.71 11.22C12.84 13.19 14.6 14.95 16.57 16.07L18.92 14.68C19.3 14.47 19.75 14.5 20.1 14.74L22.09 16.12C22.44 16.36 22.64 16.74 22.64 17.15V16.5H22Z" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinejoin="round" />
  </Svg>
);

export default Phone;
