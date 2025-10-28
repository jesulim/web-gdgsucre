import "./speaker.css"

export interface Props {
  id: string
  title: string
  img: string
  name: string
  description: string
  countryFlag: string
}

export const SpeakerCard = ({ id, title, img, name, countryFlag, description }: Props) => {
  return (
    <div key={id} className="flex flex-col">
      <div className="mb-2 flex flex-col h-full rounded-lg">
        <h1 className="text-xl lg:text-2xl break-words leading-snug">{title}</h1>
      </div>

      {/* Card */}
      <div className="relative">
        {/* Imagen del speaker */}
        <div
          className="relative w-[360px] h-[290px] shadow-md rounded-xl overflow-hidden"
          style={{
            background: `url(${img}) center/cover no-repeat`,
            clipPath: "url(#roundedRect)",
          }}
        >
          {/* Bandera */}
          <div className="absolute right-6 bottom-4 w-15 lg:w-14">
            <img
              src={countryFlag}
              alt="Bandera"
              className="w-full aspect-[4/3] object-cover rounded-md shadow-md"
            />
          </div>
          <svg
            className="svg-borde"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            role="img"
            aria-label="Decorative border"
          >
            <title>Decorative border</title>
            <path
              d="M0.863632 0.670384V0.063018C0.863636 0.0547444 0.862366 0.0465508 0.859894 0.0389053C0.857422 0.0312599 0.853796 0.0243125 0.849224 0.0184601C0.844653 0.0126078 0.839224 0.00796527 0.833249 0.00479779C0.827274 0.00163032 0.820869 -1.90402e-09 0.814402 0H0.0492635C0.036198 0 0.0236677 0.00663938 0.014429 0.0184576C0.00519025 0.0302757 0 0.0463046 0 0.063018V0.701615C0 0.718328 0.00519025 0.734357 0.014429 0.746175C0.0236677 0.757994 0.036198 0.764633 0.0492635 0.764633H0.644C0.650468 0.764633 0.656872 0.766263 0.662847 0.769431C0.668822 0.772598 0.674251 0.777241 0.678823 0.783093C0.683395 0.788946 0.68702 0.795893 0.689492 0.803538C0.691964 0.811184 0.693234 0.819377 0.69323 0.827651V0.936982C0.693239 0.953692 0.698432 0.969714 0.707669 0.98153C0.716906 0.993346 0.729431 0.999989 0.742494 1H0.950736C0.963802 1 0.976332 0.993361 0.985571 0.981542C0.99481 0.969724 1 0.953695 1 0.936982V0.79642C1 0.779706 0.99481 0.763677 0.985571 0.751859C0.976332 0.740041 0.963802 0.733402 0.950736 0.733402H0.912895C0.89983 0.733402 0.887299 0.726762 0.878061 0.714944C0.868822 0.703126 0.863632 0.687097 0.863632 0.670384Z"
              fill="none"
              stroke="#EA4335"
              strokeWidth="0.02"
            />
          </svg>
        </div>

        {/* Datos del speaker */}
        <div className="absolute bottom-0 left-0 text-red-800 text-lg font-medium drop-shadow-[2px_2px_4px_rgba(0,0,0,0.7)] p-2">
          <h3 className=" text-white">{name}</h3>
          <p className="text-sm text-[#EA4335]">{description}</p>
        </div>
      </div>

      {/* Clip-path SVG */}
      <svg width="0" height="0" aria-hidden="true">
        <clipPath id="roundedRect" clipPathUnits="objectBoundingBox">
          <path d="M0.863632 0.670384V0.063018C0.863636 0.0547444 0.862366 0.0465508 0.859894 0.0389053C0.857422 0.0312599 0.853796 0.0243125 0.849224 0.0184601C0.844653 0.0126078 0.839224 0.00796527 0.833249 0.00479779C0.827274 0.00163032 0.820869 -1.90402e-09 0.814402 0H0.0492635C0.036198 0 0.0236677 0.00663938 0.014429 0.0184576C0.00519025 0.0302757 0 0.0463046 0 0.063018V0.701615C0 0.718328 0.00519025 0.734357 0.014429 0.746175C0.0236677 0.757994 0.036198 0.764633 0.0492635 0.764633H0.644C0.650468 0.764633 0.656872 0.766263 0.662847 0.769431C0.668822 0.772598 0.674251 0.777241 0.678823 0.783093C0.683395 0.788946 0.68702 0.795893 0.689492 0.803538C0.691964 0.811184 0.693234 0.819377 0.69323 0.827651V0.936982C0.693239 0.953692 0.698432 0.969714 0.707669 0.98153C0.716906 0.993346 0.729431 0.999989 0.742494 1H0.950736C0.963802 1 0.976332 0.993361 0.985571 0.981542C0.99481 0.969724 1 0.953695 1 0.936982V0.79642C1 0.779706 0.99481 0.763677 0.985571 0.751859C0.976332 0.740041 0.963802 0.733402 0.950736 0.733402H0.912895C0.89983 0.733402 0.887299 0.726762 0.878061 0.714944C0.868822 0.703126 0.863632 0.687097 0.863632 0.670384Z"></path>
        </clipPath>
      </svg>
    </div>
  )
}
