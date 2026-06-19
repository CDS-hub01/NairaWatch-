
// =====================================================
// GET ALL ELEMENTS — in same order as HTML
// =====================================================

const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('navLinks');
const hamburger = document.getElementById('hamburger');
const darkToggle = document.getElementById('darkToggle');

// Hero section
const heroRateCard = document.getElementById('heroRateCard');
const heroRateLoading = document.getElementById('heroRateLoading');
const lastUpdated = document.getElementById('lastUpdated');

// Exchange rates section
const ratesGrid = document.getElementById('ratesGrid');
const ratesLoading = document.getElementById('ratesLoading');
const ratesError = document.getElementById('ratesError');
const retryRates = document.getElementById('retryRates');

// Crypto section
const cryptoGrid = document.getElementById('cryptoGrid');
const cryptoLoading = document.getElementById('cryptoLoading');
const cryptoError = document.getElementById('cryptoError');
const retryCrypto = document.getElementById('retryCrypto');

// Converter section
const amountInput = document.getElementById('amountInput');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertedAmount = document.getElementById('convertedAmount');
const swapBtn = document.getElementById('swapBtn');
const converterRateInfo = document.getElementById('converterRateInfo');

// =====================================================
// API CONFIGURATION
// WHY: Keep API keys and URLs in one place at the
// top of the file — easy to find and update!
// =====================================================

