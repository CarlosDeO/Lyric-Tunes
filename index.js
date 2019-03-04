'use strict';
const apiKey = 'd055342f815fc23dee098efe2269e723';

const STORE = {
    artist: "",
    songs: [],
    track: ""
};

function closeModal() {
    $('.close').on("click", function () {
        $('.bg-modal').css("display", "none");
    });
}

function watchLyricButton() {
    $('body').on('click', '.lyric-button', function (event) {
        const button = $(event.currentTarget);
        const trackName = button.data('track')
        STORE.track = trackName;
        $('.bg-modal').css("display", "flex");
        getLyrics();
    });
    closeModal();
}

function displaySongInfo(responseJson) {
    const img = responseJson.track.album.image
    console.log(responseJson);
    $('#cards').append(`
    <li role="listitem" class="cards__item">
          <div class="card">
            
              <img src="${img[img.length-1]['#text']}"  class="card__image" alt="album's cover art">
              <div class="card__content">
                <div class="card__title">${responseJson.track.name}</div>
                <p class="album">Album: ${responseJson.track.album.title}</p>
                <button class="lyric-button" data-track="${responseJson.track.name}">see lyrics</button>
              </div>
            <div/>
    
        </li>
    `);

}

function getSongsInfo() {
    $('#cards').empty();
    $('#results').removeClass('hidden');
    for (let i = 0; i < STORE.songs.length; i++) {

        const params = {
            api_key: apiKey,
            method: 'track.getInfo',
            format: 'json',
            artist: `${encodeURIComponent(STORE.artist)}`,
            track: `${encodeURIComponent(STORE.songs[i])}`
        };
        const queryString = formatQueryParams(params);
        const url = 'http://ws.audioscrobbler.com/2.0/' + '?' + queryString

        fetch(url)
            .then(response => response.json())
            .then(responseJson => displaySongInfo(responseJson));
    }
}

function displayLyricsResult(responseJson) {
    // console.log(responseJson);
    $('pre').html(responseJson.lyrics);
}


function getLyrics() {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(STORE.artist)}/${encodeURIComponent(STORE.track)}`;
    console.log(url);
    $('.artistName').html(STORE.artist);
    $('.trackName').html(STORE.track);
    $('pre').html("Loading Data");
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayLyricsResult(responseJson))
        .catch(err => {
            $('pre').text(`Something went wrong: ${err.message}`);
        });
}

function storeTopSongs(responseJson) {
    for (let i = 0; i < responseJson.toptracks.track.length; i++) {
        STORE.songs.push(responseJson.toptracks.track[i].name);
    }
    console.log(STORE.songs)
    getSongsInfo();
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${key}=${params[key]}`)
    return queryItems.join('&')
}

function getArtistTopSongs(artist) {

    const params = {
        api_key: apiKey,
        method: 'artist.gettoptracks',
        format: 'json',
        limit: '8',
        artist: `${encodeURIComponent(artist)}`,
    };
    const queryString = formatQueryParams(params)
    const url = 'http://ws.audioscrobbler.com/2.0/' + '?' + queryString;
    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(responseJson => storeTopSongs(responseJson))
        .catch(err => {
            $('#js-error-message').text('Artist Not Found')
        });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const artist = $('.searchTerm').val();
        getArtistTopSongs(artist);
        STORE.artist = artist;
    });
}


function handleApp() {
    watchForm();
    watchLyricButton();
}

$(handleApp);

