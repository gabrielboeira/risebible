import { useEffect, useMemo, useState } from 'react'
import { B, norm, refName } from '../lib/bible.js'
import { Icon } from '../components/ui.jsx'

let IDX = null
const index = () => IDX || (IDX = B.flatMap((bk, b) => bk.c.flatMap((vs, ci) => vs.map((t, vi) => [b, ci + 1, vi + 1, norm(t)]))))
const IDEAS = ['ansiedade', 'coragem', 'luz do mundo', 'amigo', 'perdoa', 'não temas']

export default function Search({ openRef, go }) {
  const [q, setQ] = useState(() => { try { return sessionStorage.getItem('rise:q') || '' } catch { return '' } })
  const [scope, setScope] = useState('all')
  const [dq, setDq] = useState(q)
  useEffect(() => { const t = setTimeout(() => setDq(q), 220); try { sessionStorage.setItem('rise:q', q) } catch { /* */ } return () => clearTimeout(t) }, [q])

  const nq = norm(dq.trim())
  const hits = useMemo(() => nq.length < 3 ? [] : index().filter(([b, , , t]) => (scope === 'all' || (scope === 'at' ? b < 39 : b >= 39)) && t.includes(nq)), [nq, scope])

  return (
    <div className="search">
      <div className="subhead">
        <button className="btn icon ghost" onClick={() => go('biblia')} aria-label="Voltar para a Bíblia"><Icon name="left" /></button>
        <h1 className="title">Buscar</h1>
      </div>
      <form role="search" onSubmit={e => { e.preventDefault(); e.target.querySelector('input').blur() }}>
        <Icon name="search" size={20} />
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Palavra ou frase" aria-label="Buscar na Bíblia" autoComplete="off" autoFocus />
      </form>
      <div className="seg">
        {[['all', 'Toda a Bíblia'], ['at', 'Antigo'], ['nt', 'Novo']].map(([id, l]) => <button key={id} className={scope === id ? 'on' : ''} onClick={() => setScope(id)}>{l}</button>)}
      </div>
      {nq.length < 3 ? (
        <div className="ideas"><p className="muted">Experimente:</p><div className="chips">{IDEAS.map(i => <button key={i} onClick={() => setQ(i)}>{i}</button>)}</div></div>
      ) : !hits.length ? (
        <div className="empty"><b>Nada encontrado para “{dq.trim()}”</b>Tente outra palavra ou só uma parte dela.</div>
      ) : (
        <>
          <p className="muted count">{hits.length} {hits.length === 1 ? 'versículo' : 'versículos'}{hits.length > 150 ? ' · mostrando os 150 primeiros' : ''}</p>
          <ul className="list">
            {hits.slice(0, 150).map(([b, c, v]) => {
              const t = B[b].c[c - 1][v - 1], i = norm(t).indexOf(nq)
              return (
                <li key={b + '.' + c + '.' + v}><button onClick={() => openRef(b, c, v)}>
                  <span className="lref">{refName(b, c, v)}</span>
                  <span className="ltxt">{i < 0 ? t : <>{t.slice(0, i)}<mark>{t.slice(i, i + nq.length)}</mark>{t.slice(i + nq.length)}</>}</span>
                </button></li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
