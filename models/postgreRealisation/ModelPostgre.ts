import { IModelUser } from "../IModelUser";
import { IModelBase } from "../IModelBase";
import * as utilities from "../Utilities"
import { User, UserRestricted, UserIds } from "../dto/User";
import * as MiddlewarePostgres from "../providers/MiddlewarePostgres";


class ModelBasePostgre implements IModelBase {
    /**
    * Новый идентификатор любой записи в базе данных
    */
    static getNewId(): string {
        var newId = utilities.Guid.newGuid();
        return newId;
    }
}


/**
 * Модель пользователя (реализация PostgreSQL)
 */

export class ModelUserPostgre extends ModelBasePostgre implements IModelUser {
    getAllUsersRestricted(disableCache: boolean): Promise<UserRestricted[]> {
        return new Promise<UserRestricted[]>((resolve, reject) => {
            var sql = "select key, nickname, role, fio from users";//ВОТ тут запрашиваем урезанный набор данных по пользователям
            if (disableCache) {
                MiddlewarePostgres.queryWithoutCache(sql,
                    null,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //создаем коллекцию User из результата - пока тестовая реализация заполнения нескольких полей из any
                            var usersDto: UserRestricted[] = ModelUserPostgre.arrayToUserRestricted(data);
                            resolve(usersDto);
                        }
                    });
            } else {
                MiddlewarePostgres.queryWithCache(sql, null, 1*60/*кэш на одну минуту ТУТ нужно передавать параметром*/,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //создаем коллекцию User из результата - пока тестовая реализация заполнения нескольких полей из any
                            var usersDto: UserRestricted[] = ModelUserPostgre.arrayToUserRestricted(data);
                            resolve(usersDto);
                        }
                    });
            }
        });
    }

    /**
     * Получить по пользователю его учетки (но лучше по key Пользователя)
     * @param user
     * @param disableCache
     */
    getUserIds(keyUser: string, disableCache: boolean): Promise<UserIds> {
        return new Promise<UserIds>((resolve, reject) => {
            var sql = "select u.key, u.fio, sid.idtype, ids.id from users u left join users_ids ids on ids.user_key=u.key left join sprav_id sid on sid.key=ids.type_key where u.key=$1";
            if (disableCache) {
                MiddlewarePostgres.queryWithoutCache(sql, [keyUser],
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //создаем коллекцию учеток пользователя из результата 
                            var userIds: UserIds = new UserIds(data);
                            resolve(userIds);
                        }
                    });
            } else {
                MiddlewarePostgres.queryWithCache(sql, [keyUser], 1*60/*кэш на одну минуту ТУТ нужно передавать параметром*/,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //создаем коллекцию учеток пользователя из результата 
                            var userIds: UserIds = new UserIds(data);
                            resolve(userIds);
                        }
                    });
            }
        });         
    }

    /**
     * Получить всех пользователей
     * @param disableCache - true -не использовать кэш, только через базу получать данные
     */
    getAllUsers(disableCache : boolean): Promise<User[]> {

        return new Promise<User[]>((resolve, reject) => {
            var sql = "select * from users";
            if (disableCache) {
                MiddlewarePostgres.queryWithoutCache(sql, null,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //создаем коллекцию User из результата - пока тестовая реализация заполнения нескольких полей из any
                            var usersDto: User[] = ModelUserPostgre.arrayToUser(data);
                            resolve(usersDto);
                        }
                    });
            } else {
                MiddlewarePostgres.queryWithCache(sql, null, 1*60/*кэш на одну минуту ТУТ нужно передавать параметром*/,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //создаем коллекцию User из результата - пока тестовая реализация заполнения нескольких полей из any
                            var usersDto: User[] = ModelUserPostgre.arrayToUser(data);
                            resolve(usersDto);
                        }
                    });
            }
        });
    }

    /**
     * Вернем пользователей (сами из списк строк из Postgre создаем объекты User)
     * @param arrayOfRows
     */
    static arrayToUser(arrayOfRows: Array<any>): User[] {
        var result: User[] = arrayOfRows.map<User>(x => {
             return new User(x);
        });
        return result;
    }

    /**
     * Вернем урезанных пользователей (сами из списк строк из Postgre создаем объекты UserRestricted)
     * @param arrayOfRows
     */
    static arrayToUserRestricted(arrayOfRows: Array<any>): UserRestricted[] {
        var result: User[] = arrayOfRows.map<User>(x => {
            return new User(x);
        });
        return result;
    }

}

