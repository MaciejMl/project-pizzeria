import { select, templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.carouselInit();
    thisHome.activatePage();
  }

  render(element) {
    const thisHome = this;

    const homeHTML = templates.homeSite();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = homeHTML;

    thisHome.dom.order = thisHome.dom.wrapper.querySelector(
      select.home.orderLink
    );
    thisHome.dom.orderId = document.querySelector(select.home.orderLinkId);
    thisHome.dom.orderPage = document.querySelector(select.home.orderPage);
    thisHome.dom.booking = thisHome.dom.wrapper.querySelector(
      select.home.bookingLink
    );
    thisHome.dom.bookingId = document.querySelector(select.home.bookingLinkId);
    thisHome.dom.bookingPage = document.querySelector(select.home.bookingPage);

    thisHome.dom.homeId = document.querySelector(select.home.homeLinkId);
    thisHome.dom.homePage = document.querySelector(select.home.homePage);
  }

  activatePage() {
    const thisHome = this;

    thisHome.dom.order.addEventListener('click', function (event) {
      event.preventDefault();
      const clickedElement = this;

      console.log(clickedElement);
      const id = clickedElement.getAttribute('href').replace('#', '');
      window.location.hash = `#/${id}`;

      thisHome.dom.orderId.classList.add('active');
      thisHome.dom.orderPage.classList.add('active');
      thisHome.dom.homeId.classList.remove('active');
      thisHome.dom.homePage.classList.remove('active');
    });

    thisHome.dom.booking.addEventListener('click', function (event) {
      event.preventDefault();
      const clickedElement = this;

      const id = clickedElement.getAttribute('href').replace('#', '');
      window.location.hash = `#/${id}`;

      thisHome.dom.bookingId.classList.add('active');
      thisHome.dom.bookingPage.classList.add('active');
      thisHome.dom.homeId.classList.remove('active');
      thisHome.dom.homePage.classList.remove('active');
    });
  }

  carouselInit() {
    const elem = document.querySelector('.main-carousel');
    /* eslint-disable no-unused-vars */
    /* eslint-disable-next-line no-undef */
    let flkty = new Flickity(elem, {
      cellAlign: 'left',
      contain: true,
      wrapAround: true,
      autoPlay: true,
      imagesLoaded: true,
      prevNextButtons: false,
    });
  }
}

export default Home;
