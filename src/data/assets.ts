import type { JournalAsset, StickerTheme } from "../types";

const makeSvg = (content: string, width: number, height: number) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`,
  )}`;

const shadowDefs = `
  <defs>
    <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="1.5" dy="3" stdDeviation="2.2" flood-color="#6e5b4b" flood-opacity=".18"/>
    </filter>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#fffdf8"/><stop offset="1" stop-color="#efe3d2"/>
    </linearGradient>
  </defs>`;

const stickerMarkup: Record<string, string> = {
  fern: `<path d="M60 101C58 69 64 38 84 19M64 50c-18-2-28-10-31-24 17-2 30 5 37 18M68 66c20-4 33-14 37-29-19-2-34 7-43 23M58 82c-15 0-24-7-29-19 14-3 26 2 33 13" fill="#7f9b6c"/>`,
  eucalyptus: `<path d="M58 105c2-40 4-69 18-91" fill="none"/><g fill="#9ab29a"><ellipse cx="55" cy="43" rx="16" ry="9" transform="rotate(-42 55 43)"/><ellipse cx="78" cy="37" rx="16" ry="9" transform="rotate(35 78 37)"/><ellipse cx="49" cy="66" rx="17" ry="9" transform="rotate(-35 49 66)"/><ellipse cx="76" cy="59" rx="15" ry="9" transform="rotate(35 76 59)"/><ellipse cx="47" cy="88" rx="14" ry="8" transform="rotate(-26 47 88)"/><ellipse cx="70" cy="82" rx="14" ry="8" transform="rotate(41 70 82)"/></g>`,
  rose: `<path d="M52 98c-7-20-3-39 15-54 20 14 24 34 11 56-8 1-19 1-26-2Z" fill="#7d9c70"/><g fill="#e5a3aa"><circle cx="70" cy="36" r="22"/><path d="M52 37c11-17 34-19 45-2-7 17-31 22-45 2Zm9 2c6-8 18-10 27-3-4 9-17 12-27 3Z" fill="#cc858e" stroke="#fffdf8" stroke-width="2"/></g>`,
  daisy: `<path d="M61 102c-1-25 0-43 9-61" fill="none"/><g fill="#fffdf7"><ellipse cx="67" cy="26" rx="10" ry="20"/><ellipse cx="88" cy="36" rx="10" ry="20" transform="rotate(55 88 36)"/><ellipse cx="88" cy="57" rx="10" ry="20" transform="rotate(112 88 57)"/><ellipse cx="65" cy="69" rx="10" ry="20" transform="rotate(168 65 69)"/><ellipse cx="46" cy="54" rx="10" ry="20" transform="rotate(225 46 54)"/><ellipse cx="47" cy="34" rx="10" ry="20" transform="rotate(285 47 34)"/></g><circle cx="68" cy="48" r="11" fill="#e9ca70"/><path d="M66 79c20-4 31-17 32-34-18-2-31 8-37 24" fill="#7e9c71"/>`,
  olive: `<path d="M40 99c18-28 32-51 54-77" fill="none"/><g fill="#8fa178"><ellipse cx="48" cy="70" rx="18" ry="8" transform="rotate(54 48 70)"/><ellipse cx="62" cy="57" rx="18" ry="8" transform="rotate(-38 62 57)"/><ellipse cx="72" cy="39" rx="18" ry="8" transform="rotate(48 72 39)"/><ellipse cx="87" cy="26" rx="15" ry="7" transform="rotate(-32 87 26)"/></g><g fill="#5d7958"><ellipse cx="57" cy="77" rx="7" ry="10"/><ellipse cx="82" cy="46" rx="7" ry="10"/></g>`,
  clover: `<path d="M60 101c0-30 0-54 9-78" fill="none"/><g fill="#83a97e"><path d="M69 35c-25-26-45-2-23 17 13 5 22-3 23-17Z"/><path d="M69 35c26-24 45 1 20 19-13 4-21-4-20-19Z"/><path d="M69 53c-23 24-4 43 14 20 3-13-4-20-14-20Z"/></g><path d="M67 88c18-5 29-16 31-31-15-2-27 6-36 21" fill="#72976c"/>`,
  lily: `<path d="M58 102c2-24 4-42 17-64" fill="none"/><path d="M72 39C60 8 79-5 94 20c1 13-8 21-22 19Z" fill="#fff8ec"/><path d="M70 42C48 19 60 3 84 17c7 11 2 22-14 25Z" fill="#f7e9db"/><path d="M76 43c0-32 21-37 28-9-2 16-11 20-28 9Z" fill="#fffdf8"/><path d="M74 43c6 12 8 24 4 37M61 90c17-4 29-14 35-28-15-3-27 5-37 19" fill="#789a6f"/><path d="M77 44l8 17m-3-20-14 20" fill="none"/>`,
  wildflower: `<path d="M42 106c16-24 28-48 44-79M58 83c-19 1-31-7-37-22 19-3 34 4 44 18M65 60c17-4 28-15 31-30-18 0-30 9-37 23" fill="none"/><g fill="#d6a4a8"><circle cx="85" cy="22" r="11"/><circle cx="94" cy="34" r="6"/><circle cx="78" cy="34" r="6"/><circle cx="44" cy="42" r="8"/><circle cx="53" cy="49" r="5"/><circle cx="37" cy="50" r="5"/></g><circle cx="85" cy="25" r="3" fill="#e6c46c"/><circle cx="44" cy="45" r="2.5" fill="#e6c46c"/>`,
  cup: `<path d="M26 47h57v30c0 15-12 25-28 25S26 92 26 77V47Z" fill="#eac5bf"/><path d="M82 57c18-5 26 4 23 16-2 10-11 14-24 11" fill="none" stroke-width="9"/><path d="M36 35c-6-8 7-12 1-22m21 22c-5-7 6-12 1-22m20 23c-5-7 6-12 1-20" fill="none"/><path d="M38 82c14 4 27 4 39-1" fill="none" stroke="#fff9ee" stroke-width="3"/>`,
  cat: `<path d="M28 83c0-27 15-47 36-47s37 20 37 47c0 17-14 26-37 26S28 100 28 83Z" fill="#f3d1a5"/><path d="M34 50 29 22l24 15m25 0 20-18 2 34" fill="#f3d1a5"/><path d="M47 74h.1m36 0h.1" stroke-width="7" stroke-linecap="round"/><path d="M65 83c-4 4-3 7 2 7s6-4 1-8m-15 1c8 8 23 8 31 0" fill="none" stroke="#775f54"/><path d="M31 78H10m16 8H12m71-8h20m-17 8h16" fill="none" stroke="#775f54"/>`,
  toast: `<path d="M31 37c-2-18 18-27 34-18 16-9 32 4 28 20l1 47c-19 10-43 10-63 0V37Z" fill="#e8bd77"/><path d="M44 50c8-7 14 4 21-2 7 7 14-4 19 5l-1 30c-13 7-26 7-39 0V50Z" fill="#f8e8c8"/><circle cx="58" cy="68" r="5" fill="#d69971"/><circle cx="79" cy="64" r="4" fill="#d69971"/><path d="M63 81c6 3 11 3 16-1" fill="none"/>`,
  moon: `<path d="M79 24c-28 4-42 36-20 58 12 11 28 13 42 5-13 22-43 27-62 8C17 73 21 41 44 27c10-7 23-8 35-3Z" fill="#f1d88d"/><path d="M87 34c2-5 5-8 10-9-2 5-3 9 0 13-5 0-8-1-10-4Z" fill="#fff6ce"/><circle cx="95" cy="67" r="4" fill="#e8c272"/><circle cx="78" cy="19" r="3" fill="#e8c272"/>`,
  cloud: `<path d="M28 78c-18-2-21-28-1-31 2-22 31-25 41-7 19-7 35 8 30 25 16 8 14 29-5 32H44c-7 0-12-7-16-19Z" fill="#edf6f3"/><path d="M44 86c-8 12-14 14-23 8m18-7c-2 13-7 18-16 19" fill="none" stroke="#8ebac0" stroke-width="3"/>`,
  strawberry: `<path d="M66 103c-21 0-43-24-38-51 28-21 57 7 58 28 1 10-8 23-20 23Z" fill="#e9938c"/><path d="M37 46c17-9 40-7 51 8" fill="none"/><path d="M60 52c-20-17-34-8-20 9m21-11c18-19 34-12 21 7m-27-8c-4-19 8-29 14-13" fill="#809b6f"/><g fill="#f4d98d"><circle cx="47" cy="65" r="2"/><circle cx="62" cy="58" r="2"/><circle cx="72" cy="73" r="2"/><circle cx="53" cy="84" r="2"/><circle cx="76" cy="91" r="2"/></g>`,
  bow: `<path d="M58 56C36 21 10 29 14 57c4 27 29 19 45 2 16 16 40 25 45-2 5-29-22-36-46-1Z" fill="#efb0bf"/><path d="M59 57c18 16 30 31 24 42-9 5-19-10-24-25-6 16-14 30-24 25-7-10 6-28 24-42Z" fill="#e8a0b1"/><circle cx="60" cy="59" r="10" fill="#f8d6dd"/>`,
  star: `<path d="m61 18 11 25 27 3-20 18 6 27-24-14-24 14 6-27-20-18 27-3 11-25Z" fill="#f1d78c"/><path d="m43 76 17 2 7 11" fill="none"/><circle cx="95" cy="22" r="5" fill="#e8afb5"/><circle cx="27" cy="44" r="3" fill="#e8afb5"/>`,
  stamp: `<path d="M18 27h79v60H18Z" fill="url(#paper)" stroke-dasharray="4 3"/><path d="M28 37h59v40H28Z" fill="#f1dfbd"/><path d="M39 65c10-22 26-27 45-14-10 4-20 10-27 19" fill="#8ea786"/><circle cx="76" cy="45" r="8" fill="none"/><path d="M40 80h32" stroke-dasharray="2 3"/>`,
  ticket: `<path d="M13 35h87v22c-9 4-9 18 0 22v14H13V79c9-4 9-18 0-22V35Z" fill="#f7e7c6"/><path d="M25 48h38m-38 12h55m-55 13h42" stroke="#9a7c69" stroke-dasharray="2 5"/><circle cx="88" cy="54" r="8" fill="none" stroke="#ce9890"/>`,
  lace: `<path d="M22 38h69v47H22Z" fill="#fbf1df" stroke-dasharray="3 4"/><path d="M25 34c5 0 5-8 10-8s5 8 10 8 5-8 10-8 5 8 10 8 5-8 10-8 5 8 10 8 5-8 10-8 5 8 10 8" fill="none" stroke="#d5b8a8"/><path d="M43 57c8-12 21-12 29 0-8 11-21 11-29 0Z" fill="none" stroke="#c8a3a5"/><circle cx="57" cy="57" r="4" fill="#d5b8a8"/>`,
  label: `<path d="M18 30h72l13 20-13 20H18c-8 0-8-40 0-40Z" fill="#e8dcc2"/><path d="M25 42h47m-47 11h62" stroke="#927d6b" stroke-dasharray="1 5"/><path d="M51 72c14-7 25-6 38 2-11 8-24 9-38 2Z" fill="#94a181"/>`,
  postmark: `<circle cx="59" cy="51" r="31" fill="none" stroke="#a87870" stroke-width="3" stroke-dasharray="3 3"/><circle cx="59" cy="51" r="23" fill="none" stroke="#a87870"/><path d="M45 55c9-14 23-14 31 0M57 38v28m-15-14h34" fill="none" stroke="#a87870"/><path d="M87 42h24m-20 10h20m-22 10h18" stroke="#a87870" stroke-width="3"/>`,
  botanical: `<path d="M23 99c19-26 38-49 65-75" fill="none"/><path d="M40 81c-17-1-27-10-28-25 16 0 27 7 34 20M50 64c17-3 28-13 31-28-17 0-29 9-36 23M71 43c-12-10-15-21-8-33 12 5 17 15 15 28M78 36c12-3 20-11 23-23-12 0-20 6-26 16" fill="#8fa27c"/>`,
  butterfly: `<path d="M58 45C41 14 8 22 18 51c6 19 25 19 37 6-9 24-38 37-27 5 6-18 20-19 30-17Z" fill="#c3adc9"/><path d="M60 45c17-31 50-23 40 6-6 19-25 19-37 6 9 24 38 37 27 5-6-18-20-19-30-17Z" fill="#d3b5ca"/><path d="M59 40v45m-10-53 10 9 10-9" fill="none" stroke="#7e695d"/>`,
  frame: `<path d="M23 25h73v68H23Z" fill="url(#paper)" stroke-dasharray="4 3"/><path d="M34 38h51v39H34Z" fill="#dce5d4"/><path d="M41 68c9-21 21-26 37-12-12 4-21 10-29 20" fill="#9aaf8d"/>`,
};

