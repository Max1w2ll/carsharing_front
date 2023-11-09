<template>
  <div>
    <CreateOrderDialog  :data="orders"  v-if="showCreateOrderDialog" @close="closeCreateOrderDialog" />
  </div>
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

        <button class="createOrder" @click.prevent="openCreateOrderDialog"> заказ</button>

        <div class="orderList">
          <div class="order" v-for="order in orders" :key="order.id">
               <div class="header">
                   <p class="status">{{ order.status }}</p>
                   <p class="autoId">{{ order.numberCar }}</p>
               </div>
               <div class="body">
                   <div class="username">{{ order.username }}</div>
                   <div class="dates">{{ formatDate(order.beginDate) }} - {{ formatDate(order.endDate) }}</div>
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
        <div class="carList">
          <div class="car" v-for="car in cars" :key="car.id">
            <div class="header">
              <p class="name">{{ car.name }}</p>
              <p class="carId">{{ car.number }}</p>
            </div>
            <div class="body">
              <div class="description">{{ car.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info">
        <p> ИНФОРМАЦИЯ </p>

        <p class="selectedCar"> Выбранная машина: </p>
        <p class="dateRent"> Дата арендования: </p>
        <div class="dateSettings">
          <tr> <td> От: </td><td><input id="settingDateFrom" type="date"></td></tr>
          <tr> <td> До: </td><td><input id="settingDateTo" type="date"></td></tr>
        </div>



      </div>

      <div class="calendar">
        <table>

      <tr>
        <th colspan="7" style="font-size: 20px; height: 70px;"> Ноябрь 2023 </th>
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
        <td>30</td>
        <td>31</td>
        <td>1</td>
        <td>2</td>
        <td>3</td>
        <td>4</td>
        <td>5</td>

        </tr>

        <tr>
        <td>6</td>
        <td>7</td>
        <td>8</td>
        <td>9</td>
        <td>10</td>
        <td>11</td>
        <td>12</td>
        </tr>

        <tr>
        <td>13</td>
        <td>14</td>
        <td>15</td>
        <td>16</td>
        <td>17</td>
        <td>18</td>
        <td>19</td>
        </tr>

        <tr>
        <td>20</td>
        <td>21</td>
        <td>22</td>
        <td>23</td>
        <td>24</td>
        <td>25</td>
        <td>26</td>
        </tr>

        <tr>
        <td>27</td>
        <td>28</td>
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
import VueSelect from 'vue-select';

import "@/css/default.css"
import "@/css/holidays-us.css"

import axios from 'axios';
import ModalWindows from '@/components/ModalWindows.js';
import CreateOrderDialog from '@/components/CreateOrderDialog.vue';

export default {
  name: 'Main',
  components: {
    CreateOrderDialog,
    VueSelect
  },
  methods: {
    setShowDate(d) {
      this.showDate = d;
    },
  },

  data() {
    return {
        showCreateOrderDialog: false,
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
        showDate: new Date(),

        ORDERS_GET: 'https://portal.npf-isb.ru/carsharing/api/employee/orders/all',
        orders: () => [],
    }
  },

  methods: {

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
      this.cars = [{"id":0,"name":"Toyota Camry","number":"CA 117 A 70","isShowInList":1,"desc":"Цвет серый"},{"id":2,"name":"LADA Granta седан","number":"BB 685 A 70","isShowInList":1,"desc":"НЕ РЕЗЕРВИРОВАТЬ НА АВГУСТ"},{"id":3,"name":"Mitsubishi Lancer","number":"OO 121 C 101","isShowInList":1,"desc":"детское кресло, вместительный багажник"},{"id":5,"name":"Тест редактирования","number":"AA 000 A 000","isShowInList":1,"desc":"Create/edit/edit 123"},{"id":6,"name":"Mitsubisi","number":"ЕЕ 794 A 70","isShowInList":1,"desc":"Масса 16,5 т. \nДизельный двигатель ЯМЗ - 53608 с турбонаддувом - 312 л.с. \nЦвет: Камуфляж дубок-3 "}];
    },

    getOrders() {
      /*
      axios.get(this.ORDERS_GET, { withCredentials: true })
      .then((res) => {
          this.orders = res.data
          console.log(this.orders);
      });
      */
      //TODO
      this.orders = [{"id":1,"username":"Александр Черепок","status":"В обработке","adminName":null,"desc":"АААААААААААААААА","beginDate":"2022-01-21","endDate":"2022-02-22","car":3,"numberCar":"AA 000 A 000"},
        {"id":2,"username":"Девяшин Егор Андреевич","status":"Отклонен","adminName":"Девяшин Егор Андреевич","desc":"Прошу предоставить корпоративный автомобиль для выезда в командировку, в связи назначением генеральным директором приказом прибыть специалистам 24.05 в Минск","beginDate":"2022-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":14,"username":"Девяшин Егор Андреевич","status":"Одобрен","adminName":"Девяшин Егор Андреевич","desc":"Прошу предоставить корпоративный автомобиль для выезда в командировку, в связи назначением генеральным директором приказом прибыть специалистам 24.05 в Минск","beginDate":"2021-01-21","endDate":"2022-02-22","car":3,"numberCar":"AA 000 A 000"},
        {"id":15,"username":"Девяшин Егор Андреевич","status":"Одобрен","adminName":"Девяшин Егор Андреевич","desc":"TEXT TEXT TEXT","beginDate":"2021-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":16,"username":"Девяшин Егор Андреевич","status":"Одобрен","adminName":"Девяшин Егор Андреевич","desc":"Прошу предоставить корпоративный автомобиль дял выезда в командировку, в связи назначением генеральным директором приказом прибыть специалистам 24.05 в Минск","beginDate":"2022-01-21","endDate":"2022-02-22","car":2,"numberCar":"BB 685 A 70"},
        {"id":17,"username":"Девяшин Егор Андреевич","status":"В обработке","adminName":null,"desc":"Проверка пересечения двойных дат1","beginDate":"2021-01-21","endDate":"2023-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":30,"username":"Александр Черепок","status":"В обработке","adminName":null,"desc":"АААААААААААААААА","beginDate":"2022-01-21","endDate":"2022-02-22","car":3,"numberCar":"AA 000 A 000"},
        {"id": 23, "username": "Елена Михайлова", "status": "В обработке", "adminName": null, "desc": "Заявка на отпуск", "beginDate": "2022-03-15", "endDate": "2022-03-25", "car": 0, "numberCar": "BM 123 X 56"},
        {"id": 25, "username": "Елена Михайлова", "status": "Отклонен", "adminName": "Анна Иванова", "desc": "Заявка на перенос рабочего графика", "beginDate": "2022-04-10", "endDate": "2022-04-15", "car": 0, "numberCar": "BM 123 X 56"},
        {"id": 26, "username": "Елена Михайлова", "status": "Одобрен", "adminName": "Алексей Сергеев", "desc": "Заявка на участие в семинаре по маркетингу", "beginDate": "2022-05-20", "endDate": "2022-05-22", "car": 1, "numberCar": "BM 123 X 56"},
        {"id": 27, "username": "Александр Черепок", "status": "Отклонен", "adminName": "Сергей Иванов", "desc": "Заявка на изменение рабочего времени", "beginDate": "2022-06-05", "endDate": "2022-06-10", "car": 0, "numberCar": "BM 123 X 56"},
        {"id": 28, "username": "Максим Григорьев", "status": "В обработке", "adminName": null, "desc": "Заявка на отпуск с 1 июля по 15 июля", "beginDate": "2022-07-01", "endDate": "2022-07-15", "car": 0, "numberCar": "AA 000 A 000"},
        {"id": 29, "username": "Максим Григорьев", "status": "Одобрен", "adminName": "Анна Петрова", "desc": "Заявка на командировку в Москву", "beginDate": "2022-08-10", "endDate": "2022-08-15", "car": 2, "numberCar": "AA 000 A 000"},
        {"id": 20, "username": "Елена Михайлова", "status": "В обработке", "adminName": null, "desc": "Заявка на участие в конференции", "beginDate": "2022-09-15", "endDate": "2022-09-17", "car": 0, "numberCar": "AA 000 A 000"},
        {"id": 21, "username": "Александр Черепок", "status": "Отклонен", "adminName": "Ольга Кузнецова", "desc": "Заявка на изменение рабочего места", "beginDate": "2022-10-10", "endDate": "2022-10-31", "car": 0, "numberCar": "CA 117 A 70"},
        {"id": 22, "username": "Максим Григорьев", "status": "Одобрен", "adminName": "Евгений Сидоров", "desc": "Заявка на отпуск на новогодние праздники", "beginDate": "2022-12-25", "endDate": "2023-01-05", "car": 1, "numberCar": "CA 117 A 70"},
        {"id": 24, "username": "Максим Григорьев", "status": "В обработке", "adminName": null, "desc": "Заявка на обучение новых сотрудников", "beginDate": "2023-02-15", "endDate": "2023-02-17", "car": 0, "numberCar": "CA 117 A 70"},
        {"id":3,"username":"Иванов Иван Иванович","status":"В обработке","adminName":null,"desc":"Заявка на предоставление автомобиля","beginDate":"2022-01-21","endDate":"2022-02-22","car":2,"numberCar":"BB 111 B 111"},
        {"id":5,"username":"Иванов Иван Иванович","status":"Отклонен","adminName":"Иванов Иван Иванович","desc":"Прошу предоставить автомобиль для деловой поездки","beginDate":"2022-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":6,"username":"Иванов Иван Иванович","status":"Одобрен","adminName":"Иванов Иван Иванович","desc":"Прошу предоставить автомобиль для поездки на конференцию","beginDate":"2022-01-21","endDate":"2022-02-22","car":1,"numberCar":"AA 000 A 000"},
        {"id":7,"username":"Иванов Иван Иванович","status":"В обработке","adminName":null,"desc":"Заявка на предоставление автомобиля","beginDate":"2022-01-21","endDate":"2022-02-22","car":2,"numberCar":"BB 111 B 111"},
        {"id":8,"username":"Смирнов Смир Смирнович","status":"Отклонен","adminName":"Козлов Козел Козлович","desc":"Прошу предоставить автомобиль для деловой поездки","beginDate":"2022-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":9,"username":"Васильев Василий Васильевич","status":"Одобрен","adminName":"Козлов Козел Козлович","desc":"Прошу предоставить автомобиль для поездки на конференцию","beginDate":"2022-01-21","endDate":"2022-02-22","car":1,"numberCar":"AA 000 A 000"},
        {"id":10,"username":"Елена Михайлова","status":"В обработке","adminName":null,"desc":"Заявка на предоставление автомобиля","beginDate":"2022-01-21","endDate":"2022-02-22","car":2,"numberCar":"BB 111 B 111"},
        {"id":11,"username":"Елена Михайлова","status":"Отклонен","adminName":"Николаев Николай Николаевич","desc":"Прошу предоставить автомобиль для деловой поездки","beginDate":"2022-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":12,"username":"Елена Михайлова","status":"Одобрен","adminName":"Николаев Николай Николаевич","desc":"Прошу предоставить автомобиль для поездки на конференцию","beginDate":"2022-01-21","endDate":"2022-02-22","car":1,"numberCar":"AA 000 A 000"},
        {"id":13,"username":"Александр Черепок","status":"В обработке","adminName":null,"desc":"Заявка на предоставление автомобиля","beginDate":"2022-01-21","endDate":"2022-02-22","car":2,"numberCar":"BB 111 B 111"}
      ];
      /*this.orders = [{"id":1,"username":"Александр Черепок","status":"В обработке","adminName":null,"desc":"АААААААААААААААА","beginDate":"2022-01-21","endDate":"2022-02-22","car":3,"numberCar":"AA 000 A 000"},
        {"id":2,"username":"Девяшин Егор Андреевич","status":"Отклонен","adminName":"Девяшин Егор Андреевич","desc":"Прошу предоставить корпоративный автомобиль для выезда в командировку, в связи назначением генеральным директором приказом прибыть специалистам 24.05 в Минск","beginDate":"2022-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":4,"username":"Девяшин Егор Андреевич","status":"Одобрен","adminName":"Девяшин Егор Андреевич","desc":"Прошу предоставить корпоративный автомобиль для выезда в командировку, в связи назначением генеральным директором приказом прибыть специалистам 24.05 в Минск","beginDate":"2021-01-21","endDate":"2022-02-22","car":3,"numberCar":"AA 000 A 000"},
        {"id":5,"username":"Девяшин Егор Андреевич","status":"Одобрен","adminName":"Девяшин Егор Андреевич","desc":"TEXT TEXT TEXT","beginDate":"2021-01-21","endDate":"2022-02-22","car":0,"numberCar":"CA 117 A 70"},
        {"id":6,"username":"Девяшин Егор Андреевич","status":"Одобрен","adminName":"Девяшин Егор Андреевич","desc":"Прошу предоставить корпоративный автомобиль дял выезда в командировку, в связи назначением генеральным директором приказом прибыть специалистам 24.05 в Минск","beginDate":"2022-01-21","endDate":"2022-02-22","car":2,"numberCar":"BB 685 A 70"},
        {"id": 10, "username": "Елена Михайлова", "status": "В обработке", "adminName": null, "desc": "Заявка на участие в конференции", "beginDate": "2022-09-15", "endDate": "2022-09-17", "car": 0, "numberCar": "AA 000 A 000"},
        {"id": 11, "username": "Александр Черепок", "status": "Отклонен", "adminName": "Ольга Кузнецова", "desc": "Заявка на изменение рабочего места", "beginDate": "2022-10-10", "endDate": "2022-10-31", "car": 0, "numberCar": "CA 117 A 70"},
        {"id": 12, "username": "Максим Григорьев", "status": "Одобрен", "adminName": "Евгений Сидоров", "desc": "Заявка на отпуск на новогодние праздники", "beginDate": "2022-12-25", "endDate": "2023-01-05", "car": 1, "numberCar": "CA 117 A 70"},
        {"id": 13, "username": "Максим Григорьев", "status": "В обработке", "adminName": null, "desc": "Заявка на обучение новых сотрудников", "beginDate": "2023-02-15", "endDate": "2023-02-17", "car": 0, "numberCar": "CA 117 A 70"}
      ];*/
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
    margin-top: 105px;

    height: 750px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mainWindow .history, .mainWindow .availableCars, .mainWindow .info, .mainWindow .calendar {
    padding-left: 32px;
    margin: 10px;
    height: 650px;
    width: 300px;

    font-size: 24px;
    font-family: Open Sans,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;

    color: var(--main-color);
    background: var(--div-color);

    border: 1px solid var(--border-color);
  }

  .mainWindow .availableCars {
    width: 320px;
  }

  .mainWindow .availableCars .car, .mainWindow .history .date {
    padding-bottom: 28px;

    width: 270px;

    line-height: 35px;

    font-size: 20px;
  }
  .mainWindow .availableCars .car:hover, .mainWindow .orderList .order:hover,.mainWindow .history .date:hover {
    background-color: #eeeeee;
  }

  .orderList, .carList {
    padding-right: 15px;

    height: 480px; 

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

  .mainWindow .info {
    width: 380px;
  }

  .mainWindow .info .selectedCar, .mainWindow .info .dateRent, .mainWindow .info .dateSettings {
    font-size: 18px;
  }

  .mainWindow .info .dateSettings {
    display: inline-grid;
  }


  .mainWindow .calendar {
    width: 600px;
  }

  .mainWindow .calendar p {
    margin-bottom: 0px;
  }

  .calendar tbody {
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


  .order {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid var(--sub-color);
    margin-bottom: 10px;
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

  .carList {
    margin-top: 10px;

    overflow-y: scroll;

    display: flex;
    flex-direction: column;

    font-family: var(--main-font);
    font-size: 15px;
  }

  .car {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border: 1px solid var(--sub-color);
    margin-bottom: 10px;
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

  .car .body .description {
    line-height: 1.2;
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

</style>
