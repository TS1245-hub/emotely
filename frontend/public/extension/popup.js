// Configuration - À MODIFIER avec votre URL de dashboard
const API_BASE_URL = 'https://telework-finder.preview.emergentagent.com/api';
const DASHBOARD_URL = 'https://telework-finder.preview.emergentagent.com';

// DOM Elements
const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  statusIcon: document.getElementById('statusIcon'),
  statusText: document.getElementById('statusText'),
  mainForm: document.getElementById('mainForm'),
  jobPreview: document.getElementById('jobPreview'),
  previewTitle: document.getElementById('previewTitle'),
  previewCompany: document.getElementById('previewCompany'),
  previewLocation: document.getElementById('previewLocation'),
  previewSalary: document.getElementById('previewSalary'),
  errorMessage: document.getElementById('errorMessage'),
  jobTitle: document.getElementById('jobTitle'),
  jobCompany: document.getElementById('jobCompany'),
  jobLocation: document.getElementById('jobLocation'),
  jobSalary: document.getElementById('jobSalary'),
  jobNotes: document.getElementById('jobNotes'),
  saveBtn: document.getElementById('saveBtn'),
  openDashboard: document.getElementById('openDashboard'),
  successMessage: document.getElementById('successMessage'),
  addAnotherBtn: document.getElementById('addAnotherBtn'),
  viewInDashboard: document.getElementById('viewInDashboard'),
};

let currentUrl = '';
let detectedSource = 'other';

// Check API connection
async function checkConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      elements.statusIcon.classList.remove('error');
      elements.statusText.textContent = 'Connecté à votre dashboard';
      return true;
    }
  } catch (error) {
    console.error('Connection error:', error);
  }
  elements.statusIcon.classList.add('error');
  elements.statusText.textContent = 'Erreur de connexion';
  return false;
}

// Detect job source from URL
function detectSource(url) {
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('indeed.com') || url.includes('indeed.fr')) return 'indeed';
  if (url.includes('welcometothejungle.com')) return 'wttj';
  if (url.includes('remoteok.com')) return 'remoteok';
  if (url.includes('talent.io')) return 'talent';
  if (url.includes('glassdoor.')) return 'glassdoor';
  return 'other';
}

// Extract job data from current page
async function extractJobData() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      currentUrl = tab.url;
      detectedSource = detectSource(currentUrl);

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: extractFromPage,
          args: [detectedSource],
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            resolve(results[0].result);
          } else {
            resolve({
              title: tab.title || '',
              company: '',
              location: '',
              salary: '',
              description: '',
            });
          }
        }
      );
    });
  });
}