const stickerNames: { id: string; name: string; theme: StickerTheme }[] = [
  { id: "fern", name: "蕨叶轻语", theme: "watercolor" },
  { id: "eucalyptus", name: "尤加利枝", theme: "watercolor" },
  { id: "rose", name: "花园玫瑰", theme: "watercolor" },
  { id: "daisy", name: "白色雏菊", theme: "watercolor" },
  { id: "olive", name: "橄榄小枝", theme: "watercolor" },
  { id: "clover", name: "四叶幸运草", theme: "watercolor" },
  { id: "lily", name: "铃兰低语", theme: "watercolor" },
  { id: "wildflower", name: "野花两朵", theme: "watercolor" },
  { id: "cup", name: "热茶一杯", theme: "daily" },
  { id: "cat", name: "小橘猫", theme: "daily" },
  { id: "toast", name: "奶油吐司", theme: "daily" },
  { id: "moon", name: "晚安月亮", theme: "daily" },
  { id: "cloud", name: "软绵云朵", theme: "daily" },
  { id: "strawberry", name: "甜甜草莓", theme: "daily" },
  { id: "bow", name: "粉色蝴蝶结", theme: "daily" },
  { id: "star", name: "小星星", theme: "daily" },
  { id: "stamp", name: "植物邮票", theme: "vintage" },
  { id: "ticket", name: "旧日车票", theme: "vintage" },
  { id: "lace", name: "蕾丝小笺", theme: "vintage" },
  { id: "label", name: "年代标签", theme: "vintage" },
  { id: "postmark", name: "远方邮戳", theme: "vintage" },
  { id: "botanical", name: "植物标本", theme: "vintage" },
  { id: "butterfly", name: "旧梦蝴蝶", theme: "vintage" },
  { id: "frame", name: "纸片画框", theme: "vintage" },
];

