const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = 'Request failed';
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
};

export const runSingleSimulation = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const compareAlgorithms = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const uploadTestcase = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/testcases/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(res);
};

export const listTestcases = async () => {
  const res = await fetch(`${BASE_URL}/api/testcases`);
  return handleResponse(res);
};

export const runTestcase = async (id) => {
  const res = await fetch(`${BASE_URL}/api/testcases/run/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return handleResponse(res);
};