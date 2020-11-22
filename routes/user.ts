import * as express from "express";

//(!) это правильный вариант
import * as model  from "../models/IModelUser";

//(^)нельзя напрямую такие штуки писать - нужно через модель!!!!
import * as  middlewarePostgres from "../models/providers/MiddlewarePostgres";


const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {

    //demo 1
    //читаем данные пользователя через реализацию интерфейса модели modelUser (интерфейс IModelUser)

    var allDemos = [];

    var response = [];

    //!!!!!!!!!!!!!!!!!Тест производительтности 
    var start = new Date().getTime();

    var p1: Promise<void> = model.modelUser.getAllUsers(true)
        .then(users => {
            //вернем данные как json
            //res.send(users);
            response.push("getAllUsers - noCache");
            response.push(users);

            return;
        })
        .catch(reason => {
            let error = `Error:${reason}`;
            response.push(error);
            //res.send(error);
            return;
        });
    allDemos.push(p1);

    var p1_redis: Promise<void> = model.modelUser.getAllUsers(false)
        .then(users => {
            //вернем данные как json
            //res.send(users);
            response.push("getAllUsers - Redis Cache");
            response.push(users);

            return;
        })
        .catch(reason => {
            let error = `Error:${reason}`;
            response.push(error);
            //res.send(error);
            return;
        });
    allDemos.push(p1_redis);

    //demo 3
    //читаем учетки по пользователю
    var p3 = model.modelUser.getUserIds('64a7edea-06f9-4472-a293-05081c706755',true)
        .then(userIds => {
            //вернем данные как json
            response.push("getUserIds - noCache");
            response.push(userIds);
            //res.send(users);
            return;
        })
        .catch(reason => {
            let error = `Error:${reason}`;
            response.push(error);
            //res.send(error);
            return;
        });
    allDemos.push(p3);

    //demo 2
    //читаем урезанные данные по пользователям
    var p2 = model.modelUser.getAllUsersRestricted(true)
        .then(users => {
            //вернем данные как json
            response.push("getAllUsersRestricted - noCache");
            response.push(users);
            //res.send(users);
            return;
        })
        .catch(reason => {
            let error = `Error:${reason}`;
            response.push(error);
            //res.send(error);
            return;
        });
    allDemos.push(p2);

    var counterParralelQueryForCacheExecuted = 0;

    for (var i = 0; i < 10000; i++) {
        var p2_redis: Promise<void> = model.modelUser.getAllUsers(false)
            .then(users => {
                //вернем данные как json
                //res.send(users);

                counterParralelQueryForCacheExecuted++;

                //response.push("getAllUsers - Redis Cache");
                //response.push(users);
                return;
            })
            .catch(reason => {
                let error = `Error:${reason}`;
                response.push(error);
                //res.send(error);
                return;
            });
        allDemos.push(p2_redis);
    }

    /**
     * Ждем завершения всех
     */
    Promise.all(allDemos)
        .then(x => {

            var end = new Date().getTime();
            var time = end - start;

            response.push(
                "All time for 4 query  + 10000 query allUsersFromCache (in milliseconds, database server in remote mamchine!):" +
                time+":counterParralelQuery="+counterParralelQueryForCacheExecuted);

        res.send(response);
    });

    //неправильный вариант - напрямую читать данные из провайдера => нужно через реализацию интерфейса модели modelUser (интерфейс IModelUser)(а она там сама разберется)
    //middlewarePostgres.queryWithCache("select * from user",null, 1*60,(err, data) => {
    //    if (err != null) {
    //        res.send(`Error:${err}`);
    //        return;
    //    }

    //    //вернем данные как json
    //    res.json(data);
    //    return;
    //});

    //res.send("end");

});

export default router;