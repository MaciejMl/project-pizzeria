import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.toggleTrigger = element.querySelector(
      select.cart.toggleTrigger
    );

    thisCart.dom.productList = element.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);

    thisCart.dom.subtotalPrice = element.querySelector(
      select.cart.subtotalPrice
    );

    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);

    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);

    thisCart.dom.wrapper = element;

    thisCart.dom.form = element.querySelector(select.cart.form);

    thisCart.dom.address = element.querySelector(select.cart.address);

    thisCart.dom.phone = element.querySelector(select.cart.phone);
  }

  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {};
    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.subtotalPrice;
    payload.totalNumber = thisCart.totalNumber;
    payload.deliveryFee = settings.cart.defaultDeliveryFee;
    payload.products = [];

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    //console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parseResponse) {
        console.log('parseResponse', parseResponse);
      });
  }

  update() {
    const thisCart = this;
    let deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    if (thisCart.totalNumber == 0) {
      thisCart.totalPrice = 0;
    }
    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    } else {
      deliveryFee = 0;
    }
    // console.log(
    //   'prod:',
    //   `${thisCart.totalNumber},$${thisCart.subtotalPrice}, total:${thisCart.totalPrice}`
    // );
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    for (let totprice of thisCart.dom.totalPrice) {
      totprice.innerHTML = thisCart.totalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    // console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  remove(cartProduct) {
    const thisCart = this;

    const prodIndex = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(prodIndex, 1);

    cartProduct.dom.wrapper.remove();
    //thisCart.dom.productList.children[prodIndex].remove();
    thisCart.update();
  }
}

export default Cart;
