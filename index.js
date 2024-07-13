const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

const apiURL = 'https://api.lyrics.ovh';

async function searchSongs(term) {
	try {
		const res = await fetch(`${apiURL}/suggest/${term}`);
		const data = await res.json();
		showData(data);
	} catch (err) {
		showAlert('Error fetching song data');
	}
}

async function getMoreSongs(url) {
	try {
		const res = await fetch(`https://cors-anywhere.herokuapp.com/${url}`); // proxy is required to avoid CORS issue
		const data = await res.json();
		showData(data);
	} catch (err) {
		showAlert('Error fetching more songs');
	}
}

function showData(data) {
	result.innerHTML = `
        <ul class="songs">
            ${data.data
							.map(
								(song) => `
                <li>
                    <span><strong>${song.artist.name}</strong> - ${song.title}</span>
                    <button class="btn" data-artist="${song.artist.name}" data-songtitle="${song.title}">Get Lyrics</button>
                </li>`
							)
							.join('')}
        </ul>
    `;

	if (data.prev || data.next) {
		more.innerHTML = `
            ${
							data.prev
								? `<button class="btn" onclick="getMoreSongs('${data.prev}')">Prev</button>`
								: ''
						}
            ${
							data.next
								? `<button class="btn" onclick="getMoreSongs('${data.next}')">Next</button>`
								: ''
						}
        `;
	} else {
		more.innerHTML = '';
	}
}

function showAlert(message) {
	const notif = document.createElement('div');
	notif.classList.add('toast');
	notif.innerText = message;
	document.body.appendChild(notif);
	setTimeout(() => notif.remove(), 3000);
}

async function getLyrics(artist, songTitle) {
	try {
		const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
		const data = await res.json();
		if (data.error) {
			showAlert(data.error);
		} else {
			const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');
			document.querySelector('header').classList.add('hidden'); // Hide the header
			result.innerHTML = `
                <div class="lyrics-container">
                    <button class="btn back-btn" onclick="goBack()">Back</button>
                    <h2><strong>${artist}</strong> - ${songTitle}</h2>
                    <span>${lyrics}</span>
                </div>
            `;
		}
		more.innerHTML = '';
	} catch (err) {
		showAlert('Error fetching lyrics');
	}
}

function goBack() {
	document.querySelector('header').classList.remove('hidden'); 
	result.innerHTML = '<p>Results will be displayed here</p>';
}

// Event Listeners
form.addEventListener('submit', (e) => {
	e.preventDefault();
	const searchTerm = search.value.trim();
	if (!searchTerm) showAlert('Please type in a search term');
	else searchSongs(searchTerm);
});

result.addEventListener('click', (e) => {
	const clickedElement = e.target;
	if (
		clickedElement.tagName === 'BUTTON' &&
		!clickedElement.classList.contains('back-btn')
	) {
		const artist = clickedElement.getAttribute('data-artist');
		const songTitle = clickedElement.getAttribute('data-songtitle');
		getLyrics(artist, songTitle);
	}
});

searchSongs('one');
