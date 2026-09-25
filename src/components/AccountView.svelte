<script>
  import { account, sendCode, verifyCode, signOut } from '../lib/account.svelte.js';
  import { store } from '../lib/spots.svelte.js';

  let email = $state('');
  let code = $state('');
  let step = $state('email');
  let busy = $state(false);
  let error = $state('');

  const synced = $derived(store.spots.filter((s) => !s.example).length);

  async function run(fn) {
    busy = true;
    error = '';
    try {
      await fn();
    } catch (e) {
      error = e.message || String(e);
    } finally {
      busy = false;
    }
  }

  const requestCode = (e) => {
    e.preventDefault();
    run(async () => {
      await sendCode(email.trim());
      code = '';
      step = 'code';
    });
  };

  const confirmCode = (e) => {
    e.preventDefault();
    run(async () => {
      await verifyCode(email.trim(), code.replace(/\D/g, ''));
      step = 'email';
    });
  };
</script>

<h2 class="title">Compte</h2>

{#if !account.enabled}
  <section class="card stack">
    <p><b>Mode local.</b> La synchronisation n'est pas configurée sur cette version de l'app (variables Supabase absentes).</p>
    <p class="muted small">Tes spots sont enregistrés uniquement dans ce navigateur. Tout fonctionne, mais ils ne sont pas partagés entre tes appareils.</p>
  </section>
{:else if account.email}
  <section class="card stack">
    <div>
      <div class="label">Connecté</div>
      <div class="email">{account.email}</div>
    </div>
    <p class="small">
      {#if account.syncing}
        Synchronisation…
      {:else if store.syncError}
        <span class="err">Erreur de synchronisation : {store.syncError}</span>
      {:else}
        {synced} spot{synced > 1 ? 's' : ''} synchronisé{synced > 1 ? 's' : ''} avec ton compte.
      {/if}
    </p>
    <button class="btn" type="button" onclick={() => run(signOut)} disabled={busy}>Se déconnecter</button>
  </section>
{:else if step === 'email'}
  <form class="card stack" onsubmit={requestCode}>
    <p>Connecte-toi pour retrouver tes spots sur tous tes appareils. Pas de mot de passe : on t'envoie un code à 6 chiffres.</p>
    <label class="field">
      <span class="label">Email</span>
      <input class="input" type="email" bind:value={email} autocomplete="email" inputmode="email" required />
    </label>
    {#if error}<div class="msg err" role="alert">{error}</div>{/if}
    <button class="btn primary" type="submit" disabled={busy || !email.includes('@')}>{busy ? 'Envoi…' : 'Recevoir un code'}</button>
    <p class="muted small">Sans compte, tes spots restent dans ce navigateur.</p>
  </form>
{:else}
  <form class="card stack" onsubmit={confirmCode}>
    <p>Code envoyé à <b>{email}</b>. Saisis-le ci-dessous.</p>
    <label class="field">
      <span class="label">Code à 6 chiffres</span>
      <input
        class="input code"
        bind:value={code}
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9 ]*"
        maxlength="10"
        required
      />
    </label>
    {#if error}<div class="msg err" role="alert">{error}</div>{/if}
    <button class="btn primary" type="submit" disabled={busy || code.replace(/\D/g, '').length < 6}>{busy ? 'Vérification…' : 'Se connecter'}</button>
    <div class="row">
      <button class="btn ghost" type="button" onclick={() => ((step = 'email'), (error = ''))}>Changer d'email</button>
      <button class="btn ghost" type="button" disabled={busy} onclick={requestCode}>Renvoyer le code</button>
    </div>
  </form>
{/if}

<style>
  .title {
    font-size: 28px;
  }

  .stack {
    display: grid;
    gap: 12px;
  }

  .stack p {
    margin: 0;
  }

  .field {
    display: grid;
    gap: 4px;
  }

  .email {
    font: 700 22px/1.2 var(--cond);
    overflow-wrap: anywhere;
  }

  .code {
    font: 700 28px/1 var(--cond);
    letter-spacing: 0.3em;
    text-align: center;
  }

  .err {
    color: var(--bad);
  }
</style>
