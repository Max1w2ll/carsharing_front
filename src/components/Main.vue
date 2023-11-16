<template>
  <div>
    <div class="header">
      <div class="buttons">
        <a> Главная </a>
        <a> Сотрудники </a>
        <a> База знаний </a>
        <a> Заявки </a>
      </div>
      <div class="banner">
        <a>
          <img src="./isb_logo.jpg" width=79 height="64">
        </a>
        <p> Заявки на транспорт ООО «НПФ «ИСБ»</p>
      </div>
    </div>

    <div class="mainWindow">
      <div class="history">
        <p> ИСТОРИЯ </p>
        <div class="orderList">
          <div class="order" v-for="order in orders" :key="order.id">
            <div class="header">
              <p class="status">{{ order.status }}</p>
              <p class="autoId">{{ order.numberCar }}</p>
            </div>
            <div class="body">
              <div class="username"> {{ order.username }}</div>
              <div class="dates"> {{ formatDate(order.beginDate) }} - {{ formatDate(order.endDate) }}</div>
            </div>
          </div>
          <div class="noOrders" v-if="orders.length == 0">
            <img src="../assets/icons/noOrders.png" width="74" height="74"> 
            <p> Заказов нет! </p>
            <p> Cоздайте новый по кнопке ниже </p>
          </div>
        </div>
        <button class="createOrder" @click.prevent="openCreateOrderDialog"> Отчёты </button>
      </div>

      <div class="info">
        <p> ИНФОРМАЦИЯ </p>
        <p class="author"> Автор заявки: {{ userInfo }} </p>
        <p class="selectedCar"> Выбранная машина: {{ selectedCar.name }} </p>
        <p class="carNumber"> Гос. номер: {{  selectedCar.number }} </p>
        <p class="dateRent"> Дата арендования: </p>
        <div class="dateSettings">
          <tr> 
            <td> Начало аренды: </td> 
            <td> <input id="settingDateFrom" type="date"> </td> 
          </tr>
          <tr> 
            <td> Конец аренды: </td> 
            <td> <input id="settingDateTo" type="date"> </td> 
          </tr>
        </div>
        <p class="description"> Описание заявки </p>
        <input>
        <button class="createOrder" @click.prevent="createOrder()"> Новый заказ </button> 
      </div>

      <div class="lastPanel">
        <div class="availableCars">
        <p> ДОСТУПНЫЕ МАШИНЫ </p>
          <div class="carList">
            <div class="car" v-for="car in cars" :key="car.id" @click="selectCar(car)" :class="{ 'selected': car.id === selectedCar.id }">
              <div class="header">
                <p class="name">{{ car.name }}</p>
                <p class="carId">{{ car.number }}</p>
              </div>
              <div class="">
                <div class="description">{{ car.desc }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="calendar">
          <calendar-view
            :show-date="showDate"
            :startingDayOfWeek="1"
            :items="currentPlan"
            class="theme-default">
            <template #header="{ headerProps }">
              <calendar-view-header
                :header-props="headerProps"
                @input="setShowDate" />
            </template>
          </calendar-view>
        </div>
      </div>
    </div>
  </div>
  <div>
    <CreateOrderDialog :data="orders" v-if="showCreateOrderDialog" @close="closeCreateOrderDialog" />
  </div>
</template>

<script>
import VueSelect from 'vue-select';

import "@/css/default.css"
import "@/css/holidays-us.css"

import axios from 'axios';
import ModalWindows from '@/components/ModalWindows.js';
import CreateOrderDialog from '@/components/CreateOrderDialog.vue';
import { CalendarView, CalendarViewHeader } from "vue-simple-calendar"

import "@/css/style-calendar.css"
import "@/css/default.css"

export default {
  name: 'Main',
  components: {
    CreateOrderDialog,
    VueSelect,
    CalendarView,
    CalendarViewHeader
  },

  data() {
    return {
        showCreateOrderDialog: false,

        USER_JWT_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/checkjwt',
        userJWT: () => [],

        USER_INFO_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/userinfo',
        userInfo: () => [],

        AUTH_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/ldapauth',

        CAR_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/car/all',
        cars: () => [],

        CAR_PLAN_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/orders/in-month',

        ORDERS_POST: 'https://portal.npf-isb.ru//carsharing/api/orders/create',

        selectedCar: '',
        orderInfo: {
          car: 0,
          desc: "Тестовое описание",
          beginDate: "2023-11-22",
          endDate: "2023-11-25"
        },
        showDate: new Date(),

        ORDERS_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/orders/all',
        orders: () => [],
        currentPlan: [],
        carPlans: [{id: null, plan: [{}]}],
    }
  },

  methods: {
		thisMonth(d, h, m) {
			const t = new Date()
			return new Date(t.getFullYear(), t.getMonth(), d, h || 0, m || 0)
		},

    setShowDate(d) {
      this.showDate = d;
    },

    updatePlanCarCalendar(carId) {
      axios.get(this.CAR_PLAN_GET + `/${carId}`, { withCredentials: true })
      .then((res) => {
        const findPlan = this.carPlans.filter(it => it.id == carId);
        if (findPlan.length > 0){
          findPlan[0].plan = res.data.ordersPerMonth;
        } else {
          this.carPlans.push({id: carId, plan: res.data.ordersPerMonth})
        }
        this.setInCalendarPlanCar(carId);
      })
    },

    setInCalendarPlanCar(carId) {
        if (this.carPlans) {
          const findPlan = this.carPlans.filter(it => it.id == carId);
          if (findPlan.length > 0) {
            this.currentPlan = findPlan[0].plan;
            return;
          } else {
            this.updatePlanCarCalendar(carId);
          }
        }
    },

    openCreateOrderDialog() {
      this.showCreateOrderDialog = true;
    },

    closeCreateOrderDialog() {
      this.showCreateOrderDialog = false;
    },

    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('ru-RU', options);
    },
    
    getUserJWT() {
      axios.get(this.USER_JWT_GET, { withCredentials: true })
      .then((res) => {
        this.userJWT = res.data;
        console.log(this.userJWT);
      },
      () => {
        this.createAuthWindow();
      });
    },

    getUserInfo() {
      axios.get(this.USER_INFO_GET, { withCredentials: true })
      .then((res) => {
        this.userInfo = res.data;
        console.log(this.userInfo);
      })
    },

    createAuthWindow() {
      let darkLayer = document.createElement('div');
      darkLayer.className = 'darkLayer';
      document.body.appendChild(darkLayer);

      let authSection = document.createElement('div');
      authSection.className = 'authSection';
      darkLayer.appendChild(authSection);

      let userIcon = document.createElement('img');
      userIcon.src = require('../assets/icons/logo.png');
      userIcon.className = 'userIcon';
      authSection.appendChild(userIcon);

      let title = document.createElement('p');
      title.textContent = 'ВОЙДИТЕ В СИСТЕМУ';
      title.className = 'title';
      authSection.appendChild(title);

      let inputsForm = document.createElement('form');
      inputsForm.className = 'inputsForm';
      authSection.appendChild(inputsForm);

      let usernameSection = document.createElement('div');
      usernameSection.className = 'usernameSection';
      inputsForm.appendChild(usernameSection);

      let usernameLabel = document.createElement('label');
      usernameLabel.textContent = "Почта"
      usernameSection.appendChild(usernameLabel);

      let username = document.createElement('input');
      username.required = true
      usernameSection.appendChild(username);

      let usernameIcon = document.createElement('img');
      usernameIcon.className = "usernameIcon";
      usernameIcon.src = require('../assets/icons/usernameIcon.png');
      usernameSection.appendChild(usernameIcon);

      let passwordSection = document.createElement('div');
      passwordSection.className = 'passwordSection';
      inputsForm.appendChild(passwordSection);

      let passwordLabel = document.createElement('label');
      passwordLabel.textContent = "Пароль"
      passwordSection.appendChild(passwordLabel);

      let password = document.createElement('input');
      password.type = 'password'
      password.className = 'password';
      password.required = true;
      passwordSection.appendChild(password);

      let passwordIcon = document.createElement('img');
      passwordIcon.className = "passwordIcon";
      passwordIcon.src = require('../assets/icons/passwordIcon.png');
      passwordSection.appendChild(passwordIcon);

      let submitButton = document.createElement('button');
      submitButton.textContent = 'Войти';
      submitButton.className = 'submitButton';
      inputsForm.appendChild(submitButton);

      inputsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        axios.post(this.AUTH_GET, { "username": username.value, "password": password.value }, { withCredentials: true })
        .then((res) => {
          ModalWindows.showModal(res.data.message, true);
          setTimeout(() => { location.reload() }, 1000);
        },
        () => {
          ModalWindows.showModal("Вы ввели неправильную почту или пароль!", false);
        });
      })
    },

    selectCar(car) {
      this.selectedCar = car;
      this.setInCalendarPlanCar(car.id);
    },

    getCars() {
      axios.get(this.CAR_GET, { withCredentials: true })
      .then((res) => {
          this.cars = res.data
          console.log(this.cars);
          if (this.cars && this.cars[0])  {
            this.selectCar(this.cars[0]);
          }
      });
      //this.cars = [{"id":0,"name":"Toyota Camry","number":"CA 117 A 70","isShowInList":1,"desc":"Цвет серый"},{"id":2,"name":"LADA Granta седан","number":"BB 685 A 70","isShowInList":1,"desc":"НЕ РЕЗЕРВИРОВАТЬ НА АВГУСТ"},{"id":3,"name":"Mitsubishi Lancer","number":"OO 121 C 101","isShowInList":1,"desc":"детское кресло, вместительный багажник"},{"id":5,"name":"Тест редактирования","number":"AA 000 A 000","isShowInList":1,"desc":"Create/edit/edit 123"},{"id":6,"name":"Mitsubisi","number":"ЕЕ 794 A 70","isShowInList":1,"desc":"Масса 16,5 т. \nДизельный двигатель ЯМЗ - 53608 с турбонаддувом - 312 л.с. \nЦвет: Камуфляж дубок-3 "}];
    },

    getOrders() {
      axios.get(this.ORDERS_GET, { withCredentials: true })
      .then((res) => {
          this.orders = res.data
          console.log(this.orders);
      });
    },

    async createOrder() {
      try {
        await axios.post(this.ORDERS_POST, this.orderInfo, { withCredentials: true })
        .then((res) => {
          console.log(res);
          ModalWindows.showModal("Заказ создан!", true);
          this.getOrders();
        });
      }
      catch (e) {
        console.log(e);
        ModalWindows.showModal(e.response.data.message, false);
      }
    },

  },

  mounted() {
    setTimeout(() => {
      this.getUserJWT();
      this.getUserInfo();
      this.getCars();
      this.getOrders();
    }, 100);
  }
}
</script>

