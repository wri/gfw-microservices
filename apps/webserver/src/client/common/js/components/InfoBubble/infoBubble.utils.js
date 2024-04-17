import { DATA_API_URL } from '../../config';

const INFO_BUBBLE_KEY = 'GFW-info-bubble';

export function saveInfoBubbleCache(data, id) {
  let listData = getInfoBubbleCache() || {};
  listData[id] = data;
  localStorage.setItem(INFO_BUBBLE_KEY, JSON.stringify(listData));
}

export function getInfoBubbleCache() {
  return JSON.parse(localStorage.getItem(INFO_BUBBLE_KEY));
}

export async function fetchInfoBubble(bubbleId) {
  return fetch(`${DATA_API_URL}/dataApi/getInfoBubbleData/${bubbleId}`, { method: 'POST' })
    .then((response) => response.json())
    .then((data) => {
      return data.data;
    })
    .catch((e) => console.error(e));
}