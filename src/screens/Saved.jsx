import { useState } from 'react'
import { B, MES, refName, pk, fromYmd, devFor } from '../lib/bible.js'

export default function Saved({ data, openRef, go }) {
  const [tab, setTab] = useState('v')
  const marks = Object.entries(data.marks)
  const verses = marks.filter(([, m]) => m.saved || m.color).sort(([a], [b]) => { const x = pk(a), y = pk(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2] })
  const notes = marks.filter(([, m]) => m.note).sort(([, a], [, b]) => (b.at || 0) - (a.at || 0))
  const diary = Object.entries(data.days).filter(([, d]) => d.answer?.trim()).sort(([a], [b]) => b.localeCompare(a))

  const Verse = ([k, m], withNote) => {
    const [b, c, v] = pk(k)
    return (
      <li key={k}><button onClick={() => openRef(b, c, v)}>
        <span className="lref">{refName(b, c, v)}<small className={'tag ' + (m.color || '')}>{[m.saved && 'Salvo', m.color && 'Destaque'].filter(Boolean).join(' e ')}</small></span>
        <span className="ltxt">{B[b].c[c - 1][v - 1]}</span>
        {withNote && <span className="lnote">{m.note}</span>}
      </button></li>
    )
  }

  return (
    <div className="saved">
      <h1 className="title">Salvos</h1>
      <div className="seg">
        <button className={tab === 'v' ? 'on' : ''} onClick={() => setTab('v')}>Versículos <small>{verses.length}</small></button>
        <button className={tab === 'n' ? 'on' : ''} onClick={() => setTab('n')}>Anotações <small>{notes.length}</small></button>
        <button className={tab === 'd' ? 'on' : ''} onClick={() => setTab('d')}>Diário <small>{diary.length}</small></button>
      </div>
      <ul className="list">
        {tab === 'v' && (verses.length ? verses.map(e => Verse(e)) : <li className="empty"><b>Nenhum versículo salvo</b>Na Bíblia, toque num versículo para destacar ou salvar.<button className="btn" onClick={() => go('biblia')}>Abrir a Bíblia</button></li>)}
        {tab === 'n' && (notes.length ? notes.map(e => Verse(e, true)) : <li className="empty"><b>Nenhuma anotação</b>Toque num versículo e escolha “Anotar”.</li>)}
        {tab === 'd' && (diary.length ? diary.map(([k, d]) => {
          const dt = fromYmd(k), dv = devFor(dt)
          return <li key={k} className="diary"><span className="lref">{dt.getDate()} de {MES[dt.getMonth()]} · {dv.t}</span><span className="lq">{dv.p}</span><span className="lnote">{d.answer}</span></li>
        }) : <li className="empty"><b>Seu diário está vazio</b>Responda o “Pra pensar” do devocional e ele aparece aqui.<button className="btn" onClick={() => go('hoje')}>Ir para o devocional</button></li>)}
      </ul>
    </div>
  )
}