// Function injected into the page to extract data
function extractFromPage(source) {
  const data = {
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
  };

  try {
    switch (source) {
      case 'linkedin':
        // LinkedIn Job Page
        data.title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24')?.innerText?.trim() || '';
        data.company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .jobs-unified-top-card__subtitle-primary-grouping a')?.innerText?.trim() || '';
        data.location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .jobs-unified-top-card__subtitle-secondary-grouping span')?.innerText?.trim() || '';
        data.salary = document.querySelector('.job-details-jobs-unified-top-card__job-insight span, .salary-main-rail__compensation-value')?.innerText?.trim() || '';
        data.description = document.querySelector('.jobs-description__content, .jobs-box__html-content')?.innerText?.substring(0, 500) || '';
        break;

      case 'indeed':
        // Indeed Job Page
        data.title = document.querySelector('.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText?.trim() || '';
        data.company = document.querySelector('.jobsearch-InlineCompanyRating-companyHeader a, [data-testid="inlineHeader-companyName"]')?.innerText?.trim() || '';
        data.location = document.querySelector('.jobsearch-JobInfoHeader-subtitle > div:last-child, [data-testid="job-location"]')?.innerText?.trim() || '';
        data.salary = document.querySelector('#salaryInfoAndJobType span, [data-testid="attribute_snippet_testid"]')?.innerText?.trim() || '';
        data.description = document.querySelector('#jobDescriptionText')?.innerText?.substring(0, 500) || '';
        break;

      case 'wttj':
        // Welcome to the Jungle
        data.title = document.querySelector('h1[data-testid="job-title"], h1')?.innerText?.trim() || '';
        data.company = document.querySelector('[data-testid="job-company-name"], a[href*="/companies/"]')?.innerText?.trim() || '';
        data.location = document.querySelector('[data-testid="job-location"], [class*="location"]')?.innerText?.trim() || '';
        data.salary = document.querySelector('[data-testid="job-salary"], [class*="salary"]')?.innerText?.trim() || '';
        data.description = document.querySelector('[data-testid="job-description"], [class*="description"]')?.innerText?.substring(0, 500) || '';
        break;

      case 'remoteok':
        // RemoteOK
        data.title = document.querySelector('h1, .company_and_position h2')?.innerText?.trim() || '';
        data.company = document.querySelector('.company h3, .companyLink')?.innerText?.trim() || '';
        data.location = document.querySelector('.location')?.innerText?.trim() || 'Remote';
        data.salary = document.querySelector('.salary')?.innerText?.trim() || '';
        data.description = document.querySelector('.description, .markdown')?.innerText?.substring(0, 500) || '';
        break;

      case 'talent':
        // Talent.io
        data.title = document.querySelector('h1')?.innerText?.trim() || '';
        data.company = document.querySelector('[class*="company"]')?.innerText?.trim() || '';
        data.location = document.querySelector('[class*="location"]')?.innerText?.trim() || '';
        data.salary = document.querySelector('[class*="salary"]')?.innerText?.trim() || '';
        break;

      case 'glassdoor':
        // Glassdoor
        data.title = document.querySelector('[data-test="job-title"], .css-1vg6q84')?.innerText?.trim() || '';
        data.company = document.querySelector('[data-test="employer-name"], .css-87uc0g')?.innerText?.trim() || '';
        data.location = document.querySelector('[data-test="location"], .css-56kyx5')?.innerText?.trim() || '';
        data.salary = document.querySelector('[data-test="salary-estimate"]')?.innerText?.trim() || '';
        break;

      default:
        // Generic extraction
        data.title = document.querySelector('h1')?.innerText?.trim() || document.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        data.description = metaDescription?.content?.substring(0, 500) || '';
    }
  } catch (error) {
    console.error('Extraction error:', error);
  }

  return data;
}

// Update preview with extracted data
function updatePreview(data) {
  elements.previewTitle.textContent = data.title || 'Titre non détecté';
  elements.previewCompany.textContent = data.company || 'Entreprise non détectée';
  elements.previewLocation.textContent = data.location || '';
  elements.previewSalary.textContent = data.salary || '';

  // Fill form fields
  elements.jobTitle.value = data.title || '';
  elements.jobCompany.value = data.company || '';
  elements.jobLocation.value = data.location || '';
  elements.jobSalary.value = data.salary || '';

  // Update preview visibility
  if (data.title || data.company) {
    elements.jobPreview.classList.add('detected');
    elements.jobPreview.querySelector('.job-label').textContent = 'Offre détectée';
  } else {
    elements.jobPreview.classList.remove('detected');
    elements.jobPreview.querySelector('.job-label').textContent = 'Saisie manuelle';
  }
}

// Show error message
function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.classList.add('show');
}

// Hide error message
function hideError() {
  elements.errorMessage.classList.remove('show');
}

// Save job to API
async function saveJob() {
  hideError();

  const title = elements.jobTitle.value.trim();
  const company = elements.jobCompany.value.trim();

  if (!title || !company) {
    showError('Le titre et l\'entreprise sont requis');
    return;
  }

  elements.saveBtn.disabled = true;
  elements.saveBtn.innerHTML = '<div class="spinner"></div> Sauvegarde...';

  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        company: company,
        url: currentUrl,
        location: elements.jobLocation.value.trim() || null,
        salary: elements.jobSalary.value.trim() || null,
        notes: elements.jobNotes.value.trim() || null,
        source: detectedSource,
        status: 'À postuler',
      }),
    });

    if (response.ok) {
      showSuccess();
    } else {
      const error = await response.json();
      showError(error.detail || 'Erreur lors de la sauvegarde');
    }
  } catch (error) {
    console.error('Save error:', error);
    showError('Erreur de connexion au serveur');
  } finally {
    elements.saveBtn.disabled = false;
    elements.saveBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
      Sauvegarder dans Remotely
    `;
  }
}

// Show success state
function showSuccess() {
  elements.mainForm.classList.add('hidden');
  elements.successMessage.classList.add('show');
}

// Reset form for another entry
function resetForm() {
  elements.mainForm.classList.remove('hidden');
  elements.successMessage.classList.remove('show');
  elements.jobTitle.value = '';
  elements.jobCompany.value = '';
  elements.jobLocation.value = '';
  elements.jobSalary.value = '';
  elements.jobNotes.value = '';
  hideError();
  init();
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: DASHBOARD_URL });
}

// Initialize popup
async function init() {
  // Set dashboard links
  elements.openDashboard.href = DASHBOARD_URL;
  elements.viewInDashboard.href = DASHBOARD_URL;

  // Check connection
  await checkConnection();

  // Extract job data from current page
  const data = await extractJobData();
  updatePreview(data);
}

// Event listeners
elements.saveBtn.addEventListener('click', saveJob);
elements.addAnotherBtn.addEventListener('click', resetForm);
elements.openDashboard.addEventListener('click', (e) => {
  e.preventDefault();
  openDashboard();
});
elements.viewInDashboard.addEventListener('click', (e) => {
  e.preventDefault();
  openDashboard();
});

// Form submission on Enter
[elements.jobTitle, elements.jobCompany, elements.jobLocation, elements.jobSalary, elements.jobNotes].forEach((input) => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveJob();
    }
  });
});

// Initialize
init();
