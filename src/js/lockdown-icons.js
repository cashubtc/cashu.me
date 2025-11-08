// Minimal inline SVGs to replace Material Icons when iOS Lockdown Mode blocks webfonts.
// All SVGs are 24x24, inherit color and size via currentColor and 1em.
const svg = (innerPath) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${innerPath}</svg>`;

const iconMap = {
  // Common actions
  close: svg(
    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'
  ),
  add: svg(
    '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'
  ),
  search: svg(
    '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>'
  ),
  send: svg(
    '<path d="M22 2 11 13"></path><path d="M22 2 15 22 11 13 2 9 22 2z"></path>'
  ),
  refresh: svg(
    '<path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v7h-7"></path>'
  ),
  settings: svg(
    '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06c.46-.46.6-1.14.33-1.74A1.65 1.65 0 0 0 3 12c0-.26.03-.52.09-.76.12-.6-.07-1.22-.5-1.66l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.44.43 1.06.62 1.66.5.24-.06.5-.09.76-.09.7 0 1.34-.4 1.63-1.03V3a2 2 0 1 1 4 0v.09c.01.64.39 1.22.98 1.47.6.27 1.28.13 1.74-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.14-.33 1.74.06.24.09.5.09.76 0 .7.4 1.34 1.03 1.63Z"></path>'
  ),
  history: svg(
    '<path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 7 4.6L3 8"></path><path d="M12 7v5l4 2"></path>'
  ),
  backspace: svg(
    '<path d="M20 7H8l-5 5 5 5h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"></path><path d="m12 15 5-5"></path><path d="m17 15-5-5"></path>'
  ),
  error: svg(
    '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
  ),
  warning: svg(
    '<path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>'
  ),
  keyboard_arrow_down: svg('<polyline points="6 9 12 15 18 9"></polyline>'),
  keyboard_arrow_up: svg('<polyline points="18 15 12 9 6 15"></polyline>'),
  arrow_downward: svg(
    '<path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>'
  ),
  south: svg('<path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path>'),
  sort: svg(
    '<path d="M3 6h18"></path><path d="M7 12h10"></path><path d="M11 18h2"></path>'
  ),
  swap_horiz: svg(
    '<polyline points="16 3 21 8 16 13"></polyline><line x1="21" y1="8" x2="9" y2="8"></line><polyline points="8 21 3 16 8 11"></polyline><line x1="15" y1="16" x2="3" y2="16"></line>'
  ),
  content_paste: svg(
    '<rect x="9" y="2" width="6" height="4" rx="1"></rect><path d="M20 7a2 2 0 0 0-2-2h-1v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"></path>'
  ),
  qr_code: svg(
    '<rect x="3" y="3" width="8" height="8"></rect><rect x="13" y="3" width="8" height="8"></rect><rect x="3" y="13" width="8" height="8"></rect><path d="M13 13h3v3h-3z"></path><path d="M20 13v8"></path><path d="M13 20h8"></path>'
  ),
  account_balance: svg(
    '<path d="M3 10h18"></path><path d="M5 14h2v5H5z"></path><path d="M11 14h2v5h-2z"></path><path d="M17 14h2v5h-2z"></path><path d="M12 3 3 8h18l-9-5Z"></path>'
  ),
  account_circle: svg(
    '<circle cx="12" cy="8" r="4"></circle><path d="M4 20v-.5A6.5 6.5 0 0 1 10.5 13h3A6.5 6.5 0 0 1 20 19.5V20"></path><circle cx="12" cy="12" r="10"></circle>'
  ),
  rate_review: svg(
    '<path d="m16 3 5 5L8 21H3v-5L16 3z"></path><path d="M15 8 5 18"></path><path d="M13 6l5 5"></path>'
  ),
  account_balance_wallet: svg(
    '<path d="M21 7H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h18V7Z"></path><path d="M18 7V5a2 2 0 0 0-2-2H6"></path><circle cx="18" cy="12" r="1"></circle>'
  ),
  auto_awesome: svg(
    '<path d="M7 11h4l-2 4-2-4Z"></path><path d="M17 7h4l-2 4-2-4Z"></path><path d="M3 7h4l-2 4-2-4Z"></path>'
  ),
  gavel: svg(
    '<path d="m14 13 6-6"></path><path d="m11 16 6-6"></path><path d="M8 8l3 3"></path><path d="M2 20h7"></path><path d="m6 6 2-2 4 4-2 2z"></path>'
  ),
  vpn_key: svg(
    '<circle cx="7.5" cy="12" r="3.5"></circle><path d="M11 12h10"></path><path d="M16 10v4"></path>'
  ),
  check_circle: svg(
    '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>'
  ),
  more_vert: svg(
    '<circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle>'
  ),
  mobile_friendly: svg(
    '<rect x="7" y="2" width="10" height="20" rx="2"></rect><path d="M11 18h2"></path><path d="m8 13 2.5 2.5L16 10"></path>'
  ),
  ios_share: svg(
    '<path d="M12 16V3"></path><path d="m8 7 4-4 4 4"></path><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path>'
  ),
  restore: svg(
    '<path d="M3 3v5h5"></path><path d="M3.05 13A9 9 0 1 0 7 4.6L3 8"></path><path d="M12 7v5l4 2"></path>'
  ),
  cloud_off: svg(
    '<path d="M22 16.5A4.5 4.5 0 0 0 17.5 12h-.5A7 7 0 0 0 5.4 9"></path><path d="m1 1 22 22"></path>'
  ),
  toll: svg(
    '<circle cx="12" cy="12" r="3"></circle><path d="M5 12a7 7 0 0 0 7 7"></path><path d="M19 12a7 7 0 0 1-7 7"></path><path d="M5 12a7 7 0 0 1 7-7"></path><path d="M19 12a7 7 0 0 0-7-7"></path>'
  ),
  chat: svg(
    '<path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>'
  ),
  speed: svg(
    '<path d="M6 20h12"></path><path d="M9 3h6"></path><path d="M9 3v8a3 3 0 0 0 6 0V3"></path><path d="M12 12v8"></path>'
  ),
  zoom_in: svg(
    '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line>'
  ),
  edit_note: svg(
    '<path d="M3 5h14"></path><path d="M3 9h10"></path><path d="M3 13h6"></path><path d="M18 14l-5 5v3h3l5-5-3-3z"></path>'
  ),
  add_box_outline: svg(
    '<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor"></rect><path d="M12 8v8"></path><path d="M8 12h8"></path>'
  ),
};

function replaceMaterialIconEl(el) {
  const name = (el.textContent || "").trim();
  const svgMarkup = iconMap[name];
  if (!svgMarkup) return;

  const wrapper = document.createElement("span");
  // Preserve QIcon sizing/color via currentColor and font-size (1em).
  wrapper.className = (el.className || "").replace("material-icons", "q-icon");
  wrapper.setAttribute("role", "img");
  wrapper.innerHTML = svgMarkup;
  el.replaceWith(wrapper);
}

export function installLockdownIconFallback() {
  // Initial sweep
  document.querySelectorAll(".material-icons").forEach(replaceMaterialIconEl);

  // Observe DOM changes for newly added icons
  try {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes &&
          m.addedNodes.forEach((n) => {
            if (!(n instanceof HTMLElement)) return;
            if (n.classList && n.classList.contains("material-icons")) {
              replaceMaterialIconEl(n);
            }
            n.querySelectorAll &&
              n
                .querySelectorAll(".material-icons")
                .forEach(replaceMaterialIconEl);
          });
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch {
    // noop
  }
}

export const hasIconFallback = true;
