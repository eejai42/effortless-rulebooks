import { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';

export function useConstraints() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { api.constraints.list().then(setData).catch(setError).finally(() => setLoading(false)); }, []);
  const refresh = useCallback(() => { setLoading(true); api.constraints.list().then(setData).catch(setError).finally(() => setLoading(false)); }, []);
  return { data, loading, error, refresh };
}

export function useConstraint(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { if (id) api.constraints.get(id).then(setData).catch(setError).finally(() => setLoading(false)); }, [id]);
  return { data, loading, error };
}

export function useCreateConstraint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mutate = useCallback(async (body) => { setLoading(true); setError(null); try { return await api.constraints.create(body); } catch (e) { setError(e); throw e; } finally { setLoading(false); } }, []);
  return { mutate, loading, error };
}

export function useUpdateConstraint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mutate = useCallback(async (id, body) => { setLoading(true); setError(null); try { return await api.constraints.update(id, body); } catch (e) { setError(e); throw e; } finally { setLoading(false); } }, []);
  return { mutate, loading, error };
}

export function useDeleteConstraint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mutate = useCallback(async (id) => { setLoading(true); setError(null); try { return await api.constraints.remove(id); } catch (e) { setError(e); throw e; } finally { setLoading(false); } }, []);
  return { mutate, loading, error };
}