const extraStickerMarkup: Record<string, string> = {
  cake: `<path d="M25 83h77v19H25Z" fill="#F4E0C8"/><path d="M30 55h66v32H30Z" fill="#F4C3C7"/><path d="M35 39h56v20H35Z" fill="#FAEAD1"/><path d="M33 55c8 7 15-6 23 0s14-7 22 0 12-5 18 0M35 72c8 6 15-5 22 0s14-5 21 0 11-5 15 0" fill="none" stroke="#FFFDF7" stroke-width="4"/><path d="M61 39c0-14 8-20 17-24-3 10-3 15 0 22" fill="#A2B58E"/><circle cx="77" cy="17" r="7" fill="#D98284"/>`,
  cookie: `<circle cx="64" cy="64" r="39" fill="#DDAE72"/><circle cx="64" cy="64" r="30" fill="#EBC68F"/><g fill="#8C694E"><circle cx="49" cy="49" r="5"/><circle cx="76" cy="44" r="4"/><circle cx="79" cy="71" r="5"/><circle cx="58" cy="80" r="4"/><circle cx="46" cy="68" r="3"/></g><path d="M31 63c-8 2-12 8-11 14" fill="none" stroke="#DDAE72" stroke-width="5"/>`,
  latte: `<path d="M29 43h61v37c0 17-13 27-31 27S29 97 29 80V43Z" fill="#FAEFDA"/><path d="M89 52c19-6 28 5 24 18-3 11-12 16-25 12" fill="none" stroke="#FAEFDA" stroke-width="9"/><ellipse cx="59" cy="44" rx="31" ry="10" fill="#E2C29C"/><path d="M61 49c-9-10-20-1-11 8l11 9 11-9c9-9-3-18-11-8Z" fill="#F9F5EA"/><path d="M41 28c-5-7 5-10 1-18m31 18c-5-7 5-10 1-18" fill="none" stroke="#FFFDF7" stroke-width="4"/>`,
  croissant: `<path d="M20 76c-8-24 14-46 41-48 6 12 1 23-8 29 17-3 33 7 45 25-20 23-59 25-78-6Z" fill="#E1AE68"/><path d="M29 69c7-4 14-1 18 7m7-18c8-5 17-3 23 4m-36-12c7-5 14-3 19 3" fill="none" stroke="#FFF3D7" stroke-width="4"/>`,
  cherry: `<path d="M64 75C56 38 74 19 97 15M65 76C51 41 35 29 19 32" fill="none" stroke="#789267" stroke-width="5"/><ellipse cx="82" cy="86" rx="21" ry="19" fill="#D77A7E"/><ellipse cx="44" cy="91" rx="19" ry="18" fill="#C86870"/><path d="M86 17c10-13 27-12 32-1-11 11-23 13-32 1Z" fill="#8DA878"/>`,
  lemon: `<ellipse cx="63" cy="68" rx="39" ry="29" transform="rotate(-20 63 68)" fill="#EDD16B"/><path d="M31 52c14 8 27 19 35 36" fill="none" stroke="#F8EAA4" stroke-width="4"/><path d="M78 44c2-17 14-25 30-21-2 15-12 24-28 24" fill="#91A778"/><path d="m22 79 9-5-2 10m70-45-8 5 3-9" fill="#EDD16B"/>`,
  bread: `<path d="M24 62c-5-22 11-38 39-38s44 16 39 38l-4 35H28l-4-35Z" fill="#E1B575"/><path d="M35 67c19-10 39-10 58 0v20H35V67Z" fill="#F0D6A4"/><path d="M43 45 35 58m26-22-8 14m26-13-8 13" fill="none" stroke="#B98759" stroke-width="3"/>`,
  jam: `<path d="M36 31h52v70H36Z" fill="#D9AA72"/><path d="M42 45h40v47H42Z" fill="#EFCAB1"/><path d="M32 23h60v15H32Z" fill="#E5D6C0"/><path d="M34 23h56v15H34Z" fill="#E5D6C0"/><path d="M34 23h56v15H34Z" fill="url(#paper)" opacity=".6"/><path d="M45 58h34v23H45Z" fill="#FFF8EC"/><path d="M51 70c4-11 14-11 22 0" fill="none" stroke="#B57869" stroke-width="3"/><path d="M38 29c10 4 20-3 30 1s15 0 25-2" fill="none" stroke="#C2896F" stroke-width="4"/>`,
  pencil: `<path d="m24 94 7-27 55-53 15 16-53 57-24 7Z" fill="#E7B86C"/><path d="m86 14 15 16 10-10c5-5 4-13-2-17-6-3-11-1-15 3L86 14Z" fill="#E9A7A4"/><path d="m31 67 16 17-5 8-17-17 6-8Z" fill="#F1D1AC"/><path d="M32 84 22 101l18-8" fill="#6F625A"/><path d="m88 27 10 10" fill="none"/>`,
  openBook: `<path d="M12 29c23-6 38-1 52 10v65C50 94 32 91 12 99V29Z" fill="#F3E6D2"/><path d="M116 29c-23-6-39-1-52 10v65c14-10 32-13 52-5V29Z" fill="#F8EFE1"/><path d="M20 47c13-3 25-1 36 5m-36 10c13-3 25-1 36 5m-36 10c13-3 25-1 36 5m16-25c13-6 25-8 36-5m-36 15c13-6 25-8 36-5m-36 15c13-6 25-8 36-5" fill="none" stroke="#B7A696" stroke-width="2"/><path d="M64 39v65" fill="none" stroke="#A79482" stroke-width="2"/>`,
  paperclip: `<path d="M82 22c16 16 10 36-5 51L46 104c-17 18-39-4-22-21l34-34c10-10 24 4 14 14L43 92" fill="none" stroke="#9C9A94" stroke-width="7" stroke-linecap="round"/>`,
  scissors: `<path d="M31 22 91 94M94 22 36 94" fill="none" stroke="#81918B" stroke-width="6" stroke-linecap="round"/><circle cx="27" cy="99" r="13" fill="#D8E4DD" stroke="#72857C" stroke-width="3"/><circle cx="99" cy="99" r="13" fill="#D8E4DD" stroke="#72857C" stroke-width="3"/>`,
  magnifier: `<circle cx="57" cy="52" r="33" fill="#EAF2EE" fill-opacity=".7" stroke="#728A7D" stroke-width="7"/><path d="m80 82 29 29" fill="none" stroke="#708478" stroke-width="10" stroke-linecap="round"/><path d="M39 39c7-9 17-13 28-12" fill="none" stroke="#FFFDF7" stroke-width="5"/>`,
  notebook: `<path d="M26 17h70v91H26Z" fill="#EFDAB8"/><path d="M35 17h61v91H35Z" fill="#FFF7E9"/><path d="M47 17v91" stroke="#B98F84" stroke-width="3"/><path d="M53 42h29m-29 15h24m-24 15h28" stroke="#B5A596" stroke-width="2"/><path d="M94 36h11v16H94m0 16h11v16H94" fill="#D7B2A7"/>`,
  ink: `<path d="M45 26h38v18H45Z" fill="#B5AFA5"/><path d="M39 42h50l7 59H32l7-59Z" fill="#C3B2C8"/><path d="M44 60h40l5 34H39l5-34Z" fill="#6E7697"/><path d="M47 29h34" fill="none" stroke="#FFFDF7" stroke-width="3"/>`,
  pushpin: `<circle cx="64" cy="43" r="28" fill="#D9898C"/><circle cx="55" cy="34" r="7" fill="#F4B7B6"/><path d="M61 69h7l-2 36h-5Z" fill="#91877D"/><path d="M48 68h33" fill="none" stroke="#796F67" stroke-width="4"/>`,
  sunflower: `<path d="M63 111c-1-26 1-48 6-72" fill="none" stroke="#76936D" stroke-width="5"/><g fill="#E6BF59"><ellipse cx="68" cy="11" rx="9" ry="20"/><ellipse cx="95" cy="24" rx="9" ry="20" transform="rotate(52 95 24)"/><ellipse cx="104" cy="51" rx="9" ry="20" transform="rotate(103 104 51)"/><ellipse cx="89" cy="76" rx="9" ry="20" transform="rotate(155 89 76)"/><ellipse cx="62" cy="83" rx="9" ry="20" transform="rotate(210 62 83)"/><ellipse cx="43" cy="63" rx="9" ry="20" transform="rotate(260 43 63)"/><ellipse cx="43" cy="34" rx="9" ry="20" transform="rotate(310 43 34)"/></g><circle cx="70" cy="49" r="22" fill="#9B7450"/><circle cx="64" cy="44" r="2" fill="#674C35"/><circle cx="79" cy="51" r="2" fill="#674C35"/>`,
  mushroom: `<path d="M29 57c5-27 24-42 40-42s37 16 42 42c-26 11-56 11-82 0Z" fill="#DEA4A0"/><path d="M53 55h34l7 46H44l9-46Z" fill="#F5E6D2"/><g fill="#FFF5E8"><circle cx="45" cy="38" r="7"/><circle cx="73" cy="27" r="6"/><circle cx="94" cy="43" r="8"/></g><path d="M56 84c6 1 11 1 16-1" fill="none" stroke="#A77D70" stroke-width="3"/>`,
  raindrop: `<path d="M64 14C53 36 27 55 27 79c0 22 17 36 37 36s37-14 37-36c0-24-26-43-37-65Z" fill="#9EC8D6"/><path d="M42 77c0-9 6-19 16-29" fill="none" stroke="#EEF9F8" stroke-width="5"/>`,
  seashell: `<path d="M69 108C37 106 17 84 20 58c3-22 22-37 45-37 27 0 46 21 45 47-1 24-17 39-41 40Z" fill="#F1D3C3"/><path d="M65 105c-18-34-22-56-9-78m8 79c9-34 22-57 33-64m-31 63c-2-23-10-42-24-56" fill="none" stroke="#C99687" stroke-width="3"/><path d="m41 87 16-24 8-31 9 31 14 23" fill="none" stroke="#FFF7EC" stroke-width="2"/>`,
  acorn: `<path d="M35 47c4-25 24-32 43-20 15 9 21 26 17 43-7 28-51 32-65 1-3-8-2-17 5-24Z" fill="#B98D5E"/><path d="M27 44c8-22 29-31 49-20 14 8 23 23 22 37-24 9-47 8-71-17Z" fill="#806146"/><path d="M61 26c-3-13 7-19 17-20-1 12-7 18-17 20Z" fill="#84986E"/><path d="M46 51c13 6 25 7 39 2" fill="none" stroke="#E9D1AA" stroke-width="3"/>`,
  sprout: `<path d="M63 111c-1-30-1-53 4-74" fill="none" stroke="#6F8B69" stroke-width="6"/><path d="M64 67C34 66 21 48 24 25c29 1 45 17 48 42M65 68c27-7 39-25 35-48-27 3-40 21-43 44" fill="#91AF7D"/><path d="M66 67c-18-2-30-12-34-28 17-1 30 7 38 23" fill="#B7C99B"/>`,
  pinecone: `<path d="M62 112c-21-8-34-25-32-48 2-27 17-46 34-50 17 4 32 23 34 50 2 23-14 40-36 48Z" fill="#9F7958"/><g fill="none" stroke="#E0C6A6" stroke-width="3"><path d="M42 41c10 8 27 8 38 0M35 58c14 9 37 9 51 0M33 76c15 10 39 10 56 0M39 94c12 8 31 8 43 0M52 28c4 9 18 9 22 0"/></g>`,
  snowCrystal: `<path d="M63 12v91M25 32l76 52M101 32 25 84M50 19l14 18 14-18M50 98l14-18 14 18M22 50l23 9-16 15M104 50 81 59l16 15M28 70l21-10 2 22M100 70 79 60l-2 22" fill="none" stroke="#73A6BA" stroke-width="4" stroke-linecap="round"/>`,
  planet: `<circle cx="60" cy="56" r="31" fill="#AAB9D2"/><path d="M39 41c9-10 22-15 35-11 8 3 15 10 18 18-16-1-34-2-53-7Z" fill="#D6D0C0" opacity=".75"/><path d="M42 74c11-5 23-6 35-1" fill="none" stroke="#8194B1" stroke-width="4"/><path d="M11 76c21-21 75-35 104-14 7 5-7 16-25 24" fill="none" stroke="#D0A47B" stroke-width="6" stroke-linecap="round"/>`,
  sleepyMoon: `<path d="M78 21c-31 6-44 44-18 65 15 12 34 11 47 2-13 24-45 32-66 13C18 80 23 44 47 28c10-7 21-9 31-7Z" fill="#E9CF86"/><path d="M44 53c5 4 11 4 16 0M67 53c4 3 8 3 12 0M56 67c6 4 12 4 18-1" fill="none" stroke="#8A7557" stroke-width="2"/>`,
  crystal: `<path d="m61 14 29 30-14 60-22 6-21-40 28-56Z" fill="#C8BBD6"/><path d="m61 14-7 60 22 30m-29-90 24 48 19-18" fill="none" stroke="#F8F3ED" stroke-width="3"/><path d="m54 74-21-4 28 40" fill="#A99BC1"/>`,
  comet: `<path d="M76 31c9-10 20-17 34-20-4 14-11 25-22 34L76 31Z" fill="#EACF88"/><circle cx="53" cy="55" r="20" fill="#F1D994"/><path d="M39 66 8 89l21-2-11 20 35-31" fill="#C7DAD3"/>`,
  cloudStar: `<path d="M27 79c-17-1-19-23-3-27 1-17 23-23 35-10 17-6 32 9 26 24 13 6 10 25-3 28H39c-7 0-10-5-12-15Z" fill="#E9F3F0"/><path d="m63 48 5 11 12 2-9 8 3 12-11-6-10 6 2-12-8-9 12-1 4-11Z" fill="#E5C568"/>`,
  constellation: `<g fill="#D6AF68"><circle cx="23" cy="31" r="4"/><circle cx="51" cy="18" r="3"/><circle cx="69" cy="47" r="4"/><circle cx="45" cy="70" r="3"/><circle cx="88" cy="86" r="4"/><circle cx="104" cy="54" r="2.5"/></g><path d="m23 31 28-13 18 29-24 23 43 16 16-32" fill="none" stroke="#A8A58F" stroke-width="2" stroke-dasharray="3 4"/>`,
  aurora: `<path d="M14 103c23-43 69-75 101-59-26 9-50 27-63 50" fill="#BAD9D1"/><path d="M27 102c23-37 59-61 91-56-23 9-45 28-55 50" fill="#DFC1CD"/><path d="M43 99c17-28 41-45 69-48-20 10-36 27-44 45" fill="#EDD58F"/><path d="M12 105c31 4 70 5 105 0" fill="none" stroke="#FFFDF7" stroke-width="3"/>`,
  ufo: `<ellipse cx="63" cy="64" rx="47" ry="19" fill="#9DC0BE"/><path d="M39 54c3-24 14-35 25-35 15 0 25 13 27 34-17 8-35 8-52 1Z" fill="#DCEAE7"/><path d="M47 47c8-8 24-8 32 0" fill="none" stroke="#78A1A2" stroke-width="3"/><g fill="#E7C76D"><circle cx="37" cy="67" r="5"/><circle cx="63" cy="73" r="5"/><circle cx="90" cy="67" r="5"/></g><path d="M35 83 25 105m28-19 2 23m33-28 13 20" fill="none" stroke="#C8D8CD" stroke-width="5" stroke-linecap="round"/>`,
};

