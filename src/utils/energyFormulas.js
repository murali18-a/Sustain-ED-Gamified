/**
 * EcoQuest — Energy Calculation Formulas
 * All calculations based on real Indian electricity rates and emission factors.
 */

// India average electricity rate (₹/kWh)
export const DEFAULT_RATE_PER_UNIT = 8;

// India grid emission factor (kg CO₂ per kWh)
export const GRID_EMISSION_FACTOR = 0.82;

// Average solar hours per day in India
export const AVG_SOLAR_HOURS = 5.5;

/**
 * Calculate current power draw from all appliances
 * @param {Array} appliances - Array of appliance objects with { on, wattage, standbyWatts }
 * @returns {number} Total watts being consumed right now
 */
export function calculateCurrentDraw(appliances) {
  return appliances.reduce((total, app) => {
    if (app.on) return total + app.wattage;
    return total + (app.standbyWatts || 0);
  }, 0);
}

/**
 * Calculate monthly electricity cost
 * @param {number} watts - Power consumption in watts
 * @param {number} hoursPerDay - Hours of use per day
 * @param {number} ratePerUnit - Cost per kWh in ₹
 * @returns {number} Monthly cost in ₹
 */
export function calculateMonthlyCost(watts, hoursPerDay, ratePerUnit = DEFAULT_RATE_PER_UNIT) {
  const kwhPerMonth = (watts * hoursPerDay * 30) / 1000;
  return Math.round(kwhPerMonth * ratePerUnit);
}

/**
 * Calculate cost per hour
 * @param {number} watts - Power in watts
 * @param {number} ratePerUnit - Cost per kWh in ₹
 * @returns {number} Cost per hour in ₹
 */
export function calculateCostPerHour(watts, ratePerUnit = DEFAULT_RATE_PER_UNIT) {
  return (watts / 1000) * ratePerUnit;
}

/**
 * Calculate monthly kWh consumption
 * @param {number} watts - Power in watts
 * @param {number} hoursPerDay - Usage hours per day
 * @returns {number} Monthly kWh
 */
export function calculateMonthlyKwh(watts, hoursPerDay) {
  return (watts * hoursPerDay * 30) / 1000;
}

/**
 * Calculate annual carbon footprint from electricity
 * @param {number} kwhPerYear - Annual electricity consumption in kWh
 * @returns {number} kg of CO₂ per year
 */
export function calculateCarbonFootprint(kwhPerYear) {
  return Math.round(kwhPerYear * GRID_EMISSION_FACTOR);
}

/**
 * Calculate trees needed to offset carbon
 * @param {number} carbonKg - Carbon in kg CO₂
 * @returns {number} Number of trees (each absorbs ~22 kg CO₂/year)
 */
export function calculateTreesNeeded(carbonKg) {
  return Math.ceil(carbonKg / 22);
}

/**
 * Calculate payback period for an appliance upgrade
 * @param {number} oldWatts - Old appliance wattage
 * @param {number} newWatts - New appliance wattage
 * @param {number} priceDifference - Extra cost of new appliance in ₹
 * @param {number} hoursPerDay - Daily usage hours
 * @param {number} ratePerUnit - ₹ per kWh
 * @returns {number} Payback period in months
 */
export function calculatePaybackPeriod(oldWatts, newWatts, priceDifference, hoursPerDay, ratePerUnit = DEFAULT_RATE_PER_UNIT) {
  const monthlySavings = calculateMonthlyCost(oldWatts, hoursPerDay, ratePerUnit) - calculateMonthlyCost(newWatts, hoursPerDay, ratePerUnit);
  if (monthlySavings <= 0) return Infinity;
  return Math.round((priceDifference / monthlySavings) * 10) / 10;
}

/**
 * Calculate total monthly bill from array of appliances
 * @param {Array} appliances - Array of { wattage, hoursPerDay, on, standbyWatts }
 * @returns {number} Total monthly bill in ₹
 */
export function calculateTotalMonthlyBill(appliances, ratePerUnit = DEFAULT_RATE_PER_UNIT) {
  return appliances.reduce((total, app) => {
    const watts = app.on ? app.wattage : (app.standbyWatts || 0);
    const hours = app.on ? app.hoursPerDay : 24; // standby is 24/7
    return total + calculateMonthlyCost(watts, hours, ratePerUnit);
  }, 0);
}

/**
 * Get bill status color based on target
 * @param {number} bill - Current bill
 * @param {number} target - Target bill
 * @returns {string} CSS color variable name
 */
export function getBillStatus(bill, target) {
  const ratio = bill / target;
  if (ratio <= 0.8) return 'var(--emerald)';
  if (ratio <= 1.0) return 'var(--gold)';
  return 'var(--alizarin)';
}

/**
 * Format currency in Indian Rupees
 * @param {number} amount 
 * @returns {string} Formatted string like "₹1,500"
 */
export function formatCurrency(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Format watts for display
 * @param {number} watts 
 * @returns {string} e.g., "1,500W" or "1.5 kW"
 */
export function formatWatts(watts) {
  if (watts >= 1000) return `${(watts / 1000).toFixed(1)} kW`;
  return `${watts}W`;
}
