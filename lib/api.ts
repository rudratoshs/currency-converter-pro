const API_BASE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const API_DATE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@';

/**
 * Fetch exchange rates for a given base currency.
 * @param {string} baseCurrency - The base currency code (e.g., "usd").
 * @returns {Promise<Record<string, number>>} - Exchange rates for the base currency.
 */
export async function fetchExchangeRates(baseCurrency) {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies/${baseCurrency.toLowerCase()}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[baseCurrency.toLowerCase()];
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message || error);
    throw new Error('Failed to fetch exchange rates');
  }
}

/**
 * Fetch a list of all available currencies.
 * @returns {Promise<Record<string, { name: string, code: string }>>} - List of all available currencies.
 */
export async function fetchAllCurrencies(): Promise<Record<string, { name: string, code: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const currenciesWithCodes: Record<string, { name: string, code: string }> = {};
    for (const [code, name] of Object.entries(data)) {
      currenciesWithCodes[code] = { name: name as string, code: code.toUpperCase() };
    }
    return currenciesWithCodes;
  } catch (error) {
    console.error('Error fetching currencies:', error.message || error);
    throw new Error('Failed to fetch currencies');
  }
}

/**
 * Fetch historical exchange rates for a specific date and base currency.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @param {string} baseCurrency - The base currency code (e.g., "usd").
 * @returns {Promise<Record<string, number>>} - Historical exchange rates for the base currency.
 */
export async function fetchHistoricalRates(date, baseCurrency) {
  try {
    // Validate and format the date
    const formattedDate = date.split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    if (new Date(formattedDate) > new Date(today)) {
      throw new Error('Cannot fetch rates for future dates.');
    }

    // Fetch historical rates
    const url = `${API_DATE_URL}${formattedDate}/v1/currencies/${baseCurrency.toLowerCase()}.json`;
    console.log('Fetching URL:', url); // Debugging URL

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}. URL: ${url}`);
      throw new Error(`Failed to fetch historical rates. Status: ${response.status}`);
    }

    const data = await response.json();

    // Ensure base currency exists in response
    if (!data[baseCurrency.toLowerCase()]) {
      throw new Error(`Base currency ${baseCurrency} not found in historical data.`);
    }

    return data[baseCurrency.toLowerCase()];
  } catch (error) {
    console.error('Error fetching historical rates:', error.message || error);
    throw new Error('Failed to fetch historical rates');
  }
}


/**
 * Fetch real-time exchange rates for a given base currency.
 * @param {string} baseCurrency - The base currency code (e.g., "usd").
 * @returns {Promise<Record<string, number>>} - Real-time exchange rates for the base currency.
 */
export async function fetchRealTimeRates(baseCurrency) {
  try {
    const url = `${API_BASE_URL}/currencies/${baseCurrency.toLowerCase()}.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data[baseCurrency.toLowerCase()] || {};
  } catch (error) {
    console.error('Error fetching real-time rates:', error.message || error);
    throw new Error('Failed to fetch real-time rates');
  }
}

/**
 * Fetch 7-day trend data for a specific base currency and target currency.
 * @param {string} baseCurrency - The base currency code (e.g., "usd").
 * @param {string} targetCurrency - The target currency code (e.g., "eur").
 * @returns {Promise<{ date: string, rate: number }[]>} - Trend data for the last 7 days.
 */
export async function fetch7DayTrend(baseCurrency, targetCurrency) {
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0]; // Ensure YYYY-MM-DD format
  });

  try {
    const trends = await Promise.all(
      dates.map(async (date) => {
        const url = `${API_DATE_URL}${date}/v1/currencies/${baseCurrency.toLowerCase()}.json`;
        const response = await fetch(url);

        if (!response.ok) {
          console.warn(`Data not available for ${date}. Status: ${response.status}`);
          return { date, rate: 0 }; // Return zero if data is not available
        }

        const data = await response.json();
        return {
          date,
          rate: data[baseCurrency.toLowerCase()]?.[targetCurrency.toLowerCase()] || 0,
        };
      })
    );

    return trends.reverse(); // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching 7-day trend:', error.message || error);
    throw new Error('Failed to fetch 7-day trend');
  }
}

/**
 * Fetch trends for multiple currencies over the last 7 days.
 */
export async function fetchBatchTrends(baseCurrency, targetCurrencies) {
  try {
    console.log(`Fetching trend for base: ${baseCurrency}, targets: ${targetCurrencies}`);

    const dates = Array.from({ length: 7 }, (_, i) =>
      new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );

    // Create batch URLs
    const urls = dates.map((date) =>
      `${API_DATE_URL}${date}/v1/currencies/${baseCurrency.toLowerCase()}.json`
    );

    // Fetch all dates in parallel
    const responses = await Promise.all(urls.map((url) => fetch(url)));
    const data = await Promise.all(responses.map((response) => response.json()));

    // Extract trend data for each target currency
    const trends = targetCurrencies.map((currency) => ({
      currency,
      trend: dates.map((date, i) => ({
        date,
        rate: data[i][baseCurrency.toLowerCase()][currency.toLowerCase()] || 0,
      })),
    }));

    return trends;
  } catch (error) {
    console.error("Error fetching batch trends:", error);
    throw new Error("Failed to fetch batch trends");
  }
}

/**
 * Fetch Bitcoin exchange rates
 * @returns {Promise<Record<string, number>>} - Exchange rates for BTC
 */
export async function fetchBTCRates(): Promise<Record<string, number>> {
  try {
    const response = await fetch(`${API_BASE_URL}/currencies/btc.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.btc;
  } catch (error) {
    console.error('Error fetching BTC rates:', error.message || error);
    throw new Error('Failed to fetch BTC rates');
  }
}