const extraStickerNames: { id: string; name: string; theme: StickerTheme }[] = [
  { id: "cake", name: "奶油小蛋糕", theme: "food" },
  { id: "cookie", name: "巧克力曲奇", theme: "food" },
  { id: "latte", name: "爱心拿铁", theme: "food" },
  { id: "croissant", name: "晨光可颂", theme: "food" },
  { id: "cherry", name: "双生樱桃", theme: "food" },
  { id: "lemon", name: "清爽柠檬", theme: "food" },
  { id: "bread", name: "手作面包", theme: "food" },
  { id: "jam", name: "草莓果酱", theme: "food" },
  { id: "pencil", name: "慢慢写字", theme: "stationery" },
  { id: "openBook", name: "摊开的书", theme: "stationery" },
  { id: "paperclip", name: "银色回形针", theme: "stationery" },
  { id: "scissors", name: "剪下一角", theme: "stationery" },
  { id: "magnifier", name: "小小放大镜", theme: "stationery" },
  { id: "notebook", name: "布面笔记本", theme: "stationery" },
  { id: "ink", name: "夜色墨水", theme: "stationery" },
  { id: "pushpin", name: "莓红图钉", theme: "stationery" },
  { id: "sunflower", name: "向日葵", theme: "nature" },
  { id: "mushroom", name: "森林蘑菇", theme: "nature" },
  { id: "raindrop", name: "一滴春雨", theme: "nature" },
  { id: "seashell", name: "海边贝壳", theme: "nature" },
  { id: "acorn", name: "秋日橡果", theme: "nature" },
  { id: "sprout", name: "新芽", theme: "nature" },
  { id: "pinecone", name: "松果", theme: "nature" },
  { id: "snowCrystal", name: "六角冰晶", theme: "nature" },
  { id: "planet", name: "环游行星", theme: "dreamy" },
  { id: "sleepyMoon", name: "困倦月亮", theme: "dreamy" },
  { id: "crystal", name: "梦之水晶", theme: "dreamy" },
  { id: "comet", name: "晚风彗星", theme: "dreamy" },
  { id: "cloudStar", name: "云上星星", theme: "dreamy" },
  { id: "constellation", name: "星座连线", theme: "dreamy" },
  { id: "aurora", name: "极光丝带", theme: "dreamy" },
  { id: "ufo", name: "迷你飞碟", theme: "dreamy" },
];