<style>
/* Auth window */
@font-face {
  font-family: "Roboto";
  src: url("../assets/fonts/roboto/Roboto-Regular.ttf");
}

:root {
  --main-font: "Open Sans", "Segoe UI", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;;
  --text-color: #ffffff;
  --text-color-hover: #d2d2d2;
  --text-color-active: #999999;

  --button-idle: #456ead;
  --button-hover: #405c91;
  --button-active: #7d98c9;

  --main-color: #2767c9;
  --sub-color: #2767c9;
  --main-background: #f1f8ff;
  --sub-background: #182D57;

  --left-side-background: #f1f8ff;
  --left-side-scrollbar-track: #d3e0ed;
  --left-side-scrollbar-thumb: #2767c9;

  --deleteButton-background: #f44336;

  --wait-border: #bbb04d;
  --wait-background: #e7e7587e;
  --ready-border: #57be68;
  --ready-background: #81faa075;
  --success-background: #429974;
  --error-background: #f44336;
}

body {
  margin: 0;

  overflow-y: hidden;
  overflow-x: hidden;

  background: var(--main-background);
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  color: #2c3e50;
  height: 67vh;
}

.darkLayer {
  position: fixed;
  left: 0;
  top: 0;

  display: flex;
  align-items: center;

  height: 100%;
  width: 100%;
  z-index: 2;

  background-color: var(--main-background);
}

