/**
 * Petinder Journey QA Agent
 * -------------------------
 * Drives the real app in a headless browser through the three core journeys
 * (customer, partner/provider, admin) and records every defect it spots:
 *   - failed journey steps (assertion or action errors, with screenshots)
 *   - browser console errors
 *   - failed network requests (4xx/5xx) and unhandled page errors
 *
 * Usage:
 *   npm run build && npm run start &        # or: npm run dev
 *   node qa/journey-agent.mjs               # BASE_URL=http://localhost:3000
 *
 * Output: qa/defect-report.md (+ qa/screenshots/*.png for failures)
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const QA_DIR = dirname(fileURLToPath(import.meta.url))
const SHOTS = join(QA_DIR, 'screenshots')
mkdirSync(SHOTS, { recursive: true })

const run = `${Date.now()}`
const defects = []   // { journey, step, severity, detail, screenshot? }
const passed = []    // { journey, step }
const consoleErrors = [] // { journey, url, text }
const networkFailures = [] // { journey, method, url, status }

let currentJourney = 'setup'
let currentStep = 'init'

function defect(severity, detail, screenshot) {
  defects.push({ journey: currentJourney, step: currentStep, severity, detail, screenshot })
  console.error(`  ✗ [${severity}] ${currentJourney} / ${currentStep}: ${detail}`)
}

async function step(name, fn, page) {
  currentStep = name
  try {
    await fn()
    passed.push({ journey: currentJourney, step: name })
    console.log(`  ✓ ${name}`)
  } catch (err) {
    let shot
    if (page) {
      shot = `${run}-${currentJourney}-${name}`.replace(/[^a-z0-9-]/gi, '_') + '.png'
      await page.screenshot({ path: join(SHOTS, shot), fullPage: true }).catch(() => { shot = undefined })
    }
    defect('high', err.message?.split('\n')[0] ?? String(err), shot)
  }
}

function watch(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ journey: currentJourney, url: page.url(), text: msg.text().slice(0, 300) })
    }
  })
  page.on('pageerror', err => {
    defects.push({ journey: currentJourney, step: currentStep, severity: 'high', detail: `Unhandled page error: ${err.message}` })
  })
  page.on('response', res => {
    const status = res.status()
    // 401 on /api/auth/me before login and 409 stock conflicts are expected app behaviour
    if (status >= 400 && status !== 401 && !res.url().includes('favicon')) {
      networkFailures.push({ journey: currentJourney, method: res.request().method(), url: res.url().replace(BASE_URL, ''), status })
    }
  })
}

async function api(ctx, method, path, body) {
  const res = await ctx.request.fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    data: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status(), body: await res.json().catch(() => ({})) }
}

async function register(page, { name, email, role, providerType }) {
  await page.goto(`${BASE_URL}/register`)
  if (role === 'provider') {
    await page.getByRole('button', { name: /Pet Pro/ }).click()
    await page.selectOption('select', providerType ?? 'walker')
  }
  await page.getByPlaceholder(/Jane Smith|Happy Paws/).fill(name)
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min. 6 characters').fill('petinder123')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await page.waitForURL(/\/(feed|provider)/, { timeout: 10000 })
}

async function login(page, email) {
  await page.goto(`${BASE_URL}/login`)
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('petinder123')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL(/\/(feed|provider|admin)/, { timeout: 10000 })
}

// ---------------------------------------------------------------- journeys

async function customerJourney(browser, ids) {
  currentJourney = 'customer'
  console.log('\n▶ CUSTOMER JOURNEY')
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  watch(page)

  const email = `qa-owner-${run}@petinder.app`

  await step('register as owner', () => register(page, { name: 'QA Owner', email, role: 'owner' }), page)

  await step('create a pet profile', async () => {
    await page.goto(`${BASE_URL}/pets`)
    await page.getByRole('button', { name: '+ Add a pet' }).click()
    await page.getByPlaceholder('Name *').fill('Bolt')
    await page.getByPlaceholder('Breed *').fill('Husky')
    await page.getByPlaceholder(/Temperament/).fill('energetic, friendly')
    await page.getByPlaceholder(/personality/i).fill('QA test dog, very good boy')
    await page.getByRole('button', { name: 'Save pet' }).click()
    await page.waitForSelector('text=Bolt', { timeout: 5000 })
  }, page)

  await step('post to the feed', async () => {
    await page.goto(`${BASE_URL}/feed`)
    await page.getByPlaceholder('What did your pet do today?').fill('Bolt passed the QA gauntlet! 🤖')
    await page.getByRole('button', { name: /^Post/ }).click()
    await page.waitForSelector('text=QA gauntlet', { timeout: 5000 })
  }, page)

  await step('like + comment on a post', async () => {
    const like = page.getByLabel('Like post').first()
    await like.click()
    await page.getByPlaceholder('Add a comment…').first().fill('QA was here')
    await page.getByPlaceholder('Add a comment…').first().press('Enter')
    await page.waitForSelector('text=QA was here', { timeout: 5000 })
  }, page)

  await step('AI generate bio fills the description', async () => {
    const { status, body } = await api(ctx, 'POST', '/api/ai/bio', {
      name: 'Bolt', species: 'dog', breed: 'Husky', age: 2, gender: 'male', temperament: 'energetic, friendly',
    })
    if (status !== 200 || !body.bio) throw new Error(`bio API → ${status}`)
    if (!body.bio.includes('Bolt')) throw new Error(`bio missing pet name: ${body.bio}`)
  })

  await step('AI match: swipe right (fun walk)', async () => {
    await page.goto(`${BASE_URL}/match`)
    await page.waitForSelector('text=% match', { timeout: 8000 })
    await page.getByLabel('Like').click()
  }, page)

  await step('all 3 match modes return candidates + a match starts a chat', async () => {
    for (const mode of ['walk', 'adoption', 'breed']) {
      const { status } = await api(ctx, 'GET', `/api/match?mode=${mode}`)
      if (status !== 200) throw new Error(`match mode ${mode} → ${status}`)
    }
    // A swipe-right match should create a conversation in the DB.
    const list = await api(ctx, 'GET', '/api/match?mode=walk')
    const target = list.body.candidates?.[0]
    const myPet = list.body.myPet
    if (target && myPet) {
      const { body } = await api(ctx, 'POST', '/api/match/swipe', {
        myPetId: myPet.id, targetPetId: target.pet.id, like: true, mode: 'walk',
      })
      if (body.matched) {
        const chat = await api(ctx, 'GET', `/api/chat/${body.otherOwnerId}`)
        if (!chat.body.messages?.length) throw new Error('match did not initiate a chat conversation')
      }
    }
  })

  await step('AI health check returns guidance', async () => {
    const { status, body } = await api(ctx, 'POST', '/api/ai/health', { symptoms: 'vomiting and not eating' })
    if (status !== 200 || !body.insights?.length) throw new Error(`health API → ${status}, insights=${body.insights?.length ?? 0}`)
    if (!body.suggestVet) throw new Error('expected vet suggestion for vomiting symptoms')
  })

  await step('book a dog walk', async () => {
    await page.goto(`${BASE_URL}/services`)
    await page.waitForSelector('text=30-min Dog Walk', { timeout: 8000 })
    await page.getByRole('button', { name: 'Book now' }).first().click()
    const tomorrow = new Date(Date.now() + 86400e3).toISOString().slice(0, 10)
    await page.locator('input[type="date"]').fill(tomorrow)
    await page.getByRole('button', { name: /Confirm booking/ }).click()
    await page.waitForSelector('text=Booking requested', { timeout: 5000 })
  }, page)

  await step('chat with provider, get reply', async () => {
    await page.goto(`${BASE_URL}/chat/usr_walker1`)
    await page.getByPlaceholder('Type a message…').fill('QA: is tomorrow OK?')
    await page.getByLabel('Send message').click()
    await page.waitForSelector('text=QA: is tomorrow OK?', { timeout: 5000 })
    // auto-reply from seeded provider
    await page.waitForFunction(() => document.querySelectorAll('main > div').length >= 2, null, { timeout: 5000 })
  }, page)

  await step('add to cart and checkout', async () => {
    await page.goto(`${BASE_URL}/shop`)
    await page.waitForSelector('text=Premium Dog Food', { timeout: 8000 })
    await page.getByLabel(/Add Premium Dog Food/).click()
    await page.goto(`${BASE_URL}/cart`)
    await page.getByRole('button', { name: /Place order/ }).click()
    await page.waitForSelector('text=Order placed!', { timeout: 5000 })
  }, page)

  await step('API guard: booking in the past is rejected', async () => {
    const pets = await api(ctx, 'GET', '/api/pets?mine=1')
    const { status } = await api(ctx, 'POST', '/api/bookings', {
      serviceId: 'svc_1', petId: pets.body.pets[0]?.id, date: '2001-01-01',
    })
    if (status !== 400) throw new Error(`expected 400 for past date, got ${status}`)
  })

  await step('API guard: review without completed booking is rejected', async () => {
    const { status } = await api(ctx, 'POST', '/api/reviews', { targetUserId: 'usr_vet1', rating: 5, text: 'x' })
    if (status !== 403) throw new Error(`expected 403, got ${status}`)
  })

  ids.ownerEmail = email
  await ctx.close()
}

async function partnerJourney(browser, ids) {
  currentJourney = 'partner'
  console.log('\n▶ PARTNER (PROVIDER) JOURNEY')
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  watch(page)

  await step('register as a provider', () =>
    register(page, { name: 'QA Walker Co', email: `qa-walker-${run}@petinder.app`, role: 'provider', providerType: 'walker' }), page)

  await step('provider dashboard renders', async () => {
    await page.goto(`${BASE_URL}/provider`)
    await page.waitForSelector('text=QA Walker Co', { timeout: 8000 })
  }, page)

  await ctx.close()

  // Seeded walker accepts + completes the customer's booking
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page2 = await ctx2.newPage()
  watch(page2)

  await step('seeded walker logs in', () => login(page2, 'omar@petinder.app'), page2)

  await step('accept the pending booking', async () => {
    await page2.goto(`${BASE_URL}/provider`)
    await page2.waitForSelector('text=Requests', { timeout: 8000 })
    await page2.getByRole('button', { name: 'Accept' }).first().click()
    await page2.waitForSelector('text=Upcoming', { timeout: 5000 })
  }, page2)

  await step('complete the booking → earnings credited', async () => {
    await page2.getByRole('button', { name: /Mark done/ }).first().click()
    await page2.waitForSelector('text=History', { timeout: 5000 })
    const me = await api(ctx2, 'GET', '/api/auth/me')
    if (!me.body.providerProfile || me.body.providerProfile.earnings <= 0) {
      throw new Error(`provider earnings not credited (earnings=${me.body.providerProfile?.earnings})`)
    }
  }, page2)

  await step('API guard: provider cannot re-accept a completed booking', async () => {
    const bookings = await api(ctx2, 'GET', '/api/bookings')
    const done = bookings.body.bookings.find(b => b.status === 'completed')
    if (!done) throw new Error('no completed booking found')
    const { status } = await api(ctx2, 'PATCH', `/api/bookings/${done.id}`, { status: 'accepted' })
    if (status !== 400) throw new Error(`expected 400 invalid transition, got ${status}`)
    ids.completedBookingId = done.id
  })

  await ctx2.close()

  // Customer leaves a review after completion
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page3 = await ctx3.newPage()
  watch(page3)
  currentJourney = 'partner' // review closes the partner loop

  await step('customer reviews the completed service', async () => {
    await login(page3, ids.ownerEmail)
    await page3.goto(`${BASE_URL}/services`)
    await page3.getByRole('button', { name: /Review/ }).first().click()
    await page3.getByPlaceholder('How was the service?').fill('Flawless walk — QA approved')
    await page3.getByRole('button', { name: 'Submit review' }).click()
    await page3.waitForSelector('text=Review submitted', { timeout: 5000 })
  }, page3)

  await ctx3.close()
}

async function adminJourney(browser) {
  currentJourney = 'admin'
  console.log('\n▶ ADMIN JOURNEY')
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 800 } })
  const page = await ctx.newPage()
  watch(page)

  await step('admin logs in', () => login(page, 'admin@petinder.app'), page)

  await step('analytics show GMV & revenue', async () => {
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForSelector('text=GMV', { timeout: 8000 })
    const stats = await api(ctx, 'GET', '/api/admin/stats')
    if (stats.body.stats.gmv <= 0) throw new Error('GMV is 0 after completed booking + order')
    if (stats.body.stats.platformRevenue <= 0) throw new Error('platform revenue is 0')
  }, page)

  await step('verify an unverified provider', async () => {
    const { status } = await api(ctx, 'PATCH', '/api/admin/users', { userId: 'usr_groomer1', action: 'verify' })
    if (status !== 200) throw new Error(`verify → ${status}`)
  })

  await step('ban and unban a user', async () => {
    const r1 = await api(ctx, 'PATCH', '/api/admin/users', { userId: 'usr_demo2', action: 'ban' })
    if (r1.status !== 200 || !r1.body.user.banned) throw new Error('ban failed')
    const r2 = await api(ctx, 'PATCH', '/api/admin/users', { userId: 'usr_demo2', action: 'unban' })
    if (r2.status !== 200 || r2.body.user.banned) throw new Error('unban failed')
  })

  await step('non-admin is denied admin APIs', async () => {
    const ctx2 = await browser.newContext()
    const page2 = await ctx2.newPage()
    await login(page2, 'sara@petinder.app')
    const { status } = await api(ctx2, 'GET', '/api/admin/stats')
    await ctx2.close()
    if (status !== 403) throw new Error(`expected 403 for non-admin, got ${status}`)
  })

  await ctx.close()
}

// ---------------------------------------------------------------- report

function report() {
  const total = passed.length + defects.length
  const lines = [
    '# Petinder Journey QA — Defect Report',
    '',
    `- **Run:** ${new Date().toISOString()} against \`${BASE_URL}\``,
    `- **Steps:** ${passed.length}/${total} passed`,
    `- **Defects:** ${defects.length} · **Console errors:** ${consoleErrors.length} · **Failed requests:** ${networkFailures.length}`,
    '',
  ]

  if (defects.length) {
    lines.push('## 🐞 Defects', '', '| Journey | Step | Severity | Detail | Screenshot |', '|---|---|---|---|---|')
    for (const d of defects) {
      lines.push(`| ${d.journey} | ${d.step} | ${d.severity} | ${d.detail.replace(/\|/g, '\\|')} | ${d.screenshot ? `screenshots/${d.screenshot}` : '—'} |`)
    }
    lines.push('')
  } else {
    lines.push('## ✅ No defects found', '', 'All journey steps passed with no console errors or failed requests recorded as defects.', '')
  }

  if (networkFailures.length) {
    lines.push('## 🌐 Failed network requests', '', '| Journey | Method | URL | Status |', '|---|---|---|---|')
    for (const f of networkFailures) lines.push(`| ${f.journey} | ${f.method} | ${f.url} | ${f.status} |`)
    lines.push('')
  }
  if (consoleErrors.length) {
    lines.push('## 🖥️ Console errors', '')
    for (const c of consoleErrors) lines.push(`- **${c.journey}** @ ${c.url}: \`${c.text}\``)
    lines.push('')
  }

  lines.push('## ✔️ Passed steps', '')
  for (const p of passed) lines.push(`- [x] ${p.journey} / ${p.step}`)
  lines.push('')

  const out = join(QA_DIR, 'defect-report.md')
  writeFileSync(out, lines.join('\n'))
  console.log(`\n📋 Report written to ${out}`)
  console.log(`   ${passed.length}/${total} steps passed, ${defects.length} defects`)
}

// ---------------------------------------------------------------- main

// CHROMIUM_PATH lets the agent run in sandboxes where Playwright's own
// browser download is unavailable (falls back to any installed Chromium).
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
)
const ids = {}
try {
  await customerJourney(browser, ids)
  await partnerJourney(browser, ids)
  await adminJourney(browser)
} finally {
  await browser.close()
  report()
}
process.exit(defects.length ? 1 : 0)