const stickerAsset = (sticker: { id: string; name: string; theme: StickerTheme }): JournalAsset => ({
  ...sticker,
  kind: "sticker",
  width: 126,
  height: 126,
  src: makeSvg(
    `${shadowDefs}<g filter="url(#s)" stroke="#fffdf8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" paint-order="stroke fill">${stickerMarkup[sticker.id] ?? extraStickerMarkup[sticker.id]}</g>`,
    126,
    126,
  ),
});

export const STICKERS: JournalAsset[] = [...stickerNames, ...extraStickerNames].map(stickerAsset);

const tapes: { id: string; name: string; src: string }[] = [
  {
    id: "tape-mint-grid",
    name: "薄荷格纹",
    src: makeSvg(
      `<defs><pattern id="g" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M0 1h22M1 0v22" stroke="#739486" stroke-opacity=".25"/></pattern></defs><path d="M4 8 14 4h218l-8 6 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7-8 1H15L4 118Z" fill="#D9ECE4" fill-opacity=".74"/><path d="M4 8 14 4h218l-8 6 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7 8 7-8 7-8 1H15L4 118Z" fill="url(#g)"/>`,
      236,
      122,
    ),
  },
  {
    id: "tape-pink-stripe",
    name: "桃粉斜纹",
    src: makeSvg(
      `<defs><pattern id="s" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><path d="M0 0h9v20H0Z" fill="#fff7f3" opacity=".4"/></pattern></defs><path d="M9 5h220l6 9-6 10 6 9-6 10 6 9-6 10 6 9-6 10 6 9-6 10 6 9-6 9H10l-6-9 6-9-6-10 6-9-6-10 6-9-6-10 6-9-6-10 6-9-6-10 6-9Z" fill="#EAB5B8" opacity=".76"/><path d="M9 5h220l6 9-6 10 6 9-6 10 6 9-6 10 6 9-6 10 6 9-6 10 6 9-6 9H10l-6-9 6-9-6-10 6-9-6-10 6-9-6-10 6-9-6-10 6-9-6-10 6-9Z" fill="url(#s)"/>`,
      236,
      122,
    ),
  },
  {
    id: "tape-cloud",
    name: "奶油云朵",
    src: makeSvg(
      `<pattern id="d" width="32" height="28" patternUnits="userSpaceOnUse"><circle cx="6" cy="7" r="2" fill="#B49F8F" opacity=".32"/><circle cx="24" cy="20" r="1.5" fill="#B49F8F" opacity=".25"/></pattern><path d="M5 6h226l-5 9 5 9-5 9 5 9-5 9 5 9-5 9 5 9-5 9 5 9-5 9 5 9-5 9H5l5-9-5-9 5-9-5-9 5-9-5-9 5-9-5-9 5-9-5-9 5-9Z" fill="#F8EDD8" opacity=".85"/><rect x="5" y="6" width="226" height="112" fill="url(#d)"/><path d="M42 52c7-18 31-18 39 0 16-9 35 3 30 16-2 10-15 14-27 14H49c-17 0-21-20-7-30Z" fill="#fffaf0" opacity=".7"/>`,
      236,
      122,
    ),
  },
  {
    id: "tape-floral",
    name: "花瓣和纸",
    src: makeSvg(
      `<path d="M8 6h220l-4 8 4 9-4 9 4 9-4 9 4 9-4 9 4 9-4 9 4 9-4 9 4 9-4 9H8l4-9-4-9 4-9-4-9 4-9-4-9 4-9-4-9 4-9-4-9 4-9Z" fill="#F5E3D9" opacity=".82"/><g fill="#DDA6A3" opacity=".72"><circle cx="43" cy="38" r="8"/><circle cx="57" cy="48" r="8"/><circle cx="40" cy="61" r="7"/><circle cx="112" cy="82" r="8"/><circle cx="125" cy="69" r="7"/><circle cx="196" cy="36" r="8"/><circle cx="207" cy="49" r="7"/></g><g fill="#9BAD87" opacity=".68"><path d="M58 80c-18-8-26-21-20-35 17 3 28 15 29 31Z"/><path d="M181 82c20-3 32-13 34-29-17-3-32 7-43 25Z"/></g>`,
      236,
      122,
    ),
  },
  {
    id: "tape-paper",
    name: "旧报纸纹",
    src: makeSvg(
      `<defs><pattern id="p" width="21" height="18" patternUnits="userSpaceOnUse"><path d="M0 18h21" stroke="#8B7968" stroke-opacity=".18"/></pattern></defs><path d="M2 5h232l-6 9 6 9-6 9 6 9-6 9 6 9-6 9 6 9-6 9 6 9-6 9H2l6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9Z" fill="#E6D6BC" opacity=".8"/><rect x="3" y="5" width="230" height="112" fill="url(#p)"/><path d="M26 38h62m-62 13h79m-79 12h68" stroke="#7F6B5E" opacity=".32" stroke-width="2"/>`,
      236,
      122,
    ),
  },
  {
    id: "tape-sage-dots",
    name: "鼠尾草波点",
    src: makeSvg(
      `<pattern id="dot" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#637F69" opacity=".38"/><circle cx="21" cy="21" r="2" fill="#637F69" opacity=".25"/></pattern><path d="M8 5h220l5 9-5 9 5 9-5 9 5 9-5 9 5 9-5 9 5 9-5 9 5 9-5 9H8l-5-9 5-9-5-9 5-9-5-9 5-9-5-9 5-9-5-9 5-9-5-9Z" fill="#D2E0CB" opacity=".8"/><rect x="8" y="5" width="220" height="112" fill="url(#dot)"/>`,
      236,
      122,
    ),
  },
  {
    id: "tape-lavender",
    name: "紫雾和纸",
    src: makeSvg(
      `<path d="M5 7h226l-6 9 6 9-6 9 6 9-6 9 6 9-6 9 6 9-6 9 6 9-6 9H5l6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9-6-9 6-9Z" fill="#DCCEDE" opacity=".8"/><g fill="none" stroke="#fffaf4" stroke-opacity=".5"><path d="M28 22c26 18 52-10 77 8s53 4 78-7"/><path d="M30 48c31 15 63-11 91 4s45 4 74-8"/><path d="M29 76c26 16 54-10 81 4s61 6 82-10"/></g>`,
      236,
      122,
    ),
  },
  {
    id: "tape-caramel",
    name: "焦糖纸带",
    src: makeSvg(
      `<pattern id="line" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 16 16 0" stroke="#FFF7E8" stroke-opacity=".25"/></pattern><path d="M4 6h228l-7 8 7 9-7 9 7 9-7 9 7 9-7 9 7 9-7 9 7 9-7 9H4l7-9-7-9 7-9-7-9 7-9-7-9 7-9-7-9 7-9-7-9 7-9Z" fill="#B99873" opacity=".72"/><rect x="4" y="6" width="228" height="112" fill="url(#line)"/>`,
      236,
      122,
    ),
  },
];

