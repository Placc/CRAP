(function() {
  const u = document.location.search.slice(
    document.location.search.indexOf("url=") + "url=".length,
    document.location.search.indexOf("&")
  );
  const i = document.createElement("h4");
  i.innerHTML = `Resource integrity status information for: ${u} (${new Date(
    Date.now()
  ).toLocaleString()})`;
  const p = document.createElement("pre");
  const c = document.location.search.slice(
    document.location.search.indexOf("content=") + "content=".length,
    document.location.search.lastIndexOf("&")
  );
  const o = JSON.parse(unescape(c));
  p.innerHTML = JSON.stringify(o, undefined, 2);
  const mp = document.createElement("pre");
  const m = document.location.search.slice(
    document.location.search.indexOf("mappings=") + "mappings=".length
  );
  const mo = JSON.parse(unescape(m)) as string[][];
  mp.innerHTML = `Resolved resource mappings:\n[\n${mo
    .map(mapping => `  ${mapping[0]} -> ${mapping[1]}`)
    .join(",\n")}\n]`;
  document.body.appendChild(i);
  document.body.appendChild(p);
  document.body.appendChild(mp);
})();
