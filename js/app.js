// ==========================================
// 1. ZMIENNE GLOBALNE
// ==========================================

// UI Główne
const tytulStrony = document.getElementById("tytul-strony");
const kontenerFiltrow = document.getElementById("kontener-filtrow");
const navOkres = document.querySelector(".okres-nawigacja");

// Elementy Pulpitu (Finanse)
const listaHTML = document.getElementById("lista");
const formularz = document.getElementById("formularz");
const btnSubmit = document.getElementById("btn-submit");
const stanKonta = document.getElementById("stan-konta");
const tytulSalda = document.getElementById("tytul-salda");

// Elementy Podsumowania
const sumaPrzychodowHTML = document.getElementById("suma-przychodow");
const sumaWydatkowHTML = document.getElementById("suma-wydatkow");

// Pola formularza (Finanse)
const inputOpis = document.getElementById("tekst");
const inputKwota = document.getElementById("kwota");
const inputTyp = document.getElementById("typ");
const inputData = document.getElementById("data");
const inputKategoria = document.getElementById("kategoria");

// --- ZADANIA (NOWE ELEMENTY) ---
const formZadania = document.getElementById("formularz-zadan");
const inputZadanieTresc = document.getElementById("zadanie-tresc");
const inputZadanieData = document.getElementById("zadanie-data"); // Data wykonania
const selectZadanieTyp = document.getElementById("zadanie-typ");

// Listy zadań
const listaDzienne = document.getElementById("lista-zadan-dzienne");
const listaTygodniowe = document.getElementById("lista-zadan-tygodniowe");
const listaMiesieczne = document.getElementById("lista-zadan-miesieczne");
const listaRoczne = document.getElementById("lista-zadan-roczne");

// UI Zadań (Nawigacja i Postęp)
const btnPrevDay = document.getElementById("btn-prev-day");
const btnNextDay = document.getElementById("btn-next-day");
const naglowekDataDzienne = document.getElementById("naglowek-data-dzienne");
const progressText = document.getElementById("progress-text-dzienne");
const progressFill = document.getElementById("progress-fill-dzienne");

// Ustawienia Widoku Zadań (Checkboxy)
const checkColTyg = document.getElementById("check-col-tygodniowe");
const checkColMies = document.getElementById("check-col-miesieczne");
const checkColRok = document.getElementById("check-col-roczne");

// Filtry Finansowe
const inputFiltrData = document.getElementById("filtr-data");
const selectFiltrRok = document.getElementById("filtr-rok-select");
const checkboxRok = document.getElementById("filtr-rok");
const inputSzukaj = document.getElementById("szukaj-transakcji");
const selectFiltrTyp = document.getElementById("filtr-typ");
const selectSortuj = document.getElementById("sortuj-wedlug");

// Wykresy (Analiza)
const btnWydatki = document.getElementById("btn-pokaz-wydatki");
const btnPrzychody = document.getElementById("btn-pokaz-przychody");
const tytulWykresu = document.getElementById("tytul-wykresu");
const btnRankingWydatki = document.getElementById("btn-ranking-wydatki");
const btnRankingPrzychody = document.getElementById("btn-ranking-przychody");
const tytulRankingu = document.getElementById("tytul-rankingu");

// Canvasy
const ctxDoughnut = document.getElementById("mojWykres");
const ctxLine = document.getElementById("wykresLiniowy");
const ctxBar = document.getElementById("wykresSlupkowy");
const ctxRanking = document.getElementById("wykresRanking");

// Ustawienia Kategorii
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
const menuZadania = document.getElementById("menu-zadania");
const menuAnaliza = document.getElementById("menu-analiza");
const menuUstawienia = document.getElementById("menu-ustawienia");

const widokPulpit = document.getElementById("widok-pulpit");
const widokZadania = document.getElementById("widok-zadania");
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
let zadania = [];
// Stan nawigacji w module zadań (domyślnie dzisiaj)
let aktualnyDzienWidoku = new Date();

let aktualnyTypWykresu = "wydatek";
let aktualnyTypRankingu = "wydatek";
let wykresKolowy = null,
	wykresLiniowy = null,
	wykresSlupkowy = null,
	wykresRanking = null;
