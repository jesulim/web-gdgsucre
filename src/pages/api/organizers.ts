import type { APIRoute } from "astro";
import {
  addOrganizer,
  getOrganizers,
  removeOrganizerById,
  toggleOrganizerByRegistration,
} from "@/lib/services/organizersService";
import { createUserClient } from "@/lib/supabase";

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "slug es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = await createUserClient(cookies);
    const organizers = await getOrganizers(supabase, slug);

    if (!organizers) {
      return new Response(
        JSON.stringify({ error: "No se pudieron obtener los organizadores" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(organizers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error al obtener organizadores: ${error}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const {
      registrationId,
      email,
      eventSlug,
      first_name,
      last_name,
      phone_number,
      profile_id,
    } = body;

    const supabase = await createUserClient(cookies);

    if (registrationId) {
      const result = await addOrganizer(supabase, registrationId);
      if (!result.success) {
        const errorMessage =
          result.reason === "registration_not_found"
            ? "El registro no fue encontrado"
            : result.message || "No se pudo agregar el organizador";

        return new Response(JSON.stringify({ error: errorMessage }), {
          status: result.reason === "registration_not_found" ? 404 : 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ message: "Organizador agregado exitosamente" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!eventSlug || (!email && !profile_id)) {
      return new Response(
        JSON.stringify({
          error: "eventSlug y email o profile_id son requeridos",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = await addOrganizer(supabase, {
      email,
      eventSlug,
      first_name,
      last_name,
      phone_number,
      profile_id,
    });

    if (!result.success) {
      const status =
        result.reason === "already_organizer"
          ? 400
          : result.reason === "user_not_found" ||
              result.reason === "event_not_found"
            ? 404
            : 500;

      return new Response(
        JSON.stringify({
          error: result.message || "No se pudo agregar el organizador",
          reason: result.reason,
        }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Organizador agregado exitosamente",
        data: result.data,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error al agregar organizador: ${error}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { id, registrationId } = body;

    if (!id && !registrationId) {
      return new Response(
        JSON.stringify({ error: "id o registrationId es requerido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = await createUserClient(cookies);

    if (id) {
      const success = await removeOrganizerById(supabase, Number(id));
      if (!success) {
        return new Response(
          JSON.stringify({ error: "No se pudo eliminar el organizador" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ message: "Organizador eliminado exitosamente" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (registrationId) {
      const result = await toggleOrganizerByRegistration(
        supabase,
        registrationId,
        "remove",
      );
      if (!result.success) {
        return new Response(
          JSON.stringify({ error: "No se pudo eliminar el organizador" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response(
        JSON.stringify({ message: "Organizador eliminado exitosamente" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "id o registrationId es requerido" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error al eliminar organizador: ${error}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { id, first_name, last_name, phone_number } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "El ID del organizador es requerido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabase = await createUserClient(cookies);

    const { data: organizer } = await supabase
      .from("organizers")
      .select("profile_id")
      .eq("id", id)
      .single();

    if (!organizer) {
      return new Response(
        JSON.stringify({ error: "Organizador no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: first_name?.trim(),
        last_name: last_name?.trim(),
        phone_number: phone_number?.trim() || null,
      })
      .eq("id", organizer.profile_id);

    if (updateError) {
      console.error("Error al actualizar el organizador", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: "Organizador actualizado correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error al actualizar: ${error}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
