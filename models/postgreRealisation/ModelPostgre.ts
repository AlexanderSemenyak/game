import { IModelUser } from "../IModelUser";
import { IModelBase } from "../IModelBase";
import * as utilities from "../Utilities"
import { User, UserRestricted, UserIds } from "../dto/User";
import * as MiddlewarePostgres from "../providers/MiddlewarePostgres";


class ModelBasePostgre implements IModelBase {
    /**
    * ����� ������������� ����� ������ � ���� ������
    */
    static getNewId(): string {
        var newId = utilities.Guid.newGuid();
        return newId;
    }
}


/**
 * ������ ������������ (���������� PostgreSQL)
 */

export class ModelUserPostgre extends ModelBasePostgre implements IModelUser {
    getAllUsersRestricted(disableCache: boolean): Promise<UserRestricted[]> {
        return new Promise<UserRestricted[]>((resolve, reject) => {
            var sql = "select key, nickname, role, fio from users";//��� ��� ����������� ��������� ����� ������ �� �������������
            if (disableCache) {
                MiddlewarePostgres.queryWithoutCache(sql,
                    null,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //������� ��������� User �� ���������� - ���� �������� ���������� ���������� ���������� ����� �� any
                            var usersDto: UserRestricted[] = ModelUserPostgre.arrayToUserRestricted(data);
                            resolve(usersDto);
                        }
                    });
            } else {
                MiddlewarePostgres.queryWithCache(sql, null, 1*60/*��� �� ���� ������ ��� ����� ���������� ����������*/,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //������� ��������� User �� ���������� - ���� �������� ���������� ���������� ���������� ����� �� any
                            var usersDto: UserRestricted[] = ModelUserPostgre.arrayToUserRestricted(data);
                            resolve(usersDto);
                        }
                    });
            }
        });
    }

    /**
     * �������� �� ������������ ��� ������ (�� ����� �� key ������������)
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
                            //������� ��������� ������ ������������ �� ���������� 
                            var userIds: UserIds = new UserIds(data);
                            resolve(userIds);
                        }
                    });
            } else {
                MiddlewarePostgres.queryWithCache(sql, [keyUser], 1*60/*��� �� ���� ������ ��� ����� ���������� ����������*/,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //������� ��������� ������ ������������ �� ���������� 
                            var userIds: UserIds = new UserIds(data);
                            resolve(userIds);
                        }
                    });
            }
        });         
    }

    /**
     * �������� ���� �������������
     * @param disableCache - true -�� ������������ ���, ������ ����� ���� �������� ������
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
                            //������� ��������� User �� ���������� - ���� �������� ���������� ���������� ���������� ����� �� any
                            var usersDto: User[] = ModelUserPostgre.arrayToUser(data);
                            resolve(usersDto);
                        }
                    });
            } else {
                MiddlewarePostgres.queryWithCache(sql, null, 1*60/*��� �� ���� ������ ��� ����� ���������� ����������*/,
                    (err, data) => {
                        if (err || !data) {
                            reject(err);
                        } else {
                            //������� ��������� User �� ���������� - ���� �������� ���������� ���������� ���������� ����� �� any
                            var usersDto: User[] = ModelUserPostgre.arrayToUser(data);
                            resolve(usersDto);
                        }
                    });
            }
        });
    }

    /**
     * ������ ������������� (���� �� ����� ����� �� Postgre ������� ������� User)
     * @param arrayOfRows
     */
    static arrayToUser(arrayOfRows: Array<any>): User[] {
        var result: User[] = arrayOfRows.map<User>(x => {
             return new User(x);
        });
        return result;
    }

    /**
     * ������ ��������� ������������� (���� �� ����� ����� �� Postgre ������� ������� UserRestricted)
     * @param arrayOfRows
     */
    static arrayToUserRestricted(arrayOfRows: Array<any>): UserRestricted[] {
        var result: User[] = arrayOfRows.map<User>(x => {
            return new User(x);
        });
        return result;
    }

}

