const roles = new Set(["admin", "support", "merchant", "trader", "provider"]);

function json(response, status = 200) {
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase admin API is not configured.");
  }

  return { url: url.replace(/\/$/, ""), anonKey, serviceRoleKey };
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function bearerToken(request) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
}

async function supabaseFetch(config, path, options = {}) {
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      apikey: options.service ? config.serviceRoleKey : config.anonKey,
      authorization: `Bearer ${options.service ? config.serviceRoleKey : options.token}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(body?.msg || body?.message || body?.error_description || text);
  }
  return body;
}

async function requireTrainingAdmin(request, config) {
  const token = bearerToken(request);
  if (!token) {
    return null;
  }

  const authUser = await supabaseFetch(config, "/auth/v1/user", {
    method: "GET",
    token
  });

  const params = new URLSearchParams({
    auth_user_id: `eq.${authUser.id}`,
    select: "id,role,is_active"
  });
  const profiles = await supabaseFetch(config, `/rest/v1/training_users?${params}`, {
    method: "GET",
    service: true
  });

  const profile = profiles[0];
  if (!profile || profile.role !== "admin" || !profile.is_active) {
    return null;
  }

  return profile;
}

function assertEmployeeInput(body) {
  if (!body.email || typeof body.email !== "string") {
    throw new Error("Email is required.");
  }
  if (!body.displayName || typeof body.displayName !== "string") {
    throw new Error("Display name is required.");
  }
  if (!roles.has(body.role)) {
    throw new Error("Invalid role.");
  }
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  let config;
  try {
    config = getSupabaseConfig();
  } catch (error) {
    return json({ error: error.message }, 500);
  }

  let adminProfile;
  try {
    adminProfile = await requireTrainingAdmin(request, config);
  } catch {
    return json({ error: "Admin verification failed." }, 401);
  }
  if (!adminProfile) {
    return json({ error: "Access denied." }, 403);
  }

  const body = await readBody(request);

  try {
    if (request.method === "POST" && body.action === "create") {
      assertEmployeeInput(body);
      if (!body.temporaryPassword || body.temporaryPassword.length < 8) {
        throw new Error("Temporary password must contain at least 8 characters.");
      }

      const authUser = await supabaseFetch(config, "/auth/v1/admin/users", {
        method: "POST",
        service: true,
        body: JSON.stringify({
          email: body.email.trim().toLowerCase(),
          password: body.temporaryPassword,
          email_confirm: true,
          user_metadata: {
            display_name: body.displayName.trim(),
            training_role: body.role
          }
        })
      });

      const rows = await supabaseFetch(config, "/rest/v1/training_users", {
        method: "POST",
        service: true,
        headers: {
          Prefer: "return=representation,resolution=merge-duplicates"
        },
        body: JSON.stringify({
          auth_user_id: authUser.id,
          email: body.email.trim().toLowerCase(),
          display_name: body.displayName.trim(),
          role: body.role,
          is_active: true,
          note: body.note || ""
        })
      });

      return json({ user: rows[0] });
    }

    if (request.method === "PATCH" && body.action === "update") {
      if (!body.id) {
        throw new Error("User id is required.");
      }
      const patch = {};
      if (typeof body.displayName === "string") patch.display_name = body.displayName.trim();
      if (typeof body.note === "string") patch.note = body.note;
      if (typeof body.isActive === "boolean") patch.is_active = body.isActive;
      if (body.role) {
        if (!roles.has(body.role)) throw new Error("Invalid role.");
        patch.role = body.role;
      }

      const rows = await supabaseFetch(
        config,
        `/rest/v1/training_users?id=eq.${encodeURIComponent(body.id)}`,
        {
          method: "PATCH",
          service: true,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(patch)
        }
      );

      return json({ user: rows[0] });
    }

    if (request.method === "PATCH" && body.action === "resetPassword") {
      if (!body.authUserId || !body.temporaryPassword || body.temporaryPassword.length < 8) {
        throw new Error("Auth user id and a temporary password are required.");
      }

      await supabaseFetch(
        config,
        `/auth/v1/admin/users/${encodeURIComponent(body.authUserId)}`,
        {
          method: "PUT",
          service: true,
          body: JSON.stringify({ password: body.temporaryPassword })
        }
      );

      return json({ ok: true });
    }

    return json({ error: "Unsupported admin action." }, 400);
  } catch (error) {
    return json({ error: error.message || "Admin action failed." }, 400);
  }
}
