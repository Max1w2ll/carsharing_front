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
          <div v-for="order in orders" :key="order">
            <div class="date"> 
              <p> {{order.beginDate}}:  {{order.status}} </p>
            </div>
          </div>
          <div class="noOrders" v-if="orders.length == 0">
            <img src="../assets/icons/noOrders.png" width="74" height="74"> 
            <p> Заказов нет! </p>
            <p> Cоздайте новый по кнопке ниже </p>
          </div>
        </div>

        <button class="createOrder" @click.prevent="createOrder()"> Новый заказ </button> 

      </div>

      <div class="availableCars">
        <p> ДОСТУПНЫЕ МАШИНЫ </p>

        <div class="car" v-for="car in cars" :key="car">
          <p> {{car.name}} </p>
        </div>

      </div>

      <div class="calendar">
        <p> КАЛЕНДАРЬ </p>

        <table>

        <tr>
          <th colspan="7" style="font-size: 20px; height: 70px;"> Октябрь 2023 </th>
        </tr>

        <tr>
          <th>Пн</th>
          <th>Вт</th>
          <th>Ср</th>
          <th>Чт</th>
          <th>Пт</th>
          <th>Сб</th>
          <th>Вс</th>
        </tr>

        <tr>
          <td>1</td>
          <td>2</td>
          <td>3</td>
          <td>4</td>
          <td>5</td>
          <td>6</td>
          <td>7</td>
          </tr>

          <tr>
          <td>8</td>
          <td>9</td>
          <td>10</td>
          <td>11</td>
          <td>12</td>
          <td>13</td>
          <td>14</td>
          </tr>

          <tr>
          <td>15</td>
          <td>16</td>
          <td>17</td>
          <td>18</td>
          <td>19</td>
          <td>20</td>
          <td>21</td>
          </tr>

          <tr>
          <td>22</td>
          <td>23</td>
          <td>24</td>
          <td>25</td>
          <td>26</td>
          <td>27</td>
          <td>28</td>
          </tr>

          <tr>
          <td>29</td>
          <td>30</td>
          <td>31</td>
          </tr>

          </table>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ModalWindows from '@/components/ModalWindows.js';

export default {
  name: 'Main',

  data() {
    return {
        USER_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/checkjwt',
        user: () => [],

        AUTH_GET: 'https://portal.npf-isb.ru/carsharing/api/auth/ldapauth',

        CAR_GET: 'https://portal.npf-isb.ru/carsharing/api/manager/cars/all',
        cars: () => [],

        ORDERS_POST: 'https://portal.npf-isb.ru//carsharing/api/orders/create',
        orderInfo: {
          car: 0,
          desc: "Тестовое описание",
          beginDate: "2023-22-09",
          endDate: "2023-23-09"
        },

        ORDERS_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/orders/all',
        orders: () => [],
    }
  },

  methods: {

    getUser() {
      axios.get(this.USER_GET, { withCredentials: true })
      .then((res) => {
          this.user = res.data
          console.log(this.user);
      },
      () => {
        this.createAuthWindow();
      });
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

    getCars() {
      axios.get(this.CAR_GET, { withCredentials: true })
      .then((res) => {
          this.cars = res.data
          console.log(this.cars);
      });
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
        this.getUser();
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

    --success-background: #429974;
    --error-background: #f44336;
  }

  body {
    margin: 0;

    overflow-y: hidden;
    overflow-x: hidden;

    background: var(--main-background);
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
    margin-top: 105px;

    height: 750px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mainWindow .history, .mainWindow .availableCars, .mainWindow .calendar {
    padding-left: 32px;
    margin: 20px;
    height: 600px;
    width: 300px;

    font-size: 24px;
    font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;

    color: var(--main-color);
    background: var(--div-color);

    border: 1px solid var(--border-color);
  }

  .mainWindow .availableCars {
    width: 400px;
  }

  .mainWindow .availableCars .car, .mainWindow .history .date {
    height: 40px;
    width: 270px;

    line-height: 35px;

    font-size: 20px;
  }
  .mainWindow .availableCars .car:hover, .mainWindow .history .date:hover {
    background-color: #eeeeee;
  }

  .orderList {
    height: 450px; 
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

  li {
    width: 200px;
    height: 60px;

    line-height: 50px;

    font-size: 20px;
    list-style-type: none;
  }
  li:hover {
    background-color: #eeeeee;
  }

  .mainWindow .calendar {
    width: 600px;
  }

  .mainWindow .calendar p {
    margin-bottom: 0px;
  }

  table, tbody {
    width: 570px;

    display: inline-block;

    text-align: center;
    font-size: 18px;
  }

  th {
    height: 40px;
    width: 200px;
  }

  td {
    height: 70px;
  }

  td:hover {
    background-color: #eeeeee;
  }




</style>
