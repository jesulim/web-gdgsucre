import { OrganizadoresCarousel } from "./organizadoresCard"

export default function OrganizadoresSection() {
  return (
    <section className="flex flex-col items-center py-8">
      <h2 className="text-2xl md:text-4xl font-bold text-black leading-tight text-center pb-4 md:pb-10">
        ORGANIZADORES
      </h2>
      <OrganizadoresCarousel />
    </section>
  )
}
