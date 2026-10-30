d3.json("all.json").then(paises => {

  // Cada elemento del JSON tiene un campo "region" (Europe, Asia, Africa...).
  // filter() deja solo los de Europa.
  const europa = paises.filter(p => p.region === "Europe");

  // d3.group agrupa por subregiones y devuelve sus naciones por cada subregión
  // { "Northern Europe" => [países...], "Southern Europe" => [...], ... }
  const grupos = d3.group(europa, p => p["sub-region"]);

  // 2. Convertir a jerarquía {name, children}
  // Nivel 0: Europa (raíz)
  // Nivel 1: las subregiones
  // Nivel 2: los países (hojas, sin children)
  const datos = {
    name: "Europe",
    // Array.from(Map, función) recorre cada par [clave, valor] del Map
    // y lo transforma en un objeto del árbol.
    children: Array.from(grupos, ([sub, lista]) => ({
      name: sub,
      children: lista.map(p => ({ name: p.name }))
    }))
  };

  // 3. Layout de dendrograma (horizontal)
  // Construye la jerarquía a partir de la agrupación generada antes
  const root = d3.hierarchy(datos);

  // Altura total: 18 px por cada hoja, para que los nombres no se pisen.
  const alto = root.leaves().length * 18;

  d3.cluster().size([alto, 400])(root);

  // 4. Color: un color por subregión
  // Asigna un color distinto a cada nombre de subregión
  const color = d3.scaleOrdinal(d3.schemeTableau10);
  const colorNodo = d => {
    if (d.depth === 0) return "#333";                       // raíz
    const subregion = d.depth === 1 ? d : d.parent;         // subregión del nodo
    return color(subregion.data.name);
  };

  // 5. Dibujar
  // Crea el SVG dentro del <div id="chart"> y un grupo <g> interior.
  // El translate(100,10) deja margen a la izquierda para el texto de la raíz.
  const svg = d3.select("#chart").append("svg")
      .attr("width", 900).attr("height", alto + 20)
    .append("g").attr("transform", "translate(100,10)");

  // ENLACES (las líneas entre nodos).
  svg.selectAll(".link").data(root.links()).join("path")
      .attr("class", "link")
      .attr("d", d3.link(d3.curveBumpX).x(d => d.y).y(d => d.x))
      .style("stroke", d => colorNodo(d.target));

  // NODOS: un grupo <g> por cada nodo (raíz, subregiones y países),
  const nodo = svg.selectAll(".nodo").data(root.descendants()).join("g")
      .attr("class", "nodo")
      .attr("transform", d => `translate(${d.y},${d.x})`);

  // Círculo de cada nodo, con el color de su subregión.
  nodo.append("circle")
      .attr("r", 5)
      .style("fill", colorNodo);

  // Etiqueta de cada nodo:
  // - si tiene hijos (raíz y subregiones), el texto va a la izquierda
  // - si es una hoja, el texto va a la derecha y alineado al inicio.
  nodo.append("text")
      .attr("x", d => d.children ? -8 : 8)
      .attr("dy", "0.32em")
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name);
});