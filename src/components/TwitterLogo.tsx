import type { SVGProps, VFC } from 'react'

export const TwitterLogo: VFC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 400 400"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
    >
      <path
        d="M125.792,361 C276.736,361 359.296,236.360155 359.296,128.273043 C359.296,124.732863 359.296,121.20863 359.056,117.700344 C375.117302,106.121578 388.981688,91.7849423 400,75.3617069 C385.022065,81.9764496 369.133268,86.3143958 352.864,88.230739 C369.995904,78.0085823 382.817976,61.9309023 388.944,42.9897923 C372.83452,52.5172664 355.210338,59.2317549 336.832,62.8435035 C311.393324,35.8838266 270.97151,29.2853509 238.232788,46.7481226 C205.494067,64.2108943 188.5804,101.392007 196.976,137.442428 C130.990332,134.145429 69.5116125,103.082324 27.84,51.9837627 C6.0579641,89.3572932 17.1838061,137.169092 53.248,161.171201 C40.1878592,160.78541 27.4124699,157.274024 16,150.933383 C16,151.268265 16,151.619094 16,151.969923 C16.0106901,190.90541 43.5480238,224.440516 81.84,232.150212 C69.7579135,235.434287 57.0812894,235.914352 44.784,233.553526 C55.5351669,266.873042 86.345193,289.698607 121.456,290.355871 C92.3957606,313.11878 56.4969522,325.475854 19.536,325.438734 C13.0064571,325.426241 6.48326504,325.032211 0,324.258674 C37.5301752,348.262952 81.1986144,360.995486 125.792,360.936213"
        fill="currentColor"
      />
    </svg>
  )
}