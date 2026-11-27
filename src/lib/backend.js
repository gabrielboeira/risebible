// Camada de dados do Rise.
// Com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY definidos, usa o Supabase (login real + dados na nuvem).
// Sem as chaves, roda em modo demonstração: contas e progresso ficam só neste navegador.
import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DEMO = !(URL && KEY)
const sb = DEMO ? null : createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true } })

const empty = () => ({ profile: { name: '', squad: null }, days: {}, marks: {}, plan: {} })

/* ---------------- erros em português ---------------- */
export function authError(e) {
  const m = (e?.message || '').toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('already registered') || m.includes('já existe')) return 'Já existe uma conta com esse e-mail. Tente entrar.'
  if (m.includes('password should be') || m.includes('senha curta')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos e depois entre.'
  if (m.includes('rate limit')) return 'Muitas tentativas. Espere um minuto e tente de novo.'
  if (m.includes('fetch')) return 'Sem conexão. Verifique a internet e tente de novo.'
  return e?.message || 'Algo deu errado. Tente de novo.'
}

/* ---------------- modo demonstração ---------------- */
const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* sem armazenamento */ } },
}
const demoUsers = () => LS.get('rise:users', {})
const demoKey = id => 'rise:data:' + id
let demoListeners = []
const demoEmit = s => demoListeners.forEach(f => f(s))
const hash = s => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return String(h) }

const demo = {
  async session() { const id = LS.get('rise:session', null); return id && demoUsers()[id] ? { user: { id, email: demoUsers()[id].email } } : null },
  onChange(f) { demoListeners.push(f); return () => { demoListeners = demoListeners.filter(x => x !== f) } },
  async signUp({ name, squad, email, password }) {
    if (password.length < 6) throw new Error('senha curta')
    const users = demoUsers(), id = 'u' + hash(email.toLowerCase())
    if (users[id]) throw new Error('já existe')
    users[id] = { email: email.toLowerCase(), pw: hash(password) }; LS.set('rise:users', users)
    LS.set(demoKey(id), { ...empty(), profile: { name, squad } })
    LS.set('rise:session', id); const s = { user: { id, email } }; demoEmit(s); return { session: s }
  },
  async signIn({ email, password }) {
    const id = 'u' + hash(email.toLowerCase()), u = demoUsers()[id]
    if (!u || u.pw !== hash(password)) throw new Error('invalid login')
    LS.set('rise:session', id); const s = { user: { id, email } }; demoEmit(s); return s
  },
  async resetPassword() { throw new Error('No modo demonstração não há envio de e-mail. Crie outra conta de teste.') },
  async signOut() { LS.set('rise:session', null); demoEmit(null) },
  async load(uid) { return { ...empty(), ...LS.get(demoKey(uid), {}) } },
  async save(uid, data) { LS.set(demoKey(uid), data) },
}

/* ---------------- Supabase ---------------- */
const cloud = {
  async session() { const { data } = await sb.auth.getSession(); return data.session },
  onChange(f) { const { data } = sb.auth.onAuthStateChange((_e, s) => f(s)); return () => data.subscription.unsubscribe() },
  async signUp({ name, squad, email, password }) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name, squad } } })
    if (error) throw error
    return data // data.session é null quando o projeto exige confirmar e-mail
  },
  async signIn({ email, password }) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; return data.session
  },
  async resetPassword(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin }); if (error) throw error
  },
  async signOut() { await sb.auth.signOut() },
  async load(uid) {
    const [p, d, m, pl] = await Promise.all([
      sb.from('profiles').select('name,squad').eq('id', uid).maybeSingle(),
      sb.from('devotional_days').select('day,done,challenge,answer').eq('user_id', uid),
      sb.from('verse_marks').select('verse_key,color,saved,note,updated_at').eq('user_id', uid),
      sb.from('plan_progress').select('plan,chapter').eq('user_id', uid),
    ])
    const err = p.error || d.error || m.error || pl.error; if (err) throw err
    const out = empty()
    if (p.data) out.profile = p.data
    d.data.forEach(r => { out.days[r.day] = { done: r.done, challenge: r.challenge, answer: r.answer || '' } })
    m.data.forEach(r => { out.marks[r.verse_key] = { color: r.color, saved: r.saved, note: r.note || '', at: Date.parse(r.updated_at) } })
    pl.data.forEach(r => { out.plan[r.plan + ':' + r.chapter] = true })
    return out
  },
}

/* ---------------- gravações (mesma API nos dois modos) ---------------- */
export const api = DEMO ? demo : cloud

// Cada função recebe o estado novo completo (para o modo demo) e grava só o que mudou (Supabase).
export async function saveDay(uid, all, day) {
  if (DEMO) return demo.save(uid, all)
  const v = all.days[day] || {}
  const { error } = await sb.from('devotional_days').upsert({ user_id: uid, day, done: !!v.done, challenge: !!v.challenge, answer: v.answer || null, updated_at: new Date().toISOString() })
  if (error) throw error
}
export async function saveMark(uid, all, key) {
  if (DEMO) return demo.save(uid, all)
  const v = all.marks[key]
  const q = !v || (!v.color && !v.saved && !v.note)
    ? sb.from('verse_marks').delete().eq('user_id', uid).eq('verse_key', key)
    : sb.from('verse_marks').upsert({ user_id: uid, verse_key: key, color: v.color || null, saved: !!v.saved, note: v.note || null, updated_at: new Date().toISOString() })
  const { error } = await q; if (error) throw error
}
export async function savePlan(uid, all, plan, chapter) {
  if (DEMO) return demo.save(uid, all)
  const on = all.plan[plan + ':' + chapter]
  const q = on ? sb.from('plan_progress').upsert({ user_id: uid, plan, chapter })
    : sb.from('plan_progress').delete().eq('user_id', uid).eq('plan', plan).eq('chapter', chapter)
  const { error } = await q; if (error) throw error
}
export async function saveProfile(uid, all) {
  if (DEMO) return demo.save(uid, all)
  const { error } = await sb.from('profiles').upsert({ id: uid, name: all.profile.name, squad: all.profile.squad, updated_at: new Date().toISOString() })
  if (error) throw error
}
