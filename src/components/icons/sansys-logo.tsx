
import type { SVGProps } from 'react';

export function SansysLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 100" // Adjusted viewBox
      width="150" // Default width, can be overridden by props
      height={75} // Default height
      {...props}
    >
      {/* Stylized S - updated paths and colors to better match the new image */}
      <g transform="translate(25, 5) scale(0.35)">
        {/* Upper blue part - more curved */}
        <path
          d="M85.7,26.6c-10.6-8.2-24.4-11.6-40.5-7.7C21.4,24.1,9.3,43.4,10.2,66.9c0.7,19.1,15.3,35.8,34.3,39.9 c14.4,3.1,29.2,0.5,41.7-7.3c-5.2,4.1-11.5,6.8-18.5,7.7c-14.8,2-29.5-3.8-38.7-15.8c-10.1-13.1-11.1-31.1-2.4-45 C35.1,30.3,50.8,22.4,67,22.4c6.6,0,12.9,1.2,18.7,3.4V26.6z"
          fill="#00AEEF" // Light blue from new image
        />
        {/* Lower orange/yellow part - more curved */}
        <path
          d="M16.2,83.2c10.6,8.2,24.4,11.6,40.5,7.7c23.8-5.2,35.9-24.5,35-48c-0.7-19.1-15.3-35.8-34.3-39.9 c-14.4-3.1,29.2-0.5,41.7,7.3c5.2-4.1,11.5-6.8,18.5-7.7c14.8-2,29.5,3.8,38.7,15.8c10.1,13.1,11.1,31.1,2.4,45 c-8.6,16.2-24.3,24.1-40.5,24.1c-6.6,0-12.9-1.2-18.7-3.4V83.2z"
          fill="#FDB913" // Orange/Yellow from new image
        />
        {/* TM symbol - adjusted position */}
        <text
          x="105"
          y="25"
          fontSize="10"
          fill="#696969" // Greyish for TM
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          TM
        </text>
      </g>

      {/* Text: SANSYS INFORMATICS - Updated color */}
      <text
        x="10" // Start a bit from the left
        y="70" // Position below the S mark
        fontSize="12"
        fill="#00529B" // Darker Blue from new image
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        letterSpacing="0.5"
      >
        SANSYS INFORMATICS
      </text>

      {/* Text: Innovations Destination ! - Updated color and style */}
      <text
        x="10" // Start a bit from the left
        y="88" // Position below "SANSYS INFORMATICS"
        fontSize="10"
        fill="#D91E2A" // Red/Magenta from new image
        fontFamily="Arial, Helvetica, sans-serif"
        fontStyle="italic"
        fontWeight="500"
      >
        Innovations Destination !
      </text>
    </svg>
  );
}