// Replace this with YOUR OWN API key from
// exchangerate-api.com (type it yourself in VS Code!)
const EXCHANGE_API_KEY = '63bdc561522703470406fd6f';
const EXCHANGE_API_URL = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`;

// CoinGecko needs NO API key — completely free!
const CRYPTO_API_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=ngn&include_24hr_change=true';

// This will store the rates once fetched
// so the converter can use them too!
let currentRates = null;

// =====================================================
// FETCH EXCHANGE RATES
// Type: async function + fetch + try/catch
// WHEN: Called when page loads
// WHY: Gets live exchange rates from the API
//      and saves them for the converter to use too!
// =====================================================

const fetchExchangeRates = async () => {
  try {
    // Send request and WAIT for response
    const response = await fetch(EXCHANGE_API_URL);

    // Convert response to a usable JS object
    const data = await response.json();

    // Check if the API itself returned an error
    if (data.result !== 'success') {
      throw new Error('API returned an error');
    }

    // Save rates globally so converter can use them
    currentRates = data.conversion_rates;

    // Now display the data on the page!
    renderHeroRate();
    renderRates();
    updateTimestamp();
  } catch (error) {
    // If ANYTHING above fails — show error message
    console.log('Exchange rate error:', error);

    ratesLoading.style.display = 'none';
    ratesError.style.display = 'flex';

    // Also hide the hero loading spinner
    heroRateLoading.style.display = 'none';
  }
};

// =====================================================
// FETCH CRYPTO PRICES
// Type: async function + fetch + try/catch
// WHEN: Called when page loads
// WHY: Gets live Bitcoin, Ethereum, BNB prices in NGN
//      No API key needed for CoinGecko!
// =====================================================

const fetchCrypto = async () => {
  try {
    const response = await fetch(CRYPTO_API_URL);
    const data = await response.json();
    renderCrypto(data);
  } catch (error) {
    console.log('Crypto fetch error:', error);

    cryptoLoading.style.display = 'none';
    cryptoError.style.display = 'flex';
  }
};

// =====================================================
// RENDER HERO RATE — USD to NGN highlight
// Type: function + template literal
// WHEN: Called after rates are fetched
// WHY: Shows the most important rate prominently
//      at the top of the page!
// =====================================================

const renderHeroRate = () => {
  const ngnRate = currentRates.NGN;

  heroRateCard.innerHTML = `
    <div class="hero-rate-display">
      <div class="hero-rate-main">
        <p class="hero-rate-label">1 US Dollar equals</p>
        <p class="hero-rate-value">₦${ngnRate.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</p>
      </div>
      <div class="hero-rate-change">
        <i class="fas fa-circle-check"></i>
        Live rate
      </div>
    </div>
  `;
};

// =====================================================
// RENDER EXCHANGE RATES GRID
// Type: Array of objects + map + join
// WHEN: Called after rates are fetched
// WHY: Displays multiple currency cards
// =====================================================

const renderRates = () => {
  // Array of objects — currencies we want to display
  // Type: Array of Objects
  // WHY: Each currency needs a code, name and flag
  // grouped together!
  const currenciesToShow = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
    { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  ];

  // map() builds an HTML card for each currency
  // join("") combines them into one string
  ratesGrid.innerHTML = currenciesToShow
    .map((currency) => {
      // Get the NGN value for 1 unit of this currency
      // Example: how many Naira = 1 USD?
      const rateToNGN = currentRates.NGN / currentRates[currency.code];

      return `
        <div class="rate-card">
          <div class="rate-card-header">
            <span class="currency-flag">${currency.flag}</span>
            <div>
              <p class="currency-code">${currency.code}</p>
              <p class="currency-name">${currency.name}</p>
            </div>
          </div>
          <p class="rate-value">₦${rateToNGN.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</p>
          <p class="rate-sub">1 ${currency.code} = ₦${rateToNGN.toLocaleString('en-NG', { maximumFractionDigits: 2 })}</p>
        </div>
      `;
    })
    .join('');
};

// =====================================================
// RENDER CRYPTO GRID
// Type: Array of objects + map + join
// WHEN: Called after crypto data is fetched
// WHY: Displays Bitcoin, Ethereum, BNB cards
// =====================================================

const renderCrypto = (data) => {
  // Array of objects — matches CoinGecko's response keys
  const cryptosToShow = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB', icon: '🔶' },
  ];

  cryptoGrid.innerHTML = cryptosToShow
    .map((crypto) => {
      // data.bitcoin.ngn, data.ethereum.ngn, etc
      const price = data[crypto.id].ngn;
      const change = data[crypto.id].ngn_24h_change;

      // Determine if price went up or down
      const isPositive = change >= 0;

      return `
        <div class="crypto-card">
          <div class="crypto-card-header">
            <span class="currency-flag">${crypto.icon}</span>
            <div>
              <p class="currency-code">${crypto.symbol}</p>
              <p class="currency-name">${crypto.name}</p>
            </div>
          </div>
          <p class="crypto-value">₦${price.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</p>
          <span class="crypto-change ${isPositive ? 'positive' : 'negative'}">
            <i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i>
            ${Math.abs(change).toFixed(2)}% (24h)
          </span>
        </div>
      `;
    })
    .join('');
};

// =====================================================
// CURRENCY CONVERTER
// Type: function + math calculation
// WHEN: Called when user types or changes dropdowns
// WHY: Converts between any 2 currencies using
//      the rates we already fetched!
// =====================================================

const convertCurrency = () => {
  // If rates haven't loaded yet — do nothing
  if (!currentRates) return;

  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  // If input is empty or invalid — clear result
  if (isNaN(amount)) {
    convertedAmount.value = '';
    return;
  }

  // Step 1: Convert FROM currency to USD first
  // (our rates are all based on USD = 1)
  const amountInUSD = amount / currentRates[from];

  // Step 2: Convert USD to the TO currency
  const result = amountInUSD * currentRates[to];

  // Display result with 2 decimal places
  convertedAmount.value = result.toLocaleString('en-NG', {
    maximumFractionDigits: 2,
  });

  // Show the exchange rate info below
  const rate = currentRates[to] / currentRates[from];
  converterRateInfo.textContent = `1 ${from} = ${rate.toLocaleString('en-NG', { maximumFractionDigits: 4 })} ${to}`;
};

// =====================================================
// CONVERTER EVENT LISTENERS
// Type: addEventListener on input and select
// WHEN: User types or changes currency
// WHY: Recalculates conversion in real time!
// =====================================================

const initConverter = () => {
  // Recalculate every time user types in amount
  amountInput.addEventListener('input', convertCurrency);

  // Recalculate when "from" currency changes
  fromCurrency.addEventListener('change', convertCurrency);

  // Recalculate when "to" currency changes
  toCurrency.addEventListener('change', convertCurrency);

  // Swap button — swaps from and to currencies
  swapBtn.addEventListener('click', () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    convertCurrency();
  });
};

// =====================================================
// RETRY BUTTONS
// Type: addEventListener
// WHEN: User clicks Retry after an error
// WHY: Allows user to try fetching again
//      without refreshing the whole page!
// =====================================================

const initRetryButtons = () => {
  retryRates.addEventListener('click', () => {
    ratesError.style.display = 'none';
    ratesLoading.style.display = 'flex';
    heroRateLoading.style.display = 'flex';
    fetchExchangeRates();
  });

  retryCrypto.addEventListener('click', () => {
    cryptoError.style.display = 'none';
    cryptoLoading.style.display = 'flex';
    fetchCrypto();
  });
};

// =====================================================
// UPDATE TIMESTAMP
// Type: Date object + toLocaleTimeString
// WHEN: Called after rates are fetched
// WHY: Shows user WHEN the data was last updated
// =====================================================

const updateTimestamp = () => {
  const now = new Date();
  const time = now.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  lastUpdated.textContent = `Last updated: ${time}`;
};

// =====================================================
// DARK MODE TOGGLE
// Type: classList.toggle + localStorage
// WHEN: User clicks the moon/sun button
// WHY: Switches theme AND saves preference!
// =====================================================

const initDarkMode = () => {
  const saved = localStorage.getItem('nw_darkmode');
  if (saved === 'true') {
    document.body.classList.add('dark-mode');
    darkToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }

  darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('nw_darkmode', isDark);

    const icon = darkToggle.querySelector('i');
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
  });
};

// =====================================================
// HAMBURGER MENU
// Type: classList toggle + click outside to close
// WHEN: User clicks hamburger on mobile
// WHY: Opens/closes mobile nav — no aria, no overlay!
// =====================================================

const initHamburger = () => {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  // Close menu when any nav link is clicked
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.querySelector('i').classList.add('fa-bars');
      hamburger.querySelector('i').classList.remove('fa-times');
    });
  });

  // Close menu when user clicks anywhere outside navbar
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('active');
      hamburger.querySelector('i').classList.add('fa-bars');
      hamburger.querySelector('i').classList.remove('fa-times');
    }
  });
};

// =====================================================
// SET CURRENT YEAR IN FOOTER
// WHY: Automatically shows correct year — never stale!
// =====================================================

const setCurrentYear = () => {
  document.querySelectorAll('.current-year').forEach((span) => {
    span.textContent = new Date().getFullYear();
  });
};

// =====================================================
// AUTO REFRESH
// Type: setInterval
// WHEN: Runs every 5 minutes automatically
// WHY: Keeps rates up to date without the user
//      needing to refresh the page!
// =====================================================

const startAutoRefresh = () => {
  // 5 minutes = 5 * 60 * 1000 milliseconds
  setInterval(() => {
    fetchExchangeRates();
    fetchCrypto();
  }, 5 * 60 * 1000);
};

// =====================================================
// INITIALIZE — runs when page loads
// =====================================================

initDarkMode();
initHamburger();
initConverter();
initRetryButtons();
setCurrentYear();

fetchExchangeRates();
fetchCrypto();

startAutoRefresh();
