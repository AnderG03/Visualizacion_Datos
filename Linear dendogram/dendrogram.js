d3.json("all.json").then(paises => {

  // 1. Quedarse con Europa y agrupar por subregión
  const europa = paises.filter(p => p.region === "Europe");
  const grupos = d3.group(europa, p => p["sub-region"]);

  // 2. Convertir a jerarquía {name, children}
  const datos = {
    name: "Europa",
    children: Array.from(grupos, ([sub, lista]) => ({
      name: sub,
      children: lista.map(p => ({ name: p.name }))
    }))
  };

  // 3. Layout de dendrograma (horizontal)
  const root = d3.hierarchy(datos);
  const alto = root.leaves().length * 18;
  d3.cluster().size([alto, 400])(root);

  // 4. Color: un color por subregión
  const color = d3.scaleOrdinal(d3.schemeTableau10);
  const colorNodo = d => {
    if (d.depth === 0) return "#333";                       // raíz
    const subregion = d.depth === 1 ? d : d.parent;         // subregión del nodo
    return color(subregion.data.name);
  };

  // 5. Dibujar
  const svg = d3.select("#chart").append("svg")
      .attr("width", 900).attr("height", alto + 20)
    .append("g").attr("transform", "translate(100,10)");

  svg.selectAll(".link").data(root.links()).join("path")
      .attr("class", "link")
      .attr("d", d3.link(d3.curveBumpX).x(d => d.y).y(d => d.x))
      .style("stroke", d => colorNodo(d.target));

  const nodo = svg.selectAll(".nodo").data(root.descendants()).join("g")
      .attr("class", "nodo")
      .attr("transform", d => `translate(${d.y},${d.x})`);

  nodo.append("circle")
      .attr("r", 5)
      .style("fill", colorNodo);

  nodo.append("text")
      .attr("x", d => d.children ? -8 : 8)
      .attr("dy", "0.32em")
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name);
});