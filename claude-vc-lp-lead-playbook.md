# Solo Operator Playbook: VC Fund Sourcing & LP Fundraising with Claude Code

> Generated from a multi-agent research workflow (6 research agents → 6 fact-check agents → 1 synthesis). Date: 2026-06-25.

---

## 1. The Core Insight

Claude adds real leverage in three narrow places: synthesizing messy, multi-source documents into structured data (SEC filings, PDFs, scraped HTML), generating personalization that references actual prospect signals rather than template variables, and writing the glue code that chains data sources together. It does not replace email infrastructure, live B2B databases, or LinkedIn's rate-limit reality — those require dedicated paid tools and there is no shortcut.

---

## 2. Finding VC Firm Leads

Ranked by effort-to-value for a solo operator.

### #1 — Free CSV Merge + SEC EDGAR (Best starting point, $0)

**What:** Pull from three free sources simultaneously: OpenVC CSV export (16,000+ investor profiles), VCPro Database one-time purchase ($119.95 for 7,590 firms / 55,000 contacts), and community lists (Gigasheet's 23,916-firm dataset). Cross-validate firm names against SEC EDGAR Form ADV filings.

**Claude Code role:**
```
"Read these four CSV files, deduplicate firms by domain and CRD number,
normalize partner titles to [GP/Managing Partner/Partner/Principal/Associate],
cross-reference firm names against SEC EDGAR ERA filings via the IAPD API
(10 req/s max, add 0.12s delay), flag firms with AUM growth >20% YoY,
export a master CSV with confidence score."
```

Claude writes and runs the Python in one session. EdgarTools (free, MIT-licensed MCP) handles EDGAR rate-limit compliance automatically — install it first.

**Cost:** $119.95 one-time (VCPro) + $0 EDGAR + free OpenVC tier.

### #2 — Crunchbase Pro + Apollo MCP (Best for deal-signal targeting, ~$230/mo)

**What:** Crunchbase Pro ($49/mo annual billing) exports investor deal history by sector/stage/geography. Apollo MCP ($49-79/mo) enriches partner emails and lets you sequence directly from Claude.

**Claude Code role:** Import Crunchbase CSV, identify investors who made 2+ deals in your sector in the last 18 months, cross-reference with Apollo MCP to pull verified partner emails, score by recency and stage fit. Apollo MCP is the only tool here where Claude can go source → enrich → sequence in one session without CSV hand-offs.

**Cost:** Crunchbase $49/mo + Apollo $79/mo = ~$128/mo baseline.

### #3 — SEC Form ADV / EDGAR ERA filings (Best for institutional signal, $0)

**What:** Every VC fund filing as an Exempt Reporting Adviser (ERA) discloses AUM, employee count, and client types annually. Newly registered advisers and AUM growth spikes are high-intent signals.

**Claude Code role:** Query `https://efts.sec.gov/LATEST/search-index?q=%22venture+capital%22&forms=ADV` (with EdgarTools MCP), parse AUM fields, flag firms that grew AUM >25% since prior year filing, merge with OpenVC/Crunchbase to find matching partner contacts.

**Rate-limit requirement:** Enforce 0.1s inter-request delay. Set `User-Agent: YourName yourname@email.com` in every request header or SEC will block your IP for 10 minutes.

---

## 3. Finding LP Leads

This is the genuinely hard part. **Form D does NOT disclose investor names** — that claim in most playbooks is wrong. The real sources are below.

### #1 — Form 990-PF via ProPublica API (Best free source, $0)

**What:** ~100,000 US private foundations file 990-PF annually. Schedule I lists program-related investments in free-text like "committed $2M to XYZ Venture Fund II." ProPublica's Nonprofit Explorer API gives unauthenticated full-text search across 3M filings from 2011+.

**Claude Code role:**
```python
# Query ProPublica for foundations with VC/PE investment descriptions
# Extract: foundation name, EIN, commitment amount, fund name, fund vintage
# Claude parses the free-text investment descriptions — this is where
# traditional regex fails and Claude's PDF/text comprehension wins
```

Send the raw Schedule I XML/text directly to Claude. It handles abbreviations, typos, and variable phrasing ("committed to," "invested in," "contributed capital to"). Output: structured LP list with foundation EIN, commitment size range, and fund strategy alignment.

**Cost:** $0. Only cost is Claude API tokens (~$0.01-0.05 per filing parsed).

### #2 — LP Navigator / OpenVC ($300/mo) + Public Enrichment

**What:** LP Navigator (OpenVC) provides 10,000+ verified LP contacts with check size filters and intro paths — the most affordable commercial LP database for emerging managers.

**Claude Code role:** Export LP Navigator CSV, then for each foundation or family office, query ProPublica API and EDGAR to find their prior VC commitments. Claude merges the records, flags LPs with documented alternative asset allocations, and scores by fund-strategy fit. This turns a static directory into a qualified pipeline.

**Cost:** $300/mo LP Navigator + Claude API marginal cost.

### #3 — Public Pension Disclosures + FOIA (Slowest, highest quality)

**What:** CalPERS, CalSTRS, and state pension funds publish aggregate alternative asset reports. Targeted FOIA requests to the 20 largest state pensions yield fund-level commitment data (fund name, vintage, amount, drawdown schedule) with 1-6 month turnaround.

**Claude Code role:** Claude generates jurisdiction-specific FOIA request templates (each state pension has different FOIA officer addresses and exemption language). When responses arrive as PDFs, Claude extracts structured commitment data from unstructured layouts. Hard limit: 100 pages per PDF; split large filings.

**Cost:** $0 (FOIA is a legal right). Claude API handles PDF parsing at ~700-1,000 tokens/page.

---

## 4. The Recommended Claude Code Stack

### MCP Servers to Install

| MCP | Purpose | Cost |
|-----|---------|------|
| **EdgarTools** | SEC filings (ADV, Form D, XBRL) with built-in rate limiting | Free (MIT) |
| **Firecrawl** | VC firm website scraping → clean markdown | Free tier / $16-83/mo |
| **Apollo.io** | B2B contact search + sequencing | Included with Apollo plan |
| **SyncGTM or Databar** | Waterfall email enrichment (50+ providers, 87% match rate) | $99-299/mo |
| **Google Sheets** | Live data pipeline output | Free |

### Install all at once:
```bash
claude mcp add edgartools uvx edgar-tools
claude mcp add firecrawl npx -y firecrawl-mcp -e FIRECRAWL_API_KEY=<key>
claude mcp add apollo npx -y apollo-mcp -e APOLLO_API_KEY=<key>
claude mcp add syncgtm npx -y syncgtm-mcp -e SYNCGTM_KEY=<key>
claude mcp add sheets npx -y @grantors/google-sheets-mcp -e GOOGLE_TOKEN=<key>
```

### Reusable Slash Command Setup

Create `~/.claude/commands/vc-pipeline.md`:

```markdown
# VC Pipeline Builder

Given a target sector ($ARGUMENTS), run this pipeline:
1. Query EDGAR ERA filings for VC firms in sector, extract AUM + employee count
2. Cross-reference with OpenVC CSV at /data/openvc-export.csv
3. Enrich top 50 matches via SyncGTM MCP for verified partner emails
4. Score each by: recency of sector deals (+30), AUM growth >15% YoY (+20),
   stage match to our fund (+25), geography overlap (+25)
5. Export top 30 to Google Sheets "vc-targets" tab with score rationale
```

Invoke with: `/vc-pipeline enterprise SaaS`

### Pipeline Shape

```
SOURCE                  ENRICH              PERSONALIZE         SEQUENCE
EDGAR API          →    SyncGTM/       →    Claude         →   Apollo Sequences
OpenVC CSV              Databar             (signal-based       or Instantly
990-PF API              (email, phone,      first lines,
Crunchbase CSV          firmographics)      thesis matching)
LP Navigator
```

Claude's role is **source → normalize → personalize**. Sending/deliverability lives in Apollo/Instantly/Smartlead downstream.

---

## 5. Cold Email: Personalization That Isn't Generic

The difference between 3% and 18% reply rates is whether the first line references something the recipient recognizes as specific to them in the last 90 days. Template variables (`{{company_name}}`) do not accomplish this.

**The prompt structure that works:**

```xml
<role>You are writing a cold email from a solo GP raising Fund I in enterprise AI infrastructure.</role>

<prospect_data>
  <fund_thesis>[paste 3 sentences from their website or interview]</fund_thesis>
  <recent_investments>[last 3 portfolio companies from Crunchbase]</recent_investments>
  <linkedin_signal>[their post from last week, verbatim]</linkedin_signal>
  <hiring_signal>[open roles at their portfolio companies that suggest budget]</hiring_signal>
</prospect_data>

<task>Write a 4-sentence cold email. First sentence references one specific signal.
Second sentence connects our fund thesis to their revealed investment preferences
(not their website marketing language). Third sentence is the ask. Fourth is CTA.
No subject line hyperbole. Tone: peer-to-peer, not sales.</task>
```

Example output first line: *"Your investments in Weights & Biases and Cohere suggest you're tracking the infrastructure layer before model commoditization hits — that's exactly where we're focused with Fund I."* Not achievable with variable substitution.

### Deliverability Must-Dos (Non-Negotiable)

1. **Never send from your primary domain.** Use `outreach.yourfund.com`.
2. **Warmup: 14-21 days minimum.** Start at 5/day, +5/day per week. Instantly and Smartlead include warmup tools.
3. **Authenticate every sending domain:** SPF, DKIM (2048-bit), DMARC (`p=quarantine` to start). Claude Code can audit: *"Check SPF/DKIM/DMARC for outreach.yourfund.com and flag misconfigurations."*
4. **Bounce rate below 2%.** Verify every list through Hunter.io ($34-49/mo) before sending. Apollo contacts are ~65% unverified — always verify.
5. **Volume caps:** Under 50 emails/day per inbox during first 60 days. Use inbox rotation if you need more.
6. **Plain text outperforms HTML 2-3x** for investor reply rates. No images, no tracking pixels in the first email.

### Sequence Structure

- **Day 1:** Initial email (4 sentences, signal-based opening, single ask)
- **Day 5:** Follow-up with one new data point (not "bumping this")
- **Day 12:** Second follow-up referencing their portfolio
- **Day 20:** Final email — acknowledge silence, leave a clean door open

Beyond 4 touches reads as desperation. Generate all 4 at once in Claude, rotating the angle each touch.

---

## 6. LinkedIn: Building Lists + Personalizing DMs Without Getting Banned

### Building Your Target List — Sales Navigator ($89-140/mo)

VC targeting Boolean:
```
("General Partner" OR "Managing Partner" OR "Founding Partner") AND
("venture" OR "VC" OR "early stage") NOT "advisor" NOT "angel"
```

LP targeting Boolean:
```
("Family Office" OR "Endowment" OR "Foundation") AND
("investments" OR "alternatives" OR "private markets") AND
("Chief Investment Officer" OR "Investment Director" OR "Portfolio Manager")
```

LinkedIn's conversational AI search now accepts plain language — describe your target in prose for niche LP personas.

### Personalization with Claude

Extract Sales Navigator results to CSV via **Evaboot** (safer than PhantomBuster; 2,500 leads/day limit, extension-based). Feed the CSV to Claude:

```
"For each person in this CSV, write a 280-character connection request note
that references their most recent LinkedIn post topic (column G) and connects
it to [your fund thesis in 1 sentence]. Do not mention 'synergies' or 'explore
potential.' Sound like a peer, not a vendor."
```

Send via a compliant tool like **Expandi** or **HeyReach** (not PhantomBuster session-cookie automation).

### Hard Safety Limits

| Account Type | Daily Connection Requests | Weekly Max | Extraction/Day |
|---|---|---|---|
| Free | 10-15 | 50-70 | — |
| Premium | 20-25 | 80-100 | — |
| Sales Navigator | 25-35 | ~150 | 2,500 (Evaboot) |

- **Account warming:** New account/automation = 4 weeks manual-only first. Start 5 requests/day, +10%/week.
- **Stop signals:** Acceptance rate <30% → pause 7 days and audit targeting. <20% → stop completely.
- **What LinkedIn detects:** message uniformity, velocity spikes, timing regularity, low engagement ratios. Vary message length, send at irregular times, keep acceptance above 40%.
- **LinkedIn MCP tools** (ConnectSafely, Composio): more compliant than browser automation but still gray-zone. Use for light profile reading + drafting, not bulk send.

---

## 7. Concrete 1-Week Starter Plan

**Day 1 (Mon) — Data Foundation:** Download OpenVC CSV + VCPro ($119.95). Install EdgarTools MCP. Claude merges/dedupes/normalizes → master VC list to Google Sheets. *End: 5,000-8,000 deduplicated VC firms.*

**Day 2 (Tue) — LP Foundation:** Query ProPublica 990-PF API for foundations mentioning "venture"/"private equity" in Schedule I. Claude parses free-text → structured CSV. Optionally trial LP Navigator. *End: 300-500 foundation LP contacts + commitment history.*

**Day 3 (Wed) — Enrichment:** Sign up Apollo + Hunter.io. Run top 200 VC firms through Apollo MCP for verified partner emails. Verify LP list through Hunter. *End: 150-180 verified VC emails, 200+ verified LP emails.*

**Day 4 (Thu) — Cold Email Infra:** Register separate sending domain. Set SPF/DKIM/DMARC (Claude audits). Sign up Instantly, connect mailbox, **start warmup** (don't send yet — 14-21 days). *End: deliverability infra warming.*

**Day 5 (Fri) — LinkedIn + First Drafts:** Activate Sales Navigator, build Boolean search, export top 50 via Evaboot. Claude generates 50 personalized notes. Send 10 manually. Draft email sequence architecture. *End: 50 LI notes ready, 10 sent.*

**Day 6 (Sat) — Batch Personalization:** Top 30 VC targets: pull last 3 Crunchbase investments + thesis (Firecrawl) + recent LinkedIn posts. Claude generates full 4-email sequences. Load into Apollo (don't send). Build `/vc-pipeline` slash command.

**Day 7 (Sun) — LP Outreach Prep:** Top 20 foundation LPs: Claude researches mission + grant focus + alternative-investment statements. Draft personalized LP intros (alignment tone, not product pitch). Queue for when warmup completes.

**Week 2+:** Begin sending once warmup completes; monitor acceptance/reply rates daily; use Claude to analyze which signal types convert.

---

## 8. Watch-Outs

### LP Solicitation Law (Most Critical)

- **506(b) vs 506(c) matters.** Under **506(b)** you cannot use general solicitation — cold email/LinkedIn to strangers with no pre-existing relationship is legally gray at best and potentially a securities-law violation. Under **506(c)** general solicitation is permitted but you can **only accept verified accredited investors** and must take reasonable steps to verify accreditation.
- If raising under **506(b)**: cold LP outbound is high-risk. Consult securities counsel before running an LP cold email campaign.
- If raising under **506(c)**: cold outbound is permitted but back-end compliance (accreditation verification, disclosures) must be in place. Cleaner path for outbound.
- The data sourcing and personalization workflows here are legally neutral. The legal risk is in **how you solicit**, not in finding the data.

### ToS and Data Accuracy

- **SEC EDGAR:** public data, but enforce the 10 req/s limit with User-Agent headers. Don't bypass.
- **LinkedIn:** browser automation violates ToS, high ban risk. MCP tools lower-risk but still not officially permitted for automation. Stay manual + Evaboot; keep limits conservative.
- **OpenVC / NFX Signal / AngelList:** CSV exports of data you legitimately access are fine. Automated page scraping requires ToS review first.
- **Form D myth:** Form D does NOT disclose individual LP names — only issuer name, offering size, and number of investors. Any tool claiming to extract "investor names from Form D" is wrong.
- **Data freshness:** VC partner data goes stale ~20-30%/year. Re-verify any list older than 6 months before sending.

### Spam / Deliverability

- Bounce rate >2% damages sender reputation for weeks. Verify before loading sequences.
- Never put LPs and VC firms on the same sending domain — keep two separate cold-email domains/mailboxes.
- CAN-SPAM requires a plain-text opt-out even for relationship-oriented outreach.

### Tool Cost Reality Check

Minimum viable solo stack (monthly, after one-time VCPro purchase):
- Apollo: $79 · Instantly: $97 · LP Navigator: $300 (optional) · Hunter.io: $49 · Claude Max: $100-200 · Firecrawl: $16

**Realistic monthly spend: $640-740/mo.** Replaces a part-time SDR (~$3,000+/mo) or fundraising consultant ($5,000-15,000+/mo).
