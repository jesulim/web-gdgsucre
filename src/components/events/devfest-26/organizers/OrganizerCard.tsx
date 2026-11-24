interface Props {
  img: string | null
  full_name: string
}

export const OrganizerCard = ({ img, full_name }: Props) => {
  const initials = full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(name => name.charAt(0).toUpperCase())
    .join("")

  return (
    <article className="flex h-full min-h-72 flex-col items-center gap-5 rounded-2xl border border-white/50 p-5 text-center sm:p-6">
      {img ? (
        <div className="size-36 shrink-0 rounded-full bg-[conic-gradient(from_0deg,#4285f4,#8a4fff,#ea4335,#ff8a00,#fbbc04,#34a853,#4285f4)] p-1 sm:size-44">
          <img
            src={img}
            alt={full_name}
            className="size-full rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div className="size-36 shrink-0 rounded-full bg-[conic-gradient(from_0deg,#4285f4,#8a4fff,#ea4335,#ff8a00,#fbbc04,#34a853,#4285f4)] p-1 sm:size-44">
          <div className="flex size-full items-center justify-center rounded-full bg-df-black text-5xl font-bold text-white">
            {initials || "?"}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-white sm:text-2xl">{full_name}</h3>
    </article>
  )
}