let trybEdycji = false;
let idEdytowanejTransakcji = null;

const domyslneUstawienia = {
	kategorie: {
		wydatek: [
			{ nazwa: "jedzenie" },
			{ nazwa: "mieszkanie" },
			{ nazwa: "transport" },
			{ nazwa: "rozrywka" },
			{ nazwa: "zdrowie" },
			{ nazwa: "inne" },
		],
		przychod: [
			{ nazwa: "wynagrodzenie" },
			{ nazwa: "sprzedaż" },
			{ nazwa: "zwrot podatku" },
			{ nazwa: "inne" },
		],
	},
	// Konfiguracja widoczności kolumn zadań
	widokZadan: {
		pokazTygodniowe: true,
		pokazMiesieczne: true,
		pokazRoczne: true,
	},
};

let ustawienia = JSON.parse(JSON.stringify(domyslneUstawienia));

// ==========================================
// 3. START APLIKACJI
// ==========================================

function startAplikacji() {
	// A. Dane Finansowe
	const zapTr = localStorage.getItem("transakcje");
	if (zapTr) transakcje = JSON.parse(zapTr);

	const zapUst = localStorage.getItem("ustawienia");
	if (zapUst) {
		const wczytane = JSON.parse(zapUst);
		if (wczytane.kategorie) ustawienia = wczytane;
		// Migracja: jeśli stare ustawienia nie mają widokZadan, dodaj domyślne
		if (!ustawienia.widokZadan)
			ustawienia.widokZadan = domyslneUstawienia.widokZadan;
	}

	// B. Dane Zadań
	const zapZadania = localStorage.getItem("zadania");
	if (zapZadania) zadania = JSON.parse(zapZadania);

	// C. Inicjalizacja UI
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

	// Ustawienie domyślnej daty w formularzu zadań
	if (inputZadanieData) inputZadanieData.valueAsDate = dzis;

	// Uruchomienie nasłuchiwania ustawień (checkboxy kolumn)
	inicjalizujUstawieniaWidoku();

	zmienWidok("pulpit");
}

startAplikacji();

// ==========================================
// 4. NAWIGACJA
// ==========================================

function zmienWidok(nazwa) {
	// 1. Ukrywamy wszystko
	widokPulpit.classList.add("ukryty");
	widokZadania.classList.add("ukryty");
	widokAnaliza.classList.add("ukryty");
	widokUstawienia.classList.add("ukryty");

	menuPulpit.classList.remove("aktywna");
	menuZadania.classList.remove("aktywna");
	menuAnaliza.classList.remove("aktywna");
	menuUstawienia.classList.remove("aktywna");

	// Domyślnie ukrywamy pasek filtrów (pokażemy tylko tam gdzie trzeba)
	kontenerFiltrow.style.visibility = "hidden";
	if (navOkres) navOkres.style.visibility = "hidden";

	// 2. Pokazujemy wybrany widok
	if (nazwa === "pulpit") {
		widokPulpit.classList.remove("ukryty");
		menuPulpit.classList.add("aktywna");
		tytulStrony.innerText = "Pulpit finansowy";

		kontenerFiltrow.style.visibility = "visible";
		if (navOkres) navOkres.style.visibility = "visible";
		aktualizujWidok();
	} else if (nazwa === "zadania") {
		widokZadania.classList.remove("ukryty");
		menuZadania.classList.add("aktywna");
		tytulStrony.innerText = "Cele i Zadania";

		// Renderujemy zadania (odświeżamy widok dnia)
		renderujZadania();
	} else if (nazwa === "analiza") {
		widokAnaliza.classList.remove("ukryty");
		menuAnaliza.classList.add("aktywna");
		tytulStrony.innerText = "Analiza i Wykresy";

		kontenerFiltrow.style.visibility = "visible";
		if (navOkres) navOkres.style.visibility = "visible";
		aktualizujWidok();
	} else if (nazwa === "ustawienia") {
		widokUstawienia.classList.remove("ukryty");
		menuUstawienia.classList.add("aktywna");
		tytulStrony.innerText = "Ustawienia";

		renderujListyKategoriiWUstawieniach();
	}

	if (window.innerWidth <= 768 && sidebar.classList.contains("aktywny")) {
		toggleMenu();
	}
}

