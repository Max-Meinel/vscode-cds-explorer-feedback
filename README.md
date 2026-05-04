# CDS Explorer Extension - Feedback Form

Feedback-Formular für die Bachelorarbeit "Konzeption und Evaluation eines domänenbasierten Explorers als VS-Code Extension für SAP CAP Anwendungen".

## 🚀 Setup

### 1. Supabase Database erstellen

Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt.

Führe dann folgendes SQL-Script in **SQL Editor** aus:

```sql
-- Feedback Submissions Table
create table feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  
  -- Sektion 1: Kontext
  navigation_frequency text check (navigation_frequency in ('mehrmals_täglich', 'täglich', 'wöchentlich', 'selten')),
  typical_files_opened text check (typical_files_opened in ('1-2', '3-5', '6-10', '>10')),
  current_effort_score integer check (current_effort_score between 1 and 5),
  
  -- Sektion 2: Installation
  installation_successful boolean,
  installation_notes text,
  
  -- Sektion 3: Explorieren
  exploration_notes text,
  
  -- Sektion 4: Task
  chosen_task text not null,
  
  -- Sektion 5: Entlastung
  relief_score integer check (relief_score between 1 and 5) not null,
  effort_comparison text check (effort_comparison in ('deutlich_einfacher', 'etwas_einfacher', 'kein_unterschied', 'ohne_besser')),
  usage_intention_score integer check (usage_intention_score between 1 and 5) not null,
  
  -- Sektion 6: Use Cases (JSON array)
  use_cases jsonb default '[]'::jsonb,
  
  -- Sektion 7: Qualitative Fragen
  what_liked text,
  what_disliked text,
  next_feature text,
  would_recommend text,
  other_feedback text
);

-- Enable Row Level Security
alter table feedback_submissions enable row level security;

-- Policy: Jeder kann INSERT (Feedback senden)
create policy "Anyone can insert feedback"
  on feedback_submissions for insert
  with check (true);

-- Optionale Policy: Nur Admins können lesen (mit Service Role Key)
-- Keine READ policy = anon key kann nicht lesen
```

### 2. API Keys holen

In Supabase Dashboard:
- **Settings** → **API**
- Kopiere:
  - **Project URL**: `https://xyz.supabase.co`
  - **anon public** key: `eyJhbGci...`

### 3. Keys in app.js eintragen

Öffne `app.js` und ersetze:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'  // ← Hier eintragen
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'           // ← Hier eintragen
```

### 4. Auf GitHub Pages deployen

```bash
# Im BA-Repo
cd /Users/i590070/Documents/DHBW/Semester_5/BA

# Commit & Push
git add feedback-form/
git commit -m "Add feedback form"
git push
```

Dann in GitHub:
- **Settings** → **Pages**
- **Source:** Deploy from a branch
- **Branch:** main (oder dein Branch)
- **Folder:** `/` (root) oder `/feedback-form`
- **Save**

Die Form ist dann verfügbar unter:
```
https://YOUR_USERNAME.github.io/BA/feedback-form/
```

## 📊 Daten abrufen

### Option 1: Supabase Dashboard
- **Table Editor** → `feedback_submissions`
- Alle Submissions anzeigen
- **Export** als CSV

### Option 2: SQL Query
```sql
-- Alle Submissions
SELECT * FROM feedback_submissions
ORDER BY created_at DESC;

-- Durchschnittswerte
SELECT 
  AVG(relief_score) as avg_relief,
  AVG(current_effort_score) as avg_effort,
  AVG(usage_intention_score) as avg_usage
FROM feedback_submissions;

-- Häufigkeiten
SELECT 
  navigation_frequency, 
  COUNT(*) as count
FROM feedback_submissions
GROUP BY navigation_frequency;

-- Use Cases (JSON aggregation)
SELECT 
  jsonb_array_elements_text(use_cases) as use_case,
  COUNT(*) as count
FROM feedback_submissions
GROUP BY use_case
ORDER BY count DESC;
```

### Option 3: Python Script
```python
from supabase import create_client
import pandas as pd

# SERVICE_ROLE Key verwenden (nicht anon key!)
url = "https://xyz.supabase.co"
key = "YOUR_SERVICE_ROLE_KEY"  # Settings → API → service_role

supabase = create_client(url, key)

# Daten holen
response = supabase.table('feedback_submissions').select('*').execute()

# Als DataFrame
df = pd.DataFrame(response.data)

# Analyze
print(f"Durchschnittliche Entlastung: {df['relief_score'].mean():.2f}")
print(df['navigation_frequency'].value_counts())

# Export
df.to_csv('feedback_results.csv', index=False)
```

## 🔒 Security

- ✅ **anon key ist öffentlich** - das ist OK!
- ✅ **Row Level Security (RLS)** schützt die Daten
- ✅ **User können nur INSERT** - nicht READ/UPDATE/DELETE
- ✅ **Nur du kannst lesen** (mit service_role key)

## 🐛 Troubleshooting

### "Failed to fetch"
- Check Supabase URL in `app.js`
- Check Browser Console für Fehlermeldungen
- Check CORS in Supabase (sollte standardmäßig aktiviert sein)

### "new row violates row-level security policy"
- RLS Policy fehlt oder falsch
- Führe SQL-Script nochmal aus

### Form wird nicht angezeigt
- Check Browser Console
- Check ob Supabase CDN geladen wird
- Check ob Tailwind CDN geladen wird

## 📝 Weitere Infos

- Supabase Docs: https://supabase.com/docs
- GitHub Pages Docs: https://docs.github.com/pages
- Tailwind CSS: https://tailwindcss.com/docs
