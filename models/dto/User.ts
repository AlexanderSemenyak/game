/**
 * Базовый DTO-объект 
 */
abstract class Entity {
    constructor(row: any) {
        if (row != null) {
            this.key = row.key;
        }
    }

    key: string;
}

/**
 * Базовый объект пользователя 
 */
export  class UserRestricted extends Entity{
    constructor(row: any) {
        super(row);
        if (row != null) {
            this.nickname = row.nickname;
            this.role = row.role;
            this.fio = row.fio;
        }
    }

    nickname : string;
    fio : string;
    role: string; //user ; bot;
}
/**
 * Модель пользователя (полная)
 */
export class User extends UserRestricted {
    constructor(row: any) {
        super(row);

        //заполняем DTO-объект из запроса из БД
        if (row != null) {
            this.birthday = row.birthday;
            this.email = row.email;

            this.confirmed = row.confirmed;
            this.lastSendDate = row.lastSendDate;
        }
    }

    birthday : Date;
    email: string;

    confirmed: boolean;
    lastSendDate: Date;
}


/**
 * Краткие сведения об учетке (без ключей - только типы)
 */
export interface IUserId {
    /**Тип учетки*/
    idType : string;

    /**Сама учетка */
    id : string;
}

/**
 * Кастомный DTO-объект (пример объекта из запроса к трем таблицам)
 */
export class UserIds  {
    constructor(rows: Array<any>) {
        //на вход принимает коллекцию учеток
        if (rows != null) {

            //заполняем данные учеток
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];

                this.keyUser = row.key;
                this.fio= row.fio;

                var key = row.idtype;
                var _id = row.id;

                this.ids[key] = { idType: key, id: _id }
            }
        }
    }

    fio : string;
    keyUser : string;

    /**
     * Dictionary учеток по из типу (psn, xbox,...)
     */
    ids: { [idType: string] : IUserId; } = {};

    /**
     * Вернуть значение учетки из dictionary
     * @param _idType => psn, xbox,...
     */
    getId(_idType: string) : IUserId {
        return this.ids[_idType];
    }
}

