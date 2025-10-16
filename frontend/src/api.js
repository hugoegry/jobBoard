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
  const res = await fetch(url);
  return handleResponse(res);
}

// http://localhost/api/user/create?p:email=hugo.test@gmail.com&p:password=ttt222&p:last_name=ln&p:first_name=fn
export async function createEntity(module, params) {
  const pData = {};
  for (const [k, v] of Object.entries(params)) pData[`p:${k}`] = v;
  const body = JSON.stringify({ ...pData });
  const res = await fetch(`${API_BASE}/${module}`, {
    method: "POST",
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
    headers: { "Content-Type": "application/json" },
    body,
  });
  return res.status === 201 ? null : handleResponse(res);
}
