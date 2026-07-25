const COLORS = [
  ['black', '#000000'], ['red', '#ff0000'], ['green', '#00ff00'], ['yellow', '#ffff00'],
  ['blue', '#0000ff'], ['magenta', '#ff00ff'], ['cyan', '#00ffff'], ['white', '#ffffff'],
];

export default { title: 'Foundations/Overview' };

export const Palette = () => {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:0;font-family:Space Mono,monospace';
  COLORS.forEach(([name, hex]) => {
    const sw = document.createElement('div');
    sw.style.cssText = 'width:120px;height:120px;background:' + hex + ';color:' + (name==='white'||name==='yellow'||name==='cyan'||name==='green'?'#000':'#fff') + ';display:flex;flex-direction:column;justify-content:flex-end;padding:8px;font-size:12px;text-transform:uppercase';
    sw.innerHTML = '<strong>' + name + '</strong><span>' + hex + '</span>';
    wrap.appendChild(sw);
  });
  return wrap;
};

export const Type = () => {
  const d = document.createElement('div');
  d.style.cssText = 'color:#fff;font-family:Space Mono,monospace';
  d.innerHTML = '<div style="font-family:VT323,monospace;font-size:72px;line-height:1">P100 CEEFAX</div>' +
    '<div style="font-size:19px;margin-top:16px">Space Mono 19px body — the reading size.</div>' +
    '<div style="font-size:15px;color:#b3ffb3">Space Mono 15px small.</div>';
  return d;
};