export const TAPES: JournalAsset[] = tapes.map((tape) => ({
  ...tape,
  kind: "tape",
  theme: "basic",
  width: 210,
  height: 64,
}));

export const FRAMES: JournalAsset[] = [
  {
    id: "frame-polaroid",
    name: "拍立得相框",
    kind: "frame",
    theme: "basic",
    frameStyle: "polaroid",
    width: 264,
    height: 294,
    src: makeSvg(
      `${shadowDefs}<rect x="8" y="8" width="248" height="278" rx="2" fill="#fffdf6" filter="url(#s)"/><rect x="23" y="24" width="218" height="218" fill="#d5dfd0"/><path d="M34 205c41-70 100-77 170-15l27 52H34v-37Z" fill="#8fa786"/><circle cx="190" cy="65" r="18" fill="#f4db9b"/><path d="M50 260h110" stroke="#d7c9b9" stroke-width="4" stroke-dasharray="3 6"/>`,
      264,
      294,
    ),
  },
  {
    id: "frame-rounded",
    name: "奶油圆角",
    kind: "frame",
    theme: "basic",
    frameStyle: "rounded",
    width: 264,
    height: 294,
    src: makeSvg(
      `${shadowDefs}<rect x="9" y="9" width="246" height="276" rx="22" fill="#fffdf7" filter="url(#s)"/><rect x="24" y="24" width="216" height="228" rx="15" fill="#d9e8e1"/><path d="M36 215c35-64 81-72 140-23l52 60H36v-37Z" fill="#8ca68e"/><circle cx="180" cy="71" r="19" fill="#f1cc92"/>`,
      264,
      294,
    ),
  },
  {
    id: "frame-film",
    name: "复古胶片",
    kind: "frame",
    theme: "basic",
    frameStyle: "film",
    width: 280,
    height: 310,
    src: makeSvg(
      `${shadowDefs}<rect x="7" y="7" width="266" height="296" rx="4" fill="#47413d" filter="url(#s)"/><rect x="35" y="35" width="210" height="213" fill="#cec5b5"/><path d="M47 226c37-72 100-77 173-16l12 38H47v-22Z" fill="#788f7b"/><circle cx="181" cy="81" r="23" fill="#e7c788"/><g fill="#d8c8b4"><rect x="14" y="20" width="10" height="7"/><rect x="14" y="42" width="10" height="7"/><rect x="14" y="64" width="10" height="7"/><rect x="14" y="86" width="10" height="7"/><rect x="14" y="108" width="10" height="7"/><rect x="14" y="130" width="10" height="7"/><rect x="14" y="152" width="10" height="7"/><rect x="14" y="174" width="10" height="7"/><rect x="256" y="20" width="10" height="7"/><rect x="256" y="42" width="10" height="7"/><rect x="256" y="64" width="10" height="7"/><rect x="256" y="86" width="10" height="7"/><rect x="256" y="108" width="10" height="7"/><rect x="256" y="130" width="10" height="7"/><rect x="256" y="152" width="10" height="7"/><rect x="256" y="174" width="10" height="7"/></g>`,
      280,
      310,
    ),
  },
  {
    id: "frame-torn",
    name: "手撕纸边",
    kind: "frame",
    theme: "basic",
    frameStyle: "torn",
    width: 272,
    height: 300,
    src: makeSvg(
      `${shadowDefs}<path d="M17 12 251 9l6 276-19 7-21-4-18 5-28-4-20 4-24-4-22 3-16-4-24 2-24-4-25 3-13-7 5-22-7-18 6-26-5-17 6-24-4-22 6-28-5-20 9-24Z" fill="#fffaf0" filter="url(#s)"/><path d="M34 35 238 31l4 218-205 5 1-219Z" fill="#d2e0d6"/><path d="M44 223c37-69 105-78 185-24l12 44H44v-20Z" fill="#819d83"/><circle cx="190" cy="77" r="22" fill="#f0cf8a"/>`,
      272,
      300,
    ),
  },
];

