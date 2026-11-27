import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/ui.jsx'
import { B, PLANS, vk, refName, copyText } from '../lib/bible.js'

const FS_KEY = 'rise:fs'
const getFs = () => { try { return +localStorage.getItem(FS_KEY) || 19 } catch { return 19 } }

export default function Bible({ data, act, say, pos, setPos }) {
  const { b, c } = pos
  const [sel, setSel] = useState([])
  const [picker, setPicker] = useState(false)
  const [test, setTest] = useState(b < 39 ? 'at' : 'nt')
  const [pb, setPb] = useState(null)
  const [fs, setFs] = useState(getFs)
  const [note, setNote] = useState(null)
  const vRef = useRef({})

  useEffect(() => { setSel([]) }, [b, c])
  useEffect(() => {
    if (pos.v && vRef.current[pos.v]) {
      const el = vRef.current[pos.v]
      requestAnimationFrame(() => { el.scrollIntoView({ block: 'center' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash') })
    } else scrollTo(0, 0)
  }, [pos.n])
  useEffect(() => { try { localStorage.setItem(FS_KEY, fs) } catch { /* */ } }, [fs])

  const bk = B[b], vs = bk.c[c - 1]
  const plan = PLANS.find(p => p.b === b && c <= p.n)
  const sorted = [...sel].sort((x, y) => x - y)
  const keys = sorted.map(v => vk(b, c, v))
  const label = !sorted.length ? '' : sorted.every((v, i) => !i || v === sorted[i - 1] + 1) ? refName(b, c, sorted[0], sorted.at(-1)) : `${bk.n} ${c}:${sorted.join(',')}`
  const allSaved = keys.length && keys.every(k => data.marks[k]?.saved)

  const step = d => {
    let nb = b, nc = c + d
    if (nc < 1) { nb--; nc = B[nb].c.length } else if (nc > bk.c.length) { nb++; nc = 1 }
    setPos(p => ({ b: nb, c: nc, v: null, n: p.n + 1 }))
  }
  const toggle = v => setSel(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v])
  const openPicker = () => { setTest(b < 39 ? 'at' : 'nt'); setPb(null); setSel([]); setPicker(!picker); scrollTo(0, 0) }

  return (
    <div className="bible">
      <div className="rbar">
        <button className="btn pick" onClick={openPicker} aria-expanded={picker}><span>{bk.n} {c}</span><Icon name="down" size={18} /></button>
        <button className="btn icon" onClick={() => setFs(Math.max(15, fs - 1))} aria-label="Diminuir letra">A−</button>
        <button className="btn icon" onClick={() => setFs(Math.min(28, fs + 1))} aria-label="Aumentar letra">A+</button>
      </div>

      {picker ? (
        <div className="picker">
          {pb === null ? <>
            <div className="seg">
              <button className={test === 'at' ? 'on' : ''} onClick={() => setTest('at')}>Antigo Testamento</button>
              <button className={test === 'nt' ? 'on' : ''} onClick={() => setTest('nt')}>Novo Testamento</button>
            </div>
            <div className="books">
              {B.map((x, i) => ({ x, i })).filter(({ i }) => test === 'at' ? i < 39 : i >= 39).map(({ x, i }) => (
                <button key={i} className={i === b ? 'cur' : ''} onClick={() => setPb(i)}>{x.n}<small>{x.c.length}</small></button>
              ))}
            </div>
          </> : <>
            <div className="pickhead"><button className="btn" onClick={() => setPb(null)}><Icon name="left" />Livros</button><h2>{B[pb].n}</h2></div>
            <div className="chgrid">
              {B[pb].c.map((_, i) => (
                <button key={i} className={pb === b && i + 1 === c ? 'cur' : ''} onClick={() => { setPicker(false); setPos(p => ({ b: pb, c: i + 1, v: null, n: p.n + 1 })) }}>{i + 1}</button>
              ))}
            </div>
          </>}
        </div>
      ) : (
        <article className="chap">
          <p className="chap-book">{bk.n}</p>
          <h1 className="chap-n">{c}</h1>
          <div className="verses" style={{ fontSize: fs + 'px' }}>
            {vs.map((t, i) => {
              const v = i + 1, m = data.marks[vk(b, c, v)] || {}
              return (
                <span key={v} ref={el => { vRef.current[v] = el }} className={'v ' + (m.color || '') + (sel.includes(v) ? ' sel' : '')}
                  onClick={() => toggle(v)} role="button" tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(v))}>
                  <sup>{v}</sup>{t}{m.note ? <i className="has-note" title="Tem anotação" /> : null}{m.saved ? <i className="has-save" title="Salvo" /> : null}{' '}
                </span>
              )
            })}
          </div>
          {plan && (
            <label className="check block">
              <input type="checkbox" checked={!!data.plan[plan.id + ':' + c]} onChange={e => { act.plan(plan.id, c, e.target.checked); say(e.target.checked ? 'Capítulo marcado como lido' : 'Marcação removida') }} />
              <span>Li este capítulo ({plan.t})</span>
            </label>
          )}
          <div className="cnav">
            <button className="btn" onClick={() => step(-1)} disabled={b === 0 && c === 1}><Icon name="left" />Anterior</button>
            <button className="btn" onClick={() => step(1)} disabled={b === 65 && c === bk.c.length}>Próximo<Icon name="right" /></button>
          </div>
          <p className="credit">Bíblia Livre · licença CC BY 3.0 BR</p>
        </article>
      )}

      <div className={'sheet' + (sel.length ? ' on' : '')} role="dialog" aria-label="Ações do versículo" aria-hidden={!sel.length}>
        <div className="sheet-in">
          <div className="sheet-head"><b>{label}</b><button className="btn icon ghost" onClick={() => setSel([])} aria-label="Fechar"><Icon name="x" /></button></div>
          <div className="swatches">
            {['h1', 'h2', 'h3'].map(h => <button key={h} className={'sw ' + h} aria-label={{ h1: 'Destacar em lilás', h2: 'Destacar em verde-água', h3: 'Destacar em rosa' }[h]} onClick={() => { act.marks(keys, { color: h }); setSel([]) }} />)}
            <button className="sw none" aria-label="Remover destaque" onClick={() => { act.marks(keys, { color: null }); setSel([]) }} />
          </div>
          <div className="sheet-acts">
            <button className="btn" onClick={() => { act.marks(keys, { saved: !allSaved }); say(allSaved ? 'Removido dos salvos' : 'Salvo'); setSel([]) }}><Icon name="mark" size={18} />{allSaved ? 'Tirar dos salvos' : 'Salvar'}</button>
            <button className="btn" onClick={() => setNote({ k: keys[0], label: refName(b, c, sorted[0]), t: data.marks[keys[0]]?.note || '' })}><Icon name="note" size={18} />Anotar</button>
            <button className="btn primary" onClick={async () => { const ok = await copyText(`“${sorted.map(v => vs[v - 1]).join(' ')}” — ${label} (Bíblia Livre)`); say(ok ? 'Copiado' : 'Não foi possível copiar'); setSel([]) }}><Icon name="copy" size={18} />Copiar</button>
          </div>
        </div>
      </div>

      {note && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setNote(null)}>
          <form className="modal-box" onSubmit={e => { e.preventDefault(); act.mark(note.k, { note: note.t.trim() }); say(note.t.trim() ? 'Anotação salva' : 'Anotação removida'); setNote(null); setSel([]) }}>
            <h2>Anotação</h2>
            <p className="muted">{note.label}</p>
            <textarea autoFocus value={note.t} onChange={e => setNote({ ...note, t: e.target.value })} placeholder="O que Deus falou com você aqui?" />
            <div className="row">
              {data.marks[note.k]?.note && <button type="button" className="btn ghost" onClick={() => { act.mark(note.k, { note: '' }); say('Anotação apagada'); setNote(null); setSel([]) }}>Apagar</button>}
              <span className="grow" />
              <button type="button" className="btn ghost" onClick={() => setNote(null)}>Cancelar</button>
              <button className="btn primary">Salvar anotação</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