.authSection {
  margin: auto;
  padding: 32px;

  display: flex;
  flex-direction: column;
  align-items: center;

  height: 434px;
  width: 334px;

  border: 1px solid var(--main-color);

  justify-content: start;
  background-color: #fff;
}

.authSection .userIcon {
  margin: 0 0 32px;

  height: 160px;
  width: 200px;
}

.authSection p {
  font-family: var(--main-font);

  color: var(--main-color);
}

.authSection .title {
  margin-top: 0;

  font-size: 25px;
  margin-bottom: 32px;

  text-transform: uppercase;
}

.authSection .description {
  margin: 20px auto;

  width: 250px;

  line-height: 22px;

  font-size: 14px;
}

.authSection .inputsForm {
  height: 200px;
  width: -webkit-fill-available;
}

.authSection .inputsForm input {
  padding: 15px 0 4px 8px;

  outline: none;
  border: none;

  width: 280px;

  font-family: var(--main-font);
  font-size: 17px;

  color: var(--main-color);
  background: transparent;
}

.authSection .inputsForm label {
  margin-left: 7px;

  position: absolute;

  font-family: var(--main-font);

  opacity: 0.7;
  color: var(--main-color);

  font-size: 13px;
}

.authSection .inputsForm .usernameIcon {
  margin-left: 11px;

  transform: translateY(1px);

  height: 22px;
  width: 20px;
}