menuPulpit.addEventListener("click", () => zmienWidok("pulpit"));
menuZadania.addEventListener("click", () => zmienWidok("zadania"));
menuAnaliza.addEventListener("click", () => zmienWidok("analiza"));
menuUstawienia.addEventListener("click", () => zmienWidok("ustawienia"));

// ==========================================
// 5. OBSŁUGA ZADAŃ (LOGIKA + DATA)
// ==========================================

// Helper: Formatowanie daty do stringa YYYY-MM-DD (ważne dla porównań)
function formatDate(date) {
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60 * 1000);
	return localDate.toISOString().split("T")[0];
}

// 1. Dodawanie nowego zadania
if (formZadania) {
	formZadania.addEventListener("submit", e => {
		e.preventDefault();
		const tresc = inputZadanieTresc.value.trim();
		const typ = selectZadanieTyp.value;
		const dataVal = inputZadanieData.value; // Pobieramy datę z inputa

		if (tresc && dataVal) {
			zadania.push({
				id: Date.now(),
				tresc: tresc,
				typ: typ,
				zrobione: false,
				data: dataVal, // Zapisujemy datę wybraną przez użytkownika
			});
			localStorage.setItem("zadania", JSON.stringify(zadania));
			inputZadanieTresc.value = "";
			renderujZadania();
		}
	});
}

// 2. Nawigacja po dniach (Strzałki)
if (btnPrevDay) {
	btnPrevDay.addEventListener("click", () => {
		aktualnyDzienWidoku.setDate(aktualnyDzienWidoku.getDate() - 1);
		renderujZadania();
	});
}
if (btnNextDay) {
	btnNextDay.addEventListener("click", () => {
		aktualnyDzienWidoku.setDate(aktualnyDzienWidoku.getDate() + 1);
		renderujZadania();
	});
}

