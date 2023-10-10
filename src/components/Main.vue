<template>
  <div class="header"> 
    <div class="buttons">
      <a>
        Главная
      </a>
      <a>
        Сотрудники
      </a>
      <a>
        База знаний
      </a>
      <a>
        Заявки
      </a>
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

      <p class="date"> 09.05.2023 Hyundai Palisade </p>
      <p class="date"> 05.08.2023 Toyota Corolla   </p>
      <p class="date"> 10.06.2023  Chevrolet Cobalt </p>
      <p class="date"> 22.09.2023 Volkswagen Caddy </p>

    </div>

    <div class="availableCars">
      <p> ДОСТУПНЫЕ МАШИНЫ </p>
      
      <p class="car"> Toyota Corolla   </p>
      <p class="car"> Volkswagen Caddy </p>
      <p class="car"> Hyundai Palisade </p>
      <p class="car"> Chevrolet Cobalt </p>

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

</template>

<script>
export default {
  name: 'Main',
}
</script>

<style>

/* Calendar */

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

    font-size: 16px;
    text-align: center;
  }
  .header .buttons a:hover {
    color: var(--main-color);
    background: var(--text-color);
  }

  .header .banner {
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

  .mainWindow div {
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
