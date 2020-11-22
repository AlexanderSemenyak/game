import * as _redis from "redis";
/**
 * Кэш в Redis (для любых целей можно использовать, в т.ч. для данных сессии пользователя (но опасно - если упадет или много пользователей будет, все же лучше данные сессии на клиенте или в БД хранить стоит )
 */

var client = _redis.createClient();
_redis.debug = true;

client.on("error", err => {
    console.log("Error " + err);
});


///////////////////////////////////////
    //module.exports = {
    //    getQueryCache: getQueryCache,
    //    setQueryCache: setQueryCache
    //};
///////////////////////////////////////

export function getQueryCache(key, next: (err, data) => any) {
    client.get("postgres:" + key,
        (err, result) => {

            //console.log("getQueryCache");
            //console.log(err);
            //console.log(result);

            if (err || !result) {
                return next(err, null);
            }

            return next(null, JSON.parse(result));
        });
}

export function setQueryCache(key, ttlInSeconds, resultRows, next: (err, data) => any) {
    //console.log(key);
    client.setex("postgres:" + key, ttlInSeconds, JSON.stringify(resultRows),
        (err, result) => {

            //console.log("setQueryCache");
            //console.log(err);
            //console.log(result);

            if (err || !result) {
                return next(err, resultRows);
            }

            return next(null, resultRows);
        });
}