// 3. Renderowanie list zadań
function renderujZadania() {
	// A. Ustalenie daty widoku (Dziś, Jutro, czy inna data?)
	const dzisStr = formatDate(new Date());
	const widokStr = formatDate(aktualnyDzienWidoku);

	let naglowek = widokStr;
	const jutro = new Date();
	jutro.setDate(jutro.getDate() + 1);
	const wczoraj = new Date();
	wczoraj.setDate(wczoraj.getDate() - 1);

	if (widokStr === dzisStr) naglowek = "Dziś (" + widokStr + ")";
	else if (widokStr === formatDate(jutro))
		naglowek = "Jutro (" + widokStr + ")";
	else if (widokStr === formatDate(wczoraj))
		naglowek = "Wczoraj (" + widokStr + ")";

	if (naglowekDataDzienne) naglowekDataDzienne.innerText = naglowek;

	// B. Czyszczenie list
	listaDzienne.innerHTML = "";
	listaTygodniowe.innerHTML = "";
	listaMiesieczne.innerHTML = "";
	listaRoczne.innerHTML = "";

	// C. Sterowanie widocznością kolumn (zgodnie z ustawieniami)
	// Używamy .closest('.karta') aby ukryć całą ramkę kolumny
	if (listaTygodniowe)
		listaTygodniowe.closest(".karta").style.display = ustawienia.widokZadan
			.pokazTygodniowe
			? "flex"
			: "none";
	if (listaMiesieczne)
		listaMiesieczne.closest(".karta").style.display = ustawienia.widokZadan
			.pokazMiesieczne
			? "flex"
			: "none";
	if (listaRoczne)
		listaRoczne.closest(".karta").style.display = ustawienia.widokZadan
			.pokazRoczne
			? "flex"
			: "none";

	let doneDaily = 0;
	let totalDaily = 0;

	// D. Sortowanie po dacie rosnąco
	const posortowane = [...zadania].sort((a, b) => a.data.localeCompare(b.data));

	posortowane.forEach(z => {
		const li = document.createElement("li");
		const stylTekstu = z.zrobione
			? "text-decoration: line-through; opacity: 0.6;"
			: "";
		const ikona = z.zrobione ? "✅" : "⬜";

		// Etykieta daty (dla zadań niedziennych, żeby wiedzieć na kiedy są)
		const dataBadge = `<span style="font-size:10px; background:#eee; padding:2px 4px; border-radius:4px; margin-left:5px; color:#555;">${z.data}</span>`;

		li.style.display = "flex";
		li.style.justifyContent = "space-between";
		li.style.alignItems = "center";
		li.style.marginBottom = "8px";
		li.style.padding = "8px";
		li.style.background = "#f9f9f9";
		li.style.borderRadius = "5px";
		li.style.border = "1px solid #eee";

		li.innerHTML = `
            <div style="display:flex; flex-direction:column; cursor:pointer; flex:1;" onclick="toggleZadanie(${
							z.id
						})">
                <div style="display:flex; align-items:center;">
                    <span style="margin-right:10px; font-size:1.2em;">${ikona}</span>
                    <span style="${stylTekstu}">${z.tresc}</span>
                </div>
                ${z.typ !== "dzienne" ? dataBadge : ""} 
            </div>
            <button onclick="usunZadanie(${
							z.id
						})" style="background:none; border:none; cursor:pointer; opacity:0.5; font-size:16px;">❌</button>
        `;

		// E. Przydział do kolumn
		if (z.typ === "dzienne") {
			// Pokazujemy TYLKO jeśli data zadania zgadza się z aktualnym widokiem
			if (z.data === widokStr) {
				listaDzienne.appendChild(li);
				totalDaily++;
				if (z.zrobione) doneDaily++;
			}
		} else if (z.typ === "tygodniowe") {
			listaTygodniowe.appendChild(li);
		} else if (z.typ === "miesieczne") {
			listaMiesieczne.appendChild(li);
		} else if (z.typ === "roczne") {
			listaRoczne.appendChild(li);
		}
	});

	// F. Aktualizacja paska postępu (tylko dla widoku dnia)
	if (totalDaily > 0) {
		const percent = Math.round((doneDaily / totalDaily) * 100);
		progressFill.style.width = `${percent}%`;
		progressText.innerText = `${doneDaily}/${totalDaily} (${percent}%)`;
	} else {
		progressFill.style.width = "0%";
		progressText.innerText = "0/0";
	}
}

// Globalne funkcje akcji
window.toggleZadanie = function (id) {
	const idx = zadania.findIndex(z => z.id === id);
	if (idx !== -1) {
		zadania[idx].zrobione = !zadania[idx].zrobione;
		localStorage.setItem("zadania", JSON.stringify(zadania));
		renderujZadania();
	}
};

window.usunZadanie = function (id) {
	if (confirm("Usunąć zadanie?")) {
		zadania = zadania.filter(z => z.id !== id);
		localStorage.setItem("zadania", JSON.stringify(zadania));
		renderujZadania();
	}
};

// --- Inicjalizacja nasłuchiwaczy Ustawień ---
function inicjalizujUstawieniaWidoku() {
	if (checkColTyg) {
		checkColTyg.checked = ustawienia.widokZadan.pokazTygodniowe;
		checkColTyg.addEventListener("change", e => {
			ustawienia.widokZadan.pokazTygodniowe = e.target.checked;
			zapiszUstawienia();
			renderujZadania();
		});
	}
	if (checkColMies) {
		checkColMies.checked = ustawienia.widokZadan.pokazMiesieczne;
		checkColMies.addEventListener("change", e => {
			ustawienia.widokZadan.pokazMiesieczne = e.target.checked;
			zapiszUstawienia();
			renderujZadania();
		});
	}
	if (checkColRok) {
		checkColRok.checked = ustawienia.widokZadan.pokazRoczne;
		checkColRok.addEventListener("change", e => {
			ustawienia.widokZadan.pokazRoczne = e.target.checked;
			zapiszUstawienia();
			renderujZadania();
		});
	}
}

