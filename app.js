// ⚠️ WICHTIG: Ersetze diese Werte mit deinen Supabase-Credentials!
// Zu finden in: Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://oizgdefuiiowmuprbcxj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pemdkZWZ1aWlvd211cHJiY3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODgwODQsImV4cCI6MjA5MzE2NDA4NH0.3SadpJWvGT6SU13K-Q-j9hLSqtCYk54tRq-vSdQJGHQ'

// Supabase Client initialisieren
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Form Elements
const form = document.getElementById('feedbackForm')
const loadingDiv = document.getElementById('loading')
const errorDiv = document.getElementById('error')
const errorMessage = document.getElementById('errorMessage')

// Form Submit Handler
form.addEventListener('submit', async (e) => {
  e.preventDefault()

  // Hide error if visible
  errorDiv.classList.add('hidden')

  // Check if all required radio buttons are selected
  const requiredRadioGroups = ['current_effort_score', 'relief_score', 'usability_score', 'relationships_score', 'usage_intention_score']
  const formData = new FormData(e.target)
  const missingFields = []

  for (const fieldName of requiredRadioGroups) {
    if (!formData.get(fieldName)) {
      missingFields.push(fieldName)
    }
  }

  if (missingFields.length > 0) {
    // Show error for missing fields
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = 'Bitte beantworte alle Pflichtfragen mit einer Bewertung von 1-5.'
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Highlight missing fields
    missingFields.forEach(fieldName => {
      const firstRadio = document.querySelector(`input[name="${fieldName}"]`)
      if (firstRadio) {
        const questionContainer = firstRadio.closest('div').parentElement
        if (questionContainer) {
          questionContainer.classList.add('highlight-missing')
          setTimeout(() => questionContainer.classList.remove('highlight-missing'), 3000)
        }
      }
    })

    return
  }

  // Show loading overlay without hiding form
  loadingDiv.classList.remove('hidden')

  try {
    // Collect form data

    // Build submission object
    const submission = {
      // Sektion 1: Kontext
      cap_experience_duration: formData.get('cap_experience_duration'),
      current_effort_score: parseInt(formData.get('current_effort_score')),

      // Sektion 2: Installation
      installation_notes: formData.get('installation_notes') || null,

      // Sektion 3: Explorieren
      exploration_notes: formData.get('exploration_notes') || null,

      // Sektion 4: Task
      chosen_task: formData.get('chosen_task'),
      project_name: formData.get('project_name') || null,

      // Sektion 5: Entlastung
      relief_score: parseInt(formData.get('relief_score')),
      usability_score: parseInt(formData.get('usability_score')),
      relationships_score: parseInt(formData.get('relationships_score')),
      usage_intention_score: parseInt(formData.get('usage_intention_score')),

      // Sektion 6: Qualitative Fragen
      what_liked: formData.get('what_liked') || null,
      what_improve: formData.get('what_improve') || null
    }

    console.log('Submitting:', submission)

    // Submit to Edge Function
    const response = await fetch('https://oizgdefuiiowmuprbcxj.supabase.co/functions/v1/accept_form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(submission)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Submission failed')
    }

    const { data } = await response.json()

    console.log('Success:', data)

    // Redirect to thank you page
    window.location.href = 'thank-you.html'

  } catch (error) {
    console.error('Error:', error)

    // Show error state
    loadingDiv.classList.add('hidden')
    errorDiv.classList.remove('hidden')
    errorMessage.textContent = error.message || 'Unbekannter Fehler. Bitte versuche es erneut.'

    // Scroll to error
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})
