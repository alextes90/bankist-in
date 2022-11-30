'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-04-10T17:01:17.194Z',
    '2022-04-11T23:36:17.929Z',
    '2022-04-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
let currentAccount, clock;

const updateUi = function () {
  displayBallance(currentAccount);
  displayMovements(currentAccount);
  displayIncome(currentAccount);
};

const timmer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${seconds}`;

    if (time === 0) {
      clearInterval(clock);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 30;

  tick();
  const clock = setInterval(tick, 1000);

  return clock;
};

const formattedCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const dayPassed = calcDaysPassed(new Date(), date);
  console.log(dayPassed);

  if (dayPassed === 0) return 'today';
  if (dayPassed === 1) return 'yesterday';
  if (dayPassed <= 7) return `${dayPassed} days ago`;

  return Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  const sortMovements = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  containerMovements.innerHTML = '';

  sortMovements.forEach(function (move, index) {
    const depOrWith = move > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[index]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${depOrWith}">${
      index + 1
    } ${depOrWith}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedCurrency(
      move,
      acc.locale,
      acc.currency
    )}</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUserName = function (accs) {
  accs.forEach(function (n) {
    n.user = n.owner
      .toLowerCase()
      .split(' ')
      .map(m => m[0])
      .join('');
  });
};

createUserName(accounts);

const displayBallance = function (acc) {
  acc.balance = acc.movements.reduce((acc, val) => acc + val, 0);
  labelBalance.textContent = formattedCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const displayIncome = function (acc) {
  const income = acc.movements.filter(n => n > 0).reduce((n, b) => n + b, 0);
  labelSumIn.textContent = formattedCurrency(income, acc.locale, acc.currency);

  const out = acc.movements.filter(n => n < 0).reduce((n, b) => n + b, 0);
  labelSumOut.textContent = formattedCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const intrest = acc.movements
    .filter(mov => mov > 0)
    .map(dep => (dep * acc.interestRate) / 100)
    .filter(n => n >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formattedCurrency(
    intrest,
    acc.locale,
    acc.currency
  );
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const transferTo = accounts.find(acc => acc.user === inputTransferTo.value);
  const transferValue = Number(inputTransferAmount.value);
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    transferValue > 0 &&
    transferTo &&
    currentAccount.balance >= transferValue &&
    transferTo?.user !== currentAccount.user
  ) {
    currentAccount.movements.push(-transferValue);
    transferTo.movements.push(transferValue);
    currentAccount.movementsDates.push(new Date().toISOString());
    transferTo.movementsDates.push(new Date().toISOString());
    updateUi();
    clearInterval(clock);
    clock = timmer();
    inputTransferAmount.blur();
    inputTransferTo.blur();
  } else alert('Transfer is invalid');
});

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    account => account.user === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display Welcom + UI

    labelWelcome.textContent = `Welcom back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    //Display movments, balance, Income. Also it is Update UI
    // if (clock)
    clearInterval(clock);
    clock = timmer();
    updateUi();
  }
});
let sort = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sort);
  sort = !sort;
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(n => amount / 10 < n)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUi();
      clearInterval(clock);
      clock = timmer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.user === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(acc => acc.user === currentAccount.user);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = '';
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(Number.parseInt('30ggkgfk20'));
// console.log(2 ** 53 + 900);
// console.log(20n > 120);

// setInterval(() => {
//   const now = new Date();
//   const s = now.getSeconds();
//   const m = now.getMinutes();
//   const h = now.getHours();
//   console.log(`${h}:${m}:${s}\r`);
// }, 1000);
