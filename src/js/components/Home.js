import { templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
  }

  render(element) {
    const thisHome = this;

    const homeHTML = templates.homeSite();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = homeHTML;
  }
}

export default Home;