// ==========================================
// 6. FINANSE - OBSŁUGA FORMULARZA I FILTRÓW
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
		if (idx !== -1)
			transakcje[idx] = {
				id: idEdytowanejTransakcji,
				opis,
				kwota,
				typ,
				data,
				kategoria: kat,
			};
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
inputSzukaj.addEventListener("input", odswiezWidoki);
selectFiltrTyp.addEventListener("change", odswiezWidoki);
selectSortuj.addEventListener("change", odswiezWidoki);

// Wykresy i Backup
btnWydatki.addEventListener("click", () => {
	aktualnyTypWykresu = "wydatek";
	btnWydatki.classList.add("aktywny");
	btnPrzychody.classList.remove("aktywny");
	tytulWykresu.innerText = "Wydatki";
	rysujWykresKolowy();
});
btnPrzychody.addEventListener("click", () => {
	aktualnyTypWykresu = "przychod";
	btnPrzychody.classList.add("aktywny");
	btnWydatki.classList.remove("aktywny");
	tytulWykresu.innerText = "Przychody";
	rysujWykresKolowy();
});
btnRankingWydatki.addEventListener("click", () => {
	aktualnyTypRankingu = "wydatek";
	btnRankingWydatki.classList.add("aktywny");
	btnRankingPrzychody.classList.remove("aktywny");
	tytulRankingu.innerText = "Wydatki";
	rysujRanking();
});
btnRankingPrzychody.addEventListener("click", () => {
	aktualnyTypRankingu = "przychod";
	btnRankingPrzychody.classList.add("aktywny");
	btnRankingWydatki.classList.remove("aktywny");
	tytulRankingu.innerText = "Przychody";
	rysujRanking();
});

