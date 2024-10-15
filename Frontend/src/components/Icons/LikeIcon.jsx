import React from "react";

function LikeIcon({
  width = 24,
  height = 24,
  stroke = "currentColor",
  strokeWidth = 2,
  fill = "none",
}) {
  return (
    // <svg
    //   className="feather feather-edit-2"
    //   fill={fill} // dynamic fill color
    //   height={height}
    //   stroke={stroke}
    //   strokeLinecap="round"
    //   strokeLinejoin="round"
    //   strokeWidth={strokeWidth}
    //   viewBox="0 0 24 24"
    //   width={width}
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    // </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      data-supported-dps="24x24"
      fill={fill}
      className="mercado-match"
      width={width}
      height={height}
      focusable="false"    
    >
      <path d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.85L8.89 9H4.12A2.12 2.12 0 002 11.12a2.16 2.16 0 00.92 1.76A2.11 2.11 0 002 14.62a2.14 2.14 0 001.28 2 2 2 0 00-.28 1 2.12 2.12 0 002 2.12v.14A2.12 2.12 0 007.12 22h7.49a8.08 8.08 0 003.58-.84l.31-.16H21V11zM19 19h-1l-.73.37a6.14 6.14 0 01-2.69.63H7.72a1 1 0 01-1-.72l-.25-.87-.85-.41A1 1 0 015 17l.17-1-.76-.74A1 1 0 014.27 14l.66-1.09-.73-1.1a.49.49 0 01.08-.7.48.48 0 01.34-.11h7.05l-1.31-3.92A7 7 0 0110 4.86V3.75a.77.77 0 01.75-.75.75.75 0 01.71.51L12 5a9 9 0 002.13 3.5l4.5 4.5H19z"></path>
    </svg>
  );
}
export default LikeIcon;
