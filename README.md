# Drixit

### Мультиплеерная игра на вебсокетах.

[![Test covered](https://github.com/asavan/dixitgame/actions/workflows/static.yml/badge.svg)](https://github.com/asavan/dixitgame/actions/workflows/static.yml)
[![google play](https://img.shields.io/endpoint?color=green&logo=google-play&logoColor=green&url=https%3A%2F%2Fplay.cuzi.workers.dev%2Fplay%3Fi%3Dru.asavan.drixit%26gl%3DUS%26hl%3Den%26l%3D%24name%26m%3D%24version)](https://play.google.com/store/apps/details?id=ru.asavan.drixit)


![Dixit](/screenshots/1.png "Dixit")

## Rules
Board Game, Dixit
In Dixit, players take turns playing the role of a storyteller, choosing one of the 6 cards in their hand and inventing a story according to the picture. This proposal is shared with other players without showing the chosen card. Each player (except the storyteller) chooses one of their 6 cards that most closely matches the story being told, and places that card next to the storyteller's card. After that, the storyteller shuffles and turns over all the cards, and the other players try to guess which picture the sentence is based on. If none or all players find the correct picture, the storyteller will get 0 points, the other players will get 2-2 points, otherwise the storyteller and the players who guessed the Mtkhorbeli card will get 3-3 points. Players have 1 point per vote for their card. The game ends when the cards run out, or when a player reaches 30 points. The winner of the game is the player with the most points.


## Another Rules
Each turn in Dixit, one player is the storyteller, chooses one of the six cards in their hand, then makes up a sentence based on that card's image and says it out loud without showing the card to the other players. Each other player then selects the card in their hand that best matches the sentence and gives the selected card to the storyteller, without showing it to anyone else.

The storyteller shuffles their card with all of the received cards, then reveals all of these cards. Each player other than the storyteller then secretly guesses which card belongs to the storyteller. If nobody or everybody guesses the correct card, the storyteller scores 0 points, and each other player scores 2 points. Otherwise, the storyteller and whoever found the correct answer score 3 points. Additionally, the non-storyteller players score 1 point for every vote received by their card.

The game ends when the deck is empty or if a player has scored at least 30 points. In either case, the player with the most points wins.

The Dixit base game and each expansion contains 84 cards, and the cards can be mixed together as desired.


## Yet Another Rules
Подсчет очков
Если карточку ведущего угадали все игроки, то он идет на 3 хода назад, а остальные стоят на месте.

Если карточку ведущего никто не угадал, то ведущий идет на 2 хода назад. Плюс очки получают игроки, чьи карточки угадали.

В любом другом случае по 3 очка получают все игроки, правильно угадавшие карточку. Ведущий получает 3 очка плюс по очку за каждого угадавшего его игрока. Все игроки получают по одному очку за каждого игрока, который угадал их картинку.

Игроки передвигают свои фишки на игровом поле на количество шагов, соответствующее количеству выигранных очков. Каждый игрок берет по одной карте из колоды. Ведущим становится следующий игрок по порядку.


### Реализация
когда все игроки присоединились сервер нажимает done и приступает к расстановке игроков.
игроки присоединяются по очереди в порядке сканирования кода.


Выбираем место для каждого игрока.
У сервера интерфейс - круг на котором расположены игроки, нажимая последовательно на 2х игроков мы меняем их местами
Игроки обязаны представиться перед началом игры, имя хранится в session storage( для сброса надо закрыть окно браузера)
после того как игроки расставлены, сервер нажимает старт в центре круга

имя можно передать через настройки, тогда оно перетрет то что находится в sessionStorage


Когда игрок хочет походить какой-то картой, он нажимает на нее, при этом карта открывается крупно. Внизу остается 20% свободного пространства, если нажать на него карта закрывается и снова остается вид со своей рукой. Если нажать на карту повторно, то делается ход этой картой.

#### Полезное
Запуск одного теста
node --test --test-name-pattern="test"    
git tag v1.4.9 HEAD -m "Version 1.4.9 released"

#### Доработки
- [ ] Сделать презентеру, engine и сети одинаковые интерфейсы, чтобы их можно было втыкать друг в друга в любой последовательности. Сделать "фэйковую" сеть, которая ничего не делает а просто перекладывает данные в след подключенный обработчик.
- [ ] Start with port 0, and then determine port via server.getListeningPort() and webSocketServer.getPort()

