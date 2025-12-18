// ==========================================
// 1. ZMIENNE GLOBALNE
// ==========================================

// UI Główne
const tytulStrony = document.getElementById("tytul-strony");
const kontenerFiltrow = document.getElementById("kontener-filtrow");

// Elementy Pulpitu
const listaHTML = document.getElementById("lista");
const formularz = document.getElementById("formularz");
const btnSubmit = document.getElementById("btn-submit");
const stanKonta = document.getElementById("stan-konta");
const tytulSalda = document.getElementById("tytul-salda");

// Elementy Podsumowania
const sumaPrzychodowHTML = document.getElementById("suma-przychodow");
const sumaWydatkowHTML = document.getElementById("suma-wydatkow");

// Pola formularza
const inputOpis = document.getElementById("tekst");
const inputKwota = document.getElementById("kwota");
const inputTyp = document.getElementById("typ");
const inputData = document.getElementById("data");
const inputKategoria = document.getElementById("kategoria");

// Filtry
const inputFiltrData = document.getElementById("filtr-data");
const selectFiltrRok = document.getElementById("filtr-rok-select");
const checkboxRok = document.getElementById("filtr-rok");

// Wykresy (Analiza)
const btnWydatki = document.getElementById("btn-pokaz-wydatki");
const btnPrzychody = document.getElementById("btn-pokaz-przychody");
const tytulWykresu = document.getElementById("tytul-wykresu");

// Ranking (Analiza)
const btnRankingWydatki = document.getElementById("btn-ranking-wydatki");
const btnRankingPrzychody = document.getElementById("btn-ranking-przychody");
const tytulRankingu = document.getElementById("tytul-rankingu");

// Canvasy
const ctxDoughnut = document.getElementById("mojWykres");
const ctxLine = document.getElementById("wykresLiniowy");
const ctxBar = document.getElementById("wykresSlupkowy");
const ctxRanking = document.getElementById("wykresRanking");

// Ustawienia
const inputNowaKategoria = document.getElementById("nowa-kategoria-input");
const selectNowaKategoriaTyp = document.getElementById("nowa-kategoria-typ");
const btnDodajKategorie = document.getElementById("btn-dodaj-kategorie");
const listaKategoriiWydatki = document.getElementById(
	"lista-kategorii-wydatki"
);
const listaKategoriiPrzychody = document.getElementById(
	"lista-kategorii-przychody"
);
const btnEksport = document.getElementById("btn-eksport");
const btnImportTrigger = document.getElementById("btn-import-trigger");
const inputImport = document.getElementById("input-import");

// Nawigacja
const menuPulpit = document.getElementById("menu-pulpit");
const menuAnaliza = document.getElementById("menu-analiza");
const menuUstawienia = document.getElementById("menu-ustawienia");

const widokPulpit = document.getElementById("widok-pulpit");
const widokAnaliza = document.getElementById("widok-analiza");
const widokUstawienia = document.getElementById("widok-ustawienia");

