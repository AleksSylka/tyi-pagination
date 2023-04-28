import createGalleryCards from "../tamplates/gallery-card.hbs";
import { UnsplashAPI } from "./unsplashAPI";
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';
import { Report } from 'notiflix/build/notiflix-report-aio';
import onCheckboxClick from './isChangeTheme';

const container = document.getElementById('tui-pagination-container');
const ulEl = document.querySelector('.js-gallery');

const options = { // below default value of options
    totalItems: 0,
    itemsPerPage: 12,
    visiblePages: 5,
    page: 1,
}
const pagination = new Pagination(container, options);
const unsplashAPI = new UnsplashAPI();

const page = pagination.getCurrentPage();

async function onRenderPage(page) {
    try {
        const respons = await unsplashAPI.getPopularPhotos(page);
        if (respons.data.results.length === 0) {
            return
        } 
        ulEl.innerHTML = createGalleryCards(respons.data.results);
        container.classList.remove('is-hidden');
        pagination.reset(respons.data.total);
    } catch(error) {  
         console.log(error);
    }
};

async function createPopularPogination(event) {
    try {
        const currentPage = event.page;
        console.log(currentPage);
        const respons = await unsplashAPI.getPopularPhotos(currentPage);
        ulEl.innerHTML = createGalleryCards(respons.data.results);
    } catch(error) {
        console.log(error)
    }
}

pagination.on('afterMove', createPopularPogination);
onRenderPage();

/* Пошук по запиту */

async function createByQueryPogination(event) {
     try {
        const currentPage = event.page;
        console.log(currentPage);
        const respons = await unsplashAPI.getPhotoByQuery(currentPage);
        ulEl.innerHTML = createGalleryCards(respons.data.results);
    } catch(error) {
        console.log(error)
    }
};

async function onSearchForm(event) {
    event.preventDefault();
    const searchQuery = event.currentTarget.elements["user-search-query"].value.trim();
    console.log(searchQuery);
    unsplashAPI.query = searchQuery;
    pagination.off('afterMove', createPopularPogination);
    if (!searchQuery) {
        return Report.warning('Пустий запит!!!', 'Заповнить якісь данні.')
    }
    
    try {
        
        const respons = await unsplashAPI.getPhotoByQuery(page);
        if (respons.data.results.length === 0) {
            ulEl.innerHTML = '';
            container.classList.add('is-hidden');
            return Report.failure('Помилка пошуку', 'За вашим запитом нічого не знайдено!')
        }
        if (respons.data.results.length < options.itemsPerPage) {
            container.classList.add('is-hidden');
            return ulEl.innerHTML = createGalleryCards(respons.data.results);
        }

        ulEl.innerHTML = createGalleryCards(respons.data.results);
        container.classList.remove('is-hidden');
        pagination.reset(respons.data.total);
        pagination.on('afterMove', createByQueryPogination)
    } catch(error) {
        console.log(error)
    }
}

const searchFormEl = document.querySelector('.js-search-form');
searchFormEl.addEventListener('submit', onSearchForm);



const checkBoxEl = document.querySelector('#theme-switch-toggle');
checkBoxEl.addEventListener('change', onCheckboxClick);