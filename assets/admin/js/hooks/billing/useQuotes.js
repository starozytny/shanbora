import { useState, useEffect, useCallback } from 'react';
import * as api from '@adminHooks/billing/quotes-api';

export function useQuotes(initialFilters = {}) {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    const loadQuotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.fetchQuotes(filters);
            setQuotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadQuotes();
    }, [loadQuotes]);

    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const refresh = useCallback(() => {
        loadQuotes();
    }, [loadQuotes]);

    return {
        quotes,
        loading,
        error,
        filters,
        updateFilters,
        refresh,
    };
}

export function useQuote(id) {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(!!id);
    const [error, setError] = useState(null);

    const loadQuote = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const data = await api.fetchQuote(id);
            setQuote(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadQuote();
    }, [loadQuote]);

    const refresh = useCallback(() => {
        loadQuote();
    }, [loadQuote]);

    return { quote, loading, error, refresh, setQuote };
}

export function useTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.fetchTemplates();
                setTemplates(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return { templates, loading, error };
}

export function useQuoteStats() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            const data = await api.fetchStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return { stats, loading, refresh: loadStats };
}

export function useQuoteActions(onSuccess) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (action, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const result = await action(...args);
            onSuccess?.();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [onSuccess]);

    const create = useCallback((data) => execute(api.createQuote, data), [execute]);
    const update = useCallback((id, data) => execute(api.updateQuote, id, data), [execute]);
    const remove = useCallback((id) => execute(api.deleteQuote, id), [execute]);
    const send = useCallback((id) => execute(api.sendQuote, id), [execute]);
    const updateStatus = useCallback((id, status) => execute(api.updateQuoteStatus, id, status), [execute]);
    const duplicate = useCallback((id) => execute(api.duplicateQuote, id), [execute]);

    return {
        loading,
        error,
        create,
        update,
        remove,
        send,
        updateStatus,
        duplicate,
    };
}
