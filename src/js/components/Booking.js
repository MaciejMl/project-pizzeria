import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.selectedTable = [];
    thisBooking.selectedStarters = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParams =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParams =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [startDateParams, endDateParams],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParams,
        endDateParams,
      ],
      eventsRepeat: [settings.db.repeatParam, endDateParams],
    };

    // console.log('getData params', params);

    const urls = {
      bookings:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.bookings.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&'),
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      // console.log('loop', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) //> -1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    const bookingHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = bookingHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.selectedTable = thisBooking.dom.wrapper.querySelector(
      select.booking.selectedTable
    );
    thisBooking.dom.bookTable = thisBooking.dom.wrapper.querySelector(
      select.booking.table
    );
    thisBooking.dom.datePickerInput = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );
    thisBooking.dom.hourPickerInput = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    thisBooking.dom.peopleAmountInput = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmountInput
    );
    thisBooking.dom.hoursAmountInput = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmountInput
    );
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(
      select.booking.starters
    );
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(
      select.booking.address
    );
  }

  initTables(event) {
    const thisBooking = this;
    if (event.target.classList.contains(classNames.booking.selected)) {
      event.target.classList.remove(classNames.booking.selected);
      this.selectedTable = [];
      return console.log('reset');
    }

    for (let table of thisBooking.dom.tables) {
      if (table.classList.contains(classNames.booking.selected)) {
        table.classList.remove(classNames.booking.selected);
        this.selectedTable = [];
      }
    }

    if (
      event.target.classList.contains(classNames.booking.isTable) &&
      !event.target.classList.contains(classNames.booking.tableBooked)
    ) {
      const tableId = event.target.getAttribute(classNames.booking.tableId);
      thisBooking.selectedTable.push(tableId);
      event.target.classList.add(classNames.booking.selected);
    } else if (
      event.target.classList.contains(classNames.booking.isTable) &&
      event.target.classList.contains(classNames.booking.tableBooked)
    ) {
      alert('Table is booked!');
    }

    // console.log('selectedTable', thisBooking.selectedTable);
  }

  numberBookedTable() {
    const thisBooking = this;

    const number = parseInt(thisBooking.selectedTable[0]);

    if (!isNaN(number)) {
      return number;
    } else if (number !== undefined) {
      return null;
    }
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.selectedTable.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.initTables(event);
    });

    thisBooking.dom.bookTable.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.starters.addEventListener('click', function (event) {
      thisBooking.startersData(event);
    });
  }

  startersData(event) {
    const thisBooking = this;

    if (
      event.target.tagName == 'INPUT' &&
      event.target.attributes.type.nodeValue == 'checkbox' &&
      event.target.attributes.name.nodeValue == 'starter'
    ) {
      if (event.target.checked) {
        thisBooking.selectedStarters.push(
          event.target.attributes.value.nodeValue
        );
      } else {
        const findStarter = thisBooking.selectedStarters.indexOf(
          event.target.attributes.value.nodeValue
        );
        thisBooking.selectedStarters.splice(findStarter, 1);
      }
    }
    // console.log(thisBooking.selectedStarters);
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {};
    payload.date = thisBooking.dom.datePickerInput.value;
    payload.hour = utils.numberToHour(thisBooking.dom.hourPickerInput.value);
    payload.table = thisBooking.numberBookedTable();
    payload.duration = parseInt(thisBooking.dom.hoursAmountInput.value);
    payload.ppl = parseInt(thisBooking.dom.peopleAmountInput.value);
    payload.starters = thisBooking.selectedStarters;
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;

    // console.log(payload);

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
        // console.log('parseResponse', parseResponse);
        if (parseResponse) {
          thisBooking.makeBooked(
            parseResponse.date,
            parseResponse.hour,
            parseResponse.duration,
            parseResponse.table
          );
        }
        thisBooking.updateDOM();
        for (let item of thisBooking.dom.tables) {
          if (item.classList.contains('selected')) {
            item.classList.remove('selected');
          }
        }
      });
  }
}
export default Booking;