.authSection .inputsForm .passwordIcon {
  margin-left: 13px;

  height: 20px;
  width: 16px;
}

.usernameSection {
  margin-bottom: 8px;

  height: 46px;

  border: 1px solid var(--main-color);
}
.passwordSection {
  margin-bottom: 8px;

  height: 46px;

  border: 1px solid var(--main-color);
}

.authSection .inputsForm button {
  align-items: center;

  display: flex;
  flex-direction: row;
  justify-content: center;

  height: 40px;
  width: 100%;

  background-color: var(--main-color);
  color: var(--text-color);

  border: none;

  transition: all 0.01s ease-in-out 0s;
}

/* Auth window END */

/*-------*/
/* Other */
/*-------*/

.modalWindow {
    right: 16px;
    top: 16px;

    padding: 8px;

    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;

    min-height: 48px;
    width: 384px;

    font-size: 17px;
    font-family: var(--main-font);

    color: var(--text-color);
    opacity: 1;

    z-index: 2000;

    animation-duration: 0.3s;
    animation-name: modalOpen
}
@keyframes modalOpen {
    from {
        opacity: 0;
        transform: translateY(100%);
    }
    to {
        opacity: 1;
        transform: translateY(0%);
    }
}

.modalWindow.remove {
    opacity: 0;
    animation-name: modalClose
}
@keyframes modalClose {
    from {
        opacity: 1;
        transform: translateY(0%);
    }
    to {
        opacity: 0;
        transform: translateY(100%);
    }
}

.modalWindow.Error {
    background: var(--error-background);
}

.modalWindow.Success {
    background: var(--success-background);
}

/* Other END */

:root {
  --main-color: #2767c9;
  --text-color: #ffffff;
  --div-color: #ffffff;
  --border-color: rgba(39, 103, 201, .2);
}

.header {
  height: 32px;
  width: 100%;

  background: #2767c9;
}

.header .buttons {
  display: flex;
}
.header .buttons a {
  height: 32px;
  width: 160px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--text-color);

  font-size: 17px;
  text-align: center;

  cursor: pointer;
}
.header .buttons a:hover {
  background-color: #f1f8ff;
  color: #2767c9;
  transition: all .1s ease-in-out;
}

