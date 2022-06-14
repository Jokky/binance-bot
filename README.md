# Торговый бот для Binance

Данный бот предназначен для получения прибыли со спекулятивной торговли на площадке Binance

> **ВНИМАНИЕ**: Бот и разработчик не дает никаких гарантий, что не будет постоянных убытков и прибыли!

## Что умеет бот?
1. Покупать в шорт и лонг
2. Закрывать позицию при стопе
3. Анализировать точки входа и выхода (на основе EMA, StockRSI)

## Конфиг
```
$ cp .env.example .env
```

## Запуск
```
$ npm run install
$ npm run build
$ npm run start
```
### Через Docker
```
$ make build
$ make up
```

### Переменные окружения
| Env                 | Описание                                                         |
|---------------------|------------------------------------------------------------------|
| NODE_ENV            | Режим разработки (development, production)                       |
| API_KEY             | Открытый ключ от Binance                                         |
| API_SECRET          | Приватный ключ от Binance                                        |
| TEST_AMOUNT_ACCOUNT | Тестовое количество средств на аккаунте                          |
| QUEUE_SIZE          | Длина очереди                                                    |
| TICKERS             | Список токенов для торговли                                      |
| COMMISSION          | Комиссия брокера                                                 |
| PERCENT_MIN_PROFIT  | Процент минимальной выгоды разницы цены покупки и последней цены |
| PERCENT_OFF_DEPOSIT | Процент использования свободных средств для депозита             |
| PERCENT_STOP_LOSS   | Процент срабатывания приндутиельной продажи                      |
| LEVERAGE            | Размер плеча                                                     |
| INTERVAL            | Интервал отслеживания цены (1m, 5m, 10m, 1h, 1d, 1M)             |
