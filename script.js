const listingsWrapper = document.querySelector(".listings-wrapper");
const filtersWrapper = document.querySelector(".header-filters");
const tabletsWrapper = document.querySelector(".tablets-wrapper");

let data = [];
let listingNodes = [];
let filters = [];

// Function to fetch and parse the JSON file
async function fetchJsonData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Failed to fetch the JSON data:', error);
    }
}

async function assignData() {
    data = await fetchJsonData();
    if (data) {
        displayData(data);
    }
}


function displayData(data) {
    const fragment = document.createDocumentFragment();

    data.forEach((dataItem) => {
        listingNodes.push(createListing(dataItem));
    });

    listingNodes.forEach((node) => {
        fragment.appendChild(node);
    });

    listingsWrapper.appendChild(fragment);
}

function createListing(dataItem) {
    const listing = document.createElement("div");
    listing.className = "listing";
    listing.id = dataItem.id;
    listing.setAttribute("data-featured", dataItem.featured);

    listing.append(
        createLogo(dataItem.logo, dataItem.company),
        createDetailsSection(dataItem),
        createFiltersSection(dataItem)
    );

    return listing;
}

function createLogo(image, company) {
    const logo = document.createElement("img");
    logo.className = "logo-wrapper";
    logo.width = 100;
    logo.src = image;
    logo.alt = `${company} Logo`;

    return logo;
}

function createDetailsSection(dataItem) {
    const wrapper = document.createElement("div");
    wrapper.className = "details-wrapper";

    // Line One
    const lineOne = createTextDiv("line-one", "");
    const company = createTextDiv("company", dataItem.company);
    const newDiv = (dataItem.new) ? createTextDiv("new", "NEW!") : null;
    const featured = (dataItem.featured) ? createTextDiv("featured", "FEATURED") : null;
    lineOne.appendChild(company);
    if (newDiv) { lineOne.appendChild(newDiv) };
    if (featured) { lineOne.appendChild(featured) };

    // Line Two
    const lineTwo = createTextDiv("line-two", "");
    const position = createTextDiv("position", dataItem.position);
    lineTwo.append(position);

    // Line Three
    const lineThree = createTextDiv("line-three", "");
    const posted = createTextDiv("postedAt", dataItem.postedAt);
    const contract = createTextDiv("contract", dataItem.contract);
    const location = createTextDiv("location", dataItem.location);
    lineThree.append(posted, contract, location);

    wrapper.append(lineOne, lineTwo, lineThree);

    return wrapper;
}

function createFiltersSection(dataItem) {
    const wrapper = createTextDiv("filters-wrapper", "");
    const role = createButton("role", dataItem.role);
    const level = createButton("level", dataItem.level);
    wrapper.append(role, level);

    dataItem.languages.forEach((language) => {
        const button = createButton("languages", language);
        wrapper.appendChild(button);
    });

    dataItem.tools.forEach((tool) => {
        const button = createButton("tools", tool);
        wrapper.appendChild(button);
    });

    return wrapper;
}


function createButton(type, filter) {
    const button = document.createElement("button");
    button.className = "filter";
    button.type = "button";
    button.textContent = filter;
    button.setAttribute("data-type", type);
    button.setAttribute("data-filter", filter);
    button.setAttribute("onclick", "addFilter(this)");
    return button;
}

function createTextDiv(className, text) {
    const div = document.createElement("div");
    div.className = className;
    div.textContent = text;
    return div;
}


function addFilter(button) {
    const newFilter = {
        type: button.getAttribute("data-type"),
        filter: button.getAttribute("data-filter")
    };

    if (!filters.some(filterItem => filterItem.type === newFilter.type && filterItem.filter === newFilter.filter)) {
        filters.push(newFilter);
        tabletsWrapper.appendChild(createFilterTablet(newFilter));
        applyFilters();
        showHideFilterWrapper();
    }
}

function removeFilter(button) {
    const type = button.getAttribute("data-type");
    const filterValue = button.getAttribute("data-filter");
    button.parentElement.classList.add("fade-up");

    filters = filters.filter(filter => !(filter.type === type && filter.filter === filterValue));

    setTimeout(() => {
        applyFilters();
        tabletsWrapper.innerHTML = "";
        filters.forEach((item) => {
            tabletsWrapper.appendChild(createFilterTablet(item));
        });
        showHideFilterWrapper();
    }, 600);
}

function clearFilters() {
    filters = [];
    const children = tabletsWrapper.children

    let i = children.length - 1;
    children[i].classList.add("fade-up");
    i--;
    const interval = setInterval(() => {
        if (i >= 0) {
            children[i].classList.add("fade-up");
            i--;
        } else {
            clearInterval(interval);
        }
    }, 500);

    setTimeout(() => {
        applyFilters();
        tabletsWrapper.innerHTML = "";
        showHideFilterWrapper();
    }, children.length * 550);
}

function showHideFilterWrapper() {
    (filters.length === 0) ?
        filtersWrapper.classList.add("no-filters") :
        filtersWrapper.classList.remove("no-filters");
}

function createFilterTablet(item) {
    const tablet = createTextDiv("selected-filter", "");
    tablet.appendChild(createTextDiv("", item.filter));

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-type", item.type);
    button.setAttribute("data-filter", item.filter);
    button.setAttribute("onclick", "removeFilter(this)");
    const image = document.createElement("img");
    image.src = "images/icon-remove.svg";
    image.alt = "X";
    button.appendChild(image);

    tablet.appendChild(button);

    return tablet;
}

function applyFilters() {
    let filteredListings = data.filter(dataItem => {
        return filters.every(filterItem => {
            if (Array.isArray(dataItem[filterItem.type])) {
                return dataItem[filterItem.type].includes(filterItem.filter);
            } else {
                return dataItem[filterItem.type] === filterItem.filter;
            }
        });
    });

    const listingIds = new Set(filteredListings.map(listing => listing.id));

    for (const child of listingsWrapper.children) {
        if (listingIds.has(parseInt(child.id))) {
            child.classList.remove("display-none", "fade-left");
        } else {
            child.classList.add("fade-left");
            setTimeout(() => {
                child.classList.add("display-none");
            }, 810);
        }
    }
}


assignData();
