import assert from "node:assert/strict";

// Validate authored content before it can enter the public bundle.
export function validatePrep(guide, set) {
  if (!guide) return;
  const check = (condition, message) => assert.ok(condition, `${set.id} prep: ${message}`);
  const prose = (value) => typeof value === "string" && value.trim().length > 0;
  const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  const unique = (items, key) => new Set(items.map((item) => item[key])).size === items.length;
  const names = new Set(set.cards.map((card) => card.name));
  const ref = (name) => check(names.has(name), `unknown card ${name}`);
  check(guide.version === 1 && guide.set === set.code, "wrong version or set");
  check(["draft", "published"].includes(guide.status), "invalid publication status");
  check(date(guide.authoredAt), "invalid authoring date");
  if (guide.progressRevision !== undefined) check(date(guide.progressRevision), "invalid progress revision");
  if (guide.status === "published") check(date(guide.publishedAt), "invalid publication date");
  check(prose(guide.assessment), "missing editorial boundary");
  check(guide.sources?.length > 0 && guide.sources.every((s) => prose(s.label) && /^https:\/\//.test(s.url)), "missing sources");
  for (const format of ["sealed", "draft"]) {
    const content = guide.formats?.[format];
    check(prose(content?.intro) && content.steps?.length > 0 && content.steps.every((s) => prose(s.title) && prose(s.text)), `missing ${format} guidance`);
  }
  for (const collection of ["mechanics", "roles", "checklist", "exercises"]) {
    const items = guide[collection];
    check(Array.isArray(items) && items.length > 0 && unique(items, "id") && items.every((item) => /^[a-z0-9-]+$/.test(item.id)), `invalid ${collection} IDs`);
  }
  for (const item of guide.mechanics) {
    check(prose(item.title) && prose(item.text) && prose(item.tip) && item.cards?.length, "incomplete mechanic");
    item.cards.forEach(ref);
  }
  check(guide.roles.every((r) => prose(r.label)), "missing role labels");
  const roles = new Set(guide.roles.map((r) => r.id));
  check(guide.keyCards?.length > 0 && unique(guide.keyCards, "card"), "invalid key cards");
  for (const item of guide.keyCards) {
    ref(item.card);
    check(roles.has(item.role) && prose(item.why) && prose(item.watch), "incomplete card assessment");
  }
  check(guide.roles.every((role) => guide.keyCards.some((c) => c.role === role.id)), "empty role");
  check(guide.interactions?.length > 0 && unique(guide.interactions, "card"), "invalid interactions");
  for (const item of guide.interactions) {
    ref(item.card);
    const card = set.cards.find((c) => c.name === item.card);
    check(prose(item.note) && (card.typeLine.includes("Instant") || card.keywords.includes("Flash")), `not instant-speed: ${item.card}`);
  }
  check(guide.checklist.every((item) => prose(item.text)), "empty checklist text");
  for (const q of guide.exercises) {
    check(prose(q.question) && prose(q.explanation) && q.options?.length >= 2 && q.options.every(prose) && new Set(q.options).size === q.options.length, "incomplete exercise");
    check(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, "invalid answer");
    check(q.cards?.length > 0, "exercise missing card references");
    q.cards.forEach(ref);
  }
  if (guide.twoHeadedGiant !== undefined) {
    const team = guide.twoHeadedGiant;
    check(team && prose(team.intro), "missing team introduction");
    check(team.sources?.length > 0 && team.sources.every((s) => prose(s.label) && /^https:\/\//.test(s.url)), "missing team sources");
    for (const collection of ["rules", "checklist", "exercises"]) {
      const items = team[collection];
      check(Array.isArray(items) && items.length > 0 && unique(items, "id") && items.every((item) => /^[a-z0-9-]+$/.test(item.id)), `invalid team ${collection} IDs`);
    }
    check(team.rules.every((r) => prose(r.title) && prose(r.text)), "incomplete team rule");
    check(team.cards?.length > 0 && unique(team.cards, "card"), "invalid team cards");
    for (const item of team.cards) { ref(item.card); check(prose(item.note), "missing team card note"); }
    check(team.checklist.every((item) => prose(item.text)), "empty team checklist text");
    for (const q of team.exercises) {
      check(prose(q.question) && prose(q.explanation) && q.options?.length >= 2 && q.options.every(prose) && new Set(q.options).size === q.options.length, "incomplete team exercise");
      check(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, "invalid team answer");
      check(q.cards?.length > 0, "team exercise missing card references");
      q.cards.forEach(ref);
    }
  }
}
