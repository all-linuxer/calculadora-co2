(function(){
  // Emission factors in kg CO2 per passenger-km
  const FACTORS = {
    car: 0.192,
    bus: 0.05,
    train: 0.041,
    plane: 0.254
  };

  const transportInfo = [
    { id: 'car', label: 'Carro (padrão)', factor: FACTORS.car, img: 'assets/car.svg' },
    { id: 'car_shared', label: 'Carona / Compartilhado', factor: 0.096, img: 'assets/car_shared.svg' },
    { id: 'electric_car', label: 'Carro elétrico', factor: 0.075, img: 'assets/electric_car.svg' },
    { id: 'motorcycle', label: 'Motocicleta', factor: 0.103, img: 'assets/motorcycle.svg' },
    { id: 'bus', label: 'Ônibus', factor: FACTORS.bus, img: 'assets/bus.svg' },
    { id: 'train', label: 'Trem/ Metrô', factor: FACTORS.train, img: 'assets/train.svg' },
    { id: 'tram', label: 'VLT / Tram', factor: 0.03, img: 'assets/tram.svg' },
    { id: 'bicycle', label: 'Bicicleta', factor: 0.0, img: 'assets/bicycle.svg' },
    { id: 'ferry', label: 'Barco / Ferry', factor: 0.089, img: 'assets/ferry.svg' },
    { id: 'plane', label: 'Avião', factor: FACTORS.plane, img: 'assets/plane.svg' }
  ];

  // DOM elements
  const originEl = document.getElementById('origin');
  const destEl = document.getElementById('destination');
  const distanceValueEl = document.getElementById('distanceValue');
  const routeNoticeEl = document.getElementById('routeNotice');
  const manualDistanceEl = document.getElementById('manualDistance');
  const manualDistanceWrap = document.querySelector('.manual-distance');
  const transportsEl = document.getElementById('transports');
  const calculateBtn = document.getElementById('calculate');
  const clearBtn = document.getElementById('clear');
  const resultContent = document.getElementById('resultContent');

  let selectedTransport = null;
  let currentDistance = null;

  // Populate selects
  function populateSelects(){
    const capitals = window.CAPITAIS || [];
    capitals.sort((a,b)=>a.localeCompare(b,'pt-BR'));
    capitals.forEach(cap =>{
      const o = document.createElement('option'); o.value = cap; o.textContent = cap;
      originEl.appendChild(o.cloneNode(true));
      destEl.appendChild(o.cloneNode(true));
    });
  }

  // Populate transport choices
  function setupTransports(){
    transportInfo.forEach(t =>{
      const div = document.createElement('div');
      div.className = 'transport';
      div.dataset.id = t.id;
      div.dataset.factor = t.factor;
      div.innerHTML = '<div class="icon"><img src="'+t.img+'" alt="'+t.label+'" class="icon-img"/></div>' + `<div class="label">${t.label}</div><div class="factor">${t.factor} kg CO₂/km</div>`;
      div.addEventListener('click', ()=>selectTransport(div));
      transportsEl.appendChild(div);
    });
  }

  function selectTransport(el){
    // toggle
    const all = transportsEl.querySelectorAll('.transport');
    all.forEach(a=>a.classList.remove('selected'));
    el.classList.add('selected');
    const info = transportInfo.find(t=>t.id === el.dataset.id) || {};
    selectedTransport = { id: el.dataset.id, factor: parseFloat(el.dataset.factor), label: info.label || el.dataset.id, img: info.img || '' };
    updateCalculateState();
  }

  function findRoute(o,d){
    if(!o||!d) return null;
    if(o===d) return { distance: 0 };
    const routes = window.ROUTES || [];
    const found = routes.find(r => (r.origin===o && r.destination===d) || (r.origin===d && r.destination===o));
    return found || null;
  }

  function onSelectChange(){
    routeNoticeEl.style.display = 'none';
    manualDistanceWrap.style.display = 'none';
    manualDistanceEl.value = '';
    currentDistance = null;
    const o = originEl.value; const d = destEl.value;
    if(!o||!d) { distanceValueEl.textContent = '—'; updateCalculateState(); return; }

    // validação: impedir selecionar a mesma cidade
    if (o === d) {
      distanceValueEl.textContent = '0 km';
      routeNoticeEl.textContent = 'Origem e destino não podem ser a mesma cidade.';
      routeNoticeEl.style.display = 'block';
      updateCalculateState();
      return;
    }

    const route = findRoute(o,d);
    if(route){
      currentDistance = route.distance;
      distanceValueEl.textContent = `${currentDistance} km`;
      // restaura texto padrão caso estivesse alterado
      routeNoticeEl.textContent = 'Rota não cadastrada (use entrada manual abaixo ou escolha outra rota)';
    } else {
      distanceValueEl.textContent = '—';
      routeNoticeEl.textContent = 'Rota não cadastrada (use entrada manual abaixo ou escolha outra rota)';
      routeNoticeEl.style.display = 'block';
      manualDistanceWrap.style.display = 'block';
    }
    updateCalculateState();
  }

  function updateCalculateState(){
    // se origem e destino forem iguais, desabilita o cálculo
    if(originEl.value && destEl.value && originEl.value === destEl.value){
      calculateBtn.disabled = true;
      return;
    }
    const manualVal = manualDistanceEl.value ? Number(manualDistanceEl.value) : null;
    const okDistance = currentDistance !== null || (manualVal !== null && manualVal >= 0 && manualVal !== 0);
    calculateBtn.disabled = !(originEl.value && destEl.value && selectedTransport && (okDistance || manualVal>=0));
  }

  function formatNumber(n){ return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function formatNumberDecimals(n, decimals){ return Number(n).toLocaleString('pt-BR',{minimumFractionDigits:decimals, maximumFractionDigits:decimals}); }
function animateNumber(selector, endValue, duration = 800, decimals = 0, formatter = v => v){
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if(!el) return;
  const start = 0;
  const startTime = performance.now();
  function step(now){
    const t = Math.min(1, (now - startTime)/duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = start + (endValue - start) * eased;
    el.textContent = formatter(Number(current.toFixed(decimals)));
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
} 

  function onCalculate(){
    const distance = currentDistance !== null ? currentDistance : Number(manualDistanceEl.value || 0);
    if(distance === null || isNaN(distance)) return;
    const emission = distance * selectedTransport.factor; // kg CO2
    const emissionTons = emission/1000;
    resultContent.innerHTML = `
      <p><strong>Origem:</strong> ${originEl.value}</p>
      <p><strong>Destino:</strong> ${destEl.value}</p>
      <p><strong>Distância:</strong> ${distance} km</p>
      <p><strong>Meio:</strong> <span class="selected-icon"><img src="${selectedTransport.img}" alt="${selectedTransport.label}" /></span> ${selectedTransport.label} (${formatNumber(selectedTransport.factor)} kg CO₂/km)</p>
      <hr />
      <p><strong>Emissão estimada:</strong> <span class="emission-highlight"><span id="emissionKg">0.00</span> kg CO₂</span> (<span id="emissionTons">0.000</span> t CO₂)</p>
      <div class="emission-visual" aria-hidden="true"><div class="bar" id="emissionBar" style="width:0%"></div></div>
      <p class="muted">Estimativa simples: distância lida do arquivo <code>routes.js</code> ou entrada manual. Fatores de emissão são médios por passageiro.</p>

    `;

    // animação de entrada e contagem
    const resultEl = document.getElementById('result');
    const setBarWidth = (valueKg)=>{
      const bar = document.getElementById('emissionBar');
      if(bar) bar.style.width = Math.min(100, (valueKg / 1000) * 100) + '%';
    };

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.getElementById('emissionKg').textContent = formatNumberDecimals(emission,2);
      document.getElementById('emissionTons').textContent = formatNumberDecimals(emissionTons,3);
      setBarWidth(emission);
      resultEl.classList.add('revealed');
    } else {
      resultEl.classList.remove('revealed');
      void resultEl.offsetWidth; // forçar reflow e reiniciar animação
      resultEl.classList.add('revealed');
      animateNumber('#emissionKg', emission, 900, 2, v => formatNumberDecimals(v,2));
      animateNumber('#emissionTons', emissionTons, 900, 3, v => formatNumberDecimals(v,3));
      setBarWidth(emission);
    }
  }

  function onClear(){
    originEl.value = ''; destEl.value = '';
    distanceValueEl.textContent = '—'; routeNoticeEl.style.display='none'; manualDistanceWrap.style.display='none'; manualDistanceEl.value='';
    const all = transportsEl.querySelectorAll('.transport'); all.forEach(a=>a.classList.remove('selected'));
    selectedTransport = null; currentDistance = null; resultContent.innerHTML = 'Nenhum cálculo realizado ainda.';
    updateCalculateState();
  }

  // Events
  originEl.addEventListener('change', onSelectChange);
  destEl.addEventListener('change', onSelectChange);
  manualDistanceEl.addEventListener('input', updateCalculateState);
  calculateBtn.addEventListener('click', onCalculate);
  clearBtn.addEventListener('click', onClear);

  // init
  populateSelects(); setupTransports(); updateCalculateState();
})();