const API_BASE = "http://localhost/api";

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: "Erreur : réponse serveur invalide" };
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || "Erreur API");
  }
  return data;
}

export async function fetchList(module, query = "") {
  const url = `${API_BASE}/${module}${query ? "?" + query : ""}`;
  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // Inclure les cookies pour la session
  });
  return handleResponse(res);
}

export async function createEntity(module, params) {
  const pData = {};
  for (const [k, v] of Object.entries(params)) pData[`p:${k}`] = v;
  const body = JSON.stringify({ ...pData });
  const res = await fetch(`${API_BASE}/${module}`, {
    method: "POST",
    credentials: "include", // Inclure les cookies pour la session
    headers: { "Content-Type": "application/json" },
    body,
  });
  return handleResponse(res);
}

export async function updateEntity(module, params, fields) {
  const fData = {};
  for (const [k, v] of Object.entries(fields)) fData[`f:${k}`] = v;

  const pData = {};
  for (const [k, v] of Object.entries(params)) pData[`p:${k}`] = v;
  const body = JSON.stringify({ ...pData, ...fData });
  const res = await fetch(`${API_BASE}/${module}`, {
    method: "PUT",
    credentials: "include", // Inclure les cookies pour la session
    headers: { "Content-Type": "application/json" },
    body,
  });
  return handleResponse(res);
}

export async function deleteEntity(module, params) {
  const pData = {};
  for (const [k, v] of Object.entries(params)) pData[`p:${k}`] = v;
  const body = JSON.stringify(pData);
  const res = await fetch(`${API_BASE}/${module}`, {
    method: "DELETE",
    credentials: "include", // Inclure les cookies pour la session
    headers: { "Content-Type": "application/json" },
    body,
  });
  return res.status === 201 ? null : handleResponse(res);
}
