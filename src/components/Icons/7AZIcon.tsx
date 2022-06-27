import * as React from "react";

const SvgComponent = (
  props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={50}
    height={50}
    viewBox="0 -1000 4791.76 1858.11"
    {...props}
  >
    <defs>
      <style>{".fil0{fill:#14e7b0}"}</style>
    </defs>
    <g id="Camada_x0020_1">
      <g id="_2300562221360">
        <path
          className="fil0"
          d="M195.66 1858.11H669.3L1740.01 3.63H0l236.13 408.98h794.11zM3587.1 930.87l-535.36 927.24h1503.89l236.13-408.98H3761.51l299.23-518.26h195.66L4791.76 3.63H3051.74l236.13 408.98h794.12l-299.23 518.26z"
        />
        <path
          className="fil0"
          d="m2215.76 0-236.83 410.18 236.83 410.18-363.04 628.78h726.06l-236.13 408.97h-1199.7l599.16-1037.75h473.65l599.16 1037.75h473.64z"
        />
      </g>
    </g>
  </svg>
);

export default SvgComponent;
