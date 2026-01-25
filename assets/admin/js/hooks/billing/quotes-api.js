const API_BASE = '/intern/api/quotes';

export async function fetchQuotes(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);

    const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Erreur lors du chargement des devis');
    }

    const json = await response.json();
    return json.data;
}

export async function fetchQuote(id) {
    const response = await fetch(`${API_BASE}/${id}`);

    if (!response.ok) {
        throw new Error('Devis introuvable');
    }

    const json = await response.json();
    return json.data;
}

export async function fetchTemplates() {
    const response = await fetch(`${API_BASE}/templates`);

    if (!response.ok) {
        throw new Error('Erreur lors du chargement des forfaits');
    }

    const json = await response.json();
    return json.data;
}

export async function fetchStats() {
    const response = await fetch(`${API_BASE}/stats`);

    if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
    }

    const json = await response.json();
    return json.data;
}

export async function createQuote(data) {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.error || 'Erreur lors de la création');
    }

    return json.data;
}

export async function updateQuote(id, data) {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.error || 'Erreur lors de la mise à jour');
    }

    return json.data;
}

export async function deleteQuote(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Erreur lors de la suppression');
    }
}

export async function sendQuote(id) {
    const response = await fetch(`${API_BASE}/${id}/send`, {
        method: 'POST',
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.error || "Erreur lors de l'envoi");
    }

    return json.data;
}

export async function updateQuoteStatus(id, status) {
    const response = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.error || 'Erreur lors du changement de statut');
    }

    return json.data;
}

export async function duplicateQuote(id) {
    const response = await fetch(`${API_BASE}/${id}/duplicate`, {
        method: 'POST',
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.error || 'Erreur lors de la duplication');
    }

    return json.data;
}
