import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 160 184"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="CubeGen AI Logo"
    role="img"
  >
    <g fill="currentColor" fillRule="nonzero">
      <path d="M79.998 21.6L1.898 67.5v93l78.1 45.9 78.1-45.9v-93L79.998 21.6zm0 11.603l68.7 40.502v82.79l-68.7 40.503-68.7-40.502v-82.79L79.998 33.203z" />
      <path d="M79.998 44.805L21.298 78.607v65.603l58.7 34.402 58.7-34.402V78.607L79.998 44.805zm0 11.603l49.3 28.902v54.002l-49.3 28.902-49.3-28.902V85.31l49.3-28.902z" />
      <path d="M79.998 68.01l-39.9 23.4v42.4l39.9 23.4 39.9-23.4v-42.4l-39.9-23.4zm0 11.603l30.5 17.9v30.799l-30.5 17.9-30.5-17.9V97.513l30.5-17.9z" />
      <path d="M79.998 91.213l-20.5 12.001v21.2l20.5 12 20.5-12v-21.2l-20.5-12.001zm0 11.602l10.8 6.3v10.6l-10.8 6.3-10.8-6.3v-10.6l10.8-6.3z" />
    </g>
  </svg>
);

export default Logo;