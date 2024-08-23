const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause');
const progress = document.getElementById('progress');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const searchHistory = document.getElementById('search-history');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const artistImage = document.getElementById('artist-image');
const videoBackground = document.getElementById('video-background');


let isPlaying = false;

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        videoBackground.pause(); 
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    } else {
        audio.play();
        videoBackground.play(); 
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }
    isPlaying = !isPlaying;
});

document.getElementById('backward').addEventListener('click', () => {
    audio.currentTime -= 5;
});

document.getElementById('forward').addEventListener('click', () => {
    audio.currentTime += 5;
});

audio.addEventListener('timeupdate', () => {
    const progressPercentage = (audio.currentTime / audio.duration) * 100;
    progress.value = progressPercentage;
});

progress.addEventListener('input', () => {
    const seekTime = (progress.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

async function fetchAccessToken() {
    const clientId = 'cdeeb1f7012a4410849eaf6ed4c43d16';
    const clientSecret = '13715ab78b5c4edf90c18db1be848972';

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

async function searchMusic(query) {
    const accessToken = await fetchAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data.tracks.items;
}

function displayResults(results) {
    searchResults.innerHTML = '';
    results.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${item.album.images[0].url}" alt="${item.album.name}">
            <div class="song-info">
                <h3>${item.name}</h3>
                <p>${item.artists.map(artist => artist.name).join(', ')}</p>
            </div>
        `;
        li.addEventListener('click', () => {
            audio.src = item.preview_url;
            videoBackground.src = item.album.images[0].url;
            songTitle.innerText = item.name;
            songArtist.innerText = item.artists.map(artist => artist.name).join(', ');
            artistImage.src = item.album.images[0].url;
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            isPlaying = true;
            audio.play();
            videoBackground.play();
            document.body.style.backgroundImage = `url('${item.album.images[0].url}')`;
            updateSearchHistory(query);
        });
        searchResults.appendChild(li);
    });
}

function updateSearchHistory(query) {
    const li = document.createElement('li');
    li.textContent = query;
    li.addEventListener('click', async () => {
        searchInput.value = query;
        const results = await searchMusic(query);
        displayResults(results);
    });
    searchHistory.insertBefore(li, searchHistory.firstChild);
}

searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query !== '') {
        const results = await searchMusic(query);
        displayResults(results);
    }
});