import { useState } from 'react'
import { Icon, Mascot } from '../components/ui.jsx'
import { MES, SEM, PLANS, ymd, addDays, today, devFor, parseRef, refName, copyText, flameLevel, flameName } from '../lib/bible.js'

const LETRAS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] // segunda → domingo
const NOMES = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']

const saudacao = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' }

export default function Today({ data, act, say, openRef, openCheckin, st }) {
  const [cur, setCur] = useState(today())
  const k = ymd(cur), tk = ymd(today()), isT = k === tk
  const dv = devFor(cur), r = parseRef(dv.r), day = data.days[k] || {}
  const lvl = flameLevel(st.cur)
  // semana atual, de segunda a domingo
  const mon = addDays(today(), -((today().getDay() + 6) % 7))
  const week = Array.from({ length: 7 }, (_, i) => addDays(mon, i))
  const plan = PLANS[0], read = Array.from({ length: plan.n }, (_, i) => !!data.plan[plan.id + ':' + (i + 1)])
  const next = read.findIndex(x => !x) + 1
  const first = (data.profile.name || '').trim().split(/\s+/)[0]
  const quando = isT ? 'hoje' : `${SEM[cur.getDay()]}, ${cur.getDate()} de ${MES[cur.getMonth()]}`

  return (
    <div className="home">
      <h1 className="hello">{saudacao()}{first ? `, ${first}` : ''}!</h1>

      <section className={'streakcard lv' + lvl} aria-label="Sua sequência">
        <div className="streak-top">
          <div>
            <p className="streak-l">Sequência atual</p>
            <p className="streak-n"><b>{st.cur}</b> {st.cur === 1 ? 'dia' : 'dias'}</p>
            <p className="tier"><Icon name="flame" size={15} />{flameName(st.cur)}</p>
          </div>
          <Mascot className="streak-mascot" />
        </div>
        <ol className="week" aria-label="Esta semana">
          {week.map((d, i) => {
            const kk = ymd(d), ok = data.days[kk]?.done, fut = kk > tk
            return (
              <li key={kk}>
                <button className={(kk === k ? 'sel ' : '') + (ok ? 'ok ' : '') + (kk === tk ? 'now' : '')} disabled={fut} onClick={() => setCur(d)}
                  aria-label={`${NOMES[i]}, ${d.getDate()} de ${MES[d.getMonth()]}${ok ? ', devocional feito' : ''}`} aria-pressed={kk === k}>
                  <span>{LETRAS[i]}</span>
                  <i aria-hidden="true">{ok && <Icon name="check" size={14} />}</i>
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="vcard" aria-label="Versículo do dia">
        <p className="vcard-l">Versículo do dia</p>
        <blockquote><p>{r.txt}</p></blockquote>
        <footer>
          <button className="ref" onClick={() => openRef(r.b, r.c, r.v1)}>{refName(r.b, r.c, r.v1, r.v2)}<Icon name="right" size={16} /></button>
          <button className="btn ghost sm" onClick={async () => say(await copyText(`“${r.txt}” — ${refName(r.b, r.c, r.v1, r.v2)} (Bíblia Livre)`) ? 'Versículo copiado' : 'Não foi possível copiar')}><Icon name="copy" size={18} />Copiar</button>
        </footer>
      </section>

      <button className={'btn big ' + (day.done ? 'done' : 'lime')} onClick={() => openCheckin(k)}>
        {day.done ? <><Icon name="check" />Check-in feito{isT ? '' : ` em ${cur.getDate()}/${cur.getMonth() + 1}`}</> : <>Fazer check-in{isT ? '' : ` de ${cur.getDate()}/${cur.getMonth() + 1}`}</>}
      </button>

      <div className="daynav">
        <button className="btn icon ghost" onClick={() => setCur(addDays(cur, -1))} aria-label="Dia anterior"><Icon name="left" /></button>
        <p>Devocional de {quando}</p>
        <button className="btn icon ghost" onClick={() => setCur(addDays(cur, 1))} disabled={isT} aria-label="Próximo dia"><Icon name="right" /></button>
      </div>

      <article className="dev">
        <h2 className="dev-t">{dv.t}</h2>
        <p className="body">{dv.x}</p>

        <section className="block think">
          <h3>Pra pensar</h3>
          <p className="q">{dv.p}</p>
          {day.answer?.trim() ? <p className="answer">{day.answer}</p> : null}
          <button className="link" onClick={() => openCheckin(k)}>{day.answer?.trim() ? 'Editar no check-in' : 'Responder no check-in'}</button>
        </section>

        <section className="block dare">
          <h3>Desafio do dia</h3>
          <label className="check">
            <input type="checkbox" checked={!!day.challenge} onChange={e => act.day(k, { challenge: e.target.checked })} />
            <span>{dv.d}</span>
          </label>
        </section>

        <section className="block pray">
          <h3>Oração</h3>
          <p className="pray">{dv.o}</p>
        </section>
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
