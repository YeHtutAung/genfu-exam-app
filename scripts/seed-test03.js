/**
 * One-time seed script: reads reference/test_03.json and inserts
 * test + questions + sub_questions into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/seed-test03.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ──────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars. Usage:')
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/seed-test03.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ── Load JSON ───────────────────────────────────────────────────

const jsonPath = resolve(__dirname, '..', 'reference', 'test_03.json')
const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
const { meta, questions } = data

// ── Seed ────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding test: ${meta.title_jp} (${meta.test_id})`)

  // 1. Look up the genfu category
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id')
    .eq('code', meta.category)
    .single()

  if (catErr) throw new Error(`Category lookup failed: ${catErr.message}`)
  console.log(`  Category "${meta.category}" → ${category.id}`)

  // 2. Delete existing test with same category + test_number (idempotent re-run)
  const { data: existing } = await supabase
    .from('tests')
    .select('id')
    .eq('category_id', category.id)
    .eq('test_number', meta.test_number)
    .maybeSingle()

  if (existing) {
    console.log(`  Deleting existing test ${existing.id} (re-seed)...`)
    // Cascade will clean up questions + sub_questions
    await supabase.from('tests').delete().eq('id', existing.id)
  }

  // 3. Insert test
  const { data: test, error: testErr } = await supabase
    .from('tests')
    .insert({
      category_id: category.id,
      test_number: meta.test_number,
      title_jp: meta.title_jp,
      time_limit: meta.time_limit,
      pass_score: meta.pass_score,
      total_points: meta.total_points,
      active: true,
    })
    .select()
    .single()

  if (testErr) throw new Error(`Test insert failed: ${testErr.message}`)
  console.log(`  Test created → ${test.id} (active: true)`)

  // 4. Insert questions
  let standardCount = 0
  let scenarioCount = 0
  let subQuestionCount = 0

  for (const q of questions) {
    const questionRow = {
      test_id: test.id,
      question_number: q.question_number,
      type: q.type,
      question_jp: q.question_jp,
      answer: q.type === 'standard' ? q.answer : null,
      hint_jp: q.hint_jp || null,
      points: q.points,
      image_render: q.image?.render || null,
      sign_code: q.image?.sign_code || null,
      image_url: q.image?.src || null,
      image_alt: q.image?.alt || null,
    }

    const { data: inserted, error: qErr } = await supabase
      .from('questions')
      .insert(questionRow)
      .select()
      .single()

    if (qErr) throw new Error(`Question ${q.id} insert failed: ${qErr.message}`)

    if (q.type === 'standard') {
      standardCount++
    } else {
      scenarioCount++

      // 5. Insert sub_questions
      const subRows = q.sub_questions.map(sq => ({
        question_id: inserted.id,
        sub_number: sq.sub_number,
        text_jp: sq.text_jp,
        answer: sq.answer,
      }))

      const { error: sqErr } = await supabase
        .from('sub_questions')
        .insert(subRows)

      if (sqErr) throw new Error(`Sub-questions for ${q.id} insert failed: ${sqErr.message}`)
      subQuestionCount += subRows.length
    }
  }

  // ── Summary ─────────────────────────────────────────────────

  console.log('')
  console.log('=== Seed Complete ===')
  console.log(`  Test:           ${meta.title_jp}`)
  console.log(`  Test ID:        ${test.id}`)
  console.log(`  Category:       ${meta.category} (${category.id})`)
  console.log(`  Standard Qs:    ${standardCount}`)
  console.log(`  Scenario Qs:    ${scenarioCount}`)
  console.log(`  Sub-questions:  ${subQuestionCount}`)
  console.log(`  Total points:   ${meta.total_points}`)
  console.log(`  Pass score:     ${meta.pass_score}`)
  console.log(`  Time limit:     ${meta.time_limit / 60} min`)
  console.log(`  Active:         true`)
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
