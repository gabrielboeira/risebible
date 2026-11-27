import { useState } from 'react'
import { Mark } from '../components/ui.jsx'
import { api, authError, REDIRECT_ERR } from '../lib/backend.js'

export default function Auth({ demo }) {
  const [mode, setMode] = useState('entrar') // entrar | criar | senha
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(REDIRECT_ERR?.msg || '')
  const [info, setInfo] = useState('')
  // oferece reenviar o link quando o link do e-mail falhou ou o login diz que falta confirmar
  const [resend, setResend] = useState(!!REDIRECT_ERR)
  const set = k => e => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault(); setErr(''); setInfo(''); setBusy(true)
    try {
      if (mode === 'entrar') await api.signIn(f)
      else if (mode === 'criar') {
        if (!f.name.trim()) throw new Error('Conta pra gente como você se chama.')
        const r = await api.signUp({ ...f, name: f.name.trim() })
        if (!r.session) { setInfo('Conta criada! Enviamos um link para o seu e-mail. Abra, confirme e depois entre aqui.'); setMode('entrar'); setResend(true) }
      } else {
        await api.resetPassword(f.email); setInfo('Se esse e-mail tiver conta, você vai receber um link para criar uma senha nova.')
      }
    } catch (x) {
      setErr(authError(x))
      if ((x?.message || '').toLowerCase().includes('email not confirmed')) setResend(true)
    }
    setBusy(false)
  }
  async function resendLink() {
    setErr(''); setInfo('')
    if (!f.email.trim()) { setErr('Digite seu e-mail acima para receber um novo link.'); return }
    setBusy(true)
    try { await api.resendConfirm(f.email.trim()); setInfo('Enviamos um novo link de confirmação. Abra só o e-mail mais recente.') }
    catch (x) { setErr(authError(x)) }
    setBusy(false)
  }
  const swap = m => { setMode(m); setErr(''); setInfo('') }

  return (
    <div className="auth">
      <div className="auth-body">
        <div className="auth-head">
          <Mark className="auth-mark" />
          <h1 className="auth-brand"><span className="auth-rise">Rise</span> <span className="auth-sub">Bible</span></h1>
        </div>
        <p className="auth-lead">Bíblia, devocional diário e sua sequência com Deus.</p>

        {mode !== 'senha' && (
          <div className="seg" role="tablist">
            <button role="tab" aria-selected={mode === 'entrar'} className={mode === 'entrar' ? 'on' : ''} onClick={() => swap('entrar')}>Entrar</button>
            <button role="tab" aria-selected={mode === 'criar'} className={mode === 'criar' ? 'on' : ''} onClick={() => swap('criar')}>Criar conta</button>
          </div>
        )}

        <form onSubmit={submit} className="form" noValidate>
          {mode === 'senha' && <h2 className="auth-h">Criar uma senha nova</h2>}
          {mode === 'criar' && <>
            <label className="fld"><span>Seu nome</span><input id="name" value={f.name} onChange={set('name')} autoComplete="given-name" placeholder="Como te chamam" /></label>
          </>}
          <label className="fld"><span>E-mail</span><input id="email" type="email" inputMode="email" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
          {mode !== 'senha' && <label className="fld"><span>Senha</span><input id="password" type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'criar' ? 'new-password' : 'current-password'} minLength={6} required placeholder={mode === 'criar' ? 'Pelo menos 6 caracteres' : ''} /></label>}

          {err && <p className="msg err" role="alert">{err}</p>}
          {info && <p className="msg ok" role="status">{info}</p>}

          <button className="btn primary big" disabled={busy}>{busy ? 'Aguarde…' : mode === 'entrar' ? 'Entrar' : mode === 'criar' ? 'Criar conta' : 'Enviar link'}</button>
          {mode === 'entrar' && resend && !demo && <button type="button" className="link" onClick={resendLink} disabled={busy}>Reenviar e-mail de confirmação</button>}
          {mode === 'entrar' && <button type="button" className="link" onClick={() => swap('senha')}>Esqueci minha senha</button>}
          {mode === 'senha' && <button type="button" className="link" onClick={() => swap('entrar')}>Voltar para entrar</button>}
        </form>
        {demo && <p className="demo">Modo demonstração: as contas ficam só neste navegador. Conecte o Supabase para login de verdade.</p>}
      </div>
    </div>  
  )
}
