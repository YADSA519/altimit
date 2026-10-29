(function(){
/* ---------- íconos por bando: cambian de forma, no solo de color ---------- */
// LA RED (login / antes de elegir): línea fina gris.
// REBELDES: hechos a mano, como esténcil y aerosol: trazo grueso, irregular, objetos rescatados.
// ORK/VIREX: técnicos, dentro de un hexágono, geometría limpia y rellenos sólidos.
const RF = '<filter id="rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter>';
document.body.insertAdjacentHTML('beforeend', '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' + RF + '</defs></svg>');
const RB = (inner) => '<svg viewBox="0 0 32 32" fill="none" stroke="#ececec" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><g filter="url(#rough)">' + inner + '</g></svg>';
const HEX = 'M16 1.8 28.3 8.9v14.2L16 30.2 3.7 23.1V8.9z';
const OK = (inner) => '<svg viewBox="0 0 32 32"><path d="' + HEX + '" fill="none" stroke="#e2433a" stroke-width="1.4"/><g fill="#e2433a" stroke="none">' + inner + '</g></svg>';
const NT = (inner) => '<svg viewBox="0 0 32 32" fill="none" stroke="#bdb8ae" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
const ICONSET = {
  neutral: {
    theof: NT('<path d="M10.5 9.5a9 9 0 1 0 11 0"/><path d="M16 5v11"/>'),
    mail: NT('<rect x="4" y="8" width="24" height="17"/><path d="M4 9l12 9 12-9"/>'),
    news: NT('<rect x="5" y="6" width="22" height="21"/><path d="M9 11h14M9 15h6M9 19h6M9 23h14"/>'),
    accessory: NT('<path d="M9 21V14a7 7 0 0 1 14 0v7l2 3H7z"/><path d="M13.5 27a2.5 2.5 0 0 0 5 0"/>'),
    audio: NT('<rect x="10" y="9" width="12" height="19" rx="1"/><path d="M13 9V3M13 14h6M13 18h6"/>'),
    data: NT('<rect x="4" y="7" width="24" height="19"/><path d="M4 22l7-7 6 6 4-4 7 7"/>'),
    desktop: NT('<rect x="4" y="6" width="24" height="16"/><path d="M12 27h8M16 22v5"/>'),
    admin: NT('<circle cx="16" cy="16" r="4"/><path d="M16 4v4M16 24v4M4 16h4M24 16h4"/>'),
    salir: NT('<path d="M10.5 9.5a9 9 0 1 0 11 0"/><path d="M16 5v11"/>')
  },
  rebel: {
    theof: RB('<path d="M10 9.8a9.4 9.4 0 1 0 12.2-.3"/><path d="M16.3 4.2l-.4 11.6"/>'),
    mail: RB('<path d="M5 9.5l21.5-1.2.8 15.4-21.6 1.1z"/><path d="M5.3 10l10.6 8.1 10.9-9"/><path d="M20 5.5l5 2" stroke-width="3.4"/>'),
    news: RB('<path d="M6.5 5l19.5 1.4-1.2 21L5 26z"/><path d="M10 11l12 .6M9.8 15.4l8 .3M9.6 19.6l11 .5"/><circle cx="16" cy="5.6" r="1.4" fill="#ececec"/>'),
    accessory: RB('<circle cx="16" cy="17.5" r="9"/><path d="M16 12v6l3.5 2.5"/><path d="M8 7.5l-3 3M24 7.5l3 3"/><path d="M11 27l-2 2.5M21 27l2 2.5"/>'),
    audio: RB('<path d="M11 10h11l.6 18H10.4z"/><path d="M13.5 10l-.8-7"/><path d="M13.5 15h6M13.5 18.5h6"/><circle cx="16.5" cy="23.5" r="1.6"/>'),
    data: RB('<path d="M6 5.5h20.5v21.5H5.5z"/><path d="M8.8 8.6h14.5v12.8H8.8z"/><path d="M9 18.5l4-4 3.5 3.3 2.5-2.3 4.3 4"/>'),
    desktop: RB('<path d="M5 7.5h22l-.6 15H5.6z"/><path d="M11 27.5c3-1 7-1 10 0"/><path d="M8.5 10.5l3 3"/>'),
    admin: RB('<path d="M20.5 4.5a5.5 5.5 0 0 0-5.8 7.8L5.5 21.5l4 4 9.2-9.2a5.5 5.5 0 0 0 7.8-5.8l-3.4 3.3-3.3-.8-.8-3.3z"/>'),
    salir: RB('<path d="M18 5h7.5v22H18"/><path d="M5.5 16h13M14 11.5l4.5 4.5-4.5 4.5"/>')
  },
  ork: {
    theof: OK('<path d="M12.2 11.2l1.6 1.4a5.2 5.2 0 1 0 4.4 0l1.6-1.4a7.3 7.3 0 1 1-7.6 0z"/><rect x="15" y="8" width="2" height="8.5"/>'),
    mail: OK('<path d="M9 11.5h14v9.5H9z" fill="none" stroke="#e2433a" stroke-width="1.6"/><path d="M9 11.5l7 5.2 7-5.2v1.8l-7 5.2-7-5.2z"/>'),
    news: OK('<rect x="10" y="9" width="12" height="14.5"/><g fill="#120707"><rect x="12" y="11.2" width="8" height="1.6"/><rect x="12" y="14.4" width="5" height="1.2"/><rect x="12" y="16.8" width="8" height="1.2"/><rect x="12" y="19.2" width="6" height="1.2"/></g>'),
    accessory: OK('<path d="M11 21.5v-5a5 5 0 0 1 10 0v5z"/><rect x="9.5" y="21.5" width="13" height="2.2"/><path d="M15.2 7.5h1.6v3h-1.6zM9 10.3l1.1-1.1 2 2-1.1 1.1zM21.9 9.2 23 10.3l-2 2-1.1-1.1z"/>'),
    audio: OK('<rect x="8.5" y="14.5" width="1.6" height="3"/><rect x="11.2" y="12" width="1.6" height="8"/><rect x="13.9" y="9.5" width="1.6" height="13"/><rect x="16.6" y="11.5" width="1.6" height="9"/><rect x="19.3" y="13.5" width="1.6" height="5"/><rect x="22" y="15" width="1.6" height="2"/>'),
    data: OK('<path d="M7.5 16c2.6-4 5.4-6 8.5-6s5.9 2 8.5 6c-2.6 4-5.4 6-8.5 6s-5.9-2-8.5-6z" fill="none" stroke="#e2433a" stroke-width="1.6"/><circle cx="16" cy="16" r="3.2"/>'),
    desktop: OK('<rect x="10" y="8.5" width="12" height="15" fill="none" stroke="#e2433a" stroke-width="1.6"/><circle cx="16" cy="13.5" r="2.4"/><path d="M12 21c.5-2.5 2-3.6 4-3.6s3.5 1.1 4 3.6z"/><rect x="14.5" y="6.5" width="3" height="2.6"/>'),
    admin: OK('<path d="M16 7.5l7 2.6v5.4c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9v-5.4z"/><circle cx="16" cy="15.6" r="2.4" fill="#120707"/>'),
    salir: OK('<path d="M12.2 11.2l1.6 1.4a5.2 5.2 0 1 0 4.4 0l1.6-1.4a7.3 7.3 0 1 1-7.6 0z"/><rect x="15" y="8" width="2" height="8.5"/>')
  }
};
const NAV = [
  ['theof', 'THE O|F', { neutral: 'entrar a Cenizas', rebel: 'volver a la calle', ork: 'desplegar en Cenizas' }],
  ['mail', 'MAIL', { neutral: 'mensajes e invitaciones', rebel: 'mensajes entre los nuestros', ork: 'comunicaciones internas' }, 3],
  ['news', 'NEWS', { neutral: 'noticias y eventos', rebel: 'lo que dice la radio', ork: 'comunicados oficiales' }, 1],
  ['accessory', 'ACCESSORY', { neutral: 'recordatorios y alertas', rebel: 'avisos y alarmas', ork: 'alertas y protocolos' }, 2],
  ['audio', 'AUDIO', { neutral: 'walkie-talkie', rebel: 'walkie entre refugios', ork: 'canal de radio seguro' }],
  ['data', 'DATA', { neutral: 'fotos y capturas', rebel: 'fotos de la calle', ork: 'registros visuales' }],
  ['desktop', 'DESKTOP', { neutral: 'tu perfil', rebel: 'tu ficha', ork: 'tu legajo' }],
  ['admin', 'ADMIN', { neutral: 'solo administrador', rebel: 'solo administrador', ork: 'solo administrador' }],
  ['salir', 'SALIR', { neutral: 'cerrar sesión', rebel: 'apagar la señal', ork: 'cerrar sesión' }]
];

window.THEOF = { ICONSET, NAV,
  mic: '<svg viewBox="0 0 48 48"><rect x="18" y="8" width="12" height="22" rx="6"/><path d="M12 24a12 12 0 0 0 24 0M24 36v6M18 42h12"/></svg>' };
})();
