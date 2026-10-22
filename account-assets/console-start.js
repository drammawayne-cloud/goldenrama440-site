import {siteFetch as fetch,currentSite,apiOrigin,localLink,startGoogle,clearSession,saveSession} from './site-context.js?v=20261022-stay';
import {bootWorkspace} from './workspace-startup.js?v=20261022-stay';
const studio=location.pathname.startsWith('/addons/');
await bootWorkspace({target:document.querySelector(studio?'main':'#app'),moduleUrl:new URL(studio?'./rr-addon.js?v=20261022-stay':'../src/app.js?v=startup-20261001',import.meta.url).href});