export const NOTES: JournalAsset[] = [
  {
    id: "note-cream",
    name: "奶油便签",
    kind: "note",
    theme: "basic",
    width: 220,
    height: 170,
    src: makeSvg(
      `${shadowDefs}<path d="M3 8 214 2l4 156-24 5-22-4-21 5-23-5-19 5-22-4-22 4-21-5-21 4-22-4Z" fill="#fff4d9" filter="url(#s)"/><path d="M20 29h170m-170 24h142m-142 24h157" stroke="#b49e8c" stroke-opacity=".27" stroke-width="2"/>`,
      220,
      170,
    ),
  },
  {
    id: "note-blush",
    name: "樱粉便签",
    kind: "note",
    theme: "basic",
    width: 220,
    height: 170,
    src: makeSvg(
      `${shadowDefs}<path d="M4 5h211l1 157-22-5-24 6-19-6-25 5-20-4-27 5-19-6-27 4-25-6-24 5Z" fill="#F5D9DB" filter="url(#s)"/><path d="M20 32h176m-176 25h145m-176 25h162" stroke="#9A7B77" stroke-opacity=".2" stroke-width="2"/>`,
      220,
      170,
    ),
  },
  {
    id: "note-sage",
    name: "青叶便签",
    kind: "note",
    theme: "basic",
    width: 220,
    height: 170,
    src: makeSvg(
      `${shadowDefs}<path d="m3 9 210-5 4 154-23 7-22-6-25 5-19-4-25 5-21-5-22 4-25-4-25 5-9-3Z" fill="#D9E7D7" filter="url(#s)"/><path d="M164 21c-14 13-19 29-15 49 19-4 28-16 27-38m-37 25c-15 1-24-6-30-19 15-2 25 2 32 12" fill="none" stroke="#728E72" opacity=".5"/>`,
      220,
      170,
    ),
  },
  {
    id: "note-lavender",
    name: "雾紫便签",
    kind: "note",
    theme: "basic",
    width: 220,
    height: 170,
    src: makeSvg(
      `${shadowDefs}<path d="M5 6h208l3 157-26-4-21 5-22-5-26 4-19-4-24 5-20-5-23 4-22-5-20 5Z" fill="#E4D9E8" filter="url(#s)"/><path d="M20 31h176m-176 27h143" stroke="#88738F" stroke-opacity=".18" stroke-width="2"/>`,
      220,
      170,
    ),
  },
];

