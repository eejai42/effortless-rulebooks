import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api';
import type { ConformanceRunState, Loop } from '../types';
import './EffortlessLoops.css';

type StatusFilter = 'all' | 'complete' | 'planned';

function loopNum(id: string): number {
  const m = id.match(/loop-(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export function EffortlessLoopsView() {
  const [loops, setLoops] = useState<Loop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [conformance, setConformance] = useState<ConformanceRunState | null>(null);
  const [conformanceError, setConformanceError] = useState<string | null>(null);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    Promise.all([api.loops(), api.conformanceStatus()])
      .then(([loopRows, conf]) => {
        setLoops(loopRows);
        setConformance(conf);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (conformance?.status !== 'running') return;
    const timer = window.setInterval(() => {
      api.conformanceStatus().then(setConformance).catch(() => {});
    }, 2000);
    return () => window.clearInterval(timer);
  }, [conformance?.status]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [conformance?.output]);

  const filtered = useMemo(() => {
    const rows =
      filter === 'all' ? loops : loops.filter(l => l.status === filter);
    return [...rows].sort((a, b) => loopNum(a.loop_id) - loopNum(b.loop_id));
  }, [loops, filter]);

  const counts = useMemo(() => {
    const complete = loops.filter(l => l.status === 'complete').length;
    const planned = loops.filter(l => l.status === 'planned').length;
    return { complete, planned, total: loops.length };
  }, [loops]);

  const runConformance = useCallback(async () => {
    setConformanceError(null);
    try {
      const started = await api.runConformance();
      setConformance(started);
    } catch (err) {
      setConformanceError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  if (loading) return <div className="loading">Loading…</div>;

  const confStatus = conformance?.status ?? 'idle';
  const running = confStatus === 'running';

  return (
    <div className="loops-page">
      <div className="page-title">Effortless Loops</div>
      <div className="page-desc">
        Build history and forward plan from the rulebook <code>Loops</code> table —
        each turn is CHANGE-RULE → REBUILD → CONSUME-VIEWS.
      </div>

      <div className="loop-stats">
        <div className="card loop-stat">
          <div className="loop-stat-num total">{counts.total}</div>
          <div className="stat-caption">Total loops</div>
        </div>
        <div className="card loop-stat">
          <div className="loop-stat-num complete">{counts.complete}</div>
          <div className="stat-caption">Complete</div>
        </div>
        <div className="card loop-stat">
          <div className="loop-stat-num planned">{counts.planned}</div>
          <div className="stat-caption">Planned</div>
        </div>
      </div>

      <div className="card conformance-panel">
        <div className="conformance-head">
          <h3>OWL-SHACL conformance receipt</h3>
          <div className="conformance-actions">
            <span className={`conformance-status ${confStatus}`}>{confStatus}</span>
            <button
              type="button"
              className="conformance-run-btn"
              disabled={running}
              onClick={() => void runConformance()}
            >
              {running ? 'Running…' : 'Run conformance test'}
            </button>
          </div>
        </div>
        <p className="conformance-note">
          Cross-substrate diff: Postgres <code>vw_*</code> views vs OWL-SHACL derived fields.
          Removed from <code>effortless build</code> (times out at 238 studies) — run on demand after
          <code>effortless build</code> + <code>./init-db.sh</code>.
        </p>
        {conformanceError && (
          <p style={{ color: '#ff7b72', fontSize: 13, margin: '0 0 8px' }}>{conformanceError}</p>
        )}
        <pre ref={logRef} className="conformance-log">
          {conformance?.output?.trim() || '(no output yet — click Run conformance test)'}
        </pre>
        {conformance?.finished_at && (
          <div className="loop-meta" style={{ marginTop: 8 }}>
            <span>
              Finished {new Date(conformance.finished_at).toLocaleString()}
              {conformance.exit_code != null ? ` · exit ${conformance.exit_code}` : ''}
            </span>
          </div>
        )}
      </div>

      <div className="loop-status-filter">
        {(['all', 'complete', 'planned'] as const).map(key => (
          <button
            key={key}
            type="button"
            className={filter === key ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? `All (${counts.total})` : key === 'complete' ? `Complete (${counts.complete})` : `Planned (${counts.planned})`}
          </button>
        ))}
      </div>

      <div className="loop-list">
        {filtered.map(loop => (
          <details key={loop.loop_id} className="loop-card">
            <summary>
              <span className="loop-card-id">{loop.loop_id}</span>
              <span className="loop-card-title">{loop.title}</span>
              <span className={`loop-badge ${loop.status}`}>{loop.status}</span>
            </summary>
            <div className="loop-body">
              {loop.new_concept && (
                <div className="loop-field">
                  <div className="loop-field-label">New concept</div>
                  {loop.new_concept}
                </div>
              )}
              {loop.domain_question && (
                <div className="loop-field">
                  <div className="loop-field-label">Domain question</div>
                  {loop.domain_question}
                </div>
              )}
              {loop.mock_data_note && (
                <div className="loop-field">
                  <div className="loop-field-label">Witnessed</div>
                  {loop.mock_data_note}
                </div>
              )}
              {loop.next_suggestion && (
                <div className="loop-field">
                  <div className="loop-field-label">Next suggestion</div>
                  {loop.next_suggestion}
                </div>
              )}
              {(loop.commit_short || loop.git_tag || loop.commit_date) && (
                <div className="loop-meta">
                  {loop.git_tag && <span>Tag: <code>{loop.git_tag}</code></span>}
                  {loop.commit_short && <span>Commit: <code>{loop.commit_short}</code></span>}
                  {loop.commit_date && <span>{loop.commit_date}</span>}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
