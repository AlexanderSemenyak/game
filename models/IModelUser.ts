import { User, UserRestricted, UserIds } from "./dto/User";
import { IModelBase } from "./IModelBase";
import { ModelUserPostgre } from "./postgreRealisation/ModelPostgre";

export interface IModelUser extends IModelBase {
    /**
 * Получить всех пользователей
 * @param disableCache - true -не использовать кэш, только через базу получать данные
 */
    getAllUsers(disableCache : boolean): Promise<User[]> ;

    /**
     * Урезанная информация по пользователям
     * @param disableCache
     */
    getAllUsersRestricted(disableCache : boolean): Promise<UserRestricted[]> ;

    /**
     * Получить по пользователю его учетные данные
     * @param user
     */
    getUserIds(keyUser: string, disableCache : boolean) : Promise<UserIds>;
}

export const modelUser: IModelUser = new ModelUserPostgre();
