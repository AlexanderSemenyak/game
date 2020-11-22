import * as pgPromise from "pg-promise";
import * as middlewareRedis from "./MiddlewareRedis";
import * as dtoUser from "../dto/user"
import * as _crypto from "crypto"

/**
* MiddlewarePostgres.ts => Перехват запросов к PostgreSQL и кэширование в Redis
* (!)Интересно: pg-monitor - для отслеживания запросов, идущих через pg-promise
*/

/*
  Примеры:
  import * as postgres from "../models/providers/MiddlewarePostgres";
*  10 секунд кэш живет
    postgres.Query('SELECT * FROM users', [], 10, function(data) {
      console.log(data)
    });


*  1 минуту кэш живет (с параметрами)
    postgres.Query('SELECT * FROM users WHERE email = $1 ', ['artem@artem.ru'], 1 * 60, function(data) {
      console.log(data)
    });


*   Не кэшируем - запрос без параметров
    postgres.Query('SELECT * FROM users', [], function(data) {
      console.log(data)
    });

* Не кэшируем - запрос с параметрами
    postgres.Query('SELECT * FROM users WHERE email = $1 ', ['artem@artem.ru'], function(data) {
      console.log(data)
    });
*/


const initOptions = { /* initialization options */ };

const pgp = pgPromise(initOptions);

//Строка подключения к PostgreSQL
const cn = "postgres://alexander:OnitListRu1@192.168.1.17:5432/games";

// запросы к Postgresql (преднастроенный интерфейс)
export const db = pgp(cn);


/**
 * Выполнить запрос к postgres-базе
 * @param query - запрос
 * @param params - параметры запроса (null - если нет параметров)
 * @param next - куда передавать данные
 */
export function queryWithoutCache(query: string, params, next: (err, data) => any) {
    return queryInternal(query, params, null, next);
}

/**
 * Выполнить запрос к postgres-базе
 * @param query - запрос
 * @param params - параметры запроса (null - если нет параметров)
 * @param liveTimeSecondsInCache - время жизни запроса в секундах
 * @param next - куда передавать данные
 */
export function queryWithCache(query: string, params, liveTimeSecondsInCache: number, next: (err, data) => any) {
    return queryInternal(query, params, liveTimeSecondsInCache, next);
}

/**
 * Выполнить запрос к postgres-базе
 * @param query - запрос
 * @param params - параметры запроса (null - если нет параметров)
 * @param ttlSecondsOrCallback - время жизни запроса или делегат для передачи данных
 * @param next - куда передавать данные
 */
function queryInternal(query: string, params, ttlSecondsOrCallback : any, next : (err, data) => any) {
    var cache = true;

    // если нет секунд для жизни кэша - то возвращаем в качестве результата 
    if (typeof(ttlSecondsOrCallback) !== "number") {
//        next = ttlSecondsOrCallback; //тут был делегат для возврата данных
        cache = false;
    }

    // Return если некуда вернуть результат
    if (!next) return console.log("Вы должны передать функцию обратного вызова в next!");

    // Если разрешен кэш, то проверяем в Redis
    if (cache) {

        //хэш запроса
        //var hash = _crypto.createHash('sha1').update(query + params.toString()).digest('hex');
        var hash = getHash(query, params);

        middlewareRedis.getQueryCache(hash,
            (err, data) => {
                if (err || !data) {
                    _executeAndReturnHash(query, params, ttlSecondsOrCallback, cache, next);
                } else {
                    return next(null, data);
                }
            });

    } else {
        _executeAndReturnHash(query, params, 0, false, next);
    }
}

/**
 * Выполнить запрос к БД и обновить данные кэша
 * @param query
 * @param params
 * @param ttl
 * @param cache
 * @param next
 */
function _executeAndReturnHash(query: string, params, ttl, cache, next : (err, data) => any) {

    //var users = db.map<dtoUser.User>(query,params, a => new dtoUser.User(a)); // - объектная модель

    //db.any(query, params).then(rawData => {
    //    console.log(rawData);
    //});

    db.task(t => {
            return t.any(query, params)
                .then(t.batch);
        })
        .then(rawData => {

            //console.log(rawData);

            if (cache) {
                var hash: string = getHash(query, params);
                middlewareRedis.setQueryCache(hash, ttl, rawData, (err, data) => {
                        //console.log(err, data);
                        if (err || !data) {
                            return next(`Ошибка сохранения данных в Redis:`+err, data);
                        }

                        return next(null, data);
                    });
            } else {
                //не кэшируем ничего в редисе
                return next(null, rawData);
            }

        })
        .catch(reason => {
            return next("Ошибка получения данных из БД:" + reason, null);
        });
}

function getHash(query: string, params) {
    if (params === null) {
        params = []
    }
    var hash = _crypto.createHash("sha1").update(query + params.toString()).digest("hex");
    return hash;
}
