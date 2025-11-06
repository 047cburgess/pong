
export function userId(): number {
  const el = document.getElementById('userSelect') as HTMLSelectElement;
  return Number(el.value);
}

// Définition de l'interface pour la réponse de l'API pour une meilleure typage
interface ApiResponse<T = any> {
	status: number;
	data: T | null;
	errors: any[];
}

export async function apiCall<T>(
	method: string,
	url: string,
	user_id: number = userId(),
	body?: any
): Promise<ApiResponse<T>> {

	const headers: Record<string, string> = {
		"x-user-id": String(user_id),
	};

	let requestBody: string | null = null;

	if (body !== undefined && body !== null) {
		requestBody = JSON.stringify(body);
		headers["Content-Type"] = "application/json";
	}

	const opts: RequestInit = {
		method,
		headers,
		body: requestBody
	};

	const res = await fetch(url, opts);

	let data: T | null = null;
	let errors: any[] = [];

	try {
		const json = await res.json().catch(() => null);

		if (res.status >= 400) {
			errors = json?.errors ?? json;
		}
		data = json;

	} catch (e) {
		data = null;
	}

	return { status: res.status, data, errors };
}