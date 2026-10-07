# Teacher Tribe Eligibility & Reporting Prototype v4

## Refined V4 — same visual system

This is the refined V4 of the existing Teacher Tribe eligibility/reporting tool. The visual design, 3D/glass styling and page structure are intentionally retained; the work is focused on data, matching logic, filtering and PDF reliability.

### Data improvements
- Reads the V4 Excel catalogue as the canonical source for the original 389 records.
- Retains the additional unique job/exam records already present in the attached prototype.
- Final embedded catalogue: **580 unique records**.
- Duplicate examination/job names: **0**.
- Duplicate IDs: **0**; IDs are normalized to stable `ETI-####` identifiers.
- Adds systematic `examType` and `jobType` fields.
- Exam preference now explicitly supports Government Exams, Academic Exams, Civil Service Exams, Competitive & Entrance Exams, Professional, International, PSU, Teaching, Defence, State Government and Research.
- Job preference includes the full career taxonomy used by Teacher Tribe.
- Every record has an `applyUrl` pointing to an authority/official portal. Exact application URLs are used where available; otherwise the authority portal or Government directory is used rather than inventing a form URL.

### Eligibility intelligence
Each displayed opportunity now explains:
- Why the student matches the stored qualification/subject/percentage/attempt rule.
- A dedicated **DETAILED JOB / EXAM INFORMATION** section with researched eligibility, posts, age, qualification, percentage, selection, reservation/relaxation, domicile, gender, nationality, physical/medical, pay, vacancies and research-source information.
- No blanket age bonus is applied for reservation/special categories.
- Missing rules are shown as verification warnings instead of being guessed.

### PDF generation
- Uses `@react-pdf/renderer` and `pdf(...).toBlob()`.
- PDF contains the student profile, selected exam/job preferences, every matching opportunity, the detailed job/exam information section and official portal links.
- PDF history stores generated files in **IndexedDB** instead of relying on localStorage for large PDF binaries.
- Report metadata remains in localStorage for the prototype.
- Existing older reports that still contain a stored data URL can still be downloaded.

## Demo accounts
Teacher: `teacher001` / `Teacher@123`
Admin: `admin001` / `Admin@123`

## Run
```bash
npm install
npm run dev
```

## Production note
For production, move the exam/job catalogue into a versioned database and store yearly notification-specific eligibility, age, domicile, reservation, vacancy, fee and application-window rules separately. Generated PDFs should be stored in private object storage (S3/R2/Supabase Storage) with report metadata in PostgreSQL.

### Automatic report email
Each time a PDF is generated, the browser also posts the PDF to `api/send-report.php`, which emails the complete PDF attachment to **thryvemeeraki@gmail.com**. The PDF is still downloaded and stored in local report history even if email delivery fails.

For Hostinger deployment, keep `api/send-report.php` at the site root and configure the sender address (`TEACHER_TRIBE_MAIL_FROM`) to an email address on the website's domain when possible. The endpoint uses the hosting mail service via PHP `mail()`; delivery depends on the Hostinger/domain mail configuration.

## Research-grade eligibility details (V4 refinement)

The catalogue now carries a structured `details` object for every record. It supports age rules, minimum percentage rules, reservation/age-relaxation rules, domicile/state conditions, gender, nationality, selection process, posts/roles, pay scale, vacancy information, physical/medical requirements, application portal, verification date/source, research status and research notes.

High-priority opportunities were researched against official authority sources, including UPSC, SSC, IAF, Indian Navy, Indian Coast Guard, IBPS, SBI, RBI, SEBI, RRB and CTET. The report displays researched information instead of the old generic “not stored” wording. Where an authority source does not publish a rule in the source reviewed, the report explicitly says that the rule was not specified in that source rather than inventing a value.

The eligibility engine uses researched age/percentage information where available and keeps reservation, domicile, gender, nationality and physical/medical conditions as verification-aware rules.
Fix delete report syntax error