export const BACKGROUNDS: JournalAsset[] = [
  { id: "bg-soft-paper", name: "素纸", kind: "background", theme: "basic", width: 120, height: 160, src: makeSvg(`<rect width="120" height="160" fill="#F9F4EA"/><path d="M0 24h120M0 68h120M0 112h120" stroke="#D6C9BA" stroke-opacity=".12"/>`, 120, 160) },
  { id: "bg-grid", name: "细格页", kind: "background", theme: "basic", width: 120, height: 160, src: makeSvg(`<defs><pattern id="g" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12h12M12 0v12" stroke="#7F9B91" stroke-opacity=".2"/></pattern></defs><rect width="120" height="160" fill="#F5F2E8"/><rect width="120" height="160" fill="url(#g)"/>`, 120, 160) },
  { id: "bg-dot", name: "米白点阵", kind: "background", theme: "basic", width: 120, height: 160, src: makeSvg(`<defs><pattern id="d" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#9D8979" opacity=".26"/></pattern></defs><rect width="120" height="160" fill="#F7F0E2"/><rect width="120" height="160" fill="url(#d)"/>`, 120, 160) },
  { id: "bg-flower", name: "落花纸", kind: "background", theme: "vintage", width: 120, height: 160, src: makeSvg(`<rect width="120" height="160" fill="#F5ECE0"/><g fill="#DDB1AD" opacity=".32"><circle cx="16" cy="25" r="5"/><circle cx="101" cy="67" r="4"/><circle cx="33" cy="132" r="6"/><circle cx="82" cy="143" r="3"/></g><g fill="none" stroke="#8CA189" opacity=".25"><path d="M0 150c30-35 52-20 120-67M0 89c37 9 61-25 120-40"/></g>`, 120, 160) },
  { id: "bg-coffee", name: "咖啡渍页", kind: "background", theme: "vintage", width: 120, height: 160, src: makeSvg(`<rect width="120" height="160" fill="#F6EFDF"/><circle cx="97" cy="29" r="24" fill="none" stroke="#A67C5E" stroke-opacity=".18" stroke-width="4"/><circle cx="97" cy="29" r="17" fill="#B88C6A" fill-opacity=".06"/><path d="M12 135c26-24 52-14 72-48s27-38 42-31" fill="none" stroke="#B49A83" stroke-opacity=".14"/>`, 120, 160) },
  { id: "bg-night", name: "星夜纸", kind: "background", theme: "vintage", width: 120, height: 160, src: makeSvg(`<rect width="120" height="160" fill="#E1E4DD"/><g fill="#7D8C94" opacity=".35"><circle cx="19" cy="23" r="1.2"/><circle cx="93" cy="18" r="2"/><circle cx="65" cy="43" r="1"/><circle cx="32" cy="76" r="1.5"/><circle cx="101" cy="87" r="1"/><circle cx="51" cy="118" r="2"/><circle cx="84" cy="145" r="1.2"/></g>`, 120, 160) },
];

export const ASSETS: JournalAsset[] = [...STICKERS, ...TAPES, ...FRAMES, ...NOTES, ...BACKGROUNDS];

export const ASSET_BY_ID = new Map(ASSETS.map((asset) => [asset.id, asset]));

export const STICKER_THEME_LABELS: Record<StickerTheme, string> = {
  watercolor: "水彩植物",
  daily: "软萌日常",
  vintage: "复古纸片",
  food: "甜点食物",
  stationery: "文具手作",
  nature: "四季草木",
  dreamy: "梦幻星空",
  basic: "手账基础",
};
