const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];
let types = [];

(async () => {
  try {
    const response = await axios.get("https://pokeapi.co/api/v2/type/");
    let typeData = response.data.results;
    // console.log(typeData);
    // Use types here
    for (i = 0; i < typeData.length; i++) {
      types[i] = typeData[i].name;
    }
    // console.log(types);
  } catch (error) {
    console.error("Error fetching types:", error);
    // Handle error here
  }
})();


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

  $("#pagination").append(`
    <button class="btn btn-primary page ml-1 numberedButtons" value="1">Start</button>
    `);

  if (!(currentPage == 1)) {
    $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${
        currentPage - 1
      }"><<</button>
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
    <button class="btn btn-primary page ml-1 numberedButtons" value="${
      currentPage + 1
    }" style="margin-left: 20px;">>></button>
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
  const url = selected_pokemons[0].url;
  console.log(url);
  const regex = /\/(\d+)\/$/;
  const match = url.match(regex);

  // taking out number of the first pokemon using regex
  let number;
  if (match) {
    number = match[1] - "0";
    // console.log(number); // Output: 14
  } else {
    console.log("No number found in the URL");
  }

  // pokemon numbers being displayed on screen
  let startPokemon = number;
  let endPokemon = number + 9;

  // update status div that tells how many pokemons were fetched and are being displayed at present
  $("#displayed").empty();
  $("#displayed").append(
    `Displaying Pokemon ${startPokemon}-${endPokemon} of ${pokemons.length}`
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

function displayTypes() {
   // displaying types of pokemon below
   const checkboxContainer = $('#checkboxContainer');
   let typeCounter = 0;
   types.forEach((type) => {
     const checkboxId = `checkbox_${type}`;
     
     const checkbox = $('<input>', {
       type: 'checkbox',
       id: checkboxId,
       value: typeCounter,
       class: 'form-check-input'
     });
     
     const label = $('<label>', {
       for: checkboxId,
       text: capitalizeFirstLetter(type),
       class: 'form-check-label ml-2'
     });
     typeCounter++;
     const checkboxContainerDiv = $('<div>').addClass('form-check').append(checkbox, label);
     checkboxContainer.append(checkboxContainerDiv);
   });
 
}

const setup = async (checked) => {
  // test out poke api using axios here

  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const types = res.data.types.map((type) => type.type.name);
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

  displayTypes();

  // add event listener to pagination buttons
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);

let currentPokemons = [];
let counter = 0;

async function fetchByType(type) {
  let response = await axios.get(
    `https://pokeapi.co/api/v2/type/${type}`
  );
  pokemons = response.data.pokemon;
  // console.log(pokemons);
  let selected_pokemons = [];
  for (i = 0; i < pokemons.length; i++) {
    selected_pokemons[i] = pokemons[i].pokemon;
  }
  currentPokemons[counter] = selected_pokemons;
  // console.log(selected_pokemons)
  // console.log(names);
  // console.log(currentPokemons);
  return selected_pokemons;
}

async function fetchByTypeAndUpdate(checkedValues) {
  try {
    await Promise.all(
      checkedValues.map(async (value) => {
        await fetchByType(value - '0' + 1);
        counter++;
      })
    );
    paginate(currentPage, PAGE_SIZE, findCommonPokemons(currentPokemons));
    const numPages = Math.ceil(currentPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  } catch (error) {
    console.error(error);
  }
}

function findCommonPokemons(pokemonArrays) {
  if (pokemonArrays.length === 0) {
    return [];
  }

  return pokemonArrays.reduce((commonPokemons, currentArray) => {
    // Filter the commonPokemons array by checking if each Pokémon object exists in the currentArray
    return commonPokemons.filter((pokemon) =>
      currentArray.some((currentPokemon) =>
        isSamePokemon(pokemon, currentPokemon)
      )
    );
  });
}

function isSamePokemon(pokemon1, pokemon2) {
  return pokemon1.name === pokemon2.name && pokemon1.url === pokemon2.url;
}


// fetchByType(1);

// let int = [[1, 2, 3, 4, 5, 6], [1, 2, 3, 5, 7], [1, 2]];

// function findCommonElementsInArrays(arrays) {
//   if (arrays.length === 0) {
//     return [];
//   }

//   // Copy the first array as the initial common elements
//   let commonElements = arrays[0].slice();

//   for (let i = 1; i < arrays.length; i++) {
//     const currentArray = arrays[i];
//     commonElements = commonElements.filter((element) => currentArray.includes(element));
//   }

//   return commonElements;
// }

// console.log(findCommonElementsInArrays(int));

// let normal = 

// $("#checkboxContainer").on('change', "input[type='checkbox']", function() {
//   // Get the checked checkboxes
//   var checkedCheckboxes = $("#checkboxContainer input[type='checkbox']:checked");

//   // Check if any checkboxes are checked
//   if (checkedCheckboxes.length > 0) {
//     console.log("At least one checkbox is checked.");

//     // Retrieve the values of the checked checkboxes
//     var checkedValues = checkedCheckboxes.map(function() {
//       return $(this).val();
//     }).get();

//     console.log("Checked checkboxes: ", checkedValues);
//   } else {
//     console.log("No checkboxes are checked.");
//   }
// });

