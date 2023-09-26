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
        <img src="/assets/isb.logo" width=79 height="64">
      </a>
      <p> Заявки на транспорт ООО «НПФ «ИСБ»</p>
    </div>
  </div>

  <div class="mainWindow">
    <div class="history">
      <p> ИСТОРИЯ </p>
    </div>

    <div class="availableCars">
      <p> ДОСТУПНЫЕ МАШИНЫ </p>
    </div>

    <div class="calendar">
      <p> КАЛЕНДАРЬ </p>
    </div>
  </div>

</template>

<script>
export default {
  name: 'Main',
}
</script>

<style>
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

    height: 550px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mainWindow div {
    padding-left: 32px;
    margin: 20px;
    height: 500px;
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

  .mainWindow .calendar {
    width: 600px;
  }




</style>
