// right now this function just displays the name of all the pokemons in the div
const setup = async () => {

    $('#pokeCards').empty();

    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    const pokemons = response.data.results;
    pokemons.forEach(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        $('#pokeCards').append(`
            ${res.data.name.toUpperCase()}
        `);
    });
    // test out poke api using axios here
    const res = await axios.get('https://pokeapi.co/api/v2/pokemon/1');
}
  
$(document).ready(setup);