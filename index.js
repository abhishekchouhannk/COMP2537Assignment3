const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();
  // start page
  let startPage, endPage;

  if (currentPage == 1 || currentPage == 2) {
    startPage = 1;
    endPage = 5;
  } else {
    startPage = currentPage - 2;
    if (currentPage == numPages - 1 || currentPage == numPages) {
      endPage = numPages;
      startPage = numPages - 4;
    } else {
      endPage = currentPage + 2;
    }
  }

  // if (currentPage == numPages - 1 ||  currentPage == numPages) {
  //   endPage = numPages;
  // } else {
  //   endPage = currentPage + 2;
  // }
  $("#pagination").append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="1">First</button>
    `);

    if (!(currentPage == 1)) {
      $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Prev</button>
      `);
    }
    

  for (let i = startPage; i <= endPage; i++) {
    if (i == currentPage) {
      $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons current" value="${i}">${i}</button>
    `);
    } else {
      $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
      `);
    }
  }

  if (!(currentPage == numPages)) {
    $("#pagination").append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}" style="margin-left: 20px;">Next</button>
    `);
  }

  

  $("#pagination").append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="${numPages}">Last</button>
    `);
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  $("#pokeCards").empty();

  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $("#pokeCards").append(`
    <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `);
  });
};

const setup = async () => {
  // test out poke api using axios here

  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemons = response.data.results;
  console.log(pokemons.length);

  // $('#displayed').append(`Displaying page  ${pokemons.length}`);

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name);
    // console.log("types: ", types);
    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map(
            (ability) =>
              `<li>${capitalizeFirstLetter(ability.ability.name)}</li>`
          )
          .join("")}
        </ul>
        </div>
        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map(
            (stat) =>
              `<li>${capitalizeFirstLetter(stat.stat.name)}: ${
                stat.base_stat
              }</li>`
          )
          .join("")}
        </ul>
        </div>
        </div>
          <h3>Types</h3>
          <ul>
          ${types
            .map((type) => `<li>${capitalizeFirstLetter(type)}</li>`)
            .join("")}
          </ul>
      
        `);
    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });

  // add event listener to pagination buttons
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);
