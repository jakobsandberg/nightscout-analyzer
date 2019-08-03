import fetch from 'node-fetch';

const BASE_URL = 'https://jakob-nightscout.herokuapp.com';
const ENTRIES_ENDPOINT = '/api/v1/entries.json';
const COUNT = 10000;
const WAKEUP_TIME = 6;
const BED_TIME = 0; // midnight
const INSULIN_SENSITIVITY = 60 // mg/dl/unit

const getWakeupTime = () => (new Date()).setHours(WAKEUP_TIME,0,0,0);

const getBedTime = () => (new Date()).setHours(BED_TIME,0,0,0);

const getUrl = () => {
  const queryString = `?find[date][$gte]=${getBedTime()}&find[date][$lt]=${getWakeupTime()}&count=${COUNT}`;

  return `${BASE_URL}${ENTRIES_ENDPOINT}${queryString}`;
};

const getMaxFromEntries = entries => entries.reduce((max, entry) => Math.max(max, entry.sgv), 0);
const getMinFromEntries = entries => entries.reduce((min, entry) => Math.min(min, entry.sgv), Infinity);

const getSpread = (entries) => {
  const max = getMaxFromEntries(entries);
  const min = getMinFromEntries(entries);

  return max - min;
};

const getNaiveBasalAdjustment = (entries) => {
  const spread = getSpread(entries);
  const naiveInsulinOffset = spread/INSULIN_SENSITIVITY;

  return naiveInsulinOffset/6 // over 6 hours
}

const analyze = async () => {
  try {
    const url = getUrl();
    const response = await fetch(url);
    const json = await response.json();
    const naiveBasalAdjustment = getNaiveBasalAdjustment(json);
    console.log(`naive basal adjustment: ${naiveBasalAdjustment.toFixed(2)}`);
  } catch (error) {
    console.log(`error fetching entries, reason: ${error.message}`);
  }
};

analyze();
