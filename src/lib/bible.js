// Texto bíblico, devocionais e utilidades de data.
export let B = []       // [{ n: nome, a: abreviação, c: [[versículos]] }]
export let D = []       // devocionais
const ABBR = {}

export async function loadContent() {
  const base = import.meta.env.BASE_URL
  const [b, d] = await Promise.all([
    fetch(base + 'data/biblia.json').then(r => { if (!r.ok) throw new Error(); return r.json() }),
    fetch(base + 'data/devocionais.json').then(r => { if (!r.ok) throw new Error(); return r.json() }),
  ])
  B = b; D = d; B.forEach((x, i) => { ABBR[x.a] = i })
}

export const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const PLANS = [{ id: 'marcos', t: 'Marcos em 16 dias', b: 40, n: 16 }]

export const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
export const fromYmd = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12) }
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const today = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d }
const doy = d => Math.round((d - new Date(d.getFullYear(), 0, 1, 12)) / 864e5)
export const devFor = d => D[(doy(d) + d.getFullYear() * 366) % D.length]

export const refName = (b, c, v1, v2) => `${B[b].n} ${c}:${v1}${v2 && v2 !== v1 ? '–' + v2 : ''}`
export function parseRef(r) {
  const m = r.match(/^(\S+) (\d+):(\d+)(?:-(\d+))?$/)
  const b = ABBR[m[1]], c = +m[2], v1 = +m[3], v2 = +(m[4] || m[3])
  return { b, c, v1, v2, txt: B[b].c[c - 1].slice(v1 - 1, v2).join(' ') }
}
export const vk = (b, c, v) => `${b}.${c}.${v}`
export const pk = k => k.split('.').map(Number)
export const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function streakInfo(days) {
  const done = k => days[k]?.done
  let d = today(), cur = 0
  if (!done(ymd(d))) d = addDays(d, -1)
  while (done(ymd(d))) { cur++; d = addDays(d, -1) }
  const keys = Object.keys(days).filter(done).sort()
  let best = 0, run = 0, prev = null
  for (const k of keys) { const x = fromYmd(k); run = prev && Math.round((x - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = x }
  return { cur, best, total: keys.length, doneToday: !!done(ymd(today())) }
}

export async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); return true } catch {
    const a = document.createElement('textarea'); a.value = txt; document.body.appendChild(a); a.select()
    let ok = false; try { ok = document.execCommand('copy') } catch { /* nada */ } a.remove(); return ok
  }
}

// Níveis da sequência (Brasa → Fogo que não apaga)
export const flameLevel = n => (n <= 0 ? 0 : n < 3 ? 1 : n < 7 ? 2 : n < 14 ? 3 : n < 30 ? 4 : 5)
export const flameName = n => ['Brasa', 'Faísca', 'Chama', 'Fogueira', 'Incêndio', 'Fogo que não apaga'][flameLevel(n)]
