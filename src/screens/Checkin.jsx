import { useState } from 'react'
import { Icon } from '../components/ui.jsx'
import { MES, SEM, ymd, today, fromYmd, devFor } from '../lib/bible.js'

const MAX = 300

// Check-in do devocional (tela clara). Publicar marca o dia como feito e guarda o texto no campo
// "answer" que já existe (o mesmo do "Pra pensar" e do Diário), sem mudar o schema.
// Foto e publicação na comunidade ficam para a fase do feed (ver ROADMAP.md).
export default function Checkin({ data, act, say, go, st, day: dayKey }) {
  const k = dayKey || ymd(today()), isT = k === ymd(today())
  const dt = fromYmd(k), dv = devFor(dt), day = data.days[k] || {}
  const [txt, setTxt] = useState((day.answer || '').slice(0, MAX))

  function publish(e) {
    e.preventDefault()
    const first = !day.done
    act.day(k, { done: true, answer: txt.trim() })
    say(!first ? 'Check-in atualizado' : isT && !st.doneToday ? `Check-in feito! Sequência de ${st.cur + 1} ${st.cur + 1 === 1 ? 'dia' : 'dias'}` : 'Check-in feito!')
    go('hoje')
  }
  function undo() { act.day(k, { done: false }); say('Check-in desfeito'); go('hoje') }

  return (
    <form className="checkin" onSubmit={publish}>
      <div className="ck-head">
        <button type="button" className="btn icon ghost" onClick={() => go('hoje')} aria-label="Voltar"><Icon name="x" /></button>
        <p>{isT ? 'Hoje' : SEM[dt.getDay()]}, {dt.getDate()} de {MES[dt.getMonth()]}</p>
      </div>

      <h1>Como foi seu devocional {isT ? 'hoje' : 'nesse dia'}?</h1>
      <p className="ck-dev"><span>Devocional</span>{dv.t}</p>
      <p className="ck-q"><b>Pra pensar:</b> {dv.p}</p>

      <div className="ck-photo" aria-disabled="true">
        <Icon name="camera" size={26} />
        <span><b>Adicionar foto</b><small>Em breve</small></span>
      </div>

      <label className="fld ck-txt">
        <span>Seu texto <small>(opcional)</small></span>
        <textarea value={txt} maxLength={MAX} onChange={e => setTxt(e.target.value)} placeholder="O que Deus falou com você hoje?" rows={5} />
        <small className={'ck-count' + (txt.length >= MAX ? ' full' : '')} aria-live="polite">{txt.length}/{MAX}</small>
      </label>

      <button className="btn big primary">{day.done ? 'Atualizar check-in' : 'Publicar'}</button>
      <p className="ck-note">Por enquanto o check-in fica só com você. A comunidade vem aí.</p>
      {day.done && <button type="button" className="link" onClick={undo}>Desfazer check-in</button>}
    </form>
  )
}
