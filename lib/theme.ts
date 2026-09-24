// The saved theme choice, shared by the server layout and the toggle.
export const THEME_KEY = "studytrack-theme";

// Runs in <head> before the first paint (see app/layout.tsx), so a saved
// choice never flashes the other theme first. Storage can be unavailable in
// private windows; then the device setting simply applies.
export const THEME_BOOT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