.header .banner {
  height: 80px;

  display: flex;
  align-items: center;

  background: var(--div-color);
  border: 1px solid var(--border-color);
}
.header .banner a {
  height: 79px;
  width: 160px;

  display: flex;
  align-items: center;
  justify-content: center;
}
.header .banner p {
  font-size: 32px;
  color: var(--main-color);
}

.mainWindow {
  margin-top: 130px;

  height: 750px;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.mainWindow .history, .mainWindow .info, .mainWindow .lastPanel {
  padding-left: 32px;
  margin: 10px;

  font-size: 24px;
  font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;

  color: var(--main-color);
  background: var(--div-color);

  border: 1px solid var(--border-color);
}

.mainWindow .history, .mainWindow .info {
  height: 820px;
  width: 20%;
}

.mainWindow .info {
  width: 25%;
}

.mainWindow .lastPanel {
  width: 49%;
}

.mainWindow .lastPanel .calendar {
  margin: 15px;
  margin-right: 32px;
  margin-left: 0;
  height: 550px;
  font-size: 19px;
}

.mainWindow .availableCars .car, .mainWindow .history .date {
  padding-bottom: 20px;

  width: 270px;
  min-width: 270px;
  max-width: 270px;

  line-height: 35px;

  font-size: 20px;
}

.mainWindow .availableCars .car {
  margin: 10px;
}

.mainWindow .availableCars .car:hover, .mainWindow .orderList .order:hover,.mainWindow .history .date:hover {
  background-color: #eeeeee;
}

.orderList {
  padding-right: 15px;

  height: 650px; 

  overflow-x: clip;
  overflow-y: scroll;
}

.ordersList::-webkit-scrollbar-track {
      background-color: var(--left-side-scrollbar-track);
  }
.ordersList::-webkit-scrollbar {
    width: 10px;

    background-color: var(--left-side-scrollbar-track);
}
.ordersList::-webkit-scrollbar-thumb {
    background-color: var(--left-side-scrollbar-thumb);
}

.createOrder {
  margin-top: 20px;

  height: 40px;
  width: 275px;

  color: var(--main-color);
  background: none;

  border: 1px solid var(--main-color);

  font-family: sans-serif;

  cursor: pointer;
}

.createOrder:hover {
  color: var(--text-color);
  background: var(--main-color);

  transition: all .1s ease-in-out;
}

.author, .selectedCar, .dateRent, .dateSettings, .carNumber, .description {
  font-size: 18px;
}

.mainWindow .info .dateSettings {
  display: inline-grid;
}

.dateSettings input {
  margin-bottom: 15px;
}

.order, .car {
  padding: 10px;
  margin-bottom: 10px;

  max-height: 90px;

  display: flex;
  flex-direction: column;

  border: 1px solid var(--sub-color);
}

.order .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  color: var(--text-color);
  background: var(--sub-color);
}

.order .body {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  font-family: var(--main-font);
  font-size: 15px;
}

.order .header p {
  margin: 0;
  font-family: var(--main-font);
  font-size: 14px;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order .header .autoId {
  text-align: right;
}

.order .body .username {
  font-weight: bold;
}

.order .body .dates {
  font-size: 14px;
}

.lastPanel .carList {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 32px;

  overflow-x: scroll;

  display: flex;

  font-family: var(--main-font);
  font-size: 15px;
  border: 1px solid var(--border-color);
}

.carList .selected {
  background-color: var(--text-color-hover);
}

.car .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  color: var(--text-color);
  background: var(--sub-color);
}

.car .body {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  font-family: var(--main-font);
  font-size: 15px;
}

.car .description {
  margin-top: 10px;
  height: 55px;
  line-height: 1em;
  overflow: hidden;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  vertical-align: middle; text-align: left;
}

.car .header p {
  margin: 0;
  font-family: var(--main-font);
  font-size: 14px;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.car .header .carId {
  text-align: right;
}

.lastPanel {
  width: 40%;
  background-color: var(--div-color);
}

</style>
