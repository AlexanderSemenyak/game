import * as express from "express";

//(!) ��� ���������� �������
import * as model  from "../models/IModelUser";

//(^)������ �������� ����� ����� ������ - ����� ����� ������!!!!
import * as  middlewarePostgres from "../models/providers/MiddlewarePostgres";


const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {

    //demo 1
    //������ ������ ������������ ����� ���������� ���������� ������ modelUser (��������� IModelUser)

    var allDemos = [];

    var response = [];

    //!!!!!!!!!!!!!!!!!���� ������������������� 
    var start = new Date().getTime();

    var p1: Promise<void> = model.modelUser.getAllUsers(true)
        .then(users => {
            //������ ������ ��� json
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
            //������ ������ ��� json
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
    //������ ������ �� ������������
    var p3 = model.modelUser.getUserIds('64a7edea-06f9-4472-a293-05081c706755',true)
        .then(userIds => {
            //������ ������ ��� json
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
    //������ ��������� ������ �� �������������
    var p2 = model.modelUser.getAllUsersRestricted(true)
        .then(users => {
            //������ ������ ��� json
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
                //������ ������ ��� json
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
     * ���� ���������� ����
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

    //������������ ������� - �������� ������ ������ �� ���������� => ����� ����� ���������� ���������� ������ modelUser (��������� IModelUser)(� ��� ��� ���� ����������)
    //middlewarePostgres.queryWithCache("select * from user",null, 1*60,(err, data) => {
    //    if (err != null) {
    //        res.send(`Error:${err}`);
    //        return;
    //    }

    //    //������ ������ ��� json
    //    res.json(data);
    //    return;
    //});

    //res.send("end");

});

export default router;