// Mobile
const btnMobileMenu = document.getElementById("mobile-menu-btn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

// ==========================================
// 2. DANE
// ==========================================

let transakcje = [];
let aktualnyTypWykresu = "wydatek";
let aktualnyTypRankingu = "wydatek";

let wykresKolowy = null;
let wykresLiniowy = null;
let wykresSlupkowy = null;
let wykresRanking = null;

let trybEdycji = false;
let idEdytowanejTransakcji = null;

const domyslneUstawienia = {
	kategorie: {
		wydatek: [
			"jedzenie",
			"mieszkanie",
			"transport",
			"rozrywka",
			"zdrowie",
			"inne",
		],
		przychod: ["wynagrodzenie", "sprzedaż", "zwrot podatku", "inne"],
	},
};
let ustawienia = JSON.parse(JSON.stringify(domyslneUstawienia));

// ==========================================
// 3. START APLIKACJI
// ==========================================

function startAplikacji() {
	const zapTr = localStorage.getItem("transakcje");
	if (zapTr) transakcje = JSON.parse(zapTr);

	const zapUst = localStorage.getItem("ustawienia");
	if (zapUst) {
		const wczytane = JSON.parse(zapUst);
		if (!Array.isArray(wczytane.kategorie)) ustawienia = wczytane;
	}

	const obecnyRok = new Date().getFullYear();
	selectFiltrRok.innerHTML = "";
	for (let rok = 2020; rok <= obecnyRok + 1; rok++) {
		const op = document.createElement("option");
		op.value = rok;
		op.innerText = rok;
		selectFiltrRok.appendChild(op);
	}

	checkboxRok.checked = false;
	inputFiltrData.classList.remove("ukryty");
	selectFiltrRok.classList.add("ukryty");

	const dzis = new Date();
	inputData.valueAsDate = dzis;
	inputFiltrData.value = dzis.toISOString().slice(0, 7);
	selectFiltrRok.value = obecnyRok;

	zmienWidok("pulpit");
}

// ==========================================
// 4. NAWIGACJA
// ==========================================

function zmienWidok(nazwa) {
	widokPulpit.classList.add("ukryty");
	widokAnaliza.classList.add("ukryty");
	widokUstawienia.classList.add("ukryty");

	menuPulpit.classList.remove("aktywna");
	menuAnaliza.classList.remove("aktywna");
	menuUstawienia.classList.remove("aktywna");

	if (nazwa === "pulpit") {
		widokPulpit.classList.remove("ukryty");
		menuPulpit.classList.add("aktywna");
		tytulStrony.innerText = "Pulpit finansowy";
		kontenerFiltrow.style.visibility = "visible";
		aktualizujWidok();
	} else if (nazwa === "analiza") {
		widokAnaliza.classList.remove("ukryty");
		menuAnaliza.classList.add("aktywna");
		tytulStrony.innerText = "Analiza i Wykresy";
		kontenerFiltrow.style.visibility = "visible";
		aktualizujWidok();
	} else if (nazwa === "ustawienia") {
		widokUstawienia.classList.remove("ukryty");
		menuUstawienia.classList.add("aktywna");
		tytulStrony.innerText = "Ustawienia";
		kontenerFiltrow.style.visibility = "hidden";
		renderujListyKategoriiWUstawieniach();
	}

	if (window.innerWidth <= 768 && sidebar.classList.contains("aktywny")) {
		toggleMenu();
	}
}

menuPulpit.addEventListener("click", () => zmienWidok("pulpit"));
menuAnaliza.addEventListener("click", () => zmienWidok("analiza"));
menuUstawienia.addEventListener("click", () => zmienWidok("ustawienia"));

// ==========================================
// 5. OBSŁUGA ZDARZEŃ
// ==========================================

formularz.addEventListener("submit", function (e) {
	e.preventDefault();
	const kwota = +inputKwota.value;
	const opis = inputOpis.value;
	const data = inputData.value;
	const kat = inputKategoria.value;
	const typ = inputTyp.value;

	if (trybEdycji) {
		const idx = transakcje.findIndex(t => t.id === idEdytowanejTransakcji);
		if (idx !== -1) {
			transakcje[idx] = {
				id: idEdytowanejTransakcji,
				opis,
				kwota,
				typ,
				data,
				kategoria: kat,
			};
		}
		trybEdycji = false;
		idEdytowanejTransakcji = null;
		btnSubmit.innerText = "Dodaj";
		btnSubmit.style.backgroundColor = "#4a90e2";
	} else {
		transakcje.push({
			id: Math.floor(Math.random() * 1000000),
			opis,
			kwota,
			typ,
			data,
			kategoria: kat,
		});
	}
	zapiszDane();
	aktualizujWidok();
	inputOpis.value = "";
	inputKwota.value = "";
});

inputTyp.addEventListener("change", aktualizujSelectKategorii);

const odswiezWidoki = () => aktualizujWidok();
inputFiltrData.addEventListener("change", odswiezWidoki);
selectFiltrRok.addEventListener("change", () => {
	if (checkboxRok.checked)
		tytulSalda.innerText = `Saldo w roku ${selectFiltrRok.value}:`;
	odswiezWidoki();
});
checkboxRok.addEventListener("change", () => {
	if (checkboxRok.checked) {
		inputFiltrData.classList.add("ukryty");
		selectFiltrRok.classList.remove("ukryty");
		tytulSalda.innerText = `Saldo w roku ${selectFiltrRok.value}:`;
	} else {
		inputFiltrData.classList.remove("ukryty");
		selectFiltrRok.classList.add("ukryty");
		tytulSalda.innerText = "Saldo w tym miesiącu:";
	}
	odswiezWidoki();
});

// --- POPRAWIONE OBSŁUGIWANIE PRZYCISKÓW WYKRESÓW ---

// Wykres Kołowy - Odświeżamy tylko ten wykres!
btnWydatki.addEventListener("click", () => {
	aktualnyTypWykresu = "wydatek";
	btnWydatki.classList.add("aktywny");
	btnPrzychody.classList.remove("aktywny");
	tytulWykresu.innerText = "Wydatki";
	// ZAMIAST odswiezWidoki(), wywołujemy tylko konkretne rysowanie
	rysujWykresKolowy();
});
btnPrzychody.addEventListener("click", () => {
	aktualnyTypWykresu = "przychod";
	btnPrzychody.classList.add("aktywny");
	btnWydatki.classList.remove("aktywny");
	tytulWykresu.innerText = "Przychody";
	// ZAMIAST odswiezWidoki()
	rysujWykresKolowy();
});

// Ranking - Odświeżamy tylko ten wykres!
btnRankingWydatki.addEventListener("click", () => {
	aktualnyTypRankingu = "wydatek";
	btnRankingWydatki.classList.add("aktywny");
	btnRankingPrzychody.classList.remove("aktywny");
	tytulRankingu.innerText = "Wydatki";
	// ZAMIAST odswiezWidoki()
	rysujRanking();
});
btnRankingPrzychody.addEventListener("click", () => {
	aktualnyTypRankingu = "przychod";
	btnRankingPrzychody.classList.add("aktywny");
	btnRankingWydatki.classList.remove("aktywny");
	tytulRankingu.innerText = "Przychody";
	// ZAMIAST odswiezWidoki()
	rysujRanking();
});
// ---------------------------------------------------

btnEksport.addEventListener("click", () => {
	const blob = new Blob([JSON.stringify({ transakcje, ustawienia }, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
	a.click();
});
btnImportTrigger.addEventListener("click", () => inputImport.click());
inputImport.addEventListener("change", e => {
	const f = e.target.files[0];
	if (!f) return;
	const r = new FileReader();
	r.onload = ev => {
		try {
			const d = JSON.parse(ev.target.result);
			if (d.transakcje && d.ustawienia && confirm("Nadpisać dane?")) {
				transakcje = d.transakcje;
				ustawienia = d.ustawienia;
				zapiszDane();
				zapiszUstawienia();
				startAplikacji();
				alert("Gotowe!");
			}
		} catch (err) {
			alert("Błąd pliku");
		}
	};
	r.readAsText(f);
	e.target.value = "";
});
btnDodajKategorie.addEventListener("click", () => {
	const n = inputNowaKategoria.value.trim().toLowerCase();
	const t = selectNowaKategoriaTyp.value;
	if (n && !ustawienia.kategorie[t].includes(n)) {
		ustawienia.kategorie[t].push(n);
		zapiszUstawienia();
		renderujListyKategoriiWUstawieniach();
		inputNowaKategoria.value = "";
	}
});

function toggleMenu() {
	sidebar.classList.toggle("aktywny");
	overlay.classList.toggle("ukryty");
}
if (btnMobileMenu) btnMobileMenu.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

// ==========================================
// 6. LOGIKA
// ==========================================

function zapiszDane() {
	localStorage.setItem("transakcje", JSON.stringify(transakcje));
}
function zapiszUstawienia() {
	localStorage.setItem("ustawienia", JSON.stringify(ustawienia));
}
function formatujKwote(k) {
	return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" })
		.format(k)
		.replace(/\u00a0/g, " ");
}

window.edytujTransakcje = function (id) {
	zmienWidok("pulpit");
	const t = transakcje.find(x => x.id === id);
	if (!t) return;
	inputOpis.value = t.opis;
	inputKwota.value = t.kwota;
	inputData.value = t.data;
	inputTyp.value = t.typ;
	aktualizujSelectKategorii();
	inputKategoria.value = t.kategoria;
	trybEdycji = true;
	idEdytowanejTransakcji = id;
	btnSubmit.innerText = "Zapisz zmiany";
	btnSubmit.style.backgroundColor = "#27ae60";
};
window.usunTransakcje = function (id) {
	if (confirm("Usunąć?")) {
		transakcje = transakcje.filter(t => t.id !== id);
		zapiszDane();
		aktualizujWidok();
	}
};
window.usunKategorie = function (t, n) {
	if (confirm("Usunąć?")) {
		ustawienia.kategorie[t] = ustawienia.kategorie[t].filter(k => k !== n);
		zapiszUstawienia();
		renderujListyKategoriiWUstawieniach();
	}
};

function aktualizujSelectKategorii() {
	const t = inputTyp.value;
	const kat = ustawienia.kategorie[t].sort((a, b) => a.localeCompare(b));
	inputKategoria.innerHTML = "";
	kat.forEach(k => {
		const o = document.createElement("option");
		o.value = k;
		o.innerText = k.charAt(0).toUpperCase() + k.slice(1);
		inputKategoria.appendChild(o);
	});
}
function renderujListyKategoriiWUstawieniach() {
	const gen = (t, el) => {
		el.innerHTML = "";
		ustawienia.kategorie[t]
			.sort((a, b) => a.localeCompare(b))
			.forEach(k => {
				el.innerHTML += `<li><span>${k}</span><button onclick="usunKategorie('${t}','${k}')">Usuń</button></li>`;
			});
	};
	gen("wydatek", listaKategoriiWydatki);
	gen("przychod", listaKategoriiPrzychody);
}

function pobierzTransakcje() {
	if (checkboxRok.checked)
		return transakcje.filter(t => t.data.startsWith(selectFiltrRok.value));
	return transakcje.filter(t => t.data.startsWith(inputFiltrData.value));
}

// --- GŁÓWNA FUNKCJA RENDERUJĄCA ---
function aktualizujWidok() {
	if (inputKategoria.children.length === 0) aktualizujSelectKategorii();

	if (!checkboxRok.checked) {
		const m = [
			"styczeń",
			"luty",
			"marzec",
			"kwiecień",
			"maj",
			"czerwiec",
			"lipiec",
			"sierpień",
			"wrzesień",
			"październik",
			"listopad",
			"grudzień",
		];
		const [r, mies] = inputFiltrData.value.split("-");
		if (mies)
			tytulSalda.innerText = `Saldo w miesiącu ${m[parseInt(mies) - 1]} ${r}:`;
	}

	const widoczne = pobierzTransakcje();
	let suma = 0;
	let sumaPrzych = 0;
	let sumaWyd = 0;

	listaHTML.innerHTML = "";
	widoczne.sort((a, b) => (a.data > b.data ? -1 : 1));

	widoczne.forEach(t => {
		if (t.typ === "przychod") {
			suma += t.kwota;
			sumaPrzych += t.kwota;
		} else {
			suma -= t.kwota;
			sumaWyd += t.kwota;
		}

		const li = document.createElement("li");
		li.classList.add(t.typ === "przychod" ? "plus" : "minus");
		li.innerHTML = `<div class="info"><span class="data">${
			t.data
		}</span><span class="kategoria">(${t.kategoria})</span><strong>${
			t.opis
		}</strong></div>
                        <div class="kwota"><span>${
													t.typ === "przychod" ? "+" : "-"
												}${formatujKwote(t.kwota)}</span>
                        <div class="akcje-btn"><button class="btn-edytuj" onclick="edytujTransakcje(${
													t.id
												})">✏️</button><button class="btn-usun" onclick="usunTransakcje(${
			t.id
		})">✖</button></div></div>`;
		listaHTML.appendChild(li);
	});

	stanKonta.innerText = formatujKwote(suma);
	if (sumaPrzychodowHTML)
		sumaPrzychodowHTML.innerText = formatujKwote(sumaPrzych);
	if (sumaWydatkowHTML) sumaWydatkowHTML.innerText = formatujKwote(sumaWyd);

	// RYSOWANIE WSZYSTKICH WYKRESÓW
	rysujWykresKolowy(widoczne);
	rysujWykresLiniowy(widoczne);
	rysujWykresSlupkowy(widoczne);
	rysujRanking(widoczne);
}

// --- 1. KOŁOWY Z TEKSTEM W ŚRODKU (POPRAWIONY ŚRODEK) ---
function rysujWykresKolowy(dane) {
	if (!dane) dane = pobierzTransakcje();
	const filtrowane = dane.filter(t => t.typ === aktualnyTypWykresu);
	if (wykresKolowy) wykresKolowy.destroy();

	// Zabezpieczenie przed brakiem danych
	if (filtrowane.length === 0 && window.innerWidth > 768) return;

	const sumy = {};
	let total = 0;

	filtrowane.forEach(t => {
		sumy[t.kategoria] = (sumy[t.kategoria] || 0) + t.kwota;
		total += t.kwota;
	});

	const labels = Object.keys(sumy).sort((a, b) => a.localeCompare(b));
	const formattedTotal = formatujKwote(total);

	const centerTextPlugin = {
		id: "centerText",
		beforeDraw: function (chart) {
			const width = chart.width;
			const ctx = chart.ctx;

			// Środek obszaru rysowania (bez legendy)
			const textY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

			ctx.restore();
			// Trochę mniejsza czcionka, żeby się ładnie mieściła
			const fontSize = (chart.height / 160).toFixed(2);
			ctx.font = "bold " + fontSize + "em sans-serif";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#333";

			const text = formattedTotal;
			const textX = Math.round((width - ctx.measureText(text).width) / 2);

			ctx.fillText(text, textX, textY);
			ctx.save();
		},
	};

	wykresKolowy = new Chart(ctxDoughnut, {
		type: "doughnut",
		data: {
			labels: labels,
			datasets: [
				{
					data: labels.map(l => sumy[l]),
					borderWidth: 1,
					backgroundColor: [
						"#FF6384",
						"#36A2EB",
						"#FFCE56",
						"#4BC0C0",
						"#9966FF",
						"#FF9F40",
						"#E7E9ED",
						"#76D7C4",
					],
					cutout: "70%",
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					position: "bottom",
					labels: { boxWidth: 10, font: { size: 11 } },
				},
			},
		},
		plugins: [centerTextPlugin],
	});
}

// --- 2. LINIOWY (TREND) ---
function rysujWykresLiniowy(dane) {
	if (!dane) dane = pobierzTransakcje();
	if (wykresLiniowy) wykresLiniowy.destroy();
	if (dane.length === 0 && window.innerWidth > 768) return;

	const chronologiczne = [...dane].sort((a, b) => (a.data > b.data ? 1 : -1));
	const labels = [];
	const values = [];
	let saldo = 0;
	const sumyDni = {};

	chronologiczne.forEach(t => {
		const zmiana = t.typ === "przychod" ? t.kwota : -t.kwota;
		sumyDni[t.data] = (sumyDni[t.data] || 0) + zmiana;
	});

	for (const [data, zmiana] of Object.entries(sumyDni)) {
		saldo += zmiana;
		labels.push(data.slice(-5));
		values.push(saldo);
	}

	wykresLiniowy = new Chart(ctxLine, {
		type: "line",
		data: {
			labels: labels,
			datasets: [
				{
					label: "Bilans narastająco",
					data: values,
					borderColor: "#3498db",
					backgroundColor: "rgba(52, 152, 219, 0.2)",
					tension: 0,
					fill: true,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: true } },
			scales: { y: { beginAtZero: false } },
		},
	});
}

// --- 3. SŁUPKOWY (HYBRYDOWY: ROK VS MIESIĄC) ---
function rysujWykresSlupkowy(dane) {
	if (!dane) dane = pobierzTransakcje();
	if (wykresSlupkowy) wykresSlupkowy.destroy();
	if (dane.length === 0 && window.innerWidth > 768) return;

	if (checkboxRok.checked) {
		// --- OPCJA 1: WIDOK ROCZNY ---
		const nazwyMcy = [
			"Sty",
			"Lut",
			"Mar",
			"Kwi",
			"Maj",
			"Cze",
			"Lip",
			"Sie",
			"Wrz",
			"Paź",
			"Lis",
			"Gru",
		];
		const przychodyMcy = new Array(12).fill(0);
		const wydatkiMcy = new Array(12).fill(0);

		dane.forEach(t => {
			const mcIndex = parseInt(t.data.split("-")[1]) - 1; // 0-11
			if (t.typ === "przychod") przychodyMcy[mcIndex] += t.kwota;
			else wydatkiMcy[mcIndex] += t.kwota;
		});

		wykresSlupkowy = new Chart(ctxBar, {
			type: "bar",
			data: {
				labels: nazwyMcy,
				datasets: [
					{
						label: "Przychody",
						data: przychodyMcy,
						backgroundColor: "#48bb78",
					},
					{ label: "Wydatki", data: wydatkiMcy, backgroundColor: "#f56565" },
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: { grid: { display: false } },
					y: { beginAtZero: true },
				},
			},
		});
	} else {
		// --- OPCJA 2: WIDOK MIESIĘCZNY ---
		let sumaP = 0;
		let sumaW = 0;

		dane.forEach(t => {
			if (t.typ === "przychod") sumaP += t.kwota;
			else sumaW += t.kwota;
		});

		wykresSlupkowy = new Chart(ctxBar, {
			type: "bar",
			data: {
				labels: ["Przychody", "Wydatki"],
				datasets: [
					{
						label: "Kwota",
						data: [sumaP, sumaW],
						backgroundColor: ["#48bb78", "#f56565"],
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: { y: { beginAtZero: true } },
			},
		});
	}
}

// --- 4. POZIOMY RANKING (TOP KATEGORIE - ZAKTUALIZOWANY) ---
function rysujRanking(dane) {
	if (!dane) dane = pobierzTransakcje();
	if (wykresRanking) wykresRanking.destroy();

	// Filtrujemy teraz wg aktualnie wybranego przycisku (Wydatki lub Przychody)
	const przefiltrowane = dane.filter(t => t.typ === aktualnyTypRankingu);

	if (przefiltrowane.length === 0 && window.innerWidth > 768) return;

	const sumy = {};
	przefiltrowane.forEach(
		t => (sumy[t.kategoria] = (sumy[t.kategoria] || 0) + t.kwota)
	);

	const sorted = Object.entries(sumy)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5); // TOP 5

	// Kolor słupków zależny od typu: Pomarańczowy dla wydatków, Zielony dla przychodów
	const kolorSlupka = aktualnyTypRankingu === "wydatek" ? "#FF9F40" : "#48bb78";
	const etykieta = aktualnyTypRankingu === "wydatek" ? "Wydatki" : "Przychody";

	wykresRanking = new Chart(ctxRanking, {
		type: "bar",
		indexAxis: "y",
		data: {
			labels: sorted.map(x => x[0]),
			datasets: [
				{
					label: etykieta,
					data: sorted.map(x => x[1]),
					backgroundColor: kolorSlupka,
					barThickness: 20,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			indexAxis: "y",
			scales: { x: { beginAtZero: true } },
		},
	});
}

// START
startAplikacji();
