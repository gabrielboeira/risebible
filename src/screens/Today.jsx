import { useState } from 'react'
import { Icon } from '../components/ui.jsx'
import { MES, SEM, PLANS, ymd, addDays, today, devFor, parseRef, refName, copyText, flameLevel, flameName } from '../lib/bible.js'

export default function Today({ data, act, say, openRef, st }) {
  const [cur, setCur] = useState(today())
  const k = ymd(cur), isT = k === ymd(today())
  const dv = devFor(cur), r = parseRef(dv.r), day = data.days[k] || {}
  const lvl = flameLevel(st.cur)
  const start = addDays(today(), -6)
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const plan = PLANS[0], read = Array.from({ length: plan.n }, (_, i) => !!data.plan[plan.id + ':' + (i + 1)])
  const next = read.findIndex(x => !x) + 1

  function finish() {
    if (day.done) { act.day(k, { done: false }); return }
    act.day(k, { done: true })
    say(isT ? (st.doneToday ? 'Concluído' : `Sequência de ${st.cur + 1} ${st.cur + 1 === 1 ? 'dia' : 'dias'}!`) : 'Devocional concluído')
  }

  return (
    <div className="today">
      <section className={'streakhead lv' + lvl} aria-label="Sua sequência">
        <div className="streak">
          <span className="streak-n">{st.cur}</span>
          <span className="streak-meta">
            <span className="streak-t">{st.cur === 1 ? 'dia seguido' : 'dias seguidos'}</span>
            <b className="tier">{flameName(st.cur)}</b>
          </span>
        </div>
        <ol className="week" aria-label="Últimos 7 dias">
          {week.map(d => {
            const kk = ymd(d), ok = data.days[kk]?.done
            return (
              <li key={kk}>
                <button className={(kk === k ? 'sel ' : '') + (ok ? 'ok' : '')} onClick={() => setCur(d)} aria-label={`${d.getDate()} de ${MES[d.getMonth()]}${ok ? ', concluído' : ''}`}>
                  <span>{SEM[d.getDay()]}</span>
                  <b>{d.getDate()}</b>
                  <i aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="daynav">
        <button className="btn icon" onClick={() => setCur(addDays(cur, -1))} aria-label="Dia anterior"><Icon name="left" /></button>
        <p>{isT ? 'Hoje' : SEM[cur.getDay()]}, {cur.getDate()} de {MES[cur.getMonth()]}</p>
        <button className="btn icon" onClick={() => setCur(addDays(cur, 1))} disabled={isT} aria-label="Próximo dia"><Icon name="right" /></button>
      </div>

      <article className="dev">
        <h1>{dv.t}</h1>
        <blockquote>
          <p>{r.txt}</p>
          <footer>
            <button className="ref" onClick={() => openRef(r.b, r.c, r.v1)}>{refName(r.b, r.c, r.v1, r.v2)} <Icon name="right" size={16} /></button>
            <button className="btn ghost sm" onClick={async () => say(await copyText(`“${r.txt}” — ${refName(r.b, r.c, r.v1, r.v2)} (Bíblia Livre)`) ? 'Versículo copiado' : 'Não foi possível copiar')}><Icon name="copy" size={18} />Copiar</button>
          </footer>
        </blockquote>
        <p className="body">{dv.x}</p>

        <section className="block think">
          <h2>Pra pensar</h2>
          <p className="q">{dv.p}</p>
          <textarea defaultValue={day.answer || ''} key={k} placeholder="Escreva sua resposta. Só você vê."
            onBlur={e => { if ((e.target.value || '') !== (day.answer || '')) act.day(k, { answer: e.target.value }) }} />
        </section>

        <section className="block dare">
          <h2>Desafio do dia</h2>
          <label className="check">
            <input type="checkbox" checked={!!day.challenge} onChange={e => act.day(k, { challenge: e.target.checked })} />
            <span>{dv.d}</span>
          </label>
        </section>

        <section className="block pray">
          <h2>Oração</h2>
          <p className="pray">{dv.o}</p>
        </section>

        <button className={'btn big ' + (day.done ? 'done' : 'primary')} onClick={finish}>
          {day.done ? <><Icon name="check" />Devocional concluído</> : 'Concluir devocional'}
        </button>
        {day.done && <p className="hint">Toque de novo se marcou sem querer.</p>}
      </article>

      <section className="plan">
        <h2>{plan.t}</h2>
        <div className="meter" aria-label={`${read.filter(Boolean).length} de ${plan.n} capítulos`}><i style={{ width: read.filter(Boolean).length / plan.n * 100 + '%' }} /></div>
        <p className="muted">{read.filter(Boolean).length} de {plan.n} capítulos{next ? '' : ' — plano completo!'}</p>
        <div className="chips num">{read.map((ok, i) => (
          <button key={i} className={ok ? 'on' : ''} onClick={() => openRef(plan.b, i + 1)} aria-label={`Marcos ${i + 1}${ok ? ', lido' : ''}`}>{i + 1}</button>
        ))}</div>
        {next > 0 && <button className="btn wide" onClick={() => openRef(plan.b, next)}>Ler Marcos {next}</button>}
      </section>
    </div>
  )
}