btnEksport.addEventListener("click", () => {
	const blob = new Blob(
		[JSON.stringify({ transakcje, ustawienia, zadania }, null, 2)],
		{ type: "application/json" }
	);
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
				if (d.zadania) zadania = d.zadania;
				zapiszDane();
				zapiszUstawienia();
				localStorage.setItem("zadania", JSON.stringify(zadania));
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

function toggleMenu() {
	sidebar.classList.toggle("aktywny");
	overlay.classList.toggle("ukryty");
}
if (btnMobileMenu) btnMobileMenu.addEventListener("click", toggleMenu);
if (overlay) overlay.addEventListener("click", toggleMenu);

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

function aktualizujSelectKategorii() {
	const t = inputTyp.value;
	if (ustawienia.kategorie && ustawienia.kategorie[t]) {
		const kat = ustawienia.kategorie[t].sort((a, b) =>
			a.nazwa.localeCompare(b.nazwa)
		);
		inputKategoria.innerHTML = "";
		kat.forEach(k => {
			const o = document.createElement("option");
			o.value = k.nazwa;
			o.innerText = k.nazwa.charAt(0).toUpperCase() + k.nazwa.slice(1);
			inputKategoria.appendChild(o);
		});
	}
}

function renderujListyKategoriiWUstawieniach() {
	const gen = (t, el) => {
		el.innerHTML = "";
		if (!ustawienia.kategorie[t]) return;
		ustawienia.kategorie[t]
			.sort((a, b) => a.nazwa.localeCompare(b.nazwa))
			.forEach(k => {
				const li = document.createElement("li");
				const span = document.createElement("span");
				span.innerText = k.nazwa.charAt(0).toUpperCase() + k.nazwa.slice(1);
				const divAkcje = document.createElement("div");
				divAkcje.style.display = "flex";
				divAkcje.style.alignItems = "center";
				const btnUsun = document.createElement("button");
				btnUsun.innerText = "Usuń";
				btnUsun.style.marginLeft = "5px";
				btnUsun.style.fontSize = "12px";
				btnUsun.onclick = () => usunKategorie(t, k.nazwa);
				divAkcje.appendChild(btnUsun);
				li.appendChild(span);
				li.appendChild(divAkcje);
				el.appendChild(li);
			});
	};
	gen("wydatek", listaKategoriiWydatki);
	gen("przychod", listaKategoriiPrzychody);
}

btnDodajKategorie.addEventListener("click", () => {
	const nazwa = inputNowaKategoria.value.trim().toLowerCase();
	const typ = selectNowaKategoriaTyp.value;
	if (nazwa) {
		const istnieje = ustawienia.kategorie[typ].some(k => k.nazwa === nazwa);
		if (!istnieje) {
			ustawienia.kategorie[typ].push({ nazwa: nazwa });
			zapiszUstawienia();
			renderujListyKategoriiWUstawieniach();
			aktualizujSelectKategorii();
			inputNowaKategoria.value = "";
		} else {
			alert("Taka kategoria już istnieje!");
		}
	}
});

window.usunKategorie = function (typ, nazwaDoUsuniecia) {
	if (confirm(`Czy na pewno usunąć kategorię "${nazwaDoUsuniecia}"?`)) {
		ustawienia.kategorie[typ] = ustawienia.kategorie[typ].filter(
			k => k.nazwa !== nazwaDoUsuniecia
		);
		zapiszUstawienia();
		renderujListyKategoriiWUstawieniach();
		aktualizujSelectKategorii();
	}
};

function pobierzTransakcje() {
	let dane = [...transakcje];
	if (checkboxRok.checked) {
		dane = dane.filter(t => t.data.startsWith(selectFiltrRok.value));
	} else {
		dane = dane.filter(t => t.data.startsWith(inputFiltrData.value));
	}
	const wybranyTyp = selectFiltrTyp.value;
	if (wybranyTyp !== "wszystkie") {
		dane = dane.filter(t => t.typ === wybranyTyp);
	}
	const fraza = inputSzukaj.value.toLowerCase().trim();
	if (fraza) {
		dane = dane.filter(
			t =>
				t.opis.toLowerCase().includes(fraza) ||
				t.kategoria.toLowerCase().includes(fraza)
		);
	}

	// SORTOWANIE (POPRAWIONE)
	const sortTyp = selectSortuj.value;
	dane.sort((a, b) => {
		const valA = a.typ === "wydatek" ? -a.kwota : a.kwota;
		const valB = b.typ === "wydatek" ? -b.kwota : b.kwota;
		if (sortTyp === "data-nowe") return new Date(b.data) - new Date(a.data);
		if (sortTyp === "data-stare") return new Date(a.data) - new Date(b.data);
		if (sortTyp === "kwota-wysoka") return valB - valA;
		if (sortTyp === "kwota-niska") return valA - valB;
		return 0;
	});
	return dane;
}

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
		}</strong></div><div class="kwota"><span>${
			t.typ === "przychod" ? "+" : "-"
		}${formatujKwote(
			t.kwota
		)}</span><div class="akcje-btn"><button class="btn-edytuj" onclick="edytujTransakcje(${
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
	rysujWykresKolowy(widoczne);
	rysujWykresLiniowy(widoczne);
	rysujWykresSlupkowy(widoczne);
	rysujRanking(widoczne);
}

function rysujWykresKolowy(dane) {
	if (!dane) dane = pobierzTransakcje();
	const filtrowane = dane.filter(t => t.typ === aktualnyTypWykresu);
	if (wykresKolowy) wykresKolowy.destroy();
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
			const textY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
			ctx.restore();
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
function rysujWykresSlupkowy(dane) {
	if (!dane) dane = pobierzTransakcje();
	if (wykresSlupkowy) wykresSlupkowy.destroy();
	if (dane.length === 0 && window.innerWidth > 768) return;
	if (checkboxRok.checked) {
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
			const mcIndex = parseInt(t.data.split("-")[1]) - 1;
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
				scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
			},
		});
	} else {
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
function rysujRanking(dane) {
	if (!dane) dane = pobierzTransakcje();
	if (wykresRanking) wykresRanking.destroy();
	const przefiltrowane = dane.filter(t => t.typ === aktualnyTypRankingu);
	if (przefiltrowane.length === 0 && window.innerWidth > 768) return;
	const sumy = {};
	przefiltrowane.forEach(
		t => (sumy[t.kategoria] = (sumy[t.kategoria] || 0) + t.kwota)
	);
	const sorted = Object.entries(sumy)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);
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
