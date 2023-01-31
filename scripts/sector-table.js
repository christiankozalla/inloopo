// mousover keep color and dim the ones that dont have the class name of the one selected; mousover remove class dim, get class name

class SectorTable extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  cells;
  table;

  async connectedCallback() {
    const data = await fetch('/data/sector-performance.json').then(res => res.json());
    const template = document.createElement("template");
    template.innerHTML = this.render(data.sectors);
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.cells = this.shadowRoot.querySelectorAll('td');
    this.table = this.shadowRoot.querySelector('table');
    this.table.addEventListener('mouseout', (_event) => {
      this.table.classList.remove('active');
    });
    this.table.addEventListener('mouseover', (event) => {
      this.table.classList.add('active');
      this.cells.forEach(cell => cell.classList.remove('active'));
      const id = event.target.dataset.id;
      this.shadowRoot.querySelectorAll(`[data-id=${id}]`).forEach(cell => cell.classList.add('active'));
    });
  }
  
  colors = {
    CONS: 'rgb(113,77,61)',
    UTIL: 'rgb(214,27,96)',
    INFT: 'rgb(254,140,0)',
    REAL: 'rgb(240,133,239)',
    FINL: 'rgb(29,135,237)',
    SP: 'rgb(232,241,238)',
    COND: 'rgb(229,58,48)',
    TELS: 'rgb(20,182,195)',
    HLTH: 'rgb(147,33,170)',
    INDU: 'rgb(84,111,122)',
    ENRS: 'rgb(125,180,63)',
    MATR: 'rgb(231,196,30)'
  }

  styles = `
    table {
      border-collapse: collapse;
      table-layout: fixed;
      border-spacing: 0px;
      width: 95vw;
      margin: 0 auto;
      max-width: 1400px;
      cursor: pointer;
    }

    td, th {
      color: white;
      padding: 4px 0;
      text-align: center;
      font-weight: 700;
    }

    th {
      background-color: grey;
    }

    td[data-id="SP"] {
      color: black;
    }

    table.active td:not(.active) {
      filter: grayscale(100%);
    }
    table.active td.active {
      filter: saturate(200%);
    }

    ${Object.entries(this.colors).map(([id, color]) => `td[data-id=${id}] { background-color: ${color}; }`).join('')}
  `;

  render(sectors) {
    if (!Array.isArray(sectors)) return "<div></div>";
    const years = sectors[0].performance.map(({ year }) => year);
    // example { 2008: { id, year, change }[] }
    const sectorsByYear = {};

    for (let i = 0; i < years.length; i++) {
      sectorsByYear[years[i]] = [...sectors.map((sector) => ({ ...sector.performance.find(item => item.year === years[i]), id: sector.id }))].sort((a, b) => a.change < b.change ? 1 : -1);
    }

    const rows = [];
    for (let si = 0; si < sectors.length; si++) {
      const row = [];
      for (let yi = 0; yi < years.length; yi++) {
        row.push(sectorsByYear[years[yi]][si]);
      }
      rows.push(row);
    }

    return `
      <style>
        ${this.styles}
      </style>
      <table>
        <thead>
          ${this.header(years, true)}
        </thead>
        <tbody>
          ${rows.map((row) => this.row(row)).join('')}
        </tbody>
      </table>
    `;
  }

  header(items) {
    return `<tr>${items.map(item => `<th scope="col">${item}</th>`).join('')}</tr>`;
  }

  row(items) {
    return `<tr>${items.map((item) => `<td data-id=${item.id}>${item.id}<br>${(item.change * 100).toFixed(1)} %</td>`).join('')}</tr>`;
  }
}

customElements.define('sector-table', SectorTable);